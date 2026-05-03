const damageNumberPool = [];

function getDamageNumberElement() {
    if (damageNumberPool.length > 0) {
        return damageNumberPool.pop();
    }
    return document.createElement('div');
}

function releaseDamageNumberElement(el) {
    if(el.parentNode) el.parentNode.removeChild(el);
    el.className = '';
    el.style.cssText = '';
    el.innerHTML = '';
    damageNumberPool.push(el);
}

function displayDamageNumber(x, y, damage, type) {
    const damageNumber = getDamageNumberElement();
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
    
    // Use timeout to release element after animation completes (1s)
    setTimeout(() => {
        releaseDamageNumberElement(damageNumber);
    }, 1000);
}

const particlePool = [];

function getParticleElement() {
    if(particlePool.length > 0) return particlePool.pop();
    return document.createElement('div');
}

function releaseParticleElement(el) {
    if(el.parentNode) el.parentNode.removeChild(el);
    el.className = '';
    el.style.cssText = '';
    el.innerHTML = '';
    particlePool.push(el);
}

function createParticle(content) {
    const particleContainer = document.getElementById('particle-container');
    if(!particleContainer) return;
    
    const particle = getParticleElement();
    particle.className = 'particle';
    particle.innerHTML = content;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 2 + 3}s`;
    
    particleContainer.appendChild(particle);

    setTimeout(() => {
        releaseParticleElement(particle);
    }, 5000);
}

function animateMonsterHit() {
    if (typeof anime !== 'undefined') {
        anime({
            targets: '#monster-icon',
            scale: [
                { value: 1.05, duration: 50, easing: 'easeOutQuad' },
                { value: 1, duration: 150, easing: 'easeOutQuad' }
            ],
        });
    }
}
