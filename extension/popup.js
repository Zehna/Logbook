// popup.js - LogMagang Chrome Extension V3
document.addEventListener("DOMContentLoaded", () => {
  const previewBox = document.getElementById("preview-box");
  const dateLabel = document.getElementById("date-label");
  const jsonInput = document.getElementById("json-input");
  const btnSaveJson = document.getElementById("btn-save-json");
  const btnAutofillActive = document.getElementById("btn-autofill-active");
  const btnSampleData = document.getElementById("btn-sample-data");
  const fileUpload = document.getElementById("file-upload");
  const toast = document.getElementById("toast");
  const storageStatus = document.getElementById("storage-status");

  let currentLogbook = null;

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast ${isError ? "toast-error" : "toast-success"}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2800);
  }

  function renderPreview(data) {
    if (!data) {
      previewBox.innerHTML =
        "<em>Belum ada data logbook aktif. Tempelkan JSON dari web LogMagang.</em>";
      dateLabel.textContent = "-";
      storageStatus.textContent = "Kosong";
      storageStatus.style.background = "#f1f5f9";
      storageStatus.style.color = "#64748b";
      return;
    }

    currentLogbook = data;
    dateLabel.textContent = data.tanggal || new Date().toLocaleDateString("id-ID");
    storageStatus.textContent = "Aktif";
    storageStatus.style.background = "#dcfce7";
    storageStatus.style.color = "#166534";

    const desc = data.deskripsiKegiatan || data.deskripsi_kegiatan || "-";
    const comp = data.kompetensiDikembangkan || data.kompetensi_dikembangkan || "-";
    const peran = data.peran || "Mahasiswa Peserta";
    const program = data.tipeKegiatan || "Magang MBKM";

    previewBox.innerHTML = `
      <div class="preview-row"><span class="preview-label">Program:</span> ${program} (${peran})</div>
      <div class="preview-row"><span class="preview-label">Deskripsi:</span> ${desc.slice(0, 120)}${desc.length > 120 ? "..." : ""}</div>
      <div class="preview-row"><span class="preview-label">Kompetensi:</span> ${comp.slice(0, 80)}${comp.length > 80 ? "..." : ""}</div>
    `;
  }

  // Muat data dari chrome.storage.local
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["logmagang_active_logbook"], (res) => {
      if (res && res.logmagang_active_logbook) {
        renderPreview(res.logmagang_active_logbook);
      }
    });
  }

  // Simpan JSON dari Textarea
  btnSaveJson.addEventListener("click", () => {
    const raw = jsonInput.value.trim();
    if (!raw) {
      showToast("Harap tempelkan data JSON terlebih dahulu.", true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      // Dukung jika user menempelkan array (ambil item pertama) atau objek
      const targetData = Array.isArray(parsed) ? parsed[0] : parsed;

      if (!targetData) {
        throw new Error("Objek logbook tidak ditemukan di dalam data.");
      }

      currentLogbook = targetData;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ logmagang_active_logbook: targetData }, () => {
          renderPreview(targetData);
          showToast("Data logbook berhasil disimpan!");
          jsonInput.value = "";
        });
      } else {
        renderPreview(targetData);
        showToast("Data tersimpan di memori browser.");
      }
    } catch (err) {
      showToast("Format JSON tidak valid. Pastikan format teks benar.", true);
    }
  });

  // Contoh data
  btnSampleData.addEventListener("click", () => {
    const sample = {
      tanggal: new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      tipeKegiatan: "Magang MBKM",
      peran: "Staff Operasional & Analis Data",
      deskripsiKegiatan:
        "Menganalisis anomali selisih pencatatan mutasi transaksi gudang menggunakan Microsoft Excel dan menyusun alur standard operating procedure (SOP) pengecekan ganda.",
      kompetensiDikembangkan:
        "Kemampuan evaluasi audit data kuantitatif, ketelitian pencatatan inventaris, serta koordinasi lintas divisi operasional.",
      kendalaDihadapi:
        "Terdapat ketidaksesuaian format bukti transfer manual yang tidak mencantumkan kode referensi unik.",
      solusiTindakan:
        "Mengonfirmasikan rekonsiliasi manual langsung kepada supervisor dan menetapkan form digital berbasis Google Spreadsheet.",
      refleksiPembelajaran:
        "Memahami esensi kepatuhan verifikasi transaksi dua arah guna meminimalkan risiko selisih kas pada akhir siklus operasional.",
      jamMulai: "08:30",
      jamSelesai: "17:00",
    };

    jsonInput.value = JSON.stringify(sample, null, 2);
    showToast("Contoh data berhasil dimuat ke kotak input.");
  });

  // Upload file JSON / CSV
  fileUpload.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === "string") {
          jsonInput.value = content;
          btnSaveJson.click();
        }
      } catch (err) {
        showToast("Gagal membaca file.", true);
      }
    };
    reader.readAsText(file);
  });

  // Kirim & Isi ke Tab Portal Aktif
  btnAutofillActive.addEventListener("click", async () => {
    if (!currentLogbook) {
      showToast("Belum ada data logbook yang aktif untuk diisi.", true);
      return;
    }

    if (typeof chrome === "undefined" || !chrome.tabs) {
      showToast("Fitur ini membutuhkan lingkungan ekstensi Chrome.", true);
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        showToast("Tab aktif tidak ditemukan.", true);
        return;
      }

      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "AUTOFILL_LOGBOOK", data: currentLogbook },
        (response) => {
          if (chrome.runtime.lastError) {
            // Jika content script belum terinjeksi otomatis, lakukan eksekusi script manual
            chrome.scripting.executeScript(
              {
                target: { tabId: activeTab.id },
                files: ["content.js"],
              },
              () => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(
                    activeTab.id,
                    { action: "AUTOFILL_LOGBOOK", data: currentLogbook },
                    (res2) => {
                      if (res2 && res2.success) {
                        showToast(`Berhasil mengisi ${res2.count} field di portal!`);
                      } else {
                        showToast(
                          res2?.message || "Field form portal tidak terdeteksi.",
                          true
                        );
                      }
                    }
                  );
                }, 300);
              }
            );
          } else if (response && response.success) {
            showToast(`Berhasil mengisi ${response.count} field di portal!`);
          } else {
            showToast(
              response?.message || "Field form portal tidak terdeteksi.",
              true
            );
          }
        }
      );
    });
  });
});
