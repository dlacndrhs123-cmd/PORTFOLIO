(() => {
  'use strict';
  const root = document.querySelector('.maisan-portfolio');
  const status = root.querySelector('.maisan-status');
  const count = root.querySelectorAll('.maisan-slide').length;
  const update = swiper => {
    status.textContent = `마이산 신비자연학습장 · ${String(swiper.activeIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  };
  if (typeof Swiper === 'undefined') {
    root.querySelector('.maisan-controls').hidden = true;
    status.textContent = '슬라이드를 불러오지 못했습니다. 잠시 후 새로고침해주세요.';
    return;
  }
  new Swiper(root.querySelector('.maisan-swiper'), {
    slidesPerView: 1,
    speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650,
    rewind: true,
    grabCursor: true,
    keyboard: { enabled: true, onlyInViewport: true, pageUpDown: false },
    navigation: { prevEl: root.querySelector('.maisan-prev'), nextEl: root.querySelector('.maisan-next') },
    pagination: {
      el: root.querySelector('.maisan-pagination'),
      clickable: true,
      renderBullet: (index, className) => `<button class="${className}" type="button" aria-label="${index + 1}번째 슬라이드 보기"></button>`
    },
    a11y: { enabled: true, prevSlideMessage: '이전 슬라이드', nextSlideMessage: '다음 슬라이드', paginationBulletMessage: '{{index}}번째 슬라이드 보기', slideLabelMessage: '{{index}} / {{slidesLength}}' },
    on: { init: update, slideChange: update }
  });
})();
