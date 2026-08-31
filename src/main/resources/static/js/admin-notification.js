let notices = [];
let viewingNoticeId = null;

const MESSAGE_TO_ROLES = [
    'Student', 'Parent', 'Admin', 'Teacher',
    'Accountant', 'Librarian', 'Receptionist', 'Super Admin'
];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('deleteNoticeBoardBtn')?.addEventListener('click', deleteAllNotices);
    document.getElementById('noticeDetailCloseBtn')?.addEventListener('click', closeDetailDrawer);
    document.getElementById('noticeDetailBackBtn')?.addEventListener('click', closeDetailDrawer);
    loadNotices();
});

async function loadNotices() {
    try {
        const response = await fetch('/api/communicate/notices');
        if (!response.ok) throw new Error('Failed to load notices');
        notices = await response.json();
        renderNoticeList();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load notices' });
    }
}

function renderNoticeList() {
    const list = document.getElementById('noticeBoardList');
    if (!list) return;
    list.innerHTML = '';

    if (!notices.length) {
        list.innerHTML = '<div class="notice-board-empty">No notices posted yet. Click "+ Post New Message" to add one.</div>';
        return;
    }

    notices.forEach(notice => {
        const item = document.createElement('div');
        item.className = 'notice-board-item';
        item.dataset.id = notice.id;
        item.innerHTML = `
            <div class="notice-board-item-main">
                <span class="notice-board-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </span>
                <button type="button" class="notice-board-item-link" data-id="${notice.id}">${escapeHtml(notice.title)}</button>
            </div>
            <div class="notice-board-item-actions">
                <button type="button" class="notice-board-action-btn notice-board-edit-btn" data-id="${notice.id}" title="Edit" aria-label="Edit notice">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                </button>
                <button type="button" class="notice-board-action-btn notice-board-delete-btn" data-id="${notice.id}" title="Delete" aria-label="Delete notice">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        item.querySelector('.notice-board-item-link').addEventListener('click', () => openDetailDrawer(notice.id));
        item.querySelector('.notice-board-edit-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            closeDetailDrawer();
            window.location.href = `/admin/notification/add?id=${notice.id}`;
        });
        item.querySelector('.notice-board-delete-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            deleteNotice(notice.id);
        });
        list.appendChild(item);
    });
}

function openDetailDrawer(id) {
    const notice = notices.find(item => item.id === id);
    if (!notice) return;

    viewingNoticeId = id;
    const drawer = document.getElementById('noticeDetailDrawer');
    const list = document.getElementById('noticeBoardList');

    document.getElementById('noticeDetailDrawerTitle').textContent = notice.title || 'Notice Details';
    document.getElementById('noticeDetailHeading').textContent = notice.title || '';
    document.getElementById('noticeDetailPublishDate').textContent = formatDisplayDate(notice.publishOn || notice.noticeDate);
    document.getElementById('noticeDetailNoticeDate').textContent = formatDisplayDate(notice.noticeDate);
    document.getElementById('noticeDetailCreatedBy').textContent = formatCreatedBy(notice);
    document.getElementById('noticeDetailRecipients').innerHTML = renderRecipientTags(notice);
    document.getElementById('noticeDetailMessage').innerHTML = notice.message || '<p>No message content.</p>';

    document.querySelectorAll('.notice-board-item').forEach(row => {
        row.classList.toggle('active-row', row.dataset.id === String(id));
    });

    drawer?.classList.add('active');
    drawer?.setAttribute('aria-hidden', 'false');
    list?.classList.add('drawer-open');
}

function closeDetailDrawer() {
    viewingNoticeId = null;
    const drawer = document.getElementById('noticeDetailDrawer');
    const list = document.getElementById('noticeBoardList');

    drawer?.classList.remove('active');
    drawer?.setAttribute('aria-hidden', 'true');
    list?.classList.remove('drawer-open');
    document.querySelectorAll('.notice-board-item.active-row').forEach(row => row.classList.remove('active-row'));
}

function formatDisplayDate(value) {
    if (!value) return '—';
    const parts = String(value).split('-');
    if (parts.length !== 3) return value;
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function formatCreatedBy(notice) {
    const creator = window.noticeBoardCreator || {};
    const name = creator.name || 'Admin';
    const id = creator.id ? ` (${creator.id})` : '';
    if (notice.createdAt) {
        return `${name}${id}`;
    }
    return `${name}${id}`;
}

function renderRecipientTags(notice) {
    const roles = parseMessageTo(notice.messageTo || notice.publishTo);
    if (!roles.length) {
        return '<span class="notice-detail-recipient">No recipients listed</span>';
    }

    return roles.map(role => `
        <span class="notice-detail-recipient">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${escapeHtml(role)}
        </span>
    `).join('');
}

function parseMessageTo(value) {
    if (!value) return [];
    if (value === 'Multiple') return MESSAGE_TO_ROLES.slice();
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

async function deleteNotice(id) {
    const notice = notices.find(item => item.id === id);
    const title = notice?.title || 'this notice';

    const confirmed = await Swal.fire({
        title: 'Delete Notice?',
        text: `Remove "${title}" from the notice board?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    });

    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch(`/api/communicate/notices/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 2000, showConfirmButton: false });
        if (viewingNoticeId === id) closeDetailDrawer();
        loadNotices();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete notice' });
    }
}

async function deleteAllNotices() {
    if (!notices.length) {
        Swal.fire({ icon: 'info', title: 'Notice Board', text: 'There are no notices to delete.' });
        return;
    }

    const confirmed = await Swal.fire({
        title: 'Delete Notice Board?',
        text: 'This will remove all notices from the board.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete all',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    });

    if (!confirmed.isConfirmed) return;

    try {
        const response = await fetch('/api/communicate/notices', { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 2000, showConfirmButton: false });
        closeDetailDrawer();
        loadNotices();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete notices' });
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
