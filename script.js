/**
 * Detecção do navegador interno do Instagram e exibição de um aviso acessível.
 * A abordagem é orientativa, respeitando as políticas da plataforma.
 */
(function() {
    'use strict';

    /**
     * Verifica se o navegador é o interno do Instagram.
     * A verificação é feita em minúsculas para evitar problemas de case-sensitive.
     * @returns {boolean}
     */
    function isInstagramBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        // A assinatura "instagram" é a mais comum. Alguns iPhones podem incluir "instagram" no UA.
        return ua.includes('instagram');
    }

    /**
     * Cria e exibe o banner de orientação.
     */
    function showInstagramBanner() {
        // Evita criar múltiplos banners se o script for executado mais de uma vez
        if (document.getElementById('ig-browser-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'ig-browser-banner';
        // Atributos de acessibilidade
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'polite');

        // Estilos inline para garantir que o banner apareça mesmo se o CSS externo falhar
        banner.style.cssText = `
            position: fixed;
            top: max(16px, env(safe-area-inset-top));
            left: 50%;
            transform: translateX(-50%);
            background-color: #ffffff;
            color: #1c1c1e;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            z-index: 9999;
            text-align: center;
            max-width: 90%;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;

        banner.innerHTML = `
            <strong style="display:block; margin-bottom:4px;">Você está no navegador do Instagram</strong>
            <span>Para uma melhor experiência, toque no menu <strong>⋮</strong> (três pontos) no canto superior e selecione <strong>"Abrir no navegador"</strong>.</span>
        `;

        document.body.appendChild(banner);

        // Função para remover o banner
        const removeBanner = function() {
            if (banner.parentNode) {
                banner.style.opacity = '0';
                setTimeout(() => {
                    if (banner.parentNode) banner.remove();
                }, 300);
            }
        };

        // Permite fechar manualmente ao clicar/tocar
        banner.addEventListener('click', removeBanner);

        // Remove automaticamente após 8 segundos (tempo suficiente para leitura)
        setTimeout(removeBanner, 8000);
    }

    // Executa após o carregamento da página para não bloquear a renderização
    window.addEventListener('load', function() {
        if (isInstagramBrowser()) {
            showInstagramBanner();
        }
    });
})();