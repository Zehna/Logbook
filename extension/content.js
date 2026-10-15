// content.js - LogMagang Chrome Extension V3 with Multi-Portal & Shadow DOM
(function () {
  if (window.__LOGMAGANG_INJECTED__) return;
  window.__LOGMAGANG_INJECTED__ = true;

  // 1. Host Element untuk Shadow DOM
  let host = document.getElementById("logmagang-autofill-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "logmagang-autofill-host";
    document.documentElement.appendChild(host);
  }

  const shadow = host.attachShadow({ mode: "open" });

  // 2. Gaya CSS Terisolasi
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .fab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #4f46e5;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }

    .fab-btn:hover {
      background: #4338ca;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
    }

    .fab-icon {
      font-size: 15px;
    }

    .panel {
      display: none;
      position: absolute;
      bottom: 56px;
      right: 0;
      width: 340px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      padding: 16px;
      color: #0f172a;
      flex-direction: column;
      gap: 10px;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(6px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
    }

    .panel-title {
      font-size: 13px;
      font-weight: 800;
      color: #1e1b4b;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      line-height: 1;
      padding: 4px;
    }

    .btn-close:hover {
      color: #0f172a;
    }

    select {
      width: 100%;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 11.5px;
      background: #ffffff;
      color: #1e293b;
      font-weight: 600;
      outline: none;
    }

    .queue-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 11px;
    }

    .queue-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      color: #334155;
    }

    .queue-btn:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .queue-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .preview-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      font-size: 11px;
      color: #334155;
      max-height: 110px;
      overflow-y: auto;
      line-height: 1.45;
    }

    .preview-card b {
      color: #1e293b;
    }

    .word-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
    }

    .badge-green {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .badge-amber {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .btn-fill {
      background: #4f46e5;
      color: #ffffff;
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s;
    }

    .btn-fill:hover {
      background: #4338ca;
    }

    .toast-msg {
      display: none;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }

    .toast-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .toast-warn {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
  `;
  shadow.appendChild(style);

  // 3. Elemen Kontainer UI
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="panel" id="lm-panel">
      <div class="panel-header">
        <div class="panel-title">
          <span>📄</span>
          <span>LogMagang Auto-Fill Pro</span>
        </div>
        <button class="btn-close" id="lm-close">✕</button>
      </div>

      <div id="lm-toast" class="toast-msg"></div>

      <div>
        <select id="lm-portal-select">
          <option value="kemdikbud">1. Portal Kampus Merdeka / MSIB</option>
          <option value="ipb">2. Student Portal IPB (Aktivitas)</option>
          <option value="ugm">3. Simaster UGM / Cybercampus</option>
          <option value="siakad">4. SIAKAD / Neo Feeder Generic</option>
          <option value="custom">5. Custom Selector Mode</option>
        </select>
      </div>

      <div id="lm-queue-bar" class="queue-bar" style="display: none;">
        <button id="lm-queue-prev" class="queue-btn">◀</button>
        <span id="lm-queue-text" style="font-weight: 700; color: #1e1b4b;">Hari 1 dari 5</span>
        <button id="lm-queue-next" class="queue-btn">▶</button>
      </div>

      <div class="preview-card" id="lm-preview">
        <em>Memuat data logbook aktif...</em>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div id="lm-word-badge" class="word-badge badge-green" style="display: none;">
          📝 <span id="lm-word-count">0 kata</span>
        </div>
        <span style="font-size: 10px; color: #94a3b8;" id="lm-date-tag">-</span>
      </div>

      <button class="btn-fill" id="lm-btn-execute">
        ⚡ Isi Form Otomatis Sekarang
      </button>
    </div>

    <div class="fab-btn" id="lm-fab">
      <span class="fab-icon">📄</span>
      <span>Auto-Fill LogMagang</span>
    </div>
  `;
  shadow.appendChild(container);

  const panel = shadow.getElementById("lm-panel");
  const fab = shadow.getElementById("lm-fab");
  const btnClose = shadow.getElementById("lm-close");
  const preview = shadow.getElementById("lm-preview");
  const btnExecute = shadow.getElementById("lm-btn-execute");
  const toast = shadow.getElementById("lm-toast");
  const portalSelect = shadow.getElementById("lm-portal-select");
  const queueBar = shadow.getElementById("lm-queue-bar");
  const queueText = shadow.getElementById("lm-queue-text");
  const btnQueuePrev = shadow.getElementById("lm-queue-prev");
  const btnQueueNext = shadow.getElementById("lm-queue-next");
  const wordBadge = shadow.getElementById("lm-word-badge");
  const wordCount = shadow.getElementById("lm-word-count");
  const dateTag = shadow.getElementById("lm-date-tag");

  let logbookList = [];
  let currentIdx = 0;
  let currentPreset = "kemdikbud";

  function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function showPanelToast(msg, isSuccess = true) {
    toast.textContent = msg;
    toast.className = `toast-msg ${isSuccess ? "toast-success" : "toast-warn"}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3200);
  }

  function updatePreviewUI() {
    if (!logbookList || logbookList.length === 0) {
      preview.innerHTML = "<em>Belum ada data logbook aktif. Buka popup ekstensi untuk memuat data.</em>";
      queueBar.style.display = "none";
      wordBadge.style.display = "none";
      dateTag.textContent = "-";
      return;
    }

    const data = logbookList[currentIdx] || logbookList[0];
    dateTag.textContent = data.tanggal || data.hari || "Hari ini";

    if (logbookList.length > 1) {
      queueBar.style.display = "flex";
      queueText.textContent = `Antrean ${currentIdx + 1}/${logbookList.length} (${data.hari || "Hari " + (currentIdx + 1)})`;
      btnQueuePrev.disabled = currentIdx === 0;
      btnQueueNext.disabled = currentIdx === logbookList.length - 1;
    } else {
      queueBar.style.display = "none";
    }

    const desc = data.deskripsiKegiatan || data.deskripsi_kegiatan || "-";
    const comp = data.kompetensiDikembangkan || data.kompetensi_dikembangkan || "-";

    preview.innerHTML = `
      <div><b>Tanggal:</b> ${data.tanggal || data.hari || "Hari ini"}</div>
      <div><b>Peran:</b> ${data.peran || "Mahasiswa"}</div>
      <div style="margin-top: 4px;"><b>Deskripsi:</b> ${desc.slice(0, 90)}${desc.length > 90 ? "..." : ""}</div>
      <div style="margin-top: 4px;"><b>Kompetensi:</b> ${comp.slice(0, 70)}${comp.length > 70 ? "..." : ""}</div>
    `;

    const words = countWords(desc);
    wordBadge.style.display = "inline-flex";
    if (words >= 20) {
      wordBadge.className = "word-badge badge-green";
      wordCount.textContent = `${words} kata (>= 20 OK)`;
    } else {
      wordBadge.className = "word-badge badge-amber";
      wordCount.textContent = `${words} kata (< 20 kata)`;
    }

    btnExecute.textContent = `⚡ Isi Form Hari Ini (${data.hari || currentIdx + 1})`;
  }

  function loadStoredData() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ["logmagang_active_logbook", "logmagang_portal_preset", "logmagang_queue_index"],
        (res) => {
          if (res) {
            if (res.logmagang_portal_preset) {
              currentPreset = res.logmagang_portal_preset;
              if (portalSelect) portalSelect.value = currentPreset;
            }
            if (res.logmagang_active_logbook) {
              const raw = res.logmagang_active_logbook;
              logbookList = Array.isArray(raw) ? raw : [raw];
              currentIdx = res.logmagang_queue_index || 0;
              if (currentIdx >= logbookList.length) currentIdx = 0;
            } else {
              logbookList = [];
            }
            updatePreviewUI();
          }
        }
      );
    }
  }

  portalSelect.addEventListener("change", () => {
    currentPreset = portalSelect.value;
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ logmagang_portal_preset: currentPreset });
    }
    showPanelToast(`Target portal diubah ke ${portalSelect.options[portalSelect.selectedIndex].text}`);
  });

  btnQueuePrev.addEventListener("click", () => {
    if (currentIdx > 0) {
      currentIdx--;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ logmagang_queue_index: currentIdx });
      }
      updatePreviewUI();
    }
  });

  btnQueueNext.addEventListener("click", () => {
    if (currentIdx < logbookList.length - 1) {
      currentIdx++;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ logmagang_queue_index: currentIdx });
      }
      updatePreviewUI();
    }
  });

  fab.addEventListener("click", () => {
    const isHidden = panel.style.display === "" || panel.style.display === "none";
    panel.style.display = isHidden ? "flex" : "none";
    if (isHidden) {
      loadStoredData();
    }
  });

  btnClose.addEventListener("click", () => {
    panel.style.display = "none";
  });

  // 4. Logika Cerdas Pencocokan Form Berdasarkan Preset Portal
  function triggerEvents(el, value) {
    const tracker = el._valueTracker;
    if (tracker) {
      tracker.setValue("");
    }

    const proto = Object.getPrototypeOf(el);
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));

    // Efek highlight
    const originalBorder = el.style.borderColor;
    const originalShadow = el.style.boxShadow;
    el.style.borderColor = "#10b981";
    el.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.25)";
    setTimeout(() => {
      el.style.borderColor = originalBorder;
      el.style.boxShadow = originalShadow;
    }, 2500);
  }

  function autofillPortalForm(data, preset = "kemdikbud") {
    if (!data) return { success: false, message: "Tidak ada data logbook." };

    const candidates = Array.from(
      document.querySelectorAll("input, textarea, select")
    ).filter((el) => {
      if (el.type === "hidden" || el.type === "submit" || el.type === "button")
        return false;
      if (host.contains(el)) return false;
      return true;
    });

    if (candidates.length === 0) {
      return { success: false, message: "Tidak ada elemen formulir terdeteksi di halaman ini." };
    }

    let filledCount = 0;

    const descValue = data.deskripsiKegiatan || data.deskripsi_kegiatan || "";
    const compValue = data.kompetensiDikembangkan || data.kompetensi_dikembangkan || "";
    const kendalaValue = data.kendalaDihadapi || data.kendala_dihadapi || "";
    const solusiValue = data.solusiTindakan || data.solusi_tindakan || "";
    const refleksiValue = data.refleksiPembelajaran || data.refleksi_pembelajaran || "";

    const combinedAllValue = [
      `1. Deskripsi Kegiatan:\n${descValue}`,
      `2. Kompetensi yang Dikembangkan:\n${compValue}`,
      `3. Kendala yang Dihadapi:\n${kendalaValue}`,
      `4. Solusi & Tindakan:\n${solusiValue}`,
      `5. Refleksi Pembelajaran:\n${refleksiValue}`,
    ].join("\n\n");

    // Helper identifikasi field berdasarkan preset
    candidates.forEach((el) => {
      const id = (el.id || "").toLowerCase();
      const name = (el.name || "").toLowerCase();
      const placeholder = (el.placeholder || "").toLowerCase();
      const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();

      let labelText = "";
      if (el.labels && el.labels[0]) {
        labelText = el.labels[0].textContent.toLowerCase();
      } else {
        const parent = el.closest("label, .form-group, .field, div, td");
        if (parent) {
          labelText = (parent.textContent || "").toLowerCase().slice(0, 100);
        }
      }

      const combinedMeta = `${id} ${name} ${placeholder} ${ariaLabel} ${labelText}`;

      // 1. IPB Preset Rules (ipb_auto_logbook pattern)
      if (preset === "ipb") {
        if (
          combinedMeta.includes("rencana_kegiatan") ||
          combinedMeta.includes("realisasi_kegiatan") ||
          id === "kegiatan" ||
          name === "kegiatan" ||
          combinedMeta.includes("deskripsi_kegiatan")
        ) {
          triggerEvents(el, descValue);
          filledCount++;
          return;
        }
        if (id === "kompetensi" || name === "kompetensi" || combinedMeta.includes("capaian")) {
          triggerEvents(el, compValue);
          filledCount++;
          return;
        }
        if (id === "kendala" || name === "kendala" || combinedMeta.includes("masalah")) {
          triggerEvents(el, kendalaValue);
          filledCount++;
          return;
        }
        if (id === "solusi" || name === "solusi" || combinedMeta.includes("mitigasi")) {
          triggerEvents(el, solusiValue);
          filledCount++;
          return;
        }
        if (id === "refleksi" || name === "catatan" || combinedMeta.includes("refleksi")) {
          triggerEvents(el, refleksiValue);
          filledCount++;
          return;
        }
      }

      // 2. Generic / Kemdikbud / UGM Preset
      if (
        combinedMeta.includes("deskripsi") ||
        combinedMeta.includes("kegiatan") ||
        combinedMeta.includes("uraian") ||
        combinedMeta.includes("aktivitas") ||
        combinedMeta.includes("activity") ||
        combinedMeta.includes("pekerjaan")
      ) {
        if (!combinedMeta.includes("refleksi") && !combinedMeta.includes("kendala") && !combinedMeta.includes("solusi")) {
          triggerEvents(el, descValue);
          filledCount++;
          return;
        }
      }

      if (
        combinedMeta.includes("kompetensi") ||
        combinedMeta.includes("capaian") ||
        combinedMeta.includes("skill") ||
        combinedMeta.includes("pembelajaran") ||
        combinedMeta.includes("kemampuan")
      ) {
        if (!combinedMeta.includes("refleksi")) {
          triggerEvents(el, compValue);
          filledCount++;
          return;
        }
      }

      if (
        combinedMeta.includes("kendala") ||
        combinedMeta.includes("hambatan") ||
        combinedMeta.includes("masalah") ||
        combinedMeta.includes("obstacle") ||
        combinedMeta.includes("tantangan")
      ) {
        triggerEvents(el, kendalaValue);
        filledCount++;
        return;
      }

      if (
        combinedMeta.includes("solusi") ||
        combinedMeta.includes("tindakan") ||
        combinedMeta.includes("pemecahan") ||
        combinedMeta.includes("mitigasi") ||
        combinedMeta.includes("action")
      ) {
        triggerEvents(el, solusiValue);
        filledCount++;
        return;
      }

      if (
        combinedMeta.includes("refleksi") ||
        combinedMeta.includes("evaluasi") ||
        combinedMeta.includes("insight") ||
        combinedMeta.includes("tindak_lanjut")
      ) {
        triggerEvents(el, refleksiValue);
        filledCount++;
        return;
      }

      // Jam Mulai
      if (
        combinedMeta.includes("jam_mulai") ||
        combinedMeta.includes("waktu_mulai") ||
        combinedMeta.includes("start_time") ||
        combinedMeta.includes("jam_masuk")
      ) {
        triggerEvents(el, "08:00");
        filledCount++;
        return;
      }

      // Jam Selesai
      if (
        combinedMeta.includes("jam_selesai") ||
        combinedMeta.includes("waktu_selesai") ||
        combinedMeta.includes("end_time") ||
        combinedMeta.includes("jam_keluar") ||
        combinedMeta.includes("pulang")
      ) {
        triggerEvents(el, "17:00");
        filledCount++;
        return;
      }

      // Tanggal
      if (
        el.type === "date" ||
        combinedMeta.includes("tanggal") ||
        combinedMeta.includes("date") ||
        combinedMeta.includes("tgl")
      ) {
        const todayIso = new Date().toISOString().slice(0, 10);
        triggerEvents(el, todayIso);
        filledCount++;
        return;
      }
    });

    // Fallback: Jika hanya ada 1 textarea dan belum terisi
    if (filledCount === 0) {
      const singleTextarea = candidates.find((el) => el.tagName.toLowerCase() === "textarea");
      if (singleTextarea) {
        triggerEvents(singleTextarea, combinedAllValue);
        filledCount++;
      }
    }

    if (filledCount > 0) {
      return { success: true, count: filledCount };
    } else {
      return {
        success: false,
        message: `Tidak ditemukan kolom input yang cocok untuk preset ${preset}.`,
      };
    }
  }

  btnExecute.addEventListener("click", () => {
    if (!logbookList || logbookList.length === 0) {
      showPanelToast("Data logbook belum dimuat di ekstensi.", false);
      return;
    }

    const currentItem = logbookList[currentIdx] || logbookList[0];
    const result = autofillPortalForm(currentItem, currentPreset);
    if (result.success) {
      showPanelToast(`✅ Berhasil mengisi ${result.count} field (${currentPreset})!`, true);
      // Auto-advance
      if (currentIdx < logbookList.length - 1) {
        currentIdx++;
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ logmagang_queue_index: currentIdx });
        }
        updatePreviewUI();
      }
    } else {
      showPanelToast(`⚠️ ${result.message}`, false);
    }
  });

  // Listener Message dari Popup
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "AUTOFILL_LOGBOOK") {
        const data = request.data;
        const preset = request.preset || "kemdikbud";
        currentPreset = preset;
        if (portalSelect) portalSelect.value = preset;
        const result = autofillPortalForm(data, preset);
        sendResponse(result);
        return true;
      }
    });
  }

  // Listener Message dari Web App LogMagang (Direct Zero-Click Bridge)
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.source === "LOGMAGANG_WEB_APP" && event.data.type === "SYNC_TO_EXTENSION") {
      const payload = event.data.payload;
      if (!payload) return;

      const items = Array.isArray(payload) ? payload : (payload.history || (payload.item ? [payload.item] : []));
      if (items.length > 0) {
        logbookList = items;
        currentIdx = 0;
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            logmagang_queue: items,
            logmagang_queue_index: 0,
            logmagang_last_sync: new Date().toISOString()
          }, () => {
            showPanelToast(`⚡ Berhasil disinkronkan (${items.length} entri) dari Web LogMagang!`, true);
            updatePreviewUI();
            // Kirim konfirmasi balik ke Web App
            window.postMessage({
              source: "LOGMAGANG_EXTENSION_ACK",
              success: true,
              count: items.length
            }, "*");
          });
        } else {
          showPanelToast(`⚡ Berhasil menerima ${items.length} entri!`, true);
          updatePreviewUI();
        }
      }
    }
  });

  loadStoredData();
})();
