
/* =========================================
   AGE GATE - CONFIRMAÇÃO DE IDADE
   THAYNARA MARTINS
   ========================================= */

(() => {

    'use strict';


    /* =========================================
       CONFIGURAÇÃO
       ========================================= */

    const DESTINATION_URL = 'https://bouncy.ai/segredosdanara';


    /* =========================================
       ELEMENTOS HTML
       ========================================= */

    const ctaButton = document.getElementById('ctaButton');

    const modal = document.getElementById('ageModal');

    const yesButton = document.getElementById('ageYes');

    const noButton = document.getElementById('ageNo');

    const backButton = document.getElementById('ageBack');

    const ageActions = document.getElementById('ageActions');

    const ageRestricted = document.getElementById('ageRestricted');


    /* =========================================
       VERIFICAÇÃO DOS ELEMENTOS
       ========================================= */

    if (
        !ctaButton ||
        !modal ||
        !yesButton ||
        !noButton ||
        !backButton ||
        !ageActions ||
        !ageRestricted
    ) {

        console.error(
            '[AGE GATE] Elementos necessários não encontrados.'
        );

        return;

    }


    /* =========================================
       CONTROLE DE FOCO
       ========================================= */

    let previousFocus = null;


    /* =========================================
       ABRIR MODAL
       ========================================= */

    function openModal() {

        previousFocus = document.activeElement;

        ageActions.hidden = false;

        ageRestricted.hidden = true;

        modal.hidden = false;

        document.body.classList.add('age-modal-open');

        yesButton.focus();

    }


    /* =========================================
       FECHAR MODAL
       ========================================= */

    function closeModal() {

        modal.hidden = true;

        document.body.classList.remove('age-modal-open');

        if (
            previousFocus &&
            typeof previousFocus.focus === 'function'
        ) {

            previousFocus.focus();

        }

    }


    /* =========================================
       CLIQUE NO BOTÃO PRINCIPAL
       ========================================= */

    ctaButton.addEventListener('click', (event) => {

        event.preventDefault();

        openModal();

    });


    /* =========================================
       CONFIRMAÇÃO POSITIVA
       ========================================= */

    yesButton.addEventListener('click', () => {

        /*
         * A abertura do destino acontece diretamente
         * após a interação do visitante.
         */

        const newWindow = window.open(
            DESTINATION_URL,
            '_blank'
        );


        /*
         * Proteção contra acesso à janela de origem.
         */

        if (newWindow) {

            newWindow.opener = null;

        } else {

            /*
             * Se o navegador bloquear a nova janela,
             * o visitante será direcionado na mesma aba.
             */

            window.location.assign(DESTINATION_URL);

        }

    });


    /* =========================================
       RESPOSTA NEGATIVA
       ========================================= */

    noButton.addEventListener('click', () => {

        ageActions.hidden = true;

        ageRestricted.hidden = false;

        backButton.focus();

    });


    /* =========================================
       VOLTAR PARA A PÁGINA
       ========================================= */

    backButton.addEventListener('click', () => {

        closeModal();

    });


    /* =========================================
       BLOQUEAR FECHAMENTO PELO FUNDO
       ========================================= */

    modal.addEventListener('click', (event) => {

        if (event.target === modal) {

            event.stopPropagation();

        }

    });


    /* =========================================
       CONTROLE DE TECLADO E FOCO
       ========================================= */

    modal.addEventListener('keydown', (event) => {


        /*
         * ESC NÃO FECHA O MODAL
         */

        if (event.key === 'Escape') {

            event.preventDefault();

            event.stopPropagation();

            return;

        }


        /*
         * CONTROLE DA TECLA TAB
         */

        if (event.key !== 'Tab') {

            return;

        }


        const activeButtons = modal.querySelectorAll(
            'button:not([hidden]):not(:disabled)'
        );


        const visibleButtons = Array.from(activeButtons).filter(
            (button) => button.offsetParent !== null
        );


        if (visibleButtons.length === 0) {

            event.preventDefault();

            return;

        }


        const firstButton = visibleButtons[0];

        const lastButton = visibleButtons[visibleButtons.length - 1];


        /*
         * SHIFT + TAB
         */

        if (
            event.shiftKey &&
            document.activeElement === firstButton
        ) {

            event.preventDefault();

            lastButton.focus();

        }


        /*
         * TAB
         */

        else if (
            !event.shiftKey &&
            document.activeElement === lastButton
        ) {

            event.preventDefault();

            firstButton.focus();

        }

    });


    /* =========================================
       INICIALIZAÇÃO
       ========================================= */

    console.info(
        '[AGE GATE] Sistema de confirmação carregado.'
    );

})();
