/* ── Particle canvas ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
    };
  }

  function initParticles() {
    const count = Math.min(120, Math.round((W * H) / 14000));
    particles = Array.from({ length: count }, mkParticle);
  }

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.x += dx / dist * 1.5;
        p.y += dy / dist * 1.5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,170,${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const qx = p.x - q.x, qy = p.y - q.y;
        const d = Math.sqrt(qx * qx + qy * qy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,255,170,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize(); initParticles(); draw();
})();

/* ── Typewriter (landing only) ── */
(function () {
  const tw = document.getElementById('typewriter');
  if (!tw) return;
  const phrases = JSON.parse(tw.dataset.phrases || '[]');
  if (!phrases.length) return;

  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      tw.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 60 + Math.random() * 40);
    } else {
      tw.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 30 + Math.random() * 20);
    }
  }
  setTimeout(tick, 800);
})();

/* ── Scroll reveal ── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

/* ── Click-to-copy (Discord handle, etc.) ── */
(function () {
  const targets = document.querySelectorAll('[data-copy]');
  if (!targets.length) return;

  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  targets.forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.dataset.copy;
      try {
        await copy(text);
        el.classList.add('copied');
        clearTimeout(el._copyTimer);
        el._copyTimer = setTimeout(() => el.classList.remove('copied'), 1600);
      } catch (err) {
        console.warn('clipboard copy failed:', err);
      }
    });
  });
})();

/* ── Active nav highlight (landing in-page sections) ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach((s) => navObserver.observe(s));
})();
