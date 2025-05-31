const { DefaultAzureCredential } = require('@azure/identity');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

require('dotenv').config();

// Azure Authentication
const credential = new DefaultAzureCredential();

// Cosmos DB Configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE_NAME || 'detachd-insurance');
const usersContainer = database.container('users');
const claimsContainer = database.container('claims');
const riskAssessmentsContainer = database.container('risk-assessments');

// Blob Storage Configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Computer Vision Configuration
const computerVisionClient = new ComputerVisionClient(
  new AzureKeyCredential(process.env.COGNITIVE_SERVICES_KEY),
  process.env.COGNITIVE_SERVICES_ENDPOINT
);

// Form Recognizer Configuration
const documentAnalysisClient = new DocumentAnalysisClient(
  process.env.COGNITIVE_SERVICES_ENDPOINT,
  new AzureKeyCredential(process.env.COGNITIVE_SERVICES_KEY)
);

// Azure OpenAI Configuration
const openAIClient = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

module.exports = {
  credential,
  cosmosClient,
  database,
  containers: {
    users: usersContainer,
    claims: claimsContainer,
    riskAssessments: riskAssessmentsContainer
  },
  blobServiceClient,
  computerVisionClient,
  documentAnalysisClient,
  openAIClient,
  config: {
    openAIDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
    containerName: 'detachd-documents'
  }
}; 