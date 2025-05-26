
import { Page } from './types';

export const API_MODELS = {
  TEXT_GENERATION: 'gemini-2.5-flash-preview-04-17',
  IMAGE_GENERATION: 'imagen-3.0-generate-002',
  // Add other models as needed
};

export const APP_NAME = "Detachd";

export const ROUTES = Page;

export const MOCK_USER_ID = 'user-123'; // For demo purposes

export const MOCK_API_KEY = "YOUR_API_KEY"; // Placeholder, ensure process.env.API_KEY is used in actual service

export const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 seconds

// Add other constants as needed
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', ...ACCEPTED_IMAGE_TYPES];

export const MOCK_DELAY = 1000; // 1 second for simulating API calls
