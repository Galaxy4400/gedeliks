//===============================================================
const initMobileMenu = () => {
  let isOpen = false;

  const icon = document.querySelector('[data-menu-icon]');
  const menu = document.querySelector('[data-mobile-menu]');
  const closeBtn = document.querySelector('[data-menu-close]');

  const toggleMenu = (state) => {
    isOpen = state;

    icon.toggleAttribute('data-active', isOpen);
    menu.toggleAttribute('data-active', isOpen);
    document.body.classList.toggle('overflow-hidden', isOpen);
  };

  icon?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!isOpen);
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(false);
  });

  menu?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    if (isOpen) toggleMenu(false);
  });
};

//===============================================================
const initLazyLoad = () => {
  new LazyLoad({
    elements_selector: '[data-lazy]',
  });
};

//===============================================================
const initSpoilers = () => {
  const groups = document.querySelectorAll('[data-spoiler]');
  // id спойлер-айтема -> функция, раскрывающая именно его (с учётом аккордеона).
  // Заполняется ниже, используется хендлером якорных ссылок в конце функции.
  const openById = new Map();

  groups.forEach((group) => {
    const accordion = group.hasAttribute('data-spoiler-accordion');
    const items = Array.from(group.querySelectorAll('[data-spoiler-item]'));

    const openItem = (item) => {
      const content = item.querySelector('[data-spoiler-content]');
      item.setAttribute('aria-expanded', 'true');
      if (content) {
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    };

    const closeItem = (item) => {
      const content = item.querySelector('[data-spoiler-content]');
      item.setAttribute('aria-expanded', 'false');
      if (content) {
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0';
      }
    };

    const openExclusive = (item) => {
      if (accordion) {
        items.forEach((other) => {
          if (other !== item) closeItem(other);
        });
      }
      openItem(item);
    };

    items.forEach((item) => {
      const button = item.querySelector('[data-spoiler-button]');
      const isOpenByDefault = item.getAttribute('aria-expanded') === 'true';

      if (isOpenByDefault) {
        openItem(item);
      } else {
        closeItem(item);
      }

      button?.addEventListener('click', () => {
        const isActive = item.getAttribute('aria-expanded') === 'true';

        if (isActive) {
          closeItem(item);
        } else {
          openExclusive(item);
        }
      });

      if (item.id) {
        openById.set(item.id, () => openExclusive(item));
      }
    });
  });

  // Якоря вида <a href="#id-спойлер-айтема">: раскрывают нужный пункт и скроллят к нему.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    const open = openById.get(id);
    if (!open) return;

    e.preventDefault();

    const target = document.getElementById(id);
    // scrollIntoView сам не знает про fixed-хедер — целится в самый верх экрана,
    // и хедер перекрывает начало открывшегося пункта. Скроллим вручную с отступом
    // на его высоту + небольшой зазор, чтобы заголовок пункта не прилипал впритык
    const scrollToTarget = () => {
      if (!target) return;
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const extraGap = 20;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - extraGap;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    const wasOpen = target?.getAttribute('aria-expanded') === 'true';

    open();

    // высота уже была той же — max-height не меняется, transitionend не наступит
    if (wasOpen) {
      scrollToTarget();
      return;
    }

    // content.style.maxHeight анимируется transition-ом (см. tokens/animations.css,
    // 300ms), а раскрытие аккордеона ещё и схлопывает предыдущий открытый пункт —
    // скроллим только когда раскладка досчиталась, иначе scrollIntoView целится в
    // позицию до анимации, и часть открывшегося контента остаётся выше экрана
    const content = target?.querySelector('[data-spoiler-content]');
    if (!content) {
      scrollToTarget();
      return;
    }

    let scrolled = false;
    const scrollOnce = () => {
      if (scrolled) return;
      scrolled = true;
      scrollToTarget();
    };
    content.addEventListener('transitionend', scrollOnce, { once: true });
    setTimeout(scrollOnce, 350); // страховка, если transitionend не сработает
  });
};

//===============================================================
const initSearch = () => {
  let isOpen = false;

  const panel = document.querySelector('[data-search-container]');
  const openBtn = document.querySelector('[data-search-open]');
  const closeBtn = document.querySelector('[data-search-close]');
  const clearBtn = document.querySelector('[data-search-clear]');
  const input = document.querySelector('[data-search-input]');

  if (!panel) return;

  const toggle = (state) => {
    isOpen = state;
    panel.toggleAttribute('data-active', isOpen);
  };

  openBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(true);
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(false);
  });

  clearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (input) {
      input.value = '';
      input.focus();
    }
  });

  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    if (isOpen) toggle(false);
  });
};

//===============================================================
const initModals = () => {
  const closeAll = () => {
    document.querySelectorAll('[data-modal]').forEach((m) => m.removeAttribute('data-active'));
    document.body.removeAttribute('data-modal-lock');
    document.body.style.removeProperty('--scrollbar-width');
  };

  const openModal = (name) => {
    closeAll();
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    modal.setAttribute('data-active', '');
    document.body.setAttribute('data-modal-lock', '');
  };

  document.addEventListener('click', (e) => {
		const target = e.target;

    const openTrigger = target.closest('[data-modal-open]');
    if (openTrigger) {
      openModal(openTrigger.dataset.modalOpen);
      return;
    }

    if (target.closest('[data-modal-close]')) {
      closeAll();
      return;
    }

    if (target.hasAttribute('data-modal') && target.hasAttribute('data-active')) {
      closeAll();
    }
  });
};

//===============================================================
const initVideo = () => {
  const players = document.querySelectorAll('[data-video]');

  players.forEach((player) => {
    const video = player.querySelector('[data-video-media]');
    if (!video) return;

    player.addEventListener('click', () => {
      if (player.hasAttribute('data-active')) return;

      player.setAttribute('data-active', '');
      video.controls = true;
      video.play();
    });

    video.addEventListener('ended', () => {
      player.removeAttribute('data-active');
      video.controls = false;
      video.currentTime = 0;
    });
  });
};

//===============================================================
// Фоновое зацикленное видео (без кнопки/controls) — play/pause по видимости, а не autoplay
// на всю жизнь страницы. prefers-reduced-motion — не запускаем вовсе, как и Lenis.
const initVideoLoop = () => {
  const videos = document.querySelectorAll('[data-video-loop]');
  if (!videos.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play();
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.25 },
  );

  videos.forEach((video) => observer.observe(video));
};

//===============================================================
initLazyLoad();
initMobileMenu();
initSearch();
initSpoilers();
initModals();
initVideo();
initVideoLoop();