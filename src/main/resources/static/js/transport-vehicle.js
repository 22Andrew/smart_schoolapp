document.addEventListener('DOMContentLoaded', function () {
    const UI = window.TransportUI;
    const form = document.getElementById('vehicleForm');
    const modalTitle = document.getElementById('vehicleModalTitle');
    const idInput = document.getElementById('vehicleId');
    const tableBody = document.getElementById('vehicleTableBody');
    const viewBody = document.getElementById('vehicleViewBody');
    const state = { rows: [], currentPage: 1 };

    function val(id) { return document.getElementById(id).value.trim(); }
    function setVal(id, value) { document.getElementById(id).value = value || ''; }

    function filtered() {
        const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
        return state.rows.filter(function (row) {
            return [row.vehicleNumber, row.vehicleModel, row.driverName, row.driverContact].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }

    function render() {
        const data = filtered();
        const slice = UI.pageSlice(data, state);
        tableBody.innerHTML = slice.pageRows.length
            ? slice.pageRows.map(function (row) {
                const viewBtn = '<button type="button" class="btn-action btn-view" data-id="' + UI.escapeHtml(row.id) + '" title="View"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>';
                return '<tr><td>' + UI.escapeHtml(row.vehicleNumber) + '</td><td>' + UI.escapeHtml(row.vehicleModel) + '</td><td>' + UI.escapeHtml(row.yearMade) + '</td><td>' + UI.escapeHtml(row.driverName) + '</td><td>' + UI.escapeHtml(row.driverLicence) + '</td><td>' + UI.escapeHtml(row.driverContact) + '</td><td>' + UI.actionButtons(row.id, viewBtn) + '</td></tr>';
            }).join('')
            : UI.emptyRow(7);
        UI.renderFooter(data.length, slice, state);
    }

    function fillForm(row) {
        idInput.value = row ? row.id : '';
        setVal('vehicleNumber', row && row.vehicleNumber);
        setVal('vehicleModel', row && row.vehicleModel);
        setVal('yearMade', row && row.yearMade);
        setVal('registrationNumber', row && row.registrationNumber);
        setVal('chassisNumber', row && row.chassisNumber);
        setVal('maxSeatingCapacity', row && row.maxSeatingCapacity);
        setVal('driverName', row && row.driverName);
        setVal('driverLicence', row && row.driverLicence);
        setVal('driverContact', row && row.driverContact);
        setVal('note', row && row.note);
        document.getElementById('vehiclePhoto').value = '';
        resetPhotoDropzone();
    }

    function resetPhotoDropzone() {
        const dropzone = document.getElementById('vehiclePhotoDropzone');
        const label = document.getElementById('vehiclePhotoLabel');
        if (label) label.textContent = 'Drag and drop a file here or click';
        if (dropzone) dropzone.classList.remove('has-file', 'dragover');
    }

    function bindPhotoDropzone() {
        const dropzone = document.getElementById('vehiclePhotoDropzone');
        const input = document.getElementById('vehiclePhoto');
        const label = document.getElementById('vehiclePhotoLabel');
        if (!dropzone || !input || !label) return;

        function showName() {
            const file = input.files && input.files[0];
            label.textContent = file ? file.name : 'Drag and drop a file here or click';
            dropzone.classList.toggle('has-file', !!file);
        }

        dropzone.addEventListener('click', function (e) {
            if (e.target === input) return;
            input.click();
        });
        input.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        input.addEventListener('change', showName);
        dropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', function () {
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                input.files = e.dataTransfer.files;
                showName();
            }
        });
    }

    document.getElementById('addVehicleBtn').addEventListener('click', function () {
        fillForm(null);
        modalTitle.textContent = 'Add Vehicle';
        UI.openModal('vehicleModal');
    });
    document.getElementById('vehicleModalClose').addEventListener('click', function () { UI.closeModal('vehicleModal'); });
    document.getElementById('vehicleModalOverlay').addEventListener('click', function () { UI.closeModal('vehicleModal'); });
    document.getElementById('vehicleViewClose').addEventListener('click', function () { UI.closeModal('vehicleViewModal'); });
    document.getElementById('vehicleViewOverlay').addEventListener('click', function () { UI.closeModal('vehicleViewModal'); });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!val('vehicleNumber')) {
            Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Vehicle Number is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        const body = new FormData(form);
        const id = idInput.value;
        try {
            const data = await UI.fetchJson(id ? '/api/transport/vehicles/' + encodeURIComponent(id) : '/api/transport/vehicles', {
                method: id ? 'PUT' : 'POST',
                body: body
            });
            UI.closeModal('vehicleModal');
            await load();
            UI.toast(data.message);
        } catch (err) {
            UI.error(err.message);
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const viewBtn = e.target.closest('.btn-view');
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const row = state.rows.find(function (item) {
            const id = (viewBtn || editBtn || deleteBtn || {}).getAttribute && (viewBtn || editBtn || deleteBtn).getAttribute('data-id');
            return String(item.id) === String(id);
        });
        if (viewBtn && row) {
            const field = function (label, value) {
                return '<div class="vehicle-details-field"><strong>' + UI.escapeHtml(label) + '</strong> ' + UI.escapeHtml(UI.display(value)) + '</div>';
            };
            const fallback = ''
                + '<span class="vehicle-details-photo-fallback"' + (row.photoPath ? ' style="display:none"' : '') + '>'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">'
                + '<rect x="3" y="3" width="18" height="18" rx="2"></rect>'
                + '<circle cx="8.5" cy="8.5" r="1.5"></circle>'
                + '<path d="M21 15l-5-5L5 21"></path>'
                + '</svg></span>';
            const photo = row.photoPath
                ? '<img src="' + UI.escapeHtml(row.photoPath) + '" alt="Vehicle photo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' + fallback
                : fallback;
            viewBody.innerHTML = ''
                + '<div class="vehicle-details-grid">'
                + '<div><span class="vehicle-details-photo-label">Vehicle Photo</span><div class="vehicle-details-photo-box">' + photo + '</div></div>'
                + '<div class="vehicle-details-column">'
                + field('Vehicle Number:', row.vehicleNumber)
                + field('Registration Number:', row.registrationNumber)
                + field('Driver Name:', row.driverName)
                + '</div>'
                + '<div class="vehicle-details-column">'
                + field('Vehicle Model:', row.vehicleModel)
                + field('Chassis Number:', row.chassisNumber)
                + field('Driver Licence:', row.driverLicence)
                + '</div>'
                + '<div class="vehicle-details-column">'
                + field('Year Made:', row.yearMade)
                + field('Max Seating Capacity:', row.maxSeatingCapacity)
                + field('Driver Contact:', row.driverContact)
                + '</div>'
                + '</div>'
                + '<div class="vehicle-details-note"><strong>Note:</strong> ' + UI.escapeHtml(UI.display(row.note)) + '</div>';
            UI.openModal('vehicleViewModal');
            return;
        }
        if (editBtn && row) {
            fillForm(row);
            modalTitle.textContent = 'Edit Vehicle';
            UI.openModal('vehicleModal');
            return;
        }
        if (!deleteBtn) return;
        const result = await Swal.fire({ icon: 'warning', title: 'Delete Vehicle?', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
        if (!result.isConfirmed) return;
        try {
            await UI.fetchJson('/api/transport/vehicles/' + encodeURIComponent(deleteBtn.getAttribute('data-id')), { method: 'DELETE' });
            await load();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        } catch (err) {
            UI.error(err.message);
        }
    });

    async function load() {
        state.rows = await UI.fetchJson('/api/transport/vehicles');
        render();
    }

    UI.bindPaging(state, render);
    UI.bindExport('vehicles', ['Vehicle Number', 'Model', 'Year Made', 'Driver Name', 'Licence', 'Contact'], function () {
        return filtered().map(function (row) {
            return [row.vehicleNumber, row.vehicleModel, row.yearMade, row.driverName, row.driverLicence, row.driverContact];
        });
    });
    load().catch(function (err) { UI.error(err.message); });
    bindPhotoDropzone();
});
