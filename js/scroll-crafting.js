(() => {
  const STORAGE_KEY = "mabinogi-scroll-crafting-v1";
  const classes = ["검방", "수도", "빙결", "사제", "기사", "힐러"];
  const planCategoryOrder = [
    "중갑",
    "경갑",
    "천옷",
    "대장기술",
    "목공",
    "매직크래프트",
    "핸디크래프트",
  ];

  const plans = [
    {
      name: "가죽갑옷신발S",
      category: "경갑",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 10],
    },
    {
      name: "그랜드크로스보우",
      category: "목공",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "두꺼운가죽갑옷신발",
      category: "경갑",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "두꺼운전투복신발",
      category: "천옷",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "라이트크로스보우S",
      category: "목공",
      difficulty: "어려움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 3],
      note: "아이데른, 오슬라",
    },
    {
      name: "로터스힐링완드",
      category: "매직크래프트",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "론엣지소드S",
      category: "대장기술",
      difficulty: "어려움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 24],
      note: "아이데른, 오슬라",
    },
    {
      name: "마법유탄부품",
      category: "핸디크래프트",
      difficulty: "어려움",
      yield: 10,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "마블힐링완드S",
      category: "매직크래프트",
      difficulty: "어려움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
      note: "아이데른, 오슬라",
    },
    {
      name: "비늘갑옷신발S",
      category: "중갑",
      difficulty: "어려움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "사슬갑옷신발",
      category: "중갑",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "전문캠파키트",
      category: "핸디크래프트",
      difficulty: "어려움",
      yield: 3,
      counts: [0, 42, 42, 42, 42, 3],
    },
    {
      name: "전투복신발S",
      category: "천옷",
      difficulty: "어려움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 30],
    },
    {
      name: "크레센트엣지소드",
      category: "대장기술",
      difficulty: "쉬움",
      yield: 2,
      counts: [0, 42, 42, 42, 42, 3],
    },
  ];

  const lifeCategories = [
    ["대장기술", "대장기술"],
    ["목공", "목공"],
    ["매직크래프트", "매직크래프트"],
    ["중갑", "중갑제작"],
    ["경갑", "경갑제작"],
    ["천옷", "천옷제작"],
    ["핸디크래프트", "핸디크래프트"],
  ];
  const lifeCategoryLabels = Object.fromEntries(lifeCategories);
  const lifeCategoryGroups = {
    대장기술: "무기",
    목공: "무기",
    매직크래프트: "무기",
    중갑: "방어구",
    경갑: "방어구",
    천옷: "방어구",
    핸디크래프트: "",
  };
  const planExperiencePerScroll = {
    가죽갑옷신발S: 340,
    그랜드크로스보우: 400,
    두꺼운가죽갑옷신발: 299,
    두꺼운전투복신발: 299,
    라이트크로스보우S: 447,
    로터스힐링완드: 400,
    론엣지소드S: 447,
    마법유탄부품: 357,
    마블힐링완드S: 447,
    비늘갑옷신발S: 340,
    사슬갑옷신발: 299,
    전문캠파키트: 312,
    전투복신발S: 340,
    크레센트엣지소드: 400,
  };
  const lifeRequiredExperience = [
    0, 100, 120, 130, 140, 154, 250, 280, 310, 350, 450, 825, 945, 1065, 1545,
    1725, 3175, 3450, 3725, 4875, 7825, 11340, 12180, 12670, 14210, 15925,
    19880, 20480, 21040, 23280, 25280, 26960, 27480, 28040, 29520, 30040,
  ];

  const planNameBreaks = {
    가죽갑옷신발S: ["가죽", "갑옷신발S"],
    그랜드크로스보우: ["그랜드", "크로스보우"],
    두꺼운가죽갑옷신발: ["두꺼운", "가죽갑옷신발"],
    두꺼운전투복신발: ["두꺼운", "전투복신발"],
    로터스힐링완드: ["로터스", "힐링완드"],
    크레센트엣지소드: ["크레센트", "엣지소드"],
    라이트크로스보우S: ["라이트", "크로스보우S"],
  };
  const formatPlanName = (name) =>
    (planNameBreaks[name] || [name]).join("<wbr>");

  const recipes = {
    가죽갑옷신발S: [
      ["상급가죽", 3],
      ["강철괴", 2],
    ],
    그랜드크로스보우: [
      ["목재+", 2],
      ["강철괴", 2],
    ],
    두꺼운가죽갑옷신발: [
      ["가죽+", 2],
      ["강철괴", 1],
    ],
    두꺼운전투복신발: [
      ["옷감+", 2],
      ["강철괴", 1],
    ],
    라이트크로스보우S: [
      ["상급목재", 3],
      ["강철괴", 3],
    ],
    로터스힐링완드: [
      ["목재+", 2],
      ["강철괴", 2],
    ],
    론엣지소드S: [
      ["합금강괴", 3],
      ["가죽+", 3],
    ],
    마법유탄부품: [
      ["마나허브", 2],
      ["협곡의마나석", 0.2],
    ],
    마블힐링완드S: [
      ["상급목재", 3],
      ["강철괴", 3],
    ],
    비늘갑옷신발S: [
      ["합금강괴", 3],
      ["가죽+", 2],
    ],
    사슬갑옷신발: [
      ["강철괴", 2],
      ["가죽+", 1],
    ],
    전문캠파키트: [
      ["나뭇가지", 5],
      ["상급통나무+", 4],
      ["돌멩이", 10],
    ],
    전투복신발S: [
      ["상급옷감", 3],
      ["강철괴", 2],
    ],
    크레센트엣지소드: [
      ["강철괴", 2],
      ["가죽+", 2],
    ],
  };

  const materials = [
    { name: "가죽+", source: "가공-가죽", stock: 499 },
    { name: "상급가죽", source: "가공-가죽", stock: 399 },
    { name: "강철괴", source: "가공-금속", stock: 302 },
    { name: "합금강괴", source: "가공-금속", stock: 155 },
    { name: "목재+", source: "가공-목재", stock: 712 },
    { name: "상급목재", source: "가공-목재", stock: 89 },
    { name: "옷감+", source: "가공-옷감", stock: 321 },
    { name: "상급옷감", source: "가공-옷감", stock: 178 },
    { name: "협곡의마나석", source: "사냥터-얼음협곡", stock: 0 },
    { name: "돌멩이", source: "생활-광석캐기", stock: 0 },
    { name: "나뭇가지", source: "생활-나무베기", stock: 0 },
    { name: "상급통나무+", source: "생활-나무베기", stock: 0 },
    { name: "마나허브", source: "생활-약초캐기", stock: 0 },
  ];

  const materialSourceOrder = [
    "금속",
    "목재",
    "가죽",
    "옷감",
    "사냥터",
    "광석캐기",
    "나무베기",
    "약초캐기",
  ];
  const materialRank = (material) => {
    const index = materialSourceOrder.findIndex((keyword) =>
      material.source.includes(keyword),
    );
    return index < 0 ? materialSourceOrder.length : index;
  };
  const orderedMaterials = () =>
    materials
      .map((material, index) => ({ material, index }))
      .sort(
        (a, b) =>
          materialRank(a.material) - materialRank(b.material) ||
          a.index - b.index,
      )
      .map(({ material }) => material);
  const sourceParts = (material) => {
    const [group, detail] = material.source.split(/\s*(?:·|-)\s*/);
    return { group, detail: detail || "—" };
  };

  const defaults = () => ({
    scope: "all",
    singleClass: 1,
    planSort: "default",
    priorityPlanIndexes: [],
    counts: plans.map((plan) => [...plan.counts]),
    stocks: Object.fromEntries(
      materials.map((material) => [material.name, material.stock]),
    ),
    lifeProgress: Object.fromEntries(
      lifeCategories.map(([category]) => [category, { level: 1, exp: 0 }]),
    ),
  });

  function loadState() {
    const base = defaults();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return base;
      return {
        scope: saved.scope === "single" ? "single" : "all",
        singleClass: Math.min(
          classes.length - 1,
          Math.max(
            0,
            saved.singleClass == null
              ? base.singleClass
              : Number(saved.singleClass) || 0,
          ),
        ),
        planSort: ["default", "category"].includes(saved.planSort)
          ? saved.planSort
          : "default",
        priorityPlanIndexes: Array.isArray(saved.priorityPlanIndexes)
          ? [...new Set(saved.priorityPlanIndexes.map(Number))].filter(
              (index) => Number.isInteger(index) && plans[index],
            )
          : [],
        counts: plans.map((plan, index) =>
          classes.map((_, classIndex) => {
            const value = saved.counts?.[index]?.[classIndex];
            return Number.isFinite(Number(value))
              ? Math.max(0, Number(value))
              : plan.counts[classIndex];
          }),
        ),
        stocks: Object.fromEntries(
          materials.map((material) => {
            const value = saved.stocks?.[material.name];
            return [
              material.name,
              Number.isFinite(Number(value))
                ? Math.max(0, Number(value))
                : material.stock,
            ];
          }),
        ),
        lifeProgress: Object.fromEntries(
          lifeCategories.map(([category]) => {
            const progress = saved.lifeProgress?.[category] || {};
            return [
              category,
              {
                level: Math.min(
                  35,
                  Math.max(1, Math.floor(Number(progress.level) || 1)),
                ),
                exp: Math.max(0, Number(progress.exp) || 0),
              },
            ];
          }),
        ),
      };
    } catch {
      return base;
    }
  }

  let state = loadState();
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const fmt = (value) =>
    Number(value || 0).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  const numericValue = (value) =>
    Math.max(0, Number(String(value).replace(/,/g, "")) || 0);
  const activeClassIndexes = () =>
    state.scope === "single"
      ? [state.singleClass]
      : classes.map((_, index) => index);
  const orderedPlanIndexes = () => {
    const indexes = plans.map((_, index) => index);
    if (state.planSort === "default") return indexes;
    return indexes.sort((a, b) => {
      const categoryDifference =
        planCategoryOrder.indexOf(plans[a].category) -
        planCategoryOrder.indexOf(plans[b].category);
      const difficultyDifference =
        Number(plans[a].difficulty === "어려움") -
        Number(plans[b].difficulty === "어려움");
      return categoryDifference || difficultyDifference || a - b;
    });
  };

  function calculate() {
    const activeIndexes = activeClassIndexes();
    const selectedPlans = state.priorityPlanIndexes.length
      ? new Set(state.priorityPlanIndexes)
      : null;
    const demand = Object.fromEntries(
      materials.map((material) => [
        material.name,
        { classes: classes.map(() => 0), total: 0 },
      ]),
    );
    let scrolls = 0;
    let products = 0;
    plans.forEach((plan, planIndex) => {
      if (selectedPlans && !selectedPlans.has(planIndex)) return;
      const planCounts = state.counts[planIndex];
      scrolls += activeIndexes.reduce(
        (sum, classIndex) => sum + planCounts[classIndex],
        0,
      );
      products += activeIndexes.reduce(
        (sum, classIndex) => sum + planCounts[classIndex] * plan.yield,
        0,
      );
      (recipes[plan.name] || []).forEach(([materialName, amount]) => {
        activeIndexes.forEach((classIndex) => {
          const count = planCounts[classIndex];
          const required = count * plan.yield * amount;
          demand[materialName].classes[classIndex] += required;
          demand[materialName].total += required;
        });
      });
    });
    const shortageCount = materials.filter(
      (material) =>
        demand[material.name].total > (state.stocks[material.name] || 0),
    ).length;
    return { demand, scrolls, products, shortageCount };
  }

  function calculatePossibleCounts() {
    const activeIndexes = activeClassIndexes();
    const remaining = Object.fromEntries(
      materials.map((material) => [
        material.name,
        Number(state.stocks[material.name]) || 0,
      ]),
    );
    const byPlan = plans.map((plan, planIndex) => ({
      requestedScrolls: activeIndexes.reduce(
        (sum, classIndex) => sum + (state.counts[planIndex][classIndex] || 0),
        0,
      ),
      possibleScrolls: 0,
      possibleProducts: 0,
      classes: {},
    }));

    const possibleFromStock = (planIndex, stock) => {
      const plan = plans[planIndex];
      const requested = byPlan[planIndex].requestedScrolls;
      const recipe = recipes[plan.name] || [];
      if (!recipe.length) return requested;
      return Math.max(
        0,
        Math.min(
          requested,
          ...recipe.map(([materialName, amount]) =>
            Math.floor(
              ((stock[materialName] || 0) + 1e-9) / (amount * plan.yield),
            ),
          ),
        ),
      );
    };

    const distributeByClass = (planIndex, possibleScrolls) => {
      let rest = possibleScrolls;
      activeIndexes.forEach((classIndex) => {
        const requested = state.counts[planIndex][classIndex] || 0;
        const possible = Math.min(requested, rest);
        byPlan[planIndex].classes[classIndex] = { requested, possible };
        rest -= possible;
      });
    };

    state.priorityPlanIndexes.forEach((planIndex) => {
      const plan = plans[planIndex];
      const possible = possibleFromStock(planIndex, remaining);
      byPlan[planIndex].possibleScrolls = possible;
      byPlan[planIndex].possibleProducts = possible * plan.yield;
      distributeByClass(planIndex, possible);
      (recipes[plan.name] || []).forEach(([materialName, amount]) => {
        remaining[materialName] = Math.max(
          0,
          (remaining[materialName] || 0) - possible * plan.yield * amount,
        );
      });
    });

    plans.forEach((plan, planIndex) => {
      if (state.priorityPlanIndexes.includes(planIndex)) return;
      const possible = possibleFromStock(planIndex, remaining);
      byPlan[planIndex].possibleScrolls = possible;
      byPlan[planIndex].possibleProducts = possible * plan.yield;
      distributeByClass(planIndex, possible);
    });

    return { byPlan, remaining };
  }

  function renderScope() {
    if (
      window.matchMedia("(max-width: 760px)").matches &&
      state.scope !== "single"
    ) {
      state.scope = "single";
      save();
    }
    document.getElementById("scrollCraftPage").dataset.scope = state.scope;
    document.querySelectorAll("[data-scroll-scope]").forEach((button) => {
      const active = button.dataset.scrollScope === state.scope;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const classBox = document.getElementById("scrollCraftClassBox");
    classBox.hidden = state.scope !== "single";
    document.getElementById("scrollCraftClassSelect").innerHTML = classes
      .map(
        (name, index) =>
          `<option value="${index}"${index === state.singleClass ? " selected" : ""}>${name}</option>`,
      )
      .join("");
  }

  function renderTableHeads() {
    const indexes = activeClassIndexes();
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const classHeads = indexes
      .map((index) => `<th scope="col">${classes[index]}</th>`)
      .join("");
    const materialClassHeads = state.scope === "all" ? classHeads : "";
    document.getElementById("scrollCraftPlanHead").innerHTML = isMobile
      ? `<tr class="mobile-plan-head"><th scope="col">제작품</th><th scope="col">스크롤<br>개수</th><th scope="col">제작량<br>(가능/필요)</th><th scope="col">필요 재료</th></tr>`
      : `<tr class="plan-head-group"><th scope="col" rowspan="2">순</th><th scope="col" rowspan="2">생활 구분</th><th scope="col" rowspan="2">제작품</th><th scope="col" rowspan="2" title="스크롤 1장을 사용했을 때 제작되는 개수">스크롤 1장당<br>제작 개수</th><th scope="colgroup" colspan="${indexes.length}" class="scroll-count-head">스크롤 개수</th><th scope="col" rowspan="2">제작량<br>(가능/전체)</th><th scope="col" rowspan="2">총 필요 재료</th></tr><tr class="plan-head-classes">${classHeads}</tr>`;
    document.getElementById("scrollCraftMaterialHead").innerHTML =
      `<th scope="colgroup" colspan="2">수급처</th><th scope="col">재료</th><th scope="col" class="input-head">보유량</th><th scope="col">전체 필요</th><th scope="col">상태</th>${materialClassHeads}`;
  }

  function renderPlanSort() {
    const options = [
      ["default", "기본 순서"],
      ["category", "생활별"],
    ];
    document.getElementById("scrollPlanSort").innerHTML =
      `<span>정렬</span>${options.map(([value, label]) => `<button type="button" data-plan-sort="${value}" class="${state.planSort === value ? "active" : ""}" aria-pressed="${state.planSort === value}">${label}</button>`).join("")}<button type="button" class="priority-clear" data-priority-clear${state.priorityPlanIndexes.length ? "" : " disabled"}>우선순위 전체 해제</button>`;
  }

  function renderPlan() {
    const activeIndexes = activeClassIndexes();
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const possibleCounts = calculatePossibleCounts();
    document.getElementById("scrollCraftPlanBody").innerHTML =
      orderedPlanIndexes()
        .map((planIndex) => {
          const plan = plans[planIndex];
          const counts = state.counts[planIndex];
          const productCount = activeIndexes.reduce(
            (sum, classIndex) => sum + counts[classIndex] * plan.yield,
            0,
          );
          const possible = possibleCounts.byPlan[planIndex];
          const priorityIndex = state.priorityPlanIndexes.indexOf(planIndex);
          const isPriority = priorityIndex >= 0;
          const possibleClass =
            productCount === 0
              ? "empty"
              : possible.possibleProducts >= productCount
                ? "full"
                : possible.possibleProducts > 0
                  ? "partial"
                  : "blocked";
          const productName = `<button type="button" class="scroll-plan-product priority-toggle${isPriority ? " selected" : ""}" data-priority-plan="${planIndex}" aria-pressed="${isPriority}">`;
          const productResult = `<strong class="possible-count">${fmt(possible.possibleProducts)}</strong><span class="count-divider">/</span><strong class="required-count">${fmt(productCount)}</strong><small></small>`;
          const materialSummary = (recipes[plan.name] || [])
            .map(([materialName, amount]) => {
              const total = amount * productCount;
              const stock = state.stocks[materialName] || 0;
              return `<span class="${stock < total ? "short" : "enough"}"><b>${materialName}</b><strong>${fmt(total)} / ${fmt(stock)}</strong></span>`;
            })
            .join("");
          const scrollEditor = (classIndex) => {
            const countResult = possible.classes[classIndex] || {
              requested: counts[classIndex],
              possible: 0,
            };
            const countClass =
              countResult.requested === 0
                ? "empty"
                : countResult.possible >= countResult.requested
                  ? "full"
                  : countResult.possible > 0
                    ? "partial"
                    : "blocked";
            return `<label class="scroll-count-editor ${countClass}"><span class="sr-only">${plan.name} ${classes[classIndex]}</span><input type="text" inputmode="numeric" pattern="[0-9]*" value="${counts[classIndex]}" data-scroll-count="${planIndex}:${classIndex}"><span class="scroll-count-display" aria-hidden="true"><b>${fmt(countResult.possible)}</b><i>/</i><strong>${fmt(countResult.requested)}</strong></span></label>`;
          };
          if (isMobile) {
            const classIndex = activeIndexes[0];
            return `<tr class="plan-${possibleClass}${isPriority ? " priority-selected" : ""}">
        <th scope="row">${productName}<b>${formatPlanName(plan.name)}</b></button></th>
        <td class="editable">${scrollEditor(classIndex)}</td>
        <td class="product-total">${productResult}</td>
        <td class="plan-total-materials">${materialSummary}</td>
      </tr>`;
          }
          return `<tr class="plan-${possibleClass}${isPriority ? " priority-selected" : ""}">
        <td class="rank">${state.priorityPlanIndexes.length ? (isPriority ? priorityIndex + 1 : "-") : planIndex + 1}</td>
        <td class="plan-life-category">${lifeCategoryLabels[plan.category] || plan.category}</td>
        <th scope="row">${productName}<b>${formatPlanName(plan.name)}</b></button></th>
        <td class="yield">${fmt(plan.yield)}</td>
        ${activeIndexes.map((classIndex) => `<td class="editable">${scrollEditor(classIndex)}</td>`).join("")}
        <td class="product-total">${productResult}</td>
        <td class="plan-total-materials">${materialSummary}</td>
      </tr>`;
        })
        .join("");
  }

  function renderMaterials(result) {
    const activeIndexes = activeClassIndexes();
    const ordered = orderedMaterials();
    document.getElementById("scrollCraftMaterialGrid").innerHTML = ordered
      .map((material, materialIndex) => {
        const item = result.demand[material.name];
        const stock = state.stocks[material.name] || 0;
        const balance = stock - item.total;
        const status = balance < 0 ? "short" : "enough";
        const source = sourceParts(material);
        const previousSource =
          materialIndex > 0 ? sourceParts(ordered[materialIndex - 1]) : null;
        const startsSourceGroup =
          !previousSource || previousSource.group !== source.group;
        const groupSpanIndex = startsSourceGroup
          ? ordered
              .slice(materialIndex)
              .findIndex((next) => sourceParts(next).group !== source.group)
          : 0;
        const groupRowspan =
          groupSpanIndex < 0 ? ordered.length - materialIndex : groupSpanIndex;
        const startsDetailGroup =
          !previousSource ||
          previousSource.group !== source.group ||
          previousSource.detail !== source.detail;
        const detailSpanIndex = startsDetailGroup
          ? ordered.slice(materialIndex).findIndex((next) => {
              const nextSource = sourceParts(next);
              return (
                nextSource.group !== source.group ||
                nextSource.detail !== source.detail
              );
            })
          : 0;
        const detailRowspan =
          detailSpanIndex < 0
            ? ordered.length - materialIndex
            : detailSpanIndex;
        const sourceGroupCell = startsSourceGroup
          ? `<th scope="rowgroup" rowspan="${groupRowspan}" class="material-source-group">${source.group}</th>`
          : "";
        const sourceDetailCell = startsDetailGroup
          ? `<th scope="rowgroup" rowspan="${detailRowspan}" class="material-source-detail">${source.detail}</th>`
          : "";
        return `<tr class="${status}">
        ${sourceGroupCell}
        ${sourceDetailCell}
        <th scope="row" class="material-name"><b>${material.name}</b></th>
        <td class="editable"><label><span class="sr-only">${material.name} 보유량</span><input type="text" inputmode="decimal" value="${stock}" data-material-stock="${material.name}"></label></td>
        <td class="material-total"><strong>${fmt(item.total)}</strong></td>
        <td class="material-balance"><b>${balance < 0 ? "부족" : "여유"}</b><strong>${fmt(Math.abs(balance))}</strong></td>
        ${state.scope === "all" ? activeIndexes.map((classIndex, index) => `<td class="class-need${index === 0 ? " first-class" : ""}">${fmt(item.classes[classIndex])}</td>`).join("") : ""}
      </tr>`;
      })
      .join("");
  }

  function calculateLifeExperience() {
    const selectedPlans = state.priorityPlanIndexes.length
      ? new Set(state.priorityPlanIndexes)
      : null;
    const possibleCounts = calculatePossibleCounts();
    const result = Object.fromEntries(
      lifeCategories.map(([category]) => [
        category,
        { experience: 0, scrolls: 0 },
      ]),
    );

    plans.forEach((plan, planIndex) => {
      if (selectedPlans && !selectedPlans.has(planIndex)) return;
      const scrollCount = possibleCounts.byPlan[planIndex].possibleScrolls;
      result[plan.category].scrolls += scrollCount;
      result[plan.category].experience +=
        scrollCount * (planExperiencePerScroll[plan.name] || 0);
    });
    return result;
  }

  function projectLifeProgress(level, currentExperience, gainedExperience) {
    let nextLevel = Math.min(35, Math.max(1, Math.floor(level || 1)));
    let experience = Math.max(0, currentExperience || 0) + gainedExperience;
    while (nextLevel < 35) {
      const requirement = lifeRequiredExperience[nextLevel];
      if (experience < requirement) break;
      experience -= requirement;
      nextLevel += 1;
    }
    return {
      level: nextLevel,
      experience,
      requirement:
        nextLevel < 35 ? lifeRequiredExperience[nextLevel] : null,
    };
  }

  function renderLifeExperience() {
    const gains = calculateLifeExperience();
    const grid = document.getElementById("scrollLifeExpGrid");
    if (!grid) return;
    grid.innerHTML = lifeCategories
      .map(([category, label], categoryIndex) => {
        const current = state.lifeProgress[category];
        const gain = gains[category];
        const group = lifeCategoryGroups[category];
        const previousGroup =
          categoryIndex > 0
            ? lifeCategoryGroups[lifeCategories[categoryIndex - 1][0]]
            : null;
        const groupClass = !group
          ? " life-exp-item-single"
          : group !== previousGroup
            ? " life-exp-group-start"
            : " life-exp-group-continued";
        const currentRequirement =
          current.level < 35 ? lifeRequiredExperience[current.level] : null;
        const projected = projectLifeProgress(
          current.level,
          current.exp,
          gain.experience,
        );
        const leveled = projected.level > current.level;
        const currentProgress = currentRequirement
          ? Math.min(100, (current.exp / currentRequirement) * 100)
          : 100;
        const gainedProgress = leveled
          ? 100 - currentProgress
          : Math.max(
              0,
              Math.min(
                100 - currentProgress,
                currentRequirement
                  ? ((projected.experience - current.exp) /
                      currentRequirement) *
                      100
                  : 0,
              ),
            );
        const currentText = `<span class="life-exp-before">Lv.${current.level} ${fmt(current.exp)}</span>`;
        const projectedText =
          projected.level >= 35
            ? `<span class="life-exp-after"><b>Lv.${projected.level}</b><strong>MAX</strong></span>`
            : `<span class="life-exp-after"><b>Lv.${projected.level}</b><strong>${fmt(projected.experience)} / ${fmt(projected.requirement)}</strong></span>`;
        const levelUpBadge = leveled
          ? `<em class="life-exp-level-up">▲ LEVEL UP</em>`
          : "";
        const resultText = `<span class="life-exp-result-flow">${currentText}<i>→</i>${projectedText}${levelUpBadge}</span>`;
        return `<div class="life-exp-row${leveled ? " leveled" : ""}">
          <div class="life-exp-item${groupClass}"><span>${group}</span><strong class="life-exp-category">${label}</strong></div>
          <label class="life-exp-level"><span>현재 레벨</span><input type="text" inputmode="numeric" value="${current.level}" data-life-level="${category}"></label>
          <label class="life-exp-current"><span>현재 경험치</span><span class="life-exp-input-wrap"><input type="text" inputmode="numeric" value="${current.exp}" data-life-exp="${category}"><small>${currentRequirement ? `/ ${fmt(currentRequirement)}` : "MAX"}</small></span></label>
          <div class="life-exp-gain"><span>예상 획득</span><small>${fmt(gain.scrolls)}장 제작</small><b>+${fmt(gain.experience)}</b></div>
          <div class="life-exp-result"><span>예상 결과</span><span class="life-exp-progress-graph" aria-hidden="true"><i style="width:${currentProgress.toFixed(2)}%"></i><b style="width:${gainedProgress.toFixed(2)}%"></b></span>${resultText}</div>
        </div>`;
      })
      .join("");
    const basis = document.getElementById("scrollLifeExpBasis");
    if (basis) {
      basis.textContent = state.priorityPlanIndexes.length
        ? `선택한 제작품 ${state.priorityPlanIndexes.length}종 · 제작 가능 스크롤 기준`
        : "제작 가능 스크롤 기준";
    }
  }

  function render() {
    const result = calculate();
    renderScope();
    renderTableHeads();
    renderPlanSort();
    renderPlan();
    renderMaterials(result);
    renderLifeExperience();
    const materialTitle = document.querySelector(
      ".scroll-material-panel .scroll-craft-panel-head h3",
    );
    if (materialTitle) {
      materialTitle.textContent = state.priorityPlanIndexes.length
        ? `선택 재료 집계 (${state.priorityPlanIndexes.length})`
        : "전체 재료 집계";
    }
  }

  function commitEditable(input) {
    const countInput = input.closest("[data-scroll-count]");
    if (countInput) {
      const [planIndex, classIndex] = countInput.dataset.scrollCount
        .split(":")
        .map(Number);
      state.counts[planIndex][classIndex] = numericValue(countInput.value);
      return;
    }
    const stockInput = input.closest("[data-material-stock]");
    if (stockInput) {
      state.stocks[stockInput.dataset.materialStock] = numericValue(
        stockInput.value,
      );
      return;
    }
    const levelInput = input.closest("[data-life-level]");
    if (levelInput) {
      const category = levelInput.dataset.lifeLevel;
      state.lifeProgress[category].level = Math.min(
        35,
        Math.max(1, Math.floor(numericValue(levelInput.value) || 1)),
      );
      return;
    }
    const experienceInput = input.closest("[data-life-exp]");
    if (experienceInput) {
      state.lifeProgress[experienceInput.dataset.lifeExp].exp = numericValue(
        experienceInput.value,
      );
    }
  }

  function editableKey(input) {
    if (input.dataset?.scrollCount) {
      return ["scrollCount", input.dataset.scrollCount];
    }
    if (input.dataset?.materialStock) {
      return ["materialStock", input.dataset.materialStock];
    }
    if (input.dataset?.lifeLevel) {
      return ["lifeLevel", input.dataset.lifeLevel];
    }
    if (input.dataset?.lifeExp) {
      return ["lifeExp", input.dataset.lifeExp];
    }
    return null;
  }

  function restoreEditable(key, select = false) {
    if (!key) return;
    const [datasetName, value] = key;
    const next = [
      ...document.querySelectorAll(
        "[data-scroll-count], [data-material-stock], [data-life-level], [data-life-exp]",
      ),
    ].find((input) => input.dataset[datasetName] === value);
    if (!next) return;
    next.focus({ preventScroll: true });
    if (select) next.select();
  }

  let pendingRender = 0;
  function renderPreservingFocus() {
    window.clearTimeout(pendingRender);
    pendingRender = window.setTimeout(() => {
      const key = editableKey(document.activeElement || {});
      render();
      restoreEditable(key);
    }, 0);
  }

  document.addEventListener("change", (event) => {
    if (event.target.id === "scrollCraftClassSelect") {
      state.singleClass = Number(event.target.value) || 0;
      save();
      render();
      return;
    }
    const countInput = event.target.closest("[data-scroll-count]");
    if (countInput) {
      commitEditable(countInput);
      save();
      renderPreservingFocus();
      return;
    }
    const stockInput = event.target.closest("[data-material-stock]");
    if (stockInput) {
      commitEditable(stockInput);
      save();
      renderPreservingFocus();
      return;
    }
    const lifeInput = event.target.closest(
      "[data-life-level], [data-life-exp]",
    );
    if (lifeInput) {
      commitEditable(lifeInput);
      save();
      renderPreservingFocus();
    }
  });

  document.addEventListener("click", (event) => {
    const priorityButton = event.target.closest("[data-priority-plan]");
    if (priorityButton) {
      const planIndex = Number(priorityButton.dataset.priorityPlan);
      const currentIndex = state.priorityPlanIndexes.indexOf(planIndex);
      if (currentIndex >= 0) {
        state.priorityPlanIndexes.splice(currentIndex, 1);
      } else {
        state.priorityPlanIndexes.push(planIndex);
      }
      save();
      render();
      return;
    }
    if (event.target.closest("[data-priority-clear]")) {
      if (!state.priorityPlanIndexes.length) return;
      state.priorityPlanIndexes = [];
      save();
      render();
      return;
    }
    const sortButton = event.target.closest("[data-plan-sort]");
    if (sortButton) {
      state.planSort = sortButton.dataset.planSort;
      save();
      renderPlanSort();
      renderPlan();
      return;
    }
    const scopeButton = event.target.closest("[data-scroll-scope]");
    if (!scopeButton) return;
    state.scope =
      scopeButton.dataset.scrollScope === "single" ? "single" : "all";
    save();
    render();
  });

  document.addEventListener("keydown", (event) => {
    const input = event.target.closest?.(
      "[data-scroll-count], [data-material-stock], [data-life-level], [data-life-exp]",
    );
    if (!input || !["Enter", "Tab"].includes(event.key)) return;

    const inputs = [
      ...document.querySelectorAll(
        input.dataset.scrollCount
          ? "[data-scroll-count]"
          : input.dataset.materialStock
            ? "[data-material-stock]"
            : "[data-life-level], [data-life-exp]",
      ),
    ];
    const currentIndex = inputs.indexOf(input);
    let next = null;

    if (event.key === "Enter" && input.dataset.scrollCount) {
      const [, classIndex] = input.dataset.scrollCount.split(":");
      const sameColumn = inputs.filter(
        (item) => item.dataset.scrollCount.split(":")[1] === classIndex,
      );
      const columnIndex = sameColumn.indexOf(input);
      next = sameColumn[columnIndex + (event.shiftKey ? -1 : 1)] || null;
    } else if (
      event.key === "Enter" &&
      (input.dataset.lifeLevel || input.dataset.lifeExp)
    ) {
      const selector = input.dataset.lifeLevel
        ? "[data-life-level]"
        : "[data-life-exp]";
      const sameColumn = [...document.querySelectorAll(selector)];
      const columnIndex = sameColumn.indexOf(input);
      next = sameColumn[columnIndex + (event.shiftKey ? -1 : 1)] || null;
    } else {
      next = inputs[currentIndex + (event.shiftKey ? -1 : 1)] || null;
    }

    event.preventDefault();
    commitEditable(input);
    save();
    const nextKey = editableKey(next || input);
    render();
    restoreEditable(nextKey, true);
  });

  document.addEventListener("focusin", (event) => {
    if (
      event.target.matches?.(
        "[data-scroll-count], [data-material-stock], [data-life-level], [data-life-exp]",
      )
    ) {
      event.target.select();
    }
  });

  window.matchMedia("(max-width: 760px)").addEventListener?.("change", render);
  render();
})();
