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
                    + '<td><a class="btn-action" title="Download CV" href="/admin/resume/print/' + UI.escapeHtml(row.id) + '" target="_blank">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></a></td>'
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

    UI.bindPaging(state, render);
    fetch('/api/classes').then(function (response) { return response.json(); }).then(function (data) {
        state.classes = Array.isArray(data) ? data : [];
        classSelect.innerHTML = '<option value="">Select</option>' + state.classes.map(function (item) {
            return '<option value="' + UI.escapeHtml(item.id) + '">' + UI.escapeHtml(item.name) + '</option>';
        }).join('');
    }).catch(function () {});
    render();
});
