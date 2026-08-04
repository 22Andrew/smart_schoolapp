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
});

