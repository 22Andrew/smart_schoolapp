document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('assignForm');
    const routeSelect = document.getElementById('assignRouteSelect');
    const vehicleList = document.getElementById('vehicleCheckList');
    const tableBody = document.getElementById('assignTableBody');
    const state = { rows: [], vehicles: [], currentPage: 1 };

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.routeTitle, row.vehicles].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function vehicleNumbers(row) {
        if (Array.isArray(row.vehicleNumbers) && row.vehicleNumbers.length) {
            return row.vehicleNumbers;
        }
        return String(row.vehicles || '').split(',').map(function (value) {
            return value.trim();
        }).filter(Boolean);
    }

    function renderVehicles(selectedIds) {
        const selected = (selectedIds || []).map(String);
        vehicleList.innerHTML = state.vehicles.length
            ? state.vehicles.map(function (vehicle) {
                const checked = selected.indexOf(String(vehicle.id)) >= 0 ? ' checked' : '';
                return '<label class="vehicle-check-item"><input type="checkbox" name="vehicleIds" value="'
                    + UI.escapeHtml(vehicle.id) + '"' + checked + '> '
                    + UI.escapeHtml(vehicle.vehicleNumber) + '</label>';
            }).join('')
            : '<div class="vehicle-empty">No vehicles available</div>';
    }

    function resetForm() {
        form.reset();
        renderVehicles([]);
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                const vehicles = vehicleNumbers(row).map(function (number) {
                    return UI.escapeHtml(number);
                }).join('<br>');
                return '<tr>'
                    + '<td>' + UI.escapeHtml(row.routeTitle) + '</td>'
                    + '<td>' + vehicles + '</td>'
                    + '<td>' + UI.actionButtons(row.routeId) + '</td>'
                    + '</tr>';
            }).join('')
            : UI.emptyRow(3);
        UI.renderFooter(data.length, slice, state);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!routeSelect.value) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Route is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const vehicleIds = Array.from(form.querySelectorAll('input[name="vehicleIds"]:checked')).map(function (input) {
            return input.value;
        });
        if (!vehicleIds.length) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Select at least one vehicle.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const data = await UI.fetchJson('/api/transport/route-vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routeId: routeSelect.value, vehicleIds: vehicleIds })
            });
            resetForm();
            await load(true);
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (editBtn) {
            const row = state.rows.find(function (item) {
                return String(item.routeId) === editBtn.getAttribute('data-id');
            });
            if (!row) return;
            routeSelect.value = row.routeId;
            renderVehicles(row.vehicleIds || []);
            routeSelect.focus();
            return;
        }
        if (!deleteBtn) return;
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete Assigned Vehicle?',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        });
        if (!result.isConfirmed) return;
        try {
            await UI.fetchJson('/api/transport/route-vehicles/' + encodeURIComponent(deleteBtn.getAttribute('data-id')), { method: 'DELETE' });
            resetForm();
            await load(true);
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function load(keepForm) {
        const selectedRoute = keepForm ? routeSelect.value : '';
        const selectedVehicles = keepForm
            ? Array.from(form.querySelectorAll('input[name="vehicleIds"]:checked')).map(function (input) { return input.value; })
            : [];
        const options = await UI.fetchJson('/api/transport/options');
        state.vehicles = options.vehicles || [];
        routeSelect.innerHTML = '<option value="">Select</option>' + (options.routes || []).map(function (route) {
            return '<option value="' + UI.escapeHtml(route.id) + '">' + UI.escapeHtml(route.title) + '</option>';
        }).join('');
        state.rows = await UI.fetchJson('/api/transport/route-vehicles');
        if (keepForm) {
            routeSelect.value = selectedRoute;
            renderVehicles(selectedVehicles);
        } else {
            renderVehicles([]);
        }
        render();
    }

    UI.bindPaging(state, render);
    UI.bindExport('assign-vehicle', ['Route', 'Vehicle'], function () {
        return filtered().map(function (row) {
            return [row.routeTitle, vehicleNumbers(row).join(', ')];
        });
    });
    load().catch(function (err) { UI.error(err.message); });
});
