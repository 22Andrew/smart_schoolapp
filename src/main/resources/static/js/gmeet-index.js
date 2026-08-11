document.addEventListener('DOMContentLoaded', function () {
    const settingForm = document.getElementById('gmeetSettingForm');
    const apiKeyInput = document.getElementById('apiKey');
    const apiSecretInput = document.getElementById('apiSecret');

    function showError(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function setRadioValue(name, enabled) {
        const value = enabled ? 'enabled' : 'disabled';
        const input = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (input) {
            input.checked = true;
        }
    }

    function getRadioValue(name) {
        const checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked && checked.value === 'enabled';
    }

    function populateForm(data) {
        if (apiKeyInput) apiKeyInput.value = data.apiKey || '';
        if (apiSecretInput) apiSecretInput.value = data.apiSecret || '';
        setRadioValue('useGoogleCalendarApi', !!data.useGoogleCalendarApi);
        setRadioValue('parentLiveClass', !!data.parentLiveClass);
    }

    async function loadSettings() {
        const response = await fetch('/api/gmeet/settings');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load settings');
        }
        populateForm(await response.json());
    }

    async function saveSettings(event) {
        event.preventDefault();

        const payload = {
            apiKey: apiKeyInput ? apiKeyInput.value.trim() : '',
            apiSecret: apiSecretInput ? apiSecretInput.value.trim() : '',
            useGoogleCalendarApi: getRadioValue('useGoogleCalendarApi'),
            parentLiveClass: getRadioValue('parentLiveClass')
        };

        const response = await fetch('/api/gmeet/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to save settings');
        }

        populateForm(await response.json());
        Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Gmeet settings saved successfully.',
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
