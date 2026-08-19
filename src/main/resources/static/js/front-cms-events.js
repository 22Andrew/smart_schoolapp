document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('eventTableBody');
    const searchInput = document.getElementById('searchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const titleEl = document.getElementById('eventModalTitle');
    const submitBtn = document.getElementById('eventSubmitBtn');
    const state = { rows: [], currentPage: 1, sortKey: 'startDate', sortDir: 'desc', removeImage: false };

    function setFeaturedPreview(url, fileName) {
        const preview = document.getElementById('eventImagePreview');
        const area = document.getElementById('eventFileUploadArea');
        const label = document.getElementById('eventImageLabel');
        const deleteBtn = document.getElementById('eventDeleteImageBtn');
        if (preview) {
            if (url) {
                preview.src = url;
                preview.classList.add('visible');
                if (area) area.classList.add('has-preview');
            } else {
                preview.removeAttribute('src');
                preview.classList.remove('visible');
                if (area) area.classList.remove('has-preview');
            }
        }
        if (label) label.textContent = fileName || 'Drag and drop a file here or click';
        if (deleteBtn) deleteBtn.classList.toggle('visible', Boolean(url));
    }

    function wrapSelection(tag) {
        const area = document.getElementById('eventDescription');
        if (!area) return;
        const start = area.selectionStart;
        const end = area.selectionEnd;
        const value = area.value;
        const selected = value.slice(start, end) || 'text';
        let next = selected;
        if (tag === 'b') next = '<b>' + selected + '</b>';
        else if (tag === 'i') next = '<i>' + selected + '</i>';
        else if (tag === 'u') next = '<u>' + selected + '</u>';
        else if (tag === 'small') next = '<small>' + selected + '</small>';
        else if (tag === 'quote') next = '"' + selected + '"';
        else if (tag === 'ul') next = '\n- ' + selected;
        else if (tag === 'ol') next = '\n1. ' + selected;
        area.setRangeText(next, start, end, 'end');
        area.focus();
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function stripHtml(value) {
        const div = document.createElement('div');
        div.innerHTML = value == null ? '' : String(value);
        return (div.textContent || div.innerText || '').trim();
    }

    function formatDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        return parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    function longDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (isNaN(date.getTime())) return formatDate(value);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function slashDate(value) {
        if (!value) return '';
        const parts = String(value).split('T')[0].split('-');
        if (parts.length !== 3) return String(value);
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    function tooltipContent(row) {
        const description = escapeHtml(stripHtml(row.description || ''));
        const date = escapeHtml(longDate(row.startDate));
        const start = slashDate(row.startDate);
        const end = slashDate(row.endDate);
        const time = end && end !== start ? start + ' to ' + end : start;
        const venue = escapeHtml(row.venue || '');
        const theme = escapeHtml(row.title || '');
        return (description ? '<p class="event-title-tooltip-desc">' + description + '</p>' : '')
            + '<div class="event-title-tooltip-details">'
            + '<div class="event-title-tooltip-heading">Event Details:</div>'
            + '<div><span>Date:</span> ' + date + '</div>'
            + '<div><span>Time:</span> ' + escapeHtml(time) + '</div>'
            + '<div><span>Venue:</span> ' + venue + '</div>'
            + '<div><span>Theme:</span> ' + theme + '</div>'
            + '</div>';
    }

    function dateLabel(row) {
        const start = formatDate(row.startDate);
        const end = formatDate(row.endDate);
        if (start && end && end !== start) return start + ' - ' + end;
        return start;
    }

    function pageSize() {
        return parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    }

    function columnVisible(index) {
        const toggle = document.querySelector('#columnVisibilityDropdown .column-toggle[data-column="' + index + '"]');
        return !toggle || toggle.checked;
    }

    function filtered() {
        const keyword = (searchInput && searchInput.value || '').toLowerCase();
        const rows = state.rows.filter(function (row) {
            return [row.title, dateLabel(row), row.venue, row.description]
                .some(function (value) { return String(value || '').toLowerCase().includes(keyword); });
        });
        const key = state.sortKey;
        const dir = state.sortDir === 'desc' ? -1 : 1;
        return rows.slice().sort(function (a, b) {
            const left = String(a[key] || '').toLowerCase();
            const right = String(b[key] || '').toLowerCase();
            if (left < right) return -1 * dir;
            if (left > right) return 1 * dir;
            return 0;
        });
    }

    function render() {
        const data = filtered();
        const size = pageSize();
        const totalPages = Math.max(1, Math.ceil(data.length / size) || 1);
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        const start = (state.currentPage - 1) * size;
        const pageRows = data.slice(start, start + size);
        tableBody.innerHTML = pageRows.length ? pageRows.map(function (row) {
            return '<tr data-id="' + row.id + '">'
                + '<td' + (columnVisible(0) ? '' : ' style="display:none"') + '><span class="event-title-tip" data-id="' + row.id + '">' + escapeHtml(row.title) + '</span></td>'
                + '<td' + (columnVisible(1) ? '' : ' style="display:none"') + '>' + escapeHtml(dateLabel(row)) + '</td>'
                + '<td' + (columnVisible(2) ? '' : ' style="display:none"') + '>' + escapeHtml(row.venue) + '</td>'
                + '<td' + (columnVisible(3) ? '' : ' style="display:none"') + '><div class="list-actions">'
                + '<button type="button" class="btn-action" data-edit="' + row.id + '" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
                + '<button type="button" class="btn-action" data-delete="' + row.id + '" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
                + '</div></td></tr>';
        }).join('') : '<tr><td colspan="4" class="empty-message">No data available in table</td></tr>';
        const from = data.length ? start + 1 : 0;
        const to = Math.min(start + size, data.length);
        showingInfo.textContent = 'Showing ' + from + ' to ' + to + ' of ' + data.length + ' entries';
        let html = '<button type="button" class="pagination-btn" data-nav="prev"' + (state.currentPage <= 1 ? ' disabled' : '') + '>&lt;</button>';
        for (let i = 1; i <= totalPages; i++) {
            html += '<button type="button" class="pagination-btn' + (i === state.currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"' + (state.currentPage >= totalPages ? ' disabled' : '') + '>&gt;</button>';
        pagination.innerHTML = html;
        document.querySelectorAll('#eventTable thead th').forEach(function (th, index) {
            th.style.display = columnVisible(index) ? '' : 'none';
            if (th.dataset.sort) {
                th.classList.toggle('sorted-asc', state.sortKey === th.dataset.sort && state.sortDir === 'asc');
                th.classList.toggle('sorted-desc', state.sortKey === th.dataset.sort && state.sortDir === 'desc');
            }
        });
    }

    async function load() {
        try {
            const payload = await fetch('/api/front/events').then(function (r) { return r.json(); });
            state.rows = Array.isArray(payload) ? payload : [];
        } catch (err) {
            state.rows = [];
        }
        render();
    }

    function openModal(row) {
        form.reset();
        state.removeImage = false;
        document.getElementById('eventId').value = row && row.id ? row.id : '';
        document.getElementById('eventTitle').value = row ? row.title || '' : '';
        document.getElementById('eventStartDate').value = row && row.startDate ? String(row.startDate).slice(0, 10) : '';
        document.getElementById('eventEndDate').value = row && row.endDate ? String(row.endDate).slice(0, 10) : '';
        document.getElementById('eventVenue').value = row ? row.venue || '' : '';
        document.getElementById('eventDescription').value = row ? row.description || '' : '';
        document.getElementById('eventMsgStudent').checked = Boolean(row && row.messageToStudent);
        document.getElementById('eventMsgGuardian').checked = Boolean(row && row.messageToGuardian);
        document.getElementById('eventMsgStaff').checked = Boolean(row && row.messageToStaff);
        document.getElementById('eventSidebarYes').checked = !row || row.showSidebar !== false;
        document.getElementById('eventSidebarNo').checked = Boolean(row && row.showSidebar === false);
        document.getElementById('eventMetaTitle').value = row ? row.metaTitle || '' : '';
        document.getElementById('eventMetaKeyword').value = row ? row.metaKeyword || '' : '';
        document.getElementById('eventMetaDescription').value = row ? row.metaDescription || '' : '';
        document.getElementById('eventSeoFields').classList.remove('open');
        document.getElementById('eventSeoPlus').textContent = '+';
        titleEl.textContent = row && row.id ? 'Edit Event' : 'Add Event';
        submitBtn.textContent = 'Save';
        setFeaturedPreview(row && row.imageUrl ? row.imageUrl : '', row && row.imageUrl ? row.imageUrl.split('/').pop() : '');
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    const imageInput = document.getElementById('eventImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = imageInput.files && imageInput.files[0];
            state.removeImage = false;
            if (file) {
                setFeaturedPreview(URL.createObjectURL(file), file.name);
            } else {
                setFeaturedPreview('', '');
            }
        });
    }

    const deleteImageBtn = document.getElementById('eventDeleteImageBtn');
    if (deleteImageBtn) {
        deleteImageBtn.addEventListener('click', function () {
            if (imageInput) imageInput.value = '';
            state.removeImage = true;
            setFeaturedPreview('', '');
        });
    }

    const seoToggle = document.getElementById('eventSeoToggle');
    if (seoToggle) {
        seoToggle.addEventListener('click', function () {
            const fields = document.getElementById('eventSeoFields');
            const plus = document.getElementById('eventSeoPlus');
            const open = fields.classList.toggle('open');
            plus.textContent = open ? '−' : '+';
        });
    }

    document.querySelectorAll('.event-modal .editor-toolbar [data-wrap]').forEach(function (btn) {
        btn.addEventListener('click', function () { wrapSelection(btn.dataset.wrap); });
    });

    const mediaInput = document.getElementById('eventMediaInput');
    const addMediaBtn = document.getElementById('eventAddMediaBtn');
    if (addMediaBtn && mediaInput) {
        addMediaBtn.addEventListener('click', function () { mediaInput.click(); });
        mediaInput.addEventListener('change', async function () {
            const file = mediaInput.files && mediaInput.files[0];
            mediaInput.value = '';
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch('/api/front/events/media', { method: 'POST', body: formData });
                const result = await response.json().catch(function () { return {}; });
                if (!response.ok || result.success === false) throw new Error(result.message || 'Media upload failed');
                const url = result.data && result.data.url;
                const area = document.getElementById('eventDescription');
                if (url && area) {
                    const snippet = (area.value ? '\n' : '') + '<img src="' + url + '" alt="' + (file.name || 'media') + '">\n';
                    area.value += snippet;
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to add media.', confirmButtonColor: '#8b5cf6' });
            }
        });
    }

    document.getElementById('addEventBtn').addEventListener('click', function () { openModal(null); });
    document.getElementById('eventModalClose').addEventListener('click', closeModal);
    document.getElementById('eventModalOverlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('eventId').value;
        const payload = {
            title: document.getElementById('eventTitle').value.trim(),
            startDate: document.getElementById('eventStartDate').value,
            endDate: document.getElementById('eventEndDate').value || null,
            venue: document.getElementById('eventVenue').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            showSidebar: document.getElementById('eventSidebarYes').checked,
            messageToStudent: document.getElementById('eventMsgStudent').checked,
            messageToGuardian: document.getElementById('eventMsgGuardian').checked,
            messageToStaff: document.getElementById('eventMsgStaff').checked,
            metaTitle: document.getElementById('eventMetaTitle').value.trim(),
            metaKeyword: document.getElementById('eventMetaKeyword').value.trim(),
            metaDescription: document.getElementById('eventMetaDescription').value.trim(),
            removeImage: state.removeImage
        };
        try {
            const response = await fetch(id ? '/api/front/events/' + id : '/api/front/events', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            const savedId = (result.data && result.data.id) || id;
            const featuredInput = document.getElementById('eventImageInput');
            if (savedId && featuredInput && featuredInput.files && featuredInput.files[0]) {
                const formData = new FormData();
                formData.append('file', featuredInput.files[0]);
                const imageResponse = await fetch('/api/front/events/' + savedId + '/image', { method: 'POST', body: formData });
                const imageResult = await imageResponse.json().catch(function () { return {}; });
                if (!imageResponse.ok || imageResult.success === false) throw new Error(imageResult.message || 'Image upload failed');
            }
            closeModal();
            await load();
            Swal.fire({ icon: 'success', title: 'Success', text: result.message || 'Event saved successfully!', timer: 1400, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to save event.', confirmButtonColor: '#8b5cf6' });
        }
    });

    tableBody.addEventListener('click', async function (e) {
        const editBtn = e.target.closest('[data-edit]');
        const deleteBtn = e.target.closest('[data-delete]');
        if (editBtn) {
            const row = state.rows.find(function (item) { return String(item.id) === String(editBtn.dataset.edit); });
            if (row) openModal(row);
            return;
        }
        if (!deleteBtn) return;
        const id = deleteBtn.dataset.delete;
        const row = state.rows.find(function (item) { return String(item.id) === String(id); });
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete?',
            text: (row && row.title ? '"' + row.title + '" will be removed.' : 'This event will be removed.'),
            showCancelButton: true,
            confirmButtonColor: '#dc2626'
        });
        if (!confirm.isConfirmed) return;
        try {
            const response = await fetch('/api/front/events/' + id, { method: 'DELETE' });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || result.success === false) throw new Error(result.message || 'Delete failed');
            await load();
            Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1200, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    searchInput.addEventListener('input', function () { state.currentPage = 1; render(); });
    entriesSelect.addEventListener('change', function () { state.currentPage = 1; render(); });
    pagination.addEventListener('click', function (e) {
        const btn = e.target.closest('.pagination-btn');
        if (!btn || btn.disabled) return;
        if (btn.dataset.page) state.currentPage = parseInt(btn.dataset.page, 10);
        if (btn.dataset.nav === 'prev') state.currentPage -= 1;
        if (btn.dataset.nav === 'next') state.currentPage += 1;
        render();
    });
    document.querySelectorAll('#eventTable th.sortable').forEach(function (th) {
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

    function exportRows() {
        return filtered().map(function (row) { return [row.title, dateLabel(row), row.venue]; });
    }

    document.getElementById('copyBtn').addEventListener('click', function () {
        const text = [['Title', 'Date', 'Venue']].concat(exportRows()).map(function (row) { return row.join('\t'); }).join('\n');
        navigator.clipboard.writeText(text).then(function () {
            Swal.fire({ icon: 'success', title: 'Copied', timer: 1000, showConfirmButton: false });
        });
    });
    document.getElementById('excelBtn').addEventListener('click', function () {
        if (!window.XLSX) return;
        const sheet = XLSX.utils.aoa_to_sheet([['Title', 'Date', 'Venue']].concat(exportRows()));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, 'Events');
        XLSX.writeFile(wb, 'front-cms-events.xlsx');
    });
    document.getElementById('csvBtn').addEventListener('click', function () {
        const csv = [['Title', 'Date', 'Venue']].concat(exportRows()).map(function (row) {
            return row.map(function (value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; }).join(',');
        }).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = 'front-cms-events.csv';
        link.click();
    });
    document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
    document.getElementById('pdfBtn').addEventListener('click', function () { window.print(); });

    const tooltip = document.createElement('div');
    tooltip.className = 'event-title-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);
    let hideTimer = null;

    function hideTitleTooltip() {
        tooltip.classList.remove('active');
    }

    function showTitleTooltip(target) {
        const row = state.rows.find(function (item) { return String(item.id) === String(target.dataset.id); });
        if (!row) return;
        tooltip.innerHTML = tooltipContent(row);
        tooltip.classList.add('active');
        const rect = target.getBoundingClientRect();
        const tipRect = tooltip.getBoundingClientRect();
        let top = rect.top + (rect.height / 2) - (tipRect.height / 2);
        let left = rect.right + 14;
        if (left + tipRect.width > window.innerWidth - 12) {
            left = Math.max(12, rect.left - tipRect.width - 14);
            tooltip.classList.add('left');
        } else {
            tooltip.classList.remove('left');
        }
        if (top < 12) top = 12;
        if (top + tipRect.height > window.innerHeight - 12) {
            top = Math.max(12, window.innerHeight - tipRect.height - 12);
        }
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }

    tableBody.addEventListener('mouseover', function (e) {
        const tip = e.target.closest('.event-title-tip');
        if (!tip) return;
        clearTimeout(hideTimer);
        showTitleTooltip(tip);
    });
    tableBody.addEventListener('mouseout', function (e) {
        const tip = e.target.closest('.event-title-tip');
        if (!tip) return;
        const next = e.relatedTarget;
        if (next && (tip.contains(next) || tooltip.contains(next))) return;
        hideTimer = setTimeout(hideTitleTooltip, 80);
    });
    tooltip.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    tooltip.addEventListener('mouseleave', hideTitleTooltip);
    window.addEventListener('scroll', hideTitleTooltip, true);

    load();
});
