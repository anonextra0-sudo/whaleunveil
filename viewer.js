// Results viewer: large synced Input / Ours / GT with optional layers and baselines.
(function () {
  "use strict";
  const DATA = window.VIEWER_DATA;
  const root = document.getElementById("viewer");
  if (!DATA || !root) return;

  const $ = (sel) => root.querySelector(sel);
  const stage = $("#viewer-stage");
  const thumbs = $("#viewer-thumbs");
  const layersBox = $("#viewer-layers");
  const baseBox = $("#viewer-base");
  const layersGrid = $("#viewer-layers-grid");
  const baseGrid = $("#viewer-base-grid");
  const btnPlay = $("#vbtn-play");
  const btnSpeed = $("#vbtn-speed");
  const btnLayers = $("#vbtn-layers");
  const btnBase = $("#vbtn-base");
  const meta = $("#viewer-meta");

  const SPEEDS = [1, 0.5, 0.25];
  let kind = "real";
  let idx = 0;
  let speedIdx = 0;
  let playing = true;

  const src = (k, id, key) => `assets/viewer/${k}/${id}/${key}.mp4`;

  function panel(k, id, entry) {
    const fig = document.createElement("figure");
    fig.className = "vpanel" + (entry.key === "ours" ? " is-ours" : "");
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.poster = `assets/viewer/${k}/${id}/${entry.key}.jpg`;
    v.src = src(k, id, entry.key);
    const cap = document.createElement("figcaption");
    if (entry.sym) {
      const s = document.createElement("span");
      s.className = "sym";
      if (entry.sym === "M_w") s.innerHTML = "M<sub>w</sub>";
      else s.textContent = entry.sym;
      cap.appendChild(s);
    }
    cap.appendChild(document.createTextNode(entry.label));
    fig.append(v, cap);
    return fig;
  }

  function videos() {
    return Array.from(root.querySelectorAll(".vpanel video")).filter(
      (v) => !v.closest("[hidden]")
    );
  }

  function master() {
    return stage.querySelector("video");
  }

  function applyPlayState() {
    const rate = SPEEDS[speedIdx];
    videos().forEach((v) => {
      v.playbackRate = rate;
      if (playing) v.play().catch(() => {});
      else v.pause();
    });
    btnPlay.textContent = playing ? "Pause" : "Play";
    btnSpeed.textContent = `Speed ${rate}×`;
  }

  function sync() {
    const m = master();
    if (m && m.readyState >= 2) {
      videos().forEach((v) => {
        if (v === m || v.readyState < 2) return;
        if (Math.abs(v.currentTime - m.currentTime) > 0.06) v.currentTime = m.currentTime;
      });
    }
    requestAnimationFrame(sync);
  }

  function fillExtras() {
    const item = DATA[kind][idx];
    layersGrid.replaceChildren();
    baseGrid.replaceChildren();
    if (!layersBox.hidden) item.layers.forEach((e) => layersGrid.appendChild(panel(kind, item.id, e)));
    if (!baseBox.hidden) {
      baseGrid.className = "viewer-grid" + (item.base.length === 5 ? " cols-5" : "");
      item.base.forEach((e) => baseGrid.appendChild(panel(kind, item.id, e)));
    }
  }

  function show() {
    const item = DATA[kind][idx];
    stage.className = "viewer-stage cols-" + item.main.length;
    stage.replaceChildren(...item.main.map((e) => panel(kind, item.id, e)));
    fillExtras();
    Array.from(thumbs.children).forEach((t, i) => t.classList.toggle("active", i === idx));
    meta.innerHTML =
      (kind === "real"
        ? "Held-out real drone footage"
        : "Held-out simulated test scene (unseen creature)") +
      ` &middot; 480&times;864 &middot; 17 frames, looped forward and back &middot; <code>${item.id}</code>`;
    applyPlayState();
  }

  function buildThumbs() {
    thumbs.replaceChildren(
      ...DATA[kind].map((item, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "viewer-thumb";
        b.setAttribute("aria-label", `Example ${i + 1}`);
        const img = document.createElement("img");
        img.src = `assets/viewer/${kind}/${item.id}/poster.jpg`;
        img.alt = "";
        img.loading = "lazy";
        b.appendChild(img);
        b.addEventListener("click", () => {
          idx = i;
          show();
        });
        return b;
      })
    );
  }

  root.querySelectorAll(".viewer-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      kind = tab.dataset.kind;
      idx = 0;
      root.querySelectorAll(".viewer-tab").forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      buildThumbs();
      show();
    });
  });

  function toggle(btn, box) {
    box.hidden = !box.hidden;
    btn.setAttribute("aria-pressed", box.hidden ? "false" : "true");
    fillExtras();
    applyPlayState();
  }

  btnLayers.addEventListener("click", () => toggle(btnLayers, layersBox));
  btnBase.addEventListener("click", () => toggle(btnBase, baseBox));
  btnPlay.addEventListener("click", () => {
    playing = !playing;
    applyPlayState();
  });
  btnSpeed.addEventListener("click", () => {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    applyPlayState();
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const n = DATA[kind].length;
      idx = (idx + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
      show();
    }
  });

  buildThumbs();
  show();
  requestAnimationFrame(sync);
})();
