/* Momo care: self-contained, offline activities. No network, tracking or audio files. */
(function () {
  'use strict';

  const ACTIVITIES = {
    breathing: {
      label: '呼吸一会儿', duration: 60, time: '1 分钟', icon: 'breathe',
      intro: '把肩膀放下来，按自己舒服的节奏呼吸。',
      note: '不用深吸，也不用屏息。觉得不舒服，随时停下。'
    },
    sound: {
      label: '听一点声音', duration: 120, time: '2 分钟', icon: 'sound',
      intro: '一层很轻的风声，留一点空白给自己。',
      note: '本地合成音景 · 无需联网。建议从低音量开始。'
    },
    walk: {
      label: '走几步也好', duration: 300, time: '5 分钟', icon: 'walk',
      intro: '如果方便，离开刚才的位置，轻轻活动一下。',
      note: '选平坦、安全的地方，按自己的步调。坐着活动肩膀也可以。'
    }
  };

  const ICONS = {
    back: '<path d="m14 5-7 7 7 7"/>',
    breathe: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse cx="12" cy="12" rx="6" ry="9"/>',
    sound: '<path d="M4 9v6m4-9v12m4-15v18m4-15v12m4-9v6"/>',
    walk: '<path d="m9 7 4 3 4-1M7 20l4-7 4 7M11 13l2-6"/><circle cx="14" cy="3" r="1.6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    pause: '<path d="M9 6v12M15 6v12"/>',
    play: '<path d="m9 5 10 7-10 7Z"/>',
    volume: '<path d="m11 5-5 4H3v6h3l5 4Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  const icon = (name, className = '') => '<svg class="' + className + '" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';

  const CSS = `
    .momo-care { --care-paper:#f6f4ed; --care-ink:#363d32; --care-olive:#3d4936; --care-muted:#7b8073; --care-line:#dcdfd3; position:relative; width:100%; height:100%; min-height:0; overflow-y:auto; overscroll-behavior:contain; background:var(--care-paper); color:var(--care-ink); font-family:Inter,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif; -webkit-font-smoothing:antialiased; scrollbar-width:none; }
    .momo-care::-webkit-scrollbar { display:none; }
    .momo-care *, .momo-care *::before, .momo-care *::after { box-sizing:border-box; }
    .momo-care button, .momo-care input { font:inherit; }
    .momo-care button { -webkit-tap-highlight-color:transparent; cursor:pointer; }
    .momo-care button:focus-visible, .momo-care input:focus-visible { outline:2px solid #687657; outline-offset:4px; }
    .momo-care button:disabled { cursor:wait; opacity:.6; }
    .momo-care button { color:inherit; }
    .momo-care .care-page { padding:16px 26px 28px; min-height:100%; display:flex; flex-direction:column; }
    .momo-care .care-nav { display:flex; align-items:center; min-height:44px; gap:10px; margin-left:-9px; }
    .momo-care .care-back { display:grid; place-items:center; width:42px; height:42px; padding:0; background:none; border:0; border-radius:50%; }
    .momo-care .care-nav-label { color:var(--care-muted); font-size:11px; letter-spacing:1.6px; }
    .momo-care .care-eyebrow { margin:24px 0 12px; font-size:10px; letter-spacing:2.5px; color:var(--care-muted); }
    .momo-care h1, .momo-care h2, .momo-care p { margin-top:0; }
    .momo-care h1, .momo-care h2 { font-family:"Songti SC","STSong","Noto Serif CJK SC",Georgia,serif; font-weight:400; }
    .momo-care h1 { font-size:29px; line-height:1.5; letter-spacing:1px; margin-bottom:12px; }
    .momo-care .care-sub { font-size:12px; line-height:1.95; color:var(--care-muted); margin-bottom:27px; }
    .momo-care .care-choices { border-top:1px solid var(--care-line); }
    .momo-care .care-choice { display:flex; text-align:left; align-items:center; gap:17px; width:100%; padding:22px 0; background:none; border:0; border-bottom:1px solid var(--care-line); }
    .momo-care .care-choice:hover .care-choice-icon { background:#e5e9dd; transform:rotate(-5deg); }
    .momo-care .care-choice-icon { width:51px; height:58px; flex-shrink:0; border:1px solid #d6dccb; border-radius:25px 25px 14px 14px; display:grid; place-items:center; color:#5e7052; background:#edf0e6; transition:background .2s,transform .2s; }
    .momo-care .care-choice:nth-child(2) .care-choice-icon { background:#e9e9df; border-color:#dcdccf; }
    .momo-care .care-choice:nth-child(3) .care-choice-icon { background:#efe5d6; border-color:#e6d8c6; color:#8b7352; }
    .momo-care .care-choice-copy { flex:1; }
    .momo-care .care-choice-title { display:block; font-size:15px; margin-bottom:7px; font-weight:400; }
    .momo-care .care-choice-caption { display:block; font-size:10px; color:var(--care-muted); letter-spacing:.2px; }
    .momo-care .care-choice-arrow { width:18px; color:#8b917f; }
    .momo-care .care-footer { margin:auto 0 0; padding-top:30px; font-size:10px; line-height:1.9; text-align:center; color:#888c80; }
    .momo-care .care-activity { text-align:center; }
    .momo-care .care-activity .care-nav { text-align:left; }
    .momo-care .care-activity .care-eyebrow { margin-top:25px; }
    .momo-care .care-activity h1 { font-size:27px; margin-bottom:8px; }
    .momo-care .care-activity .care-sub { margin:0 auto 8px; max-width:290px; min-height:45px; }
    .momo-care .care-orbit { width:204px; height:204px; margin:23px auto 21px; position:relative; border:1px solid #d9dece; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; isolation:isolate; }
    .momo-care .care-orbit::before { content:""; z-index:-1; position:absolute; inset:17px; border:1px solid #d6ddc9; background:#e7ebdd; border-radius:50%; transform:scale(.92); }
    .momo-care .care-orbit::after { content:""; z-index:-2; position:absolute; inset:8px; border:1px dashed #dfe3d6; border-radius:50%; }
    .momo-care .care-breathing.is-running .care-orbit::before { animation:care-breathe 10s ease-in-out infinite; animation-delay:var(--care-breath-offset,0s); }
    .momo-care .care-breathing.is-paused .care-orbit::before { animation-play-state:paused; }
    .momo-care .care-orbit-icon { width:32px; height:32px; margin-bottom:13px; color:#78886a; }
    .momo-care .care-clock { font-family:Georgia,"Times New Roman",serif; font-variant-numeric:tabular-nums; font-size:43px; line-height:1; letter-spacing:1px; }
    .momo-care .care-phase { font-size:11px; margin-top:13px; color:#6f7b63; min-height:16px; }
    .momo-care .care-progress { height:2px; background:#e1e5d8; width:100%; margin:2px 0 14px; overflow:hidden; }
    .momo-care .care-progress span { display:block; height:100%; background:#839273; width:0; }
    .momo-care .care-note { font-size:10px; color:var(--care-muted); line-height:1.9; min-height:40px; margin:0 6px 13px; }
    .momo-care .care-controls { margin-top:auto; padding-top:10px; }
    .momo-care .care-primary { border:1px solid var(--care-olive); background:var(--care-olive); color:#fff !important; display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:47px; padding:10px 18px; border-radius:25px; font-size:12px; letter-spacing:1px; }
    .momo-care .care-primary svg { width:17px; height:17px; }
    .momo-care .care-primary:hover { background:#4e5e44; }
    .momo-care .care-quiet { min-height:44px; padding:10px 13px; font-size:11px; border:0; background:none; color:var(--care-muted); text-decoration:underline; text-underline-offset:5px; }
    .momo-care .care-volume { display:flex; gap:12px; align-items:center; margin:0 5px 17px; font-size:10px; color:var(--care-muted); }
    .momo-care .care-volume svg { flex-shrink:0; width:17px; }
    .momo-care .care-volume input { flex:1; width:100%; min-width:0; height:25px; accent-color:#687c54; }
    .momo-care .care-volume output { min-width:28px; font-variant-numeric:tabular-nums; }
    .momo-care .care-waves { display:flex; align-items:center; justify-content:center; gap:4px; height:32px; margin-bottom:11px; color:#78886a; }
    .momo-care .care-waves span { display:block; width:2px; height:12px; background:currentColor; border-radius:3px; }
    .momo-care .care-waves span:nth-child(2n) { height:22px; }
    .momo-care .care-waves span:nth-child(3n) { height:29px; }
    .momo-care .is-running .care-waves span { animation:care-wave 2.7s ease-in-out infinite alternate; }
    .momo-care .is-running .care-waves span:nth-child(2n) { animation-delay:-1s; }
    .momo-care .is-running .care-waves span:nth-child(3n) { animation-delay:-1.9s; }
    .momo-care .care-walk .care-orbit { margin-top:16px; margin-bottom:13px; width:180px; height:180px; }
    .momo-care .care-walk-step { padding:13px 14px; text-align:left; background:#efeee5; border-radius:12px; margin-bottom:13px; min-height:62px; }
    .momo-care .care-walk-step strong { font-size:11px; font-weight:500; display:block; margin-bottom:5px; }
    .momo-care .care-walk-step p { font-size:10px; line-height:1.65; color:var(--care-muted); margin-bottom:0; }
    .momo-care .care-error { font-size:11px; line-height:1.8; color:#906046; margin:0 0 12px; }
    .momo-care .care-complete { text-align:center; }
    .momo-care .care-finish-mark { display:grid; place-items:center; width:74px; height:74px; border-radius:50%; border:1px solid #d6decb; margin:57px auto 28px; color:#7b8c6b; background:#e9eddf; }
    .momo-care .care-complete h1 { font-size:27px; }
    .momo-care .care-feelings { display:flex; flex-direction:column; gap:11px; margin:18px 0 8px; }
    .momo-care .care-feeling { width:100%; border:1px solid #d8ddce; border-radius:12px; background:#f9f8f3; text-align:left; padding:16px 19px; font-size:12px; display:flex; align-items:center; gap:13px; }
    .momo-care .care-feeling:hover { background:#e9edde; border-color:#acb899; }
    .momo-care .care-feeling-symbol { font-family:Georgia,serif; font-size:20px; width:25px; text-align:center; color:#7a896b; }
    .momo-care .care-sr { position:absolute !important; height:1px; width:1px; overflow:hidden; clip:rect(1px,1px,1px,1px); white-space:nowrap; }
    @keyframes care-breathe { 0%,100% { transform:scale(.88); } 50% { transform:scale(1.06); } }
    @keyframes care-wave { from { transform:scaleY(.5); } to { transform:scaleY(1); } }
    @media (prefers-reduced-motion:reduce) { .momo-care *, .momo-care *::before { animation:none !important; transition:none !important; } }
    @media (max-height:650px) { .momo-care .care-page { padding-top:8px; } .momo-care .care-orbit { width:170px; height:170px; margin:12px auto; } .momo-care .care-eyebrow { margin-top:15px; } }
  `;

  let current = null;

  function dispose() {
    if (!current) return;
    const active = current;
    current = null;
    active.destroyed = true;
    clearInterval(active.interval);
    stopAudio(active);
    active.root.removeEventListener('click', active.clickHandler);
    active.root.removeEventListener('input', active.inputHandler);
    active.root.remove();
    active.style.remove();
  }

  function stopAudio(state) {
    state.audioRequest += 1;
    if (state.audio) {
      const context = state.audio.context;
      state.audio = null;
      if (context.state !== 'closed') context.close().catch(function () {});
    }
  }

  function clearActivity(state) {
    clearInterval(state.interval);
    state.interval = null;
    state.running = false;
    state.busy = false;
    state.activityVersion += 1;
    stopAudio(state);
  }

  function nav(label) {
    return '<nav class="care-nav" aria-label="自我关怀导航"><button class="care-back" type="button" data-care="back" aria-label="返回">' + icon('back') + '</button><span class="care-nav-label">' + label + '</span></nav>';
  }

  function showMenu(state, focus) {
    clearActivity(state);
    state.view = 'menu';
    state.kind = null;
    state.root.innerHTML = '<section class="care-page">' + nav('给自己一点空白') +
      '<p class="care-eyebrow">A LITTLE PAUSE</p><h1 tabindex="-1">先照顾一下自己</h1>' +
      '<p class="care-sub">不急着想明白所有事。<br>挑一件现在做得到的小事，也可以什么都不做。</p>' +
      '<div class="care-choices">' + Object.keys(ACTIVITIES).map(function (key) {
        const activity = ACTIVITIES[key];
        const caption = key === 'breathing' ? '1 分钟 · 跟着自己的节奏' : key === 'sound' ? '2 分钟 · 本地合成音景' : '5 分钟 · 换个位置，动一动';
        return '<button class="care-choice" type="button" data-care="choose" data-kind="' + key + '"><span class="care-choice-icon">' + icon(activity.icon) + '</span><span class="care-choice-copy"><span class="care-choice-title">' + activity.label + '</span><span class="care-choice-caption">' + caption + '</span></span>' + icon('arrow', 'care-choice-arrow') + '</button>';
      }).join('') + '</div><p class="care-footer">没有打卡，没有必须完成的目标。<br>只是给此刻的自己一点照顾。</p></section>';
    if (focus) focusHeading(state);
  }

  function showActivity(state, kind) {
    clearActivity(state);
    state.kind = kind;
    state.view = 'activity';
    state.started = false;
    state.remaining = ACTIVITIES[kind].duration * 1000;
    state.deadline = 0;
    state.lastPhase = '';
    const activity = ACTIVITIES[kind];
    const centerIcon = kind === 'sound'
      ? '<div class="care-waves" aria-hidden="true">' + '<span></span>'.repeat(9) + '</div>'
      : icon(activity.icon, 'care-orbit-icon');
    state.root.innerHTML = '<section class="care-page care-activity care-' + kind + '">' + nav('这一小会儿，只留给你') +
      '<p class="care-eyebrow">' + activity.time + ' · 小小的暂停</p><h1 tabindex="-1">' + activity.label + '</h1>' +
      '<p class="care-sub">' + activity.intro + '</p><div class="care-orbit">' + centerIcon +
      '<span class="care-clock" role="timer" aria-label="剩余时间">' + formatTime(state.remaining) + '</span><span class="care-phase">准备好了再开始</span></div>' +
      '<div class="care-progress" role="progressbar" aria-label="活动进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>' +
      (kind === 'walk' ? '<div class="care-walk-step"><strong data-walk-title>01 / 03 · 找一处舒服的地方</strong><p data-walk-copy>看看周围，选一段平坦、安全的小路。</p></div>' : '') +
      '<p class="care-note">' + activity.note + '</p>' +
      (kind === 'sound' ? '<label class="care-volume">' + icon('volume') + '<span class="care-sr">音景音量</span><input type="range" data-care-volume min="0" max="100" value="25" aria-label="音景音量"><output>25%</output></label>' : '') +
      '<p class="care-error" role="alert" hidden></p><div class="care-controls"><button type="button" class="care-primary" data-care="toggle">' + icon('play') + '<span>开始这 ' + activity.time + '</span></button><button type="button" class="care-quiet" data-care="finish">先到这里</button></div><span class="care-sr care-announcer" role="status" aria-live="polite"></span></section>';
    state.volume = 0.25;
    focusHeading(state);
  }

  function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function focusHeading(state) {
    const heading = state.root.querySelector('h1');
    if (heading) heading.focus({ preventScroll: true });
    state.root.scrollTop = 0;
  }

  async function ensureAudio(state) {
    if (state.audio) {
      await state.audio.context.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('浏览器暂时无法播放音景。可以换一种小练习。');
    const request = ++state.audioRequest;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = state.volume * 0.22;
    master.connect(context.destination);
    state.audio = { context: context, gain: master };

    // A seamless, low-passed noise loop plus quiet sine tones; generated only on tap.
    const length = Math.floor(context.sampleRate * 4);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index++) data[index] = Math.random() * 2 - 1;
    const wind = context.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 680;
    filter.Q.value = 0.35;
    const windGain = context.createGain();
    windGain.gain.value = 0.55;
    wind.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);
    wind.start();
    [174.61, 220, 261.63].forEach(function (frequency, index) {
      const tone = context.createOscillator();
      const level = context.createGain();
      tone.type = 'sine';
      tone.frequency.value = frequency;
      level.gain.value = [0.08, 0.045, 0.028][index];
      tone.connect(level);
      level.connect(master);
      tone.start();
    });
    try {
      await context.resume();
    } catch (error) {
      if (request === state.audioRequest) stopAudio(state);
      throw new Error('声音没有成功播放。请再试一次，或换一种小练习。');
    }
    if (state.destroyed || request !== state.audioRequest) {
      if (context.state !== 'closed') context.close().catch(function () {});
    }
  }

  function updateActivity(state) {
    if (state.destroyed || state.view !== 'activity') return;
    if (state.running) state.remaining = Math.max(0, state.deadline - Date.now());
    if (state.running && state.remaining <= 0) {
      showComplete(state, true);
      return;
    }
    const duration = ACTIVITIES[state.kind].duration * 1000;
    const elapsed = duration - state.remaining;
    state.root.querySelector('.care-clock').textContent = formatTime(state.remaining);
    const progress = Math.min(100, Math.max(0, elapsed / duration * 100));
    const progressNode = state.root.querySelector('.care-progress');
    progressNode.setAttribute('aria-valuenow', String(Math.round(progress)));
    progressNode.firstElementChild.style.width = progress + '%';

    let phase = !state.started ? '准备好了再开始' : !state.running ? '暂停中，慢慢来' : '';
    if (state.running) {
      phase = state.kind === 'breathing' ? (elapsed % 10000 < 5000 ? '轻轻吸气，不必用力' : '慢慢呼气，照自己的节奏') : state.kind === 'sound' ? '把注意力放在声音里' : '按自己的步调就好';
    }
    if (phase !== state.lastPhase) {
      state.root.querySelector('.care-phase').textContent = phase;
      state.lastPhase = phase;
    }
    if (state.kind === 'walk') {
      const step = elapsed < 60000 ? 0 : elapsed < 240000 ? 1 : 2;
      const titles = ['01 / 03 · 找一处舒服的地方', '02 / 03 · 慢慢走，不用赶路', '03 / 03 · 回到舒服的位置'];
      const copies = ['看看周围，选一段平坦、安全的小路。', '留意脚下的触感。空间有限，原地踏步或坐着转转肩也好。', '慢一点停下来，看看此刻的身体感觉。喝一口水也好。'];
      state.root.querySelector('[data-walk-title]').textContent = titles[step];
      state.root.querySelector('[data-walk-copy]').textContent = copies[step];
    }
  }

  async function toggle(state) {
    if (state.busy || state.view !== 'activity') return;
    const button = state.root.querySelector('[data-care="toggle"]');
    if (state.running) {
      state.remaining = Math.max(0, state.deadline - Date.now());
      if (state.remaining <= 0) {
        showComplete(state, true);
        return;
      }
      state.running = false;
      clearInterval(state.interval);
      state.interval = null;
      if (state.audio && state.audio.context.state !== 'closed') state.audio.context.suspend().catch(function () {});
      button.innerHTML = icon('play') + '<span>继续这一小会儿</span>';
      state.root.querySelector('.care-activity').classList.remove('is-running');
      state.root.querySelector('.care-activity').classList.add('is-paused');
      updateActivity(state);
      state.root.querySelector('.care-announcer').textContent = '已暂停。剩余 ' + formatTime(state.remaining);
      return;
    }
    if (state.kind === 'sound') {
      state.busy = true;
      button.disabled = true;
      const errorNode = state.root.querySelector('.care-error');
      errorNode.hidden = true;
      const chosenKind = state.kind;
      const activityVersion = state.activityVersion;
      try {
        await ensureAudio(state);
      } catch (error) {
        if (!state.destroyed && state.view === 'activity' && state.activityVersion === activityVersion) {
          errorNode.textContent = error.message || '声音暂时无法播放，请再试一次。';
          errorNode.hidden = false;
          button.disabled = false;
          state.busy = false;
        }
        return;
      }
      if (state.destroyed || state.view !== 'activity' || state.activityVersion !== activityVersion || state.kind !== chosenKind || !state.audio) return;
      state.busy = false;
      button.disabled = false;
    }
    state.started = true;
    state.running = true;
    state.deadline = Date.now() + state.remaining;
    state.root.querySelector('.care-activity').style.setProperty('--care-breath-offset', '-' + ((ACTIVITIES[state.kind].duration * 1000 - state.remaining) / 1000) + 's');
    state.root.querySelector('.care-activity').classList.remove('is-paused');
    state.root.querySelector('.care-activity').classList.add('is-running');
    button.innerHTML = icon('pause') + '<span>暂停一下</span>';
    state.root.querySelector('.care-announcer').textContent = '已开始，可以随时暂停或结束。';
    updateActivity(state);
    if (state.view === 'activity' && state.running) state.interval = setInterval(function () { updateActivity(state); }, 200);
  }

  function showComplete(state, finished) {
    clearActivity(state);
    state.view = 'complete';
    state.root.innerHTML = '<section class="care-page care-complete">' + nav('照顾自己，没有标准答案') +
      '<div class="care-finish-mark">' + icon('check') + '</div><p class="care-eyebrow">A MOMENT FOR YOU</p><h1 tabindex="-1">' + (finished ? '这一小会儿，留给了自己' : '到这里，也很好') + '</h1><p class="care-sub">现在的感觉，有一点变化吗？<br>没有变好也没关系，只是看看此刻。</p>' +
      '<div class="care-feelings"><button class="care-feeling" type="button" data-care="feeling" data-feeling="relieved"><span class="care-feeling-symbol" aria-hidden="true">⌣</span>松一点了</button><button class="care-feeling" type="button" data-care="feeling" data-feeling="same"><span class="care-feeling-symbol" aria-hidden="true">—</span>差不多</button><button class="care-feeling" type="button" data-care="feeling" data-feeling="tenser"><span class="care-feeling-symbol" aria-hidden="true">⌢</span>更紧绷了</button></div><button class="care-quiet" type="button" data-care="feeling" data-feeling="skipped">跳过标记，回到日记</button><p class="care-footer">小练习只是一个选择。<br>你可以随时停下来，也可以找信任的人聊聊。</p></section>';
    focusHeading(state);
  }

  function mount(container, options) {
    if (!container || typeof container.appendChild !== 'function') throw new TypeError('MomoCare.mount requires a DOM container.');
    dispose();
    options = options || {};
    const root = document.createElement('div');
    root.className = 'momo-care';
    root.setAttribute('aria-label', '自我关怀');
    const style = document.createElement('style');
    style.textContent = CSS;
    const state = {
      root: root, style: style, options: options, view: 'menu', kind: null,
      interval: null, audio: null, audioRequest: 0, activityVersion: 0, destroyed: false,
      running: false, started: false, busy: false, remaining: 0, volume: 0.25
    };
    state.clickHandler = function (event) {
      const button = event.target.closest('[data-care]');
      if (!button || !root.contains(button) || button.disabled) return;
      switch (button.dataset.care) {
        case 'back':
          if (state.view === 'menu') {
            clearActivity(state);
            if (typeof options.onBack === 'function') options.onBack();
          } else showMenu(state, true);
          break;
        case 'choose':
          if (ACTIVITIES[button.dataset.kind]) showActivity(state, button.dataset.kind);
          break;
        case 'toggle': toggle(state); break;
        case 'finish': showComplete(state, false); break;
        case 'feeling': {
          if (state.view !== 'complete') break;
          const result = { kind: state.kind, feeling: button.dataset.feeling };
          clearActivity(state);
          state.view = 'reported';
          if (typeof options.onComplete === 'function') options.onComplete(result);
          else showMenu(state, true);
          break;
        }
      }
    };
    state.inputHandler = function (event) {
      if (!event.target.matches('[data-care-volume]')) return;
      state.volume = Number(event.target.value) / 100;
      const output = root.querySelector('.care-volume output');
      if (output) output.textContent = event.target.value + '%';
      if (state.audio) state.audio.gain.gain.setTargetAtTime(state.volume * 0.22, state.audio.context.currentTime, 0.1);
    };
    root.addEventListener('click', state.clickHandler);
    root.addEventListener('input', state.inputHandler);
    container.appendChild(style);
    container.appendChild(root);
    current = state;
    showMenu(state, false);
    return { dispose: dispose };
  }

  window.MomoCare = { mount: mount, dispose: dispose };
})();
