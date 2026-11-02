(() => {
  const runes = [
    ...(Array.isArray(window.RUNE_DATA) ? window.RUNE_DATA : []),
    ...(Array.isArray(window.ACCESSORY_RUNE_DATA) ? window.ACCESSORY_RUNE_DATA : []),
  ];
  const STORAGE_KEY = "mabinogi-setup-analysis-v2";
  const classes = ["전사", "대검전사", "검술사", "기사", "궁수", "석궁사수", "장궁병", "마법사", "화염술사", "빙결술사", "전격술사", "힐러", "사제", "수도사", "암흑술사", "음유시인", "댄서", "악사", "도적", "격투가", "듀얼블레이드"];
  const classEffects = [
    ["class-warrior-p5", "전사", "P5", 10, 0, 0],
    ["class-greatsword-a5-berserker", "대검전사", "A5 광전사", 15, 0, 0],
    ["class-greatsword-a5-craving", "대검전사", "A5 무자비 갈망", 15, 0, 0],
    ["class-greatsword-a5-end", "대검전사", "A5 무자비 끝갈", 20, 0, 0],
    ["class-swordsman-p1", "검술사", "P1", 40, 0, 30],
    ["class-swordsman-p3", "검술사", "P3", 0, 0, 5],
    ["class-swordsman-p4", "검술사", "P4", 0, 0, 5],
    ["class-swordsman-p5", "검술사", "P5", 0, 0, 30],
    ["class-knight-p4", "기사", "P4", 10, 10, 0],
    ["class-longbow-p1", "장궁병", "P1", 15, 0, 0],
    ["class-crossbow-p3", "석궁사수", "P3", 0, 0, 5],
    ["class-bard-p4", "음유시인", "P4 3스택", 9, 9, 0],
    ["class-bard-p5", "음유시인", "P5", 0, 0, 20],
    ["class-dancer-p1", "댄서", "P1 10스택", 10, 10, 0],
    ["class-fighter-a1", "격투가", "A1 약점", 25, 0, 0],
    ["class-dual-p5", "듀얼블레이드", "P5", 15, 0, 0],
    ["class-dual-a4", "듀얼블레이드", "A4", 0, 15, 0],
    ["class-fire-s2", "화염술사", "S2", 12, 0, 0],
    ["class-dark-s2", "암흑술사", "S2", 10, 0, 0],
    ["class-thief-p2", "도적", "P2", 0, 15, 0],
  ].map(([id, className, label, crit, extra, damage]) => ({ id, className, label, crit, extra, damage }));
  const slots = [
    { id: "weapon", label: "무기", type: "무기", icon: "⚔" },
    { id: "emblem", label: "엠블럼", type: "엠블럼", icon: "✦" }, { id: "head", label: "방어구 1", type: "방어구", icon: "⬡" },
    { id: "top", label: "방어구 2", type: "방어구", icon: "⬡" }, { id: "bottom", label: "방어구 3", type: "방어구", icon: "⬡" },
    { id: "gloves", label: "방어구 4", type: "방어구", icon: "⬡" }, { id: "shoes", label: "방어구 5", type: "방어구", icon: "⬡" },
  ];
  const statDefinitions = [
    ["strength", "힘"], ["dexterity", "솜씨"], ["intelligence", "지력"], ["will", "의지"], ["luck", "행운"],
    ["attack", "공격력"], ["defense", "방어력"], ["break", "브레이크"], ["smash", "강타 강화"],
    ["combo", "콤보 강화"], ["skillPower", "스킬 위력"], ["area", "광역 강화"], ["healing", "회복력"],
    ["evasion", "급소 회피"], ["extra", "추가타"], ["reduction", "피해 감소"], ["fastAttack", "빠른 공격"],
    ["multi", "연타 강화"], ["fastSkill", "빠른 스킬"], ["health", "추가 체력"], ["ultimate", "궁극기"], ["crit", "치명타"],
  ];
  const statLabel = Object.fromEntries(statDefinitions);
  const statVisual = {
    strength: ["✊", "strength"], dexterity: ["✦", "dexterity"], intelligence: ["☁", "intelligence"], will: ["♦", "will"], luck: ["♣", "luck"],
    attack: ["⚔", "attack"], defense: ["⬡", "defense"], break: ["⚔", "break"], smash: ["➤", "smash"], combo: ["◒", "combo"], skillPower: ["✹", "skill"], area: ["◎", "area"], healing: ["✚", "healing"], evasion: ["➟", "evasion"], extra: ["✧", "extra"], reduction: ["⬡", "reduction"], fastAttack: ["➶", "fast-attack"], multi: ["↯", "multi"], fastSkill: ["◉", "fast-skill"], health: ["♥", "health"], ultimate: ["◌", "ultimate"], crit: ["✷", "crit"],
  };
  const primaryStats = ["strength", "dexterity", "intelligence", "will", "luck"];
  const leftStats = ["break", "smash", "combo", "skillPower", "area", "healing", "evasion", "extra"];
  const rightStats = ["reduction", "fastAttack", "multi", "fastSkill", "health", "ultimate", "crit"];
  const emptyBuild = () => Object.fromEntries(slots.map((slot) => [slot.id, ""]));
  const state = loadState();
  let activeSlot = null;
  let query = "";

  function loadState() {
    const fallback = { className: "", classValues: {}, stats: {}, manualStats: {}, formulas: { breakCoefficient: 0 }, build: emptyBuild() };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) return { ...fallback, ...saved, stats: saved.stats || {}, manualStats: saved.manualStats || {}, formulas: { ...fallback.formulas, ...(saved.formulas || {}) }, build: Object.fromEntries(slots.map((slot) => [slot.id, saved.build?.[slot.id] || ""])) };
      const legacy = JSON.parse(localStorage.getItem("mabinogi-setup-analysis-v1"));
      return legacy ? { ...fallback, className: legacy.className || "", stats: legacy.stats || {}, build: Object.fromEntries(slots.map((slot) => [slot.id, legacy.current?.[slot.id] || ""])) } : fallback;
    } catch { return fallback; }
  }

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const runeKey = (rune) => `${rune.type}:${rune.name}`;
  const runeByKey = (key) => runes.find((rune) => runeKey(rune) === key);
  const valueOf = (key) => state.manualStats[key] ?? state.stats[key];
  const fmt = (value, digits = 0) => Number(value || 0).toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const effectText = (rune) => String(rune?.effect || "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const effectSummary = (rune) => {
    const useful = effectText(rune).replace(/^(?:공격력|방어력|추가 체력)\s*\+\s*[\d,]+\s*/, "");
    return useful.split(/(?<=\.)\s+/)[0] || useful;
  };

  function renderClassSelect() {
    document.getElementById("setupClassSelect").innerHTML = `<option value="">클래스 선택</option>${classes.map((name) => `<option value="${name}"${state.className === name ? " selected" : ""}>${name}</option>`).join("")}`;
    const target = document.getElementById("setupClassEffects");
    const effects = classEffects.filter((effect) => effect.className === state.className);
    target.innerHTML = !state.className
      ? `<span>클래스를 선택하면 조건부 효과와 전용 장신구 룬을 불러옵니다.</span>`
      : effects.length
        ? `<strong>${state.className} 조건부 효과</strong><div>${effects.map((effect) => `<label><input type="checkbox" data-setup-class-effect="${effect.id}"${state.classValues?.[effect.id] ? " checked" : ""}><span>${effect.label}</span><small>${[effect.crit && `치명타 확률 +${effect.crit}%`, effect.extra && `추가타 확률 +${effect.extra}%`, effect.damage && `치명타 피해 +${effect.damage}%`].filter(Boolean).join(" · ")}</small></label>`).join("")}</div>`
        : `<strong>${state.className}</strong><span>별도 조건부 치명타·추가타 효과 없음</span>`;
  }

  function slotMarkup(slot) {
    const rune = runeByKey(state.build[slot.id]);
    const compactLabel = slot.label;
    return `<button type="button" class="setup-equipment-slot setup-compact-slot${rune ? " filled" : ""}" data-setup-slot="${slot.id}" title="${rune ? escapeHtml(effectText(rune)) : compactLabel}">
      <span class="setup-slot-icon">${slot.icon}</span><span class="setup-slot-copy"><b>${compactLabel}</b>
      <strong>${rune ? escapeHtml(rune.name) : "룬 선택"}</strong></span>
      <span class="setup-slot-grade">${rune ? `★${escapeHtml(rune.star)}` : "+"}</span></button>`;
  }

  function renderEquipment() {
    const group = (title, count, ids, className = "") => `<section class="setup-loadout-row ${className}"><header><h4>${title}</h4><span>${count}개</span></header><div class="setup-loadout-slots">${ids.map((id) => slotMarkup(slots.find((slot) => slot.id === id))).join("")}</div></section>`;
    document.getElementById("setupEquipmentSlots").innerHTML = [
      group("무기", 1, ["weapon"], "weapon"),
      group("엠블럼", 1, ["emblem"], "emblem"),
      group("방어구", 5, ["head", "top", "bottom", "gloves", "shoes"], "armor"),
    ].join("");
  }

  function statValueMarkup(key) {
    const recognized = state.stats[key] !== undefined && state.manualStats[key] === undefined;
    return `<label class="setup-missing-stat setup-editable-stat${recognized ? " recognized" : ""}"><input type="text" inputmode="numeric" value="${valueOf(key) ?? ""}" data-manual-stat="${key}" placeholder="0" aria-label="${statLabel[key]} 입력" title="${recognized ? "이미지 인식값 · 수정 가능" : "직접 입력"}" /></label>`;
  }
  const statName = (key) => `<span class="setup-stat-name"><i class="${statVisual[key]?.[1] || ""}" aria-hidden="true">${statVisual[key]?.[0] || ""}</i>${statLabel[key]}</span>`;
  const statRow = (key) => `<div class="setup-game-stat-row">${statName(key)}${statValueMarkup(key)}</div>`;
  function renderStats() {
    const focusStats = [
      ["crit", "치명타 확률과 치명타 피해 계산"],
      ["extra", "추가타 확률 계산"],
      ["break", "브레이크 데미지 계산"],
    ];
    document.getElementById("setupStatReadout").innerHTML = `<div class="setup-focus-stats">${focusStats.map(([key, description]) => `<article>${statName(key)}<small>${description}</small>${statValueMarkup(key)}</article>`).join("")}</div>`;
  }

  const selectedRunes = () => Object.values(state.build).map(runeByKey).filter(Boolean);
  function renderResults() {
    const critStat = Number(valueOf("crit") || 0), extraStat = Number(valueOf("extra") || 0), breakStat = Number(valueOf("break") || 0);
    const analyzed = window.RUNE_ANALYSIS?.analyzeCoreStats(selectedRunes()) || {};
    const metric = (name) => analyzed[name] || { base: 0, conditional: 0, sources: [] };
    const activeClassEffects = classEffects.filter((effect) => effect.className === state.className && state.classValues?.[effect.id]);
    const classCrit = activeClassEffects.reduce((sum, effect) => sum + effect.crit, 0);
    const classExtra = activeClassEffects.reduce((sum, effect) => sum + effect.extra, 0);
    const classDamage = activeClassEffects.reduce((sum, effect) => sum + effect.damage, 0);
    const critBase = critStat ? (0.5 - 1000 / (critStat + 2000)) * 100 : 0;
    const critDamageBase = (1.4 + critStat / 5000) * 100;
    const extraBase = extraStat ? extraStat / 130 : 0;
    const extraProbability = (base, bonus) => ((1 + base / 100) * (1 + bonus / 100) - 1) * 100;
    const critDamage = (bonus) => critDamageBase * (1 + bonus / 100);
    const breakBaseMultiplier = (1 + metric("브레이크 피해").base / 100) * (1 + breakStat / 25500);
    const breakMaxMultiplier = (1 + (metric("브레이크 피해").base + metric("브레이크 피해").conditional) / 100) * (1 + breakStat / 25500);
    // 스킬별 기본 계수는 캐릭터 스탯에 포함되지 않는다. 임의의 100을
    // 대입하지 않고, 계수와 무관하게 확정할 수 있는 기본 대비 증가율만 표시한다.
    const breakBaseIncrease = (breakBaseMultiplier - 1) * 100;
    const breakMaxIncrease = (breakMaxMultiplier - 1) * 100;
    const rows = [
      ["공격력 증가", metric("공격력").base, metric("공격력").conditional, "선택 룬 합계"],
      ["적에게 주는 피해", metric("적에게 주는 피해").base, metric("적에게 주는 피해").conditional, "룬 효과"],
      ["무방비 피해", metric("무방비 피해").base, metric("무방비 피해").conditional, "룬 효과"],
      ["치명타 확률", critBase + metric("치명타 확률").base, metric("치명타 확률").conditional + classCrit, `스탯 환산 ${fmt(critBase, 2)}%${classCrit ? ` · 클래스 +${classCrit}%` : ""}`],
      ["추가타 확률", extraProbability(extraBase, metric("추가타 확률").base), extraProbability(extraBase, metric("추가타 확률").base + metric("추가타 확률").conditional + classExtra) - extraProbability(extraBase, metric("추가타 확률").base), `스탯 환산 ${fmt(extraBase, 2)}%${classExtra ? ` · 클래스 +${classExtra}%` : ""}`],
      ["치명타 피해", critDamage(metric("치명타 피해").base), critDamage(metric("치명타 피해").base + metric("치명타 피해").conditional + classDamage) - critDamage(metric("치명타 피해").base), classDamage ? `클래스 +${classDamage}%` : `기본 ${fmt(critDamageBase, 2)}%`],
      ["강타 피해", metric("강타 피해").base, metric("강타 피해").conditional, "룬 효과"],
      ["연타 피해", metric("연타 피해").base, metric("연타 피해").conditional, "룬 효과"],
      ["스킬 피해", metric("스킬 피해").base, metric("스킬 피해").conditional, "룬 효과"],
      ["브레이크 데미지 증가율", breakBaseIncrease, breakMaxIncrease - breakBaseIncrease, `기본 계수 대비 · 브레이크 스탯 ${fmt(breakStat)} (스킬 계수 미포함)`],
    ];
    const groups = [
      ["기본 피해", rows.slice(0, 3)],
      ["확률·치명타", rows.slice(3, 6)],
      ["공격 유형", rows.slice(6)],
    ];
    const runeConditions = [...new Map(Object.values(analyzed).flatMap((item) => item.sources || []).filter((source) => source.conditional).map((source) => [`${source.rune}:${source.clause}`, source])).values()];
    const classConditions = activeClassEffects.map((effect) => `${effect.className} ${effect.label}`);
    const conditions = [...runeConditions.map((source) => `<li><b>${escapeHtml(source.rune)}</b><span>${escapeHtml(source.clause)}</span></li>`), ...classConditions.map((label) => `<li><b>클래스 조건</b><span>${escapeHtml(label)} 활성화</span></li>`)];
    const conditionGuide = `<div class="setup-condition-guide"><div><b>상시</b><span>별도 발동 조건 없이 항상 적용되는 효과</span></div><div><b>조건 충족 시 최대</b><span>상시 효과에 조건부 효과와 최대 중첩, 선택한 클래스 조건까지 모두 적용한 값</span></div>${conditions.length ? `<details><summary>현재 포함된 조건 ${conditions.length}개</summary><ul>${conditions.join("")}</ul></details>` : `<p>현재 선택된 룬과 클래스 조건 중 결과에 포함할 조건부 효과가 없습니다.</p>`}</div>`;
    document.getElementById("setupDerivedResults").innerHTML = `${conditionGuide}<div class="setup-result-table"><div class="setup-result-header"><span>분석 항목</span><b>상시</b><b>조건 충족 시 최대</b><span>산출 기준</span></div>${groups.map(([title, items]) => `<section><h4>${title}</h4><div>${items.map(([label, base, conditional, note, unit = "%"]) => `<article><span>${label}</span><strong>${fmt(base, 2)}${unit}</strong><strong>${fmt(base + conditional, 2)}${unit}</strong><small>${note}</small></article>`).join("")}</div></section>`).join("")}</div>`;
  }

  function pickerRunes() {
    const slot = slots.find((item) => item.id === activeSlot); if (!slot) return [];
    const search = query.trim().toLowerCase();
    return runes
      .filter((rune) => rune.type === slot.type)
      .filter((rune) => !search || `${rune.name} ${effectText(rune)}`.toLowerCase().includes(search));
  }
  function renderPicker() {
    const slot = slots.find((item) => item.id === activeSlot); if (!slot) return;
    document.getElementById("setupPickerSlotType").textContent = slot.type; document.getElementById("setupPickerTitle").textContent = `${slot.label} 룬 선택`;
    const list = pickerRunes();
    document.getElementById("setupRunePickerList").innerHTML = list.length ? `<button type="button" class="setup-picker-rune remove" data-setup-rune=""><b>선택 해제</b><small>이 슬롯의 룬을 비웁니다.</small></button>${list.map((rune) => `<button type="button" class="setup-picker-rune${state.build[slot.id] === runeKey(rune) ? " selected" : ""}" data-setup-rune="${escapeHtml(runeKey(rune))}"><span><b>${escapeHtml(rune.name)}</b><small>${escapeHtml(rune.grade)} · ${escapeHtml(rune.type)} · ★${escapeHtml(rune.star)}</small><small>${escapeHtml(effectSummary(rune))}</small></span><em>${state.build[slot.id] === runeKey(rune) ? "선택됨" : "선택"}</em></button>`).join("")}` : `<div class="setup-picker-empty"><strong>조건에 맞는 룬이 없습니다.</strong><span>검색어나 룬 데이터를 확인해 주세요.</span></div>`;
  }
  function openPicker(slotId) { activeSlot = slotId; query = ""; document.getElementById("setupRuneSearch").value = ""; renderPicker(); const picker = document.getElementById("setupRunePicker"); picker.hidden = false; picker.setAttribute("aria-hidden", "false"); document.body.classList.add("setup-picker-open"); }
  function closePicker() { const picker = document.getElementById("setupRunePicker"); picker.hidden = true; picker.setAttribute("aria-hidden", "true"); document.body.classList.remove("setup-picker-open"); activeSlot = null; }
  function render() { renderClassSelect(); renderEquipment(); renderStats(); renderResults(); }

  document.addEventListener("click", (event) => {
    const slot = event.target.closest("[data-setup-slot]"); if (slot) { openPicker(slot.dataset.setupSlot); return; }
    if (event.target.closest("[data-setup-picker-close]")) { closePicker(); return; }
    const rune = event.target.closest("[data-setup-rune]"); if (rune && activeSlot) { state.build[activeSlot] = rune.dataset.setupRune; save(); closePicker(); renderEquipment(); renderResults(); }
  });
  document.addEventListener("input", (event) => { const input = event.target.closest("[data-manual-stat]"); if (input) { input.value = input.value.replace(/[^0-9]/g, ""); input.closest(".setup-editable-stat")?.classList.remove("recognized"); if (input.value === "") delete state.manualStats[input.dataset.manualStat]; else state.manualStats[input.dataset.manualStat] = Number(input.value); save(); renderResults(); } });
  document.getElementById("setupClassSelect")?.addEventListener("change", (event) => {
    state.className = event.target.value; state.classValues = {};
    save(); renderClassSelect(); renderEquipment(); renderResults();
  });
  document.addEventListener("change", (event) => {
    const formula = event.target.closest("[data-setup-formula]");
    if (formula) { state.formulas[formula.dataset.setupFormula] = Number(formula.value || 0); save(); renderResults(); return; }
    const input = event.target.closest("[data-setup-class-effect]");
    if (!input) return;
    state.classValues[input.dataset.setupClassEffect] = input.checked; save(); renderResults();
  });
  document.getElementById("setupRuneSearch")?.addEventListener("input", (event) => { query = event.target.value; renderPicker(); });
  document.getElementById("setupClearBuild")?.addEventListener("click", () => { state.build = emptyBuild(); save(); renderEquipment(); renderResults(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !document.getElementById("setupRunePicker")?.hidden) closePicker(); });
  render();
})();
