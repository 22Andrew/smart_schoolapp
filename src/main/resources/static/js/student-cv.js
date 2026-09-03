document.addEventListener('DOMContentLoaded', function () {
    const UI = window.StudentCvUI;
    const classSelect = document.getElementById('criteriaClassSelect');
    const sectionSelect = document.getElementById('criteriaSectionSelect');
    const tableBody = document.getElementById('cvTableBody');
    const state = { rows: [], classes: [], currentPage: 1 };

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.admissionNo, row.studentName, row.className, row.fatherName, row.gender, row.mobileNumber].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                return '<tr>'
                    + '<td>' + UI.escapeHtml(row.admissionNo) + '</td>'
                    + '<td>' + UI.escapeHtml(row.studentName) + '</td>'
                    + '<td>' + UI.escapeHtml(row.classLabel || row.className) + '</td>'
                    + '<td>' + UI.escapeHtml(row.fatherName) + '</td>'
                    + '<td>' + UI.escapeHtml(row.dateOfBirth) + '</td>'
                    + '<td>' + UI.escapeHtml(row.gender) + '</td>'
                    + '<td>' + UI.escapeHtml(row.mobileNumber) + '</td>'
                    + '<td><a class="btn-action" title="Add / Edit CV" href="/admin/resume/fill/' + UI.escapeHtml(row.id) + '">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg></a></td>'
                    + '</tr>';
            }).join('')
            : UI.emptyRow(8);
        UI.renderFooter(data.length, slice, state);
    }

    function fillSections() {
        const selected = state.classes.find(function (item) { return String(item.id) === classSelect.value; });
        const sections = selected && selected.sections ? selected.sections : [];
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + UI.escapeHtml(section) + '">' + UI.escapeHtml(section) + '</option>';
        }).join('');
    }

    classSelect.addEventListener('change', fillSections);
    document.getElementById('criteriaForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!classSelect.value) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Class is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const params = new URLSearchParams({ classId: classSelect.value });
            if (sectionSelect.value) params.set('section', sectionSelect.value);
            state.rows = await UI.fetchJson('/api/resume/students?' + params.toString());
            state.currentPage = 1;
            render();
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function loadSettings() {
        const settings = await UI.fetchJson('/api/resume/settings');
        const enabled = settings.enabledStudentFields || [];
        document.getElementById('cvFieldsGrid').innerHTML = (settings.studentFields || []).map(function (field) {
            const checked = enabled.indexOf(field.key) >= 0 ? ' checked' : '';
            return '<label><input type="checkbox" name="cvField" value="' + UI.escapeHtml(field.key) + '"' + checked + '> ' + UI.escapeHtml(field.label) + '</label>';
        }).join('');
        document.getElementById('workExperienceEnabled').checked = !!settings.workExperienceEnabled;
        document.getElementById('educationEnabled').checked = !!settings.educationEnabled;
        document.getElementById('skillsEnabled').checked = !!settings.skillsEnabled;
        document.getElementById('referencesEnabled').checked = !!settings.referencesEnabled;
        document.getElementById('otherDetailsEnabled').checked = !!settings.otherDetailsEnabled;
        document.getElementById('studentPanelDownload').checked = !!settings.studentPanelDownload;
    }

    document.getElementById('cvSettingsBtn').addEventListener('click', async function () {
        try {
            await loadSettings();
            document.getElementById('cvSettingsModal').classList.add('active');
        } catch (err) {
            UI.error(err.message);
        }
    });
    document.getElementById('cvSettingsClose').addEventListener('click', function () {
        document.getElementById('cvSettingsModal').classList.remove('active');
    });
    document.getElementById('cvSettingsOverlay').addEventListener('click', function () {
        document.getElementById('cvSettingsModal').classList.remove('active');
    });
    document.getElementById('cvSettingsForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const enabledStudentFields = Array.from(document.querySelectorAll('input[name="cvField"]:checked')).map(function (input) {
            return input.value;
        });
        try {
            const data = await UI.fetchJson('/api/resume/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabledStudentFields: enabledStudentFields,
                    workExperienceEnabled: document.getElementById('workExperienceEnabled').checked,
                    educationEnabled: document.getElementById('educationEnabled').checked,
                    skillsEnabled: document.getElementById('skillsEnabled').checked,
                    referencesEnabled: document.getElementById('referencesEnabled').checked,
                    otherDetailsEnabled: document.getElementById('otherDetailsEnabled').checked,
                    studentPanelDownload: document.getElementById('studentPanelDownload').checked
                })
            });
            document.getElementById('cvSettingsModal').classList.remove('active');
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    UI.bindPaging(state, render);
    fetch('/api/classes').then(function (response) { return response.json(); }).then(function (data) {
        state.classes = Array.isArray(data) ? data : [];
        classSelect.innerHTML = '<option value="">Select</option>' + state.classes.map(function (item) {
            return '<option value="' + UI.escapeHtml(item.id) + '">' + UI.escapeHtml(item.name) + '</option>';
        }).join('');
    }).catch(function () {});
    render();
});
