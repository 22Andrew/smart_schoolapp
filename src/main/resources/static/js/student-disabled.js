document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('disabledStudentTable');
    const tableBody = document.getElementById('disabledStudentTableBody');
    const tabs = document.querySelectorAll('.view-tab');
    const listPanel = document.getElementById('listViewPanel');
    const detailsPanel = document.getElementById('detailsViewPanel');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            const view = tab.getAttribute('data-view');
            if (view === 'details') {
                listPanel.classList.remove('active');
                detailsPanel.classList.add('active');
            } else {
                detailsPanel.classList.remove('active');
                listPanel.classList.add('active');
            }
        });
    });
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput') || document.querySelector('.table-search-input');

    function getTableRows() {
        if (!tableBody) return [];
        return Array.from(tableBody.querySelectorAll('tr'));
    }

    function updateShowingInfo(visibleCount, searchTerm) {
        if (!showingInfo) return;
        const totalRows = getTableRows().length;
        const entryLabel = totalRows === 1 ? 'entry' : 'entries';
        if (visibleCount === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        if (searchTerm) {
            showingInfo.textContent = 'Showing 1 to ' + visibleCount + ' of ' + totalRows + ' ' + entryLabel + ' (filtered)';
        } else {
            showingInfo.textContent = 'Showing 1 to ' + visibleCount + ' of ' + totalRows + ' ' + entryLabel;
        }
    }

    // Table search (same behavior as admission enquiry)
    if (searchInput && tableBody) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            let visibleCount = 0;

            getTableRows().forEach(function (row) {
                const rowText = Array.from(row.querySelectorAll('td'))
                    .map(function (cell) { return cell.textContent.trim().toLowerCase(); })
                    .join(' ');

                if (!searchTerm || rowText.indexOf(searchTerm) !== -1) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            updateShowingInfo(visibleCount, searchTerm);
        });
    }

    // Helper: get visible table data (excludes Action column)
    function getTableData() {
        const headers = [];
        const data = [];
        if (!table) return { headers: headers, data: data };

        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(function (th, index) {
            if (index < headerCells.length - 1) {
                headers.push(th.textContent.trim());
            }
        });

        getTableRows().forEach(function (row) {
            if (row.style.display === 'none') return;
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(function (cell, index) {
                if (index < cells.length - 1) {
                    rowData.push(cell.textContent.trim().replace(/\s+/g, ' '));
                }
            });
            data.push(rowData);
        });

        return { headers: headers, data: data };
    }

    // Copy
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) {
                text += row.join('\t') + '\n';
            });

            navigator.clipboard.writeText(text).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Table data copied to clipboard',
                    timer: 2000,
                    showConfirmButton: false
                });
            }).catch(function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to copy data to clipboard',
                    confirmButtonColor: '#ef4444'
                });
            });
        });
    }

    // Excel
    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wsData = [result.headers].concat(result.data);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = result.headers.map(function () { return { wch: 20 }; });
            XLSX.utils.book_append_sheet(wb, ws, 'Disabled Students');

            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, 'Disabled_Students_' + timestamp + '.xlsx');

            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'Excel file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // CSV
    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getTableData();
            let csvContent = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                const escapedRow = row.map(function (cell) {
                    if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1 || cell.indexOf('\n') !== -1) {
                        return '"' + cell.replace(/"/g, '""') + '"';
                    }
                    return cell;
                });
                csvContent += escapedRow.join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];

            link.setAttribute('href', url);
            link.setAttribute('download', 'Disabled_Students_' + timestamp + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'CSV file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // PDF
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getTableData();
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF('l', 'pt', 'a4');

            doc.setFontSize(16);
            doc.text('Disabled Students List', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);

            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: {
                    fillColor: [44, 62, 80],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save('Disabled_Students_' + timestamp + '.pdf');

            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'PDF file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // Print
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getTableData();
            let printContent = ''
                + '<!DOCTYPE html><html><head><title>Disabled Students - Print</title><style>'
                + '@media print { @page { size: landscape; margin: 1cm; } }'
                + 'body { font-family: Arial, sans-serif; margin: 20px; }'
                + 'h1 { color: #2c3e50; margin-bottom: 10px; }'
                + '.print-date { color: #7f8c8d; margin-bottom: 20px; font-size: 14px; }'
                + 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }'
                + 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }'
                + 'th { background-color: #2c3e50; color: white; font-weight: bold; }'
                + 'tr:nth-child(even) { background-color: #f9f9f9; }'
                + '</style></head><body>'
                + '<h1>Disabled Students List</h1>'
                + '<div class="print-date">Generated on: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + '</div>'
                + '<table><thead><tr>';

            result.headers.forEach(function (header) {
                printContent += '<th>' + header + '</th>';
            });
            printContent += '</tr></thead><tbody>';

            result.data.forEach(function (row) {
                printContent += '<tr>';
                row.forEach(function (cell) {
                    printContent += '<td>' + cell + '</td>';
                });
                printContent += '</tr>';
            });

            printContent += '</tbody></table></body></html>';

            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };
        });
    }

    document.querySelectorAll('.btn-menu').forEach(function (btn) {
        btn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Student Actions',
                text: 'Enable student and more actions will be available soon.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    });
});
