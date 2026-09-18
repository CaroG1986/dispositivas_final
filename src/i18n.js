// Diccionario de traducciones ES / PT
// Cada clave corresponde al id del elemento HTML en Index.html.
// El valor es el innerHTML exacto que se inyectará al cambiar de idioma.

export const translations = {
    es: {
        's1-tag': 'Introducción',
        's1-title': 'RELEVO GENERACIONAL:<br>LA VENTAJA QUE NADIE ESTÁ APROVECHANDO',
        's2-title': '¿Un gran auditorio solo para hacer grados?',
        's3-text': 'Los eventos no llegaron a la Universidad.<br><strong style="color: #ffffff; font-weight: 400;">La Universidad decidió encontrarse con el mundo.</strong>',
        's4-title': '<span style="color: #ffffff;">Academia</span> + <span style="color: #ff2a85;">Industria</span> + <span style="color: #457b9d;">Ciudad</span>',
        's5-title': 'Los eventos nunca fueron el objetivo.',
        's5-sub': 'El impacto sí.',
        's6-text': 'Un evento trae personas.<br><span style="color: #457b9d; font-weight: 500;">Una comunidad trae transformación.</span>',
        's7-title': 'El talento crece a la velocidad de la confianza.',
        's8-text': 'La experiencia construye el camino.<br><strong style="color: #ffffff;">Las nuevas generaciones descubren nuevas rutas.</strong>',
        's9-title': 'Una visión.<br><span style="color: #ff2a85;">Dos generaciones.</span>',
        's10-text': 'El crecimiento no ocurre cuando una generación reemplaza a otra.<br><strong style="color: #ffffff;">Ocurre cuando trabajan juntas.</strong>',
        's11-text': 'Los jóvenes no son el futuro.<br><strong style="color: #ff2a85;">Son el presente que muchas organizaciones aún no ven.</strong>',
        's12-title': 'El futuro no se hereda.<br><span style="color: #457b9d;">Se construye.</span>',
        's13-title': 'Conectemos',
        's13-link1': '<a href="http://instagram.com/centrodeeventosupb/" target="_blank" style="color: inherit;">http://instagram.com/centrodeeventosupb/</a>',
        's13-link2': '<a href="https://carog1986.github.io/dispositivas_final/" target="_blank" style="color: inherit;">https://carog1986.github.io/dispositivas_final/</a>',
        'nav-label': (current, total) => `Diapositiva ${current} de ${total}`,
    },
    pt: {
        's1-tag': 'Introdução',
        's1-title': 'TRANSIÇÃO GERACIONAL:<br>A VANTAGEM QUE NINGUÉM ESTÁ APROVEITANDO',
        's2-title': 'Um grande auditório só para fazer formaturas?',
        's3-text': 'Os eventos não chegaram à Universidade.<br><strong style="color: #ffffff; font-weight: 400;">A Universidade decidiu se encontrar com o mundo.</strong>',
        's4-title': '<span style="color: #ffffff;">Academia</span> + <span style="color: #ff2a85;">Indústria</span> + <span style="color: #457b9d;">Cidade</span>',
        's5-title': 'Os eventos nunca foram o objetivo.',
        's5-sub': 'O impacto, sim.',
        's6-text': 'Um evento traz pessoas.<br><span style="color: #457b9d; font-weight: 500;">Uma comunidade traz transformação.</span>',
        's7-title': 'O talento cresce na velocidade da confiança.',
        's8-text': 'A experiência constrói o caminho.<br><strong style="color: #ffffff;">As novas gerações descobrem novas rotas.</strong>',
        's9-title': 'Uma visão.<br><span style="color: #ff2a85;">Duas gerações.</span>',
        's10-text': 'O crescimento não acontece quando uma geração substitui a outra.<br><strong style="color: #ffffff;">Acontece quando trabalham juntas.</strong>',
        's11-text': 'Os jovens não são o futuro.<br><strong style="color: #ff2a85;">São o presente que muitas organizações ainda não veem.</strong>',
        's12-title': 'O futuro não se herda.<br><span style="color: #457b9d;">Se constrói.</span>',
        's13-title': 'Vamos nos conectar',
        's13-link1': '<a href="http://instagram.com/centrodeeventosupb/" target="_blank" style="color: inherit;">http://instagram.com/centrodeeventosupb/</a>',
        's13-link2': '<a href="https://carog1986.github.io/dispositivas_final/" target="_blank" style="color: inherit;">https://carog1986.github.io/dispositivas_final/</a>',
        'nav-label': (current, total) => `Slide ${current} de ${total}`,
    }
};

let currentLang = 'es';

export function getCurrentLang() {
    return currentLang;
}

export function applyLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    const dict = translations[lang];
    Object.keys(dict).forEach((key) => {
        if (key === 'nav-label') return;
        const el = document.getElementById(key);
        if (el) el.innerHTML = dict[key];
    });

    // Actualiza el estado visual de los botones de idioma
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
}

export function setupLanguageSwitch() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
}
