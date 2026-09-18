(() => {
  'use strict';

  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initHeader();
    initMobileNav();
    initSplitTitle();
    initReveal();
    initProgressBar();
    initMagnetic();
    initOrb();
    initWorksFilter();
    initStats();
    initSkillBars();
    initContactForm();
    document.getElementById('year').textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------------------ */
  /* Loader                                                              */
  /* ------------------------------------------------------------------ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const pctEl = document.getElementById('loaderPct');
    const barEl = document.getElementById('loaderBar');
    if (!loader) return;

    if (reduceMotion) {
      loader.classList.add('is-done');
      return;
    }

    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) progress = 100;
      pctEl.textContent = Math.floor(progress);
      barEl.style.width = progress + '%';
      if (progress < 100) {
        setTimeout(tick, 120 + Math.random() * 120);
      } else {
        setTimeout(() => loader.classList.add('is-done'), 300);
      }
    };
    tick();
  }

  /* ------------------------------------------------------------------ */
  /* Custom cursor                                                       */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouch) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('[data-cursor="hover"], a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
    document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-view'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-view'));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Header show/hide + active link + mobile toggle                      */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    let lastY = window.scrollY;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      if (y > lastY && y > 140) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }, { passive: true });

    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = ['top', 'works', 'about']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.nav === id);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { threshold: 0.5 });

    sections.forEach((s) => observer.observe(s));
  }

  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileNav');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });

    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ------------------------------------------------------------------ */
  /* Split hero title into animated characters                           */
  /* ------------------------------------------------------------------ */
  function initSplitTitle() {
    const title = document.getElementById('heroTitle');
    if (!title) return;
    const text = title.textContent.trim();
    title.textContent = '';
    let delay = 0;
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? ' ' : ch;
      if (!reduceMotion) {
        span.style.animationDelay = (0.5 + delay) + 's';
        delay += 0.045;
      } else {
        span.style.opacity = '1';
        span.style.transform = 'none';
      }
      title.appendChild(span);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll                                                     */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-line');
    if (!els.length) return;

    if (reduceMotion) {
      els.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const groups = new Map();
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = groups.get(el.parentElement) || [el];
        const index = siblings.indexOf(el);
        el.style.transitionDelay = (index * 0.08) + 's';
        el.classList.add('in-view');
        observer.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    els.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Scroll progress bar                                                 */
  /* ------------------------------------------------------------------ */
  function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    let ticking = false;

    const update = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                    */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero orb — low-poly icosphere on canvas                             */
  /* ------------------------------------------------------------------ */
  function initOrb() {
    const canvas = document.getElementById('orb');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { vertices, faces } = buildIcosphere(2);
    const faceColors = faces.map(() => Math.random());

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let targetTiltX = 0, targetTiltY = 0, tiltX = 0, tiltY = 0;
    window.addEventListener('mousemove', (e) => {
      targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * -0.6;
    });

    let angle = 0;
    const colorA = [91, 75, 245];   // accent
    const colorB = [255, 79, 147];  // accent-2

    const rotateAndProject = (v, ax, ay) => {
      let { x, y, z } = v;
      // rotate around Y
      let cosY = Math.cos(ay), sinY = Math.sin(ay);
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;
      // rotate around X
      let cosX = Math.cos(ax), sinX = Math.sin(ax);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;
      return { x: x1, y: y1, z: z2 };
    };

    const draw = () => {
      angle += reduceMotion ? 0 : 0.0028;
      tiltX += (targetTiltX - tiltX) * 0.04;
      tiltY += (targetTiltY - tiltY) * 0.04;

      const cx = width / 2, cy = height / 2;
      const radius = Math.min(width, height) / 2 * 0.86;
      const focal = 2.4;

      const projected = vertices.map((v) => {
        const r = rotateAndProject(v, tiltX, angle + tiltY);
        const scale = focal / (focal - r.z);
        return {
          x: cx + r.x * radius * scale,
          y: cy + r.y * radius * scale,
          z: r.z,
        };
      });

      ctx.clearRect(0, 0, width, height);

      const drawable = faces.map((f, i) => {
        const [a, b, c] = f;
        const pa = projected[a], pb = projected[b], pc = projected[c];
        const avgZ = (pa.z + pb.z + pc.z) / 3;
        // approximate outward normal for a sphere = averaged vertex position
        const nz = (pa.z + pb.z + pc.z) / 3;
        return { pa, pb, pc, avgZ, nz, t: faceColors[i] };
      }).filter((f) => f.nz > -0.15);

      drawable.sort((f1, f2) => f1.avgZ - f2.avgZ);

      drawable.forEach((f) => {
        const depth = (f.avgZ + 1) / 2; // 0..1
        const mix = f.t;
        const r = colorA[0] + (colorB[0] - colorA[0]) * mix;
        const g = colorA[1] + (colorB[1] - colorA[1]) * mix;
        const b = colorA[2] + (colorB[2] - colorA[2]) * mix;
        const alpha = 0.12 + depth * 0.55;

        ctx.beginPath();
        ctx.moveTo(f.pa.x, f.pa.y);
        ctx.lineTo(f.pb.x, f.pb.y);
        ctx.lineTo(f.pc.x, f.pc.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r|0}, ${g|0}, ${b|0}, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * depth})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      requestAnimationFrame(draw);
    };
    draw();
  }

  function buildIcosphere(subdivisions) {
    const t = (1 + Math.sqrt(5)) / 2;
    let verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(normalize);

    let faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    const cache = new Map();
    const midpoint = (i1, i2) => {
      const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
      if (cache.has(key)) return cache.get(key);
      const v1 = verts[i1], v2 = verts[i2];
      const mid = normalize([
        (v1[0] + v2[0]) / 2,
        (v1[1] + v2[1]) / 2,
        (v1[2] + v2[2]) / 2,
      ]);
      verts.push(mid);
      const idx = verts.length - 1;
      cache.set(key, idx);
      return idx;
    };

    for (let s = 0; s < subdivisions; s++) {
      const newFaces = [];
      faces.forEach(([a, b, c]) => {
        const ab = midpoint(a, b);
        const bc = midpoint(b, c);
        const ca = midpoint(c, a);
        newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      });
      faces = newFaces;
    }

    return {
      vertices: verts.map(([x, y, z]) => ({ x, y, z })),
      faces,
    };
  }

  function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  /* ------------------------------------------------------------------ */
  /* Works filter                                                        */
  /* ------------------------------------------------------------------ */
  function initWorksFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.work-card');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          const cats = (card.dataset.category || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          if (show) {
            card.style.display = '';
            requestAnimationFrame(() => card.classList.remove('is-hidden'));
          } else {
            card.classList.add('is-hidden');
            setTimeout(() => {
              if (card.classList.contains('is-hidden')) card.style.display = 'none';
            }, 400);
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Stat counters                                                       */
  /* ------------------------------------------------------------------ */
  function initStats() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion) {
        el.textContent = target;
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    nums.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Skill bars                                                          */
  /* ------------------------------------------------------------------ */
  function initSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.width = el.dataset.level + '%';
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    fills.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Contact form — client-side validation + mailto submit               */
  /* ------------------------------------------------------------------ */
  const CONTACT_EMAIL = 'cityfor0104@gmail.com'; // 送信先のメールアドレス。必要に応じて変更してください。

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const submitBtn = form.querySelector('.btn-submit');

    const validators = {
      name: (v) => v.trim().length > 0,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: (v) => v.trim().length > 0,
    };

    const setError = (field, show) => {
      const wrapper = field.closest('.field');
      if (wrapper) wrapper.classList.toggle('is-invalid', show);
    };

    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => {
        setError(field, !validators[name](field.value));
      });
      field.addEventListener('input', () => {
        if (field.closest('.field').classList.contains('is-invalid')) {
          setError(field, !validators[name](field.value));
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        const ok = validators[name](field.value);
        setError(field, !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        showToast('入力内容をご確認ください。');
        return;
      }

      submitBtn.classList.add('is-loading');

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const subject = form.elements.subject.value.trim() || 'Webサイトからのお問い合わせ';
      const message = form.elements.message.value.trim();

      const body = `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        window.location.href = mailto;
        showToast('メールアプリが起動します。内容をご確認のうえ送信してください。');
        form.reset();
      }, 500);
    });
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 3800);
  }

})();
