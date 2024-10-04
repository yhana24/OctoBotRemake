const fs = require('fs');
const path = require('path');

/* ----DATABASE MDF -----*/
const petsFilePath = path.join(__dirname, '../database/pets.json');
const coinBalancesPath = path.join(__dirname, '../database/coin_balances');
const battleLogsPath = path.join(__dirname, '../database/battle_logs');
const winLossRecordPath = path.join(__dirname, '../database/win_loss_record.json');
const challengePath = path.join(__dirname, '../database/challenge.json');

/* ::::::::::::::::::SAVE & LOADS::::::::::::*/
function loadPets() {
    if (fs.existsSync(petsFilePath)) {
        return JSON.parse(fs.readFileSync(petsFilePath, 'utf8'));
    }
    return {};
}

function savePets(pets) {
    fs.writeFileSync(petsFilePath, JSON.stringify(pets, null, 2));
}

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

function loadWinLossRecord() {
    if (fs.existsSync(winLossRecordPath)) {
        return JSON.parse(fs.readFileSync(winLossRecordPath, 'utf8'));
    }
    return {};
}

function saveWinLossRecord(record) {
    fs.writeFileSync(winLossRecordPath, JSON.stringify(record, null, 2));
}

function loadChallenge() {
    if (fs.existsSync(challengePath)) {
        return JSON.parse(fs.readFileSync(challengePath, 'utf8'));
    }
    return {};
}

function saveChallenge(challenge) {
    fs.writeFileSync(challengePath, JSON.stringify(challenge, null, 2));
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* :::::::::::::: Skilleffect::::::::::::::::: */
function applySkillEffect(attacker, defender) {
    const weaknesses = {
        fire: 'grass',
        ice: 'fire',
        water: 'fire',
        grass: 'water',
        electric: 'water',
        rock: 'fairy',
        fairy: 'grass',
        ghost: 'fighting',
        fighting: 'rock'
    };
    let additionalDamage = 0;
    let skillEffect = '';
 /* :::::::::::::::::::SUPER EFFECTIVE::::::*/
    if (weaknesses[attacker.skill] === defender.skill) {
        additionalDamage = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
        skillEffect = 'super effective';
    } 
         //Frozen
    else if (attacker.skill === 'ice' && Math.random() < 0.5) {
        skillEffect = 'frozen';
    }
    //Burn
     else if (attacker.skill === 'fire' && Math.random() < 0.5) {
        skillEffect = 'burn';
        additionalDamage = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    } 
    //Water pistol 
    else if (attacker.skill === 'water' && Math.random() < 0.5) {
        skillEffect = 'waterPistol';
        additionalDamage = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    } 
    //thunder ball
    else if (attacker.skill === 'electric' && Math.random() < 0.5) {
        skillEffect = 'thunderBall';
        additionalDamage = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    } 
    //Grass Heal
    else if (attacker.skill === 'grass' && Math.random() < 0.5) {
        skillEffect = 'grassHeal';
        additionalDamage = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    } 
    //CoinGetter
    else if (attacker.skill === 'fairy' && Math.random() < 0.5) {
        skillEffect = 'coinGetter';
        additionalDamage = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    }
    //Rock Armor
     else if (attacker.skill === 'rock' && Math.random() < 0.5) {
        skillEffect = 'rockArmor';
        additionalDamage = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    } 
    //Weakness Finder
    else if (attacker.skill === 'fighting' && Math.random() < 0.5) {
        skillEffect = 'weaknessFinder';
        additionalDamage = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    }
    //Ghost DreamEater
    else if (attacker.skill === 'ghost' && Math.random() < 0.3) {
        skillEffect = 'dreamEater';
    }
    return { additionalDamage, skillEffect };
}

/*::::::::BattleRound :::::::;;;::*/
function battleRound(attacker, defender, multiplier = 1.1) {
    const { additionalDamage, skillEffect } = applySkillEffect(attacker, defender);
    const defenseChance = Math.random();
    const damageMultiplier = multiplier;
    const totalDamage = (attacker.attack + additionalDamage) * damageMultiplier - (defenseChance < 0.3 ? defender.defense : 0);
    defender.hp -= totalDamage;
    
    // GrassHeal
    if (attacker.skill === 'grass' && skillEffect === 'grassHeal') {
        attacker.hp += attacker.attack * 0.4;
        defender.hp -= additionalDamage;
    }
    //RockArmor
    if (attacker.skill === 'rock' && skillEffect === 'rockArmor') {
        attacker.defense += attacker.defense * 0.2;
        attacker.hp += attacker.defense * 0.1;
        defender.hp -= additionalDamage;
    }
    //Frozen
    if (skillEffect === 'frozen') {
        defender.speed *= 0.2; 
        attacker.isFrozen = true; 
        defender.hp -= additionalDamage;
    }
    //Burn
     else if (skillEffect === 'burn') {
       defender.defense *= 0.2; 
        defender.hp -= additionalDamage; 
    } 
    //waterPistol
    else if (skillEffect === 'waterPistol') {
        defender.hp -= additionalDamage; 
    }
    //thunder ball
     else if (skillEffect === 'thunderBall') {
        defender.hp -= additionalDamage;
        defender.speed *= 0.3;
    }
    //dreamEater
     else if (skillEffect === 'dreamEater') {
        defender.hp *= 0.9;
    }
    //weakness finder
    else if (skillEffect === 'weaknessFinder') {
        if (defender.defense <= 0 )
        {
        defender.defense *= 0.1;
        defender.hp -= additionalDamage;
        } else { defender.hp -= 240; }
    }
    
    
    return {
        totalDamage,
        skillEffect,
        defenderHP: defender.hp
    };
}

/* --------------STATS UPDATE ------------- */
function updatePetStats(pet) {
    pet.attack = Math.max(0, pet.attack) + 3;
    pet.hp = pet.exp * 10;
    pet.defense = Math.max(0, pet.defense) + 3;
    pet.speed = Math.max(0, pet.speed) + 3;  
    
    // Apply stat caps
    pet.attack = Math.min(pet.attack, 2000);
    pet.hp = Math.min(pet.hp, 10000);
    pet.defense = Math.min(pet.defense, 1500);
    pet.speed = Math.min(pet.speed, 1000);

    pet.exp += getRandomNumber(15, 20);
    
    // Save updated pet stats
    const pets = loadPets();
    pets[pet.owner] = pet;
    savePets(pets);
}

function updatePetStats2(pet) {
    pet.attack = Math.max(0, pet.attack) + 1;
    pet.hp = pet.exp * 10;
    pet.defense = Math.max(0, pet.defense) + 1;
    pet.speed = Math.max(0, pet.speed) + 2;  

    // Apply stat caps
    pet.attack = Math.min(pet.attack, 2000);
    pet.hp = Math.min(pet.hp, 10000);
    pet.defense = Math.min(pet.defense, 1500);
    pet.speed = Math.min(pet.speed, 1000);
    
    pet.exp += getRandomNumber(5, 15);
    
    // Save updated pet stats
    const pets = loadPets();
    pets[pet.owner] = pet;
    savePets(pets);
}


/* ----------- REWARD--------- */
function awardCoins(userId, amount) {
    let balance = loadCoinBalance(userId);
    balance += amount;
    saveCoinBalance(userId, balance);
    return amount;
}

/* ------ W/L UPDATE ------------*/
function updateWinLossRecord(winnerId, loserId) {
    const record = loadWinLossRecord();
    if (!record[winnerId]) {
        record[winnerId] = { wins: 0, losses: 0 };
    }
    if (!record[loserId]) {
        record[loserId] = { wins: 0, losses: 0 };
    }
    record[winnerId].wins += 1;
    record[loserId].losses += 1;
    saveWinLossRecord(record);
}


/*----+++BATTLE++++---+++*/
function startBattle(api, event, userPet, opponentPet, betAmount) {
    const battleLogsPath = path.join(__dirname, '../database/battle_logs');
    if (!fs.existsSync(battleLogsPath)) {
        fs.mkdirSync(battleLogsPath);
    }

    userPet.hp = Math.min(userPet.exp * 10, 10000);
    opponentPet.hp = Math.min(opponentPet.exp * 10, 10000);

    let battleLog = [];
    let frozen = false;

    let firstPet, secondPet;
    if (userPet.speed > opponentPet.speed) {
        firstPet = userPet;
        secondPet = opponentPet;
    } else {
        firstPet = opponentPet;
        secondPet = userPet;
    }

    for (let round = 1; round <= 3; round++) {
        if (!frozen) {
            const firstAttack = battleRound(firstPet, secondPet, 1.5);
           /*
           let firstAttackMessage = `Round ${round}: ${firstPet.name} deals ${firstAttack.totalDamage.toFixed(2)} damage to ${secondPet.name}. (${firstAttack.skillEffect}) (${secondPet.hp})`; */
           let firstAttackMessage=`_________⚔️BATTLE__________\nRound ${round}: ${firstPet.emoji} V.S ${secondPet.emoji}\n______________________________\n🗡️${firstPet.emoji} ${firstPet.name}\n❤️${firstPet.hp} | ATK:${firstPet.attack} | DEF:${firstPet.defense} | SPD:${firstPet.speed} | TYPE:${firstPet.skill}\n______________________________\n::::::::::::::::::::VERSUS::::::::::::::::::\n______________________________\n🛡️${secondPet.emoji} ${secondPet.name}\n❤️HP:${secondPet.hp} | ATK:${secondPet.attack} | DEF:${secondPet.defense} | SPD:${secondPet.speed} | TYPE:${secondPet.skill}\n_____________________________\nATTACKER LOG:\n⚔️${firstPet.name} deals ${firstAttack.totalDamage.toFixed(2)} damage  ${firstAttack.skillEffect}\n⚔️`;

            if (firstAttack.skillEffect === 'coinGetter') {
                const coinReward = getRandomNumber(1000, 1500);
                awardCoins(firstPet.owner, coinReward);
                firstAttackMessage += ` ${firstPet.name} uses ✨Coin Getter and earns ${coinReward} coins!`;
            } else if (firstAttack.skillEffect === 'frozen') {
                frozen = true;
                firstAttackMessage += ` ${firstPet.name} uses ❄️ Frozen!`;
            } else if (firstAttack.skillEffect === 'burn') {
                firstAttackMessage += ` ${firstPet.name} uses 🔥 Burn!`;
            } else if (firstAttack.skillEffect === 'waterPistol') {
                firstAttackMessage += ` ${firstPet.name} uses 💦 Water Pistol!`;
            } else if (firstAttack.skillEffect === 'thunderBall') {
                firstAttackMessage += ` ${firstPet.name} uses ⚡ Thunder Ball!`;
            } else if (firstAttack.skillEffect === 'grassHeal') {
                firstAttackMessage += ` ${firstPet.name} uses 🌿 Grass Heal and recovers some HP!`;
            } else if (firstAttack.skillEffect === 'rockArmor') {
                firstAttackMessage += ` ${firstPet.name} uses 🛡️ Rock Armor and boosts defense!`;
            } else if (firstAttack.skillEffect === 'dreamEater') {
                firstAttackMessage += ` ${firstPet.name} uses ☠️ Dream Eater and deals Massive Damage!`;
            } else if (firstAttack.skillEffect === 'weaknessFinder') {
                firstAttackMessage += ` ${firstPet.name} uses 🥊 Weakness Finder and broke opponent armor by 50%`;
            }

            battleLog.push(firstAttackMessage);

            if (secondPet.hp <= 0) {
                battleLog.push(`${secondPet.name} has fainted.`);
                break;
            }
        } else {
            frozen = false; // Skip attack if frozen, and unfroze pet after that
        }

        const secondAttack = battleRound(secondPet, firstPet, 1.5);
        
        /*
        let secondAttackMessage = `Round ${round}: ${secondPet.name} deals ${secondAttack.totalDamage.toFixed(2)} damage to ${firstPet.name}. (${secondAttack.skillEffect}) (${firstPet.hp})`;
*/

      let secondAttackMessage = `_________⚔️BATTLE__________\nRound ${round}: ${secondPet.emoji} V.S ${firstPet.emoji}\n______________________________\n🗡️${secondPet.emoji} ${secondPet.name}\n❤️HP:${secondPet.hp} | ATK:${secondPet.attack} | DEF:${secondPet.defense} | SPD:${secondPet.speed} | TYPE:${secondPet.skill}\n______________________________\n::::::::::::::::::::VERSUS::::::::::::::::::\n______________________________\n🛡️${firstPet.emoji} ${firstPet.name}\n❤️${firstPet.hp} | ATK:${firstPet.attack} | DEF:${firstPet.defense} | SPD:${firstPet.speed} | TYPE:${firstPet.skill}\n_____________________________\nATTACKER LOG:\n⚔️${secondPet.name} deals ${secondAttack.totalDamage.toFixed(2)} damage  ${secondAttack.skillEffect}\n⚔️`;
      
        if (secondAttack.skillEffect === 'coinGetter') {
            const coinReward = getRandomNumber(1000, 1500);
            awardCoins(secondPet.owner, coinReward);
            secondAttackMessage += ` ${secondPet.name} uses ✨Coin Getter and earns ${coinReward} coins!`;
        } else if (secondAttack.skillEffect === 'frozen') {
            frozen = true;
            secondAttackMessage += ` ${secondPet.name} uses ❄️ Frozen!`;
        } else if (secondAttack.skillEffect === 'burn') {
            secondAttackMessage += ` ${secondPet.name} uses 🔥 Burn!`;
        } else if (secondAttack.skillEffect === 'waterPistol') {
            secondAttackMessage += ` ${secondPet.name} uses 💦 Water Pistol!`;
        } else if (secondAttack.skillEffect === 'thunderBall') {
            secondAttackMessage += ` ${secondPet.name} uses ⚡ Thunder Ball!`;
        } else if (secondAttack.skillEffect === 'grassHeal') {
            secondAttackMessage += ` ${secondPet.name} uses 🌿 Grass Heal and recovers some HP!`;
        } else if (secondAttack.skillEffect === 'rockArmor') {
            secondAttackMessage += ` ${secondPet.name} uses 🛡️ Rock Armor and boosts defense!`;
        } else if (secondAttack.skillEffect === 'dreamEater') {
            secondAttackMessage += ` ${secondPet.name} uses ☠️ Dream Eater and deals Massive Damage!`;
        } else if (secondAttack.skillEffect === 'weaknessFinder') {
            secondAttackMessage += ` ${secondPet.name} uses 🥊 Weakness Finder and broke opponent armor by 50%`;
        }
        

        battleLog.push(secondAttackMessage);

        if (firstPet.hp <= 0 || secondPet.hp <= 0) {
            break;
        }
    }

    let winner;
    if (firstPet.hp <= 0 && secondPet.hp <= 0) {
        battleLog.push('It\'s a draw!');
    } else if (firstPet.hp <= 0) {
        winner = secondPet;
        updatePetStats(secondPet);
       updatePetStats2(firstPet); updateWinLossRecord(secondPet.owner, firstPet.owner);
    } else if (secondPet.hp <= 0) {
        winner = firstPet;
        updatePetStats(firstPet);
       updatePetStats2(secondPet);
        updateWinLossRecord(firstPet.owner, secondPet.owner);
    } else if (firstPet.hp > secondPet.hp) {
        winner = firstPet;
        updatePetStats(firstPet);
       updatePetStats2(secondPet);
        updateWinLossRecord(firstPet.owner, secondPet.owner);
    } else {
        winner = secondPet;
        updatePetStats(secondPet);
        updatePetStats2(firstPet);
        updateWinLossRecord(secondPet.owner, firstPet.owner);
    }

    if (winner) {
        const coinsAwarded = awardCoins(winner.owner, betAmount * 2);
        battleLog.push(`${winner.emoji} ⛏️ ${winner === userPet ? opponentPet.emoji : userPet.emoji}`);
        battleLog.push(`${winner.name} has slain ${winner === userPet ? opponentPet.name : userPet.name}!`);
        battleLog.push(`${winner.name} earned ${coinsAwarded} coins and gained experience!`);
        battleLog.push(`${winner.name} - Exp: ${winner.exp}, Attack: ${winner.attack}, HP: ${winner.hp}, Defense: ${winner.defense}, Speed: ${winner.speed}`);
    }

    const pets = loadPets();
    pets[userPet.owner] = userPet;
    pets[opponentPet.owner] = opponentPet;
    savePets(pets);

    const battleLogFilePath = path.join(battleLogsPath, `battle_log_${Date.now()}.txt`);
    fs.writeFileSync(battleLogFilePath, battleLog.join('\n'), 'utf8');

    const sendBattleLogMessage = () => {
        api.sendMessage({
            body: 'Pet Battle log:',
            attachment: fs.createReadStream(battleLogFilePath)
        }, event.threadID, () => {
            fs.unlinkSync(battleLogFilePath);
        });
    };

    let messageIndex = 0;
    const sendMessages = () => {
        if (messageIndex < battleLog.length) {
            api.sendMessage(battleLog[messageIndex], event.threadID, () => {
                messageIndex++;
                setTimeout(sendMessages, 3000);
            });
        } else {
            setTimeout(sendBattleLogMessage, 2000);
        }
    };

    sendMessages();
}
module.exports = {
    name: 'challenge',
    description: 'Challenge another user to a pet battle with a bet amount.',
    role: 'user',
    cooldown: 0,
    credits: 'REJARD GWAPO', 
    execute(api, event, args) {
    const userId = event.senderID;
    const pets = loadPets();

    if (!pets[userId]) {
        api.sendMessage('You do not have a pet to challenge with. Use the "pet" command to create one.', event.threadID, event.messageID);
        return;
    }

    const challengeData = loadChallenge();

    if (args.length === 0) {
        if (challengeData[userId] && challengeData[userId].betAmount) {
            api.sendMessage(`You have started a challenge with a bet amount of ${challengeData[userId].betAmount} coins. Waiting for an opponent to accept...`, event.threadID, event.messageID);
        } else {
            api.sendMessage('Usage:\n- challenge start <betAmount>\n- challenge accept\n\nStart a challenge or accept an existing one.', event.threadID, event.messageID);
        }
        return;
    }

    const command = args[0].toLowerCase();

    if (command === 'start') {
        const betAmount = parseInt(args[1]);
        if (isNaN(betAmount) || betAmount <= 0) {
            api.sendMessage('Please enter a valid bet amount.', event.threadID, event.messageID);
            return;
        }

        let coinBalance = loadCoinBalance(userId);
        if (coinBalance < betAmount) {
            api.sendMessage(`You do not have enough coins to bet ${betAmount} coins.`, event.threadID, event.messageID);
            return;
        }

    /* -- Deduct Coins -----*/
        coinBalance -= betAmount;
        saveCoinBalance(userId, coinBalance);

        challengeData[userId] = {
            betAmount: betAmount,
            timestamp: Date.now()
        };
        saveChallenge(challengeData);

        api.sendMessage(`${pets[userId].emoji} ${pets[userId].name} is challenging you for ${betAmount} coins! Type "challenge accept" to accept the challenge.`, event.threadID, event.messageID);

        /* Waiting to nay mag accept*/
        setTimeout(() => {
            const currentChallengeData = loadChallenge();
            if (currentChallengeData[userId] && currentChallengeData[userId].timestamp === challengeData[userId].timestamp) {
                const refundAmount = betAmount * 0.95;
                let updatedCoinBalance = loadCoinBalance(userId);
                updatedCoinBalance += refundAmount;
                saveCoinBalance(userId, updatedCoinBalance);
                delete currentChallengeData[userId];
                saveChallenge(currentChallengeData);

                api.sendMessage(`The challenge has expired due to no response. ${betAmount * 0.05} coins have been deducted as a fee, and ${refundAmount} coins have been refunded to you.`, event.threadID, event.messageID);
            }
        }, 40000);
/* ------ACCEPTING -------*/
    } else if (command === 'accept') {
        const opponentId = Object.keys(challengeData).find(id => challengeData[id].betAmount);
        if (!opponentId) {
            api.sendMessage('There are no active challenges to accept.', event.threadID, event.messageID);
            return;
        }

        if (opponentId === userId) {
            api.sendMessage('You cannot accept your own challenge.', event.threadID, event.messageID);
            return;
        }

        if (!pets[opponentId]) {
            api.sendMessage('The challenger does not have a pet.', event.threadID, event.messageID);
            return;
        }

        let coinBalance = loadCoinBalance(userId);
        const betAmount = challengeData[opponentId].betAmount;
        if (coinBalance < betAmount) {
            api.sendMessage(`You do not have enough coins to accept the challenge of ${betAmount} coins.`, event.threadID, event.messageID);
            return;
        }
        coinBalance -= betAmount;
        saveCoinBalance(userId, coinBalance);

        api.sendMessage(`${pets[userId].emoji} ${pets[userId].name} has accepted the challenge from ${pets[opponentId].emoji} ${pets[opponentId].name} for ${betAmount} coins!`, event.threadID, event.messageID);

        setTimeout(() => {
            startBattle(api, event, pets[userId], pets[opponentId], betAmount);
        }, 3000);
        
        delete challengeData[opponentId];
        saveChallenge(challengeData);

    } 
     /** --*GUIDE*******/
     else if (command === 'help') {
     const gameGuide  = `Welcome to OctobotRemake Pet Battle PVP\nHeres the Guide:\nhttps://www.facebook.com/61556251846264/posts/pfbid05XvnbCsMDriLcRcTGPhBo8hRKYaFF3NGaBaneCY2mHmDkQm7qmJBNjQ75kSvdkTVl/\nDeveloper: LeechShares
     `;
     api.sendMessage(gameGuide, event.threadID, event.messageID);
     }
    /* >>>>>Invalid command <<<<<< */
    else {
        api.sendMessage('Invalid command. Use "challenge start <betAmount>" to start a challenge or "challenge accept" to accept a challenge.', event.threadID, event.messageID);
    }
}
};