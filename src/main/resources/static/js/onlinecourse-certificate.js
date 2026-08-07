document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('certSearchInput');
    const entriesSelect = document.getElementById('certEntriesSelect');
    const tableBody = document.getElementById('certTableBody');
    const showingStart = document.getElementById('certShowingStart');
    const showingEnd = document.getElementById('certShowingEnd');
    const totalEntries = document.getElementById('certTotalEntries');
    const pagination = document.getElementById('certPagination');
    const addBtn = document.getElementById('addCertificateBtn');
    const modal = document.getElementById('certificateModal');
    const overlay = document.getElementById('certificateOverlay');
    const closeBtn = document.getElementById('closeCertificateBtn');
    const form = document.getElementById('certificateForm');
    const modalTitle = document.getElementById('certificateModalTitle');
    const idInput = document.getElementById('certificateId');
    const nameInput = document.getElementById('certificateName');
    const textInput = document.getElementById('certificateText');
    const saveBtn = document.getElementById('saveCertificateBtn');
    const bgDropzone = document.getElementById('certBgDropzone');
    const bgImageInput = document.getElementById('certBgImageInput');
    const bgPlaceholder = document.getElementById('certBgPlaceholder');
    const bgImageThumb = document.getElementById('certBgImageThumb');
    const placeholderTags = document.getElementById('placeholderTags');
    const designFont = document.getElementById('designFont');
    const designFontSize = document.getElementById('designFontSize');
    const designTextColor = document.getElementById('designTextColor');
    const designTitleColor = document.getElementById('designTitleColor');
    const designLayout = document.getElementById('designLayout');
    const saveDesignBtn = document.getElementById('saveDesignBtn');

    let templates = [];
    let currentPage = 1;
    let hiddenCols = { name: false, text: false, action: false };
    let backgroundFile = null;
    let existingBackgroundUrl = '';

    const DEFAULT_TEXT = 'This is to certify that Mr./Ms. [student_name] has successfully completed the [course_name] under [assign_teacher]. The course ran from [start_date] to [completion_date] for Class [class_name], Section [section_name]. Issued on [current_date].';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getFiltered() {
        const term = (searchInput.value || '').toLowerCase().trim();
        if (!term) return templates.slice();
        return templates.filter(function (item) {
            return String(item.certificateName || '').toLowerCase().indexOf(term) !== -1
                || String(item.certificateText || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    function renderPagination(totalPages) {
        if (!pagination) return;
        let html = '<button type="button" class="pagination-btn" data-page="prev"' + (currentPage <= 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-page="next"' + (currentPage >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        pagination.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFiltered();
        const pageSize = Number(entriesSelect.value) || 50;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        const start = filtered.length ? (currentPage - 1) * pageSize : 0;
        const end = Math.min(start + pageSize, filtered.length);
        const pageRows = filtered.slice(start, end);

        showingStart.textContent = filtered.length ? String(start + 1) : '0';
        showingEnd.textContent = String(end);
        totalEntries.textContent = String(filtered.length);
        renderPagination(totalPages);

        document.querySelectorAll('#certTable th[data-col], #certTable td[data-col]').forEach(function () {});
        applyColumnVisibility();

        if (!pageRows.length) {
            tableBody.innerHTML = '<tr><td colspan="3" class="empty-cell">No certificate templates found</td></tr>';
            return;
        }

        tableBody.innerHTML = pageRows.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '">'
                + '<td data-col="name" class="cert-name">' + escapeHtml(item.certificateName) + '</td>'
                + '<td data-col="text" class="cert-text">' + escapeHtml(item.certificateText) + '</td>'
                + '<td data-col="action"><div class="action-btns">'
                + '<button type="button" class="action-btn" data-action="edit" data-id="' + escapeHtml(item.id) + '" title="Edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
                + '</button>'
                + '<button type="button" class="action-btn" data-action="delete" data-id="' + escapeHtml(item.id) + '" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                + '</button>'
                + '</div></td></tr>';
        }).join('');
        applyColumnVisibility();
    }

    function applyColumnVisibility() {
        Object.keys(hiddenCols).forEach(function (col) {
            document.querySelectorAll('#certTable [data-col="' + col + '"]').forEach(function (el) {
                el.style.display = hiddenCols[col] ? 'none' : '';
            });
        });
    }

    async function loadTemplates() {
        const response = await fetch('/api/online-course-certificates');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load certificate templates');
        }
        templates = await response.json();
        currentPage = 1;
        renderTable();
    }

    function setBackgroundPreview(file, url) {
        backgroundFile = file || null;
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            bgImageThumb.src = objectUrl;
            bgImageThumb.hidden = false;
            bgPlaceholder.hidden = true;
            existingBackgroundUrl = '';
            return;
        }
        if (url) {
            existingBackgroundUrl = url;
            bgImageThumb.src = url;
            bgImageThumb.hidden = false;
            bgPlaceholder.hidden = true;
            return;
        }
        existingBackgroundUrl = '';
        backgroundFile = null;
        bgImageThumb.hidden = true;
        bgImageThumb.removeAttribute('src');
        bgPlaceholder.hidden = false;
        if (bgImageInput) bgImageInput.value = '';
    }

    function setBackgroundFile(file) {
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid file',
                text: 'Please choose an image file.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        setBackgroundPreview(file, null);
    }

    function resetAccordions() {
        document.querySelectorAll('.cert-accordion').forEach(function (section) {
            const isData = section.id === 'certDataSection';
            section.classList.toggle('open', isData);
            const toggle = section.querySelector('.accordion-toggle');
            if (toggle) toggle.textContent = isData ? '−' : '+';
        });
    }

    function fillDesignFields(item) {
        designFont.value = (item && item.designFont) || 'Arial';
        designFontSize.value = (item && item.designFontSize) || '16';
        designTextColor.value = (item && item.designTextColor) || '#000000';
        designTitleColor.value = (item && item.designTitleColor) || '#000000';
        designLayout.value = (item && item.designLayout) || 'Portrait';
    }

    function openModal(editItem) {
        resetAccordions();
        if (editItem) {
            modalTitle.textContent = 'Certificate Template Data';
            idInput.value = editItem.id;
            nameInput.value = editItem.certificateName || '';
            textInput.value = editItem.certificateText || '';
            setBackgroundPreview(null, editItem.backgroundImageUrl || '');
            fillDesignFields(editItem);
        } else {
            modalTitle.textContent = 'Certificate Template Data';
            idInput.value = '';
            nameInput.value = '';
            textInput.value = DEFAULT_TEXT;
            setBackgroundPreview(null, '');
            fillDesignFields(null);
        }
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        nameInput.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        form.reset();
        idInput.value = '';
        setBackgroundPreview(null, '');
        document.body.style.overflow = '';
    }

    async function saveTemplate() {
        const payload = {
            certificateName: (nameInput.value || '').trim(),
            certificateText: (textInput.value || '').trim(),
            designFont: (designFont.value || 'Arial').trim(),
            designFontSize: String(designFontSize.value || '16').trim(),
            designTextColor: designTextColor.value || '#000000',
            designTitleColor: designTitleColor.value || '#000000',
            designLayout: (designLayout.value || 'Portrait').trim()
        };
        if (!payload.certificateName) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Certificate Name is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        if (!payload.certificateText) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Body Text is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const id = idInput.value;
        if (!id && !backgroundFile) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Background Image is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (backgroundFile) {
            formData.append('backgroundImage', backgroundFile);
        }

        saveBtn.disabled = true;
        try {
            const response = await fetch(id
                ? '/api/online-course-certificates/' + encodeURIComponent(id)
                : '/api/online-course-certificates', {
                method: id ? 'PUT' : 'POST',
                body: formData
            });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to save certificate template');
            }
            closeModal();
            await loadTemplates();
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function deleteTemplate(id) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete template?',
            text: 'This certificate template will be permanently deleted.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626'
        });
        if (!confirm.isConfirmed) return;

        const response = await fetch('/api/online-course-certificates/' + encodeURIComponent(id), { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete certificate template');
        }
        await loadTemplates();
        Swal.fire({
            icon: 'success',
            title: 'Deleted',
            timer: 1200,
            showConfirmButton: false
        });
    }

    function exportRows() {
        return getFiltered().map(function (item) {
            return [item.certificateName || '', item.certificateText || ''];
        });
    }

    if (addBtn) addBtn.addEventListener('click', function () { openModal(null); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (saveBtn) saveBtn.addEventListener('click', saveTemplate);
    if (saveDesignBtn) saveDesignBtn.addEventListener('click', saveTemplate);
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveTemplate();
        });
    }

    document.querySelectorAll('.cert-accordion-header').forEach(function (header) {
        header.addEventListener('click', function (e) {
            if (e.target.closest('.help-icon')) return;
            const section = document.getElementById(header.getAttribute('data-accordion'));
            if (!section) return;
            const open = section.classList.toggle('open');
            const toggle = header.querySelector('.accordion-toggle');
            if (toggle) toggle.textContent = open ? '−' : '+';
        });
    });

    if (placeholderTags) {
        placeholderTags.addEventListener('click', function (e) {
            const tagBtn = e.target.closest('.tag-btn');
            if (!tagBtn) return;
            const tag = tagBtn.getAttribute('data-tag') || '';
            const start = textInput.selectionStart || textInput.value.length;
            const end = textInput.selectionEnd || textInput.value.length;
            const value = textInput.value || '';
            textInput.value = value.slice(0, start) + tag + value.slice(end);
            textInput.focus();
            const caret = start + tag.length;
            textInput.setSelectionRange(caret, caret);
        });
    }

    if (bgDropzone) {
        bgDropzone.addEventListener('click', function () { bgImageInput.click(); });
        bgDropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            bgDropzone.classList.add('dragover');
        });
        bgDropzone.addEventListener('dragleave', function () {
            bgDropzone.classList.remove('dragover');
        });
        bgDropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            bgDropzone.classList.remove('dragover');
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            setBackgroundFile(file);
        });
    }
    if (bgImageInput) {
        bgImageInput.addEventListener('change', function () {
            setBackgroundFile(bgImageInput.files && bgImageInput.files[0]);
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTable();
        });
    }
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            currentPage = 1;
            renderTable();
        });
    }
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-page]');
            if (!btn || btn.disabled) return;
            const value = btn.getAttribute('data-page');
            const filtered = getFiltered();
            const pageSize = Number(entriesSelect.value) || 50;
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
            if (value === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (value === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else currentPage = Number(value) || 1;
            renderTable();
        });
    }
    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const id = btn.getAttribute('data-id');
            const item = templates.find(function (row) { return String(row.id) === String(id); });
            if (btn.getAttribute('data-action') === 'edit') {
                openModal(item);
            } else if (btn.getAttribute('data-action') === 'delete') {
                deleteTemplate(id).catch(function (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message,
                        confirmButtonColor: '#8b5cf6'
                    });
                });
            }
        });
    }

    document.getElementById('certCopyBtn').addEventListener('click', function () {
        const text = exportRows().map(function (row) { return row.join('\t'); }).join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
        });
    });
    document.getElementById('certExcelBtn').addEventListener('click', function () {
        const ws = XLSX.utils.aoa_to_sheet([['Certificate Name', 'Certificate Text']].concat(exportRows()));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Certificates');
        XLSX.writeFile(wb, 'certificate-templates.xlsx');
    });
    document.getElementById('certCsvBtn').addEventListener('click', function () {
        const rows = [['Certificate Name', 'Certificate Text']].concat(exportRows());
        const csv = rows.map(function (row) {
            return row.map(function (cell) {
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'certificate-templates.csv';
        link.click();
    });
    document.getElementById('certPdfBtn').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Certificate Name', 'Certificate Text']],
            body: exportRows(),
            styles: { fontSize: 8 }
        });
        doc.save('certificate-templates.pdf');
    });
    document.getElementById('certPrintBtn').addEventListener('click', function () {
        window.print();
    });
    document.getElementById('certColumnBtn').addEventListener('click', async function () {
        const { value: cols } = await Swal.fire({
            title: 'Column Visibility',
            html: '<label><input type="checkbox" id="colName" ' + (!hiddenCols.name ? 'checked' : '') + '> Certificate Name</label><br>'
                + '<label><input type="checkbox" id="colText" ' + (!hiddenCols.text ? 'checked' : '') + '> Certificate Text</label><br>'
                + '<label><input type="checkbox" id="colAction" ' + (!hiddenCols.action ? 'checked' : '') + '> Action</label>',
            confirmButtonText: 'Apply',
            confirmButtonColor: '#8b5cf6',
            preConfirm: function () {
                return {
                    name: !document.getElementById('colName').checked,
                    text: !document.getElementById('colText').checked,
                    action: !document.getElementById('colAction').checked
                };
            }
        });
        if (cols) {
            hiddenCols = cols;
            applyColumnVisibility();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    loadTemplates().catch(function (error) {
        tableBody.innerHTML = '<tr><td colspan="3" class="empty-cell">Failed to load templates</td></tr>';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            confirmButtonColor: '#8b5cf6'
        });
    });
});
