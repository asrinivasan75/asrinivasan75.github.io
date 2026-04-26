/* ============================================================
   THE FOREST — candlestick landscape
   - 6 LABELED candles = the navigable sections (one per category)
   - ~30 ambient candles = atmosphere, smaller, dim
   - drag to orbit, scroll to dolly, hover labeled → highlight + card,
     click → contract overlay
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MARKETS = window.MARKETS || [];

/* ---------------- pick the 6 hero candles ---------------- */
// One representative per category, biggest signal first
function pickHero(category, prefer){
  const list = MARKETS.filter(m=>m.category===category);
  if(prefer){
    const found = list.find(m=>m.id===prefer);
    if(found) return found;
  }
  return list[0];
}
const HEROES = [
  { m: pickHero('career', 'AS-WORK-NAYYA-2025'),  label:'WORK',  color: 0x3ee08b },
  { m: pickHero('builds', 'AS-PROJ-EVENTEDGE'),   label:'BUILD', color: 0x3ee08b },
  { m: pickHero('skills', 'AS-SKILL-PY'),         label:'SKILL', color: 0x3ee08b },
  { m: pickHero('hobby',  'AS-CHESS-2300'),       label:'HOBBY', color: 0x3ee08b },
  { m: pickHero('future', 'AS-FUT-INTERN-2026'),  label:'OPEN',  color: 0xe8c170 },
  // Education / contact stand-in
  { m: { id:'AS-EDU-UPENN', cat:'Education', summary:'UPenn · CS + Math', question:'Aadithya is a CS+Math student at UPenn.', yes:96, no:4, vol:'$0.4k', traders:11, resolved:true,
         category:'edu', detail:{ desc:'University of Pennsylvania · double major in Computer Science and Mathematics. Coursework: Algorithms (CIS 320), Big Data Analytics (CIS 545), Machine Learning (CIS 521), Discrete Math, HCI.',
         bullets:[
           'CS + Math · UPenn (current).',
           'Coursework: Algorithms, ML, Big Data, HCI, Discrete Math.',
           'Active in WITG (quant track), Penn Poker Club, PUMS.'
         ]}},
    label:'EDU', color: 0x3ee08b }
];

/* ---------------- scene ---------------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x06070a, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070a, 0.024);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 200);
camera.position.set(0, 5, 32);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 14;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.62;
controls.minPolarAngle = Math.PI * 0.32;
controls.target.set(0, 2, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;

/* ---------------- lights ---------------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.18));
const key = new THREE.DirectionalLight(0xfff8ee, 0.6);
key.position.set(8, 16, 12);
scene.add(key);
const fill = new THREE.PointLight(0x88aaff, 0.35, 60);
fill.position.set(-14, 4, -12);
scene.add(fill);
const warm = new THREE.PointLight(0xe8c170, 0.3, 40);
warm.position.set(0, 12, 0);
scene.add(warm);

/* ---------------- ground (volumetric fog floor) ---------------- */
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(80, 64),
  new THREE.MeshStandardMaterial({color:0x0a0c10, roughness:0.95, metalness:0})
);
floor.rotation.x = -Math.PI/2;
floor.position.y = 0;
scene.add(floor);

const grid = new THREE.GridHelper(80, 60, 0x1a1d24, 0x14171d);
grid.position.y = 0.02;
grid.material.transparent = true;
grid.material.opacity = 0.4;
scene.add(grid);

/* ---------------- build candle ---------------- */
function buildCandle({position, height, bodyHeight, isUp, scale=1, isHero=false, color=null}){
  const group = new THREE.Group();

  // wick
  const wickGeo = new THREE.CylinderGeometry(0.04*scale, 0.04*scale, height, 6);
  const wickMat = new THREE.MeshStandardMaterial({
    color: 0xc8ccd6, transparent: true, opacity: isHero ? 0.85 : 0.35,
    emissive: 0x666666, emissiveIntensity: isHero ? 0.2 : 0
  });
  const wick = new THREE.Mesh(wickGeo, wickMat);
  wick.position.y = height/2;
  group.add(wick);

  // body
  const bodyColor = color !== null ? color : (isUp ? 0x3ee08b : 0xff5e6b);
  const bodyGeo = new THREE.BoxGeometry(0.55*scale, bodyHeight, 0.55*scale);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive: bodyColor,
    emissiveIntensity: isHero ? 0.55 : 0.18,
    transparent: true,
    opacity: isHero ? 0.95 : 0.65,
    metalness: 0.2,
    roughness: 0.45
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  // body centered around middle of wick
  const bodyCenter = isUp ? height*0.55 : height*0.4;
  body.position.y = bodyCenter;
  group.add(body);

  // base glow (only heroes)
  if(isHero){
    const glowGeo = new THREE.PlaneGeometry(2.5*scale, 2.5*scale);
    const glowMat = new THREE.MeshBasicMaterial({
      color: bodyColor, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI/2;
    glow.position.y = 0.05;
    group.add(glow);
    group.userData.glow = glow;
    group.userData.glowMat = glowMat;
  }

  group.position.copy(position);
  group.userData.body = body;
  group.userData.bodyMat = bodyMat;
  group.userData.wick = wick;
  group.userData.wickMat = wickMat;
  group.userData.baseEmissive = bodyMat.emissiveIntensity;
  group.userData.baseOpacity = bodyMat.opacity;
  group.userData.isHero = isHero;
  group.userData.color = bodyColor;
  return group;
}

/* ---------------- place hero candles in a hexagon ---------------- */
const heroGroups = [];
const radius = 8;
HEROES.forEach((h, i)=>{
  const angle = (i/HEROES.length) * Math.PI * 2 - Math.PI/2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const yes = h.m.yes;
  const isUp = yes >= 50;
  const heightTotal = 4 + (yes/100) * 4; // 4 to 8
  const bodyH = heightTotal * 0.55;
  const candle = buildCandle({
    position: new THREE.Vector3(x, 0, z),
    height: heightTotal,
    bodyHeight: bodyH,
    isUp,
    scale: 1.7,
    isHero: true,
    color: h.color
  });
  candle.userData.hero = h;
  scene.add(candle);
  heroGroups.push(candle);

  // floating label sprite
  const labelSprite = makeLabel(h.label, h.color);
  labelSprite.position.set(x, heightTotal + 1.5, z);
  scene.add(labelSprite);
});

/* ---------------- ambient candles (atmospheric) ---------------- */
const ambientGroups = [];
const N_AMBIENT = 38;
for(let i=0;i<N_AMBIENT;i++){
  const r = 14 + Math.random()*22;
  const theta = Math.random() * Math.PI * 2;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;
  // skip near hero positions
  let tooClose = false;
  for(const h of heroGroups){
    if(h.position.distanceTo(new THREE.Vector3(x,0,z)) < 4){ tooClose = true; break; }
  }
  if(tooClose){ i--; continue; }

  const isUp = Math.random() > 0.4;
  const h = 1.5 + Math.random()*4;
  const bh = h * (0.4 + Math.random()*0.3);
  const candle = buildCandle({
    position: new THREE.Vector3(x, 0, z),
    height: h, bodyHeight: bh, isUp,
    scale: 0.7 + Math.random()*0.5,
    isHero: false
  });
  // jiggle starting Y so they look like they're at varying ground levels (illusion of forest depth)
  candle.position.y = -Math.random()*0.3;
  scene.add(candle);
  ambientGroups.push(candle);
}

/* ---------------- text labels ---------------- */
function makeLabel(text, color){
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  // background pill
  ctx.fillStyle = 'rgba(14,17,23,0.0)';
  ctx.fillRect(0,0,c.width,c.height);
  // text
  ctx.fillStyle = '#' + color.toString(16).padStart(6,'0');
  ctx.font = '600 30px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#' + color.toString(16).padStart(6,'0');
  ctx.shadowBlur = 14;
  ctx.fillText(text, c.width/2, c.height/2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(4.5, 1.1, 1);
  return sp;
}

/* ---------------- particle drift (fireflies / volumetric) ---------------- */
{
  const N = 350;
  const positions = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    positions[i*3]   = (Math.random()-0.5)*60;
    positions[i*3+1] = Math.random()*8;
    positions[i*3+2] = (Math.random()-0.5)*60;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const m = new THREE.PointsMaterial({
    size: 0.07, color: 0xe8c170,
    transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  scene.userData.fireflies = pts;
}

/* ---------------- raycasting ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;
const labelCard = document.getElementById('labelCard');

function setHover(group){
  if(group === hovered) return;
  if(hovered){
    const u = hovered.userData;
    u.bodyMat.emissiveIntensity = u.baseEmissive;
    u.bodyMat.opacity = u.baseOpacity;
    if(u.glowMat) u.glowMat.opacity = 0.18;
  }
  hovered = group;
  if(hovered){
    const u = hovered.userData;
    u.bodyMat.emissiveIntensity = 1.2;
    u.bodyMat.opacity = 1;
    if(u.glowMat) u.glowMat.opacity = 0.45;
    // populate card
    const m = u.hero.m;
    labelCard.classList.add('show');
    labelCard.querySelector('.t-id').textContent = m.id;
    labelCard.querySelector('.t-cat').textContent = m.cat || u.hero.label;
    labelCard.querySelector('.name').textContent = m.summary;
    const o = labelCard.querySelectorAll('.ohlc b');
    o[0].textContent = (m.yes - 8) + '¢';
    o[1].textContent = m.yes + '¢';
    o[2].textContent = (m.yes - 14) + '¢';
    o[3].textContent = m.yes + '¢';
    document.body.style.cursor = 'pointer';
    controls.autoRotate = false;
  } else {
    labelCard.classList.remove('show');
    document.body.style.cursor = '';
    controls.autoRotate = true;
  }
}

window.addEventListener('mousemove',(e)=>{
  pointer.x =  (e.clientX/window.innerWidth)*2 - 1;
  pointer.y = -(e.clientY/window.innerHeight)*2 + 1;
  labelCard.style.left = e.clientX + 'px';
  labelCard.style.top  = e.clientY + 'px';
});

window.addEventListener('click',()=>{
  if(hovered) openContract(hovered.userData.hero.m);
});

/* ---------------- contract overlay ---------------- */
const overlay = document.getElementById('overlay');
const contract = document.getElementById('contract');
function openContract(m){
  controls.autoRotate = false;
  const tranche = m.detail?.role ? `
    <div class="body-section"><h3>Engagement</h3>
      <div class="tranche">
        <div class="when"><b>${m.detail.when.start} — ${m.detail.when.end}</b>${m.detail.when.loc}</div>
        <div><div class="role">${m.detail.role}</div>
          <ul>${m.detail.bullets.map(b=>`<li>${b}</li>`).join('')}</ul></div>
      </div></div>` : `
    <div class="body-section"><h3>What this candle represents</h3>
      <p>${m.detail?.desc || m.summary}</p>
      ${m.detail?.bullets ? `<ul>${m.detail.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>` : ''}</div>`;
  const stack = m.detail?.stack ? `
    <div class="body-section"><h3>Stack</h3>
      <div class="stack">${m.detail.stack.map(s=>`<span>${s}</span>`).join('')}</div></div>` : '';
  const link = m.detail?.url ? `<div class="body-section"><a class="btn-pri" href="${m.detail.url}" target="_blank" rel="noopener">View Project ↗</a></div>` : '';
  contract.innerHTML = `
    <div class="contract-head">
      <div>
        <div class="ticker-big">${m.id} · ${(m.cat||'').toUpperCase()}</div>
        <h2>${m.question.replace(/\b(Aadithya)\b/g,'<em>$1</em>')}</h2>
      </div>
      <button class="close" id="closeOverlay">Close · esc</button>
    </div>
    <div class="contract-body">
      <div class="price-banner">
        <div><div class="lbl">CLOSE</div><div class="v ${m.yes>=50?'up':'dn'}">${m.yes}¢</div><div class="delta">last print</div></div>
        <div><div class="lbl">HIGH</div><div class="v" style="color:var(--ink)">${m.yes}¢</div><div class="delta">session</div></div>
        <div><div class="lbl">LOW</div><div class="v" style="color:var(--ink)">${Math.max(0,m.yes-14)}¢</div><div class="delta">session</div></div>
        <div><div class="lbl">VOLUME</div><div class="v" style="color:var(--gold)">${m.vol}</div><div class="delta">${m.traders||0} prints</div></div>
      </div>
      ${tranche}${stack}${link}
    </div>`;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('closeOverlay').addEventListener('click', closeContract);
}
function closeContract(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  controls.autoRotate = true;
}
overlay.addEventListener('click',(e)=>{ if(e.target===overlay) closeContract(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeContract(); });

/* ---------------- ticker tape ---------------- */
function buildTape(){
  const items = MARKETS.slice(0,16).map(m=>{
    const dir = m.yes>=70?'up':(m.yes<=40?'dn':'');
    const arrow = m.yes>=70?'▲':(m.yes<=40?'▼':'—');
    return `<span><b>${m.id.replace('AS-','').slice(0,12)}</b><span class="${dir}">${arrow} ${m.yes}¢</span></span>`;
  }).join('');
  document.getElementById('tapeTrack').innerHTML = items + items;
}
buildTape();

/* ---------------- animation ---------------- */
const clock = new THREE.Clock();
function animate(){
  const dt = clock.getDelta();
  const t = clock.getElapsedTime();

  // raycast against hero candle bodies
  raycaster.setFromCamera(pointer, camera);
  const meshes = heroGroups.map(g=>g.userData.body);
  const intersects = raycaster.intersectObjects(meshes);
  let next = null;
  if(intersects.length){
    next = heroGroups.find(g=> g.userData.body === intersects[0].object);
  }
  setHover(next);

  // breathe heroes
  heroGroups.forEach((g,i)=>{
    const u = g.userData;
    if(g === hovered) return;
    const breathe = Math.sin(t*0.8 + i) * 0.1 + 1;
    u.bodyMat.emissiveIntensity = u.baseEmissive * breathe;
  });
  // ambient candles tiny sway
  ambientGroups.forEach((g,i)=>{
    g.rotation.z = Math.sin(t*0.5 + i*0.7) * 0.005;
  });
  // fireflies
  if(scene.userData.fireflies){
    const arr = scene.userData.fireflies.geometry.attributes.position.array;
    for(let i=0;i<arr.length;i+=3){
      arr[i+1] += Math.sin(t*0.6 + i) * 0.005;
      if(arr[i+1] > 9) arr[i+1] = 0;
    }
    scene.userData.fireflies.geometry.attributes.position.needsUpdate = true;
    scene.userData.fireflies.material.opacity = 0.3 + Math.sin(t*1.6)*0.18;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
setTimeout(()=>{
  document.getElementById('loader').classList.add('out');
  setTimeout(()=> document.getElementById('loader').remove(), 800);
  document.getElementById('intro').classList.add('show');
  setTimeout(()=> document.getElementById('intro').classList.remove('show'), 5500);
}, 1200);
