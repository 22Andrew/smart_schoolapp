document.addEventListener('DOMContentLoaded', function () {
    const marksheetForm = document.getElementById('marksheetForm');
    const templateIdInput = document.getElementById('templateId');
    const formTitle = document.getElementById('formPanelTitle');
    const saveBtn = document.getElementById('saveTemplateBtn');
    const searchInput = document.getElementById('listSearchInput');
    const entriesSelect = document.getElementById('listEntriesSelect');
    const tableBody = document.getElementById('marksheetTableBody');
    const showingInfo = document.getElementById('listShowingInfo');
    const pagination = document.getElementById('listPagination');
    const columnBtn = document.getElementById('columnVisibilityBtn');
    const columnDropdown = document.getElementById('columnVisibilityDropdown');
    const viewMarksheetModal = document.getElementById('viewMarksheetModal');
    const viewMarksheetOverlay = document.getElementById('viewMarksheetOverlay');
    const closeViewMarksheetBtn = document.getElementById('closeViewMarksheetBtn');
    const viewMarksheetContent = document.getElementById('viewMarksheetContent');

    const fileKeys = ['headerImage', 'leftLogo', 'leftSign', 'middleSign', 'rightSign', 'backgroundImage'];
    const fileInputs = {};
    const fileObjects = {};
    fileKeys.forEach(function (key) {
        fileInputs[key] = document.getElementById(key + 'File');
        fileObjects[key] = null;
    });

    let templates = [];
    let currentPage = 1;
    let editingId = null;
    const columnVisibility = [true, true, true];

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

    function getFilteredTemplates() {
        const term = (searchInput.value || '').toLowerCase().trim();
        if (!term) {
            return templates.slice();
        }
        return templates.filter(function (item) {
            return String(item.templateName || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderPagination(totalPages) {
        if (!pagination) {
            return;
        }
        let html = '<button type="button" class="pagination-btn" data-page="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="next"' + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderBackgroundCell(url) {
        if (url) {
            return '<img src="' + escapeHtml(url) + '" alt="Background" class="bg-thumb">';
        }
        return '<span class="bg-thumb-placeholder">No image</span>';
    }

    function renderTable() {
        const filtered = getFilteredTemplates();
        const pageSize = Number(entriesSelect.value) || 50;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        const start = filtered.length ? (currentPage - 1) * pageSize : 0;
        const end = Math.min(start + pageSize, filtered.length);
        const pageRows = filtered.slice(start, end);

        showingInfo.textContent = 'Showing ' + (filtered.length ? start + 1 : 0)
            + ' to ' + end + ' of ' + filtered.length + ' entries';
        renderPagination(totalPages);
        applyColumnVisibility();

        if (!pageRows.length) {
            tableBody.innerHTML = '<tr><td colspan="3" class="empty-cell">No marksheet templates found</td></tr>';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td><a href="#" class="template-name-link" data-action="view" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.templateName) + '</a></td>'
                + '<td>' + renderBackgroundCell(item.backgroundImage) + '</td>'
                + '<td><div class="action-btns">'
                + '<button type="button" class="action-btn" data-action="view" data-id="' + escapeHtml(item.id) + '" title="View">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
                + '</button>'
                + '<button type="button" class="action-btn" data-action="edit" data-id="' + escapeHtml(item.id) + '" title="Edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
                + '</button>'
                + '<button type="button" class="action-btn delete-btn" data-action="delete" data-id="' + escapeHtml(item.id) + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                + '</button>'
                + '</div></td>'
                + '</tr>';
        }).join('');
        applyColumnVisibility();
    }

    function applyColumnVisibility() {
        const table = document.getElementById('marksheetTable');
        if (!table) {
            return;
        }
        const headers = table.querySelectorAll('thead th');
        headers.forEach(function (th, index) {
            th.style.display = columnVisibility[index] !== false ? '' : 'none';
        });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            row.querySelectorAll('td').forEach(function (td, index) {
                td.style.display = columnVisibility[index] !== false ? '' : 'none';
            });
        });
    }

    function resetForm() {
        marksheetForm.reset();
        templateIdInput.value = '';
        editingId = null;
        formTitle.textContent = 'Add Marksheet';
        saveBtn.textContent = 'Save';
        fileKeys.forEach(function (key) {
            fileObjects[key] = null;
            const nameEl = document.getElementById(key + 'Name');
            const previewEl = document.getElementById(key + 'Preview');
            if (nameEl) {
                nameEl.textContent = '';
            }
            if (previewEl) {
                previewEl.hidden = true;
                previewEl.removeAttribute('src');
            }
            if (fileInputs[key]) {
                fileInputs[key].value = '';
            }
        });
        document.getElementById('showName').checked = true;
        document.getElementById('showFatherName').checked = true;
        document.getElementById('showMotherName').checked = true;
        document.getElementById('showExamSession').checked = true;
        document.getElementById('showAdmissionNo').checked = true;
        document.getElementById('showDivision').checked = true;
        document.getElementById('showRank').checked = true;
        document.getElementById('showRollNumber').checked = true;
        document.getElementById('showPhoto').checked = true;
        document.getElementById('showClass').checked = true;
        document.getElementById('showSection').checked = true;
        document.getElementById('showDob').checked = true;
        document.getElementById('showRemark').checked = true;
    }

    function populateForm(item) {
        editingId = item.id;
        templateIdInput.value = item.id;
        formTitle.textContent = 'Edit Marksheet';
        saveBtn.textContent = 'Update';
        document.getElementById('templateName').value = item.templateName || '';
        document.getElementById('examNameField').value = item.examName || '';
        document.getElementById('schoolName').value = item.schoolName || '';
        document.getElementById('examCenter').value = item.examCenter || '';
        document.getElementById('bodyText').value = item.bodyText || '';
        document.getElementById('footerText').value = item.footerText || '';
        document.getElementById('printingDate').value = item.printingDate || '';
        document.getElementById('showName').checked = !!item.showName;
        document.getElementById('showFatherName').checked = !!item.showFatherName;
        document.getElementById('showMotherName').checked = !!item.showMotherName;
        document.getElementById('showExamSession').checked = !!item.showExamSession;
        document.getElementById('showAdmissionNo').checked = !!item.showAdmissionNo;
        document.getElementById('showDivision').checked = !!item.showDivision;
        document.getElementById('showRank').checked = !!item.showRank;
        document.getElementById('showRollNumber').checked = !!item.showRollNumber;
        document.getElementById('showPhoto').checked = !!item.showPhoto;
        document.getElementById('showClass').checked = !!item.showClass;
        document.getElementById('showSection').checked = !!item.showSection;
        document.getElementById('showDob').checked = !!item.showDob;
        document.getElementById('showRemark').checked = !!item.showRemark;

        fileKeys.forEach(function (key) {
            const nameEl = document.getElementById(key + 'Name');
            const previewEl = document.getElementById(key + 'Preview');
            fileObjects[key] = null;
            if (fileInputs[key]) {
                fileInputs[key].value = '';
            }
            if (item[key]) {
                if (nameEl) {
                    nameEl.textContent = item[key].split('/').pop();
                }
                if (previewEl) {
                    previewEl.src = item[key];
                    previewEl.hidden = false;
                }
            } else {
                if (nameEl) {
                    nameEl.textContent = '';
                }
                if (previewEl) {
                    previewEl.hidden = true;
                    previewEl.removeAttribute('src');
                }
            }
        });
    }

    function buildPayload() {
        return {
            templateName: document.getElementById('templateName').value.trim(),
            examName: document.getElementById('examNameField').value.trim(),
            schoolName: document.getElementById('schoolName').value.trim(),
            examCenter: document.getElementById('examCenter').value.trim(),
            bodyText: document.getElementById('bodyText').value.trim(),
            footerText: document.getElementById('footerText').value.trim(),
            printingDate: document.getElementById('printingDate').value.trim(),
            showName: document.getElementById('showName').checked,
            showFatherName: document.getElementById('showFatherName').checked,
            showMotherName: document.getElementById('showMotherName').checked,
            showExamSession: document.getElementById('showExamSession').checked,
            showAdmissionNo: document.getElementById('showAdmissionNo').checked,
            showDivision: document.getElementById('showDivision').checked,
            showRank: document.getElementById('showRank').checked,
            showRollNumber: document.getElementById('showRollNumber').checked,
            showPhoto: document.getElementById('showPhoto').checked,
            showClass: document.getElementById('showClass').checked,
            showSection: document.getElementById('showSection').checked,
            showDob: document.getElementById('showDob').checked,
            showRemark: document.getElementById('showRemark').checked
        };
    }

    function buildFormData() {
        const formData = new FormData();
        formData.append('payload', new Blob([JSON.stringify(buildPayload())], { type: 'application/json' }));
        fileKeys.forEach(function (key) {
            if (fileObjects[key]) {
                formData.append(key, fileObjects[key]);
            }
        });
        return formData;
    }

    async function loadTemplates() {
        templates = await fetchJson('/api/marksheets/templates');
        currentPage = 1;
        renderTable();
    }

    function setupFileDropZones() {
        document.querySelectorAll('.file-drop-zone').forEach(function (zone) {
            const target = zone.getAttribute('data-target');
            const input = zone.querySelector('input[type="file"]');
            const nameEl = document.getElementById(target + 'Name');
            const previewEl = document.getElementById(target + 'Preview');

            zone.addEventListener('click', function () {
                input.click();
            });

            zone.addEventListener('dragover', function (event) {
                event.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', function () {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', function (event) {
                event.preventDefault();
                zone.classList.remove('dragover');
                if (event.dataTransfer.files && event.dataTransfer.files[0]) {
                    handleFileSelection(target, event.dataTransfer.files[0], nameEl, previewEl);
                }
            });

            input.addEventListener('change', function () {
                if (input.files && input.files[0]) {
                    handleFileSelection(target, input.files[0], nameEl, previewEl);
                }
            });
        });
    }

    function handleFileSelection(key, file, nameEl, previewEl) {
        fileObjects[key] = file;
        if (nameEl) {
            nameEl.textContent = file.name;
        }
        if (previewEl) {
            previewEl.src = URL.createObjectURL(file);
            previewEl.hidden = false;
        }
    }

    const SAMPLE_STUDENT = {
        studentName: 'REETA SINGH',
        fatherName: 'MANGU SINGH',
        motherName: 'SOMBATI SINGH',
        dateOfBirth: '12-01-2022',
        studentClass: '1',
        section: 'A',
        admissionNo: 'XXXXXX',
        rollNumber: 'XXXXXX',
        rank: '5',
        division: 'SECOND DIVISION',
        examSession: '2021',
        examCenter: 'GOVT GIRLS H S SCHOOL'
    };

    const SAMPLE_MARKS = [
        { subject: 'HINDI [SPECIAL]', maxMarks: 100, minMarks: 33, obtained: 58, remark: '' },
        { subject: 'ENGLISH [GENERAL]', maxMarks: 100, minMarks: 33, obtained: 62, remark: '' },
        { subject: 'PHYSICS', maxMarks: 100, minMarks: 33, obtained: 55, remark: '' },
        { subject: 'CHEMISTRY', maxMarks: 100, minMarks: 33, obtained: 52, remark: '' },
        { subject: 'MATHEMATICS', maxMarks: 100, minMarks: 33, obtained: 57, remark: '' }
    ];

    function renderLogo(url, className) {
        if (url) {
            return '<img src="' + escapeHtml(url) + '" alt="Logo" class="' + className + '">';
        }
        return '<div class="' + className + ' placeholder-logo"><span>SMART SCHOOL</span></div>';
    }

    function renderSign(url) {
        if (url) {
            return '<img src="' + escapeHtml(url) + '" alt="Signature" class="ms-preview-sign-img">';
        }
        return '<div class="ms-preview-sign-box"></div>';
    }

    function detailLine(label, value, visible) {
        if (!visible) {
            return '';
        }
        return '<div class="ms-detail-line"><span class="ms-detail-label">' + escapeHtml(label) + '</span><span class="ms-detail-value">' + escapeHtml(value) + '</span></div>';
    }

    function buildMarksheetPreviewHtml(item) {
        const schoolName = item.schoolName || 'Your School Name Here';
        const examName = item.examName || 'HALF YEARLY EXAM';
        const examYear = item.printingDate || '2021';
        const examCenter = item.examCenter || SAMPLE_STUDENT.examCenter;
        const bodyText = item.bodyText || 'CERTIFICATED THAT';
        const footerText = item.footerText || 'PASS IN SECOND DIVISION';
        const bgStyle = item.backgroundImage ? ' style="background-image:url(\'' + escapeHtml(item.backgroundImage) + '\')"' : '';
        const bgClass = item.backgroundImage ? ' has-bg' : '';
        const classSection = SAMPLE_STUDENT.studentClass + '(' + SAMPLE_STUDENT.section + ')';

        const headerImageHtml = item.headerImage
            ? '<div class="ms-header-banner"><img src="' + escapeHtml(item.headerImage) + '" alt="Header"></div>'
            : '';

        const idCells = [];
        if (item.showAdmissionNo) {
            idCells.push('<div class="ms-id-cell"><span class="ms-id-label">ADMISSION NO</span><span class="ms-id-value">' + escapeHtml(SAMPLE_STUDENT.admissionNo) + '</span></div>');
        }
        if (item.showRollNumber) {
            idCells.push('<div class="ms-id-cell"><span class="ms-id-label">ROLL NUMBER</span><span class="ms-id-value">' + escapeHtml(SAMPLE_STUDENT.rollNumber) + '</span></div>');
        }

        const photoHtml = item.showPhoto
            ? '<div class="ms-photo-box">'
                + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
                + '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>'
                + '<circle cx="12" cy="7" r="4"></circle>'
                + '</svg>'
                + '<span>NO IMAGE AVAILABLE</span>'
                + '</div>'
            : '';

        const detailsHtml = [
            detailLine('MR/MS', SAMPLE_STUDENT.studentName, item.showName),
            detailLine('FATHER / HUSBAND NAME', SAMPLE_STUDENT.fatherName, item.showFatherName),
            detailLine('MOTHER NAME', SAMPLE_STUDENT.motherName, item.showMotherName),
            detailLine('DATE OF BIRTH', SAMPLE_STUDENT.dateOfBirth, item.showDob),
            detailLine('CLASS', classSection, item.showClass || item.showSection),
            detailLine('SCHOOL NAME', schoolName, true),
            detailLine('EXAM CENTER', examCenter, true),
            detailLine('EXAM SESSION', SAMPLE_STUDENT.examSession, item.showExamSession),
            detailLine('RANK', SAMPLE_STUDENT.rank, item.showRank),
            detailLine('DIVISION', SAMPLE_STUDENT.division, item.showDivision)
        ].join('');

        let totalMax = 0;
        let totalObtained = 0;
        const marksRows = SAMPLE_MARKS.map(function (row) {
            totalMax += row.maxMarks;
            totalObtained += row.obtained;
            const remarkCell = item.showRemark ? escapeHtml(row.remark) : '';
            return '<tr>'
                + '<td>' + escapeHtml(row.subject) + '</td>'
                + '<td>' + row.maxMarks + '</td>'
                + '<td>' + row.minMarks + '</td>'
                + '<td>' + row.obtained + '</td>'
                + (item.showRemark ? '<td>' + remarkCell + '</td>' : '')
                + '</tr>';
        }).join('');

        const remarkHeader = item.showRemark ? '<th>REMARKS</th>' : '';
        const grandTotalRow = '<tr class="ms-grand-total-row">'
            + '<td>GRAND TOTAL</td>'
            + '<td>' + totalMax + '</td>'
            + '<td></td>'
            + '<td>' + totalObtained + '</td>'
            + (item.showRemark ? '<td></td>' : '')
            + '</tr>';

        return '<div class="marksheet-preview-sheet' + bgClass + '"' + bgStyle + '>'
            + headerImageHtml
            + '<div class="ms-school-header">'
            + renderLogo(item.leftLogo, 'ms-school-logo')
            + '<div class="ms-school-title"><h2>' + escapeHtml(schoolName) + '</h2></div>'
            + '<div class="ms-school-contact">'
            + '<div>Address: 25 Kings Street, CA</div>'
            + '<div>Phone No.: 89562423934</div>'
            + '<div>Email: yourschool@gmail.com</div>'
            + '<div>Website: www.yoursite.in</div>'
            + '</div>'
            + '</div>'
            + '<div class="ms-exam-title">'
            + '<span class="ms-seal" aria-hidden="true"></span>'
            + '<div class="ms-exam-title-text"><h3>' + escapeHtml(examName) + '</h3><p>' + escapeHtml(examYear) + '</p></div>'
            + '<span class="ms-seal" aria-hidden="true"></span>'
            + '</div>'
            + '<div class="ms-id-bar">' + idCells.join('') + photoHtml + '</div>'
            + '<div class="ms-student-block">'
            + '<p class="ms-cert-text">' + escapeHtml(bodyText) + '</p>'
            + '<div class="ms-details">' + detailsHtml + '</div>'
            + '</div>'
            + '<table class="ms-marks-table">'
            + '<thead><tr>'
            + '<th>SUBJECTS</th><th>MAX MARKS</th><th>MIN MARKS</th><th>MARKS OBTAINED</th>' + remarkHeader
            + '</tr></thead>'
            + '<tbody>' + marksRows + grandTotalRow + '</tbody>'
            + '</table>'
            + '<div class="ms-result-summary">'
            + '<div>GRAND TOTAL IN WORDS: TWO HUNDRED EIGHTY FOUR</div>'
            + '<div>RESULT: ' + escapeHtml(footerText) + '</div>'
            + '</div>'
            + '<div class="ms-signatures">'
            + renderSign(item.leftSign)
            + renderSign(item.middleSign)
            + renderSign(item.rightSign)
            + '</div>'
            + '</div>';
    }

    function openViewMarksheetModal(item) {
        viewMarksheetContent.innerHTML = buildMarksheetPreviewHtml(item);
        viewMarksheetModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeViewMarksheetModal() {
        viewMarksheetModal.hidden = true;
        viewMarksheetContent.innerHTML = '';
        document.body.style.overflow = '';
    }

    async function handleDelete(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete template?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) {
            return;
        }
        await fetchJson('/api/marksheets/templates/' + id, { method: 'DELETE' });
        showSuccess('Marksheet template deleted successfully!');
        if (String(editingId) === String(id)) {
            resetForm();
        }
        await loadTemplates();
    }

    marksheetForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.templateName) {
            showError({ message: 'Template name is required.' });
            return;
        }

        const url = editingId
            ? '/api/marksheets/templates/' + editingId
            : '/api/marksheets/templates';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                body: buildFormData()
            });
            showSuccess(response.message || 'Marksheet template saved successfully!');
            resetForm();
            await loadTemplates();
        } catch (error) {
            showError(error);
        }
    });

    tableBody.addEventListener('click', async function (event) {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) {
            return;
        }
        event.preventDefault();
        const action = actionEl.getAttribute('data-action');
        const id = actionEl.getAttribute('data-id');
        const item = templates.find(function (row) {
            return String(row.id) === String(id);
        });
        if (!item) {
            return;
        }

        if (action === 'view') {
            openViewMarksheetModal(item);
        } else if (action === 'edit') {
            populateForm(item);
            document.querySelector('.marksheet-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'delete') {
            try {
                await handleDelete(id);
            } catch (error) {
                showError(error);
            }
        }
    });

    searchInput.addEventListener('input', function () {
        currentPage = 1;
        renderTable();
    });

    entriesSelect.addEventListener('change', function () {
        currentPage = 1;
        renderTable();
    });

    pagination.addEventListener('click', function (event) {
        const btn = event.target.closest('.pagination-btn');
        if (!btn || btn.disabled) {
            return;
        }
        const page = btn.getAttribute('data-page');
        const filtered = getFilteredTemplates();
        const pageSize = Number(entriesSelect.value) || 50;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (page === 'prev') {
            currentPage = Math.max(1, currentPage - 1);
        } else if (page === 'next') {
            currentPage = Math.min(totalPages, currentPage + 1);
        } else {
            currentPage = Number(page);
        }
        renderTable();
    });

    columnBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        columnDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function () {
        columnDropdown.classList.remove('open');
    });

    columnDropdown.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.querySelectorAll('.column-toggle').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            const index = Number(checkbox.getAttribute('data-column'));
            columnVisibility[index] = checkbox.checked;
            applyColumnVisibility();
        });
    });

    document.getElementById('copyBtn').addEventListener('click', function () {
        const rows = getFilteredTemplates().map(function (item) {
            return [item.templateName, item.backgroundImage || ''].join('\t');
        });
        navigator.clipboard.writeText(['Certificate Name\tBackground Image'].concat(rows).join('\n'))
            .then(function () { showSuccess('Copied to clipboard'); })
            .catch(function () { showError({ message: 'Copy failed' }); });
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        window.print();
    });

    closeViewMarksheetBtn.addEventListener('click', closeViewMarksheetModal);
    viewMarksheetOverlay.addEventListener('click', closeViewMarksheetModal);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !viewMarksheetModal.hidden) {
            closeViewMarksheetModal();
        }
    });

    setupFileDropZones();
    loadTemplates().catch(showError);
});
