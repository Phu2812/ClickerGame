let dpsIntervals = {};
let skillCooldownInterval = null;

function handleMonsterClick(event) {
    if (isPaused) return;

    let baseDamage = gameState.damagePerClick;
    
    if (gameState.activeSkills['rage-mode']) {
        baseDamage *= 5;
    }
    
    const doubleTapLevel = gameState.upgrades['double-tap']?.level || 0;
    const doubleTapChance = (findUpgradeData('double-tap')?.effect || 0) * doubleTapLevel;

    let hits = 1;
    if (Math.random() < doubleTapChance) {
        hits = 2;
    }
    
    const monsterContainerRect = document.getElementById('monster-container').getBoundingClientRect();
    
    for (let i = 0; i < hits; i++) {
        let currentDamage = baseDamage;
        const critChance = (gameState.upgrades['critical-chance']?.level || 0) * 0.01;
        let isCritical = Math.random() < critChance;
        
        if (isCritical) {
            const critDmgBonus = (gameState.upgrades['critical-damage']?.level || 0) * 0.1;
            currentDamage *= (2 + critDmgBonus);
            displayDamageNumber(event.clientX, event.clientY, Math.round(currentDamage), 'crit');
        } else {
            displayDamageNumber(event.clientX, event.clientY, Math.round(currentDamage), 'click');
        }
        
        const fireLevel = gameState.upgrades['fire-click']?.level || 0;
        if (fireLevel > 0) applyDot('playerFire', currentDamage, fireLevel);

        const poisonLevel = gameState.upgrades['poison-click']?.level || 0;
        if (poisonLevel > 0) applyDot('playerPoison', currentDamage, poisonLevel);

        const lightningLevel = gameState.upgrades['lightning-click']?.level || 0;
        if (lightningLevel > 0 && Math.random() < 0.15) {
            const lightningData = findUpgradeData('lightning-click');
            const minHits = lightningData.minHits[lightningLevel - 1];
            const newMaxHits = 5 + Math.floor(gameState.level / 50);
            const finalMaxHits = Math.max(minHits, newMaxHits);
            const lightningHits = Math.floor(Math.random() * (finalMaxHits - minHits + 1)) + minHits;
            
            for(let j = 0; j < lightningHits; j++) {
                setTimeout(() => {
                    if (isPaused || gameState.currentMonsterHP <= 0) return;
                    const lightningDamage = Math.round(currentDamage * lightningData.damageRatio);
                    gameState.currentMonsterHP -= lightningDamage;
                    displayDamageNumber(event.clientX, event.clientY, lightningDamage, 'lightning');
                    if (gameState.currentMonsterHP <= 0) defeatMonster();
                    updateUI();
                }, j * 100);
            }
        }

        const iceLevel = gameState.upgrades['ice-click']?.level || 0;
        if (iceLevel > 0 && !gameState.monsterStatus.frozen && !gameState.monsterStatus.immuneToFreeze) {
            const iceData = findUpgradeData('ice-click');
            const effect = iceData.effects[iceLevel - 1];
            if (Math.random() < effect.chance) {
                gameState.monsterStatus.frozen = true;
                gameState.monsterStatus.dpsBuff = effect.buff;
                document.getElementById('monster-icon').classList.add('monster-frozen');

                gameState.monsterStatus.immuneToFreeze = true;
                setTimeout(() => {
                    gameState.monsterStatus.immuneToFreeze = false;
                }, 15000);

                if (gameState.monsterStatus.freezeTimeout) clearTimeout(gameState.monsterStatus.freezeTimeout);
                
                gameState.monsterStatus.freezeTimeout = setTimeout(() => {
                    gameState.monsterStatus.frozen = false;
                    gameState.monsterStatus.dpsBuff = 0;
                    document.getElementById('monster-icon').classList.remove('monster-frozen');
                    startDpsTimers();
                }, effect.duration * 1000);
                
                startDpsTimers();
            }
        }
        
        gameState.currentMonsterHP -= Math.round(currentDamage);
        animateMonsterHit();
        
        if (gameState.currentMonsterHP <= 0) {
            defeatMonster();
            break;
        }
    }
    
    updateUI();
    saveGame();
}

function applyDot(type, baseDamage, level) {
    let dotData;
    let dpsItemData;
    if (type === 'playerFire') dotData = findUpgradeData('fire-click');
    else if (type === 'playerPoison') dotData = findUpgradeData('poison-click');
    else if (type === 'mage') {
        dpsItemData = findUpgradeData('mage');
        dotData = { tickInterval: 1000, duration: 5 };
    }

    if (!dotData) return;

    if (gameState.dot[type].active) {
        if(type !== 'mage') gameState.dot[type].remainingTime = dotData.duration;
        return;
    }

    gameState.dot[type].remainingTime = dotData.duration;
    gameState.dot[type].active = true;

    let damagePerTick = 0;
    if (type === 'playerFire') {
        const fireUpgradeMultiplier = dotData.damageRatio + (level - 1) * dotData.damageScale;
        const levelBonus = gameState.level * 0.0015;
        const finalMultiplier = fireUpgradeMultiplier + levelBonus;
        damagePerTick = Math.round(baseDamage * finalMultiplier);
    } else if (type === 'mage') {
        const mageLevel = gameState.upgrades['mage']?.level || 0;
        if (mageLevel > 0) {
            const maxLevelForStats = dpsItemData.levelStats.length;
            const mageStats = dpsItemData.levelStats[Math.min(mageLevel, maxLevelForStats) - 1];
            damagePerTick = Math.round((gameState.damagePerClick * mageStats.dotMultiplier) * (1 + gameState.level / 15));
        }
    }
    
    gameState.dot[type].damage = damagePerTick;

    gameState.dot[type].interval = setInterval(() => {
        if (!isPaused && gameState.dot[type].active) {
            if(type === 'playerPoison') {
                 gameState.dot[type].damage = Math.round(gameState.maxMonsterHP * (dotData.damageRatio + (level - 1) * dotData.damageScale));
            }

            gameState.currentMonsterHP -= gameState.dot[type].damage;
            let dotClass = type === 'playerFire' ? 'dot-fire' : (type === 'playerPoison' ? 'dot-poison' : 'dot-mage');
            
            const monsterContainerRect = document.getElementById('monster-container').getBoundingClientRect();
            displayDamageNumber(Math.random() * (monsterContainerRect.width - 40) + monsterContainerRect.left + 20, Math.random() * (monsterContainerRect.height - 40) + monsterContainerRect.top + 20, gameState.dot[type].damage, dotClass);

            if (gameState.currentMonsterHP <= 0) defeatMonster();
            
            gameState.dot[type].remainingTime -= (dotData.tickInterval / 1000);
            if (gameState.dot[type].remainingTime <= 0) {
                clearInterval(gameState.dot[type].interval);
                gameState.dot[type].active = false;
            }
            updateUI();
        }
    }, dotData.tickInterval);
}

function defeatMonster() {
    let goldReward = Math.round(3 * Math.pow(1.1, gameState.level));
    
    const goldMultiplierLevel = gameState.upgrades['gold-multiplier']?.level || 0;
    const goldBonus = goldMultiplierLevel * 0.05;
    goldReward *= (1 + goldBonus);

    if (gameState.activeSkills['gold-rush']) {
        goldReward *= 2;
    }

    if (gameState.level % 10 === 0) { 
        goldReward *= 5;
        const gemBonus = (gameState.upgrades['boss-loot']?.level || 0) + 1;
        gameState.gems += gemBonus;
        displayDamageNumber(window.innerWidth / 2, window.innerHeight / 2, gemBonus, 'gem');
    }
    gameState.gold += Math.round(goldReward);
    
    Object.keys(gameState.dot).forEach(key => {
        if (gameState.dot[key].interval) clearInterval(gameState.dot[key].interval);
        gameState.dot[key].active = false;
    });

    if (gameState.monsterStatus.freezeTimeout) clearTimeout(gameState.monsterStatus.freezeTimeout);
    gameState.monsterStatus.frozen = false;
    gameState.monsterStatus.dpsBuff = 0;
    const monsterIcon = document.getElementById('monster-icon');
    if (monsterIcon) monsterIcon.classList.remove('monster-frozen');

    gameState.level++;
    generateMonster();
    updateUI();
}

function generateMonster() {
    const isBossLevel = gameState.level % 10 === 0;
    const currentBiomeIndex = Math.floor((gameState.level - 1) / 10);
    const biomeMonsters = isBossLevel ? GAME_DATA.bosses : GAME_DATA.monsters;
    
    const monster = biomeMonsters[currentBiomeIndex % biomeMonsters.length];
    
    let baseHP = 10 * Math.pow(1.2, gameState.level - 1);
    if (isBossLevel) {
        baseHP *= 10;
    }
    
    gameState.maxMonsterHP = Math.round(baseHP);
    gameState.currentMonsterHP = gameState.maxMonsterHP;
    
    const monsterIcon = document.getElementById('monster-icon');
    if (monsterIcon) {
        monsterIcon.className = '';
        monsterIcon.classList.add(isBossLevel ? 'boss-icon' : 'monster-icon', ...monster.icon.split(' '));
    }
    const monsterName = document.getElementById('monster-name');
    if (monsterName) monsterName.textContent = monster.name;
}

function calculateDpsDamage(dpsItem, dpsLevel, currentStats) {
    if (!dpsLevel || !currentStats) return 0;
    let baseDamage = 0;
    switch (dpsItem.id) {
        case 'swordsman': 
            baseDamage = (currentStats.damage + dpsLevel * 3) * (1 + gameState.damagePerClick / 100) * (1 + gameState.level / 50); 
            break;
        case 'archer': 
            baseDamage = currentStats.damage + (dpsLevel * 2) + (gameState.level * 0.3); 
            break;
        case 'mage': 
            baseDamage = currentStats.damage + (gameState.level * 0.5); 
            break;
        case 'treasure-hunter': 
            baseDamage = currentStats.damage + (gameState.level * 0.2); 
            break;
        case 'pet': 
            baseDamage = currentStats.damage * (1 + gameState.level / 40); 
            break;
    }
    return baseDamage;
}

function startDpsTimers() {
    for (const id in dpsIntervals) {
        clearInterval(dpsIntervals[id]);
    }
    dpsIntervals = {};

    const petLevel = gameState.upgrades['pet']?.level || 0;
    let petBuffDamage = 0;
    let petBuffSpeed = 0;
    if (petLevel > 0) {
        const petData = GAME_DATA.upgrades.dps.find(u => u.id === 'pet');
        const petStats = petData.levelStats[petLevel - 1];
        petBuffDamage = petStats.buff.damage;
        petBuffSpeed = petStats.buff.attackSpeed;
    }

    const gemDpsLevel = gameState.gemUpgrades['gem-dps-damage']?.level || 0;
    const gemDpsBonus = 1 + (gemDpsLevel * GAME_DATA.gemUpgrades.find(u => u.id === 'gem-dps-damage').effect);

    GAME_DATA.upgrades.dps.forEach(dpsItem => {
        const dpsLevel = gameState.upgrades[dpsItem.id]?.level || 0;
        if (dpsLevel > 0) {
            const maxLevelForStats = dpsItem.levelStats.length;
            const currentStats = dpsItem.levelStats[Math.min(dpsLevel, maxLevelForStats) - 1];
            
            let baseDamage = calculateDpsDamage(dpsItem, dpsLevel, currentStats);
            let finalSpeed = dpsItem.attackSpeed;

            if (dpsItem.id === 'archer' || dpsItem.id === 'treasure-hunter') {
                const speedBonusFactor = dpsItem.id === 'archer' ? 0.002 : 0.001;
                finalSpeed /= (1 + gameState.level * speedBonusFactor);
            }

            let finalDamage = baseDamage;
            if (dpsItem.id !== 'pet') {
                finalDamage *= (1 + petBuffDamage);
            }
            finalDamage *= gemDpsBonus;

            if (gameState.monsterStatus.frozen) {
                finalDamage *= (1 + gameState.monsterStatus.dpsBuff);
            }
            
            finalSpeed /= (1 + petBuffSpeed);
            
            const interval = setInterval(() => {
                if (!isPaused) {
                    applyDpsDamage(dpsItem, finalDamage, currentStats);
                }
            }, finalSpeed);
            dpsIntervals[dpsItem.id] = interval;
        }
    });
}

function applyDpsDamage(dpsItem, finalDamage, currentStats) {
    let type = dpsItem.id;
    const monsterContainerRect = document.getElementById('monster-container').getBoundingClientRect();
    
    if (type === 'mage') {
        const dotProcChance = 0.25; 
        if (Math.random() < dotProcChance && !gameState.dot.mage.active) {
            applyDot('mage', finalDamage, currentStats.level);
        }
    } 
    else if (type === 'treasure-hunter') {
        const goldFromHunter = Math.max(1, Math.round(finalDamage * 0.1));
        const goldEcoBonus = (gameState.upgrades['treasure-hunter-eco']?.level || 0) * 0.1 + 1;
        const finalGold = goldFromHunter * goldEcoBonus;

        gameState.gold += finalGold;
        displayDamageNumber(monsterContainerRect.left + monsterContainerRect.width / 2, monsterContainerRect.top + monsterContainerRect.height / 2, Math.round(finalGold), 'gold');
    }
    
    gameState.currentMonsterHP -= Math.round(finalDamage);
    displayDamageNumber(monsterContainerRect.left + monsterContainerRect.width / 2, monsterContainerRect.top + monsterContainerRect.height / 2, finalDamage, `dps-${type}`);

    if (gameState.currentMonsterHP <= 0) {
        defeatMonster();
    }
    updateUI();
}

function startSkillCooldownTimer() {
    if (skillCooldownInterval) clearInterval(skillCooldownInterval);
    skillCooldownInterval = setInterval(() => {
        if (!isPaused) {
            let needsRender = false;
            for (const skillId in gameState.skillCooldowns) {
                if (gameState.skillCooldowns[skillId] > 0) {
                    gameState.skillCooldowns[skillId]--;
                    needsRender = true;
                }
            }
            if(needsRender) renderSkillBar();
        }
    }, 1000);
}
