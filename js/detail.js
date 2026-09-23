/**
 * Renders the work detail page (works/detail.html?work=<slug>) from WORKS
 * (js/works-data.js). Runs synchronously as soon as it's parsed, so the
 * content exists before js/main.js's DOMContentLoaded handlers (cursor,
 * reveal-on-scroll, magnetic buttons) run and bind to it.
 */
(() => {
  'use strict';

  const root = document.getElementById('workDetailRoot');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('work');
  const works = typeof WORKS !== 'undefined' ? WORKS : [];
  const work = works.find((w) => w.slug === slug);

  if (!work) {
    root.innerHTML = notFoundTemplate();
    return;
  }

  document.title = `${work.title} | YOUR NAME`;
  root.innerHTML = detailTemplate(work);
  renderRelated(work, works);

  function tagsHtml(tags) {
    return tags.map((t) => `<span class="work-tag">${t}</span>`).join('');
  }

  function displayUrl(url) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  function detailTemplate(w) {
    return `
      <section class="detail-mv reveal">
        <div class="detail-mv-inner ${w.thumb}">
          <span class="detail-mv-label">${w.num}</span>
        </div>
      </section>

      <div class="detail-body">
        <div class="detail-head reveal">
          <span class="detail-eyebrow">${w.positions[0]}</span>
          <h1>${w.title}</h1>
          <a href="${w.url}" target="_blank" rel="noopener" class="detail-link magnetic" data-cursor="hover">
            <span>${displayUrl(w.url)}</span>
            <span class="detail-link-icon" aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="detail-info reveal">
          <div class="detail-row">
            <span class="detail-row-label">担当ポジション</span>
            <div class="detail-tags">${tagsHtml(w.positions)}</div>
          </div>
          <div class="detail-row">
            <span class="detail-row-label">使用ツール・言語</span>
            <div class="detail-tags">${tagsHtml(w.tools)}</div>
          </div>
        </div>

        <div class="detail-desc reveal">
          <span class="detail-row-label">概要</span>
          <p>${w.description}</p>
        </div>

        <div class="detail-info reveal">
          <div class="detail-row">
            <span class="detail-row-label">制作期間</span>
            <span class="detail-row-value">${w.period}</span>
          </div>
        </div>

        <a href="../index.html#works" class="detail-back magnetic" data-cursor="hover">
          <span aria-hidden="true">←</span> Works 一覧へ戻る
        </a>
      </div>

      <section class="related">
        <div class="section-head related-head">
          <span class="section-num reveal">Next</span>
          <h2 class="reveal">他の作品を見る</h2>
        </div>
        <div class="related-grid" id="relatedGrid"></div>
      </section>
    `;
  }

  function relatedCardTemplate(w) {
    return `
      <article class="work-card reveal">
        <a href="detail.html?work=${encodeURIComponent(w.slug)}" class="work-link" data-cursor="view">
          <div class="work-thumb ${w.thumb}">
            <span class="work-thumb-label">${w.num}</span>
          </div>
          <div class="work-body">
            <div class="work-meta">${tagsHtml(w.positions)}</div>
            <h3>${w.title}</h3>
            <p>${w.summary}</p>
          </div>
          <span class="work-arrow" aria-hidden="true">↗</span>
        </a>
      </article>
    `;
  }

  function renderRelated(current, works) {
    const el = document.getElementById('relatedGrid');
    if (!el) return;
    const others = works.filter((w) => w.slug !== current.slug);
    el.innerHTML = others.map(relatedCardTemplate).join('');
  }

  function notFoundTemplate() {
    return `
      <div class="detail-body detail-notfound reveal in-view">
        <span class="detail-eyebrow">404</span>
        <h1>作品が見つかりませんでした</h1>
        <p>URLをご確認いただくか、Works一覧からお探しください。</p>
        <a href="../index.html#works" class="btn btn-primary magnetic" data-cursor="hover">
          <span>Works 一覧へ戻る</span>
        </a>
      </div>
    `;
  }
})();
