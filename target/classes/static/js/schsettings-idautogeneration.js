document.addEventListener('DOMContentLoaded', function() {
    setupIdAutoGenerationForm();
    loadIdAutoGenerationSettings();
});

function setupIdAutoGenerationForm() {
    document.getElementById('idAutoGenerationForm')?.addEventListener('submit', handleSave);
}

async function loadIdAutoGenerationSettings() {
    try {
        const response = await fetch('/api/schsettings/id-auto-generation');
        if (!response.ok) throw new Error('Failed to load ID Auto Generation settings');
        const data = await response.json();

        setChecked('autoAdmissionNo', data.autoAdmissionNo);
        setValue('admissionNoPrefix', data.admissionNoPrefix);
        populateDigitSelect('admissionNoDigit', data.digitOptions, data.admissionNoDigit);
        setValue('admissionStartFrom', data.admissionStartFrom);

        setChecked('autoStaffId', data.autoStaffId);
        setValue('staffIdPrefix', data.staffIdPrefix);
        populateDigitSelect('staffNoDigit', data.digitOptions, data.staffNoDigit);
        setValue('staffIdStartFrom', data.staffIdStartFrom);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load ID Auto Generation settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function populateDigitSelect(id, options, selected) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option value="">Select</option>';
    (options || []).forEach(function(option) {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        if (selected !== null && selected !== undefined && String(selected) === String(option)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        autoAdmissionNo: getChecked('autoAdmissionNo'),
        admissionNoPrefix: getValue('admissionNoPrefix'),
        admissionNoDigit: getValue('admissionNoDigit'),
        admissionStartFrom: getValue('admissionStartFrom'),
        autoStaffId: getChecked('autoStaffId'),
        staffIdPrefix: getValue('staffIdPrefix'),
        staffNoDigit: getValue('staffNoDigit'),
        staffIdStartFrom: getValue('staffIdStartFrom')
    };

    try {
        const response = await fetch('/api/schsettings/id-auto-generation', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: result.message,
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save ID Auto Generation settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}

function setChecked(id, value) {
    const field = document.getElementById(id);
    if (field) {
        field.checked = !!value;
    }
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) {
        field.value = value ?? '';
    }
}
