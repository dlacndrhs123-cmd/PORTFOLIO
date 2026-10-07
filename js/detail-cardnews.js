(() => {
  'use strict';
  const root = document.querySelector('.branding-portfolio');
  const status = root.querySelector('.branding-status');
  const controls = root.querySelector('.branding-controls');
  const pagination = root.querySelector('.branding-pagination');
  const count = root.querySelectorAll('.branding-slide').length;

  if (count <= 1) {
    controls.hidden = true;
    pagination.hidden = true;
  }

  const update = swiper => {
    status.textContent = `12월 NAIL · ${String(swiper.activeIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  };

  if (typeof Swiper === 'undefined') {
    controls.hidden = true;
    pagination.hidden = true;
    return;
  }

  new Swiper(root.querySelector('.branding-swiper'), {
    slidesPerView: 1,
    speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650,
    rewind: true,
    grabCursor: count > 1,
    allowTouchMove: count > 1,
    keyboard: { enabled: count > 1, onlyInViewport: true, pageUpDown: false },
    navigation: count > 1 ? { prevEl: root.querySelector('.branding-prev'), nextEl: root.querySelector('.branding-next') } : undefined,
    pagination: count > 1 ? {
      el: pagination,
      clickable: true,
      renderBullet: (index, className) => `<button class="${className}" type="button" aria-label="${index + 1}번째 슬라이드 보기"></button>`
    } : undefined,
    a11y: { enabled: true, prevSlideMessage: '이전 슬라이드', nextSlideMessage: '다음 슬라이드', slideLabelMessage: '{{index}} / {{slidesLength}}' },
    on: { init: update, slideChange: update }
  });
})();
