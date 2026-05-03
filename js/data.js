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
                description: "Tụ hợp khí lạnh. Đòn đánh có tỉ lệ đóng băng kẻ địch trong 5 giây, khiến chúng trở nên yếu ớt. Toàn bộ đồng minh DPS sẽ gây sát thương cộng thêm cực lớn lên mục tiêu bị đóng băng.", 
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

const rarityMap = {
    'Common': 'text-gray-400', 'Rare': 'text-blue-400', 'Epic': 'text-purple-400', 'Legendary': 'text-yellow-400'
};
