(() => {
  'use strict';
  const root = document.querySelector('.video-portfolio');
  const status = root.querySelector('.video-status');
  const controls = root.querySelector('.video-controls');
  function imageURL(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' || (url.origin === location.origin && /^https?:$/.test(url.protocol)) ? url.href : null;
    } catch { return null; }
  }
  async function load() {
    try {
      const response = await fetch('./data/video-projects.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('data unavailable');
      const projects = await response.json();
      if (!Array.isArray(projects) || projects.length !== 4) throw new Error('four projects required');
      const template = document.getElementById('video-slide-template');
      const wrapper = root.querySelector('.swiper-wrapper');
      const fragment = document.createDocumentFragment();
      projects.forEach((project, index) => {
        if (!project || typeof project !== 'object') throw new Error('invalid project');
        const slide = template.content.cloneNode(true);
        slide.querySelector('h2').textContent = String(project.title || `영상 편집 프로젝트 ${index + 1}`);
        slide.querySelector('.video-subtitle').textContent = String(project.subtitle || '');
        const profile = slide.querySelector('.video-profile');
        const main = slide.querySelector('.video-main img');
        profile.src = imageURL(project.profile) || `./images/works/video/profile-${index + 1}.svg`;
        main.src = imageURL(project.image) || `./images/works/video/sample-${index + 1}.svg`;
        profile.alt = String(project.profileAlt || `${project.title || '채널'} 임시 프로필 이미지`);
        main.alt = String(project.imageAlt || `${project.title || '영상 편집'} 임시 작업 이미지`);
        if (index === 0) main.fetchPriority = 'high';
        fragment.append(slide);
      });
      wrapper.replaceChildren(fragment);
      if (typeof Swiper === 'undefined') throw new Error('slider unavailable');
      new Swiper(root.querySelector('.video-swiper'), {
        slidesPerView: 1,
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650,
        rewind: true,
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true, pageUpDown: false },
        navigation: { prevEl: root.querySelector('.video-prev'), nextEl: root.querySelector('.video-next') },
        pagination: {
          el: root.querySelector('.video-pagination'), clickable: true,
          renderBullet: (index, className) => `<button class="${className}" type="button" aria-label="${index + 1}번째 프로젝트 보기"></button>`
        },
        a11y: { enabled: true, prevSlideMessage: '이전 프로젝트', nextSlideMessage: '다음 프로젝트', paginationBulletMessage: '{{index}}번째 프로젝트 보기', slideLabelMessage: '{{index}} / {{slidesLength}}' },
        on: {
          init(swiper) { status.textContent = `${projects[0].title} · 01 / 04`; },
          slideChange(swiper) { status.textContent = `${projects[swiper.activeIndex].title} · ${String(swiper.activeIndex + 1).padStart(2, '0')} / 04`; }
        }
      });
    } catch (error) {
      controls.hidden = true;
      status.textContent = '프로젝트를 불러오지 못했습니다. 잠시 후 새로고침해주세요.';
      console.error(error);
    }
  }
  load();
})();
