let csvData = [];  
let currentFilteredIndexes = []; 

async function loadCSV() {
    const response = await fetch('https://raw.githubusercontent.com/LamminHovi/Karaokelista/main/kappaleet.csv?cacheBust=' + Date.now());
    const text = await response.text();
    
    csvData = text.trim().split('\n').map(r => r.split(','));

    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';
}

function renderTable(filteredRows) {
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';

    const maxRows = 50;
    const rowsToShow = filteredRows.slice(0, maxRows);

    rowsToShow.forEach((rowIndex, displayIndex) => {
        const tr = document.createElement('tr');

        for (let colIndex = 0; colIndex < 5; colIndex++) {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.textContent = csvData[rowIndex][colIndex] || '';

            /* ⭐ VÄRITYS LAITE-SARAKKEESEEN (colIndex === 2) */
            if (colIndex === 2) {
                td.style.backgroundColor = laiteVari(csvData[rowIndex][2]);
            }

            td.addEventListener('input', () => {
                csvData[rowIndex][colIndex] = td.textContent.trim();
                validateCell(td, colIndex);

                /* ⭐ Päivitä väri heti kun Laite-kenttää muokataan */
                if (colIndex === 2) {
                    td.style.backgroundColor = laiteVari(td.textContent.trim());
                }
            });

            tr.appendChild(td);
        }

        const editBtn = document.createElement('td');
        editBtn.innerHTML = '<button onclick="editRow(' + displayIndex + ')">Muuta</button>';
        tr.appendChild(editBtn);

        tableBody.appendChild(tr);
    });
}

function editRow(displayIndex) {
    const tableBody = document.querySelector('#csvTable tbody');
    const rows = tableBody.rows;
    if (displayIndex >= 0 && displayIndex < rows.length) {
        rows[displayIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function addRow() {
    csvData.push(["", "", "", "", ""]);
    searchCSV();
}

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
}

function searchCSV() {
    const query = document.getElementById('searchBox').value.toLowerCase();

    if (query.length === 0) {
        currentFilteredIndexes = [];
        const tableBody = document.querySelector('#csvTable tbody');
        tableBody.innerHTML = '';
        return;
    }

    currentFilteredIndexes = csvData
        .map((row, index) => ({ row, index }))
        .filter(obj => obj.row.join(' ').toLowerCase().includes(query))
        .map(obj => obj.index);

    renderTable(currentFilteredIndexes);
}

function clearSearch() {
    document.getElementById('searchBox').value = '';
    currentFilteredIndexes = [];
    const tableBody = document.querySelector('#csvTable tbody');
    tableBody.innerHTML = '';
}

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

loadCSV();
