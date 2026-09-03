document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navCollapsible');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('open');
      btn.classList.toggle('active');
    });
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.classList.remove('active');
      });
    });
  }

  // Services tab row: tabs reveal one at a time as their panel is reached,
  // and the tab matching the panel currently in view is highlighted active
  const tabs = document.querySelectorAll('.tab-bar .tab');
  const panels = document.querySelectorAll('.service-panel');
  if (tabs.length && panels.length) {
    const tabList = Array.from(tabs);
    const setActive = (id) => {
      const idx = tabList.findIndex(t => t.dataset.target === id);
      tabList.forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        if (i <= idx) t.classList.add('revealed');
      });
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    panels.forEach(p => observer.observe(p));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (!tab.classList.contains('revealed')) return;
        const target = document.getElementById(tab.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Scroll-triggered reveal animation: standalone .reveal elements, and
  // .reveal-group containers whose .reveal-item children stagger in together
  document.querySelectorAll('.reveal-group').forEach(group => {
    group.querySelectorAll('.reveal-item').forEach((el, i) => {
      el.style.setProperty('--i', i);
    });
  });
  const revealTargets = document.querySelectorAll('.reveal, .reveal-item');
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // About page side nav: highlight the section currently in view
  const sideLinks = document.querySelectorAll('.side-nav .side-link');
  const aboutSections = document.querySelectorAll('.about-section');
  if (sideLinks.length && aboutSections.length) {
    const sideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sideLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    aboutSections.forEach(s => sideObserver.observe(s));
  }

  // Playground moodboard: click or tap a photo to flip it and reveal the
  // note on the back. Simple state toggle, no drag physics to fight with.
  const pgCards = document.querySelectorAll('.pg-card');
  const progressEl = document.getElementById('pgProgress');
  const progressCount = document.getElementById('pgProgressCount');
  const progressTotal = document.getElementById('pgProgressTotal');
  const floatTag = document.querySelector('.pg-float-tag');

  if (pgCards.length && progressEl) {
    let flippedCount = 0;
    const total = pgCards.length;
    progressTotal.textContent = total;

    const fireConfetti = () => {
      const colors = ['#2F5CE0', '#F4C430', '#FF5CA6', '#2ECC71', '#C9C6F2', '#F7B8D6'];
      for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'pg-confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2.2 + Math.random() * 1.3) + 's';
        piece.style.animationDelay = (Math.random() * 0.4) + 's';
        document.body.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
      }
    };

    pgCards.forEach(card => {
      const flip = card.querySelector('.pg-flip');
      flip.addEventListener('click', () => {
        const wasFlipped = card.classList.contains('counted');
        card.classList.toggle('flipped');

        if (!wasFlipped && card.classList.contains('flipped')) {
          card.classList.add('counted');
          flippedCount++;
          progressCount.textContent = flippedCount;
          progressEl.classList.add('bump');
          setTimeout(() => progressEl.classList.remove('bump'), 220);

          if (flippedCount === total) {
            progressEl.classList.add('complete');
            progressEl.innerHTML = 'all found. nice.';
            if (floatTag) floatTag.textContent = 'you win';
            fireConfetti();
          }
        }
      });
    });
  }
});

// Service detail pages: any image carousel (deck types, dashboard samples, etc.)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pd-carousel, .svc-carousel').forEach(carousel => {
    const slides = carousel.querySelectorAll('.svc-car-slide');
    const dots = carousel.querySelectorAll('.svc-car-dot');
    let current = 0;
    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    };
    carousel.querySelector('.prev').addEventListener('click', () => goTo(current - 1));
    carousel.querySelector('.next').addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, idx) => dot.addEventListener('click', () => goTo(idx)));
  });
});

// Service detail pages: any accordion (What's Included, etc.)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pd-accordion').forEach(accordion => {
    const items = accordion.querySelectorAll('.pd-acc-item');
    items.forEach(item => {
      item.querySelector('.pd-acc-head').addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  });
});

// Contact page: two-step form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const step1 = form.querySelector('[data-step="1"]');
  const step2 = form.querySelector('[data-step="2"]');
  const successEl = form.querySelector('.contact-success');

  form.querySelector('.contact-next').addEventListener('click', () => {
    const textarea = step1.querySelector('textarea');
    if (!textarea.value.trim()) { textarea.focus(); return; }
    step1.hidden = true;
    step2.hidden = false;
  });

  form.querySelector('.contact-back').addEventListener('click', () => {
    step2.hidden = true;
    step1.hidden = false;
  });

  form.addEventListener('submit', (e) => {
    // If the Formspree endpoint hasn't been set up yet, don't attempt a real
    // submit, fall back to opening the user's email client instead.
    if (form.action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value;
      const email = form.querySelector('[name="email"]').value;
      const message = form.querySelector('[name="message"]').value;
      const subject = encodeURIComponent('New message from ' + name);
      const body = encodeURIComponent(message + '\\n\\n' + name + ' (' + email + ')');
      window.location.href = 'mailto:odimaa.horsfall@gmail.com?subject=' + subject + '&body=' + body;
      step2.hidden = true;
      successEl.hidden = false;
    }
    // Otherwise, once a real Formspree endpoint is set, let the form submit normally.
  });
});
