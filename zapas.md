<!-- Как это работает: начало -->
      <section class="process">
        <div class="container">
          <div class="process__inner">
            <h2 class="process__title">Как это работает</h2>

            <div class="process__list">
              <div class="process__item" style="--fill: 33; --i: 0">
                <div class="process__item-inner">
                  <span class="process__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M10 17h-4v-14h-2" />
                      <path d="M6 5l14 1l-.717 5.016m-7.783 1.984h-5.5" />
                      <path
                        d="M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296"
                      />
                    </svg>
                  </span>
                  <h3 class="process__item-title">Выбрали в каталоге</h3>
                  <p class="process__text">
                    Собираем товары от разных фермеров Кавказа в одном заказе —
                    оформлять с каждым отдельно не нужно
                  </p>
                </div>
              </div>

              <div class="process__item" style="--fill: 67; --i: 1">
                <div class="process__item-inner">
                  <span class="process__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M20 4l-2 2" />
                      <path d="M22 10.5l-2.5 -.5" />
                      <path d="M13.5 2l.5 2.5" />
                      <path
                        d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2c-8.072 -.49 -14.51 -6.928 -15 -15a2 2 0 0 1 2 -2"
                      />
                    </svg>
                  </span>
                  <h3 class="process__item-title">Подтвердили заказ</h3>
                  <p class="process__text">
                    Свяжемся, чтобы уточнить детали и сразу сообщить точную дату
                    ближайшей доставки
                  </p>
                </div>
              </div>

              <div class="process__item" style="--fill: 100; --i: 2">
                <div class="process__item-inner">
                  <span class="process__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                      <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                      <path
                        d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"
                      />
                      <path d="M3 9l4 0" />
                    </svg>
                  </span>
                  <h3 class="process__item-title">Привезли в срок</h3>
                  <p class="process__text">
                    Доставим к двери в согласованное время. Оплата — при
                    получении, предоплата не нужна
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Как это работает: конец -->





      /* --- Как это работает --- */
.process__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.process__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

@property --fill {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.process__item {
  --fill: 0;
  --border-width: 4px;
  --ring-color: var(--color-accent);
  --track-color: var(--color-surface);

  width: fit-content;
  margin-inline: auto;
  position: relative;
  border-radius: var(--radius-full);
  padding: var(--border-width);
  aspect-ratio: 1 / 1;
  background: conic-gradient(
    var(--ring-color) calc(var(--fill) * 1%),
    var(--track-color) 0
  );
  transition: --fill 1s ease calc(var(--i) * 0.1s);
}

.process__item-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  border-radius: var(--radius-full);
  padding: var(--space-lg);
}

.process__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  color: var(--color-accent);
  margin-bottom: 1.25rem;
}

.process__icon svg {
  width: 2rem;
  height: 2rem;
  stroke: currentColor;
}

.process__item-title {
  font-size: var(--fs-body-lg);
}

.process__text {
  max-width: 12rem;
  font-size: var(--fs-body-sm);
  text-align: center;
}

@media (max-width: 767px) {
  .process__list {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
