const fs = require('fs');
const file = 'c:/Users/Guntass Kaur/New folder (19)/aura.html';
let html = fs.readFileSync(file, 'utf8');

// 1. showScreen
html = html.replace(
  /function showScreen\(id\) \{[\s\S]*?(?=\n\/\/ ==================== LANDING ====================)/,
`function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('visible');
    setTimeout(() => {
      if (s.id !== id) s.classList.remove('active');
    }, 320);
  });
  setTimeout(() => {
    const t = document.getElementById(id);
    if (!t) return;
    t.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      t.classList.add('visible');
    }));
    if (id === 'screen-citizen') {
      setTimeout(() => {
        if (!window.citizenMapReady) {
          buildCitizenMap();
          window.citizenMapReady = true;
        }
        if (!document.getElementById('triage-chat').hasChildNodes()) {
          triageMsg('aura', '[AURA] Ready. Enter your location above to begin navigation.');
        }
      }, 100);
      setTimeout(() => addAlert('⚠ Flash flood expanding NW — avoid low ground', 'warn'), 2000);
      setTimeout(() => addAlert('✓ Gate 3 relief camp open — 340/500 capacity', 'ok'), 6000);
    }
    if (id === 'screen-command') {
      setTimeout(() => {
        if (!window.commandMapReady) {
          buildCommandMap();
          window.commandMapReady = true;
        }
        typeLines([
          {t:'[BOOT]  AURA Command v2.0 — online', c:'#00d4ff'},
          {t:'[BOOT]  Sensor mesh: 8,420 nodes connected', c:'#00d4ff'},
          {t:'[BOOT]  AI prediction engine: ONLINE', c:'#00ff88'},
          {t:'[OK]    Type STATUS or press F1 for full report', c:'rgba(255,255,255,0.40)'}
        ]);
      }, 150);
      setTimeout(() => execCmd('STATUS'), 3000);
    }
    if (id === 'screen-vitals') {
      setTimeout(() => {
        const orb = document.getElementById('survival-orb');
        if (orb && !orb.hasChildNodes()) buildOrb();
        const wr = document.getElementById('worker-rows');
        if (wr && !wr.hasChildNodes()) buildWorkerRows();
      }, 100);
    }
  }, 250);
}
`
);

// 2. CSS
html = html.replace(
  /\.screen \{\s*position: fixed; inset: 0;\s*display: none; flex-direction: column;\s*opacity: 0; transition: opacity 350ms ease;\s*\}/,
`.screen {
  position: fixed;
  inset: 0;
  display: none;
  flex-direction: column;
  opacity: 0;
  transition: opacity 350ms ease;
  background: #04080c;
}`
);

// 3. CITIZEN MAP WRAP
html = html.replace(
  /<div id="citizen-map-wrap" style="flex:1;position:relative;\s*overflow:hidden;/,
  '<div id="citizen-map-wrap" style="flex:1; position:relative; overflow:hidden; min-height:0;'
);
html = html.replace(
  /<svg id="citizen-map-svg" style="position:absolute;inset:0;\s*width:100%;height:100%;"><\/svg>/,
  '<svg id="citizen-map-svg" style="position:absolute; inset:0; width:100%; height:100%;"></svg>'
);
html = html.replace(
  /const W = wrap\.offsetWidth \|\| 700;\s*const H = wrap\.offsetHeight \|\| 500;/,
  'const W = wrap.offsetWidth || window.innerWidth * 0.75;\n  const H = wrap.offsetHeight || window.innerHeight - 80;'
);

// 4. COMMAND MAP WRAP
html = html.replace(
  /<div id="cmd-map-wrap" style="flex:1;position:relative;\s*overflow:hidden;/,
  '<div id="cmd-map-wrap" style="flex:1; position:relative; overflow:hidden; min-height:0;'
);
html = html.replace(
  /const W = wrap\.offsetWidth \|\| 750;\s*const H = wrap\.offsetHeight \|\| 480;/,
  'const W = wrap.offsetWidth || window.innerWidth * 0.75;\n  const H = wrap.offsetHeight || window.innerHeight - 80;'
);

// 5. VITALS GRID
html = html.replace(
  /<div style="flex:1;display:grid;\s*grid-template-columns:1fr 1fr;\s*grid-template-rows:1fr 1fr;\s*gap:1px;overflow:hidden;\s*background:rgba\(255,140,0,0\.05\);">/,
  '<div style="flex:1; display:grid; grid-template-columns:1fr 1fr;\n    grid-template-rows:1fr 1fr; gap:1px; overflow:hidden;\n    background:rgba(255,140,0,0.05); min-height:0;">'
);

// 6. LIVE SAFETY SCORE
html = html.replace(
  /<div style="font-size:8px;letter-spacing:0\.14em;\s*color:rgba\(255,255,255,0\.30\);margin-top:1px;">\s*ACTIVE RESCUES\s*<\/div>\s*<\/div>/,
  `<div style="font-size:8px;letter-spacing:0.14em;
          color:rgba(255,255,255,0.30);margin-top:1px;">
          ACTIVE RESCUES
        </div>
      </div>
      <div style="text-align:center;">
        <div id="m-safety" style="font-size:18px;font-weight:500;color:#00ff88;">94</div>
        <div style="font-size:8px;letter-spacing:0.14em;color:rgba(255,255,255,0.30);margin-top:1px;">SAFETY SCORE</div>
      </div>`
);
html = html.replace(
  /const setC=\(id,col\)=>{const e=document\.getElementById\(id\);if\(e\)e\.style\.color=col;};/,
  `const setC=(id,col)=>{const e=document.getElementById(id);if(e)e.style.color=col;};

  const ss = Math.round(100 - (SENSOR.density*0.25) - ((21-SENSOR.o2)*6));
  const se = document.getElementById('m-safety');
  if(se) {
    se.textContent = Math.max(40,Math.min(100,ss));
    se.style.color = ss < 60 ? '#ff3a3a' : ss < 75 ? '#ffaa00' : '#00ff88';
  }`
);

// 7. REUNION AI
html = html.replace(
  /<button onclick="showScreen\('screen-vitals'\)"[\s\S]*?♥ CHECK MY VITALS\s*<\/button>/,
  `<button onclick="showScreen('screen-vitals')"
            style="width:100%;padding:11px;font-family:monospace;
            font-size:11px;letter-spacing:0.13em;cursor:pointer;
            border:1px solid rgba(255,140,0,0.32);
            color:#ff9040;background:rgba(255,140,0,0.04);
            border-radius:2px;">
            ♥ CHECK MY VITALS
          </button>
          <button onclick="showReunion()"
            style="width:100%;padding:11px;font-family:monospace;
            font-size:11px;letter-spacing:0.13em;cursor:pointer;
            border:1px solid rgba(255,80,200,0.35);
            color:#ff80cc;background:rgba(255,80,200,0.04);
            border-radius:2px;">
            🔍 FIND MISSING PERSON
          </button>`
);
html = html.replace(
  /<div id="route-info" style="display:none;margin-top:10px;\s*padding:8px 10px;border-radius:2px;font-size:10px;\s*line-height:1\.7;"><\/div>\s*<\/div>/,
  `<div id="route-info" style="display:none;margin-top:10px;
          padding:8px 10px;border-radius:2px;font-size:10px;
          line-height:1.7;"></div>
      </div>
      <div id="reunion-panel" style="display:none;padding:14px;
        border-bottom:1px solid rgba(0,212,255,0.07);">
        <div style="font-size:9px;letter-spacing:0.20em;color:rgba(255,80,200,0.55);
          margin-bottom:10px;">REUNION AI — FIND MISSING</div>
        <input class="inp" id="r-name" placeholder="Name" style="margin-bottom:6px;">
        <input class="inp" id="r-age" placeholder="Age" style="margin-bottom:6px;">
        <input class="inp" id="r-loc" placeholder="Last seen location" style="margin-bottom:6px;">
        <button class="btn" style="width:100%;border-color:rgba(255,80,200,0.40);
          color:#ff80cc;" onclick="runReunion()">SEARCH WITH AI</button>
        <div id="reunion-result" style="margin-top:8px;font-size:10px;
          color:rgba(255,255,255,0.45);display:none;"></div>
      </div>`
);
html = html.replace(
  /function updateDisplays\(\) \{/,
  `function showReunion() {
  const rp = document.getElementById('reunion-panel');
  if(rp) rp.style.display = rp.style.display==='none'?'block':'none';
}

function runReunion() {
  const name = document.getElementById('r-name').value.trim()||'Unknown';
  const rr = document.getElementById('reunion-result');
  if(!rr) return;
  rr.style.display='block';
  rr.innerHTML='<span style="color:#00d4ff">[REUNION AI] Scanning 1,247 records...</span>';
  setTimeout(()=>{
    rr.innerHTML=\`
      <div style="border-left:3px solid #ffaa00;padding:6px 8px;
        background:rgba(255,170,0,0.05);margin-bottom:6px;">
        <div style="color:#ffaa00;font-size:11px;font-weight:500;">
          POSSIBLE MATCH — 78% confidence</div>
        <div style="color:rgba(255,255,255,0.50);margin-top:3px;">
          \${name} · Safe South collection point<br>
          Physical description: partial match
        </div>
      </div>
      <div style="border-left:3px solid rgba(255,255,255,0.15);
        padding:6px 8px;background:rgba(255,255,255,0.02);">
        <div style="color:rgba(255,255,255,0.40);font-size:10px;">
          LOW MATCH — 29% confidence · Fire East medical point
        </div>
      </div>\`;
    triageMsg('aura','[REUNION AI] Search complete. 2 potential matches found for '+name+'.');
  }, 1800);
}

function updateDisplays() {`
);

// 8. PREDICTION SLIDER
html = html.replace(
  /<div id="threat-label" style="font-size:9px;color:var\(--amber\);\s*margin-top:4px;letter-spacing:0\.12em;">ELEVATED<\/div>\s*<\/div>/,
  `<div id="threat-label" style="font-size:9px;color:var(--amber);
          margin-top:4px;letter-spacing:0.12em;">ELEVATED</div>
      </div>
      <div class="panel" style="position:absolute;bottom:40px;left:12px;
        padding:10px 14px;z-index:10;width:200px;">
        <div style="font-size:9px;letter-spacing:0.16em;
          color:rgba(0,212,255,0.45);margin-bottom:6px;">
          CROWD PREDICTION
        </div>
        <input type="range" id="pred-slider" min="0" max="30" value="0"
          style="width:100%;accent-color:#00d4ff;"
          oninput="updatePrediction(this.value)">
        <div id="pred-label" style="font-size:9px;color:rgba(0,212,255,0.55);
          margin-top:4px;text-align:center;">+0 MIN (LIVE)</div>
      </div>`
);
html = html.replace(
  /function updateDisplays\(\) \{/,
  `function updatePrediction(val) {
  const el = document.getElementById('pred-label');
  if(el) el.textContent = val==0 ? '+0 MIN (LIVE)' : '+'+val+' MIN (PREDICTED)';
  if(val>0) {
    addCmdLine('[PRED]  +'+val+'min: Flood NW → '+(Math.round(SENSOR.density+val*0.8))+'% density', '#ffaa00');
    addCmdLine('[PRED]  Gate 4 will reach 95% in '+(30-val)+' min', 'rgba(255,255,255,0.45)');
  }
}

function updateDisplays() {`
);

// 9. MESH NETWORK
html = html.replace(
  /<button class="btn" style="padding:7px 10px;"\s*onclick="sendTriageBtn\(\)">SEND<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<button class="btn" style="padding:7px 10px;"
            onclick="sendTriageBtn()">SEND</button>
        </div>
      </div>
      <div class="panel" style="margin:0 0 0 0;padding:10px 14px;
        border-top:1px solid rgba(0,212,255,0.07);flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:8px;height:8px;border-radius:50%;
            background:#00ff88;flex-shrink:0;
            box-shadow:0 0 8px rgba(0,255,136,0.6);
            animation:pulse 1.5s infinite;"></div>
          <div>
            <div style="font-size:10px;color:#00ff88;
              letter-spacing:0.10em;">MESH NETWORK ACTIVE</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.35);
              margin-top:1px;">8,420 nodes · OFFLINE RESILIENT</div>
          </div>
        </div>
      </div>
    </div>`
);

// 10. DRONE VIEW
html = html.replace(
  /<!-- Right buttons -->\s*<div style="display:flex;gap:8px;align-items:center;">/,
  `<!-- Right buttons -->
    <div style="display:flex;gap:8px;align-items:center;">
      <button class="btn" id="drone-btn" style="font-size:10px;padding:6px 12px;"
        onclick="toggleDrone()">DRONE VIEW</button>`
);
html = html.replace(
  /function updateDisplays\(\) \{/,
  `function toggleDrone() {
  const wrap = document.getElementById('cmd-map-wrap');
  const btn = document.getElementById('drone-btn');
  if(!wrap) return;
  if(wrap.dataset.drone==='1') {
    wrap.style.transform = '';
    wrap.style.transition = '';
    wrap.dataset.drone = '0';
    if(btn) btn.style.color = '';
  } else {
    wrap.style.transform = 'perspective(900px) rotateX(22deg) scale(0.88)';
    wrap.style.transition = 'transform 900ms ease';
    wrap.style.transformOrigin = '50% 50%';
    wrap.dataset.drone = '1';
    if(btn) btn.style.color = '#ffaa00';
    addCmdLine('[DRONE] Aerial perspective activated — 3D view engaged', '#ffaa00');
  }
}

function updateDisplays() {`
);

fs.writeFileSync(file, html);
