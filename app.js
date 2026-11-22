// WhaleUnveil Supplemental Project Website interactions

(function () {
  "use strict";

  // 1. Hero teaser chapter jump buttons
  const heroVideo = document.getElementById("hero-teaser-video");
  const chapterButtons = Array.from(document.querySelectorAll(".chapter-btn"));

  if (heroVideo && chapterButtons.length > 0) {
    chapterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = parseFloat(btn.dataset.time || "0");
        heroVideo.currentTime = t;
        heroVideo.play().catch(() => {});
        chapterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    heroVideo.addEventListener("timeupdate", () => {
      const now = heroVideo.currentTime;
      let currentBtn = chapterButtons[0];
      for (const btn of chapterButtons) {
        const t = parseFloat(btn.dataset.time || "0");
        if (now + 0.15 >= t) {
          currentBtn = btn;
        }
      }
      chapterButtons.forEach((b) => b.classList.toggle("active", b === currentBtn));
    });
  }

  // 2. Supplemental gallery Play All / Pause All controls
  const suppVideos = Array.from(document.querySelectorAll(".supp-video"));
  const playAllBtn = document.getElementById("play-all-supp");
  const pauseAllBtn = document.getElementById("pause-all-supp");

  if (playAllBtn) {
    playAllBtn.addEventListener("click", () => {
      suppVideos.forEach((v) => {
        v.muted = true;
        v.play().catch(() => {});
      });
    });
  }

  if (pauseAllBtn) {
    pauseAllBtn.addEventListener("click", () => {
      suppVideos.forEach((v) => v.pause());
    });
  }

  // 3. Paper figure category filters
  const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
  const figureCards = Array.from(document.querySelectorAll(".figure-card"));

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.filter || "all";
      filterTabs.forEach((t) => t.classList.toggle("active", t === tab));
      figureCards.forEach((card) => {
        const cardCat = card.dataset.category || "";
        const show = category === "all" || cardCat === category;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  // 4. Lightbox for figures
  const lightbox = document.getElementById("figure-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const zoomableMedia = Array.from(document.querySelectorAll("[data-lightbox]"));

  function openLightbox(imgSrc, imgAlt, captionHtml) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt || "";
    lightboxCaption.innerHTML = captionHtml || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  zoomableMedia.forEach((el) => {
    el.addEventListener("click", () => {
      const img = el.querySelector("img");
      const fig = el.closest("figure");
      const cap = fig ? fig.querySelector("figcaption") : null;
      if (img) {
        openLightbox(img.src, img.alt, cap ? cap.innerHTML : "");
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // 5. Copy BibTeX button
  const copyBibBtn = document.getElementById("copy-bibtex-btn");
  const bibtexCode = document.getElementById("bibtex-code");

  if (copyBibBtn && bibtexCode) {
    copyBibBtn.addEventListener("click", async () => {
      const text = bibtexCode.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        copyBibBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBibBtn.textContent = "Copy";
        }, 1800);
      } catch (_err) {
        const range = document.createRange();
        range.selectNodeContents(bibtexCode);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        document.execCommand("copy");
        copyBibBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBibBtn.textContent = "Copy";
        }, 1800);
      }
    });
  }
})();

// Autoplay simulator/teaser videos when scrolled into view (muted); user pause is respected.
(function () {
  "use strict";
  const vids = Array.from(document.querySelectorAll(".supp-video, #hero-teaser-video"));
  if (!vids.length || !("IntersectionObserver" in window)) return;
  const userPaused = new WeakSet();
  const auto = new WeakSet();
  vids.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.addEventListener("pause", () => {
      if (auto.has(v)) auto.delete(v);
      else if (!v.ended) userPaused.add(v);
    });
    v.addEventListener("play", () => userPaused.delete(v));
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!userPaused.has(v) && v.paused) v.play().catch(() => {});
        } else if (!v.paused) {
          auto.add(v);
          v.pause();
        }
      });
    },
    { threshold: [0, 0.5] }
  );
  vids.forEach((v) => io.observe(v));
})();
