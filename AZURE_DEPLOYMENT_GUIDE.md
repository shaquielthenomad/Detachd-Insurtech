# 🚀 Detachd Azure MCP Deployment Guide

## Overview
This guide walks you through deploying the Detachd MCP (Model Context Protocol) servers to Azure, enabling real-time data processing, AI risk assessment, and seamless integration with Azure services.

## Prerequisites

### Required Tools
- [ ] Azure CLI (`az --version` >= 2.40.0)
- [ ] Docker Desktop (`docker --version` >= 20.10)
- [ ] Node.js (`node --version` >= 18.0.0)
- [ ] Git (`git --version`)

### Azure Subscription
- [ ] Active Azure subscription with sufficient credits
- [ ] Permissions to create resources in Azure
- [ ] Azure OpenAI access (optional, but recommended)

## 🛠️ Quick Deployment

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/shaquielthenomad/Detachd-Insurtech.git
cd detachd-insurtech-platform

# Install dependencies
npm install
cd mcp-servers && npm install && cd ..
```

### 2. Run Azure Setup Script
```bash
# Make script executable
chmod +x azure-setup.sh

# Run the setup (follow prompts)
./azure-setup.sh
```

The script will:
- ✅ Create Resource Group in USA East
- ✅ Deploy Cosmos DB with 3 containers
- ✅ Setup Storage Account for documents
- ✅ Configure Cognitive Services
- ✅ Deploy Azure OpenAI (if available)
- ✅ Build and push Docker image
- ✅ Deploy to Container Instances

### 3. Update Environment Variables
```bash
# Copy the generated environment file
cp .env.production .env.local

# Edit .env.local and update:
REACT_APP_MCP_BASE_URL=http://[YOUR-CONTAINER-FQDN]:3001
```

## 📋 Manual Deployment Steps

### Step 1: Azure Login
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create Resource Group
```bash
az group create \
  --name detachd-mcp-rg \
  --location eastus
```

### Step 3: Deploy Cosmos DB
```bash
# Create Cosmos DB account
az cosmosdb create \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-cosmos \
  --kind GlobalDocumentDB \
  --locations regionName=eastus

# Create database and containers
az cosmosdb sql database create \
  --resource-group detachd-mcp-rg \
  --account-name detachd-mcp-cosmos \
  --name detachd-insurance
```

### Step 4: Deploy Storage Account
```bash
az storage account create \
  --resource-group detachd-mcp-rg \
  --name detachdmcpstorage \
  --location eastus \
  --sku Standard_LRS
```

### Step 5: Deploy Container Instance
```bash
# Build Docker image
cd mcp-servers
docker build -t detachd-mcp-servers:latest .

# Deploy to Azure
az container create \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-servers \
  --image detachd-mcp-servers:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3001 \
  --dns-name-label detachd-mcp \
  --environment-variables [see script for full list]
```

## 🧪 Testing Deployment

### 1. Health Check
```bash
# Get container FQDN
FQDN=$(az container show \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-servers \
  --query ipAddress.fqdn -o tsv)

# Test health endpoint
curl http://$FQDN:3001/health
```

### 2. Test MCP Endpoints
```bash
# Test user profile endpoint
curl http://$FQDN:3001/mcp/users/test123

# Test risk calculation
curl -X POST http://$FQDN:3001/mcp/risk/calculate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","riskData":{}}'
```

### 3. Run Test Suite
```bash
cd mcp-servers
MCP_URL=http://$FQDN:3001 node test-local.js
```

## 💰 Cost Optimization

### Estimated Monthly Costs
- **Cosmos DB**: $25-50 (400 RU/s per container)
- **Storage Account**: $5-10 (Standard LRS)
- **Cognitive Services**: $0-20 (S0 tier)
- **Container Instance**: $30-60 (2 vCPU, 4GB RAM)
- **Total**: ~$60-140/month

### Cost Saving Tips
1. Use **Cosmos DB serverless** for development
2. Scale down Container Instance during off-hours
3. Use **Consumption tier** for Cognitive Services
4. Enable **auto-pause** for unused resources

## 🔒 Security Best Practices

### 1. Network Security
```bash
# Create Network Security Group
az network nsg create \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-nsg

# Add security rules
az network nsg rule create \
  --resource-group detachd-mcp-rg \
  --nsg-name detachd-mcp-nsg \
  --name AllowHTTPS \
  --priority 100 \
  --source-address-prefixes Internet \
  --destination-port-ranges 443 \
  --protocol Tcp \
  --access Allow
```

### 2. Enable HTTPS
- Use Azure Application Gateway
- Configure SSL certificates
- Enable end-to-end encryption

### 3. API Authentication
- Implement JWT authentication
- Use Azure AD integration
- Enable API key management

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check container logs
az container logs \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-servers

# Check container status
az container show \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-servers \
  --query instanceView.state
```

#### 2. Cosmos DB Connection Failed
- Verify connection string in environment variables
- Check firewall rules allow container IP
- Ensure database and containers exist

#### 3. Azure OpenAI Not Available
- Azure OpenAI requires special approval
- Apply at: https://aka.ms/oai/access
- Use fallback mode until approved

## 📊 Monitoring & Logging

### 1. Enable Application Insights
```bash
az monitor app-insights component create \
  --resource-group detachd-mcp-rg \
  --app detachd-mcp-insights \
  --location eastus
```

### 2. Container Metrics
```bash
# View CPU usage
az monitor metrics list \
  --resource detachd-mcp-servers \
  --resource-group detachd-mcp-rg \
  --metric CPUUsage

# View memory usage
az monitor metrics list \
  --resource detachd-mcp-servers \
  --resource-group detachd-mcp-rg \
  --metric MemoryUsage
```

## 🔄 Updates & Maintenance

### Updating MCP Server
```bash
# Build new image
cd mcp-servers
docker build -t detachd-mcp-servers:v2 .

# Update container
az container create \
  --resource-group detachd-mcp-rg \
  --name detachd-mcp-servers \
  --image detachd-mcp-servers:v2 \
  [other parameters]
```

### Backup Strategy
1. Enable Cosmos DB automatic backups
2. Configure Storage Account replication
3. Export container logs regularly

## 🎯 Next Steps

1. **Production Setup**
   - Enable HTTPS with custom domain
   - Configure autoscaling
   - Setup CI/CD pipeline

2. **Integration**
   - Update React app environment variables
   - Test end-to-end workflows
   - Monitor performance

3. **Optimization**
   - Fine-tune Cosmos DB partitioning
   - Implement caching strategy
   - Optimize container resources

## 📞 Support

- **Documentation**: [MCP_IMPLEMENTATION_GUIDE.md](./MCP_IMPLEMENTATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/shaquielthenomad/Detachd-Insurtech/issues)
- **Email**: support@detachd.systems

---

**🎉 Congratulations! Your Detachd platform is now powered by Azure MCP servers!** 