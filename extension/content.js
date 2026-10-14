// content.js - LogMagang Chrome Extension V3 with Shadow DOM
(function () {
  if (window.__LOGMAGANG_INJECTED__) return;
  window.__LOGMAGANG_INJECTED__ = true;

  // 1. Buat Host Element untuk Shadow DOM
  let host = document.getElementById("logmagang-autofill-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "logmagang-autofill-host";
    document.documentElement.appendChild(host);
  }

  const shadow = host.attachShadow({ mode: "open" });

  // 2. Gaya CSS Terisolasi di dalam Shadow DOM
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
      width: 320px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      padding: 16px;
      color: #0f172a;
      flex-direction: column;
      gap: 12px;
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

    .preview-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      font-size: 11px;
      color: #334155;
      max-height: 120px;
      overflow-y: auto;
      line-height: 1.45;
    }

    .preview-card b {
      color: #1e293b;
    }

    .btn-fill {
      background: #4f46e5;
      color: #ffffff;
      padding: 10px 14px;
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
      padding: 8px 10px;
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

  // 3. Elemen Tampilan UI
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="panel" id="lm-panel">
      <div class="panel-header">
        <div class="panel-title">
          <span>📄</span>
          <span>LogMagang Auto-Fill</span>
        </div>
        <button class="btn-close" id="lm-close">✕</button>
      </div>

      <div id="lm-toast" class="toast-msg"></div>

      <div class="preview-card" id="lm-preview">
        <em>Memuat data logbook aktif...</em>
      </div>

      <button class="btn-fill" id="lm-btn-execute">
        ⚡ Isi Form Otomatis Hari Ini
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

  let activeData = null;

  function showPanelToast(msg, isSuccess = true) {
    toast.textContent = msg;
    toast.className = `toast-msg ${isSuccess ? "toast-success" : "toast-warn"}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3200);
  }

  function updatePreviewUI(data) {
    if (!data) {
      preview.innerHTML =
        "<em>Belum ada data logbook aktif. Buka popup ekstensi untuk menempelkan JSON dari LogMagang.</em>";
      return;
    }
    activeData = data;
    const desc = data.deskripsiKegiatan || data.deskripsi_kegiatan || "-";
    const comp = data.kompetensiDikembangkan || data.kompetensi_dikembangkan || "-";

    preview.innerHTML = `
      <div><b>Tanggal:</b> ${data.tanggal || "Hari ini"}</div>
      <div><b>Peran:</b> ${data.peran || "Mahasiswa"}</div>
      <div style="margin-top: 4px;"><b>Deskripsi:</b> ${desc.slice(0, 90)}${desc.length > 90 ? "..." : ""}</div>
      <div style="margin-top: 4px;"><b>Kompetensi:</b> ${comp.slice(0, 70)}${comp.length > 70 ? "..." : ""}</div>
    `;
  }

  function loadStoredData() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["logmagang_active_logbook"], (res) => {
        if (res && res.logmagang_active_logbook) {
          updatePreviewUI(res.logmagang_active_logbook);
        } else {
          updatePreviewUI(null);
        }
      });
    }
  }

  // Toggle Panel
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

  // 4. Logika Cerdas Pencocokan & Pengisian Form Portal
  function triggerEvents(el, value) {
    // Tangani React internal value tracker jika ada
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

    // Efek highlight hijau sementara
    const originalBorder = el.style.borderColor;
    const originalShadow = el.style.boxShadow;
    el.style.borderColor = "#10b981";
    el.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.25)";
    setTimeout(() => {
      el.style.borderColor = originalBorder;
      el.style.boxShadow = originalShadow;
    }, 2500);
  }

  function autofillPortalForm(data) {
    if (!data) return { success: false, message: "Tidak ada data logbook." };

    const candidates = Array.from(
      document.querySelectorAll("input, textarea, select")
    ).filter((el) => {
      // Abaikan hidden atau tombol
      if (el.type === "hidden" || el.type === "submit" || el.type === "button")
        return false;
      // Abaikan jika berada di dalam host ekstensi kita
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

    candidates.forEach((el) => {
      // Ambil teks identifier elemen
      const id = (el.id || "").toLowerCase();
      const name = (el.name || "").toLowerCase();
      const placeholder = (el.placeholder || "").toLowerCase();
      const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();

      // Cari teks label terdekat
      let labelText = "";
      if (el.labels && el.labels[0]) {
        labelText = el.labels[0].textContent.toLowerCase();
      } else {
        const parent = el.closest("label, .form-group, .field, div");
        if (parent) {
          labelText = (parent.textContent || "").toLowerCase().slice(0, 100);
        }
      }

      const combinedMeta = `${id} ${name} ${placeholder} ${ariaLabel} ${labelText}`;

      // 1. Deskripsi Kegiatan
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

      // 2. Kompetensi
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

      // 3. Kendala
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

      // 4. Solusi
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

      // 5. Refleksi
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

      // 6. Jam Mulai
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

      // 7. Jam Selesai
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

      // 8. Tanggal
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

    // Fallback: Jika hanya ada 1 textarea di form dan belum terisi, isi dengan seluruh narasi 5 bagian!
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
        message: "Tidak ditemukan kolom input yang cocok dengan struktur logbook.",
      };
    }
  }

  btnExecute.addEventListener("click", () => {
    if (!activeData) {
      showPanelToast("Data logbook belum dimuat di ekstensi.", false);
      return;
    }

    const result = autofillPortalForm(activeData);
    if (result.success) {
      showPanelToast(`✅ Berhasil mengisi ${result.count} field form portal!`, true);
    } else {
      showPanelToast(`⚠️ ${result.message}`, false);
    }
  });

  // Listener Message dari Popup Ekstensi
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "AUTOFILL_LOGBOOK") {
        activeData = request.data;
        updatePreviewUI(activeData);
        const result = autofillPortalForm(activeData);
        sendResponse(result);
        return true;
      }
    });
  }

  // Muat data awal saat script terinjeksi
  loadStoredData();
})();
