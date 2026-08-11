document.addEventListener('DOMContentLoaded', function () {
    const typeSelect = document.getElementById('typeSelect');
    const holidayFilterForm = document.getElementById('holidayFilterForm');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const holidayTableWrap = document.getElementById('holidayTableWrap');
    const holidayTableBody = document.getElementById('holidayTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addHolidayBtn = document.getElementById('addHolidayBtn');
    const holidayModal = document.getElementById('holidayModal');
    const holidayForm = document.getElementById('holidayForm');
    const holidayModalTitle = document.getElementById('holidayModalTitle');
    const holidayIdInput = document.getElementById('holidayId');
    const holidayTypeOptions = document.getElementById('holidayTypeOptions');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const descriptionInput = document.getElementById('description');
    const frontSiteToggle = document.getElementById('frontSiteToggle');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let holidays = [];
    let holidayTypes = [];
    let selectedType = '';
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function parseDateToInput(value) {
        if (!value) {
            return '';
        }
        const parts = value.split('/');
        if (parts.length === 3) {
            return parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
        }
        return value;
    }

    function formatDateForApi(value) {
        if (!value) {
            return '';
        }
        const parts = value.split('-');
        if (parts.length === 3) {
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }
        return value;
    }

    function populateTypeSelect() {
        const options = '<option value="">Select</option>' + holidayTypes.map(function (type) {
            return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>';
        }).join('');
        typeSelect.innerHTML = options;
    }

    function renderTypeButtons(selected) {
        holidayTypeOptions.innerHTML = holidayTypes.map(function (type) {
            const activeClass = type === selected ? ' active' : '';
            return '<button type="button" class="holiday-type-btn' + activeClass + '" data-type="' + escapeHtml(type) + '">' + escapeHtml(type) + '</button>';
        }).join('');
    }

    function getSelectedModalType() {
        const activeBtn = holidayTypeOptions.querySelector('.holiday-type-btn.active');
        return activeBtn ? activeBtn.getAttribute('data-type') : '';
    }

    function getFilteredRows() {
        let rows = holidays.slice();
        if (tableFilter) {
            const term = tableFilter.toLowerCase();
            rows = rows.filter(function (row) {
                return [
                    row.dateRange,
                    row.holidayType,
                    row.description,
                    row.createdBy,
                    row.frontSite ? 'yes' : 'no'
                ].some(function (value) {
                    return String(value || '').toLowerCase().includes(term);
                });
            });
        }
        return rows;
    }

    function renderTable() {
        const rows = getFilteredRows();
        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        const startIndex = (currentPage - 1) * pageSize;
        const pageRows = rows.slice(startIndex, startIndex + pageSize);

        if (!total) {
            noRecordBanner.hidden = false;
            holidayTableWrap.hidden = true;
            holidayTableBody.innerHTML = '';
        } else {
            noRecordBanner.hidden = true;
            holidayTableWrap.hidden = false;
            holidayTableBody.innerHTML = pageRows.map(function (row) {
                return '<tr>' +
                    '<td>' + escapeHtml(row.dateRange) + '</td>' +
                    '<td>' + escapeHtml(row.holidayType) + '</td>' +
                    '<td>' + escapeHtml(row.description) + '</td>' +
                    '<td>' + escapeHtml(row.createdBy) + '</td>' +
                    '<td>' + (row.frontSite ? 'Yes' : 'No') + '</td>' +
                    '<td class="action-cell">' +
                        '<button type="button" class="action-btn edit-btn" data-id="' + row.id + '" title="Edit">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
                                '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>' +
                            '</svg>' +
                        '</button>' +
                        '<button type="button" class="action-btn delete-btn" data-id="' + row.id + '" title="Delete">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<polyline points="3 6 5 6 21 6"></polyline>' +
                                '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
                            '</svg>' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        const showingStart = total ? startIndex + 1 : 0;
        const showingEnd = total ? Math.min(startIndex + pageSize, total) : 0;
        showingInfo.textContent = 'Showing ' + showingStart + ' to ' + showingEnd + ' of ' + total + ' entries';
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        if (totalPages <= 1) {
            return;
        }

        function addButton(label, page, disabled, active) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = label;
            btn.className = 'page-btn' + (active ? ' active' : '');
            btn.disabled = !!disabled;
            btn.addEventListener('click', function () {
                currentPage = page;
                renderTable();
            });
            pagination.appendChild(btn);
        }

        addButton('Previous', currentPage - 1, currentPage === 1, false);
        for (let page = 1; page <= totalPages; page += 1) {
            if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                addButton(String(page), page, false, page === currentPage);
            } else if (Math.abs(page - currentPage) === 2) {
                const span = document.createElement('span');
                span.textContent = '...';
                span.className = 'page-ellipsis';
                pagination.appendChild(span);
            }
        }
        addButton('Next', currentPage + 1, currentPage === totalPages, false);
    }

    async function loadHolidayTypes() {
        holidayTypes = await fetchJson('/api/holidays/types');
        populateTypeSelect();
        renderTypeButtons('');
    }

    async function loadHolidays(type) {
        const query = type ? '?type=' + encodeURIComponent(type) : '';
        holidays = await fetchJson('/api/holidays' + query);
        currentPage = 1;
        renderTable();
    }

    function openModal(mode, row) {
        holidayModal.hidden = false;
        document.body.style.overflow = 'hidden';

        if (mode === 'edit' && row) {
            holidayModalTitle.textContent = 'Edit Holiday';
            holidayIdInput.value = row.id;
            renderTypeButtons(row.holidayType);
            fromDateInput.value = parseDateToInput(row.fromDate);
            toDateInput.value = parseDateToInput(row.toDate);
            descriptionInput.value = row.description || '';
            frontSiteToggle.checked = !!row.frontSite;
        } else {
            holidayModalTitle.textContent = 'Add Holiday';
            holidayIdInput.value = '';
            renderTypeButtons(holidayTypes[0] || '');
            fromDateInput.value = '';
            toDateInput.value = '';
            descriptionInput.value = '';
            frontSiteToggle.checked = false;
        }
    }

    function closeModal() {
        holidayModal.hidden = true;
        document.body.style.overflow = '';
        holidayForm.reset();
        renderTypeButtons('');
    }

    async function saveHoliday(event) {
        event.preventDefault();
        const id = holidayIdInput.value;
        const payload = {
            holidayType: getSelectedModalType(),
            fromDate: formatDateForApi(fromDateInput.value),
            toDate: formatDateForApi(toDateInput.value),
            description: descriptionInput.value.trim(),
            frontSite: frontSiteToggle.checked
        };

        if (!payload.holidayType) {
            showError({ message: 'Please select a type.' });
            return;
        }

        try {
            const options = {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            };
            const url = id ? '/api/holidays/' + id : '/api/holidays';
            const result = await fetchJson(url, options);
            closeModal();
            showSuccess(result.message || 'Holiday saved successfully!');
            await loadHolidays(typeSelect.value);
        } catch (error) {
            showError(error);
        }
    }

    async function editHoliday(id) {
        try {
            const row = await fetchJson('/api/holidays/' + id);
            openModal('edit', row);
        } catch (error) {
            showError(error);
        }
    }

    async function deleteHoliday(id) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete holiday?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!confirm.isConfirmed) {
            return;
        }
        try {
            const result = await fetchJson('/api/holidays/' + id, { method: 'DELETE' });
            showSuccess(result.message || 'Holiday deleted successfully!');
            await loadHolidays(typeSelect.value);
        } catch (error) {
            showError(error);
        }
    }

    function exportRows() {
        return getFilteredRows().map(function (row) {
            return {
                Date: row.dateRange,
                Type: row.holidayType,
                Description: row.description,
                'Created By': row.createdBy,
                'Front Site': row.frontSite ? 'Yes' : 'No'
            };
        });
    }

    holidayFilterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadHolidays(typeSelect.value).catch(showError);
    });

    tableSearchInput.addEventListener('input', function () {
        tableFilter = tableSearchInput.value.trim();
        currentPage = 1;
        renderTable();
    });

    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });

    addHolidayBtn.addEventListener('click', function () {
        openModal('add');
    });

    holidayForm.addEventListener('submit', saveHoliday);

    holidayTypeOptions.addEventListener('click', function (event) {
        const btn = event.target.closest('.holiday-type-btn');
        if (!btn) {
            return;
        }
        holidayTypeOptions.querySelectorAll('.holiday-type-btn').forEach(function (item) {
            item.classList.remove('active');
        });
        btn.classList.add('active');
    });

    document.querySelectorAll('[data-close-holiday]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    holidayTableBody.addEventListener('click', function (event) {
        const editBtn = event.target.closest('.edit-btn');
        const deleteBtn = event.target.closest('.delete-btn');
        if (editBtn) {
            editHoliday(editBtn.getAttribute('data-id'));
        } else if (deleteBtn) {
            deleteHoliday(deleteBtn.getAttribute('data-id'));
        }
    });

    copyBtn.addEventListener('click', function () {
        const rows = exportRows();
        const text = rows.map(function (row) {
            return Object.values(row).join('\t');
        }).join('\n');
        navigator.clipboard.writeText(text).then(function () {
            showSuccess('Copied to clipboard.');
        }).catch(function () {
            showError({ message: 'Unable to copy data.' });
        });
    });

    excelBtn.addEventListener('click', function () {
        if (typeof XLSX === 'undefined') {
            showError({ message: 'Excel export is unavailable.' });
            return;
        }
        const rows = exportRows();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Calendar');
        XLSX.writeFile(workbook, 'annual-calendar.xlsx');
    });

    csvBtn.addEventListener('click', function () {
        const rows = exportRows();
        const headers = Object.keys(rows[0] || {});
        const csv = [headers.join(',')].concat(rows.map(function (row) {
            return headers.map(function (header) {
                const value = String(row[header] || '').replace(/"/g, '""');
                return '"' + value + '"';
            }).join(',');
        })).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'annual-calendar.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    });

    pdfBtn.addEventListener('click', function () {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            showError({ message: 'PDF export is unavailable.' });
            return;
        }
        const rows = exportRows();
        const doc = new window.jspdf.jsPDF();
        doc.text('Annual Calendar', 14, 15);
        doc.autoTable({
            startY: 22,
            head: [['Date', 'Type', 'Description', 'Created By', 'Front Site']],
            body: rows.map(function (row) {
                return [row.Date, row.Type, row.Description, row['Created By'], row['Front Site']];
            })
        });
        doc.save('annual-calendar.pdf');
    });

    printBtn.addEventListener('click', function () {
        window.print();
    });

    loadHolidayTypes()
        .then(function () {
            return loadHolidays('');
        })
        .catch(showError);
});
