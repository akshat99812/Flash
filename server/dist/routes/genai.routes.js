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
    // This is the correct way to transform all messages
    const formattedMessages = messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.content }]
    }));
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedMessages, // Pass the entire, correctly formatted array
            config: {
                temperature: 0.2,
                systemInstruction: getSystemPrompt(),
            }
        });
        res.json({
            response: response.text ? response.text.toLowerCase().trim() : ""
        });
    }
    catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to generate content from AI." });
    }
});
export default router;
//# sourceMappingURL=genai.routes.js.map