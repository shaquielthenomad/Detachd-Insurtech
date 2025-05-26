
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Ensure correct import for GoogleGenAI
import { API_MODELS, MOCK_DELAY } from '../constants';

// Ensure API_KEY is handled correctly as per instructions
// const apiKey = process.env.REACT_APP_GEMINI_API_KEY; // For CRA. For Vite, import.meta.env.VITE_GEMINI_API_KEY
// For the environment this code will run in, it's process.env.API_KEY
const apiKey = process.env.API_KEY; 

if (!apiKey) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable. Mock responses will be used.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface AnalyzeImageOptions {
  base64Image: string;
  prompt: string;
}

interface AnalyzeImageResult {
  isAuthentic: boolean;
  tamperingSigns: string[];
  confidence: number; // 0-1
  analysisText: string;
}

export const geminiService = {
  analyzeImageForFraud: async ({ base64Image, prompt }: AnalyzeImageOptions): Promise<AnalyzeImageResult> => {
    console.log("Called analyzeImageForFraud with prompt:", prompt);
    if (!ai) {
      console.warn("Gemini API client not initialized. Returning mock data for image analysis.");
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      return {
        isAuthentic: Math.random() > 0.2, // 80% chance authentic
        tamperingSigns: Math.random() > 0.7 ? ["Unusual lighting inconsistencies", "Pixel pattern mismatch in suspected area"] : [],
        confidence: Math.random() * 0.3 + 0.7, // Confidence between 0.7 and 1.0
        analysisText: "Mock analysis: Image appears to be [authentic/tampered]. Some [minor/significant] inconsistencies noted around [specific area]."
      };
    }

    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg', // Or 'image/png' depending on input
          data: base64Image,
        },
      };
      const textPart = { text: prompt };
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: API_MODELS.TEXT_GENERATION, // Using text model for image analysis instructions
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json", // Requesting JSON output
        }
      });

      const rawJsonText = response.text;
      let jsonStr = rawJsonText.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      // Assuming the model returns JSON in the specified AnalyzeImageResult format
      const parsedResult = JSON.parse(jsonStr) as AnalyzeImageResult;
      return parsedResult;

    } catch (error) {
      console.error("Error analyzing image with Gemini:", error);
      throw new Error("Failed to analyze image using Gemini API.");
    }
  },

  assessClaimRisk: async (claimDetails: string): Promise<{ riskScore: number; reasoning: string; potentialFlags: string[] }> => {
    console.log("Called assessClaimRisk with details:", claimDetails);
     if (!ai) {
      console.warn("Gemini API client not initialized. Returning mock data for risk assessment.");
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      const score = Math.floor(Math.random() * 70) + 30; // Score between 30-100
      return {
        riskScore: score,
        reasoning: `Mock assessment: Risk score is ${score} based on claim patterns and details.`,
        potentialFlags: score > 75 ? ["Inconsistent statements noted", "High claim amount for incident type"] : [],
      };
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: API_MODELS.TEXT_GENERATION,
            contents: `Assess the fraud risk for the following insurance claim details. Provide a risk score (0-100), a brief reasoning, and a list of potential fraud flags. Return as JSON: {"riskScore": number, "reasoning": string, "potentialFlags": string[]}\n\nClaim Details:\n${claimDetails}`,
            config: { responseMimeType: "application/json" }
        });

        const rawJsonText = response.text;
        let jsonStr = rawJsonText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const parsedResult = JSON.parse(jsonStr);
        return parsedResult;

    } catch (error) {
        console.error("Error assessing claim risk with Gemini:", error);
        throw new Error("Failed to assess claim risk using Gemini API.");
    }
  },
  
  generateReportSummary: async (reportData: string, reportType: string): Promise<string> => {
    console.log("Called generateReportSummary for type:", reportType);
    if (!ai) {
      console.warn("Gemini API client not initialized. Returning mock data for report summary.");
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      return `Mock summary for ${reportType}: This report highlights key trends and figures based on the provided data. Key findings include X, Y, and Z.`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: API_MODELS.TEXT_GENERATION,
            contents: `Generate a concise summary for a "${reportType}" report based on the following data points:\n\n${reportData}\n\nSummary:`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report summary with Gemini:", error);
        throw new Error("Failed to generate report summary using Gemini API.");
    }
  },
};
