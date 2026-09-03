(function () {
    'use strict';

    (function ensureTimelineStylesheet() {
        if (document.getElementById('user-profile-timeline-css')) {
            return;
        }
        var link = document.createElement('link');
        link.id = 'user-profile-timeline-css';
        link.rel = 'stylesheet';
        link.href = '/css/user-profile-timeline.css';
        document.head.appendChild(link);
    })();

    var timelineLoaded = false;
    var timelineEntries = [];

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function timelineListIcon() {
        return ''
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<line x1="8" y1="6" x2="21" y2="6"></line>'
            + '<line x1="8" y1="12" x2="21" y2="12"></line>'
            + '<line x1="8" y1="18" x2="21" y2="18"></line>'
            + '<line x1="3" y1="6" x2="3.01" y2="6"></line>'
            + '<line x1="3" y1="12" x2="3.01" y2="12"></line>'
            + '<line x1="3" y1="18" x2="3.01" y2="18"></line>'
            + '</svg>';
    }

    function timelineClockIcon() {
        return ''
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<circle cx="12" cy="12" r="10"></circle>'
            + '<polyline points="12 6 12 12 16 14"></polyline>'
            + '</svg>';
    }

    function renderTimelineCard(entry) {
        var title = escapeHtml(entry.title || '');
        var description = entry.description ? escapeHtml(entry.description) : '';
        var bottomText = description || title;
        return ''
            + '<div class="sp-timeline-card">'
            + '<div class="sp-timeline-card-top"></div>'
            + '<div class="sp-timeline-card-bottom">'
            + '<h4 class="sp-timeline-card-title">' + bottomText + '</h4>'
            + '</div>'
            + '</div>';
    }

    function renderTimelineGroup(date, entries) {
        var cards = entries.map(function (entry) {
            return ''
                + '<div class="sp-timeline-item" data-timeline-id="' + escapeHtml(String(entry.id)) + '">'
                + renderTimelineCard(entry)
                + '</div>';
        }).join('');

        return ''
            + '<div class="sp-timeline-group">'
            + '<div class="sp-timeline-rail">'
            + '<div class="sp-timeline-date">' + escapeHtml(date) + '</div>'
            + '<div class="sp-timeline-node">' + timelineListIcon() + '</div>'
            + '</div>'
            + '<div class="sp-timeline-content">' + cards + '</div>'
            + '</div>';
    }

    function renderTimelineEndClock() {
        return ''
            + '<div class="sp-timeline-group sp-timeline-group-end">'
            + '<div class="sp-timeline-rail">'
            + '<div class="sp-timeline-node clock">' + timelineClockIcon() + '</div>'
            + '</div>'
            + '<div class="sp-timeline-content"></div>'
            + '</div>';
    }

    function renderTimeline() {
        var track = document.getElementById('profileTimelineTrack');
        if (!track) {
            return;
        }

        if (!timelineEntries.length) {
            track.innerHTML = '<div class="sp-timeline-empty">No Record Found</div>';
            return;
        }

        var grouped = {};
        var dateOrder = [];
        timelineEntries.forEach(function (entry) {
            var key = entry.date || 'No Date';
            if (!grouped[key]) {
                grouped[key] = [];
                dateOrder.push(key);
            }
            grouped[key].push(entry);
        });

        track.innerHTML = dateOrder.map(function (date) {
            return renderTimelineGroup(date, grouped[date]);
        }).join('') + renderTimelineEndClock();
    }

    function loadTimeline(force) {
        if (timelineLoaded && !force) {
            return;
        }
        timelineLoaded = true;

        var track = document.getElementById('profileTimelineTrack');
        if (track) {
            track.innerHTML = '<div class="sp-timeline-loading">Loading...</div>';
        }

        fetch('/api/user/user/timeline', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load timeline');
                }
                return response.json();
            })
            .then(function (data) {
                timelineEntries = (data && data.entries) || [];
                renderTimeline();
            })
            .catch(function () {
                timelineEntries = [];
                renderTimeline();
            });
    }

    function initTimelineTabLoader() {
        var timelineTab = document.querySelector('.sp-tab[data-profile-tab="timeline"]');
        if (timelineTab) {
            timelineTab.addEventListener('click', function () {
                loadTimeline(true);
            });
        }
        var timelinePanel = document.querySelector('.sp-tab-content[data-profile-panel="timeline"]');
        if (timelinePanel && timelinePanel.classList.contains('active')) {
            loadTimeline();
        }
    }

    document.addEventListener('DOMContentLoaded', initTimelineTabLoader);
})();
