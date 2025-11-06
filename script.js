// Menunggu seluruh halaman HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

    // ===========================================
    // ## LOGIKA NAVIGASI TAB ##
    // ===========================================

    const navButtons = document.querySelectorAll('.nav-button');
    const metodeContainers = document.querySelectorAll('.metode-container');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            navButtons.forEach(btn => btn.classList.remove('active'));
            metodeContainers.forEach(container => container.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ===========================================
    // ## EVENT LISTENERS UNTUK TOMBOL HITUNG ##
    // ===========================================

    document.getElementById('hitung-biseksi').addEventListener('click', hitungBiseksi);
    document.getElementById('hitung-regula').addEventListener('click', hitungRegulaFalsi);
    document.getElementById('hitung-nr').addEventListener('click', hitungNewtonRaphson);
    document.getElementById('hitung-secant').addEventListener('click', hitungSecant);
    document.getElementById('hitung-gs').addEventListener('click', hitungGaussSeidel);
    document.getElementById('hitung-mac').addEventListener('click', hitungMaclaurin);

    // Helper untuk menampilkan error
    const showError = (outputDiv, message) => {
        outputDiv.innerHTML = `<p class="error-message">${message}</p>`;
    };

    // Helper untuk mem-format hasil akhir
    const showResult = (outputDiv, tableHtml, finalValue, iterations) => {
        outputDiv.innerHTML = '<h3>Tabel Iterasi</h3>' + tableHtml +
            `<p class="final-result">Hasil: ${finalValue}</p>` +
            (iterations ? `<p>Ditemukan dalam ${iterations} iterasi.</p>` : '');
    };
});

// ===========================================
// 1. FUNGSI BISEKSI
// ===========================================
function hitungBiseksi() {
    const fungsiString = document.getElementById('biseksi-fungsi').value;
    let a = parseFloat(document.getElementById('biseksi-a').value);
    let b = parseFloat(document.getElementById('biseksi-b').value);
    const epsilon = parseFloat(document.getElementById('biseksi-epsilon').value);
    const outputDiv = document.getElementById('hasil-biseksi');
    outputDiv.innerHTML = '';

    if (!fungsiString || isNaN(a) || isNaN(b) || isNaN(epsilon)) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi dengan benar.');
    }

    let f;
    try {
        f = math.parse(fungsiString).compile();
    } catch (e) {
        return showError(outputDiv, `Error Fungsi: ${e.message}`);
    }

    const evalF = (x) => f.evaluate({ x: x });

    if (evalF(a) * evalF(b) >= 0) {
        return showError(outputDiv, 'Error: f(a) dan f(b) harus memiliki tanda yang berbeda.');
    }

    let iterasi = 1, c, error = Math.abs(b - a);
    let tableHtml = '<table><tr><th>Iterasi</th><th>a</th><th>b</th><th>c</th><th>f(c)</th><th>Error</th></tr>';

    while (error > epsilon && iterasi <= 100) {
        c = (a + b) / 2;
        let fc = evalF(c);
        tableHtml += `<tr><td>${iterasi}</td><td>${a.toFixed(6)}</td><td>${b.toFixed(6)}</td><td>${c.toFixed(6)}</td><td>${fc.toFixed(6)}</td><td>${error.toFixed(6)}</td></tr>`;

        if (fc === 0) break;
        (evalF(a) * fc < 0) ? b = c : a = c;

        error = Math.abs(b - a);
        iterasi++;
    }
    tableHtml += '</table>';
    showResult(outputDiv, tableHtml, c.toFixed(6), iterasi - 1);
}

// ===========================================
// 2. FUNGSI REGULA FALSI
// ===========================================
function hitungRegulaFalsi() {
    const fungsiString = document.getElementById('regula-fungsi').value;
    let a = parseFloat(document.getElementById('regula-a').value);
    let b = parseFloat(document.getElementById('regula-b').value);
    const epsilon = parseFloat(document.getElementById('regula-epsilon').value);
    const outputDiv = document.getElementById('hasil-regula');
    outputDiv.innerHTML = '';

    if (!fungsiString || isNaN(a) || isNaN(b) || isNaN(epsilon)) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi dengan benar.');
    }

    let f;
    try {
        f = math.parse(fungsiString).compile();
    } catch (e) {
        return showError(outputDiv, `Error Fungsi: ${e.message}`);
    }

    const evalF = (x) => f.evaluate({ x: x });
    let fa = evalF(a), fb = evalF(b);

    if (fa * fb >= 0) {
        return showError(outputDiv, 'Error: f(a) dan f(b) harus memiliki tanda yang berbeda.');
    }

    let iterasi = 1, c, fc, error = Infinity, c_sebelumnya = b;
    let tableHtml = '<table><tr><th>Iterasi</th><th>a</th><th>b</th><th>c</th><th>f(c)</th><th>Error</th></tr>';

    while (iterasi <= 100) {
        fa = evalF(a);
        fb = evalF(b);
        c = (fa * b - fb * a) / (fa - fb);
        fc = evalF(c);
        error = Math.abs((c - c_sebelumnya) / c);

        tableHtml += `<tr><td>${iterasi}</td><td>${a.toFixed(6)}</td><td>${b.toFixed(6)}</td><td>${c.toFixed(6)}</td><td>${fc.toFixed(6)}</td><td>${(iterasi === 1) ? '---' : error.toFixed(6)}</td></tr>`;

        if (Math.abs(fc) < epsilon || error < epsilon) break;

        (fa * fc < 0) ? b = c : a = c;
        c_sebelumnya = c;
        iterasi++;
    }
    tableHtml += '</table>';
    showResult(outputDiv, tableHtml, c.toFixed(6), iterasi);
}

// ===========================================
// 3. FUNGSI NEWTON-RAPHSON
// ===========================================
function hitungNewtonRaphson() {
    const fungsiString = document.getElementById('nr-fungsi').value;
    let x0 = parseFloat(document.getElementById('nr-x0').value);
    const epsilon = parseFloat(document.getElementById('nr-epsilon').value);
    const outputDiv = document.getElementById('hasil-nr');
    outputDiv.innerHTML = '';

    if (!fungsiString || isNaN(x0) || isNaN(epsilon)) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi dengan benar.');
    }

    let f, df; // f = fungsi, df = turunan
    try {
        f = math.parse(fungsiString).compile();
        // Hitung turunan secara otomatis!
        df = math.derivative(fungsiString, 'x').compile();
    } catch (e) {
        return showError(outputDiv, `Error Fungsi/Turunan: ${e.message}`);
    }

    const evalF = (x) => f.evaluate({ x: x });
    const evalDF = (x) => df.evaluate({ x: x });

    let iterasi = 1, x1, error = Infinity;
    let tableHtml = '<table><tr><th>Iterasi</th><th>xᵢ</th><th>f(xᵢ)</th><th>f\'(xᵢ)</th><th>Error</th></tr>';

    while (error > epsilon && iterasi <= 100) {
        let fx = evalF(x0);
        let dfx = evalDF(x0);

        if (Math.abs(dfx) < 1e-10) { // Cek jika turunan terlalu kecil (pembagian nol)
            return showError(outputDiv, 'Error: Turunan (f\') bernilai nol. Metode gagal.');
        }

        x1 = x0 - (fx / dfx);
        error = Math.abs((x1 - x0) / x1);

        tableHtml += `<tr><td>${iterasi}</td><td>${x0.toFixed(6)}</td><td>${fx.toFixed(6)}</td><td>${dfx.toFixed(6)}</td><td>${error.toFixed(6)}</td></tr>`;

        x0 = x1;
        iterasi++;
    }
    tableHtml += '</table>';
    showResult(outputDiv, tableHtml, x0.toFixed(6), iterasi - 1);
}

// ===========================================
// 4. FUNGSI SECANT
// ===========================================
function hitungSecant() {
    const fungsiString = document.getElementById('secant-fungsi').value;
    let x0 = parseFloat(document.getElementById('secant-x0').value);
    let x1 = parseFloat(document.getElementById('secant-x1').value);
    const epsilon = parseFloat(document.getElementById('secant-epsilon').value);
    const outputDiv = document.getElementById('hasil-secant');
    outputDiv.innerHTML = '';

    if (!fungsiString || isNaN(x0) || isNaN(x1) || isNaN(epsilon)) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi dengan benar.');
    }

    let f;
    try {
        f = math.parse(fungsiString).compile();
    } catch (e) {
        return showError(outputDiv, `Error Fungsi: ${e.message}`);
    }

    const evalF = (x) => f.evaluate({ x: x });

    let iterasi = 1, x2, error = Infinity;
    let tableHtml = '<table><tr><th>Iterasi</th><th>xᵢ₋₁</th><th>xᵢ</th><th>xᵢ₊₁</th><th>Error</th></tr>';

    while (error > epsilon && iterasi <= 100) {
        let fx0 = evalF(x0);
        let fx1 = evalF(x1);

        if (Math.abs(fx1 - fx0) < 1e-10) {
            return showError(outputDiv, 'Error: Pembagian nol (f(xᵢ) - f(xᵢ₋₁)). Metode gagal.');
        }

        x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
        error = Math.abs((x2 - x1) / x2);

        tableHtml += `<tr><td>${iterasi}</td><td>${x0.toFixed(6)}</td><td>${x1.toFixed(6)}</td><td>${x2.toFixed(6)}</td><td>${error.toFixed(6)}</td></tr>`;

        // Update nilai untuk iterasi berikutnya
        x0 = x1;
        x1 = x2;
        iterasi++;
    }
    tableHtml += '</table>';
    showResult(outputDiv, tableHtml, x1.toFixed(6), iterasi - 1);
}

// ===========================================
// 5. FUNGSI GAUSS-SEIDEL
// ===========================================
function hitungGaussSeidel() {
    const matrixAString = document.getElementById('gs-matrix-a').value;
    const vectorBString = document.getElementById('gs-vector-b').value;
    const epsilon = parseFloat(document.getElementById('gs-epsilon').value);
    const outputDiv = document.getElementById('hasil-gs');
    outputDiv.innerHTML = '';

    if (!matrixAString || !vectorBString || isNaN(epsilon)) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi dengan benar.');
    }

    let A, b;
    try {
        A = math.evaluate(matrixAString);
        b = math.evaluate(vectorBString);
    } catch (e) {
        return showError(outputDiv, `Error: Format Matriks/Vektor salah. Gunakan '[[...],[...]]' dan '[...]' (JSON). ${e.message}`);
    }

    const n = b.length;
    if (A.length !== n || A[0].length !== n) {
        return showError(outputDiv, 'Error: Ukuran Matriks A dan Vektor b tidak sesuai.');
    }

    // Cek Dominan Diagonal (Penting untuk konvergensi)
    let isDominant = true;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            if (i !== j) sum += Math.abs(A[i][j]);
        }
        if (Math.abs(A[i][i]) <= sum) isDominant = false;
    }
    if (!isDominant) {
        showError(outputDiv, 'Peringatan: Matriks tidak dominan secara diagonal. Hasil mungkin tidak konvergen.');
    }

    let x = Array(n).fill(0); // Tebakan awal x = [0, 0, ...]
    let iterasi = 1;
    let error = Infinity;

    let tableHeader = '<tr><th>Iterasi</th>';
    for (let i = 0; i < n; i++) tableHeader += `<th>x${i + 1}</th>`;
    tableHeader += '<th>Error</th></tr>';
    let tableHtml = `<table>${tableHeader}`;

    while (error > epsilon && iterasi <= 100) {
        let x_lama = [...x];
        let rowHtml = `<td>${iterasi}</td>`;

        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    sum += A[i][j] * x[j];
                }
            }
            x[i] = (b[i] - sum) / A[i][i];
            rowHtml += `<td>${x[i].toFixed(6)}</td>`;
        }

        // Hitung error (norma maksimum)
        error = 0;
        for (let i = 0; i < n; i++) {
            error = Math.max(error, Math.abs(x[i] - x_lama[i]));
        }

        tableHtml += `<tr>${rowHtml}<td>${error.toFixed(6)}</td></tr>`;
        iterasi++;
    }
    tableHtml += '</table>';

    let hasilString = x.map((val, i) => `x${i + 1} = ${val.toFixed(6)}`).join(', ');
    showResult(outputDiv, tableHtml, `[ ${hasilString} ]`, iterasi - 1);
}

// ===========================================
// 6. FUNGSI DERET MACLAURIN
// ===========================================
function hitungMaclaurin() {
    const fungsiString = document.getElementById('mac-fungsi').value;
    const x_val = parseFloat(document.getElementById('mac-x').value);
    const n_suku = parseInt(document.getElementById('mac-n').value);
    const outputDiv = document.getElementById('hasil-mac');
    outputDiv.innerHTML = '';

    if (!fungsiString || isNaN(x_val) || isNaN(n_suku) || n_suku <= 0) {
        return showError(outputDiv, 'Error: Pastikan semua field terisi (n harus > 0).');
    }

    let f_node;
    try {
        f_node = math.parse(fungsiString);
    } catch (e) {
        return showError(outputDiv, `Error Fungsi: ${e.message}`);
    }

    let total_sum = 0;
    let tableHtml = '<table><tr><th>Suku (n)</th><th>fⁿ(0)</th><th>Nilai Suku</th><th>Total Aproksimasi</th></tr>';
    let f_current = f_node; // Ini adalah f(x), lalu f'(x), lalu f''(x), ...

    for (let n = 0; n < n_suku; n++) {
        let f_n_at_zero;
        try {
            // Evaluasi turunan ke-n di x=0
            f_n_at_zero = f_current.evaluate({ x: 0 });
        } catch (e) {
            showError(outputDiv, `Error saat mengevaluasi turunan ke-${n} di x=0. Pastikan fungsi terdefinisi di 0 (cth: '1/x' gagal).`);
            break;
        }

        // Rumus suku: (fⁿ(0) / n!) * xⁿ
        let suku = (f_n_at_zero / math.factorial(n)) * Math.pow(x_val, n);
        total_sum += suku;

        tableHtml += `<tr>
                        <td>${n}</td>
                        <td>${f_n_at_zero.toFixed(6)}</td>
                        <td>${suku.toFixed(6)}</td>
                        <td>${total_sum.toFixed(6)}</td>
                      </tr>`;

        // Siapkan untuk iterasi berikutnya: cari turunan
        try {
            f_current = math.derivative(f_current, 'x');
        } catch (e) {
            showError(outputDiv, `Gagal menghitung turunan ke-${n + 1}.`);
            break;
        }
    }

    tableHtml += '</table>';
    let nilai_eksak = math.evaluate(fungsiString, { x: x_val });
    let hasilString = `f(${x_val}) ≈ ${total_sum.toFixed(6)} (Nilai Eksak: ${nilai_eksak.toFixed(6)})`;
    showResult(outputDiv, tableHtml, hasilString, null); // null untuk iterasi
}