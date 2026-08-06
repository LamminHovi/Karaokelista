async function loadCSV() {
    const response = await fetch('kappaleet.csv');
    const text = await response.text();
    const rows = text.trim().split('\n').map(r => r.split(','));

    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach((cell) => {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.textContent = cell;
            tr.appendChild(td);
        });

        const deleteBtn = document.createElement('td');
        deleteBtn.innerHTML = '<button onclick="deleteRow(' + rowIndex + ')">Poista</button>';
        tr.appendChild(deleteBtn);

        table.appendChild(tr);
    });
}

function addRow() {
    const table = document.getElementById('csvTable');
    const tr = document.createElement('tr');

    // Luo 3 solua (voit muuttaa sarakemäärän)
    for (let i = 0; i < 3; i++) {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.textContent = '';
        tr.appendChild(td);
    }

    const deleteBtn = document.createElement('td');
    deleteBtn.innerHTML = '<button onclick="deleteRow()">Poista</button>';
    tr.appendChild(deleteBtn);

    table.appendChild(tr);
}

function deleteRow(index) {
    const table = document.getElementById('csvTable');
    table.deleteRow(index);
}

function downloadCSV() {
    const table = document.getElementById('csvTable');
    let csv = '';

    for (let i = 0; i < table.rows.length; i++) {
        const cells = table.rows[i].cells;
        let row = [];

        for (let j = 0; j < cells.length - 1; j++) {
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

loadCSV();
