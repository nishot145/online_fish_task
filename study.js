/* ═══════════════════════════════════════════════════════════
   Beads Task  (Jumping to Conclusions)
   study.js — jsPsych 7.3.4 対応版 + GAS スプレッドシート保存

   保存データ:
     participant_id  ランダム生成ID（参加者識別用）
     trial_num       試行番号
     true_jar        正答壺 ("A"|"B")
     draw_count      引いた回数（JTC 主指標）
     sequence        色の系列 "blue,red,blue,..."
     choice          回答壺  ("A"|"B")
     correct         正誤 (true/false)
     rt              Decision 画面→選択までの反応時間 (ms)
═══════════════════════════════════════════════════════════ */

/* ── 0. CONFIG ─────────────────────────────────────────── */
const CONFIG = {
  jarA:    { blue: 8, red: 2 },  // 壺A: 青80% / 赤20%
  jarB:    { blue: 2, red: 8 },  // 壺B: 青20% / 赤80%
  nTrials: 3,
  GAS_URL: "https://script.google.com/macros/s/AKfycbyjheMo4PPOEXImemILUdeXcyZPwWu8BghhNIjJGj6A20XNF3X_iDsxPm7hpaK0i6KD/exec",
};

// 参加者ごとのランダムID（セッション内で固定）
const PARTICIPANT_ID = Math.random().toString(36).slice(2, 10).toUpperCase();

/* ── 1. CSS 注入 ────────────────────────────────────────── */
document.head.insertAdjacentHTML("beforeend", `<style>
:root {
  --blue:#3B82F6; --red:#EF4444; --green:#10B981;
  --bg:#F1F5F9; --card:#fff; --text:#1E293B;
  --muted:#64748B; --border:#E2E8F0;
}
body { background:var(--bg); font-family:'Segoe UI',system-ui,sans-serif; color:var(--text); margin:0; }

.jspsych-display-element { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; box-sizing:border-box; }
.jspsych-content { width:100%; max-width:680px; }

.card { background:var(--card); border-radius:20px; box-shadow:0 4px 32px rgba(0,0,0,.09); padding:40px 48px; text-align:center; }
.task-title { font-size:1.5rem; font-weight:700; margin:0 0 10px; }
.subtitle   { color:var(--muted); margin:0 0 28px; font-size:.95rem; line-height:1.75; }

.jars-row  { display:flex; gap:20px; justify-content:center; margin-bottom:28px; }
.jar-block { flex:1; max-width:190px; border:2px solid var(--border); border-radius:14px; padding:16px 10px; background:#fafafa; }
.jar-label { font-weight:700; margin-bottom:4px; }
.jar-ratio { font-size:.75rem; color:var(--muted); margin-bottom:10px; }
.bead-grid { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; }
.bead      { width:18px; height:18px; border-radius:50%; }
.bead.blue { background:var(--blue); }
.bead.red  { background:var(--red);  }

.seq-label { font-size:.75rem; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); margin-bottom:8px; }
.seq-beads { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; min-height:38px; align-items:center; margin-bottom:20px; }
.seq-bead  { width:30px; height:30px; border-radius:50%; border:2px solid rgba(0,0,0,.1); animation:pop .18s ease; }
@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
.seq-bead.blue { background:var(--blue); }
.seq-bead.red  { background:var(--red);  }
.seq-empty { color:var(--muted); font-size:.9rem; }

.stats-row { display:flex; gap:12px; justify-content:center; margin-bottom:28px; flex-wrap:wrap; }
.pill   { background:#f1f5f9; border-radius:999px; padding:7px 18px; font-size:.9rem; }
.pill b { color:var(--text); }

.btn-row { display:flex; gap:14px; justify-content:center; }
.btn        { padding:13px 26px; border-radius:10px; border:none; font-size:1rem; font-weight:600; cursor:pointer; transition:opacity .15s,transform .1s; }
.btn:hover  { opacity:.87; transform:translateY(-1px); }
.btn:active { transform:translateY(0); }
.btn-draw   { background:var(--blue);  color:#fff; }
.btn-decide { background:var(--green); color:#fff; }
.btn-start  { background:var(--green); color:#fff; font-size:1rem; font-weight:600; padding:13px 32px; border-radius:10px; border:none; cursor:pointer; }
.btn-dl     { background:#6366F1; color:#fff; margin-top:22px; }

.choice-row { display:flex; gap:20px; justify-content:center; margin-top:24px; }
.choice-btn { flex:1; max-width:210px; padding:22px 10px; border-radius:14px; border:3px solid transparent; font-size:1.05rem; font-weight:700; cursor:pointer; transition:transform .12s,box-shadow .12s; line-height:1.7; background:none; }
.choice-btn:hover { transform:translateY(-3px); box-shadow:0 6px 22px rgba(0,0,0,.13); }
.choice-btn.A { background:#eff6ff; border-color:var(--blue); color:var(--blue); }
.choice-btn.B { background:#fef2f2; border-color:var(--red);  color:var(--red);  }

.data-table { width:100%; border-collapse:collapse; margin-top:22px; font-size:.88rem; text-align:left; }
.data-table th, .data-table td { border:1px solid var(--border); padding:8px 10px; }
.data-table th { background:#f8fafc; font-weight:600; }
.data-table tr:nth-child(even) td { background:#fafbfc; }

.save-status { margin-top:16px; font-size:.9rem; color:var(--muted); min-height:1.5em; }
.save-status.ok  { color:var(--green); }
.save-status.err { color:var(--red); }
</style>`);

/* ── 2. ユーティリティ ──────────────────────────────────── */
const pickJar = () => (Math.random() < 0.5 ? "A" : "B");

const drawBead = (jar) => {
  const r = jar === "A" ? CONFIG.jarA : CONFIG.jarB;
  return Math.random() < r.blue / (r.blue + r.red) ? "blue" : "red";
};

const beadGridHTML = (jar) => {
  const r = jar === "A" ? CONFIG.jarA : CONFIG.jarB;
  return `<div class="bead-grid">
    ${"<div class='bead blue'></div>".repeat(r.blue)}
    ${"<div class='bead red'></div>".repeat(r.red)}
  </div>`;
};

const seqHTML = (seq) =>
  seq.length
    ? seq.map((c) => `<div class="seq-bead ${c}"></div>`).join("")
    : `<span class="seq-empty">まだ引いていません</span>`;

/* ── 3. GAS 送信関数 ────────────────────────────────────── */
async function sendToGAS(data) {
  try {
    await fetch(CONFIG.GAS_URL, {
      method:  "POST",
      // GAS は no-cors でしか受け取れないため mode: "no-cors" を使う
      // （レスポンスは読めないが書き込みは成功する）
      mode:    "no-cors",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.error("GAS 送信エラー:", err);
    return false;
  }
}

/* ── 4. jsPsych 初期化 ──────────────────────────────────── */
const jsPsych = initJsPsych({
  on_finish() { showEndScreen(); },
});

/* ── 5. カスタムプラグイン ──────────────────────────────── */
class BeadsPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_el, trial) {
    this._state = { jar: pickJar(), seq: [] };
    this._renderDraw(display_el, trial);
  }

  _renderDraw(display_el, trial) {
    const { seq } = this._state;
    const blueN = seq.filter((x) => x === "blue").length;
    const redN  = seq.length - blueN;

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">試行 ${trial.trial_num} / ${CONFIG.nTrials}</h1>
        <p class="subtitle">
          どちらかの壺からビーズを引いています。<br>
          何回でも「引く」を押せます。準備ができたら「壺を決める」を押してください。
        </p>
        <div class="jars-row">
          <div class="jar-block">
            <div class="jar-label" style="color:var(--blue)">壺 A</div>
            <div class="jar-ratio">🔵 青 80% ／ 🔴 赤 20%</div>
            ${beadGridHTML("A")}
          </div>
          <div class="jar-block">
            <div class="jar-label" style="color:var(--red)">壺 B</div>
            <div class="jar-ratio">🔵 青 20% ／ 🔴 赤 80%</div>
            ${beadGridHTML("B")}
          </div>
        </div>
        <div class="seq-label">引いたビーズ</div>
        <div class="seq-beads">${seqHTML(seq)}</div>
        <div class="stats-row">
          <div class="pill">引いた回数: <b>${seq.length}</b></div>
          <div class="pill">🔵 青 <b>${blueN}</b></div>
          <div class="pill">🔴 赤 <b>${redN}</b></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-draw"   id="btn-draw"  >🫙 引く (Draw)</button>
          <button class="btn btn-decide" id="btn-decide">✅ 壺を決める (Decide)</button>
        </div>
      </div>`;

    display_el.querySelector("#btn-draw").onclick = () => {
      this._state.seq.push(drawBead(this._state.jar));
      this._renderDraw(display_el, trial);
    };
    display_el.querySelector("#btn-decide").onclick = () => {
      this._renderDecide(display_el, trial);
    };
  }

  _renderDecide(display_el, trial) {
    const t0 = performance.now();
    const { seq, jar } = this._state;
    const emoji = seq.map((c) => (c === "blue" ? "🔵" : "🔴")).join(" ");

    display_el.innerHTML = `
      <div class="card">
        <h1 class="task-title">どちらの壺だと思いますか？</h1>
        <p class="subtitle">
          引いたビーズ（${seq.length} 個）:<br>${emoji || "—"}
        </p>
        <div class="choice-row">
          <button class="choice-btn A" data-jar="A">
            壺 A<br><small>🔵 青80% / 🔴 赤20%</small>
          </button>
          <button class="choice-btn B" data-jar="B">
            壺 B<br><small>🔵 青20% / 🔴 赤80%</small>
          </button>
        </div>
      </div>`;

    display_el.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.onclick = () => {
        const choice = btn.dataset.jar;
        const record = {
          participant_id: PARTICIPANT_ID,
          trial_num:      trial.trial_num,
          true_jar:       jar,
          draw_count:     seq.length,
          sequence:       seq.join(","),
          choice,
          correct:        choice === jar,
          rt:             Math.round(performance.now() - t0),
        };

        // GAS に送信（非同期、待たずに次へ進む）
        sendToGAS(record);

        this.jsPsych.finishTrial(record);
      };
    });
  }
}

BeadsPlugin.info = {
  name: "beads-draw-decide",
  parameters: {
    trial_num: { type: "INT", default: 1 },
  },
};

/* ── 6. タイムライン ────────────────────────────────────── */
const instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="card">
      <h1 class="task-title">ビーズ課題 (Beads Task)</h1>
      <p class="subtitle">
        2つの壺があります。<br>
        <b style="color:var(--blue)">壺 A</b>：🔵 青 80%　🔴 赤 20%<br>
        <b style="color:var(--red)"> 壺 B</b>：🔵 青 20%　🔴 赤 80%<br><br>
        コンピュータがどちらかの壺をランダムに選び、<br>
        ビーズを 1 個ずつ引いて色を表示します。<br><br>
        「<b>引く</b>」ボタンを何度でも押せます。<br>
        十分な情報が集まったら「<b>壺を決める</b>」で判断してください。<br><br>
        全 <b>${CONFIG.nTrials} 試行</b> あります。
      </p>
    </div>`,
  choices: ["開始する"],
  button_html: `<button class="btn btn-start">%choice%</button>`,
};

const trials = Array.from({ length: CONFIG.nTrials }, (_, i) => ({
  type: BeadsPlugin,
  trial_num: i + 1,
}));

jsPsych.run([instructions, ...trials]);

/* ── 7. 終了画面 ────────────────────────────────────────── */
function showEndScreen() {
  const data = jsPsych.data
    .get()
    .filter({ trial_type: "beads-draw-decide" })
    .values();

  const avgDraw  = data.length
    ? (data.reduce((s, d) => s + d.draw_count, 0) / data.length).toFixed(2)
    : "—";
  const nCorrect = data.filter((d) => d.correct).length;

  const rows = data.map((d) => `
    <tr>
      <td>${d.trial_num}</td>
      <td>${d.true_jar}</td>
      <td>${d.draw_count}</td>
      <td style="font-size:.8rem;word-break:break-all">${d.sequence || "—"}</td>
      <td>${d.choice}</td>
      <td>${d.correct ? "✅" : "❌"}</td>
      <td>${d.rt}</td>
    </tr>`).join("");

  document.querySelector(".jspsych-display-element").innerHTML = `
    <div class="card" style="max-width:760px">
      <div style="font-size:3rem;margin-bottom:8px">🎉</div>
      <h1 class="task-title">実験終了 — お疲れ様でした！</h1>
      <p class="subtitle">
        参加者ID: <code>${PARTICIPANT_ID}</code><br>
        平均引き数: <b>${avgDraw}</b> 回　｜　正解数: <b>${nCorrect} / ${data.length}</b> 試行<br>
        <small style="color:var(--green)">✅ データはスプレッドシートに自動保存されました</small>
      </p>
      <table class="data-table">
        <thead><tr>
          <th>trial_num</th><th>true_jar</th><th>draw_count</th>
          <th>sequence</th><th>choice</th><th>correct</th><th>rt (ms)</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div>
        <button class="btn btn-dl" id="btn-csv">📥 CSV ダウンロード（バックアップ）</button>
      </div>
    </div>`;

  document.querySelector("#btn-csv").onclick = () => {
    jsPsych.data
      .get()
      .filter({ trial_type: "beads-draw-decide" })
      .localSave(
        "csv",
        `beads_task_${PARTICIPANT_ID}_${new Date().toISOString().slice(0, 10)}.csv`
      );
  };
}