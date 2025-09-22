
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export const generateImpression = async (findingsText: string): Promise<string> => {
    const prompt = `Based on the following radiology findings, write a concise 'Impression' section for a medical report. The impression should be a summary of the most important findings. Do not include a "Impression:" heading. Findings: "${stripHtml(findingsText)}"`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text.trim();
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const audioPart = {
        inlineData: {
            data: audioBase64,
            mimeType,
        },
    };
    const textPart = {
        text: "Transcribe this audio recording from a medical professional's dictation.",
    };

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [audioPart, textPart] },
    });

    return response.text.trim();
};

export const analyzeImage = async (imageBase64: string, mimeType: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType,
        },
    };
    const textPart = {
        text: "Analyze this medical image (e.g., X-ray, CT scan, MRI) and provide a single paragraph summarizing the key radiological findings. Be concise and professional.",
    };
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text.trim();
};

export const draftReportFromFindings = async (findings: string): Promise<string> => {
    const prompt = `Based on these radiological findings from one or more images, draft a complete radiology report. The report should have a 'Findings' section and an 'Impression' section, each with a heading (e.g., "<h2>Findings</h2>"). Format the output as simple HTML. Findings: "${findings}"`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text.trim();
};
