document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayValue = yyyy + '-' + mm + '-' + dd;

    const admissionDate = document.getElementById('admissionDate');
    const measurementDate = document.getElementById('measurementDate');
    if (admissionDate && !admissionDate.value) {
        admissionDate.value = todayValue;
    }
    if (measurementDate && !measurementDate.value) {
        measurementDate.value = todayValue;
    }

    function setupFileUpload(box) {
        const inputId = box.getAttribute('data-file-input');
        const input = document.getElementById(inputId);
        if (!input) return;

        const labelSpan = box.querySelector('span');

        box.addEventListener('click', function (e) {
            if (e.target === input) return;
            input.click();
        });

        input.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        input.addEventListener('change', function () {
            if (input.files && input.files[0]) {
                box.classList.add('has-file');
                if (labelSpan) labelSpan.textContent = input.files[0].name;
            }
        });

        box.addEventListener('dragover', function (e) {
            e.preventDefault();
            box.classList.add('dragover');
        });

        box.addEventListener('dragleave', function () {
            box.classList.remove('dragover');
        });

        box.addEventListener('drop', function (e) {
            e.preventDefault();
            box.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                input.files = e.dataTransfer.files;
                box.classList.add('has-file');
                labelSpan.textContent = e.dataTransfer.files[0].name;
            }
        });
    }

    document.querySelectorAll('.file-upload-box[data-file-input]').forEach(setupFileUpload);

    const importBtn = document.getElementById('importStudentBtn');
    if (importBtn) {
        importBtn.addEventListener('click', function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Import Student',
                    text: 'Student import will be available soon.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    const addSiblingBtn = document.getElementById('addSiblingBtn');
    const siblingModal = document.getElementById('siblingModal');
    const siblingModalOverlay = document.getElementById('siblingModalOverlay');
    const siblingModalClose = document.getElementById('siblingModalClose');
    const siblingModalAddBtn = document.getElementById('siblingModalAddBtn');
    const siblingClassSelect = document.getElementById('siblingClassSelect');
    const siblingSectionSelect = document.getElementById('siblingSectionSelect');
    const siblingStudentSelect = document.getElementById('siblingStudentSelect');
    const siblingListWrap = document.getElementById('siblingListWrap');
    const siblingList = document.getElementById('siblingList');
    const SIBLING_DRAFT_KEY = 'student-admission-sibling-draft';
    let siblingDraftToken = '';
    let linkedSiblings = [];

    function getThemePrimaryColor() {
        const primary = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
        return primary || '#8b5cf6';
    }

    function getCurrentStudentId() {
        const form = document.getElementById('studentAdmissionForm');
        if (!form) return null;
        const raw = form.getAttribute('data-student-id');
        if (!raw || !String(raw).trim()) return null;
        const id = Number(raw);
        return Number.isFinite(id) && id > 0 ? id : null;
    }

    function ensureSiblingDraftToken() {
        let token = sessionStorage.getItem(SIBLING_DRAFT_KEY);
        if (!token) {
            token = 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
            sessionStorage.setItem(SIBLING_DRAFT_KEY, token);
        }
        siblingDraftToken = token;
        return token;
    }

    function resetSiblingDraftToken() {
        sessionStorage.removeItem(SIBLING_DRAFT_KEY);
        siblingDraftToken = ensureSiblingDraftToken();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function siblingQueryParams() {
        const studentId = getCurrentStudentId();
        if (studentId) {
            return 'studentId=' + encodeURIComponent(String(studentId));
        }
        return 'draftToken=' + encodeURIComponent(ensureSiblingDraftToken());
    }

    function renderSiblingList() {
        if (!siblingList || !siblingListWrap) return;
        if (!linkedSiblings.length) {
            siblingList.innerHTML = '';
            siblingListWrap.hidden = true;
            return;
        }

        siblingListWrap.hidden = false;
        siblingList.innerHTML = linkedSiblings.map(function (row) {
            return ''
                + '<div class="sibling-list-item" data-sibling-id="' + escapeHtml(row.siblingId) + '">'
                + '<span><strong>' + escapeHtml(row.studentName || 'Student') + '</strong> '
                + escapeHtml(row.admissionNo || '') + ' - '
                + escapeHtml(row.className || '') + (row.section ? ' (' + escapeHtml(row.section) + ')' : '')
                + '</span>'
                + '<button type="button" class="sibling-list-remove" title="Remove" aria-label="Remove sibling">&times;</button>'
                + '</div>';
        }).join('');
    }

    async function loadLinkedSiblings() {
        try {
            const response = await fetch('/api/student-admissions/siblings?' + siblingQueryParams());
            if (!response.ok) {
                throw new Error('Failed to load siblings');
            }
            linkedSiblings = await response.json();
            renderSiblingList();
        } catch (error) {
            console.error(error);
        }
    }

    function fillSiblingClassSelect() {
        if (!siblingClassSelect) return;
        const current = siblingClassSelect.value;
        siblingClassSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            siblingClassSelect.appendChild(option);
        });
        if (current) siblingClassSelect.value = current;
    }

    function fillSiblingSectionSelect(preferred) {
        if (!siblingSectionSelect) return;
        siblingSectionSelect.innerHTML = '<option value="">Select</option>';

        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(siblingClassSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length ? classSections : masterSections.map(function (s) {
            return s.sectionName || s.name || s;
        });

        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            siblingSectionSelect.appendChild(option);
        });

        if (preferred) siblingSectionSelect.value = preferred;
    }

    async function loadSiblingStudents() {
        if (!siblingStudentSelect) return;
        siblingStudentSelect.innerHTML = '<option value="">Select</option>';

        const classId = siblingClassSelect ? siblingClassSelect.value : '';
        const section = siblingSectionSelect ? siblingSectionSelect.value : '';
        if (!classId || !section) {
            return;
        }

        try {
            const url = '/api/student-admissions?classId='
                + encodeURIComponent(classId)
                + '&section='
                + encodeURIComponent(section);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load students');
            }
            const rows = await response.json();
            const currentStudentId = getCurrentStudentId();

            rows.forEach(function (row) {
                if (currentStudentId && String(row.id) === String(currentStudentId)) {
                    return;
                }
                if (linkedSiblings.some(function (item) {
                    return String(item.siblingId) === String(row.id);
                })) {
                    return;
                }
                const option = document.createElement('option');
                option.value = String(row.id);
                option.textContent = (row.studentName || row.firstName || 'Student')
                    + ' (' + (row.admissionNo || '-') + ')';
                siblingStudentSelect.appendChild(option);
            });
        } catch (error) {
            console.error(error);
        }
    }

    function openSiblingModal() {
        if (!siblingModal) return;
        fillSiblingClassSelect();
        fillSiblingSectionSelect();
        if (siblingStudentSelect) {
            siblingStudentSelect.innerHTML = '<option value="">Select</option>';
        }
        siblingModal.classList.add('active');
        siblingModal.setAttribute('aria-hidden', 'false');
    }

    function closeSiblingModal() {
        if (!siblingModal) return;
        siblingModal.classList.remove('active');
        siblingModal.setAttribute('aria-hidden', 'true');
    }

    async function saveSiblingFromModal() {
        const siblingId = siblingStudentSelect ? siblingStudentSelect.value : '';
        if (!siblingId) {
            Swal.fire({
                icon: 'warning',
                title: 'Required',
                text: 'Please select Class, Section and Student.',
                confirmButtonColor: getThemePrimaryColor()
            });
            return;
        }

        const payload = { siblingId: Number(siblingId) };
        const studentId = getCurrentStudentId();
        if (studentId) {
            payload.studentId = studentId;
        } else {
            payload.draftToken = ensureSiblingDraftToken();
        }

        try {
            const response = await fetch('/api/student-admissions/siblings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to add sibling');
            }

            await loadLinkedSiblings();
            closeSiblingModal();
            Swal.fire({
                icon: 'success',
                title: 'Added',
                text: 'Sibling linked successfully.',
                confirmButtonColor: getThemePrimaryColor(),
                timer: 1600,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add sibling.',
                confirmButtonColor: getThemePrimaryColor()
            });
        }
    }

    async function removeSibling(siblingId) {
        const studentId = getCurrentStudentId();
        let url = '/api/student-admissions/siblings/' + encodeURIComponent(String(siblingId));
        if (studentId) {
            url += '?studentId=' + encodeURIComponent(String(studentId));
        } else {
            url += '?draftToken=' + encodeURIComponent(ensureSiblingDraftToken());
        }

        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to remove sibling');
            }
            await loadLinkedSiblings();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to remove sibling.',
                confirmButtonColor: getThemePrimaryColor()
            });
        }
    }

    if (addSiblingBtn) {
        addSiblingBtn.addEventListener('click', openSiblingModal);
    }
    if (siblingModalOverlay) {
        siblingModalOverlay.addEventListener('click', closeSiblingModal);
    }
    if (siblingModalClose) {
        siblingModalClose.addEventListener('click', closeSiblingModal);
    }
    if (siblingModalAddBtn) {
        siblingModalAddBtn.addEventListener('click', saveSiblingFromModal);
    }
    if (siblingClassSelect) {
        siblingClassSelect.addEventListener('change', function () {
            fillSiblingSectionSelect();
            loadSiblingStudents();
        });
    }
    if (siblingSectionSelect) {
        siblingSectionSelect.addEventListener('change', loadSiblingStudents);
    }
    if (siblingList) {
        siblingList.addEventListener('click', function (e) {
            const btn = e.target.closest('.sibling-list-remove');
            if (!btn) return;
            const item = btn.closest('.sibling-list-item');
            if (!item) return;
            const siblingId = item.getAttribute('data-sibling-id');
            if (siblingId) {
                removeSibling(siblingId);
            }
        });
    }

    const moreDetailsSection = document.getElementById('moreDetailsSection');
    const moreDetailsToggle = document.getElementById('moreDetailsToggle');
    if (moreDetailsSection && moreDetailsToggle) {
        moreDetailsToggle.addEventListener('click', function () {
            const collapsed = moreDetailsSection.classList.toggle('collapsed');
            moreDetailsToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        });
    }

    const guardianAddress = document.getElementById('guardianAddress');
    const currentAddress = document.getElementById('currentAddress');
    const permanentAddress = document.getElementById('permanentAddress');
    const guardianIsCurrent = document.getElementById('guardianIsCurrentAddress');
    const permanentIsCurrent = document.getElementById('permanentIsCurrentAddress');

    if (guardianIsCurrent && guardianAddress && currentAddress) {
        guardianIsCurrent.addEventListener('change', function () {
            if (guardianIsCurrent.checked) {
                currentAddress.value = guardianAddress.value;
            }
        });
    }

    if (permanentIsCurrent && currentAddress && permanentAddress) {
        permanentIsCurrent.addEventListener('change', function () {
            if (permanentIsCurrent.checked) {
                permanentAddress.value = currentAddress.value;
            }
        });
    }

    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const categorySelect = document.getElementById('category');
    const hostelSelect = document.getElementById('hostel');
    const roomNoSelect = document.getElementById('roomNo');
    const houseSelect = document.getElementById('house');
    const admissionForm = document.getElementById('studentAdmissionForm');
    let autoAdmissionNoEnabled = false;
    let classes = [];
    let masterSections = [];
    let hostels = [];
    let hostelRooms = [];

    function hostelLabel(item) {
        return item.hostelName || 'Hostel';
    }

    function roomLabel(item) {
        return item.roomNumber || 'Room';
    }

    function setInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value == null ? '' : String(value);
    }

    function setSelectValue(id, value) {
        const el = document.getElementById(id);
        if (!el || value == null || String(value).trim() === '') return;
        const text = String(value);
        const exists = Array.from(el.options).some(function (opt) {
            return opt.value === text;
        });
        if (!exists) {
            const option = document.createElement('option');
            option.value = text;
            option.textContent = text;
            el.appendChild(option);
        }
        el.value = text;
    }

    function setRadioValue(name, value) {
        if (!value) return;
        document.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
            input.checked = input.value === String(value);
        });
    }

    function setPhotoPreview(inputId, photoPath) {
        if (!photoPath) return;
        const input = document.getElementById(inputId);
        const box = document.querySelector('.file-upload-box[data-file-input="' + inputId + '"]');
        if (!input || !box) return;
        box.classList.add('has-file');
        const span = box.querySelector('span');
        const fileName = String(photoPath).split('/').pop();
        if (span) span.textContent = fileName || 'Current photo on file';
    }

    function populateFormFromStudent(row) {
        if (!row) return;

        setInputValue('admissionNo', row.admissionNo);
        setInputValue('rollNumber', row.rollNumber);
        if (classSelect && row.classId != null) {
            classSelect.value = String(row.classId);
            fillSectionSelect(row.section || '');
        }
        setInputValue('firstName', row.firstName);
        setInputValue('lastName', row.lastName);
        setInputValue('gender', row.gender);
        setInputValue('dateOfBirth', row.dateOfBirth);
        if (categorySelect && row.categoryId != null) {
            categorySelect.value = String(row.categoryId);
        }
        setInputValue('religion', row.religion);
        setInputValue('mobileNumber', row.mobileNumber);
        setInputValue('email', row.email);
        setInputValue('admissionDate', row.admissionDate);
        setInputValue('bloodGroup', row.bloodGroup);
        if (houseSelect && row.houseId != null) {
            houseSelect.value = String(row.houseId);
        }
        setInputValue('height', row.height);
        setInputValue('weight', row.weight);
        setInputValue('measurementDate', row.measurementDate);
        setInputValue('medicalHistory', row.medicalHistory);
        setSelectValue('routeList', row.routeList);
        setSelectValue('pickupPoint', row.pickupPoint);
        setSelectValue('feesMonth', row.feesMonth);
        if (hostelSelect && row.hostelId != null) {
            hostelSelect.value = String(row.hostelId);
            fillRoomNoSelect(row.roomId != null ? String(row.roomId) : '');
        }
        setInputValue('fatherName', row.fatherName);
        setInputValue('fatherPhone', row.fatherPhone);
        setInputValue('fatherOccupation', row.fatherOccupation);
        setInputValue('motherName', row.motherName);
        setInputValue('motherPhone', row.motherPhone);
        setInputValue('motherOccupation', row.motherOccupation);
        setRadioValue('guardianIs', row.guardianIs);
        setInputValue('guardianName', row.guardianName);
        setInputValue('guardianRelation', row.guardianRelation);
        setInputValue('guardianEmail', row.guardianEmail);
        setInputValue('guardianPhone', row.guardianPhone);
        setInputValue('guardianOccupation', row.guardianOccupation);
        setInputValue('guardianAddress', row.guardianAddress);
        setInputValue('currentAddress', row.currentAddress);
        setInputValue('permanentAddress', row.permanentAddress);
        setInputValue('bankAccountNumber', row.bankAccountNumber);
        setInputValue('bankName', row.bankName);
        setInputValue('ifscCode', row.ifscCode);
        setInputValue('nationalId', row.nationalId);
        setInputValue('localId', row.localId);
        setRadioValue('rte', row.rte || 'No');
        setInputValue('previousSchoolDetails', row.previousSchoolDetails);
        setInputValue('note', row.note);
        setPhotoPreview('studentPhoto', row.photoPath || row.photoUrl);

        const titleEl = document.getElementById('admissionPageTitle');
        if (titleEl) titleEl.textContent = 'Edit Student';
        const saveBtn = document.getElementById('saveAdmissionBtn');
        if (saveBtn) saveBtn.textContent = 'Update';
        document.title = (row.studentName || 'Student') + ' - Edit Student';
    }

    async function loadStudentForEdit() {
        const studentId = getCurrentStudentId();
        if (!studentId) return;

        try {
            const response = await fetch('/api/student-admissions/' + encodeURIComponent(String(studentId)));
            if (response.status === 404) {
                throw new Error('Student not found');
            }
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to load student');
            }
            const row = await response.json();
            populateFormFromStudent(row);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load student for editing.',
                confirmButtonColor: getThemePrimaryColor()
            });
        }
    }

    async function loadAutoAdmissionNo() {
        const field = document.getElementById('admissionNo');
        if (!field || getCurrentStudentId()) return;

        try {
            const response = await fetch('/api/schsettings/id-auto-generation/next-admission-no');
            if (!response.ok) return;
            const data = await response.json();
            autoAdmissionNoEnabled = !!data.autoEnabled;

            if (autoAdmissionNoEnabled && data.nextId) {
                field.value = data.nextId;
                field.readOnly = true;
                field.title = 'Admission number is generated automatically';
            } else {
                field.readOnly = false;
                field.title = '';
                if (!field.value) {
                    field.value = '';
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect(preferred) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';

        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length ? classSections : masterSections.map(function (s) {
            return s.sectionName || s.name || s;
        });

        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });

        if (preferred) sectionSelect.value = preferred;
    }

    function fillCategorySelect(categories) {
        if (!categorySelect) return;
        categorySelect.innerHTML = '<option value="">Select</option>';
        (categories || []).forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.categoryName;
            categorySelect.appendChild(option);
        });
    }

    function fillHostelSelect() {
        if (!hostelSelect) return;
        const current = hostelSelect.value;
        hostelSelect.innerHTML = '<option value="">Select</option>';

        if (!hostels.length) {
            const empty = document.createElement('option');
            empty.value = '';
            empty.disabled = true;
            empty.textContent = 'No hostels available';
            hostelSelect.appendChild(empty);
            return;
        }

        hostels.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = hostelLabel(item);
            option.title = hostelLabel(item);
            hostelSelect.appendChild(option);
        });
        if (current) hostelSelect.value = current;
    }

    function fillRoomNoSelect(preferred) {
        if (!roomNoSelect) return;
        const current = preferred || roomNoSelect.value;
        const hostelId = hostelSelect ? hostelSelect.value : '';
        roomNoSelect.innerHTML = '<option value="">Select</option>';

        if (!hostelId) {
            const hint = document.createElement('option');
            hint.value = '';
            hint.disabled = true;
            hint.textContent = 'Select a hostel first';
            roomNoSelect.appendChild(hint);
            return;
        }

        const rooms = hostelRooms.filter(function (room) {
            return String(room.hostelId) === String(hostelId);
        });

        if (!rooms.length) {
            const empty = document.createElement('option');
            empty.value = '';
            empty.disabled = true;
            empty.textContent = 'No rooms found for this hostel';
            roomNoSelect.appendChild(empty);
            return;
        }

        rooms.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = roomLabel(item);
            option.title = roomLabel(item);
            roomNoSelect.appendChild(option);
        });

        if (current) roomNoSelect.value = current;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
        fillSectionSelect();
    }

    async function loadCategories() {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        const categories = await response.json();
        fillCategorySelect(categories);
    }

    function fillHouseSelect(houses) {
        if (!houseSelect) return;
        houseSelect.innerHTML = '<option value="">Select</option>';
        (houses || []).forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            houseSelect.appendChild(option);
        });
    }

    async function loadHostels() {
        const response = await fetch('/api/hostels');
        if (!response.ok) throw new Error('Failed to load hostels');
        hostels = await response.json();
        fillHostelSelect();
        fillRoomNoSelect();
    }

    async function loadHostelRooms() {
        const response = await fetch('/api/hostel-rooms');
        if (!response.ok) throw new Error('Failed to load hostel rooms');
        hostelRooms = await response.json();
        fillRoomNoSelect();
    }

    async function loadHouses() {
        const response = await fetch('/api/school-houses');
        if (!response.ok) throw new Error('Failed to load houses');
        fillHouseSelect(await response.json());
    }

    function selectedRadioValue(name) {
        const selected = document.querySelector('input[name="' + name + '"]:checked');
        return selected ? selected.value : '';
    }

    function collectAdmissionPayload() {
        return {
            admissionNo: (document.getElementById('admissionNo') || {}).value || '',
            rollNumber: (document.getElementById('rollNumber') || {}).value || '',
            classId: classSelect ? classSelect.value : '',
            section: sectionSelect ? sectionSelect.value : '',
            firstName: (document.getElementById('firstName') || {}).value || '',
            lastName: (document.getElementById('lastName') || {}).value || '',
            gender: (document.getElementById('gender') || {}).value || '',
            dateOfBirth: (document.getElementById('dateOfBirth') || {}).value || '',
            categoryId: categorySelect ? categorySelect.value : '',
            religion: (document.getElementById('religion') || {}).value || '',
            mobileNumber: (document.getElementById('mobileNumber') || {}).value || '',
            email: (document.getElementById('email') || {}).value || '',
            admissionDate: (document.getElementById('admissionDate') || {}).value || '',
            bloodGroup: (document.getElementById('bloodGroup') || {}).value || '',
            houseId: houseSelect ? houseSelect.value : '',
            height: (document.getElementById('height') || {}).value || '',
            weight: (document.getElementById('weight') || {}).value || '',
            measurementDate: (document.getElementById('measurementDate') || {}).value || '',
            medicalHistory: (document.getElementById('medicalHistory') || {}).value || '',
            routeList: (document.getElementById('routeList') || {}).value || '',
            pickupPoint: (document.getElementById('pickupPoint') || {}).value || '',
            feesMonth: (document.getElementById('feesMonth') || {}).value || '',
            hostelId: hostelSelect ? hostelSelect.value : '',
            roomId: roomNoSelect ? roomNoSelect.value : '',
            fatherName: (document.getElementById('fatherName') || {}).value || '',
            fatherPhone: (document.getElementById('fatherPhone') || {}).value || '',
            fatherOccupation: (document.getElementById('fatherOccupation') || {}).value || '',
            motherName: (document.getElementById('motherName') || {}).value || '',
            motherPhone: (document.getElementById('motherPhone') || {}).value || '',
            motherOccupation: (document.getElementById('motherOccupation') || {}).value || '',
            guardianIs: selectedRadioValue('guardianIs'),
            guardianName: (document.getElementById('guardianName') || {}).value || '',
            guardianRelation: (document.getElementById('guardianRelation') || {}).value || '',
            guardianEmail: (document.getElementById('guardianEmail') || {}).value || '',
            guardianPhone: (document.getElementById('guardianPhone') || {}).value || '',
            guardianOccupation: (document.getElementById('guardianOccupation') || {}).value || '',
            guardianAddress: (document.getElementById('guardianAddress') || {}).value || '',
            currentAddress: (document.getElementById('currentAddress') || {}).value || '',
            permanentAddress: (document.getElementById('permanentAddress') || {}).value || '',
            bankAccountNumber: (document.getElementById('bankAccountNumber') || {}).value || '',
            bankName: (document.getElementById('bankName') || {}).value || '',
            ifscCode: (document.getElementById('ifscCode') || {}).value || '',
            nationalId: (document.getElementById('nationalId') || {}).value || '',
            localId: (document.getElementById('localId') || {}).value || '',
            rte: selectedRadioValue('rte') || 'No',
            previousSchoolDetails: (document.getElementById('previousSchoolDetails') || {}).value || '',
            note: (document.getElementById('note') || {}).value || '',
            draftToken: getCurrentStudentId() ? '' : ensureSiblingDraftToken()
        };
    }

    if (classSelect) {
        classSelect.addEventListener('change', function () {
            fillSectionSelect();
        });
    }

    if (hostelSelect) {
        hostelSelect.addEventListener('change', function () {
            fillRoomNoSelect();
        });
    }

    if (admissionForm) {
        admissionForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = collectAdmissionPayload();

            if ((!autoAdmissionNoEnabled && !payload.admissionNo) || !payload.classId || !payload.section
                || !payload.firstName || !payload.gender || !payload.dateOfBirth) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: autoAdmissionNoEnabled
                        ? 'Please fill Class, Section, First Name, Gender and Date Of Birth.'
                        : 'Please fill Admission No, Class, Section, First Name, Gender and Date Of Birth.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            try {
                const formData = new FormData();
                formData.append(
                    'data',
                    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
                    'data.json'
                );

                const photoInput = document.getElementById('studentPhoto');
                const hasPhoto = !!(photoInput && photoInput.files && photoInput.files[0]);
                if (hasPhoto) {
                    formData.append('studentPhoto', photoInput.files[0], photoInput.files[0].name);
                }

                const studentId = getCurrentStudentId();
                const isEdit = !!studentId;
                const url = isEdit
                    ? '/api/student-admissions/' + encodeURIComponent(String(studentId))
                    : '/api/student-admissions';
                const method = isEdit ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    body: formData
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || (isEdit
                        ? 'Failed to update student record'
                        : 'Failed to save student admission'));
                }

                const saved = await response.json().catch(function () { return {}; });
                if (hasPhoto && !saved.photoUrl && !saved.photoPath) {
                    throw new Error('Student was saved, but the photo was not stored. Please try uploading again.');
                }

                if (isEdit) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Updated',
                        text: hasPhoto
                            ? 'Student record and photo updated successfully.'
                            : 'Student record updated successfully.',
                        confirmButtonColor: getThemePrimaryColor()
                    });
                    window.location.href = '/student/view/' + encodeURIComponent(String(studentId));
                    return;
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: hasPhoto
                        ? 'Student admission and photo saved successfully.'
                        : 'Student admission saved successfully.',
                    confirmButtonColor: getThemePrimaryColor()
                });
                admissionForm.reset();
                document.querySelectorAll('.file-upload-box').forEach(function (box) {
                    box.classList.remove('has-file');
                    const span = box.querySelector('span');
                    if (span) {
                        span.textContent = 'Drag and drop a file here or click';
                    }
                });
                fillSectionSelect();
                fillRoomNoSelect();
                if (document.getElementById('admissionDate')) {
                    document.getElementById('admissionDate').value = todayValue;
                }
                if (document.getElementById('measurementDate')) {
                    document.getElementById('measurementDate').value = todayValue;
                }
                resetSiblingDraftToken();
                linkedSiblings = [];
                renderSiblingList();
                await loadAutoAdmissionNo();
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save student admission.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    Promise.all([
        loadClasses(),
        loadSections(),
        loadCategories(),
        loadHostels(),
        loadHostelRooms(),
        loadHouses(),
        loadAutoAdmissionNo()
    ]).then(function () {
        if (getCurrentStudentId()) {
            return loadStudentForEdit().then(function () {
                return loadLinkedSiblings();
            });
        }
        ensureSiblingDraftToken();
        return loadLinkedSiblings();
    }).catch(function (error) {
        console.error(error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load admission dropdown lists.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    });
});



