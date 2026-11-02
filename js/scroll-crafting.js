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

  const planNameBreaks = {
    "가죽갑옷신발S": ["가죽", "갑옷신발S"],
    "그랜드크로스보우": ["그랜드", "크로스보우"],
    "두꺼운가죽갑옷신발": ["두꺼운", "가죽갑옷신발"],
    "두꺼운전투복신발": ["두꺼운", "전투복신발"],
    "로터스힐링완드": ["로터스", "힐링완드"],
    "크레센트엣지소드": ["크레센트", "엣지소드"],
    "라이트크로스보우S": ["라이트", "크로스보우S"],
  };
  const formatPlanName = (name) => (planNameBreaks[name] || [name]).join("<wbr>");

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
    counts: plans.map((plan) => [...plan.counts]),
    stocks: Object.fromEntries(
      materials.map((material) => [material.name, material.stock]),
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
        planSort: ["default", "category", "difficulty"].includes(saved.planSort)
          ? saved.planSort
          : "default",
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
    if (state.planSort === "difficulty") {
      return indexes.sort(
        (a, b) =>
          Number(plans[a].difficulty === "어려움") -
            Number(plans[b].difficulty === "어려움") || a - b,
      );
    }
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
    const demand = Object.fromEntries(
      materials.map((material) => [
        material.name,
        { classes: classes.map(() => 0), total: 0 },
      ]),
    );
    let scrolls = 0;
    let products = 0;
    plans.forEach((plan, planIndex) => {
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
      ? `<tr class="mobile-plan-head"><th scope="col">제작품</th><th scope="col">스크롤<br>개수</th><th scope="col">필요 제작<br>수량</th><th scope="col">필요 재료</th></tr>`
      : `<tr class="plan-head-group"><th scope="col" rowspan="2">순</th><th scope="col" rowspan="2">제작품</th><th scope="col" rowspan="2" title="스크롤 1장을 사용했을 때 제작되는 개수">스크롤 1장당<br>제작 개수</th><th scope="colgroup" colspan="${indexes.length}" class="scroll-count-head">스크롤 개수</th><th scope="col" rowspan="2">필요 제작 수량</th><th scope="col" rowspan="2">총 필요 재료</th></tr><tr class="plan-head-classes">${classHeads}</tr>`;
    document.getElementById("scrollCraftMaterialHead").innerHTML =
      `<th scope="colgroup" colspan="2">수급처</th><th scope="col">재료</th><th scope="col" class="input-head">보유량</th><th scope="col">전체 필요</th><th scope="col">상태</th>${materialClassHeads}`;
  }

  function renderPlanSort() {
    const options = [
      ["default", "기본 순서"],
      ["category", "항목별"],
      ["difficulty", "난이도별"],
    ];
    document.getElementById("scrollPlanSort").innerHTML =
      `<span>정렬</span>${options.map(([value, label]) => `<button type="button" data-plan-sort="${value}" class="${state.planSort === value ? "active" : ""}" aria-pressed="${state.planSort === value}">${label}</button>`).join("")}`;
  }

  function renderPlan() {
    const activeIndexes = activeClassIndexes();
    document.getElementById("scrollCraftPlanBody").innerHTML =
      orderedPlanIndexes()
        .map((planIndex) => {
          const plan = plans[planIndex];
          const counts = state.counts[planIndex];
          const productCount = activeIndexes.reduce(
            (sum, classIndex) => sum + counts[classIndex] * plan.yield,
            0,
          );
          const materialSummary = (recipes[plan.name] || [])
            .map(([materialName, amount]) => {
              const total = amount * productCount;
              const stock = state.stocks[materialName] || 0;
              return `<span class="${stock < total ? "short" : "enough"}"><b>${materialName}</b><strong>${fmt(total)} / ${fmt(stock)}</strong></span>`;
            })
            .join("");
          return `<tr>
        <td class="rank">${planIndex + 1}</td>
        <th scope="row"><div class="scroll-plan-product"><span class="difficulty ${plan.difficulty === "어려움" ? "hard" : "easy"}">${plan.difficulty}</span><span class="plan-category">${plan.category}</span><b>${formatPlanName(plan.name)}</b></div></th>
        <td class="yield">${fmt(plan.yield)}</td>
        ${activeIndexes.map((classIndex) => `<td class="editable"><label><span class="sr-only">${plan.name} ${classes[classIndex]}</span><input type="text" inputmode="numeric" pattern="[0-9]*" value="${counts[classIndex]}" data-scroll-count="${planIndex}:${classIndex}"></label></td>`).join("")}
        <td class="product-total"><strong>${fmt(productCount)}</strong><small>개</small></td>
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

  function render() {
    const result = calculate();
    renderScope();
    renderTableHeads();
    renderPlanSort();
    renderPlan();
    renderMaterials(result);
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
      const [planIndex, classIndex] = countInput.dataset.scrollCount
        .split(":")
        .map(Number);
      state.counts[planIndex][classIndex] = numericValue(countInput.value);
      save();
      render();
      return;
    }
    const stockInput = event.target.closest("[data-material-stock]");
    if (stockInput) {
      state.stocks[stockInput.dataset.materialStock] = numericValue(
        stockInput.value,
      );
      save();
      render();
    }
  });

  document.addEventListener("click", (event) => {
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
    if (
      event.key === "Enter" &&
      event.target.matches("[data-scroll-count], [data-material-stock]")
    ) {
      event.preventDefault();
      event.target.blur();
    }
  });

  window.matchMedia("(max-width: 760px)").addEventListener?.("change", render);
  render();
})();
