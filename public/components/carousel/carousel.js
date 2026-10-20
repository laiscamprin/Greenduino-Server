document.addEventListener("componentsLoaded", () => {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        let currentIndex = 0; let autoPlay;

        function updateCarousel() {
            items.forEach(item => item.classList.remove('active', 'prev-item', 'next-item'));
            items[currentIndex].classList.add('active');
            items[(currentIndex - 1 + items.length) % items.length].classList.add('prev-item');
            items[(currentIndex + 1) % items.length].classList.add('next-item');
        }

        function moveNext() { currentIndex = (currentIndex + 1) % items.length; updateCarousel(); }
        function movePrev() { currentIndex = (currentIndex - 1 + items.length) % items.length; updateCarousel(); }

        document.getElementById('btn-next')?.addEventListener('click', () => { moveNext(); resetTimer(); });
        document.getElementById('btn-prev')?.addEventListener('click', () => { movePrev(); resetTimer(); });

        function resetTimer() { clearInterval(autoPlay); autoPlay = setInterval(moveNext, 3500); }
        updateCarousel(); resetTimer();
    }
});