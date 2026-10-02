(() => {
  'use strict';
  const gallery = document.querySelector('.project-gallery');
  const status = gallery.querySelector('.gallery-status');
  if (typeof Swiper === 'undefined') {
    status.textContent = '슬라이드를 불러오지 못했습니다. 새로고침해주세요.';
    gallery.querySelectorAll('button').forEach(button => { button.disabled = true; });
    return;
  }
  const labels = ['외부 투시도', '내부 투시도'];
  new Swiper(gallery.querySelector('.garden-swiper'), {
    slidesPerView: 1,
    speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650,
    rewind: true,
    grabCursor: true,
    keyboard: { enabled: true, onlyInViewport: true, pageUpDown: false },
    navigation: {
      prevEl: gallery.querySelector('.gallery-prev'),
      nextEl: gallery.querySelector('.gallery-next')
    },
    pagination: {
      el: gallery.querySelector('.gallery-pagination'),
      clickable: true,
      renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="${labels[index]} 보기"></button>`
    },
    a11y: {
      enabled: true,
      prevSlideMessage: '이전 이미지',
      nextSlideMessage: '다음 이미지',
      paginationBulletMessage: '{{index}}번째 이미지 보기',
      slideLabelMessage: '{{index}} / {{slidesLength}}'
    },
    on: {
      slideChange(swiper) {
        status.textContent = `${labels[swiper.activeIndex]} · ${swiper.activeIndex + 1} / ${labels.length}`;
      }
    }
  });
})();
