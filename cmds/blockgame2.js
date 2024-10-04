const fs = require('fs');
const path = require('path');

const coinBalancesPath = path.join(__dirname, '../database/coin_balances');
const blockgamePath = path.join(__dirname, '../database/blockgame.json');

const MAX_BET = 100000000; // 100 million
const MIN_BET = 500; // 500 thousand

function loadCoinBalance(userId) {
    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);
    if (fs.existsSync(coinBalanceFile)) {
        return JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
    }
    return 0;
}

function saveCoinBalance(userId, balance) {
    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);
    fs.writeFileSync(coinBalanceFile, JSON.stringify(balance));
}

function loadBlockgame() {
    if (fs.existsSync(blockgamePath)) {
        return JSON.parse(fs.readFileSync(blockgamePath, 'utf8'));
    }
    return {};
}

function saveBlockgame(gameData) {
    fs.writeFileSync(blockgamePath, JSON.stringify(gameData, null, 2));
}

function createNewGame() {
    const totalBlocks = 20;
    const treasureCount = 5;
    const bombCount = 5; // 5 bombs

    let blocks = Array(totalBlocks).fill('⬜');

    // Place treasures
    for (let i = 0; i < treasureCount; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * totalBlocks);
        } while (blocks[index] !== '⬜');
        blocks[index] = '💰';
    }

    // Place bombs
    for (let i = 0; i < bombCount; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * totalBlocks);
        } while (blocks[index] !== '⬜');
        blocks[index] = '💣';
    }

    // Place special items
    placeSpecialItem(blocks, '✂️', 1); // Place 1 diffuser
    placeSpecialItem(blocks, '🐙', 1); // Place 1 octopus

    return blocks.map(block => ({ revealed: false, value: block }));
}

function placeSpecialItem(blocks, item, count) {
    let placed = 0;
    while (placed < count) {
        const index = Math.floor(Math.random() * blocks.length);
        if (blocks[index] === '⬜') {
            blocks[index] = item;
            placed++;
        }
    }
}

function revealBlock(blocks, blockNumber) {
    const block = blocks[blockNumber - 1];
    block.revealed = true;
    return block;
}

module.exports = {
    name: 'blockgame',
    description: 'Play a block game where you can win or lose coins based on your selections.',
    role: 'user',
    execute(api, event, args) {
        const userId = event.senderID;
        const gameData = loadBlockgame();

        if (args[0] === 'start') {
            const betAmount = parseInt(args[1]);

            if (isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
                api.sendMessage(`Please enter a valid bet amount between ${MIN_BET} and ${MAX_BET} coins.`, event.threadID, event.messageID);
                return;
            }

            let coinBalance = loadCoinBalance(userId);

            if (coinBalance < betAmount) {
                api.sendMessage('You do not have enough coins to make this bet.', event.threadID, event.messageID);
                return;
            }

            const blocks = createNewGame();
            gameData[userId] = { blocks, treasuresFound: 0, betAmount, diffusedBombs: 0 };
            saveBlockgame(gameData);

            // Deduct the bet amount from the user's balance
            coinBalance -= betAmount;
            saveCoinBalance(userId, coinBalance);

            api.sendMessage('Game started! The map is hidden. Select a number between 1-20.', event.threadID, event.messageID);
        } else if (args[0] >= 1 && args[0] <= 20) {
            const blockNumber = parseInt(args[0]);

            if (!gameData[userId]) {
                api.sendMessage('No game in progress. Use "blockgame start <bet_amount>" to start a new game.', event.threadID, event.messageID);
                return;
            }

            const { blocks, treasuresFound, betAmount, diffusedBombs } = gameData[userId];
            const block = blocks[blockNumber - 1];

            if (block.revealed) {
                api.sendMessage('This block has already been revealed. Choose another block.', event.threadID, event.messageID);
                return;
            }

            const revealedBlock = revealBlock(blocks, blockNumber);
            let resultMessage = `Block ${blockNumber} revealed: ${revealedBlock.value}\n`;

            let coinBalance = loadCoinBalance(userId);
            let gameOver = false;

            if (revealedBlock.value === '💣') {
                if (gameData[userId].diffusedBombs > 0) {
                    gameData[userId].diffusedBombs -= 1;
                    resultMessage += 'You hit a bomb but had a diffuser! The bomb was diffused.\n';
                } else {
                    resultMessage += 'You hit a bomb! Game over.\n';
                    gameOver = true;
                }
            } else if (revealedBlock.value === '💰') {
                gameData[userId].treasuresFound += 1;
                coinBalance += betAmount * 2;
                resultMessage += 'You found treasure! Double your bet.\n';
            } else if (revealedBlock.value === '✂️') {
                resultMessage += 'You found a diffuser!\n';
                gameData[userId].diffusedBombs += 1;
            } else if (revealedBlock.value === '🐙') {
                resultMessage += 'You found an octopus! It gives you 2 diffusers.\n';
                gameData[userId].diffusedBombs += 2;
            }

            saveCoinBalance(userId, coinBalance);

            if (gameData[userId].treasuresFound === 4) {
                coinBalance += 1000000000; // Additional 1 billion coins
                saveCoinBalance(userId, coinBalance);
                resultMessage += 'Congratulations! You found all treasures and won the game. You also received an additional 1 billion coins!';
                gameOver = true;
            }

            if (gameOver) {
                resultMessage += 'Final Map:\n' + blocks.map((block, index) => `${block.value}${(index + 1) % 5 === 0 ? '\n' : ''}`).join('');
                delete gameData[userId]; // End the game
            } else {
                saveBlockgame(gameData);
                resultMessage += `Updated Map:\n${blocks.map((block, index) => `${block.revealed ? block.value : '🟨'}${(index + 1) % 5 === 0 ? '\n' : ''}`).join('')}`;
                resultMessage += `\nDiffuserKit: ${gameData[userId].diffusedBombs}`;
            }

            api.sendMessage(`${resultMessage}\nUpdated Coin Balance: ${coinBalance}`, event.threadID, event.messageID);
        } else {
            api.sendMessage('Invalid command. Usage:\n"blockgame start <bet_amount>" to start a new game.\n"blockgame <1-20>" to reveal a block.', event.threadID, event.messageID);
        }
    }
};