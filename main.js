// ===== LOADING SCREEN (desktop only) =====
const isMobile = window.innerWidth < 768;
const loader = document.getElementById('loader');
const loaderVideo = document.getElementById('loader-video');
const loaderBar = document.getElementById('loader-bar');

if (isMobile) {
  if (loader) loader.remove();
  document.body.style.overflow = '';
} else {
  let progressInterval;

  function dismissLoader() {
    if (!loader || loader.dataset.dismissed) return;
    loader.dataset.dismissed = '1';
    if (progressInterval) clearInterval(progressInterval);
    if (loaderBar) loaderBar.style.width = '100%';
    loader.style.transition = 'opacity 0.6s ease';
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    setTimeout(() => { if (loader) loader.remove(); }, 700);
    initParticles();
    initHeroReveal();
  }

  if (loaderVideo) {
    loaderVideo.muted = true;
    loaderVideo.play().catch(() => { setTimeout(dismissLoader, 1000); });
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

    loaderVideo.addEventListener('ended', dismissLoader);

    progressInterval = setInterval(() => {
      if (loaderVideo.duration) {
        const pct = (loaderVideo.currentTime / loaderVideo.duration) * 100;
        if (loaderBar) loaderBar.style.width = pct + '%';
      }
      if (loaderVideo.ended) clearInterval(progressInterval);
    }, 100);
  } else {
    setTimeout(dismissLoader, 500);
  }

  setTimeout(dismissLoader, 8000);
  document.body.style.overflow = 'hidden';
}

// ===== SOUND EFFECTS =====
const sfxPool = {};
function playSfx(name, vol = 0.3) {
  try {
    if (!sfxPool[name]) {
      sfxPool[name] = new Audio(`verity/sounds/${name}.ogg`);
      sfxPool[name].preload = 'auto';
    }
    const s = sfxPool[name].cloneNode();
    s.volume = vol;
    s.play().catch(() => {});
  } catch(e) {}
}

// ===== ELEMENTS =====
const vignette = document.getElementById('vignette');
const scrollProgress = document.getElementById('scroll-progress');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const heroGlow = document.getElementById('mouse-glow');

function getScrollProgress() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  return Math.min(scrollY / maxScroll, 1);
}

function onScroll() {
  const progress = getScrollProgress();
  vignette.style.opacity = Math.max(0, (progress - 0.5) * 1.4);

  if (scrollProgress) scrollProgress.style.width = (progress * 100) + '%';

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }

  // Parallax orbs
  document.querySelectorAll('.parallax-orb').forEach(orb => {
    const speed = parseFloat(orb.dataset.speed) || 0.03;
    orb.style.transform = `translateY(${window.scrollY * speed * -50}px)`;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== MOUSE GLOW =====
if (heroGlow) {
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    heroGlow.style.left = (e.clientX - rect.left) + 'px';
    heroGlow.style.top = (e.clientY - rect.top) + 'px';
    heroGlow.style.opacity = '1';
  });
  hero.addEventListener('mouseleave', () => { heroGlow.style.opacity = '0'; });
}

// ===== HERO REVEAL =====
function initHeroReveal() {
  const lines = document.querySelectorAll('.hero-line');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), 200 + i * 150);
  });
}
if (isMobile) {
  setTimeout(initHeroReveal, 100);
}

// ===== BACK TO TOP =====
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    playSfx('retro_coin', 0.15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.background = window.scrollY > 50 ? 'rgba(7,7,9,0.88)' : 'rgba(14,14,18,0.78)';
}, { passive: true });

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

function hideMenu() {
  menuOpen = false;
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    setTimeout(() => mobileMenu.classList.add('hidden'), 250);
  }
}

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    playSfx('box_click', 0.15);
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.classList.remove('hidden');
      requestAnimationFrame(() => mobileMenu.classList.add('open'));
    } else {
      hideMenu();
    }
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { playSfx('retro_coin', 0.1); hideMenu(); });
  });
}

// ===== REVEAL ON SCROLL =====
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => revealObs.observe(el));

// ===== STATS COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('[data-count]');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      playSfx('impact_0', 0.1);
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
const navDlBtn = document.getElementById('nav-dl-btn');
const specsDownloadBtn = document.querySelector('.specs-download-btn');
const toastOverlay = document.getElementById('toast-overlay');
const toastClose = document.getElementById('toast-close');

function showToast() {
  playSfx('box_open', 0.2);
  if (toastOverlay) toastOverlay.classList.add('show');
}
function hideToast() {
  playSfx('box_click', 0.15);
  if (toastOverlay) toastOverlay.classList.remove('show');
}

if (downloadBtn) downloadBtn.addEventListener('click', (e) => { e.preventDefault(); showToast(); });
if (mobileDownloadBtn) mobileDownloadBtn.addEventListener('click', (e) => { e.preventDefault(); hideMenu(); showToast(); });
if (navDlBtn) navDlBtn.addEventListener('click', (e) => { e.preventDefault(); showToast(); });
if (specsDownloadBtn) specsDownloadBtn.addEventListener('click', (e) => { e.preventDefault(); showToast(); });
if (toastClose) toastClose.addEventListener('click', hideToast);
if (toastOverlay) toastOverlay.addEventListener('click', (e) => { if (e.target === toastOverlay) hideToast(); });

// ===== NAVBAR LOGO CLICK SOUND =====
let logoPlaying = false;
const navbarLogo = document.querySelector('#navbar img');
if (navbarLogo) {
  navbarLogo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (logoPlaying || document.getElementById('loader')) return;
    logoPlaying = true;
    playSfx('intro', 0.4);
    setTimeout(() => { logoPlaying = false; }, 2000);
  });
}

// ===== 3D TILT ON CARDS =====
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  });
  card.addEventListener('mouseenter', () => { playSfx('box_click', 0.08); });
});

// ===== TEXT SCRAMBLE EFFECT =====
const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
function scrambleText(el) {
  const original = el.dataset.originalText || el.textContent;
  el.dataset.originalText = original;
  let iterations = 0;
  const maxIterations = original.length;
  const interval = setInterval(() => {
    el.textContent = original.split('').map((char, i) => {
      if (i < iterations) return char;
      return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }).join('');
    iterations += 1;
    if (iterations > maxIterations) {
      clearInterval(interval);
      el.textContent = original;
    }
  }, 30);
}

const scrambleEls = document.querySelectorAll('[data-scramble]');
const scrambleObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      scrambleText(e.target);
      scrambleObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
scrambleEls.forEach(el => scrambleObs.observe(el));

// ===== FACE CYCLING IN STORY =====
const storyFace = document.getElementById('story-face');
if (storyFace) {
  const faces = [
    'verity/textures/happy.png',
    'verity/textures/happy_talking.png',
    'verity/textures/serious_1.png',
    'verity/textures/serious_2.png',
    'verity/textures/serious_3.png',
    'verity/textures/evil.png',
    'verity/textures/evil_talking.png',
    'verity/textures/crazy.png',
  ];
  let faceIdx = 0;
  setInterval(() => {
    faceIdx = (faceIdx + 1) % faces.length;
    storyFace.style.opacity = '0';
    storyFace.style.transform = 'scale(0.8) rotate(-10deg)';
    setTimeout(() => {
      storyFace.src = faces[faceIdx];
      storyFace.style.opacity = '1';
      storyFace.style.transform = 'scale(1) rotate(0deg)';
    }, 400);
  }, 3000);
}

// ===== PARTICLE SYSTEM =====
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.15;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.fadeSpeed = Math.random() * 0.003 + 0.001;
      this.growing = Math.random() > 0.5;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.growing) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 0.5) this.growing = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0) this.reset();
      }
      if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250, 204, 21, ${this.opacity})`;
      ctx.fill();
    }
  }

  const count = isMobile ? 35 : 60;
  particles = Array.from({ length: count }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// Init particles on mobile immediately
if (isMobile) {
  setTimeout(initParticles, 300);
}

// ===== NAV LINK HOVER SOUNDS =====
navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => playSfx('box_click', 0.06));
});

// ===== SPEC ROW STAGGER =====
const specRows = document.querySelectorAll('.spec-row');
const specRowObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateX(0)';
      }, i * 80);
      specRowObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
specRows.forEach(row => {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';
  row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  specRowObs.observe(row);
});

// ===== HERO VERITY FACE ROTATION =====
const heroFace = document.getElementById('hero-verity-img');
if (heroFace) {
  const heroFaces = [
    'verity/textures/happy.png',
    'verity/textures/happy_talking.png',
    'verity/textures/neutral.png',
    'verity/textures/happy.png',
  ];
  let hfIdx = 0;
  setInterval(() => {
    hfIdx = (hfIdx + 1) % heroFaces.length;
    heroFace.style.transform = 'rotate(360deg) scale(0.8)';
    setTimeout(() => {
      heroFace.src = heroFaces[hfIdx];
      heroFace.style.transform = 'rotate(0deg) scale(1)';
    }, 400);
  }, 5000);
}
