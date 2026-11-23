(() => {
  "use strict";

  const STORAGE_KEY = "mabinogi-global-memo-v1";
  const BACKUP_STORAGE_KEY = "local-global-memo-backup-v1";
  const trigger = document.getElementById("globalMemoTrigger");
  const indicator = document.getElementById("globalMemoIndicator");
  const panel = document.getElementById("globalMemoPanel");
  const backdrop = document.getElementById("globalMemoBackdrop");
  const closeButton = document.getElementById("globalMemoClose");
  const textarea = document.getElementById("globalMemoText");
  const status = document.getElementById("globalMemoStatus");
  if (!trigger || !panel || !textarea) return;

  let saveTimer = 0;
  const storedMemo = localStorage.getItem(STORAGE_KEY);
  const backupMemo = localStorage.getItem(BACKUP_STORAGE_KEY);
  textarea.value = storedMemo !== null ? storedMemo : backupMemo || "";
  if (storedMemo === null && backupMemo !== null) {
    localStorage.setItem(STORAGE_KEY, backupMemo);
  }

  const updateIndicator = () => {
    const hasContent = Boolean(textarea.value.trim());
    trigger.classList.toggle("has-content", hasContent);
    indicator.hidden = !hasContent;
  };

  const save = () => {
    window.clearTimeout(saveTimer);
    localStorage.setItem(STORAGE_KEY, textarea.value);
    localStorage.setItem(BACKUP_STORAGE_KEY, textarea.value);
    status.textContent = "저장됨";
    updateIndicator();
  };

  const open = () => {
    panel.hidden = false;
    backdrop.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("global-memo-open");
    window.setTimeout(() => textarea.focus(), 0);
  };

  const close = () => {
    save();
    panel.hidden = true;
    backdrop.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("global-memo-open");
    trigger.focus({ preventScroll: true });
  };

  textarea.addEventListener("input", () => {
    status.textContent = "입력 중…";
    updateIndicator();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 700);
  });
  textarea.addEventListener("blur", save);
  trigger.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) close();
  });

  updateIndicator();
})();
