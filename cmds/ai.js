const Deku = require("dekuai");
const deku = new Deku();

module.exports = {
    description: "Ask the GPT4 a question (conversational)",
    role: "user",
    credits: 'deku',
    cooldown: 8,
    async execute(api, event, args, commands) {
        if (args.length === 0) {
            api.sendMessage("Please provide a question.", event.threadID, event.messageID);
            api.setMessageReaction(':heart:', event.messageID);
            return;
        }

        const myOten = event.senderID;
        const question = args.join(" ");
        const searchMessage = `Looking for an answer for "${question}"...`;
        api.sendMessage(searchMessage, event.threadID, event.messageID);

        const cid = myOten; 
        const model = "Cblackbox"; 

        try {
            const response = await deku[model](question, cid);
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