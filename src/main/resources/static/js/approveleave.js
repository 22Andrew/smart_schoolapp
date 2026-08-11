document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const leaveFilterForm = document.getElementById('leaveFilterForm');
    const leaveListPanel = document.getElementById('leaveListPanel');
    const noRecordBanner = document.getElementById('noRecordBanner');
    const leaveTableWrap = document.getElementById('leaveTableWrap');
    const leaveTableBody = document.getElementById('leaveTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const addLeaveBtn = document.getElementById('addLeaveBtn');
    const leaveModal = document.getElementById('leaveModal');
    const leaveForm = document.getElementById('leaveForm');
    const leaveModalTitle = document.getElementById('leaveModalTitle');
    const leaveIdInput = document.getElementById('leaveId');
    const modalClassSelect = document.getElementById('modalClassSelect');
    const modalSectionSelect = document.getElementById('modalSectionSelect');
    const modalStudentSelect = document.getElementById('modalStudentSelect');
    const applyDateInput = document.getElementById('applyDate');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const leaveReasonInput = document.getElementById('leaveReason');
    const leaveDocumentInput = document.getElementById('leaveDocument');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const copyBtn = document.getElementById('copyBtn');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    let classes = [];
    let leaves = [];
    let modalStudents = [];
    let currentClassId = '';
    let currentSection = '';
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';

    sectionSelect.disabled = true;
    sectionSelect.innerHTML = '<option value="">Select class first</option>';
    modalSectionSelect.disabled = true;
    modalSectionSelect.innerHTML = '<option value="">Select class first</option>';
    modalStudentSelect.disabled = true;
    modalStudentSelect.innerHTML = '<option value="">Select section first</option>';

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

    function setDefaultApplyDate() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        applyDateInput.value = today.getFullYear() + '-' + month + '-' + day;
    }

    function populateClassSelects() {
        const options = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
        classSelect.innerHTML = options;
        modalClassSelect.innerHTML = options;
    }

    function populateSectionSelect(selectEl, classId, disabledMessage) {
        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        if (!sections.length) {
            selectEl.innerHTML = '<option value="">' + escapeHtml(disabledMessage || 'No sections found') + '</option>';
            selectEl.disabled = true;
            return [];
        }
        selectEl.disabled = false;
        selectEl.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
        return sections;
    }

    function populateStudentSelect(students, selectedId) {
        if (!students.length) {
            modalStudentSelect.innerHTML = '<option value="">No students found</option>';
            modalStudentSelect.disabled = true;
            return;
        }
        modalStudentSelect.disabled = false;
        modalStudentSelect.innerHTML = '<option value="">Select</option>' + students.map(function (student) {
            const label = (student.studentName || '') + (student.admissionNo ? ' (' + student.admissionNo + ')' : '');
            return '<option value="' + escapeHtml(student.id) + '"' + (String(student.id) === String(selectedId) ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
        }).join('');
    }

    async function loadModalStudents(classId, section, selectedId) {
        if (!classId || !section) {
            modalStudents = [];
            modalStudentSelect.innerHTML = '<option value="">Select section first</option>';
            modalStudentSelect.disabled = true;
            return;
        }
        modalStudents = await fetchJson('/api/approve-leaves/students?classId=' + encodeURIComponent(classId)
            + '&section=' + encodeURIComponent(section));
        populateStudentSelect(modalStudents, selectedId);
    }

    function getFilteredLeaves() {
        let rows = leaves.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            rows = rows.filter(function (row) {
                const haystack = [
                    row.studentDisplay,
                    row.className,
                    row.section,
                    row.applyDate,
                    row.fromDate,
                    row.toDate,
                    row.statusDisplay,
                    row.approvedByDisplay
                ].join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        return rows;
    }

    function actionButtonsHtml(id) {
        return ''
            + '<button type="button" class="btn-action btn-edit" data-id="' + escapeHtml(String(id)) + '" title="Edit">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
            + '</svg></button>'
            + '<button type="button" class="btn-action btn-delete" data-id="' + escapeHtml(String(id)) + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function renderPagination(total, totalPages) {
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let page = 1; page <= totalPages; page++) {
            html += '<button type="button" class="pagination-btn'
                + (page === currentPage ? ' active' : '')
                + '" data-page="' + page + '">' + page + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (currentPage >= totalPages || total === 0 ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFilteredLeaves();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        leaveListPanel.hidden = false;

        if (!total) {
            noRecordBanner.hidden = false;
            leaveTableWrap.hidden = true;
            leaveTableBody.innerHTML = '';
            if (showingInfo) {
                showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            }
            renderPagination(0, 1);
            return;
        }

        noRecordBanner.hidden = true;
        leaveTableWrap.hidden = false;

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const pageRows = filtered.slice(start, end);

        leaveTableBody.innerHTML = pageRows.map(function (row) {
            return '<tr data-id="' + escapeHtml(String(row.id)) + '">'
                + '<td class="student-name-cell">' + escapeHtml(row.studentDisplay || row.studentName || '') + '</td>'
                + '<td>' + escapeHtml(row.className || '') + '</td>'
                + '<td>' + escapeHtml(row.section || '') + '</td>'
                + '<td>' + escapeHtml(row.applyDate || '') + '</td>'
                + '<td>' + escapeHtml(row.fromDate || '') + '</td>'
                + '<td>' + escapeHtml(row.toDate || '') + '</td>'
                + '<td>' + escapeHtml(row.statusDisplay || row.status || '') + '</td>'
                + '<td>' + escapeHtml(row.approvedByDisplay || '') + '</td>'
                + '<td class="action-cell">' + actionButtonsHtml(row.id) + '</td>'
                + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(total, totalPages);
    }

    async function loadLeaves() {
        if (!currentClassId || !currentSection) {
            return;
        }
        leaves = await fetchJson('/api/approve-leaves?classId=' + encodeURIComponent(currentClassId)
            + '&section=' + encodeURIComponent(currentSection));
        currentPage = 1;
        renderTable();
    }

    function resetFileUpload() {
        leaveDocumentInput.value = '';
        if (fileUploadArea) {
            fileUploadArea.querySelector('.file-upload-text').textContent = 'Drag and drop a file here or click';
        }
    }

    function getSelectedStatus() {
        const checked = document.querySelector('input[name="leaveStatus"]:checked');
        return checked ? checked.value : 'Pending';
    }

    function setSelectedStatus(status) {
        document.querySelectorAll('input[name="leaveStatus"]').forEach(function (radio) {
            radio.checked = radio.value === status;
        });
    }

    async function openModal(mode, row) {
        leaveModalTitle.textContent = mode === 'edit' ? 'Edit Leave' : 'Add Leave';
        populateClassSelects();
        resetFileUpload();

        if (mode === 'edit' && row) {
            leaveIdInput.value = String(row.id);
            modalClassSelect.value = String(row.classId || currentClassId || '');
            populateSectionSelect(modalSectionSelect, modalClassSelect.value, 'No sections found');
            modalSectionSelect.value = row.section || currentSection || '';
            await loadModalStudents(modalClassSelect.value, modalSectionSelect.value, row.studentAdmissionId);
            applyDateInput.value = parseDateToInput(row.applyDate);
            fromDateInput.value = parseDateToInput(row.fromDate);
            toDateInput.value = parseDateToInput(row.toDate);
            leaveReasonInput.value = row.reason || '';
            setSelectedStatus(row.status || 'Pending');
        } else {
            leaveIdInput.value = '';
            modalClassSelect.value = currentClassId || '';
            populateSectionSelect(modalSectionSelect, modalClassSelect.value, 'No sections found');
            modalSectionSelect.value = currentSection || '';
            await loadModalStudents(modalClassSelect.value, modalSectionSelect.value, '');
            setDefaultApplyDate();
            fromDateInput.value = '';
            toDateInput.value = '';
            leaveReasonInput.value = '';
            setSelectedStatus('Pending');
        }

        leaveModal.hidden = false;
    }

    function closeModal() {
        leaveModal.hidden = true;
    }

    function buildPayload() {
        const studentId = modalStudentSelect.value;
        const student = modalStudents.find(function (item) {
            return String(item.id) === String(studentId);
        });
        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(modalClassSelect.value);
        });
        return {
            studentAdmissionId: studentId,
            classId: modalClassSelect.value,
            className: selectedClass ? selectedClass.name : '',
            section: modalSectionSelect.value,
            studentName: student ? student.studentName : '',
            applyDate: formatDateForApi(applyDateInput.value),
            fromDate: formatDateForApi(fromDateInput.value),
            toDate: formatDateForApi(toDateInput.value),
            reason: leaveReasonInput.value.trim(),
            status: getSelectedStatus()
        };
    }

    async function saveLeave(event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.studentAdmissionId || !payload.classId || !payload.section
            || !payload.applyDate || !payload.fromDate || !payload.toDate) {
            showError({ message: 'Please fill all required fields.' });
            return;
        }

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (leaveDocumentInput.files && leaveDocumentInput.files[0]) {
            formData.append('document', leaveDocumentInput.files[0]);
        }

        const isEdit = !!leaveIdInput.value;
        const url = isEdit ? '/api/approve-leaves/' + encodeURIComponent(leaveIdInput.value) : '/api/approve-leaves';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                body: formData
            });
            showSuccess(response.message || 'Leave saved successfully!');
            closeModal();
            await loadLeaves();
        } catch (error) {
            showError(error);
        }
    }

    function exportCsv() {
        const rows = getFilteredLeaves();
        const lines = [['Student Name', 'Class', 'Section', 'Apply Date', 'From Date', 'To Date', 'Status', 'Approve Disapprove By']];
        rows.forEach(function (row) {
            lines.push([
                row.studentDisplay || row.studentName || '',
                row.className || '',
                row.section || '',
                row.applyDate || '',
                row.fromDate || '',
                row.toDate || '',
                row.statusDisplay || row.status || '',
                row.approvedByDisplay || ''
            ].map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'approve-leave-list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    classSelect.addEventListener('change', function () {
        populateSectionSelect(sectionSelect, classSelect.value, 'No sections found');
    });

    modalClassSelect.addEventListener('change', async function () {
        populateSectionSelect(modalSectionSelect, modalClassSelect.value, 'No sections found');
        modalStudentSelect.innerHTML = '<option value="">Select section first</option>';
        modalStudentSelect.disabled = true;
        if (modalSectionSelect.value) {
            await loadModalStudents(modalClassSelect.value, modalSectionSelect.value, '');
        }
    });

    modalSectionSelect.addEventListener('change', async function () {
        await loadModalStudents(modalClassSelect.value, modalSectionSelect.value, '');
    });

    leaveFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        currentClassId = classSelect.value;
        currentSection = sectionSelect.value;
        if (!currentClassId || !currentSection) {
            showError({ message: 'Class and Section are required.' });
            return;
        }
        try {
            await loadLeaves();
        } catch (error) {
            showError(error);
        }
    });

    addLeaveBtn.addEventListener('click', function () {
        openModal('add').catch(showError);
    });

    leaveForm.addEventListener('submit', saveLeave);

    leaveModal.querySelectorAll('[data-close-leave]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    leaveTableBody.addEventListener('click', async function (event) {
        const editBtn = event.target.closest('.btn-edit');
        const deleteBtn = event.target.closest('.btn-delete');
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            const row = leaves.find(function (item) {
                return String(item.id) === String(id);
            });
            if (row) {
                openModal('edit', row).catch(showError);
            }
            return;
        }
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete leave?',
                text: 'This action cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) {
                return;
            }
            try {
                const response = await fetchJson('/api/approve-leaves/' + encodeURIComponent(id), {
                    method: 'DELETE'
                });
                showSuccess(response.message || 'Leave deleted successfully!');
                await loadLeaves();
            } catch (error) {
                showError(error);
            }
        }
    });

    tableSearchInput.addEventListener('input', function () {
        tableFilter = tableSearchInput.value;
        currentPage = 1;
        renderTable();
    });

    entriesSelect.addEventListener('change', function () {
        pageSize = parseInt(entriesSelect.value, 10) || 50;
        currentPage = 1;
        renderTable();
    });

    pagination.addEventListener('click', function (event) {
        const pageBtn = event.target.closest('[data-page]');
        const navBtn = event.target.closest('[data-nav]');
        const filtered = getFilteredLeaves();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (pageBtn) {
            currentPage = parseInt(pageBtn.getAttribute('data-page'), 10);
            renderTable();
        } else if (navBtn) {
            if (navBtn.getAttribute('data-nav') === 'prev' && currentPage > 1) {
                currentPage -= 1;
                renderTable();
            } else if (navBtn.getAttribute('data-nav') === 'next' && currentPage < totalPages) {
                currentPage += 1;
                renderTable();
            }
        }
    });

    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', function () {
            leaveDocumentInput.click();
        });
        fileUploadArea.addEventListener('dragover', function (event) {
            event.preventDefault();
            fileUploadArea.style.borderColor = '#8b5cf6';
        });
        fileUploadArea.addEventListener('dragleave', function (event) {
            event.preventDefault();
            fileUploadArea.style.borderColor = '#475569';
        });
        fileUploadArea.addEventListener('drop', function (event) {
            event.preventDefault();
            fileUploadArea.style.borderColor = '#475569';
            if (event.dataTransfer.files.length > 0) {
                leaveDocumentInput.files = event.dataTransfer.files;
                fileUploadArea.querySelector('.file-upload-text').textContent = 'Selected: ' + event.dataTransfer.files[0].name;
            }
        });
    }

    leaveDocumentInput.addEventListener('change', function () {
        if (leaveDocumentInput.files.length > 0) {
            fileUploadArea.querySelector('.file-upload-text').textContent = 'Selected: ' + leaveDocumentInput.files[0].name;
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const rows = getFilteredLeaves();
            const text = rows.map(function (row) {
                return [
                    row.studentDisplay,
                    row.className,
                    row.section,
                    row.applyDate,
                    row.fromDate,
                    row.toDate,
                    row.statusDisplay,
                    row.approvedByDisplay
                ].join('\t');
            }).join('\n');
            navigator.clipboard.writeText(text).then(function () {
                showSuccess('Copied to clipboard');
            }).catch(function () {
                showError({ message: 'Failed to copy data' });
            });
        });
    }

    if (csvBtn) {
        csvBtn.addEventListener('click', exportCsv);
    }

    if (excelBtn && typeof XLSX !== 'undefined') {
        excelBtn.addEventListener('click', function () {
            const rows = getFilteredLeaves().map(function (row) {
                return {
                    'Student Name': row.studentDisplay || row.studentName || '',
                    Class: row.className || '',
                    Section: row.section || '',
                    'Apply Date': row.applyDate || '',
                    'From Date': row.fromDate || '',
                    'To Date': row.toDate || '',
                    Status: row.statusDisplay || row.status || '',
                    'Approve Disapprove By': row.approvedByDisplay || ''
                };
            });
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Approve Leave');
            XLSX.writeFile(workbook, 'approve-leave-list.xlsx');
        });
    }

    if (pdfBtn && window.jspdf) {
        pdfBtn.addEventListener('click', function () {
            const doc = new window.jspdf.jsPDF('l', 'pt');
            const rows = getFilteredLeaves().map(function (row) {
                return [
                    row.studentDisplay || row.studentName || '',
                    row.className || '',
                    row.section || '',
                    row.applyDate || '',
                    row.fromDate || '',
                    row.toDate || '',
                    row.statusDisplay || row.status || '',
                    row.approvedByDisplay || ''
                ];
            });
            doc.autoTable({
                head: [['Student Name', 'Class', 'Section', 'Apply Date', 'From Date', 'To Date', 'Status', 'Approve Disapprove By']],
                body: rows,
                styles: { fontSize: 8 }
            });
            doc.save('approve-leave-list.pdf');
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    async function loadInitialData() {
        classes = await fetchJson('/api/classes');
        populateClassSelects();
    }

    loadInitialData().catch(showError);
});
