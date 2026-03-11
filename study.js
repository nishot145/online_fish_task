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

// 11段階・中央0・両端±100
// value=保存値(-100〜+100)、label=表示値（絶対値）
const RATING_OPTIONS = [
  { value: -100, label: "100%A湖だと思う" },
  { value:  -80, label: "80%"  },
  { value:  -60, label: "60"  },
  { value:  -40, label: "40"  },
  { value:  -20, label: "20"  },
  { value:    0, label:  "どちらともいえない"  },
  { value:   20, label: "20"  },
  { value:   40, label: "40"  },
  { value:   60, label: "60"  },
  { value:   80, label: "80"  },
  { value:  100, label: "100%B湖だと思う" },
];

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
.task-title { font-size:1.35rem; font-weight:700; margin:0 0 6px; }
.subtitle   { color:var(--muted); margin:0 0 20px; font-size:.88rem; line-height:1.7; }

/* 教示 */
.scene-progress { display:flex; gap:8px; justify-content:center; margin-bottom:22px; }
.scene-dot { width:10px; height:10px; border-radius:50%; background:var(--border); transition:background .2s; }
.scene-dot.active { background:var(--green); }
.scene-img      { width:50%; object-fit:contain; border-radius:10px; margin-bottom:18px; }
.scene-img-row  { display:flex; gap:30px; justify-content:center; margin-bottom:18px; }
.scene-img-half { display:block; width:33%; object-fit:contain; border-radius:10px;}
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

/* radio rating */
.rating-section { margin:0 0 20px; }
.rating-title { font-size:.85rem; font-weight:600; color:var(--muted); margin-bottom:12px; }

.rating-axis {
  display:flex;
  align-items:flex-start;
  gap:0;
  position:relative;
  justify-content:center;
  margin-bottom:4px;
}
.rating-option {
  display:flex; flex-direction:column; align-items:center;
  flex:1; max-width:56px; cursor:pointer;
}
.rating-option input[type="radio"] { display:none; }
.rating-dot {
  width:22px; height:22px; border-radius:50%;
  border:2px solid var(--border);
  background:#fff;
  transition:all .15s; cursor:pointer;
  margin-bottom:2px;
}
.rating-option input:checked + .rating-dot {
  background:var(--blue); border-color:var(--blue); color:#fff;
  box-shadow:0 2px 8px rgba(59,130,246,.4);
  transform:scale(1.15);
}
.rating-option:hover .rating-dot { border-color:var(--blue); color:var(--blue); }
.rating-val   { font-size:.65rem; font-weight:600; color:var(--muted); margin-top:2px; }
.axis-endpoint-labels {
  display:flex; justify-content:space-between;
  font-size:.72rem; color:var(--muted); margin-top:4px; padding:0 2%;
}

.axis-line {
  position:absolute; top:14px; left:10%; right:10%;
  height:2px; background:var(--border); z-index:0;
}
.rating-dot { position:relative; z-index:1; }

.lake-axis-label {
  display:flex; justify-content:space-between;
  font-size:.78rem; font-weight:700; margin-bottom:8px;
}
.lake-axis-label .la { color:var(--lake-a); }
.lake-axis-label .lb { color:var(--lake-b); }

/* buttons */
.btn { padding:12px 24px; border-radius:10px; border:none; font-size:1rem; font-weight:600; cursor:pointer; transition:opacity .15s,transform .1s; }
.btn:hover  { opacity:.87; transform:translateY(-1px); }
.btn:active { transform:translateY(0); }
.btn-catch  { background:var(--blue);  color:#fff; width:100%; padding:14px; font-size:1.05rem; }
.btn-next   { background:var(--green); color:#fff; width:100%; padding:13px; }
.btn-back   { background:#E2E8F0; color:var(--text); }
.btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }

/* result table */
.data-table { width:100%; border-collapse:collapse; margin-top:16px; font-size:.78rem; text-align:left; }
.data-table th,.data-table td { border:1px solid var(--border); padding:5px 7px; }
.data-table th { background:#f8fafc; font-weight:600; }
.data-table tr:nth-child(even) td { background:#fafbfc; }
.btn-dl { background:#6366F1; color:#fff; margin-top:16px; }
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
        `<div class="seq-bead ${c}${i === seq.length - 1 ? " newest" : ""}"></div>`
      ).join("")
    : `<span class="seq-empty">まだ釣れていません</span>`;

const radioGroupHTML = (name) => `
  <div class="lake-axis-label">
    <span class="la">← Lake A と確信</span>
    <span class="lb">Lake B と確信 →</span>
  </div>
  <div class="rating-axis">
    <div class="axis-line"></div>
    ${RATING_OPTIONS.map(opt => `
      <label class="rating-option">
        <input type="radio" name="${name}" value="${opt.value}">
        <div class="rating-dot"></div>
        <div class="rating-val">${opt.label}</div>
      </label>`).join("")}
  </div>
  <div class="axis-endpoint-labels">
    <span>100%</span><span>0%</span><span>100%</span>
  </div>`;

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
  "この課題では、2つの湖（A湖とB湖）が登場します。<br>それぞれの湖には<b>黒い魚と白い魚</b>が異なる比率で泳いでいます。",
  "漁師はどちらか一方の湖だけで釣りをしますが、どちらの湖で釣りをしているかは分かりません。<br>あなたは釣れた魚の色を見て、漁師がどちらの湖で釣りをしているかを予想してください。",
  "湖Aには黒い魚が<b>80匹</b>と白い魚が<b>20匹</b>、湖Bには白い魚が<b>80匹</b>と黒い魚が<b>20匹</b>泳いでいます。<br><b>釣れた魚は毎回湖に戻される</b>ため、湖の魚の比率は変わりません。",
  "評価は9段階で行います。左端は Lake A の可能性が非常に低い、右端は非常に高いことを示します。",
  "漁師は1日に10匹魚を釣り上げます。次の日になったら漁師はまた湖を選びなおします。<br>あなたには、これから<b>6日間</b>漁師が釣った魚の色を見て、湖を予想していただきます。",
  "課題の内容が理解できたら「次へ」を、もう一度確認したい場合は「もう一度」をクリックしてください。",
];

const SCENE_IMAGES = [
  ["images/Lake_A_B80.png", "images/Lake_B_W80.png"],  // シーン1: 横並び2枚
  "images/fisherman.png",
  ["images/Lake_A_B80.png", "images/Lake_B_W80.png"],
  "images/scene4.png",
  "images/scene5.png",
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
        <div class="card">
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
      document.getElementById("btn-next").onclick = () =>
        isLast ? this.jsPsych.finishTrial() : (current++, render());
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

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">Series ${series.id} / ${SERIES.length}</h1>
        <p class="subtitle">ボタンを押して魚を1匹釣ってください。</p>

        <div class="progress-wrap">
          <div class="progress-label">${catchNum} / ${total} 匹目</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="lakes-row">
          <div class="lake-block lake-a">
            <div class="lake-label a">Lake A</div>
            <div class="lake-ratio">⚫ 黒 ${series.lakeA.black}% ／ ⚪ 白 ${series.lakeA.white}%</div>
            ${fishGridHTML(series.lakeA)}
          </div>
          <div class="lake-block lake-b">
            <div class="lake-label b">Lake B</div>
            <div class="lake-ratio">⚫ 黒 ${series.lakeB.black}% ／ ⚪ 白 ${series.lakeB.white}%</div>
            ${fishGridHTML(series.lakeB)}
          </div>
        </div>

        <div class="seq-label">これまで釣れた魚</div>
        <div class="seq-beads">${seqHTML(seq)}</div>

        <p style="font-size:.95rem;color:var(--blue);font-weight:700;margin:0 0 12px">
          次は <b>${catchNum + 1}</b> 匹目です
        </p>
        <button class="btn btn-catch" id="btn-catch">🎣 魚を釣る</button>
      </div>`;

    document.getElementById("btn-catch").onclick = () => {
      const t0    = performance.now();
      const color = series.sequence[catchNum];
      this._state.seq.push(color);
      this._renderRating(display_el, trial, series, color, t0);
    };
  }

  _renderRating(display_el, trial, series, fishColor, t0) {
    const { seq } = this._state;
    const catchNum = seq.length;
    const total    = series.sequence.length;
    const pct      = (catchNum / total * 100).toFixed(0);
    const colorLabel = fishColor === "black" ? "⚫ 黒" : "⚪ 白";
    let   rated    = false;

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">Series ${series.id} / ${SERIES.length}</h1>

        <div class="progress-wrap">
          <div class="progress-label">${catchNum} / ${total} 匹目</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="current-fish-wrap">
          <div class="current-fish-label">${catchNum} 匹目に釣れた魚</div>
          <div class="current-fish ${fishColor}">${colorLabel}</div>
        </div>

        <div class="rating-section">
          <div class="rating-title">漁師はどちらの湖で釣りをしていると思いますか？</div>
          ${radioGroupHTML("lake_rating")}
        </div>

        <button class="btn btn-next" id="btn-confirm" disabled>
          ${catchNum < total ? "次の魚へ →" : "このシリーズ終了 ✅"}
        </button>
      </div>`;

    display_el.querySelectorAll('input[name="lake_rating"]').forEach(radio => {
      radio.addEventListener("change", () => {
        if (!rated) { rated = true; }
        display_el.querySelector("#btn-confirm").disabled = false;
      });
    });

    display_el.querySelector("#btn-confirm").onclick = () => {
      const selected   = display_el.querySelector('input[name="lake_rating"]:checked');
      const confidence = parseFloat(selected.value);  // -100〜+100 (負=A確信, 正=B確信)
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
        this.jsPsych.finishTrial({ series_id: series.id, results: this._state.results });
      } else {
        this._renderCatch(display_el, trial, series);
      }
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
      <h1 class="task-title">実験終了 — お疲れ様でした！</h1>
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
