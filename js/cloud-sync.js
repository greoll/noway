(() => {
  "use strict";

  const SUPABASE_URL = "https://sbklxbkpgfzfpeaooxij.supabase.co";
  const SUPABASE_KEY = "sb_publishable_etPPK5UV2SucBKY3Zg0SCA_dEZUh91U";
  const DATA_PREFIX = "mabinogi-";
  const SYNC_KEY_STORAGE = "cloud-sync-shared-key";
  const LAST_REMOTE_STORAGE = "cloud-sync-last-remote";
  const TABLE = "shared_app_state";
  const POLL_INTERVAL = 2500;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  let client;
  let syncKey = "";
  let uploadTimer = 0;
  let pollTimer = 0;
  let applyingRemote = false;
  let pendingUpload = false;
  let bootstrapping = true;
  let elements = {};

  const byId = (id) => document.getElementById(id);
  const isAppKey = (key) => typeof key === "string" && key.startsWith(DATA_PREFIX);

  function collectState() {
    const state = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (isAppKey(key)) state[key] = localStorage.getItem(key);
    }
    return state;
  }

  function hasLocalState() {
    return Object.keys(collectState()).length > 0;
  }

  function stateMatchesLocal(remoteState) {
    const localState = collectState();
    const localKeys = Object.keys(localState).sort();
    const remoteKeys = Object.keys(remoteState || {}).sort();
    return localKeys.length === remoteKeys.length
      && localKeys.every((key, index) => key === remoteKeys[index] && localState[key] === remoteState[key]);
  }

  function setMessage(message = "", type = "") {
    elements.message.textContent = message;
    elements.message.className = `cloud-sync-message${type ? ` ${type}` : ""}`;
  }

  function setTrigger(status, text) {
    elements.trigger.classList.remove("connected", "syncing", "error");
    if (status) elements.trigger.classList.add(status);
    elements.triggerText.textContent = text;
  }

  function renderConnection() {
    const connected = Boolean(syncKey);
    elements.signedOut.hidden = connected;
    elements.signedIn.hidden = !connected;
    elements.keyDisplay.textContent = syncKey;
    setTrigger(connected ? "connected" : "", connected ? "동기화 연결됨" : "동기화");
  }

  function applyState(state) {
    applyingRemote = true;
    try {
      const currentKeys = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (isAppKey(key)) currentKeys.push(key);
      }
      currentKeys.forEach((key) => originalRemoveItem.call(localStorage, key));
      Object.entries(state || {}).forEach(([key, value]) => {
        if (isAppKey(key) && typeof value === "string") originalSetItem.call(localStorage, key, value);
      });
    } finally {
      applyingRemote = false;
    }
  }

  async function fetchRemote() {
    if (!syncKey) return null;
    const { data, error } = await client
      .from(TABLE)
      .select("state, updated_at")
      .eq("sync_id", syncKey)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function uploadLocal({ announce = true } = {}) {
    if (!syncKey || applyingRemote || pendingUpload) return;
    clearTimeout(uploadTimer);
    pendingUpload = true;
    setTrigger("syncing", "저장 중");
    if (announce) setMessage("현재 기기의 데이터를 저장하고 있습니다.");
    try {
      const updatedAt = new Date().toISOString();
      const { data, error } = await client
        .from(TABLE)
        .upsert({
          sync_id: syncKey,
          state: collectState(),
          updated_at: updatedAt,
        }, { onConflict: "sync_id" })
        .select("updated_at")
        .single();
      if (error) throw error;
      const savedAt = data?.updated_at || updatedAt;
      originalSetItem.call(localStorage, LAST_REMOTE_STORAGE, String(savedAt));
      elements.conflict.hidden = true;
      setTrigger("connected", "동기화 연결됨");
      if (announce) setMessage("현재 기기 데이터를 저장했습니다.", "success");
    } catch (error) {
      setTrigger("error", "동기화 오류");
      setMessage(`저장하지 못했습니다: ${error.message}`, "error");
      throw error;
    } finally {
      pendingUpload = false;
    }
  }

  function scheduleUpload() {
    if (!syncKey || applyingRemote || bootstrapping) return;
    clearTimeout(uploadTimer);
    uploadTimer = window.setTimeout(() => uploadLocal({ announce: false }).catch(() => {}), 900);
  }

  async function downloadRemote({ reload = true, announce = true } = {}) {
    if (!syncKey) return;
    setTrigger("syncing", "불러오는 중");
    if (announce) setMessage("클라우드 데이터를 불러오고 있습니다.");
    const row = await fetchRemote();
    if (!row) {
      await uploadLocal({ announce });
      return;
    }
    applyState(row.state);
    originalSetItem.call(localStorage, LAST_REMOTE_STORAGE, row.updated_at || "");
    elements.conflict.hidden = true;
    setTrigger("connected", "동기화 연결됨");
    if (announce) setMessage("클라우드 데이터를 적용했습니다.", "success");
    if (reload) window.setTimeout(() => location.reload(), 220);
  }

  async function pollRemote() {
    if (!syncKey || document.visibilityState !== "visible" || pendingUpload) return;
    try {
      const row = await fetchRemote();
      if (!row?.updated_at) return;
      const lastRemote = localStorage.getItem(LAST_REMOTE_STORAGE) || "";
      if (new Date(row.updated_at).getTime() <= new Date(lastRemote || 0).getTime()) return;
      if (stateMatchesLocal(row.state)) {
        originalSetItem.call(localStorage, LAST_REMOTE_STORAGE, row.updated_at);
        setTrigger("connected", "동기화 연결됨");
        return;
      }
      applyState(row.state);
      originalSetItem.call(localStorage, LAST_REMOTE_STORAGE, row.updated_at);
      setTrigger("syncing", "변경 감지");
      setMessage("다른 기기의 변경사항을 적용합니다.", "success");
      window.setTimeout(() => location.reload(), 250);
    } catch (error) {
      setTrigger("error", "동기화 오류");
      setMessage(`연결 확인 실패: ${error.message}`, "error");
    }
  }

  function startPolling() {
    clearInterval(pollTimer);
    if (syncKey) pollTimer = window.setInterval(pollRemote, POLL_INTERVAL);
  }

  async function connectKey(key) {
    const normalized = key.trim();
    if (normalized.length < 12) {
      setMessage("동기화 키는 12자 이상이어야 합니다.", "error");
      return;
    }
    syncKey = normalized;
    originalSetItem.call(localStorage, SYNC_KEY_STORAGE, syncKey);
    renderConnection();
    startPolling();
    setTrigger("syncing", "연결 확인 중");
    try {
      const row = await fetchRemote();
      if (!row) {
        await uploadLocal({ announce: false });
        setMessage("새 동기화 공간을 만들고 현재 데이터를 저장했습니다.", "success");
        return;
      }
      if (!hasLocalState()) {
        await downloadRemote();
        return;
      }
      elements.conflict.hidden = false;
      setTrigger("connected", "선택 필요");
      setMessage("클라우드 데이터와 현재 기기 데이터 중 사용할 항목을 선택하세요.");
    } catch (error) {
      setTrigger("error", "연결 오류");
      setMessage(`동기화 키 연결 실패: ${error.message}`, "error");
    }
  }

  function generateKey() {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    const previousValue = this === localStorage ? this.getItem(key) : null;
    originalSetItem.call(this, key, value);
    if (this === localStorage && isAppKey(key) && previousValue !== String(value)) scheduleUpload();
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key) {
    const existed = this === localStorage && this.getItem(key) !== null;
    originalRemoveItem.call(this, key);
    if (existed && isAppKey(key)) scheduleUpload();
  };

  async function init() {
    elements = {
      trigger: byId("cloudSyncTrigger"), triggerText: byId("cloudSyncTriggerText"),
      dialog: byId("cloudSyncDialog"), close: byId("cloudSyncClose"),
      signedOut: byId("cloudSyncSignedOut"), signedIn: byId("cloudSyncSignedIn"),
      form: byId("cloudSyncLoginForm"), keyInput: byId("cloudSyncKey"),
      generate: byId("cloudSyncGenerate"), keyDisplay: byId("cloudSyncKeyDisplay"),
      copy: byId("cloudSyncCopy"), message: byId("cloudSyncMessage"),
      conflict: byId("cloudSyncConflict"), download: byId("cloudSyncDownload"),
      upload: byId("cloudSyncUpload"), logout: byId("cloudSyncLogout"),
    };

    if (!window.supabase?.createClient) {
      setTrigger("error", "연결 실패");
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    elements.trigger.addEventListener("click", () => { setMessage(""); elements.dialog.showModal(); });
    elements.close.addEventListener("click", () => elements.dialog.close());
    elements.dialog.addEventListener("click", (event) => { if (event.target === elements.dialog) elements.dialog.close(); });
    elements.form.addEventListener("submit", (event) => { event.preventDefault(); connectKey(elements.keyInput.value); });
    elements.generate.addEventListener("click", async () => {
      const key = generateKey();
      elements.keyInput.value = key;
      await connectKey(key);
    });
    elements.copy.addEventListener("click", async () => {
      await navigator.clipboard.writeText(syncKey);
      setMessage("동기화 키를 복사했습니다.", "success");
    });
    elements.download.addEventListener("click", () => downloadRemote().catch((error) => setMessage(error.message, "error")));
    elements.upload.addEventListener("click", () => uploadLocal().catch(() => {}));
    elements.logout.addEventListener("click", () => {
      syncKey = "";
      clearInterval(pollTimer);
      originalRemoveItem.call(localStorage, SYNC_KEY_STORAGE);
      originalRemoveItem.call(localStorage, LAST_REMOTE_STORAGE);
      renderConnection();
      setMessage("이 기기의 동기화 연결을 해제했습니다.");
    });
    window.addEventListener("focus", pollRemote);
    document.addEventListener("visibilitychange", pollRemote);

    syncKey = localStorage.getItem(SYNC_KEY_STORAGE) || "";
    renderConnection();
    if (syncKey) {
      startPolling();
      await pollRemote();
    }
    bootstrapping = false;
  }

  init().catch((error) => console.error("Cloud sync initialization failed", error));
})();
