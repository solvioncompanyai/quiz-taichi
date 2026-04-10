/**
 * i18n.js — Detecção de Idioma e Sistema de Tradução
 * Quiz Taichi — Protocolo Movimento da Esponja
 *
 * Fluxo:
 *  1. Detecta país via ipapi.co (ou cache em sessionStorage)
 *  2. Mapeia país → idioma (pt-BR | es | en)
 *  3. Se pt-BR: nenhuma alteração (padrão)
 *  4. Se es/en: aplica traduções via data-i18n="chave"
 *
 * Para expandir traduções: complete os objetos TRANSLATIONS['es'] e TRANSLATIONS['en']
 * e adicione data-i18n="chave" nos elementos HTML desejados.
 */

// ─── PAÍSES POR IDIOMA ───────────────────────────────────────────
const SPANISH_COUNTRIES = [
  'ES','MX','AR','CO','PE','VE','CL','EC',
  'GT','CU','BO','DO','HN','PY','SV','NI',
  'CR','PA','UY','GQ','PR'
];

// ─── TRADUÇÕES ───────────────────────────────────────────────────
const TRANSLATIONS = {

  'pt-BR': null, // null = idioma padrão, nenhuma tradução aplicada

  'es': {
    // ── Meta / Título ──
    'page_title_index':   'Diagnóstico Gratuito de Rigidez Articular — Protocolo Flujo Tai Chi',
    'page_title_quiz':    'Diagnóstico — Protocolo Flujo Tai Chi',
    'page_title_result':  'Tus Resultados — Protocolo Flujo Tai Chi',
    'page_title_offer':   'Protocolo Flujo Tai Chi — Acceso por $19.90',

    // ── Landing page (index.html) ──
    'urgency_bar':        '⚠️ &nbsp;Este diagnóstico es rastreado por IP — solo puede realizarse <strong>una vez por persona</strong>',
    'badge_diagnostic':   '🔬 Diagnóstico Gratuito y Personalizado',
    'headline_main':      'Descubre en <span class="gradient-text">2 Minutos</span> el Nivel de <em>"Óxido"</em> en Tus Articulaciones —',
    'headline_sub':       'y Recibe el Protocolo de Desbloqueo de <span class="gradient-text-green">15 Minutos</span> diseñado para Tu Nivel Exacto de Dolor',
    'subheadline':        'Este diagnóstico gratuito fue desarrollado para <strong>mujeres mayores de 45 años</strong> que se despiertan con el cuerpo bloqueado, no pueden dormir bien y ya lo han intentado todo — sin resultado duradero.',
    'start_btn':          '→ INICIAR MI DIAGNÓSTICO GRATUITO AHORA',
    'quiz_time':          'Tarda menos de <strong>2 minutos</strong>',
    'quiz_result':        '✅ Resultado inmediato y personalizado',

    // ── Quiz ──
    'question_label':     'Pregunta',
    'of':                 'de',
    'continue_btn':       'Continuar →',
    'multi_hint':         '☑️ Selecciona todas las opciones que apliquen',

    // ── Loading ──
    'loading_title':      'Analizando tus <span class="gradient-text">Respuestas</span>',
    'loading_subtitle':   'Nuestro sistema está mapeando tu perfil de rigidez articular...',

    // ── Resultado ──
    'result_headline':    'Tus Resultados Están <span class="gradient-text">Listos</span>',
    'result_sub':         'Mientras nuestro sistema finaliza tu diagnóstico personalizado, mira el video abajo — explica exactamente lo que tus respuestas revelaron.',

    // ── Oferta ──
    'offer_headline_1':   'El Secreto Milenario del',
    'offer_headline_2':   '"Flujo Tai Chi"',
    'offer_headline_3':   ': Cómo Derretir el Óxido de Tus Articulaciones en Solo',
    'offer_headline_4':   '15 Minutos...',
    'buy_btn_text':       '💳 SÍ! QUIERO DESBLOQUEAR MI CUERPO AHORA ($19.90)',
    'guarantee_title':    'Nuestra Garantía "Sin Dolor" de 7 Días',
  },

  'en': {
    // ── Meta / Título ──
    'page_title_index':   'Free Joint Stiffness Diagnosis — Tai Chi Flow Protocol',
    'page_title_quiz':    'Diagnosis — Tai Chi Flow Protocol',
    'page_title_result':  'Your Results — Tai Chi Flow Protocol',
    'page_title_offer':   'Tai Chi Flow Protocol — Access for $4.90',

    // ── Landing page ──
    'urgency_bar':        '⚠️ &nbsp;This diagnosis is IP-tracked — it can only be taken <strong>once per person</strong>',
    'badge_diagnostic':   '🔬 Free Personalized Diagnosis',
    'headline_main':      'Discover in <span class="gradient-text">2 Minutes</span> the Level of <em>"Rust"</em> in Your Joints —',
    'headline_sub':       'and Receive the <span class="gradient-text-green">15-Minute</span> Unlocking Protocol Tailored to Your Exact Pain Level',
    'subheadline':        'This free diagnosis was created for <strong>women over 45</strong> who wake up feeling stiff, can\'t sleep through the night, and have already tried everything — without lasting results.',
    'start_btn':          '→ START MY FREE DIAGNOSIS NOW',
    'quiz_time':          'Takes less than <strong>2 minutes</strong>',
    'quiz_result':        '✅ Immediate personalized result',

    // ── Quiz ──
    'question_label':     'Question',
    'of':                 'of',
    'continue_btn':       'Continue →',
    'multi_hint':         '☑️ Select all options that apply',

    // ── Loading ──
    'loading_title':      'Analyzing your <span class="gradient-text">Answers</span>',
    'loading_subtitle':   'Our system is mapping your joint stiffness profile...',

    // ── Resultado ──
    'result_headline':    'Your Results Are <span class="gradient-text">Ready</span>',
    'result_sub':         'While our system finalizes your personalized diagnosis, watch the video below — it explains exactly what your answers revealed.',

    // ── Oferta ──
    'offer_headline_1':   'The Ancient Secret of the',
    'offer_headline_2':   '"Tai Chi Flow"',
    'offer_headline_3':   ': How to Melt Joint Rust in Just',
    'offer_headline_4':   '15 Minutes...',
    'buy_btn_text':       '💳 YES! I WANT TO UNLOCK MY BODY NOW ($4.90)',
    'guarantee_title':    'Our 7-Day "Zero Pain" Guarantee',
  }
};

// ─── DETECÇÃO DE IDIOMA ──────────────────────────────────────────
async function detectLanguage() {
  // 1. Verificar cache
  const cached = sessionStorage.getItem('user_lang');
  if (cached) return cached;

  try {
    // 2. Chamar API de geolocalização
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json();
    const country = (data.country_code || '').toUpperCase();

    let lang = 'pt-BR'; // padrão
    if (country === 'BR') {
      lang = 'pt-BR';
    } else if (SPANISH_COUNTRIES.includes(country)) {
      lang = 'es';
    } else {
      lang = 'en';
    }

    sessionStorage.setItem('user_lang', lang);
    sessionStorage.setItem('user_country', country);
    return lang;

  } catch (e) {
    // Fallback: pt-BR se falhar
    const fallback = 'pt-BR';
    sessionStorage.setItem('user_lang', fallback);
    return fallback;
  }
}

// ─── APLICAR TRADUÇÃO ────────────────────────────────────────────
function applyTranslation(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return; // pt-BR: sem alteração

  // Atualizar lang do documento
  document.documentElement.lang = lang;

  // Traduzir elementos com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // Traduzir title da página
  const pageId = document.body.getAttribute('data-page');
  const titleKey = 'page_title_' + pageId;
  if (pageId && t[titleKey]) {
    document.title = t[titleKey];
  }
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────
(async () => {
  try {
    const lang = await detectLanguage();
    // Aguardar DOM estar pronto antes de aplicar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyTranslation(lang));
    } else {
      applyTranslation(lang);
    }
  } catch(e) {
    // Silencioso em caso de erro
  }
})();
