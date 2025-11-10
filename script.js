// Fungsi untuk memformat angka agar rapi di tabel
function formatAngka(num) {
    if (num === null || isNaN(num)) return "Error";
    if (Math.abs(num) < 1e-9) return "0.000000";
    return num.toFixed(6);
}

// Fungsi utama yang menjalankan Metode Secant
// 'f' kini menjadi parameter (fungsi yang dibuat dari input user)
function jalankanMetodeSecant(f, x0, x1, e, N) {
    const tabelBody = document.getElementById("tabelBody");
    const hasilAkhir = document.getElementById("hasilAkhir");

    // Bersihkan hasil sebelumnya
    tabelBody.innerHTML = "";
    hasilAkhir.innerHTML = "";
    hasilAkhir.className = "";
    document.getElementById("hasilContainer").style.display = "block"; // Tampilkan kontainer hasil

    let step = 1;

    while (step <= N) {
        let fx0, fx1, x2, fx2;

        try {
            // Coba hitung nilai f(x)
            fx0 = f(x0);
            fx1 = f(x1);

            if (isNaN(fx0) || isNaN(fx1)) throw new Error("Hasil f(x) bukan angka (NaN). Cek domain fungsi.");

            // Cek pembagian dengan nol
            if (Math.abs(fx1 - fx0) < 1e-9) {
                throw new Error("Pembagian dengan nol (f(x1) dan f(x0) terlalu mirip).");
            }

            // Rumus Metode Secant
            x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
            fx2 = f(x2);

            if (isNaN(x2) || isNaN(fx2)) throw new Error("Hasil x baru bukan angka (NaN).");

        } catch (err) {
            // Tangkap error jika terjadi saat kalkulasi
            hasilAkhir.innerHTML = `Error pada iterasi ${step}: ${err.message}`;
            hasilAkhir.className = "gagal";
            return;
        }

        // Buat baris baru untuk tabel hasil
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

        // Cek konvergensi
        if (Math.abs(fx2) < e) {
            hasilAkhir.innerHTML = `Konvergensi dicapai. <br> Akar (x) ≈ <b>${formatAngka(x2)}</b>`;
            hasilAkhir.className = "sukses";
            return; // Selesai, hentikan fungsi
        }

        // Update tebakan untuk iterasi berikutnya
        x0 = x1;
        x1 = x2;
        step++;
    }

    // Jika loop selesai tanpa 'return', berarti gagal konvergen
    hasilAkhir.innerHTML = `Gagal konvergen setelah ${N} iterasi. Hasil terakhir x ≈ ${formatAngka(x1)}`;
    hasilAkhir.className = "gagal";
}

// Event listener untuk 'form'
// Kita harus pastikan DOM sudah siap, tapi 'defer' di HTML sudah menangani ini.
document.getElementById("secantForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Mencegah form me-refresh halaman

    // Ambil nilai string dari input fungsi
    const functionString = document.getElementById("fungsi").value;

    // Ambil nilai numerik dari input lain
    const x0 = parseFloat(document.getElementById("x0").value);
    const x1 = parseFloat(document.getElementById("x1").value);
    const e = parseFloat(document.getElementById("toleransi").value);
    const N = parseInt(document.getElementById("iterasi").value);

    // Validasi input
    if (!functionString) {
        alert("Harap masukkan fungsi f(x).");
        return;
    }
    if (isNaN(x0) || isNaN(x1) || isNaN(e) || isNaN(N)) {
        alert("Harap isi semua field (x0, x1, e, N) dengan angka yang valid.");
        return;
    }

    // Membuat fungsi JavaScript dari string input user
    // Ini adalah cara yang aman untuk mengevaluasi ekspresi matematika
    let userFunction;
    try {
        // 'use strict' mencegah beberapa error umum
        userFunction = new Function('x', `"use strict"; return ${functionString};`);

        // Coba jalankan fungsi sekali untuk tes
        userFunction(1);
    } catch (err) {
        alert(`Error pada sintaks fungsi Anda: ${err.message}\n\nPastikan Anda menulisnya dengan benar, misal: Math.pow(x, 2) - 5`);
        return;
    }

    // Panggil fungsi kalkulasi dengan fungsi buatan user
    jalankanMetodeSecant(userFunction, x0, x1, e, N);
});