const defaultState = () => ({
        critStat: 0,
        extraStat: 0,
        s1Awakened: false,
        erosion: false,
        night: false,
        selectedClass: "",
        viewMode: "all",
        classValues: {},
        values: {},
      });

      let state = loadState();

      function loadState() {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
          return {
            ...defaultState(),
            ...saved,
            classValues: saved?.classValues || {},
            values: saved?.values || {},
          };
        } catch {
          return defaultState();
        }
      }

      function saveState() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
          // 저장이 제한된 환경에서도 계산 기능은 계속 동작합니다.
        }
      }

      const fmt = (value) =>
        `${Number.isFinite(value) ? value.toFixed(2) : "0.00"}%`;
      const num = (value) => Math.max(0, Number(value) || 0);
      const selected = (id) => !!state.values[id];
      const count = (id) => num(state.values[id]);

      function baseValue(item, maximum = false) {
        if (!maximum && item.minBase !== undefined) return item.minBase;
        if (item.season === 1 && maximum && item.awakened !== undefined)
          return item.awakened;
        return item.base || 0;
      }

      function contribution(item, awakened = false) {
        const multiplier =
          item.input === "number" ? count(item.id) : selected(item.id) ? 1 : 0;
        if (!multiplier) return { base: 0, erosion: 0, night: 0 };
        return {
          base: baseValue(item, awakened) * multiplier,
          erosion: (item.erosion || 0) * multiplier,
          night: (item.night || 0) * multiplier,
        };
      }

      function sumItems(items, awakened = false) {
        return items.reduce(
          (sum, item) => {
            if (item.stat || item.input === "display") return sum;
            const c = contribution(item, awakened);
            sum.base += c.base;
            sum.erosion += c.erosion;
            sum.night += c.night;
            return sum;
          },
          { base: 0, erosion: 0, night: 0 },
        );
      }

      function selectedConditionInfo(items) {
        const chosen = items.filter((item) => selected(item.id));
        return {
          awakening: chosen.some(
            (item) => item.season === 1 && item.awakened !== undefined,
          ),
          erosion: chosen.some((item) => (item.erosion || 0) !== 0),
          night: chosen.some((item) => (item.night || 0) !== 0),
          activation: chosen.some(
            (item) =>
              item.minBase !== undefined && item.minBase !== (item.base || 0),
          ),
          penalty: chosen.some((item) => (item.minBase || 0) < 0),
        };
      }

      function hasVariableCondition(info) {
        return !!(
          info.awakening ||
          info.erosion ||
          info.night ||
          info.activation ||
          info.penalty
        );
      }

      function minimumConditionText(items) {
        const labels = [
          ...new Set(
            items
              .filter((item) => selected(item.id))
              .filter(
                (item) =>
                  item.awakened !== undefined ||
                  item.erosion ||
                  item.night ||
                  item.minBase !== undefined,
              )
              .map(
                (item) =>
                  item.conditionLabel ||
                  (item.awakened !== undefined ? "각성 해제" : "조건 비활성"),
              ),
          ),
        ];
        return labels.join(" · ");
      }

      function activeClassEffects() {
        if (!state.selectedClass) return [];
        return classEffects.filter(
          (effect) =>
            effect.className === state.selectedClass &&
            !!state.classValues[effect.id],
        );
      }

      function sumClassEffects() {
        return activeClassEffects().reduce(
          (sum, effect) => {
            sum.crit += effect.crit || 0;
            sum.damage += effect.damage || 0;
            sum.extra += effect.extra || 0;
            return sum;
          },
          { crit: 0, damage: 0, extra: 0 },
        );
      }

      function scenarioDimensions(items) {
        const chosen = items.filter((item) => selected(item.id));
        const dims = [];
        if (chosen.some((item) => item.awakened !== undefined)) {
          dims.push({
            key: "awakening",
            states: [
              { value: true, label: "각성" },
              { value: false, label: "비각성" },
            ],
          });
        }
        if (chosen.some((item) => (item.erosion || 0) !== 0)) {
          dims.push({
            key: "erosion",
            states: [
              { value: "normal", label: "침식" },
              { value: "over100", label: "침식 100 이상" },
              { value: "polluted", label: "오염" },
            ],
          });
        }
        if (chosen.some((item) => (item.night || 0) !== 0)) {
          dims.push({
            key: "night",
            states: [
              { value: true, label: "밤의 축복" },
              { value: false, label: "밤의 축복 해제" },
            ],
          });
        }
        if (chosen.some((item) => item.id === "crit-s1-outlaw")) {
          dims.push({
            key: "outlaw",
            states: [
              { value: true, label: "무법자 발동" },
              { value: false, label: "무법자 미발동" },
            ],
          });
        }
        return dims;
      }

      function cartesianScenarios(dimensions) {
        if (!dimensions.length) return [];
        return dimensions.reduce(
          (rows, dim) => {
            const next = [];
            rows.forEach((row) =>
              dim.states.forEach((state) => {
                next.push({
                  values: { ...row.values, [dim.key]: state.value },
                  labels: [...row.labels, state.label],
                });
              }),
            );
            return next;
          },
          [{ values: {}, labels: [] }],
        );
      }

      function itemScenarioValue(item, scenario, category) {
        if (!selected(item.id) || item.stat || item.input === "display")
          return { base: 0, condition: 0 };

        if (item.id === "crit-s1-outlaw") {
          return { base: scenario.outlaw === false ? -10 : 10, condition: 0 };
        }
        if ((item.erosion || 0) !== 0) {
          if (scenario.erosion === "polluted") return { base: 0, condition: 0 };
          if (scenario.erosion === "over100") {
            return category === "extra"
              ? { base: item.base || 0, condition: item.erosion || 0 }
              : { base: (item.base || 0) + (item.erosion || 0), condition: 0 };
          }
          return { base: item.base || 0, condition: 0 };
        }
        if ((item.night || 0) !== 0) {
          return {
            base: item.base || 0,
            condition: scenario.night === false ? 0 : item.night || 0,
          };
        }
        if (item.awakened !== undefined) {
          return {
            base: scenario.awakening === false ? item.base || 0 : item.awakened,
            condition: 0,
          };
        }
        return { base: item.base || 0, condition: 0 };
      }

      function scenarioTotal(items, category, scenario, baseStat, classBonus) {
        let base = 0;
        let condition = 0;
        items.forEach((item) => {
          const part = itemScenarioValue(item, scenario, category);
          base += part.base;
          condition += part.condition;
        });
        if (category === "crit")
          return baseStat + base + classBonus + condition;
        return (
          ((1 + baseStat / 100) * (1 + (base + classBonus) / 100) - 1) * 100 +
          condition
        );
      }

      function conditionScenarioData(items, category, baseStat, classBonus) {
        const dimensions = scenarioDimensions(items);
        const scenarios = dimensions.length
          ? cartesianScenarios(dimensions)
          : [{ values: {}, labels: ["조건 없음"] }];

        const rows = scenarios
          .map((scenario) => ({
            label: scenario.labels.join(" + ") || "조건 없음",
            value: scenarioTotal(
              items,
              category,
              scenario.values,
              baseStat,
              classBonus,
            ),
          }))
          .sort((a, b) => b.value - a.value);

        return {
          rows,
          max: rows[0],
          min: rows[rows.length - 1],
          varies:
            rows.length > 1 &&
            Math.abs(rows[0].value - rows[rows.length - 1].value) > 0.0001,
        };
      }

      function conditionScenarioMarkup(items, category, baseStat, classBonus) {
        const data = conditionScenarioData(
          items,
          category,
          baseStat,
          classBonus,
        );
        if (!data.varies) return "";

        const dims = scenarioDimensions(items);
        const erosionDim = dims.find((dim) => dim.key === "erosion");
        const otherDims = dims.filter((dim) => dim.key !== "erosion");
        let detailTable = "";

        if (erosionDim) {
          const rowScenarios = otherDims.length
            ? cartesianScenarios(otherDims)
            : [{ values: {}, labels: [] }];
          const stages = erosionDim.states;
          const rows = rowScenarios
            .map((row) => {
              const values = stages.map((stage) =>
                scenarioTotal(
                  items,
                  category,
                  { ...row.values, erosion: stage.value },
                  baseStat,
                  classBonus,
                ),
              );
              return {
                label: row.labels.join(" + ") || "기본 조건",
                values,
                max: Math.max(...values),
              };
            })
            .sort((a, b) => b.max - a.max);

          const overallMax = Math.max(...rows.flatMap((row) => row.values));
          const head = stages
            .map(
              (stage) =>
                `<div class="condition-result-cell">${stage.label}</div>`,
            )
            .join("");
          const body = rows
            .map(
              (row) => `
          <div class="condition-result-row">
            <div class="condition-result-cell condition-result-name">${row.label}</div>
            ${row.values
              .map(
                (value, stageIndex) => `
              <div class="condition-result-cell condition-result-value${Math.abs(value - overallMax) < 0.0001 ? " is-max" : ""}">
                <span class="condition-stage-label">${stages[stageIndex].label}</span>
                <span>${fmt(value)}</span>
              </div>`,
              )
              .join("")}
          </div>`,
            )
            .join("");

          detailTable = `
          <div class="condition-result-table" style="--stage-count:${stages.length}">
            <div class="condition-result-head">
              <div class="condition-result-cell">조건</div>
              ${head}
            </div>
            ${body}
          </div>`;
        } else {
          const detailRows = data.rows
            .map(
              (row, index) => `
          <div class="condition-result-row">
            <div class="condition-result-cell condition-result-name">${row.label}</div>
            <div class="condition-result-cell condition-result-value${index === 0 ? " is-max" : ""}">
              <span class="condition-stage-label">확률</span>
              <span>${fmt(row.value)}</span>
            </div>
          </div>`,
            )
            .join("");

          detailTable = `
          <div class="condition-result-table" style="--stage-count:1">
            <div class="condition-result-head">
              <div class="condition-result-cell">조건</div>
              <div class="condition-result-cell">확률</div>
            </div>
            ${detailRows}
          </div>`;
        }

        return `
        <div class="extreme-reasons">
          <div><strong>최대조건</strong> : ${data.max.label}</div>
          <div><strong>최소조건</strong> : ${data.min.label}</div>
        </div>
        <details class="condition-detail">
          <summary>자세히 보기</summary>
          ${detailTable}
        </details>`;
      }

      function calculate() {
        const critStat = num(state.critStat);
        const extraStat = num(state.extraStat);
        const baseCrit = (0.5 - 1000 / (critStat + 2000)) * 100;
        const baseDamage = (1.4 + critStat / 5000) * 100;
        const baseExtra = (extraStat / 13000) * 100;

        const critMin = sumItems(critItems, false);
        const critMax = sumItems(critItems, true);
        const damage = sumItems(damageItems, false);
        const extraMin = sumItems(extraItems, false);
        const extraMax = sumItems(extraItems, true);
        const classBonus = sumClassEffects();

        const critMaxCondition = critMax.erosion + critMax.night;
        const extraMaxCondition = extraMax.erosion + extraMax.night;

        const totalCritMin = baseCrit + critMin.base + classBonus.crit;
        const totalCritMax =
          baseCrit + critMax.base + classBonus.crit + critMaxCondition;
        const totalDamage =
          baseDamage * (1 + (damage.base + classBonus.damage) / 100);
        const extraBasicMin =
          ((1 + baseExtra / 100) *
            (1 + (extraMin.base + classBonus.extra) / 100) -
            1) *
          100;
        const extraBasicMax =
          ((1 + baseExtra / 100) *
            (1 + (extraMax.base + classBonus.extra) / 100) -
            1) *
          100;
        const totalExtraMin = extraBasicMin;
        const totalExtraMax = extraBasicMax + extraMaxCondition;

        const cappedCritMin = Math.min(Math.max(totalCritMin, 0), 100);
        const cappedCritMax = Math.min(Math.max(totalCritMax, 0), 100);
        const efficiencyMin =
          (1 + (cappedCritMin / 100) * (totalDamage / 100 - 1)) * 100;
        const efficiencyMax =
          (1 + (cappedCritMax / 100) * (totalDamage / 100 - 1)) * 100;

        // 침식 룬은 16.5% → 33% → 0% 순서로 반복된다.
        const critErosionSelected = selected("crit-s2-seal");
        const extraErosionSelected = selected("extra-s2-boundary");
        const critCycle = critErosionSelected
          ? {
              normal: totalCritMax - 16.5,
              over100: totalCritMax,
              polluted: totalCritMax - 33,
            }
          : null;
        const critCycleEfficiency = critCycle
          ? {
              normal:
                (1 +
                  (Math.min(Math.max(critCycle.normal, 0), 100) / 100) *
                    (totalDamage / 100 - 1)) *
                100,
              over100: efficiencyMax,
              polluted:
                (1 +
                  (Math.min(Math.max(critCycle.polluted, 0), 100) / 100) *
                    (totalDamage / 100 - 1)) *
                100,
            }
          : null;
        const extraWithoutErosionBase =
          extraMax.base - (extraErosionSelected ? 16.5 : 0);
        const extraPolluted =
          ((1 + baseExtra / 100) *
            (1 + (extraWithoutErosionBase + classBonus.extra) / 100) -
            1) *
            100 +
          (extraMax.night || 0);
        const extraCycle = extraErosionSelected
          ? {
              normal: totalExtraMax - 16.5,
              over100: totalExtraMax,
              polluted: extraPolluted,
            }
          : null;

        return {
          baseCrit,
          baseDamage,
          baseExtra,
          crit: critMax,
          critMin,
          damage,
          extra: extraMax,
          extraMin,
          classBonus,
          critCondition: critMaxCondition,
          extraCondition: extraMaxCondition,
          totalCrit: totalCritMax,
          totalCritMin,
          totalDamage,
          extraBasic: extraBasicMax,
          extraBasicMin,
          totalExtra: totalExtraMax,
          totalExtraMin,
          efficiency: efficiencyMax,
          efficiencyMin,
          critCycle,
          critCycleEfficiency,
          extraCycle,
          critConditionInfo: selectedConditionInfo(critItems),
          extraConditionInfo: selectedConditionInfo(extraItems),
        };
      }

      function badges(item) {
        const result = [];
        if (item.common) result.push('<span class="badge common">공통</span>');
        if (item.season === 1)
          result.push('<span class="badge s1">시즌1</span>');
        if (item.season === 2)
          result.push('<span class="badge s2">시즌2</span>');
        if (item.type)
          result.push(`<span class="badge type">${item.type}</span>`);
        return result.join("");
      }

      function rowValues(item, category) {
        if (item.stat) {
          const result = calculate();
          const value =
            category === "crit"
              ? result.baseCrit
              : category === "extra"
                ? result.baseExtra
                : result.baseDamage;
          return [fmt(value), ""];
        }
        const base = item.base || 0;
        const awakening =
          item.awakened !== undefined ? item.awakened - base : 0;
        const condition = awakening + (item.erosion || 0) + (item.night || 0);
        return [fmt(base), condition ? fmt(condition) : ""];
      }

      function effectValueText(effect) {
        const parts = [];
        if (effect.crit) parts.push(`치명타 +${effect.crit}%`);
        if (effect.damage) parts.push(`치명타 피해 +${effect.damage}%`);
        if (effect.extra) parts.push(`추가타 +${effect.extra}%`);
        return parts.join(" · ");
      }

      function renderClassControls() {
        const select = document.getElementById("classSelect");
        const relevantEffects = classEffects.filter(
          (effect) => effect.crit || effect.damage || effect.extra,
        );
        const classes = [
          ...new Set(relevantEffects.map((effect) => effect.className)),
        ];
        select.innerHTML = [
          '<option value="">선택 없음</option>',
          ...classes.map(
            (className) => `<option value="${className}">${className}</option>`,
          ),
        ].join("");
        select.value = state.selectedClass;

        const target = document.getElementById("classEffectOptions");
        if (!state.selectedClass) {
          target.innerHTML =
            '<div class="class-effect-empty">치명타·치명타 피해·추가타 관련 스킬이 있는 클래스만 선택 가능하며, 해당 클래스의 효과가 표시됩니다.</div>';
          return;
        }

        const effects = relevantEffects.filter(
          (effect) => effect.className === state.selectedClass,
        );
        target.innerHTML = effects
          .map(
            (effect) => `
        <label class="class-effect-toggle">
          <input type="checkbox" data-role="class-check" data-id="${effect.id}" ${state.classValues[effect.id] ? "checked" : ""} />
          <span>
            <span class="class-effect-name">${effect.label}</span>
            <span class="class-effect-values">${effectValueText(effect)}</span>
          </span>
        </label>`,
          )
          .join("");
      }

      function renderList(targetId, items, category) {
        const target = document.getElementById(targetId);
        target.innerHTML = "";
        let lastGroup = null;

        items.forEach((item) => {
          if (item.group !== lastGroup) {
            const heading = document.createElement("div");
            heading.className = "group-title";
            heading.textContent = item.group;
            target.appendChild(heading);
            lastGroup = item.group;
          }

          const row = document.createElement("div");
          const slotDisabled = isSlotDisabled(item);
          row.className =
            item.input === "number"
              ? `item-row ${item.stat ? "stat-row" : "number-row"}`
              : `item-row${slotDisabled ? " slot-disabled" : ""}`;
          const values = rowValues(item, category);

          let control = "";
          if (item.input === "number") {
            const current = item.stat
              ? category === "crit"
                ? state.critStat
                : state.extraStat
              : count(item.id);
            control = item.stat
              ? `<input type="text" inputmode="numeric" pattern="[0-9]*" class="stat-input" data-category="${category}" data-id="${item.id}" data-role="number" value="${current}" aria-label="${item.name}" autocomplete="off" />`
              : `<input type="number" min="0" step="1" data-category="${category}" data-id="${item.id}" data-role="number" value="${current}" aria-label="${item.name}" />`;
          } else if (item.input === "display") {
            control = "<span></span>";
          } else {
            control = `<input type="checkbox" data-id="${item.id}" data-role="check" ${selected(item.id) ? "checked" : ""} ${slotDisabled ? "disabled" : ""} aria-label="${item.name}" />`;
          }

          row.innerHTML = `
          <div>${control}</div>
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            ${item.note ? `<div class="item-note">${item.note}</div>` : ""}
            <div class="item-badges">${badges(item)}</div>
          </div>
          <div class="value">${values[0]}</div>
          <div class="value ${values[1] ? "" : "muted"}">${values[1] || "—"}</div>`;
          target.appendChild(row);
        });
      }

      function scenarioRangeText(data) {
        return data.varies
          ? `${fmt(data.max.value)} (${fmt(data.min.value)})`
          : fmt(data.max.value);
      }

      function applyViewMode() {
        const mode = ["all", "crit", "extra"].includes(state.viewMode)
          ? state.viewMode
          : "all";
        state.viewMode = mode;

        document.querySelectorAll("[data-category-view]").forEach((element) => {
          const category = element.dataset.categoryView;
          element.classList.toggle(
            "view-hidden",
            mode !== "all" && mode !== category,
          );
        });
        document.querySelectorAll("[data-live-category]").forEach((element) => {
          const category = element.dataset.liveCategory;
          element.classList.toggle(
            "view-hidden",
            mode !== "all" && mode !== category,
          );
        });
        document.querySelectorAll("[data-view-mode]").forEach((button) => {
          const active = button.dataset.viewMode === mode;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        const summaryGrid = document.querySelector(".summary-grid");
        const columns = document.querySelector(".columns");
        const liveSummary = document.getElementById("mobileLiveSummary");
        const single = mode === "extra";
        if (summaryGrid)
          summaryGrid.style.gridTemplateColumns = single ? "1fr" : "";
        if (columns) columns.style.gridTemplateColumns = single ? "1fr" : "";
        if (liveSummary)
          liveSummary.style.gridTemplateColumns = single ? "1fr" : "";
      }

      function render() {
        const active = document.activeElement;
        const activeId = active?.dataset?.id || null;
        const cursor =
          typeof active?.selectionStart === "number"
            ? active.selectionStart
            : null;

        renderClassControls();

        renderList("critList", critItems, "crit");
        renderList("extraList", extraItems, "extra");
        renderList("damageList", damageItems, "damage");

        const r = calculate();
        const critScenario = conditionScenarioData(
          critItems,
          "crit",
          r.baseCrit,
          r.classBonus.crit,
        );
        const extraScenario = conditionScenarioData(
          extraItems,
          "extra",
          r.baseExtra,
          r.classBonus.extra,
        );

        if (critScenario.varies) {
          document.getElementById("summaryCrit").innerHTML =
            `<span class="range-max">최대 ${fmt(critScenario.max.value)}</span><span class="range-min">(최소 ${fmt(critScenario.min.value)})</span>`;
          document.getElementById("summaryCrit").className = "range-value";
        } else {
          document.getElementById("summaryCrit").textContent = fmt(
            critScenario.max.value,
          );
          document.getElementById("summaryCrit").className = "summary-value";
        }

        if (extraScenario.varies) {
          document.getElementById("summaryExtra").innerHTML =
            `<span class="range-max">최대 ${fmt(extraScenario.max.value)}</span><span class="range-min">(최소 ${fmt(extraScenario.min.value)})</span>`;
          document.getElementById("summaryExtra").className = "range-value";
        } else {
          document.getElementById("summaryExtra").textContent = fmt(
            extraScenario.max.value,
          );
          document.getElementById("summaryExtra").className = "summary-value";
        }

        document.getElementById("mobileCritValue").textContent =
          scenarioRangeText(critScenario);
        document.getElementById("mobileExtraValue").textContent =
          scenarioRangeText(extraScenario);
        document.getElementById("mobileDamageValue").textContent = fmt(
          r.totalDamage,
        );
        document.getElementById("mobileEfficiencyValue").textContent = fmt(
          r.efficiency,
        );
        applyViewMode();

        document.getElementById("summaryCritCondition").innerHTML =
          conditionScenarioMarkup(
            critItems,
            "crit",
            r.baseCrit,
            r.classBonus.crit,
          );
        document.getElementById("summaryExtraCondition").innerHTML =
          conditionScenarioMarkup(
            extraItems,
            "extra",
            r.baseExtra,
            r.classBonus.extra,
          );
        document.getElementById("summaryDamageCondition").textContent = "";
        document.getElementById("summaryEfficiencyCondition").textContent =
          r.critCycleEfficiency
            ? `반복 : ${fmt(r.critCycleEfficiency.normal)}(침식) → ${fmt(r.critCycleEfficiency.over100)}(100 이상) → ${fmt(r.critCycleEfficiency.polluted)}(오염)`
            : critScenario.varies
              ? `최소 조건 시 ${fmt(r.efficiencyMin)}`
              : "";

        document.getElementById("critTotal").textContent = fmt(r.totalCrit);
        document.getElementById("extraTotal").textContent = fmt(r.totalExtra);
        document.getElementById("damageTotal").textContent = fmt(r.totalDamage);
        document.getElementById("summaryDamage").textContent = fmt(r.totalDamage);
        document.getElementById("summaryEfficiency").textContent = fmt(
          r.efficiency,
        );

        document.getElementById("summaryCritSub").textContent =
          `기본 ${fmt(r.baseCrit)} + 룬 ${fmt(r.crit.base)}${r.classBonus.crit ? ` + 클래스 ${fmt(r.classBonus.crit)}` : ""}${r.critCondition ? ` + 조건부 ${fmt(r.critCondition)}` : ""}`;
        document.getElementById("summaryExtraSub").textContent =
          `기본 ${fmt(r.baseExtra)} + 룬 ${fmt(r.extra.base + r.classBonus.extra)}${r.classBonus.extra ? ` (클래스 ${fmt(r.classBonus.extra)} 포함)` : ""}${r.extraCondition ? ` + 조건부 ${fmt(r.extraCondition)}` : ""}`;
        document.getElementById("summaryDamageSub").textContent =
          `기본 ${fmt(r.baseDamage)} × (1 + 항목 ${r.damage.base.toFixed(2)}%${r.classBonus.damage ? ` + 클래스 ${r.classBonus.damage.toFixed(2)}%` : ""})`;

        if (activeId) {
          const restored = document.querySelector(`[data-id="${activeId}"]`);
          if (restored) {
            restored.focus();
            if (
              cursor !== null &&
              typeof restored.setSelectionRange === "function"
            ) {
              restored.setSelectionRange(cursor, cursor);
            }
          }
        }

        document.getElementById("calculationDetail").textContent =
          `① 치명타 확률
최대: ${r.baseCrit.toFixed(2)} + ${r.crit.base.toFixed(2)} + ${r.classBonus.crit.toFixed(2)} + ${r.critCondition.toFixed(2)} = ${r.totalCrit.toFixed(2)}%
최소: ${r.baseCrit.toFixed(2)} + ${r.critMin.base.toFixed(2)} + ${r.classBonus.crit.toFixed(2)} = ${r.totalCritMin.toFixed(2)}%

② 추가타 확률
최대: ((1 + ${r.baseExtra.toFixed(2)} ÷ 100) × (1 + (${r.extra.base.toFixed(2)} + ${r.classBonus.extra.toFixed(2)}) ÷ 100) − 1) × 100 + ${r.extraCondition.toFixed(2)} = ${r.totalExtra.toFixed(2)}%
최소: ((1 + ${r.baseExtra.toFixed(2)} ÷ 100) × (1 + (${r.extraMin.base.toFixed(2)} + ${r.classBonus.extra.toFixed(2)}) ÷ 100) − 1) × 100 = ${r.totalExtraMin.toFixed(2)}%

③ 치명타 피해
${r.baseDamage.toFixed(2)} × (1 + (${r.damage.base.toFixed(2)} + ${r.classBonus.damage.toFixed(2)}) ÷ 100) = ${r.totalDamage.toFixed(2)}%

④ 최종 효율
(1 + ${Math.min(Math.max(r.totalCrit, 0), 100).toFixed(2)} ÷ 100 × (${r.totalDamage.toFixed(2)} ÷ 100 − 1)) × 100 = ${r.efficiency.toFixed(2)}%`;

        saveState();
      }

      document.addEventListener("input", (event) => {
        const el = event.target;
        if (el.dataset.role !== "number") return;
        if (el.classList.contains("stat-input")) {
          el.value = el.value.replace(/[^0-9]/g, "");
        }
        const value = num(el.value);
        if (el.id === "critStat" || el.dataset.id === "crit-stat")
          state.critStat = value;
        else if (el.id === "extraStat" || el.dataset.id === "extra-stat")
          state.extraStat = value;
        else state.values[el.dataset.id] = value;
        render();
      });

      document.addEventListener("change", (event) => {
        const el = event.target;
        if (el.id === "craftClassSelect") {
          activeCraftClass = el.value;
          activeCraftPart = "전체";
          document
            .getElementById("craftCatalog")
            ?.classList.remove("mobile-detail-open");
          const selected = craftClassMap[activeCraftClass];
          activeCraftIndex = selected
            ? haeyeonItems.findIndex((item) => item.name === selected.weapon)
            : firstCraftIndex();
          renderCraftCatalog();
          return;
        }
        if (el.dataset.role === "check") {
          const item = itemById(el.dataset.id);
          if (!item) return;

          if (el.checked && isExclusiveSlot(item)) {
            allSelectableItems()
              .filter(
                (candidate) =>
                  candidate.type === item.type &&
                  candidate.equipKey !== item.equipKey,
              )
              .forEach((candidate) => {
                state.values[candidate.id] = false;
              });
          }

          sameEquipmentItems(item).forEach((candidate) => {
            state.values[candidate.id] = el.checked;
          });
          render();
          return;
        }
        if (el.dataset.role === "class-check") {
          state.classValues[el.dataset.id] = el.checked;
          render();
          return;
        }
        if (el.id === "classSelect") {
          state.selectedClass = el.value;
          if (state.selectedClass) {
            classEffects
              .filter((effect) => effect.className === state.selectedClass)
              .forEach((effect) => {
                state.classValues[effect.id] = true;
              });
          }
          render();
          return;
        }
      });

      const APP_TAB_STORAGE_KEY = "mabinogi-active-app-tab";
      const applyAppTab = (selectedPage) => {
        const validPage = ["calculator", "setup", "rune", "guide", "craft", "scrollcraft"].includes(
          selectedPage,
        )
          ? selectedPage
          : "calculator";
        document.getElementById("calculatorPage").hidden =
          validPage !== "calculator";
        document.getElementById("setupPage").hidden = validPage !== "setup";
        document.getElementById("runePage").hidden = validPage !== "rune";
        document.getElementById("guidePage").hidden = validPage !== "guide";
        document.getElementById("craftPage").hidden = validPage !== "craft";
        document.getElementById("scrollCraftPage").hidden =
          validPage !== "scrollcraft";
        document.querySelectorAll("[data-app-tab]").forEach((button) => {
          const active = button.dataset.appTab === validPage;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });
      };

      document.addEventListener("click", (event) => {
        const craftFilter = event.target.closest("[data-craft-filter]");
        if (craftFilter) {
          activeCraftPart = craftFilter.dataset.craftFilter;
          document
            .getElementById("craftCatalog")
            ?.classList.remove("mobile-detail-open");
          const firstVisible = firstCraftIndex();
          if (firstVisible >= 0) activeCraftIndex = firstVisible;
          renderCraftCatalog();
          return;
        }
        const craftCatalogItem = event.target.closest("[data-craft-index]");
        if (craftCatalogItem) {
          activeCraftIndex = Number(craftCatalogItem.dataset.craftIndex);
          renderCraftCatalog();
          const catalog = document.getElementById("craftCatalog");
          catalog?.classList.add("mobile-detail-open");
          catalog?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        const craftItem = event.target.closest("[data-craft-item]");
        if (craftItem) {
          const selectedItem = craftItem.dataset.craftItem;
          document.querySelectorAll("[data-craft-item]").forEach((button) => {
            const active = button.dataset.craftItem === selectedItem;
            button.classList.toggle("active", active);
            button.setAttribute("aria-current", String(active));
          });
          document.querySelectorAll("[data-craft-detail]").forEach((detail) => {
            detail.hidden = detail.dataset.craftDetail !== selectedItem;
          });
          return;
        }
        const appTab = event.target.closest("[data-app-tab]");
        if (appTab) {
          const selectedPage = appTab.dataset.appTab;
          applyAppTab(selectedPage);
          localStorage.setItem(APP_TAB_STORAGE_KEY, selectedPage);
          return;
        }
        const button = event.target.closest("[data-view-mode]");
        if (!button) return;
        state.viewMode = button.dataset.viewMode;
        render();
      });

      document.getElementById("resetAll").addEventListener("click", () => {
        state = defaultState();
        render();
      });

      renderCraftCatalog();
      render();
      applyAppTab(
        localStorage.getItem(APP_TAB_STORAGE_KEY) || "calculator",
      );
