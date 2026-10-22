//NAO MEXER PASSIVEL DE QUEBRAR DENOVO
//QUEBROU 2X
//QUEBROU DENOVO
//nunca mais
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-toggle-password]').forEach(function (botao) {
        var campo = botao.parentElement.querySelector('input');
        if (!campo) return;

        botao.addEventListener('click', function () {
            var mostrar = campo.type === 'password';
            campo.type = mostrar ? 'text' : 'password';
            botao.classList.toggle('is-visible', mostrar);
            botao.setAttribute('aria-pressed', String(mostrar));
            botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
        });
    });
});
//mim nao saber como mas estar funcionando, mas nao mexer pq pode quebrar denovo.