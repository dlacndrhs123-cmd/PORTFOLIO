import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../js/cms.js', import.meta.url), 'utf8');
const initial = JSON.parse(readFileSync(new URL('../data/works.json', import.meta.url), 'utf8'));
// Minimal DOM adapter to execute the real renderer without CDN or browser dependencies.
function element() {
  return { dataset: {}, attributes: {}, textContent: '', hidden: true, setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } };
}
async function render(data, ok = true) {
  const list = { children: [], replaceChildren(fragment) { this.children = fragment.children; } };
  const workStatus = element();
  let updates = 0;
  const form = { querySelector: () => element(), closest: () => ({ addEventListener() {} }), addEventListener() {} };
  const template = { content: { cloneNode() {
    const selectors = ['.item', '.work-card', 'img', '.index-num', '.category-stamp', '.project-title', '.project-desc'];
    const nodes = Object.fromEntries(selectors.map(selector => [selector, element()]));
    return { nodes, querySelector: selector => nodes[selector] };
  } } };
  const elements = { 'work-card-template': template, 'works-status': workStatus, 'guestbook-form': form, 'guestbook-status': element() };
  const context = vm.createContext({
    URL, location: { href: 'https://portfolio.example/', origin: 'https://portfolio.example' },
    window: {}, console: { error() {} },
    document: { querySelector: () => list, getElementById: id => elements[id], createDocumentFragment: () => ({ children: [], append(child) { this.children.push(child); } }) },
    works_swiper: { update() { updates++; }, slideTo() {} },
    fetch: async url => url.startsWith('./data/') ? { ok, json: async () => data } : { ok: false }
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { cards: list.children, status: workStatus, updates };
}
test('existing seven cards keep all migrated content and iframe links', async () => {
  const result = await render(initial);
  assert.equal(result.cards.length, 7);
  assert.equal(result.updates, 1);
  result.cards.forEach((card, index) => {
    assert.equal(card.nodes['.project-title'].textContent, initial[index].title);
    assert.equal(card.nodes['.project-desc'].textContent, initial[index].description);
    assert.equal(card.nodes['.category-stamp'].textContent, initial[index].category);
    assert.equal(card.nodes.img.src, initial[index].thumbnail);
    assert.equal(card.nodes['.work-card'].href, 'https://portfolio.example/' + initial[index].detailPage);
  });
});
test('unpublished cards are absent, numeric order wins and untrusted URLs are rejected', async () => {
  const result = await render([
    { ...initial[0], published: false },
    { ...initial[1], order: 20 },
    { ...initial[2], order: 1, title: '<script>alert(1)</script>', detailPage: 'javascript:alert(1)', thumbnail: 'javascript:alert(1)', featured: true },
    { ...initial[3], order: undefined }
  ]);
  assert.equal(result.cards.length, 3);
  assert.equal(result.cards[0].nodes['.project-title'].textContent, '<script>alert(1)</script>');
  assert.equal(result.cards[0].nodes['.work-card'].href, undefined);
  assert.equal(result.cards[0].nodes['.work-card'].attributes['aria-disabled'], 'true');
  assert.equal(result.cards[0].nodes.img.src, undefined);
  assert.equal(result.cards[0].nodes['.item'].dataset.featured, 'true');
  assert.equal(result.cards[1].nodes['.project-title'].textContent, initial[1].title);
  assert.equal(result.cards[2].nodes['.project-title'].textContent, initial[3].title);
});
test('empty lists, invalid shape and HTTP failure produce status instead of stale cards', async () => {
  for (const [data, ok] of [[[], true], [{ works: initial }, true], [initial, false]]) {
    const result = await render(data, ok);
    assert.equal(result.cards.length, 0);
    assert.equal(result.status.hidden, false);
    assert.ok(result.status.textContent.length > 0);
  }
});
