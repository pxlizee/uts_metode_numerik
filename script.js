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
            // Ubah pesan hasil agar lebih jelas
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

// --- EVENT LISTENER (INI YANG DIUBAH) ---
document.getElementById("secantForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // 1. Ambil nilai parameter studi kasus
    const pv = parseFloat(document.getElementById("pinjaman").value); // Jumlah Pinjaman
    const p = parseFloat(document.getElementById("cicilan").value);   // Cicilan
    const n = parseInt(document.getElementById("tenor").value);       // Tenor (bulan)

    // 2. Ambil nilai parameter Metode Secant
    const x0 = parseFloat(document.getElementById("x0").value);
    const x1 = parseFloat(document.getElementById("x1").value);
    const e = parseFloat(document.getElementById("toleransi").value);
    const N = parseInt(document.getElementById("iterasi").value);

    // 3. Validasi input
    if (isNaN(pv) || isNaN(p) || isNaN(n) || isNaN(x0) || isNaN(x1) || isNaN(e) || isNaN(N)) {
        alert("Harap isi semua field dengan angka yang valid.");
        return;
    }
    if (pv <= 0 || p <= 0 || n <= 0) {
        alert("Parameter pinjaman (PV, P, n) harus lebih besar dari nol.");
        return;
    }

    // 4. Buat fungsi f(x) secara dinamis
    // Di sini, 'x' adalah suku bunga (r) yang kita cari.
    // Rumus: f(x) = ( (x * PV) / (1 - (1+x)^-n) ) - P
    const userFunction = function (x) {
        // Cek jika x sangat dekat dengan 0
        if (Math.abs(x) < 1e-9) {
            // Jika x=0, rumusnya menjadi P = PV/n
            // f(0) = PV/n - P
            return (pv / n) - p;
        }

        const bagian_atas = x * pv;
        const bagian_bawah = 1 - Math.pow(1 + x, -n);

        return (bagian_atas / bagian_bawah) - p;
    };

    // 5. Coba jalankan fungsi sekali untuk tes
    try {
        userFunction(x0); // Tes dengan tebakan awal
    } catch (err) {
        alert(`Error saat menghitung fungsi: ${err.message}`);
        return;
    }

    // 6. Panggil fungsi kalkulasi
    jalankanMetodeSecant(userFunction, x0, x1, e, N);
});