const craftClassGroups = [
        [
          "전사 계열",
          [
            ["전사", "해연의 숏소드ZZ"],
            ["대검전사", "해연의 그레이트 소드ZZ"],
            ["검술사", "해연의 론 엣지소드ZZ"],
            ["기사", "해연의 라이트 핼버드ZZ"],
          ],
        ],
        [
          "궁수 계열",
          [
            ["궁수", "해연의 숏보우ZZ"],
            ["석궁사수", "해연의 라이트 크로스보우ZZ"],
            ["장궁병", "해연의 라이트 롱보우ZZ"],
          ],
        ],
        [
          "마법사 계열",
          [
            ["마법사", "해연의 우드 완드ZZ"],
            ["화염술사", "해연의 라운드헤드 케인ZZ"],
            ["빙결술사", "해연의 스노우 오브ZZ"],
            ["전격술사", "해연의 라운드 코일ZZ"],
          ],
        ],
        [
          "힐러 계열",
          [
            ["힐러", "해연의 마블 힐링 완드ZZ"],
            ["사제", "해연의 크리스탈 스태프ZZ"],
            ["수도사", "해연의 블런트 쿼터스태프ZZ"],
            ["암흑술사", "해연의 서펜트 의식용 단검ZZ"],
          ],
        ],
        [
          "음유시인 계열",
          [
            ["음유시인", "해연의 켈틱 류트ZZ"],
            ["댄서", "해연의 꽃잎 접부채ZZ"],
            ["악사", "해연의 커브드 하프ZZ"],
          ],
        ],
        [
          "도적 계열",
          [
            ["도적", "해연의 플랫 대거ZZ"],
            ["격투가", "해연의 라이트 너클ZZ"],
            ["듀얼블레이드", "해연의 샤프 듀얼소드ZZ"],
          ],
        ],
      ];
      const craftClassMap = Object.fromEntries(
        craftClassGroups
          .flatMap(([group, classes]) =>
            classes.map(([className, weapon]) => ({
              className,
              weapon,
              group,
            })),
          )
          .map((entry) => [entry.className, entry]),
      );
      const craftWeaponClass = Object.fromEntries(
        Object.values(craftClassMap).map(({ className, weapon }) => [
          weapon,
          className,
        ]),
      );
      const craftArmorType = (itemName) =>
        itemName.includes("비늘 갑옷")
          ? "중갑"
          : itemName.includes("가죽 갑옷")
            ? "경갑"
            : itemName.includes("전투복")
              ? "천옷"
              : "";
      const craftItemTypeLabel = (item) => {
        if (item.part === "무기") {
          return `장비 · 무기 (${craftWeaponClass[item.name] || "클래스 확인 필요"})`;
        }
        const armorType = craftArmorType(item.name);
        return armorType
          ? `장비 · ${item.part} (${armorType})`
          : `장비 · ${item.part}`;
      };
      const craftParts = [
        "전체",
        "무기",
        "목걸이",
        "반지",
        "모자",
        "상의",
        "하의",
        "장갑",
        "신발",
      ];
      const craftPartOrder = Object.fromEntries(
        craftParts.slice(1).map((part, index) => [part, index]),
      );
      const craftWeaponOrder = Object.fromEntries(
        craftClassGroups
          .flatMap(([, classes]) => classes.map(([, weapon]) => weapon))
          .map((weapon, index) => [weapon, index]),
      );
      const craftArmorOrder = (itemName) =>
        itemName.includes("비늘 갑옷")
          ? 0
          : itemName.includes("가죽 갑옷")
            ? 1
            : itemName.includes("전투복")
              ? 2
              : 99;
      const compareCraftItems = (a, b) => {
        const partDifference =
          craftPartOrder[a.part] - craftPartOrder[b.part];
        if (partDifference) return partDifference;
        if (a.part === "무기") {
          return (
            (craftWeaponOrder[a.name] ?? 999) -
            (craftWeaponOrder[b.name] ?? 999)
          );
        }
        if (["모자", "상의", "하의", "장갑", "신발"].includes(a.part)) {
          return craftArmorOrder(a.name) - craftArmorOrder(b.name);
        }
        return a.name.localeCompare(b.name, "ko");
      };
      let activeCraftPart = "전체";
      let activeCraftIndex = 0;
      let activeCraftClass = "";
      let activeEquipmentMaterialName = "";
      const craftArmorPrefix = (group) =>
        group === "전사 계열"
          ? "해연의 비늘 갑옷"
          : group === "마법사 계열" || group === "힐러 계열"
            ? "해연의 전투복"
            : "해연의 가죽 갑옷";
      const recommendedCraftNames = (className) => {
        const selected = craftClassMap[className];
        if (!selected) return null;
        const armor = craftArmorPrefix(selected.group);
        return [
          selected.weapon,
          "해연의 페리도트 네크리스ZZ",
          "해연의 페리도트 링ZZ",
          `${armor} 투구ZZ`,
          `${armor} 상의ZZ`,
          `${armor} 하의ZZ`,
          `${armor} 장갑ZZ`,
          `${armor} 신발ZZ`,
        ];
      };
      const firstCraftIndex = (part = activeCraftPart) => {
        const recommended = recommendedCraftNames(activeCraftClass);
        const recommendationOrder = recommended
          ? Object.fromEntries(recommended.map((name, index) => [name, index]))
          : null;
        const first = haeyeonItems
          .map((item, index) => ({ item, index }))
          .filter(
            ({ item }) =>
              !recommendationOrder ||
              recommendationOrder[item.name] !== undefined,
          )
          .filter(({ item }) => part === "전체" || item.part === part)
          .sort((a, b) =>
            recommendationOrder
              ? recommendationOrder[a.item.name] -
                recommendationOrder[b.item.name]
              : compareCraftItems(a.item, b.item),
          )[0];
        return first?.index ?? 0;
      };
      activeCraftIndex = firstCraftIndex();
      const renderCraftCatalog = () => {
        const filters = document.getElementById("craftFilters");
        const list = document.getElementById("craftItemList");
        const detail = document.getElementById("craftDetail");
        const classSelect = document.getElementById("craftClassSelect");
        const recommendNote = document.getElementById("craftRecommendNote");
        if (!filters || !list || !detail || !classSelect || !recommendNote)
          return;
        if (!classSelect.options.length) {
          classSelect.innerHTML =
            '<option value="">전체 클래스 보기</option>' +
            craftClassGroups
              .map(
                ([group, classes]) =>
                  `<optgroup label="${group}">${classes.map(([className]) => `<option value="${className}">${className}</option>`).join("")}</optgroup>`,
              )
              .join("");
        }
        classSelect.value = activeCraftClass;
        filters.innerHTML = craftParts
          .map(
            (part) =>
              `<button type="button" class="craft-filter-chip${part === activeCraftPart ? " active" : ""}" data-craft-filter="${part}">${part}</button>`,
          )
          .join("");
        const recommended = recommendedCraftNames(activeCraftClass);
        recommendNote.hidden = !recommended;
        if (recommended) {
          const selected = craftClassMap[activeCraftClass];
          const armorName =
            selected.group === "전사 계열"
              ? "중갑"
              : selected.group === "마법사 계열" ||
                  selected.group === "힐러 계열"
                ? "천옷"
                : "경갑";
          recommendNote.textContent = `${activeCraftClass} 추천 세팅 · ${armorName}`;
        }
        const recommendationOrder = recommended
          ? Object.fromEntries(recommended.map((name, index) => [name, index]))
          : null;
        const visible = haeyeonItems
          .map((item, index) => ({ item, index }))
          .filter(
            ({ item }) =>
              !recommended || recommendationOrder[item.name] !== undefined,
          )
          .filter(
            ({ item }) =>
              activeCraftPart === "전체" || item.part === activeCraftPart,
          )
          .sort((a, b) =>
            recommendationOrder
              ? recommendationOrder[a.item.name] -
                recommendationOrder[b.item.name]
              : compareCraftItems(a.item, b.item),
          );
        document.getElementById("craftItemCount").textContent =
          `(${visible.length})`;
        list.innerHTML = visible
          .map(
            ({ item, index }) => `
        <button type="button" class="craft-item-button${index === activeCraftIndex ? " active" : ""}" data-craft-index="${index}" aria-current="${index === activeCraftIndex}">
          <span class="craft-item-icon"><img src="${item.image}" alt="" /></span>
          <span><span class="craft-item-name">${item.name}</span><span class="craft-item-part">${craftItemTypeLabel(item)}</span></span>
        </button>`,
          )
          .join("");
        const item = haeyeonItems[activeCraftIndex];
        if (
          activeEquipmentMaterialName &&
          !item.materials.some(
            (material) => material.name === activeEquipmentMaterialName,
          )
        ) {
          activeEquipmentMaterialName = "";
        }
        const selectedMaterialUsages = activeEquipmentMaterialName
          ? haeyeonItems
              .map((candidate, index) => {
                const material = candidate.materials.find(
                  (entry) => entry.name === activeEquipmentMaterialName,
                );
                return material
                  ? { item: candidate, index, count: material.count }
                  : null;
              })
              .filter(
                (usage) => usage && usage.index !== activeCraftIndex,
              )
              .sort((a, b) => compareCraftItems(a.item, b.item))
          : [];
        detail.innerHTML = `
        <button type="button" class="craft-mobile-back" data-craft-mobile-back="equipment">← 장비 목록으로</button>
        <div class="craft-detail-head"><h2>${item.name}</h2><span class="craft-level">요구 레벨 100</span></div>
        <div class="craft-materials">
          <div class="craft-material-row craft-table-head" aria-hidden="true"><span>재료</span><span>수량</span><span>분류</span><span>수급처</span></div>
          ${item.materials
            .map((material) => {
              const info = craftMaterialInfo[material.name] || [
                "",
                "확인 필요",
                "확인 필요",
              ];
              const selected = material.name === activeEquipmentMaterialName;
              return `<button type="button" class="craft-material-row craft-material-button${selected ? " active" : ""}" data-equipment-material="${encodeURIComponent(material.name)}" aria-expanded="${selected}"><span class="craft-material-name"><img src="${CRAFT_CDN + info[0]}" alt="" />${material.name}</span><span class="craft-material-count">×${material.count}</span><span class="source-category">${info[1]}</span><span class="craft-source">${info[2]}</span></button>`;
            })
            .join("")}
        </div>
        ${
          activeEquipmentMaterialName
            ? `<section class="equipment-material-usage">
                <div class="equipment-material-usage-head">
                  <h3>${activeEquipmentMaterialName}</h3>
                  <span>다른 장비 ${selectedMaterialUsages.length}종</span>
                </div>
                <div class="material-usage-list">
                  ${
                    selectedMaterialUsages.length
                      ? selectedMaterialUsages
                          .map(
                            ({ item: relatedItem, index, count }) => `
                              <button type="button" class="material-usage-row related-craft-item" data-related-craft-index="${index}">
                                <img class="material-usage-icon" src="${relatedItem.image}" alt="" />
                                <span>
                                  <span class="material-usage-name">${relatedItem.name}</span>
                                  <span class="material-usage-part">${craftItemTypeLabel(relatedItem)}</span>
                                </span>
                                <span class="material-usage-count">×${count}</span>
                              </button>`,
                          )
                          .join("")
                      : '<p class="equipment-material-empty">이 재료를 사용하는 다른 장비가 없습니다.</p>'
                  }
                </div>
              </section>`
            : ""
        }
        <p class="craft-credit">아이템 및 재료 이미지 출처: <a href="https://mabimobi.life/archive/items?type=equipment&amp;q=%ED%95%B4%EC%97%B0" target="_blank" rel="noopener noreferrer">모비라이프 아이템 도감</a></p>`;
      };

      const craftMaterialCategories = [
        "전체",
        "어비스",
        "심층 던전",
        "일반 던전",
        "가공",
        "분해",
      ];
      const craftMaterialCategoryOrder = Object.fromEntries(
        craftMaterialCategories
          .slice(1)
          .map((category, index) => [category, index]),
      );
      const craftMaterialOrder = Object.fromEntries(
        [
          "세공된 페리도트ZZ",
          "백금강괴",
          "특급 목재",
          "특급 가죽",
          "특급 실크",
          "특급 옷감",
          "허상의 마력석",
          "포식의 마력석",
          "심해의 마력석",
          "망령의 영혼석",
          "원념의 영혼석",
          "공명의 영혼석",
          "파동의 영혼석",
          "야생의 영혼석",
          "삼림의 영혼석",
        ].map((name, index) => [name, index]),
      );
      const craftMaterials = Object.entries(craftMaterialInfo)
        .map(([name, [image, category, source]]) => ({
          name,
          image: CRAFT_CDN + image,
          category,
          source,
          usages: haeyeonItems
            .map((item, index) => {
              const material = item.materials.find(
                (candidate) => candidate.name === name,
              );
              return material
                ? { item, index, count: material.count }
                : null;
            })
            .filter(Boolean)
            .sort((a, b) => compareCraftItems(a.item, b.item)),
        }))
        .sort(
          (a, b) =>
            craftMaterialCategoryOrder[a.category] -
              craftMaterialCategoryOrder[b.category] ||
            (craftMaterialOrder[a.name] ?? 999) -
              (craftMaterialOrder[b.name] ?? 999) ||
            a.name.localeCompare(b.name, "ko"),
        );
      let activeCraftView = "equipment";
      let activeMaterialCategory = "전체";
      let activeMaterialName = craftMaterials[0]?.name || "";
      let activeMaterialUsageCraftIndex = -1;

      const renderCraftView = () => {
        const equipmentCatalog = document.getElementById("craftCatalog");
        const materialCatalog = document.getElementById(
          "craftMaterialCatalog",
        );
        if (!equipmentCatalog || !materialCatalog) return;
        const materialActive = activeCraftView === "material";
        equipmentCatalog.hidden = materialActive;
        materialCatalog.hidden = !materialActive;
        document.querySelectorAll("[data-craft-view]").forEach((button) => {
          const active = button.dataset.craftView === activeCraftView;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        if (materialActive) renderMaterialCatalog();
        else renderCraftCatalog();
      };

      const renderMaterialCatalog = () => {
        const filters = document.getElementById("craftMaterialFilters");
        const list = document.getElementById("craftMaterialList");
        const detail = document.getElementById("craftMaterialDetail");
        const count = document.getElementById("craftMaterialCount");
        if (!filters || !list || !detail || !count) return;

        filters.innerHTML = craftMaterialCategories
          .map(
            (category) =>
              `<button type="button" class="craft-filter-chip${category === activeMaterialCategory ? " active" : ""}" data-material-filter="${category}">${category}</button>`,
          )
          .join("");
        const visible = craftMaterials.filter(
          (material) =>
            activeMaterialCategory === "전체" ||
            material.category === activeMaterialCategory,
        );
        count.textContent = `(${visible.length})`;
        if (!visible.some((material) => material.name === activeMaterialName)) {
          activeMaterialName = visible[0]?.name || "";
        }
        list.innerHTML = visible
          .map(
            (material) => `
              <button type="button" class="craft-item-button${material.name === activeMaterialName ? " active" : ""}" data-material-name="${encodeURIComponent(material.name)}" aria-current="${material.name === activeMaterialName}">
                <span class="craft-item-icon"><img src="${material.image}" alt="" /></span>
                <span>
                  <span class="craft-item-name">${material.name}</span>
                  <span class="craft-item-part">${material.source} · 제작 가능 ${material.usages.length}종</span>
                </span>
              </button>`,
          )
          .join("");

        const material =
          craftMaterials.find(
            (candidate) => candidate.name === activeMaterialName,
          ) || visible[0];
        if (!material) {
          detail.innerHTML = "";
          return;
        }
        if (
          activeMaterialUsageCraftIndex >= 0 &&
          !material.usages.some(
            (usage) => usage.index === activeMaterialUsageCraftIndex,
          )
        ) {
          activeMaterialUsageCraftIndex = -1;
        }
        const selectedUsageItem =
          activeMaterialUsageCraftIndex >= 0
            ? haeyeonItems[activeMaterialUsageCraftIndex]
            : null;
        detail.innerHTML = `
          <button type="button" class="craft-mobile-back" data-craft-mobile-back="material">← 재료 목록으로</button>
          <div class="craft-detail-head material-summary-head">
            <h2 class="material-summary-title">
              <img src="${material.image}" alt="" />
              <span>${material.name}<span class="material-summary-source">(${material.category}-${material.source})</span></span>
              <span class="material-summary-count">${material.usages.length}종 제작 가능</span>
            </h2>
          </div>
          <div class="material-usage-list">
            ${material.usages
              .map(
                ({ item, index, count: requiredCount }) => `
                  <button type="button" class="material-usage-row material-usage-button${index === activeMaterialUsageCraftIndex ? " active" : ""}" data-material-usage-craft-index="${index}" aria-expanded="${index === activeMaterialUsageCraftIndex}">
                    <img class="material-usage-icon" src="${item.image}" alt="" />
                    <span>
                      <span class="material-usage-name">${item.name}</span>
                      <span class="material-usage-part">${craftItemTypeLabel(item)}</span>
                    </span>
                    <span class="material-usage-count">×${requiredCount}</span>
                  </button>`,
              )
              .join("")}
          </div>
          ${
            selectedUsageItem
              ? `<section class="material-equipment-usage">
                  <div class="equipment-material-usage-head">
                    <h3>${selectedUsageItem.name}</h3>
                    <span>제작 재료 ${selectedUsageItem.materials.length}종</span>
                  </div>
                  <div class="material-equipment-materials">
                    ${selectedUsageItem.materials
                      .map((requiredMaterial) => {
                        const info = craftMaterialInfo[
                          requiredMaterial.name
                        ] || ["", "확인 필요", "확인 필요"];
                        return `
                          <div class="material-equipment-row">
                            <span class="craft-material-name">
                              <img src="${CRAFT_CDN + info[0]}" alt="" />
                              ${requiredMaterial.name}
                            </span>
                            <span class="material-usage-count">×${requiredMaterial.count}</span>
                          </div>`;
                      })
                      .join("")}
                  </div>
                </section>`
              : ""
          }
          <p class="craft-credit">아이템 및 재료 이미지 출처: <a href="https://mabimobi.life/archive/items?type=equipment&amp;q=%ED%95%B4%EC%97%B0" target="_blank" rel="noopener noreferrer">모비라이프 아이템 도감</a></p>`;
      };

      document.addEventListener("click", (event) => {
        const materialUsageItem = event.target.closest(
          "[data-material-usage-craft-index]",
        );
        if (materialUsageItem) {
          const selectedIndex = Number(
            materialUsageItem.dataset.materialUsageCraftIndex,
          );
          activeMaterialUsageCraftIndex =
            activeMaterialUsageCraftIndex === selectedIndex
              ? -1
              : selectedIndex;
          renderMaterialCatalog();
          return;
        }
        const equipmentMaterial = event.target.closest(
          "[data-equipment-material]",
        );
        if (equipmentMaterial) {
          const selectedName = decodeURIComponent(
            equipmentMaterial.dataset.equipmentMaterial,
          );
          activeEquipmentMaterialName =
            activeEquipmentMaterialName === selectedName ? "" : selectedName;
          renderCraftCatalog();
          return;
        }
        const relatedCraftItem = event.target.closest(
          "[data-related-craft-index]",
        );
        if (relatedCraftItem) {
          activeCraftIndex = Number(relatedCraftItem.dataset.relatedCraftIndex);
          activeEquipmentMaterialName = "";
          renderCraftCatalog();
          document
            .getElementById("craftDetail")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        const mobileBack = event.target.closest("[data-craft-mobile-back]");
        if (mobileBack) {
          const catalog =
            mobileBack.dataset.craftMobileBack === "material"
              ? document.getElementById("craftMaterialCatalog")
              : document.getElementById("craftCatalog");
          catalog?.classList.remove("mobile-detail-open");
          catalog?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        const viewButton = event.target.closest("[data-craft-view]");
        if (viewButton) {
          activeCraftView = viewButton.dataset.craftView;
          document
            .querySelectorAll(".craft-layout")
            .forEach((layout) => layout.classList.remove("mobile-detail-open"));
          renderCraftView();
          return;
        }
        const materialFilter = event.target.closest("[data-material-filter]");
        if (materialFilter) {
          activeMaterialCategory = materialFilter.dataset.materialFilter;
          document
            .getElementById("craftMaterialCatalog")
            ?.classList.remove("mobile-detail-open");
          renderMaterialCatalog();
          return;
        }
        const materialButton = event.target.closest("[data-material-name]");
        if (materialButton) {
          activeMaterialName = decodeURIComponent(
            materialButton.dataset.materialName,
          );
          activeMaterialUsageCraftIndex = -1;
          renderMaterialCatalog();
          const catalog = document.getElementById("craftMaterialCatalog");
          catalog?.classList.add("mobile-detail-open");
          catalog?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
