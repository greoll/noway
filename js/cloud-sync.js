(() => {
  "use strict";

  const SUPABASE_URL = "https://sbklxbkpgfzfpeaooxij.supabase.co";
  const SUPABASE_KEY = "sb_publishable_etPPK5UV2SucBKY3Zg0SCA_dEZUh91U";
  const DATA_PREFIX = "mabinogi-";
  const DEVICE_USER_KEY = "cloud-sync-device-user";
  const LAST_REMOTE_KEY = "cloud-sync-last-remote";
  const TABLE = "user_app_state";
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  let client;
  let session = null;
  let remoteRow = null;
  let uploadTimer = 0;
  let applyingRemote = false;
  let initializedUserId = null;
  let realtimeChannel = null;
  let pendingUploadAt = "";
  let realtimeReloadTimer = 0;

  const elements = {};
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

  function setMessage(message = "", type = "") {
    elements.message.textContent = message;
    elements.message.className = `cloud-sync-message${type ? ` ${type}` : ""}`;
  }

  function setTrigger(status, text) {
    elements.trigger.classList.remove("connected", "syncing", "error");
    if (status) elements.trigger.classList.add(status);
    elements.triggerText.textContent = text;
  }

  function renderAuth() {
    const signedIn = Boolean(session?.user);
    elements.signedOut.hidden = signedIn;
    elements.signedIn.hidden = !signedIn;
    elements.userEmail.textContent = session?.user?.email || "";
    setTrigger(signedIn ? "connected" : "", signedIn ? "동기화됨" : "동기화");
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
        if (isAppKey(key) && typeof value === "string") {
          originalSetItem.call(localStorage, key, value);
        }
      });
    } finally {
      applyingRemote = false;
    }
  }

  async function fetchRemote() {
    if (!session?.user) return null;
    const { data, error } = await client
      .from(TABLE)
      .select("state, updated_at")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (error) throw error;
    remoteRow = data;
    return data;
  }

  async function uploadLocal({ announce = true } = {}) {
    if (!session?.user || applyingRemote) return;
    clearTimeout(uploadTimer);
    setTrigger("syncing", "저장 중");
    if (announce) setMessage("현재 기기의 데이터를 저장하고 있습니다.");
    const updatedAt = new Date().toISOString();
    pendingUploadAt = updatedAt;
    const { error } = await client.from(TABLE).upsert({
      user_id: session.user.id,
      state: collectState(),
      updated_at: updatedAt,
    }, { onConflict: "user_id" });
    if (error) {
      pendingUploadAt = "";
      setTrigger("error", "동기화 오류");
      setMessage(`저장하지 못했습니다: ${error.message}`, "error");
      throw error;
    }
    originalSetItem.call(localStorage, DEVICE_USER_KEY, session.user.id);
    originalSetItem.call(localStorage, LAST_REMOTE_KEY, updatedAt);
    remoteRow = { state: collectState(), updated_at: updatedAt };
    elements.conflict.hidden = true;
    setTrigger("connected", "동기화됨");
    if (announce) setMessage("현재 기기의 데이터를 클라우드에 저장했습니다.", "success");
    window.setTimeout(() => {
      if (pendingUploadAt === updatedAt) pendingUploadAt = "";
    }, 1500);
  }

  function scheduleUpload() {
    if (!session?.user || applyingRemote) return;
    clearTimeout(uploadTimer);
    uploadTimer = window.setTimeout(() => uploadLocal({ announce: false }).catch(() => {}), 900);
  }

  async function downloadRemote({ reload = true } = {}) {
    if (!session?.user) return;
    setTrigger("syncing", "불러오는 중");
    setMessage("클라우드 데이터를 불러오고 있습니다.");
    const row = await fetchRemote();
    if (!row) {
      await uploadLocal();
      return;
    }
    applyState(row.state);
    originalSetItem.call(localStorage, DEVICE_USER_KEY, session.user.id);
    originalSetItem.call(localStorage, LAST_REMOTE_KEY, row.updated_at || "");
    elements.conflict.hidden = true;
    setTrigger("connected", "동기화됨");
    setMessage("클라우드 데이터를 적용했습니다.", "success");
    if (reload) window.setTimeout(() => location.reload(), 250);
  }

  async function stopRealtime() {
    clearTimeout(realtimeReloadTimer);
    if (!realtimeChannel || !client) return;
    const channel = realtimeChannel;
    realtimeChannel = null;
    await client.removeChannel(channel);
  }

  function startRealtime() {
    if (!session?.user || realtimeChannel) return;
    realtimeChannel = client
      .channel(`user-app-state-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE,
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const next = payload.new;
          if (!next?.updated_at) return;
          if (pendingUploadAt && Math.abs(Date.parse(next.updated_at) - Date.parse(pendingUploadAt)) < 3000) return;
          const lastRemote = localStorage.getItem(LAST_REMOTE_KEY) || "";
          if (next.updated_at <= lastRemote) return;
          remoteRow = next;
          applyState(next.state);
          originalSetItem.call(localStorage, DEVICE_USER_KEY, session.user.id);
          originalSetItem.call(localStorage, LAST_REMOTE_KEY, next.updated_at);
          setTrigger("syncing", "변경 감지");
          setMessage("다른 기기의 변경사항을 적용합니다.", "success");
          clearTimeout(realtimeReloadTimer);
          realtimeReloadTimer = window.setTimeout(() => location.reload(), 350);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setTrigger("connected", "실시간 동기화");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setTrigger("error", "실시간 연결 오류");
        }
      });
  }

  async function initializeSession(nextSession) {
    const previousUserId = session?.user?.id || null;
    session = nextSession;
    renderAuth();
    if (!session?.user) {
      await stopRealtime();
      initializedUserId = null;
      remoteRow = null;
      elements.conflict.hidden = true;
      return;
    }
    if (initializedUserId === session.user.id) return;
    if (previousUserId && previousUserId !== session.user.id) await stopRealtime();
    initializedUserId = session.user.id;
    startRealtime();
    try {
      const row = await fetchRemote();
      const knownDevice = localStorage.getItem(DEVICE_USER_KEY) === session.user.id;
      if (!row) {
        await uploadLocal({ announce: false });
        setMessage("이 기기의 데이터를 첫 클라우드 데이터로 저장했습니다.", "success");
        return;
      }
      if (!hasLocalState()) {
        await downloadRemote();
        return;
      }
      if (!knownDevice) {
        elements.conflict.hidden = false;
        setMessage("불러올 데이터 또는 저장할 데이터를 선택해주세요.");
        elements.dialog.showModal();
        return;
      }
      const lastRemote = localStorage.getItem(LAST_REMOTE_KEY) || "";
      if (row.updated_at && row.updated_at > lastRemote) {
        await downloadRemote();
      } else {
        setTrigger("connected", "동기화됨");
      }
    } catch (error) {
      setTrigger("error", "동기화 오류");
      setMessage(`클라우드 연결 오류: ${error.message}`, "error");
    }
  }

  async function checkForRemoteUpdate() {
    if (!session?.user || document.visibilityState !== "visible") return;
    try {
      const row = await fetchRemote();
      const lastRemote = localStorage.getItem(LAST_REMOTE_KEY) || "";
      if (row?.updated_at && row.updated_at > lastRemote) await downloadRemote();
    } catch {
      setTrigger("error", "동기화 오류");
    }
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && isAppKey(key)) scheduleUpload();
  };
  Storage.prototype.removeItem = function patchedRemoveItem(key) {
    originalRemoveItem.call(this, key);
    if (this === localStorage && isAppKey(key)) scheduleUpload();
  };

  async function init() {
    elements.trigger = byId("cloudSyncTrigger");
    elements.triggerText = byId("cloudSyncTriggerText");
    elements.dialog = byId("cloudSyncDialog");
    elements.close = byId("cloudSyncClose");
    elements.signedOut = byId("cloudSyncSignedOut");
    elements.signedIn = byId("cloudSyncSignedIn");
    elements.form = byId("cloudSyncLoginForm");
    elements.email = byId("cloudSyncEmail");
    elements.userEmail = byId("cloudSyncUserEmail");
    elements.message = byId("cloudSyncMessage");
    elements.conflict = byId("cloudSyncConflict");
    elements.download = byId("cloudSyncDownload");
    elements.upload = byId("cloudSyncUpload");
    elements.logout = byId("cloudSyncLogout");

    if (!window.supabase?.createClient) {
      setTrigger("error", "연결 실패");
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    elements.trigger.addEventListener("click", () => {
      setMessage("");
      elements.dialog.showModal();
    });
    elements.close.addEventListener("click", () => elements.dialog.close());
    elements.dialog.addEventListener("click", (event) => {
      if (event.target === elements.dialog) elements.dialog.close();
    });
    elements.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = elements.email.value.trim();
      if (!email) return;
      setMessage("로그인 링크를 전송하고 있습니다.");
      const redirectTo = `${location.origin}${location.pathname}`;
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (error) {
        setMessage(`로그인 링크 전송 실패: ${error.message}`, "error");
        return;
      }
      setMessage("이메일로 로그인 링크를 보냈습니다. 같은 브라우저에서 링크를 열어주세요.", "success");
    });
    elements.download.addEventListener("click", () => downloadRemote().catch((error) => setMessage(error.message, "error")));
    elements.upload.addEventListener("click", () => uploadLocal().catch(() => {}));
    elements.logout.addEventListener("click", async () => {
      await client.auth.signOut();
      elements.dialog.close();
    });
    document.addEventListener("visibilitychange", checkForRemoteUpdate);
    window.addEventListener("focus", checkForRemoteUpdate);

    const { data } = await client.auth.getSession();
    await initializeSession(data.session);
    client.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => initializeSession(nextSession), 0);
    });
  }

  init().catch((error) => {
    console.error("Cloud sync initialization failed", error);
  });
})();
