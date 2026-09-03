document.addEventListener('DOMContentLoaded', function () {
    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const examSelect = document.getElementById('examSelect');
    const admitCardFilterForm = document.getElementById('admitCardFilterForm');
    const studentListPanel = document.getElementById('studentListPanel');
    const studentTableBody = document.getElementById('studentTableBody');
    const selectAllStudents = document.getElementById('selectAllStudents');
    const designAdmitCardBtn = document.getElementById('designAdmitCardBtn');
    const generateBtn = document.getElementById('generateBtn');
    const designAdmitCardModal = document.getElementById('designAdmitCardModal');
    const designAdmitCardOverlay = document.getElementById('designAdmitCardOverlay');
    const closeDesignModalBtn = document.getElementById('closeDesignModalBtn');
    const designAdmitCardForm = document.getElementById('designAdmitCardForm');

    let classes = [];
    let students = [];
    const fileValues = {
        leftLogo: '',
        rightLogo: '',
        signImage: '',
        backgroundImage: ''
    };

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

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function populateClassSelect() {
        classSelect.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            return '<option value="' + item.id + '">' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionSelect(classId) {
        const selectedClass = classes.find(function (item) {
            return String(item.id) === String(classId);
        });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        sectionSelect.innerHTML = '<option value="">Select</option>' + sections.map(function (section) {
            return '<option value="' + escapeHtml(section) + '">' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function populateExamSelect(exams) {
        examSelect.innerHTML = '<option value="">Select</option>' + exams.map(function (exam) {
            return '<option value="' + exam.id + '">' + escapeHtml(exam.examName) + '</option>';
        }).join('');
    }

    function renderStudents(rows) {
        students = rows || [];
        if (!students.length) {
            studentTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94a3b8;">No records found</td></tr>';
            return;
        }

        studentTableBody.innerHTML = students.map(function (student) {
            return '<tr>'
                + '<td class="col-check"><input type="checkbox" class="student-check" value="' + student.id + '"></td>'
                + '<td>' + escapeHtml(student.admissionNo) + '</td>'
                + '<td><a href="#" class="student-link" data-id="' + student.id + '">' + escapeHtml(student.studentName) + '</a></td>'
                + '<td>' + escapeHtml(student.fatherName) + '</td>'
                + '<td>' + escapeHtml(student.dateOfBirth) + '</td>'
                + '<td>' + escapeHtml(student.gender) + '</td>'
                + '<td>' + escapeHtml(student.category) + '</td>'
                + '<td>' + escapeHtml(student.mobileNumber) + '</td>'
                + '</tr>';
        }).join('');
    }

    function openDesignModal() {
        resetDesignForm();
        designAdmitCardModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeDesignModal() {
        designAdmitCardModal.hidden = true;
        document.body.style.overflow = '';
    }

    function resetDesignForm() {
        designAdmitCardForm.reset();
        document.getElementById('templateId').value = '';
        document.getElementById('showName').checked = true;
        document.getElementById('showFatherName').checked = true;
        document.getElementById('showMotherName').checked = false;
        document.getElementById('showDob').checked = true;
        document.getElementById('showAdmissionNo').checked = true;
        document.getElementById('showRollNumber').checked = true;
        document.getElementById('showAddress').checked = false;
        document.getElementById('showGender').checked = true;
        document.getElementById('showPhoto').checked = true;
        document.getElementById('showClass').checked = true;
        document.getElementById('showSection').checked = true;
        fileValues.leftLogo = '';
        fileValues.rightLogo = '';
        fileValues.signImage = '';
        fileValues.backgroundImage = '';
        ['leftLogoName', 'rightLogoName', 'signImageName', 'backgroundImageName'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    }

    function setupFileDropZones() {
        document.querySelectorAll('.file-drop-zone').forEach(function (zone) {
            const target = zone.getAttribute('data-target');
            const input = zone.querySelector('input[type="file"]');
            const nameEl = document.getElementById(target + 'Name');

            zone.addEventListener('click', function () {
                input.click();
            });

            zone.addEventListener('dragover', function (event) {
                event.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', function () {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', function (event) {
                event.preventDefault();
                zone.classList.remove('dragover');
                if (event.dataTransfer.files && event.dataTransfer.files[0]) {
                    handleFileSelection(target, event.dataTransfer.files[0], nameEl);
                }
            });

            input.addEventListener('change', function () {
                if (input.files && input.files[0]) {
                    handleFileSelection(target, input.files[0], nameEl);
                }
            });
        });
    }

    function handleFileSelection(key, file, nameEl) {
        fileValues[key] = file.name;
        if (nameEl) {
            nameEl.textContent = file.name;
        }
    }

    function buildTemplatePayload() {
        return {
            templateName: document.getElementById('templateName').value.trim(),
            heading: document.getElementById('heading').value.trim(),
            title: document.getElementById('title').value.trim(),
            examName: document.getElementById('examNameField').value.trim(),
            schoolName: document.getElementById('schoolName').value.trim(),
            examCenter: document.getElementById('examCenter').value.trim(),
            footerText: document.getElementById('footerText').value.trim(),
            leftLogo: fileValues.leftLogo,
            rightLogo: fileValues.rightLogo,
            signImage: fileValues.signImage,
            backgroundImage: fileValues.backgroundImage,
            showName: document.getElementById('showName').checked,
            showFatherName: document.getElementById('showFatherName').checked,
            showMotherName: document.getElementById('showMotherName').checked,
            showDob: document.getElementById('showDob').checked,
            showAdmissionNo: document.getElementById('showAdmissionNo').checked,
            showRollNumber: document.getElementById('showRollNumber').checked,
            showAddress: document.getElementById('showAddress').checked,
            showGender: document.getElementById('showGender').checked,
            showPhoto: document.getElementById('showPhoto').checked,
            showClass: document.getElementById('showClass').checked,
            showSection: document.getElementById('showSection').checked,
            defaultTemplate: false
        };
    }

    async function loadInitialData() {
        const [classData, examData] = await Promise.all([
            fetchJson('/api/classes'),
            fetchJson('/api/cbse-admit-cards/exams')
        ]);
        classes = classData || [];
        populateClassSelect();
        populateExamSelect(examData || []);
    }

    classSelect.addEventListener('change', function () {
        populateSectionSelect(classSelect.value);
    });

    admitCardFilterForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const classId = classSelect.value;
        const section = sectionSelect.value;
        const examId = examSelect.value;
        if (!classId || !section || !examId) {
            showError({ message: 'Class, Section and Exam are required.' });
            return;
        }

        try {
            const rows = await fetchJson('/api/cbse-admit-cards/students?classId=' + encodeURIComponent(classId)
                + '&section=' + encodeURIComponent(section)
                + '&examId=' + encodeURIComponent(examId));
            renderStudents(rows);
            studentListPanel.hidden = false;
            selectAllStudents.checked = false;
        } catch (error) {
            showError(error);
        }
    });

    selectAllStudents.addEventListener('change', function () {
        document.querySelectorAll('.student-check').forEach(function (checkbox) {
            checkbox.checked = selectAllStudents.checked;
        });
    });

    studentTableBody.addEventListener('click', function (event) {
        const link = event.target.closest('.student-link');
        if (link) {
            event.preventDefault();
        }
    });

    designAdmitCardBtn.addEventListener('click', openDesignModal);
    closeDesignModalBtn.addEventListener('click', closeDesignModal);
    designAdmitCardOverlay.addEventListener('click', closeDesignModal);

    designAdmitCardForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildTemplatePayload();
        if (!payload.templateName) {
            showError({ message: 'Template name is required.' });
            return;
        }

        const templateId = document.getElementById('templateId').value;
        const url = templateId
            ? '/api/cbse-admit-cards/templates/' + templateId
            : '/api/cbse-admit-cards/templates';
        const method = templateId ? 'PUT' : 'POST';

        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Admit card template saved successfully!');
            closeDesignModal();
        } catch (error) {
            showError(error);
        }
    });

    generateBtn.addEventListener('click', function () {
        const selected = Array.from(document.querySelectorAll('.student-check:checked')).map(function (el) {
            return el.value;
        });
        if (!selected.length) {
            showError({ message: 'Please select at least one student.' });
            return;
        }
        showSuccess('Generate admit card for ' + selected.length + ' selected student(s).');
    });

    setupFileDropZones();
    loadInitialData().catch(showError);
});
