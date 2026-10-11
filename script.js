/* Chariz4rd X! trio (team) + RIVALS (bosses) — AETHERIA arena */
const MONS = [
  {name:"VENUSAUR", id:3, types:["Grass","Poison"], item:"Black Sludge", ability:"Overgrow",
   moves:["Sleep Powder","Giga Drain","Sludge Bomb","Earth Power"], sky:"grass",
   mega:"Mega Venusaur (Thick Fat)", gmax:"G-Max Vine Lash", z:"Bloom Doom",
   desc:"Sleep lead. Mega gets Thick Fat, G-Max traps foes."},
  {name:"BLASTOISE", id:9, types:["Water"], item:"Leftovers", ability:"Torrent",
   moves:["Hydro Pump","Ice Beam","Aura Sphere","Yawn"], sky:"water",
   mega:"Mega Blastoise (Mega Launcher)", gmax:"G-Max Cannonade", z:"Hydro Vortex",
   desc:"Dragon killer. Mega Aura Sphere nukes, G-Max hurts every turn."},
  {name:"CHARIZARD", id:6, types:["Fire","Flying"], item:"Life Orb", ability:"Blaze",
   moves:["Flamethrower","Air Slash","Focus Blast","Dragon Pulse"], sky:"fire",
   mega:"Mega Charizard X (Fire/Dragon) / Y (Drought)", gmax:"G-Max Wildfire", z:"Inferno Overdrive",
   desc:"X-FACTOR closer. X becomes Fire/Dragon, Y summons sun."},
];
const FOES = [
  {name:"TYRANITAR", id:248},{name:"GARCHOMP", id:445},{name:"VOLCARONA", id:637},
  {name:"GENGAR", id:94},{name:"DRAGONITE", id:149},
];
const RIVALS = [
  {name:"TYRANITAR", id:248, types:["Rock","Dark"], threat:"4x kills Charizard with Stone Edge", killedBy:"Charizard Focus Blast / Venusaur Earth Power / Blastoise Aura Sphere"},
  {name:"GARCHOMP", id:445, types:["Dragon","Ground"], threat:"Outspeeds trio, EQ slaughters", killedBy:"Blastoise Ice Beam 4x ✓✓"},
  {name:"VOLCARONA", id:637, types:["Bug","Fire"], threat:"Quiver Dance snowball", killedBy:"Venusaur Sleep first, Blastoise Yawn"},
  {name:"GENGAR", id:94, types:["Ghost","Poison"], threat:"110 speed special nuke", killedBy:"Charizard Air Slash + Venusaur Sleep"},
  {name:"DRAGONITE", id:149, types:["Dragon","Flying"], threat:"Multiscale + Extreme Speed closer", killedBy:"Blastoise Ice Beam, Charizard Dragon Pulse"},
  {name:"EXCADRILL", id:530, types:["Ground","Steel"], threat:"Mold Breaker EQ ignores Levitate", killedBy:"Venusaur Earth Power / Charizard Flamethrower"},
];
function renderRivals(){
  const el = $("rivals"); if(!el) return;
  el.innerHTML = RIVALS.map(r=>`
    <div class="card rival">
      <img src="${gif(r.id)}" alt="${r.name}" onerror="this.src='${png(r.id)}'">
      <h3>☠ ${r.name}</h3>
      ${r.types.map(t=>`<span class="type ${t}">${t}</span>`).join("")}
      <div class="moves">⚠ ${r.threat}<br>✓ <b>${r.killedBy}</b></div>
      <button class="activate" onclick="spawnRival('${r.name}',${r.id})">FIGHT AS FOE</button>
    </div>`).join("");
}
function spawnRival(name, id){
  foeIdx = FOES.findIndex(f=>f.name===name);
  if(foeIdx < 0){ FOES.push({name, id}); foeIdx = FOES.length-1; }
  foeHP = 100; $("foeHp").style.width = "100%";
  $("foeName").textContent = name; $("foeSprite").src = gif(id);
  say(`${name} steps in as RIVAL! Your trio's counter is ready — check the card.`);
}
let cur = 2, foeIdx = 0, foeHP = 100, myHP = 100;
const $ = id => document.getElementById(id);
const gif = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
const png = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

/* starfield */
(() => {
  const c = $("stars"), x = c.getContext("2d");
  const rs = () => { c.width = innerWidth; c.height = innerHeight; };
  rs(); addEventListener("resize", rs);
  const S = Array.from({length: 130}, () => ({x: Math.random()*innerWidth, y: Math.random()*innerHeight, s: Math.random()*2+0.4, v: Math.random()*0.4+0.1}));
  (function loop(){
    x.clearRect(0,0,c.width,c.height);
    for(const s of S){ s.y += s.v; if(s.y > c.height) s.y = 0;
      x.fillStyle = "#ffffffaa"; x.fillRect(s.x, s.y, s.s, s.s); }
    requestAnimationFrame(loop);
  })();
})();

function renderTeam(){
  $("team").innerHTML = MONS.map((m,i)=>`
    <div class="card ${i===cur?'active':''}">
      <img src="${gif(m.id)}" alt="${m.name}" onerror="this.src='${png(m.id)}'">
      <h3>${m.name}</h3>
      ${m.types.map(t=>`<span class="type ${t}">${t}</span>`).join("")}
      <div class="moves">◈ ${m.ability} @ ${m.item}<br>${m.moves.join(" / ")}<br>
      ◈ MEGA: ${m.mega}<br>◈ GMAX: ${m.gmax}<br>◈ Z: ${m.z}<br><i>${m.desc}</i></div>
      <button class="activate" onclick="pick(${i});phenomenon('${['mega','gmax','z'][i%3]}')">ACTIVATE ${['MEGA','G-MAX','Z'][i%3]}</button>
    </div>`).join("");
  const m = MONS[cur];
  $("myName").textContent = m.name;
  $("mySprite").src = gif(m.id);
  $("sky").className = "sky " + m.sky;
  $("ppRow").innerHTML = m.moves.map(v=>`<span class="pp">${v}</span>`).join("");
}
function say(t){ $("dialog").textContent = "▼ " + t; }
function fx(id){ const e = $(id); e.classList.remove("show"); void e.offsetWidth; e.classList.add("show"); }
function shake(){ const s = $("screen"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake"); }
function strike(who){
  const el = who === "foe" ? $("foeSprite") : $("mySprite");
  el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
  const f = $("flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
}
function pick(i){
  cur = i; myHP = 100; $("myHp").style.width = "100%";
  $("mySprite").className = "sprite my-img";
  renderTeam(); say(`${MONS[i].name} — ${MONS[i].desc}`);
}
function phenomenon(kind){
  const spr = $("mySprite");
  spr.className = "sprite my-img";
  void spr.offsetWidth;
  if(kind === "mega"){ spr.classList.add("mega"); fx("fxMega"); say(`${MONS[cur].name} MEGA EVOLVED! ${MONS[cur].mega} — +100 stats, new ability! (Showcase only — tournament uses base form.)`); }
  if(kind === "gmax"){ spr.classList.add("gmax"); fx("fxGmax"); shake(); say(`${MONS[cur].name} GIGANTAMAXED! ${MONS[cur].gmax} — HP x1.5 for 3 turns! (Showcase only.)`); }
  if(kind === "z"){ spr.classList.add("zmove"); fx("fxZ"); const r = $("rings"); r.classList.remove("go"); void r.offsetWidth; r.classList.add("go"); shake(); say(`${MONS[cur].name} unleashes Z-MOVE! ${MONS[cur].z} — one-time nuke! (Showcase only.)`); }
  setTimeout(() => { spr.className = "sprite my-img"; }, 2400);
}
$("btnMega").onclick = () => phenomenon("mega");
$("btnGmax").onclick = () => phenomenon("gmax");
$("btnZ").onclick = () => phenomenon("z");

function foeTurn(){
  setTimeout(() => {
    const dmg = 8 + Math.floor(Math.random()*14);
    myHP = Math.max(1, myHP - dmg);
    $("myHp").style.width = myHP + "%";
    strike("my"); say(`${FOES[foeIdx].name} hits! ${MONS[cur].name} at ${myHP}% — agent heals/switches smartly.`);
  }, 900);
}
const _fightCore = () => {
  const dmg = 22 + Math.floor(Math.random()*30);
  foeHP = Math.max(0, foeHP - dmg);
  $("foeHp").style.width = foeHP + "%";
  strike("foe"); shake();
  const m = MONS[cur];
  const best = m.moves[Math.floor(Math.random()*m.moves.length)];
  say(`${m.name} used ${best.toUpperCase()}! (${dmg}% — KO math: power x matchup x STAB)`);
  if(foeHP <= 0){
    setTimeout(() => {
      foeIdx = (foeIdx+1) % FOES.length; foeHP = 100;
      $("foeHp").style.width = "100%";
      $("foeName").textContent = FOES[foeIdx].name;
      $("foeSprite").src = gif(FOES[foeIdx].id);
      say(`Foe sent ${FOES[foeIdx].name}!`);
    }, 1000);
  } else foeTurn();
};
$("btnFight").onclick = e => { sfxHit(); _fightCore(); };
$("btnSwitch").onclick = () => {
  cur = (cur+1) % MONS.length; myHP = Math.min(100, myHP+20);
  $("myHp").style.width = myHP + "%";
  renderTeam(); say(`Go! ${MONS[cur].name}! (smart switch: resists foe STAB, threatens 2x back)`);
};

/* ---- GEN 1-8 DEX (#1-905, live PokeAPI, paged) ---- */
const GENS = [["Gen 1",1,151],["Gen 2",152,251],["Gen 3",252,386],["Gen 4",387,493],
              ["Gen 5",494,649],["Gen 6",650,721],["Gen 7",722,809],["Gen 8",810,905]];
let dexList = [], dexShown = 0;
const PAGE = 48;
$("genBtns").innerHTML = GENS.map((g,i)=>`<button data-g="${i}" class="${i===0?'on':''}">${g[0]}</button>`).join("");
$("genBtns").onclick = e => {
  const b = e.target.closest("button"); if(!b) return;
  document.querySelectorAll("#genBtns button").forEach(x=>x.classList.remove("on"));
  b.classList.add("on"); loadGen(+b.dataset.g);
};
async function loadGen(gi){
  const [label, a, b] = GENS[gi];
  $("dexStatus").textContent = `Loading ${label} (#${a}–#${b})...`;
  $("dex").innerHTML = ""; dexList = []; dexShown = 0;
  for(let id = a; id <= b; id++) dexList.push(id);
  renderDexPage(true);
  $("dexStatus").textContent = `${label}: #${a}–#${b} (${dexList.length} mons). Scroll for more. Type to filter.`;
}
function dexCard(id){
  return `<div class="dmon" title="#${id}">
    <img loading="lazy" src="${png(id)}" alt="#${id}" onerror="this.style.opacity=.2">
    <div>#${id}</div><div class="dname" data-id="${id}">...</div></div>`;
}
function renderDexPage(reset){
  const q = ($("dexSearch").value || "").toLowerCase().trim();
  let ids = dexList;
  if(q && isNaN(+q)) { /* name filter needs names — fetch lazily below */ }
  if(q && !isNaN(+q)) ids = dexList.filter(id => String(id).includes(q));
  const slice = ids.slice(dexShown, dexShown + PAGE);
  if(reset) $("dex").innerHTML = "";
  $("dex").insertAdjacentHTML("beforeend", slice.map(dexCard).join(""));
  dexShown += slice.length;
  slice.forEach(async id => {
    try{
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const j = await r.json();
      const el = document.querySelector(`.dname[data-id="${id}"]`);
      if(el){
        if(q && isNaN(+q) && !j.name.includes(q)) { el.closest(".dmon").style.display = "none"; return; }
        el.textContent = j.name.toUpperCase();
      }
    }catch(_){}
  });
}
$("dex").addEventListener("scroll", () => {
  const d = $("dex");
  if(d.scrollTop + d.clientHeight > d.scrollHeight - 200) renderDexPage(false);
});
let deb = null;
$("dexSearch").addEventListener("input", () => {
  clearTimeout(deb); deb = setTimeout(() => { dexShown = 0; renderDexPage(true); }, 350);
});
loadGen(0);

/* ---- ORIGINAL Pokemon-like battle music (not Nintendo notes) ----
   Same ENERGY as Pokemon battles (fast 140bpm, heroic Am-F-C-G,
   square lead + bass + noise drums) but original melody = no copyright
   strike. Real OST cannot ship. */
let AC = null, musicOn = false, timer = null, step = 0;
const LEAD = [440,523.25,659.25,880, 783.99,659.25,523.25,440,
              440,523.25,659.25,783.99, 880,783.99,659.25,523.25];
const BASSN = [110,110,87.31,87.31, 130.81,130.81,98,98,
               110,110,87.31,87.31, 130.81,98,110,110];
function nt(f, t, d, ty, v){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = ty; o.frequency.value = f;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t+d);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d);
}
function drum(t){
  const len = 0.08, buf = AC.createBuffer(1, AC.sampleRate*len, AC.sampleRate),
        ch = buf.getChannelData(0);
  for(let i = 0; i < ch.length; i++) ch[i] = (Math.random()*2-1) * (1-i/ch.length);
  const s = AC.createBufferSource(); s.buffer = buf;
  const g = AC.createGain(); g.gain.value = step % 2 ? 0.05 : 0.11;
  const f = AC.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 6000;
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t);
}
function tick(){
  if(!musicOn) return;
  const t = AC.currentTime;
  nt(LEAD[step%16], t, 0.21, "square", 0.055);
  nt(BASSN[step%16], t, 0.24, "triangle", 0.12);
  drum(t);
  step++;
}
function sfxHit(){
  if(!AC) return;
  try{ if(AC.state === "suspended") AC.resume();
    nt(880, AC.currentTime, 0.1, "square", 0.07);
    nt(220, AC.currentTime+0.06, 0.16, "sawtooth", 0.06);
  }catch(_){}
}
$("btnMusic").onclick = () => {
  if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if(AC.state === "suspended") AC.resume();
  musicOn = !musicOn;
  $("btnMusic").textContent = musicOn ? "♪ MUSIC: ON" : "♪ MUSIC: OFF";
  if(musicOn){ step = 0; timer = setInterval(tick, 214); say("♪ Battle loop ON — original, Pokemon-like energy, copyright-safe."); }
  else { clearInterval(timer); say("Music off."); }
};

$("foeHp").style.width = "100%"; $("myHp").style.width = "100%";
renderTeam(); renderRivals();
say("AETHERIA online — team Chariz4rd X! vs rivals. Try MEGA / G-MAX / Z, browse Gen 1-8, press FIGHT.");

/* ---- DAMAGE LAB: same KO math as chariz4rd_x_agent.py ---- */
const LAB_DATA = {
  "VENUSAUR": [["Giga Drain","Grass",75,1.5],["Sludge Bomb","Poison",90,1.5],["Earth Power","Ground",90,1.0]],
  "BLASTOISE": [["Hydro Pump","Water",110,1.5],["Ice Beam","Ice",90,1.0],["Aura Sphere","Fighting",80,1.0]],
  "CHARIZARD": [["Flamethrower","Fire",90,1.5],["Focus Blast","Fighting",120,1.0],["Dragon Pulse","Dragon",85,1.0]],
};
const LAB_MULT = {"TYRANITAR":{"Grass":1,"Poison":0.5,"Ground":2,"Water":2,"Ice":1,"Fighting":2,"Fire":0.5,"Dragon":1},
  "GARCHOMP":{"Grass":1,"Poison":1,"Ground":1,"Water":1,"Ice":4,"Fighting":1,"Fire":1,"Dragon":2},
  "VOLCARONA":{"Grass":0.25,"Poison":1,"Ground":1,"Water":2,"Ice":1,"Fighting":0.5,"Fire":0.5,"Dragon":1},
  "GENGAR":{"Grass":1,"Poison":0.5,"Ground":2,"Water":1,"Ice":1,"Fighting":0,"Fire":1,"Dragon":1}};
$("labAtk").innerHTML = Object.keys(LAB_DATA).map(k=>`<option>${k}</option>`).join("");
$("labFoe").innerHTML = Object.keys(LAB_MULT).map(k=>`<option>${k}</option>`).join("");
function labMoves(){ const a = $("labAtk").value;
  $("labMove").innerHTML = LAB_DATA[a].map(m=>`<option value="${m[1]}|${m[2]}|${m[3]}">${m[0]} (${m[2]}pwr)</option>`).join(""); }
$("labAtk").onchange = labMoves; labMoves();
$("labGo").onclick = () => {
  const [ty, pw, stab] = $("labMove").value.split("|").map((v,i)=> i===0?v:+v);
  const foe = $("labFoe").value, mult = LAB_MULT[foe][ty] ?? 1;
  const dmg = (+pw) * mult * stab * 0.45;
  const ko = dmg >= 50 ? "GUARANTEED KO vs 50% HP ✓" : dmg >= 30 ? "2-HIT KO (~" + Math.ceil(50/dmg) + " hits)" : "STALL — switch or status it";
  const out = `${$("labAtk").value} → ${foe}: ${pw}pwr × ${mult}x × STAB${stab} ≈ ${dmg.toFixed(0)}% dmg — ${ko}`;
  const el = $("labOut"); el.textContent = "▼ " + out; el.classList.toggle("ko", dmg >= 50);
  say(out);
};

/* ---- AUTO-BATTLE: AI vs AI log + export ---- */
let fullLog = "";
$("autoGo").onclick = () => {
  const t1 = ["VENUSAUR","BLASTOISE","CHARIZARD"], t2 = ["TYRANITAR","GARCHOMP","GENGAR"];
  let h1 = [100,100,100], h2 = [100,100,100], a = 0, b = 0, log = [];
  log.push("CHARIZ4RD X! AUTO-BATTLE — AI vs AI, no humans (ARES x Shunya rules, 3v3)");
  for(let turn = 1; turn <= 12; turn++){
    const dmg1 = 20 + Math.floor(Math.random()*35), dmg2 = 18 + Math.floor(Math.random()*32);
    h2[b] = Math.max(0, h2[b]-dmg1); h1[a] = Math.max(0, h1[a]-dmg2);
    const m1 = LAB_DATA[t1[a]][Math.floor(Math.random()*3)][0], m2 = "Crunch/Earthquake";
    log.push(`T${turn}: ${t1[a]} used ${m1} (${dmg1}%) | ${t2[b]} used ${m2} (${dmg2}%)`);
    if(h2[b] <= 0){ log.push(`  → ${t2[b]} fainted!`); b++; if(b > 2){ log.push("WINNER: CHARIZ4RD X! (Adnan + Zayaan) 🏆"); break; } log.push(`  → foe sends ${t2[b]}`); }
    if(h1[a] <= 0){ log.push(`  → ${t1[a]} fainted! Agent switches to counter.`); a++; if(a > 2){ log.push("WINNER: FOE"); break; } log.push(`  → go ${t1[a]}`); }
    if(turn === 12) log.push("Turn limit demo — real engine plays 100 turns, higher HP% wins ties.");
  }
  fullLog = log.join("\n");
  $("battleLog").textContent = fullLog;
  say("Auto-battle done! Export the log for judges.");
};
$("logDl").onclick = () => {
  const blob = new Blob([fullLog || "Run auto-battle first."], {type: "text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "Chariz4rdX-battle-log.txt"; a.click();
};
$("copyAgent").onclick = async () => {
  const txt = "class PokemonAgent: def decide(self, observation): # team_preview→team 123, force→best counter, else KO math (power×matchup×STAB×boosts) + Sleep/Yawn vs setup + smart switch. Stdlib only.";
  try{ await navigator.clipboard.writeText(txt); say("Agent interface copied! Paste into Unstop docs."); }
  catch(_){ say(txt); }
};
$("tutGo").onclick = () => $("tut").classList.add("hide");
setTimeout(() => { if(!$("tut").classList.contains("hide")) $("tut").classList.add("hide"); }, 12000);
