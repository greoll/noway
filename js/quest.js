(() => {
  "use strict";

  const STORAGE_KEY = "mabinogi-weekend-quest-v1";
  const defaults = {
    target: 600,
    items: [
      { group: "금속", name: "은광석", stock: 600, location: "구름황야", note: "" },
      { group: "금속", name: "백동광석", stock: 600, location: "센마이", note: "" },
      { group: "목재", name: "최상급통나무+", stock: 600, location: "센마이", note: "" },
      { group: "목재", name: "상급통나무+", stock: 0, location: "콜헨", note: "" },
      { group: "옷감", name: "최상급양털+", stock: 600, location: "이멘마하", note: "" },
      { group: "옷감", name: "최상급양털", stock: 600, location: "가이레흐", note: "" },
      { group: "옷감", name: "상급양털+", stock: 600, location: "가이레흐", note: "" },
      { group: "거미줄", name: "최상급거미줄", stock: 400, location: "이멘마하", note: "" },
      { group: "가죽", name: "상급생가죽+", stock: 600, location: "", note: "" },
    ],
  };

  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return structuredClone(defaults);
      return {
        target: Math.max(0, Number(saved.target) || defaults.target),
        items: defaults.items.map((item, index) => ({
          ...item,
          stock: Math.max(0, Number(saved.items?.[index]?.stock ?? item.stock) || 0),
          location: String(saved.items?.[index]?.location ?? item.location),
          note: String(saved.items?.[index]?.note ?? item.note),
        })),
      };
    } catch {
      return structuredClone(defaults);
    }
  };

  let state = load();
  let saveTimer = 0;
  const body = document.getElementById("questMaterialBody");
  const targetInput = document.getElementById("questTargetAmount");
  if (!body || !targetInput) return;

  const fmt = (value) => Number(value || 0).toLocaleString("ko-KR");
  const numeric = (value) => Math.max(0, Math.floor(Number(String(value).replace(/,/g, "")) || 0));
  const escapeAttribute = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const save = () => {
    window.clearTimeout(saveTimer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };
  const scheduleSave = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 500);
  };

  const groupSpan = (index) => {
    if (index > 0 && state.items[index - 1].group === state.items[index].group) return 0;
    let span = 1;
    while (state.items[index + span]?.group === state.items[index].group) span += 1;
    return span;
  };

  const render = () => {
    targetInput.value = state.target;
    body.innerHTML = state.items
      .map((item, index) => {
        const span = groupSpan(index);
        const needed = Math.max(0, state.target - item.stock);
        return `<tr class="${needed ? "quest-needed" : "quest-complete"}" data-quest-row="${index}">
          ${span ? `<th scope="rowgroup" rowspan="${span}" class="quest-group">${item.group}</th>` : ""}
          <th scope="row" class="quest-item">${item.name}</th>
          <td class="quest-edit quest-stock"><input type="text" inputmode="numeric" pattern="[0-9]*" value="${item.stock}" data-quest-stock="${index}" aria-label="${item.name} 소지량"></td>
          <td class="quest-needed-value"><strong>${fmt(needed)}</strong></td>
          <td class="quest-edit"><input type="text" value="${escapeAttribute(item.location)}" data-quest-location="${index}" aria-label="${item.name} 채집장소"></td>
          <td class="quest-edit"><input type="text" value="${escapeAttribute(item.note)}" data-quest-note="${index}" aria-label="${item.name} 비고"></td>
        </tr>`;
      })
      .join("");
  };

  const updateAllNeededValues = () => {
    state.items.forEach((item, index) => {
      const row = body.querySelector(`[data-quest-row="${index}"]`);
      if (!row) return;
      const needed = Math.max(0, state.target - item.stock);
      row.classList.toggle("quest-needed", needed > 0);
      row.classList.toggle("quest-complete", needed === 0);
      row.querySelector(".quest-needed-value strong").textContent = fmt(needed);
    });
  };

  const updateCalculatedValue = (input) => {
    const row = input.closest("tr");
    const index = Number(input.dataset.questStock);
    state.items[index].stock = numeric(input.value);
    const needed = Math.max(0, state.target - state.items[index].stock);
    row.classList.toggle("quest-needed", needed > 0);
    row.classList.toggle("quest-complete", needed === 0);
    row.querySelector(".quest-needed-value strong").textContent = fmt(needed);
  };

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input.id === "questTargetAmount") {
      state.target = numeric(input.value);
      updateAllNeededValues();
      scheduleSave();
      return;
    }
    if (input.dataset.questStock != null) {
      updateCalculatedValue(input);
      scheduleSave();
      return;
    }
    if (input.dataset.questLocation != null) {
      state.items[Number(input.dataset.questLocation)].location = input.value;
      scheduleSave();
      return;
    }
    if (input.dataset.questNote != null) {
      state.items[Number(input.dataset.questNote)].note = input.value;
      scheduleSave();
    }
  });

  document.addEventListener("focusout", (event) => {
    if (!event.target.closest("#miscQuestPage")) return;
    if (event.target.dataset.questStock != null) {
      event.target.value = state.items[Number(event.target.dataset.questStock)].stock;
    } else if (event.target.id === "questTargetAmount") {
      event.target.value = state.target;
    }
    save();
  });

  document.addEventListener("keydown", (event) => {
    const input = event.target.closest?.("#miscQuestPage input");
    if (!input || !["Enter", "Tab"].includes(event.key)) return;

    // Tab 이동은 브라우저의 자연스러운 가로 순서를 유지하고 저장만 확정한다.
    if (event.key === "Tab") {
      save();
      return;
    }

    event.preventDefault();
    save();
    let next = null;
    if (input.id === "questTargetAmount") {
      next = event.shiftKey
        ? null
        : document.querySelector("[data-quest-stock]");
    } else {
      const selector =
        input.dataset.questStock != null
          ? "[data-quest-stock]"
          : input.dataset.questLocation != null
            ? "[data-quest-location]"
            : "[data-quest-note]";
      const columnInputs = [...document.querySelectorAll(selector)];
      const currentIndex = columnInputs.indexOf(input);
      next =
        columnInputs[currentIndex + (event.shiftKey ? -1 : 1)] || null;
    }
    if (next) {
      next.focus({ preventScroll: true });
      next.select();
    }
  });

  document.addEventListener("focusin", (event) => {
    if (event.target.matches?.("#miscQuestPage input")) event.target.select();
  });

  render();
})();
