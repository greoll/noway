(() => {
  const runes = Array.isArray(window.RUNE_DATA) ? window.RUNE_DATA : [];
  const typeOrder = ["전체", "무기", "방어구", "엠블럼"];
  const slotLimits = { 무기: 1, 방어구: 5, 엠블럼: 1 };
  const state = {
    type: "전체",
    query: "",
    selectedName: "",
    selectedRunes: [],
    research: { baseAttack: 0, enchantAttack: 0, artifactAttack: 0, receivedDamage: 0, skillCoefficient: 0 },
  };
  const runeKey = (rune) => `${rune.type}:${rune.name}`;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const effectLines = (effect) =>
    String(effect || "")
      .split(/<br\s*\/?\s*>/i)
      .map((line) => line.trim())
      .filter(Boolean);

  const trackedStats = [
    "공격력",
    "적에게 주는 피해",
    "무방비 피해",
    "치명타 확률",
    "추가타 확률",
    "치명타 피해",
    "강타 피해",
    "연타 피해",
    "스킬 피해",
    "브레이크 피해",
  ];
  const conditionalWords = [
    "경우", "동안", "사용 시", "적중 시", "공격 시", "전투 시", "활성화",
    "보유 시", "때마다", "마다", "중첩", "이하", "이상", "미만", "초과",
  ];

  const analyzeCoreStats = (selectedRunes) => {
    const result = Object.fromEntries(
      trackedStats.map((stat) => [stat, { base: 0, conditional: 0, sources: [] }]),
    );
    selectedRunes.forEach((rune) => {
      const clauses = effectLines(rune.effect).flatMap((line) => {
        const stackMatch = line.match(/최대\s*(\d+)\s*회(?:까지)?\s*중첩/);
        const stackCount = stackMatch ? Number(stackMatch[1]) : 1;
        return line
          .split(/(?<=\.)\s+/)
          .map((clause) => ({ clause: clause.trim(), stackCount }))
          .filter((item) => item.clause);
      });
      clauses.forEach(({ clause, stackCount }) => {
        const conditional = conditionalWords.some((word) => clause.includes(word));
        trackedStats.forEach((stat) => {
          const aliases = stat === "브레이크 피해" ? ["브레이크 스킬로 주는 피해", "브레이크 피해", "브레이크 대미지"] : [stat];
          for (const alias of aliases) {
            const statIndex = clause.indexOf(alias);
            if (statIndex < 0) continue;
            const tail = clause.slice(statIndex);
            const percent = tail.match(/(-?\d+(?:\.\d+)?)\s*%/);
            if (!percent) continue;
            const betweenStatAndValue = tail.slice(0, percent.index);
            if (betweenStatAndValue.includes("×") || betweenStatAndValue.includes("*")) {
              continue;
            }
            const valueEnd = statIndex + percent.index + percent[0].length;
            const directionText = clause.slice(statIndex, Math.min(clause.length, valueEnd + 18));
            let value = Number(percent[1]);
            if (directionText.includes("감소")) value = -Math.abs(value);
            value *= stackCount;
            const bucket = conditional ? "conditional" : "base";
            result[stat][bucket] += value;
            result[stat].sources.push({
              rune: rune.name,
              value,
              conditional,
              clause,
              stackCount,
            });
            break;
          }
        });
      });
    });
    return result;
  };

  window.RUNE_ANALYSIS = { analyzeCoreStats, trackedStats };

  const formatPercent = (value) => {
    const rounded = Math.round((value + Number.EPSILON) * 10) / 10;
    return `${rounded > 0 ? "+" : ""}${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
  };

  const researchStatValue = (selectedRunes, label) => {
    const patterns = {
      "광역 강화": ["광역 피해", "광역 강화"],
      "콤보 강화": ["콤보 피해", "콤보 강화"],
      "궁극기 강화": ["궁극기 스킬로 주는 피해", "궁극기 피해"],
    };
    const names = patterns[label] || [label];
    let base = 0;
    let conditional = 0;
    selectedRunes.forEach((rune) => {
      effectLines(rune.effect).forEach((line) => {
        const isConditional = conditionalWords.some((word) => line.includes(word));
        names.forEach((name) => {
          const index = line.indexOf(name);
          if (index < 0) return;
          const tail = line.slice(index);
          const match = tail.match(/(-?\d+(?:\.\d+)?)\s*%/);
          if (!match || tail.slice(0, match.index).includes("×")) return;
          let value = Number(match[1]);
          if (tail.slice(0, match.index + match[0].length + 18).includes("감소")) value = -Math.abs(value);
          const stack = line.match(/최대\s*(\d+)\s*회(?:까지)?\s*중첩/);
          value *= stack ? Number(stack[1]) : 1;
          if (isConditional) conditional += value;
          else base += value;
        });
      });
    });
    return { base, conditional };
  };

  const enemyReceivedDamageValue = (selectedRunes) => {
    let value = 0;
    selectedRunes.forEach((rune) => {
      effectLines(rune.effect).forEach((line) => {
        if (!/(방어구 파괴|약화 효과)/.test(line) || !line.includes("받는 피해")) return;
        const match = line.match(/받는 피해(?:를|가)?\s*(\d+(?:\.\d+)?)\s*%\s*증가/);
        if (match) value += Number(match[1]);
      });
    });
    return value;
  };

  const numberInput = (name, label, value) => `
    <label><span>${label}</span><div><input type="number" min="0" step="0.1" value="${value || ""}" data-rune-research="${name}" /><em>${name === "baseAttack" ? "" : "%"}</em></div></label>`;

  const renderDamageResearch = (selected, coreStats) => {
    const input = state.research;
    const attackBase = coreStats["공격력"].base;
    const attackConditional = attackBase + coreStats["공격력"].conditional;
    const outgoingBase = coreStats["적에게 주는 피해"].base;
    const outgoingConditional = outgoingBase + coreStats["적에게 주는 피해"].conditional;
    const received = enemyReceivedDamageValue(selected) + Number(input.receivedDamage || 0);
    const manualAttack = Number(input.enchantAttack || 0) + Number(input.artifactAttack || 0);
    const bBase = 1 + (attackBase + manualAttack) / 100;
    const bConditional = 1 + (attackConditional + manualAttack) / 100;
    const cBase = (1 + outgoingBase / 100) * (1 + received / 100);
    const cConditional = (1 + outgoingConditional / 100) * (1 + received / 100);
    const reinforcement = ["연타 피해", "강타 피해"].reduce(
      (sum, stat) => sum + coreStats[stat].base + coreStats[stat].conditional,
      0,
    );
    const extraReinforcement = ["광역 강화", "콤보 강화", "궁극기 강화"].reduce((sum, stat) => {
      const value = researchStatValue(selected, stat);
      return sum + value.base + value.conditional;
    }, 0);
    const d = 1 + (reinforcement + extraReinforcement) / 100;
    const h = 1 + Number(input.skillCoefficient || 0) / 100;
    const estimatedBase = Math.floor(Number(input.baseAttack || 0) * bBase);
    const estimatedConditional = Math.floor(Number(input.baseAttack || 0) * bConditional);
    return `<section class="rune-research">
      <div class="rune-research-head"><div><span>선택 룬 기반</span><h4>대미지 배율 연구</h4></div><small>직접 피해 계수는 계산에서 제외</small></div>
      <div class="rune-research-inputs">
        ${numberInput("baseAttack", "A · 기본 공격력", input.baseAttack)}
        ${numberInput("enchantAttack", "공증 인챈트", input.enchantAttack)}
        ${numberInput("artifactAttack", "공증 아티팩트", input.artifactAttack)}
        ${numberInput("receivedDamage", "추가 받피증", input.receivedDamage)}
        ${numberInput("skillCoefficient", "H · 특정 스킬 강화", input.skillCoefficient)}
      </div>
      <div class="rune-research-results">
        <article><b>B · 공증</b><strong>${bBase.toFixed(3)} <i>상시</i></strong><strong>${bConditional.toFixed(3)} <i>조건부</i></strong><small>예상 공격력 ${estimatedBase.toLocaleString()} / ${estimatedConditional.toLocaleString()}</small></article>
        <article><b>C · 피증</b><strong>${cBase.toFixed(3)} <i>상시</i></strong><strong>${cConditional.toFixed(3)} <i>조건부</i></strong><small>주피증 × 받피증(${formatPercent(received)})</small></article>
        <article><b>D · 강화류</b><strong>${d.toFixed(3)}</strong><small>연타·강타·광역·콤보·궁극기 최대치</small></article>
        <article><b>H · 스킬계수</b><strong>${h.toFixed(3)}</strong><small>클래스별 직접 입력</small></article>
      </div>
    </section>`;
  };

  const visibleRunes = () => {
    const query = state.query.trim().toLowerCase();
    return runes
      .filter((rune) => state.type === "전체" || rune.type === state.type)
      .filter((rune) => {
        if (!query) return true;
        return `${rune.name} ${effectLines(rune.effect).join(" ")}`
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const typeCompare = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
        if (typeCompare !== 0) return typeCompare;
        if (a.grade !== b.grade) return a.grade === "신화" ? -1 : 1;
        return a.name.localeCompare(b.name, "ko");
      });
  };

  const renderFilters = () => {
    const root = document.getElementById("runeTypeFilters");
    if (!root) return;
    root.innerHTML = typeOrder
      .map(
        (type) => `
          <button type="button" class="rune-type-button ${state.type === type ? "active" : ""}"
            data-rune-type="${type}" aria-pressed="${state.type === type}">
            ${type === "전체" ? "전체" : `${type} 룬`}
            <span>${type === "전체" ? runes.length : runes.filter((rune) => rune.type === type).length}</span>
          </button>`,
      )
      .join("");
  };

  const renderDetail = (rune) => {
    const detail = document.getElementById("runeDetail");
    if (!detail) return;
    if (!rune) {
      detail.innerHTML = `<div class="rune-empty">조건에 맞는 룬이 없습니다.</div>`;
      return;
    }
    const lines = effectLines(rune.effect);
    detail.innerHTML = `
      <div class="rune-detail-head ${rune.grade === "신화" ? "mythic" : "legendary"}">
        <div>
          <span class="rune-detail-type">시즌 2 · ${escapeHtml(rune.type)} 룬</span>
          <h3>${escapeHtml(rune.name)}</h3>
        </div>
        <div class="rune-grade-block">
          <strong>${escapeHtml(rune.grade)}</strong>
          <span>★ ${escapeHtml(rune.star)}</span>
        </div>
      </div>
      <div class="rune-effect-section">
        <h4>룬 효과</h4>
        <ol class="rune-effect-list">
          ${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ol>
      </div>
      <div class="rune-detail-meta">
        <span>적용 클래스</span><strong>${escapeHtml(rune.class || "공용")}</strong>
      </div>`;
  };

  const renderBuildSummary = () => {
    const root = document.getElementById("runeBuildSummary");
    if (!root) return;
    const selected = state.selectedRunes
      .map((key) => runes.find((rune) => runeKey(rune) === key))
      .filter(Boolean);
    const coreStats = analyzeCoreStats(selected);
    root.innerHTML = `
      <div class="rune-build-head">
        <div><span>선택 룬 종합</span><h3>룬 세팅 효과</h3></div>
        <div class="rune-slot-status">
          ${["무기", "방어구", "엠블럼"].map((type) => `<span>${type} <b>${selected.filter((rune) => rune.type === type).length}/${slotLimits[type]}</b></span>`).join("")}
          ${selected.length ? '<button type="button" data-rune-clear>전체 해제</button>' : ""}
        </div>
      </div>
      ${selected.length ? `
        <div class="rune-total-section">
          <div class="rune-total-heading">
            <strong>핵심 효과 합계</strong>
            <span>조건부 단순 합계는 모든 조건이 동시에 적용된다고 가정한 참고값입니다.</span>
          </div>
          <div class="rune-total-grid">
            ${trackedStats.map((stat) => {
              const data = coreStats[stat];
              const total = data.base + data.conditional;
              return `<article class="rune-total-card">
                <span>${stat}</span>
                <div class="rune-total-comparison">
                  <div>
                    <small>상시 합계</small>
                    <strong class="${data.base < 0 ? "negative" : ""}">${formatPercent(data.base)}</strong>
                  </div>
                  <div>
                    <small>조건부 합계</small>
                    <strong class="${total < 0 ? "negative" : ""}">${formatPercent(total)}</strong>
                  </div>
                </div>
                ${data.sources.length ? `<details><summary>출처 ${data.sources.length}개</summary><ul>${data.sources.map((source) => `<li><b>${escapeHtml(source.rune)}${source.stackCount > 1 ? ` <i>최대 ${source.stackCount}중첩</i>` : ""}</b><span class="${source.value < 0 ? "negative" : ""}">${source.conditional ? "조건부" : "상시"} ${formatPercent(source.value)}</span></li>`).join("")}</ul></details>` : ""}
              </article>`;
            }).join("")}
          </div>
        </div>
        ${renderDamageResearch(selected, coreStats)}
        <div class="rune-build-groups">
          ${["무기", "방어구", "엠블럼"].map((type) => {
            const group = selected.filter((rune) => rune.type === type);
            if (!group.length) return "";
            return `<section class="rune-build-group">
              <h4>${type} 룬 <span>${group.length}개</span></h4>
              ${group.map((rune) => `<article class="rune-build-rune">
                <div class="rune-build-rune-head"><strong>${escapeHtml(rune.name)}</strong><button type="button" data-rune-toggle="${escapeHtml(runeKey(rune))}">해제</button></div>
                <ul>${effectLines(rune.effect).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
              </article>`).join("")}
            </section>`;
          }).join("")}
        </div>` : '<div class="rune-build-empty">룬 상세에서 <b>세팅에 추가</b>를 누르면 여러 룬의 효과를 이곳에서 함께 확인할 수 있습니다.</div>'}`;
  };

  const render = () => {
    renderFilters();
    const list = visibleRunes();
    if (!list.some((rune) => rune.name === state.selectedName)) {
      state.selectedName = list[0]?.name || "";
    }
    const listRoot = document.getElementById("runeList");
    const title = document.getElementById("runeListTitle");
    const count = document.getElementById("runeListCount");
    if (title) title.textContent = state.type === "전체" ? "전체 룬" : `${state.type} 룬`;
    if (count) count.textContent = `${list.length}개`;
    if (listRoot) {
      listRoot.innerHTML = list
        .map((rune) => {
          const active = rune.name === state.selectedName;
          const checked = state.selectedRunes.includes(runeKey(rune));
          return `<div class="rune-list-item ${checked ? "selected" : ""}">
            <label class="rune-list-check" title="세팅에 추가">
              <input type="checkbox" data-rune-check="${escapeHtml(runeKey(rune))}" ${checked ? "checked" : ""} />
              <span aria-hidden="true"></span>
            </label>
            <button type="button" class="rune-list-info" data-rune-detail="${escapeHtml(runeKey(rune))}">
              <span class="rune-list-grade ${rune.grade === "신화" ? "mythic" : "legendary"}">${escapeHtml(rune.grade)}</span>
              <span class="rune-list-type">${escapeHtml(rune.type)}</span>
              <strong>${escapeHtml(rune.name)}</strong>
              <small>★${escapeHtml(rune.star)}</small>
            </button>
          </div>`;
        })
        .join("");
    }
    renderDetail(list.find((rune) => rune.name === state.selectedName));
    renderBuildSummary();
  };

  document.addEventListener("click", (event) => {
    const modalClose = event.target.closest("[data-rune-modal-close]");
    if (modalClose) {
      const modal = document.getElementById("runeModal");
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("rune-modal-open");
      return;
    }
    const clearButton = event.target.closest("[data-rune-clear]");
    if (clearButton) {
      state.selectedRunes = [];
      render();
      return;
    }
    const toggleButton = event.target.closest("[data-rune-toggle]");
    if (toggleButton) {
      const key = toggleButton.dataset.runeToggle;
      const rune = runes.find((item) => runeKey(item) === key);
      if (!rune) return;
      if (state.selectedRunes.includes(key)) {
        state.selectedRunes = state.selectedRunes.filter((item) => item !== key);
      } else {
        const sameType = state.selectedRunes.filter((item) => item.startsWith(`${rune.type}:`));
        if (sameType.length >= slotLimits[rune.type]) {
          const oldest = sameType[0];
          state.selectedRunes = state.selectedRunes.filter((item) => item !== oldest);
        }
        state.selectedRunes.push(key);
      }
      render();
      return;
    }
    const typeButton = event.target.closest("[data-rune-type]");
    if (typeButton) {
      state.type = typeButton.dataset.runeType;
      state.selectedName = "";
      render();
      return;
    }
    const runeButton = event.target.closest("[data-rune-detail]");
    if (runeButton) {
      const rune = runes.find((item) => runeKey(item) === runeButton.dataset.runeDetail);
      if (!rune) return;
      state.selectedName = rune.name;
      renderDetail(rune);
      const modal = document.getElementById("runeModal");
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("rune-modal-open");
    }
  });

  document.addEventListener("change", (event) => {
    const researchInput = event.target.closest("[data-rune-research]");
    if (researchInput) {
      state.research[researchInput.dataset.runeResearch] = Number(researchInput.value || 0);
      renderBuildSummary();
      return;
    }
    const checkbox = event.target.closest("[data-rune-check]");
    if (!checkbox) return;
    const key = checkbox.dataset.runeCheck;
    const rune = runes.find((item) => runeKey(item) === key);
    if (!rune) return;
    if (checkbox.checked) {
      const sameType = state.selectedRunes.filter((item) => item.startsWith(`${rune.type}:`));
      if (sameType.length >= slotLimits[rune.type]) {
        state.selectedRunes = state.selectedRunes.filter((item) => item !== sameType[0]);
      }
      if (!state.selectedRunes.includes(key)) state.selectedRunes.push(key);
    } else {
      state.selectedRunes = state.selectedRunes.filter((item) => item !== key);
    }
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = document.getElementById("runeModal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("rune-modal-open");
  });

  document.getElementById("runeSearchInput")?.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.selectedName = "";
    render();
  });

  render();
})();
