const { exec } = require('child_process');

module.exports = {
    description: "Execute a shell command",
    role: "admin",
    credits: 'o10',
    cooldown: 8,
    execute(api, event, args, commands) {
        if (args.length === 0) {
            api.sendMessage("Please provide a command to execute.", event.threadID, event.messageID);
            api.setMessageReaction(':heart:', event.messageID);
            return;
        }

        const command = args.join(" ");
        const searchMessage = `Executing command: "${command}"...`;
        api.sendMessage(searchMessage, event.threadID, event.messageID);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                api.sendMessage(`stderr: ${stderr}`, event.threadID, event.messageID);
                return;
            }

            console.log(`stdout: ${stdout}`);
            api.sendMessage(`Result: ${stdout}`, event.threadID, event.messageID);
        });
    }
};