document.addEventListener('DOMContentLoaded', function () {
    const UI = window.CertificateUI;
    const page = document.body.dataset.certificatePage;
    const form = document.getElementById('designerForm');
    const tableBody = document.getElementById('designerTableBody');
    const idInput = document.getElementById('recordId');
    const saveBtn = document.getElementById('saveBtn');
    const state = { rows: [], currentPage: 1, viewing: false };

    const endpoints = {
        'student-certificate': '/api/certificates/templates',
        'student-id': '/api/certificates/student-id-cards',
        'staff-id': '/api/certificates/staff-id-cards'
    };
    const endpoint = endpoints[page];
    if (!form || !tableBody || !endpoint) return;

    function filtered() {
        const keyword = (document.getElementById('searchInput') && document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.certificateName, row.idCardTitle, row.schoolName].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function columnVisible(index) {
        const toggle = document.querySelector('#columnVisibilityDropdown .column-toggle[data-column="' + index + '"]');
        return !toggle || toggle.checked;
    }

    function viewIcon() {
        if (page === 'student-id' || page === 'staff-id') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }

    function designLabel(value) {
        const text = String(value || 'vertical');
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        const isCert = page === 'student-certificate';
        const isId = page === 'student-id' || page === 'staff-id';
        tableBody.innerHTML = slice.pageRows.length ? slice.pageRows.map(function (row) {
            const name = row.certificateName || row.idCardTitle;
            const image = row.backgroundImageUrl
                ? '<img class="cert-bg-thumb" src="' + UI.escapeHtml(row.backgroundImageUrl) + '" alt="">'
                : '<span class="cert-bg-thumb"></span>';
            const actions = '<div class="list-actions">'
                + '<button type="button" class="btn-action" data-view="' + row.id + '" title="View">' + viewIcon() + '</button>'
                + '<button type="button" class="btn-action" data-edit="' + row.id + '" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
                + '<button type="button" class="btn-action" data-delete="' + row.id + '" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
                + '</div>';
            if (isCert) {
                return '<tr>'
                    + '<td' + (columnVisible(0) ? '' : ' style="display:none"') + '><a href="#" class="cert-name-link" data-view="' + row.id + '">' + UI.escapeHtml(name) + '</a></td>'
                    + '<td' + (columnVisible(1) ? '' : ' style="display:none"') + '>' + image + '</td>'
                    + '<td' + (columnVisible(2) ? '' : ' style="display:none"') + '>' + actions + '</td>'
                    + '</tr>';
            }
            if (isId) {
                return '<tr>'
                    + '<td' + (columnVisible(0) ? '' : ' style="display:none"') + '>' + UI.escapeHtml(name) + '</td>'
                    + '<td' + (columnVisible(1) ? '' : ' style="display:none"') + '>' + image + '</td>'
                    + '<td' + (columnVisible(2) ? '' : ' style="display:none"') + '>' + UI.escapeHtml(designLabel(row.designType)) + '</td>'
                    + '<td' + (columnVisible(3) ? '' : ' style="display:none"') + '>' + actions + '</td>'
                    + '</tr>';
            }
            return '<tr><td>' + UI.escapeHtml(name) + '</td><td>' + actions + '</td></tr>';
        }).join('') : UI.emptyRow(isCert ? 3 : (isId ? 4 : 2));
        UI.renderFooter(data.length, slice, state);
        const info = document.getElementById('showingInfo');
        if (info && data.length === 1) info.textContent = 'Showing 1 to 1 of 1 entry';
        document.querySelectorAll('#certificateListTable thead th, #studentIdCardTable thead th, #staffIdCardTable thead th').forEach(function (th, index) {
            th.style.display = columnVisible(index) ? '' : 'none';
        });
    }

    async function load() {
        try {
            const payload = await fetch(endpoint).then(function (r) { return r.json(); });
            state.rows = Array.isArray(payload) ? payload : [];
        } catch (err) {
            state.rows = [];
        }
        render();
    }

    function collectFields() {
        const fields = {};
        const files = {};
        Array.from(form.elements).forEach(function (el) {
            if (!el.name || el.disabled) return;
            if (el.type === 'file') {
                if (el.files && el.files[0]) files[el.name] = el.files[0];
                return;
            }
            if (el.type === 'checkbox') {
                fields[el.name] = el.checked ? 'true' : 'false';
                return;
            }
            if (el.name === 'id' && !String(el.value || '').trim()) return;
            fields[el.name] = el.value;
        });
        return { fields: fields, files: files };
    }

    function buildRequestBody() {
        const collected = collectFields();
        const fileNames = Object.keys(collected.files);
        if (!fileNames.length) {
            return new URLSearchParams(collected.fields);
        }
        const data = new FormData();
        Object.keys(collected.fields).forEach(function (name) {
            data.append(name, collected.fields[name]);
        });
        fileNames.forEach(function (name) {
            data.append(name, collected.files[name]);
        });
        return data;
    }

    function fillForm(row) {
        state.viewing = false;
        Array.from(form.elements).forEach(function (el) { el.disabled = false; });
        idInput.value = row.id || '';
        form.querySelectorAll('[name]').forEach(function (input) {
            if (input.type === 'file') return;
            if (input.type === 'checkbox') input.checked = !!row[input.name];
            else if (row[input.name] !== undefined && row[input.name] !== null) input.value = row[input.name];
        });
        const dropLabel = document.getElementById('backgroundDropLabel');
        if (dropLabel) dropLabel.textContent = row.backgroundImageUrl ? 'Current image selected. Click to replace.' : 'Drag and drop a file here or click';
        const logoLabel = document.getElementById('logoDropLabel');
        if (logoLabel) logoLabel.textContent = row.logoUrl ? 'Current image selected. Click to replace.' : 'Drag and drop a file here or click';
        const signLabel = document.getElementById('signatureDropLabel');
        if (signLabel) signLabel.textContent = row.signatureUrl ? 'Current image selected. Click to replace.' : 'Drag and drop a file here or click';
        saveBtn.textContent = row.id ? 'Update' : 'Save';
    }

    function resetForm() {
        state.viewing = false;
        form.reset();
        idInput.value = '';
        saveBtn.textContent = 'Save';
        Array.from(form.elements).forEach(function (el) { el.disabled = false; });
        const photo = form.querySelector('[name="studentPhoto"]');
        if (photo) photo.checked = true;
        const dropLabel = document.getElementById('backgroundDropLabel');
        if (dropLabel) dropLabel.textContent = 'Drag and drop a file here or click';
        const logoLabel = document.getElementById('logoDropLabel');
        if (logoLabel) logoLabel.textContent = 'Drag and drop a file here or click';
        const signLabel = document.getElementById('signatureDropLabel');
        if (signLabel) signLabel.textContent = 'Drag and drop a file here or click';
    }

    function closePreview() {
        const certModal = document.getElementById('certPreviewModal');
        if (certModal) certModal.classList.remove('active');
        const idModal = document.getElementById('idCardViewModal');
        if (idModal) idModal.classList.remove('active');
        const idBody = document.getElementById('idCardViewBody');
        if (idBody) idBody.style.background = '';
    }

    function sampleStudent() {
        return {
            studentName: 'S.Tudent Name',
            admissionNo: '123456789',
            rollNo: '1015',
            classLabel: 'Class 6 - A (2018-19)',
            house: 'Red House',
            fatherName: 'S.Tudent Name',
            motherName: 'S.Tudent Name',
            address: 'D.No.1 Street Name Address Line 2<br>Address Line 3',
            phone: '1234567890',
            dob: '25.06.2006',
            bloodGroup: 'A+'
        };
    }

    function sampleStaff() {
        return {
            staffName: 'Super Admin',
            staffId: '9000',
            designation: 'Admin',
            department: 'Admin',
            fatherName: 'S.Taff Name',
            motherName: 'S.Taff Name',
            dateOfJoining: '01.01.2018',
            address: 'D.No.1 Street Name Address Line 2<br>Address Line 3',
            phone: '1234567890',
            dob: '25.06.1985'
        };
    }

    function idCardField(show, label, value) {
        if (!show) return '';
        return '<div class="idcard-preview-row"><dt>' + UI.escapeHtml(label) + '</dt><dd>' + value + '</dd></div>';
    }

    function barcodeMarkup() {
        const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2];
        let x = 0;
        let bars = '';
        widths.forEach(function (w, i) {
            if (i % 2 === 0) bars += '<rect x="' + x + '" y="0" width="' + w + '" height="34" fill="#111"/>';
            x += w + 1;
        });
        return '<svg viewBox="0 0 ' + x + ' 34" preserveAspectRatio="none" aria-hidden="true">' + bars + '</svg>';
    }

    function themePrimary() {
        const value = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
        const hex = normalizeHex(value);
        if (hex) return hex;
        const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (rgb) {
            const toHex = function (n) { return ('0' + Number(n).toString(16)).slice(-2); };
            return '#' + toHex(rgb[1]) + toHex(rgb[2]) + toHex(rgb[3]);
        }
        return '#8b5cf6';
    }

    function normalizeHex(value) {
        const text = String(value || '').trim();
        if (/^#[0-9a-f]{6}$/i.test(text)) return text;
        if (/^#[0-9a-f]{3}$/i.test(text)) {
            return '#' + text[1] + text[1] + text[2] + text[2] + text[3] + text[3];
        }
        return '';
    }

    function mixWithWhite(hex, amount) {
        const color = normalizeHex(hex);
        if (!color) return hex;
        const num = parseInt(color.slice(1), 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const mix = function (channel) { return Math.round(channel + (255 - channel) * amount); };
        return 'rgb(' + mix(r) + ', ' + mix(g) + ', ' + mix(b) + ')';
    }

    function previewAccent(row) {
        return themePrimary() || normalizeHex(row.headerColor);
    }

    function showIdCardPreview(row) {
        const modal = document.getElementById('idCardViewModal');
        const body = document.getElementById('idCardViewBody');
        if (!modal || !body) {
            fillForm(row);
            return;
        }
        const color = previewAccent(row);
        const contactBg = mixWithWhite(color, 0.82);
        const bodyBg = mixWithWhite(color, 0.9);
        body.style.background = mixWithWhite(color, 0.86);
        const imagePh = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1.5"></rect><circle cx="8.5" cy="10" r="1.5"></circle><path d="M21 16l-5.5-5.5L7 19"></path></svg>';
        const logo = row.logoUrl
            ? '<img src="' + UI.escapeHtml(row.logoUrl) + '" alt="Logo">'
            : '<span class="idcard-preview-logo-ph">' + imagePh + '</span>';
        const sign = row.signatureUrl
            ? '<img src="' + UI.escapeHtml(row.signatureUrl) + '" alt="Signature">'
            : imagePh;
        const overlay = mixWithWhite(color, 0.88);
        const bg = row.backgroundImageUrl
            ? ' style="background-color:' + overlay + ';background-image:linear-gradient(' + overlay + ',' + overlay + '),url(\'' + UI.escapeHtml(row.backgroundImageUrl) + '\')"'
            : ' style="background:' + bodyBg + '"';
        const barcode = row.showBarcode
            ? '<div class="idcard-preview-barcode">' + barcodeMarkup() + '</div><div class="idcard-preview-barcode-caption">default</div>'
            : '';
        let fields;
        if (page === 'staff-id') {
            const sample = sampleStaff();
            fields = idCardField(row.showStaffName, 'Staff Name', UI.escapeHtml(sample.staffName))
                + idCardField(row.showStaffId, 'Staff ID', UI.escapeHtml(sample.staffId))
                + idCardField(row.showDesignation, 'Designation', UI.escapeHtml(sample.designation))
                + idCardField(row.showDepartment, 'Department', UI.escapeHtml(sample.department))
                + idCardField(row.showFatherName, "Father's Name", UI.escapeHtml(sample.fatherName))
                + idCardField(row.showMotherName, "Mother's Name", UI.escapeHtml(sample.motherName))
                + idCardField(row.showDateOfJoining, 'Date Of Joining', UI.escapeHtml(sample.dateOfJoining))
                + idCardField(row.showAddress, 'Address', sample.address)
                + idCardField(row.showPhone, 'Phone', UI.escapeHtml(sample.phone))
                + idCardField(row.showDob, 'D.O.B', UI.escapeHtml(sample.dob));
        } else {
            const sample = sampleStudent();
            fields = idCardField(row.showStudentName, 'Student Name', UI.escapeHtml(sample.studentName))
                + idCardField(row.showAdmissionNo, 'Admission No', UI.escapeHtml(sample.admissionNo))
                + idCardField(row.showRollNo, 'Roll No.', UI.escapeHtml(sample.rollNo))
                + idCardField(row.showClass, 'Class', UI.escapeHtml(sample.classLabel))
                + idCardField(row.showHouse, 'House', UI.escapeHtml(sample.house))
                + idCardField(row.showFatherName, "Father's Name", UI.escapeHtml(sample.fatherName))
                + idCardField(row.showMotherName, "Mother's Name", UI.escapeHtml(sample.motherName))
                + idCardField(row.showAddress, 'Address', sample.address)
                + idCardField(row.showPhone, 'Phone', UI.escapeHtml(sample.phone))
                + idCardField(row.showDob, 'D.O.B', UI.escapeHtml(sample.dob))
                + idCardField(row.showBloodGroup, 'Blood Group', UI.escapeHtml(sample.bloodGroup));
        }
        const layoutClass = String(row.designType || '').toLowerCase() === 'vertical' ? ' vertical' : '';
        const fallbackTitle = page === 'staff-id' ? 'Staff Identity Card' : 'Student Identity Card';
        body.innerHTML = '<article class="idcard-preview' + layoutClass + '">'
            + '<div class="idcard-preview-school" style="background:' + UI.escapeHtml(color) + '">' + logo + '<h3>' + UI.escapeHtml(row.schoolName || 'Smart School') + '</h3></div>'
            + '<div class="idcard-preview-contact" style="background:' + contactBg + '">' + UI.escapeHtml(row.schoolAddress || '') + '</div>'
            + '<div class="idcard-preview-title" style="background:' + UI.escapeHtml(color) + '">' + UI.escapeHtml(row.idCardTitle || fallbackTitle) + '</div>'
            + '<div class="idcard-preview-main"' + bg + '>'
            + '<div class="idcard-preview-media"><div class="idcard-preview-photo">' + imagePh + '<span>NO IMAGE AVAILABLE</span></div>' + barcode + '</div>'
            + '<dl class="idcard-preview-fields">' + fields + '</dl>'
            + '<div class="idcard-preview-sign">' + sign + '</div>'
            + '</div></article>';
        modal.classList.add('active');
    }

    function showPreview(row) {
        if (page === 'student-id' || page === 'staff-id') {
            showIdCardPreview(row);
            return;
        }
        const modal = document.getElementById('certPreviewModal');
        const body = document.getElementById('certPreviewBody');
        const title = document.getElementById('certPreviewTitle');
        if (!modal || !body) {
            fillForm(row);
            return;
        }
        if (title) title.textContent = row.certificateName || 'Certificate Preview';
        const bg = row.backgroundImageUrl
            ? ' style="background-image:url(\'' + UI.escapeHtml(row.backgroundImageUrl) + '\')"'
            : '';
        const photo = row.studentPhoto ? '<div class="cert-preview-photo"></div>' : '';
        body.innerHTML = '<div class="cert-preview-sheet"' + bg + '>'
            + '<div class="cert-preview-head"><span>' + UI.escapeHtml(row.headerLeftText) + '</span><strong>' + UI.escapeHtml(row.headerCenterText) + '</strong><span>' + UI.escapeHtml(row.headerRightText) + '</span></div>'
            + '<div class="cert-preview-body-text">' + photo + UI.escapeHtml(row.bodyText).replace(/\n/g, '<br>') + '</div>'
            + '<div class="cert-preview-foot"><span>' + UI.escapeHtml(row.footerLeftText) + '</span><span>' + UI.escapeHtml(row.footerCenterText) + '</span><span>' + UI.escapeHtml(row.footerRightText) + '</span></div>'
            + '</div>';
        modal.classList.add('active');
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (state.viewing) {
            resetForm();
            return;
        }
        const data = buildRequestBody();
        try {
            const url = idInput.value ? endpoint + '/' + idInput.value : endpoint;
            const response = await fetch(url, { method: 'POST', body: data });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok) throw new Error(result.message || 'Save failed');
            UI.success(result.message || 'Saved successfully!');
            resetForm();
            await load();
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const btn = e.target.closest('button[data-view], button[data-edit], button[data-delete]');
        const link = e.target.closest('a[data-view]');
        const target = btn || link;
        if (!target) return;
        e.preventDefault();
        const id = target.dataset.view || target.dataset.edit || target.dataset.delete;
        const row = state.rows.find(function (item) { return String(item.id) === String(id); });
        if (!row) return;
        if (target.dataset.view) {
            showPreview(row);
            return;
        }
        if (target.dataset.edit) {
            closePreview();
            fillForm(row);
            return;
        }
        const confirm = await Swal.fire({ icon: 'warning', title: 'Delete?', text: 'This record will be removed.', showCancelButton: true, confirmButtonColor: '#8b5cf6' });
        if (!confirm.isConfirmed) return;
        try {
            const response = await fetch(endpoint + '/' + id, { method: 'DELETE' });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok) throw new Error(result.message || 'Delete failed');
            UI.success(result.message || 'Deleted');
            await load();
        } catch (err) {
            UI.error(err.message);
        }
    });

    const keywordList = document.getElementById('keywordList');
    const bodyText = document.getElementById('bodyText');
    if (keywordList && bodyText) {
        keywordList.addEventListener('click', function (e) {
            const tag = e.target.closest('.keyword-tag');
            if (!tag) return;
            const start = bodyText.selectionStart || bodyText.value.length;
            bodyText.value = bodyText.value.slice(0, start) + tag.textContent + bodyText.value.slice(bodyText.selectionEnd || start);
            bodyText.focus();
        });
    }

    function bindDropzone(zoneId, inputId, labelId) {
        const dropzone = document.getElementById(zoneId);
        const fileInput = document.getElementById(inputId);
        const dropLabel = document.getElementById(labelId);
        if (!dropzone || !fileInput) return;
        dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                fileInput.files = e.dataTransfer.files;
                if (dropLabel) dropLabel.textContent = e.dataTransfer.files[0].name;
            }
        });
        fileInput.addEventListener('change', function () {
            if (dropLabel) dropLabel.textContent = fileInput.files[0] ? fileInput.files[0].name : 'Drag and drop a file here or click';
        });
    }
    bindDropzone('backgroundDropzone', 'backgroundImage', 'backgroundDropLabel');
    bindDropzone('logoDropzone', 'logoFile', 'logoDropLabel');
    bindDropzone('signatureDropzone', 'signatureFile', 'signatureDropLabel');

    const columnBtn = document.getElementById('columnVisibilityBtn');
    const columnDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnBtn && columnDropdown) {
        columnBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnDropdown.classList.toggle('active');
        });
        columnDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
        document.addEventListener('click', function () { columnDropdown.classList.remove('active'); });
        columnDropdown.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', render);
        });
    }

    const previewClose = document.getElementById('certPreviewClose');
    const previewOverlay = document.getElementById('certPreviewOverlay');
    if (previewClose) previewClose.addEventListener('click', closePreview);
    if (previewOverlay) previewOverlay.addEventListener('click', closePreview);
    const idCardClose = document.getElementById('idCardViewClose');
    const idCardOverlay = document.getElementById('idCardViewOverlay');
    if (idCardClose) idCardClose.addEventListener('click', closePreview);
    if (idCardOverlay) idCardOverlay.addEventListener('click', closePreview);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePreview();
    });

    function bindExports() {
        const copyBtn = document.getElementById('copyBtn');
        if (!copyBtn) return;
        function names() {
            return filtered().map(function (row) { return row.certificateName || row.idCardTitle || ''; });
        }
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(names().join('\n')).then(function () { UI.success('Copied to clipboard'); });
        });
        const excelBtn = document.getElementById('excelBtn');
        if (excelBtn && window.XLSX) excelBtn.addEventListener('click', function () {
            const sheet = XLSX.utils.aoa_to_sheet([['Certificate Name']].concat(names().map(function (name) { return [name]; })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, 'Certificates');
            XLSX.writeFile(wb, 'student-certificates.xlsx');
        });
        const csvBtn = document.getElementById('csvBtn');
        if (csvBtn) csvBtn.addEventListener('click', function () {
            const csv = ['Certificate Name'].concat(names()).join('\n');
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            link.download = 'student-certificates.csv';
            link.click();
        });
        ['printBtn', 'pdfBtn'].forEach(function (id) {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', function () { window.print(); });
        });
    }
    bindExports();

    UI.bindPaging(state, render);
    load();
});
