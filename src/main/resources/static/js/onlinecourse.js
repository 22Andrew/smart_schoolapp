document.addEventListener('DOMContentLoaded', function () {
    const courseGrid = document.getElementById('courseGrid');
    const searchInput = document.getElementById('courseSearchInput');
    const searchBtn = document.getElementById('courseSearchBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const addCourseBtn = document.getElementById('addCourseBtn');

    const modal = document.getElementById('addCourseModal');
    const overlay = document.getElementById('addCourseOverlay');
    const closeBtn = document.getElementById('closeAddCourseBtn');
    const saveBtn = document.getElementById('saveCourseBtn');
    const form = document.getElementById('addCourseForm');

    const titleInput = document.getElementById('courseTitle');
    const outcomeInput = document.getElementById('courseOutcomeInput');
    const addOutcomeBtn = document.getElementById('addOutcomeBtn');
    const outcomeList = document.getElementById('outcomeList');
    const descriptionEditor = document.getElementById('courseDescription');
    const descToolbar = document.getElementById('descToolbar');
    const descStyle = document.getElementById('descStyle');
    const descImageBtn = document.getElementById('descImageBtn');
    const descImageInput = document.getElementById('descImageInput');

    const previewDropzone = document.getElementById('previewDropzone');
    const previewImageInput = document.getElementById('previewImageInput');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const previewImageThumb = document.getElementById('previewImageThumb');

    const classSelect = document.getElementById('courseClassSelect');
    const sectionSelect = document.getElementById('courseSectionSelect');
    const teacherSelect = document.getElementById('courseTeacherSelect');
    const previewPlatformSelect = document.getElementById('previewPlatformSelect');
    const previewUrlInput = document.getElementById('previewUrlInput');
    const priceInput = document.getElementById('coursePrice');
    const discountInput = document.getElementById('courseDiscount');
    const freeCourseCheck = document.getElementById('freeCourseCheck');
    const categorySelect = document.getElementById('courseCategorySelect');
    const frontVisibilitySelect = document.getElementById('frontVisibilitySelect');
    const certificateSelect = document.getElementById('courseCertificateSelect');

    let courses = [];
    let classes = [];
    let teachers = [];
    let outcomes = [];
    let previewFile = null;
    let viewMode = 'grid';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatMoney(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return '$0.00';
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function initials(name) {
        const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '?';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    function stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html || '';
        return (div.textContent || '').trim();
    }

    function getFilteredCourses() {
        const term = (searchInput.value || '').toLowerCase().trim();
        if (!term) return courses.slice();
        return courses.filter(function (item) {
            return String(item.title || '').toLowerCase().indexOf(term) !== -1
                || String(item.category || '').toLowerCase().indexOf(term) !== -1
                || String(item.instructorName || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    function priceHtml(item) {
        const price = Number(item.price) || 0;
        const discount = item.discountPrice == null || item.discountPrice === ''
            ? null
            : Number(item.discountPrice);
        if (discount != null && !Number.isNaN(discount) && discount < price) {
            return formatMoney(discount) + '<span class="old-price">' + formatMoney(price) + '</span>';
        }
        return formatMoney(price);
    }

    function renderCourses() {
        const filtered = getFilteredCourses();
        courseGrid.classList.toggle('list-view', viewMode === 'list');

        if (!filtered.length) {
            courseGrid.innerHTML = '<div class="course-empty">No courses found</div>';
            return;
        }

        courseGrid.innerHTML = filtered.map(function (item) {
            const color = item.themeColor || '#8b5cf6';
            const instructorLabel = (item.instructorName || 'Instructor')
                + (item.instructorCode ? ' (' + item.instructorCode + ')' : '');
            const hasImage = !!item.thumbnailUrl;
            const thumbStyle = hasImage
                ? 'background-image:url(\'' + String(item.thumbnailUrl).replace(/'/g, '%27') + '\');'
                : 'background: linear-gradient(135deg, ' + escapeHtml(color) + ', #0f172a);';
            return '<article class="course-card" data-id="' + escapeHtml(item.id) + '">'
                + '<div class="course-thumb' + (hasImage ? ' has-image' : '') + '" style="' + thumbStyle + '">'
                + '<div class="course-thumb-inner">' + escapeHtml(item.title || 'Course') + '</div>'
                + '<div class="instructor-bar">'
                + '<span class="instructor-avatar">' + escapeHtml(initials(item.instructorName)) + '</span>'
                + '<div class="instructor-meta">'
                + '<div class="instructor-name">' + escapeHtml(instructorLabel) + '</div>'
                + '<div class="instructor-updated">Last Updated: ' + escapeHtml(item.lastUpdatedDisplay || '') + '</div>'
                + '</div></div></div>'
                + '<div class="course-body">'
                + '<h3 class="course-title">' + escapeHtml(item.title || '') + '</h3>'
                + '<p class="course-description">' + escapeHtml(stripHtml(item.description) || '') + '</p>'
                + '<div class="course-category">' + escapeHtml(item.category || '') + '</div>'
                + '<div class="course-meta">'
                + '<span class="meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
                + escapeHtml(item.classLabel || '') + '</span>'
                + '<span class="meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
                + 'Lesson ' + escapeHtml(item.lessonCount) + (item.lessonDuration ? ', ' + escapeHtml(item.lessonDuration) : '')
                + '</span>'
                + '<span class="meta-item">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
                + 'Exam ' + escapeHtml(item.examCount)
                + ', Quiz ' + escapeHtml(item.quizCount)
                + ', Assignment ' + escapeHtml(item.assignmentCount)
                + '</span>'
                + '</div>'
                + '<div class="course-price-row">' + priceHtml(item) + '</div>'
                + '<div class="course-actions">'
                + '<button type="button" class="btn-manage" data-id="' + escapeHtml(item.id) + '">Manage</button>'
                + '<button type="button" class="btn-preview" data-id="' + escapeHtml(item.id) + '">Preview</button>'
                + '</div>'
                + '</div></article>';
        }).join('');
    }

    async function loadCourses() {
        const response = await fetch('/api/online-courses');
        if (!response.ok) throw new Error('Failed to load online courses');
        courses = await response.json();
        renderCourses();
    }

    function setView(mode) {
        viewMode = mode;
        gridViewBtn.classList.toggle('active', mode === 'grid');
        listViewBtn.classList.toggle('active', mode === 'list');
        renderCourses();
    }

    function renderOutcomes() {
        outcomeList.innerHTML = outcomes.map(function (item, index) {
            return '<div class="outcome-item"><span>' + escapeHtml(item) + '</span>'
                + '<button type="button" data-index="' + index + '" aria-label="Remove">&times;</button></div>';
        }).join('');
    }

    function populateSections() {
        const selected = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const sections = selected && Array.isArray(selected.sections) ? selected.sections : [];
        sectionSelect.innerHTML = '';
        sections.forEach(function (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sectionSelect.appendChild(option);
        });
    }

    async function loadLookups() {
        const [classesRes, teachersRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/class-teachers')
        ]);
        if (!classesRes.ok) throw new Error('Failed to load classes');
        if (!teachersRes.ok) throw new Error('Failed to load teachers');
        classes = await classesRes.json();
        teachers = await teachersRes.json();

        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            classSelect.appendChild(option);
        });

        teacherSelect.innerHTML = '<option value="">Select</option>';
        teachers.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.code || item.teacherCode || '';
            option.textContent = item.display || item.teacherDisplay || ((item.name || item.teacherName || '') + ' (' + option.value + ')');
            option.setAttribute('data-name', item.name || item.teacherName || '');
            teacherSelect.appendChild(option);
        });
    }

    function setPreviewFile(file) {
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
            Swal.fire({ icon: 'warning', title: 'Invalid file', text: 'Please choose an image file.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        previewFile = file;
        const url = URL.createObjectURL(file);
        previewImageThumb.src = url;
        previewImageThumb.hidden = false;
        previewPlaceholder.hidden = true;
    }

    function resetModal() {
        form.reset();
        outcomes = [];
        previewFile = null;
        renderOutcomes();
        descriptionEditor.innerHTML = '';
        previewImageThumb.hidden = true;
        previewImageThumb.removeAttribute('src');
        previewPlaceholder.hidden = false;
        previewImageInput.value = '';
        sectionSelect.innerHTML = '';
        priceInput.disabled = false;
        discountInput.disabled = false;
        frontVisibilitySelect.value = 'Yes';
        previewPlatformSelect.value = 'Youtube';
    }

    function openModal() {
        resetModal();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        titleInput.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function selectedSections() {
        return Array.from(sectionSelect.selectedOptions).map(function (opt) { return opt.value; });
    }

    async function saveCourse() {
        const title = (titleInput.value || '').trim();
        const descriptionHtml = (descriptionEditor.innerHTML || '').trim();
        const descriptionText = stripHtml(descriptionHtml);
        const classItem = classes.find(function (c) { return String(c.id) === String(classSelect.value); });
        const sections = selectedSections();
        const teacherOption = teacherSelect.options[teacherSelect.selectedIndex];
        const teacherName = teacherOption ? (teacherOption.getAttribute('data-name') || teacherOption.textContent) : '';
        const teacherCode = teacherSelect.value;
        const category = categorySelect.value;
        const freeCourse = !!freeCourseCheck.checked;
        const price = priceInput.value;

        if (!title) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Title is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!descriptionText) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Description is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!previewFile) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Inline Preview Image is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!classItem) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Class is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!sections.length) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Section is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!teacherCode) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Assign Teacher is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!category) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Course Category is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!freeCourse && (price === '' || Number(price) < 0)) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Price is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        const payload = {
            title: title,
            description: descriptionHtml,
            outcomes: outcomes.join('\n'),
            classLabel: classItem.name,
            sectionLabels: sections.join(', '),
            instructorName: teacherName.replace(/\s*\([^)]*\)\s*$/, '').trim(),
            instructorCode: teacherCode,
            previewPlatform: previewPlatformSelect.value,
            previewUrl: (previewUrlInput.value || '').trim(),
            price: freeCourse ? 0 : Number(price),
            discountPercent: discountInput.value === '' ? null : Number(discountInput.value),
            freeCourse: freeCourse,
            category: category,
            frontVisibility: frontVisibilitySelect.value,
            certificate: certificateSelect.value
        };

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        formData.append('previewImage', previewFile);

        saveBtn.disabled = true;
        try {
            const response = await fetch('/api/online-courses', { method: 'POST', body: formData });
            const data = await response.json().catch(function () { return {}; });
            if (!response.ok) throw new Error(data.message || 'Failed to create course');
            closeModal();
            await loadCourses();
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Course created successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create course.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveBtn.disabled = false;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderCourses);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                renderCourses();
            }
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', renderCourses);
    if (gridViewBtn) gridViewBtn.addEventListener('click', function () { setView('grid'); });
    if (listViewBtn) listViewBtn.addEventListener('click', function () { setView('list'); });

    if (addCourseBtn) addCourseBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    if (addOutcomeBtn) {
        addOutcomeBtn.addEventListener('click', function () {
            const value = (outcomeInput.value || '').trim();
            if (!value) return;
            outcomes.push(value);
            outcomeInput.value = '';
            renderOutcomes();
            outcomeInput.focus();
        });
    }
    if (outcomeInput) {
        outcomeInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addOutcomeBtn.click();
            }
        });
    }
    if (outcomeList) {
        outcomeList.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-index]');
            if (!btn) return;
            outcomes.splice(parseInt(btn.getAttribute('data-index'), 10), 1);
            renderOutcomes();
        });
    }

    if (descToolbar) {
        descToolbar.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-cmd]');
            if (!btn) return;
            e.preventDefault();
            const cmd = btn.getAttribute('data-cmd');
            const value = btn.getAttribute('data-value') || null;
            descriptionEditor.focus();
            document.execCommand(cmd, false, value);
        });
    }
    if (descStyle) {
        descStyle.addEventListener('change', function () {
            descriptionEditor.focus();
            document.execCommand('formatBlock', false, descStyle.value);
        });
    }
    if (descImageBtn && descImageInput) {
        descImageBtn.addEventListener('click', function () { descImageInput.click(); });
        descImageInput.addEventListener('change', function () {
            const file = descImageInput.files && descImageInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                descriptionEditor.focus();
                document.execCommand('insertImage', false, reader.result);
            };
            reader.readAsDataURL(file);
            descImageInput.value = '';
        });
    }

    if (previewDropzone) {
        previewDropzone.addEventListener('click', function () { previewImageInput.click(); });
        previewDropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            previewDropzone.classList.add('dragover');
        });
        previewDropzone.addEventListener('dragleave', function () {
            previewDropzone.classList.remove('dragover');
        });
        previewDropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            previewDropzone.classList.remove('dragover');
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            setPreviewFile(file);
        });
    }
    if (previewImageInput) {
        previewImageInput.addEventListener('change', function () {
            const file = previewImageInput.files && previewImageInput.files[0];
            setPreviewFile(file);
        });
    }

    if (classSelect) classSelect.addEventListener('change', populateSections);
    if (freeCourseCheck) {
        freeCourseCheck.addEventListener('change', function () {
            const free = freeCourseCheck.checked;
            priceInput.disabled = free;
            discountInput.disabled = free;
            if (free) {
                priceInput.value = '0';
                discountInput.value = '';
            }
        });
    }
    if (saveBtn) saveBtn.addEventListener('click', saveCourse);

    const previewModal = document.getElementById('previewCourseModal');
    const previewOverlay = document.getElementById('previewCourseOverlay');
    const closePreviewBtn = document.getElementById('closePreviewCourseBtn');
    const previewMedia = document.getElementById('previewMedia');
    const previewInstructorAvatar = document.getElementById('previewInstructorAvatar');
    const previewInstructorName = document.getElementById('previewInstructorName');
    const previewInstructorUpdated = document.getElementById('previewInstructorUpdated');
    const previewClassValue = document.getElementById('previewClassValue');
    const previewLessonValue = document.getElementById('previewLessonValue');
    const previewExamValue = document.getElementById('previewExamValue');
    const previewAssignmentValue = document.getElementById('previewAssignmentValue');
    const previewDurationValue = document.getElementById('previewDurationValue');
    const previewPriceValue = document.getElementById('previewPriceValue');
    const previewCreatedByValue = document.getElementById('previewCreatedByValue');
    const previewCourseTitle = document.getElementById('previewCourseTitle');
    const previewCourseDescription = document.getElementById('previewCourseDescription');
    const previewLearnList = document.getElementById('previewLearnList');
    const previewCurriculum = document.getElementById('previewCurriculum');

    function youtubeEmbedUrl(url) {
        if (!url) return null;
        const text = String(url).trim();
        let id = null;
        const watchMatch = text.match(/[?&]v=([^&]+)/);
        const shortMatch = text.match(/youtu\.be\/([^?&]+)/);
        const embedMatch = text.match(/youtube\.com\/embed\/([^?&]+)/);
        if (watchMatch) id = watchMatch[1];
        else if (shortMatch) id = shortMatch[1];
        else if (embedMatch) id = embedMatch[1];
        return id ? 'https://www.youtube.com/embed/' + id : null;
    }

    function renderPreviewMedia(course) {
        const embed = youtubeEmbedUrl(course.previewUrl);
        if (embed) {
            previewMedia.innerHTML = '<iframe src="' + escapeHtml(embed)
                + '" title="Course preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
            return;
        }
        if (course.thumbnailUrl) {
            previewMedia.innerHTML = '<img src="' + escapeHtml(course.thumbnailUrl) + '" alt="' + escapeHtml(course.title || 'Course') + '">';
            return;
        }
        previewMedia.innerHTML = '<div class="preview-media-fallback">'
            + '<div class="play-circle">▶</div>'
            + '<div>' + escapeHtml(course.title || 'Course Preview') + '</div>'
            + '</div>';
    }

    function renderLearnList(course) {
        const raw = (course.outcomes || '').trim();
        let items = raw
            ? raw.split(/\r?\n|;/).map(function (s) { return s.trim(); }).filter(Boolean)
            : [];
        if (!items.length) {
            items = [
                'Improve your understanding of this course topic',
                'Practice key skills through lessons and activities',
                'Build confidence with guided learning content'
            ];
        }
        previewLearnList.innerHTML = items.map(function (item) {
            return '<li><span class="check">✔</span><span>' + escapeHtml(item) + '</span></li>';
        }).join('');
    }

    function renderCurriculum(course) {
        const lessonCount = Number(course.lessonCount) || 0;
        const examCount = Number(course.examCount) || 0;
        const quizCount = Number(course.quizCount) || 0;
        const duration = course.lessonDuration || '00:00:00';
        const sectionTitle = 'Section 1: ' + (course.title || 'Course');

        let lessonItems = '';
        if (lessonCount > 0) {
            for (let i = 1; i <= lessonCount; i++) {
                lessonItems += '<div class="curriculum-lesson">'
                    + '<div class="left"><span>▶</span><span>Lesson ' + i + ': ' + escapeHtml(course.title || 'Lesson') + '</span></div>'
                    + '<div class="duration">' + escapeHtml(duration.replace(/\s*H(rs)?$/i, '')) + '</div>'
                    + '</div>';
            }
        } else {
            lessonItems += '<div class="curriculum-lesson">'
                + '<div class="left"><span>▶</span><span>Lesson 1: ' + escapeHtml(course.title || 'Lesson') + '</span></div>'
                + '<div class="duration">' + escapeHtml(String(duration).replace(/\s*H(rs)?$/i, '') || '00:00:00') + '</div>'
                + '</div>';
        }

        for (let i = 1; i <= Math.max(examCount, quizCount > 0 ? 1 : 0); i++) {
            lessonItems += '<div class="curriculum-lesson">'
                + '<div class="left"><span>📡</span><span>Exam ' + i + ': ' + escapeHtml(course.title || 'Course') + ' Quiz</span></div>'
                + '<div class="duration"></div>'
                + '</div>';
        }

        previewCurriculum.innerHTML = '<div class="curriculum-section open">'
            + '<button type="button" class="curriculum-section-header">'
            + '<span class="left"><span class="toggle">−</span><span>' + escapeHtml(sectionTitle) + '</span></span>'
            + '<span class="right">▶ Lesson</span>'
            + '</button>'
            + '<div class="curriculum-lessons">' + lessonItems + '</div>'
            + '</div>';
    }

    function openPreviewModal(course) {
        if (!course) return;

        const instructorLabel = (course.instructorName || 'Instructor')
            + (course.instructorCode ? ' (' + course.instructorCode + ')' : '');
        const classText = (course.classLabel || '-')
            + (course.sectionLabels ? ' (' + course.sectionLabels + ')' : '');
        const duration = course.lessonDuration
            ? String(course.lessonDuration).replace(/\s*H$/i, ' Hrs')
            : '00:00:00 Hrs';

        previewInstructorAvatar.textContent = initials(course.instructorName);
        previewInstructorName.textContent = instructorLabel;
        previewInstructorUpdated.textContent = 'Last Updated ' + (course.lastUpdatedDisplay || '-');
        previewClassValue.textContent = classText;
        previewLessonValue.textContent = String(course.lessonCount == null ? 0 : course.lessonCount);
        previewExamValue.textContent = String(course.examCount == null ? 0 : course.examCount);
        previewAssignmentValue.textContent = String(course.assignmentCount == null ? 0 : course.assignmentCount);
        previewDurationValue.textContent = duration;
        previewPriceValue.innerHTML = priceHtml(course).replace(/\$(\d)/g, '$ $1');
        previewCreatedByValue.textContent = (course.createdByName || 'Joe Black')
            + (course.createdByCode ? ' (' + course.createdByCode + ')' : '');
        previewCourseTitle.textContent = course.title || 'Course';

        const desc = course.description || '';
        if (/<[a-z][\s\S]*>/i.test(desc)) {
            previewCourseDescription.innerHTML = desc;
        } else {
            previewCourseDescription.innerHTML = '<p>' + escapeHtml(desc) + '</p>';
        }

        renderPreviewMedia(course);
        renderLearnList(course);
        renderCurriculum(course);

        previewModal.classList.add('open');
        previewModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closePreviewModal() {
        previewModal.classList.remove('open');
        previewModal.setAttribute('aria-hidden', 'true');
        previewMedia.innerHTML = '';
        if (!modal.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }

    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreviewModal);
    if (previewOverlay) previewOverlay.addEventListener('click', closePreviewModal);
    if (previewCurriculum) {
        previewCurriculum.addEventListener('click', function (e) {
            const header = e.target.closest('.curriculum-section-header');
            if (!header) return;
            const section = header.closest('.curriculum-section');
            const open = section.classList.toggle('open');
            const toggle = header.querySelector('.toggle');
            if (toggle) toggle.textContent = open ? '−' : '+';
        });
    }

    const manageModal = document.getElementById('manageCourseModal');
    const manageOverlay = document.getElementById('manageCourseOverlay');
    const closeManageBtn = document.getElementById('closeManageCourseBtn');
    const manageCourseImage = document.getElementById('manageCourseImage');
    const manageCourseTitle = document.getElementById('manageCourseTitle');
    const manageCourseDescription = document.getElementById('manageCourseDescription');
    const manageCourseClass = document.getElementById('manageCourseClass');
    const manageCourseSection = document.getElementById('manageCourseSection');
    const manageCourseTeacher = document.getElementById('manageCourseTeacher');
    const manageCourseCreatedBy = document.getElementById('manageCourseCreatedBy');
    const manageSectionsList = document.getElementById('manageSectionsList');
    const addSectionBtn = document.getElementById('addSectionBtn');
    const orderSectionBtn = document.getElementById('orderSectionBtn');
    const togglePublishBtn = document.getElementById('togglePublishBtn');
    const editCourseDetailBtn = document.getElementById('editCourseDetailBtn');
    const deleteCourseDetailBtn = document.getElementById('deleteCourseDetailBtn');

    let manageState = { course: null, sections: [] };

    function youtubeIdFromUrl(url) {
        if (!url) return null;
        const text = String(url).trim();
        const watchMatch = text.match(/[?&]v=([^&]+)/);
        const shortMatch = text.match(/youtu\.be\/([^?&]+)/);
        const embedMatch = text.match(/youtube\.com\/embed\/([^?&]+)/);
        if (watchMatch) return watchMatch[1];
        if (shortMatch) return shortMatch[1];
        if (embedMatch) return embedMatch[1];
        return null;
    }

    function youtubeThumb(url) {
        const id = youtubeIdFromUrl(url);
        return id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : null;
    }

    function iconSvg(name) {
        const icons = {
            plus: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
            edit: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
            trash: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
            clock: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
            list: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            play: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
        };
        return icons[name] || '';
    }

    function contentTypeLabel(type, index) {
        const map = { LESSON: 'Lesson', QUIZ: 'Quiz', EXAM: 'Exam', ASSIGNMENT: 'Assignment' };
        return (map[type] || type) + ' ' + index;
    }

    function renderManageDetail(course) {
        const teacher = (course.instructorName || '-')
            + (course.instructorCode ? ' (' + course.instructorCode + ')' : '');
        const createdBy = (course.createdByName || 'Joe Black')
            + (course.createdByCode ? ' (' + course.createdByCode + ')' : '');

        if (course.thumbnailUrl) {
            manageCourseImage.style.background = '';
            manageCourseImage.innerHTML = '<img src="' + escapeHtml(course.thumbnailUrl) + '" alt="' + escapeHtml(course.title || 'Course') + '">';
        } else {
            manageCourseImage.innerHTML = '';
            manageCourseImage.textContent = course.title || 'Course';
            manageCourseImage.style.background = 'linear-gradient(135deg, ' + (course.themeColor || '#8b5cf6') + ', #0f172a)';
        }

        manageCourseTitle.textContent = course.title || '-';
        manageCourseDescription.textContent = stripHtml(course.description) || '-';
        manageCourseClass.textContent = course.classLabel || '-';
        manageCourseSection.textContent = course.sectionLabels || '-';
        manageCourseTeacher.textContent = teacher;
        manageCourseCreatedBy.textContent = createdBy;

        const published = course.published !== false;
        togglePublishBtn.textContent = published ? 'Unpublish Course' : 'Publish Course';
        togglePublishBtn.classList.toggle('is-unpublished', !published);
    }

    function renderContentCard(item, typeIndex) {
        const type = item.contentType || 'LESSON';
        const label = contentTypeLabel(type, typeIndex);
        const title = item.title || label;
        const actions = '<div class="actions">'
            + '<button type="button" class="icon-btn" data-action="add-content" data-section-id="' + escapeHtml(item.sectionId) + '" title="Add">' + iconSvg('plus') + '</button>'
            + '<button type="button" class="icon-btn" data-action="edit-content" data-id="' + escapeHtml(item.id) + '" title="Edit">' + iconSvg('edit') + '</button>'
            + '<button type="button" class="icon-btn danger" data-action="delete-content" data-id="' + escapeHtml(item.id) + '" title="Delete">' + iconSvg('trash') + '</button>'
            + '</div>';

        let headerExtra = '';
        if (type === 'LESSON' && item.duration) {
            headerExtra = '<span class="meta">' + iconSvg('clock') + ' ' + escapeHtml(item.duration) + '</span>';
        }

        let body = '';
        if (type === 'LESSON') {
            const thumb = item.thumbnailUrl || youtubeThumb(item.videoUrl);
            const playOverlay = youtubeThumb(item.videoUrl)
                ? '<div class="yt-play"><span>▶</span></div>'
                : '';
            body = '<div class="manage-content-body"><div class="manage-lesson-media">'
                + '<div class="manage-video-thumb">'
                + (thumb
                    ? '<img src="' + escapeHtml(thumb) + '" alt="Lesson preview">' + playOverlay
                    : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;">No preview</div>')
                + '</div>'
                + '<div class="manage-lesson-summary">' + escapeHtml(item.summary || '') + '</div>'
                + '</div></div>';
        } else if (type === 'EXAM') {
            body = '<div class="manage-content-body"><div class="manage-meta-grid">'
                + '<div class="item"><div class="k">Exam From</div><div class="v">' + escapeHtml(item.examFrom || '-') + '</div></div>'
                + '<div class="item"><div class="k">Exam To</div><div class="v">' + escapeHtml(item.examTo || '-') + '</div></div>'
                + '<div class="item"><div class="k">Exam Duration</div><div class="v">' + escapeHtml(item.examDuration || '-') + '</div></div>'
                + '<div class="item"><div class="k">Passing Percentage</div><div class="v">' + escapeHtml(item.passingPercentage == null ? '-' : item.passingPercentage) + '</div></div>'
                + '</div></div>';
        } else if (type === 'ASSIGNMENT') {
            const marks = item.maxMarks == null ? '-' : Number(item.maxMarks).toFixed(2);
            body = '<div class="manage-content-body"><div class="manage-meta-grid">'
                + '<div class="item"><div class="k">Assignment Date</div><div class="v">' + escapeHtml(item.assignmentDate || '-') + '</div></div>'
                + '<div class="item"><div class="k">Submission Date</div><div class="v">' + escapeHtml(item.submissionDate || '-') + '</div></div>'
                + '<div class="item"><div class="k">Max Marks</div><div class="v">' + escapeHtml(marks) + '</div></div>'
                + '</div></div>';
        }

        const headerClass = type === 'QUIZ' ? ' quiz' : '';
        const leftIcon = type === 'LESSON' ? iconSvg('play') : iconSvg('list');

        return '<article class="manage-content-card" data-id="' + escapeHtml(item.id) + '">'
            + '<div class="manage-content-header' + headerClass + '">'
            + '<div class="left">' + leftIcon + '<span>' + escapeHtml(title) + '</span>' + headerExtra + '</div>'
            + actions
            + '</div>'
            + body
            + '</article>';
    }

    function renderManageSections() {
        const sections = manageState.sections || [];
        if (!sections.length) {
            manageSectionsList.innerHTML = '<div class="manage-empty">No sections yet. Click + Add Section to begin.</div>';
            return;
        }

        manageSectionsList.innerHTML = sections.map(function (section, sIndex) {
            const counters = { LESSON: 0, QUIZ: 0, EXAM: 0, ASSIGNMENT: 0 };
            const contents = Array.isArray(section.contents) ? section.contents : [];
            const cards = contents.map(function (item) {
                const type = item.contentType || 'LESSON';
                counters[type] = (counters[type] || 0) + 1;
                return renderContentCard(item, counters[type]);
            }).join('');

            return '<div class="manage-section-block" data-section-id="' + escapeHtml(section.id) + '">'
                + '<div class="manage-section-header">'
                + '<div class="title">Section ' + (section.displayIndex || (sIndex + 1)) + ': ' + escapeHtml(section.title || '') + '</div>'
                + '<div class="actions">'
                + '<button type="button" class="icon-btn" data-action="add-content" data-section-id="' + escapeHtml(section.id) + '" title="Add Lesson">' + iconSvg('plus') + '</button>'
                + '<button type="button" class="icon-btn" data-action="edit-section" data-section-id="' + escapeHtml(section.id) + '" title="Edit section">' + iconSvg('edit') + '</button>'
                + '<button type="button" class="icon-btn danger" data-action="delete-section" data-section-id="' + escapeHtml(section.id) + '" title="Delete section">' + iconSvg('trash') + '</button>'
                + '</div></div>'
                + '<div class="manage-section-body">'
                + (cards || '<div class="manage-empty" style="padding:0.75rem;">No lessons yet</div>')
                + '</div></div>';
        }).join('');
    }

    async function reloadManageData() {
        if (!manageState.course || !manageState.course.id) return;
        const response = await fetch('/api/online-courses/' + encodeURIComponent(manageState.course.id) + '/manage');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load course management data');
        }
        const data = await response.json();
        manageState.course = data.course;
        manageState.sections = data.sections || [];
        renderManageDetail(manageState.course);
        renderManageSections();
    }

    async function openManageModal(courseId) {
        const response = await fetch('/api/online-courses/' + encodeURIComponent(courseId) + '/manage');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load course management data');
        }
        const data = await response.json();
        manageState.course = data.course;
        manageState.sections = data.sections || [];
        renderManageDetail(manageState.course);
        renderManageSections();
        manageModal.classList.add('open');
        manageModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeManageModal() {
        if (addSectionModal && addSectionModal.classList.contains('open')) {
            closeAddSectionModal();
        }
        if (orderModal && orderModal.classList.contains('open')) {
            closeOrderModal();
        }
        if (addLessonModal && addLessonModal.classList.contains('open')) {
            closeAddLessonModal();
        }
        manageModal.classList.remove('open');
        manageModal.setAttribute('aria-hidden', 'true');
        manageState = { course: null, sections: [] };
        if (!modal.classList.contains('open') && !previewModal.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }

    const addSectionModal = document.getElementById('addSectionModal');
    const addSectionOverlay = document.getElementById('addSectionOverlay');
    const closeAddSectionBtn = document.getElementById('closeAddSectionBtn');
    const addSectionForm = document.getElementById('addSectionForm');
    const sectionTitleInput = document.getElementById('sectionTitleInput');
    const saveSectionBtn = document.getElementById('saveSectionBtn');

    function openAddSectionModal() {
        if (!manageState.course) return;
        if (addSectionForm) addSectionForm.reset();
        if (saveSectionBtn) saveSectionBtn.disabled = false;
        addSectionModal.classList.add('open');
        addSectionModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (sectionTitleInput) sectionTitleInput.focus();
    }

    function closeAddSectionModal() {
        addSectionModal.classList.remove('open');
        addSectionModal.setAttribute('aria-hidden', 'true');
        if (addSectionForm) addSectionForm.reset();
        if (!modal.classList.contains('open')
            && !previewModal.classList.contains('open')
            && !manageModal.classList.contains('open')
            && !addLessonModal.classList.contains('open')
            && !(orderModal && orderModal.classList.contains('open'))) {
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }

    async function saveSection() {
        if (!manageState.course) return;
        const title = (sectionTitleInput.value || '').trim();
        if (!title) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Title is required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        saveSectionBtn.disabled = true;
        try {
            const response = await fetch('/api/online-courses/' + encodeURIComponent(manageState.course.id) + '/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title })
            });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to add section');
            }
            closeAddSectionModal();
            await reloadManageData();
            await loadCourses();
            Swal.fire({
                icon: 'success',
                title: 'Section added',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add section.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveSectionBtn.disabled = false;
        }
    }

    async function promptEditSection(sectionId) {
        const section = manageState.sections.find(function (s) { return String(s.id) === String(sectionId); });
        const result = await Swal.fire({
            title: 'Edit Section',
            input: 'text',
            inputValue: section ? section.title : '',
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#8b5cf6',
            inputValidator: function (value) {
                if (!value || !value.trim()) return 'Section title is required';
                return null;
            }
        });
        if (!result.isConfirmed) return;
        const response = await fetch('/api/online-courses/sections/' + encodeURIComponent(sectionId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: result.value.trim() })
        });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to update section');
        }
        await reloadManageData();
    }

    const addLessonModal = document.getElementById('addLessonModal');
    const addLessonOverlay = document.getElementById('addLessonOverlay');
    const closeAddLessonBtn = document.getElementById('closeAddLessonBtn');
    const addLessonForm = document.getElementById('addLessonForm');
    const lessonTitleInput = document.getElementById('lessonTitleInput');
    const lessonTypeSelect = document.getElementById('lessonTypeSelect');
    const lessonSummaryInput = document.getElementById('lessonSummaryInput');
    const lessonPreviewDropzone = document.getElementById('lessonPreviewDropzone');
    const lessonPreviewImageInput = document.getElementById('lessonPreviewImageInput');
    const lessonPreviewPlaceholder = document.getElementById('lessonPreviewPlaceholder');
    const lessonPreviewImageThumb = document.getElementById('lessonPreviewImageThumb');
    const saveLessonBtn = document.getElementById('saveLessonBtn');
    let lessonSectionId = null;
    let lessonPreviewFile = null;

    function resetLessonModal() {
        if (addLessonForm) addLessonForm.reset();
        lessonPreviewFile = null;
        if (lessonPreviewImageThumb) {
            lessonPreviewImageThumb.hidden = true;
            lessonPreviewImageThumb.removeAttribute('src');
        }
        if (lessonPreviewPlaceholder) lessonPreviewPlaceholder.hidden = false;
        if (lessonPreviewImageInput) lessonPreviewImageInput.value = '';
        if (saveLessonBtn) saveLessonBtn.disabled = false;
    }

    function setLessonPreviewFile(file) {
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid file',
                text: 'Please choose an image file.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        lessonPreviewFile = file;
        const url = URL.createObjectURL(file);
        lessonPreviewImageThumb.src = url;
        lessonPreviewImageThumb.hidden = false;
        lessonPreviewPlaceholder.hidden = true;
    }

    function openAddLessonModal(sectionId) {
        lessonSectionId = sectionId;
        resetLessonModal();
        addLessonModal.classList.add('open');
        addLessonModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lessonTitleInput) lessonTitleInput.focus();
    }

    function closeAddLessonModal() {
        addLessonModal.classList.remove('open');
        addLessonModal.setAttribute('aria-hidden', 'true');
        lessonSectionId = null;
        resetLessonModal();
        if (!modal.classList.contains('open')
            && !previewModal.classList.contains('open')
            && !manageModal.classList.contains('open')) {
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }

    async function saveLesson() {
        if (!lessonSectionId) return;
        const title = (lessonTitleInput.value || '').trim();
        const lessonType = (lessonTypeSelect.value || '').trim();
        const summary = (lessonSummaryInput.value || '').trim();

        if (!title) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Title is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!lessonType) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Lesson Type is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }
        if (!lessonPreviewFile) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Inline Preview Image is required.', confirmButtonColor: '#8b5cf6' });
            return;
        }

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify({
            title: title,
            lessonType: lessonType,
            summary: summary
        })], { type: 'application/json' }));
        formData.append('previewImage', lessonPreviewFile);

        saveLessonBtn.disabled = true;
        try {
            const response = await fetch('/api/online-courses/sections/' + encodeURIComponent(lessonSectionId) + '/lessons', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to add lesson');
            }
            closeAddLessonModal();
            await reloadManageData();
            await loadCourses();
            Swal.fire({
                icon: 'success',
                title: 'Lesson added',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add lesson.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveLessonBtn.disabled = false;
        }
    }

    if (closeAddLessonBtn) closeAddLessonBtn.addEventListener('click', closeAddLessonModal);
    if (addLessonOverlay) addLessonOverlay.addEventListener('click', closeAddLessonModal);
    if (saveLessonBtn) saveLessonBtn.addEventListener('click', saveLesson);
    if (lessonPreviewDropzone) {
        lessonPreviewDropzone.addEventListener('click', function () {
            lessonPreviewImageInput.click();
        });
        lessonPreviewDropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            lessonPreviewDropzone.classList.add('dragover');
        });
        lessonPreviewDropzone.addEventListener('dragleave', function () {
            lessonPreviewDropzone.classList.remove('dragover');
        });
        lessonPreviewDropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            lessonPreviewDropzone.classList.remove('dragover');
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            setLessonPreviewFile(file);
        });
    }
    if (lessonPreviewImageInput) {
        lessonPreviewImageInput.addEventListener('change', function () {
            setLessonPreviewFile(lessonPreviewImageInput.files && lessonPreviewImageInput.files[0]);
        });
    }

    async function deleteSection(sectionId) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete section?',
            text: 'All lessons in this section will also be deleted.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626'
        });
        if (!confirm.isConfirmed) return;
        const response = await fetch('/api/online-courses/sections/' + encodeURIComponent(sectionId), { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete section');
        }
        await reloadManageData();
        await loadCourses();
    }

    async function deleteContent(contentId) {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete this item?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626'
        });
        if (!confirm.isConfirmed) return;
        const response = await fetch('/api/online-courses/contents/' + encodeURIComponent(contentId), { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete content');
        }
        await reloadManageData();
        await loadCourses();
    }

    async function togglePublish() {
        if (!manageState.course) return;
        const response = await fetch('/api/online-courses/' + encodeURIComponent(manageState.course.id) + '/publish', {
            method: 'PUT'
        });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to update publish status');
        }
        const course = await response.json();
        manageState.course = Object.assign({}, manageState.course, course);
        renderManageDetail(manageState.course);
        await loadCourses();
        Swal.fire({
            icon: 'success',
            title: course.published ? 'Course published' : 'Course unpublished',
            timer: 1400,
            showConfirmButton: false
        });
    }

    async function deleteCourse() {
        if (!manageState.course) return;
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Delete course?',
            text: 'This will permanently delete the course and its curriculum.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626'
        });
        if (!confirm.isConfirmed) return;
        const response = await fetch('/api/online-courses/' + encodeURIComponent(manageState.course.id), { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to delete course');
        }
        closeManageModal();
        await loadCourses();
        Swal.fire({
            icon: 'success',
            title: 'Course deleted',
            timer: 1400,
            showConfirmButton: false
        });
    }

    if (closeManageBtn) closeManageBtn.addEventListener('click', closeManageModal);
    if (manageOverlay) manageOverlay.addEventListener('click', closeManageModal);
    if (addSectionBtn) addSectionBtn.addEventListener('click', openAddSectionModal);
    if (closeAddSectionBtn) closeAddSectionBtn.addEventListener('click', closeAddSectionModal);
    if (addSectionOverlay) addSectionOverlay.addEventListener('click', closeAddSectionModal);
    if (saveSectionBtn) saveSectionBtn.addEventListener('click', saveSection);
    if (addSectionForm) {
        addSectionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveSection();
        });
    }
    const orderModal = document.getElementById('orderSectionModal');
    const orderOverlay = document.getElementById('orderSectionOverlay');
    const closeOrderBtn = document.getElementById('closeOrderSectionBtn');
    const orderSectionsList = document.getElementById('orderSectionsList');
    let sectionSortable = null;
    const contentSortables = [];
    let orderSaving = false;

    function dragHandleSvg() {
        return '<span class="order-drag-handle" title="Drag to reorder" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">'
            + '<path d="M13 11h8v2h-8v8h-2v-8H3v-2h8V3h2v8z"></path>'
            + '</svg></span>';
    }

    function destroyOrderSortables() {
        if (sectionSortable) {
            sectionSortable.destroy();
            sectionSortable = null;
        }
        while (contentSortables.length) {
            const instance = contentSortables.pop();
            if (instance) instance.destroy();
        }
    }

    function collectOrderPayload() {
        const sectionNodes = orderSectionsList.querySelectorAll('.order-section-item');
        const sections = [];
        sectionNodes.forEach(function (sectionNode) {
            const contentNodes = sectionNode.querySelectorAll('.order-content-item');
            const contents = [];
            contentNodes.forEach(function (contentNode) {
                contents.push(Number(contentNode.getAttribute('data-id')));
            });
            sections.push({
                id: Number(sectionNode.getAttribute('data-id')),
                contents: contents
            });
        });
        return { sections: sections };
    }

    async function persistOrder() {
        if (!manageState.course || !manageState.course.id || orderSaving) return;
        orderSaving = true;
        try {
            const response = await fetch('/api/online-courses/' + encodeURIComponent(manageState.course.id) + '/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(collectOrderPayload())
            });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to save order');
            }
            const data = await response.json();
            manageState.course = data.course;
            manageState.sections = data.sections || [];
            renderManageDetail(manageState.course);
            renderManageSections();
            // Refresh labels in order modal after save
            renderOrderList(manageState.sections);
            initOrderSortables();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save order.',
                confirmButtonColor: '#8b5cf6'
            });
            renderOrderList(manageState.sections);
            initOrderSortables();
        } finally {
            orderSaving = false;
        }
    }

    function renderOrderList(sections) {
        destroyOrderSortables();
        const list = Array.isArray(sections) ? sections : [];
        if (!list.length) {
            orderSectionsList.innerHTML = '<div class="order-empty">No sections to reorder</div>';
            return;
        }

        orderSectionsList.innerHTML = list.map(function (section, sIndex) {
            const contents = Array.isArray(section.contents) ? section.contents : [];
            const contentHtml = contents.map(function (item) {
                return '<div class="order-content-item" data-id="' + escapeHtml(item.id) + '">'
                    + dragHandleSvg()
                    + '<span class="label">' + escapeHtml(item.title || 'Item') + '</span>'
                    + '</div>';
            }).join('');

            return '<div class="order-section-item" data-id="' + escapeHtml(section.id) + '">'
                + '<div class="order-section-row">'
                + dragHandleSvg()
                + '<span class="label">Section ' + (sIndex + 1) + ': ' + escapeHtml(section.title || '') + '</span>'
                + '</div>'
                + '<div class="order-section-contents">' + contentHtml + '</div>'
                + '</div>';
        }).join('');
    }

    function initOrderSortables() {
        destroyOrderSortables();
        if (typeof Sortable === 'undefined' || !orderSectionsList) return;

        sectionSortable = Sortable.create(orderSectionsList, {
            animation: 150,
            handle: '.order-section-row .order-drag-handle',
            draggable: '.order-section-item',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onEnd: function () {
                persistOrder();
            }
        });

        orderSectionsList.querySelectorAll('.order-section-contents').forEach(function (listEl) {
            const instance = Sortable.create(listEl, {
                animation: 150,
                handle: '.order-drag-handle',
                draggable: '.order-content-item',
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                onEnd: function () {
                    persistOrder();
                }
            });
            contentSortables.push(instance);
        });
    }

    function openOrderModal() {
        if (!manageState.course) return;
        renderOrderList(manageState.sections);
        initOrderSortables();
        orderModal.classList.add('open');
        orderModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeOrderModal() {
        destroyOrderSortables();
        orderModal.classList.remove('open');
        orderModal.setAttribute('aria-hidden', 'true');
        if (!modal.classList.contains('open')
            && !previewModal.classList.contains('open')
            && !manageModal.classList.contains('open')
            && !addLessonModal.classList.contains('open')) {
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }

    if (orderSectionBtn) {
        orderSectionBtn.addEventListener('click', openOrderModal);
    }
    if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);
    if (orderOverlay) orderOverlay.addEventListener('click', closeOrderModal);
    if (togglePublishBtn) {
        togglePublishBtn.addEventListener('click', function () {
            togglePublish().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }
    if (editCourseDetailBtn) {
        editCourseDetailBtn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Edit Course',
                text: 'Course editing will be available soon.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    }
    if (deleteCourseDetailBtn) {
        deleteCourseDetailBtn.addEventListener('click', function () {
            deleteCourse().catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }
    if (manageSectionsList) {
        manageSectionsList.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const run = (function () {
                if (action === 'add-content') {
                    openAddLessonModal(btn.getAttribute('data-section-id'));
                    return Promise.resolve();
                }
                if (action === 'edit-section') return promptEditSection(btn.getAttribute('data-section-id'));
                if (action === 'delete-section') return deleteSection(btn.getAttribute('data-section-id'));
                if (action === 'delete-content') return deleteContent(btn.getAttribute('data-id'));
                if (action === 'edit-content') {
                    return Swal.fire({
                        icon: 'info',
                        title: 'Edit Content',
                        text: 'Content editing will be available soon.',
                        confirmButtonColor: '#8b5cf6'
                    });
                }
                return Promise.resolve();
            })();
            Promise.resolve(run).catch(function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
            });
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (addSectionModal && addSectionModal.classList.contains('open')) {
            closeAddSectionModal();
            return;
        }
        if (orderModal && orderModal.classList.contains('open')) {
            closeOrderModal();
            return;
        }
        if (addLessonModal.classList.contains('open')) {
            closeAddLessonModal();
            return;
        }
        if (manageModal.classList.contains('open')) {
            closeManageModal();
            return;
        }
        if (previewModal.classList.contains('open')) {
            closePreviewModal();
        }
    });

    if (courseGrid) {
        courseGrid.addEventListener('click', function (e) {
            const manageBtn = e.target.closest('.btn-manage');
            const previewBtn = e.target.closest('.btn-preview');
            if (manageBtn) {
                const id = manageBtn.getAttribute('data-id');
                openManageModal(id).catch(function (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to open course management.',
                        confirmButtonColor: '#8b5cf6'
                    });
                });
            } else if (previewBtn) {
                const id = previewBtn.getAttribute('data-id');
                const course = courses.find(function (item) { return String(item.id) === String(id); });
                if (!course) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not found',
                        text: 'Course details could not be loaded.',
                        confirmButtonColor: '#8b5cf6'
                    });
                    return;
                }
                openPreviewModal(course);
            }
        });
    }

    Promise.all([loadCourses(), loadLookups()]).catch(function (error) {
        console.error(error);
        if (!courses.length) {
            courseGrid.innerHTML = '<div class="course-empty">Failed to load online courses</div>';
        }
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load online courses.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
