(function () {
    'use strict';

    var grid = document.getElementById('uvtGrid');
    var modal = document.getElementById('uvtModal');
    var overlay = document.getElementById('uvtModalOverlay');
    var closeBtn = document.getElementById('uvtModalClose');
    var titleEl = document.getElementById('uvtModalTitle');
    var player = document.getElementById('uvtPlayer');

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function youtubeBadge() {
        return '<span class="uvt-yt-badge" aria-hidden="true">'
            + '<svg viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">'
            + '<rect width="28" height="20" rx="4" fill="#FF0000"></rect>'
            + '<polygon points="11,5 11,15 20,10" fill="#fff"></polygon>'
            + '</svg></span>';
    }

    function emptyHtml(message) {
        return '<div class="uvt-empty">' + escapeHtml(message) + '</div>';
    }

    function placeholderThumb() {
        return 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">'
            + '<rect width="100%" height="100%" fill="#edf0f5"/>'
            + '<text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#94a3b8" font-size="14">Video</text>'
            + '</svg>'
        );
    }

    function render(rows) {
        if (!grid) return;
        if (!rows.length) {
            grid.innerHTML = emptyHtml('No video tutorials available');
            return;
        }
        grid.innerHTML = rows.map(function (row) {
            var thumb = row.thumbnailUrl || placeholderThumb();
            return '<button type="button" class="uvt-item" data-id="' + escapeHtml(String(row.id)) + '">'
                + '<div class="uvt-thumb">'
                + '<img src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(row.title || '') + '">'
                + youtubeBadge()
                + '</div>'
                + '<p class="uvt-caption">' + escapeHtml(row.title || '') + '</p>'
                + '</button>';
        }).join('');
    }

    function openVideo(row) {
        if (!row) return;
        if (row.youtubeId && player) {
            titleEl.textContent = row.title || 'Video Tutorial';
            player.src = (row.embedUrl || '') + (String(row.embedUrl || '').indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
            modal.hidden = false;
            return;
        }
        if (row.videoLink) {
            window.open(row.videoLink, '_blank', 'noopener');
        }
    }

    function closeModal() {
        if (player) player.src = '';
        if (modal) modal.hidden = true;
    }

    var rows = [];

    if (grid) {
        grid.addEventListener('click', function (event) {
            var item = event.target.closest('.uvt-item');
            if (!item) return;
            var id = Number(item.getAttribute('data-id'));
            var row = rows.find(function (entry) { return Number(entry.id) === id; });
            openVideo(row);
        });
    }
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeModal();
    });

    async function loadTutorials() {
        try {
            var response = await fetch('/api/user/videotutorial');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load video tutorials');
            }
            var data = await response.json();
            rows = Array.isArray(data.rows) ? data.rows : [];
            render(rows);
        } catch (error) {
            render([]);
            if (grid) grid.innerHTML = emptyHtml(error.message || 'Failed to load video tutorials');
        }
    }

    loadTutorials();
})();
