document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const catalogBtn = document.getElementById('catalogBtn');
  const mobileCatalogBtn = document.getElementById('mobileCatalogBtn');
  const catalogMenu = document.getElementById('catalogMenu');
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('overlay');

  function measureHeaderHeight() {
    document.documentElement.style.setProperty(
      '--header-height',
      `${header.offsetHeight}px`
    );
  }
  measureHeaderHeight();
  window.addEventListener('resize', measureHeaderHeight);

  function lockScroll(shouldLock) {
    document.body.classList.toggle('no-scroll', shouldLock);
  }

  function setExpanded(isOpen) {
    catalogBtn.setAttribute('aria-expanded', isOpen);
    mobileCatalogBtn.setAttribute('aria-expanded', isOpen);
  }

  function toggleCatalog() {
    const isOpen = catalogMenu.hidden;

    if (isOpen) {
      mobileDrawer.hidden = true;
      burgerBtn.setAttribute('aria-expanded', false);
      measureHeaderHeight();
    }

    catalogMenu.hidden = !isOpen;
    overlay.hidden = !isOpen;
    setExpanded(isOpen);
    lockScroll(isOpen);
  }

  function toggleDrawer() {
    const isOpen = mobileDrawer.hidden;
    mobileDrawer.hidden = !isOpen;
    overlay.hidden = !isOpen;
    burgerBtn.setAttribute('aria-expanded', isOpen);
    lockScroll(isOpen);

    if (isOpen) {
      catalogMenu.hidden = true;
      setExpanded(false);
    }
  }

  function closeAll() {
    catalogMenu.hidden = true;
    mobileDrawer.hidden = true;
    overlay.hidden = true;
    setExpanded(false);
    burgerBtn.setAttribute('aria-expanded', false);
    lockScroll(false);
  }

  if (catalogBtn) catalogBtn.addEventListener('click', toggleCatalog);
  if (mobileCatalogBtn) mobileCatalogBtn.addEventListener('click', toggleCatalog);
  if (burgerBtn) burgerBtn.addEventListener('click', toggleDrawer);
  if (overlay) overlay.addEventListener('click', closeAll);
});


// Swiper-инициализация
document.addEventListener('DOMContentLoaded', () => {
  new Swiper('.promo__slider', {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    autoHeight: true,
    navigation: {
      nextEl: '.promo__arrow--next',
      prevEl: '.promo__arrow--prev',
      addIcons: false,
    },
    breakpoints: {
      768: { slidesPerView: 1.6, spaceBetween: 24 },
      1200: { slidesPerView: 2, spaceBetween: 32 },
    },
  });
});


// анти ресайз окна для скейла
function setViewportHeight() {
  document.documentElement.style.setProperty('--vh100', `${window.innerHeight}px`);
}
setViewportHeight();

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    setViewportHeight();
  }
});