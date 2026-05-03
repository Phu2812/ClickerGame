let isPaused = false;
let currentAlbumFilter = 'all';

function updateUI() {
    document.getElementById('gold-display').innerHTML = `<i class="fa-solid fa-coins text-yellow-500"></i> ${Math.round(gameState.gold).toLocaleString()}`;
    document.getElementById('gem-display').innerHTML = `<i class="fa-solid fa-gem text-cyan-500"></i> ${gameState.gems.toLocaleString()}`;
    document.getElementById('level-display').textContent = `Level ${gameState.level}`;
    document.getElementById('click-damage-display').innerHTML = `<i class="fa-solid fa-burst text-red-500"></i> ${Math.round(gameState.damagePerClick).toLocaleString()}`;
    
    const hpPercentage = (gameState.currentMonsterHP / gameState.maxMonsterHP) * 100;
    document.getElementById('health-bar-fill').style.width = `${Math.max(0, hpPercentage)}%`;
    document.getElementById('hp-text').textContent = `${Math.max(0, Math.round(gameState.currentMonsterHP)).toLocaleString()} / ${Math.round(gameState.maxMonsterHP).toLocaleString()}`;

    renderUpgrades();
    renderGemUpgrades();
    renderSkillBar();
}

function renderUpgrades() {
    const containers = {
        'click': document.getElementById('click-upgrades'),
        'dps': document.getElementById('dps-upgrades'),
        'economy': document.getElementById('economy-upgrades'),
        'skill': document.getElementById('skill-upgrades'),
    };

    for (const type in containers) {
        if(containers[type]) {
            containers[type].innerHTML = '';
            if (type === 'click') {
                containers[type].innerHTML += `<h2 class="col-span-1 md:col-span-2 text-xl font-cinzel font-bold text-purple-300 border-b border-purple-500/30 pb-2 mb-4">Cá nhân (Click)</h2>`;
                GAME_DATA.upgrades.click.filter(u => u.category === 'pure').forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
                
                containers[type].innerHTML += `<h2 class="col-span-1 md:col-span-2 text-xl font-cinzel font-bold text-fuchsia-300 border-b border-fuchsia-500/30 pb-2 mb-4 mt-6">Nguyên Tố Ma Thuật</h2>`;
                GAME_DATA.upgrades.click.filter(u => u.category === 'elemental').forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
            } else {
                GAME_DATA.upgrades[type].forEach(upgrade => renderUpgradeCard(upgrade, containers[type]));
            }
        }
    }
}

function renderUpgradeCard(upgrade, container) {
    const type = upgrade.type;
    const currentLevel = gameState.upgrades[upgrade.id]?.level || 0;
    const maxLevel = upgrade.maxLevel || Infinity;
    const isMaxLevel = currentLevel >= maxLevel;
    const currentCost = Math.round(upgrade.cost * Math.pow(1.15, currentLevel));
    const canAfford = gameState.gold >= currentCost && !isMaxLevel;
    
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
            const petStats = petData.levelStats[petLevel - 1];
            petBuffDamage = petStats.buff.damage;
        }
        const gemDpsLevel = gameState.gemUpgrades['gem-dps-damage']?.level || 0;
        const gemDpsBonus = 1 + (gemDpsLevel * (findGemUpgradeData('gem-dps-damage')?.effect || 0));

        if (currentLevel > 0) {
            const currentStats = upgrade.levelStats[currentLevel - 1];
            let baseDmg = calculateDpsDamage(upgrade, currentLevel, currentStats);
            let finalDmg = baseDmg;
            if (upgrade.id !== 'pet') finalDmg *= (1 + petBuffDamage);
            finalDmg *= gemDpsBonus;
            extraInfo += `<p class="text-xs text-gray-400 mt-1">Chỉ số hiện tại: ${Math.round(finalDmg).toLocaleString()} sát thương</p>`;
        }
        if (!isMaxLevel) {
            const nextStats = upgrade.levelStats[currentLevel];
            let nextBaseDmg = calculateDpsDamage(upgrade, currentLevel + 1, nextStats);
            let nextFinalDmg = nextBaseDmg;
            if (upgrade.id !== 'pet') nextFinalDmg *= (1 + petBuffDamage);
            nextFinalDmg *= gemDpsBonus;
            nextLevelInfo = `Tiếp theo: ${Math.round(nextFinalDmg).toLocaleString()} sát thương`;
        }
    } else {
         switch (upgrade.id) {
            case 'power-click':
                levelDisplay = `Cấp: ${currentLevel}`;
                if (currentLevel > 0) extraInfo = `<p class="text-xs text-gray-400 mt-1">Bonus: +${currentLevel.toLocaleString()} DMG</p>`;
                nextLevelInfo = `Tiếp theo: +${(currentLevel + 1).toLocaleString()} DMG`;
                break;
            case 'critical-chance':
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Tỉ lệ: ${currentLevel}%</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Tiếp theo: ${currentLevel + 1}%`;
                break;
            case 'critical-damage':
                levelDisplay = `Cấp: ${currentLevel}`;
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Sát thương chí mạng: ${200 + currentLevel * 10}%</p>`;
                nextLevelInfo = `Tiếp theo: ${200 + (currentLevel + 1) * 10}%`;
                break;
            case 'double-tap':
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Tỉ lệ: ${currentLevel * 5}%</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Tiếp theo: ${ (currentLevel + 1) * 5}%`;
                break;
            case 'fire-click':
                if (currentLevel > 0) {
                    const currentMultiplier = (upgrade.damageRatio + (currentLevel - 1) * upgrade.damageScale) * 100;
                    extraInfo = `<p class="text-xs text-gray-400 mt-1">Đốt: ${currentMultiplier.toFixed(0)}% DMG/tick</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: Đốt ${(upgrade.damageRatio * 100).toFixed(0)}% DMG/tick`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    nextLevelInfo = `Tiếp theo: ${((upgrade.damageRatio + currentLevel * upgrade.damageScale) * 100).toFixed(0)}%`;
                } else if(isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'poison-click':
                if (currentLevel > 0) {
                    const currentDmg = ((upgrade.damageRatio + (currentLevel - 1) * upgrade.damageScale) * 100).toFixed(1);
                    extraInfo = `<p class="text-xs text-gray-400 mt-1">Độc: ${currentDmg}% HP/s</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: Độc ${(upgrade.damageRatio * 100).toFixed(1)}% HP max/s`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    const nextDmg = ((upgrade.damageRatio + currentLevel * upgrade.damageScale) * 100).toFixed(1);
                    nextLevelInfo = `Tiếp theo: ${nextDmg}% HP/s`;
                } else if(isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'lightning-click':
                const maxHits = 5 + Math.floor(gameState.level / 50);
                if (currentLevel > 0) {
                    extraInfo = `<p class="text-xs text-gray-400 mt-1">Số tia sét: ${upgrade.minHits[currentLevel - 1]}-${maxHits}</p>`;
                } else {
                    nextLevelInfo = `Mở khóa: ${upgrade.minHits[0]}-${maxHits} tia sét.`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                    nextLevelInfo = `Tiếp theo: ${upgrade.minHits[currentLevel]}-${maxHits} tia sét`;
                } else if (isMaxLevel) {
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'ice-click':
                if (currentLevel > 0) {
                    const effect = upgrade.effects[currentLevel - 1];
                    extraInfo = `<p class="text-xs text-gray-400 mt-1">Hiện tại: ${effect.chance*100}% tỉ lệ, +${effect.buff*100}% buff</p>`;
                } else {
                    const nextEffect = upgrade.effects[0];
                    nextLevelInfo = `Mở khóa: ${nextEffect.chance*100}% đóng băng, +${nextEffect.buff*100}% buff.`;
                }
                if (!isMaxLevel && currentLevel > 0) {
                   const nextEffect = upgrade.effects[currentLevel];
                   nextLevelInfo = `Tiếp theo: ${nextEffect.chance*100}% tỉ lệ, +${nextEffect.buff*100}% buff`;
                } else if(isMaxLevel) { 
                    nextLevelInfo = 'Đã đạt tối đa';
                }
                break;
            case 'gold-multiplier':
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Bonus hiện tại: +${currentLevel * 5}% vàng</p>`;
                nextLevelInfo = isMaxLevel ? `Đã đạt tối đa` : `Tiếp theo: +${(currentLevel + 1) * 5}%`;
                break;
            case 'boss-loot':
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Gem nhận thêm: +${currentLevel}</p>`;
                nextLevelInfo = isMaxLevel ? 'Đã đạt cấp tối đa' : `Tiếp theo: +${currentLevel + 1} gem`;
                break;
            case 'treasure-hunter-eco':
                levelDisplay = `Cấp: ${currentLevel}`;
                extraInfo = `<p class="text-xs text-gray-400 mt-1">Hệ số vàng: x${(1 + currentLevel * 0.1).toFixed(1)}</p>`;
                nextLevelInfo = `Tiếp theo: x${(1 + (currentLevel + 1) * 0.1).toFixed(1)}`;
                break;
        }
    }

    if (type === 'skill') {
        const cooldownLeft = gameState.skillCooldowns[upgrade.id] || 0;
        const isDisabled = currentLevel === 0;
        const buttonText = currentLevel > 0 ? 'Trang bị' : `<i class="fa-solid fa-coins text-yellow-400"></i> ${currentCost.toLocaleString()}`;

        container.innerHTML += `
            <div class="glass-card p-4 flex flex-col md:flex-row items-center gap-4 relative group">
                <div class="flex-shrink-0 text-fuchsia-400 text-4xl w-16 text-center drop-shadow-[0_0_8px_rgba(217,70,239,0.5)] group-hover:scale-110 transition-transform"><i class="${upgrade.icon}"></i></div>
                <div class="flex-grow text-center md:text-left">
                    <h3 class="font-bold font-cinzel text-lg text-fuchsia-300 tracking-wide">${upgrade.name}</h3>
                    <p class="text-xs text-gray-400 mt-1 leading-relaxed">${description}</p>
                    <p class="text-xs mt-2 font-semibold text-gray-300">${levelDisplay}</p>
                </div>
                <div class="flex-shrink-0 w-full md:w-32 lg:w-40">
                     <button class="w-full p-3 rounded-md glass-button font-bold text-sm tracking-widest uppercase" 
                             onclick="${currentLevel > 0 ? `openEquipModal('${upgrade.id}')` : `buyUpgrade('${upgrade.id}')`}" 
                             ${(!canAfford && currentLevel === 0) ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            </div>`;
    } else {
        const iconHtml = upgrade.upgradeIcon ? `<i class="${upgrade.upgradeIcon} mr-2"></i>` : (upgrade.icon ? `<i class="${upgrade.icon} mr-2"></i>` : '');
        let costText = `<i class="fa-solid fa-coins text-yellow-500 mr-1"></i> ${currentCost.toLocaleString()}`;
        let buttonText = 'Nâng cấp';
        if (currentLevel === 0) {
            buttonText = 'Mở khóa';
        }
        if (isMaxLevel) {
            costText = 'Đã tối đa';
            buttonText = 'Tối đa';
            nextLevelInfo = ''; 
        }

        container.innerHTML += `
            <div class="glass-card p-4 flex flex-col justify-between h-full group">
                <div>
                    <h3 class="font-bold font-cinzel text-lg text-purple-300 tracking-wide drop-shadow-[0_0_5px_rgba(216,180,254,0.3)]">${iconHtml}${upgrade.name}</h3>
                    <p class="text-xs text-gray-400 mt-2 leading-relaxed">${description}</p>
                    <div class="mt-3 space-y-1">
                        <p class="text-xs font-semibold text-gray-300">${levelDisplay}</p>
                        ${extraInfo}
                        <p class="text-xs font-bold text-yellow-400 mt-2 drop-shadow-md">${nextLevelInfo}</p>
                    </div>
                </div>
                <div class="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <span class="text-yellow-400 text-sm font-bold flex items-center gap-1 drop-shadow-md">${costText}</span>
                    <button class="px-4 py-2 rounded-md glass-button font-bold text-xs uppercase tracking-widest" onclick="buyUpgrade('${upgrade.id}')" ${canAfford ? '' : 'disabled'}>${buttonText}</button>
                </div>
            </div>`;
    }
}

function renderGemUpgrades() {
    const gemUpgradesContainer = document.getElementById('gem-upgrades-container');
    if(!gemUpgradesContainer) return;
    gemUpgradesContainer.innerHTML = '';
    GAME_DATA.gemUpgrades.forEach(upgrade => {
        const currentLevel = gameState.gemUpgrades[upgrade.id]?.level || 0;
        const currentCost = upgrade.cost + currentLevel;
        const canAfford = gameState.gems >= currentCost;
        
        let bonus = upgrade.effect * 100;
        const currentBonus = (currentLevel * bonus).toFixed(1);
        const nextBonus = ((currentLevel + 1) * bonus).toFixed(1);

        gemUpgradesContainer.innerHTML += `
            <div class="glass-card p-4 flex flex-col md:flex-row items-center gap-4 relative group">
                <div class="flex-shrink-0 text-cyan-400 text-4xl w-16 text-center drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform">
                    <i class="${upgrade.icon}"></i>
                </div>
                <div class="flex-grow text-center md:text-left">
                    <h3 class="font-bold font-cinzel text-lg text-cyan-300 tracking-wide">${upgrade.name}</h3>
                    <p class="text-xs text-gray-400 mt-1 leading-relaxed">${upgrade.description}</p>
                    <p class="text-xs mt-2 text-gray-300">Cấp <span class="text-white font-bold">${currentLevel}</span> | Bonus: <span class="text-cyan-400">+${currentBonus}%</span></p>
                    <p class="text-xs text-yellow-400 font-semibold mt-1">Tiếp theo: +${nextBonus}%</p>
                </div>
                <div class="flex-shrink-0 w-full md:w-32">
                     <button class="w-full p-3 rounded-md glass-button font-bold text-sm tracking-widest uppercase flex flex-col items-center justify-center gap-1" onclick="buyGemUpgrade('${upgrade.id}')" ${canAfford ? '' : 'disabled'}>
                        <span>Nâng Cấp</span>
                        <span class="text-xs text-cyan-200 drop-shadow-md"><i class="fa-solid fa-gem"></i> ${currentCost}</span>
                     </button>
                </div>
            </div>
        `;
    });
}

function renderAlbums() {
    const albumGrid = document.getElementById('album-grid');
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
            <div class="glass-card p-2 flex flex-col items-center group">
                <div class="w-full aspect-square overflow-hidden rounded-md border border-white/5 bg-black/50">
                    <img src="${album.image}" alt="${album.name}" class="w-full h-full object-cover ${imageClass} group-hover:scale-110 transition-transform duration-500">
                </div>
                <p class="text-[10px] mt-2 text-center uppercase tracking-widest font-bold ${rarityColor}">${album.rarity}</p>
                <p class="text-xs mt-1 text-center font-bold text-gray-200 line-clamp-1">${album.name}</p>
                <div class="mt-3 w-full">
                    ${isUnlocked ? `<button class="py-2 w-full rounded-md glass-button text-xs uppercase font-bold tracking-widest" onclick="zoomImage('${album.image}')">Xem</button>` : `<button class="py-2 w-full rounded-md glass-button text-xs uppercase font-bold tracking-widest text-green-400 hover:text-green-300 !border-green-500/30 hover:!border-green-500/50" onclick="buyAlbum('${album.id}')"><i class="fa-solid fa-coins mr-1"></i>${album.cost}</button>`}
                </div>
            </div>
        `;
    });
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-white', 'shadow-[inset_0_-2px_0_#c084fc]');
        btn.classList.add('text-gray-400');
    });
    
    const activeBtn = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`);
    if(activeBtn) {
        activeBtn.classList.remove('text-gray-400');
        activeBtn.classList.add('bg-white/10', 'text-white', 'shadow-[inset_0_-2px_0_#c084fc]');
    }
}

function showSubTab(tabName) {
    document.querySelectorAll('.sub-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');

    document.querySelectorAll('.sub-tab-button').forEach(btn => {
        btn.classList.remove('bg-purple-600/30', 'text-white', 'border-purple-500/50');
        btn.classList.add('text-gray-400', 'border-transparent');
    });
    
    const activeBtn = document.querySelector(`.sub-tab-button[onclick="showSubTab('${tabName}')"]`);
    if(activeBtn) {
        activeBtn.classList.remove('text-gray-400', 'border-transparent');
        activeBtn.classList.add('bg-purple-600/30', 'text-white', 'border-purple-500/50');
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if(!container) return;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, duration);
}

function zoomImage(imageSrc) {
    const zoomPopup = document.getElementById('zoom-popup');
    if(!zoomPopup) return;
    const zoomImageElement = document.getElementById('zoom-image');
    zoomImageElement.src = imageSrc;
    zoomPopup.style.display = 'flex';
}

function closeZoomPopup() {
    const zoomPopup = document.getElementById('zoom-popup');
    if(zoomPopup) zoomPopup.style.display = 'none';
}

function filterAlbums(rarity) {
    currentAlbumFilter = rarity;
    renderAlbums();
    
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-white');
        btn.classList.add('text-gray-400');
        btn.classList.remove('bg-blue-900/30', 'bg-purple-900/30', 'bg-yellow-900/30');
    });
    
    const activeBtn = document.querySelector(`.filter-button[onclick="filterAlbums('${rarity}')"]`);
    if(activeBtn) {
        activeBtn.classList.remove('text-gray-400');
        activeBtn.classList.add('text-white');
        
        if(rarity === 'all' || rarity === 'Common') activeBtn.classList.add('bg-white/10');
        else if(rarity === 'Rare') activeBtn.classList.add('bg-blue-900/30');
        else if(rarity === 'Epic') activeBtn.classList.add('bg-purple-900/30');
        else if(rarity === 'Legendary') activeBtn.classList.add('bg-yellow-900/30');
    }
}

function renderSkillBar() {
    const slots = [0, 1, 2];
    slots.forEach(index => {
        // Render PC slots
        const slotElement = document.getElementById(`skill-slot-${index}`);
        const mobileSlotElement = document.getElementById(`mobile-skill-slot-${index}`);
        const skillId = gameState.skillSlots[index];

        [slotElement, mobileSlotElement].forEach(el => {
            if (!el) return;
            
            el.innerHTML = `<i class="fas fa-plus"></i>
                               <div class="skill-cooldown-overlay ${el.id.includes('mobile') ? '!rounded-full' : ''}"></div>
                               ${!el.id.includes('mobile') ? `<span class="skill-keybind">${index + 1}</span>` : ''}`;

            if (skillId) {
                const skillData = findUpgradeData(skillId);
                if (skillData) {
                    el.querySelector('i').className = `fas ${skillData.icon} skill-icon text-2xl`;
                    
                    const cooldownLeft = gameState.skillCooldowns[skillId] || 0;
                    const cooldownOverlay = el.querySelector('.skill-cooldown-overlay');

                    if (cooldownLeft > 0) {
                        el.classList.add('on-cooldown');
                        cooldownOverlay.textContent = cooldownLeft;
                        const percentage = (cooldownLeft / skillData.cooldown) * 100;
                        cooldownOverlay.style.clipPath = `inset(${100 - percentage}% 0 0 0)`;
                    } else {
                        el.classList.remove('on-cooldown');
                        cooldownOverlay.textContent = '';
                        cooldownOverlay.style.clipPath = `inset(100% 0 0 0)`;
                    }
                }
            }
        });
    });
}

let skillToEquip = null;
function openEquipModal(skillId) {
    skillToEquip = skillId;
    const equipSkillModal = document.getElementById('equip-skill-modal');
    const modalSlotsContainer = document.getElementById('modal-skill-slots');
    modalSlotsContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const modalSlot = document.createElement('div');
        modalSlot.className = 'skill-slot w-16 h-16 rounded-md flex items-center justify-center';
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
    const equipSkillModal = document.getElementById('equip-skill-modal');
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

function unequipSkill(slotIndex) {
    if(event) event.preventDefault();
    if (gameState.skillSlots[slotIndex]) {
        gameState.skillSlots[slotIndex] = null;
        renderSkillBar();
        saveGame();
        showNotification("Đã gỡ trang bị kỹ năng.", "info");
    }
}
