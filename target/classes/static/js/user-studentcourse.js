(function () {
    'use strict';

    (function ensureStylesheet() {
        if (document.getElementById('user-studentcourse-css')) {
            return;
        }
        var link = document.createElement('link');
        link.id = 'user-studentcourse-css';
        link.rel = 'stylesheet';
        link.href = '/css/user-studentcourse.css';
        document.head.appendChild(link);
    })();

    var courses = [];
    var viewMode = 'grid';

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function initials(name) {
        var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) {
            return '?';
        }
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    function formatMoney(value) {
        var amount = Number(value) || 0;
        return '$' + amount.toFixed(2);
    }

    function priceHtml(item) {
        var price = Number(item.price) || 0;
        var discount = item.discountPrice == null || item.discountPrice === ''
            ? null
            : Number(item.discountPrice);
        if (discount != null && !Number.isNaN(discount) && discount < price) {
            return formatMoney(discount) + '<span class="usc-old-price">' + formatMoney(price) + '</span>';
        }
        if (item.freeCourse) {
            return 'Free';
        }
        return formatMoney(price);
    }

    function starsHtml() {
        var stars = '';
        for (var i = 0; i < 5; i++) {
            stars += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        }
        return stars;
    }

    function progressClass(percent) {
        if (percent >= 100) {
            return 'green';
        }
        if (percent > 0) {
            return 'orange';
        }
        return 'grey';
    }

    function renderCourses() {
        var grid = document.getElementById('uscCourseGrid');
        if (!grid) {
            return;
        }

        grid.classList.toggle('list-view', viewMode === 'list');

        if (!courses.length) {
            grid.innerHTML = '<div class="usc-empty">No courses found</div>';
            return;
        }

        grid.innerHTML = courses.map(function (item) {
            var color = item.themeColor || '#727cf5';
            var instructorLabel = (item.instructorName || 'Instructor')
                + (item.instructorCode ? ' (' + item.instructorCode + ')' : '');
            var hasImage = !!item.thumbnailUrl;
            var thumbStyle = hasImage
                ? 'background-image:url(\'' + String(item.thumbnailUrl).replace(/'/g, '%27') + '\');'
                : 'background: linear-gradient(135deg, ' + escapeHtml(color) + ', #334155);';
            var progress = Number(item.progressPercent) || 0;
            var ratingCount = Number(item.ratingCount) || 0;
            var showCert = item.certificateAvailable && progress >= 100;

            return ''
                + '<article class="usc-card" data-id="' + escapeHtml(String(item.id)) + '">'
                + '<div class="usc-thumb' + (hasImage ? ' has-image' : '') + '" style="' + thumbStyle + '">'
                + '<div class="usc-thumb-title">' + escapeHtml(item.title || 'Course') + '</div>'
                + '<div class="usc-instructor-bar">'
                + '<span class="usc-instructor-avatar">' + escapeHtml(initials(item.instructorName)) + '</span>'
                + '<div class="usc-instructor-meta">'
                + '<div class="usc-instructor-name">' + escapeHtml(instructorLabel) + '</div>'
                + '<div class="usc-instructor-updated">Last Updated ' + escapeHtml(item.lastUpdatedDisplay || '') + '</div>'
                + '</div></div></div>'
                + '<div class="usc-body">'
                + '<h3 class="usc-card-title">' + escapeHtml(item.title || '') + '</h3>'
                + '<p class="usc-card-desc">' + escapeHtml(item.description || '') + '</p>'
                + '<div class="usc-meta">'
                + '<span class="usc-meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
                + 'Class: ' + escapeHtml(item.classLabel || '') + '</span>'
                + '<span class="usc-meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
                + 'Lesson ' + escapeHtml(String(item.lessonCount || 0))
                + (item.lessonDuration ? ' ' + escapeHtml(item.lessonDuration) : '')
                + '</span>'
                + '<span class="usc-meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h.01"></path><path d="M7 20v-4"></path><path d="M12 20v-8"></path><path d="M17 20V8"></path><path d="M22 4v16"></path></svg>'
                + 'Exam ' + escapeHtml(String(item.examCount || 0)) + '</span>'
                + '<span class="usc-meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
                + 'Quiz ' + escapeHtml(String(item.quizCount || 0)) + '</span>'
                + '<span class="usc-meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path></svg>'
                + 'Assignment ' + escapeHtml(String(item.assignmentCount || 0)) + '</span>'
                + '</div>'
                + '<div class="usc-price-row">' + priceHtml(item) + '</div>'
                + (ratingCount > 0
                    ? '<div class="usc-rating-row"><span class="usc-stars">' + starsHtml()
                    + '</span><span class="usc-rating-text">(' + escapeHtml(String(ratingCount))
                    + ' Rating' + (ratingCount === 1 ? '' : 's') + ')</span></div>'
                    : '')
                + '<div class="usc-progress-wrap">'
                + '<div class="usc-progress-track"><div class="usc-progress-fill ' + progressClass(progress)
                + '" style="width:' + Math.min(100, Math.max(0, progress)) + '%"></div></div>'
                + '<span class="usc-progress-percent">' + progress + '%</span>'
                + (showCert
                    ? '<button type="button" class="usc-cert-btn" title="Download Certificate" data-id="'
                    + escapeHtml(String(item.id)) + '">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
                    + '</button>'
                    : '')
                + '</div>'
                + '<div class="usc-actions">'
                + '<button type="button" class="usc-btn-preview" data-preview-id="' + escapeHtml(String(item.id)) + '">Preview</button>'
                + '<button type="button" class="usc-btn-start" data-start-id="' + escapeHtml(String(item.id)) + '">Start</button>'
                + '</div>'
                + '</div></article>';
        }).join('');
    }

    function setView(mode) {
        viewMode = mode;
        var gridBtn = document.getElementById('uscGridViewBtn');
        var listBtn = document.getElementById('uscListViewBtn');
        if (gridBtn) {
            gridBtn.classList.toggle('active', mode === 'grid');
        }
        if (listBtn) {
            listBtn.classList.toggle('active', mode === 'list');
        }
        renderCourses();
    }

    function bindControls() {
        var gridBtn = document.getElementById('uscGridViewBtn');
        var listBtn = document.getElementById('uscListViewBtn');
        if (gridBtn && !gridBtn.dataset.bound) {
            gridBtn.dataset.bound = '1';
            gridBtn.addEventListener('click', function () {
                setView('grid');
            });
        }
        if (listBtn && !listBtn.dataset.bound) {
            listBtn.dataset.bound = '1';
            listBtn.addEventListener('click', function () {
                setView('list');
            });
        }

        var grid = document.getElementById('uscCourseGrid');
        if (grid && !grid.dataset.bound) {
            grid.dataset.bound = '1';
            grid.addEventListener('click', function (event) {
                var previewBtn = event.target.closest('[data-preview-id]');
                if (previewBtn) {
                    var previewId = previewBtn.getAttribute('data-preview-id');
                    var course = courses.find(function (item) {
                        return String(item.id) === String(previewId);
                    });
                    if (course && course.previewUrl) {
                        window.open(course.previewUrl, '_blank');
                    }
                    return;
                }
                var startBtn = event.target.closest('[data-start-id]');
                if (startBtn) {
                    var startId = startBtn.getAttribute('data-start-id');
                    if (startId) {
                        window.location.href = '/user/studentcourse/course/' + encodeURIComponent(startId);
                    }
                }
            });
        }
    }

    function loadCourses() {
        var grid = document.getElementById('uscCourseGrid');
        if (grid) {
            grid.innerHTML = '<div class="usc-loading">Loading courses...</div>';
        }

        fetch('/api/user/user/studentcourse', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load courses');
                }
                return response.json();
            })
            .then(function (data) {
                courses = (data && data.courses) || [];
                bindControls();
                renderCourses();
            })
            .catch(function () {
                courses = [];
                renderCourses();
            });
    }

    document.addEventListener('DOMContentLoaded', loadCourses);
})();
