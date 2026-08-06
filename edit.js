let csvData = [];  // tallennetaan data muistiin nopeaa hakua varten

async function loadCSV() {
    const response = await fetch('kappaleet.csv');
    const text = await response.text();

    csvData = text.trim().split('\n').map(r => r.split(','));

    renderTable(csvData);
}

function renderTable(data) {
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.textContent = cell;

            td.addEventListener('input', () => validateCell(td, colIndex));

            tr.appendChild(td);
        });

        const editBtn = document.createElement('td');
        editBtn.innerHTML = '<button onclick="editRow(' + rowIndex + ')">Muuta</button>';
        tr.appendChild(editBtn);

        table.appendChild(tr);
    });
}

function editRow(index) {
    const table = document.getElementById('csvTable');
    table.rows[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function addRow() {
    const table = document.getElementById('csvTable');
    const tr = document.createElement('tr');

    for (let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.textContent = '';

        td.addEventListener('input', () => validateCell(td, i));

        tr.appendChild(td);
    }

    const editBtn = document.createElement('td');
    editBtn.innerHTML = '<button onclick="editRow()">Muuta</button>';
    tr.appendChild(editBtn);

    table.appendChild(tr);
}

function downloadCSV() {
    const table = document.getElementById('csvTable');
    let csv = '';

    for (let i = 0; i < table.rows.length; i++) {
        const cells = table.rows[i].cells;
        let row = [];

        for (let j = 0; j < 5; j++) {
            row.push(cells[j].textContent.replace(/,/g, ''));
        }

        csv += row.join(',') + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'kappaleet.csv';
    a.click();
}

function searchCSV() {
    const query = document.getElementById('searchBox').value.toLowerCase();

    if (query.length === 0) {
        renderTable(csvData);
        return;
    }

    const filtered = csvData.filter(row =>
        row.join(' ').toLowerCase().includes(query)
    );

    renderTable(filtered);
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
