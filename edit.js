let csvData = [];  
let currentFilteredIndexes = [];
let sortState = { col: -1, dir: 'asc' };
let autoSaveTimer = null;

/* ===== localStorage-avain ===== */
const STORAGE_KEY = 'hoviKaraokeUnsaved';

/* ===== CSV:n lataus GitHubista ===== */
async function loadCSV() {
    try {
        const response = await fetch(
            'https://raw.githubusercontent.com/LamminHovi/Karaokelista/main/kappaleet.csv?cacheBust=' + Date.now()
        );
        const text = await response.text();
        csvData = text.trim().split('\n').map(r => r.split(','));
    } catch (e) {
        console.error('CSV:n lataus epäonnistui:', e);
        csvData = [];
    }

    /* Tarkista tallentamattomat muutokset localStoragesta */
    const unsaved = localStorage.getItem(STORAGE_KEY);
    if (unsaved) {
        try {
            const parsed = JSON.parse(unsaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                document.getElementById('unsavedBanner').style.display = 'block';
            }
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    /* Tyhjennä taulukko alussa */
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('counter').textContent = '';
}

/* ===== Taulukon renderöinti (ei rajarajoitusta) ===== */
function renderTable(filteredRows) {
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('counter').textContent = filteredRows.length + ' kpl';

    filteredRows.forEach((rowIndex) => {
        const tr = document.createElement('tr');

        for (let colIndex = 0; colIndex < 5; colIndex++) {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            td.textContent = csvData[rowIndex][colIndex] || '';

            /* Väritä KONE-sarake */
            if (colIndex === 2) {
                td.style.backgroundColor = laiteVari(csvData[rowIndex][2]);
            }

            td.addEventListener('input', () => {
                csvData[rowIndex][colIndex] = td.textContent.trim();
                validateCell(td, colIndex);

                if (colIndex === 2) {
                    td.style.backgroundColor = laiteVari(td.textContent.trim());
                }

                autoSave();
            });

            /* Enter → siirry saman sarakkeen seuraavalle riville */
            td.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();

                    const currentRow = td.parentElement;
                    const nextRow = currentRow.nextElementSibling;
                    if (nextRow) {
                        const nextTd = nextRow.children[colIndex];
                        if (nextTd) {
                            nextTd.focus();
                            /* Valitse koko teksti helpottamaan korjausta */
                            const range = document.createRange();
                            range.selectNodeContents(nextTd);
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    } else {
                        /* Viimeisellä rivillä → siirry hakuun */
                        document.getElementById('searchBox').focus();
                        document.getElementById('searchBox').select();
                    }
                }
            });

            tr.appendChild(td);
        }

        tableBody.appendChild(tr);
    });
}

/* ===== Lajittelu ===== */
function sortColumn(colIndex) {
    if (sortState.col === colIndex) {
        sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.col = colIndex;
        sortState.dir = 'asc';
    }

    updateSortUI();

    if (currentFilteredIndexes.length > 0) {
        applySort();
        renderTable(currentFilteredIndexes);
    }
}

function applySort() {
    const col = sortState.col;
    const dir = sortState.dir;

    currentFilteredIndexes.sort((a, b) => {
        let valA = (csvData[a][col] || '').trim();
        let valB = (csvData[b][col] || '').trim();

        if (col === 4) {
            /* Päivämäärälajittelu: dd.mm.yyyy → yyyymmdd */
            valA = parseDate(valA);
            valB = parseDate(valB);
        } else {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        let cmp = 0;
        if (valA < valB) cmp = -1;
        else if (valA > valB) cmp = 1;

        return dir === 'asc' ? cmp : -cmp;
    });
}

function parseDate(str) {
    const m = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return '';
    return m[3] + m[2] + m[1]; /* yyyymmdd */
}

function updateSortUI() {
    document.querySelectorAll('#csvTable thead th').forEach((th, i) => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        const icon = th.querySelector('.sort-icon');
        icon.textContent = '';

        if (i === sortState.col) {
            th.classList.add(sortState.dir === 'asc' ? 'sorted-asc' : 'sorted-desc');
            icon.textContent = sortState.dir === 'asc' ? ' \u25B2' : ' \u25BC';
        }
    });
}

/* ===== Haku ===== */
function searchCSV() {
    const query = document.getElementById('searchBox').value.toLowerCase();

    if (query.length === 0) {
        currentFilteredIndexes = [];
        const tableBody = document.querySelector('#csvTable tbody');
        tableBody.innerHTML = '';
        document.getElementById('counter').textContent = '';
        return;
    }

    currentFilteredIndexes = csvData
        .map((row, index) => ({ row, index }))
        .filter(obj => obj.row.join(' ').toLowerCase().includes(query))
        .map(obj => obj.index);

    /* Säilytä nykyinen lajittelu jos aktiivinen */
    if (sortState.col >= 0) {
        applySort();
    }

    renderTable(currentFilteredIndexes);
}

function clearSearch() {
    const sb = document.getElementById('searchBox');
    sb.value = '';
    currentFilteredIndexes = [];
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';
    document.getElementById('counter').textContent = '';
    sb.focus();
}

/* ===== CSV:n lataus tiedostoon ===== */
function downloadCSV() {
    let csv = '';
    csvData.forEach(row => {
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kappaleet.csv';
    a.click();

    /* Muutokset on nyt tallennettu → tyhjennä localStorage */
    localStorage.removeItem(STORAGE_KEY);
}

/* ===== Automaattinen tallennus localStorageen ===== */
function autoSave() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(csvData));
    } catch (e) {
        console.error('Automaattinen tallennus epäonnistui:', e);
    }

    /* Näytä "Tallennettu"-ilmaisu (korkeintaan kerran 2 sekunnissa) */
    if (!autoSaveTimer) {
        const el = document.getElementById('autoSaveStatus');
        el.style.opacity = '1';
        autoSaveTimer = setTimeout(() => {
            el.style.opacity = '0';
            autoSaveTimer = null;
        }, 1500);
    }
}

/* ===== Tallentamattomien muutosten palautus / hylkääminen ===== */
function restoreUnsaved() {
    const unsaved = localStorage.getItem(STORAGE_KEY);
    if (unsaved) {
        try {
            csvData = JSON.parse(unsaved);
        } catch (e) {
            console.error('Palautus epäonnistui:', e);
        }
    }
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('unsavedBanner').style.display = 'none';
    clearSearch();
}

function discardUnsaved() {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('unsavedBanner').style.display = 'none';
}

/* ===== Päivämäärän validointi ===== */
function validateCell(td, colIndex) {
    const value = td.textContent.trim();

    if (colIndex !== 4) {
        td.classList.remove('invalid');
        return;
    }

    if (value === '') {
        td.classList.remove('invalid');
        return;
    }

    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = value.match(regex);

    if (!match) {
        td.classList.add('invalid');
        return;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        td.classList.add('invalid');
    } else {
        td.classList.remove('invalid');
    }
}

/* ===== Käynnistys ===== */
loadCSV();