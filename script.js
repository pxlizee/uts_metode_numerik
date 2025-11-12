// --- FUNGSI BARU UNTUK FORMAT RUPIAH ---
function formatRupiah(angka) {
    // 1. Hapus semua karakter selain angka
    let number_string = angka.replace(/[^,\d]/g, '').toString();

    // 2. Hapus titik-titik lama (jika ada) untuk menghindari format ganda
    number_string = number_string.replace(/\./g, '');

    // 3. Tambahkan titik sebagai pemisah ribuan
    //    Regex ini mencari batas di mana ada kelipatan 3 digit di belakangnya
    return number_string.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// --- TAMBAHAN: Event listener untuk memformat input secara live ---
// Kita ambil elemen inputnya dulu
const inputPinjaman = document.getElementById("pinjaman");
const inputCicilan = document.getElementById("cicilan");

// Tambahkan listener 'input' ke elemen "Jumlah Pinjaman"
inputPinjaman.addEventListener('input', function (e) {
    this.value = formatRupiah(this.value);
});

// Tambahkan listener 'input' ke elemen "Cicilan per Bulan"
inputCicilan.addEventListener('input', function (e) {
    this.value = formatRupiah(this.value);
});


// --- FUNGSI HELPER (Tidak berubah) ---
function formatAngka(num) {
    if (num === null || isNaN(num)) return "Error";
    if (Math.abs(num) < 1e-9) return "0.000000";
    return num.toFixed(6);
}

// --- FUNGSI METODE SECANT (Tidak berubah) ---
function jalankanMetodeSecant(f, x0, x1, e, N) {
    const tabelBody = document.getElementById("tabelBody");
    const hasilAkhir = document.getElementById("hasilAkhir");

    tabelBody.innerHTML = "";
    hasilAkhir.innerHTML = "";
    hasilAkhir.className = "";
    document.getElementById("hasilContainer").style.display = "block";

    let step = 1;
    while (step <= N) {
        let fx0, fx1, x2, fx2;
        try {
            fx0 = f(x0);
            fx1 = f(x1);
            if (isNaN(fx0) || isNaN(fx1)) throw new Error("Hasil f(x) bukan angka (NaN).");
            if (Math.abs(fx1 - fx0) < 1e-9) throw new Error("Pembagian dengan nol (f(x1) dan f(x0) terlalu mirip).");

            x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
            fx2 = f(x2);

            if (isNaN(x2) || isNaN(fx2)) throw new Error("Hasil x baru bukan angka (NaN).");
        } catch (err) {
            hasilAkhir.innerHTML = `Error pada iterasi ${step}: ${err.message}`;
            hasilAkhir.className = "gagal";
            return;
        }

        const baris = document.createElement("tr");
        baris.innerHTML = `
            <td>${step}</td>
            <td>${formatAngka(x0)}</td>
            <td>${formatAngka(x1)}</td>
            <td>${formatAngka(fx1)}</td>
            <td>${formatAngka(x2)}</td>
            <td>${formatAngka(fx2)}</td>
        `;
        tabelBody.appendChild(baris);

        if (Math.abs(fx2) < e) {
            let bungaPersen = (x2 * 100).toFixed(4);
            hasilAkhir.innerHTML = `Konvergensi dicapai. <br> Akar (Suku Bunga) ≈ <b>${formatAngka(x2)}</b><br>
                                   Artinya, suku bunga bulanan adalah <b>${bungaPersen}%</b>`;
            hasilAkhir.className = "sukses";
            return;
        }
        x0 = x1;
        x1 = x2;
        step++;
    }
    hasilAkhir.innerHTML = `Gagal konvergen setelah ${N} iterasi. Hasil terakhir x ≈ ${formatAngka(x1)}`;
    hasilAkhir.className = "gagal";
}

// --- EVENT LISTENER (DIMODIFIKASI) ---
document.getElementById("secantForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // 1. Ambil nilai parameter studi kasus (sebagai string)
    const pv_string = document.getElementById("pinjaman").value;
    const p_string = document.getElementById("cicilan").value;

    // 2. MODIFIKASI: Hapus titik ('.') sebelum parsing
    const pv = parseFloat(pv_string.replace(/\./g, '')); // Hapus semua titik
    const p = parseFloat(p_string.replace(/\./g, ''));   // Hapus semua titik

    const n = parseInt(document.getElementById("tenor").value);

    // 3. Ambil nilai parameter Metode Secant
    const x0 = parseFloat(document.getElementById("x0").value);
    const x1 = parseFloat(document.getElementById("x1").value);
    const e = parseFloat(document.getElementById("toleransi").value);
    const N = parseInt(document.getElementById("iterasi").value);

    // 4. Validasi input
    if (isNaN(pv) || isNaN(p) || isNaN(n) || isNaN(x0) || isNaN(x1) || isNaN(e) || isNaN(N)) {
        alert("Harap isi semua field dengan angka yang valid.");
        return;
    }
    if (pv <= 0 || p <= 0 || n <= 0) {
        alert("Parameter pinjaman (PV, P, n) harus lebih besar dari nol.");
        return;
    }

    // 5. Buat fungsi f(x) secara dinamis (Tidak berubah)
    const userFunction = function (x) {
        if (Math.abs(x) < 1e-9) {
            return (pv / n) - p;
        }
        const bagian_atas = x * pv;
        const bagian_bawah = 1 - Math.pow(1 + x, -n);
        return (bagian_atas / bagian_bawah) - p;
    };

    // 6. Coba jalankan fungsi sekali untuk tes (Tidak berubah)
    try {
        userFunction(x0);
    } catch (err) {
        alert(`Error saat menghitung fungsi: ${err.message}`);
        return;
    }

    // 7. Panggil fungsi kalkulasi (Tidak berubah)
    jalankanMetodeSecant(userFunction, x0, x1, e, N);
});