// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

// Année dans le pied de page
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Carrousel : fondu enchaîné toutes les 3 secondes
const slides = document.querySelectorAll('.slide');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (slides.length > 1 && !reduceMotion) {
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, 3000);
}

// Onglets (Méthode 1 / Méthode 2)
const tabs = document.querySelectorAll('.tab');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
  });
});

// Sélecteur de pièce (Salon / Cuisine / Chambre), un par méthode
document.querySelectorAll('.rooms').forEach((group) => {
  const buttons = group.querySelectorAll('.room');

  buttons.forEach((room) => {
    room.addEventListener('click', () => {
      buttons.forEach((r) => {
        const active = r === room;
        r.classList.toggle('is-active', active);
        r.setAttribute('aria-selected', active);
        r.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(r.getAttribute('aria-controls'));
        panel.hidden = !active;
        if (active) panel.querySelectorAll('.reveal').forEach(playReveal);
      });
    });
  });
});

// Méthode 2 : la photo Studio Témoin se découvre, puis se compare au curseur
function setReveal(el, pos) {
  el.style.setProperty('--pos', pos + '%');
  el.querySelector('.reveal-range').value = pos;
}

function playReveal(el) {
  cancelAnimationFrame(el._anim);
  if (reduceMotion) return setReveal(el, 25);

  const from = 100;
  const to = 25; // 75 % de la photo Studio Témoin visible
  const duration = 1800;
  const start = performance.now();
  setReveal(el, from);

  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    setReveal(el, from + (to - from) * eased);
    if (t < 1) el._anim = requestAnimationFrame(step);
  };
  el._anim = requestAnimationFrame(step);
}

const reveals = document.querySelectorAll('.reveal');

reveals.forEach((el) => {
  el.querySelector('.reveal-range').addEventListener('input', (e) => {
    cancelAnimationFrame(el._anim);
    setReveal(el, e.target.value);
  });
});

// Lance l'animation quand la photo apparaît à l'écran
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target._played) {
      entry.target._played = true;
      playReveal(entry.target);
    }
  });
}, { threshold: 0.4 });

reveals.forEach((el) => revealObserver.observe(el));

// Rejoue l'animation en ouvrant l'onglet Méthode 2
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.querySelectorAll('.room-panel:not([hidden]) .reveal').forEach(playReveal);
  });
});
