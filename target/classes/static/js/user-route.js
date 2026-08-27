(function () {
    'use strict';

    var content = document.getElementById('utransContent');

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        return value == null || String(value).trim() === '' ? '-' : String(value);
    }

    function driverPhotoHtml(url) {
        if (url) {
            return '<img src="' + escapeHtml(url) + '" alt="Driver photo">';
        }
        return '<svg class="utrans-driver-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
            + '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>'
            + '<circle cx="12" cy="7" r="4"></circle>'
            + '</svg>';
    }

    function infoItem(label, value) {
        return '<div class="utrans-info-item"><strong>' + escapeHtml(label) + ':</strong> '
            + escapeHtml(display(value)) + '</div>';
    }

    function stopCardHtml(point) {
        var position = point.position === 'below' ? 'below' : 'above';
        var activeClass = point.active ? ' active' : '';
        return '<div class="utrans-stop-card ' + position + activeClass + '">'
            + '<p class="utrans-stop-name">' + escapeHtml(point.name || '') + '</p>'
            + '<div class="utrans-stop-meta">Distance (km): ' + escapeHtml(display(point.distance))
            + ' | Pickup Time: ' + escapeHtml(display(point.pickupTime)) + '</div>'
            + '</div>';
    }

    function renderRoute(data) {
        var pickupPoints = Array.isArray(data.pickupPoints) ? data.pickupPoints : [];
        var stopsHtml = pickupPoints.map(function (point) {
            var pinClass = point.active ? 'active' : 'inactive';
            return '<div class="utrans-stop">'
                + stopCardHtml(point)
                + '<div class="utrans-stop-pin ' + pinClass + '" aria-hidden="true">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">'
                + '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>'
                + '</svg></div>'
                + '</div>';
        }).join('');

        content.innerHTML = ''
            + '<div class="utrans-route-card">'
            + '<div class="utrans-driver-photo">' + driverPhotoHtml(data.driverPhotoUrl) + '</div>'
            + '<div class="utrans-route-details">'
            + '<h2 class="utrans-route-title">Route Title: ' + escapeHtml(display(data.routeTitle)) + '</h2>'
            + '<div class="utrans-info-grid">'
            + infoItem('Vehicle Number', data.vehicleNumber)
            + infoItem('Vehicle Model', data.vehicleModel)
            + infoItem('Made', data.yearMade)
            + infoItem('Driver Name', data.driverName)
            + infoItem('Driver Licence', data.driverLicence)
            + infoItem('Driver Contact', data.driverContact)
            + '</div></div></div>'
            + '<div class="utrans-pickup-section">'
            + '<div class="utrans-pickup-header">'
            + '<h2>Pickup Point List</h2>'
            + '<div class="utrans-scroll-actions">'
            + '<button type="button" class="utrans-scroll-btn" id="utransScrollPrev" aria-label="Scroll left">&lsaquo;</button>'
            + '<button type="button" class="utrans-scroll-btn" id="utransScrollNext" aria-label="Scroll right">&rsaquo;</button>'
            + '</div></div>'
            + '<div class="utrans-timeline-wrap" id="utransTimelineWrap">'
            + '<div class="utrans-timeline" id="utransTimeline">'
            + '<div class="utrans-timeline-line"></div>'
            + stopsHtml
            + '</div></div></div>';

        bindTimelineScroll();
    }

    function bindTimelineScroll() {
        var wrap = document.getElementById('utransTimelineWrap');
        var prevBtn = document.getElementById('utransScrollPrev');
        var nextBtn = document.getElementById('utransScrollNext');
        if (!wrap || !prevBtn || !nextBtn) {
            return;
        }

        function updateButtons() {
            var maxScroll = wrap.scrollWidth - wrap.clientWidth;
            prevBtn.disabled = wrap.scrollLeft <= 0;
            nextBtn.disabled = maxScroll <= 0 || wrap.scrollLeft >= maxScroll - 1;
        }

        prevBtn.addEventListener('click', function () {
            wrap.scrollBy({ left: -220, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function () {
            wrap.scrollBy({ left: 220, behavior: 'smooth' });
        });
        wrap.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);
        updateButtons();
    }

    function renderError(message) {
        content.innerHTML = '<div class="utrans-error">' + escapeHtml(message) + '</div>';
    }

    async function loadRoute() {
        try {
            var response = await fetch('/api/user/route');
            if (!response.ok) {
                var err = {};
                try { err = await response.json(); } catch (e) { err = {}; }
                throw new Error(err.message || 'Failed to load transport route');
            }
            var data = await response.json();
            renderRoute(data);
        } catch (error) {
            renderError(error.message || 'Failed to load transport route');
        }
    }

    loadRoute();
})();
