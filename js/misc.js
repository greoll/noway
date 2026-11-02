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

const SEASON_WEEK_PLANNER_KEY = "mabinogi-season-week-planner";
const seasonCalendarNow = new Date();
const calendarEvents = [
  {
    date: "2026-08-13",
    title: "초월재료 가격 상향 종료",
    type: "deadline",
  },
  {
    date: "2026-08-17",
    title: "타바르타스 상점 종료",
    type: "deadline",
  },
];
const calendarHolidays = {
  "2026-08-15": "광복절",
  "2026-08-17": "대체공휴일",
};
const USER_CALENDAR_EVENTS_KEY = "mabinogi-user-calendar-events";
const escapeCalendarText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
const loadUserCalendarEvents = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_CALENDAR_EVENTS_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
let userCalendarEvents = loadUserCalendarEvents();
const saveUserCalendarEvents = () => {
  localStorage.setItem(
    USER_CALENDAR_EVENTS_KEY,
    JSON.stringify(userCalendarEvents),
  );
};

const renderUserCalendarEventList = () => {
  const list = document.getElementById("calendarUserEventList");
  if (!list) return;
  const sortedEvents = [...userCalendarEvents].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  list.innerHTML = sortedEvents.length
    ? sortedEvents
        .map(
          (calendarEvent) => `
            <div class="calendar-user-event-item">
              <div><small>${escapeCalendarText(calendarEvent.date)}</small><span>${escapeCalendarText(calendarEvent.title)}</span></div>
              <button type="button" data-calendar-event-delete="${escapeCalendarText(calendarEvent.id)}" aria-label="${escapeCalendarText(calendarEvent.title)} 삭제">×</button>
            </div>`,
        )
        .join("")
    : '<p class="calendar-user-event-empty">추가한 일정이 없습니다.</p>';
};

const loadSeasonWeekPlanner = () => {
  try {
    return JSON.parse(localStorage.getItem(SEASON_WEEK_PLANNER_KEY)) || {};
  } catch {
    return {};
  }
};

const seasonWeekPlannerState = {
  targetLevel: 55,
  showSeasonLevel: true,
  weeklyClear: true,
  weekendRepeat: true,
  weekendCombined: false,
  friendshipBagWork: false,
  calendarView: "month",
  calendarYear: seasonCalendarNow.getFullYear(),
  calendarMonth: seasonCalendarNow.getMonth(),
  calendarDay: seasonCalendarNow.getDate(),
  ...loadSeasonWeekPlanner(),
};

const saveSeasonWeekPlanner = () => {
  localStorage.setItem(
    SEASON_WEEK_PLANNER_KEY,
    JSON.stringify(seasonWeekPlannerState),
  );
};

const seasonProgressPosition = (startLevel, maxLevel, accumulatedExp) => {
  let level = startLevel;
  let remaining = Math.max(0, accumulatedExp);
  while (level <= maxLevel) {
    const required = getSeasonRequiredExp(level);
    if (remaining < required) {
      return {
        level,
        current: remaining,
        required,
        maxed: false,
      };
    }
    remaining -= required;
    if (level === maxLevel) {
      return {
        level,
        current: required,
        required,
        maxed: true,
      };
    }
    level += 1;
  }
  return null;
};

const renderSeasonWeekPlanner = () => {
  const featureInput = document.getElementById("calendarFeatureSeason");
  const seasonModule = document.getElementById("calendarSeasonModule");
  const targetInput = document.getElementById("seasonWeekTargetLevel");
  const weeklyClearInput = document.getElementById("seasonWeeklyClear");
  const weekendRepeatInput = document.getElementById("seasonWeekendRepeat");
  const weekendCombinedInput = document.getElementById("seasonWeekendCombined");
  const friendshipBagInput = document.getElementById("seasonFriendshipBagWork");
  const days = document.getElementById("seasonCalendarDays");
  const weekdays = document.getElementById("seasonCalendarWeekdays");
  const title = document.getElementById("seasonCalendarTitle");
  const viewEyebrow = document.getElementById("calendarViewEyebrow");
  const note = document.getElementById("seasonWeekPlannerNote");
  if (
    !featureInput ||
    !seasonModule ||
    !targetInput ||
    !weeklyClearInput ||
    !weekendRepeatInput ||
    !weekendCombinedInput ||
    !friendshipBagInput ||
    !days ||
    !weekdays ||
    !title ||
    !viewEyebrow ||
    !note
  )
    return;

  renderUserCalendarEventList();

  featureInput.checked = Boolean(seasonWeekPlannerState.showSeasonLevel);
  seasonModule.hidden = !seasonWeekPlannerState.showSeasonLevel;

  const targetLevel = Math.max(
    1,
    Math.min(150, Number(seasonWeekPlannerState.targetLevel) || 55),
  );
  const startLevel = Math.max(1, targetLevel - 4);
  seasonWeekPlannerState.targetLevel = targetLevel;
  targetInput.value = String(targetLevel);
  if (seasonWeekPlannerState.weekendCombined) {
    seasonWeekPlannerState.weeklyClear = true;
    seasonWeekPlannerState.weekendRepeat = false;
  }
  weeklyClearInput.checked = Boolean(seasonWeekPlannerState.weeklyClear);
  weekendRepeatInput.checked = Boolean(seasonWeekPlannerState.weekendRepeat);
  weekendCombinedInput.checked = Boolean(
    seasonWeekPlannerState.weekendCombined,
  );
  friendshipBagInput.checked = Boolean(
    seasonWeekPlannerState.friendshipBagWork,
  );

  const abyssRaidReductionExp = seasonWeekPlannerState.weekendCombined
    ? 0
    : (seasonWeekPlannerState.weeklyClear ? 2600 : 0) +
      (seasonWeekPlannerState.weekendRepeat ? 800 : 0);
  const baselineReductionExp =
    abyssRaidReductionExp +
    (seasonWeekPlannerState.friendshipBagWork ? 1200 : 0);
  const clearSchedule = seasonWeekPlannerState.weeklyClear
    ? seasonWeekPlannerState.weekendCombined
      ? " · 첫 클리어 토요일 반영"
      : " · 첫 클리어 오늘 반영"
    : "";
  note.textContent = `현재 주차 ${startLevel}~${targetLevel} MAX 기준 · 일일 숙제 매일 완료 · 기준선 ${baselineReductionExp.toLocaleString("ko-KR")} 차감${clearSchedule}`;

  const calendarYear = Number(seasonWeekPlannerState.calendarYear);
  const calendarMonth = Number(seasonWeekPlannerState.calendarMonth);
  const calendarDay = Number(seasonWeekPlannerState.calendarDay) || 1;
  const calendarView = ["week", "month"].includes(
    seasonWeekPlannerState.calendarView,
  )
    ? seasonWeekPlannerState.calendarView
    : "month";
  seasonWeekPlannerState.calendarView = calendarView;
  viewEyebrow.textContent =
    calendarView === "week" ? "주간 보기" : "월간 보기";
  document.querySelectorAll("[data-calendar-view]").forEach((button) => {
    const active = button.dataset.calendarView === calendarView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const anchorDate = new Date(calendarYear, calendarMonth, calendarDay);
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  let calendarStart;
  let calendarEnd;
  if (calendarView === "week") {
    delete weekdays.dataset.weekday;
    const mondayIndex = (anchorDate.getDay() + 6) % 7;
    calendarStart = new Date(anchorDate);
    calendarStart.setDate(anchorDate.getDate() - mondayIndex);
    calendarEnd = new Date(calendarStart);
    calendarEnd.setDate(calendarStart.getDate() + 6);
    title.textContent = `${calendarStart.getMonth() + 1}월 ${calendarStart.getDate()}일 ~ ${calendarEnd.getMonth() + 1}월 ${calendarEnd.getDate()}일`;
    weekdays.innerHTML = ["요일", "일자", "시즌 레벨", "주요 일정"]
      .map((label) => `<span>${label}</span>`)
      .join("");
  } else {
    delete weekdays.dataset.weekday;
    title.textContent = `${calendarYear}년 ${calendarMonth + 1}월`;
    calendarStart = new Date(
      calendarYear,
      calendarMonth,
      1 - firstDay.getDay(),
    );
    calendarEnd = new Date(
      calendarYear,
      calendarMonth + 1,
      6 - lastDay.getDay(),
    );
    weekdays.innerHTML = ["일", "월", "화", "수", "목", "금", "토"]
      .map((day) => `<span>${day}</span>`)
      .join("");
  }
  weekdays.dataset.view = calendarView;
  days.dataset.view = calendarView;
  const currentMonday = new Date(
    seasonCalendarNow.getFullYear(),
    seasonCalendarNow.getMonth(),
    seasonCalendarNow.getDate() - ((seasonCalendarNow.getDay() + 6) % 7),
  );

  const calendarCells = [];
  for (
    let date = new Date(calendarStart);
    date <= calendarEnd;
    date.setDate(date.getDate() + 1)
  ) {
    const cellDate = new Date(date);
    const mondayIndex = (cellDate.getDay() + 6) % 7;
    const weekMonday = new Date(cellDate);
    weekMonday.setDate(cellDate.getDate() - mondayIndex);
    const weekOffset = Math.round((weekMonday - currentMonday) / 604800000);
    const weekStartLevel = Math.max(
      1,
      Math.min(150, startLevel + weekOffset * 5),
    );
    const weekTargetLevel = Math.max(
      weekStartLevel,
      Math.min(150, targetLevel + weekOffset * 5),
    );
    let totalRequiredExp = 0;
    for (let level = weekStartLevel; level <= weekTargetLevel; level += 1) {
      totalRequiredExp += getSeasonRequiredExp(level);
    }
    const manualBaseExp = Math.max(
      0,
      totalRequiredExp - 1150 * 7 - baselineReductionExp,
    );
    let earnedContentExp = 0;
    if (seasonWeekPlannerState.weeklyClear) {
      const clearDay = seasonWeekPlannerState.weekendCombined
        ? 5
        : (seasonCalendarNow.getDay() + 6) % 7;
      if (mondayIndex >= clearDay) earnedContentExp += 2600;
    }
    if (seasonWeekPlannerState.weekendRepeat && mondayIndex >= 5) {
      earnedContentExp += 800;
    }
    if (seasonWeekPlannerState.friendshipBagWork && mondayIndex >= 3) {
      earnedContentExp += 1200;
    }
    const targetExp = Math.min(
      totalRequiredExp,
      manualBaseExp + 1150 * (mondayIndex + 1) + earnedContentExp,
    );
    const position = seasonProgressPosition(
      weekStartLevel,
      weekTargetLevel,
      targetExp,
    );
    const isToday =
      cellDate.getFullYear() === seasonCalendarNow.getFullYear() &&
      cellDate.getMonth() === seasonCalendarNow.getMonth() &&
      cellDate.getDate() === seasonCalendarNow.getDate();
    const outsideMonth =
      calendarView === "month" && cellDate.getMonth() !== calendarMonth;
    const dateKey = [
      cellDate.getFullYear(),
      String(cellDate.getMonth() + 1).padStart(2, "0"),
      String(cellDate.getDate()).padStart(2, "0"),
    ].join("-");
    const recurringEvents = [];
    if (cellDate.getDay() === 1) {
      recurringEvents.push({
        date: dateKey,
        title: "시즌레벨 초기화",
        type: "recurring-season",
      });
    }
    if (cellDate.getDay() === 4) {
      recurringEvents.push({
        date: dateKey,
        title: "우정주머니 초기화",
        type: "recurring",
      });
    }
    const eventItems = [
      ...calendarEvents,
      ...userCalendarEvents,
      ...recurringEvents,
    ]
      .filter((calendarEvent) => calendarEvent.date === dateKey)
      .map(
        (calendarEvent) =>
          `<div class="calendar-event ${calendarEvent.type}">${calendarEvent.title}</div>`,
      )
      .join("");
    const eventMarkup = `<div class="calendar-events">${eventItems || (calendarView === "week" ? '<span class="calendar-no-event">—</span>' : "")}</div>`;
    const holidayName = calendarHolidays[dateKey] || "";
    const seasonDetails = seasonWeekPlannerState.showSeasonLevel
      ? `
        <b>${position.level}레벨(${position.maxed ? "MAX" : (Math.ceil(position.current / 100) * 100).toLocaleString("ko-KR")})</b>`
      : "";
    const dateMarkup =
      calendarView === "week"
        ? `<div class="season-calendar-weekday"><strong>${["일", "월", "화", "수", "목", "금", "토"][cellDate.getDay()]}</strong></div>
           <div class="season-calendar-day-number"><strong>${cellDate.getDate()}일</strong>${isToday ? "<span>오늘</span>" : ""}</div>`
        : `<div class="season-calendar-date"><strong>${cellDate.getDate()}</strong>${isToday ? "<span>오늘</span>" : ""}</div>`;
    calendarCells.push(`
      <article class="season-calendar-day${isToday ? " today" : ""}${outsideMonth ? " outside" : ""}${holidayName ? " holiday" : ""}" data-weekday="${cellDate.getDay()}"${holidayName ? ` title="${holidayName}"` : ""}>
        ${dateMarkup}
        ${seasonDetails}
        ${eventMarkup}
      </article>`);
  }
  days.innerHTML = calendarCells.join("");
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
  localStorage.setItem(
    SEASON_RANGE_STORAGE_KEY,
    String(activeSeasonRangeIndex),
  );
  renderSeasonLevelRange();
};

const applyMiscTab = (selectedTab) => {
  const validTab = [
    "stats",
    "resistance",
    "season",
    "enchant",
    "calendar",
  ].includes(selectedTab)
    ? selectedTab
    : "stats";
  document.getElementById("miscStatsPage").hidden = validTab !== "stats";
  document.getElementById("miscResistancePage").hidden =
    validTab !== "resistance";
  document.getElementById("miscSeasonPage").hidden = validTab !== "season";
  document.getElementById("miscEnchantPage").hidden = validTab !== "enchant";
  document.getElementById("miscCalendarPage").hidden = validTab !== "calendar";
  document.querySelectorAll("[data-misc-tab]").forEach((button) => {
    const active = button.dataset.miscTab === validTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
};

document.addEventListener("click", (event) => {
  const eventDeleteButton = event.target.closest("[data-calendar-event-delete]");
  if (eventDeleteButton) {
    userCalendarEvents = userCalendarEvents.filter(
      (calendarEvent) =>
        calendarEvent.id !== eventDeleteButton.dataset.calendarEventDelete,
    );
    saveUserCalendarEvents();
    renderSeasonWeekPlanner();
    return;
  }
  const calendarViewButton = event.target.closest("[data-calendar-view]");
  if (calendarViewButton) {
    seasonWeekPlannerState.calendarView =
      calendarViewButton.dataset.calendarView;
    saveSeasonWeekPlanner();
    renderSeasonWeekPlanner();
    return;
  }
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
  if (
    event.target.closest("#seasonCalendarPrev") ||
    event.target.closest("#seasonCalendarNext")
  ) {
    const direction = event.target.closest("#seasonCalendarPrev") ? -1 : 1;
    const calendarView = seasonWeekPlannerState.calendarView || "month";
    const anchorDate = new Date(
      seasonWeekPlannerState.calendarYear,
      seasonWeekPlannerState.calendarMonth,
      seasonWeekPlannerState.calendarDay || 1,
    );
    if (calendarView === "month") {
      anchorDate.setDate(1);
      anchorDate.setMonth(anchorDate.getMonth() + direction);
    } else {
      anchorDate.setDate(
        anchorDate.getDate() + direction * (calendarView === "week" ? 7 : 1),
      );
    }
    seasonWeekPlannerState.calendarYear = anchorDate.getFullYear();
    seasonWeekPlannerState.calendarMonth = anchorDate.getMonth();
    seasonWeekPlannerState.calendarDay = anchorDate.getDate();
    saveSeasonWeekPlanner();
    renderSeasonWeekPlanner();
    return;
  }

  const button = event.target.closest("[data-misc-tab]");
  if (!button) return;
  const selectedTab = button.dataset.miscTab;
  applyMiscTab(selectedTab);
  localStorage.setItem(MISC_TAB_STORAGE_KEY, selectedTab);
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "calendarEventForm") return;
  event.preventDefault();
  const dateInput = document.getElementById("calendarEventDate");
  const titleInput = document.getElementById("calendarEventTitle");
  const date = dateInput.value;
  const title = titleInput.value.trim();
  if (!date || !title) return;
  userCalendarEvents.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    title,
    type: "user",
  });
  saveUserCalendarEvents();
  titleInput.value = "";
  seasonWeekPlannerState.calendarYear = Number(date.slice(0, 4));
  seasonWeekPlannerState.calendarMonth = Number(date.slice(5, 7)) - 1;
  seasonWeekPlannerState.calendarDay = Number(date.slice(8, 10));
  saveSeasonWeekPlanner();
  renderSeasonWeekPlanner();
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#seasonCurrentLevel, #seasonTargetLevel")) {
    renderSeasonGoal();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "seasonWeekTargetLevel") {
    seasonWeekPlannerState.targetLevel = Number(event.target.value);
  } else if (event.target.id === "calendarFeatureSeason") {
    seasonWeekPlannerState.showSeasonLevel = event.target.checked;
  } else if (event.target.id === "seasonWeeklyClear") {
    seasonWeekPlannerState.weeklyClear = event.target.checked;
    if (!event.target.checked) seasonWeekPlannerState.weekendCombined = false;
  } else if (event.target.id === "seasonWeekendRepeat") {
    seasonWeekPlannerState.weekendRepeat = event.target.checked;
    if (event.target.checked) {
      seasonWeekPlannerState.weekendCombined = false;
    }
  } else if (event.target.id === "seasonWeekendCombined") {
    seasonWeekPlannerState.weekendCombined = event.target.checked;
    if (event.target.checked) {
      seasonWeekPlannerState.weeklyClear = true;
      seasonWeekPlannerState.weekendRepeat = false;
    }
  } else if (event.target.id === "seasonFriendshipBagWork") {
    seasonWeekPlannerState.friendshipBagWork = event.target.checked;
  } else {
    return;
  }
  saveSeasonWeekPlanner();
  renderSeasonWeekPlanner();
});

applyMiscTab(localStorage.getItem(MISC_TAB_STORAGE_KEY) || "stats");
renderSeasonLevelRange();
renderSeasonGoal();
renderSeasonWeekPlanner();

const calendarEventDateInput = document.getElementById("calendarEventDate");
if (calendarEventDateInput && !calendarEventDateInput.value) {
  const todayYear = seasonCalendarNow.getFullYear();
  const todayMonth = String(seasonCalendarNow.getMonth() + 1).padStart(2, "0");
  const todayDate = String(seasonCalendarNow.getDate()).padStart(2, "0");
  calendarEventDateInput.value = `${todayYear}-${todayMonth}-${todayDate}`;
}
