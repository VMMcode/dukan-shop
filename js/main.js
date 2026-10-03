(() => {
  'use strict';

  // --- Утилиты ---

  const mqMobile = window.matchMedia('(max-width: 1023px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // «2 440 ₽»: разряды и пробел перед ₽ неразрывные (U+00A0)
  function formatPrice(value) {
    return `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
  }

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

  function getFocusable(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.tabIndex >= 0 && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'
    );
  }

  function lockScroll(shouldLock) {
    document.body.classList.toggle('no-scroll', shouldLock);
  }

  // Один открытый слой за раз: меню каталога, мобильное меню или фильтры
  function createLayers({ overlay }) {
    let current = null; // { layer, trigger }

    const setExpanded = (layer, value) =>
      layer.triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', value));

    function open(layer, trigger) {
      if (current) close();
      current = { layer, trigger };
      layer.show();
      setExpanded(layer, true);
      if (overlay) overlay.hidden = false;
      lockScroll(true);
      if (layer.modal()) getFocusable(layer.panel)[0]?.focus();
    }

    function close({ restoreFocus = false } = {}) {
      if (!current) return;
      const { layer, trigger } = current;
      current = null;
      layer.hide();
      setExpanded(layer, false);
      if (overlay) overlay.hidden = true;
      lockScroll(false);
      if (restoreFocus) trigger.focus();
    }

    function register(name, config) {
      const layer = { ...config, name, triggers: config.triggers.filter(Boolean) };
      const parts = [layer.panel, ...layer.triggers];

      layer.triggers.forEach((trigger) =>
        trigger.addEventListener('click', () =>
          current?.layer === layer ? close({ restoreFocus: true }) : open(layer, trigger)
        )
      );
      (config.closers || []).filter(Boolean).forEach((btn) =>
        btn.addEventListener('click', () => close({ restoreFocus: true }))
      );

      // Немодальный слой закрывается, когда фокус уходит за панель и кнопки.
      // relatedTarget === null (клик по пустому месту, Safari) не считаем уходом.
      parts.forEach((part) =>
        part.addEventListener('focusout', (event) => {
          const next = event.relatedTarget;
          if (current?.layer !== layer || layer.modal() || !next) return;
          if (!parts.some((el) => el.contains(next))) close();
        })
      );
    }

    function onKeydown(event) {
      if (!current) return;
      const { layer, trigger } = current;

      if (event.key === 'Escape') {
        // Esc внутри открытого nice-select закрывает только список
        if (event.target instanceof Element && event.target.closest('.nice-select.open')) return;
        close({ restoreFocus: true });
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable(layer.panel);
      const active = document.activeElement;
      const first = items[0];
      const last = items[items.length - 1];

      if (layer.modal()) {
        if (!first) event.preventDefault();
        else if (!layer.panel.contains(active) || (event.shiftKey && active === first)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (first && !event.shiftKey && layer.triggers.includes(active)) {
        // Мостик: между кнопкой и меню в DOM стоят поиск, профиль и корзина
        event.preventDefault();
        first.focus();
      } else if (first && event.shiftKey && active === first) {
        event.preventDefault();
        trigger.focus();
      }
    }

    overlay?.addEventListener('click', () => close({ restoreFocus: true }));
    document.addEventListener('keydown', onKeydown, true);
    mqMobile.addEventListener('change', () => close());

    return { register, close };
  }

  let layersInstance = null;
  function getLayers() {
    layersInstance ??= createLayers({ overlay: document.getElementById('overlay') });
    return layersInstance;
  }

  // --- Модули ---

  function initHeader() {
    const header = document.querySelector('.header');
    const catalogBtn = document.getElementById('catalogBtn');
    const mobileCatalogBtn = document.getElementById('mobileCatalogBtn');
    const catalogMenu = document.getElementById('catalogMenu');
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const layers = getLayers();

    if (header) {
      const measure = () =>
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
      measure();
      new ResizeObserver(measure).observe(header, { box: 'border-box' });
    }

    if (catalogMenu) {
      layers.register('catalog', {
        triggers: [catalogBtn, mobileCatalogBtn],
        panel: catalogMenu,
        show: () => { catalogMenu.hidden = false; },
        hide: () => { catalogMenu.hidden = true; },
        modal: () => mqMobile.matches,
      });
    }

    if (mobileDrawer && burgerBtn) {
      layers.register('drawer', {
        triggers: [burgerBtn],
        panel: mobileDrawer,
        show: () => {
          mobileDrawer.hidden = false;
          burgerBtn.setAttribute('aria-label', 'Закрыть меню');
        },
        hide: () => {
          mobileDrawer.hidden = true;
          burgerBtn.setAttribute('aria-label', 'Открыть меню');
        },
        modal: () => true,
      });
    }
  }

  // Swiper-инициализация (только на страницах, где подключена библиотека и есть слайдер)
  function initPromoSlider() {
    if (typeof Swiper === 'undefined' || !document.querySelector('.promo__slider')) return;

    const slider = new Swiper('.promo__slider', {
      direction: 'horizontal',
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      // autoHeight не задан: слайды одной высоты, по самому высокому
      navigation: {
        nextEl: '.promo__arrow--next',
        prevEl: '.promo__arrow--prev',
        addIcons: false,
      },
      pagination: {
        el: '.promo__pagination',
        clickable: true,
      },
      autoplay: reduceMotion
        ? false
        : {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
      a11y: {
        prevSlideMessage: 'Предыдущий слайд',
        nextSlideMessage: 'Следующий слайд',
        firstSlideMessage: 'Это первый слайд',
        lastSlideMessage: 'Это последний слайд',
        paginationBulletMessage: 'Перейти к слайду {{index}}',
        slideLabelMessage: '{{index}} из {{slidesLength}}',
        containerRoleDescriptionMessage: 'карусель',
        itemRoleDescriptionMessage: 'слайд',
      },
      breakpoints: {
        768: { slidesPerView: 1.6, spaceBetween: 24 },
        1200: { slidesPerView: 2, spaceBetween: 32 },
      },
    });

    // Пауза, пока фокус внутри слайдера
    if (reduceMotion) return;
    slider.el.addEventListener('focusin', () => slider.autoplay.running && slider.autoplay.stop());
    slider.el.addEventListener('focusout', (event) => {
      if (!slider.el.contains(event.relatedTarget)) slider.autoplay.start();
    });
  }

  // Страница каталога: переключатель сетка/список
  function initCatalogView() {
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
  }

  // Страница каталога: панель фильтров (слой), аккордеон (Категория/Регион/Фермер), сброс
  function initFilters() {
    const filters = document.getElementById('filters');
    const filtersOpenBtn = document.getElementById('filtersOpen');
    if (!filters) return;

    if (filtersOpenBtn) {
      getLayers().register('filters', {
        triggers: [filtersOpenBtn],
        panel: filters,
        closers: [document.getElementById('filtersClose'), document.getElementById('filtersApply')],
        show: () => filters.classList.add('filters--open'),
        hide: () => filters.classList.remove('filters--open'),
        modal: () => mqMobile.matches,
      });
    }

    filters.querySelectorAll('.filters__accordion').forEach((accordion) => {
      const toggle = accordion.querySelector('.filters__accordion-toggle');
      const panel = accordion.querySelector('.filters__accordion-panel');
      if (!toggle || !panel) return;

      toggle.addEventListener('click', () => {
        const isOpen = accordion.classList.toggle('filters__accordion--open');
        toggle.setAttribute('aria-expanded', isOpen);
        panel.hidden = !isOpen;
      });
    });

    document.getElementById('filtersReset')?.addEventListener('click', () => {
      filters.querySelectorAll('.checkbox').forEach((checkbox) => { checkbox.checked = false; });

      const priceMin = document.getElementById('priceMin');
      const priceMax = document.getElementById('priceMax');
      if (priceMin && priceMax) {
        priceMin.value = priceMin.min;
        priceMax.value = priceMax.max;
        priceMin.dispatchEvent(new Event('input'));
      }
    });
  }

  // Страница каталога: range-слайдер цены (два ползунка)
  function initPriceRange() {
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

      if (minLabel) minLabel.textContent = formatPrice(min);
      if (maxLabel) maxLabel.textContent = formatPrice(max);
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
  }

  // nice-select2: ARIA (combobox + listbox)
  // После niceSelect.update() вызвать повторно: библиотека пересоздаёт разметку
  let selectUid = 0;
  function enhanceSelectA11y(select) {
    const nice = select.nextElementSibling;
    const list = nice && nice.querySelector('.list');
    if (!list) return;

    const search = nice.querySelector('.nice-select-search');
    const label = select.id && document.querySelector(`label[for="${select.id}"]`);
    const name = (label ? label.textContent : select.getAttribute('aria-label')) || '';
    const listId = `${select.id || `select-${++selectUid}`}-listbox`;

    if (search) {
      search.placeholder = 'Найти товар'; // библиотека дописывает «...» к searchtext
      search.setAttribute('aria-label', search.placeholder);
    }
    nice.setAttribute('role', 'combobox');
    nice.setAttribute('aria-haspopup', 'listbox');
    nice.setAttribute('aria-controls', listId);
    nice.setAttribute('aria-label', name.replace(/\s+/g, ' ').replace(/[\s:*]+$/, ''));
    list.id = listId;
    list.setAttribute('role', 'listbox');
    list.querySelectorAll('.option').forEach((li, i) => {
      li.id = `${listId}-${i}`;
      li.setAttribute('role', 'option');
    });

    function sync() {
      const isOpen = nice.classList.contains('open');
      const focused = isOpen && list.querySelector('.option.focus');
      nice.setAttribute('aria-expanded', isOpen);
      list.querySelectorAll('.option').forEach((li) => {
        li.setAttribute('aria-selected', li.classList.contains('selected'));
        li.setAttribute('aria-disabled', li.classList.contains('disabled'));
      });
      [nice, search].forEach((el) => {
        if (!el) return;
        if (focused) el.setAttribute('aria-activedescendant', focused.id);
        else el.removeAttribute('aria-activedescendant');
      });
    }

    // Enter при открытом списке без .focus-пункта роняет библиотеку (TypeError)
    nice.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !nice.classList.contains('open') || nice.querySelector('.option.focus')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
    // Слушатель стоит после библиотечного: .focus к этому моменту уже переставлен
    nice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault(); // иначе Enter в поле поиска отправляет форму
      sync();
    });
    nice.addEventListener('input', sync);
    new MutationObserver(sync).observe(nice, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  // nice-select2: все селекты с классом .select
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
      enhanceSelectA11y(select);
    });
  }

  // Табы: панель ищется по aria-controls таба, иначе по href="#id"
  function initTabs(root, options) {
    const { tabSelector, panelSelector, activeClass, syncHash = false, scrollSelector } = options;
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll(tabSelector));
    const panels = tabs.map((tab) => {
      const id = tab.getAttribute('aria-controls') || (tab.getAttribute('href') || '').slice(1);
      const panel = id && document.getElementById(id);
      return panel && panel.matches(panelSelector) ? panel : null;
    });
    if (!tabs.length || panels.some((panel) => !panel)) return;

    const list = tabs[0].closest('[role="tablist"]') || tabs[0].parentElement.closest('ul, ol');
    list?.setAttribute('role', 'tablist');

    tabs.forEach((tab, i) => {
      if (tab.parentElement.tagName === 'LI') tab.parentElement.setAttribute('role', 'presentation');
      tab.setAttribute('role', 'tab');
      if (!tab.id) tab.id = `tab-${panels[i].id}`;
      tab.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      if (!panels[i].hasAttribute('aria-labelledby')) panels[i].setAttribute('aria-labelledby', tab.id);
      panels[i].tabIndex = 0;
    });

    // Прокручиваем только горизонтальный скроллер табов, страницу не двигаем
    function revealTab(tab) {
      for (let el = tab.parentElement; el && el !== document.body; el = el.parentElement) {
        if (el.scrollWidth <= el.clientWidth || !/auto|scroll/.test(getComputedStyle(el).overflowX)) continue;
        const box = el.getBoundingClientRect();
        const rect = tab.getBoundingClientRect();
        if (rect.left < box.left) el.scrollLeft -= box.left - rect.left;
        else if (rect.right > box.right) el.scrollLeft += rect.right - box.right;
        return;
      }
    }

    function activate(index, { focus = false } = {}) {
      tabs.forEach((tab, i) => {
        const isActive = i === index;
        tab.classList.toggle(activeClass, isActive);
        tab.setAttribute('aria-selected', isActive);
        tab.tabIndex = isActive ? 0 : -1;
        panels[i].hidden = !isActive;
      });
      if (focus) tabs[index].focus();
      revealTab(tabs[index]);
    }

    function select(index, opts) {
      activate(index, opts);
      if (syncHash) history.replaceState(null, '', `#${panels[index].id}`);
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        select(i);
      });

      tab.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, { focus: true });
      });
    });

    // Подбор gap: справа всегда виден край следующего таба
    const scroller = scrollSelector && root.querySelector(scrollSelector);
    if (scroller) {
      const MIN_PEEK = 32;
      const updateTabsGap = () => {
        list.style.removeProperty('--tabs-gap');
        if (scroller.scrollWidth <= scroller.clientWidth) return;

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
      };
      new ResizeObserver(updateTabsGap).observe(scroller);
      if (document.fonts) document.fonts.ready.then(updateTabsGap);
    }

    const indexFromHash = () => panels.findIndex((panel) => `#${panel.id}` === location.hash);

    if (syncHash) {
      window.addEventListener('hashchange', () => {
        const index = indexFromHash();
        if (index === -1) return;
        activate(index);
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const initial = syncHash ? indexFromHash() : -1;
    activate(initial === -1 ? 0 : initial);
    if (initial !== -1) {
      // 'instant', а не 'auto': 'auto' берёт smooth из CSS
      const hash = location.hash;
      const align = () => {
        root.scrollIntoView({ behavior: 'instant', block: 'start' });
        history.replaceState(null, '', hash);
      };
      if (document.readyState === 'complete') align();
      else {
        // Без хеша браузер не прокрутит к панели сам после load и не перебьёт align
        history.replaceState(null, '', location.pathname + location.search);
        window.addEventListener('load', () => requestAnimationFrame(align), { once: true });
      }
    }
  }

  function initFarmersTabs() {
    initTabs(document.querySelector('.farmers-tabs'), {
      tabSelector: '.farmers-tabs__tab',
      panelSelector: '.farmers-panel',
      activeClass: 'farmers-tabs__tab--active',
      scrollSelector: '.farmers-tabs__scroll',
      syncHash: true,
    });
  }

  function initProductTabs() {
    initTabs(document.querySelector('.product-tabs'), {
      tabSelector: '.product-tabs__btn',
      panelSelector: '.product-tabs__panel',
      activeClass: 'product-tabs__btn--active',
      syncHash: false,
    });
  }

  // Страница товара: галерея, степпер количества
  function initProductPage() {
    // Галерея: клик по миниатюре меняет главное фото
    const galleryMain = document.getElementById('galleryMain');
    const thumbs = document.querySelectorAll('.product-gallery__thumb');

    if (galleryMain && thumbs.length) {
      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const newSrc = thumb.dataset.img;
          if (!newSrc) return;

          // Если файла нет, главное фото и активная миниатюра остаются прежними
          const probe = new Image();
          probe.src = newSrc;
          probe.decode().then(() => {
            galleryMain.src = newSrc;
            thumbs.forEach((t) => {
              t.classList.remove('product-gallery__thumb--active');
              t.removeAttribute('aria-current');
            });
            thumb.classList.add('product-gallery__thumb--active');
            thumb.setAttribute('aria-current', 'true');
          }).catch(() => {});
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
          if (addToCartBtn.dataset.checkoutUrl) window.location.href = addToCartBtn.dataset.checkoutUrl;
          return;
        }
        setQty(1);
      });

      updateCartState();
    }
  }

  // Страница оформления заказа: состав заказа, доставка, итог, отправка
  function initCheckout() {
    const itemsList = document.getElementById('orderItemsList');
    const checkoutForm = document.getElementById('checkoutForm');
    if (!itemsList || !checkoutForm) return; // не страница чекаута — выходим

    const minOrderSum = Number(checkoutForm.dataset.minOrder) || 0;
    const freeDeliveryFrom = Number(checkoutForm.dataset.freeDeliveryFrom) || 0;
    const deliveryCostValue = Number(checkoutForm.dataset.deliveryCost) || 0;

    const agreementCheckbox = document.getElementById('agreementCheckbox');
    const submitBtn = document.getElementById('submitOrderBtn');
    const warning = document.getElementById('minOrderWarning');
    const warningDiff = document.getElementById('minOrderDiff');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTotal = document.getElementById('summaryTotal');
    const deliveryPriceNote = document.getElementById('deliveryPriceNote');
    const cartEmpty = document.getElementById('cartEmpty');

    let subtotal = 0;

    function recalc() {
      subtotal = 0;
      itemsList.querySelectorAll('.order-items__item').forEach((row) => {
        const price = Number(row.dataset.price);
        const qty = Number(row.dataset.qty);
        const rowTotal = price * qty;
        row.querySelector('[data-role="item-price"]').textContent = formatPrice(rowTotal);
        subtotal += rowTotal;
      });

      const isFreeDelivery = subtotal >= freeDeliveryFrom;
      const deliveryCost = subtotal > 0 && !isFreeDelivery ? deliveryCostValue : 0;
      const total = subtotal + deliveryCost;

      if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
      if (summaryDelivery) {
        summaryDelivery.textContent = isFreeDelivery ? 'Бесплатно' : formatPrice(deliveryCost);
      }
      if (summaryTotal) summaryTotal.textContent = formatPrice(total);
      if (deliveryPriceNote) {
        deliveryPriceNote.textContent = isFreeDelivery
          ? `Доставка бесплатно от ${formatPrice(freeDeliveryFrom)} — для вашего заказа бесплатно`
          : `Доставка — ${formatPrice(deliveryCostValue)}. Бесплатно от ${formatPrice(freeDeliveryFrom)}`;
      }

      const belowMin = subtotal < minOrderSum;
      if (warning) warning.hidden = !belowMin;
      if (warningDiff) warningDiff.textContent = formatPrice(Math.max(0, minOrderSum - subtotal));

      updateSubmitState(belowMin);
    }

    function updateSubmitState(belowMinArg) {
      const belowMin = typeof belowMinArg === 'boolean' ? belowMinArg : subtotal < minOrderSum;
      const agreed = agreementCheckbox ? agreementCheckbox.checked : true;
      if (submitBtn) submitBtn.disabled = belowMin || !agreed || itemsList.children.length === 0;
    }

    function showEmptyCart() {
      if (!cartEmpty) return;
      checkoutForm.hidden = true;
      cartEmpty.hidden = false;
      document.getElementById('cartEmptyTitle')?.focus();
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
        if (!itemsList.children.length) showEmptyCart();
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
      document.getElementById('orderSuccessTitle')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Предзаполняем телефон в блоке "создать аккаунт" тем же номером,
      // что клиент указал в контактах заказа.
      const phoneInput = document.getElementById('phoneInput');
      const accountPhoneInput = document.getElementById('signupPhoneInput');
      if (phoneInput && accountPhoneInput) {
        accountPhoneInput.value = phoneInput.value;
      }
    });

    // Предложение создать аккаунт на экране "Заказ принят".
    // Переключение шагов пока чисто визуальное — без реальной отправки SMS,
    // логика подключится позже через плагин WSMS.
    const checkoutAccount = document.getElementById('checkoutAccount');
    if (checkoutAccount) {
      const phoneStep = document.getElementById('signupPhoneStep');
      const otpStep = document.getElementById('signupOtpStep');
      const doneStep = document.getElementById('signupDoneStep');
      const accountPhoneInput = document.getElementById('signupPhoneInput');
      const requestCodeBtn = document.getElementById('signupRequestCodeBtn');
      const skipBtn = document.getElementById('signupSkipBtn');
      const confirmBtn = document.getElementById('signupConfirmBtn');
      const phoneDisplay = document.getElementById('signupPhoneDisplay');
      const otpInputs = Array.from(
        document.querySelectorAll('.checkout-account__otp-input')
      );

      // Код можно запросить только после согласия на обработку ПД
      const accountConsent = document.getElementById('signupConsent');
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
  }

  // Кнопка "плюс" на карточке товара: клик добавляет/убирает товар из
  // корзины, иконка поворотом превращается из плюса в минус и обратно
  function initCartButtons() {
    document.addEventListener('click', (event) => {
      const addBtn = event.target.closest('.product-card__add');
      if (!addBtn) return;
      event.preventDefault();
      event.stopPropagation();

      const inCart = addBtn.classList.toggle('product-card__add--in-cart');
      const link = addBtn.closest('.product-card')?.querySelector('.product-card__link');
      const title = link ? link.textContent.replace(/\s+/g, ' ').trim() : '';
      addBtn.setAttribute(
        'aria-label',
        inCart ? `Убрать «${title}» из корзины` : `Добавить «${title}» в корзину`
      );
    });
  }

  // FAQ (доставка, «О магазине»): плавное раскрытие поверх нативного <details>.
  // Два уровня аккордеона (группа вопросов → сам вопрос) работают по одной схеме.
  function initSmoothDetails() {
    const rootStyles = getComputedStyle(document.documentElement);
    const duration = parseFloat(rootStyles.getPropertyValue('--duration-base')) || 300;
    const easing = rootStyles.getPropertyValue('--ease-out').trim() || 'ease';

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
  }

  // Публичное — то, что понадобится в WP извне
  window.Dukan = { enhanceSelectA11y, formatPrice };

  const modules = [
    initHeader,
    initPromoSlider,
    initCatalogView,
    initFilters,
    initPriceRange,
    initSelects,
    initFarmersTabs,
    initProductTabs,
    initProductPage,
    initCheckout,
    initCartButtons,
    initSmoothDetails,
  ];

  // Ошибка в одном модуле не должна останавливать остальные
  function start() {
    modules.forEach((init) => {
      try {
        init();
      } catch (error) {
        console.error(`[Dukan] ${init.name}:`, error);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
