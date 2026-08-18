document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('routeForm');
    const idInput = document.getElementById('routeId');
    const titleInput = document.getElementById('routeTitle');
    const saveBtn = document.getElementById('saveRouteBtn');
    const tableBody = document.getElementById('routeTableBody');
    const state = { rows: [], currentPage: 1 };

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return String(row.title || '').toLowerCase().includes(keyword);
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                return '<tr><td>' + UI.escapeHtml(row.title) + '</td><td>' + UI.actionButtons(row.id) + '</td></tr>';
            }).join('')
            : UI.emptyRow(2);
        UI.renderFooter(data.length, slice, state);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = { title: titleInput.value.trim() };
        if (!payload.title) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Route Title is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const id = idInput.value;
        try {
            const data = await UI.fetchJson(id ? '/api/transport/routes/' + encodeURIComponent(id) : '/api/transport/routes', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            form.reset();
            idInput.value = '';
            saveBtn.textContent = 'Save';
            await load();
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (editBtn) {
            const row = state.rows.find(function (item) { return String(item.id) === editBtn.getAttribute('data-id'); });
            if (!row) return;
            idInput.value = row.id;
            titleInput.value = row.title;
            saveBtn.textContent = 'Update';
            titleInput.focus();
            return;
        }
        if (!deleteBtn) return;
        const result = await Swal.fire({ icon: 'warning', title: 'Delete Route?', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
        if (!result.isConfirmed) return;
        try {
            await UI.fetchJson('/api/transport/routes/' + encodeURIComponent(deleteBtn.getAttribute('data-id')), { method: 'DELETE' });
            if (idInput.value === deleteBtn.getAttribute('data-id')) {
                form.reset();
                idInput.value = '';
                saveBtn.textContent = 'Save';
            }
            await load();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function load() {
        state.rows = await UI.fetchJson('/api/transport/routes');
        render();
    }

    UI.bindPaging(state, render);
    UI.bindExport('transport-routes', ['Route Title'], function () {
        return filtered().map(function (row) { return [row.title]; });
    });
    load().catch(function (err) { UI.error(err.message); });
});
