// main.js - Script para Correção de Viewport em WebViews

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // 1. Corrige o bug do 100vh
    function setVh() {
        // Calcula a altura da viewport em relação à altura real da janela
        const vh = window.innerHeight * 0.01;

        // Define uma propriedade CSS customizada no body
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Aplica essa correção ao container principal se necessário, ou deixa o CSS fazer o trabalho
        const wrapper = document.querySelector('.full-screen-wrapper');
        if (wrapper) {
            wrapper.style.height = 'calc(var(--vh, 1vh) * 100)';
        }
    }

    // Chama a função imediatamente
    setVh();

    // Adiciona listener para redimensionamento (útil se o app for redimensionado)
    window.addEventListener('resize', setVh);

    // 2. Lógica de fallback/interação (Se o CTA for clicado sem redirecionamento via Worker)
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            // Este fallback só é ativado se o Worker não fizer o redirect (caso de erro na Layer 2)
            console.log("Fallback CTA ativado. Tentando redirecionamento direto.");
            window.open('https://seu-link-de-destino.com', '_blank');
        });
    }
});