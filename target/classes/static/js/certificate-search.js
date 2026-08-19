document.addEventListener('DOMContentLoaded', function () {
    const UI = window.CertificateUI;
    const page = document.body.dataset.certificatePage;
    const classSelect = document.getElementById('criteriaClassSelect');
    const sectionSelect = document.getElementById('criteriaSectionSelect');
    const templateSelect = document.getElementById('criteriaTemplateSelect');
    const tableBody = document.getElementById('certificateTableBody');
    const generateBtn = document.getElementById('generateSelectedBtn');
    const selectAll = document.getElementById('selectAllRows');
    const state = { rows: [], classes: [], currentPage: 1, selected: {}, reissue: {}, sortKey: '', sortDir: 'asc' };

    function keyword() {
        return (document.getElementById('searchInput') && document.getElementById('searchInput').value || '').toLowerCase();
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function classLabel(row) {
        return row.classLabel || ((row.className || '') + (row.section ? '(' + row.section + ')' : ''));
    }

    function columnVisible(index) {
        const toggle = document.querySelector('#columnVisibilityDropdown .column-toggle[data-column="' + index + '"]');
        return !toggle || toggle.checked;
    }

    function cell(index, html) {
        return '<td' + (columnVisible(index) ? '' : ' style="display:none"') + '>' + html + '</td>';
    }

    function filtered() {
        const rows = state.rows.filter(function (row) {
            return [row.admissionNo, row.studentName, row.fatherName, classLabel(row), row.dateOfBirth, row.gender, row.categoryName, row.mobileNumber, row.staffId, row.fullName]
                .some(function (value) { return String(value || '').toLowerCase().includes(keyword()); });
        });
        if (!state.sortKey) return rows;
        const key = state.sortKey;
        const dir = state.sortDir === 'desc' ? -1 : 1;
        return rows.slice().sort(function (a, b) {
            const left = String(key === 'classLabel' ? classLabel(a) : (a[key] || '')).toLowerCase();
            const right = String(key === 'classLabel' ? classLabel(b) : (b[key] || '')).toLowerCase();
            if (left < right) return -1 * dir;
            if (left > right) return 1 * dir;
            return 0;
        });
    }

    function downloadIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
    }

    function actionButton(row) {
        if (page === 'transfer') {
            return '<button type="button" class="btn-action" data-print="' + row.id + '" title="Download Transfer Certificate">' + downloadIcon() + '</button>';
        }
        return '<input type="checkbox" class="row-check" data-id="' + row.id + '"' + (state.selected[row.id] ? ' checked' : '') + '>';
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        if (page === 'staff-id') {
            tableBody.innerHTML = slice.pageRows.length ? slice.pageRows.map(function (row) {
                return '<tr>'
                    + cell(0, actionButton(row))
                    + cell(1, UI.escapeHtml(row.staffId))
                    + cell(2, '<a class="student-name-link" href="/staff/edit/' + encodeURIComponent(String(row.id)) + '">' + UI.escapeHtml(row.fullName) + '</a>')
                    + cell(3, UI.escapeHtml(row.role))
                    + cell(4, UI.escapeHtml(row.designation))
                    + cell(5, UI.escapeHtml(row.department))
                    + cell(6, UI.escapeHtml(row.phone))
                    + '</tr>';
            }).join('') : UI.emptyRow(7);
            UI.renderFooter(data.length, slice, state);
            document.querySelectorAll('#generateStaffIdTable thead th').forEach(function (th, index) {
                th.style.display = columnVisible(index) ? '' : 'none';
                if (th.dataset.sort) {
                    th.classList.toggle('sorted-asc', state.sortKey === th.dataset.sort && state.sortDir === 'asc');
                    th.classList.toggle('sorted-desc', state.sortKey === th.dataset.sort && state.sortDir === 'desc');
                }
            });
            return;
        }
        if (page === 'transfer') {
            tableBody.innerHTML = slice.pageRows.length ? slice.pageRows.map(function (row) {
                const checked = state.reissue[row.id] ? ' checked' : '';
                return '<tr>'
                    + '<td>' + UI.escapeHtml(row.admissionNo) + '</td>'
                    + '<td><a class="student-name-link" href="/student/view/' + encodeURIComponent(String(row.id)) + '">' + UI.escapeHtml(row.studentName) + '</a></td>'
                    + '<td>' + UI.escapeHtml(formatDate(row.dateOfBirth)) + '</td>'
                    + '<td>' + UI.escapeHtml(row.gender) + '</td>'
                    + '<td>' + UI.escapeHtml(row.categoryName) + '</td>'
                    + '<td>' + UI.escapeHtml(row.mobileNumber) + '</td>'
                    + '<td><input type="checkbox" class="reissue-check" data-id="' + row.id + '"' + checked + '></td>'
                    + '<td>' + actionButton(row) + '</td>'
                    + '</tr>';
            }).join('') : UI.emptyRow(8);
            UI.renderFooter(data.length, slice, state);
            return;
        }
        tableBody.innerHTML = slice.pageRows.length ? slice.pageRows.map(function (row) {
            return '<tr>'
                + cell(0, actionButton(row))
                + cell(1, UI.escapeHtml(row.admissionNo))
                + cell(2, '<a class="student-name-link" href="/student/view/' + encodeURIComponent(String(row.id)) + '">' + UI.escapeHtml(row.studentName) + '</a>')
                + cell(3, UI.escapeHtml(classLabel(row)))
                + cell(4, UI.escapeHtml(row.fatherName))
                + cell(5, UI.escapeHtml(formatDate(row.dateOfBirth)))
                + cell(6, UI.escapeHtml(row.gender))
                + cell(7, UI.escapeHtml(row.categoryName))
                + cell(8, UI.escapeHtml(row.mobileNumber))
                + '</tr>';
        }).join('') : UI.emptyRow(9);
        UI.renderFooter(data.length, slice, state);
        document.querySelectorAll('#generateCertificateTable thead th, #generateIdCardTable thead th').forEach(function (th, index) {
            th.style.display = columnVisible(index) ? '' : 'none';
            if (th.dataset.sort) {
                th.classList.toggle('sorted-asc', state.sortKey === th.dataset.sort && state.sortDir === 'asc');
                th.classList.toggle('sorted-desc', state.sortKey === th.dataset.sort && state.sortDir === 'desc');
            }
        });
    }

    async function loadTemplates() {
        if (!templateSelect) return;
        const url = page === 'certificate' ? '/api/certificates/templates'
            : page === 'id-card' ? '/api/certificates/student-id-cards'
            : '/api/certificates/staff-id-cards';
        const items = await fetch(url).then(function (r) { return r.json(); });
        templateSelect.innerHTML = '<option value="">Select</option>' + (Array.isArray(items) ? items : []).map(function (item) {
            const label = item.certificateName || item.idCardTitle;
            return '<option value="' + item.id + '">' + UI.escapeHtml(label) + '</option>';
        }).join('');
    }

    if (classSelect && sectionSelect) {
        UI.loadClasses(classSelect, sectionSelect, state);
        document.getElementById('criteriaForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!classSelect.value) {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Class is required.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (templateSelect && !templateSelect.value && page !== 'transfer') {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please select a template.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            try {
                const params = new URLSearchParams({ classId: classSelect.value });
                if (sectionSelect.value) params.set('section', sectionSelect.value);
                state.rows = await fetch('/api/certificates/students?' + params.toString()).then(function (r) { return r.json(); });
                state.currentPage = 1;
                render();
            } catch (err) {
                UI.error(err.message);
            }
        });
    }

    if (page === 'staff-id') {
        loadTemplates();
        const roleSelect = document.getElementById('criteriaRoleSelect');
        document.getElementById('criteriaForm') && document.getElementById('criteriaForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            if (templateSelect && !templateSelect.value) {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please select an ID Card Template.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            try {
                const params = new URLSearchParams();
                if (roleSelect && roleSelect.value) params.set('role', roleSelect.value);
                const url = '/api/certificates/staff' + (params.toString() ? '?' + params.toString() : '');
                state.rows = await fetch(url).then(function (r) { return r.json(); });
                state.currentPage = 1;
                render();
            } catch (err) {
                UI.error(err.message);
            }
        });
    } else {
        loadTemplates();
    }

    tableBody.addEventListener('change', function (e) {
        const check = e.target.closest('.row-check');
        if (check) state.selected[check.dataset.id] = check.checked;
        const reissue = e.target.closest('.reissue-check');
        if (reissue) state.reissue[reissue.dataset.id] = reissue.checked;
    });
    tableBody.addEventListener('click', async function (e) {
        const btn = e.target.closest('[data-print]');
        if (!btn) return;
        const studentId = btn.getAttribute('data-print');
        const row = state.rows.find(function (item) { return String(item.id) === String(studentId); });
        if (row && row.issued && row.issueId && !state.reissue[row.id]) {
            window.open('/admin/certificate/print/' + row.issueId, '_blank');
            return;
        }
        const result = await Swal.fire({
            title: 'Transfer Certificate',
            html: '<div class="swal-tc-form"><label>Date of Issue</label><input id="tcIssueDate" type="date" class="swal2-input" value="' + new Date().toISOString().slice(0, 10) + '">'
                + '<label>Date of Leaving</label><input id="tcLeavingDate" type="date" class="swal2-input" value="' + new Date().toISOString().slice(0, 10) + '">'
                + '<label>Reason</label><input id="tcReason" class="swal2-input" placeholder="Parent request">'
                + '<label>Remarks</label><input id="tcRemarks" class="swal2-input"></div>',
            showCancelButton: true,
            confirmButtonText: 'Save & Download',
            confirmButtonColor: '#8b5cf6',
            preConfirm: function () {
                return {
                    issueDate: document.getElementById('tcIssueDate').value,
                    leavingDate: document.getElementById('tcLeavingDate').value,
                    reason: document.getElementById('tcReason').value,
                    remarks: document.getElementById('tcRemarks').value
                };
            }
        });
        if (!result.isConfirmed) return;
        try {
            const saved = await UI.postJson('/api/certificates/transfer/' + studentId, result.value);
            if (row) {
                row.issued = true;
                row.issueId = saved.data.id;
                row.documentNumber = saved.data.documentNumber;
                state.reissue[row.id] = false;
            }
            render();
            window.open('/admin/certificate/print/' + saved.data.id, '_blank');
        } catch (err) {
            UI.error(err.message);
        }
    });

    const verifyModal = document.getElementById('verifyTcModal');
    const verifyBtn = document.getElementById('verifyTcBtn');
    if (verifyBtn && verifyModal) {
        const closeVerify = function () { verifyModal.classList.remove('active'); };
        verifyBtn.addEventListener('click', function () {
            document.getElementById('verifyTcResult').innerHTML = '';
            document.getElementById('verifyTcNumber').value = '';
            verifyModal.classList.add('active');
        });
        document.getElementById('verifyTcCloseBtn').addEventListener('click', closeVerify);
        document.getElementById('verifyTcOverlay').addEventListener('click', closeVerify);
        document.getElementById('verifyTcSubmitBtn').addEventListener('click', async function () {
            const number = document.getElementById('verifyTcNumber').value.trim();
            const resultBox = document.getElementById('verifyTcResult');
            if (!number) {
                resultBox.innerHTML = '<p class="bad">Certificate number is required.</p>';
                return;
            }
            try {
                const data = await fetch('/api/certificates/transfer/verify?certificateNo=' + encodeURIComponent(number)).then(function (r) {
                    return r.json().then(function (body) { return { ok: r.ok, body: body }; });
                });
                if (!data.ok) throw new Error(data.body.message || 'Not found');
                const student = data.body.student || {};
                resultBox.innerHTML = '<p class="ok">Valid transfer certificate.</p>'
                    + '<p><strong>' + UI.escapeHtml(data.body.documentNumber) + '</strong> issued on ' + UI.escapeHtml(data.body.issueDate) + '</p>'
                    + '<p>' + UI.escapeHtml(student.studentName) + ' (' + UI.escapeHtml(student.admissionNo) + ')</p>';
            } catch (err) {
                resultBox.innerHTML = '<p class="bad">' + UI.escapeHtml(err.message) + '</p>';
            }
        });
    }

    function exportMeta() {
        if (page === 'certificate' || page === 'id-card') {
            return {
                headers: ['Admission No', 'Student Name', 'Class', 'Father Name', 'Date Of Birth', 'Gender', 'Category', 'Mobile Number'],
                rows: filtered().map(function (row) {
                    return [row.admissionNo, row.studentName, classLabel(row), row.fatherName, formatDate(row.dateOfBirth), row.gender, row.categoryName, row.mobileNumber];
                }),
                file: page === 'certificate' ? 'generate-certificate' : 'generate-id-card'
            };
        }
        if (page === 'staff-id') {
            return {
                headers: ['Staff ID', 'Name', 'Role', 'Designation', 'Department', 'Phone'],
                rows: filtered().map(function (row) {
                    return [row.staffId, row.fullName, row.role, row.designation, row.department, row.phone];
                }),
                file: 'generate-staff-id-card'
            };
        }
        return {
            headers: ['Admission No', 'Student Name', 'Date Of Birth', 'Gender', 'Category', 'Mobile Number'],
            rows: filtered().map(function (row) {
                return [row.admissionNo, row.studentName, formatDate(row.dateOfBirth), row.gender, row.categoryName, row.mobileNumber];
            }),
            file: 'transfer-certificate'
        };
    }

    function bindExports() {
        const copyBtn = document.getElementById('copyBtn');
        if (!copyBtn) return;
        copyBtn.addEventListener('click', function () {
            const meta = exportMeta();
            const text = [meta.headers.join('\t')].concat(meta.rows.map(function (row) { return row.join('\t'); })).join('\n');
            navigator.clipboard.writeText(text).then(function () { UI.success('Copied to clipboard'); });
        });
        const excelBtn = document.getElementById('excelBtn');
        if (excelBtn && window.XLSX) excelBtn.addEventListener('click', function () {
            const meta = exportMeta();
            const sheet = XLSX.utils.aoa_to_sheet([meta.headers].concat(meta.rows));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, 'Students');
            XLSX.writeFile(wb, meta.file + '.xlsx');
        });
        const csvBtn = document.getElementById('csvBtn');
        if (csvBtn) csvBtn.addEventListener('click', function () {
            const meta = exportMeta();
            const csv = [meta.headers.join(',')].concat(meta.rows.map(function (row) {
                return row.map(function (value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; }).join(',');
            })).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = meta.file + '.csv';
            link.click();
        });
        const printBtn = document.getElementById('printBtn');
        const pdfBtn = document.getElementById('pdfBtn');
        if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
        if (pdfBtn) pdfBtn.addEventListener('click', function () { window.print(); });
    }
    bindExports();

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

    document.querySelectorAll('#generateCertificateTable th.sortable, #generateIdCardTable th.sortable, #generateStaffIdTable th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            if (state.sortKey === th.dataset.sort) {
                state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortKey = th.dataset.sort;
                state.sortDir = 'asc';
            }
            render();
        });
    });

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            filtered().forEach(function (row) { state.selected[row.id] = selectAll.checked; });
            render();
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', async function () {
            const ids = Object.keys(state.selected).filter(function (id) { return state.selected[id]; }).map(Number);
            if (!templateSelect.value) {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Please select a template.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            if (!ids.length) {
                Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Select at least one record.', confirmButtonColor: '#8b5cf6' });
                return;
            }
            try {
                const url = page === 'certificate' ? '/api/certificates/generate'
                    : page === 'id-card' ? '/api/certificates/generate-id-cards'
                    : '/api/certificates/generate-staff-id-cards';
                const payload = page === 'staff-id'
                    ? { staffIds: ids, templateId: templateSelect.value }
                    : { studentIds: ids, templateId: templateSelect.value };
                const saved = await UI.postJson(url, payload);
                const records = Array.isArray(saved.data) ? saved.data : [];
                records.forEach(function (item) { window.open('/admin/certificate/print/' + item.id, '_blank'); });
                UI.success(saved.message);
            } catch (err) {
                UI.error(err.message);
            }
        });
    }

    UI.bindPaging(state, render);
    render();
});
