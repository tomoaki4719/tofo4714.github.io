(() => {
  'use strict';

  const SPEED = 48;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.marquee-track').forEach((track) => {
    const items = Array.from(track.children);
    const marquee = track.closest('.marquee');

    // 同じ内容を2セット並べたHTMLを前提に、2セット目の開始位置を
    // ループ1周分の距離として利用する。
    if (!marquee || items.length < 2 || items.length % 2 !== 0) return;

    const setLength = items.length / 2;
    const firstSet = items.slice(0, setLength);
    const duplicateStart = items[setLength];
    let loopWidth = 0;
    let distance = 0;
    let previousTime = null;
    let animationId = null;

    const measure = () => {
      const previousWidth = loopWidth;
      loopWidth = duplicateStart.offsetLeft - items[0].offsetLeft;

      if (previousWidth > 0 && loopWidth > 0) {
        distance = (distance / previousWidth) * loopWidth;
      }

      // 画面が広い場合もトラックの右端が見えないよう、表示幅＋1周分を
      // 覆うまで同一セットを追加する。
      if (loopWidth > 0) {
        const requiredWidth = marquee.clientWidth + loopWidth;

        while (track.scrollWidth < requiredWidth) {
          firstSet.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
          });
        }
      }
    };

    const render = () => {
      track.style.transform = `translate3d(${-distance}px, 0, 0)`;
    };

    const tick = (currentTime) => {
      if (previousTime === null) previousTime = currentTime;

      const elapsed = Math.min(currentTime - previousTime, 100);
      previousTime = currentTime;

      if (loopWidth > 0) {
        distance = (distance + (SPEED * elapsed) / 1000) % loopWidth;
        render();
      }

      animationId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = null;
      previousTime = null;
    };

    const start = () => {
      stop();
      measure();

      if (reduceMotion.matches) {
        distance = 0;
        render();
        return;
      }

      animationId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      render();
    });

    resizeObserver.observe(marquee);
    reduceMotion.addEventListener('change', start);

    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  });
})();
