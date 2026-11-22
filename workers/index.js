// worker/index.js - O Cérebro do Bunker
const ORIGIN_HOST = 'seu-repositorio.pages.dev'; // <-- SUBSTITUA PELO ENDPOINT DO PAGES
const MAX_REDIRECT_DEPTH = 5; // Loop Guard

// Lista de User-Agents conhecidos de bots do Meta
const META_BOT_REGEX = /(facebookexternalhit|meta-externalagent|instagram-bot|crawler)/i;

/**
 * Função de Sanitize URL: Limpa parâmetros rastreáveis.
 * @param {URL} url - O objeto URL atual.
 * @returns {URL} URL limpa.
 */
function sanitizeUrl(url) {
    const params = new URLSearchParams(url.search);
    const paramsToRemove = ['fbclid', 'igsh', 'utm_source', 'utm_campaign', 'ref', 'fb_ref', 'gclid'];

    for (const param of paramsToRemove) {
        params.delete(param);
    }

    // Se a URL original tiver parâmetros, garante que a nova URL refletirá o status.
    const newSearch = params.toString();
    return new URL(url.pathname + (newSearch ? `?${newSearch}` : ''));
}

/**
 * Função para aplicar o esquema de escape de forma inteligente.
 * @param {URL} url - A URL sanitizada.
 * @param {Headers} headers - Headers originais.
 * @returns {{response: Response, isRedirect: boolean}}
 */
async function handleInAppEscape(url, headers) {
    const userAgent = headers.get('User-Agent') || '';
    const path = url.pathname + url.search;
    let redirectTarget = null;
    let escapeMethod = null;

    // 1. Detecção e Estratégia por Sistema
    if (userAgent.includes('Instagram')) {
        // iOS Primary Escape
        redirectTarget = `instagram://extbrowser/?url=${encodeURIComponent(ORIGIN_HOST + path)}`;
        escapeMethod = 'IOS_PRIMARY';

        // Fallback iOS (x-safari-https://) se o primary falhar em abrir
        // Esta é uma estratégia de backup dentro do Worker
        const fallbackRedirect = `x-safari-https://${encodeURIComponent(ORIGIN_HOST + path)}`;

        return { 
            response: Response.redirect(redirectTarget, 302), 
            isRedirect: true, 
            fallback: fallbackRedirect 
        };

    } else if (userAgent.includes('Facebook')) {
        // Facebook Escape
        redirectTarget = `x-safari-https://${encodeURIComponent(ORIGIN_HOST + path)}`;
        return { response: Response.redirect(redirectTarget, 302), isRedirect: true, fallback: null };
    } else if (userAgent.includes('Android') || userAgent.includes('Chrome')) {
        // Android Strategy: Não confia no intent://, usa o botão de fallback na UI.
        // O Worker apenas garante que o conteúdo HTML (servido abaixo) esteja pronto.
        return { response: null, isRedirect: false, fallback: null };
    }

    // Se não for app, não redireciona
    return { response: null, isRedirect: false, fallback: null };
}


/**
 * Função principal que executa toda a cascata de defesas.
 * @param {Request} request - A requisição recebida.
 * @returns {Promise<Response>} A resposta final.
 */
async function handleRequest(request) {
    const originalUrl = new URL(request.url);
    const headers = new Headers(request.headers);

    // --- [ A. BLOQUEIO DE BOTS ] ---
    if (META_BOT_REGEX.test(headers.get('User-Agent') || '')) {
        // Resposta neutra para confundir o Meta, mas servir o conteúdo para humanos.
        return new Response("Conteúdo de Sistema. Ignorar rastreamento.", { 
            status: 200, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    }

    // --- [ B. SANITIZAÇÃO DE URL ] ---
    const sanitizedUrl = sanitizeUrl(originalUrl);
    let finalUrl = new URL(sanitizedUrl.toString());

    // --- [ C. REDIRECIONAMENTO INAPP ] ---
    const escapeResult = await handleInAppEscape(finalUrl, headers);

    if (escapeResult.isRedirect) {
        if (escapeResult.response) {
            // Tentativa 1: Redirecionamento ativo (iOS Primary)
            return escapeResult.response; 
        }
        // Fallback 1: Retorna uma página de erro/fallback se o redirecionamento falhar em ser capturado
        // Nota: A lógica de retorno de fallback deve ser implementada na página HTML gerada,
        // mas aqui, como Worker, retornamos um 302 forçado para a página de fallback.
        return new Response("Redirecionamento InApp falhou. Tente Abrir no Safari.", { status: 302, headers: { 'Location': escapeResult.fallback }});
    }

    // --- [ D. OFUSCAÇÃO DE VESTÍGIOS ] ---
    // Se não há redirecionamento, vamos servir o conteúdo estático limpo

    // 1. Clone Request e Limpa Headers
    const cleanRequest = new Request(finalUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'manual'
    });

    // 2. Ocultação de Headers
    const newHeaders = new Headers(cleanRequest.headers);
    newHeaders.set('Referer', 'https://google.com'); // Neutro
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15'); // UA Desktop robusto

    // 3. Proxying para o Origin (Pages)
    try {
        const response = await fetch(ORIGIN_HOST + finalUrl.pathname + finalUrl.search, {
            method: cleanRequest.method,
            headers: newHeaders,
            body: cleanRequest.body,
        });

        // --- [ E. FALLBACK DE SERVIDOR ] ---
        // Se o Pages responder, injetamos Headers finais se necessário, mas geralmente não é preciso.
        return response;

    } catch (e) {
        // ---------------------------------------------------------------------
        // FALLBACK ABSOLUTO: Se o GitHub Pages (Origin) estiver offline
        // O Worker assume o papel de servidor de conteúdo aqui.
        console.error("Origin Pages FAILED. Serving Embedded HTML as emergency fallback.", e);
        return new Response(getEmbeddedHtmlContent(), { 
            status: 200, 
            headers: { 'Content-Type': 'text/html' } 
        });
    }
}

// ======================================================================
// --- SISTEMA DE CONTINGÊNCIA FINAL (Fallback para Servir o HTML) ---
// Para o Fallback de Origin, injetamos o HTML que foi planejado.
// É crucial que este HTML seja o mais enxuto possível.
// ======================================================================
function getEmbeddedHtmlContent() {
    // *** AQUI VOCÊ COLOCA O HTML COMPLETO DO PLANO 1 ***
    // (Todo o HTML, com <meta name="referrer" content="no-referrer">)
    // É recomendado que este HTML seja gerado dinamicamente se for complexo.
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
            <meta name="referrer" content="no-referrer">
            <title>Bunker - Emergência</title>
            <style>/* CSS do style.css injetado aqui ou linkado*/ ...</style>
            <script>/* JS do main.js injetado aqui */ ...</script>
        </head>
        <body>
            <!-- Conteúdo HTML da Parte 1 -->
        </body>
        </html>`;
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request).catch(err => {
        // Captura qualquer erro catastrófico do Worker e retorna um 500 bem camuflado
        console.error("Worker Catastrophic Failure:", err);
        return new Response("Falha Crítica de Sistema. Acesso Neutro. (Erro interno: "+err.message+")", { status: 500 });
    }));
});