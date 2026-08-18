document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('stopForm');
    const routeSelect = document.getElementById('stopRouteSelect');
    const stopsContainer = document.getElementById('stopsContainer');
    const tableBody = document.getElementById('stopTableBody');
    const modalTitle = document.getElementById('stopModalTitle');
    const state = { rows: [], pickupPoints: [], currentPage: 1 };

    function stopRow(stop) {
        const options = state.pickupPoints.map(function (point) {
            const selected = stop && String(stop.pickupPointId) === String(point.id) ? ' selected' : '';
            return '<option value="' + UI.escapeHtml(point.id) + '"' + selected + '>' + UI.escapeHtml(point.name) + '</option>';
        }).join('');
        return ''
            + '<div class="stop-row">'
            + '<div class="form-group"><label>Pickup Point</label><select class="form-select stop-pickup" required><option value="">Select</option>' + options + '</select></div>'
            + '<div class="form-group"><label>Distance</label><input type="number" step="0.01" class="form-control stop-distance" value="' + UI.escapeHtml(stop && stop.distance != null ? stop.distance : '') + '"></div>'
            + '<div class="form-group"><label>Pickup Time</label><input type="time" class="form-control stop-time" value="' + UI.escapeHtml(stop && stop.pickupTime ? String(stop.pickupTime).substring(0, 5) : '') + '"></div>'
            + '<div class="form-group"><label>Monthly Fees</label><input type="number" step="0.01" class="form-control stop-fees" value="' + UI.escapeHtml(stop && stop.monthlyFees != null ? stop.monthlyFees : '') + '"></div>'
            + '<button type="button" class="btn-remove-stop">x</button>'
            + '</div>';
    }

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.routeTitle, row.pickupPoint, row.monthlyFees, row.distance, row.pickupTime].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                const reorder = '<button type="button" class="btn-action btn-reorder" data-id="' + UI.escapeHtml(row.id) + '" title="Reorder"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line></svg></button>';
                return '<tr><td>' + UI.escapeHtml(row.routeTitle) + '</td><td>' + UI.escapeHtml(row.pickupPoint) + '</td><td>' + UI.escapeHtml(UI.display(row.monthlyFees)) + '</td><td>' + UI.escapeHtml(UI.display(row.distance)) + '</td><td>' + UI.escapeHtml(UI.display(row.pickupTime)) + '</td><td>' + UI.actionButtons(row.id, reorder) + '</td></tr>';
            }).join('')
            : UI.emptyRow(6);
        UI.renderFooter(data.length, slice, state);
    }

    document.getElementById('addStopBtn').addEventListener('click', function () {
        form.reset();
        modalTitle.textContent = 'Add Route Pickup Point';
        stopsContainer.innerHTML = stopRow(null);
        UI.openModal('stopModal');
    });
    document.getElementById('addMoreStopBtn').addEventListener('click', function () {
        stopsContainer.insertAdjacentHTML('beforeend', stopRow(null));
    });
    document.getElementById('stopModalClose').addEventListener('click', function () { UI.closeModal('stopModal'); });
    document.getElementById('stopModalOverlay').addEventListener('click', function () { UI.closeModal('stopModal'); });
    stopsContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-remove-stop');
        if (!btn) return;
        const rows = stopsContainer.querySelectorAll('.stop-row');
        if (rows.length === 1) return;
        btn.closest('.stop-row').remove();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const stops = Array.from(stopsContainer.querySelectorAll('.stop-row')).map(function (row) {
            return {
                pickupPointId: row.querySelector('.stop-pickup').value,
                distance: row.querySelector('.stop-distance').value,
                pickupTime: row.querySelector('.stop-time').value,
                monthlyFees: row.querySelector('.stop-fees').value
            };
        });
        try {
            const data = await UI.fetchJson('/api/transport/route-stops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routeId: routeSelect.value, stops: stops })
            });
            UI.closeModal('stopModal');
            await load();
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const reorderBtn = e.target.closest('.btn-reorder');
        if (reorderBtn) {
            const ids = filtered().map(function (row) { return row.id; });
            const current = reorderBtn.getAttribute('data-id');
            const index = ids.indexOf(Number(current) === Number(current) ? Number(current) : current);
            const numericIds = filtered().map(function (row) { return row.id; });
            const pos = numericIds.findIndex(function (id) { return String(id) === String(current); });
            if (pos > 0) {
                const swap = numericIds[pos - 1];
                numericIds[pos - 1] = numericIds[pos];
                numericIds[pos] = swap;
            }
            try {
                await UI.fetchJson('/api/transport/route-stops/reorder', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: numericIds })
                });
                await load();
            } catch (err) {
                UI.error(err.message);
            }
            return;
        }
        if (editBtn) {
            const row = state.rows.find(function (item) { return String(item.id) === editBtn.getAttribute('data-id'); });
            if (!row) return;
            try {
                const detail = await UI.fetchJson('/api/transport/route-stops/route/' + encodeURIComponent(row.routeId));
                routeSelect.value = detail.routeId;
                modalTitle.textContent = 'Edit Route Pickup Point';
                stopsContainer.innerHTML = (detail.stops || []).map(stopRow).join('') || stopRow(null);
                UI.openModal('stopModal');
            } catch (err) {
                UI.error(err.message);
            }
            return;
        }
        if (!deleteBtn) return;
        const result = await Swal.fire({ icon: 'warning', title: 'Delete Route Pickup Point?', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
        if (!result.isConfirmed) return;
        try {
            await UI.fetchJson('/api/transport/route-stops/' + encodeURIComponent(deleteBtn.getAttribute('data-id')), { method: 'DELETE' });
            await load();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function load() {
        const options = await UI.fetchJson('/api/transport/options');
        state.pickupPoints = options.pickupPoints || [];
        routeSelect.innerHTML = '<option value="">Select</option>' + (options.routes || []).map(function (route) {
            return '<option value="' + UI.escapeHtml(route.id) + '">' + UI.escapeHtml(route.title) + '</option>';
        }).join('');
        state.rows = await UI.fetchJson('/api/transport/route-stops');
        render();
    }

    UI.bindPaging(state, render);
    UI.bindExport('route-pickup-points', ['Route', 'Pickup Point', 'Monthly Fees', 'Distance', 'Pickup Time'], function () {
        return filtered().map(function (row) {
            return [row.routeTitle, row.pickupPoint, row.monthlyFees, row.distance, row.pickupTime];
        });
    });
    load().catch(function (err) { UI.error(err.message); });
});
