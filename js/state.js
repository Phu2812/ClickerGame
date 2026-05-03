let gameState = {
    gold: 0,
    gems: 0,
    level: 1,
    currentMonsterHP: 0,
    maxMonsterHP: 1,
    damagePerClick: 1,
    dps: 0,
    upgrades: {},
    gemUpgrades: {},
    albums: {},
    skills: {},
    skillCooldowns: {},
    activeSkills: {},
    skillSlots: [null, null, null],
    dot: {
        playerFire: { active: false, remainingTime: 0, damage: 0, interval: null },
        playerPoison: { active: false, remainingTime: 0, damage: 0, interval: null },
        mage: { active: false, remainingTime: 0, damage: 0, interval: null }
    },
    monsterStatus: {
        frozen: false,
        dpsBuff: 0,
        freezeTimeout: null,
        immuneToFreeze: false
    }
};

function saveGame() {
    try {
        localStorage.setItem('clickerQuestSave', JSON.stringify(gameState));
    } catch (e) {
        console.error("Could not save game to localStorage: ", e);
    }
}

function loadGame() {
    const savedState = localStorage.getItem('clickerQuestSave');
    if (savedState) {
        const loaded = JSON.parse(savedState);
        Object.keys(gameState).forEach(key => {
            if (loaded[key] !== undefined) {
                if (typeof gameState[key] === 'object' && gameState[key] !== null && !Array.isArray(gameState[key])) {
                    Object.assign(gameState[key], loaded[key]);
                } else {
                    gameState[key] = loaded[key];
                }
            }
        });
    }
}

function exportSaveData() {
    navigator.clipboard.writeText(JSON.stringify(gameState)).then(() => {
        if(typeof showNotification === 'function') showNotification("Đã sao chép dữ liệu game vào clipboard!", "success");
    }).catch(err => {
        if(typeof showNotification === 'function') showNotification("Lỗi khi sao chép!", "error");
    });
}

function importSaveData() {
    const data = prompt("Dán dữ liệu game của bạn vào đây:");
    if (data) {
        try {
            const importedState = JSON.parse(data);
            if (typeof importedState.gold !== 'number' || typeof importedState.level !== 'number') {
                 throw new Error("Invalid save data format.");
            }
            Object.assign(gameState, importedState);
            saveGame();
            if(typeof showNotification === 'function') showNotification("Dữ liệu đã được nhập thành công! Tải lại trang...", "success");
            setTimeout(() => location.reload(), 2000);
        } catch (e) {
            if(typeof showNotification === 'function') showNotification(`Dữ liệu không hợp lệ!`, "error");
        }
    }
}

function recalculateStats() {
    const gemClickLevel = gameState.gemUpgrades['gem-click-damage']?.level || 0;
    const gemClickBonus = gemClickLevel * (findGemUpgradeData('gem-click-damage')?.effect || 0);
    
    const powerClickLevel = gameState.upgrades['power-click']?.level || 0;
    let baseClickDamage = (1 + powerClickLevel) * (1 + gemClickBonus);
    gameState.damagePerClick = baseClickDamage;
}

function findUpgradeData(id) {
    for (const type in GAME_DATA.upgrades) {
        const upgrade = GAME_DATA.upgrades[type].find(u => u.id === id);
        if (upgrade) return upgrade;
    }
    return null;
}

function findGemUpgradeData(id) {
    return GAME_DATA.gemUpgrades.find(u => u.id === id);
}
