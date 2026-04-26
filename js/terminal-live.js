/* ============================================================
   TERMINAL LIVE LAYER
   - boot sequence
   - live data wiggle
   - interactive command line
   - keyboard nav (j/k, g+key, /)
   - click ripple + status flags
   ============================================================ */
(()=>{
  /* ---------------- boot sequence ---------------- */
  function boot(){
    if(sessionStorage.getItem('as-term-booted')) return;
    const bootEl = document.createElement('div');
    bootEl.className = 'as-boot';
    bootEl.innerHTML = `<pre id="bootLog"></pre>`;
    document.body.appendChild(bootEl);
    const log = document.getElementById('bootLog');
    const lines = [
      '> AS://TERM v.2026.04 · OPERATING SYSTEM',
      '> COPYRIGHT (C) 2026 AADITHYA SRINIVASAN · ALL RIGHTS RESERVED',
      '',
      '> POST · power-on self-test ......................... [ OK ]',
      '> CRT scanline calibration ........................... [ OK ]',
      '> phosphor warmup .................................... [ OK ]',
      '> connecting to AS::FEED ............................. [ OK ]',
      '> loading market data ................................ [ 22 contracts ]',
      '> loading tape ....................................... [ 21 headlines ]',
      '> mounting /vitals ................................... [ OK ]',
      '> authenticating operator ............................ [ OK ]',
      '',
      '> OPERATOR: AADITHYA SRINIVASAN',
      '> CLEARANCE: PRIMARY · PUBLIC INSPECTION',
      '> STATUS: ● OPEN-TO-WORK',
      '',
      '> READY. press any key.'
    ];
    let i = 0;
    const tick = setInterval(()=>{
      if(i >= lines.length){
        clearInterval(tick);
        return;
      }
      log.textContent += lines[i] + '\n';
      i++;
    }, 90);
    function dismiss(){
      bootEl.classList.add('out');
      setTimeout(()=> bootEl.remove(), 600);
      sessionStorage.setItem('as-term-booted','1');
      window.removeEventListener('keydown', dismiss);
      bootEl.removeEventListener('click', dismiss);
    }
    window.addEventListener('keydown', dismiss);
    bootEl.addEventListener('click', dismiss);
    setTimeout(dismiss, 4200);
  }

  /* ---------------- live data wiggle ---------------- */
  function wiggle(){
    // composite score
    const last = document.querySelector('.head-block .last');
    if(last && !last.dataset.base){
      last.dataset.base = parseFloat(last.textContent) || 94.7;
    }
    if(last){
      const base = parseFloat(last.dataset.base);
      const next = (base + (Math.random()-0.5)*0.4).toFixed(1);
      const cur = parseFloat(last.textContent);
      last.textContent = next;
      const rising = next > cur;
      last.style.color = rising ? '#43e0a4' : '#ff5e6b';
      setTimeout(()=>{ last.style.color = ''; }, 700);
    }
    // ticker bar — pick a random delta
    const tracks = document.querySelectorAll('.ticker-track > span');
    if(tracks.length){
      const idx = Math.floor(Math.random()*tracks.length);
      const el = tracks[idx];
      const val = el.querySelector('.up,.dn,span:nth-child(2)');
      if(val){
        el.style.color = '#fff';
        setTimeout(()=>{ el.style.color = ''; }, 500);
      }
    }
    // delta column on tape rows
    const deltas = document.querySelectorAll('.tape-row .delta');
    if(deltas.length){
      const d = deltas[Math.floor(Math.random()*deltas.length)];
      d.style.textShadow = '0 0 8px currentColor';
      setTimeout(()=>{ d.style.textShadow=''; }, 600);
    }
  }

  /* ---------------- interactive command line ---------------- */
  function cmdline(){
    // make the prompt clickable / focusable
    const promptEl = document.querySelector('.funcbar .prompt');
    if(!promptEl) return;
    promptEl.innerHTML = `AS://TERM/<input id="termCmd" autocomplete="off" spellcheck="false" placeholder="" />`;
    const input = document.getElementById('termCmd');
    const history = [];
    let hidx = -1;
    
    const COMMANDS = {
      'home':()=> activate('HOME'),
      'work':()=> activate('WORK'),
      'build':()=> activate('BUILD'),
      'projects':()=> activate('BUILD'),
      'skill':()=> activate('SKILL'),
      'skills':()=> activate('SKILL'),
      'hobby':()=> activate('HOBBY'),
      'edu':()=> activate('EDU'),
      'msg':()=> activate('MSG'),
      'contact':()=> activate('MSG'),
      'cv':()=> { window.open('assets/resume.pdf','_blank'); return 'opened cv';},
      'resume':()=> { window.open('assets/resume.pdf','_blank'); return 'opened cv';},
      'github':()=> { window.open('https://github.com/asrinivasan75','_blank'); return 'opened github';},
      'linkedin':()=> { window.open('https://www.linkedin.com/in/aadithya-srinivasan-777936269/','_blank'); return 'opened linkedin';},
      'mail':()=> { window.location.href='mailto:aadithya.srinivasan@gmail.com'; return 'opening mail';},
      'email':()=> { window.location.href='mailto:aadithya.srinivasan@gmail.com'; return 'opening mail';},
      'markets':()=> { window.location.href='markets.html'; return 'jumping to markets…';},
      'choose':()=> { window.location.href='index.html'; return 'back to chooser';},
      'home':()=> { window.location.href='index.html'; return 'going home';},
      'clear':()=> { hudPrint(''); return '';},
      'help':()=> showHelp(),
      'whoami':()=> hudPrint('AADITHYA SRINIVASAN · UPENN CS+MATH · ENGINEER'),
      'date':()=> hudPrint(new Date().toString()),
      'about':()=> hudPrint('AS://TERM is a Bloomberg-style portfolio. type <b>help</b> for commands.')
    };
    function activate(fn){
      const btn = document.querySelector(`#funcKeys button[data-fn="${fn}"]`);
      if(btn) btn.click();
      return `→ ${fn}`;
    }
    function showHelp(){
      hudPrint(`
COMMANDS · F-KEYS · KEYBOARD
home work build skill hobby edu msg
cv github linkedin mail markets clear
whoami date about help
F1-F7 · J/K row · ENTER expand · / search · ? help`);
      return '';
    }
    
    input.addEventListener('keydown',(e)=>{
      if(e.key==='Enter'){
        const cmd = input.value.trim().toLowerCase();
        if(!cmd){ return; }
        history.push(cmd); hidx = history.length;
        const fn = COMMANDS[cmd];
        if(fn){
          const r = fn();
          if(r) hudPrint(`> ${cmd}\n${r}`);
        } else {
          // fuzzy match against tickers
          const m = (window.ROWS||[]).find(r=> r.ticker.toLowerCase().includes(cmd));
          if(m){
            const row = document.querySelector(`.tape-row[data-key]`);
            // open the matching row
            document.querySelectorAll('.tape-row').forEach(r=>{
              if(r.querySelector('.ticker')?.textContent.toLowerCase().includes(cmd)){
                r.scrollIntoView({block:'center'});
                if(!r.classList.contains('expanded')) r.click();
              }
            });
            hudPrint(`> ${cmd}\nfound · ${m.ticker}`);
          } else {
            hudPrint(`> ${cmd}\nunknown command. type <b>help</b>.`);
          }
        }
        input.value='';
        e.preventDefault();
      }
      if(e.key==='ArrowUp'){
        hidx = Math.max(0, hidx-1);
        if(history[hidx]) input.value = history[hidx];
        e.preventDefault();
      }
      if(e.key==='ArrowDown'){
        hidx = Math.min(history.length, hidx+1);
        input.value = history[hidx] || '';
        e.preventDefault();
      }
      if(e.key==='Tab'){
        e.preventDefault();
        const q = input.value.toLowerCase();
        const matches = Object.keys(COMMANDS).filter(c=>c.startsWith(q));
        if(matches.length===1) input.value = matches[0];
      }
    });
    
    // global key to focus
    window.addEventListener('keydown',(e)=>{
      if(document.activeElement === input) return;
      if(e.key === ':' || e.key === '/'){
        e.preventDefault(); input.focus();
        if(e.key==='/') input.value='';
      }
    });
  }
  
  function hudPrint(msg){
    let pad = document.getElementById('hudPrint');
    if(!pad){
      const blk = document.createElement('div');
      blk.className = 'blk';
      blk.innerHTML = `<h4>SHELL · OUT</h4><pre id="hudPrint"></pre>`;
      const hud = document.querySelector('.hud');
      if(hud) hud.appendChild(blk);
      pad = document.getElementById('hudPrint');
    }
    if(!pad) return;
    pad.innerHTML = msg;
    pad.scrollTop = pad.scrollHeight;
  }

  /* ---------------- keyboard nav ---------------- */
  function keyboardNav(){
    let curIdx = -1;
    let gPending = false; let gTimer;
    
    function rows(){ return [...document.querySelectorAll('.tape-row')]; }
    function focus(idx){
      const r = rows();
      r.forEach(x=>x.classList.remove('kfocus'));
      if(idx<0 || idx>=r.length) return;
      curIdx = idx;
      r[idx].classList.add('kfocus');
      r[idx].scrollIntoView({block:'center', behavior:'smooth'});
    }
    
    window.addEventListener('keydown',(e)=>{
      const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
      if(isInput) return;
      if(e.metaKey||e.ctrlKey||e.altKey) return;
      
      if(e.key==='j'){ focus(Math.min(rows().length-1, curIdx+1)); e.preventDefault(); return;}
      if(e.key==='k'){ focus(Math.max(0, curIdx-1)); e.preventDefault(); return;}
      if(e.key==='Enter' && curIdx>=0){ rows()[curIdx]?.click(); e.preventDefault(); return;}
      if(e.key==='?'){
        const inp = document.getElementById('termCmd');
        if(inp){ inp.focus(); inp.value='help'; }
        e.preventDefault(); return;
      }
      if(e.key==='g'){
        if(gPending){
          // gg — jump to top
          gPending = false; clearTimeout(gTimer);
          window.scrollTo({top:0, behavior:'smooth'});
          focus(0);
        } else {
          gPending = true;
          gTimer = setTimeout(()=>{ gPending=false;}, 800);
        }
        e.preventDefault(); return;
      }
      if(gPending){
        gPending = false; clearTimeout(gTimer);
        const map = {w:'WORK', b:'BUILD', s:'SKILL', h:'HOBBY', e:'EDU', m:'MSG', i:'HOME'};
        const fn = map[e.key.toLowerCase()];
        if(fn){
          const btn = document.querySelector(`#funcKeys button[data-fn="${fn}"]`);
          if(btn) btn.click();
        }
        e.preventDefault();
      }
      if(e.key==='G'){
        // go to bottom
        const r = rows();
        focus(r.length-1);
        e.preventDefault();
      }
    });
  }

  /* ---------------- click ripple ---------------- */
  function ripples(){
    document.addEventListener('click',(e)=>{
      const r = document.createElement('div');
      r.className = 'crt-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top  = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(()=> r.remove(), 800);
    });
  }

  /* ---------------- status flags ---------------- */
  function statusFlags(){
    const fb = document.querySelector('.footer-bar');
    if(!fb) return;
    // replace middle child or insert flags
    const flags = document.createElement('span');
    flags.className = 'as-flags';
    flags.innerHTML = `<span class="fl ok">CONN ●</span><span class="fl ok">FEED ●</span><span class="fl ok">AUTH ●</span><span class="fl ok">CRT ●</span>`;
    // insert as second-to-last
    const middle = fb.children[1];
    if(middle) middle.replaceWith(flags);
  }

  /* ---------------- styles ---------------- */
  function injectStyles(){
    const s = document.createElement('style');
    s.textContent = `
      .as-boot{
        position: fixed; inset: 0; z-index: 999;
        background: #0a0805; color: #ffb536;
        font-family:'JetBrains Mono',monospace; font-size: 12px;
        padding: 60px 48px;
        opacity: 1; transition: opacity .5s;
        text-shadow: 0 0 8px rgba(255,181,54,0.5);
        cursor: pointer;
      }
      .as-boot.out{ opacity: 0; }
      .as-boot pre{
        white-space: pre-wrap; line-height: 1.55;
      }
      .as-boot::after{
        content:""; position: absolute; inset: 0; pointer-events:none;
        background: repeating-linear-gradient(180deg, transparent 0, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 3px);
      }
      .as-boot::before{
        content:""; position: absolute; inset: 0; pointer-events:none;
        background: radial-gradient(ellipse at center, transparent 50%, rgba(10,8,5,0.65));
      }
      
      .funcbar .prompt input{
        background: transparent; border: 0; color: #ffb536;
        font-family: 'JetBrains Mono', monospace; font-size: 12px;
        outline: none;
        width: 200px;
        text-shadow: 0 0 6px rgba(255,181,54,0.5);
      }
      .funcbar .prompt input::placeholder{ color:#5a4f3a;}
      
      .tape-row.kfocus{
        background: rgba(255,181,54,0.10);
        border-left: 2px solid #ffb536;
        padding-left: 14px;
      }
      
      .crt-ripple{
        position: fixed; pointer-events:none; z-index: 998;
        width: 0; height: 0;
        border: 2px solid #ffb536;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: ripple .8s ease-out forwards;
      }
      @keyframes ripple{
        0%{ width: 0; height: 0; opacity: .8;}
        100%{ width: 80px; height: 80px; opacity: 0;}
      }
      
      .as-flags{
        display: flex; gap: 14px;
      }
      .as-flags .fl{
        font-family:'JetBrains Mono',monospace; font-size: 10px;
        letter-spacing: .15em; color: #5a4f3a;
      }
      .as-flags .fl.ok{ color: #43e0a4; }
      .as-flags .fl.ok::before{
        animation: pulseFlag 1.6s ease-in-out infinite;
      }
      @keyframes pulseFlag{ 50%{ opacity: .4;} }
    `;
    document.head.appendChild(s);
  }

  /* ---------------- expose ROWS ---------------- */
  function exposeRows(){
    // inline script puts ROWS in module scope; we need it
    // best-effort: re-walk the DOM
  }

  /* ---------------- bootstrap ---------------- */
  function start(){
    injectStyles();
    boot();
    setTimeout(()=>{
      cmdline();
      keyboardNav();
      ripples();
      statusFlags();
      setInterval(wiggle, 1800);
    }, 200);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
