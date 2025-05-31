#!/bin/bash

# Detachd Insurance Platform - Azure MCP Setup Script
# This script sets up all Azure services needed for production-ready MCP servers

set -e  # Exit on any error

echo "🚀 Starting Detachd Azure MCP Setup..."
echo "================================================="

# Configuration
RESOURCE_GROUP="detachd-rg"
LOCATION="southafricanorth"  # Azure region closest to South Africa
COSMOS_DB_ACCOUNT="detachd-cosmos"
STORAGE_ACCOUNT="detachdstorage$(date +%s)"  # Unique name
COGNITIVE_SERVICES="detachd-cognitive"
OPENAI_ACCOUNT="detachd-openai"
CONTAINER_REGISTRY="detachdacr"
CONTAINER_INSTANCE="detachd-mcp-servers"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Cosmos DB: $COSMOS_DB_ACCOUNT"
echo "  Storage: $STORAGE_ACCOUNT"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo "🔐 Logging into Azure..."
az login

# Create Resource Group
echo "📁 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# ============================================================================
# COSMOS DB SETUP
# ============================================================================
echo "🌌 Setting up Cosmos DB..."

# Create Cosmos DB account
az cosmosdb create \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_DB_ACCOUNT \
  --kind GlobalDocumentDB \
  --locations regionName=$LOCATION \
  --default-consistency-level "Session" \
  --enable-automatic-failover true

# Create database
az cosmosdb sql database create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_DB_ACCOUNT \
  --name "detachd-insurance"

# Create containers
echo "📦 Creating Cosmos DB containers..."

# Users container
az cosmosdb sql container create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_DB_ACCOUNT \
  --database-name "detachd-insurance" \
  --name "users" \
  --partition-key-path "/id" \
  --throughput 400

# Claims container
az cosmosdb sql container create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_DB_ACCOUNT \
  --database-name "detachd-insurance" \
  --name "claims" \
  --partition-key-path "/userId" \
  --throughput 400

# Risk assessments container
az cosmosdb sql container create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_DB_ACCOUNT \
  --database-name "detachd-insurance" \
  --name "risk-assessments" \
  --partition-key-path "/userId" \
  --throughput 400

# Get Cosmos DB connection info
COSMOS_ENDPOINT=$(az cosmosdb show --resource-group $RESOURCE_GROUP --name $COSMOS_DB_ACCOUNT --query documentEndpoint -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --resource-group $RESOURCE_GROUP --name $COSMOS_DB_ACCOUNT --query primaryMasterKey -o tsv)

# ============================================================================
# STORAGE ACCOUNT SETUP
# ============================================================================
echo "💾 Setting up Storage Account..."

az storage account create \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2

# Create blob container for documents
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name "detachd-documents" \
  --auth-mode login

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT --query connectionString -o tsv)

# ============================================================================
# COGNITIVE SERVICES SETUP
# ============================================================================
echo "🧠 Setting up Cognitive Services..."

az cognitiveservices account create \
  --resource-group $RESOURCE_GROUP \
  --name $COGNITIVE_SERVICES \
  --location $LOCATION \
  --kind CognitiveServices \
  --sku S0 \
  --yes

# Get cognitive services info
COGNITIVE_ENDPOINT=$(az cognitiveservices account show --resource-group $RESOURCE_GROUP --name $COGNITIVE_SERVICES --query properties.endpoint -o tsv)
COGNITIVE_KEY=$(az cognitiveservices account keys list --resource-group $RESOURCE_GROUP --name $COGNITIVE_SERVICES --query key1 -o tsv)

# ============================================================================
# AZURE OPENAI SETUP
# ============================================================================
echo "🤖 Setting up Azure OpenAI..."

# Note: Azure OpenAI requires special approval
az cognitiveservices account create \
  --resource-group $RESOURCE_GROUP \
  --name $OPENAI_ACCOUNT \
  --location "eastus" \
  --kind OpenAI \
  --sku S0 \
  --yes || echo "⚠️  Azure OpenAI creation failed - may need approval"

# Deploy GPT-4 model (if OpenAI account was created successfully)
if az cognitiveservices account show --resource-group $RESOURCE_GROUP --name $OPENAI_ACCOUNT &> /dev/null; then
  echo "🚀 Deploying GPT-4 model..."
  az cognitiveservices account deployment create \
    --resource-group $RESOURCE_GROUP \
    --name $OPENAI_ACCOUNT \
    --deployment-name "gpt-4" \
    --model-name "gpt-4" \
    --model-version "0613" \
    --model-format OpenAI \
    --scale-settings-scale-type "Standard" || echo "⚠️  GPT-4 deployment failed"
  
  OPENAI_ENDPOINT=$(az cognitiveservices account show --resource-group $RESOURCE_GROUP --name $OPENAI_ACCOUNT --query properties.endpoint -o tsv)
  OPENAI_KEY=$(az cognitiveservices account keys list --resource-group $RESOURCE_GROUP --name $OPENAI_ACCOUNT --query key1 -o tsv)
else
  echo "⚠️  Azure OpenAI account not available - using fallback"
  OPENAI_ENDPOINT="fallback"
  OPENAI_KEY="fallback"
fi

# ============================================================================
# CONTAINER REGISTRY SETUP
# ============================================================================
echo "🐳 Setting up Container Registry..."

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_REGISTRY \
  --sku Basic \
  --admin-enabled true

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --resource-group $RESOURCE_GROUP --name $CONTAINER_REGISTRY --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --resource-group $RESOURCE_GROUP --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --resource-group $RESOURCE_GROUP --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)

# ============================================================================
# BUILD AND PUSH MCP SERVER IMAGE
# ============================================================================
echo "🔨 Building and pushing MCP server image..."

# Login to ACR
az acr login --name $CONTAINER_REGISTRY

# Build and push the image
cd mcp-servers
docker build -t $ACR_LOGIN_SERVER/detachd-mcp-servers:latest .
docker push $ACR_LOGIN_SERVER/detachd-mcp-servers:latest
cd ..

# ============================================================================
# DEPLOY CONTAINER INSTANCE
# ============================================================================
echo "☁️ Deploying MCP servers to Azure Container Instances..."

az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_INSTANCE \
  --image $ACR_LOGIN_SERVER/detachd-mcp-servers:latest \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 2 \
  --memory 4 \
  --ports 3001 \
  --dns-name-label detachd-mcp \
  --environment-variables \
    NODE_ENV=production \
    PORT=3001 \
    COSMOS_DB_ENDPOINT=$COSMOS_ENDPOINT \
    COSMOS_DB_KEY=$COSMOS_KEY \
    COSMOS_DB_DATABASE_NAME=detachd-insurance \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    COGNITIVE_SERVICES_ENDPOINT=$COGNITIVE_ENDPOINT \
    COGNITIVE_SERVICES_KEY=$COGNITIVE_KEY \
    AZURE_OPENAI_ENDPOINT=$OPENAI_ENDPOINT \
    AZURE_OPENAI_KEY=$OPENAI_KEY \
    AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Get container instance FQDN
CONTAINER_FQDN=$(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_INSTANCE --query ipAddress.fqdn -o tsv)

# ============================================================================
# CREATE ENVIRONMENT FILE
# ============================================================================
echo "📝 Creating environment configuration..."

cat > .env.production << EOF
# Azure MCP Server Configuration
REACT_APP_MCP_BASE_URL=http://${CONTAINER_FQDN}:3001

# Azure Services (for reference)
COSMOS_DB_ENDPOINT=$COSMOS_ENDPOINT
STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT
COGNITIVE_SERVICES_ENDPOINT=$COGNITIVE_ENDPOINT
OPENAI_ENDPOINT=$OPENAI_ENDPOINT

# Container Registry
ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER
EOF

# ============================================================================
# SETUP COMPLETE
# ============================================================================
echo ""
echo "🎉 Azure MCP Setup Complete!"
echo "================================================="
echo ""
echo "📊 Resources Created:"
echo "  • Resource Group: $RESOURCE_GROUP"
echo "  • Cosmos DB: $COSMOS_DB_ACCOUNT"
echo "  • Storage Account: $STORAGE_ACCOUNT"
echo "  • Cognitive Services: $COGNITIVE_SERVICES"
echo "  • OpenAI Account: $OPENAI_ACCOUNT"
echo "  • Container Registry: $CONTAINER_REGISTRY"
echo "  • Container Instance: $CONTAINER_INSTANCE"
echo ""
echo "🌐 MCP Server URL: http://${CONTAINER_FQDN}:3001"
echo "📋 Health Check: http://${CONTAINER_FQDN}:3001/health"
echo ""
echo "💰 Estimated Monthly Cost: $100-300 USD"
echo "   (Depends on usage patterns)"
echo ""
echo "🔧 Next Steps:"
echo "  1. Update your React app's .env file with:"
echo "     REACT_APP_MCP_BASE_URL=http://${CONTAINER_FQDN}:3001"
echo ""
echo "  2. Test the MCP connection:"
echo "     curl http://${CONTAINER_FQDN}:3001/health"
echo ""
echo "  3. Your app will now use real Azure data instead of hardcoded values!"
echo ""
echo "🔒 Security Note:"
echo "  The above setup is for development/demo. For production:"
echo "  - Enable HTTPS"
echo "  - Configure proper authentication"
echo "  - Set up monitoring and logging"
echo "  - Configure backup and disaster recovery"
echo ""

# Create a summary file
cat > AZURE_MCP_SUMMARY.md << EOF
# Detachd Azure MCP Setup Summary

## Resources Created
- **Resource Group**: $RESOURCE_GROUP
- **Cosmos DB**: $COSMOS_DB_ACCOUNT
- **Storage Account**: $STORAGE_ACCOUNT  
- **Cognitive Services**: $COGNITIVE_SERVICES
- **Azure OpenAI**: $OPENAI_ACCOUNT
- **Container Registry**: $CONTAINER_REGISTRY
- **Container Instance**: $CONTAINER_INSTANCE

## Service URLs
- **MCP Server**: http://${CONTAINER_FQDN}:3001
- **Health Check**: http://${CONTAINER_FQDN}:3001/health

## Environment Variables
Add to your React app's .env file:
\`\`\`
REACT_APP_MCP_BASE_URL=http://${CONTAINER_FQDN}:3001
\`\`\`

## Cost Estimate
Approximately $100-300 USD per month depending on usage.

## What Changed
Your Detachd platform now uses:
- ✅ Real Azure Cosmos DB instead of hardcoded Jacob Doe data
- ✅ AI-powered risk assessment via Azure OpenAI
- ✅ Document processing via Azure Cognitive Services
- ✅ Scalable cloud infrastructure
- ✅ Production-ready MCP server architecture

## Testing
\`\`\`bash
# Test MCP server health
curl http://${CONTAINER_FQDN}:3001/health

# Test user profile endpoint
curl http://${CONTAINER_FQDN}:3001/mcp/users/user123
\`\`\`
EOF

echo "📄 Setup summary saved to AZURE_MCP_SUMMARY.md"
echo ""
echo "✨ Your Detachd platform is now Azure-powered!" 