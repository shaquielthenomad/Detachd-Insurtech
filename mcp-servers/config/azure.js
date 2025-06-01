require('dotenv').config();

// Check if we're in fallback mode
const isFallbackMode = process.env.COSMOS_DB_ENDPOINT === 'fallback' || 
                       !process.env.COSMOS_DB_ENDPOINT || 
                       !process.env.COSMOS_DB_KEY;

let cosmosClient, database, containers, blobServiceClient, computerVisionClient, documentAnalysisClient, openAIClient;

if (!isFallbackMode) {
  const { DefaultAzureCredential } = require('@azure/identity');
  const { CosmosClient } = require('@azure/cosmos');
  const { BlobServiceClient } = require('@azure/storage-blob');
  const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
  const { DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
  const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

  // Azure Authentication
  const credential = new DefaultAzureCredential();

  // Cosmos DB Configuration
  cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
  });

  database = cosmosClient.database(process.env.COSMOS_DB_DATABASE_NAME || 'detachd-insurance');
  const usersContainer = database.container('users');
  const claimsContainer = database.container('claims');
  const riskAssessmentsContainer = database.container('risk-assessments');

  containers = {
    users: usersContainer,
    claims: claimsContainer,
    riskAssessments: riskAssessmentsContainer
  };

  // Blob Storage Configuration
  blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  // Computer Vision Configuration
  computerVisionClient = new ComputerVisionClient(
    new AzureKeyCredential(process.env.COGNITIVE_SERVICES_KEY),
    process.env.COGNITIVE_SERVICES_ENDPOINT
  );

  // Form Recognizer Configuration
  documentAnalysisClient = new DocumentAnalysisClient(
    process.env.COGNITIVE_SERVICES_ENDPOINT,
    new AzureKeyCredential(process.env.COGNITIVE_SERVICES_KEY)
  );

  // Azure OpenAI Configuration
  openAIClient = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
  );
} else {
  console.log('⚠️  Running in fallback mode - Azure services disabled');
  
  // Mock containers for fallback mode
  containers = {
    users: {
      item: () => ({
        read: async () => ({ resource: null }),
        replace: async () => ({ resource: {} })
      }),
      items: {
        create: async () => ({ resource: {} }),
        query: () => ({
          fetchAll: async () => ({ resources: [] })
        })
      }
    },
    claims: {
      items: {
        query: () => ({
          fetchAll: async () => ({ resources: [] })
        })
      }
    },
    riskAssessments: {
      items: {
        create: async () => ({ resource: {} }),
        query: () => ({
          fetchAll: async () => ({ resources: [] })
        })
      }
    }
  };
}

module.exports = {
  isFallbackMode,
  credential: null,
  cosmosClient,
  database,
  containers,
  blobServiceClient,
  computerVisionClient,
  documentAnalysisClient,
  openAIClient,
  config: {
    openAIDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
    containerName: 'detachd-documents'
  }
}; 