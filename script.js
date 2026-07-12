// ==========================================
// FILE JAVASCRIPT UTAMA (script.js)
// ==========================================

let selectedTime = null;

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu(); // Inisialisasi Hamburger Menu di mobile size

  if (document.getElementById("booking-form")) {
    initDashboard();
    initClock(); // Jalankan jam real-time jika berada di halaman beranda
  }
  if (
    document.getElementById("dynamic-history-table") ||
    document.getElementById("completed-history-table")
  ) {
    initHistory();
  }
});

// LOGIKA HAMBURGER MENU UNTUK UKURAN MOBILE
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const dropdown = document.getElementById("mobile-dropdown");

  if (menuBtn && dropdown) {
    menuBtn.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
      
      // Mengubah icon menu menjadi close jika sedang aktif (optional enhancement)
      const icon = menuBtn.querySelector(".material-symbols-outlined");
      if (icon) {
        if (dropdown.classList.contains("hidden")) {
          icon.textContent = "menu";
        } else {
          icon.textContent = "close";
        }
      }
    });
  }
}

// LOGIKA JAM DIGITAL BERJALAN (REAL-TIME CLOCK)
function initClock() {
  const timeElement = document.getElementById("current-time");
  if (!timeElement) return;

  setInterval(() => {
    const now = new Date();
    let jam = now.getHours().toString().padStart(2, "0");
    let menit = now.getMinutes().toString().padStart(2, "0");
    let detik = now.getSeconds().toString().padStart(2, "0");

    timeElement.textContent = `${jam} : ${menit} : ${detik} WIB`;
  }, 1000);
}

// ==========================================
// LOGIKA UNTUK HALAMAN DASHBOARD
// ==========================================
function initDashboard() {
  const form = document.getElementById("booking-form");
  const buttons = document.querySelectorAll("[data-time]");
  const selectedTimeText = document.getElementById("selected-time");
  const confirmBtn = document.getElementById("confirm-booking");
  const cancelBtn = document.getElementById("cancel-booking");
  const slotCountText = document.getElementById("slot-count");
  const currentDateText = document.getElementById("current-date");
  const selectedDateText = document.getElementById("selected-date");
  const namaInput = document.getElementById("nama");
  const teleponInput = document.getElementById("telepon");

  // Elemen-elemen Modal Sukses
  const successModal = document.getElementById("success-modal");
  const modalTrackingId = document.getElementById("modal-tracking-id");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  // Ambil data slot dan riwayat dari localStorage
  let bookedSlots =
    JSON.parse(localStorage.getItem("runtimeBookedSlots")) || [];
  let bookingHistory =
    JSON.parse(localStorage.getItem("runtimeActiveBookings")) || [];

  // Mengubah efek visual slot waktu yang sudah dibooking menjadi "Penuh" dan disabled
  buttons.forEach((btn) => {
    const btnTime = btn.getAttribute("data-time");
    const statusTextElement = btn.querySelector(".slot-status");

    if (bookedSlots.includes(btnTime)) {
      btn.className =
        "group relative overflow-hidden bg-neutral-200/70 p-6 rounded-xl text-left cursor-not-allowed border border-neutral-300 opacity-60 pointer-events-none";
      btn.disabled = true;
      if (statusTextElement) {
        statusTextElement.textContent = "Penuh";
        statusTextElement.className =
          "slot-status text-xs mt-1 font-bold text-red-600";
      }
    } else {
      btn.className =
        "group relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-primary-container active:scale-95 shadow-sm border border-outline-variant/10";
      btn.disabled = false;
      if (statusTextElement) {
        statusTextElement.textContent = "Tersedia";
        statusTextElement.className =
          "slot-status text-xs mt-1 font-medium text-emerald-600";
      }
    }
  });

  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const today = new Date();
  const formattedFullDate = `${hari[today.getDay()]}, ${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
  const formattedShortDate = `${today.getDate()} ${bulan[today.getMonth()].substring(0, 3)} ${today.getFullYear()}`;

  if (currentDateText) currentDateText.textContent = formattedFullDate;
  if (selectedDateText) selectedDateText.textContent = formattedShortDate;

  function updateSlotCount() {
    if (slotCountText) {
      const available = Array.from(buttons).filter(
        (btn) => !btn.disabled,
      ).length;
      slotCountText.textContent = available + " Slot Tersedia";
    }
  }
  updateSlotCount();

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selectedTime = btn.getAttribute("data-time");
      if (selectedTimeText) selectedTimeText.textContent = selectedTime;

      // Bersihkan style aktif dari tombol lain yang tidak ter-disabled
      buttons.forEach((b) => {
        if (!b.disabled) {
          b.classList.remove("bg-primary-container", "ring-2", "ring-primary");
        }
      });
      btn.classList.add("bg-primary-container", "ring-2", "ring-primary");
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedTime) {
        alert("Pilih waktu dulu!");
        return;
      }

      if (!namaInput.value.trim() || !teleponInput.value.trim()) {
        alert("Lengkapi data dulu!");
        return;
      }

      const teleponValue = teleponInput.value.trim();

      // Validasi format nomor seluler Indonesia:
      // - Wajib diawali "08" (format lokal umum untuk nomor HP)
      // - Digit ketiga tidak boleh 0 (mencegah pola tidak wajar seperti "0800000000")
      // - Total panjang 10-13 digit, sesuai rentang nomor operator di Indonesia
      const teleponRegex = /^08[1-9][0-9]{7,10}$/;

      if (!/^[0-9]+$/.test(teleponValue)) {
        alert("Nomor telepon harus berupa angka");
        return;
      }

      if (teleponValue.length < 10 || teleponValue.length > 13) {
        alert("Nomor telepon harus berukuran antara 10 sampai 13 digit angka!");
        return;
      }

      if (!teleponRegex.test(teleponValue)) {
        alert(
          "Nomor telepon tidak valid. Gunakan format nomor HP Indonesia yang diawali 08, contoh: 081234567890",
        );
        return;
      }

      // Durasi hitung mundur diubah menjadi 5 menit agar lebih realistis di localStorage
      const durationMs = 5 * 60 * 1000;
      const endTime = Date.now() + durationMs;

      if (!bookedSlots.includes(selectedTime)) {
        bookedSlots.push(selectedTime);
        localStorage.setItem("runtimeBookedSlots", JSON.stringify(bookedSlots));
      }

      const trackingId = "A-" + Math.floor(100 + Math.random() * 900);
      const dataBaru = {
        id: trackingId,
        nama: namaInput.value.trim(),
        telepon: teleponValue,
        tanggal: formattedShortDate,
        waktu: selectedTime,
        endTime: endTime,
        status: "Antrian Berhasil",
      };

      bookingHistory.unshift(dataBaru);
      localStorage.setItem(
        "runtimeActiveBookings",
        JSON.stringify(bookingHistory),
      );

      // Menampilkan ID Tracking di Modal Pop-up sebelum redireksi halaman
      if (successModal && modalTrackingId) {
        modalTrackingId.textContent = "#" + trackingId;
        successModal.classList.remove("hidden");
      } else {
        alert("Booking Berhasil dilakukan! ID Tracking Anda: #" + trackingId);
        window.location.href = "history.html";
      }
    });
  }

  // Aksi ketika tombol di dalam modal diklik baru pindah halaman
  // (didaftarkan sekali di sini, bukan di dalam handler confirmBtn,
  // supaya listener tidak menumpuk setiap kali booking dilakukan)
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      window.location.href = "history.html";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      selectedTime = null;
      if (selectedTimeText) selectedTimeText.textContent = "-";
      form.reset();
      buttons.forEach((b) => {
        if (!b.disabled) {
          b.classList.remove("bg-primary-container", "ring-2", "ring-primary");
        }
      });
    });
  }
}

// ==========================================
// LOGIKA UNTUK HALAMAN HISTORY
// ==========================================
function initHistory() {
  const activeTableBody = document.getElementById("dynamic-history-table");
  const completedTableBody = document.getElementById("completed-history-table");
  const statActive = document.getElementById("stat-active-count");
  const statCompleted = document.getElementById("stat-completed-count");
  const statTotal = document.getElementById("stat-total-count");

  function renderTables() {
    const allBookings =
      JSON.parse(localStorage.getItem("runtimeActiveBookings")) || [];
    const now = Date.now();

    const activeList = allBookings.filter((item) => now < item.endTime);
    const completedList = allBookings.filter((item) => now >= item.endTime);

    // +1 pada jumlah selesai karena selalu ada 1 baris data contoh (dummy "Anto")
    // yang tampil statis di tabel kegiatan selesai.
    if (statActive) statActive.textContent = activeList.length;
    if (statCompleted) statCompleted.textContent = completedList.length + 1;
    if (statTotal) statTotal.textContent = activeList.length + completedList.length + 1;

    // 1. RENDER TABEL TERBARU (AKTIF)
    if (activeList.length === 0) {
      activeTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="p-8 text-center text-neutral-400 bg-white/50 italic">
            Belum ada data antrian terbaru saat ini.
          </td>
        </tr>
      `;
    } else {
      let activeHtml = "";
      activeList.forEach((item) => {
        const timeLeft = Math.max(0, Math.ceil((item.endTime - now) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdownText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        activeHtml += `
          <tr class="hover:bg-yellow-50/20 transition bg-white/80 text-center">
            <td class="p-4 font-bold text-yellow-700">#${item.id}</td>
            <td class="p-4 font-semibold text-on-surface">${item.nama}</td>
            <td class="p-4 text-neutral-600 font-mono">${item.telepon}</td>
            <td class="p-4">
              <div class="font-medium text-on-surface">${item.tanggal}</div>
              <div class="text-xs text-neutral-400">${item.waktu} WIB</div>
            </td>
            <td class="p-4 flex flex-col items-center justify-center gap-1">
              <span class="bg-yellow-100 text-yellow-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider w-max">Menunggu SDB</span>
              <span class="text-xs text-red-500 font-mono font-bold animate-pulse">⏱️ Selesai dalam ${countdownText}</span>
            </td>
          </tr>
        `;
      });
      activeTableBody.innerHTML = activeHtml;
    }

    // 2. RENDER TABEL SELESAI (DENGAN DUMMY DATA ANTO)
    let completedHtml = "";

    // Baris Dummy Statis "Anto"
    completedHtml += `
      <tr class="hover:bg-neutral-50/50 transition opacity-75 bg-white/60 text-center">
        <td class="p-4 font-bold text-neutral-400">#A-882</td>
        <td class="p-4 font-semibold text-neutral-500">Anto (Contoh Dummy)</td>
        <td class="p-4 text-neutral-400 font-mono">081299887766</td>
        <td class="p-4 text-neutral-400">
          <div class="font-medium">09 Juni 2026</div>
          <div>10:00 WIB</div>
        </td>
        <td class="p-4 flex justify-center items-center">
          <span class="bg-green-100 text-green-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">Selesai SDB</span>
        </td>
      </tr>
    `;

    completedList.forEach((item) => {
      completedHtml += `
        <tr class="hover:bg-neutral-50/50 transition opacity-75 bg-white/60 text-center">
          <td class="p-4 font-bold text-neutral-400">#${item.id}</td>
          <td class="p-4 font-semibold text-neutral-500">${item.nama}</td>
          <td class="p-4 text-neutral-400 font-mono">${item.telepon}</td>
          <td class="p-4 text-neutral-400">
            <div class="font-medium">${item.tanggal}</div>
            <div>${item.waktu} WIB</div>
          </td>
          <td class="p-4 flex justify-center items-center">
            <span class="bg-green-100 text-green-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">Selesai SDB</span>
          </td>
        </tr>
      `;
    });

    completedTableBody.innerHTML = completedHtml;
  }

  renderTables();
  setInterval(renderTables, 1000);
}
