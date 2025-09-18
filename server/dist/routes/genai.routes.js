// src/routes/genai.routes.ts
import { Router } from "express";
import { getSystemPrompt } from "../prompts.js";
import { GoogleGenAI } from "@google/genai";
import { basePrompt as nodeBasePrompt } from "../defaults/node.js";
import { basePrompt as reactBasePrompt } from "../defaults/react.js";
import { BASE_PROMPT } from "../prompts.js";
const router = Router();
const ai = new GoogleGenAI({});
router.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.2,
            systemInstruction: "give me weather the project is node or react project based on the prompt and give me only react or node as output in single word and nothing else",
        },
    });
    const answer = response.text ? response.text.toLowerCase().trim() : "";
    if (answer === "react") {
        res.json({
            prompts: [
                BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [reactBasePrompt],
        });
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [nodeBasePrompt],
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
});
router.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    // It's good practice to validate input
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid or empty 'messages' array." });
    }
    const formattedMessages = messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.content }],
    }));
    // --- Retry Logic Variables ---
    let attempts = 0;
    const maxAttempts = 5;
    let delay = 1000; // Start with a 1-second delay
    // The outer try/catch will handle final failures after all retries.
    try {
        while (attempts < maxAttempts) {
            try {
                // --- API Call ---
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: formattedMessages,
                    config: {
                        temperature: 0.2,
                        systemInstruction: getSystemPrompt(),
                    },
                });
                res.json({
                    response: response.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
                });
                return;
            }
            catch (error) {
                // Check if the error is the specific "overloaded" error
                if (typeof error === "object" && error !== null && "status" in error && error.status === 503) {
                    attempts++;
                    console.log(`Attempt ${attempts} failed with 503. Retrying in ${delay / 1000}s...`);
                    // If we've reached the max number of attempts, throw an error
                    if (attempts >= maxAttempts) {
                        throw new Error("The model is still overloaded after several retries.");
                    }
                    // Wait for the specified delay
                    await new Promise(resolve => setTimeout(resolve, delay));
                    // Double the delay for the next attempt (exponential backoff)
                    delay *= 2;
                }
                else {
                    // For any other kind of error, throw it immediately to be caught by the outer catch block.
                    throw error;
                }
            }
        }
    }
    catch (error) {
        // This will catch errors from the final failed attempt or any non-503 errors.
        console.error("API Error after retries:", error);
        res.status(500).json({ error: "Failed to generate content from AI." });
    }
});
export default router;
//# sourceMappingURL=genai.routes.js.map