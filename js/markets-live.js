/* ============================================================
   MARKETS LIVE LAYER
   - tick prices on open contracts
   - trading + portfolio (localStorage, no backend)
   - resolve animation for futures
   - cmd-K search, cursor price-print trail
   ============================================================ */
(()=>{
  const STORAGE = 'as-markets-state-v1';
  const STARTING_CASH = 1247.30;

  /* ---------------- state ---------------- */
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE);
      if(raw) return JSON.parse(raw);
    }catch{}
    return { cash: STARTING_CASH, positions: [], resolved: {}, prices: {}, history: [] };
  }
  function saveState(){ try{ localStorage.setItem(STORAGE, JSON.stringify(state)); }catch{} }
  let state = loadState();

  // wait until MARKETS array exists in main scope
  const ready = ()=> typeof window.MARKETS !== 'undefined';
  function whenReady(cb){
    if(ready()) return cb();
    setTimeout(()=>whenReady(cb), 80);
  }

  /* ---------------- live ticking ---------------- */
  function initPrices(){
    window.MARKETS.forEach(m=>{
      if(state.prices[m.id] == null) state.prices[m.id] = m.yes;
    });
    saveState();
  }
  function tickPrices(){
    let changed = false;
    window.MARKETS.forEach(m=>{
      if(m.resolved || state.resolved[m.id]) return;
      const cur = state.prices[m.id] ?? m.yes;
      // mean revert toward original yes
      const drift = (m.yes - cur) * 0.05;
      const noise = (Math.random()-0.5) * 1.4;
      let next = Math.max(2, Math.min(98, cur + drift + noise));
      next = Math.round(next*10)/10;
      if(Math.abs(next - cur) >= 0.1){
        const dir = next > cur ? 'up' : 'dn';
        state.prices[m.id] = next;
        m.yes = Math.round(next);
        m.no = 100 - m.yes;
        // update card if rendered
        flashCard(m, dir);
        changed = true;
      }
    });
    if(changed) saveState();
    updateBalance();
    updatePortfolioPanel();
  }
  function flashCard(m, dir){
    const card = document.querySelector(`.market[data-id="${m.id}"]`);
    if(!card) return;
    const yesPrice = card.querySelector('.price.yes b');
    const noPrice = card.querySelector('.price.no b');
    if(yesPrice) yesPrice.textContent = m.yes + '¢';
    if(noPrice) noPrice.textContent = m.no + '¢';
    card.classList.remove('flash-up','flash-dn');
    void card.offsetWidth;
    card.classList.add(dir==='up' ? 'flash-up' : 'flash-dn');
    // also if open in overlay
    const overlayOpen = document.getElementById('overlay').classList.contains('open');
    if(overlayOpen){
      const head = document.querySelector('.contract-head .ticker-big');
      if(head && head.textContent.includes(m.id)){
        const yesV = document.querySelector('.price-banner .v.up');
        const noV  = document.querySelector('.price-banner .v.dn');
        if(yesV) yesV.textContent = m.yes + '¢';
        if(noV)  noV.textContent  = m.no + '¢';
      }
    }
  }

  /* ---------------- portfolio panel ---------------- */
  function ensurePortfolioPanel(){
    if(document.getElementById('portfolioPanel')) return;
    const wrap = document.createElement('div');
    wrap.id = 'portfolioPanel';
    wrap.className = 'portfolio-panel';
    wrap.innerHTML = `
      <div class="pp-head">
        <span>Portfolio</span>
        <button class="pp-close" id="ppClose">_</button>
      </div>
      <div class="pp-body" id="ppBody"></div>
      <div class="pp-foot">
        <button id="ppReset">Reset paper account</button>
      </div>
    `;
    document.body.appendChild(wrap);
    document.getElementById('ppClose').addEventListener('click', ()=>{
      wrap.classList.toggle('collapsed');
    });
    document.getElementById('ppReset').addEventListener('click', ()=>{
      if(!confirm('Reset paper trading account to $1,247.30 cash and clear all positions?')) return;
      state = { cash: STARTING_CASH, positions: [], resolved: {}, prices: {}, history: [] };
      initPrices();
      saveState();
      updatePortfolioPanel();
      updateBalance();
      // restore prices on cards
      window.MARKETS.forEach(m=>{ /* keep */ });
    });
  }
  function updatePortfolioPanel(){
    ensurePortfolioPanel();
    const body = document.getElementById('ppBody');
    if(!body) return;
    const positions = state.positions.filter(p=>!p.closed);
    const totalPL = positions.reduce((s,p)=>{
      const m = window.MARKETS.find(x=>x.id===p.id);
      const cur = m ? (p.side==='YES' ? m.yes : m.no) : p.entry;
      const pl = (cur - p.entry) * p.shares / 100;
      return s + pl;
    },0);
    const equity = positions.reduce((s,p)=>{
      const m = window.MARKETS.find(x=>x.id===p.id);
      const cur = m ? (p.side==='YES' ? m.yes : m.no) : p.entry;
      return s + cur*p.shares/100;
    },0);
    const portfolio = state.cash + equity;

    body.innerHTML = `
      <div class="pp-stats">
        <div><span>CASH</span><b>$${state.cash.toFixed(2)}</b></div>
        <div><span>EQUITY</span><b>$${equity.toFixed(2)}</b></div>
        <div><span>TOTAL</span><b style="color:#3ee08b">$${portfolio.toFixed(2)}</b></div>
        <div><span>P&amp;L</span><b style="color:${totalPL>=0?'#3ee08b':'#ff5e6b'}">${totalPL>=0?'+':''}$${totalPL.toFixed(2)}</b></div>
      </div>
      <div class="pp-positions">
        <div class="pp-section">POSITIONS · ${positions.length}</div>
        ${positions.length===0 ? '<div class="pp-empty">No open positions. Click any contract to trade.</div>' :
          positions.map(p=>{
            const m = window.MARKETS.find(x=>x.id===p.id);
            const cur = m ? (p.side==='YES' ? m.yes : m.no) : p.entry;
            const pl = (cur - p.entry) * p.shares / 100;
            return `
              <div class="pp-pos" data-pos="${p.uid}">
                <div class="pp-pos-top">
                  <span class="pp-side ${p.side==='YES'?'yes':'no'}">${p.side}</span>
                  <span class="pp-id">${p.id}</span>
                </div>
                <div class="pp-pos-row">
                  <span>${p.shares} sh @ ${p.entry}¢</span>
                  <span>now ${cur}¢</span>
                  <span style="color:${pl>=0?'#3ee08b':'#ff5e6b'}">${pl>=0?'+':''}$${pl.toFixed(2)}</span>
                </div>
                <button class="pp-sell" data-pos="${p.uid}">SELL @ ${cur}¢</button>
              </div>`;
          }).join('')
        }
      </div>
      ${state.history.length ? `<div class="pp-section">RECENT · ${state.history.length}</div>
        <div class="pp-history">
          ${state.history.slice(-6).reverse().map(h=>`
            <div class="pp-hist"><span class="pp-side ${h.side==='YES'?'yes':'no'}">${h.action} ${h.side}</span>
            <span>${h.id} · ${h.shares}@${h.price}¢</span></div>
          `).join('')}
        </div>` : ''}
    `;
    body.querySelectorAll('.pp-sell').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        e.stopPropagation();
        sellPosition(btn.dataset.pos);
      });
    });
  }

  /* ---------------- balance in header ---------------- */
  function updateBalance(){
    const bal = document.querySelector('.balance b');
    if(bal) bal.textContent = '$ ' + state.cash.toFixed(2);
  }

  /* ---------------- trading ---------------- */
  function placeTrade(market, side, shares){
    const price = side==='YES' ? market.yes : market.no;
    const cost = price * shares / 100;
    if(cost > state.cash){
      flashError('Insufficient cash. ($' + cost.toFixed(2) + ' needed)');
      return false;
    }
    state.cash -= cost;
    state.positions.push({
      uid: 'p'+Date.now()+Math.random().toString(36).slice(2,6),
      id: market.id, side, shares, entry: price,
      ts: Date.now()
    });
    state.history.push({ action:'BUY', side, id:market.id, shares, price, ts: Date.now()});
    saveState();
    updatePortfolioPanel();
    updateBalance();
    spawnPriceFloat(side==='YES'?'#3ee08b':'#ff5e6b', `+${shares} ${side} @ ${price}¢`);
    return true;
  }
  function sellPosition(uid){
    const idx = state.positions.findIndex(p=>p.uid===uid);
    if(idx<0) return;
    const p = state.positions[idx];
    const m = window.MARKETS.find(x=>x.id===p.id);
    const cur = m ? (p.side==='YES' ? m.yes : m.no) : p.entry;
    const proceeds = cur * p.shares / 100;
    state.cash += proceeds;
    state.positions.splice(idx,1);
    state.history.push({ action:'SELL', side:p.side, id:p.id, shares:p.shares, price:cur, ts:Date.now()});
    saveState();
    updatePortfolioPanel();
    updateBalance();
    const pl = (cur - p.entry) * p.shares / 100;
    spawnPriceFloat(pl>=0?'#3ee08b':'#ff5e6b', `${pl>=0?'+':''}$${pl.toFixed(2)}`);
  }

  function flashError(msg){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'), 10);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 300);}, 2400);
  }

  /* cursor price float */
  let lastMouseX=0, lastMouseY=0;
  document.addEventListener('mousemove',(e)=>{ lastMouseX=e.clientX; lastMouseY=e.clientY; });
  function spawnPriceFloat(color, text){
    const el = document.createElement('div');
    el.className = 'price-float';
    el.style.color = color;
    el.style.left = lastMouseX + 'px';
    el.style.top = lastMouseY + 'px';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1400);
  }

  /* ---------------- order box hijack ---------------- */
  function bindOrderBox(){
    // Called whenever overlay opens. Hijack the contract's order box.
    document.addEventListener('click',(e)=>{
      const place = e.target.closest('.order-box .place');
      if(!place) return;
      const overlay = document.getElementById('overlay');
      if(!overlay.classList.contains('open')) return;
      const tickerEl = document.querySelector('.contract-head .ticker-big');
      if(!tickerEl) return;
      const id = tickerEl.textContent.split('·')[0].trim();
      const market = window.MARKETS.find(x=>x.id===id);
      if(!market) return;
      // determine side from yn-toggle .on
      const yesOn = document.querySelector('.yn-toggle .yes.on');
      const side = yesOn ? 'YES' : 'NO';
      // shares from row > b
      const sharesB = document.querySelector('.order-box .row b');
      const shares = parseInt(sharesB?.textContent || '10', 10) || 10;
      if(state.resolved[market.id] || market.resolved){
        flashError('Market is resolved.');
        return;
      }
      const ok = placeTrade(market, side, shares);
      if(ok){
        place.textContent = '✓ FILLED';
        place.style.background = '#3ee08b';
        setTimeout(()=>{
          place.textContent = market.resolved?'View resolution':'Place order';
          place.style.background = '';
        }, 1200);
      }
    });
    // YN toggle behaviour (just visual; default already)
    document.addEventListener('click',(e)=>{
      const btn = e.target.closest('.yn-toggle button');
      if(!btn) return;
      btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      // update displayed avg price
      const sideYes = btn.classList.contains('yes');
      const tickerEl = document.querySelector('.contract-head .ticker-big');
      if(!tickerEl) return;
      const id = tickerEl.textContent.split('·')[0].trim();
      const market = window.MARKETS.find(x=>x.id===id);
      if(!market) return;
      const rows = document.querySelectorAll('.order-box .row b');
      if(rows[1]) rows[1].textContent = (sideYes?market.yes:market.no) + '¢';
      const total = document.querySelector('.order-box .row.total b');
      if(total) total.textContent = '$ '+ (10 - (sideYes?market.yes:market.no)/10).toFixed(2);
    });
  }

  /* ---------------- resolve animation for futures ---------------- */
  function bindResolveButtons(){
    document.addEventListener('click',(e)=>{
      const btn = e.target.closest('#resolveBtn');
      if(!btn) return;
      const tickerEl = document.querySelector('.contract-head .ticker-big');
      if(!tickerEl) return;
      const id = tickerEl.textContent.split('·')[0].trim();
      const market = window.MARKETS.find(x=>x.id===id);
      if(!market) return;
      runResolveAnimation(market, btn);
    });
  }
  function runResolveAnimation(market, btn){
    btn.disabled = true; btn.style.opacity = .5;
    // build overlay
    const ov = document.createElement('div');
    ov.className = 'resolve-overlay';
    ov.innerHTML = `
      <div class="resolve-box">
        <div class="rb-label">RESOLVING · ${market.id}</div>
        <div class="rb-question">${market.question}</div>
        <div class="rb-spinner" id="rbSpinner">--</div>
        <div class="rb-status" id="rbStatus">computing settlement…</div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=> ov.classList.add('show'));
    const spin = document.getElementById('rbSpinner');
    const status = document.getElementById('rbStatus');
    const target = Math.random()*100 < market.yes ? 'YES' : 'NO';
    const phases = ['fetching primary record…','running consensus…','validating evidence…','sealing outcome…'];
    let pi = 0;
    const phaseInt = setInterval(()=>{ status.textContent = phases[pi++ % phases.length]; }, 600);
    let t = 0;
    const total = 2800;
    const start = Date.now();
    const spinInt = setInterval(()=>{
      t = Date.now() - start;
      const r = Math.random()<0.5 ? 'YES' : 'NO';
      spin.textContent = r;
      spin.style.color = r==='YES' ? '#3ee08b' : '#ff5e6b';
      if(t > total){
        clearInterval(spinInt); clearInterval(phaseInt);
        spin.textContent = target;
        spin.style.color = target==='YES' ? '#3ee08b' : '#ff5e6b';
        spin.classList.add('locked');
        status.textContent = `RESOLVED · ${target} · settling positions…`;
        // settle positions
        settlePositions(market, target);
        market.resolved = true;
        state.resolved[market.id] = target;
        state.prices[market.id] = target==='YES' ? 100 : 0;
        market.yes = target==='YES' ? 100 : 0;
        market.no  = 100 - market.yes;
        saveState();
        // close after a moment
        setTimeout(()=>{
          ov.classList.remove('show');
          setTimeout(()=>ov.remove(), 400);
          // refresh card
          flashCard(market, target==='YES' ? 'up':'dn');
          updatePortfolioPanel();
          updateBalance();
          // close contract overlay too
          const close = document.getElementById('closeOverlay');
          if(close) close.click();
        }, 1800);
      }
    }, 70);
  }
  function settlePositions(market, outcome){
    state.positions.forEach((p,i)=>{
      if(p.id !== market.id) return;
      const wins = p.side === outcome;
      const proceeds = wins ? p.shares : 0;
      state.cash += proceeds;
      state.history.push({
        action: wins?'WIN':'LOSS',
        side: p.side, id: p.id, shares: p.shares,
        price: wins?100:0, ts: Date.now()
      });
    });
    state.positions = state.positions.filter(p=>p.id !== market.id);
  }

  /* ---------------- inject Resolve button when overlay opens for futures ---------------- */
  function watchOverlay(){
    const overlay = document.getElementById('overlay');
    const obs = new MutationObserver(()=>{
      if(!overlay.classList.contains('open')) return;
      const tickerEl = document.querySelector('.contract-head .ticker-big');
      if(!tickerEl) return;
      const id = tickerEl.textContent.split('·')[0].trim();
      const market = window.MARKETS.find(x=>x.id===id);
      if(!market) return;
      // add resolve button for unresolved futures (or any non-resolved market)
      if(!market.resolved && !document.getElementById('resolveBtn')){
        const orderBox = document.querySelector('.order-box');
        if(orderBox){
          const btn = document.createElement('button');
          btn.id = 'resolveBtn';
          btn.className = 'place';
          btn.style.marginTop = '8px';
          btn.style.background = 'transparent';
          btn.style.border = '1px solid #e8c170';
          btn.style.color = '#e8c170';
          btn.textContent = 'Settle market now';
          orderBox.appendChild(btn);
        }
      }
    });
    obs.observe(overlay, { attributes:true, attributeFilter:['class']});
  }

  /* ---------------- cmd-K search ---------------- */
  function buildSearch(){
    const sw = document.createElement('div');
    sw.id = 'cmdk';
    sw.className = 'cmdk';
    sw.innerHTML = `
      <div class="cmdk-box">
        <input id="cmdkInput" placeholder="search markets · type ticker, keyword, category" autocomplete="off"/>
        <div class="cmdk-list" id="cmdkList"></div>
        <div class="cmdk-foot">↑↓ navigate · ↵ open · esc close</div>
      </div>
    `;
    document.body.appendChild(sw);
    const input = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    let sel = 0; let results = [];
    function render(q){
      const ql = q.toLowerCase().trim();
      results = !ql ? window.MARKETS.slice(0,8) : window.MARKETS.filter(m=>{
        return m.id.toLowerCase().includes(ql) || m.question.toLowerCase().includes(ql) ||
               m.category.toLowerCase().includes(ql) || m.cat.toLowerCase().includes(ql);
      }).slice(0,8);
      list.innerHTML = results.map((m,i)=>`
        <div class="cmdk-item ${i===sel?'on':''}" data-i="${i}">
          <span class="cmdk-tk">${m.id}</span>
          <span class="cmdk-q">${m.question}</span>
          <span class="cmdk-px" style="color:${m.yes>=70?'#3ee08b':m.yes<=40?'#ff5e6b':'#e8c170'}">${m.yes}¢</span>
        </div>`).join('');
      list.querySelectorAll('.cmdk-item').forEach(it=>{
        it.addEventListener('click',()=>{ pick(parseInt(it.dataset.i,10));});
      });
    }
    function pick(i){
      const m = results[i];
      if(!m) return;
      close();
      window.openContract(m);
    }
    function open(){
      sw.classList.add('open');
      input.value=''; sel=0;
      render('');
      setTimeout(()=>input.focus(),50);
    }
    function close(){ sw.classList.remove('open'); }
    input.addEventListener('input', ()=>{ sel=0; render(input.value); });
    input.addEventListener('keydown',(e)=>{
      if(e.key==='ArrowDown'){ sel=Math.min(results.length-1,sel+1); render(input.value); e.preventDefault();}
      if(e.key==='ArrowUp'){ sel=Math.max(0,sel-1); render(input.value); e.preventDefault();}
      if(e.key==='Enter'){ pick(sel); }
      if(e.key==='Escape'){ close(); }
    });
    sw.addEventListener('click',(e)=>{ if(e.target===sw) close(); });
    window.addEventListener('keydown',(e)=>{
      if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){
        e.preventDefault();
        sw.classList.contains('open') ? close() : open();
      }
    });
    // also trigger on a small fab
    const fab = document.createElement('button');
    fab.className='cmdk-fab';
    fab.innerHTML = '⌘K · search';
    fab.addEventListener('click', open);
    document.body.appendChild(fab);
  }

  /* ---------------- styles inject ---------------- */
  function injectStyles(){
    const s = document.createElement('style');
    s.textContent = `
      .market.flash-up{ animation: flashUp 0.6s ease-out;}
      .market.flash-dn{ animation: flashDn 0.6s ease-out;}
      @keyframes flashUp{ 0%{ box-shadow: inset 0 0 0 1px rgba(62,224,139,0.5); background: rgba(62,224,139,0.04);} 100%{ box-shadow:none;}}
      @keyframes flashDn{ 0%{ box-shadow: inset 0 0 0 1px rgba(255,94,107,0.5); background: rgba(255,94,107,0.03);} 100%{ box-shadow:none;}}
      .price-float{
        position: fixed; pointer-events:none; z-index:1000;
        font-family: 'JetBrains Mono', monospace; font-size: 12px;
        font-weight: 600; transform: translate(-50%, -100%);
        animation: floatUp 1.4s ease-out forwards;
        text-shadow: 0 0 8px currentColor;
      }
      @keyframes floatUp{
        0%{ opacity:0; transform: translate(-50%, -50%);}
        20%{ opacity:1;}
        100%{ opacity:0; transform: translate(-50%, -160%);}
      }
      .toast{
        position: fixed; top: 100px; right: 24px; z-index: 1001;
        background: #181b24; color: #ff5e6b; border:1px solid #ff5e6b;
        padding: 12px 18px; border-radius: 4px;
        font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:.1em;
        opacity:0; transform: translateX(20px);
        transition: all .25s;
      }
      .toast.show{ opacity:1; transform: translateX(0);}
      
      /* portfolio panel */
      .portfolio-panel{
        position: fixed; bottom: 0; right: 24px; z-index: 60;
        width: 320px;
        background: #11131a;
        border: 1px solid rgba(238,240,243,0.16);
        border-bottom: 0;
        border-radius: 6px 6px 0 0;
        font-family: 'Inter', system-ui, sans-serif;
        max-height: 60vh;
        display: flex; flex-direction: column;
        transition: transform .3s;
      }
      .portfolio-panel.collapsed{ transform: translateY(calc(100% - 38px));}
      .pp-head{
        padding: 10px 14px; border-bottom: 1px solid rgba(238,240,243,0.07);
        display:flex; justify-content:space-between; align-items:center;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        letter-spacing: .15em; text-transform: uppercase;
        color: #eef0f3; cursor: pointer;
      }
      .pp-close{ background: transparent; border:0; color:#8b8f99; font-family:inherit;}
      .pp-body{ padding: 14px; overflow-y:auto; flex-grow: 1;}
      .pp-stats{
        display:grid; grid-template-columns: 1fr 1fr; gap: 8px;
        margin-bottom: 14px;
      }
      .pp-stats > div{
        padding: 8px 10px; background: #0a0b0e; border:1px solid rgba(238,240,243,0.07);
        border-radius: 3px;
      }
      .pp-stats span{
        display:block; font-family:'JetBrains Mono',monospace; font-size:9px;
        letter-spacing:.18em; color: #4f535d; text-transform: uppercase;
      }
      .pp-stats b{
        font-family: 'Instrument Serif', serif; font-size: 18px;
        font-weight: 400; color: #eef0f3;
      }
      .pp-section{
        font-family:'JetBrains Mono',monospace; font-size: 9px;
        letter-spacing: .2em; color: #4f535d; text-transform: uppercase;
        margin: 14px 0 8px; padding-bottom: 6px;
        border-bottom: 1px solid rgba(238,240,243,0.07);
      }
      .pp-empty{
        font-size: 12px; color: #8b8f99; padding: 8px 0;
      }
      .pp-pos{
        background: #0a0b0e; border:1px solid rgba(238,240,243,0.07);
        padding: 10px; border-radius: 3px; margin-bottom: 6px;
      }
      .pp-pos-top{ display:flex; gap: 8px; margin-bottom: 5px;}
      .pp-side{
        font-family:'JetBrains Mono',monospace; font-size: 9px;
        letter-spacing: .18em; padding: 2px 6px; border-radius: 2px;
      }
      .pp-side.yes{ color: #3ee08b; background: rgba(62,224,139,0.1);}
      .pp-side.no{ color: #ff5e6b; background: rgba(255,94,107,0.1);}
      .pp-id{
        font-family:'JetBrains Mono',monospace; font-size:10px;
        color: #8b8f99;
      }
      .pp-pos-row{
        display:flex; justify-content:space-between;
        font-family:'JetBrains Mono',monospace; font-size: 10px;
        color: #8b8f99; margin-bottom: 6px;
      }
      .pp-sell{
        width:100%; padding:6px; background: transparent;
        border:1px solid rgba(238,240,243,0.16); color: #eef0f3;
        font-family:'JetBrains Mono',monospace; font-size:10px;
        letter-spacing:.15em; border-radius:2px; cursor:pointer;
      }
      .pp-sell:hover{ background: rgba(255,255,255,0.05); border-color:#ff5e6b; color:#ff5e6b;}
      .pp-history .pp-hist{
        display:flex; gap:8px; padding:4px 0;
        font-family:'JetBrains Mono',monospace; font-size:10px; color:#8b8f99;
      }
      .pp-foot{
        padding: 10px 14px; border-top: 1px solid rgba(238,240,243,0.07);
      }
      .pp-foot button{
        width:100%; padding: 7px; background: transparent;
        border: 1px dashed rgba(238,240,243,0.16); color:#4f535d;
        font-family:'JetBrains Mono',monospace; font-size: 9px;
        letter-spacing: .18em; text-transform: uppercase; cursor:pointer;
      }
      .pp-foot button:hover{ color:#ff5e6b; border-color:#ff5e6b;}
      
      /* resolve animation */
      .resolve-overlay{
        position: fixed; inset: 0; z-index: 200;
        background: rgba(10,11,14,0.85); backdrop-filter: blur(8px);
        display:flex; align-items:center; justify-content:center;
        opacity: 0; transition: opacity .35s;
      }
      .resolve-overlay.show{ opacity: 1; }
      .resolve-box{
        background: #11131a;
        border: 1px solid rgba(238,240,243,0.16);
        padding: 36px 40px;
        text-align: center;
        font-family: 'Inter', sans-serif;
        max-width: 520px;
      }
      .rb-label{
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        letter-spacing: .22em; color: #e8c170; text-transform: uppercase;
        margin-bottom: 16px;
      }
      .rb-question{
        font-family:'Instrument Serif',serif; font-size: 22px;
        line-height: 1.3; margin-bottom: 28px; color: #eef0f3;
      }
      .rb-spinner{
        font-family:'Instrument Serif',serif; font-size: 96px;
        line-height: 1; font-weight: 400;
        margin-bottom: 16px;
        transition: transform .15s;
      }
      .rb-spinner.locked{
        animation: lockIn 0.6s ease-out;
        text-shadow: 0 0 30px currentColor;
      }
      @keyframes lockIn{
        0%{ transform: scale(0.8);}
        40%{ transform: scale(1.18);}
        100%{ transform: scale(1);}
      }
      .rb-status{
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        letter-spacing: .14em; color: #8b8f99; text-transform: lowercase;
      }

      /* cmd-k */
      .cmdk{
        position: fixed; inset: 0; z-index: 110;
        background: rgba(10,11,14,0.6); backdrop-filter: blur(6px);
        display:none; align-items: flex-start; justify-content: center;
        padding-top: 14vh;
      }
      .cmdk.open{ display: flex; }
      .cmdk-box{
        width: 600px; max-width: 92vw;
        background: #11131a; border: 1px solid rgba(238,240,243,0.16);
        border-radius: 8px; overflow: hidden;
      }
      .cmdk-box input{
        width:100%; padding: 16px 20px; background: transparent;
        border: 0; color: #eef0f3; font-family:'JetBrains Mono',monospace;
        font-size: 13px; outline: none;
        border-bottom: 1px solid rgba(238,240,243,0.07);
      }
      .cmdk-list{ max-height: 360px; overflow-y: auto;}
      .cmdk-item{
        display: grid; grid-template-columns: 130px 1fr 60px;
        gap: 14px; align-items: center;
        padding: 10px 18px; cursor: pointer;
        border-bottom: 1px solid rgba(238,240,243,0.04);
      }
      .cmdk-item.on{ background: rgba(62,224,139,0.08); }
      .cmdk-tk{
        font-family:'JetBrains Mono',monospace; font-size: 10px;
        letter-spacing: .14em; color: #8b8f99;
      }
      .cmdk-q{
        font-family:'Instrument Serif',serif; font-size: 14px;
        line-height: 1.3; color: #eef0f3;
      }
      .cmdk-px{
        font-family:'JetBrains Mono',monospace; font-size: 12px;
        text-align: right;
      }
      .cmdk-foot{
        padding: 10px 18px; font-family:'JetBrains Mono',monospace;
        font-size: 9px; letter-spacing: .18em; color: #4f535d;
        text-transform: uppercase;
        border-top: 1px solid rgba(238,240,243,0.07);
      }
      .cmdk-fab{
        position: fixed; bottom: 18px; left: 18px; z-index: 55;
        background: #181b24; border: 1px solid rgba(238,240,243,0.16);
        color: #8b8f99; padding: 8px 12px; border-radius: 4px;
        font-family:'JetBrains Mono',monospace; font-size: 10px;
        letter-spacing: .15em; cursor: pointer;
      }
      .cmdk-fab:hover{ color:#eef0f3; border-color:#eef0f3;}
      
      @media (max-width: 700px){
        .portfolio-panel{ width: calc(100vw - 24px); right: 12px; left: 12px;}
        .cmdk-fab{ display:none;}
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------------- bootstrap ---------------- */
  whenReady(()=>{
    injectStyles();
    initPrices();
    bindOrderBox();
    bindResolveButtons();
    watchOverlay();
    buildSearch();
    updatePortfolioPanel();
    updateBalance();
    setInterval(tickPrices, 2400);
    // reapply resolved markets from saved state
    Object.keys(state.resolved).forEach(id=>{
      const m = window.MARKETS.find(x=>x.id===id);
      if(m){ m.resolved=true; m.yes = state.resolved[id]==='YES'?100:0; m.no=100-m.yes;}
    });
  });
})();
