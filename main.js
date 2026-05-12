/* ============================================
   KIM LOU — PORTFOLIO  |  main.js
   ============================================ */

(function () {
  'use strict';

  /* ── Floating nav: show after scrolling past hero ── */

  const floatNav = document.getElementById('floatNav');
  const hero     = document.getElementById('top');
  const navLinks = document.querySelectorAll('.nav-link');

  const sections = [
    { id: 'top',             link: document.querySelector('[data-section="top"]') },
    { id: 'mywork-section',  link: document.querySelector('[data-section="mywork-section"]') },
    { id: 'about-section',   link: document.querySelector('[data-section="about-section"]') },
  ];

  function updateNav() {
    const scrollY = window.scrollY;

    // Show nav after scrolling 80% of hero height
    if (hero && scrollY > hero.offsetHeight * 0.8) {
      floatNav.classList.add('visible');
    } else {
      floatNav.classList.remove('visible');
    }

    // Active link highlight based on current section
    let current = 'top';
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el && scrollY >= el.offsetTop - 100) current = id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Disk fan interaction ── */

  const stage = document.getElementById('stage');

  if (stage) {
    stage.addEventListener('mouseenter', () => stage.classList.add('fanned'));
    stage.addEventListener('mouseleave', () => stage.classList.remove('fanned'));

    stage.querySelectorAll('.disk-slot').forEach((disk) => {
      disk.addEventListener('click', () => handleDiskClick(disk));
      disk.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!stage.classList.contains('fanned')) {
            stage.classList.add('fanned');
            disk.focus();
            return;
          }
          handleDiskClick(disk);
        }
      });
    });
  }

  function handleDiskClick(disk) {
    if (!stage.classList.contains('fanned')) return;
    const page = disk.dataset.page;
    if (page === 'mywork')  scrollToSection('mywork-section');
    if (page === 'about')   scrollToSection('about-section');
    if (page === 'contact') {
      scrollToSection('contact-section');
      setTimeout(copyEmail, 700);
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Email copy ── */

  const EMAIL      = 'klou.uiux@gmail.com'; // ← replace with your real email
  const emailBtn   = document.getElementById('emailBtn');
  const copiedNote = document.getElementById('copiedNote');

  if (emailBtn) emailBtn.addEventListener('click', copyEmail);

  function copyEmail() {
    const write = navigator.clipboard
      ? navigator.clipboard.writeText(EMAIL)
      : Promise.resolve(fallbackCopy(EMAIL));

    write.then(showCopied).catch(() => { fallbackCopy(EMAIL); showCopied(); });
  }

  function showCopied() {
    if (!emailBtn || !copiedNote) return;
    emailBtn.classList.add('copied');
    copiedNote.classList.add('show');
    setTimeout(() => { emailBtn.classList.remove('copied'); copiedNote.classList.remove('show'); }, 2800);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  }

  /* ── Scroll reveal for sections ── */

  const revealEls = document.querySelectorAll(
    '.section-inner, .project-card, .about-body, .skill-tag'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger children slightly
          setTimeout(() => entry.target.classList.add('in-view'), i * 40);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ── Project gif zoom on hover ──
     We clone the gif into a portal element appended directly to <body>.
     This is necessary because ancestor elements with `transform` (used by
     the scroll-reveal animation on .section-inner) would otherwise contain
     a position:fixed child, preventing it from anchoring to the viewport. */

  const projectMedias = document.querySelectorAll('.project-media');

  // Shared backdrop, sits directly on body (outside any transformed ancestor)
  const backdrop = document.createElement('div');
  backdrop.className = 'zoom-backdrop';
  document.body.appendChild(backdrop);

  // Container for the zoomed clone, also on body
  const zoomPortal = document.createElement('div');
  zoomPortal.className = 'zoom-portal';
  document.body.appendChild(zoomPortal);

  let activeMedia = null;
  let activeClone = null;

  function zoomIn(media, gif) {
    if (activeMedia === media) return;
    if (activeMedia) zoomOut();

    activeMedia = media;

    // Clone the gif into the portal
    const clone = gif.cloneNode(true);
    clone.classList.add('zoomed-clone');
    clone.classList.remove('reveal', 'in-view');
    clone.removeAttribute('loading');
    zoomPortal.appendChild(clone);
    activeClone = clone;

    // Trigger reflow then animate in
    requestAnimationFrame(() => {
      clone.classList.add('zoomed-in');
      backdrop.classList.add('active');
    });

    // Dim the original slightly so the card doesn't look empty
    gif.style.opacity = '0.15';
  }

  function zoomOut() {
    if (!activeMedia) return;
    const originalGif = activeMedia.querySelector('.project-gif');
    if (originalGif) originalGif.style.opacity = '';

    if (activeClone) {
      activeClone.remove();
      activeClone = null;
    }
    backdrop.classList.remove('active');
    activeMedia = null;
  }

  projectMedias.forEach(media => {
    const gif = media.querySelector('.project-gif');
    if (!gif) return;

    // Hover zoom preview on desktop. Click is left to the parent <a> tag
    // so the user can navigate to the case study page.
    media.addEventListener('mouseenter', () => zoomIn(media, gif));
    media.addEventListener('mouseleave', () => zoomOut());
  });

  backdrop.addEventListener('click', zoomOut);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') zoomOut();
  });

})();
