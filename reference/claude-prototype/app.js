/* ==========================================================================
   SugiLearn — Prototype application logic
   Frontend-only. No backend, no persistence beyond the current session.
   ========================================================================== */

/* ---------------------------------------------------------------------- *
 * DATA
 * All Sugidanon-specific content is represented with clearly labeled
 * generic placeholders, per the cultural-content rule. Question text is
 * intentionally generic ("this section", "the epic excerpt") rather than
 * inventing specific narrative facts.
 * ---------------------------------------------------------------------- */

function buildAssessmentBank(prefix){
  // 15 generic, non-fabricated comprehension/awareness questions.
  // Correct answer index is fixed so the prototype can score interactively.
  const topics = [
    "the general meaning of the term “Sugidanon”",
    "which community traditionally performs the Sugidanon",
    "the role of a chanter (siday) in a performance",
    "how Sugidanon epics are traditionally transmitted",
    "the setting in which a Sugidanon is usually performed",
    "why oral epics like this are considered intangible heritage",
    "the general structure of an epic performance",
    "how music and chant relate to the narration",
    "why cultural review and validation matter for this content",
    "the relationship between the epic and community identity",
    "how the lesson labels culturally unverified material",
    "the purpose of pre- and post-assessment in this lesson",
    "how learners can support respectful engagement with the content",
    "what an “approved illustration” placeholder represents in this app",
    "the overall learning goal of this multimedia lesson",
  ];
  return topics.map((topic, i) => ({
    id: `${prefix}-${i+1}`,
    text: `Regarding ${topic}, which statement best reflects what the lesson explains?`,
    choices: [
      "It is explained directly within the validated lesson content.",
      "It is unrelated to the Sugidanon learning material.",
      "It can only be verified by learners themselves.",
      "It is intentionally left undefined in the lesson.",
    ],
    correct: 0,
  }));
}

const PRE_QUESTIONS = buildAssessmentBank("pre");
const POST_QUESTIONS = buildAssessmentBank("post");

const LESSON_SECTIONS = [
  {
    type: "image",
    label: "Section 1 · Orientation",
    title: "Discovering the Sugidanon",
    body: "This opening section introduces learners to the Panay Bukidnon Sugidanon tradition at a general level. All narrative specifics, character names, and imagery in the finished product will come from culturally validated sources and pass through the review workflow before publication.",
  },
  {
    type: "audio",
    label: "Section 2 · Listening",
    title: "The Voice of the Chanter",
    body: "Learners listen to an approved audio excerpt illustrating how a Sugidanon is traditionally chanted. The audio player below is fully interactive in this prototype, using a placeholder narration track in place of validated recordings.",
  },
  {
    type: "animation",
    label: "Section 3 · Visual Storytelling",
    title: "Bringing the Epic to Life",
    body: "A short 2D animation sequence supports the narration with movement and pacing. In production, this sequence will be produced from culturally validated storyboards; here it is represented by an approved-animation placeholder with full playback controls.",
  },
  {
    type: "image",
    label: "Section 4 · Reflection",
    title: "Why This Heritage Matters",
    body: "The closing section frames the significance of oral epics as living heritage and introduces the idea of community-based validation, which learners will see again in the assessment and analytics that follow.",
  },
];

// Admin content lists -----------------------------------------------------
const CONTENT_LESSONS = [
  { title: "Discovering the Sugidanon — Orientation Module", sections: 4, updated: "2 days ago", status: "approved" },
  { title: "The Voice of the Chanter — Listening Module", sections: 3, updated: "5 days ago", status: "approved" },
  { title: "Community and Performance Context", sections: 5, updated: "1 day ago", status: "review" },
  { title: "Symbols, Caution, and Cultural Protocol", sections: 4, updated: "3 days ago", status: "draft" },
  { title: "Epic Structure and Narrative Form", sections: 6, updated: "6 hours ago", status: "review" },
  { title: "Transmission Across Generations", sections: 3, updated: "1 week ago", status: "approved" },
  { title: "Closing Reflection & Heritage Stewardship", sections: 2, updated: "just now", status: "revision" },
];

const REVIEW_QUEUE = [
  { title: "Community and Performance Context", status: "review", note: "Awaiting cultural consultant sign-off on Section 3." },
  { title: "Epic Structure and Narrative Form", status: "review", note: "Audio placeholder needs final approved recording." },
  { title: "Closing Reflection & Heritage Stewardship", status: "revision", note: "Reviewer requested clearer heritage framing in intro." },
  { title: "Symbols, Caution, and Cultural Protocol", status: "draft", note: "Not yet submitted for review." },
  { title: "Discovering the Sugidanon — Orientation Module", status: "approved", note: "Approved by cultural review board." },
  { title: "The Voice of the Chanter — Listening Module", status: "approved", note: "Approved, published to learners." },
];

const LEARNERS_MOCK = [
  { name: "M. Villaruel", pre: 6, post: 12 },
  { name: "J. Cordero", pre: 7, post: 13 },
  { name: "R. Panganiban", pre: 5, post: 11 },
  { name: "A. Suarez", pre: 8, post: 14 },
  { name: "D. Lacson", pre: 4, post: 10 },
  { name: "K. Mercado", pre: 6, post: 13 },
];

/* ---------------------------------------------------------------------- *
 * STATE
 * ---------------------------------------------------------------------- */
const state = {
  screen: "home",
  pre: { idx: 0, answers: Array(15).fill(null), submitted: false, score: 0 },
  post: { idx: 0, answers: Array(15).fill(null), submitted: false, score: 0 },
  lessonSectionIdx: 0,
  animPlaying: false,
  animProgress: 0,
  audioPlaying: false,
  audioProgress: 32,
  admin: { active: "dashboard" },
  reviewTab: "review",
};

const LEARNER_FLOW_ORDER = ["home","pre-assessment","lesson","lesson-complete","post-assessment","results","analytics"];

function go(screenId){
  state.screen = screenId;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
  const target = document.getElementById(`screen-${screenId}`);
  if(target){ target.classList.add("is-active"); }
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
  render();
}

function setAdmin(view){
  state.admin.active = view;
  go(`admin-${view}`);
}

/* ---------------------------------------------------------------------- *
 * RENDER: shared bits
 * ---------------------------------------------------------------------- */
function threadDots(container, total, currentIdx){
  container.innerHTML = "";
  for(let i=0;i<total;i++){
    const d = document.createElement("span");
    d.className = "dot" + (i===currentIdx ? " active" : i<currentIdx ? " done" : "");
    container.appendChild(d);
  }
}

function renderTopbarProgress(){
  const idx = LEARNER_FLOW_ORDER.indexOf(state.screen);
  document.querySelectorAll("[data-thread-progress]").forEach(el=>{
    threadDots(el, LEARNER_FLOW_ORDER.length, idx);
  });
}

/* ---------------------------------------------------------------------- *
 * RENDER: Assessments (shared for pre/post)
 * ---------------------------------------------------------------------- */
function renderAssessment(kind){
  const bank = kind === "pre" ? PRE_QUESTIONS : POST_QUESTIONS;
  const s = state[kind];
  const q = bank[s.idx];
  const root = document.getElementById(`assessment-${kind}`);
  if(!root) return;

  root.querySelector(".assessment-kicker span").textContent = `Question ${s.idx+1} of ${bank.length}`;
  root.querySelector(".progress-fill").style.width = `${((s.idx+1)/bank.length)*100}%`;
  root.querySelector(".question-eyebrow").textContent = kind === "pre" ? "Pre-Assessment" : "Post-Assessment";
  root.querySelector(".question-text").textContent = q.text;

  const list = root.querySelector(".choice-list");
  list.innerHTML = "";
  q.choices.forEach((choiceText, i) => {
    const btn = document.createElement("button");
    btn.className = "choice" + (s.answers[s.idx] === i ? " selected" : "");
    btn.innerHTML = `<span class="choice-mark">${String.fromCharCode(65+i)}</span><span class="choice-text">${choiceText}</span>`;
    btn.addEventListener("click", () => {
      s.answers[s.idx] = i;
      renderAssessment(kind);
    });
    list.appendChild(btn);
  });

  const prevBtn = root.querySelector(".btn-prev");
  const nextBtn = root.querySelector(".btn-next");
  prevBtn.disabled = s.idx === 0;
  nextBtn.textContent = s.idx === bank.length - 1 ? (kind === "pre" ? "Continue to Lesson" : "See Results") : "Next";
  nextBtn.disabled = s.answers[s.idx] === null;
  const answeredText = `${s.answers.filter(a=>a!==null).length} of ${bank.length} answered`;
  root.querySelectorAll(".step-count").forEach(el => el.textContent = answeredText);
}

function scoreAssessment(kind){
  const bank = kind === "pre" ? PRE_QUESTIONS : POST_QUESTIONS;
  const s = state[kind];
  s.score = s.answers.reduce((acc, ans, i) => acc + (ans === bank[i].correct ? 1 : 0), 0);
  s.submitted = true;
}

function assessmentNext(kind){
  const bank = kind === "pre" ? PRE_QUESTIONS : POST_QUESTIONS;
  const s = state[kind];
  if(s.answers[s.idx] === null) return;
  if(s.idx < bank.length - 1){
    s.idx++;
    renderAssessment(kind);
  } else {
    scoreAssessment(kind);
    if(kind === "pre"){ go("lesson"); } else { go("results"); }
  }
}
function assessmentPrev(kind){
  const s = state[kind];
  if(s.idx > 0){ s.idx--; renderAssessment(kind); }
}

/* ---------------------------------------------------------------------- *
 * RENDER: Lesson
 * ---------------------------------------------------------------------- */
function renderLessonSidebar(){
  const list = document.getElementById("lesson-section-nav");
  if(!list) return;
  list.innerHTML = "";
  LESSON_SECTIONS.forEach((sec, i) => {
    const item = document.createElement("div");
    item.className = "section-nav-item" + (i === state.lessonSectionIdx ? " current" : i < state.lessonSectionIdx ? " complete" : "");
    item.innerHTML = `<span class="idx">${i+1}</span><span>${sec.title}</span>`;
    list.appendChild(item);
  });
}

function renderLesson(){
  const sec = LESSON_SECTIONS[state.lessonSectionIdx];
  const stage = document.getElementById("media-stage");
  const audioPlayer = document.getElementById("audio-player-block");
  const animControls = document.getElementById("anim-controls-block");

  document.getElementById("lesson-section-label").textContent = sec.label;
  document.getElementById("lesson-title").textContent = sec.title;
  document.getElementById("lesson-body-text").textContent = sec.body;

  stage.className = "media-stage" + (sec.type === "audio" ? " audio-stage" : sec.type === "animation" ? " animation-stage" : "");
  audioPlayer.style.display = sec.type === "audio" ? "flex" : "none";
  animControls.style.display = sec.type === "animation" ? "flex" : "none";

  let badgeText = "[Approved Illustration]";
  let caption = "Placeholder for a culturally validated illustration.";
  let iconSVG = iconImage();
  if(sec.type === "audio"){ badgeText = "[Approved Audio]"; caption = "Placeholder for a culturally validated audio excerpt."; iconSVG = iconAudio(); }
  if(sec.type === "animation"){ badgeText = "[Approved 2D Animation]"; caption = "Placeholder for a culturally validated 2D animation."; iconSVG = iconFilm(); }

  document.getElementById("media-badge-text").textContent = badgeText;
  document.getElementById("media-caption-text").textContent = caption;
  document.getElementById("media-caption-icon").innerHTML = iconSVG;

  document.getElementById("lesson-progress-label").textContent = `Section ${state.lessonSectionIdx+1} of ${LESSON_SECTIONS.length}`;
  document.getElementById("lesson-progress-fill").style.width = `${((state.lessonSectionIdx+1)/LESSON_SECTIONS.length)*100}%`;

  const prevBtn = document.getElementById("lesson-prev-btn");
  const nextBtn = document.getElementById("lesson-next-btn");
  prevBtn.disabled = state.lessonSectionIdx === 0;
  nextBtn.textContent = state.lessonSectionIdx === LESSON_SECTIONS.length - 1 ? "Complete Lesson" : "Next Section";

  renderLessonSidebar();
  renderTopbarProgress();

  // reset media widgets per-section
  state.animPlaying = false; state.animProgress = 0;
  document.getElementById("anim-progress-fill").style.width = "0%";
  document.getElementById("anim-time").textContent = "0:00 / 1:48";
  document.getElementById("anim-play-icon").innerHTML = iconPlay();
}

function lessonNext(){
  if(state.lessonSectionIdx < LESSON_SECTIONS.length - 1){
    state.lessonSectionIdx++;
    renderLesson();
    window.scrollTo({top:0, behavior:"smooth"});
  } else {
    go("lesson-complete");
  }
}
function lessonPrev(){
  if(state.lessonSectionIdx > 0){
    state.lessonSectionIdx--;
    renderLesson();
  }
}

let animTimer = null;
function toggleAnim(){
  state.animPlaying = !state.animPlaying;
  document.getElementById("anim-play-icon").innerHTML = state.animPlaying ? iconPause() : iconPlay();
  if(state.animPlaying){
    animTimer = setInterval(() => {
      state.animProgress = Math.min(100, state.animProgress + 0.9);
      document.getElementById("anim-progress-fill").style.width = state.animProgress + "%";
      const totalSec = 108; // 1:48
      const cur = Math.round((state.animProgress/100) * totalSec);
      document.getElementById("anim-time").textContent = `${fmtTime(cur)} / 1:48`;
      if(state.animProgress >= 100){
        clearInterval(animTimer);
        state.animPlaying = false;
        document.getElementById("anim-play-icon").innerHTML = iconPlay();
      }
    }, 90);
  } else {
    clearInterval(animTimer);
  }
}
function replayAnim(){
  clearInterval(animTimer);
  state.animPlaying = false;
  state.animProgress = 0;
  document.getElementById("anim-progress-fill").style.width = "0%";
  document.getElementById("anim-time").textContent = "0:00 / 1:48";
  document.getElementById("anim-play-icon").innerHTML = iconPlay();
}
function fmtTime(sec){ const m = Math.floor(sec/60); const s = String(sec%60).padStart(2,"0"); return `${m}:${s}`; }

let audioTimer = null;
function toggleAudio(){
  state.audioPlaying = !state.audioPlaying;
  document.getElementById("audio-play-icon").innerHTML = state.audioPlaying ? iconPause() : iconPlay();
  if(state.audioPlaying){
    audioTimer = setInterval(()=>{
      state.audioProgress = Math.min(100, state.audioProgress + 1.1);
      document.getElementById("audio-bar-fill").style.width = state.audioProgress + "%";
      if(state.audioProgress >= 100){ clearInterval(audioTimer); state.audioPlaying = false; document.getElementById("audio-play-icon").innerHTML = iconPlay(); }
    }, 120);
  } else {
    clearInterval(audioTimer);
  }
}

/* ---------------------------------------------------------------------- *
 * RENDER: Results & Analytics
 * ---------------------------------------------------------------------- */
function renderResults(){
  const preScore = state.pre.score, postScore = state.post.score;
  const gain = postScore - preScore;
  document.getElementById("result-pre-score").textContent = `${preScore}/15`;
  document.getElementById("result-post-score").textContent = `${postScore}/15`;
  document.getElementById("result-gain").textContent = `${gain >= 0 ? "+" : ""}${gain}`;

  const barMax = 15;
  document.getElementById("result-bar-pre").style.height = `${(preScore/barMax)*100}%`;
  document.getElementById("result-bar-post").style.height = `${(postScore/barMax)*100}%`;
  document.getElementById("result-bar-pre-val").textContent = preScore;
  document.getElementById("result-bar-post-val").textContent = postScore;
}

function renderLearnerAnalytics(){
  const preScore = state.pre.score, postScore = state.post.score;
  const gain = postScore - preScore;
  const gainPct = state.pre.submitted ? Math.round((gain/15)*100) : 0;
  document.getElementById("an-pre").textContent = `${preScore}/15`;
  document.getElementById("an-post").textContent = `${postScore}/15`;
  document.getElementById("an-gain").textContent = `${gain >= 0 ? "+" : ""}${gain} pts`;
  document.getElementById("an-completion").textContent = "100%";

  document.getElementById("an-bar-pre").style.height = `${(preScore/15)*100}%`;
  document.getElementById("an-bar-post").style.height = `${(postScore/15)*100}%`;

  // simple progress ring via conic-gradient
  const ring = document.getElementById("an-ring");
  ring.style.background = `conic-gradient(var(--terracotta) ${gainPct}%, var(--line) 0)`;
  document.getElementById("an-ring-label").textContent = `${gainPct}%`;
}

/* ---------------------------------------------------------------------- *
 * RENDER: Admin dashboard & analytics charts
 * ---------------------------------------------------------------------- */
function renderAdminDashboard(){
  const bars = document.getElementById("admin-bar-chart");
  if(!bars) return;
  bars.innerHTML = "";
  LEARNERS_MOCK.forEach(l => {
    const group = document.createElement("div");
    group.className = "bar-group";
    group.innerHTML = `
      <div class="bar-col">
        <div class="bar pre" style="height:${(l.pre/15)*100}%"></div>
        <div class="bar post" style="height:${(l.post/15)*100}%"></div>
      </div>
      <div class="g-label">${l.name.split(" ")[0]}</div>`;
    bars.appendChild(group);
  });
}

function renderAdminAnalytics(){
  const bars = document.getElementById("admin-analytics-bar-chart");
  if(bars){
    bars.innerHTML = "";
    LEARNERS_MOCK.forEach(l => {
      const group = document.createElement("div");
      group.className = "bar-group";
      group.innerHTML = `
        <div class="bar-col">
          <div class="bar pre" style="height:${(l.pre/15)*100}%"></div>
          <div class="bar post" style="height:${(l.post/15)*100}%"></div>
        </div>
        <div class="g-label">${l.name.split(" ")[0]}</div>`;
      bars.appendChild(group);
    });
  }
  const qbars = document.getElementById("question-perf-chart");
  if(qbars){
    qbars.innerHTML = "";
    const perf = [92,88,76,81,69,94,73,65,88,79,84,58,90,71,86];
    perf.forEach((p,i)=>{
      const col = document.createElement("div");
      col.style.flex = "1";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      col.style.alignItems = "center";
      col.style.gap = "6px";
      col.innerHTML = `<div style="width:100%;max-width:16px;height:${p*1.4}px;background:${p<70?'var(--terracotta)':'var(--sage)'};border-radius:5px 5px 2px 2px;"></div><span style="font-family:var(--f-mono);font-size:9px;color:var(--charcoal-35);">${i+1}</span>`;
      qbars.appendChild(col);
    });
  }
}

/* ---------------------------------------------------------------------- *
 * RENDER: Content management list
 * ---------------------------------------------------------------------- */
function renderContentList(filter){
  const root = document.getElementById("content-list-rows");
  if(!root) return;
  root.innerHTML = "";
  const items = CONTENT_LESSONS.filter(l => filter === "all" || l.status === filter);
  if(items.length === 0){
    root.innerHTML = `<div class="list-row"><div class="li-title">No lessons match this filter.</div></div>`;
    return;
  }
  items.forEach(l => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `
      <div>
        <div class="li-title">${l.title}</div>
        <div class="li-sub">${l.sections} sections · updated ${l.updated}</div>
      </div>
      <div><span class="status-pill ${l.status}">${statusLabel(l.status)}</span></div>
      <div class="li-sub">${l.sections} sections</div>
      <div class="li-sub">${l.updated}</div>
      <div class="li-actions">
        <button class="icon-btn" title="Preview" onclick="go('lesson')">${iconEye()}</button>
        <button class="icon-btn" title="Edit" onclick="go('admin-editor')">${iconEdit()}</button>
      </div>`;
    root.appendChild(row);
  });
}
function statusLabel(s){ return { draft:"Draft", review:"For Review", approved:"Approved", revision:"Needs Revision" }[s] || s; }

function renderReviewQueue(){
  const root = document.getElementById("review-grid");
  if(!root) return;
  root.innerHTML = "";
  const items = REVIEW_QUEUE.filter(r => r.status === state.reviewTab);
  document.querySelectorAll(".review-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === state.reviewTab));
  ["draft","review","approved","revision"].forEach(k=>{
    const el = document.querySelector(`.review-tab[data-tab="${k}"] .count`);
    if(el) el.textContent = REVIEW_QUEUE.filter(r=>r.status===k).length;
  });
  if(items.length === 0){
    root.innerHTML = `<p style="color:var(--charcoal-35);font-size:14px;grid-column:1/-1;">No lessons currently in “${statusLabel(state.reviewTab)}.”</p>`;
    return;
  }
  items.forEach(r => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-card-media">${iconImage("width:34px;height:34px;color:rgba(255,255,255,.75);")}</div>
      <div class="review-card-body">
        <div class="li-title" style="margin-bottom:6px;">${r.title}</div>
        <span class="status-pill ${r.status}">${statusLabel(r.status)}</span>
        <p style="font-size:12.5px;color:var(--charcoal-60);margin-top:10px;line-height:1.5;">${r.note}</p>
        <div class="review-card-actions">
          <button class="btn btn-outline btn-sm" onclick="go('admin-editor')">Review</button>
          ${r.status !== "approved" ? `<button class="btn btn-primary btn-sm" onclick="alert('Marked as Approved (prototype only).')">Approve</button>` : ""}
        </div>
      </div>`;
    root.appendChild(card);
  });
}

/* ---------------------------------------------------------------------- *
 * Question bank list (admin assessment management)
 * ---------------------------------------------------------------------- */
function renderQuestionList(kind){
  const root = document.getElementById(`qlist-${kind}`);
  if(!root) return;
  const bank = kind === "pre" ? PRE_QUESTIONS : POST_QUESTIONS;
  root.innerHTML = "";
  bank.forEach((q,i)=>{
    const row = document.createElement("div");
    row.className = "q-list-item";
    row.onclick = () => go("admin-question-editor");
    row.innerHTML = `
      <span class="qedit-num">${i+1}</span>
      <span class="q-preview-text">${q.text}</span>
      <span class="q-preview-answer">Answer: ${String.fromCharCode(65+q.correct)}</span>`;
    root.appendChild(row);
  });
}

/* ---------------------------------------------------------------------- *
 * ICONS (inline SVG, stroke uses currentColor)
 * ---------------------------------------------------------------------- */
function iconPlay(){ return `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>`; }
function iconPause(){ return `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`; }
function iconImage(style){ return `<svg style="${style||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="48" height="48"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>`; }
function iconAudio(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="48" height="48"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>`; }
function iconFilm(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="48" height="48"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>`; }
function iconEye(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>`; }
function iconEdit(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>`; }

/* ---------------------------------------------------------------------- *
 * Master render dispatch (called on every navigation)
 * ---------------------------------------------------------------------- */
function render(){
  renderTopbarProgress();
  if(state.screen === "pre-assessment") renderAssessment("pre");
  if(state.screen === "post-assessment") renderAssessment("post");
  if(state.screen === "lesson") renderLesson();
  if(state.screen === "results") renderResults();
  if(state.screen === "analytics") renderLearnerAnalytics();
  if(state.screen === "admin-dashboard") renderAdminDashboard();
  if(state.screen === "admin-analytics") renderAdminAnalytics();
  if(state.screen === "admin-content") renderContentList("all");
  if(state.screen === "admin-review") renderReviewQueue();
  if(state.screen === "admin-assessments"){ renderQuestionList("pre"); renderQuestionList("post"); }
}

/* ---------------------------------------------------------------------- *
 * ADMIN SIDEBAR (shared shell injected into every admin-sidebar-slot)
 * ---------------------------------------------------------------------- */
const ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></svg>` },
  { key: "content", label: "Learning Content", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M14 4v5h5"/><path d="M8 13h8M8 17h5"/></svg>` },
  { key: "assessments", label: "Assessments", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { key: "review", label: "Content Review", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>` },
  { key: "analytics", label: "Analytics", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>` },
];

function mountAdminSidebars(){
  document.querySelectorAll("admin-sidebar-slot").forEach(slot => {
    const active = slot.getAttribute("data-active");
    const aside = document.createElement("aside");
    aside.className = "admin-sidebar";
    aside.innerHTML = `
      <div class="brand"><span class="brand-mark" style="width:28px;height:28px;">${document.querySelector(".brand-mark")?.innerHTML || ""}</span>SugiLearn</div>
      <nav class="admin-nav">
        ${ADMIN_NAV.map(item => `<a class="admin-nav-item ${item.key === active ? "active" : ""}" data-admin-nav="${item.key}">${item.icon}<span>${item.label}</span></a>`).join("")}
      </nav>
      <div class="admin-sidebar-footer">
        <div class="admin-user-chip"><span class="admin-avatar">CV</span><span>Cultural Validator</span></div>
        <a class="exit-admin" data-nav="home">← Exit to learner site</a>
      </div>`;
    slot.replaceWith(aside);
  });
  // (re)bind nav clicks on freshly-inserted elements
  document.querySelectorAll("[data-admin-nav]").forEach(el => {
    el.addEventListener("click", () => setAdmin(el.getAttribute("data-admin-nav")));
  });
  document.querySelectorAll("[data-nav]").forEach(el => {
    if(!el.dataset.bound){
      el.addEventListener("click", () => go(el.getAttribute("data-nav")));
      el.dataset.bound = "1";
    }
  });
}

/* ---------------------------------------------------------------------- *
 * INIT
 * ---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  mountAdminSidebars();
  // Home journey thread SVG node hover labels etc. are static in HTML.
  go("home");

  // Wire up buttons that are declared in HTML via data-nav
  document.querySelectorAll("[data-nav]").forEach(el => {
    if(!el.dataset.bound){
      el.addEventListener("click", () => go(el.getAttribute("data-nav")));
      el.dataset.bound = "1";
    }
  });

  document.getElementById("pre-next")?.addEventListener("click", () => assessmentNext("pre"));
  document.getElementById("pre-prev")?.addEventListener("click", () => assessmentPrev("pre"));
  document.getElementById("post-next")?.addEventListener("click", () => assessmentNext("post"));
  document.getElementById("post-prev")?.addEventListener("click", () => assessmentPrev("post"));

  document.getElementById("lesson-next-btn")?.addEventListener("click", lessonNext);
  document.getElementById("lesson-prev-btn")?.addEventListener("click", lessonPrev);

  document.getElementById("audio-play-btn")?.addEventListener("click", toggleAudio);
  document.getElementById("anim-play-btn")?.addEventListener("click", toggleAnim);
  document.getElementById("anim-replay-btn")?.addEventListener("click", replayAnim);

  document.getElementById("admin-login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    setAdmin("dashboard");
  });

  document.querySelectorAll(".review-tab").forEach(t => {
    t.addEventListener("click", () => { state.reviewTab = t.dataset.tab; renderReviewQueue(); });
  });

  document.querySelectorAll(".content-filter-chip").forEach(c => {
    c.addEventListener("click", () => {
      document.querySelectorAll(".content-filter-chip").forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      renderContentList(c.dataset.filter);
    });
  });

  document.getElementById("editor-add-section")?.addEventListener("click", () => {
    alert("New section added (prototype only — not persisted).");
  });

  render();
});
