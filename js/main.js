let activeParticleInterval = null;

// ============================================================
// AUTH / LOGIN FLOW
// ============================================================

async function startApp() {
    // If a session was saved locally, try to restore data from Firestore
    if (checkAutoLogin()) {
        try {
            // Show a subtle loading indicator on the login screen
            const btn = document.getElementById('btn-login');
            if (btn) { btn.textContent = 'Đang kết nối...'; btn.disabled = true; }

            const cloudData = await cloudAutoLogin(currentUser);
            // cloudAutoLogin returns null on network error → falls back to loadGame()
            await initGame(cloudData);
            hideLoginScreen();
            return;
        } catch (e) {
            // Session invalid (account deleted, etc.) — clear and show login
            clearSession();
        }
    }
    // Default: show login screen, focus username field
    document.getElementById('username-input').focus();
}


function hideLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.opacity = '0';
    loginScreen.style.pointerEvents = 'none';
    setTimeout(() => loginScreen.style.display = 'none', 500);

    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('hidden');
    gameScreen.style.opacity = '0';
    setTimeout(() => gameScreen.style.opacity = '1', 50);
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;
    const remember = document.getElementById('remember-me').checked;
    const errorEl = document.getElementById('auth-error');
    const btnLogin = document.getElementById('btn-login');

    errorEl.classList.add('hidden');
    btnLogin.textContent = 'Đang đăng nhập...';
    btnLogin.disabled = true;

    try {
        const cloudData = await cloudLogin(username, password);
        if (remember) saveSession(username);
        await initGame(cloudData);
        hideLoginScreen();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btnLogin.textContent = 'Đăng nhập';
        btnLogin.disabled = false;
    }
}

async function handleAuthRegister() {
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;
    const remember = document.getElementById('remember-me').checked;
    const errorEl = document.getElementById('auth-error');
    const btnRegister = document.getElementById('btn-register');

    errorEl.classList.add('hidden');
    btnRegister.textContent = 'Đang tạo...';
    btnRegister.disabled = true;

    try {
        await cloudRegister(username, password);
        if (remember) saveSession(username);
        await initGame(null); // null = fresh state
        hideLoginScreen();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btnRegister.textContent = 'Đăng ký';
        btnRegister.disabled = false;
    }
}

async function playOffline() {
    await initGame(null);
    hideLoginScreen();
}

// ============================================================
// CLOUD SYNC — Only fires on tab hide / tab close
// ============================================================
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && currentUser) {
        cloudSync(gameState);
    }
});

window.addEventListener('beforeunload', () => {
    if (currentUser) cloudSync(gameState);
});

// ============================================================
// DATA LOADING
// ============================================================
async function loadAlbumsData() {
    try {
        const response = await fetch(`images.json?t=${Date.now()}`);
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

// ============================================================
// GAME INIT
// ============================================================
async function initGame(cloudData) {
    await loadAlbumsData();

    // If cloudData exists (returning user), restore it; otherwise load local save
    if (cloudData) {
        Object.assign(gameState, cloudData);
    } else {
        loadGame();
    }
    
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
    filterAlbums('all');
    startDpsTimers();
    startSkillCooldownTimer();
    
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('zoom-popup').style.display = 'none';
    const equipModal = document.getElementById('equip-skill-modal');
    if (equipModal) equipModal.style.display = 'none';

    document.addEventListener('keydown', handleKeyPress);

    showSubTab('click-upgrades');
    showTab('upgrade');
}

// ============================================================
// GAMEPLAY ACTIONS
// ============================================================
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
        renderAlbums();
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

// ============================================================
// BOOTSTRAP
// ============================================================
startApp();
