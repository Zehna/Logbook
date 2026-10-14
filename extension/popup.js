// popup.js - LogMagang Chrome Extension V3 (Enterprise Edition)
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
  const portalPreset = document.getElementById("portal-preset");

  // Queue Elements
  const queueBox = document.getElementById("queue-box");
  const queueInfo = document.getElementById("queue-info");
  const btnQueuePrev = document.getElementById("btn-queue-prev");
  const btnQueueNext = document.getElementById("btn-queue-next");

  // Word Counter Element
  const wordCounterBadge = document.getElementById("word-counter-badge");
  const wordCountText = document.getElementById("word-count-text");

  let logbookList = [];
  let currentQueueIndex = 0;

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast ${isError ? "toast-error" : "toast-success"}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2800);
  }

  function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function renderCurrentItem() {
    if (!logbookList || logbookList.length === 0) {
      previewBox.innerHTML =
        "<em>Belum ada data logbook aktif. Tempelkan JSON dari web LogMagang.</em>";
      dateLabel.textContent = "-";
      storageStatus.textContent = "Kosong";
      storageStatus.style.background = "#f1f5f9";
      storageStatus.style.color = "#64748b";
      queueBox.style.display = "none";
      wordCounterBadge.style.display = "none";
      return;
    }

    const data = logbookList[currentQueueIndex] || logbookList[0];
    dateLabel.textContent = data.tanggal || data.hari || new Date().toLocaleDateString("id-ID");
    storageStatus.textContent = "Aktif";
    storageStatus.style.background = "#dcfce7";
    storageStatus.style.color = "#166534";

    // Queue Navigation UI
    if (logbookList.length > 1) {
      queueBox.style.display = "flex";
      queueInfo.textContent = `Antrean ${currentQueueIndex + 1} dari ${logbookList.length} (${data.hari || "Hari " + (currentQueueIndex + 1)})`;
      btnQueuePrev.disabled = currentQueueIndex === 0;
      btnQueueNext.disabled = currentQueueIndex === logbookList.length - 1;
    } else {
      queueBox.style.display = "none";
    }

    const desc = data.deskripsiKegiatan || data.deskripsi_kegiatan || "";
    const comp = data.kompetensiDikembangkan || data.kompetensi_dikembangkan || "-";
    const peran = data.peran || "Mahasiswa Peserta";
    const program = data.tipeKegiatan || "Magang MBKM";
    const fase = data.tahap_fase || data.tahapFase || "";

    previewBox.innerHTML = `
      <div class="preview-row"><span class="preview-label">Program:</span> ${program} (${peran})</div>
      ${fase ? `<div class="preview-row"><span class="preview-label">Tahap:</span> ${fase}</div>` : ""}
      <div class="preview-row"><span class="preview-label">Deskripsi:</span> ${desc.slice(0, 110)}${desc.length > 110 ? "..." : ""}</div>
      <div class="preview-row"><span class="preview-label">Kompetensi:</span> ${comp.slice(0, 70)}${comp.length > 70 ? "..." : ""}</div>
    `;

    // Word counter calculation
    const words = countWords(desc);
    const minWords = 20;
    const isSufficient = words >= minWords;

    wordCounterBadge.style.display = "inline-flex";
    if (isSufficient) {
      wordCounterBadge.className = "word-counter-badge word-valid";
      wordCountText.textContent = `${words} kata (Lolos syarat portal >= ${minWords} kata)`;
    } else {
      wordCounterBadge.className = "word-counter-badge word-invalid";
      wordCountText.textContent = `${words} kata (Kurang dari syarat minimal ${minWords} kata)`;
    }

    btnAutofillActive.innerHTML = `⚡ Kirim & Isi [${data.hari || "Hari " + (currentQueueIndex + 1)}] ke Portal`;
  }

  // Muat data dari chrome.storage.local
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(
      ["logmagang_active_logbook", "logmagang_portal_preset", "logmagang_queue_index"],
      (res) => {
        if (res) {
          if (res.logmagang_portal_preset && portalPreset) {
            portalPreset.value = res.logmagang_portal_preset;
          }
          if (res.logmagang_active_logbook) {
            const raw = res.logmagang_active_logbook;
            logbookList = Array.isArray(raw) ? raw : [raw];
            currentQueueIndex = res.logmagang_queue_index || 0;
            if (currentQueueIndex >= logbookList.length) currentQueueIndex = 0;
            renderCurrentItem();
          }
        }
      }
    );
  }

  // Simpan pilihan preset portal saat berubah
  portalPreset.addEventListener("change", () => {
    const val = portalPreset.value;
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ logmagang_portal_preset: val });
    }
    showToast(`Target portal diubah: ${portalPreset.options[portalPreset.selectedIndex].text}`);
  });

  // Navigasi Batch Queue
  btnQueuePrev.addEventListener("click", () => {
    if (currentQueueIndex > 0) {
      currentQueueIndex--;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ logmagang_queue_index: currentQueueIndex });
      }
      renderCurrentItem();
    }
  });

  btnQueueNext.addEventListener("click", () => {
    if (currentQueueIndex < logbookList.length - 1) {
      currentQueueIndex++;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ logmagang_queue_index: currentQueueIndex });
      }
      renderCurrentItem();
    }
  });

  // Simpan JSON dari Textarea
  btnSaveJson.addEventListener("click", () => {
    const raw = jsonInput.value.trim();
    if (!raw) {
      showToast("Harap tempelkan data JSON terlebih dahulu.", true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        logbookList = parsed;
      } else if (parsed && typeof parsed === "object") {
        logbookList = [parsed];
      } else {
        throw new Error("Format JSON tidak valid");
      }

      currentQueueIndex = 0;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(
          {
            logmagang_active_logbook: logbookList,
            logmagang_queue_index: 0,
          },
          () => {
            renderCurrentItem();
            showToast(`Berhasil menyimpan ${logbookList.length} data entri logbook!`);
            jsonInput.value = "";
          }
        );
      } else {
        renderCurrentItem();
        showToast("Data tersimpan di memori browser.");
      }
    } catch (err) {
      showToast("Format JSON tidak valid. Pastikan format teks benar.", true);
    }
  });

  // Contoh data 1 Pekan (Batch 5 Hari)
  btnSampleData.addEventListener("click", () => {
    const sampleBatch = [
      {
        tanggal: "Senin, 12 Oktober 2026",
        hari: "Senin",
        tahap_fase: "Tahap Analisis & Perencanaan",
        tipeKegiatan: "Magang MBKM",
        peran: "Software Engineer Intern",
        deskripsiKegiatan:
          "Mengikuti briefing awal pekan bersama Tech Lead, mengidentifikasi arsitektur modul ekspor multi-format, serta memetakan dependensi pustaka docx dan pptxgenjs guna memastikan performa aplikasi optimal.",
        kompetensiDikembangkan:
          "Analisis arsitektur perangkat lunak, pemahaman interoperabilitas dependensi, dan koordinasi tim teknis.",
        kendalaDihadapi: "Terdapat konflik tipe TypeScript pada manipulasi data biner blob di sisi client browser.",
        solusiTindakan: "Menggunakan dynamic import dan Buffer Uint8Array adapter untuk menjamin kompatibilitas runtime Next.js.",
        refleksiPembelajaran: "Perencanaan modular di awal sprint sangat krusial dalam menekan potensi bottleneck performa.",
      },
      {
        tanggal: "Selasa, 13 Oktober 2026",
        hari: "Selasa",
        tahap_fase: "Tahap Persiapan & Desain",
        tipeKegiatan: "Magang MBKM",
        peran: "Software Engineer Intern",
        deskripsiKegiatan:
          "Menyusun draf layout dokumen Word berformat akademik Times New Roman 12pt spasi 1.5, merancang tabel logbook formal, dan mengatur margin cetak 4-4-3-3 cm.",
        kompetensiDikembangkan: "Kemampuan desain dokumen akademik terstandarisasi dan konfigurasi stylesheet DOCX.",
        kendalaDihadapi: "Penetapan margin twips di docx memerlukan kalkulasi rasio presisi terhadap ukuran sentimeter.",
        solusiTindakan: "Menerapkan fungsi konverter sentimeter ke twips (1 cm = 567 twips) pada konfigurasi Document.",
        refleksiPembelajaran: "Kerapian tata letak dokumen mencerminkan profesionalitas hasil kerja di mata institusi penguji.",
      },
      {
        tanggal: "Rabu, 14 Oktober 2026",
        hari: "Rabu",
        tahap_fase: "Tahap Eksekusi Teknis",
        tipeKegiatan: "Magang MBKM",
        peran: "Software Engineer Intern",
        deskripsiKegiatan:
          "Mengimplementasikan 7 slide presentasi PowerPoint interaktif menggunakan PptxGenJS, menyematkan kartu analitik kendala dan solusi, serta merancang skema palet warna profesional.",
        kompetensiDikembangkan: "Data visualization, presentational design, dan otomatisasi pembuatan slide presentasi.",
        kendalaDihadapi: "Rasio kontras teks pada kartu kendala sempat kurang optimal pada proyeksi layar redup.",
        solusiTindakan: "Mempertegas kontras latar amber dan emerald dengan garis batas kontras tinggi.",
        refleksiPembelajaran: "Visualisasi yang komunikatif membantu audiens menyerap poin esensial laporan secara instan.",
      },
      {
        tanggal: "Kamis, 15 Oktober 2026",
        hari: "Kamis",
        tahap_fase: "Tahap Pengujian & Troubleshooting",
        tipeKegiatan: "Magang MBKM",
        peran: "Software Engineer Intern",
        deskripsiKegiatan:
          "Melakukan pengujian integrasi autofill ekstensi Chrome pada berbagai portal kampus universitas, memverifikasi pencocokan field form input, dan menyempurnakan Shadow DOM.",
        kompetensiDikembangkan: "Browser extension debugging, DOM traversal, isolasi CSS Shadow DOM, dan end-to-end testing.",
        kendalaDihadapi: "Beberapa portal kampus menggunakan framework single page application (SPA) yang lambat me-render DOM.",
        solusiTindakan: "Menambahkan delay event dispatching dan fallback deteksi textarea komprehensif.",
        refleksiPembelajaran: "Ketahanan integrasi pihak ketiga membutuhkan penanganan variasi skenario DOM yang tangguh.",
      },
      {
        tanggal: "Jumat, 16 Oktober 2026",
        hari: "Jumat",
        tahap_fase: "Tahap Evaluasi & Pelaporan",
        tipeKegiatan: "Magang MBKM",
        peran: "Software Engineer Intern",
        deskripsiKegiatan:
          "Mempresentasikan hasil ekspor rekap logbook pekanan kepada mentor industri, mencatat feedback perbaikan, dan merangkum pencapaian kompetensi mingguan ke portal.",
        kompetensiDikembangkan: "Public speaking, stakeholder reporting, evaluasi diri, dan penyusunan executive summary.",
        kendalaDihadapi: "Keterbatasan waktu sesi review menuntut presentasi ringkas namun padat substansi.",
        solusiTindakan: "Fokus memaparkan metrik kendala, solusi konkret, dan refleksi pembelajaran utama.",
        refleksiPembelajaran: "Komunikasi terbuka dan umpan balik berkala mempercepat akselerasi kualitas pembelajaran.",
      },
    ];

    jsonInput.value = JSON.stringify(sampleBatch, null, 2);
    showToast("Contoh 5 hari kerja (Batch 1 Pekan) berhasil dimuat.");
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
    if (!logbookList || logbookList.length === 0) {
      showToast("Belum ada data logbook yang aktif untuk diisi.", true);
      return;
    }

    const currentItem = logbookList[currentQueueIndex] || logbookList[0];
    const selectedPreset = portalPreset.value || "kemdikbud";

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
        {
          action: "AUTOFILL_LOGBOOK",
          data: currentItem,
          preset: selectedPreset,
          queueIndex: currentQueueIndex,
          totalQueue: logbookList.length,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            chrome.scripting.executeScript(
              {
                target: { tabId: activeTab.id },
                files: ["content.js"],
              },
              () => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(
                    activeTab.id,
                    {
                      action: "AUTOFILL_LOGBOOK",
                      data: currentItem,
                      preset: selectedPreset,
                      queueIndex: currentQueueIndex,
                      totalQueue: logbookList.length,
                    },
                    (res2) => {
                      if (res2 && res2.success) {
                        showToast(`Berhasil mengisi ${res2.count} field (${selectedPreset})!`);
                        // Auto-advance ke hari berikutnya jika ada antrean tersisa
                        if (currentQueueIndex < logbookList.length - 1) {
                          currentQueueIndex++;
                          chrome.storage.local.set({ logmagang_queue_index: currentQueueIndex });
                          renderCurrentItem();
                        }
                      } else {
                        showToast(res2?.message || "Field form portal tidak terdeteksi.", true);
                      }
                    }
                  );
                }, 300);
              }
            );
          } else if (response && response.success) {
            showToast(`Berhasil mengisi ${response.count} field (${selectedPreset})!`);
            // Auto-advance ke hari berikutnya jika ada antrean tersisa
            if (currentQueueIndex < logbookList.length - 1) {
              currentQueueIndex++;
              chrome.storage.local.set({ logmagang_queue_index: currentQueueIndex });
              renderCurrentItem();
            }
          } else {
            showToast(response?.message || "Field form portal tidak terdeteksi.", true);
          }
        }
      );
    });
  });
});
