document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('pickupForm');
    const modalTitle = document.getElementById('pickupModalTitle');
    const idInput = document.getElementById('pickupId');
    const nameInput = document.getElementById('pickupName');
    const latInput = document.getElementById('pickupLatitude');
    const lngInput = document.getElementById('pickupLongitude');
    const tableBody = document.getElementById('pickupTableBody');
    const state = { rows: [], currentPage: 1 };

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.name, row.latitude, row.longitude].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                const mapBtn = row.latitude && row.longitude
                    ? '<button type="button" class="btn-action btn-map" data-lat="' + UI.escapeHtml(row.latitude) + '" data-lng="' + UI.escapeHtml(row.longitude) + '" title="Map"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></button>'
                    : '';
                return '<tr><td>' + UI.escapeHtml(row.name) + '</td><td>' + UI.escapeHtml(row.latitude) + '</td><td>' + UI.escapeHtml(row.longitude) + '</td><td>' + UI.actionButtons(row.id, mapBtn) + '</td></tr>';
            }).join('')
            : UI.emptyRow(4);
        UI.renderFooter(data.length, slice, state);
    }

    document.getElementById('addPickupBtn').addEventListener('click', function () {
        form.reset();
        idInput.value = '';
        modalTitle.textContent = 'Add Pickup Point';
        UI.openModal('pickupModal');
    });
    document.getElementById('pickupModalClose').addEventListener('click', function () { UI.closeModal('pickupModal'); });
    document.getElementById('pickupModalOverlay').addEventListener('click', function () { UI.closeModal('pickupModal'); });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const payload = { name: nameInput.value.trim(), latitude: latInput.value.trim(), longitude: lngInput.value.trim() };
        if (!payload.name) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Pickup Point is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const id = idInput.value;
        try {
            const data = await UI.fetchJson(id ? '/api/transport/pickup-points/' + encodeURIComponent(id) : '/api/transport/pickup-points', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            UI.closeModal('pickupModal');
            await load();
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const mapBtn = e.target.closest('.btn-map');
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (mapBtn) {
            window.open('https://www.google.com/maps?q=' + encodeURIComponent(mapBtn.getAttribute('data-lat') + ',' + mapBtn.getAttribute('data-lng')), '_blank');
            return;
        }
        if (editBtn) {
            const row = state.rows.find(function (item) { return String(item.id) === editBtn.getAttribute('data-id'); });
            if (!row) return;
            idInput.value = row.id;
            nameInput.value = row.name;
            latInput.value = row.latitude;
            lngInput.value = row.longitude;
            modalTitle.textContent = 'Edit Pickup Point';
            UI.openModal('pickupModal');
            return;
        }
        if (!deleteBtn) return;
        const result = await Swal.fire({ icon: 'warning', title: 'Delete Pickup Point?', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
        if (!result.isConfirmed) return;
        try {
            await UI.fetchJson('/api/transport/pickup-points/' + encodeURIComponent(deleteBtn.getAttribute('data-id')), { method: 'DELETE' });
            await load();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function load() {
        state.rows = await UI.fetchJson('/api/transport/pickup-points');
        render();
    }

    UI.bindPaging(state, render);
    UI.bindExport('pickup-points', ['Pickup Point', 'Latitude', 'Longitude'], function () {
        return filtered().map(function (row) { return [row.name, row.latitude, row.longitude]; });
    });
    load().catch(function (err) { UI.error(err.message); });
});
