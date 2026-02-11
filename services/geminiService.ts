import { GoogleGenAI } from "@google/genai";

// We check for the key safely.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const MODELS = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
  IMAGE: 'gemini-2.5-flash-image'
};

export interface ChatSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: ChatSource[];
}

export const generateContentFromPrompt = async (prompt: string, model: string = MODELS.FLASH): Promise<string> => {
    if (!apiKey) {
        return "AI is unavailable in demo mode without an API Key.";
    }
    try {
        // Wrap content in parts for maximum compatibility
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }] }
        });
        return response.text || "No response generated.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `Error interacting with Gemini: ${error.message || 'Unknown error'}`;
    }
};

export const chatWithSearch = async (history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<ChatResponse> => {
    if (!apiKey) {
        return { 
            text: "I cannot search the web without a valid API Key. Please configure your API_KEY.", 
            sources: [] 
        };
    }

    try {
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: contents,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text || "I couldn't find an answer.";
        
        // Extract grounding metadata (sources)
        const sources: ChatSource[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web) {
                    sources.push({
                        title: chunk.web.title || "Source",
                        uri: chunk.web.uri
                    });
                }
            });
        }

        return { text, sources };

    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return { 
            text: `Sorry, I encountered an error searching: ${error.message || 'Unknown error'}`, 
            sources: [] 
        };
    }
};

export const generateSummary = async (text: string): Promise<string> => {
    return generateContentFromPrompt(
        `Please summarize the following study notes into concise bullet points, highlighting key concepts: \n\n${text}`,
        MODELS.FLASH
    );
};

export const rewriteContent = async (text: string): Promise<string> => {
    return generateContentFromPrompt(
        `Rewrite the following study notes. Make them clearer, more concise, and structure them with proper headings and bullet points for better memorization:\n\n${text}`,
        MODELS.PRO
    );
};

export const analyzeStudyMaterial = async (text: string): Promise<string> => {
    return generateContentFromPrompt(
        `Analyze the following study material. 
      1. Identify the Top 3 Key Concepts.
      2. Suggest 3-5 Tags for organizing this note.
      3. Estimate the Difficulty Level (Beginner/Intermediate/Advanced) with a brief reason.
      4. Provide a 1-sentence Study Tip for this topic.
      
      Format the output clearly with bold headings.
      
      Content:
      ${text}`,
      MODELS.PRO
    );
};

export const explainImage = async (base64Data: string, mimeType: string, customPrompt?: string): Promise<string> => {
    if (!apiKey) {
        return "AI Insights are unavailable in demo mode without an API Key.";
    }

    // Fix: Check if the content is a URL (Mock data uses URLs) which causes 400 INVALID_ARGUMENT
    if (base64Data.startsWith('http') || base64Data.startsWith('blob:')) {
         return "The AI cannot analyze remotely hosted images (mock data) directly. Please upload a real image file to test this feature.";
    }

    try {
        // Robustly handle data URIs by splitting only if a comma exists
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const promptText = customPrompt || "Explain this diagram or image in the context of study materials. What are the key takeaways?";

        const response = await ai.models.generateContent({
            model: MODELS.IMAGE,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: cleanBase64
                        }
                    },
                    {
                        text: promptText
                    }
                ]
            }
        });
        return response.text || "Could not analyze image.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `Error analyzing image: ${error.message || 'Unknown error'}`;
    }
}