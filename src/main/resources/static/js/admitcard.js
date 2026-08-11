document.addEventListener('DOMContentLoaded', function () {
    const admitCardForm = document.getElementById('admitCardForm');
    const templateIdInput = document.getElementById('templateId');
    const formTitle = document.getElementById('formPanelTitle');
    const saveBtn = document.getElementById('saveTemplateBtn');
    const searchInput = document.getElementById('listSearchInput');
    const entriesSelect = document.getElementById('listEntriesSelect');
    const tableBody = document.getElementById('admitCardTableBody');
    const showingInfo = document.getElementById('listShowingInfo');
    const pagination = document.getElementById('listPagination');
    const columnBtn = document.getElementById('columnVisibilityBtn');
    const columnDropdown = document.getElementById('columnVisibilityDropdown');
    const viewAdmitCardModal = document.getElementById('viewAdmitCardModal');
    const viewAdmitCardOverlay = document.getElementById('viewAdmitCardOverlay');
    const closeViewAdmitCardBtn = document.getElementById('closeViewAdmitCardBtn');
    const viewAdmitCardContent = document.getElementById('viewAdmitCardContent');

    const fileInputs = {
        leftLogo: document.getElementById('leftLogoFile'),
        rightLogo: document.getElementById('rightLogoFile'),
        signImage: document.getElementById('signImageFile'),
        backgroundImage: document.getElementById('backgroundImageFile')
    };

    let templates = [];
    let currentPage = 1;
    let editingId = null;
    const columnVisibility = [true, true, true, true];
    const fileObjects = {
        leftLogo: null,
        rightLogo: null,
        signImage: null,
        backgroundImage: null
    };

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
            tableBody.innerHTML = '<tr><td colspan="4" class="empty-cell">No admit card templates found</td></tr>';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td><a href="#" class="template-name-link" data-action="view" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.templateName) + '</a></td>'
                + '<td>' + renderBackgroundCell(item.backgroundImage) + '</td>'
                + '<td class="col-active"><input type="radio" name="activeTemplate" class="active-radio" data-id="' + escapeHtml(item.id) + '"' + (item.defaultTemplate ? ' checked' : '') + ' aria-label="Set active template"></td>'
                + '<td><div class="action-btns">'
                + '<button type="button" class="action-btn" data-action="view" data-id="' + escapeHtml(item.id) + '" title="View">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>'
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
        const table = document.getElementById('admitCardTable');
        if (!table) {
            return;
        }
        const headers = table.querySelectorAll('thead th');
        headers.forEach(function (th, index) {
            const visible = columnVisibility[index] !== false;
            th.style.display = visible ? '' : 'none';
        });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const cells = row.querySelectorAll('td');
            cells.forEach(function (td, index) {
                const visible = columnVisibility[index] !== false;
                td.style.display = visible ? '' : 'none';
            });
        });
    }

    function resetForm() {
        admitCardForm.reset();
        templateIdInput.value = '';
        editingId = null;
        formTitle.textContent = 'Add Admit Card';
        saveBtn.textContent = 'Save';
        Object.keys(fileObjects).forEach(function (key) {
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
        document.getElementById('showMotherName').checked = false;
        document.getElementById('showDob').checked = true;
        document.getElementById('showAdmissionNo').checked = true;
        document.getElementById('showRollNumber').checked = true;
        document.getElementById('showAddress').checked = false;
        document.getElementById('showGender').checked = true;
        document.getElementById('showPhoto').checked = true;
        document.getElementById('showClass').checked = true;
        document.getElementById('showSection').checked = true;
    }

    function populateForm(item) {
        editingId = item.id;
        templateIdInput.value = item.id;
        formTitle.textContent = 'Edit Admit Card';
        saveBtn.textContent = 'Update';
        document.getElementById('templateName').value = item.templateName || '';
        document.getElementById('heading').value = item.heading || '';
        document.getElementById('title').value = item.title || '';
        document.getElementById('examNameField').value = item.examName || '';
        document.getElementById('schoolName').value = item.schoolName || '';
        document.getElementById('examCenter').value = item.examCenter || '';
        document.getElementById('footerText').value = item.footerText || '';
        document.getElementById('showName').checked = !!item.showName;
        document.getElementById('showFatherName').checked = !!item.showFatherName;
        document.getElementById('showMotherName').checked = !!item.showMotherName;
        document.getElementById('showDob').checked = !!item.showDob;
        document.getElementById('showAdmissionNo').checked = !!item.showAdmissionNo;
        document.getElementById('showRollNumber').checked = !!item.showRollNumber;
        document.getElementById('showAddress').checked = !!item.showAddress;
        document.getElementById('showGender').checked = !!item.showGender;
        document.getElementById('showPhoto').checked = !!item.showPhoto;
        document.getElementById('showClass').checked = !!item.showClass;
        document.getElementById('showSection').checked = !!item.showSection;

        ['leftLogo', 'rightLogo', 'signImage', 'backgroundImage'].forEach(function (key) {
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
            heading: document.getElementById('heading').value.trim(),
            title: document.getElementById('title').value.trim(),
            examName: document.getElementById('examNameField').value.trim(),
            schoolName: document.getElementById('schoolName').value.trim(),
            examCenter: document.getElementById('examCenter').value.trim(),
            footerText: document.getElementById('footerText').value.trim(),
            showName: document.getElementById('showName').checked,
            showFatherName: document.getElementById('showFatherName').checked,
            showMotherName: document.getElementById('showMotherName').checked,
            showDob: document.getElementById('showDob').checked,
            showAdmissionNo: document.getElementById('showAdmissionNo').checked,
            showRollNumber: document.getElementById('showRollNumber').checked,
            showAddress: document.getElementById('showAddress').checked,
            showGender: document.getElementById('showGender').checked,
            showPhoto: document.getElementById('showPhoto').checked,
            showClass: document.getElementById('showClass').checked,
            showSection: document.getElementById('showSection').checked,
            defaultTemplate: false
        };
    }

    function buildFormData() {
        const formData = new FormData();
        formData.append('payload', new Blob([JSON.stringify(buildPayload())], { type: 'application/json' }));
        Object.keys(fileObjects).forEach(function (key) {
            if (fileObjects[key]) {
                formData.append(key, fileObjects[key]);
            }
        });
        return formData;
    }

    async function loadTemplates() {
        templates = await fetchJson('/api/admit-cards/templates');
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
        rollNumber: '161066',
        studentName: 'EDWARD THOMAS',
        dateOfBirth: '8/10/2002',
        fatherName: 'OLIVIER THOMAS',
        motherName: 'CAROLINE THOMAS',
        admissionNo: '18S168375',
        studentClass: '1',
        section: 'A',
        gender: 'MALE',
        address: '123 MAIN STREET',
        schoolName: 'MOUNT CARMEL SCHOOL',
        examCenter: 'TEST DMIT CARD2'
    };

    const SAMPLE_SCHEDULE = [
        { dateTime: '03-Jun-2026 2 P.M.-5 P.M.', code: '210', subject: 'MATHEMATICS', obtained: 'TH' },
        { dateTime: '05-Jun-2026 2 P.M.-5 P.M.', code: '110', subject: 'SCEINCE', obtained: 'TH' },
        { dateTime: '07-Jun-2026 2 P.M.-5 P.M.', code: '111', subject: 'ENGLISH', obtained: 'TH' },
        { dateTime: '09-Jun-2026 2 P.M.-5 P.M.', code: '112', subject: 'SOCIAL SCIENCE', obtained: 'TH' }
    ];

    function renderLogo(url) {
        if (url) {
            return '<img src="' + escapeHtml(url) + '" alt="Logo" class="preview-logo">';
        }
        return '<div class="preview-logo-placeholder" aria-hidden="true"></div>';
    }

    function renderInfoItem(label, value, visible) {
        if (!visible) {
            return '';
        }
        return '<div class="preview-info-item"><span class="label">' + escapeHtml(label) + ' :</span><span class="value">' + escapeHtml(value) + '</span></div>';
    }

    function buildAdmitCardPreviewHtml(item) {
        const heading = item.heading || 'BOARD OF SECONDARY EDUCATION, MADHYA PRADESH, BHOPAL';
        const title = item.title || 'HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION (10+2) 2026';
        const examLine = item.examName || 'May-June 2026 Examinations';
        const schoolName = item.schoolName || SAMPLE_STUDENT.schoolName;
        const examCenter = item.examCenter || SAMPLE_STUDENT.examCenter;
        const bgStyle = item.backgroundImage ? ' style="background-image:url(\'' + escapeHtml(item.backgroundImage) + '\')"' : '';
        const bgClass = item.backgroundImage ? ' has-bg' : '';

        const leftFields = [
            renderInfoItem('Roll Number', SAMPLE_STUDENT.rollNumber, item.showRollNumber),
            renderInfoItem('Candidates Name', SAMPLE_STUDENT.studentName, item.showName),
            renderInfoItem('Date Of Birth', SAMPLE_STUDENT.dateOfBirth, item.showDob),
            renderInfoItem('Father\'s Name', SAMPLE_STUDENT.fatherName, item.showFatherName),
            renderInfoItem('School Name', schoolName, true),
            renderInfoItem('Exam Center', examCenter, true),
            renderInfoItem('Address', SAMPLE_STUDENT.address, item.showAddress)
        ].join('');

        const rightFields = [
            renderInfoItem('Admission No', SAMPLE_STUDENT.admissionNo, item.showAdmissionNo),
            renderInfoItem('Class', SAMPLE_STUDENT.studentClass, item.showClass),
            renderInfoItem('Section', SAMPLE_STUDENT.section, item.showSection),
            renderInfoItem('Gender', SAMPLE_STUDENT.gender, item.showGender),
            renderInfoItem('Mother\'s Name', SAMPLE_STUDENT.motherName, item.showMotherName)
        ].join('');

        const photoHtml = item.showPhoto
            ? '<div class="preview-photo-box">'
                + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
                + '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>'
                + '<circle cx="12" cy="7" r="4"></circle>'
                + '</svg>'
                + '<span>NO IMAGE AVAILABLE</span>'
                + '</div>'
            : '';

        const scheduleRows = SAMPLE_SCHEDULE.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.dateTime) + '</td>'
                + '<td>' + escapeHtml(row.code) + '</td>'
                + '<td>' + escapeHtml(row.subject) + '</td>'
                + '<td>' + escapeHtml(row.obtained) + '</td>'
                + '</tr>';
        }).join('');

        const signHtml = item.signImage
            ? '<img src="' + escapeHtml(item.signImage) + '" alt="Signature" class="preview-sign">'
            : '<div class="preview-sign-placeholder"></div>';

        const footerText = item.footerText
            ? '<div class="preview-footer-text">' + escapeHtml(item.footerText) + '</div>'
            : '';

        return '<div class="admitcard-preview-sheet' + bgClass + '"' + bgStyle + '>'
            + '<div class="preview-top-bar">'
            + renderLogo(item.leftLogo)
            + '<div class="preview-heading-block">'
            + '<h4>' + escapeHtml(heading) + '</h4>'
            + '<h5>' + escapeHtml(title) + '</h5>'
            + '<p>' + escapeHtml(examLine) + '</p>'
            + '</div>'
            + renderLogo(item.rightLogo)
            + '</div>'
            + '<div class="preview-student-section">'
            + '<div class="preview-info-grid">'
            + leftFields
            + rightFields
            + '</div>'
            + photoHtml
            + '</div>'
            + '<table class="preview-schedule-table">'
            + '<thead><tr>'
            + '<th>Theory Exam Date &amp; Time</th>'
            + '<th>Paper Code</th>'
            + '<th>Subject</th>'
            + '<th>Obtained By Student</th>'
            + '</tr></thead>'
            + '<tbody>' + scheduleRows + '</tbody>'
            + '</table>'
            + '<div class="preview-footer">' + signHtml + '</div>'
            + footerText
            + '</div>';
    }

    function openViewAdmitCardModal(item) {
        viewAdmitCardContent.innerHTML = buildAdmitCardPreviewHtml(item);
        viewAdmitCardModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeViewAdmitCardModal() {
        viewAdmitCardModal.hidden = true;
        viewAdmitCardContent.innerHTML = '';
        document.body.style.overflow = '';
    }

    function showTemplateDetails(item) {
        openViewAdmitCardModal(item);
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
        await fetchJson('/api/admit-cards/templates/' + id, { method: 'DELETE' });
        showSuccess('Admit card template deleted successfully!');
        if (String(editingId) === String(id)) {
            resetForm();
        }
        await loadTemplates();
    }

    async function handleSetDefault(id) {
        await fetchJson('/api/admit-cards/templates/' + id + '/default', { method: 'PUT' });
        await loadTemplates();
    }

    admitCardForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload.templateName) {
            showError({ message: 'Template name is required.' });
            return;
        }

        const url = editingId
            ? '/api/admit-cards/templates/' + editingId
            : '/api/admit-cards/templates';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                body: buildFormData()
            });
            showSuccess(response.message || 'Admit card template saved successfully!');
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
            showTemplateDetails(item);
        } else if (action === 'edit') {
            populateForm(item);
            document.querySelector('.admitcard-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'delete') {
            try {
                await handleDelete(id);
            } catch (error) {
                showError(error);
            }
        }
    });

    tableBody.addEventListener('change', async function (event) {
        const radio = event.target.closest('.active-radio');
        if (!radio) {
            return;
        }
        try {
            await handleSetDefault(radio.getAttribute('data-id'));
        } catch (error) {
            showError(error);
            renderTable();
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
            return [item.templateName, item.backgroundImage || '', item.defaultTemplate ? 'Yes' : 'No'].join('\t');
        });
        navigator.clipboard.writeText(['Certificate Name\tBackground Image\tActive'].concat(rows).join('\n'))
            .then(function () { showSuccess('Copied to clipboard'); })
            .catch(function () { showError({ message: 'Copy failed' }); });
    });

    document.getElementById('printBtn').addEventListener('click', function () {
        window.print();
    });

    closeViewAdmitCardBtn.addEventListener('click', closeViewAdmitCardModal);
    viewAdmitCardOverlay.addEventListener('click', closeViewAdmitCardModal);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !viewAdmitCardModal.hidden) {
            closeViewAdmitCardModal();
        }
    });

    setupFileDropZones();
    loadTemplates().catch(showError);
});
