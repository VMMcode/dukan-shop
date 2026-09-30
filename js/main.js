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


// Swiper-инициализация (только на страницах, где подключена библиотека и есть слайдер)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Swiper === 'undefined' || !document.querySelector('.promo__slider')) return;

  new Swiper('.promo__slider', {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    // autoHeight не задан (false по умолчанию) — это и есть штатная настройка
    // Swiper для одинаковой высоты слайдов: он растягивает все слайды по
    // самому высокому через flex (align-items: stretch на .swiper-wrapper).
    // autoHeight: true, наоборот, подгоняет высоту под контент активного
    // слайда — из-за него слайды и были разной высоты.
    navigation: {
      nextEl: '.promo__arrow--next',
      prevEl: '.promo__arrow--prev',
      addIcons: false,
    },
    pagination: {
      el: '.promo__pagination',
      clickable: true,
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      768: { slidesPerView: 1.6, spaceBetween: 24 },
      1200: { slidesPerView: 2, spaceBetween: 32 },
    },
  });
});


// --- Страница каталога: переключатель сетка/список ---
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.catalog__grid');
  const viewButtons = document.querySelectorAll('.catalog__view-btn');
  if (!grid || !viewButtons.length) return;

  function setView(view) {
    grid.classList.toggle('catalog__grid--list', view === 'list');
    viewButtons.forEach((btn) => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('catalog__view-btn--active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
});

// --- Страница каталога: мобильная панель фильтров ---
document.addEventListener('DOMContentLoaded', () => {
  const filters = document.getElementById('filters');
  const filtersOpenBtn = document.getElementById('filtersOpen');
  const filtersCloseBtn = document.getElementById('filtersClose');
  const filtersApplyBtn = document.getElementById('filtersApply');
  const overlay = document.getElementById('overlay');

  if (!filters || !filtersOpenBtn) return; // не страница каталога — выходим

  function openFilters() {
    filters.classList.add('filters--open');
    filtersOpenBtn.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeFilters() {
    filters.classList.remove('filters--open');
    filtersOpenBtn.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  filtersOpenBtn.addEventListener('click', openFilters);
  if (filtersCloseBtn) filtersCloseBtn.addEventListener('click', closeFilters);
  if (filtersApplyBtn) filtersApplyBtn.addEventListener('click', closeFilters);
  if (overlay) overlay.addEventListener('click', closeFilters);
});


// --- Страница каталога: аккордеон фильтров (Категория/Регион/Фермер) ---
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.filters__accordion');

  accordions.forEach((accordion) => {
    const toggle = accordion.querySelector('.filters__accordion-toggle');
    const panel = accordion.querySelector('.filters__accordion-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('filters__accordion--open');
      toggle.setAttribute('aria-expanded', isOpen);
      panel.hidden = !isOpen;
    });
  });

  // --- Сброс фильтров ---
  const resetBtn = document.getElementById('filtersReset');
  const filtersRoot = document.getElementById('filters');
  if (resetBtn && filtersRoot) {
    resetBtn.addEventListener('click', () => {
      filtersRoot
        .querySelectorAll('.checkbox')
        .forEach((checkbox) => { checkbox.checked = false; });

      const priceMin = document.getElementById('priceMin');
      const priceMax = document.getElementById('priceMax');
      if (priceMin && priceMax) {
        priceMin.value = priceMin.min;
        priceMax.value = priceMax.max;
        priceMin.dispatchEvent(new Event('input'));
      }
    });
  }
});

// --- Страница каталога: range-слайдер цены (два ползунка) ---
document.addEventListener('DOMContentLoaded', () => {
  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');
  const fill = document.getElementById('priceRangeFill');
  const minLabel = document.getElementById('priceMinValue');
  const maxLabel = document.getElementById('priceMaxValue');

  if (!minInput || !maxInput || !fill) return;

  const GAP = 50; // минимальный зазор между значениями, чтобы ползунки не слипались

  function render() {
    const min = Number(minInput.value);
    const max = Number(maxInput.value);
    const rangeMin = Number(minInput.min);
    const rangeMax = Number(minInput.max);
    const total = rangeMax - rangeMin;

    const minPercent = ((min - rangeMin) / total) * 100;
    const maxPercent = ((max - rangeMin) / total) * 100;

    fill.style.left = `${minPercent}%`;
    fill.style.width = `${maxPercent - minPercent}%`;

    if (minLabel) minLabel.textContent = `${min} ₽`;
    if (maxLabel) maxLabel.textContent = `${max} ₽`;
  }

  minInput.addEventListener('input', () => {
    if (Number(minInput.value) > Number(maxInput.value) - GAP) {
      minInput.value = Number(maxInput.value) - GAP;
    }
    render();
  });

  maxInput.addEventListener('input', () => {
    if (Number(maxInput.value) < Number(minInput.value) + GAP) {
      maxInput.value = Number(minInput.value) + GAP;
    }
    render();
  });

  render();
});


// --- Страница товара: галерея, степпер количества, табы ---
document.addEventListener('DOMContentLoaded', () => {
  // Галерея: клик по миниатюре меняет главное фото
  const galleryMain = document.getElementById('galleryMain');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');

  if (galleryMain && thumbs.length) {
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.dataset.img;
        if (!newSrc) return;
        galleryMain.src = newSrc;
        thumbs.forEach((t) => t.classList.remove('product-gallery__thumb--active'));
        thumb.classList.add('product-gallery__thumb--active');
      });
    });
  }

  // Цена / степпер / кнопка
  const qtyValue = document.getElementById('qtyValue');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const purchase = document.querySelector('.product-info__purchase');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const addToCartLabel = addToCartBtn
    ? addToCartBtn.querySelector('.product-info__add-btn-label')
    : null;

  if (qtyValue && qtyMinus && qtyPlus && purchase && addToCartBtn) {
    let qty = parseInt(qtyValue.textContent, 10) || 0;
    const MAX_QTY = 99;

    function renderQty() {
      qtyValue.textContent = qty;
    }

    function updateCartState() {
      const inCart = qty > 0;
      purchase.classList.toggle('product-info__purchase--in-cart', inCart);
      if (addToCartLabel) {
        addToCartLabel.textContent = inCart ? 'Перейти в корзину' : 'В корзину';
      }
    }

    function setQty(next) {
      qty = Math.max(0, Math.min(MAX_QTY, next));
      renderQty();
      updateCartState();
    }

    qtyMinus.addEventListener('click', () => setQty(qty - 1));
    qtyPlus.addEventListener('click', () => setQty(qty + 1));

    addToCartBtn.addEventListener('click', () => {
      if (qty > 0) {
        window.location.href = 'checkout.html';
        return;
      }
      setQty(1);
    });

    updateCartState();
  }

  // Табы (Описание / Состав / О производителе)
  const tabButtons = document.querySelectorAll('.product-tabs__btn');
  const tabPanels = document.querySelectorAll('.product-tabs__panel');

  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.tab;

        tabButtons.forEach((b) => b.classList.remove('product-tabs__btn--active'));
        tabPanels.forEach((p) => p.classList.remove('product-tabs__panel--active'));

        btn.classList.add('product-tabs__btn--active');
        const targetPanel = document.querySelector(`[data-panel="${targetId}"]`);
        if (targetPanel) targetPanel.classList.add('product-tabs__panel--active');
      });
    });
  }
});


// --- Страница оформления заказа: состав заказа, доставка, итог, отправка ---
document.addEventListener('DOMContentLoaded', () => {
  const itemsList = document.getElementById('orderItemsList');
  const checkoutForm = document.getElementById('checkoutForm');
  if (!itemsList || !checkoutForm) return; // не страница чекаута — выходим

  // Заглушки: реальные значения (мин. сумма заказа, порог и стоимость доставки)
  // в будущем будут настраиваться в админке.
  const MIN_ORDER_SUM = 1500;
  const FREE_DELIVERY_THRESHOLD = 3000;
  const DELIVERY_COST = 300;

  const agreementCheckbox = document.getElementById('agreementCheckbox');
  const submitBtn = document.getElementById('submitOrderBtn');
  const warning = document.getElementById('minOrderWarning');
  const warningDiff = document.getElementById('minOrderDiff');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDelivery = document.getElementById('summaryDelivery');
  const summaryTotal = document.getElementById('summaryTotal');
  const deliveryPriceNote = document.getElementById('deliveryPriceNote');

  let subtotal = 0;

  function recalc() {
    subtotal = 0;
    itemsList.querySelectorAll('.order-items__item').forEach((row) => {
      const price = Number(row.dataset.price);
      const qty = Number(row.dataset.qty);
      const rowTotal = price * qty;
      row.querySelector('[data-role="item-price"]').textContent = `${rowTotal} ₽`;
      subtotal += rowTotal;
    });

    const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
    const deliveryCost = subtotal > 0 && !isFreeDelivery ? DELIVERY_COST : 0;
    const total = subtotal + deliveryCost;

    if (summarySubtotal) summarySubtotal.textContent = `${subtotal} ₽`;
    if (summaryDelivery) {
      summaryDelivery.textContent = isFreeDelivery ? 'Бесплатно' : `${deliveryCost} ₽`;
    }
    if (summaryTotal) summaryTotal.textContent = `${total} ₽`;
    if (deliveryPriceNote) {
      deliveryPriceNote.textContent = isFreeDelivery
        ? `Доставка бесплатно от ${FREE_DELIVERY_THRESHOLD} ₽ — для вашего заказа бесплатно`
        : `Доставка — ${DELIVERY_COST} ₽. Бесплатно от ${FREE_DELIVERY_THRESHOLD} ₽`;
    }

    const belowMin = subtotal < MIN_ORDER_SUM;
    if (warning) warning.hidden = !belowMin;
    if (warningDiff) warningDiff.textContent = Math.max(0, MIN_ORDER_SUM - subtotal);

    updateSubmitState(belowMin);
  }

  function updateSubmitState(belowMinArg) {
    const belowMin = typeof belowMinArg === 'boolean' ? belowMinArg : subtotal < MIN_ORDER_SUM;
    const agreed = agreementCheckbox ? agreementCheckbox.checked : true;
    if (submitBtn) submitBtn.disabled = belowMin || !agreed || itemsList.children.length === 0;
  }

  itemsList.addEventListener('click', (event) => {
    const qtyBtn = event.target.closest('.qty-stepper__btn');
    const removeBtn = event.target.closest('.order-items__remove');
    const row = event.target.closest('.order-items__item');
    if (!row) return;

    if (qtyBtn) {
      let qty = Number(row.dataset.qty);
      qty = qtyBtn.dataset.action === 'plus' ? qty + 1 : Math.max(1, qty - 1);
      row.dataset.qty = qty;
      row.querySelector('[data-role="qty"]').textContent = qty;
      recalc();
    }

    if (removeBtn) {
      row.remove();
      recalc();
    }
  });

  if (agreementCheckbox) {
    agreementCheckbox.addEventListener('change', () => updateSubmitState());
  }

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }
    if (submitBtn.disabled) return;

    const orderNumber = document.getElementById('orderNumber');
    const orderSum = document.getElementById('orderSum');
    if (orderNumber) orderNumber.textContent = `№ ${Math.floor(10000 + Math.random() * 89999)}`;
    if (orderSum) orderSum.textContent = summaryTotal.textContent;

    document.getElementById('checkoutSection').hidden = true;
    document.getElementById('orderSuccess').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Предзаполняем телефон в блоке "создать аккаунт" тем же номером,
    // что клиент указал в контактах заказа.
    const phoneInput = document.getElementById('phoneInput');
    const accountPhoneInput = document.getElementById('checkout-account__phone-input');
    if (phoneInput && accountPhoneInput) {
      accountPhoneInput.value = phoneInput.value;
    }
  });

  // Предложение создать аккаунт на экране "Заказ принят".
  // Переключение шагов пока чисто визуальное — без реальной отправки SMS,
  // логика подключится позже через плагин WSMS.
  const checkoutAccount = document.getElementById('checkoutAccount');
  if (checkoutAccount) {
    const phoneStep = document.getElementById('checkout-account__phone-step');
    const otpStep = document.getElementById('checkout-account__otp-step');
    const doneStep = document.getElementById('checkout-account__done-step');
    const accountPhoneInput = document.getElementById('checkout-account__phone-input');
    const requestCodeBtn = document.getElementById('checkout-account__request-code-btn');
    const skipBtn = document.getElementById('checkout-account__skip-btn');
    const confirmBtn = document.getElementById('checkout-account__confirm-btn');
    const phoneDisplay = document.getElementById('checkout-account__phone-display');
    const otpInputs = Array.from(
      document.querySelectorAll('.checkout-account__otp-input')
    );

    // Код можно запросить только после согласия на обработку ПД
    const accountConsent = document.getElementById('checkout-account__consent');
    if (accountConsent && requestCodeBtn) {
      accountConsent.addEventListener('change', () => {
        requestCodeBtn.disabled = !accountConsent.checked;
      });
    }

    if (requestCodeBtn) {
      requestCodeBtn.addEventListener('click', () => {
        if (phoneDisplay) phoneDisplay.textContent = accountPhoneInput.value;
        phoneStep.hidden = true;
        otpStep.hidden = false;
        if (otpInputs[0]) otpInputs[0].focus();
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        checkoutAccount.hidden = true;
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        otpStep.hidden = true;
        doneStep.hidden = false;
      });
    }

    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value && otpInputs[index + 1]) {
          otpInputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && otpInputs[index - 1]) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }

  recalc();
});

// --- Кнопка "плюс" на карточке товара: клик добавляет/убирает товар из
// корзины, иконка поворотом превращается из плюса в минус и обратно ---
document.addEventListener('click', (event) => {
  const addBtn = event.target.closest('.product-card__add');
  if (!addBtn) return;
  event.preventDefault();
  event.stopPropagation();

  const inCart = addBtn.classList.toggle('product-card__add--in-cart');
  addBtn.setAttribute(
    'aria-label',
    inCart ? 'Убрать из корзины' : 'Добавить в корзину'
  );
});

// --- nice-select2: все селекты с классом .select ---
// Исходный <select> не скрыт через display:none (см. .hidden-select в base.css),
// поэтому при валидации фокус перекидываем на видимый .nice-select
function initSelects() {
  if (typeof NiceSelect === 'undefined') return;

  document.querySelectorAll('select.select').forEach((select) => {
    const searchable = select.classList.contains('select--search');
    const options = { searchable };
    if (searchable && select.dataset.placeholder) options.placeholder = select.dataset.placeholder;
    NiceSelect.bind(select, options);

    const niceSelect = select.nextElementSibling;
    if (!niceSelect || !niceSelect.classList.contains('nice-select')) return;

    select.tabIndex = -1; // иначе Shift+Tab упирается в скрытый select
    select.addEventListener('focus', () => niceSelect.focus());
  });
}

document.addEventListener('DOMContentLoaded', initSelects);

// --- Страница фермеров: табы по республикам ---
function initFarmersTabs() {
  const root = document.querySelector('.farmers-tabs');
  if (!root) return;

  const list = root.querySelector('.farmers-tabs__list');
  const tabs = Array.from(root.querySelectorAll('.farmers-tabs__tab'));
  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute('href').slice(1))
  );
  if (!list || panels.some((panel) => !panel)) return;

  list.setAttribute('role', 'tablist');
  list.querySelectorAll('.farmers-tabs__item').forEach((item) =>
    item.setAttribute('role', 'presentation')
  );

  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.id = `tab-${panels[i].id}`;
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
  });

  function activate(index, { focus = false } = {}) {
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('farmers-tabs__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive);
      tab.tabIndex = isActive ? 0 : -1;
      panels[i].hidden = !isActive;
    });
    if (focus) tabs[index].focus();
    tabs[index].scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  function indexFromHash() {
    return panels.findIndex((panel) => `#${panel.id}` === location.hash);
  }

  function syncWithHash() {
    const index = indexFromHash();
    if (index === -1) return false;
    activate(index);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      activate(i);
      history.replaceState(null, '', `#${panels[i].id}`);
    });

    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      activate(next, { focus: true });
      history.replaceState(null, '', `#${panels[next].id}`);
    });
  });

  // Подбор gap: справа всегда виден край следующего таба
  const scroller = root.querySelector('.farmers-tabs__scroll');
  const MIN_PEEK = 32;
  function updateTabsGap() {
    list.style.removeProperty('--tabs-gap');
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;

    const minGap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const widths = tabs.map((tab) => tab.parentElement.offsetWidth);
    const view = scroller.clientWidth;

    for (let gap = minGap; gap <= minGap * 3; gap += 1) {
      let start = 0; // левый край очередного таба
      let i = 0;
      while (i < widths.length && start + widths[i] <= view) {
        start += widths[i] + gap;
        i++;
      }
      if (i === widths.length) return; // всё влезает — подсказка не нужна
      const visible = view - start; // сколько px таба i видно
      if (visible >= MIN_PEEK && widths[i] - visible >= MIN_PEEK) {
        list.style.setProperty('--tabs-gap', `${gap}px`);
        return;
      }
    }
  }
  updateTabsGap();
  window.addEventListener('resize', updateTabsGap);
  if (document.fonts) document.fonts.ready.then(updateTabsGap);

  if (!syncWithHash()) activate(0);
  window.addEventListener('hashchange', syncWithHash);
}

document.addEventListener('DOMContentLoaded', initFarmersTabs);

// --- FAQ (доставка, «О магазине»): плавное раскрытие поверх нативного <details> ---
// Два уровня аккордеона (группа вопросов → сам вопрос) работают по одной
// и той же схеме, поэтому она вынесена в enableSmoothDetails.
document.addEventListener('DOMContentLoaded', () => {
  const rootStyles = getComputedStyle(document.documentElement);
  const duration = parseFloat(rootStyles.getPropertyValue('--duration-base')) || 300;
  const easing = rootStyles.getPropertyValue('--ease-out').trim() || 'ease';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enableSmoothDetails(details, toggle, wrap) {
    let animation = null;

    toggle.addEventListener('click', (event) => {
      event.preventDefault();

      if (reduceMotion) {
        details.open = !details.open;
        return;
      }

      if (animation) animation.cancel();

      if (details.open) {
        const startHeight = wrap.offsetHeight;
        animation = wrap.animate(
          [{ height: `${startHeight}px` }, { height: '0px' }],
          { duration, easing }
        );
        animation.onfinish = () => {
          details.open = false;
          wrap.style.height = '';
        };
      } else {
        details.open = true;
        const endHeight = wrap.offsetHeight;
        animation = wrap.animate(
          [{ height: '0px' }, { height: `${endHeight}px` }],
          { duration, easing }
        );
        animation.onfinish = () => {
          wrap.style.height = '';
        };
      }
    });
  }

  document.querySelectorAll('.delivery-faq__group').forEach((group) => {
    const toggle = group.querySelector('.delivery-faq__group-toggle');
    const body = group.querySelector('.delivery-faq__group-body');
    if (toggle && body) enableSmoothDetails(group, toggle, body);
  });

  document.querySelectorAll('.faq__item').forEach((item) => {
    const summary = item.querySelector('.faq__question');
    const wrap = item.querySelector('.faq__answer-wrap');
    if (summary && wrap) enableSmoothDetails(item, summary, wrap);
  });
});