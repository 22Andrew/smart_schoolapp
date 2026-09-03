document.addEventListener('DOMContentLoaded', function () {
    const settingForm = document.getElementById('qrSettingForm');
    const autoAttendanceInput = document.getElementById('autoAttendance');
    const sensorDeviceInput = document.getElementById('sensorDeviceEnabled');
    const cameraDeviceInput = document.getElementById('cameraDeviceEnabled');

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function setRadioValue(name, value) {
        const input = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (input) {
            input.checked = true;
        }
    }

    function getRadioValue(name) {
        const checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked ? checked.value : '';
    }

    function populateForm(data) {
        if (autoAttendanceInput) autoAttendanceInput.checked = !!data.autoAttendance;
        if (sensorDeviceInput) sensorDeviceInput.checked = !!data.sensorDeviceEnabled;
        if (cameraDeviceInput) cameraDeviceInput.checked = !!data.cameraDeviceEnabled;
        setRadioValue('selectedCamera', data.selectedCamera || 'primary');
    }

    async function loadSettings() {
        const response = await fetch('/api/qrattendance/settings');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load settings');
        }
        populateForm(await response.json());
    }

    async function saveSettings(event) {
        event.preventDefault();

        const sensorEnabled = sensorDeviceInput ? sensorDeviceInput.checked : false;
        const cameraEnabled = cameraDeviceInput ? cameraDeviceInput.checked : false;
        if (!sensorEnabled && !cameraEnabled) {
            throw new Error('Select at least one scanner device type');
        }

        const payload = {
            autoAttendance: autoAttendanceInput ? autoAttendanceInput.checked : false,
            sensorDeviceEnabled: sensorEnabled,
            cameraDeviceEnabled: cameraEnabled,
            selectedCamera: getRadioValue('selectedCamera')
        };

        const response = await fetch('/api/qrattendance/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to save settings');
        }

        populateForm(result.data || {});
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: result.message || 'QR attendance settings saved successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    if (settingForm) {
        settingForm.addEventListener('submit', function (event) {
            saveSettings(event).catch(showError);
        });
    }

    loadSettings().catch(showError);
});
