document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('reasonTable');
    const tableBody = document.getElementById('reasonTableBody');
    const showingInfo = document.querySelector('.showing-info');
    const searchInput = document.getElementById('searchInput');
    const reasonForm = document.getElementById('reasonForm');
    const reasonNameInput = document.getElementById('reasonName');
    const reasonIdInput = document.getElementById('reasonId');
    const saveBtn = document.getElementById('saveBtn');

    let reasons = [];

    function createActionButtonsHtml() {
        return ''
            + '<button type="button" class="btn-action btn-edit" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>'
            + '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line>'
            + '<line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function resetForm() {
        reasonForm.reset();
        reasonIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function updateShowingInfo(visibleCount, searchTerm) {
        if (!showingInfo) return;
        const totalRows = reasons.length;
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

    function applySearchFilter() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        Array.from(tableBody.querySelectorAll('tr')).forEach(function (row) {
            if (row.classList.contains('no-data-row')) {
                row.style.display = searchTerm ? 'none' : '';
                return;
            }
            const rowText = (row.querySelector('.reason-name') || {}).textContent || '';
            if (!searchTerm || rowText.toLowerCase().indexOf(searchTerm) !== -1) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        updateShowingInfo(visibleCount, searchTerm);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function renderReasons() {
        tableBody.innerHTML = '';

        if (!reasons.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="2" style="text-align:center;color:#94a3b8;">No disable reasons found</td></tr>';
            updateShowingInfo(0, '');
            return;
        }

        reasons.forEach(function (item) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(item.id));
            tr.innerHTML = ''
                + '<td class="reason-name">' + escapeHtml(item.reason) + '</td>'
                + '<td class="action-cell">' + createActionButtonsHtml() + '</td>';
            tableBody.appendChild(tr);
        });

        applySearchFilter();
    }

    async function loadReasons() {
        try {
            const response = await fetch('/api/disable-reasons');
            if (!response.ok) {
                throw new Error('Failed to load disable reasons');
            }
            reasons = await response.json();
            renderReasons();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load disable reasons from database.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    if (reasonForm) {
        reasonForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const reason = reasonNameInput.value.trim();
            if (!reason) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please enter a disable reason.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const editingId = reasonIdInput.value;
            const payload = { reason: reason };

            try {
                let response;
                if (editingId) {
                    response = await fetch('/api/disable-reasons/' + editingId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch('/api/disable-reasons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    const message = await parseErrorMessage(response);
                    throw new Error(message);
                }

                resetForm();
                await loadReasons();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: editingId ? 'Disable reason updated successfully.' : 'Disable reason saved to database.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save disable reason.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const row = e.target.closest('tr');
            if (!row || row.classList.contains('no-data-row')) return;

            if (editBtn) {
                reasonIdInput.value = row.getAttribute('data-id') || '';
                reasonNameInput.value = row.querySelector('.reason-name').textContent.trim();
                saveBtn.textContent = 'Update';
                reasonNameInput.focus();
                return;
            }

            if (deleteBtn) {
                const name = row.querySelector('.reason-name').textContent.trim();
                const rowId = row.getAttribute('data-id');

                Swal.fire({
                    icon: 'warning',
                    title: 'Delete Disable Reason?',
                    text: '"' + name + '" will be deleted from the database.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                }).then(async function (result) {
                    if (!result.isConfirmed) return;

                    try {
                        const response = await fetch('/api/disable-reasons/' + rowId, {
                            method: 'DELETE'
                        });
                        if (!response.ok && response.status !== 204) {
                            throw new Error('Failed to delete disable reason');
                        }
                        if (reasonIdInput.value === rowId) {
                            resetForm();
                        }
                        await loadReasons();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Disable reason deleted from database.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to delete disable reason.',
                            confirmButtonColor: '#8b5cf6'
                        });
                    }
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applySearchFilter);
    }

    function getVisibleRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            return !row.classList.contains('no-data-row') && row.style.display !== 'none';
        });
    }

    function getTableData() {
        const headers = [];
        const data = [];
        if (!table) return { headers: headers, data: data };

        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(function (th, index) {
            if (index < headerCells.length - 1 && th.style.display !== 'none') {
                headers.push(th.textContent.trim());
            }
        });

        getVisibleRows().forEach(function (row) {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(function (cell, index) {
                if (index < cells.length - 1 && cell.style.display !== 'none') {
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
            ws['!cols'] = result.headers.map(function () { return { wch: 28 }; });
            XLSX.utils.book_append_sheet(wb, ws, 'Disable Reasons');
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, 'Disable_Reasons_' + timestamp + '.xlsx');
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
            link.setAttribute('download', 'Disable_Reasons_' + timestamp + '.csv');
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
            const doc = new jsPDF('p', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Disable Reason List', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);
            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: { fontSize: 10, cellPadding: 4 }
            });
            const timestamp = new Date().toISOString().split('T')[0];
            doc.save('Disable_Reasons_' + timestamp + '.pdf');
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
                + '<!DOCTYPE html><html><head><title>Disable Reason List - Print</title><style>'
                + 'body { font-family: Arial, sans-serif; margin: 20px; }'
                + 'h1 { color: #2c3e50; margin-bottom: 10px; }'
                + 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }'
                + 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }'
                + 'th { background-color: #1e293b; color: white; }'
                + '</style></head><body>'
                + '<h1>Disable Reason List</h1>'
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

    loadReasons();
});
