document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('bulkDeleteTable');
    const tableBody = document.getElementById('bulkDeleteTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const selectAll = document.getElementById('selectAll');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const criteriaForm = document.getElementById('criteriaForm');

    function getTableRows() {
        return tableBody ? Array.from(tableBody.querySelectorAll('tr')) : [];
    }

    function getVisibleRows() {
        return getTableRows().filter(function (row) {
            return row.style.display !== 'none';
        });
    }

    function getRowCheckboxes(visibleOnly) {
        const rows = visibleOnly ? getVisibleRows() : getTableRows();
        return rows.map(function (row) {
            return row.querySelector('.row-checkbox');
        }).filter(Boolean);
    }

    function updateShowingInfo(visibleCount, searchTerm) {
        if (!showingInfo) return;
        const totalRows = getTableRows().length;
        if (visibleCount === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        if (searchTerm) {
            showingInfo.textContent = 'Showing 1 to ' + visibleCount + ' of ' + totalRows + ' entries (filtered)';
        } else {
            showingInfo.textContent = 'Showing 1 to ' + visibleCount + ' of ' + totalRows + ' entries';
        }
    }

    function syncSelectAllState() {
        if (!selectAll) return;
        const boxes = getRowCheckboxes(true);
        if (!boxes.length) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        const checkedCount = boxes.filter(function (box) { return box.checked; }).length;
        selectAll.checked = checkedCount === boxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
    }

    if (criteriaForm) {
        criteriaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            Swal.fire({
                icon: 'success',
                title: 'Search Complete',
                text: 'Student list updated for the selected criteria.',
                timer: 1500,
                showConfirmButton: false
            });
        });
    }

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
            syncSelectAllState();
        });
    }

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            getRowCheckboxes(true).forEach(function (box) {
                box.checked = selectAll.checked;
            });
            selectAll.indeterminate = false;
        });
    }

    getRowCheckboxes(false).forEach(function (box) {
        box.addEventListener('change', syncSelectAllState);
    });

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function () {
            const selected = getRowCheckboxes(true).filter(function (box) { return box.checked; });
            if (!selected.length) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Students Selected',
                    text: 'Please select at least one student to delete.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            Swal.fire({
                icon: 'warning',
                title: 'Delete Selected Students?',
                text: selected.length + ' student(s) will be deleted. This cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(function (result) {
                if (!result.isConfirmed) return;

                selected.forEach(function (box) {
                    const row = box.closest('tr');
                    if (row) row.remove();
                });

                // Renumber remaining rows
                getTableRows().forEach(function (row, index) {
                    const numCell = row.children[1];
                    if (numCell) numCell.textContent = String(index + 1);
                });

                const remaining = getVisibleRows().length;
                updateShowingInfo(remaining, searchInput ? searchInput.value.trim() : '');
                syncSelectAllState();

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: selected.length + ' student(s) deleted.',
                    timer: 1600,
                    showConfirmButton: false
                });
            });
        });
    }

    function getTableData() {
        const headers = [];
        const data = [];
        if (!table) return { headers: headers, data: data };

        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(function (th, index) {
            if (index > 0) {
                headers.push(th.textContent.trim());
            }
        });

        getVisibleRows().forEach(function (row) {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(function (cell, index) {
                if (index > 0) {
                    rowData.push(cell.textContent.trim().replace(/\s+/g, ' '));
                }
            });
            data.push(rowData);
        });

        return { headers: headers, data: data };
    }

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
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wsData = [result.headers].concat(result.data);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = result.headers.map(function () { return { wch: 18 }; });
            XLSX.utils.book_append_sheet(wb, ws, 'Bulk Delete');
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, 'Bulk_Delete_' + timestamp + '.xlsx');
            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'Excel file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getTableData();
            let csvContent = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                const escapedRow = row.map(function (cell) {
                    if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1) {
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
            link.setAttribute('download', 'Bulk_Delete_' + timestamp + '.csv');
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

    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getTableData();
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF('l', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Bulk Delete - Student List', 40, 40);
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
                styles: { fontSize: 8, cellPadding: 3 }
            });
            const timestamp = new Date().toISOString().split('T')[0];
            doc.save('Bulk_Delete_' + timestamp + '.pdf');
            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'PDF file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getTableData();
            let printContent = ''
                + '<!DOCTYPE html><html><head><title>Bulk Delete - Print</title><style>'
                + '@media print { @page { size: landscape; margin: 1cm; } }'
                + 'body { font-family: Arial, sans-serif; margin: 20px; }'
                + 'h1 { color: #2c3e50; margin-bottom: 10px; }'
                + 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }'
                + 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }'
                + 'th { background-color: #2c3e50; color: white; }'
                + '</style></head><body>'
                + '<h1>Bulk Delete - Student List</h1>'
                + '<div>Generated on: ' + new Date().toLocaleString() + '</div>'
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

    // Column Visibility
    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    const columnToggles = document.querySelectorAll('.column-toggle');

    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });

        columnVisibilityDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        columnToggles.forEach(function (toggle) {
            toggle.addEventListener('change', function () {
                const columnIndex = parseInt(this.getAttribute('data-column'), 10);
                const isVisible = this.checked;
                if (!table) return;

                const headerCells = table.querySelectorAll('thead th');
                if (headerCells[columnIndex]) {
                    headerCells[columnIndex].style.display = isVisible ? '' : 'none';
                }

                table.querySelectorAll('tbody tr').forEach(function (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells[columnIndex]) {
                        cells[columnIndex].style.display = isVisible ? '' : 'none';
                    }
                });
            });
        });
    }
});
