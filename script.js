// Fungsi format angka menjadi 'Rp xxx.xxx,-'
function formatRupiah(angka) {
  let formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
  return formatted.replace(/,00$/, ",-"); // Ganti ,00 dengan ,-
}

// Fungsi untuk memformat input harga secara langsung saat mengetik
function formatHarga(element) {
  let value = element.value.replace(/[^\d]/g, ""); // Hanya ambil angka
  if (value) {
    element.value = formatRupiah(value); // Format angka ke dalam bentuk rupiah
  }
}

// Menghasilkan nomor invoice otomatis
function generateInvoiceNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  // Ambil nomor terakhir dari localStorage, jika tidak ada mulai dari 0001
  let lastInvoiceNumber = localStorage.getItem("lastInvoiceNumber") || "0000";

  // Tambah 1 ke nomor terakhir
  let nextInvoiceNumber = (parseInt(lastInvoiceNumber) + 1)
    .toString()
    .padStart(4, "0");

  // Simpan nomor terbaru ke localStorage
  localStorage.setItem("lastInvoiceNumber", nextInvoiceNumber);

  // Format nomor invoice
  const invoiceNumber = `INV-${year}${month}${day}-${nextInvoiceNumber}`;

  // Tampilkan nomor invoice di elemen HTML
  document.getElementById("invoice-no").textContent = invoiceNumber;
}

// Mengisi tanggal otomatis
function generateTanggal() {
  const date = new Date();
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  document.getElementById("tanggal").textContent = `${day}/${month}/${year}`;
}

// Menambah baris baru untuk barang
function addRow() {
  const table = document
    .getElementById("invoice-table")
    .getElementsByTagName("tbody")[0];
  const rowCount = table.rows.length + 1;
  const newRow = table.insertRow();

  newRow.innerHTML = `
      <td>${rowCount}</td>
      <td><input type="text" class="detail-barang" placeholder="Detail Barang"></td>
      <td><input type="number" class="qty" placeholder="Qty" oninput="calculateAmount(this)"></td>
      <td><input type="text" class="harga" placeholder="Harga" oninput="formatHarga(this); calculateAmount(this)"></td>
      <td><span class="jumlah"></span></td>
  `;
}

// Hitung jumlah per barang dan total harga
function calculateAmount(element) {
  const row = element.closest("tr");
  const qty = row.querySelector(".qty").value;
  const harga = row.querySelector(".harga").value.replace(/[^\d]/g, ""); // Hanya angka
  const jumlah = row.querySelector(".jumlah");

  const total = qty * harga;
  jumlah.textContent = formatRupiah(total);

  calculateTotal(); // Hitung total keseluruhan
}

// Hitung total keseluruhan dan sisa pembayaran
function calculateTotal() {
  let totalJumlah = 0;
  const rows = document.querySelectorAll("#invoice-table tbody tr");

  rows.forEach((row) => {
    const jumlah = row.querySelector(".jumlah").textContent;
    totalJumlah += Number(jumlah.replace(/[^\d]/g, "")); // Hilangkan format non-angka untuk perhitungan
  });

  document.getElementById("total-jumlah").textContent =
    formatRupiah(totalJumlah);

  // Hitung sisa setelah DP
  const dp = document.getElementById("dp").value || 0;
  const sisa = totalJumlah - dp;
  document.getElementById("sisa").textContent = formatRupiah(sisa);
}

// Generate PDF dari invoice
function generatePDF() {
  const element = document.getElementById("invoice-box");
  html2pdf().from(element).save();
}

// Panggil fungsi untuk generate nomor invoice dan tanggal saat halaman dibuka
window.onload = function () {
  generateInvoiceNo();
  generateTanggal();
};
