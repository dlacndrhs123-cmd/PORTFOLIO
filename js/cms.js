(() => {
  'use strict';
  function thumbnailURL(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' || (url.origin === location.origin && /^https?:$/.test(url.protocol)) ? url.href : null;
    } catch { return null; }
  }
  async function setImageFromBase64Chunks(image, chunks, mimeType = 'image/webp') {
    if (!Array.isArray(chunks) || !chunks.length) return false;
    try {
      const responses = await Promise.all(chunks.map(path => fetch(path, { cache: 'no-cache' })));
      if (responses.some(response => !response.ok)) throw new Error('Thumbnail data unavailable');
      const parts = await Promise.all(responses.map(response => response.text()));
      image.src = `data:${mimeType};base64,${parts.join('').replace(/\\s+/g, '')}`;
      return true;
    } catch (error) {
      console.warn('Chunked thumbnail failed; using fallback image.', error);
      return false;
    }
  }
  async function setWorkThumbnail(image, work) {
    const loaded = await setImageFromBase64Chunks(image, work.thumbnailBase64Chunks, 'image/webp');
    if (loaded) return;
    const thumbnail = thumbnailURL(work.thumbnail);
    if (thumbnail) image.src = thumbnail;
  }
  function getThumbnailSlides(work) {
    return Array.isArray(work.thumbnailSlides)
      ? work.thumbnailSlides.filter(slide => slide && typeof slide === 'object')
      : [];
  }
  function buildWorkThumbnail(thumbBox, work) {
    const slides = getThumbnailSlides(work);
    if (slides.length > 1 && typeof Swiper !== 'undefined') {
      const swiperRoot = document.createElement('div');
      swiperRoot.className = 'swiper work-cover-swiper';
      swiperRoot.setAttribute('aria-label', `${String(work.title || '작품')} 미리보기`);

      const wrapper = document.createElement('div');
      wrapper.className = 'swiper-wrapper';

      slides.forEach((slideData, slideIndex) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const image = document.createElement('img');
        image.alt = String(slideData.alt || `${String(work.title || '작품')} 미리보기 ${slideIndex + 1}`);
        image.decoding = 'async';
        image.loading = slideIndex === 0 ? 'eager' : 'lazy';
        image.draggable = false;

        setImageFromBase64Chunks(image, slideData.base64Chunks, slideData.mimeType || 'image/webp')
          .then(loaded => {
            if (!loaded && slideData.src) {
              const src = thumbnailURL(slideData.src);
              if (src) image.src = src;
            }
          });

        slide.append(image);
        wrapper.append(slide);
      });

      const pagination = document.createElement('div');
      pagination.className = 'work-cover-pagination';
      swiperRoot.append(wrapper, pagination);
      thumbBox.replaceChildren(swiperRoot);
      return swiperRoot;
    }

    const image = thumbBox.querySelector('img') || document.createElement('img');
    image.alt = String(work.thumbnailAlt || work.title || '');
    image.decoding = 'async';
    setWorkThumbnail(image, work);
    thumbBox.replaceChildren(image);
    return null;
  }
  function detailURL(value) {
    if (typeof value !== 'string' || !/^(?:\.\/|\/)?[a-zA-Z0-9_/-]+\.html$/.test(value) || value.includes('..') || value.startsWith('//')) return null;
    const url = new URL(value, location.href);
    return url.origin === location.origin ? url.href : null;
  }
  async function loadWorks() {
    const list = document.querySelector('#works_inner .list');
    const template = document.getElementById('work-card-template');
    const status = document.getElementById('works-status');
    try {
      const response = await fetch('./data/works.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Works unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid works data');
      const items = data.filter(work => work && work.published === true);
      const order = work => typeof work.order === 'number' && Number.isFinite(work.order) ? work.order : Infinity;
      items.sort((a, b) => order(a) - order(b));
      const fragment = document.createDocumentFragment();
      const coverSwipers = [];
      items.forEach((work, index) => {
        const card = template.content.cloneNode(true);
        const item = card.querySelector('.item');
        item.dataset.workId = String(work.id || '');
        item.dataset.featured = String(work.featured === true);
        const anchor = card.querySelector('.work-card');
        const thumbnailSlides = getThumbnailSlides(work);
        const sliderCover = thumbnailSlides.length > 1;
        const imageCover = sliderCover || work.coverLayout === 'image';
        anchor.dataset.coverLayout = sliderCover ? 'slider' : (imageCover ? 'image' : 'standard');
        if (imageCover) {
          anchor.setAttribute('aria-label', `${String(work.title || '작품')} 상세페이지 열기`);
          anchor.setAttribute('data-width', '1920');
          anchor.setAttribute('data-height', '1080');
          card.querySelector('.meta-info').hidden = true;
        }
        const detail = detailURL(work.detailPage);
        if (detail) anchor.href = detail;
        else {
          anchor.removeAttribute('data-fancybox');
          anchor.removeAttribute('data-type');
          anchor.setAttribute('aria-disabled', 'true');
        }
        const thumbBox = card.querySelector('.thumb-box');
        const coverSwiperRoot = buildWorkThumbnail(thumbBox, work);
        if (coverSwiperRoot) coverSwipers.push(coverSwiperRoot);
        card.querySelector('.index-num').textContent = `No. ${String(index + 1).padStart(2, '0')}`;
        card.querySelector('.category-stamp').textContent = String(work.category || '');
        card.querySelector('.project-title').textContent = String(work.title || '');
        card.querySelector('.project-desc').textContent = String(work.description || '');
        fragment.append(card);
      });
      list.replaceChildren(fragment);
      coverSwipers.forEach(swiperRoot => {
        const pagination = swiperRoot.querySelector('.work-cover-pagination');
        swiperRoot.addEventListener('click', event => {
          if (event.target.closest('.swiper-pagination-bullet')) {
            event.preventDefault();
            event.stopPropagation();
          }
        });
        new Swiper(swiperRoot, {
          slidesPerView: 1,
          speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520,
          nested: true,
          rewind: true,
          grabCursor: true,
          touchReleaseOnEdges: true,
          watchOverflow: true,
          preventClicks: true,
          preventClicksPropagation: true,
          pagination: {
            el: pagination,
            clickable: true
          }
        });
      });
      status.hidden = items.length > 0;
      status.textContent = items.length ? '' : '공개된 작품이 없습니다.';
      if (typeof works_swiper !== 'undefined') {
        works_swiper.update();
        works_swiper.slideTo(0, 0);
      }
    } catch (error) {
      status.hidden = false;
      status.textContent = '작품을 불러오지 못했습니다. 잠시 후 새로고침해주세요.';
      console.error(error);
    }
  }
  const form = document.getElementById('guestbook-form');
  const submit = form.querySelector('button');
  const status = document.getElementById('guestbook-status');
  let widget;
  let ready = false;
  let submitting = false;
  let challengeRequired = false;
  let challengePassed = false;
  const updateButton = () => { submit.disabled = !ready || submitting || (challengeRequired && !challengePassed); };
  // Wheel events inside the form should scroll the form, not change the full-page slide.
  form.closest('.guestbook-wrap').addEventListener('wheel', event => event.stopPropagation(), { passive: true });
  async function configureGuestbook() {
    try {
      const response = await fetch('/api/guestbook', { cache: 'no-store' });
      if (!response.ok) throw new Error('Guestbook unavailable');
      const config = await response.json();
      if (!config.available) throw new Error('Guestbook not configured');
      challengeRequired = Boolean(config.siteKey);
      if (challengeRequired) {
        await new Promise((resolve, reject) => {
          window.portfolioTurnstileReady = resolve;
          const script = document.createElement('script');
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=portfolioTurnstileReady';
          script.onerror = reject;
          document.head.append(script);
        });
        widget = window.turnstile.render('#guestbook-turnstile', {
          sitekey: config.siteKey,
          action: 'guestbook',
          size: 'flexible',
          callback: () => { challengePassed = true; updateButton(); },
          'expired-callback': () => { challengePassed = false; updateButton(); },
          'error-callback': () => {
            challengePassed = false;
            status.textContent = '스팸 방지 인증을 불러오지 못했습니다. 새로고침해주세요.';
            updateButton();
          }
        });
      }
      ready = true;
      status.textContent = '';
      updateButton();
    } catch {
      status.textContent = '방명록 준비 중입니다. 잠시 후 다시 방문해주세요.';
    }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || submitting || (challengeRequired && !challengePassed) || !form.reportValidity()) return;
    const fields = new FormData(form);
    const payload = {
      name: String(fields.get('name') || '').trim(),
      message: String(fields.get('message') || '').trim(),
      website: String(fields.get('website') || ''),
      turnstileToken: widget !== undefined ? window.turnstile.getResponse(widget) : ''
    };
    if (!payload.name || !payload.message) {
      status.textContent = '이름과 메시지를 입력해주세요.';
      return;
    }
    submitting = true;
    updateButton();
    status.textContent = '메시지를 보내고 있습니다.';
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '전송하지 못했습니다. 잠시 후 다시 시도해주세요.');
      form.reset();
      status.textContent = '메시지가 전달되었습니다. 감사합니다!';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submitting = false;
      if (widget !== undefined) {
        challengePassed = false;
        window.turnstile.reset(widget);
      }
      updateButton();
    }
  });
  loadWorks();
  configureGuestbook();
})();
