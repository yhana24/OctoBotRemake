const fs = require('fs');
const path = require('path');
const Deku = require("dekuai");
const deku = new Deku();

const AI_MOD_DB_PATH = path.join(__dirname, '../database/ai_mod/');

// Function to load AI model preference for a user
function loadAIModel(userId) {
    const filePath = path.join(AI_MOD_DB_PATH, `${userId}.json`);
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data).model || null;
    } catch (error) {
        console.error(`Error loading AI model for user ${userId}:`, error);
        return null;
    }
}

// Function to save AI model preference for a user
function saveAIModel(userId, model) {
    const filePath = path.join(AI_MOD_DB_PATH, `${userId}.json`);
    const data = { model };
    try {
        fs.writeFileSync(filePath, JSON.stringify(data));
        console.log(`Saved AI model preference ${model} for user ${userId}`);
    } catch (error) {
        console.error(`Error saving AI model for user ${userId}:`, error);
    }
}

// Function to check if directory exists, create if not
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Function to get list of available models
function getAvailableModels() {
    return [
        'deku',
        'gojo',
        'sukuna',
        'rimuru',
        'cid',
        'luffy',
        'rudeus',
        'ichigo',
        'naruto',
        'boruto',
        'llama',
        'blackbox',
        'gemma',
        'gemini',
        'linerva',
        'Cblackbox',
        'Cqwen',
        'Cllama',
        'Czephyr',
        'Cdiscolm',
        'Chermes'
    ];
}

module.exports = {
    description: "Ask the GPT4 a question (conversational)",
    role: "user",
    credits: 'deku',
    cooldown: 8,
    async execute(api, event, args, commands) {
        const userId = event.senderID;

        // Ensure directory exists for user database
        ensureDirectoryExists(AI_MOD_DB_PATH);

        if (args.length === 0) {
            api.sendMessage("Please provide a question.", event.threadID, event.messageID);
            api.setMessageReaction(':heart:', event.messageID);
            return;
        }

        // Check if command is for AI mod selection
        if (args.length >= 2 && args[1] === 'mod') {
            const selectedModel = commands.slice(2).join(" ").toLowerCase(); // Join rest of command as model name
            if (getAvailableModels().includes(selectedModel)) {
                // Store selectedModel in database for userId
                saveAIModel(userId, selectedModel);
                api.sendMessage(`AI response model set to "${selectedModel}".`, event.threadID, event.messageID);
            } else {
                const availableModels = getAvailableModels().join(', ');
                api.sendMessage(`Invalid model "${selectedModel}". Here are the available models: ${availableModels}`, event.threadID, event.messageID);
            }
            return;
        }

        const question = args.join(" ");
        const searchMessage = `Looking for an answer for "${question}"...`;
        api.sendMessage(searchMessage, event.threadID, event.messageID);

        try {
            // Retrieve the selected AI model from the database for the user
            const selectedModel = loadAIModel(userId) || "Cblackbox";
            const response = await deku[selectedModel](question, userId);
            const message = response || "Sorry, I couldn't understand the question.";

            setTimeout(() => {
                api.sendMessage(message, event.threadID, event.messageID);
            }, 3000);
        } catch (error) {
            console.error('Error:', error);
            api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
        }
    }
};