const STORAGE_KEY = "mabinogi-crit-s1-s2-refined-v3";

      const critItems = [
        {
          id: "crit-stat",
          input: "number",
          name: "치명타",
          group: "공통",
          type: "스탯",
          common: true,
          stat: true,
        },
        {
          id: "crit-artifact",
          name: "아티팩트: 강인함",
          group: "공통",
          type: "아티팩트",
          common: true,
          base: 1.8,
        },

        {
          id: "crit-s1-fire",
          name: "불길 ++",
          group: "무기룬",
          type: "무기룬",
          equipKey: "weapon-fire",
          season: 1,
          base: 22,
        },
        {
          id: "crit-s1-sworddance",
          name: "검무 ++ 10스택",
          group: "무기룬",
          type: "무기룬",
          equipKey: "weapon-sworddance",
          season: 1,
          base: 10,
        },
        {
          id: "crit-s1-wildfire",
          name: "들불 ++",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-wildfire",
          season: 1,
          base: 18,
        },
        {
          id: "crit-s1-overwhelm",
          name: "압도 ++",
          note: "각성 시 최대 효과",
          conditionLabel: "각성",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-overwhelm",
          season: 1,
          base: 4,
          awakened: 8,
        },
        {
          id: "crit-s1-outlaw",
          name: "무법자 ++",
          note: "발동 시 +10% · 미발동 시 -10%",
          conditionLabel: "무법자 미발동",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-outlaw",
          season: 1,
          base: 10,
          minBase: -10,
        },
        {
          id: "crit-s1-pale",
          name: "창백한 섬광 ++ 135",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-pale",
          season: 1,
          base: 24.15,
        },
        {
          id: "crit-s1-distant",
          name: "아득 ++",
          note: "각성 시 최대 효과",
          conditionLabel: "각성",
          group: "엠블럼룬",
          type: "엠블럼룬",
          equipKey: "emblem-distant",
          season: 1,
          base: 5,
          awakened: 25,
        },

        {
          id: "crit-s2-rockblade",
          name: "바위 칼날 30스택",
          group: "무기룬",
          type: "무기룬",
          equipKey: "weapon-rockblade",
          season: 2,
          base: 15,
        },
        {
          id: "crit-s2-curse",
          name: "날 선 적의(이속감소 15%)",
          note: "",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-curse",
          season: 2,
          base: 6,
          minBase: 6,
        },
        {
          id: "crit-s2-sleepless",
          name: "잠들지 않는 불(용 문장 활성 필요)",
          note: "용 문장 트리거 룬 보유 시 상시 적용",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-sleepless",
          season: 2,
          base: 12.5,
        },
        {
          id: "crit-s2-seal",
          name: "금 간 봉인",
          note: "반복 : 16.5%(침식) → 33%(침식 100 이상) → 0%(오염)",
          conditionLabel: "오염 구간",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-seal",
          season: 2,
          base: 16.5,
          erosion: 16.5,
          minBase: 0,
        },
        {
          id: "crit-s2-oath",
          name: "첫 번째 서약 각성",
          note: "밤의 축복 상태에서만 활성",
          conditionLabel: "밤의 축복 해제",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-oath",
          season: 2,
          base: 0,
          night: 11,
          minBase: 0,
        },
        {
          id: "crit-s2-dragon",
          name: "용 사냥꾼(신화)",
          note: "",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-dragon",
          season: 2,
          base: 10,
        },
        {
          id: "crit-s2-eternal",
          name: "영원한 밤",
          group: "엠블럼룬",
          type: "엠블럼룬",
          equipKey: "emblem-eternal",
          season: 2,
          base: 7,
        },
      ];

      const damageItems = [
        {
          id: "damage-stat",
          input: "display",
          name: "기본 피해",
          group: "기본",
          stat: true,
        },
        {
          id: "damage-urge",
          name: "억눌린 충동 저주",
          group: "선택 효과",
          base: 5,
        },
        { id: "damage-radiance", name: "광채", group: "선택 효과", base: 15 },
        { id: "damage-death", name: "죽음", group: "선택 효과", base: 20 },
        {
          id: "damage-victory",
          name: "승전 최대치",
          group: "선택 효과",
          base: 22,
        },
        { id: "damage-coldwind", name: "칼바람", group: "선택 효과", base: 10 },
        {
          id: "damage-dragon",
          name: "용 사냥꾼(신화)",
          group: "선택 효과",
          base: 10,
        },
        { id: "damage-transcend", name: "초월", group: "선택 효과", base: 15 },
      ];

      const extraItems = [
        {
          id: "extra-stat",
          input: "number",
          name: "추가타",
          group: "공통",
          type: "스탯",
          common: true,
          stat: true,
        },
        {
          id: "extra-artifact",
          name: "아티팩트: 기교",
          group: "공통",
          type: "아티팩트",
          common: true,
          base: 1.8,
        },

        {
          id: "extra-s1-crystal",
          name: "결정 ++",
          group: "무기룬",
          type: "무기룬",
          equipKey: "weapon-crystal",
          season: 1,
          base: 22,
        },
        {
          id: "extra-s1-snow",
          name: "설산 ++",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-snow",
          season: 1,
          base: 18,
        },
        {
          id: "extra-s1-looter",
          name: "약탈자 ++",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-looter",
          season: 1,
          base: 14,
        },
        {
          id: "extra-s1-delicate",
          name: "섬세 ++",
          note: "각성 시 최대 효과",
          conditionLabel: "각성",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-delicate",
          season: 1,
          base: 4,
          awakened: 8,
        },
        {
          id: "extra-s1-flame",
          name: "일렁이는 불꽃 ++ 135",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-flame",
          season: 1,
          base: 24.15,
        },
        {
          id: "extra-s1-ground",
          name: "갈땅 ++",
          note: "각성 시 최대 효과",
          conditionLabel: "각성",
          group: "엠블럼룬",
          type: "엠블럼룬",
          equipKey: "emblem-ground",
          season: 1,
          base: 14,
          awakened: 44,
        },

        {
          id: "extra-s2-curse",
          name: "날 선 적의(이속감소 15%)",
          note: "",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-curse",
          season: 2,
          base: 6,
          minBase: 6,
        },
        {
          id: "extra-s2-ice",
          name: "얼음 발톱(용 문장 활성 필요)",
          note: "용 문장 트리거 룬 보유 시 상시 적용",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-ice",
          season: 2,
          base: 12.5,
        },
        {
          id: "extra-s2-boundary",
          name: "무너진 경계",
          note: "반복 : 16.5%(침식) → 33%(침식 100 이상) → 0%(오염)",
          conditionLabel: "오염 구간",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-boundary",
          season: 2,
          base: 16.5,
          erosion: 16.5,
          minBase: 0,
        },
        {
          id: "extra-s2-chain",
          name: "교차하는 사슬 각성",
          note: "밤의 축복 상태에서만 활성",
          conditionLabel: "밤의 축복 해제",
          group: "방어구룬",
          type: "방어구룬",
          equipKey: "armor-chain",
          season: 2,
          base: 0,
          night: 11,
          minBase: 0,
        },
        {
          id: "extra-s2-eternal",
          name: "영원한 밤",
          group: "엠블럼룬",
          type: "엠블럼룬",
          equipKey: "emblem-eternal",
          season: 2,
          base: 7,
        },
        {
          id: "extra-s2-scale",
          name: "백금 천칭(평타)",
          group: "엠블럼룬",
          type: "엠블럼룬",
          equipKey: "emblem-scale",
          season: 2,
          base: 21,
        },
      ];

      const SLOT_ORDER = { 무기룬: 1, 방어구룬: 2, 엠블럼룬: 3 };
      const commonOrder = (item) => {
        if (item.stat) return 0; // 공통 영역 최상단: 스탯 입력
        if (item.type === "아티팩트") return 1; // 그 아래: 아티팩트 체크
        return 2;
      };
      const sortByEquipSlot = (items) =>
        items.sort((a, b) => {
          const aCommon = a.common || a.stat;
          const bCommon = b.common || b.stat;
          if (aCommon && bCommon) return commonOrder(a) - commonOrder(b);
          if (aCommon) return -1;
          if (bCommon) return 1;
          const slotDiff =
            (SLOT_ORDER[a.type] || 99) - (SLOT_ORDER[b.type] || 99);
          if (slotDiff) return slotDiff;
          return (b.season || 0) - (a.season || 0);
        });

      // 메인 계산기는 현재 시즌 룬만 사용한다. 이전에 저장된 시즌 1 선택값도
      // 목록과 합산 대상에서 제외되도록 데이터 단계에서 제거한다.
      const removeSeasonOneRunes = (items) => {
        for (let index = items.length - 1; index >= 0; index -= 1) {
          if (items[index].season === 1) items.splice(index, 1);
        }
      };
      removeSeasonOneRunes(critItems);
      removeSeasonOneRunes(extraItems);
      sortByEquipSlot(critItems);
      sortByEquipSlot(extraItems);

      const allSelectableItems = () =>
        [...critItems, ...damageItems, ...extraItems].filter(
          (item) =>
            !item.stat && item.input !== "display" && item.input !== "number",
        );
      const itemById = (id) =>
        allSelectableItems().find((item) => item.id === id);
      const sameEquipmentItems = (item) =>
        item?.equipKey
          ? allSelectableItems().filter(
              (candidate) => candidate.equipKey === item.equipKey,
            )
          : [item];
      const selectedEquipKey = (type) => {
        const selectedItem = allSelectableItems().find(
          (item) => item.type === type && selected(item.id),
        );
        return selectedItem?.equipKey || null;
      };
      const isExclusiveSlot = (item) =>
        item?.type === "무기룬" || item?.type === "엠블럼룬";
      const isSlotDisabled = (item) => {
        if (!isExclusiveSlot(item)) return false;
        const activeKey = selectedEquipKey(item.type);
        return !!activeKey && activeKey !== item.equipKey;
      };

      const classEffects = [
        { id: "class-warrior-p5", className: "전사", label: "P5", crit: 10 },

        {
          id: "class-greatsword-a5-berserker",
          className: "대검전사",
          label: "A5광전사",
          crit: 15,
        },
        {
          id: "class-greatsword-a5-craving",
          className: "대검전사",
          label: "A5무자비 갈망",
          crit: 15,
        },
        {
          id: "class-greatsword-a5-end",
          className: "대검전사",
          label: "A5무자비 끝갈",
          crit: 20,
        },

        {
          id: "class-swordsman-p1",
          className: "검술사",
          label: "P1",
          crit: 40,
          damage: 30,
        },
        {
          id: "class-swordsman-p3",
          className: "검술사",
          label: "P3",
          damage: 5,
        },
        {
          id: "class-swordsman-p4",
          className: "검술사",
          label: "P4",
          damage: 5,
        },
        {
          id: "class-swordsman-p5",
          className: "검술사",
          label: "P5",
          damage: 30,
        },

        {
          id: "class-knight-p4",
          className: "기사",
          label: "P4",
          crit: 10,
          extra: 10,
        },
        { id: "class-longbow-p1", className: "장궁병", label: "P1", crit: 15 },
        {
          id: "class-crossbow-p3",
          className: "석궁사수",
          label: "P3",
          damage: 5,
        },

        {
          id: "class-bard-p4",
          className: "음유시인",
          label: "P4 3스택",
          crit: 9,
          extra: 9,
        },
        { id: "class-bard-p5", className: "음유시인", label: "P5", damage: 20 },

        {
          id: "class-dancer-p1",
          className: "댄서",
          label: "P1 10스택",
          crit: 10,
          extra: 10,
        },
        {
          id: "class-fighter-a1",
          className: "격투가",
          label: "A1약점",
          crit: 25,
        },

        {
          id: "class-dual-p5",
          className: "듀얼블레이드",
          label: "P5",
          crit: 15,
        },
        {
          id: "class-dual-a4",
          className: "듀얼블레이드",
          label: "A4",
          extra: 15,
        },

        { id: "class-fire-s2", className: "화염술사", label: "S2", crit: 12 },
        { id: "class-dark-s2", className: "암흑술사", label: "S2", crit: 10 },
        { id: "class-thief-p2", className: "도적", label: "P2", extra: 15 },
      ];
