# AETHERIA ✦ Ultra GBA Requiem — starring team Chariz4rd X!

**Game:** AETHERIA (phenomena arena) — **Team:** Chariz4rd X! — Adnan A Laksar & Zayaan Yusuf (Duo)
**Event:** ARES Robotics x GDG NSUT — AI-versus-AI Pokémon Battle (Pokémon Showdown, Gen 9 3v3)
**Theme:** GBA soul, ultra brain — Kanto trio + all Pokémon till Gen 8 (#001–#905)

Live demo: deploy this folder on Netlify / Vercel (see Deploy below).
Practice portal: https://redline-aresxshunya.netlify.app/

---

## What's inside (2 things in 1 repo)

1. **Hackathon submission (for judges):** `team.txt` + `chariz4rd_x_agent.py` → zipped as `Chariz4rdX.zip`
2. **Showcase game site (for WebDev P2 + audience):** `index.html` + `style.css` + `script.js` — Ultimate GBA machine with Mega / G-Max / Z animations, Gen 1–8 Pokédex, battle sim, original chiptune music.

Tournament fights **base forms only**. Mega / G-Max / Z buttons are showcase animations for the site, not the submitted battle.

---

## How to play the game

### Boot (new Gen Rotom Phone style)
1. Site opens on a Rotom Phone saying Hi (typewriter greetings).
2. Press **▶ START** — phone spins 360°, screen enlarges, arena fades in with a boot chime.
3. Old bug fixed: there is now ONE clear START (the phone). The arena is locked/blurred until boot, so presses never feel dead.

### The machine
Open the site → you see the ULTIMATE GBA screen (foe on top, you at bottom, HP bars, dialog box).

### Controls
- **FIGHT** — attack with your active mon. Damage = Power × matchup × STAB (same math as the AI). Screen shakes, flash pops, foe HP drains in steps like a cartridge.
- **PKMN** — switch to next mon (Venusaur → Blastoise → Charizard → loop). Heals +20% to show switching momentum. Use when dialog says weak matchup.
- **MEGA / G-MAX / Z** — showcase phenomena for the ACTIVE mon:
  - MEGA: cyan flash, sprite grows, +100 stats lore text.
  - G-MAX: sprite goes giant, red sky, screen shake, 3-turn giant lore.
  - Z: gold rings explode, white-out, one-time nuke lore.
- **Starter cards (THE 3 PHENOMENA)** — click any card to send it out. Each card lists ability @ item, 4 moves, Mega / G-Max / Z form, and an ACTIVATE button.
- **Gen 1–8 Pokédex** — Gen buttons (Gen 1: #1–151 … Gen 8: #810–905), search by name or number (`charizard`, `445`), scroll loads 48 at a time (live PokeAPI sprites).
- **♪ MUSIC** (top-right) — original 140 BPM battle loop (square lead + triangle bass + noise drums). Needs 1 click first (browser autoplay rule). Hit SFX on every FIGHT.

### Win the demo fight
Foe cycles Tyranitar → Garchomp → Volcarona → Gengar → Dragonite. Green matchups from the table = stay and FIGHT. Red = PKMN switch. Sleep/Yawn logic mirrors the real agent.

---

## Your trio (the actual submission)

| Slot | Mon | Ability @ Item | Moves |
|------|-----|----------------|-------|
| 1 Lead | Venusaur (Grass/Poison) | Overgrow @ Black Sludge | Sleep Powder / Giga Drain / Sludge Bomb / Earth Power |
| 2 Pivot | Blastoise (Water) | Torrent @ Leftovers | Hydro Pump / Ice Beam / Aura Sphere / Yawn |
| 3 Ace | Charizard (Fire/Flying) | Blaze @ Life Orb | Flamethrower / Air Slash / Focus Blast / Dragon Pulse |

Why it wins: Fire/Water/Grass triangle covers everything; Sleep + Yawn beats sample bots that never handle status; Ice Beam 4x kills Dragons; Focus Blast kills Tyranitar (Charizard's #1 counter). Details in `team.txt`.

Agent (`chariz4rd_x_agent.py`, pure stdlib, 0 deps): KO math → priority snipe → Sleep/Yawn vs setup → max damage → smart switch with full type chart + speed tiers + anti-loop. Always legal, <0.01s/turn. Supports both portal observation schemas.

---

## Run locally (2 min, web-dev only)

```bash
cd Chariz4rd
python -m http.server 8000
# browser → http://localhost:8000 → FIGHT → MUSIC ON
```

No build, no npm, no game engine. Vanilla HTML/CSS/JS. Sprites need internet (PokeAPI CDN); HP bars + text work offline.

---

## Deploy (pick one, easiest first)

### A. Netlify — drag & drop (recommended, 3 min)
1. Go to netlify.com → Add new site → Deploy manually
2. Drag THIS folder (index.html, style.css, script.js, team.txt, chariz4rd_x_agent.py)
3. You get `https://chariz4rdx.netlify.app` — share it
4. Don't upload `Chariz4rdX.zip` to the site — that's for Unstop only (downloads already link it)

### B. Vercel (3 min)
1. vercel.com → Add New → Project → Import your GitHub repo
2. Framework: Other, Root: `./`, no build command
3. Deploy → URL live

### C. GitHub Pages (5 min)
```bash
git add -A
git commit -m "Chariz4rd X ultra gba"
git push origin main
# GitHub repo → Settings → Pages → Deploy from branch → main / root → Save
# Live at https://really4adnan.github.io/Chariz4rd/
```

### Hackathon submit (separate from site deploy)
1. Practice portal → select Venusaur/Blastoise/Charizard + moves from `team.txt` → upload `chariz4rd_x_agent.py` as Player 1 → Start Simulation → Show Winner
2. Unstop → upload `Chariz4rdX.zip` (contains ONLY `team.txt` + `chariz4rd_x_agent.py`)

---

## Music note (important)

Built-in loop is **original, Pokémon-like energy, not Nintendo notes** = copyright-safe for Netlify/judges. Real Pokémon OST can't ship (takedown risk).

Want the real theme for local demo only? Drop `battle.mp3` next to `index.html` and add:
```html
<audio src="battle.mp3" loop autoplay></audio>
```
Don't include it in the Unstop zip.

---

## Files

```
index.html              → Ultimate GBA site
style.css               → neon GBA + Mega/G-Max/Z animations
script.js               → battle sim + dex (PokeAPI #1-905) + WebAudio music
team.txt                → submission roster (Adnan + Zayaan)
chariz4rd_x_agent.py    → submission brain (PokemonAgent.decide)
Chariz4rdX.zip          → Unstop upload (team.txt + .py only)
README.md               → this file
```

## Credits

Built by Adnan A Laksar & Zayaan Yusuf — Chariz4rd X! GBA soul, ultra brain.
Sprites: PokeAPI / Pokémon Showdown CDN. Music: original WebAudio chiptune.
Pokémon © Nintendo/Game Freak — fan showcase, no affiliation.
