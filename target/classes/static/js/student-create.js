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

        box.addEventListener('click', function () {
            input.click();
        });

        input.addEventListener('change', function () {
            if (input.files && input.files[0]) {
                box.classList.add('has-file');
                labelSpan.textContent = input.files[0].name;
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
    if (addSiblingBtn) {
        addSiblingBtn.addEventListener('click', function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Add Sibling',
                    text: 'Sibling linking will be available soon.',
                    confirmButtonColor: '#8b5cf6'
                });
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
            note: (document.getElementById('note') || {}).value || ''
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

            if (!payload.admissionNo || !payload.classId || !payload.section
                || !payload.firstName || !payload.gender || !payload.dateOfBirth) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please fill Admission No, Class, Section, First Name, Gender and Date Of Birth.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            try {
                const response = await fetch('/api/student-admissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const err = await response.json().catch(function () { return {}; });
                    throw new Error(err.message || 'Failed to save student admission');
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: 'Student admission saved successfully.',
                    confirmButtonColor: '#8b5cf6'
                });
                admissionForm.reset();
                fillSectionSelect();
                fillRoomNoSelect();
                if (document.getElementById('admissionDate')) {
                    document.getElementById('admissionDate').value = todayValue;
                }
                if (document.getElementById('measurementDate')) {
                    document.getElementById('measurementDate').value = todayValue;
                }
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
        loadHouses()
    ]).catch(function (error) {
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



