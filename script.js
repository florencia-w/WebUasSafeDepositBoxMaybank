// ==========================================
// FILE JAVASCRIPT UTAMA (script.js) - VERSI FINAL DIPERBAIKI
// ==========================================

let selectedTime = null;

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  if (document.getElementById("booking-form")) {
    initDashboard();
    initClock();
  }
  if (document.getElementById("dynamic-history-table") || document.getElementById("completed-history-table")) {
    initHistory();
  }
});

// ==========================================
// HAMBURGER MENU
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const dropdown = document.getElementById("mobile-dropdown");
  if (menuBtn && dropdown) {
    menuBtn.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
      const icon = menuBtn.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = dropdown.classList.contains("hidden") ? "menu" : "close";
    });
  }
}

// ==========================================
// JAM DIGITAL
// ==========================================
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
// DASHBOARD & BOOKING
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
  const successModal = document.getElementById("success-modal");
  const modalTrackingId = document.getElementById("modal-tracking-id");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const typeRadios = document.querySelectorAll('input[name="booking-type"]');
  const preDateSection = document.getElementById("pre-date-section");
  const samedayNoteSection = document.getElementById("sameday-note-section");
  const preDateInput = document.getElementById("pre-date");

  let bookedSlots = JSON.parse(localStorage.getItem("runtimeBookedSlots")) || [];
  let bookingHistory = JSON.parse(localStorage.getItem("runtimeActiveBookings")) || [];

  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const bulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Desember"];
  const today = new Date();
  const formattedFullDate = `${hari[today.getDay()]}, ${today.getDate()} ${bulan[today.getMonth()]} ${today.getFullYear()}`;
  const formattedShortDate = `${today.getDate()} ${bulanSingkat[today.getMonth()]} ${today.getFullYear()}`;

  if (currentDateText) currentDateText.textContent = formattedFullDate;
  if (selectedDateText) selectedDateText.textContent = formattedShortDate;

  if (preDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    preDateInput.min = tomorrow.toISOString().split('T')[0];
  }

  // Update tanggal yang ditampilkan saat pilih tanggal pre-booking
  if (preDateInput && selectedDateText) {
    preDateInput.addEventListener('change', () => {
      const val = preDateInput.value;
      if (!val) return;
      const [thn, bln, tgl] = val.split('-');
      selectedDateText.textContent = `${parseInt(tgl)} ${bulanSingkat[parseInt(bln)-1]} ${thn}`;
    });
  }

  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      preDateSection.classList.add('hidden');
      samedayNoteSection.classList.add('hidden');
      if (radio.value === 'pre') preDateSection.classList.remove('hidden');
      else if (radio.value === 'sameday') samedayNoteSection.classList.remove('hidden');
      else if (selectedDateText) selectedDateText.textContent = formattedShortDate;
    });
  });

  // Update tampilan slot waktu
  function refreshSlots() {
    buttons.forEach((btn) => {
      const btnTime = btn.getAttribute("data-time");
      const statusTextElement = btn.querySelector(".slot-status");
      if (bookedSlots.includes(btnTime)) {
        btn.className = "group relative overflow-hidden bg-neutral-200/70 p-6 rounded-xl text-left cursor-not-allowed border border-neutral-300 opacity-60 pointer-events-none";
        btn.disabled = true;
        if (statusTextElement) {
          statusTextElement.textContent = "Penuh";
          statusTextElement.className = "slot-status text-xs mt-1 font-bold text-red-600";
        }
      } else {
        btn.className = "group relative overflow-hidden bg-surface-container-lowest p-6 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-primary-container active:scale-95 shadow-sm border border-outline-variant/10";
        btn.disabled = false;
        if (statusTextElement) {
          statusTextElement.textContent = "Tersedia";
          statusTextElement.className = "slot-status text-xs mt-1 font-medium text-emerald-600";
        }
      }
    });
  }
  refreshSlots();

  function updateSlotCount() {
    if (slotCountText) {
      const available = Array.from(buttons).filter(b => !b.disabled).length;
      slotCountText.textContent = available + " Slot Tersedia";
    }
  }
  updateSlotCount();

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selectedTime = btn.getAttribute("data-time");
      if (selectedTimeText) selectedTimeText.textContent = selectedTime;
      buttons.forEach(b => !b.disabled && b.classList.remove("bg-primary-container", "ring-2", "ring-primary"));
      btn.classList.add("bg-primary-container", "ring-2", "ring-primary");
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedTime) { alert("Pilih waktu dulu!"); return; }
      if (!namaInput.value.trim() || !teleponInput.value.trim()) { alert("Lengkapi data dulu!"); return; }

      const teleponValue = teleponInput.value.trim();
      if (!/^[0-9]+$/.test(teleponValue)) { alert("Nomor telepon harus berupa angka"); return; }
      if (teleponValue.length < 10 || teleponValue.length > 13) { alert("Nomor telepon 10-13 digit!"); return; }
      if (!/^08[1-9][0-9]{7,10}$/.test(teleponValue)) { alert("Format salah, gunakan 08xxx..."); return; }

      const selectedType = document.querySelector('input[name="booking-type"]:checked')?.value || 'normal';
      let tanggalTampilan = formattedShortDate;
      let endTime;

      if (selectedType === 'pre') {
        const tglTarget = preDateInput?.value;
        if (!tglTarget) { alert('Pilih tanggal dulu!'); return; }
        const [thn, bln, tgl] = tglTarget.split('-');
        tanggalTampilan = `${parseInt(tgl)} ${bulanSingkat[parseInt(bln)-1]} ${thn}`;
        // Pre-booking: endTime = tanggal yang dipilih + 30 menit
        const targetDate = new Date(tglTarget + 'T' + selectedTime);
        endTime = targetDate.getTime() + 30 * 60 * 1000;
      } else if (selectedType === 'sameday') {
        const jamPilih = parseInt(selectedTime.split(':')[0]);
        if (jamPilih - new Date().getHours() < 2) { alert('Minimal 2 jam dari sekarang!'); return; }
        endTime = Date.now() + 30 * 60 * 1000;
      } else {
        endTime = Date.now() + 5 * 60 * 1000;
      }

      // TAMBAH SLOT HANYA SEKALI
      if (!bookedSlots.includes(selectedTime)) {
        bookedSlots.push(selectedTime);
        localStorage.setItem("runtimeBookedSlots", JSON.stringify(bookedSlots));
      }

      const trackingId = "A-" + Math.floor(100 + Math.random() * 900);
      const statusText = selectedType === 'pre' ? 'Pre-Booking Terdaftar' :
                         selectedType === 'sameday' ? 'Appointment Khusus' : 'Antrian Berhasil';

      const dataBaru = {
        id: trackingId,
        nama: namaInput.value.trim(),
        telepon: teleponValue,
        tanggal: tanggalTampilan,
        waktu: selectedTime,
        endTime: endTime,
        status: statusText
      };

      bookingHistory.unshift(dataBaru);
      localStorage.setItem("runtimeActiveBookings", JSON.stringify(bookingHistory));

      if (successModal && modalTrackingId) {
        modalTrackingId.textContent = "#" + trackingId;
        successModal.classList.remove("hidden");
      } else {
        alert("Berhasil! ID: #" + trackingId);
        window.location.href = "history.html";
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => window.location.href = "history.html");
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      selectedTime = null;
      if (selectedTimeText) selectedTimeText.textContent = "-";
      if (selectedDateText) selectedDateText.textContent = formattedShortDate;
      form.reset();
      buttons.forEach(b => !b.disabled && b.classList.remove("bg-primary-container", "ring-2", "ring-primary"));
      preDateSection.classList.add('hidden');
      samedayNoteSection.classList.add('hidden');
      document.querySelector('input[name="booking-type"][value="normal"]').checked = true;
    });
  }
}

// ==========================================
// DATA PENYIMPANAN TAMBAHAN
// ==========================================
let preBookingData = JSON.parse(localStorage.getItem('preBookingList')) || [];
let canceledData = JSON.parse(localStorage.getItem('canceledList')) || [];
let rescheduleData = JSON.parse(localStorage.getItem('rescheduleList')) || [];

function saveAllData() {
  localStorage.setItem('preBookingList', JSON.stringify(preBookingData));
  localStorage.setItem('canceledList', JSON.stringify(canceledData));
  localStorage.setItem('rescheduleList', JSON.stringify(rescheduleData));
}

// ==========================================
// HALAMAN HISTORY
// ==========================================
function initHistory() {
  const activeTableBody = document.getElementById("dynamic-history-table");
  const completedTableBody = document.getElementById("completed-history-table");
  const statActive = document.getElementById("stat-active-count");
  const statCompleted = document.getElementById("stat-completed-count");
  const statTotal = document.getElementById("stat-total-count");

  function renderTables() {
    const allBookings = JSON.parse(localStorage.getItem("runtimeActiveBookings")) || [];
    const now = Date.now();

    const activeList = allBookings.filter(item => now < item.endTime);
    const completedList = allBookings.filter(item => now >= item.endTime);

    if (statActive) statActive.textContent = activeList.length;
    if (statCompleted) statCompleted.textContent = completedList.length + 1;
    if (statTotal) statTotal.textContent = activeList.length + completedList.length + 1;

    // TABEL AKTIF
    if (activeList.length === 0) {
      activeTableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-neutral-400 bg-white/50 italic">Belum ada data antrian terbaru saat ini.</td></tr>`;
    } else {
      let activeHtml = "";
      activeList.forEach(item => {
        const sisa = Math.max(0, Math.ceil((item.endTime - now) / 1000));
        const m = Math.floor(sisa / 60);
        const d = sisa % 60;
        const countdownText = `${m}:${d<10?'0':''}${d}`;

        activeHtml += `
          <tr class="hover:bg-yellow-50/20 transition bg-white/80 text-center">
            <td class="p-4 font-bold text-yellow-700">#${item.id}</td>
            <td class="p-4 font-semibold text-on-surface">${item.nama}</td>
            <td class="p-4 text-neutral-600 font-mono">${item.telepon}</td>
            <td class="p-4">
              <div class="font-medium text-on-surface">${item.tanggal}</div>
              <div class="text-xs text-neutral-400">${item.waktu} WIB</div>
            </td>
            <td class="p-4 flex flex-col items-center justify-center gap-2">
              <span class="bg-yellow-100 text-yellow-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider w-max">${item.status}</span>
              <span class="text-xs text-red-500 font-mono font-bold animate-pulse">⏱️ Selesai dalam ${countdownText}</span>
              <div class="flex gap-1 mt-1">
                <button class="cancel-btn text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${item.id}">Batalkan</button>
                <button class="reschedule-btn text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" data-id="${item.id}">Ubah Jadwal</button>
                <button class="rebook-btn text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" data-id="${item.id}">Re-Book</button>
              </div>
            </td>
          </tr>`;
      });
      activeTableBody.innerHTML = activeHtml;
    }

    // TABEL SELESAI + DATA CONTOH
    let completedHtml = `
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
      </tr>`;

    completedList.forEach(item => {
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
        </tr>`;
    });

    completedTableBody.innerHTML = completedHtml;
  }

  renderTables();
  setInterval(renderTables, 1000);
}

// ==========================================
// MODAL & FUNGSI AKSI (Cancel, Reschedule, Re-Book)
// ==========================================
let currentActionBookingId = null;
let modalCallback = null;

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('action-modal');
  const modalTitle = document.getElementById('modal-action-title');
  const modalContent = document.getElementById('modal-action-content');
  const modalClose = document.getElementById('modal-action-close');
  const modalConfirm = document.getElementById('modal-action-confirm');

  if (!modal) return;

  modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalCallback = null;
  });

  modalConfirm.addEventListener('click', () => {
    if (modalCallback) modalCallback();
    modal.classList.add('hidden');
  });

  window.openActionModal = function(judul, isi, teksKonfirmasi, warna = 'bg-yellow-500') {
    modalTitle.textContent = judul;
    modalContent.innerHTML = isi;
    modalConfirm.textContent = teksKonfirmasi;
    modalConfirm.className = `px-4 py-2 ${warna} text-white rounded-lg hover:opacity-90 transition-colors font-medium`;
    modal.classList.remove('hidden');
  };

  document.addEventListener('click', (e) => {
    // CANCEL
    if (e.target.classList.contains('cancel-btn')) {
      const id = e.target.dataset.id;
      currentActionBookingId = id;
      openActionModal(
        'Batalkan Pemesanan',
        `<p class="mb-3">Yakin ingin membatalkan pemesanan <strong>#${id}</strong>?</p>
         <label class="block text-sm mb-1">Alasan pembatalan:</label>
         <textarea id="alasan-cancel" rows="2" class="w-full p-2 border rounded-lg" placeholder="Tulis alasan..."></textarea>`,
        'Ya, Batalkan',
        'bg-red-500'
      );
      modalCallback = () => {
        const alasan = document.getElementById('alasan-cancel')?.value || 'Tidak ada keterangan';
        cancelBooking(id, alasan);
      };
    }

    // RESCHEDULE
    if (e.target.classList.contains('reschedule-btn')) {
      const id = e.target.dataset.id;
      currentActionBookingId = id;
      openActionModal(
        'Ubah Jadwal Pemesanan',
        `<p class="mb-3 text-sm">Pilih tanggal dan waktu baru untuk pemesanan <strong>#${id}</strong></p>
         <label class="block text-sm mb-1">Tanggal Baru:</label>
         <input type="date" id="tgl-baru" class="w-full p-2 border rounded-lg mb-3">
         <label class="block text-sm mb-1">Waktu Baru:</label>
         <select id="waktu-baru" class="w-full p-2 border rounded-lg mb-3">
           <option value="08:00">08:00</option><option value="09:00">09:00</option>
           <option value="10:00">10:00</option><option value="11:00">11:00</option>
           <option value="12:00">12:00</option><option value="13:00">13:00</option>
           <option value="14:00">14:00</option><option value="15:00">15:00</option>
         </select>
         <label class="block text-sm mb-1">Alasan perubahan:</label>
         <textarea id="alasan-reschedule" rows="2" class="w-full p-2 border rounded-lg" placeholder="Tulis alasan..."></textarea>`,
        'Simpan Perubahan',
        'bg-blue-600'
      );
      modalCallback = () => {
        const tglBaru = document.getElementById('tgl-baru')?.value;
        const waktuBaru = document.getElementById('waktu-baru')?.value;
        const alasan = document.getElementById('alasan-reschedule')?.value || 'Tidak ada keterangan';
        if (!tglBaru || !waktuBaru) { alert('Lengkapi tanggal dan waktu!'); return false; }
        rescheduleBooking(id, tglBaru, waktuBaru, alasan);
      };
    }

    // RE-BOOK
    if (e.target.classList.contains('rebook-btn')) {
      const id = e.target.dataset.id;
      currentActionBookingId = id;
      openActionModal(
        'Buat Pemesanan Ulang',
        `<p class="mb-3 text-sm">Buat pemesanan baru berdasarkan data pemesanan <strong>#${id}</strong></p>
         <label class="block text-sm mb-1">Tanggal Pemesanan Baru:</label>
         <input type="date" id="rebook-tgl" class="w-full p-2 border rounded-lg mb-3">
         <label class="block text-sm mb-1">Waktu:</label>
         <select id="rebook-waktu" class="w-full p-2 border rounded-lg mb-3">
           <option value="08:00">08:00</option><option value="09:00">09:00</option>
           <option value="10:00">10:00</option><option value="11:00">11:00</option>
           <option value="12:00">12:00</option><option value="13:00">13:00</option>
           <option value="14:00">14:00</option><option value="15:00">15:00</option>
         </select>`,
        'Buat Pemesanan',
        'bg-green-600'
      );
      modalCallback = () => {
        const tgl = document.getElementById('rebook-tgl')?.value;
        const waktu = document.getElementById('rebook-waktu')?.value;
        if (!tgl || !waktu) { alert('Lengkapi tanggal dan waktu!'); return false; }
        rebookFromPrevious(id, tgl, waktu);
      };
    }
  });
});

// ==========================================
// FUNGSI: CANCEL BOOKING
// ==========================================
function cancelBooking(bookingId, alasan) {
  let allBookings = JSON.parse(localStorage.getItem('runtimeActiveBookings')) || [];
  const idx = allBookings.findIndex(b => b.id === bookingId);
  if (idx === -1) { alert('❌ Pemesanan tidak ditemukan!'); return; }

  const item = allBookings[idx];
  canceledData.unshift({
    ...item,
    alasanDibatalkan: alasan,
    waktuDibatalkan: new Date().toLocaleString('id-ID')
  });

  let bookedSlots = JSON.parse(localStorage.getItem('runtimeBookedSlots')) || [];
  bookedSlots = bookedSlots.filter(s => s !== item.waktu);
  localStorage.setItem('runtimeBookedSlots', JSON.stringify(bookedSlots));

  allBookings.splice(idx, 1);
  localStorage.setItem('runtimeActiveBookings', JSON.stringify(allBookings));

  saveAllData();
  alert(`✅ Pemesanan #${bookingId} telah dibatalkan.\nSlot waktu ${item.waktu} dikembalikan.`);
  location.reload();
}

// ==========================================
// FUNGSI: RESCHEDULE
// ==========================================
function rescheduleBooking(bookingId, tglBaru, waktuBaru, alasan) {
  let allBookings = JSON.parse(localStorage.getItem('runtimeActiveBookings')) || [];
  const idx = allBookings.findIndex(b => b.id === bookingId);
  if (idx === -1) { alert('❌ Pemesanan tidak ditemukan!'); return; }

  const itemLama = {...allBookings[idx]};
  let bookedSlots = JSON.parse(localStorage.getItem('runtimeBookedSlots')) || [];
  bookedSlots = bookedSlots.filter(s => s !== itemLama.waktu);
  if (!bookedSlots.includes(waktuBaru)) bookedSlots.push(waktuBaru);
  localStorage.setItem('runtimeBookedSlots', JSON.stringify(bookedSlots));

  const bulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Desember"];
  const [thn, bln, tgl] = tglBaru.split('-');
  const tampilTanggal = `${parseInt(tgl)} ${bulanSingkat[parseInt(bln)-1]} ${thn}`;
  const targetDate = new Date(tglBaru + 'T' + waktuBaru);

  allBookings[idx].tanggal = tampilTanggal;
  allBookings[idx].waktu = waktuBaru;
  allBookings[idx].endTime = targetDate.getTime() + 30 * 60 * 1000;
  allBookings[idx].status = 'Dijadwal Ulang';
  localStorage.setItem('runtimeActiveBookings', JSON.stringify(allBookings));

  rescheduleData.unshift({
    id: 'RS-' + Math.floor(100 + Math.random() * 900),
    bookingAsliId: bookingId,
    dari: `${itemLama.tanggal} ${itemLama.waktu}`,
    ke: `${tampilTanggal} ${waktuBaru}`,
    alasan: alasan,
    waktuPerubahan: new Date().toLocaleString('id-ID')
  });

  saveAllData();
  alert(`✅ Jadwal berhasil diubah!\nDari: ${itemLama.tanggal} ${itemLama.waktu}\nKe: ${tampilTanggal} ${waktuBaru}`);
  location.reload();
}

// ==========================================
// FUNGSI: RE-BOOK
// ==========================================
function rebookFromPrevious(bookingId, tglBaru, waktuBaru) {
  let allBookings = JSON.parse(localStorage.getItem('runtimeActiveBookings')) || [];
  const dataAsli = allBookings.find(b => b.id === bookingId);
  if (!dataAsli) { alert('❌ Data tidak ditemukan!'); return; }

  const bulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Desember"];
  const [thn, bln, tgl] = tglBaru.split('-');
  const tampilTanggal = `${parseInt(tgl)} ${bulanSingkat[parseInt(bln)-1]} ${thn}`;
  const targetDate = new Date(tglBaru + 'T' + waktuBaru);

  let bookedSlots = JSON.parse(localStorage.getItem('runtimeBookedSlots')) || [];
  if (!bookedSlots.includes(waktuBaru)) bookedSlots.push(waktuBaru);
  localStorage.setItem('runtimeBookedSlots', JSON.stringify(bookedSlots));

  const trackingId = "A-" + Math.floor(100 + Math.random() * 900);
  const dataBaru = {
    id: trackingId,
    nama: dataAsli.nama,
    telepon: dataAsli.telepon,
    tanggal: tampilTanggal,
    waktu: waktuBaru,
    endTime: targetDate.getTime() + 30 * 60 * 1000,
    status: 'Pemesanan Ulang'
  };

  allBookings.unshift(dataBaru);
  localStorage.setItem('runtimeActiveBookings', JSON.stringify(allBookings));

  alert(`✅ Pemesanan ulang berhasil!\nID Baru: #${trackingId}`);
  location.reload();
}