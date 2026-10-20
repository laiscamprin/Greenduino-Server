document.addEventListener("componentsLoaded", () => {
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            const moveX = (Math.random() - 0.5) * 150; 
            const moveY = (Math.random() - 0.5) * 150;
            particle.style.setProperty('--move-x', `${moveX}px`);
            particle.style.setProperty('--move-y', `${moveY}px`);
            
            particle.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
});