document.addEventListener('DOMContentLoaded', function () {
    const lessonPlanForm = document.getElementById('lessonPlanForm');
    const teacherSelect = document.getElementById('teacherSelect');
    const schedulePanel = document.getElementById('schedulePanel');
    const scheduleGrid = document.getElementById('scheduleGrid');
    const weekRangeLabel = document.getElementById('weekRangeLabel');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleModalOverlay = document.getElementById('scheduleModalOverlay');
    const scheduleModalClose = document.getElementById('scheduleModalClose');
    const scheduleModalCancel = document.getElementById('scheduleModalCancel');
    const scheduleModalForm = document.getElementById('scheduleModalForm');
    const scheduleModalTitle = document.getElementById('scheduleModalTitle');
    const scheduleIdInput = document.getElementById('scheduleId');
    const modalTeacherCodeInput = document.getElementById('modalTeacherCode');
    const modalTeacherNameInput = document.getElementById('modalTeacherName');
    const modalPlanDateInput = document.getElementById('modalPlanDate');
    const modalSubjectNameInput = document.getElementById('modalSubjectName');
    const modalSubjectCodeInput = document.getElementById('modalSubjectCode');
    const modalClassSelect = document.getElementById('modalClassSelect');
    const modalSectionSelect = document.getElementById('modalSectionSelect');
    const modalTimeFromInput = document.getElementById('modalTimeFrom');
    const modalTimeToInput = document.getElementById('modalTimeTo');
    const modalRoomNoInput = document.getElementById('modalRoomNo');
    const lessonPlanViewModal = document.getElementById('lessonPlanViewModal');
    const lessonPlanViewOverlay = document.getElementById('lessonPlanViewOverlay');
    const lessonPlanViewClose = document.getElementById('lessonPlanViewClose');
    const lessonPlanDetailTable = document.getElementById('lessonPlanDetailTable');
    const commentList = document.getElementById('commentList');
    const commentInput = document.getElementById('commentInput');
    const sendCommentBtn = document.getElementById('sendCommentBtn');
    const viewPrintBtn = document.getElementById('viewPrintBtn');
    const viewExcelBtn = document.getElementById('viewExcelBtn');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let teachers = [];
    let classes = [];
    let masterSections = [];
    let schedulesByDate = {};
    let weekStart = getMonday(new Date());
    let currentViewData = null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function getMonday(date) {
        const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = copy.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        copy.setDate(copy.getDate() + diff);
        return copy;
    }

    function formatUsDate(date) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return mm + '/' + dd + '/' + yyyy;
    }

    function toIsoDate(date) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return date.getFullYear() + '-' + mm + '-' + dd;
    }

    function formatDisplayTime(value) {
        if (!value) {
            return '';
        }
        const parts = String(value).substring(0, 5).split(':');
        if (parts.length < 2) {
            return String(value);
        }
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        return hours + ':' + minutes + ' ' + suffix;
    }

    function iconHtml(type) {
        if (type === 'book') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
        }
        if (type === 'clock') {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
    }

    function actionButton(type, scheduleId) {
        if (type === 'view') {
            return '<button type="button" class="schedule-action-btn btn-view" data-id="' + scheduleId + '" title="View">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>'
                + '<line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>'
                + '</svg></button>';
        }
        if (type === 'edit') {
            return '<button type="button" class="schedule-action-btn btn-edit" data-id="' + scheduleId + '" title="Edit">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>'
                + '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>'
                + '</svg></button>';
        }
        return '<button type="button" class="schedule-action-btn btn-delete" data-id="' + scheduleId + '" title="Delete">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            + '</svg></button>';
    }

    function scheduleCardHtml(schedule) {
        const timeRange = formatDisplayTime(schedule.timeFrom) + ' - ' + formatDisplayTime(schedule.timeTo);
        return ''
            + '<div class="schedule-card" data-id="' + escapeHtml(String(schedule.id)) + '">'
            + '<div class="schedule-actions">'
            + actionButton('view', schedule.id)
            + actionButton('edit', schedule.id)
            + actionButton('delete', schedule.id)
            + '</div>'
            + '<div class="schedule-line">' + iconHtml('book')
            + '<span>Subject: ' + escapeHtml(schedule.subjectLabel || schedule.subjectName) + '</span></div>'
            + '<div class="schedule-line">' + iconHtml('clock')
            + '<span>Class: ' + escapeHtml(schedule.classLabel || (schedule.className + '(' + schedule.section + ')'))
            + ' ' + escapeHtml(timeRange) + '</span></div>'
            + '<div class="schedule-line">' + iconHtml('room')
            + '<span>Room No.: ' + escapeHtml(schedule.roomNo || '-') + '</span></div>'
            + '</div>';
    }

    function addDayButtonHtml(planDate) {
        return '<button type="button" class="btn-add-day" data-plan-date="' + escapeHtml(planDate) + '">+ Add</button>';
    }

    function notScheduledHtml() {
        return ''
            + '<div class="not-scheduled">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<circle cx="12" cy="12" r="10"></circle>'
            + '<line x1="15" y1="9" x2="9" y2="15"></line>'
            + '<line x1="9" y1="9" x2="15" y2="15"></line>'
            + '</svg>'
            + '<span>Not Scheduled</span>'
            + '</div>';
    }

    function updateWeekLabel() {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekRangeLabel.textContent = formatUsDate(weekStart) + ' To ' + formatUsDate(weekEnd);
    }

    function groupSchedules(entries) {
        schedulesByDate = {};
        (entries || []).forEach(function (entry) {
            const key = entry.planDate;
            if (!schedulesByDate[key]) {
                schedulesByDate[key] = [];
            }
            schedulesByDate[key].push(entry);
        });
        Object.keys(schedulesByDate).forEach(function (key) {
            schedulesByDate[key].sort(function (a, b) {
                return String(a.timeFrom || '').localeCompare(String(b.timeFrom || ''));
            });
        });
    }

    function renderScheduleGrid() {
        scheduleGrid.innerHTML = days.map(function (day, index) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            const isoDate = toIsoDate(date);
            const daySchedules = schedulesByDate[isoDate] || [];
            const body = (daySchedules.length
                ? daySchedules.map(scheduleCardHtml).join('')
                : notScheduledHtml())
                + addDayButtonHtml(isoDate);
            return ''
                + '<div class="day-column">'
                + '<div class="day-header">' + day + '<br>' + formatUsDate(date) + '</div>'
                + '<div class="day-body">' + body + '</div>'
                + '</div>';
        }).join('');
    }

    function fillTeacherSelect() {
        teacherSelect.innerHTML = '<option value="">Select</option>';
        teachers.forEach(function (teacher) {
            const option = document.createElement('option');
            option.value = String(teacher.code);
            option.textContent = teacher.display || (teacher.name + ' (' + teacher.code + ')');
            teacherSelect.appendChild(option);
        });
    }

    function renderModalClassOptions() {
        modalClassSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateModalSectionOptions(classId, preferredSection) {
        const schoolClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        if (!schoolClass) {
            modalSectionSelect.innerHTML = '<option value="">Select class first</option>';
            modalSectionSelect.disabled = true;
            return;
        }

        const classSections = Array.isArray(schoolClass.sections) ? schoolClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (section) {
                return section.sectionName || section.name || section;
            }).filter(Boolean);

        if (!sections.length) {
            modalSectionSelect.innerHTML = '<option value="">No sections found</option>';
            modalSectionSelect.disabled = true;
            return;
        }

        modalSectionSelect.disabled = false;
        modalSectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');

        if (preferredSection) {
            modalSectionSelect.value = preferredSection;
        }
    }

    function setModalClassAndSection(schedule) {
        renderModalClassOptions();

        if (!schedule) {
            modalClassSelect.value = '';
            modalSectionSelect.innerHTML = '<option value="">Select class first</option>';
            modalSectionSelect.disabled = true;
            return;
        }

        const matchedClass = classes.find(function (item) {
            return String(item.name).toLowerCase() === String(schedule.className || '').toLowerCase();
        });

        if (matchedClass) {
            modalClassSelect.value = String(matchedClass.id);
            populateModalSectionOptions(matchedClass.id, schedule.section || '');
        } else {
            modalClassSelect.value = '';
            modalSectionSelect.innerHTML = '<option value="">Select class first</option>';
            modalSectionSelect.disabled = true;
        }
    }

    async function loadClassData() {
        const [classesResponse, sectionsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections')
        ]);
        if (!classesResponse.ok || !sectionsResponse.ok) {
            throw new Error('Failed to load class data');
        }
        classes = await classesResponse.json();
        masterSections = await sectionsResponse.json();
        renderModalClassOptions();
    }

    async function loadTeachers() {
        const response = await fetch('/api/class-teachers');
        if (!response.ok) {
            throw new Error('Failed to load teachers');
        }
        teachers = await response.json();
        fillTeacherSelect();
    }

    async function loadSchedules() {
        if (!teacherSelect.value) {
            return;
        }
        const url = '/api/lesson-plan/schedules?teacherCode=' + encodeURIComponent(teacherSelect.value)
            + '&weekStart=' + encodeURIComponent(toIsoDate(weekStart));
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load lesson plan');
        }
        const entries = await response.json();
        groupSchedules(entries);
        schedulePanel.style.display = '';
        updateWeekLabel();
        renderScheduleGrid();
    }

    function renderDetailRows(data) {
        const rows = [
            ['Class', data.classLabel],
            ['Subject', data.subjectLabel],
            ['Date', data.dateLabel],
            ['Lesson', data.lessonName],
            ['Topic', data.topicName],
            ['Sub Topic', data.subTopic],
            ['General Objectives', data.generalObjectives],
            ['Teaching Method', data.teachingMethod],
            ['Previous Knowledge', data.previousKnowledge],
            ['Comprehensive Questions', data.comprehensiveQuestions],
            ['Presentation', data.presentation]
        ];

        lessonPlanDetailTable.innerHTML = rows.map(function (row) {
            return ''
                + '<div class="lesson-plan-detail-row">'
                + '<div class="detail-label">' + escapeHtml(row[0]) + '</div>'
                + '<div class="detail-value">' + escapeHtml(row[1] || '') + '</div>'
                + '</div>';
        }).join('');
    }

    function renderComments(comments) {
        if (!comments || !comments.length) {
            commentList.innerHTML = '';
            return;
        }
        commentList.innerHTML = comments.map(function (comment) {
            return '<div class="comment-item">' + escapeHtml(comment.commentText) + '</div>';
        }).join('');
    }

    function closeViewModal() {
        lessonPlanViewModal.hidden = true;
        currentViewData = null;
        commentInput.value = '';
    }

    async function openViewModal(scheduleId) {
        const response = await fetch('/api/lesson-plan/schedules/' + scheduleId + '/view');
        if (!response.ok) {
            throw new Error('Failed to load lesson plan details');
        }
        currentViewData = await response.json();
        renderDetailRows(currentViewData);
        renderComments(currentViewData.comments || []);
        lessonPlanViewModal.hidden = false;
    }

    function printViewModal() {
        if (!currentViewData) {
            return;
        }
        const printWindow = window.open('', '_blank');
        const rows = [
            ['Class', currentViewData.classLabel],
            ['Subject', currentViewData.subjectLabel],
            ['Date', currentViewData.dateLabel],
            ['Lesson', currentViewData.lessonName],
            ['Topic', currentViewData.topicName],
            ['Sub Topic', currentViewData.subTopic],
            ['General Objectives', currentViewData.generalObjectives],
            ['Teaching Method', currentViewData.teachingMethod],
            ['Previous Knowledge', currentViewData.previousKnowledge],
            ['Comprehensive Questions', currentViewData.comprehensiveQuestions],
            ['Presentation', currentViewData.presentation]
        ];
        printWindow.document.write(''
            + '<!DOCTYPE html><html><head><title>Lesson Plan</title><style>'
            + 'body{font-family:Arial,sans-serif;margin:24px;color:#111}'
            + 'h1{font-size:20px;margin-bottom:16px}'
            + 'table{width:100%;border-collapse:collapse}'
            + 'td{border:1px solid #ccc;padding:8px;vertical-align:top}'
            + 'td.label{font-weight:bold;width:200px;background:#f8fafc}'
            + '</style></head><body>'
            + '<h1>Lesson Plan</h1><table>'
            + rows.map(function (row) {
                return '<tr><td class="label">' + escapeHtml(row[0]) + '</td><td>'
                    + escapeHtml(row[1] || '') + '</td></tr>';
            }).join('')
            + '</table></body></html>');
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    }

    function exportViewToExcel() {
        if (!currentViewData || !window.XLSX) {
            return;
        }
        const exportRow = {
            Class: currentViewData.classLabel,
            Subject: currentViewData.subjectLabel,
            Date: currentViewData.dateLabel,
            Lesson: currentViewData.lessonName,
            Topic: currentViewData.topicName,
            'Sub Topic': currentViewData.subTopic,
            'General Objectives': currentViewData.generalObjectives,
            'Teaching Method': currentViewData.teachingMethod,
            'Previous Knowledge': currentViewData.previousKnowledge,
            'Comprehensive Questions': currentViewData.comprehensiveQuestions,
            Presentation: currentViewData.presentation
        };
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([exportRow]);
        XLSX.utils.book_append_sheet(wb, ws, 'Lesson Plan');
        XLSX.writeFile(wb, 'lesson-plan.xlsx');
    }

    async function sendComment() {
        if (!currentViewData || !currentViewData.scheduleId) {
            return;
        }
        const commentText = commentInput.value.trim();
        if (!commentText) {
            return;
        }
        const response = await fetch('/api/lesson-plan/schedules/' + currentViewData.scheduleId + '/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentText: commentText })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to send comment');
        }
        currentViewData.comments = currentViewData.comments || [];
        currentViewData.comments.push(result.data);
        renderComments(currentViewData.comments);
        commentInput.value = '';
    }

    function openModal(mode, schedule, planDate) {
        scheduleModal.hidden = false;
        scheduleModalTitle.textContent = mode === 'add' ? 'Add Lesson Plan' : 'Edit Lesson Plan';
        scheduleIdInput.value = schedule && schedule.id ? schedule.id : '';
        modalTeacherCodeInput.value = teacherSelect.value;
        modalTeacherNameInput.value = teacherSelect.options[teacherSelect.selectedIndex].textContent.split('(')[0].trim();
        modalPlanDateInput.value = schedule ? schedule.planDate : planDate;
        modalSubjectNameInput.value = schedule ? (schedule.subjectName || '') : '';
        modalSubjectCodeInput.value = schedule ? (schedule.subjectCode || '') : '';
        setModalClassAndSection(schedule || null);
        modalTimeFromInput.value = schedule ? (schedule.timeFrom || '') : '08:00';
        modalTimeToInput.value = schedule ? (schedule.timeTo || '') : '08:45';
        modalRoomNoInput.value = schedule ? (schedule.roomNo || '') : '';
    }

    function closeModal() {
        scheduleModal.hidden = true;
        scheduleModalForm.reset();
    }

    function findScheduleById(id) {
        let found = null;
        Object.keys(schedulesByDate).some(function (key) {
            found = (schedulesByDate[key] || []).find(function (item) {
                return String(item.id) === String(id);
            }) || null;
            return !!found;
        });
        return found;
    }

    lessonPlanForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!teacherSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select a teacher.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        loadSchedules().catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load lesson plan.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    });

    prevWeekBtn.addEventListener('click', function () {
        weekStart.setDate(weekStart.getDate() - 7);
        if (teacherSelect.value) {
            loadSchedules().catch(showLoadError);
        } else {
            updateWeekLabel();
        }
    });

    nextWeekBtn.addEventListener('click', function () {
        weekStart.setDate(weekStart.getDate() + 7);
        if (teacherSelect.value) {
            loadSchedules().catch(showLoadError);
        } else {
            updateWeekLabel();
        }
    });

    function showLoadError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load lesson plan.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    scheduleGrid.addEventListener('click', function (event) {
        const viewBtn = event.target.closest('.btn-view');
        const editBtn = event.target.closest('.btn-edit');
        const deleteBtn = event.target.closest('.btn-delete');
        const addBtn = event.target.closest('.btn-add-day');

        if (addBtn) {
            openModal('add', null, addBtn.getAttribute('data-plan-date'));
            return;
        }

        const actionBtn = viewBtn || editBtn || deleteBtn;
        if (!actionBtn) {
            return;
        }

        const schedule = findScheduleById(actionBtn.getAttribute('data-id'));
        if (!schedule) {
            return;
        }

        if (viewBtn) {
            openViewModal(schedule.id).catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load lesson plan.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
            return;
        }

        if (editBtn) {
            openModal('edit', schedule);
            return;
        }

        if (deleteBtn) {
            Swal.fire({
                icon: 'warning',
                title: 'Delete Lesson Plan?',
                text: 'This schedule entry will be removed.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            }).then(async function (result) {
                if (!result.isConfirmed) {
                    return;
                }
                const response = await fetch('/api/lesson-plan/schedules/' + schedule.id, { method: 'DELETE' });
                const body = await response.json();
                if (!response.ok || !body.success) {
                    throw new Error(body.message || 'Failed to delete lesson plan');
                }
                await loadSchedules();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1200,
                    showConfirmButton: false
                });
            }).catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    confirmButtonColor: '#8b5cf6'
                });
            });
        }
    });

    modalClassSelect.addEventListener('change', function () {
        populateModalSectionOptions(modalClassSelect.value, '');
    });

    scheduleModalForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(modalClassSelect.value);
        });
        if (!selectedClass || !modalSectionSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select class and section.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        const payload = {
            teacherCode: modalTeacherCodeInput.value,
            teacherName: modalTeacherNameInput.value,
            planDate: modalPlanDateInput.value,
            subjectName: modalSubjectNameInput.value.trim(),
            subjectCode: modalSubjectCodeInput.value.trim(),
            classId: selectedClass.id,
            className: selectedClass.name,
            section: modalSectionSelect.value.trim(),
            timeFrom: modalTimeFromInput.value,
            timeTo: modalTimeToInput.value,
            roomNo: modalRoomNoInput.value.trim()
        };

        const scheduleId = scheduleIdInput.value;
        const url = scheduleId
            ? '/api/lesson-plan/schedules/' + scheduleId
            : '/api/lesson-plan/schedules';
        const method = scheduleId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save lesson plan');
            }
            closeModal();
            await loadSchedules();
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                timer: 1200,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        }
    });

    scheduleModalOverlay.addEventListener('click', closeModal);
    scheduleModalClose.addEventListener('click', closeModal);
    scheduleModalCancel.addEventListener('click', closeModal);

    lessonPlanViewOverlay.addEventListener('click', closeViewModal);
    lessonPlanViewClose.addEventListener('click', closeViewModal);
    sendCommentBtn.addEventListener('click', function () {
        sendComment().catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        });
    });
    commentInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendCommentBtn.click();
        }
    });
    if (viewPrintBtn) {
        viewPrintBtn.addEventListener('click', printViewModal);
    }
    if (viewExcelBtn) {
        viewExcelBtn.addEventListener('click', exportViewToExcel);
    }

    updateWeekLabel();
    Promise.all([loadTeachers(), loadClassData()]).catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load page data.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
