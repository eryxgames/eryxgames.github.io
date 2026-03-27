/**
 * Eryxian — Background Effects + Terminal Widget
 * ─────────────────────────────────────────────────────────────────────────────
 * Effects:
 *   1. Slice Reveal   — background fades in from black in random horizontal strips
 *   2. Scanlines      — CRT scanline overlay (CSS-driven, tweakable via variables)
 *   3. Aurora Beams   — drifting colour shafts (CSS-driven)
 *   4. Parallax Dust  — canvas-based floating particles with mouse parallax
 *   5. Terminal       — retro CLI widget on homepage, top-left corner
 *
 * TUNING — all user-facing knobs are in the CONFIG blocks below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     CONFIG — background effects
  ═══════════════════════════════════════════════════════════════════════════ */
  const CONFIG = {

    slices: {
      enabled:       false,
      count:         20,
      baseDelay:     40,
      jitter:        80,
      fadeDuration:  600,
      glitchAmount:  68,
      reglitchEvery: 4000,
      reglitchCount: 8,
    },

    particles: {
      enabled:          true,
      count:            450,
      minRadius:        0.4,
      maxRadius:        3.2,
      minSpeed:         0.08,
      maxSpeed:         0.45,
      minOpacity:       0.08,
      maxOpacity:       0.55,
      parallaxStrength: 0.035,
      parallaxSmooth:   0.056,
      colors: [
        'rgba(180, 200, 255, {a})',
        'rgba(200, 180, 255, {a})',
        'rgba(140, 220, 255, {a})',
        'rgba(255, 255, 255, {a})',
        'rgba(160, 255, 220, {a})',
      ],
    },

    aurora: {
      enabled: false,
    },

    disableOnMobile:  false,
    mobileBreakpoint: 768,
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     TERMINAL CONFIG — edit everything here
     ─────────────────────────────────────────────────────────────────────────
     SEQUENCE: Array of line objects typed in order. Each line is:
       { text, color, delay, link, linkLabel }
         text      — string to type out ('' for blank line)
         color     — CSS colour string  (optional, defaults to green)
         delay     — extra pause BEFORE this line starts (ms, optional)
         link      — URL to open on click  (optional)
         linkLabel — anchor text, replaces text if set (optional)

     EASTER_EGGS: Map of command → response lines array.
       Type the command into the terminal prompt and press Enter.
       Each response is { text, color }.

     SCROLL FADE:
       terminalScrollFade.enabled      — fade terminal on scroll (recommended for mobile)
       terminalScrollFade.desktopWidth — px breakpoint above which fade is skipped
       terminalScrollFade.fadeDuration — CSS transition duration in ms
       terminalScrollFade.threshold    — scroll px past which terminal is hidden
                                         (0 = use IntersectionObserver on #intro instead)
  ═══════════════════════════════════════════════════════════════════════════ */
  const TERMINAL = {

    // ── Scroll fade behaviour ─────────────────────────────────────────────────
    scrollFade: {
      enabled:      true,   // fade out terminal when page is scrolled
      desktopWidth: 900,    // px — skip fade on screens wider than this
      fadeDuration: 400,    // ms — CSS opacity transition speed
      // How far to scroll (px) before the terminal starts fading.
      // Set to 0 to use IntersectionObserver on #intro instead (smarter).
      threshold:    0,
    },

    // ── Appearance ────────────────────────────────────────────────────────────
    typeSpeed:    38,    // ms per character (lower = faster)
    lineDelay:   320,    // ms pause between lines
    cursorBlink: 530,    // ms blink interval
    maxLines:     28,    // lines kept visible before scrolling old ones off
    showPrompt:  true,   // show interactive prompt after sequence ends

    // ── Boot sequence lines ───────────────────────────────────────────────────
    sequence: [
      { text: 'ERYXIAN OS  v0.9.1-alpha',          color: '#7B61FF', delay: 200 },
      { text: '────────────────────────────',        color: '#333'                },
      { text: 'Booting subsystems...',               color: '#555', delay: 100    },
      { text: '[  OK  ] Stellar cartography',        color: '#0f8'                },
      { text: '[  OK  ] Quantum drive interface',    color: '#0f8'                },
      { text: '[ WARN ] Dark matter readings high',  color: '#f90'                },
      { text: '[  OK  ] Particle mesh active',       color: '#0f8'                },
      { text: '',                                                                   },
      { text: 'SCANNING SECTOR  Ω-7 ...',            color: '#4af', delay: 400    },
      { text: '  Coordinates  : 47.3°N  18.9°E',    color: '#aaa'                },
      { text: '  Anomalies    : 3 detected',         color: '#f66'                },
      { text: '  Signal depth : 9,847 ly',           color: '#aaa'                },
      { text: '  Flux index   : 0.0034 ΔΨ/s',       color: '#aaa'                },
      { text: '',                                                                   },
      { text: 'UPLINK ESTABLISHED',                  color: '#7B61FF', delay: 300 },
      {
        text:      '  >> WIKI  — Eryxian Universe',
        color:     '#4af',
        link:      'https://github.com/eryxgames/eryxian/wiki',
        linkLabel: '  >> WIKI  — Eryxian Universe',
      },
      {
        text:      '  >> REPO  — eryxgames / GitHub',
        color:     '#4af',
        link:      'https://github.com/eryxgames',
        linkLabel: '  >> REPO  — eryxgames / GitHub',
      },
      { text: '',                                                                   },
      { text: 'STATUS: NOMINAL. AWAITING INPUT.',    color: '#555'                },
      { text: '────────────────────────────',        color: '#333'                },
    ],

    // ── Interactive prompt ────────────────────────────────────────────────────
    promptText: 'eryx@ω7 ~$ ',

    // ── Easter egg commands ───────────────────────────────────────────────────
    easterEggs: {
      'help': [
        { text: 'Available commands:', color: '#7B61FF' },
        { text: '  scan      — rescan current sector',      color: '#aaa' },
        { text: '  status    — system diagnostics',         color: '#aaa' },
        { text: '  lore      — fragment from the archives', color: '#aaa' },
        { text: '  clear     — clear terminal',             color: '#aaa' },
        { text: '  ls        — list directory',             color: '#aaa' },
        { text: '  whoami    — current operator ID',        color: '#aaa' },
        { text: '  uptime    — session uptime',             color: '#aaa' },
        { text: '  sudo rm -rf /',                          color: '#f66' },
        { text: '  neofetch  — system info',                color: '#aaa' },
      ],
      'scan': [
        { text: 'SCANNING...', color: '#4af' },
        { text: '  New anomaly at 12.4°, 091h — class Ψ-4', color: '#f90' },
        { text: '  Residual chronon signature: 0.0071',      color: '#aaa' },
        { text: '  Recommend further observation.',           color: '#0f8' },
      ],
      'status': [
        { text: '── SYSTEM STATUS ──────────────', color: '#7B61FF' },
        { text: '  CPU   ████████░░  82%',          color: '#0f8'   },
        { text: '  MEM   █████░░░░░  51%',          color: '#0f8'   },
        { text: '  FLUX  ███████████ 99% !!',       color: '#f66'   },
        { text: '  HULL  ████████░░  80% nominal',  color: '#0f8'   },
      ],
      'lore': [
        { text: '"The Eryxian Gate has no lock —', color: '#7B61FF' },
        { text: ' only those who forget time',       color: '#aaa'   },
        { text: ' may pass through it."',            color: '#aaa'   },
        { text: '  — Fragment Σ-12, Archives of Ω', color: '#555'   },
      ],
      'ls': [
        { text: 'total 7',                                         color: '#aaa' },
        { text: 'drwxr-x  chronicles/    the recorded ages',       color: '#4af' },
        { text: 'drwxr-x  artifacts/     recovered technology',    color: '#4af' },
        { text: '-rw-r--  manifest.txt   sector manifest',         color: '#0f8' },
        { text: '-rw-r--  anomaly.log    ongoing readings',        color: '#f90' },
        { text: '-r-----  classified     [ACCESS DENIED]',         color: '#f66' },
      ],
      'whoami': [
        { text: 'operator: UNKNOWN',                color: '#f90' },
        { text: 'clearance: DELTA-3 (provisional)', color: '#aaa' },
        { text: 'origin: unverified',               color: '#f66' },
      ],
      'uptime': [
        { text: 'Session uptime: calculating...', color: '#aaa' },
        { text: 'Ship time: [REDACTED]',           color: '#f66' },
        { text: 'Earth time: irrelevant',           color: '#555' },
      ],
      'neofetch': [
        { text: '       .    .     .  ',             color: '#7B61FF' },
        { text: '    .   *  Eryxian OS',             color: '#7B61FF' },
        { text: '  .      OS   : EryxOS v0.9.1a',   color: '#0f8'    },
        { text: '     .   Kern : quantum-6.1.4',     color: '#0f8'    },
        { text: '  *      Shell: eryx-sh 3.2',       color: '#0f8'    },
        { text: '    .    GPU  : void-render',        color: '#0f8'    },
        { text: '         RAM  : ∞ / ∞ (warped)',    color: '#0f8'    },
      ],
      'clear': [{ text: '__CLEAR__' }],
      'sudo rm -rf /': [
        { text: 'Whoa. Bold.',                      color: '#f66' },
        { text: 'Permission denied. (Nice try.)',   color: '#f90' },
      ],
      'sudo rm -rf /*': [
        { text: '...',                              color: '#f66' },
        { text: 'You are still here.',              color: '#f90' },
        { text: 'The universe is still here.',      color: '#0f8' },
        { text: 'Consider this a lesson.',          color: '#555' },
      ],
    },

    // ── "Unknown command" fallbacks (one picked at random) ───────────────────
    unknownResponses: [
      [{ text: 'Command not found. Try: help',          color: '#f66' }],
      [{ text: 'Unknown input. The void stares back.',  color: '#555' }],
      [{ text: '[ERR] Signal unrecognised.', color: '#f66' }, { text: 'Try: help', color: '#aaa' }],
      [{ text: 'Sector Ω-7 has no record of that.',     color: '#555' }],
    ],
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════════════ */
  function init () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (CONFIG.disableOnMobile && window.innerWidth < CONFIG.mobileBreakpoint) return;

    const bg = document.querySelector('#wrapper > .bg');
    if (!bg) return;

    const fxRoot = document.createElement('div');
    fxRoot.id = 'eryx-fx';
    fxRoot.setAttribute('aria-hidden', 'true');
    bg.appendChild(fxRoot);

    if (CONFIG.slices.enabled)    initSlices(bg, fxRoot);
    if (CONFIG.aurora.enabled)    initAurora(fxRoot);
    if (CONFIG.particles.enabled) initParticles(fxRoot);

    const scanEl = document.createElement('div');
    scanEl.className = 'eryx-scanlines';
    fxRoot.appendChild(scanEl);

    // Terminal — only on homepage (when mount element exists)
    const termMount = document.getElementById('eryx-terminal-mount');
    if (termMount) initTerminal(termMount);
    initTcgLightbox();
    initLightbox();
  }

/* ═══════════════════════════════════════════════════════════════════════════
     TCG LIGHTBOX
     Opens on click of any .tcg-card__art-wrap, .tcg-ed, or .tcg-video__thumb.
     Handles: images, Cloudinary video (<video>), YouTube (data-ytid attr).
  ═══════════════════════════════════════════════════════════════════════════ */
  function initTcgLightbox () {
    // Build overlay once
    const lb = document.createElement('div');
    lb.className = 'tcg-lightbox';
    lb.innerHTML =
      '<div class="tcg-lightbox__inner">' +
        '<button class="tcg-lightbox__close" aria-label="Close">✕</button>' +
        '<div class="tcg-lightbox__content"></div>' +
        '<span class="tcg-lightbox__label"></span>' +
      '</div>';
    document.body.appendChild(lb);

    const inner   = lb.querySelector('.tcg-lightbox__inner');
    const content = lb.querySelector('.tcg-lightbox__content');
    const label   = lb.querySelector('.tcg-lightbox__label');
    const closeBtn= lb.querySelector('.tcg-lightbox__close');

    function open (html, labelText) {
      content.innerHTML = html;
      label.textContent = labelText || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      // autoplay video if present
      const vid = content.querySelector('video');
      if (vid) vid.play();
    }

    function close () {
      // pause/stop media before clearing
      const vid = content.querySelector('video');
      if (vid) vid.pause();
      content.innerHTML = '';
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Close on overlay click (but not inner click)
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // ── Click delegation on the whole document ─────────────────────────────
    document.addEventListener('click', e => {

      // Main art area
            // Main art lightbox — DISABLED, re-enable by uncommenting
      /*
      const artWrap = e.target.closest('.tcg-card__art-wrap');
      if (artWrap) {
        const img  = artWrap.querySelector('.tcg-card__art');
        const name = artWrap.closest('.tcg-card')
                       ?.querySelector('.tcg-card__name')
                       ?.textContent || '';
        if (img) {
          open(`<img src="${img.src}" alt="${img.alt}">`, name);
          return;
        }
      }
*/
      // Edition slot
      const ed = e.target.closest('.tcg-ed');
      if (ed) {
        const edLabel = ed.querySelector('.tcg-ed__label')?.textContent || '';
        const cardName = ed.closest('.tcg-card')
                           ?.querySelector('.tcg-card__name')
                           ?.textContent || '';
        const lbl = [cardName, edLabel].filter(Boolean).join(' — ');

        // Cloudinary video slot
        const vid = ed.querySelector('video');
        if (vid) {
          open(
            `<video src="${vid.src}" controls autoplay
               poster="${vid.poster || ''}"
               style="max-width:100%;max-height:85vh;border-radius:6px">
             </video>`,
            lbl
          );
          return;
        }

        // YouTube slot
        const ytId = ed.dataset.ytid;
        if (ytId) {
          open(
            `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0"
               allow="autoplay; fullscreen" allowfullscreen></iframe>`,
            lbl
          );
          return;
        }

        // Image slot
        const img = ed.querySelector('img:not(.tcg-card__frame)');
        if (img) {
          // Use full Cloudinary URL — swap to larger transform if Cloudinary
          const src = img.src.replace('/upload/', '/upload/w_1200,f_auto/');
          open(`<img src="${src}" alt="${img.alt}">`, lbl);
          return;
        }
      }

      // Main video thumbnail
      const vthumb = e.target.closest('.tcg-video__thumb');
      if (vthumb) {
        e.preventDefault();
        const ytId  = vthumb.dataset.ytid
                   || vthumb.href?.match(/[?&v=]([^&]{11})/)?.[1]
                   || vthumb.href?.split('/').pop();
        const cardName = vthumb.closest('.tcg-card')
                               ?.querySelector('.tcg-card__name')
                               ?.textContent || '';
        if (ytId) {
          open(
            `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0"
               allow="autoplay; fullscreen" allowfullscreen></iframe>`,
            cardName
          );
        }
      }
    });
  }

/*
  ═══════════════════════════════════════════════════════════════════════════
  ERYXIAN GALLERY LIGHTBOX EXTENSION
  Add this function inside the IIFE in bg-effects.js, then call it from
  the init() function alongside initTcgLightbox() — or replace
  initTcgLightbox() entirely with this one, which handles both TCG cards
  AND gallery panels in a single listener.
  ═══════════════════════════════════════════════════════════════════════════
*/

  function initLightbox () {

    // ── Build overlay ─────────────────────────────────────────────────────
    const lb = document.createElement('div');
    lb.className = 'tcg-lightbox';
    lb.innerHTML =
      '<div class="tcg-lightbox__inner">' +
        '<button class="tcg-lightbox__close" aria-label="Close">✕</button>' +
        '<div class="tcg-lightbox__content"></div>' +
        '<span class="tcg-lightbox__label"></span>' +
      '</div>';
    document.body.appendChild(lb);

    const inner   = lb.querySelector('.tcg-lightbox__inner');
    const content = lb.querySelector('.tcg-lightbox__content');
    const label   = lb.querySelector('.tcg-lightbox__label');
    const closeBtn= lb.querySelector('.tcg-lightbox__close');

    // ── Open / close ──────────────────────────────────────────────────────
    function open (html, labelText) {
      content.innerHTML = html;
      label.textContent = labelText || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      const vid = content.querySelector('video');
      if (vid) vid.play();
    }

    function close () {
      const vid = content.querySelector('video');
      if (vid) vid.pause();
      content.innerHTML = '';
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    lb.addEventListener('click',    e => { if (e.target === lb) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // ── Helpers ───────────────────────────────────────────────────────────
    function cloudinaryLarge (src) {
      // Inject w_1400,f_auto into Cloudinary URL for full-size view
      return src.includes('res.cloudinary.com')
        ? src.replace('/upload/', '/upload/w_1400,f_auto/')
        : src;
    }

    function ytEmbed (id) {
      return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
        allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }

    // ── Sketchfab poster click — swap poster for iframe ───────────────────
    document.addEventListener('click', e => {
      const poster = e.target.closest('.eryx-panel__model-poster');
      if (poster && !poster.classList.contains('is-hidden')) {
        const panel  = poster.closest('.eryx-panel--model');
        const iframe = panel?.querySelector('iframe');
        if (iframe) {
          // Add autoplay to src
          if (!iframe.src.includes('autostart')) {
            iframe.src = iframe.src + '&autostart=1';
          }
          poster.classList.add('is-hidden');
        }
        return;
      }
    });

    // ── Click delegation — handles all clickable media ────────────────────
    document.addEventListener('click', e => {

      /* ── Gallery: blueprint / render image ───────────────────────── */
      const gPanel = e.target.closest('.eryx-panel--blueprint, .eryx-panel--render');
      if (gPanel && !e.target.closest('.eryx-panel__caption')) {
        const img = gPanel.querySelector('.eryx-panel__media img');
        if (img) {
          const cap = gPanel.querySelector('.eryx-panel__caption')?.textContent || '';
          open(`<img src="${cloudinaryLarge(img.src)}" alt="${img.alt}">`, cap.trim());
          return;
        }
      }

      /* ── Gallery: video panel ─────────────────────────────────────── */
      const vPanel = e.target.closest('.eryx-panel--video');
      if (vPanel && !e.target.closest('.eryx-panel__caption')) {
        const ytId  = vPanel.dataset.ytid;
        const video = vPanel.querySelector('video');
        const cap   = vPanel.querySelector('.eryx-panel__caption')?.textContent || '';

        if (ytId) {
          open(ytEmbed(ytId), cap.trim());
          return;
        }
        if (video) {
          open(
            `<video src="${video.src}" controls autoplay
               poster="${video.poster || ''}"
               style="max-width:100%;max-height:85vh;border-radius:6px"></video>`,
            cap.trim()
          );
          return;
        }
        // poster image as fallback
        const img = vPanel.querySelector('.eryx-panel__media img');
        if (img) { open(`<img src="${cloudinaryLarge(img.src)}" alt="">`, cap.trim()); return; }
      }

      /* ── Gallery: model — open Sketchfab fullscreen in lightbox ──── */
      const mPanel = e.target.closest('.eryx-panel--model .eryx-panel__caption');
      if (mPanel) {
        const panel  = mPanel.closest('.eryx-panel--model');
        const iframe = panel?.querySelector('iframe');
        if (iframe) {
          const src = iframe.src.replace('autostart=1','').replace('&&','&') + '&autostart=1';
          const cap = mPanel.textContent || '';
          open(
            `<iframe src="${src}" allow="autoplay; fullscreen; xr-spatial-tracking"
               allowfullscreen style="width:min(88vw,1000px);aspect-ratio:16/9;border:none;border-radius:6px">
             </iframe>`,
            cap.trim()
          );
          return;
        }
      }

      /* ── TCG: edition slot ────────────────────────────────────────── */
      const ed = e.target.closest('.tcg-ed');
      if (ed) {
        const edLabel  = ed.querySelector('.tcg-ed__label')?.textContent || '';
        const cardName = ed.closest('.tcg-card')?.querySelector('.tcg-card__name')?.textContent || '';
        const lbl = [cardName, edLabel].filter(Boolean).join(' — ');

        const vid  = ed.querySelector('video');
        const ytId = ed.dataset.ytid;
        const img  = ed.querySelector('img:not(.tcg-card__frame)');

        if (vid)  { open(`<video src="${vid.src}" controls autoplay poster="${vid.poster||''}" style="max-width:100%;max-height:85vh;border-radius:6px"></video>`, lbl); return; }
        if (ytId) { open(ytEmbed(ytId), lbl); return; }
        if (img)  { open(`<img src="${cloudinaryLarge(img.src)}" alt="${img.alt}">`, lbl); return; }
      }

      /* ── TCG: main video thumb ────────────────────────────────────── */
      const vthumb = e.target.closest('.tcg-video__thumb');
      if (vthumb) {
        e.preventDefault();
        const ytId = vthumb.dataset.ytid
          || vthumb.href?.match(/[?&v=]([^&]{11})/)?.[1]
          || vthumb.href?.split('/embed/')?.[1]?.split('?')?.[0];
        const cardName = vthumb.closest('.tcg-card')?.querySelector('.tcg-card__name')?.textContent || '';
        if (ytId) { open(ytEmbed(ytId), cardName); }
      }

    }); // end delegation

  } // end initLightbox

/*
  ─────────────────────────────────────────────────────────────────────────
  In init() replace:
      initTcgLightbox();
  with:
      initLightbox();

  And delete the old initTcgLightbox function if you added it earlier.
  ─────────────────────────────────────────────────────────────────────────
*/


  /* ═══════════════════════════════════════════════════════════════════════════
     1. SLICE REVEAL
  ═══════════════════════════════════════════════════════════════════════════ */
  function initSlices (bg, root) {
    const cfg = CONFIG.slices;
    const sliceWrap = document.createElement('div');
    sliceWrap.className = 'eryx-slices';
    root.appendChild(sliceWrap);
    const strips = [];

    function buildStrips () {
      sliceWrap.innerHTML = '';
      strips.length = 0;
      const h = window.innerHeight;
      const stripH = Math.ceil(h / cfg.count);
      for (let i = 0; i < cfg.count; i++) {
        const strip = document.createElement('div');
        strip.className = 'eryx-slice';
        strip.style.cssText = `top:${i*stripH}px;height:${stripH+1}px;
          transition:opacity ${cfg.fadeDuration}ms cubic-bezier(0.4,0,0.2,1),
          transform ${cfg.fadeDuration*.9}ms cubic-bezier(0.16,1,0.3,1);`;
        sliceWrap.appendChild(strip);
        strips.push(strip);
      }
    }

    function revealStrips () {
      const order = strips.map((_,i)=>i).sort(()=>Math.random()-.5);
      order.forEach((idx, seq) => {
        const strip = strips[idx];
        const delay = seq * cfg.baseDelay + Math.random() * cfg.jitter;
        const shiftX = (Math.random()-.5) * cfg.glitchAmount;
        setTimeout(() => {
          strip.style.transform = `translateX(${shiftX}px)`;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            strip.style.opacity = '0';
            strip.style.transform = 'translateX(0)';
          }));
        }, delay);
      });
    }

    function reglitch () {
      for (let i = 0; i < cfg.reglitchCount; i++) {
        const strip = strips[Math.floor(Math.random()*strips.length)];
        setTimeout(() => {
          const shift = (Math.random()-.5)*12;
          strip.style.transition = 'transform .05s linear,opacity .05s linear';
          strip.style.opacity = (Math.random()*.12).toString();
          strip.style.transform = `translateX(${shift}px)`;
          setTimeout(() => {
            strip.style.transition = `opacity ${cfg.fadeDuration}ms ease,transform .3s cubic-bezier(0.16,1,0.3,1)`;
            strip.style.opacity = '0';
            strip.style.transform = 'translateX(0)';
          }, 60+Math.random()*80);
        }, i*180);
      }
    }

    buildStrips();
    setTimeout(revealStrips, 120);
    setInterval(reglitch, cfg.reglitchEvery + Math.random()*2000);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        buildStrips();
        strips.forEach(s => { s.style.transition='none'; s.style.opacity='0'; });
      }, 200);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. AURORA BEAMS
  ═══════════════════════════════════════════════════════════════════════════ */
  function initAurora (root) {
    const wrap = document.createElement('div');
    wrap.className = 'eryx-aurora';
    const pulse = document.createElement('div'); pulse.className = 'eryx-aurora__pulse';
    const grid  = document.createElement('div'); grid.className  = 'eryx-aurora__grid';
    wrap.appendChild(pulse);
    wrap.appendChild(grid);
    [
      { left:'5%',  width:'70px',  delay:'0s',  dur:'22s' },
      { left:'18%', width:'140px', delay:'5s',  dur:'28s' },
      { left:'38%', width:'55px',  delay:'9s',  dur:'17s' },
      { left:'60%', width:'100px', delay:'3s',  dur:'24s' },
      { left:'78%', width:'180px', delay:'14s', dur:'32s' },
      { left:'88%', width:'45px',  delay:'7s',  dur:'19s' },
    ].forEach(d => {
      const b = document.createElement('div');
      b.className = 'eryx-aurora__beam';
      b.style.cssText = `left:${d.left};width:${d.width};animation-delay:${d.delay};animation-duration:${d.dur};`;
      wrap.appendChild(b);
    });
    root.appendChild(wrap);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. PARALLAX DUST PARTICLES
  ═══════════════════════════════════════════════════════════════════════════ */
  function initParticles (root) {
    const cfg = CONFIG.particles;
    const canvas = document.createElement('canvas');
    canvas.className = 'eryx-particles';
    canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let W=0, H=0, particles=[];
    let mouseX=0, mouseY=0, targetOffX=0, targetOffY=0, currentOffX=0, currentOffY=0;

    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX/window.innerWidth -.5)*2;
      mouseY = (e.clientY/window.innerHeight-.5)*2;
    });

    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };

    const randomColor = (a) => cfg.colors[Math.floor(Math.random()*cfg.colors.length)].replace('{a}', a.toFixed(3));

    const createParticle = () => ({
      x: Math.random()*W, y: Math.random()*H,
      radius:  cfg.minRadius  + Math.random()*(cfg.maxRadius  - cfg.minRadius),
      speed:   cfg.minSpeed   + Math.random()*(cfg.maxSpeed   - cfg.minSpeed),
      opacity: cfg.minOpacity + Math.random()*(cfg.maxOpacity - cfg.minOpacity),
      depth:   Math.random(),
      color:   randomColor(cfg.minOpacity + Math.random()*(cfg.maxOpacity - cfg.minOpacity)),
      angle:   Math.random()*Math.PI*2,
      wobble:  (Math.random()-.5)*.004,
      twinkleSpeed: .005+Math.random()*.015,
      twinklePhase: Math.random()*Math.PI*2,
    });

    const buildParticles = () => { particles = Array.from({length:cfg.count}, createParticle); };

    function draw () {
      ctx.clearRect(0,0,W,H);
      targetOffX = mouseX*cfg.parallaxStrength*W;
      targetOffY = mouseY*cfg.parallaxStrength*H;
      currentOffX += (targetOffX-currentOffX)*cfg.parallaxSmooth;
      currentOffY += (targetOffY-currentOffY)*cfg.parallaxSmooth;

      particles.forEach(p => {
        p.angle += p.wobble;
        p.x += Math.cos(p.angle)*p.speed;
        p.y += Math.sin(p.angle)*p.speed*.5 - p.speed*.15;
        if (p.x < -10) p.x = W+10;
        if (p.x > W+10) p.x = -10;
        if (p.y < -10) p.y = H+10;
        if (p.y > H+10) p.y = -10;
        p.twinklePhase += p.twinkleSpeed;
        const tw = .6+.4*Math.sin(p.twinklePhase);
        const px = p.x + currentOffX*(0.2+p.depth*.8);
        const py = p.y + currentOffY*(0.2+p.depth*.8);
        ctx.save();
        ctx.globalAlpha = p.opacity*tw;
        if (p.radius > 1.4) {
          const g = ctx.createRadialGradient(px,py,0,px,py,p.radius*3);
          g.addColorStop(0, p.color); g.addColorStop(1,'transparent');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px,py,p.radius*3,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(px,py,p.radius,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); buildParticles(); });
    resize(); buildParticles(); draw();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4. RETRO TERMINAL WIDGET
  ═══════════════════════════════════════════════════════════════════════════ */
  function initTerminal (mount) {
    const cfg = TERMINAL;

    // ── Build DOM ─────────────────────────────────────────────────────────────
    mount.innerHTML = '';
    mount.className = 'eryx-term';

    const titleBar = document.createElement('div');
    titleBar.className = 'eryx-term__bar';
    titleBar.innerHTML =
      '<span class="eryx-term__dot eryx-term__dot--r"></span>'
      + '<span class="eryx-term__dot eryx-term__dot--y"></span>'
      + '<span class="eryx-term__dot eryx-term__dot--g"></span>'
      + '<span class="eryx-term__bar-title">eryx-terminal — sector Ω-7</span>';

    const output = document.createElement('div');
    output.className = 'eryx-term__output';

    const inputRow = document.createElement('div');
    inputRow.className = 'eryx-term__input-row';
    inputRow.style.display = 'none';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'eryx-term__prompt';
    promptSpan.textContent = cfg.promptText;

    const inputField = document.createElement('input');
    inputField.className = 'eryx-term__input';
    inputField.setAttribute('type', 'text');
    inputField.setAttribute('autocomplete', 'off');
    inputField.setAttribute('spellcheck', 'false');
    inputField.setAttribute('aria-label', 'Terminal input');

    inputRow.appendChild(promptSpan);
    inputRow.appendChild(inputField);
    mount.appendChild(titleBar);
    mount.appendChild(output);
    mount.appendChild(inputRow);

    // ── Scroll fade ───────────────────────────────────────────────────────────
    // On screens narrower than desktopWidth, fade the terminal out when the
    // user scrolls the intro section out of view, and fade it back on return.
    if (cfg.scrollFade.enabled) {
      const dur = cfg.scrollFade.fadeDuration;
      mount.style.transition = `opacity ${dur}ms ease, transform ${dur}ms ease`;

      function setVisible (visible) {
        mount.style.opacity         = visible ? '1' : '0';
        mount.style.transform       = visible ? 'translateY(0)' : 'translateY(-8px)';
        mount.style.pointerEvents   = visible ? 'auto' : 'none';
      }

      function shouldApplyFade () {
        return window.innerWidth < cfg.scrollFade.desktopWidth;
      }

      if (cfg.scrollFade.threshold > 0) {
        // Simple scroll-position threshold
        window.addEventListener('scroll', () => {
          if (!shouldApplyFade()) { setVisible(true); return; }
          setVisible(window.scrollY < cfg.scrollFade.threshold);
        }, { passive: true });

      } else {
        // IntersectionObserver on #intro — hides when intro leaves viewport
        const intro = document.getElementById('intro')
                   || document.getElementById('header')
                   || document.querySelector('#wrapper > .bg');

        if (intro && 'IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (!shouldApplyFade()) { setVisible(true); return; }
              setVisible(entry.isIntersecting);
            },
            {
              // Fire when intro is at least 10% visible
              threshold: 0.10,
            }
          );
          observer.observe(intro);

          // Also re-evaluate on resize (e.g. rotation between portrait/landscape)
          window.addEventListener('resize', () => {
            if (!shouldApplyFade()) setVisible(true);
          }, { passive: true });

        } else {
          // Fallback: basic scroll listener at 80px threshold
          window.addEventListener('scroll', () => {
            if (!shouldApplyFade()) { setVisible(true); return; }
            setVisible(window.scrollY < 80);
          }, { passive: true });
        }
      }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function addLine (text, color, link) {
      while (output.children.length >= cfg.maxLines) {
        output.removeChild(output.firstChild);
      }
      const line = document.createElement('div');
      line.className = 'eryx-term__line';
      if (link) {
        const a = document.createElement('a');
        a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.className = 'eryx-term__link';
        a.textContent = text;
        if (color) a.style.color = color;
        line.appendChild(a);
      } else {
        line.textContent = text;
        if (color) line.style.color = color;
      }
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
      return line;
    }

    function typeLine (text, color, link) {
      return new Promise(resolve => {
        if (!text) { addLine('', color, link); resolve(); return; }

        const line = document.createElement('div');
        line.className = 'eryx-term__line';
        if (color) line.style.color = color;

        let content;
        if (link) {
          content = document.createElement('a');
          content.href = link; content.target = '_blank'; content.rel = 'noopener noreferrer';
          content.className = 'eryx-term__link';
          if (color) content.style.color = color;
          line.appendChild(content);
        } else {
          content = line;
        }

        while (output.children.length >= cfg.maxLines) output.removeChild(output.firstChild);

        const cursor = document.createElement('span');
        cursor.className = 'eryx-term__cursor';
        cursor.textContent = '▋';
        line.appendChild(cursor);
        output.appendChild(line);

        let i = 0;
        function typeChar () {
          if (i < text.length) {
            const char = document.createTextNode(text[i++]);
            if (link) { content.appendChild(char); }
            else       { line.insertBefore(char, cursor); }
            output.scrollTop = output.scrollHeight;
            setTimeout(typeChar, cfg.typeSpeed + (Math.random()-.5)*cfg.typeSpeed*.5);
          } else {
            cursor.remove();
            resolve();
          }
        }
        typeChar();
      });
    }

    function showResponse (lines) {
      if (!lines) return;
      lines.forEach(l => {
        if (l.text === '__CLEAR__') { output.innerHTML = ''; return; }
        addLine(l.text, l.color || '#0f8');
      });
      output.scrollTop = output.scrollHeight;
    }

    // ── Boot sequence ─────────────────────────────────────────────────────────
    async function runSequence () {
      for (const line of cfg.sequence) {
        if (line.delay) await sleep(line.delay);
        if (line.text === '') { addLine(''); await sleep(cfg.lineDelay * .4); continue; }
        await typeLine(line.linkLabel || line.text, line.color || '#0c0', line.link);
        await sleep(cfg.lineDelay);
      }
      if (cfg.showPrompt) {
        await sleep(cfg.lineDelay * 1.5);
        inputRow.style.display = 'flex';
        inputField.focus();
      }
    }

    // ── Input handler ─────────────────────────────────────────────────────────
    inputField.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const raw = inputField.value.trim();
      inputField.value = '';
      if (!raw) return;
      addLine(cfg.promptText + raw, '#fff');
      const cmd = raw.toLowerCase();
      const response = cfg.easterEggs[cmd] || cfg.easterEggs[raw];
      if (response) {
        showResponse(response);
      } else {
        const fallbacks = cfg.unknownResponses;
        showResponse(fallbacks[Math.floor(Math.random()*fallbacks.length)]);
      }
    });

    mount.addEventListener('click', () => { if (cfg.showPrompt) inputField.focus(); });

    runSequence();
  }

  /* ─── Utility ────────────────────────────────────────────────────────────── */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ─── Entry point ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
