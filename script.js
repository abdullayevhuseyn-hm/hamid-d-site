(() => {
  const WHATSAPP = '994000000000'; // <-- WhatsApp nömrənizi buraya yazın (994 ilə, + olmadan)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  document.body.classList.add('loading');
  const done = () => {
    document.getElementById('preloader').classList.add('done');
    document.body.classList.remove('loading');
  };
  window.addEventListener('load', () => setTimeout(done, 500));
  setTimeout(done, 3500); // ehtiyat

  /* ---------- 3D Starfield (warp) ---------- */
  const cv = document.getElementById('space');
  const ctx = cv.getContext('2d');
  let W, H, stars = [], speed = 0.6, target = 0.6, mx = 0, my = 0;
  const COUNT = innerWidth < 700 ? 350 : 800;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const mk = (z) => ({ x: (Math.random() - .5) * 2000, y: (Math.random() - .5) * 2000, z: z ?? Math.random() * 1000, pz: 0,
    c: Math.random() < .12 ? '255,60,80' : Math.random() < .2 ? '120,220,255' : '255,255,255' });
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < COUNT; i++) stars.push(mk());

  let lastY = scrollY;
  addEventListener('scroll', () => {
    const d = Math.abs(scrollY - lastY); lastY = scrollY;
    target = Math.min(0.6 + d * 0.25, 18);
  }, { passive: true });

  const draw = () => {
    speed += (target - speed) * 0.08;
    target += (0.6 - target) * 0.05;
    ctx.fillStyle = 'rgba(5,5,11,0.35)';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2 + mx * 40, cy = H / 2 + my * 40;
    for (const s of stars) {
      s.pz = s.z;
      s.z -= speed * 2;
      if (s.z < 1) { Object.assign(s, mk(1000)); s.pz = 1000; continue; }
      const k = 500 / s.z, pk = 500 / s.pz;
      const x = s.x * k + cx, y = s.y * k + cy;
      const px = s.x * pk + cx, py = s.y * pk + cy;
      if (x < 0 || x > W || y < 0 || y > H) continue;
      const a = Math.min(1, (1000 - s.z) / 700);
      const r = Math.max(0.3, (1 - s.z / 1000) * 2.2);
      ctx.strokeStyle = `rgba(${s.c},${a})`;
      ctx.lineWidth = r;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  ctx.fillStyle = '#05050b'; ctx.fillRect(0, 0, W, H);
  draw();

  /* ---------- Cursor glow + parallax ---------- */
  const glow = document.getElementById('cursorGlow');
  if (!fine) glow.style.display = 'none';
  addEventListener('mousemove', (e) => {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
  });

  /* ---------- Hero 3D cover ---------- */
  const cover = document.getElementById('cover3d');
  const hv = document.getElementById('heroVisual');
  if (fine && !reduce) {
    hv.addEventListener('mousemove', (e) => {
      const r = hv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cover.style.transform = `rotateY(${(x - .5) * 22}deg) rotateX(${(.5 - y) * 16}deg) translateZ(30px)`;
      cover.style.setProperty('--mx', x * 100 + '%');
      cover.style.setProperty('--my', y * 100 + '%');
    });
    hv.addEventListener('mouseleave', () => cover.style.transform = '');
  }

  /* ---------- Tilt cards ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 12}deg) rotateY(${(x - .5) * 14}deg) translateZ(10px)`;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

  const links = [...menu.querySelectorAll('a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  const lineFill = document.getElementById('lineFill');
  const steps = document.getElementById('process');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    let cur = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === cur));
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .8 - r.top) / (r.height * .7)));
    lineFill.style.width = p * 100 + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Reveal + counters ---------- */
  const fmt = (n) => n.toLocaleString('az-AZ').replace(/,/g, ' ');
  const count = (el) => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(end * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = Math.max(0, sibs.indexOf(el)) * 90 + 'ms';
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(el);
      setTimeout(() => el.style.transitionDelay = '', 1500);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Form -> WhatsApp ---------- */
  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = `Salam, HAMID-D Auto Service!%0A` +
      `Ad: ${encodeURIComponent(f.get('name'))}%0A` +
      `Telefon: ${encodeURIComponent(f.get('phone'))}%0A` +
      `Avtomobil: ${encodeURIComponent(f.get('car') || '-')}%0A` +
      `Xidmət: ${encodeURIComponent(f.get('service'))}%0A` +
      `Qeyd: ${encodeURIComponent(f.get('note') || '-')}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
