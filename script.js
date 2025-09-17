// Game data and state
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

const GAME_DATA = {
    monsters: [
        { name: "Slime", icon: "fa-solid fa-ghost", biome: "Rừng" },
        { name: "Goblin", icon: "fa-solid fa-user-secret", biome: "Rừng" },
        { name: "Bat", icon: "fa-solid fa-spider", biome: "Rừng" },
        { name: "Skeleton", icon: "fa-solid fa-bone", biome: "Hang động" },
        { name: "Bug", icon: "fa-solid fa-bug", biome: "Hang động" },
        { name: "Orc", icon: "fa-solid fa-mask", biome: "Hang động" },
        { name: "Demon", icon: "fa-solid fa-skull", biome: "Núi lửa" },
        { name: "Salamander", icon: "fa-solid fa-dragon", biome: "Núi lửa" },
        { name: "Mini Dragon", icon: "fa-solid fa-crow", biome: "Núi lửa" },
        { name: "Robot", icon: "fa-solid fa-robot", biome: "Thành phố bỏ hoang" },
        { name: "Mutant", icon: "fa-solid fa-dna", biome: "Thành phố bỏ hoang" },
        { name: "Golem", icon: "fa-solid fa-mountain", biome: "Thành phố bỏ hoang" },
        { name: "Shadow Beast", icon: "fa-solid fa-eye", biome: "Vùng hư vô" },
        { name: "Void Dragon", icon: "fa-solid fa-meteor", biome: "Vùng hư vô" },
    ],
    bosses: [
        { name: "King Slime", icon: "fa-solid fa-crown", biome: "Rừng" },
        { name: "Undead King", icon: "fa-solid fa-skull-crossbones", biome: "Hang động" },
        { name: "Volcano Titan", icon: "fa-solid fa-fire-extinguisher", biome: "Núi lửa" },
        { name: "Cybernetic Warlord", icon: "fa-solid fa-gears", biome: "Thành phố bỏ hoang" },
        { name: "Cosmic Devourer", icon: "fa-solid fa-galaxy", biome: "Vùng hư vô" },
    ],
    upgrades: {
        click: [
            { id: 'power-click', name: "Power Click", description: "Tăng sát thương mỗi click.", cost: 10, type: "click", maxLevel: Infinity, icon: "fa-solid fa-hand-pointer", category: "pure" },
            { id: 'critical-chance', name: "Critical Chance", description: "Tăng tỉ lệ gây sát thương chí mạng.", cost: 25, type: "click", maxLevel: 100, icon: "fa-solid fa-crosshairs", category: "pure" },
            { id: 'critical-damage', name: "Critical Damage", description: "Tăng sát thương khi chí mạng.", cost: 50, type: "click", maxLevel: Infinity, icon: "fa-solid fa-bolt", category: "pure" },
            { id: 'double-tap', name: "Double Tap", description: "Tỉ lệ tấn công 2 lần mỗi khi click.", cost: 75, type: "click", maxLevel: 20, icon: "fa-solid fa-2", category: "pure" },
            { 
                id: 'fire-click', name: "Fire Element", 
                description: "Phủ ngọn lửa ma thuật lên đòn đánh. Gây sát thương thiêu đốt liên tục, sức nóng tăng tiến theo sát thương đòn đánh và level của bạn.", 
                cost: 200, 
                damageRatio: 0.5, damageScale: 0.1, tickInterval: 500, duration: 3, type: "click", maxLevel: 5,
                icon: "fa-solid fa-fire", category: "elemental"
            },
            { 
                id: 'poison-click', name: "Poison Element", 
                description: "Sử dụng chất độc ăn mòn. Gây sát thương độc tố dựa trên phần trăm máu tối đa của kẻ địch, cực kỳ hiệu quả với những mục tiêu trâu bò.", 
                cost: 250, 
                damageRatio: 0.01, damageScale: 0.002, tickInterval: 1000, duration: 5, type: "click", maxLevel: 6,
                icon: "fa-solid fa-skull-crossbones", category: "elemental"
            },
            { 
                id: 'lightning-click', name: "Lightning Element", 
                description: "Tích tụ năng lượng bão tố. Mỗi đòn đánh có 15% tỉ lệ triệu hồi một cơn mưa sét. Càng ở level cao, cơn bão càng lớn với nhiều tia sét hơn.", 
                cost: 200, 
                damageRatio: 0.8, minHits: [1, 2, 3, 4, 5], maxHits: 5, type: "click", maxLevel: 5,
                icon: "fa-solid fa-bolt-lightning", category: "elemental"
            },
            {
                id: 'ice-click', name: "Ice Element", 
                description: "Tụ hợp khí lạnh. Đòn đánh có tỉ lệ đóng băng kẻ địch trong 5 giây, khiến chúng trở nên脆弱. Toàn bộ đồng minh DPS sẽ gây sát thương cộng thêm cực lớn lên mục tiêu bị đóng băng.", 
                cost: 300,
                effects: [
                    { chance: 0.20, buff: 0.15, duration: 5 }, { chance: 0.35, buff: 0.15, duration: 5 }, 
                    { chance: 0.50, buff: 0.15, duration: 5 }, { chance: 0.50, buff: 0.30, duration: 5 }, 
                    { chance: 0.50, buff: 0.45, duration: 5 }, 
                ], type: "click", maxLevel: 5, icon: "fa-solid fa-snowflake", category: "elemental"
            }
        ],
        dps: [
            { 
                id: 'swordsman', name: "Hiệp sĩ", description: "Sát thương ổn định, toàn diện.", cost: 15, type: "dps", 
                attackSpeed: 1000, icon: "⚔️", color: "damage-number-swordsman", upgradeIcon: "fa-solid fa-shield-halved", maxLevel: 10,
                levelStats: [
                    { level: 1, damage: 15 }, { level: 2, damage: 25 }, { level: 3, damage: 38 }, { level: 4, damage: 55 }, { level: 5, damage: 75 },
                    { level: 6, damage: 100 }, { level: 7, damage: 135 }, { level: 8, damage: 180 }, { level: 9, damage: 240 }, { level: 10, damage: 300 },
                ]
            },
            { 
                id: 'mage', name: "Pháp sư", description: "Gây sát thương đốt cực mạnh theo thời gian.", cost: 30, type: "dps",
                attackSpeed: 1500, icon: "🧙‍♂️", color: "damage-number-mage", upgradeIcon: "fa-solid fa-hat-wizard", maxLevel: 10,
                levelStats: [
                    { level: 1, damage: 5, dotMultiplier: 0.3 }, { level: 2, damage: 7, dotMultiplier: 0.4 }, { level: 3, damage: 9, dotMultiplier: 0.5 }, 
                    { level: 4, damage: 11, dotMultiplier: 0.6 }, { level: 5, damage: 13, dotMultiplier: 0.75 }, { level: 6, damage: 15, dotMultiplier: 0.9 }, 
                    { level: 7, damage: 17, dotMultiplier: 1.1 }, { level: 8, damage: 19, dotMultiplier: 1.3 }, { level: 9, damage: 21, dotMultiplier: 1.5 }, 
                    { level: 10, damage: 25, dotMultiplier: 1.8 },
                ]
            },
            { 
                id: 'archer', name: "Cung thủ", description: "Tốc độ tấn công tăng theo level người chơi.", cost: 25, type: "dps", 
                attackSpeed: 500, icon: "🏹", color: "damage-number-archer", upgradeIcon: "fa-solid fa-bullseye", maxLevel: 10,
                levelStats: [
                    { level: 1, damage: 8 }, { level: 2, damage: 13 }, { level: 3, damage: 20 }, { level: 4, damage: 29 }, { level: 5, damage: 40 },
                    { level: 6, damage: 55 }, { level: 7, damage: 75 }, { level: 8, damage: 100 }, { level: 9, damage: 135 }, { level: 10, damage: 180 },
                ]
            },
            { 
                id: 'treasure-hunter', name: "Thợ săn tiền thưởng", description: "Mỗi đòn đánh có cơ hội rơi ra Vàng bằng 10% sát thương gây ra.", cost: 50, type: "dps",
                attackSpeed: 800, icon: "🗡️", color: "damage-number-hunter", upgradeIcon: "fa-solid fa-sack-dollar", maxLevel: 10,
                levelStats: [
                    { level: 1, damage: 5 }, { level: 2, damage: 8 },
                    { level: 3, damage: 12 }, { level: 4, damage: 17 },
                    { level: 5, damage: 23 }, { level: 6, damage: 30 },
                    { level: 7, damage: 40 }, { level: 8, damage: 55 },
                    { level: 9, damage: 75 }, { level: 10, damage: 100 },
                ]
            },
            { 
                id: 'pet', name: "Pet", description: "Buff cực mạnh cho đồng đội ở cấp cao.", cost: 100, type: "dps", maxLevel: 5,
                attackSpeed: 2000, icon: "🐲", color: "damage-number-pet", upgradeIcon: "fa-solid fa-dragon",
                levelStats: [
                    { level: 1, damage: 20, buff: { damage: 0.1, attackSpeed: 0.05 } },
                    { level: 2, damage: 40, buff: { damage: 0.15, attackSpeed: 0.08 } },
                    { level: 3, damage: 70, buff: { damage: 0.25, attackSpeed: 0.12 } },
                    { level: 4, damage: 120, buff: { damage: 0.4, attackSpeed: 0.18 } },
                    { level: 5, damage: 200, buff: { damage: 0.6, attackSpeed: 0.25 } },
                ]
            },
        ],
        economy: [
            { id: 'gold-multiplier', name: "Gold Multiplier", description: "Tăng % vàng rơi", cost: 20, effect: 0.05, type: "economy", maxLevel: 10, icon: "fa-solid fa-percent" },
            { id: 'boss-loot', name: "Boss Loot", description: "Tăng lượng Gem nhận được khi đánh bại boss.", cost: 1500, effect: 1, type: "economy", maxLevel: 3, icon: "fa-solid fa-gem" },
            { id: 'treasure-hunter-eco', name: "Treasure Hunter", description: "Tăng rơi vàng hiếm", cost: 150, effect: 1, type: "economy", maxLevel: Infinity, icon: "fa-solid fa-treasure-chest" },
        ],
        skill: [
            { id: 'firestorm', name: "Firestorm", description: "Gây sát thương cực lớn bằng 50% máu tối đa của mục tiêu.", cost: 500, effect: 1, type: "skill", cooldown: 60, duration: 0, maxLevel: Infinity, icon: "fa-solid fa-fire" },
            { id: 'gold-rush', name: "Gold Rush", description: "Nhân đôi lượng vàng nhận được trong 10 giây.", cost: 1000, effect: 2, type: "skill", cooldown: 120, duration: 10, maxLevel: Infinity, icon: "fa-solid fa-coins" },
            { id: 'rage-mode', name: "Rage Mode", description: "Tăng 5 lần sát thương đòn đánh trong 15 giây.", cost: 2000, effect: 5, type: "skill", cooldown: 90, duration: 15, maxLevel: Infinity, icon: "fa-solid fa-burst" },
        ]
    },
     gemUpgrades: [
        { id: 'gem-click-damage', name: "Click Damage Boost", description: "Tăng % tổng sát thương click", cost: 1, effect: 0.05, type: "gem", icon: "fa-solid fa-hand-pointer" },
        { id: 'gem-dps-damage', name: "DPS Damage Boost", description: "Tăng % tổng sát thương DPS", cost: 1, effect: 0.1, type: "gem", icon: "fa-solid fa-users" },
        { id: 'gem-skill-damage', name: "Skill Damage Boost", description: "Tăng % tổng sát thương kỹ năng", cost: 1, effect: 0.05, type: "gem", icon: "fa-solid fa-star" },
    ],
    albums: [] 
};

// DOM elements
let isPaused = false;
let dpsIntervals = {};
let skillCooldownInterval = null;
let monsterContainerRect;

// --- Game Logic ---

// ĐOẠN MÃ MỚI (thay thế cho toàn bộ hàm initGame cũ)
async function initGame() {
    // Chuyển tất cả các khai báo DOM element vào đây để đảm bảo HTML đã sẵn sàng
    const gameScreen = document.getElementById('game-screen');
    const pauseMenu = document.getElementById('pause-menu');
    const zoomPopup = document.getElementById('zoom-popup');
    const monsterIcon = document.getElementById('monster-icon');
    const healthBarFill = document.getElementById('health-bar-fill');
    const hpText = document.getElementById('hp-text');
    const monsterName = document.getElementById('monster-name');
    const levelDisplay = document.getElementById('level-display');
    const goldDisplay = document.getElementById('gold-display');
    const gemDisplay = document.getElementById('gem-display');
    const clickDamageDisplay = document.getElementById('click-damage-display');
    const clickUpgradesContainer = document.getElementById('click-upgrades');
    const dpsUpgradesContainer = document.getElementById('dps-upgrades');
    const economyUpgradesContainer = document.getElementById('economy-upgrades');
    const skillUpgradesContainer = document.getElementById('skill-upgrades');
    const albumGrid = document.getElementById('album-grid');
    const gemUpgradesContainer = document.getElementById('gem-upgrades-container');
    const screenOverlay = document.getElementById('screen-overlay');
    const particleContainer = document.getElementById('particle-container');
    const equipSkillModal = document.getElementById('equip-skill-modal');

    // Gán giá trị cho monsterContainerRect ngay sau khi có DOM element
    monsterContainerRect = document.getElementById('monster-container').getBoundingClientRect();

    await loadAlbumsData();
    loadGame();
    
    // Khởi tạo các nâng cấp (giữ nguyên)
    GAME_DATA.upgrades.click.forEach(item => { if (!gameState.upgrades[item.id]) gameState.upgrades[item.id] = { level: 0 }; });
    GAME_DATA.upgrades.dps.forEach(item => { if (!gameState.upgrades[item.id]) gameState.upgrades[item.id] = { level: 0 }; });
    GAME_DATA.upgrades.economy.forEach(item => { if (!gameState.upgrades[item.id]) gameState.upgrades[item.id] = { level: 0 }; });
    GAME_DATA.upgrades.skill.forEach(item => { if (!gameState.upgrades[item.id]) gameState.upgrades[item.id] = { level: 0 }; });
    if (!gameState.gemUpgrades) gameState.gemUpgrades = {};
    GAME_DATA.gemUpgrades.forEach(item => { if (!gameState.gemUpgrades[item.id]) gameState.gemUpgrades[item.id] = { level: 0 }; });
    if (!gameState.albums) gameState.albums = {};
    GAME_DATA.albums.forEach(item => { if (!gameState.albums[item.id]) gameState.albums[item.id] = { unlocked: false }; });

    recalculateStats();
    generateMonster();
    
    // Chạy các hàm timer SAU KHI mọi thứ đã được tính toán
    startDpsTimers();
    startSkillCooldownTimer();
    
    // Cập nhật giao diện lần cuối
    updateUI(); 
    
    // Ẩn các menu popup
    pauseMenu.style.display = 'none';
    if(zoomPopup) zoomPopup.style.display = 'none';
    if (equipModal) equipModal.style.display = 'none';
    
    gameScreen.style.display = 'flex';
    
    document.addEventListener('keydown', handleKeyPress);
}

async function loadAlbumsData() {
    try {
        const response = await fetch('images.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        GAME_DATA.albums = await response.json();
    } catch (error) {
        console.error("Could not load images.json:", error);
        GAME_DATA.albums = [];
    }
}

function handleMonsterClick(event) {
    if (isPaused) return;

    let baseDamage = gameState.damagePerClick;
    
    if (gameState.activeSkills['rage-mode']) {
        baseDamage *= gameState.activeSkills['rage-mode'];
    }
    
    const doubleTapLevel = gameState.upgrades['double-tap']?.level || 0;
    const doubleTapChance = (findUpgradeData('double-tap')?.effect || 0) * doubleTapLevel;

    let hits = 1;
    if (Math.random() < doubleTapChance) {
        hits = 2;
    }
    
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
        if (fireLevel > 0) {
            applyDot('playerFire', currentDamage, fireLevel);
        }

        const poisonLevel = gameState.upgrades['poison-click']?.level || 0;
        if (poisonLevel > 0) {
            applyDot('playerPoison', currentDamage, poisonLevel);
        }

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
                monsterIcon.classList.add('monster-frozen');

                gameState.monsterStatus.immuneToFreeze = true;
                setTimeout(() => {
                    gameState.monsterStatus.immuneToFreeze = false;
                }, 15000);

                if (gameState.monsterStatus.freezeTimeout) clearTimeout(gameState.monsterStatus.freezeTimeout);
                
                gameState.monsterStatus.freezeTimeout = setTimeout(() => {
                    gameState.monsterStatus.frozen = false;
                    gameState.monsterStatus.dpsBuff = 0;
                    monsterIcon.classList.remove('monster-frozen');
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
        goldReward *= gameState.activeSkills['gold-rush'];
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
    monsterIcon.classList.remove('monster-frozen');


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
    
    monsterIcon.className = '';
    monsterIcon.classList.add(isBossLevel ? 'boss-icon' : 'monster-icon', ...monster.icon.split(' '));
    monsterName.textContent = monster.name;
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
    if (!albumData || (gameState.albums[id] && gameState.albums[id].unlocked)) return;

    if (gameState.gold >= albumData.cost) {
        gameState.gold -= albumData.cost;
        if (!gameState.albums[id]) {
            gameState.albums[id] = {};
        }
        gameState.albums[id].unlocked = true;
        
        updateUI();
        renderAlbums();
        saveGame();
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

    if (id === 'firestorm') {
        let totalDamage = gameState.maxMonsterHP * 0.5;
        totalDamage *= gemSkillBonus;
        gameState.currentMonsterHP -= Math.round(totalDamage);
        if (monsterContainerRect) {
            displayDamageNumber(monsterContainerRect.left + monsterContainerRect.width / 2, monsterContainerRect.top + monsterContainerRect.height / 2, Math.round(totalDamage), 'skill');
        }
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
                if(particleContainer) particleContainer.innerHTML = '';
            }
           if(screenOverlay) screenOverlay.style.opacity = 0;
        }, skillData.duration * 1000);
    }

    gameState.skillCooldowns[id] = skillData.cooldown;
    updateUI();
    saveGame();
}

function recalculateStats() {
    const gemClickLevel = gameState.gemUpgrades['gem-click-damage']?.level || 0;
    const gemClickBonus = gemClickLevel * (findGemUpgradeData('gem-click-damage')?.effect || 0);
    
    const powerClickLevel = gameState.upgrades['power-click']?.level || 0;
    let baseClickDamage = (1 + powerClickLevel) * (1 + gemClickBonus);
    gameState.damagePerClick = baseClickDamage;
}


// --- UI Functions ---

function updateUI() {
    goldDisplay.textContent = `💰 ${Math.round(gameState.gold).toLocaleString()} Vàng`;
    gemDisplay.textContent = `💎 ${gameState.gems.toLocaleString()} Gems`;
    levelDisplay.textContent = `Level ${gameState.level}`;
    clickDamageDisplay.textContent = `🖱️ Click DMG: ${Math.round(gameState.damagePerClick).toLocaleString()}`;
    
    const hpPercentage = (gameState.currentMonsterHP / gameState.maxMonsterHP) * 100;
    healthBarFill.style.width = `${Math.max(0, hpPercentage)}%`;
    hpText.textContent = `${Math.max(0, Math.round(gameState.currentMonsterHP)).toLocaleString()} / ${Math.round(gameState.maxMonsterHP).toLocaleString()}`;

    renderUpgrades();
    renderGemUpgrades();
    renderSkillBar();
}

function renderUpgrades() {
    const containers = {
        'click': clickUpgradesContainer,
        'dps': dpsUpgradesContainer,
        'economy': economyUpgradesContainer,
        'skill': skillUpgradesContainer,
    };

    for (const type in containers) {
        if(containers[type]) {
            containers[type].innerHTML = '';
            if (type === 'click') {
                containers[type].innerHTML += `<h2 class="col-span-1 md:col-span-2 text-xl font-bold text-indigo-300 border-b-2 border-indigo-500 pb-2 mb-4">Click Thuần</h2>`;
                GAME_DATA.upgrades.click.filter(u => u.category === 'pure').forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
                
                containers[type].innerHTML += `<h2 class="col-span-1 md:col-span-2 text-xl font-bold text-indigo-300 border-b-2 border-indigo-500 pb-2 mb-4 mt-6">Nguyên Tố</h2>`;
                GAME_DATA.upgrades.click.filter(u => u.category === 'elemental').forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
            } else {
                GAME_DATA.upgrades[type].forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
            }
        }
    }
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

function renderUpgradeCard(upgrade, container) {
    const type = upgrade.type;
    const currentLevel = gameState.upgrades[upgrade.id]?.level || 0;
    const maxLevel = upgrade.maxLevel || Infinity;
    const isMaxLevel = currentLevel >= maxLevel;
    const currentCost = Math.round(upgrade.cost * Math.pow(1.5, currentLevel));
    const canAfford = gameState.gold >= currentCost && !isMaxLevel;
    const buttonClass = canAfford ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 cursor-not-allowed';
    
    let description = upgrade.description;
    let extraInfo = '';
    let levelDisplay = `Cấp: ${currentLevel}`;
    if (maxLevel !== Infinity) {
        levelDisplay = `Cấp: ${currentLevel} / ${maxLevel}`;
    }
    let nextLevelInfo = '';

    if (type === 'dps') {
        const petLevel = gameState.upgrades['pet']?.level || 0;
        let petBuffDamage = 0;
        if (petLevel > 0) {
            const petData = findUpgradeData('pet');
            if (petData) {
                const petStats = petData.levelStats[petLevel - 1];
                petBuffDamage = petStats.buff.damage;
            }
        }
        const gemDpsLevel = gameState.gemUpgrades['gem-dps-damage']?.level || 0;
        const gemDpsBonus = 1 + (gemDpsLevel * (findGemUpgradeData('gem-dps-damage')?.effect || 0));

        if (currentLevel > 0) {
            const currentStats = upgrade.levelStats[currentLevel - 1];
            let baseDmg = calculateDpsDamage(upgrade, currentLevel, currentStats);
            let finalDmg = baseDmg;
            if (upgrade.id !== 'pet') finalDmg *= (1 + petBuffDamage);
            finalDmg *= gemDpsBonus;
            extraInfo += `<p class="text-sm text-gray-400">Chỉ số hiện tại: ${Math.round(finalDmg).toLocaleString()} sát thương</p>`;
        }
        if (!isMaxLevel) {
            const nextStats = upgrade.levelStats[currentLevel];
            let nextBaseDmg = calculateDpsDamage(upgrade, currentLevel + 1, nextStats);
            let nextFinalDmg = nextBaseDmg;
            if (upgrade.id !== 'pet') nextFinalDmg *= (1 + petBuffDamage);
            nextFinalDmg *= gemDpsBonus;
            nextLevelInfo = `Cấp tiếp theo: ${Math.round(nextFinalDmg).toLocaleString()} sát thương`;
        }
    } else {
         switch (upgrade.id) {
            case 'power-click':
                levelDisplay = `Cấp: ${currentLevel}`;
                if (currentLevel > 0) extraInfo = `<p class="text-sm text-gray-400">Bonus hiện tại: +${currentLevel.toLocaleString()} DMG</p>`;
                nextLevelInfo = `Cấp tiếp theo: +${(currentLevel + 1).toLocaleString()} DMG`;
                break;
            case 'critical-chance':
                extraInfo = `<p class="text-sm text-gray-400">Tỉ lệ hiện tại: ${currentLevel}%</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Cấp tiếp theo: ${currentLevel + 1}%`;
                break;
            case 'critical-damage':
                levelDisplay = `Cấp: ${currentLevel}`;
                extraInfo = `<p class="text-sm text-gray-400">Sát thương chí mạng: ${200 + currentLevel * 10}%</p>`;
                nextLevelInfo = `Cấp tiếp theo: ${200 + (currentLevel + 1) * 10}%`;
                break;
            case 'double-tap':
                extraInfo = `<p class="text-sm text-gray-400">Tỉ lệ hiện tại: ${currentLevel * 5}%</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Cấp tiếp theo: ${ (currentLevel + 1) * 5}%`;
                break;
            case 'fire-click':
                if (currentLevel > 0) {
                    const currentMultiplier = (upgrade.damageRatio + (currentLevel - 1) * upgrade.damageScale) * 100;
                    extraInfo = `<p class="text-sm text-gray-400">Hệ số đốt hiện tại: ${currentMultiplier.toFixed(0)}%</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: Gây hiệu ứng đốt ${(upgrade.damageRatio * 100).toFixed(0)}% DMG/tick`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    nextLevelInfo = `Cấp tiếp theo: ${((upgrade.damageRatio + currentLevel * upgrade.damageScale) * 100).toFixed(0)}%`;
                } else if(isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'poison-click':
                if (currentLevel > 0) {
                    const currentDmg = ((upgrade.damageRatio + (currentLevel - 1) * upgrade.damageScale) * 100).toFixed(1);
                    extraInfo = `<p class="text-sm text-gray-400">Sát thương độc: ${currentDmg}% HP/giây</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: Gây độc ${(upgrade.damageRatio * 100).toFixed(1)}% HP tối đa/giây`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    const nextDmg = ((upgrade.damageRatio + currentLevel * upgrade.damageScale) * 100).toFixed(1);
                    nextLevelInfo = `Cấp tiếp theo: ${nextDmg}% HP/giây`;
                } else if(isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'lightning-click':
                const maxHits = 5 + Math.floor(gameState.level / 50);
                if (currentLevel > 0) {
                    extraInfo = `<p class="text-sm text-gray-400">Số đòn đánh: ${upgrade.minHits[currentLevel - 1]}-${maxHits}</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: Tạo ra ${upgrade.minHits[0]}-${maxHits} tia sét.`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    nextLevelInfo = `Cấp tiếp theo: ${upgrade.minHits[currentLevel]}-${maxHits} đòn`;
                } else if (isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'ice-click':
                if (currentLevel > 0) {
                    const effect = upgrade.effects[currentLevel - 1];
                    extraInfo = `<p class="text-sm text-gray-400">Hiện tại: ${effect.chance*100}% tỉ lệ, +${effect.buff*100}% buff</p>`;
                } else {
                    const nextEffect = upgrade.effects[0];
                    nextLevelInfo = `Mở khóa: ${nextEffect.chance*100}% tỉ lệ đóng băng, +${nextEffect.buff*100}% buff DPS.`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                   const nextEffect = upgrade.effects[currentLevel];
                   nextLevelInfo = `Cấp tiếp theo: ${nextEffect.chance*100}% tỉ lệ, +${nextEffect.buff*100}% buff`;
                } else if(isMaxLevel) { 
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'gold-multiplier':
                extraInfo = `<p class="text-sm text-gray-400">Bonus hiện tại: +${currentLevel * 5}% vàng</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Tiếp theo: +${(currentLevel + 1) * 5}%`;
                break;
            case 'boss-loot':
                extraInfo = `<p class="text-sm text-gray-400">Gem nhận thêm: +${currentLevel}</p>`;
                nextLevelInfo = isMaxLevel ? 'Đã đạt cấp tối đa' : `Cấp tiếp theo: +${currentLevel + 1} gem`;
                break;
            case 'treasure-hunter-eco':
                levelDisplay = `Cấp: ${currentLevel}`;
                extraInfo = `<p class="text-sm text-gray-400">Hệ số vàng: x${(1 + currentLevel * 0.1).toFixed(1)}</p>`;
                nextLevelInfo = `Cấp tiếp theo: x${(1 + (currentLevel + 1) * 0.1).toFixed(1)}`;
                break;
        }
    }

    if (type === 'skill') {
        const cooldownLeft = gameState.skillCooldowns[upgrade.id] || 0;
        const buttonText = currentLevel > 0 ? 'Trang bị' : `Mở khóa (💰 ${currentCost.toLocaleString()})`;
        const canBuyOrEquip = (currentLevel > 0) || (currentLevel === 0 && canAfford);
        const buttonSkillClass = canBuyOrEquip ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 cursor-not-allowed';

        container.innerHTML += `
            <div class="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 relative">
                <div class="flex-shrink-0 text-indigo-400 text-4xl w-16 text-center"><i class="${upgrade.icon}"></i></div>
                <div class="flex-grow text-center md:text-left">
                    <h3 class="font-bold text-lg text-indigo-400">${upgrade.name}</h3>
                    <p class="text-sm text-gray-400">${description}</p>
                    <p class="text-sm mt-1">${levelDisplay}</p>
                </div>
                <div class="flex-shrink-0 w-full md:w-48">
                     <button class="w-full p-3 rounded-md ${buttonSkillClass} font-bold" 
                             onclick="${currentLevel > 0 ? `openEquipModal('${upgrade.id}')` : `buyUpgrade('${upgrade.id}')`}" 
                             ${!canBuyOrEquip ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            </div>`;
    } else {
        const iconHtml = upgrade.upgradeIcon ? `<i class="${upgrade.upgradeIcon} mr-2"></i>` : (upgrade.icon ? `<i class="${upgrade.icon} mr-2"></i>` : '');
        let costText = `💰 ${currentCost.toLocaleString()}`;
        let buttonText = 'Nâng cấp';
        if (currentLevel === 0) {
            buttonText = 'Mở khóa';
        }
        if (isMaxLevel) {
            costText = 'Đã đạt tối đa';
            buttonText = 'Tối đa';
            nextLevelInfo = ''; 
        }

        container.innerHTML += `
            <div class="bg-gray-800 p-4 rounded-lg flex flex-col justify-between h-full">
                <div>
                    <h3 class="font-bold text-lg text-indigo-400">${iconHtml}${upgrade.name}</h3>
                    <p class="text-sm text-gray-400 mt-1">${description}</p>
                    <div class="mt-2 space-y-1">
                        <p class="text-sm text-gray-200">${levelDisplay}</p>
                        ${extraInfo}
                        <p class="text-sm text-yellow-300">${nextLevelInfo}</p>
                    </div>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-yellow-400 text-sm font-bold">${costText}</span>
                    <button class="p-2 rounded-md ${buttonClass}" onclick="buyUpgrade('${upgrade.id}')" ${canAfford ? '' : 'disabled'}>${buttonText}</button>
                </div>
            </div>`;
    }
}

function renderGemUpgrades() {
    if(!gemUpgradesContainer) return;
    gemUpgradesContainer.innerHTML = '';
    GAME_DATA.gemUpgrades.forEach(upgrade => {
        const currentLevel = gameState.gemUpgrades[upgrade.id]?.level || 0;
        const currentCost = upgrade.cost + currentLevel;
        const canAfford = gameState.gems >= currentCost;
        const buttonClass = canAfford ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-700 cursor-not-allowed';
        
        let bonus = upgrade.effect * 100;
        const currentBonus = (currentLevel * bonus).toFixed(1);
        const nextBonus = ((currentLevel + 1) * bonus).toFixed(1);

        gemUpgradesContainer.innerHTML += `
            <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <div class="text-cyan-400 text-4xl w-16 text-center">
                    <i class="${upgrade.icon}"></i>
                </div>
                <div class="flex-grow">
                    <h3 class="font-bold text-lg text-cyan-300">${upgrade.name}</h3>
                    <p class="text-sm text-gray-300">${upgrade.description}</p>
                    <p class="text-sm mt-2">Chỉ số hiện tại: Cấp ${currentLevel}, Bonus: +${currentBonus}%</p>
                    <p class="text-sm text-yellow-300">Cấp tiếp theo: Bonus +${nextBonus}%</p>
                </div>
                <div class="flex-shrink-0">
                     <button class="p-3 rounded-md ${buttonClass} font-bold flex flex-col items-center" onclick="buyGemUpgrade('${upgrade.id}')" ${canAfford ? '' : 'disabled'}>
                        <span>Nâng Cấp</span>
                        <span class="text-xs">💎 ${currentCost}</span>
                     </button>
                </div>
            </div>
        `;
    });
}

const rarityMap = {
    'Common': 'text-gray-400', 'Rare': 'text-blue-400', 'Epic': 'text-purple-400', 'Legendary': 'text-yellow-400'
};

function renderAlbums() {
    if(!albumGrid) return;
    albumGrid.innerHTML = '';
    const filteredAlbums = currentAlbumFilter === 'all' 
        ? GAME_DATA.albums 
        : GAME_DATA.albums.filter(a => a.rarity === currentAlbumFilter);

    filteredAlbums.forEach(album => {
        const isUnlocked = gameState.albums[album.id]?.unlocked;
        const imageClass = isUnlocked ? 'unlocked-image' : 'locked-image';
        const rarityColor = rarityMap[album.rarity] || 'text-gray-400';
        
        albumGrid.innerHTML += `
            <div class="album-image-container p-2 bg-gray-800 rounded-lg flex flex-col items-center">
                <img src="${album.image}" alt="${album.name}" class="w-full h-24 object-cover rounded-md ${imageClass}">
                <p class="text-xs mt-2 text-center ${rarityColor}">${album.rarity}</p>
                <p class="text-sm mt-1 text-center font-bold">${album.name}</p>
                <div class="mt-2 w-full">
                    ${isUnlocked ? `<button class="p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 w-full" onclick="zoomImage('${album.image}')">View</button>` : `<button class="p-2 rounded-md bg-green-600 hover:bg-green-500 w-full" onclick="buyAlbum('${album.id}')">Mua (${album.cost} Vàng)</button>`}
                </div>
            </div>
        `;
    });
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('bg-gray-700', 'font-bold'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.add('bg-gray-800'));
    
    document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`).classList.add('bg-gray-700', 'font-bold');
}

function showSubTab(tabName) {
    document.querySelectorAll('.sub-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');

    document.querySelectorAll('.sub-tab-button').forEach(btn => {
        btn.classList.remove('bg-gray-700', 'font-bold', 'text-white');
        btn.classList.add('bg-gray-800', 'text-gray-400');
    });
    
    document.querySelector(`.sub-tab-button[onclick="showSubTab('${tabName}')"]`).classList.add('bg-gray-700', 'font-bold', 'text-white');
    document.querySelector(`.sub-tab-button[onclick="showSubTab('${tabName}')"]`).classList.remove('text-gray-400');
}

// --- Animations ---

function animateMonsterHit() {
    anime({
        targets: '#monster-icon',
        scale: [
            { value: 1.05, duration: 50, easing: 'easeOutQuad' },
            { value: 1, duration: 150, easing: 'easeOutQuad' }
        ],
    });
}

function displayDamageNumber(x, y, damage, type) {
    const damageNumber = document.createElement('div');
    let content = Math.round(damage).toLocaleString();
    damageNumber.classList.add('damage-number');

    let iconHtml = ''; 
    
    const dpsData = type.startsWith('dps-') ? findUpgradeData(type.substring(4)) : null;

    if (dpsData) {
        iconHtml = `${dpsData.icon} `;
        damageNumber.classList.add(`damage-number-${type.substring(4)}`);
    } else {
        switch(type) {
            case 'crit': iconHtml = '💥 '; damageNumber.classList.add('damage-number-crit'); break;
            case 'dot-fire': iconHtml = '🔥 '; damageNumber.classList.add('damage-number-dot-fire'); break;
            case 'dot-poison': iconHtml = '💀 '; damageNumber.classList.add('damage-number-dot-poison'); break;
            case 'dot-mage': iconHtml = '✨ '; damageNumber.classList.add('damage-number-dot-mage'); break;
            case 'lightning': iconHtml = '⚡ '; damageNumber.classList.add('damage-number-lightning'); break;
            case 'gold': iconHtml = '💰 '; content = `+${content}`; damageNumber.classList.add('damage-number-gold'); break;
            case 'gem': iconHtml = '💎 '; content = `+${content}`; damageNumber.classList.add('damage-number-gem'); break;
            case 'skill': iconHtml = '⭐ '; damageNumber.classList.add('damage-number-skill'); break;
            case 'click':
            default:
                iconHtml = '🖱️ ';
                damageNumber.style.color = '#b0c4de';
                damageNumber.style.fontSize = '1.2rem';
                break;
        }
    }
    
    damageNumber.innerHTML = iconHtml + content;

    const randomX = (Math.random() - 0.5) * 60;
    const randomY = (Math.random() - 0.5) * 60;
    damageNumber.style.left = `calc(${x}px + ${randomX}px)`;
    damageNumber.style.top = `calc(${y}px + ${randomY}px)`;
    
    document.body.appendChild(damageNumber);
    
    setTimeout(() => {
        damageNumber.remove();
    }, 1000);
}


function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, duration);
}

function createParticle(content) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.innerHTML = content;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 2 + 3}s`;
    particleContainer.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 5000);
}

// --- Timers and Intervals ---

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
        if (monsterContainerRect) {
            displayDamageNumber(monsterContainerRect.left + monsterContainerRect.width / 2, monsterContainerRect.top + monsterContainerRect.height / 2, Math.round(finalGold), 'gold');
        }
    }
    
    gameState.currentMonsterHP -= Math.round(finalDamage);
    if (monsterContainerRect) {
        displayDamageNumber(monsterContainerRect.left + monsterContainerRect.width / 2, monsterContainerRect.top + monsterContainerRect.height / 2, finalDamage, `dps-${type}`);
    }

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

// --- Save/Load Game ---

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
        showNotification("Đã sao chép dữ liệu game vào clipboard!", "success");
    }).catch(err => {
        showNotification("Lỗi khi sao chép!", "error");
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
            showNotification("Dữ liệu đã được nhập thành công! Tải lại trang...", "success");
            setTimeout(() => location.reload(), 2000);
        } catch (e) {
            showNotification(`Dữ liệu không hợp lệ!`, "error");
        }
    }
}

// --- Menu and Popup Handlers ---

function pauseGame() {
    isPaused = true;
    pauseMenu.style.display = 'flex';
}

function resumeGame() {
    isPaused = false;
    pauseMenu.style.display = 'none';
}

function zoomImage(imageSrc) {
    if(!zoomPopup) return;
    const zoomImageElement = document.getElementById('zoom-image');
    zoomImageElement.src = imageSrc;
    zoomPopup.style.display = 'flex';
    gameScreen.style.display = 'none';
}

function closeZoomPopup() {
    if(!zoomPopup) return;
    zoomPopup.style.display = 'none';
    gameScreen.style.display = 'flex';
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

let currentAlbumFilter = 'all';
function filterAlbums(rarity) {
    currentAlbumFilter = rarity;
    renderAlbums();
    
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('bg-gray-700');
        btn.classList.add('bg-gray-800');
    });
    document.querySelector(`.filter-button[onclick="filterAlbums('${rarity}')"]`).classList.remove('bg-gray-800');
    document.querySelector(`.filter-button[onclick="filterAlbums('${rarity}')"]`).classList.add('bg-gray-700');
}

document.getElementById('pause-button').addEventListener('click', () => {
     isPaused = !isPaused;
     if(isPaused) pauseGame();
     else resumeGame();
});

// --- CÁC HÀM MỚI CHO HỆ THỐNG KỸ NĂNG ---

function renderSkillBar() {
    gameState.skillSlots.forEach((skillId, index) => {
        const slotElement = document.getElementById(`skill-slot-${index}`);
        if (!slotElement) return;

        slotElement.innerHTML = `<i class="fas fa-plus"></i>
                               <div class="skill-cooldown-overlay"></div>
                               <span class="skill-keybind">${index + 1}</span>`;

        if (skillId) {
            const skillData = findUpgradeData(skillId);
            if (skillData) {
                slotElement.querySelector('i').className = `fas ${skillData.icon} skill-icon`;
                
                const cooldownLeft = gameState.skillCooldowns[skillId] || 0;
                const cooldownOverlay = slotElement.querySelector('.skill-cooldown-overlay');

                if (cooldownLeft > 0) {
                    slotElement.classList.add('on-cooldown');
                    cooldownOverlay.textContent = cooldownLeft;
                    const percentage = (cooldownLeft / skillData.cooldown) * 100;
                    cooldownOverlay.style.clipPath = `inset(${100 - percentage}% 0 0 0)`;
                } else {
                    slotElement.classList.remove('on-cooldown');
                    cooldownOverlay.textContent = '';
                    cooldownOverlay.style.clipPath = `inset(100% 0 0 0)`;
                }
            }
        }
    });
}

let skillToEquip = null;
const equipSkillModal = document.getElementById('equip-skill-modal');

function openEquipModal(skillId) {
    skillToEquip = skillId;
    const modalSlotsContainer = document.getElementById('modal-skill-slots');
    if (!modalSlotsContainer) return;
    modalSlotsContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const modalSlot = document.createElement('div');
        modalSlot.className = 'skill-slot';
        modalSlot.onclick = () => equipSkill(skillToEquip, i);

        const currentSkillId = gameState.skillSlots[i];
        if (currentSkillId) {
            const skillData = findUpgradeData(currentSkillId);
            modalSlot.innerHTML = `<i class="fas ${skillData.icon} skill-icon"></i>`;
        } else {
            modalSlot.innerHTML = `<i class="fas fa-plus"></i>`;
        }
        modalSlotsContainer.appendChild(modalSlot);
    }
    
    if(equipSkillModal) equipSkillModal.style.display = 'flex';
}

function closeEquipModal() {
    skillToEquip = null;
    if(equipSkillModal) equipSkillModal.style.display = 'none';
}

function equipSkill(skillId, slotIndex) {
    const existingIndex = gameState.skillSlots.indexOf(skillId);
    if (existingIndex !== -1) {
        gameState.skillSlots[existingIndex] = null;
    }

    gameState.skillSlots[slotIndex] = skillId;
    closeEquipModal();
    renderSkillBar();
    saveGame();
}

function unequipSkill(event, slotIndex) {
    event.preventDefault(); // Ngăn menu chuột phải hiện ra
    if (gameState.skillSlots[slotIndex]) {
        gameState.skillSlots[slotIndex] = null;
        renderSkillBar();
        saveGame();
        showNotification("Đã gỡ trang bị kỹ năng.", "info");
    }
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

showSubTab('click-upgrades');
showTab('upgrade');
initGame();


