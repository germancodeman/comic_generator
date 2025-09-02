
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Character } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

export const splitStoryIntoPanels = async (prompt: string, numPanels: number = 4): Promise<string[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a comic book writer. Your task is to break down a story into concise, visual descriptions for comic panels. Respond ONLY with the JSON array.`;
    
    const generationPrompt = `Based on the following story, divide it into ${numPanels} concise descriptions for comic strip panels. Each description should be a single phrase describing the visual action. Story: "${prompt}"`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: generationPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            panels: {
              type: Type.ARRAY,
              description: `An array of ${numPanels} strings, each describing a comic panel.`,
              items: {
                type: Type.STRING
              }
            }
          }
        },
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.panels) && result.panels.length > 0) {
        return result.panels;
    } else {
        throw new Error("Failed to parse panel descriptions from API response.");
    }
  } catch (error) {
    console.error("Error splitting story into panels:", error);
    throw new Error("Could not generate panel descriptions. Please try refining your story.");
  }
};


export const generatePanelImage = async (panelDescription: string, characters: Character[]): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash-image-preview';
        
        const characterParts = characters
            .filter(c => c.image)
            .map(c => ({
                inlineData: {
                    data: c.image!.base64,
                    mimeType: c.image!.mimeType,
                },
            }));
        
        const characterNames = characters.map(c => c.name).join(' and ');

        const textPrompt = `Create a vibrant comic book style image for a panel. Use the provided character(s), named ${characterNames}, in the scene. Panel Description: "${panelDescription}"`;

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [...characterParts, { text: textPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated for the panel.");
        }
    } catch (error) {
        console.error("Error generating panel image:", error);
        throw new Error("Could not generate the comic panel image.");
    }
};
