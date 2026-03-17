/* ═══════════════════════════════════════════════════════════
   Fish Task  (Speechley et al., 2010)
   study.js — jsPsych 7.3.4
═══════════════════════════════════════════════════════════ */

/* ── 0. CONFIG ─────────────────────────────────────────── */
const SERIES = [
  { id: 1, sequence: ["black","white","black","white","white","black","white","black","black","white"], lakeA: {black:50,white:50}, lakeB: {black:20,white:80} },
  { id: 2, sequence: Array(10).fill("black"),                                                           lakeA: {black:80,white:20}, lakeB: {black:20,white:80} },
  { id: 3, sequence: Array(10).fill("black"),                                                           lakeA: {black:80,white:20}, lakeB: {black:50,white:50} },
  { id: 4, sequence: Array(10).fill("black"),                                                           lakeA: {black:50,white:50}, lakeB: {black:20,white:80} },
  { id: 5, sequence: ["black","white","black","black","black","black","white","black","black","black"],  lakeA: {black:80,white:20}, lakeB: {black:50,white:50} },
  { id: 6, sequence: Array(10).fill("black"),                                                           lakeA: {black:50,white:50}, lakeB: {black:50,white:50} },
];

// Canvas スライダー定数
const SLIDER_STEPS  = [-100,-80,-60,-40,-20,0,20,40,60,80,100];
const SLIDER_LABELS = {
  "-100":"100% A湖だと思う", "-80":"80% A湖だと思う",
  "-60":"60% A湖だと思う",  "-40":"40% A湖だと思う",
  "-20":"20% A湖だと思う",   "0":"どちらともいえない",
   "20":"20% B湖だと思う",   "40":"40% B湖だと思う",
   "60":"60% B湖だと思う",   "80":"80% B湖だと思う",
  "100":"100% B湖だと思う",
};
const TICK_LABELS   = ["100%","80%","60%","40%","20%","0%","20%","40%","60%","80%","100%"];
const DPR           = window.devicePixelRatio || 1;
const CANVAS_H      = 160;
const AXIS_Y        = 80;
const TICK_H        = 8;
const LABEL_Y       = AXIS_Y - 16;
const END_LABEL_Y   = AXIS_Y - 40;
const THUMB_W       = 15;
const THUMB_H       = 44;
const THUMB_OFFSET  = 60;
const thumbImg      = new Image();
thumbImg.src        = "images/tsumami.png";

function sliderAxisX(cssW) {
  const pad = cssW < 500 ? 25 : 60;
  return { left: pad, right: cssW - pad, width: cssW - pad * 2 };
}
function sliderStepX(index, cssW) {
  const ax = sliderAxisX(cssW);
  return ax.left + (index / (SLIDER_STEPS.length - 1)) * ax.width;
}
function drawSlider(canvas, ctx, currentStep) {
  const cssW = canvas.clientWidth;
  const ax   = sliderAxisX(cssW);
  ctx.clearRect(0, 0, cssW, CANVAS_H);
  ctx.textBaseline = "bottom";
  // 目盛りラベル
  ctx.fillStyle = "#1E293B";
  ctx.textAlign = "center";
  ctx.font = `${cssW < 500 ? 9 : 11}px 'Segoe UI',sans-serif`;
  SLIDER_STEPS.forEach((_, i) => {
    ctx.fillText(TICK_LABELS[i], sliderStepX(i, cssW), LABEL_Y);
  });
  // 端ラベル
  ctx.font      = `bold ${cssW < 500 ? 10 : 12}px 'Segoe UI',sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";
  ctx.fillText("A湖と確信", ax.left - 10, END_LABEL_Y);
  ctx.textAlign = "right";
  ctx.fillText("B湖と確信", ax.right + 10, END_LABEL_Y);
  // 数直線
  ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ax.left, AXIS_Y); ctx.lineTo(ax.right, AXIS_Y); ctx.stroke();
  // 目盛り
  ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 1;
  SLIDER_STEPS.forEach((_, i) => {
    const x = sliderStepX(i, cssW);
    ctx.beginPath(); ctx.moveTo(x, AXIS_Y); ctx.lineTo(x, AXIS_Y + TICK_H); ctx.stroke();
  });
  // ツマミ
  const tx = sliderStepX(currentStep, cssW);
  if (thumbImg.complete && thumbImg.naturalWidth > 0) {
    ctx.drawImage(thumbImg, tx - THUMB_W/2, AXIS_Y - THUMB_H + THUMB_OFFSET, THUMB_W, THUMB_H);
  } else {
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath(); ctx.arc(tx, AXIS_Y, 12, 0, Math.PI*2); ctx.fill();
  }
}
function initSliderCanvas(canvas, ctx) {
  const cssW = canvas.parentElement.clientWidth;
  canvas.style.width  = cssW + "px";
  canvas.style.height = CANVAS_H + "px";
  canvas.width  = Math.round(cssW * DPR);
  canvas.height = Math.round(CANVAS_H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

const CONFIG = {
  GAS_URL: "https://script.google.com/macros/s/AKfycbyjheMo4PPOEXImemILUdeXcyZPwWu8BghhNIjJGj6A20XNF3X_iDsxPm7hpaK0i6KD/exec",
};

const PARTICIPANT_ID = Math.random().toString(36).slice(2, 10).toUpperCase();

/* ── 1. CSS ─────────────────────────────────────────────── */
document.head.insertAdjacentHTML("beforeend", `<style>
:root {
  --black:#1E293B; --white:#F8FAFC; --green:#10B981;
  --bg:#F1F5F9; --card:#fff; --text:#1E293B;
  --muted:#64748B; --border:#E2E8F0; --blue:#3B82F6;
  --lake-a:#3B82F6; --lake-b:#F59E0B;
}
body { background:var(--bg); font-family:'Segoe UI',system-ui,sans-serif; color:var(--text); margin:0; }
.jspsych-display-element { display:flex; align-items:flex-start; justify-content:center; min-height:100vh; padding:0; box-sizing:border-box; }
.jspsych-content { width:100%; }

.card { background:var(--card); border-radius:0; box-shadow:none; padding:40px 80px; text-align:center; min-height:100vh; box-sizing:border-box; }
.card-instruction { background:var(--card); border-radius:0; box-shadow:none; padding:40px 80px; text-align:center; min-height:100vh; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.task-title { font-size:1.35rem; font-weight:700; margin:0 0 6px; }
.subtitle   { color:var(--muted); margin:0 0 20px; font-size:.88rem; line-height:1.7; }

/* 教示 */
.scene-progress { display:flex; gap:8px; justify-content:center; margin-bottom:22px; }
.scene-dot { width:10px; height:10px; border-radius:50%; background:var(--border); transition:background .2s; }
.scene-dot.active { background:var(--green); }
.scene-img      { width:40%; object-fit:contain; border-radius:10px; margin-bottom:18px; }
.scene-img-row  { display:flex; flex-direction:row; gap:30px; justify-content:center; margin-bottom:18px; }
.scene-img-half { display:block; width:33%; object-fit:contain; border-radius:10px; }
.scene-body { font-size:1.35rem; line-height:1.9; margin:0 0 28px; min-height:80px; }
.btn-nav-row { display:flex; gap:12px; justify-content:center; }

/* progress */
.progress-wrap { margin-bottom:16px; }
.progress-label { font-size:.8rem; color:var(--muted); margin-bottom:5px; }
.progress-bar-bg { background:var(--border); border-radius:999px; height:8px; overflow:hidden; }
.progress-bar-fill { background:var(--green); height:100%; border-radius:999px; transition:width .4s; }

/* lakes display */
.lakes-row { display:flex; gap:14px; justify-content:center; margin-bottom:18px; }
.lake-block { flex:1; max-width:175px; border:2px solid var(--border); border-radius:14px; padding:12px 8px; background:#fafafa; }
.lake-block.lake-a { border-color:var(--lake-a); }
.lake-block.lake-b { border-color:var(--lake-b); }
.lake-label { font-weight:700; margin-bottom:3px; font-size:.9rem; }
.lake-label.a { color:var(--lake-a); }
.lake-label.b { color:var(--lake-b); }
.lake-ratio { font-size:.7rem; color:var(--muted); margin-bottom:8px; }
.fish-grid { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; }
.fish-dot { width:14px; height:14px; border-radius:50%; border:1px solid rgba(0,0,0,.1); }
.fish-dot.black { background:var(--black); }
.fish-dot.white { background:#CBD5E1; border:1px solid #94A3B8; }

/* sequence */
.seq-label { font-size:.7rem; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); margin-bottom:6px; }
.seq-beads { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; min-height:30px; align-items:center; margin-bottom:16px; }
.seq-bead  { width:22px; height:22px; border-radius:50%; border:2px solid rgba(0,0,0,.1); }
.seq-bead.black { background:var(--black); }
.seq-bead.white { background:#CBD5E1; border:2px solid #94A3B8; }
.seq-bead.newest { box-shadow:0 0 0 3px var(--blue); }
.seq-empty { color:var(--muted); font-size:.85rem; }

/* current fish */
.current-fish-wrap { margin-bottom:16px; }
.current-fish-label { font-size:.78rem; color:var(--muted); margin-bottom:6px; }
.current-fish {
  width:56px; height:56px; border-radius:50%;
  border:3px solid rgba(0,0,0,.12);
  margin:0 auto;
  display:flex; align-items:center; justify-content:center;
  font-size:1.5rem;
  animation:pop .22s ease;
}
.current-fish.black { background:var(--black); }
.current-fish.white { background:#CBD5E1; border:2px solid #94A3B8; }
@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }

/* canvas slider */
.rating-section { margin:0 0 8px; }
.rating-title { font-size:1.1rem; font-weight:700; text-decoration:underline; color:var(--text); margin-bottom:16px; }
.slider-canvas { display:block; width:100%; cursor:pointer; touch-action:none; }
.slider-current-label { font-size:1.3rem; font-weight:700; min-height:36px; margin:40px 0 16px; color:var(--text); text-align:center; }

/* buttons */
.btn { padding:12px 24px; border-radius:10px; border:none; font-size:1rem; font-weight:600; cursor:pointer; transition:opacity .15s,transform .1s; }
.btn:hover  { opacity:.87; transform:translateY(-1px); }
.btn:active { transform:translateY(0); }
.btn-catch  { background:var(--blue);  color:#fff; width:100%; padding:14px; font-size:1.05rem; }
.btn-next   { background:var(--green); color:#fff; width:100%; padding:13px; }
.btn-back   { background:#E2E8F0; color:var(--text); }
.btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }

/* task layout */
.task-layout { display: flex; align-items: stretch; justify-content: center; gap: 24px; margin: 16px 0 24px; }
.fish-mobile-only { display:none; flex-direction:column; align-items:center; gap:8px; margin:12px 0 0; }
.task-center-mobile { display:none !important; flex-direction:column; align-items:center; gap:12px; width:100%; margin-top:12px; }
.task-lake-img { width:42%; object-fit:contain; }
.task-center { flex: 0 0 220px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 320px; }
.task-center-spacer { flex: 1 1 auto; }
.task-action { width: 100%; margin-top: 16px; display: flex; justify-content: center; }
.task-action .btn-next { width: 100%; max-width: 210px; }
.caught-fish-img { width:120px; object-fit:contain; animation:pop .22s ease; }
.seq-fish-row { min-height: 28px; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.seq-circle { width:22px; height:22px; border-radius:50%; border:2px solid rgba(0,0,0,.15); flex-shrink:0; }
.seq-circle.black { background:#1E293B; }
.seq-circle.white { background:#CBD5E1; border-color:#94A3B8; }


/* result table */
.data-table { width:100%; border-collapse:collapse; margin-top:16px; font-size:.78rem; text-align:left; }
.data-table th,.data-table td { border:1px solid var(--border); padding:5px 7px; }
.data-table th { background:#f8fafc; font-weight:600; }
.data-table tr:nth-child(even) td { background:#fafbfc; }
.btn-dl { background:#6366F1; color:#fff; margin-top:16px; }

/* ── モバイル対応 (縦向きスマホ) ───────────────────────── */
@media (max-width: 600px) {
  .card, .card-instruction {
    padding: 24px 16px;
  }
  .task-title { font-size: 1.15rem; }
  .scene-body { font-size: 1rem; min-height: unset; }
  .scene-img  { width: 80%; }
  .scene-img-row { flex-direction: column; align-items: center; gap: 8px; }
  .scene-img-half { width: 92%; }

  /* 課題画面: 縦積みレイアウト */
  .task-layout {
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }
  .task-lake-img { width: 92%; }
  .task-center { width: 100%; }
  .caught-fish-img { width: 80px; }
  .task-center-desktop { display: none !important; }
  .fish-mobile-only { display:flex !important; }
  .task-center-mobile  { display: flex !important; }

  /* ラジオボタン */
  .slider-current-label { font-size:1rem; margin:28px 0 12px; }

  /* ボタン */
  .btn { font-size: .9rem; padding: 10px 18px; }
  .btn-catch, .btn-next { padding: 12px; }

  /* 履歴丸 */
  .seq-circle { width: 16px; height: 16px; }

  /* 終了画面テーブル */
  .data-table { font-size: .68rem; }
}
</style>`);

/* ── 2. ユーティリティ ──────────────────────────────────── */
const fishGridHTML = (lake) => {
  const total = lake.black + lake.white;
  const n = 20;
  const nB = Math.round(lake.black / total * n);
  const nW = Math.round(lake.white / total * n);
  return `<div class="fish-grid">
    ${"<div class='fish-dot black'></div>".repeat(nB)}
    ${"<div class='fish-dot white'></div>".repeat(nW)}
  </div>`;
};

const seqHTML = (seq) =>
  seq.length
    ? seq.map((c, i) =>
        `<div class="seq-bead ${c}"></div>`
      ).join("")
    : `<span class="seq-empty">まだ釣れていません</span>`;



/* ── 3. GAS 送信 ────────────────────────────────────────── */
async function sendToGAS(data) {
  try {
    await fetch(CONFIG.GAS_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) { console.error("GAS送信エラー:", err); }
}

/* ── 4. jsPsych 初期化 ──────────────────────────────────── */
const jsPsych = initJsPsych({ on_finish() { showEndScreen(); } });

/* ── 5. 教示スライドプラグイン ──────────────────────────── */
const SCENES = [
  "この課題では、2つの湖（A湖とB湖）が登場します。それぞれの湖には<b>黒い魚と白い魚</b>が異なる比率で泳いでいます。",
  "漁師は<b>どちらか一方の湖だけで釣り</b>をしますが、どちらの湖で釣りをしているかは分かりません。あなたは釣れた魚の色を見て、漁師が<b>どちらの湖で釣りをしているかを予想</b>してください。",
  "湖Aには黒い魚が<b>80匹</b>と白い魚が<b>20匹</b>、湖Bには白い魚が<b>80匹</b>と黒い魚が<b>20匹</b>泳いでいます。<b>釣れた魚は毎回湖に戻される</b>ため、湖の魚の比率は変わりません。",
  "評価は9段階で行います。左端は<b>A湖で釣りをしている可能性</b>が高く、右端は<b>B湖で釣りをしている可能性</b>が高いことを示します。真ん中はどちらで釣りをしているか<b>決めきれない場合</b>を示します。",
  "漁師は<b>1日に10匹</b>魚を釣り上げます。次の日になったら漁師はまた<b>湖を選びなおします</b>。あなたには、これから<b>6日間</b>漁師が釣った魚の色を見て、湖を予想していただきます。",
  "課題の内容が理解できたら「<b>次へ</b>」を、もう一度確認したい場合は「<b>もう一度</b>」をクリックしてください。",
];

const SCENE_IMAGES = [
  ["images/lake_A.png", "images/lake_B.png"],  // シーン1: 横並び2枚
  "images/fisherman2.png",
  ["images/lake_A.png", "images/lake_B.png"],
  "images/scene4.png",
  "images/task.png",
  "images/task.png",
  null,
];

class InstructionSlidesPlugin {
  constructor(jsPsych) { this.jsPsych = jsPsych; }
  trial(display_el) {
    let current = 0;
    const render = () => {
      const isLast = current === SCENES.length - 1;
      const dots = SCENES.map((_, i) =>
        `<div class="scene-dot ${i === current ? "active" : ""}"></div>`
      ).join("");
      const imgSrc  = SCENE_IMAGES[current];
      const imgHTML = !imgSrc ? "" :
        Array.isArray(imgSrc)
          ? `<div class="scene-img-row">${imgSrc.map(s => `<img src="${s}" class="scene-img-half" alt="">`).join("")}</div>`
          : `<img src="${imgSrc}" class="scene-img" alt="scene${current+1}">`;
      display_el.innerHTML = `
        <div class="card-instruction">
          <h1 class="task-title">課題の説明</h1>
          <div class="scene-progress">${dots}</div>
          ${imgHTML}
          <div class="scene-body">${SCENES[current]}</div>
          <div class="btn-nav-row">
            ${current > 0 ? `<button class="btn btn-back" id="btn-back">← 戻る</button>` : ""}
            <button class="btn btn-next" id="btn-next" style="width:auto;padding:12px 28px">
              ${isLast ? "次へ →" : "次へ →"}
            </button>
            ${isLast ? `<button class="btn btn-back" id="btn-restart">もう一度</button>` : ""}
          </div>
        </div>`;
      document.getElementById("btn-next").onclick = () => {
        if (isLast) { this.jsPsych.finishTrial(); }
        else { current++; render(); }
      };
      document.getElementById("btn-back")?.addEventListener("click",    () => { current--; render(); });
      document.getElementById("btn-restart")?.addEventListener("click", () => { current = 0; render(); });
    };
    render();
  }
}
InstructionSlidesPlugin.info = { name: "instruction-slides", parameters: {} };

/* ── 6. Fish Task プラグイン ────────────────────────────── */
class FishTaskPlugin {
  constructor(jsPsych) { this.jsPsych = jsPsych; }

  trial(display_el, trial) {
    const series = SERIES[trial.series_index];
    this._state  = { seq: [], results: [] };
    this._renderCatch(display_el, trial, series);
  }

_renderCatch(display_el, trial, series) {
  const { seq } = this._state;
  const catchNum = seq.length;
  const total    = series.sequence.length;
  const pct      = (catchNum / total * 100).toFixed(0);

  const seqImgHTML = seq.length
    ? seq.map((c, i) =>
        `<div class="seq-circle ${c}"></div>`
      ).join("")
    : `<span style="color:var(--muted);font-size:.85rem">まだ魚を釣っていません</span>`;

  display_el.innerHTML = `
    <div class="card">
      <h1 class="task-title">${series.id} 日目</h1>

      <div class="progress-wrap">
        <div class="progress-label">${catchNum} / ${total} 匹目</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="task-layout">
        <img src="images/lake_A.png" class="task-lake-img" alt="A湖">

        <div class="task-center task-center-desktop">
          <div class="seq-label">これまでに釣れた魚の色</div>
          <div class="seq-fish-row">${seqImgHTML}</div>

          <p style="font-size:.95rem;color:var(--blue);font-weight:700;margin:8px 0 0">
            次は <b>${catchNum + 1}</b> 匹目です
          </p>

          <div class="task-center-spacer"></div>

          <div class="task-action">
            <button class="btn btn-catch" id="btn-catch">釣れた魚を確認する</button>
          </div>
        </div>

        <img src="images/lake_B.png" class="task-lake-img" alt="B湖">
      </div>

      <div class="task-center task-center-mobile">
        <div class="seq-label">これまでに釣れた魚の色</div>
        <div class="seq-fish-row">${seqImgHTML}</div>

        <p style="font-size:.95rem;color:var(--blue);font-weight:700;margin:8px 0 0">
          次は <b>${catchNum + 1}</b> 匹目です
        </p>

        <div class="task-action">
          <button class="btn btn-catch" id="btn-catch-mobile">釣れた魚を確認する</button>
        </div>
      </div>
    </div>`;

    const onCatch = () => {
      const t0    = performance.now();
      const color = series.sequence[catchNum];
      this._state.seq.push(color);
      this._renderRating(display_el, trial, series, color, t0);
    };
    document.getElementById("btn-catch")?.addEventListener("click", onCatch);
    document.getElementById("btn-catch-mobile")?.addEventListener("click", onCatch);
  }

_renderRating(display_el, trial, series, fishColor, t0) {
  const { seq } = this._state;
  const catchNum = seq.length;
  const total    = series.sequence.length;
  const pct      = (catchNum / total * 100).toFixed(0);
  const fishImg  = fishColor === "black" ? "blackfish" : "whitefish";

  const seqImgHTML = seq.length
    ? seq.map(c => `<div class="seq-circle ${c}"></div>`).join("")
    : `<span style="color:var(--muted);font-size:.85rem">まだ魚を釣っていません</span>`;

  display_el.innerHTML = `
    <div class="card">
      <h1 class="task-title">${series.id} 日目</h1>

      <div class="progress-wrap">
        <div class="progress-label">${catchNum} / ${total} 匹目</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="task-layout">
        <img src="images/lake_A.png" class="task-lake-img" alt="A湖">

        <div class="task-center task-center-desktop">
          <div class="seq-label">これまでに釣れた魚の色</div>
          <div class="seq-fish-row">${seqImgHTML}</div>

          <div class="current-fish-label" style="margin-top:14px;">
            ${catchNum} 匹目に釣り上げた魚
          </div>
          <img src="images/${fishImg}.png" class="caught-fish-img" alt="${fishColor}">
        </div>

        <img src="images/lake_B.png" class="task-lake-img" alt="B湖">
      </div>

      <div class="fish-mobile-only">
        <div class="seq-label">これまでに釣れた魚の色</div>
        <div class="seq-fish-row">${seqImgHTML}</div>

        <div class="current-fish-label" style="margin-top:14px;">
          ${catchNum} 匹目に釣り上げた魚
        </div>
        <img src="images/${fishImg}.png" class="caught-fish-img" alt="${fishColor}">
      </div>

      <div class="rating-section">
        <div class="rating-title">漁師はどちらの湖で釣りをしているでしょうか？</div>
        <canvas id="slider-canvas" class="slider-canvas"></canvas>
        <div class="slider-current-label" id="slider-label">どちらともいえない</div>
      </div>

      <button class="btn btn-next" id="btn-confirm">
        ${catchNum < total ? "次の魚へ →" : `${series.id} 日目を終了する →`}
      </button>
    </div>`;

    // Canvas スライダー初期化
    let sliderStep = 5; // 初期値 index=5 → value=0
    let sliderDragging = false;
    const sliderCanvas = display_el.querySelector("#slider-canvas");
    const sliderCtx    = sliderCanvas.getContext("2d");
    const sliderLabel  = display_el.querySelector("#slider-label");

    initSliderCanvas(sliderCanvas, sliderCtx);
    drawSlider(sliderCanvas, sliderCtx, sliderStep);
    thumbImg.onload = () => drawSlider(sliderCanvas, sliderCtx, sliderStep);

    function sliderXToStep(clientX) {
      const rect = sliderCanvas.getBoundingClientRect();
      const cssW = sliderCanvas.clientWidth;
      const ax   = sliderAxisX(cssW);
      const relX = clientX - rect.left;
      const pct  = Math.max(0, Math.min(1, (relX - ax.left) / ax.width));
      return Math.round(pct * (SLIDER_STEPS.length - 1));
    }
    function onSliderMove(clientX) {
      sliderStep = sliderXToStep(clientX);
      sliderLabel.textContent = SLIDER_LABELS[String(SLIDER_STEPS[sliderStep])];
      drawSlider(sliderCanvas, sliderCtx, sliderStep);
    }

    sliderCanvas.addEventListener("mousedown", e => { sliderDragging = true; onSliderMove(e.clientX); });
    window.addEventListener("mousemove", e => { if (sliderDragging) onSliderMove(e.clientX); });
    window.addEventListener("mouseup",   () => { sliderDragging = false; });
    sliderCanvas.addEventListener("touchstart", e => { e.preventDefault(); sliderDragging = true; onSliderMove(e.touches[0].clientX); }, { passive:false });
    window.addEventListener("touchmove",  e => { if (sliderDragging) { e.preventDefault(); onSliderMove(e.touches[0].clientX); } }, { passive:false });
    window.addEventListener("touchend",   () => { sliderDragging = false; });

    window.addEventListener("resize", () => {
      initSliderCanvas(sliderCanvas, sliderCtx);
      drawSlider(sliderCanvas, sliderCtx, sliderStep);
    });

    display_el.querySelector("#btn-confirm").onclick = () => {
      const confidence = SLIDER_STEPS[sliderStep];  // -100〜+100
      const choice     = confidence < 0 ? "A" : confidence > 0 ? "B" : "none";

      const record = {
        participant_id:   PARTICIPANT_ID,
        series_num:       series.id,
        catch_num:        catchNum,
        lake_a_black_pct: series.lakeA.black,
        lake_b_black_pct: series.lakeB.black,
        fish_color:       fishColor,
        sequence_so_far:  seq.join(","),
        confidence,   // -100〜+100
        choice,       // "A" | "B" | "none"
        rt:           Math.round(performance.now() - t0),
      };

      this._state.results.push(record);
      sendToGAS(record);

      if (catchNum >= total) {
        // 最終シリーズでなければ中継スライドを挟む
        const isLastSeries = series.id === SERIES.length;
        if (isLastSeries) {
          this.jsPsych.finishTrial({ series_id: series.id, results: this._state.results });
        } else {
          this._renderDayTransition(display_el, trial, series);
        }
      } else {
        this._renderCatch(display_el, trial, series);
      }
    };
  }
  _renderDayTransition(display_el, trial, series) {
    display_el.innerHTML = `
      <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
        <img src="images/gohome.png" class="scene-img" alt="">
        <h1 class="task-title" style="font-size:2rem;margin-bottom:12px">${series.id}日目が終わりました</h1>
        <p style="font-size:1.1rem;color:var(--muted);margin-bottom:32px;line-height:1.8">
          漁師は湖を選びなおしました。<br>
          明日（${series.id + 1}日目）はどちらの湖で釣りをするのでしょうか？
        </p>
        <button class="btn btn-next" id="btn-next-day" style="width:auto;padding:14px 36px;font-size:1.05rem">
          ${series.id + 1}日目へ進む →
        </button>
      </div>`;

    document.getElementById("btn-next-day").onclick = () => {
      this.jsPsych.finishTrial({ series_id: series.id, results: this._state.results });
    };
  }
}
FishTaskPlugin.info = { name: "fish-task", parameters: { series_index: { type: "INT", default: 0 } } };

/* ── 7. タイムライン ────────────────────────────────────── */
jsPsych.run([
  { type: InstructionSlidesPlugin },
  ...SERIES.map((_, i) => ({ type: FishTaskPlugin, series_index: i })),
]);

/* ── 8. 終了画面 ────────────────────────────────────────── */
function showEndScreen() {
  const allResults = jsPsych.data
    .get()
    .filter({ trial_type: "fish-task" })
    .values()
    .flatMap((t) => t.results || []);

  const nTotal = allResults.length;
  const avgRT  = nTotal
    ? Math.round(allResults.reduce((s, d) => s + d.rt, 0) / nTotal)
    : "—";

  const rows = allResults.map((d) => `
    <tr>
      <td>${d.series_num}</td>
      <td>${d.catch_num}</td>
      <td>${d.fish_color === "black" ? "⚫" : "⚪"}</td>
      <td>${d.confidence}</td>
      <td>${d.choice}</td>
      <td>${d.rt}</td>
    </tr>`).join("");

  document.querySelector(".jspsych-display-element").innerHTML = `
    <div class="card" style="">
      <div style="font-size:2.5rem;margin-bottom:8px">🎉</div>
      <h1 class="task-title">終了 — お疲れ様でした！</h1>
      <p class="subtitle">
        参加者ID: <code>${PARTICIPANT_ID}</code><br>
        総釣り数: <b>${nTotal}</b> 匹　｜　平均RT: <b>${avgRT} ms</b><br>
        <small style="color:var(--green)">✅ データはスプレッドシートに自動保存されました</small>
      </p>
      <table class="data-table">
        <thead><tr>
          <th>series</th><th>catch</th><th>color</th>
          <th>confidence</th><th>choice</th><th>rt(ms)</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div>
        <button class="btn btn-dl" id="btn-csv">📥 CSV ダウンロード（バックアップ）</button>
      </div>
    </div>`;

  document.querySelector("#btn-csv").onclick = () => {
    const cols  = ["participant_id","series_num","catch_num",
                   "lake_a_black_pct","lake_b_black_pct",
                   "fish_color","sequence_so_far","confidence","choice","rt"];
    const lines = [
      cols.join(","),
      ...allResults.map(d => cols.map(c => JSON.stringify(d[c] ?? "")).join(",")),
    ];
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })),
      download: `fish_task_${PARTICIPANT_ID}_${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click();
  };
}
