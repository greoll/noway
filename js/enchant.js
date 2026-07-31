const enchantSlots = ["전체", "무기", "장신구", "방어구", "엠블럼"];
const enchantSlotOrder = Object.fromEntries(
  enchantSlots.slice(1).map((slot, index) => [slot, index]),
);
const enchantRarities = {
  "10성": { name: "전설", className: "legendary" },
  "9성": { name: "에픽", className: "epic" },
  "8성": { name: "엘리트", className: "elite" },
  "7성": { name: "레어", className: "rare" },
  "6성": { name: "고급", className: "uncommon" },
};
const enchantEffectFilters = [
  { name: "치명타", priority: "core" },
  { name: "추가타", priority: "core" },
  { name: "강타강화", priority: "core" },
  { name: "연타강화", priority: "core" },
  { name: "빠른스킬", priority: "major" },
  { name: "브레이크", priority: "major" },
];
const enchantEffectPriority = [
  "치명타",
  "추가타",
  "강타강화",
  "연타강화",
  "빠른스킬",
  "스킬위력",
  "브레이크",
];
const enchantEffectPriorityOrder = Object.fromEntries(
  enchantEffectPriority.map((effect, index) => [
    effect.replaceAll(" ", ""),
    index,
  ]),
);
let activeEnchantSlot = "전체";
let enchantQuery = "";
const activeEnchantEffects = new Set();

const escapeEnchantHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatEnchantEffectValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value);
  const number = Number(text);
  if (Number.isFinite(number)) {
    if (number > 0 && number < 1) {
      return `+${Math.round(number * 10000) / 100}%`;
    }
    return `+${text}`;
  }
  return text;
};

const enchantFamilyName = (name) => String(name).replace(/\+{1,2}$/, "");
const enchantEffectName = (effect) =>
  effect === "레이드 룬 연계" ? "시즌1 레이드 룬 연계" : effect;

const renderEnchantRow = (item) => {
  const rarity = enchantRarities[item.grade] || {
    name: "",
    className: "normal",
  };
  const effectValue = formatEnchantEffectValue(item.value);
  const sortedEffects = (item.effect || "")
    .split(",")
    .map((effect) => effect.trim())
    .filter(Boolean)
    .map(enchantEffectName)
    .sort(
      (a, b) =>
        (enchantEffectPriorityOrder[a.replaceAll(" ", "")] ?? 999) -
        (enchantEffectPriorityOrder[b.replaceAll(" ", "")] ?? 999),
    );
  const effectLines = [
    item.attack ? `공격력 ${item.attack}` : "",
    ...sortedEffects.map(
      (effect) => `${effect}${effectValue ? ` ${effectValue}` : ""}`,
    ),
  ].filter(Boolean);
  return `
    <article class="enchant-row rarity-${rarity.className}">
      <span class="enchant-grade" data-label="등급"><b>${escapeEnchantHtml(item.grade)}</b>${rarity.name ? `<small>${rarity.name}</small>` : ""}</span>
      <span class="enchant-slot" data-label="부위">${escapeEnchantHtml(item.slot)}</span>
      <strong class="enchant-name" data-label="인챈트">${escapeEnchantHtml(item.name)}</strong>
      <span class="enchant-effect" data-label="인챈트 효과">
        ${effectLines.map((line) => `<span>${escapeEnchantHtml(line)}</span>`).join("") || "<span>-</span>"}
      </span>
    </article>`;
};

const renderEnchantList = () => {
  const filters = document.getElementById("enchantSlotFilters");
  const effectFilters = document.getElementById("enchantEffectFilters");
  const list = document.getElementById("enchantList");
  const count = document.getElementById("enchantCount");
  if (!filters || !effectFilters || !list || !count) return;

  filters.innerHTML = enchantSlots
    .map(
      (slot) =>
        `<button type="button" class="enchant-filter${slot === activeEnchantSlot ? " active" : ""}" data-enchant-slot="${slot}">${slot}</button>`,
    )
    .join("");
  effectFilters.innerHTML = [
    `<button type="button" class="enchant-effect-filter clear${activeEnchantEffects.size ? "" : " active"}" data-enchant-effect="">전체</button>`,
    ...enchantEffectFilters.map(
      ({ name, priority }) =>
        `<button type="button" class="enchant-effect-filter ${priority}${activeEnchantEffects.has(name) ? " active" : ""}" data-enchant-effect="${name}" aria-pressed="${activeEnchantEffects.has(name)}">${name}</button>`,
    ),
  ].join("");

  const normalizedQuery = enchantQuery.trim().toLocaleLowerCase("ko");
  const visible = enchantItems
    .filter((item) => {
      const slotMatches =
        activeEnchantSlot === "전체" || item.slot === activeEnchantSlot;
      const searchableEffect = (item.effect || "")
        .split(",")
        .map((effect) => enchantEffectName(effect.trim()))
        .join(" ");
      const text = `${item.name} ${searchableEffect}`.toLocaleLowerCase("ko");
      const normalizedEffects = (item.effect || "").replaceAll(" ", "");
      const effectMatches = [...activeEnchantEffects].every((effect) =>
        normalizedEffects.includes(effect.replaceAll(" ", "")),
      );
      return (
        slotMatches &&
        effectMatches &&
        (!normalizedQuery || text.includes(normalizedQuery))
      );
    })
    .sort(
      (a, b) =>
        (enchantSlotOrder[a.slot] ?? 999) -
        (enchantSlotOrder[b.slot] ?? 999),
    );

  count.textContent = `${visible.length}개`;
  if (!visible.length) {
    list.innerHTML =
      '<p class="enchant-empty">조건에 맞는 인챈트가 없습니다.</p>';
    return;
  }

  const renderFamilies = (items) => {
    const familyMap = new Map();
    items.forEach((item) => {
      const key = enchantFamilyName(item.name);
      if (!familyMap.has(key)) familyMap.set(key, []);
      familyMap.get(key).push(item);
    });
    return [...familyMap.values()]
      .map(
        (family) =>
          `<section class="enchant-family">${family.map(renderEnchantRow).join("")}</section>`,
      )
      .join("");
  };

  if (activeEnchantSlot === "전체") {
    list.innerHTML = enchantSlots
      .slice(1)
      .map((slot) => {
        const slotItems = visible.filter((item) => item.slot === slot);
        if (!slotItems.length) return "";
        return `
          <section class="enchant-slot-section">
            <div class="enchant-slot-title">
              <h3>${slot} 인챈트</h3>
              <span>${slotItems.length}개</span>
            </div>
            <div class="enchant-slot-grid">${renderFamilies(slotItems)}</div>
          </section>`;
      })
      .join("");
  } else {
    list.innerHTML = `<div class="enchant-slot-grid">${renderFamilies(visible)}</div>`;
  }
};

document.addEventListener("click", (event) => {
  const effectFilter = event.target.closest("[data-enchant-effect]");
  if (effectFilter) {
    const effect = effectFilter.dataset.enchantEffect;
    if (!effect) {
      activeEnchantEffects.clear();
    } else if (activeEnchantEffects.has(effect)) {
      activeEnchantEffects.delete(effect);
    } else {
      activeEnchantEffects.add(effect);
    }
    renderEnchantList();
    return;
  }
  const filter = event.target.closest("[data-enchant-slot]");
  if (!filter) return;
  activeEnchantSlot = filter.dataset.enchantSlot;
  renderEnchantList();
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "enchantSearch") return;
  enchantQuery = event.target.value;
  renderEnchantList();
});

renderEnchantList();
