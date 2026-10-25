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
        loadComponent("carousel-placeholder", "/components/carousel/carousel.html"),
        loadComponent("dashboard-icones-placeholder", "/components/dashboard/icones.html"),
        loadComponent("dashboard-menu-placeholder", "/components/dashboard/menu/menu.html"),
        loadComponent("dashboard-cultivo-placeholder", "/components/dashboard/cultivo/cultivo.html"),
        loadComponent("dashboard-indicadores-placeholder", "/components/dashboard/indicadores/indicadores.html"),
        loadComponent("dashboard-historico-placeholder", "/components/dashboard/historico/historico.html"),
        loadComponent("dashboard-plantas-placeholder", "/components/dashboard/plantas/plantas.html"),
        loadComponent("dashboard-modais-placeholder", "/components/dashboard/modais/modais.html")
    ]);

    
    document.dispatchEvent(new Event("componentsLoaded"));
}

document.addEventListener("DOMContentLoaded", initApp);
