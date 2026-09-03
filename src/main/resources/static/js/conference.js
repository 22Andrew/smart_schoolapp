document.addEventListener('DOMContentLoaded', function () {
    const settingForm = document.getElementById('conferenceSettingForm');
    const apiKeyInput = document.getElementById('zoomApiKey');
    const apiSecretInput = document.getElementById('zoomApiSecret');
    const teacherApiCredentialInput = document.getElementById('teacherApiCredential');
    const parentLiveClassInput = document.getElementById('parentLiveClass');
    const redirectUrlEl = document.getElementById('zoomRedirectUrl');
    const accessTokenAlert = document.getElementById('accessTokenAlert');
    const getAccessTokenBtn = document.getElementById('getAccessTokenBtn');

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

    function updateAccessTokenAlert(hasAccessToken) {
        if (!accessTokenAlert) return;
        accessTokenAlert.hidden = !!hasAccessToken;
    }

    function populateForm(data) {
        if (apiKeyInput) apiKeyInput.value = data.apiKey || '';
        if (apiSecretInput) apiSecretInput.value = data.apiSecret || '';
        if (teacherApiCredentialInput) teacherApiCredentialInput.checked = !!data.teacherApiCredential;
        if (parentLiveClassInput) parentLiveClassInput.checked = !!data.parentLiveClass;
        setRadioValue('staffZoomClient', data.staffZoomClient || 'zoom_app');
        setRadioValue('studentZoomClient', data.studentZoomClient || 'zoom_app');
        if (redirectUrlEl) {
            redirectUrlEl.textContent = data.redirectUrl || 'https://demo.smart-school.in/admin/conference/generatetoken';
        }
        updateAccessTokenAlert(data.hasAccessToken);
    }

    async function loadSettings() {
        const response = await fetch('/api/conference/credentials');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load settings');
        }
        populateForm(await response.json());
    }

    async function saveSettings(event) {
        if (event) event.preventDefault();

        const payload = {
            apiKey: apiKeyInput ? apiKeyInput.value.trim() : '',
            apiSecret: apiSecretInput ? apiSecretInput.value.trim() : '',
            redirectUrl: redirectUrlEl ? redirectUrlEl.textContent.trim() : '',
            teacherApiCredential: teacherApiCredentialInput ? teacherApiCredentialInput.checked : false,
            staffZoomClient: getRadioValue('staffZoomClient'),
            studentZoomClient: getRadioValue('studentZoomClient'),
            parentLiveClass: parentLiveClassInput ? parentLiveClassInput.checked : false
        };

        const response = await fetch('/api/conference/credentials', {
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
            text: 'Zoom settings saved successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    async function requestAccessToken() {
        const response = await fetch('/api/conference/credentials/access-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to generate access token');
        }

        populateForm(await response.json());
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Access token generated successfully.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    if (settingForm) {
        settingForm.addEventListener('submit', function (event) {
            saveSettings(event).catch(showError);
        });
    }

    if (getAccessTokenBtn) {
        getAccessTokenBtn.addEventListener('click', function () {
            requestAccessToken().catch(showError);
        });
    }

    loadSettings().catch(showError);
});
