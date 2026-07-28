// ===== LOADING SCREEN (desktop only) =====
const isMobile = window.innerWidth < 768;
const loader = document.getElementById('loader');
const loaderVideo = document.getElementById('loader-video');
const loaderText = document.getElementById('loader-text');
const loaderBar = document.getElementById('loader-bar');
const loaderStatus = document.getElementById('loader-status');
const loaderUI = document.getElementById('loader-ui');

if (isMobile) {
  // Mobile: skip loader entirely, show site immediately
  if (loader) loader.remove();
  document.body.style.overflow = '';
} else {
  // Desktop: play loader video
  loaderVideo.muted = true;
  loaderVideo.play().catch(() => {});
  loaderVideo.loop = false;

  let audioUnmuted = false;
  function unmuteOnGesture() {
    if (audioUnmuted) return;
    audioUnmuted = true;
    loaderVideo.muted = false;
    document.removeEventListener('click', unmuteOnGesture);
    document.removeEventListener('keydown', unmuteOnGesture);
    document.removeEventListener('touchstart', unmuteOnGesture);
  }
  document.addEventListener('click', unmuteOnGesture);
  document.addEventListener('keydown', unmuteOnGesture);
  document.addEventListener('touchstart', unmuteOnGesture);

  loaderVideo.addEventListener('ended', () => {
    loaderBar.style.width = '100%';
    setTimeout(() => {
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      document.body.style.overflow = '';
      setTimeout(() => loader.remove(), 600);
    }, 200);
  });

  const progressInterval = setInterval(() => {
    if (loaderVideo.duration) {
      const pct = (loaderVideo.currentTime / loaderVideo.duration) * 100;
      loaderBar.style.width = pct + '%';
    }
    if (loaderVideo.ended) clearInterval(progressInterval);
  }, 100);

  document.body.style.overflow = 'hidden';
}

// ===== ELEMENTS =====
const vignette = document.getElementById('vignette');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function getScrollProgress() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  return Math.min(scrollY / maxScroll, 1);
}

function onScroll() {
  const progress = getScrollProgress();
  vignette.style.opacity = Math.max(0, (progress - 0.5) * 1.4);

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== BACK TO TOP =====
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.style.background = window.scrollY > 50 ? 'rgba(7,7,9,0.88)' : 'rgba(14,14,18,0.78)';
}, { passive: true });

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

function hideMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  setTimeout(() => mobileMenu.classList.add('hidden'), 250);
}

mobileToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
  } else {
    hideMenu();
  }
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', hideMenu);
});

// ===== REVEAL ON SCROLL =====
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => revealObs.observe(el));

// ===== STATS COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('[data-count]');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = target % 1 !== 0;
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      statObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNumbers.forEach(el => statObs.observe(el));

// ===== ACTIVE NAV LINK =====
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('text-white', active);
        link.classList.toggle('text-zinc-400', !active);
      });
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => sectionObs.observe(s));

// ===== DOWNLOAD BUTTON POPUP =====
const downloadBtn = document.getElementById('download-btn');
const mobileDownloadBtn = document.getElementById('mobile-download-btn');
const toastOverlay = document.getElementById('toast-overlay');
const toastClose = document.getElementById('toast-close');

function showToast() {
  if (toastOverlay) toastOverlay.classList.add('show');
}
function hideToast() {
  if (toastOverlay) toastOverlay.classList.remove('show');
}

if (downloadBtn) downloadBtn.addEventListener('click', (e) => { e.preventDefault(); showToast(); });
if (mobileDownloadBtn) mobileDownloadBtn.addEventListener('click', (e) => { e.preventDefault(); hideMenu(); showToast(); });
if (toastClose) toastClose.addEventListener('click', hideToast);
if (toastOverlay) toastOverlay.addEventListener('click', (e) => { if (e.target === toastOverlay) hideToast(); });

// ===== NAVBAR LOGO CLICK SOUND =====
let logoAudio = null;
let logoPlaying = false;
const navbarLogo = document.querySelector('#navbar img');
if (navbarLogo) {
  navbarLogo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (logoPlaying || document.getElementById('loader')) return;
    logoPlaying = true;
    logoAudio = new Audio('verity/sounds/intro.ogg');
    logoAudio.volume = 0.5;
    logoAudio.play().catch(() => {});
    logoAudio.addEventListener('ended', () => { logoPlaying = false; });
    logoAudio.addEventListener('error', () => { logoPlaying = false; });
  });
}
