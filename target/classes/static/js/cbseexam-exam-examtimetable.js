document.addEventListener('DOMContentLoaded', function () {
    const examTimetableContainer = document.getElementById('examTimetableContainer');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url) {
        const response = await fetch(url);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function lockIconSvg() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>'
            + '<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
            + '</svg>';
    }

    function renderSubjectRows(subjects) {
        if (!subjects || !subjects.length) {
            return '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#94a3b8;">No schedule entries found</td></tr>';
        }

        return subjects.map(function (subject) {
            return '<tr>'
                + '<td>' + escapeHtml(subject.subjectName) + '</td>'
                + '<td>' + escapeHtml(subject.examDate) + '</td>'
                + '<td>' + escapeHtml(subject.startTime) + '</td>'
                + '<td>' + escapeHtml(subject.durationMinutes != null ? subject.durationMinutes : '') + '</td>'
                + '<td>' + escapeHtml(subject.roomNo) + '</td>'
                + '</tr>';
        }).join('');
    }

    function renderExamGroup(group) {
        const published = !!group.published;
        return '<section class="exam-group-card" data-exam-id="' + group.id + '">'
            + '<div class="exam-group-header">'
            + '<h3 class="exam-group-title">' + escapeHtml(group.examName) + '</h3>'
            + '<button type="button" class="btn-lock-exam' + (published ? ' is-locked' : '') + '" data-exam-id="' + group.id + '" data-published="' + published + '" title="' + (published ? 'Exam is published' : 'Exam is not published') + '">'
            + lockIconSvg()
            + '</button>'
            + '</div>'
            + '<div class="table-responsive">'
            + '<table class="exam-schedule-table">'
            + '<thead><tr>'
            + '<th>Subject</th>'
            + '<th>Date</th>'
            + '<th>Start Time</th>'
            + '<th>Duration (minute)</th>'
            + '<th>Room No.</th>'
            + '</tr></thead>'
            + '<tbody>' + renderSubjectRows(group.subjects) + '</tbody>'
            + '</table>'
            + '</div>'
            + '</section>';
    }

    function renderTimetables(groups) {
        if (!groups || !groups.length) {
            examTimetableContainer.innerHTML = '<div class="exam-timetable-empty">No exam schedules found.</div>';
            return;
        }

        examTimetableContainer.innerHTML = groups.map(renderExamGroup).join('');
    }

    examTimetableContainer.addEventListener('click', function (event) {
        const lockBtn = event.target.closest('.btn-lock-exam');
        if (!lockBtn) {
            return;
        }

        const isPublished = lockBtn.getAttribute('data-published') === 'true';
        Swal.fire({
            icon: 'info',
            title: isPublished ? 'Exam Published' : 'Exam Not Published',
            text: isPublished
                ? 'This exam schedule is locked because the exam has been published.'
                : 'This exam schedule is not published yet.',
            confirmButtonColor: '#8b5cf6'
        });
    });

    fetchJson('/api/cbse-exams/exam-timetable')
        .then(renderTimetables)
        .catch(showError);
});
