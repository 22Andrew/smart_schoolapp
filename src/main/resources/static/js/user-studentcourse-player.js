(function () {
    'use strict';

    var courseState = { course: null, sections: [] };

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getCourseId() {
        var input = document.getElementById('uscpCourseId');
        return input ? input.value : '';
    }

    function youtubeIdFromUrl(url) {
        var text = String(url || '').trim();
        if (!text) {
            return null;
        }
        var watchMatch = text.match(/[?&]v=([^&]+)/);
        if (watchMatch) {
            return watchMatch[1];
        }
        var shortMatch = text.match(/youtu\.be\/([^?&]+)/);
        if (shortMatch) {
            return shortMatch[1];
        }
        var embedMatch = text.match(/youtube\.com\/embed\/([^?&]+)/);
        if (embedMatch) {
            return embedMatch[1];
        }
        return null;
    }

    function youtubeEmbedUrl(url) {
        var id = youtubeIdFromUrl(url);
        return id ? 'https://www.youtube.com/embed/' + id + '?rel=0' : null;
    }

    function youtubeThumb(url) {
        var id = youtubeIdFromUrl(url);
        return id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : null;
    }

    function contentTypeLabel(type, index) {
        var map = { LESSON: 'Lesson', QUIZ: 'Quiz', EXAM: 'Exam', ASSIGNMENT: 'Assignment' };
        return (map[type] || type) + ' ' + index;
    }

    function renderCourseDetail(course) {
        var titleEl = document.getElementById('uscpCourseTitle');
        var imageEl = document.getElementById('uscpCourseImage');
        if (titleEl) {
            titleEl.textContent = course.title || 'Course';
        }
        document.getElementById('uscpDetailTitle').textContent = course.title || '-';
        document.getElementById('uscpDetailDescription').textContent = course.description || '-';
        document.getElementById('uscpDetailClass').textContent = course.classLabel || '-';
        document.getElementById('uscpDetailSection').textContent = course.sectionLabels || '-';
        document.getElementById('uscpDetailTeacher').textContent = (course.instructorName || '-')
            + (course.instructorCode ? ' (' + course.instructorCode + ')' : '');

        var progress = Number(course.progressPercent) || 0;
        var fill = document.getElementById('uscpDetailProgressFill');
        var text = document.getElementById('uscpDetailProgressText');
        if (fill) {
            fill.style.width = Math.min(100, Math.max(0, progress)) + '%';
            fill.classList.toggle('complete', progress >= 100);
        }
        if (text) {
            text.textContent = progress + '%';
        }

        if (imageEl) {
            if (course.thumbnailUrl) {
                imageEl.style.background = '';
                imageEl.innerHTML = '<img src="' + escapeHtml(course.thumbnailUrl) + '" alt="' + escapeHtml(course.title || 'Course') + '">';
            } else {
                imageEl.innerHTML = '';
                imageEl.textContent = course.title || 'Course';
                imageEl.style.background = 'linear-gradient(135deg, ' + escapeHtml(course.themeColor || '#727cf5') + ', #334155)';
            }
        }

        var outcomesWrap = document.getElementById('uscpOutcomesWrap');
        var outcomesList = document.getElementById('uscpOutcomesList');
        var outcomes = String(course.outcomes || '').split(/\r?\n/).map(function (line) {
            return line.trim();
        }).filter(Boolean);
        if (outcomesWrap && outcomesList) {
            if (outcomes.length) {
                outcomesWrap.hidden = false;
                outcomesList.innerHTML = outcomes.map(function (item) {
                    return '<li>' + escapeHtml(item) + '</li>';
                }).join('');
            } else {
                outcomesWrap.hidden = true;
                outcomesList.innerHTML = '';
            }
        }

        var meta = document.getElementById('uscpCurriculumMeta');
        if (meta) {
            meta.textContent = 'Lesson: ' + (course.lessonCount || 0)
                + ' | Quiz: ' + (course.quizCount || 0)
                + ' | Exam: ' + (course.examCount || 0)
                + ' | Assignment: ' + (course.assignmentCount || 0);
        }
    }

    function renderContentItem(item, typeIndex) {
        var type = item.contentType || 'LESSON';
        var label = contentTypeLabel(type, typeIndex);
        var title = item.title || label;
        var iconClass = 'uscp-content-type-icon' + (type === 'QUIZ' ? ' quiz' : type === 'EXAM' ? ' exam' : type === 'ASSIGNMENT' ? ' assignment' : '');

        var startLabel = type === 'LESSON' ? 'Start Lesson' : type === 'QUIZ' ? 'Start Quiz' : type === 'EXAM' ? 'Start Exam' : 'Start Assignment';
        var startClass = 'uscp-start-btn' + (type === 'LESSON' ? ' lesson' : '');
        var body = '';

        if (type === 'LESSON') {
            var thumb = item.thumbnailUrl || youtubeThumb(item.videoUrl);
            body = '<div class="uscp-lesson-preview">'
                + '<div class="uscp-lesson-thumb" data-action="open-lesson" data-content-id="' + escapeHtml(String(item.id)) + '">'
                + (thumb
                    ? '<img src="' + escapeHtml(thumb) + '" alt="Lesson preview"><div class="play">&#9654;</div>'
                    : '<div class="play" style="position:static;background:#eceff3;color:#666;height:100%;">&#9654;</div>')
                + '</div>'
                + '<div class="uscp-lesson-text">' + escapeHtml(item.summary || '') + '</div>'
                + '</div>';
        } else if (type === 'EXAM') {
            body = '<div class="uscp-meta-grid">'
                + '<div><div class="k">Exam From</div><div class="v">' + escapeHtml(item.examFrom || '-') + '</div></div>'
                + '<div><div class="k">Exam To</div><div class="v">' + escapeHtml(item.examTo || '-') + '</div></div>'
                + '<div><div class="k">Exam Duration</div><div class="v">' + escapeHtml(item.examDuration || '-') + '</div></div>'
                + '<div><div class="k">Passing Percentage</div><div class="v">' + escapeHtml(item.passingPercentage == null ? '-' : String(item.passingPercentage)) + '</div></div>'
                + '</div>';
        } else if (type === 'ASSIGNMENT') {
            body = '<div class="uscp-meta-grid">'
                + '<div><div class="k">Assignment Date</div><div class="v">' + escapeHtml(item.assignmentDate || '-') + '</div></div>'
                + '<div><div class="k">Submission Date</div><div class="v">' + escapeHtml(item.submissionDate || '-') + '</div></div>'
                + '<div><div class="k">Max Marks</div><div class="v">' + escapeHtml(item.maxMarks == null ? '-' : String(item.maxMarks)) + '</div></div>'
                + '</div>';
        } else if (type === 'QUIZ') {
            body = '<div class="uscp-lesson-text">Answer all quiz questions to complete this section.</div>';
        }

        return '<article class="uscp-content-item" data-content-id="' + escapeHtml(String(item.id)) + '" data-content-type="' + escapeHtml(type) + '">'
            + '<div class="uscp-content-head">'
            + '<div class="left"><span class="' + iconClass + '">'
            + (type === 'LESSON' ? '&#9654;' : type === 'QUIZ' ? '?' : type === 'EXAM' ? 'E' : 'A')
            + '</span><span>' + escapeHtml(title) + '</span>'
            + (type === 'LESSON' && item.duration ? '<span class="meta">' + escapeHtml(item.duration) + '</span>' : '')
            + '</div>'
            + '<button type="button" class="' + startClass + '" data-action="start-content" data-content-id="' + escapeHtml(String(item.id)) + '">'
            + startLabel + '</button>'
            + '</div>'
            + body
            + '</article>';
    }

    function renderSections(sections) {
        var container = document.getElementById('uscpSections');
        if (!container) {
            return;
        }
        if (!sections || !sections.length) {
            container.innerHTML = '<div class="uscp-empty">No curriculum found for this course.</div>';
            return;
        }

        container.innerHTML = sections.map(function (section, sIndex) {
            var counters = { LESSON: 0, QUIZ: 0, EXAM: 0, ASSIGNMENT: 0 };
            var contents = Array.isArray(section.contents) ? section.contents : [];
            var cards = contents.map(function (item) {
                var type = item.contentType || 'LESSON';
                counters[type] = (counters[type] || 0) + 1;
                return renderContentItem(item, counters[type]);
            }).join('');

            var sectionIndex = section.displayIndex || (sIndex + 1);
            var collapsed = sIndex > 0 ? ' collapsed' : '';
            var toggleSymbol = sIndex > 0 ? '+' : '&minus;';

            return '<div class="uscp-section-block" data-section-id="' + escapeHtml(String(section.id)) + '">'
                + '<div class="uscp-section-header" data-action="toggle-section">'
                + '<div class="title">Section ' + sectionIndex + ': ' + escapeHtml(section.title || '') + '</div>'
                + '<span class="uscp-section-toggle">' + toggleSymbol + '</span>'
                + '</div>'
                + '<div class="uscp-section-body' + collapsed + '">'
                + (cards || '<div class="uscp-empty">No lessons in this section.</div>')
                + '</div></div>';
        }).join('');
    }

    function findContentById(contentId) {
        var id = String(contentId);
        var sections = courseState.sections || [];
        for (var i = 0; i < sections.length; i++) {
            var contents = sections[i].contents || [];
            for (var j = 0; j < contents.length; j++) {
                if (String(contents[j].id) === id) {
                    return contents[j];
                }
            }
        }
        return null;
    }

    function openLessonModal(content) {
        var modal = document.getElementById('uscpLessonModal');
        var title = document.getElementById('uscpLessonTitle');
        var videoWrap = document.getElementById('uscpLessonVideoWrap');
        var summary = document.getElementById('uscpLessonSummary');
        if (!modal || !content) {
            return;
        }
        if (title) {
            title.textContent = content.title || 'Lesson';
        }
        if (summary) {
            summary.textContent = content.summary || '';
        }
        if (videoWrap) {
            var embed = youtubeEmbedUrl(content.videoUrl);
            videoWrap.innerHTML = embed
                ? '<iframe src="' + escapeHtml(embed) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;">Video not available</div>';
        }
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeLessonModal() {
        var modal = document.getElementById('uscpLessonModal');
        var videoWrap = document.getElementById('uscpLessonVideoWrap');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
        if (videoWrap) {
            videoWrap.innerHTML = '';
        }
    }

    function openPerformanceModal() {
        var modal = document.getElementById('uscpPerformanceModal');
        var body = document.getElementById('uscpPerformanceBody');
        var course = courseState.course || {};
        if (!modal || !body) {
            return;
        }
        body.innerHTML = ''
            + '<div class="uscp-performance-stat"><span>Course Progress</span><strong>' + escapeHtml(String(course.progressPercent || 0)) + '%</strong></div>'
            + '<div class="uscp-performance-stat"><span>Lessons</span><strong>' + escapeHtml(String(course.lessonCount || 0)) + '</strong></div>'
            + '<div class="uscp-performance-stat"><span>Quizzes</span><strong>' + escapeHtml(String(course.quizCount || 0)) + '</strong></div>'
            + '<div class="uscp-performance-stat"><span>Exams</span><strong>' + escapeHtml(String(course.examCount || 0)) + '</strong></div>'
            + '<div class="uscp-performance-stat"><span>Assignments</span><strong>' + escapeHtml(String(course.assignmentCount || 0)) + '</strong></div>';
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closePerformanceModal() {
        var modal = document.getElementById('uscpPerformanceModal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    function handleStartContent(content) {
        if (!content) {
            return;
        }
        var type = content.contentType || 'LESSON';
        if (type === 'LESSON') {
            openLessonModal(content);
            return;
        }
        if (type === 'QUIZ') {
            window.alert('Quiz started. Answer each question to complete the quiz.');
            return;
        }
        if (type === 'EXAM') {
            window.alert('Exam started. Complete the exam within the allotted duration.');
            return;
        }
        window.alert('Assignment opened. Submit your work before the submission date.');
    }

    function bindEvents() {
        var sections = document.getElementById('uscpSections');
        if (sections && !sections.dataset.bound) {
            sections.dataset.bound = '1';
            sections.addEventListener('click', function (event) {
                var toggleHeader = event.target.closest('[data-action="toggle-section"]');
                if (toggleHeader) {
                    var block = toggleHeader.closest('.uscp-section-block');
                    var body = block ? block.querySelector('.uscp-section-body') : null;
                    var icon = toggleHeader.querySelector('.uscp-section-toggle');
                    if (body) {
                        body.classList.toggle('collapsed');
                        if (icon) {
                            icon.innerHTML = body.classList.contains('collapsed') ? '+' : '&minus;';
                        }
                    }
                    return;
                }

                var startBtn = event.target.closest('[data-action="start-content"]');
                if (startBtn) {
                    handleStartContent(findContentById(startBtn.getAttribute('data-content-id')));
                    return;
                }

                var lessonThumb = event.target.closest('[data-action="open-lesson"]');
                if (lessonThumb) {
                    handleStartContent(findContentById(lessonThumb.getAttribute('data-content-id')));
                }
            });
        }

        var perfBtn = document.getElementById('uscpPerformanceBtn');
        if (perfBtn && !perfBtn.dataset.bound) {
            perfBtn.dataset.bound = '1';
            perfBtn.addEventListener('click', openPerformanceModal);
        }

        ['uscpLessonClose', 'uscpLessonOverlay'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && !el.dataset.bound) {
                el.dataset.bound = '1';
                el.addEventListener('click', closeLessonModal);
            }
        });

        ['uscpPerformanceClose', 'uscpPerformanceOverlay'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && !el.dataset.bound) {
                el.dataset.bound = '1';
                el.addEventListener('click', closePerformanceModal);
            }
        });
    }

    function loadCourse() {
        var courseId = getCourseId();
        if (!courseId) {
            return;
        }

        fetch('/api/user/user/studentcourse/' + encodeURIComponent(String(courseId)), {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load course');
                }
                return response.json();
            })
            .then(function (data) {
                courseState.course = data.course || null;
                courseState.sections = data.sections || [];
                renderCourseDetail(courseState.course || {});
                renderSections(courseState.sections);
                bindEvents();
            })
            .catch(function () {
                var container = document.getElementById('uscpSections');
                if (container) {
                    container.innerHTML = '<div class="uscp-empty">Unable to load course.</div>';
                }
            });
    }

    document.addEventListener('DOMContentLoaded', loadCourse);
})();
