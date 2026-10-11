"""
Chariz4rd X! - Autonomous Battle Agent
Team: Venusaur + Blastoise + Charizard (GBA Kanto Trio, Gen 1-8 legal)
Format: Gen 9 3v3 Singles | Engine: Pokemon Showdown
Style: Pure stdlib (no torch/sklearn) - fastest, never crashes, always legal.

Strategy:
- KO math (power * matchup * STAB * boosts) - always takes guaranteed KO
- Priority sniper (Aqua Jet etc) to finish low-HP foes
- Status win-con (Sleep Powder / Yawn) vs setup sweepers
- Smart switch with full Gen9 type chart + speed tiers
- Recovery / stall with Giga Drain + Leftovers + Black Sludge
- Anti-loop switch cooldown, dual-schema support (both observation formats)
"""

# ---------- Full Gen 9 type chart (attack -> defense -> mult) ----------
TYPE_CHART = {
    "Normal": {"Rock": 0.5, "Ghost": 0.0, "Steel": 0.5},
    "Fire": {"Fire": 0.5, "Water": 0.5, "Grass": 2.0, "Ice": 2.0, "Bug": 2.0, "Rock": 0.5, "Dragon": 0.5, "Steel": 2.0},
    "Water": {"Fire": 2.0, "Water": 0.5, "Grass": 0.5, "Ground": 2.0, "Rock": 2.0, "Dragon": 0.5},
    "Electric": {"Water": 2.0, "Electric": 0.5, "Grass": 0.5, "Ground": 0.0, "Flying": 2.0, "Dragon": 0.5},
    "Grass": {"Fire": 0.5, "Water": 2.0, "Grass": 0.5, "Poison": 0.5, "Ground": 2.0, "Flying": 0.5, "Bug": 0.5, "Rock": 2.0, "Dragon": 0.5, "Steel": 0.5},
    "Ice": {"Fire": 0.5, "Water": 0.5, "Grass": 2.0, "Ice": 0.5, "Ground": 2.0, "Flying": 2.0, "Dragon": 2.0, "Steel": 0.5},
    "Fighting": {"Normal": 2.0, "Ice": 2.0, "Poison": 0.5, "Flying": 0.5, "Psychic": 0.5, "Bug": 0.5, "Rock": 2.0, "Ghost": 0.0, "Dark": 2.0, "Steel": 2.0, "Fairy": 0.5},
    "Poison": {"Grass": 2.0, "Poison": 0.5, "Ground": 0.5, "Rock": 0.5, "Ghost": 0.5, "Steel": 0.0, "Fairy": 2.0},
    "Ground": {"Fire": 2.0, "Electric": 2.0, "Grass": 0.5, "Poison": 2.0, "Flying": 0.0, "Bug": 0.5, "Rock": 2.0, "Steel": 2.0},
    "Flying": {"Electric": 0.5, "Grass": 2.0, "Fighting": 2.0, "Bug": 2.0, "Rock": 0.5, "Steel": 0.5},
    "Psychic": {"Fighting": 2.0, "Poison": 2.0, "Psychic": 0.5, "Dark": 0.0, "Steel": 0.5},
    "Bug": {"Fire": 0.5, "Grass": 2.0, "Fighting": 0.5, "Poison": 0.5, "Flying": 0.5, "Psychic": 2.0, "Ghost": 0.5, "Dark": 2.0, "Steel": 0.5, "Fairy": 0.5},
    "Rock": {"Fire": 2.0, "Ice": 2.0, "Fighting": 0.5, "Ground": 0.5, "Flying": 2.0, "Bug": 2.0, "Steel": 0.5},
    "Ghost": {"Normal": 0.0, "Psychic": 2.0, "Ghost": 2.0, "Dark": 0.5},
    "Dragon": {"Dragon": 2.0, "Steel": 0.5, "Fairy": 0.0},
    "Dark": {"Fighting": 0.5, "Psychic": 2.0, "Ghost": 2.0, "Dark": 0.5, "Fairy": 0.5},
    "Steel": {"Fire": 0.5, "Water": 0.5, "Electric": 0.5, "Ice": 2.0, "Rock": 2.0, "Steel": 0.5, "Fairy": 2.0},
    "Fairy": {"Fire": 0.5, "Fighting": 2.0, "Poison": 0.5, "Dragon": 2.0, "Dark": 2.0, "Steel": 0.5},
}

# Base speed tiers for legal roster (Gen 1-8) - used to decide setup vs attack
BASE_SPEED = {
    "Greninja": 122, "Dragapult": 142, "Alakazam": 120, "Gengar": 110,
    "Charizard": 100, "Venusaur": 80, "Blastoise": 78,
    "Garchomp": 102, "Dragonite": 80, "Salamence": 100, "Hydreigon": 98,
    "Lucario": 90, "Scizor": 65, "Gyarados": 81, "Arcanine": 95,
    "Excadrill": 88, "Togekiss": 80, "Snorlax": 30, "Lapras": 60,
    "Corviknight": 67, "Ferrothorn": 20, "Tyranitar": 61, "Metagross": 70,
}

PRIORITY_MOVES = {
    "extremespeed", "bulletpunch", "aquajet", "iceshard", "suckerpunch",
    "shadowsneak", "quickattack", "watershuriken", "fakeout", "machpunch",
}

SETUP_MOVES = {
    "swordsdance", "dragondance", "quiverdance", "nastyplot", "growth",
    "bulkup", "curse", "agility", "shellsmash", "calmmind", "irondefense",
}

RECOVERY_MOVES = {
    "roost", "recover", "morningsun", "synthesis", "slackoff", "wish",
}

STATUS_MOVES = {
    "sleeppowder", "thunderwave", "willowisp", "toxic", "yawn",
    "leechseed", "spore", "stunspore", "glare",
}

PROTECT_MOVES = {"protect", "detect", "spikyshield", "kingshield"}


def _norm(s):
    return str(s or "").lower().replace(" ", "").replace("-", "").replace("'", "")


def effectiveness(move_type, defender_types):
    mult = 1.0
    chart = TYPE_CHART.get(move_type, {})
    for t in defender_types or []:
        # normalize e.g. "fire" -> "Fire"
        key = str(t).capitalize()
        mult *= chart.get(key, 1.0)
    return mult


def stage_mult(stage):
    try:
        s = int(stage or 0)
    except Exception:
        s = 0
    s = max(-6, min(6, s))
    if s >= 0:
        return (2.0 + s) / 2.0
    return 2.0 / (2.0 - s)


class PokemonAgent:
    def __init__(self):
        self._last_switch_turn = -99
        self._turn = 0

    # ---- observation normalizers (support BOTH portal schemas) ----
    def _parse(self, obs):
        o = dict(obs or {})
        turn = o.get("turn", 1) or 1
        try:
            turn = int(turn)
        except Exception:
            turn = 1
        self._turn = turn

        # team preview?
        if o.get("team_preview"):
            return {"preview": True}

        # --- active ---
        act = o.get("my_active") or o.get("active_pokemon") or {}
        foe = o.get("foe") or o.get("opponent_pokemon") or {}
        my_team = o.get("my_team") or o.get("team") or []
        foe_hp = foe.get("hp_percent", foe.get("hpPercent", 100))
        try:
            foe_hp = float(foe_hp if foe_hp is not None else 100)
        except Exception:
            foe_hp = 100.0

        my_hp = act.get("hp_percent", act.get("hpPercent", 100))
        try:
            my_hp = float(my_hp if my_hp is not None else 100)
        except Exception:
            my_hp = 100.0

        my_name = act.get("name", "")
        foe_name = foe.get("name", "")
        my_types = act.get("types", []) or []
        foe_types = foe.get("types", []) or []
        my_boosts = act.get("boosts", {}) or {}
        foe_boosts = foe.get("boosts", {}) or {}
        my_status = act.get("condition") or act.get("status")
        foe_status = foe.get("status")

        # --- valid moves: schema A ---
        valid_moves = list(o.get("valid_moves", []) or [])
        # --- schema B: valid_actions ["move 1", ...] + active_pokemon.moves ---
        if not valid_moves and o.get("valid_actions"):
            movelist = (act.get("moves", []) or [])
            for a in o.get("valid_actions", []):
                try:
                    parts = str(a).strip().split()
                    if len(parts) == 2 and parts[0] == "move":
                        idx = int(parts[1])
                        info = movelist[idx - 1] if 0 < idx <= len(movelist) else {}
                        valid_moves.append({
                            "index": idx,
                            "name": info.get("name", f"Move{idx}"),
                            "type": info.get("type", "Normal"),
                            "base_power": info.get("basePower", info.get("base_power", 50)),
                            "type_multiplier": effectiveness(
                                info.get("type", "Normal"), foe_types
                            ) if foe_types else 1.0,
                            "stab": (info.get("type", "") in my_types),
                            "disabled": info.get("disabled", False),
                            "pp": info.get("pp", 10),
                        })
                except Exception:
                    continue

        # normalize each move dict
        norm_moves = []
        for m in valid_moves:
            try:
                idx = int(m.get("index", m.get("slot", 1)))
            except Exception:
                idx = 1
            name = m.get("name", f"Move{idx}")
            mtype = m.get("type", m.get("move_type", "Normal"))
            if not mtype:
                mtype = "Normal"
            # capitalize for chart
            mtype = str(mtype).capitalize()
            power = m.get("base_power", m.get("basePower", m.get("power", 50)))
            if power is None:
                power = 0
            try:
                power = int(power)
            except Exception:
                power = 0
            mult = m.get("type_multiplier", m.get("typeMultiplier", m.get("mult", None)))
            if mult is None:
                mult = effectiveness(mtype, foe_types)
            try:
                mult = float(mult)
            except Exception:
                mult = 1.0
            stab = m.get("stab", None)
            if stab is None:
                stab = mtype in (my_types or [])
            disabled = bool(m.get("disabled", False))
            pp = m.get("pp", 10)
            try:
                pp = int(pp if pp is not None else 10)
            except Exception:
                pp = 10
            if disabled or pp <= 0:
                continue
            norm_moves.append({
                "index": idx, "name": name, "type": mtype,
                "power": power, "mult": mult, "stab": bool(stab),
                "key": _norm(name),
            })

        # --- valid switches ---
        valid_switches = list(o.get("valid_switches", []) or [])
        if not valid_switches and o.get("valid_actions"):
            for a in o.get("valid_actions", []):
                try:
                    parts = str(a).strip().split()
                    if len(parts) == 2 and parts[0] == "switch":
                        idx = int(parts[1])
                        # find bench mon by position
                        bench = [p for p in my_team if not p.get("active")]
                        target = bench[idx - 1] if 0 < idx <= len(bench) else {}
                        valid_switches.append({
                            "index": idx,
                            "name": target.get("name", f"Slot{idx}"),
                            "hp_percent": target.get("hp_percent", 100),
                            "types": target.get("types", []),
                        })
                except Exception:
                    continue
        norm_switches = []
        for s in valid_switches:
            try:
                idx = int(s.get("index", 1))
            except Exception:
                idx = 1
            hp = s.get("hp_percent", s.get("hpPercent", 100))
            try:
                hp = float(hp if hp is not None else 100)
            except Exception:
                hp = 100.0
            fainted = bool(s.get("fainted", False))
            if fainted or hp <= 0:
                continue
            norm_switches.append({
                "index": idx, "name": s.get("name", ""),
                "hp": hp, "types": s.get("types", []) or [],
            })

        force = bool(o.get("force_switch", o.get("forceSwitch", False)))
        return {
            "preview": False, "turn": turn,
            "my_name": my_name, "foe_name": foe_name,
            "my_types": my_types, "foe_types": foe_types,
            "my_hp": my_hp, "foe_hp": foe_hp,
            "my_boosts": my_boosts, "foe_boosts": foe_boosts,
            "my_status": my_status, "foe_status": foe_status,
            "my_team": my_team, "moves": norm_moves,
            "switches": norm_switches, "force": force,
        }

    def _best_switch(self, st):
        foe_types = st["foe_types"]
        best, best_score = None, -1e9
        for s in st["switches"]:
            # offense: how hard does bench hit foe? (best STAB guess via chart)
            off = 0.0
            for atk in ["Fire", "Water", "Grass", "Electric", "Ice", "Fighting",
                        "Ground", "Flying", "Psychic", "Rock", "Dragon", "Dark",
                        "Fairy", "Steel", "Ghost", "Poison"]:
                m = effectiveness(atk, foe_types)
                stab_b = 1.5 if atk in (s["types"] or []) else 1.0
                off = max(off, m * stab_b)
            # defense: how well does bench take foe STAB?
            deff = 1.0
            for ft in foe_types:
                deff *= effectiveness(ft, s["types"] or [])
            # lower incoming = better -> invert
            def_score = 2.0 - min(4.0, deff)
            score = off * 2.0 + def_score + (s["hp"] / 100.0)
            if score > best_score:
                best_score, best = score, s
        return best

    def decide(self, observation: dict) -> str:
        try:
            st = self._parse(observation or {})
            if st.get("preview"):
                return "team 123"
            moves = st["moves"]
            switches = st["switches"]
            turn = st["turn"]

            # forced switch (fainted) -> best counter by type + HP
            if st["force"]:
                if switches:
                    b = self._best_switch(st)
                    return f"switch {(b or switches[0])['index']}"
                return "pass"

            if not moves:
                if switches:
                    b = self._best_switch(st)
                    return f"switch {(b or switches[0])['index']}"
                return "pass"

            my_hp, foe_hp = st["my_hp"], st["foe_hp"]
            atk_stage = st["my_boosts"].get("atk", 0)
            spa_stage = st["my_boosts"].get("spa", 0)
            try:
                boost = max(stage_mult(atk_stage), stage_mult(spa_stage))
            except Exception:
                boost = 1.0
            foe_boosted = any(
                (st["foe_boosts"].get(k, 0) or 0) >= 1
                for k in ("atk", "spa", "spe")
            )

            my_spd = BASE_SPEED.get(st["my_name"], 80)
            foe_spd = BASE_SPEED.get(st["foe_name"], 80)
            # rough speed with boosts
            try:
                spe_stage = int(st["my_boosts"].get("spe", 0) or 0)
                foe_spe = int(st["foe_boosts"].get("spe", 0) or 0)
                outspeed = (my_spd * stage_mult(spe_stage)) >= (foe_spd * stage_mult(foe_spe))
            except Exception:
                outspeed = my_spd >= foe_spd

            # ---- score every move ----
            scored = []
            for m in moves:
                key, power, mult = m["key"], m["power"], m["mult"]
                stab_m = 1.5 if m["stab"] else 1.0

                # --- status / setup / recovery branches ---
                if key in PROTECT_MOVES:
                    score = -50.0
                    scored.append((score, m))
                    continue
                if key in RECOVERY_MOVES:
                    # heal when hurt + safe (foe weak or we outspeed)
                    if my_hp < 55 and (outspeed or mult >= 1.0 or foe_hp < 30):
                        score = 300 + (60 - my_hp) * 3
                    else:
                        score = -20.0
                    scored.append((score, m))
                    continue
                if key in SETUP_MOVES:
                    my_stages = max(
                        int(atk_stage or 0), int(spa_stage or 0),
                        int(st["my_boosts"].get("spe", 0) or 0),
                    )
                    if my_stages >= 2 or my_hp < 35:
                        score = -30.0
                    elif my_hp > 55 and (outspeed or foe_hp > 50):
                        score = 260.0  # free setup vs dumb bots = win
                    else:
                        score = 40.0
                    scored.append((score, m))
                    continue
                if key in STATUS_MOVES or power <= 0:
                    # Sleep Powder / Yawn / Wisp / TWave win-con
                    if st["foe_status"]:
                        score = -40.0
                    elif foe_hp < 25:
                        score = -10.0  # just kill, don't status
                    elif foe_boosted or key in ("sleeppowder", "spore", "yawn"):
                        # nuclear vs setup sweepers + early game
                        score = 320.0 if turn <= 6 or foe_boosted else 120.0
                    else:
                        score = 60.0
                    # Venusaur Sleep + Blastoise Yawn get bonus on healthy foes
                    if key in ("sleeppowder", "yawn") and foe_hp > 50:
                        score += 60.0
                    scored.append((score, m))
                    continue

                # --- damaging move ---
                dmg_est = power * mult * stab_m * boost * 0.45
                score = power * mult * stab_m * 0.5
                # KO bonus (the whole game in 3v3)
                if dmg_est >= foe_hp:
                    score += 1000.0 + mult * 50
                elif dmg_est >= foe_hp * 0.65:
                    score += 180.0
                # effectiveness shaping
                if mult >= 4.0:
                    score += 120.0
                elif mult >= 2.0:
                    score += 60.0
                elif mult == 0:
                    score -= 10000.0
                elif mult < 1.0:
                    score -= 80.0
                # STAB bonus
                if m["stab"]:
                    score += 25.0
                # priority sniper: finish low foes through speed
                if key in PRIORITY_MOVES and foe_hp <= 32 and dmg_est >= foe_hp * 0.5:
                    score += 400.0
                # Chariz4rd X specifics: Charizard Focus Blast vs Rock, Blastoise Ice Beam vs Dragon
                if _norm(st["my_name"]) == "charizard" and key == "focusblast" and foe_hp > 20:
                    score += 40.0
                if _norm(st["my_name"]) == "blastoise" and key == "icebeam" and mult >= 2.0:
                    score += 40.0
                if _norm(st["my_name"]) == "venusaur" and key == "earthpower" and mult >= 2.0:
                    score += 40.0
                scored.append((score, m))

            scored.sort(key=lambda x: x[0], reverse=True)
            best_score, best_move = scored[0]

            # ---- smart switch check (not every turn - anti-loop) ----
            if switches and (turn - self._last_switch_turn) >= 3:
                # if best attack is resisted/weak and bench has answer -> pivot
                best_mult = best_move["mult"] if best_move["power"] > 0 else 1.0
                desperate = (
                    (best_mult < 1.0 and my_hp < 75) or
                    (my_hp < 22 and any(s["hp"] > 60 for s in switches)) or
                    (best_score < 40 and any(s["hp"] > 70 for s in switches))
                )
                if desperate and best_move["power"] > 0:
                    b = self._best_switch(st)
                    if b and b["hp"] > max(35, my_hp + 15):
                        self._last_switch_turn = turn
                        return f"switch {b['index']}"

            return f"move {best_move['index']}"
        except Exception:
            # absolute fallback - never crash, always legal
            try:
                vm = (observation or {}).get("valid_moves", []) or []
                if vm:
                    return f"move {vm[0].get('index', 1)}"
                va = (observation or {}).get("valid_actions", []) or []
                if va:
                    return str(va[0])
            except Exception:
                pass
            return "move 1"
