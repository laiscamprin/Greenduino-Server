async function loadComponent(id, url) {
    const element = document.getElementById(id);
    if (!element) return;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar');
        const html = await response.text();
        element.innerHTML = html;
    } catch (error) {
        console.error(`Erro ao carregar o componente ${url}:`, error);
    }
}


async function initApp() {
    await Promise.all([
        loadComponent("header-placeholder", "/components/header/header.html"),
        loadComponent("footer-placeholder", "/components/footer/footer.html"),
        loadComponent("hero-placeholder", "/components/hero/hero.html"),
        loadComponent("carousel-placeholder", "/components/carousel/carousel.html")
    ]);

    
    document.dispatchEvent(new Event("componentsLoaded"));
}

document.addEventListener("DOMContentLoaded", initApp);