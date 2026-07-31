const MISC_TAB_STORAGE_KEY = "mabinogi-active-misc-tab";
const SEASON_RANGE_STORAGE_KEY = "mabinogi-season-level-range-v2";
const SEASON_FIRST_LEVEL = 1;
const SEASON_MAX_CURRENT_LEVEL = 149;
const SEASON_LEVELS_PER_PAGE = 10;

const seasonRangeStarts = [];
for (
  let level = SEASON_FIRST_LEVEL;
  level <= SEASON_MAX_CURRENT_LEVEL;
  level += SEASON_LEVELS_PER_PAGE
) {
  seasonRangeStarts.push(level);
}

const getSeasonRequiredExp = (currentLevel) =>
  2 * currentLevel * currentLevel + 30 * currentLevel + 1000;

const renderSeasonGoal = () => {
  const currentInput = document.getElementById("seasonCurrentLevel");
  const targetInput = document.getElementById("seasonTargetLevel");
  const runsOutput = document.getElementById("seasonGoalRuns");
  if (!currentInput || !targetInput || !runsOutput) return;

  const currentLevel = Number(currentInput.value);
  const targetLevel = Number(targetInput.value);
  const valid =
    Number.isInteger(currentLevel) &&
    Number.isInteger(targetLevel) &&
    currentLevel >= 1 &&
    targetLevel <= 150 &&
    targetLevel > currentLevel;

  if (!valid) {
    runsOutput.textContent = "-";
    return;
  }

  let totalExp = 0;
  for (let level = currentLevel; level < targetLevel; level += 1) {
    totalExp += getSeasonRequiredExp(level);
  }
  runsOutput.textContent = Math.ceil(totalExp / 250).toLocaleString("ko-KR");
};

let activeSeasonRangeIndex = Math.max(
  0,
  Math.min(
    seasonRangeStarts.length - 1,
    Number(localStorage.getItem(SEASON_RANGE_STORAGE_KEY)) || 0,
  ),
);

const renderSeasonLevelRange = () => {
  const rows = document.getElementById("seasonLevelRows");
  const rangeButtons = document.getElementById("seasonRangeButtons");
  if (!rows || !rangeButtons) return;

  const firstCurrentLevel = seasonRangeStarts[activeSeasonRangeIndex];
  const lastCurrentLevel = Math.min(
    firstCurrentLevel + SEASON_LEVELS_PER_PAGE - 1,
    SEASON_MAX_CURRENT_LEVEL,
  );

  rows.innerHTML = Array.from(
    { length: lastCurrentLevel - firstCurrentLevel + 1 },
    (_, index) => {
      const currentLevel = firstCurrentLevel + index;
      const targetLevel = currentLevel + 1;
      const requiredExp = getSeasonRequiredExp(currentLevel);
      const requiredRuns = Math.ceil(requiredExp / 250);
      const lowRouteDays = Math.ceil(requiredExp / 1150);
      const highRouteDays = Math.ceil(requiredExp / 1400);
      const dayRange =
        highRouteDays === lowRouteDays
          ? `${highRouteDays}일`
          : `${highRouteDays}~${lowRouteDays}일`;
      return `<tr><th scope="row">${currentLevel} → ${targetLevel}</th><td>${requiredExp.toLocaleString("ko-KR")}</td><td class="season-run-count"><strong>${requiredRuns}</strong>판</td><td class="season-day-count">약 <strong>${dayRange}</strong></td></tr>`;
    },
  ).join("");

  rangeButtons.innerHTML = seasonRangeStarts
    .map((startLevel, index) => {
      const endLevel = Math.min(
        startLevel + SEASON_LEVELS_PER_PAGE - 1,
        SEASON_MAX_CURRENT_LEVEL,
      );
      return `<button type="button" data-season-range="${index}" class="${index === activeSeasonRangeIndex ? "active" : ""}" aria-pressed="${index === activeSeasonRangeIndex}">${startLevel}~${endLevel}</button>`;
    })
    .join("");

  document.getElementById("seasonLevelPrev").disabled =
    activeSeasonRangeIndex === 0;
  document.getElementById("seasonLevelNext").disabled =
    activeSeasonRangeIndex === seasonRangeStarts.length - 1;
};

const setSeasonRange = (rangeIndex) => {
  activeSeasonRangeIndex = Math.max(
    0,
    Math.min(seasonRangeStarts.length - 1, rangeIndex),
  );
  localStorage.setItem(SEASON_RANGE_STORAGE_KEY, String(activeSeasonRangeIndex));
  renderSeasonLevelRange();
};

const applyMiscTab = (selectedTab) => {
  const validTab = ["stats", "resistance", "season", "enchant"].includes(selectedTab)
    ? selectedTab
    : "stats";
  document.getElementById("miscStatsPage").hidden = validTab !== "stats";
  document.getElementById("miscResistancePage").hidden =
    validTab !== "resistance";
  document.getElementById("miscSeasonPage").hidden = validTab !== "season";
  document.getElementById("miscEnchantPage").hidden = validTab !== "enchant";
  document.querySelectorAll("[data-misc-tab]").forEach((button) => {
    const active = button.dataset.miscTab === validTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
};

document.addEventListener("click", (event) => {
  const rangeButton = event.target.closest("[data-season-range]");
  if (rangeButton) {
    setSeasonRange(Number(rangeButton.dataset.seasonRange));
    return;
  }
  if (event.target.closest("#seasonLevelPrev")) {
    setSeasonRange(activeSeasonRangeIndex - 1);
    return;
  }
  if (event.target.closest("#seasonLevelNext")) {
    setSeasonRange(activeSeasonRangeIndex + 1);
    return;
  }

  const button = event.target.closest("[data-misc-tab]");
  if (!button) return;
  const selectedTab = button.dataset.miscTab;
  applyMiscTab(selectedTab);
  localStorage.setItem(MISC_TAB_STORAGE_KEY, selectedTab);
});

document.addEventListener("input", (event) => {
  if (
    event.target.matches("#seasonCurrentLevel, #seasonTargetLevel")
  ) {
    renderSeasonGoal();
  }
});

applyMiscTab(localStorage.getItem(MISC_TAB_STORAGE_KEY) || "stats");
renderSeasonLevelRange();
renderSeasonGoal();
