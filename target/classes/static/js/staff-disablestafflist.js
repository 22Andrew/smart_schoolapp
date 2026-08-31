(function () {
    'use strict';

    let roleFilter;
    let keywordFilter;
    let roleSearchBtn;
    let keywordSearchBtn;
    let cardViewBtn;
    let listViewBtn;
    let staffCardGrid;
    let staffListWrap;
    let staffListBody;
    let staffNoRecord;

    let currentView = 'card';
    let allDisabledStaff = [];
    let staffRecords = [];
    let listCurrentPage = 1;
    let listPageSize = 50;
    let listTableSearch = '';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        roleFilter = document.getElementById('roleFilter');
        keywordFilter = document.getElementById('keywordFilter');
        roleSearchBtn = document.getElementById('roleSearchBtn');
        keywordSearchBtn = document.getElementById('keywordSearchBtn');
        cardViewBtn = document.getElementById('cardViewBtn');
        listViewBtn = document.getElementById('listViewBtn');
        staffCardGrid = document.getElementById('staffCardGrid');
        staffListWrap = document.getElementById('staffListWrap');
        staffListBody = document.getElementById('staffListBody');
        staffNoRecord = document.getElementById('staffNoRecord');

        bindEvents();
        bootstrapPage();
    }

    async function bootstrapPage() {
        try {
            await loadFormOptions();
        } catch (error) {
            console.warn('Failed to load staff form options', error);
        }
        await loadAllDisabledStaff();
    }

    function bindEvents() {
        roleSearchBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            searchStaff('role');
        });
        keywordSearchBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            searchStaff('keyword');
        });
        keywordFilter?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchStaff('keyword');
            }
        });
        cardViewBtn?.addEventListener('click', () => setViewMode('card'));
        listViewBtn?.addEventListener('click', () => setViewMode('list'));

        document.getElementById('staffTableSearch')?.addEventListener('input', (event) => {
            listTableSearch = event.target.value.trim().toLowerCase();
            listCurrentPage = 1;
            renderStaffList();
        });

        document.getElementById('staffEntriesSelect')?.addEventListener('change', (event) => {
            listPageSize = parseInt(event.target.value, 10) || 50;
            listCurrentPage = 1;
            renderStaffList();
        });

        document.getElementById('staffCopyBtn')?.addEventListener('click', handleCopy);
        document.getElementById('staffExcelBtn')?.addEventListener('click', handleExcelExport);
        document.getElementById('staffCsvBtn')?.addEventListener('click', handleCSVExport);
        document.getElementById('staffPdfBtn')?.addEventListener('click', handlePDFExport);
        document.getElementById('staffPrintBtn')?.addEventListener('click', () => window.print());

        staffListBody?.addEventListener('click', (event) => {
            const enableBtn = event.target.closest('.btn-enable-staff');
            if (!enableBtn) return;
            enableStaff(enableBtn.getAttribute('data-id'));
        });

        staffCardGrid?.addEventListener('click', (event) => {
            const enableBtn = event.target.closest('.btn-enable-staff-card');
            if (!enableBtn) return;
            enableStaff(enableBtn.getAttribute('data-id'));
        });
    }

    async function loadFormOptions() {
        const response = await fetch('/api/staff/form-options');
        if (!response.ok) throw new Error('Failed to load form options');
        const options = await response.json();
        populateSelect(roleFilter, options.roles || [], 'Select');
    }

    function populateSelect(select, values, placeholder) {
        if (!select) return;
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = placeholder;
        select.appendChild(defaultOption);
        values.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    async function loadAllDisabledStaff() {
        try {
            const response = await fetch('/api/staff/disabled');
            if (!response.ok) throw new Error('Failed to load disabled staff');
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Failed to load disabled staff');
            }
            const payload = await response.json();
            if (!Array.isArray(payload)) {
                throw new Error('Invalid disabled staff response');
            }
            allDisabledStaff = payload;
            staffRecords = [...allDisabledStaff];
            listCurrentPage = 1;
            renderStaff();
        } catch (error) {
            allDisabledStaff = [];
            staffRecords = [];
            renderStaff();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load disabled staff',
                confirmButtonColor: '#ef4444'
            });
        }
    }

    function searchStaff(type) {
        listTableSearch = '';
        const tableSearch = document.getElementById('staffTableSearch');
        if (tableSearch) tableSearch.value = '';

        if (type === 'role') {
            const role = roleFilter?.value.trim() || '';
            if (!role) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Select Role',
                    text: 'Please select a role before searching.',
                    confirmButtonColor: getThemeColor()
                });
                return;
            }
            if (keywordFilter) keywordFilter.value = '';
            staffRecords = allDisabledStaff.filter((staff) => staffMatchesRole(staff, role));
        } else {
            const keyword = keywordFilter?.value.trim() || '';
            if (roleFilter) roleFilter.value = '';
            if (!keyword) {
                staffRecords = [...allDisabledStaff];
            } else {
                staffRecords = allDisabledStaff.filter((staff) => staffMatchesKeyword(staff, keyword));
            }
        }

        listCurrentPage = 1;
        renderStaff();
    }

    function staffMatchesRole(staff, role) {
        const target = role.trim().toLowerCase();
        if (!target) return true;
        const roles = Array.isArray(staff.roles) ? staff.roles : [];
        if (roles.some((item) => String(item).trim().toLowerCase() === target)) {
            return true;
        }
        const roleText = getRoleText(staff).toLowerCase();
        return roleText.includes(target);
    }

    function staffMatchesKeyword(staff, keyword) {
        const target = keyword.trim().toLowerCase();
        if (!target) return true;
        const haystack = [
            staff.staffId,
            staff.fullName,
            staff.firstName,
            staff.lastName,
            getRoleText(staff),
            staff.department,
            staff.designation,
            staff.phone,
            staff.panNumber,
            staff.email,
            staff.location
        ].join(' ').toLowerCase();
        return haystack.includes(target);
    }

    function getThemeColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#8b5cf6';
    }

    function setViewMode(mode) {
        currentView = mode;
        cardViewBtn?.classList.toggle('active', mode === 'card');
        listViewBtn?.classList.toggle('active', mode === 'list');
        renderStaff();
    }

    function renderStaff() {
        const hasRecords = staffRecords.length > 0;
        if (staffNoRecord) staffNoRecord.hidden = hasRecords;
        if (staffCardGrid) staffCardGrid.hidden = !hasRecords || currentView !== 'card';
        if (staffListWrap) staffListWrap.hidden = !hasRecords || currentView !== 'list';

        if (!hasRecords) {
            if (staffCardGrid) staffCardGrid.innerHTML = '';
            if (staffListBody) staffListBody.innerHTML = '';
            return;
        }

        if (currentView === 'card') {
            if (staffListBody) staffListBody.innerHTML = '';
            if (staffCardGrid) staffCardGrid.innerHTML = staffRecords.map(renderCard).join('');
        } else {
            if (staffCardGrid) staffCardGrid.innerHTML = '';
            renderStaffList();
        }
    }

    function getRoleText(staff) {
        if (staff.role) return staff.role;
        if (Array.isArray(staff.roles) && staff.roles.length) return staff.roles.join(', ');
        return '-';
    }

    function getFilteredListRecords() {
        let rows = [...staffRecords];
        if (listTableSearch) {
            rows = rows.filter((staff) => staffMatchesKeyword(staff, listTableSearch));
        }
        return rows;
    }

    function renderStaffList() {
        const rows = getFilteredListRecords();
        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / listPageSize));
        if (listCurrentPage > totalPages) listCurrentPage = totalPages;

        const start = (listCurrentPage - 1) * listPageSize;
        const pageRows = rows.slice(start, start + listPageSize);

        if (!staffListBody) return;

        if (!pageRows.length) {
            staffListBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No disabled staff found</td></tr>';
        } else {
            staffListBody.innerHTML = pageRows.map((staff) => `
                <tr>
                    <td>${escapeHtml(staff.staffId || '')}</td>
                    <td>${escapeHtml(staff.fullName || '')}</td>
                    <td>${escapeHtml(getRoleText(staff))}</td>
                    <td>${escapeHtml(staff.department || '-')}</td>
                    <td>${escapeHtml(staff.designation || '-')}</td>
                    <td>${escapeHtml(staff.phone || '-')}</td>
                    <td>${escapeHtml(staff.panNumber || '-')}</td>
                    <td><button type="button" class="btn-enable-staff" data-id="${escapeHtml(staff.id)}">Enable</button></td>
                </tr>
            `).join('');
        }

        document.getElementById('staffShowingStart').textContent = total ? start + 1 : 0;
        document.getElementById('staffShowingEnd').textContent = total ? Math.min(start + listPageSize, total) : 0;
        document.getElementById('staffTotalEntries').textContent = total;
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('staffPagination');
        if (!pagination) return;

        let html = `<button type="button" class="staff-pagination-btn" data-page="prev" ${listCurrentPage <= 1 ? 'disabled' : ''}>&lsaquo;</button>`;
        const maxButtons = Math.min(totalPages, 5);
        for (let i = 1; i <= maxButtons; i++) {
            html += `<button type="button" class="staff-pagination-btn${i === listCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button type="button" class="staff-pagination-btn" data-page="next" ${listCurrentPage >= totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
        pagination.innerHTML = html;

        pagination.querySelectorAll('.staff-pagination-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                const page = btn.getAttribute('data-page');
                if (page === 'prev') listCurrentPage = Math.max(1, listCurrentPage - 1);
                else if (page === 'next') listCurrentPage = Math.min(totalPages, listCurrentPage + 1);
                else listCurrentPage = parseInt(page, 10) || 1;
                renderStaffList();
            });
        });
    }

    function renderCard(staff) {
        const roles = Array.isArray(staff.roles) ? staff.roles : [];
        const roleTags = roles.map((role) => `<span class="staff-role-tag">${escapeHtml(role)}</span>`).join('');
        const photo = staff.photoPath
            ? `<img src="${escapeHtml(staff.photoPath)}" alt="${escapeHtml(staff.fullName)}">`
            : `<div class="staff-no-photo">
                    <svg class="staff-no-photo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    NO IMAGE<br>AVAILABLE
               </div>`;
        const locationLine = staff.location || staff.department || '-';

        return `
            <article class="staff-card" data-staff-id="${escapeHtml(staff.id)}">
                <div class="staff-card-photo">${photo}</div>
                <div class="staff-card-body">
                    <h3 class="staff-card-name">${escapeHtml(staff.fullName || '')}</h3>
                    <div class="staff-card-meta">
                        <div>${escapeHtml(staff.staffId || '')}</div>
                        <div>${escapeHtml(staff.phone || '')}</div>
                        <div>${escapeHtml(locationLine)}</div>
                    </div>
                    <div class="staff-role-tags">${roleTags}</div>
                </div>
                <div class="staff-card-actions">
                    <button type="button" class="btn-enable-staff-card" data-id="${escapeHtml(staff.id)}" title="Enable Staff">Enable</button>
                </div>
            </article>
        `;
    }

    async function enableStaff(id) {
        const confirm = await Swal.fire({
            icon: 'question',
            title: 'Enable staff member?',
            text: 'This will restore the staff member to the active directory.',
            showCancelButton: true,
            confirmButtonColor: getThemeColor(),
            confirmButtonText: 'Enable'
        });
        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch(`/api/staff/${id}/enable`, { method: 'POST' });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Failed to enable staff member');
            await loadAllDisabledStaff();
            Swal.fire({ icon: 'success', title: 'Enabled', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#ef4444' });
        }
    }

    function handleCopy() {
        const rows = getFilteredListRecords();
        const text = rows.map((staff) => [
            staff.staffId, staff.fullName, getRoleText(staff), staff.department,
            staff.designation, staff.phone, staff.panNumber
        ].join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied!', timer: 1200, showConfirmButton: false });
    }

    function handleExcelExport() {
        const rows = getFilteredListRecords().map((staff) => ({
            'Staff ID': staff.staffId,
            Name: staff.fullName,
            Role: getRoleText(staff),
            Department: staff.department,
            Designation: staff.designation,
            'Mobile Number': staff.phone,
            'PAN Number': staff.panNumber
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Disabled Staff');
        XLSX.writeFile(wb, 'disabled_staff.xlsx');
    }

    function handleCSVExport() {
        const headers = ['Staff ID', 'Name', 'Role', 'Department', 'Designation', 'Mobile Number', 'PAN Number'];
        const csv = [headers, ...getFilteredListRecords().map((staff) => [
            staff.staffId, staff.fullName, getRoleText(staff), staff.department,
            staff.designation, staff.phone, staff.panNumber
        ])].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'disabled_staff.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function handlePDFExport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        const body = getFilteredListRecords().map((staff) => [
            staff.staffId, staff.fullName, getRoleText(staff), staff.department,
            staff.designation, staff.phone, staff.panNumber
        ]);
        doc.autoTable({
            head: [['Staff ID', 'Name', 'Role', 'Department', 'Designation', 'Mobile Number', 'PAN Number']],
            body,
            theme: 'grid',
            headStyles: { fillColor: hexToRgb(getThemeColor()) },
            styles: { fontSize: 8 }
        });
        doc.save('disabled_staff.pdf');
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function hexToRgb(hex) {
        const cleaned = (hex || '#8b5cf6').replace('#', '');
        if (cleaned.length !== 6) return [139, 92, 246];
        return [
            parseInt(cleaned.slice(0, 2), 16),
            parseInt(cleaned.slice(2, 4), 16),
            parseInt(cleaned.slice(4, 6), 16)
        ];
    }
})();
