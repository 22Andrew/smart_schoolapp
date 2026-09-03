(function () {
    'use strict';

    var notices = [];
    var listEl = document.getElementById('unbList');
    var drawer = document.getElementById('unbDrawer');
    var backBtn = document.getElementById('unbDrawerBack');
    var closeBtn = document.getElementById('unbDrawerClose');

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function envelopeIcon() {
        return '<span class="unb-item-icon">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>'
            + '<polyline points="22,6 12,13 2,6"></polyline>'
            + '</svg></span>';
    }

    function parseRecipients(notice) {
        var source = notice.messageTo || notice.publishTo || '';
        if (!source) {
            return [];
        }
        if (source === 'Multiple') {
            return ['Student', 'Parent'];
        }
        return String(source).split(',').map(function (part) {
            return part.trim();
        }).filter(Boolean);
    }

    function renderList() {
        if (!listEl) return;

        if (!notices.length) {
            listEl.innerHTML = '<p class="unb-empty">No record found</p>';
            return;
        }

        listEl.innerHTML = notices.map(function (notice) {
            return '<div class="unb-item" data-id="' + escapeHtml(notice.id) + '">'
                + envelopeIcon()
                + '<button type="button" class="unb-item-link" data-id="' + escapeHtml(notice.id) + '">'
                + escapeHtml(notice.title || 'Notice')
                + '</button></div>';
        }).join('');

        listEl.querySelectorAll('.unb-item-link').forEach(function (button) {
            button.addEventListener('click', function () {
                openDrawer(button.getAttribute('data-id'));
            });
        });
    }

    function openDrawer(id) {
        var notice = notices.find(function (item) {
            return String(item.id) === String(id);
        });
        if (!notice || !drawer) return;

        document.getElementById('unbDrawerTitle').textContent = notice.title || 'Notice Details';
        document.getElementById('unbDetailHeading').textContent = notice.title || '';
        document.getElementById('unbDetailPublishDate').textContent = notice.publishOn || notice.noticeDate || '—';
        document.getElementById('unbDetailNoticeDate').textContent = notice.noticeDate || '—';

        var recipients = parseRecipients(notice);
        document.getElementById('unbDetailRecipients').innerHTML = recipients.length
            ? recipients.map(function (role) {
                return '<span class="unb-recipient">' + escapeHtml(role) + '</span>';
            }).join('')
            : '<span class="unb-recipient">All</span>';

        var message = notice.message || '';
        document.getElementById('unbDetailMessage').innerHTML = message.indexOf('<') >= 0
            ? message
            : '<p>' + escapeHtml(message || 'No message content.') + '</p>';

        listEl.querySelectorAll('.unb-item').forEach(function (row) {
            row.classList.toggle('active', row.getAttribute('data-id') === String(id));
        });

        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        listEl.classList.add('drawer-open');

        if (window.location.hash !== '#' + id) {
            history.replaceState(null, '', '#notification-' + id);
        }
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        listEl.classList.remove('drawer-open');
        listEl.querySelectorAll('.unb-item.active').forEach(function (row) {
            row.classList.remove('active');
        });
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    }

    async function loadNotices() {
        if (listEl) {
            listEl.innerHTML = '<p class="unb-empty">Loading notices...</p>';
        }
        try {
            var response = await fetch('/api/user/notification', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to load notices');
            }
            var data = await response.json();
            notices = Array.isArray(data.notices) ? data.notices : [];
            renderList();

            var hash = window.location.hash.replace(/^#(?:notification-)?/, '');
            if (hash) {
                openDrawer(hash);
            }
        } catch (error) {
            if (listEl) {
                listEl.innerHTML = '<p class="unb-empty">' + escapeHtml(error.message || 'No record found') + '</p>';
            }
        }
    }

    if (backBtn) backBtn.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    loadNotices();
})();
