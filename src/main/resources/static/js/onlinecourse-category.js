document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('categoryTable');
    const tableBody = document.getElementById('categoryTableBody');
    const showingInfo = document.querySelector('.onlinecourse-category-page .showing-info');
    const searchInput = document.getElementById('categorySearchInput');
    const categoryForm = document.getElementById('categoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryIdInput = document.getElementById('categoryId');
    const saveBtn = document.getElementById('saveCategoryBtn');
    const entriesSelect = document.getElementById('categoryEntriesSelect');
    const columnBtn = document.getElementById('categoryColumnBtn');
    const columnDropdown = document.getElementById('categoryColumnDropdown');

    let categories = [];
    let currentPage = 1;

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
        categoryForm.reset();
        categoryIdInput.value = '';
        saveBtn.textContent = 'Save';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getFilteredCategories() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!term) return categories.slice();
        return categories.filter(function (item) {
            return String(item.categoryName || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    function getPageSize() {
        return entriesSelect ? parseInt(entriesSelect.value, 10) || 50 : 50;
    }

    function updateShowingInfo(start, end, total) {
        if (!showingInfo) return;
        if (total === 0) {
            showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            return;
        }
        showingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
    }

    function renderPagination(totalFiltered) {
        const pagination = document.querySelector('.onlinecourse-category-page .pagination');
        if (!pagination) return;

        const pageSize = getPageSize();
        const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        pagination.innerHTML = '';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'pagination-btn';
        prev.textContent = '<';
        prev.disabled = currentPage <= 1;
        prev.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderCategories();
            }
        });
        pagination.appendChild(prev);

        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = 'pagination-btn active';
        pageBtn.textContent = String(currentPage);
        pagination.appendChild(pageBtn);

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'pagination-btn';
        next.textContent = '>';
        next.disabled = currentPage >= totalPages;
        next.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderCategories();
            }
        });
        pagination.appendChild(next);
    }

    function renderCategories() {
        const filtered = getFilteredCategories();
        const pageSize = getPageSize();
        const total = filtered.length;
        const startIndex = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        tableBody.innerHTML = '';

        if (!pageItems.length) {
            tableBody.innerHTML = '<tr class="no-data-row"><td colspan="2" class="loading-cell">No categories found</td></tr>';
            updateShowingInfo(0, 0, 0);
            renderPagination(0);
            return;
        }

        pageItems.forEach(function (item) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', String(item.id));
            tr.innerHTML = ''
                + '<td class="category-name">' + escapeHtml(item.categoryName) + '</td>'
                + '<td class="action-cell">' + createActionButtonsHtml() + '</td>';
            tableBody.appendChild(tr);
        });

        const start = startIndex + 1;
        const end = startIndex + pageItems.length;
        updateShowingInfo(start, end, total);
        renderPagination(total);
        applyColumnVisibility();
    }

    async function loadCategories() {
        try {
            const response = await fetch('/api/online-course-categories');
            if (!response.ok) throw new Error('Failed to load categories');
            categories = await response.json();
            currentPage = 1;
            renderCategories();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load categories from database.',
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

    if (categoryForm) {
        categoryForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const categoryName = categoryNameInput.value.trim();
            if (!categoryName) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please enter a category name.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            const editingId = categoryIdInput.value;
            const payload = { categoryName: categoryName };

            try {
                let response;
                if (editingId) {
                    response = await fetch('/api/online-course-categories/' + editingId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch('/api/online-course-categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    throw new Error(await parseErrorMessage(response));
                }

                resetForm();
                await loadCategories();
                Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Updated' : 'Saved',
                    text: editingId ? 'Category updated successfully.' : 'Category saved to database.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save category.',
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
                const id = row.getAttribute('data-id');
                const item = categories.find(function (c) { return String(c.id) === String(id); });
                if (!item) return;
                categoryIdInput.value = String(item.id);
                categoryNameInput.value = item.categoryName || '';
                saveBtn.textContent = 'Update';
                categoryNameInput.focus();
                return;
            }

            if (deleteBtn) {
                const name = row.querySelector('.category-name').textContent.trim();
                const rowId = row.getAttribute('data-id');
                Swal.fire({
                    icon: 'warning',
                    title: 'Delete Category?',
                    text: '"' + name + '" will be deleted from the database.',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                }).then(async function (result) {
                    if (!result.isConfirmed) return;
                    try {
                        const response = await fetch('/api/online-course-categories/' + rowId, {
                            method: 'DELETE'
                        });
                        if (!response.ok) {
                            throw new Error(await parseErrorMessage(response));
                        }
                        if (categoryIdInput.value === rowId) resetForm();
                        await loadCategories();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Category deleted from database.',
                            timer: 1400,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to delete category.',
                            confirmButtonColor: '#8b5cf6'
                        });
                    }
                });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderCategories();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderCategories();
        });
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

    const copyBtn = document.getElementById('categoryCopyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
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

    const excelBtn = document.getElementById('categoryExcelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTableData();
            const wsData = [result.headers].concat(result.data);
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = result.headers.map(function () { return { wch: 24 }; });
            XLSX.utils.book_append_sheet(wb, ws, 'Categories');
            XLSX.writeFile(wb, 'Course_Categories_' + new Date().toISOString().split('T')[0] + '.xlsx');
            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'Excel file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    const csvBtn = document.getElementById('categoryCsvBtn');
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
            link.setAttribute('href', url);
            link.setAttribute('download', 'Course_Categories_' + new Date().toISOString().split('T')[0] + '.csv');
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

    const pdfBtn = document.getElementById('categoryPdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getTableData();
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF('p', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Category List', 40, 40);
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
            doc.save('Course_Categories_' + new Date().toISOString().split('T')[0] + '.pdf');
            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'PDF file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    const printBtn = document.getElementById('categoryPrintBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getTableData();
            let printContent = ''
                + '<!DOCTYPE html><html><head><title>Category List - Print</title><style>'
                + 'body { font-family: Arial, sans-serif; margin: 20px; }'
                + 'h1 { color: #2c3e50; margin-bottom: 10px; }'
                + 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }'
                + 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }'
                + 'th { background: #1e293b; color: #fff; }'
                + '</style></head><body>'
                + '<h1>Category List</h1>'
                + '<p>Generated on: ' + new Date().toLocaleString() + '</p>'
                + '<table><thead><tr>';
            result.headers.forEach(function (h) { printContent += '<th>' + h + '</th>'; });
            printContent += '</tr></thead><tbody>';
            result.data.forEach(function (row) {
                printContent += '<tr>';
                row.forEach(function (cell) { printContent += '<td>' + cell + '</td>'; });
                printContent += '</tr>';
            });
            printContent += '</tbody></table></body></html>';
            const win = window.open('', '_blank');
            win.document.write(printContent);
            win.document.close();
            win.focus();
            win.print();
        });
    }

    function applyColumnVisibility() {
        if (!columnDropdown || !table) return;
        columnDropdown.querySelectorAll('.column-toggle').forEach(function (checkbox) {
            const colIndex = parseInt(checkbox.getAttribute('data-column'), 10);
            const display = checkbox.checked ? '' : 'none';
            table.querySelectorAll('thead th').forEach(function (th, index) {
                if (index === colIndex) th.style.display = display;
            });
            table.querySelectorAll('tbody tr').forEach(function (row) {
                const cells = row.querySelectorAll('td');
                if (cells[colIndex]) cells[colIndex].style.display = display;
            });
        });
    }

    if (columnBtn && columnDropdown) {
        columnBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnDropdown.classList.toggle('active');
        });
        columnDropdown.addEventListener('change', applyColumnVisibility);
        document.addEventListener('click', function (e) {
            if (!columnDropdown.contains(e.target) && e.target !== columnBtn) {
                columnDropdown.classList.remove('active');
            }
        });
    }

    loadCategories();
});
