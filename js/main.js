let activeParticleInterval = null;

async function loadAlbumsData() {
    try {
        const response = await fetch('images.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const albumsData = await response.json();
        
        const rarityMapData = { 1: 'Common', 2: 'Rare', 3: 'Epic', 4: 'Legendary' };
        GAME_DATA.albums = albumsData.map((album, index) => {
            return {
                id: `album-${index + 1}`,
                name: album.displayName,
                cost: album.cost,
                rarity: rarityMapData[album.rarity] || 'Common',
                image: `images/${album.fileName}`
            };
        });
        
    } catch (error) {
        console.error("Could not load images.json:", error);
        GAME_DATA.albums = [];
    }
}

async function initGame() {
    await loadAlbumsData();
    loadGame();
    
    ['click', 'dps', 'economy', 'skill'].forEach(type => {
        if (!gameState.upgrades[type]) {
             gameState.upgrades[type] = {};
        }
        GAME_DATA.upgrades[type].forEach(item => {
            if (!gameState.upgrades[item.id]) {
                gameState.upgrades[item.id] = { level: 0 };
            }
        });
    });
    if (!gameState.gemUpgrades) gameState.gemUpgrades = {};
    GAME_DATA.gemUpgrades.forEach(item => {
        if (!gameState.gemUpgrades[item.id]) {
                gameState.gemUpgrades[item.id] = { level: 0 };
        }
    });
    if (!gameState.albums) gameState.albums = {};
    GAME_DATA.albums.forEach(item => {
        if (!gameState.albums[item.id]) {
            gameState.albums[item.id] = { unlocked: false, price: item.cost };
        }
    });

    recalculateStats();
    generateMonster();
    updateUI();
    startDpsTimers();
    startSkillCooldownTimer();
    
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('zoom-popup').style.display = 'none';
    const equipModal = document.getElementById('equip-skill-modal');
    if (equipModal) equipModal.style.display = 'none';
    
    document.getElementById('game-screen').style.display = 'flex';
    
    document.addEventListener('keydown', handleKeyPress);
}

function buyUpgrade(id) {
    const upgradeData = findUpgradeData(id);
    if (!upgradeData) return;

    const currentLevel = gameState.upgrades[id]?.level || 0;
    if (upgradeData.maxLevel && currentLevel >= upgradeData.maxLevel) {
        showNotification("Nâng cấp này đã đạt cấp độ tối đa!", "info");
        return;
    }
    const currentCost = Math.round(upgradeData.cost * Math.pow(1.15, currentLevel));
    
    if (gameState.gold >= currentCost) {
        gameState.gold -= currentCost;
        gameState.upgrades[id].level++;
        recalculateStats();
        updateUI();
        startDpsTimers();
        saveGame();
    } else {
        showNotification("Không đủ vàng!", "error");
    }
}

function buyGemUpgrade(id) {
    const upgradeData = findGemUpgradeData(id);
    if (!upgradeData) return;

    const currentLevel = gameState.gemUpgrades[id]?.level || 0;
    const currentCost = upgradeData.cost + currentLevel;

    if (gameState.gems >= currentCost) {
        gameState.gems -= currentCost;
        gameState.gemUpgrades[id].level++;
        recalculateStats();
        updateUI();
        saveGame();
    } else {
        showNotification("Không đủ Gem!", "error");
    }
}

function buyAlbum(id) {
    const albumData = GAME_DATA.albums.find(a => a.id === id);
    if (!albumData || gameState.albums[id]?.unlocked) return;

    if (gameState.gold >= albumData.cost) {
        gameState.gold -= albumData.cost;
        if (!gameState.albums[id]) {
            gameState.albums[id] = {};
        }
        gameState.albums[id].unlocked = true;
        updateUI();
    } else {
        showNotification("Không đủ vàng!", "error");
    }
}

function useSkill(id) {
    if (gameState.skillCooldowns[id] > 0) return;
    
    const skillData = findUpgradeData(id);
    if (!skillData || (gameState.upgrades[id]?.level || 0) === 0) return;

    const gemSkillLevel = gameState.gemUpgrades['gem-skill-damage']?.level || 0;
    const gemSkillBonus = (1 + gemSkillLevel * (findGemUpgradeData('gem-skill-damage')?.effect || 0));
    
    const screenOverlay = document.getElementById('screen-overlay');

    if (id === 'firestorm') {
        let totalDamage = gameState.maxMonsterHP * 0.5;
        totalDamage *= gemSkillBonus;
        gameState.currentMonsterHP -= Math.round(totalDamage);
        
        const monsterContainerRect = document.getElementById('monster-container').getBoundingClientRect();
        displayDamageNumber(Math.random() * (monsterContainerRect.width - 40) + monsterContainerRect.left + 20, Math.random() * (monsterContainerRect.height - 40) + monsterContainerRect.top + 20, Math.round(totalDamage), 'skill');
        animateMonsterHit();
        
        screenOverlay.className = 'screen-effect-overlay firestorm';
        screenOverlay.style.opacity = 1;
        setTimeout(() => { screenOverlay.style.opacity = 0; }, 1000);

        if (gameState.currentMonsterHP <= 0) defeatMonster();
    } else if (skillData.duration > 0) {
        gameState.activeSkills[id] = skillData.effect;

        if (id === 'gold-rush') {
            screenOverlay.className = 'screen-effect-overlay gold-rush';
            screenOverlay.style.opacity = 1;
            if(activeParticleInterval) clearInterval(activeParticleInterval);
            activeParticleInterval = setInterval(() => createParticle('💰'), 200);
        } else if (id === 'rage-mode') {
            screenOverlay.className = 'screen-effect-overlay rage-mode';
            screenOverlay.style.opacity = 1;
        }

        setTimeout(() => {
            delete gameState.activeSkills[id];
            if (id === 'gold-rush') {
                if(activeParticleInterval) clearInterval(activeParticleInterval);
                activeParticleInterval = null;
                const particleContainer = document.getElementById('particle-container');
                if (particleContainer) particleContainer.innerHTML = '';
            }
            screenOverlay.style.opacity = 0;
        }, skillData.duration * 1000);
    }

    gameState.skillCooldowns[id] = skillData.cooldown;
    updateUI();
    saveGame();
}

function pauseGame() {
    isPaused = true;
    document.getElementById('pause-menu').style.display = 'flex';
}

function resumeGame() {
    isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
}

function activateSkillFromSlot(slotIndex) {
    const skillId = gameState.skillSlots[slotIndex];
    if (skillId) {
        useSkill(skillId);
    }
}

function handleKeyPress(event) {
    if (isPaused) return;
    const keyMap = { '1': 0, '2': 1, '3': 2 };
    const slotIndex = keyMap[event.key];
    if (slotIndex !== undefined) {
        activateSkillFromSlot(slotIndex);
    }
}

document.getElementById('pause-button').addEventListener('click', () => {
     isPaused = !isPaused;
     if(isPaused) pauseGame();
     else resumeGame();
});

showSubTab('click-upgrades');
showTab('upgrade');
initGame();
