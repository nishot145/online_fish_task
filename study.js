/* ═══════════════════════════════════════════════════════════
   Beads Task  (Jumping to Conclusions)
   study.js — jsPsych 7.3.4
   Garety et al. (1991) Condition 2 準拠

   固定シーケンス（20球）:
     黒黒黒黄黒黒黒黒黄黒黄黄黄黒黄黄黄黄黒黄
     (A=黒, B=黄 で固定。ビン選択に関わらず同順)

   スライダー:
     -3 = ビンAと確信
         0 = 全くわからない（中央・毎回リセット）
     +3 = ビンBと確信

   保存データ（1球ごとに1行）:
     participant_id, trial_num, draw_num, true_jar,
     bead_color, sequence_so_far, confidence, choice, rt
═══════════════════════════════════════════════════════════ */

/* ── 0. CONFIG ─────────────────────────────────────────── */
const CONFIG = {
  jarA:          { black: 85, yellow: 15 },
  jarB:          { black: 15, yellow: 85 },
  nTrials:       1,
  // Garety et al. (1991) Condition 2 固定シーケンス
  // A=黒, B=黄
  SEQUENCE: ["black","black","black","yellow","black","black","black","black",
             "yellow","black","yellow","yellow","yellow","black","yellow",
             "yellow","yellow","yellow","black","yellow"],
  GAS_URL: "https://script.google.com/macros/s/AKfycbyjheMo4PPOEXImemILUdeXcyZPwWu8BghhNIjJGj6A20XNF3X_iDsxPm7hpaK0i6KD/exec",
};

const PARTICIPANT_ID = Math.random().toString(36).slice(2, 10).toUpperCase();

/* ── 1. CSS ─────────────────────────────────────────────── */
document.head.insertAdjacentHTML("beforeend", `<style>
:root {
  --black:#1E293B; --yellow:#FACC15; --green:#10B981;
  --bg:#F1F5F9; --card:#fff; --text:#1E293B;
  --muted:#64748B; --border:#E2E8F0; --blue:#3B82F6;
}
body { background:var(--bg); font-family:'Segoe UI',system-ui,sans-serif; color:var(--text); margin:0; }
.jspsych-display-element { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; box-sizing:border-box; }
.jspsych-content { width:100%; max-width:660px; }

.card { background:var(--card); border-radius:20px; box-shadow:0 4px 32px rgba(0,0,0,.09); padding:36px 44px; text-align:center; }
.task-title { font-size:1.35rem; font-weight:700; margin:0 0 6px; }
.subtitle   { color:var(--muted); margin:0 0 20px; font-size:.88rem; line-height:1.7; }

/* 教示 */
.scene-progress { display:flex; gap:8px; justify-content:center; margin-bottom:22px; }
.scene-dot { width:10px; height:10px; border-radius:50%; background:var(--border); transition:background .2s; }
.scene-dot.active { background:var(--green); }
.scene-img  { width:100%; max-height:220px; object-fit:contain; border-radius:10px; margin-bottom:18px; }
.scene-body { font-size:1.05rem; line-height:1.9; margin:0 0 28px; min-height:80px; }
.btn-nav-row { display:flex; gap:12px; justify-content:center; }

/* progress */
.progress-wrap { margin-bottom:18px; }
.progress-label { font-size:.8rem; color:var(--muted); margin-bottom:5px; }
.progress-bar-bg { background:var(--border); border-radius:999px; height:8px; overflow:hidden; }
.progress-bar-fill { background:var(--green); height:100%; border-radius:999px; transition:width .4s; }

/* bins */
.bins-row  { display:flex; gap:14px; justify-content:center; margin-bottom:18px; }
.bin-block { flex:1; max-width:175px; border:2px solid var(--border); border-radius:14px; padding:12px 8px; background:#fafafa; }
.bin-label { font-weight:700; margin-bottom:3px; font-size:.9rem; }
.bin-ratio { font-size:.7rem; color:var(--muted); margin-bottom:8px; }
.bead-grid { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; }
.bead { width:15px; height:15px; border-radius:50%; border:1px solid rgba(0,0,0,.08); }
.bead.black  { background:var(--black); }
.bead.yellow { background:var(--yellow); }

/* sequence */
.seq-label { font-size:.7rem; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); margin-bottom:6px; }
.seq-beads { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; min-height:30px; align-items:center; margin-bottom:18px; }
.seq-bead  { width:22px; height:22px; border-radius:50%; border:2px solid rgba(0,0,0,.1); }
.seq-bead.black  { background:var(--black); }
.seq-bead.yellow { background:var(--yellow); }
.seq-bead.newest { box-shadow:0 0 0 3px var(--blue); }
.seq-empty { color:var(--muted); font-size:.85rem; }

/* current bead */
.current-bead-wrap { margin-bottom:18px; }
.current-bead-label { font-size:.78rem; color:var(--muted); margin-bottom:6px; }
.current-bead {
  width:56px; height:56px; border-radius:50%;
  border:3px solid rgba(0,0,0,.12);
  margin:0 auto;
  display:flex; align-items:center; justify-content:center;
  font-size:1.3rem; font-weight:700;
  animation:pop .22s ease;
}
.current-bead.black  { background:var(--black); color:#fff; }
.current-bead.yellow { background:var(--yellow); color:#1E293B; }
@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }

/* slider */
.slider-section { margin:0 0 22px; }
.slider-end-labels {
  display:grid; grid-template-columns:1fr auto 1fr;
  font-size:.78rem; margin-bottom:10px; gap:4px;
}
.end-a { text-align:left;  font-weight:700; color:var(--black); }
.end-c { text-align:center; color:var(--muted); font-size:.72rem; }
.end-b { text-align:right; font-weight:700; color:#92400E; }

.slider-track { position:relative; display:flex; align-items:center; }
.confidence-slider {
  -webkit-appearance:none; appearance:none;
  width:100%; height:10px; border-radius:999px;
  background:linear-gradient(to right, #1E293B 0%, #CBD5E1 50%, #FACC15 100%);
  outline:none; cursor:pointer;
}
.confidence-slider::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none;
  width:28px; height:28px; border-radius:50%;
  background:#fff; border:3px solid var(--blue);
  box-shadow:0 2px 10px rgba(0,0,0,.22); cursor:grab;
}
.confidence-slider::-moz-range-thumb {
  width:28px; height:28px; border-radius:50%;
  background:#fff; border:3px solid var(--blue);
  box-shadow:0 2px 10px rgba(0,0,0,.22); cursor:grab;
}
.center-tick {
  position:absolute; left:calc(50% - 1px); top:50%;
  transform:translateY(-50%);
  width:2px; height:16px;
  background:rgba(255,255,255,.8);
  pointer-events:none; border-radius:2px;
}
.slider-value-display {
  margin-top:10px; font-size:.95rem; font-weight:700;
  min-height:1.5em; color:var(--blue);
}

/* buttons */
.btn { padding:12px 24px; border-radius:10px; border:none; font-size:1rem; font-weight:600; cursor:pointer; transition:opacity .15s,transform .1s; }
.btn:hover  { opacity:.87; transform:translateY(-1px); }
.btn:active { transform:translateY(0); }
.btn-draw   { background:var(--blue);  color:#fff; width:100%; padding:14px; font-size:1.05rem; }
.btn-next   { background:var(--green); color:#fff; width:100%; padding:13px; }
.btn-back   { background:#E2E8F0; color:var(--text); }
.btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }

/* result table */
.data-table { width:100%; border-collapse:collapse; margin-top:16px; font-size:.8rem; text-align:left; }
.data-table th,.data-table td { border:1px solid var(--border); padding:5px 8px; }
.data-table th { background:#f8fafc; font-weight:600; }
.data-table tr:nth-child(even) td { background:#fafbfc; }
.btn-dl { background:#6366F1; color:#fff; margin-top:16px; }
</style>`);

/* ── 2. ユーティリティ ──────────────────────────────────── */
const pickJar = () => (Math.random() < 0.5 ? "A" : "B");

const beadGridHTML = (jar) => {
  const r = jar === "A" ? CONFIG.jarA : CONFIG.jarB;
  const total = r.black + r.yellow;
  const n = 20;
  const nB = Math.round(r.black  / total * n);
  const nY = Math.round(r.yellow / total * n);
  return `<div class="bead-grid">
    ${"<div class='bead black'></div>".repeat(nB)}
    ${"<div class='bead yellow'></div>".repeat(nY)}
  </div>`;
};

// スライダー値 -100〜+100 → 表示文字列
const SLIDER_LABELS = {
  "-3": "ビン A と確信（-3）",
  "-2": "ビン A だと思う（-2）",
  "-1": "どちらかといえばビン A（-1）",
   "0": "全くわからない（0）",
   "1": "どちらかといえばビン B（+1）",
   "2": "ビン B だと思う（+2）",
   "3": "ビン B と確信（+3）",
};
const sliderLabel = (val) => SLIDER_LABELS[String(val)] ?? "全くわからない（0）";

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
const SCENE_IMAGES = [
  "images/scene1.png",  // シーン1
  "images/scene2.png",  // シーン2
  "images/scene3.png",  // シーン3
  "images/scene4.png",  // シーン4
  "images/scene5.png",  // シーン5
  "images/scene6.png",  // シーン6
  null,                  // シーン7：画像なし
];

const SCENES = [
  "このビンの中には<b>85:15の比率で黒と黄色の玉が100個</b>入っています。",
  "もう一方のビンの中には100個の玉が<b>逆の比率（黒15：黄85）</b>で入っています。",
  "これからどちらか一方のビンが選ばれ、そこから<b>玉を1つずつ引いていきます。</b>",
  "引かれた玉は<b>再びビンに戻されます。</b>",
  "引かれた玉の色を見て<b>どちらのビンが選ばれたのかを判断</b>してください。",
  "判断は<b>スライダー</b>を使って回答してください。<br><small style='color:var(--muted)'>左端＝ビンAと100%確信　中央＝全くわからない(0%)　右端＝ビンBと100%確信</small>",
  `玉を<b>1つ引くたびにスライダーで回答</b>します。これを<b>${CONFIG.SEQUENCE.length}球</b>繰り返すと1試行終了です。<br><br>理解できたら「次へ」を、もう一度確認したい場合は「もう一度」をクリックしてください。`,
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
      const imgSrc = SCENE_IMAGES[current];
      const imgHTML = imgSrc
        ? `<img src="${imgSrc}" class="scene-img" alt="シーン${current + 1}">`
        : "";

      display_el.innerHTML = `
        <div class="card">
          <h1 class="task-title">ビーズ課題の説明</h1>
          <div class="scene-progress">${dots}</div>
          ${imgHTML}
          <div class="scene-body">${SCENES[current]}</div>
          <div class="btn-nav-row">
            ${current > 0 ? `<button class="btn btn-back" id="btn-back">← 戻る</button>` : ""}
            <button class="btn btn-next" id="btn-next" style="width:auto;padding:12px 28px">
              ${isLast ? "実験開始 →" : "次へ →"}
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

/* ── 6. Beads プラグイン ────────────────────────────────── */
class BeadsPlugin {
  constructor(jsPsych) { this.jsPsych = jsPsych; }

  trial(display_el, trial) {
    this._state = {
      jar:     pickJar(),
      seq:     [],      // 表示済みの玉の色
      results: [],      // 1球ごとの記録
    };
    this._renderDraw(display_el, trial);
  }

  /* ── [玉を引く] ボタン画面 ── */
  _renderDraw(display_el, trial) {
    const { seq } = this._state;
    const drawNum = seq.length;          // これから引くのは drawNum+1 球目
    const total   = CONFIG.SEQUENCE.length;
    const pct     = (drawNum / total * 100).toFixed(0);

    const seqHTML = seq.length
      ? seq.map((c, i) =>
          `<div class="seq-bead ${c}${i === seq.length - 1 ? " newest" : ""}"></div>`
        ).join("")
      : `<span class="seq-empty">まだ引いていません</span>`;

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">試行 ${trial.trial_num} / ${CONFIG.nTrials}</h1>
        <p class="subtitle">ボタンを押して玉を1つ引いてください。</p>

        <div class="progress-wrap">
          <div class="progress-label">${drawNum} / ${total} 球</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="bins-row">
          <div class="bin-block">
            <div class="bin-label">ビン A</div>
            <div class="bin-ratio">⚫ 黒 85% ／ 🟡 黄 15%</div>
            ${beadGridHTML("A")}
          </div>
          <div class="bin-block">
            <div class="bin-label">ビン B</div>
            <div class="bin-ratio">⚫ 黒 15% ／ 🟡 黄 85%</div>
            ${beadGridHTML("B")}
          </div>
        </div>

        <div class="seq-label">これまで引いた玉</div>
        <div class="seq-beads">${seqHTML}</div>

        <p style="font-size:.95rem;color:var(--blue);font-weight:700;margin:0 0 12px">
          次は <b>${drawNum + 1}</b> 球目です
        </p>
        <button class="btn btn-draw" id="btn-draw">🫙 玉を引く</button>
      </div>`;

    document.getElementById("btn-draw").onclick = () => {
      const t0 = performance.now();  // ★ボタンを押した瞬間をRTの起点に
      const color = CONFIG.SEQUENCE[drawNum];
      this._state.seq.push(color);
      this._renderSlider(display_el, trial, color, t0);
    };
  }

  /* ── スライダー回答画面 ── */
  _renderSlider(display_el, trial, beadColor, t0) {
    // t0 = 「玉を引く」ボタンを押した瞬間（呼び出し元で計測済み）
    const { seq, jar } = this._state;
    const drawNum = seq.length;          // 引いた球数（1始まり）
    const total   = CONFIG.SEQUENCE.length;
    const pct     = (drawNum / total * 100).toFixed(0);
    const colorLabel = beadColor === "black" ? "⚫ 黒" : "🟡 黄";
    let sliderMoved = false;

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">試行 ${trial.trial_num} / ${CONFIG.nTrials}</h1>

        <div class="progress-wrap">
          <div class="progress-label">${drawNum} / ${total} 球</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="current-bead-wrap">
          <div class="current-bead-label">${drawNum} 球目に引いた玉</div>
          <div class="current-bead ${beadColor}">${colorLabel}</div>
        </div>

        <div class="slider-section">
          <div class="slider-end-labels">
            <span class="end-a">⚫ ビン A<br>と確信</span>
            <span class="end-c">全く<br>わからない</span>
            <span class="end-b">ビン B 🟡<br>と確信</span>
          </div>
          <div class="slider-track">
            <input type="range" class="confidence-slider" id="slider"
                   min="-3" max="3" value="0" step="1">
            <div class="center-tick"></div>
          </div>
          <div class="slider-value-display" id="slider-label">
            ← スライダーを動かして回答してください →
          </div>
        </div>

        <button class="btn btn-next" id="btn-confirm" disabled>
          ${drawNum < total ? "次の玉へ →" : "試行終了 ✅"}
        </button>
      </div>`;

    const slider     = display_el.querySelector("#slider");
    const label      = display_el.querySelector("#slider-label");
    const confirmBtn = display_el.querySelector("#btn-confirm");

    slider.addEventListener("input", () => {
      if (!sliderMoved) { sliderMoved = true; confirmBtn.disabled = false; }
      label.textContent = sliderLabel(Number(slider.value));
    });

    confirmBtn.onclick = () => {
      const confidence = Number(slider.value);
      const choice     = confidence <= 0 ? "A" : "B";  // 0=中央はAとみなす
      const record = {
        participant_id:  PARTICIPANT_ID,
        trial_num:       trial.trial_num,
        draw_num:        drawNum,
        true_jar:        jar,
        bead_color:      beadColor,
        sequence_so_far: seq.join(","),
        confidence,        // -100〜+100
        choice,            // "A"|"B"
        rt:                Math.round(performance.now() - t0),
      };

      this._state.results.push(record);
      sendToGAS(record);

      if (drawNum >= total) {
        this.jsPsych.finishTrial({ trial_num: trial.trial_num, results: this._state.results });
      } else {
        this._renderDraw(display_el, trial);
      }
    };
  }
}
BeadsPlugin.info = { name: "beads-draw-decide", parameters: { trial_num: { type: "INT", default: 1 } } };

/* ── 7. タイムライン ────────────────────────────────────── */
jsPsych.run([
  { type: InstructionSlidesPlugin },
  ...Array.from({ length: CONFIG.nTrials }, (_, i) => ({
    type: BeadsPlugin,
    trial_num: i + 1,
  })),
]);

/* ── 8. 終了画面 ────────────────────────────────────────── */
function showEndScreen() {
  const allResults = jsPsych.data
    .get()
    .filter({ trial_type: "beads-draw-decide" })
    .values()
    .flatMap((t) => t.results || []);

  const nTotal   = allResults.length;
  const avgRT    = nTotal
    ? Math.round(allResults.reduce((s, d) => s + d.rt, 0) / nTotal)
    : "—";

  const rows = allResults.map((d) => `
    <tr>
      <td>${d.trial_num}</td>
      <td>${d.draw_num}</td>
      <td>${d.true_jar}</td>
      <td>${d.bead_color === "black" ? "⚫" : "🟡"}</td>
      <td>${d.confidence}</td>
      <td>${d.choice}</td>
      <td>${d.rt}</td>
    </tr>`).join("");

  document.querySelector(".jspsych-display-element").innerHTML = `
    <div class="card" style="max-width:760px">
      <div style="font-size:2.5rem;margin-bottom:8px">🎉</div>
      <h1 class="task-title">実験終了 — お疲れ様でした！</h1>
      <p class="subtitle">
        参加者ID: <code>${PARTICIPANT_ID}</code><br>
        平均RT: <b>${avgRT} ms</b><br>
        <small style="color:var(--green)">✅ データはスプレッドシートに自動保存されました</small>
      </p>
      <table class="data-table">
        <thead><tr>
          <th>trial</th><th>draw</th><th>true_jar</th><th>color</th>
          <th>confidence</th><th>choice</th><th>rt(ms)</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div>
        <button class="btn btn-dl" id="btn-csv">📥 CSV ダウンロード（バックアップ）</button>
      </div>
    </div>`;

  document.querySelector("#btn-csv").onclick = () => {
    const cols  = ["participant_id","trial_num","draw_num","true_jar",
                   "bead_color","sequence_so_far","confidence","choice","rt"];
    const lines = [
      cols.join(","),
      ...allResults.map(d => cols.map(c => JSON.stringify(d[c] ?? "")).join(",")),
    ];
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })),
      download: `beads_${PARTICIPANT_ID}_${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click();
  };
}
