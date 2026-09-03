document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('whatsappForm');
    const tabs = document.querySelectorAll('.whatsapp-tab');
    let activeProvider = 'META';

    function currentProvider() {
        return activeProvider;
    }

    function showTab(provider) {
        activeProvider = provider === 'TWILIO' ? 'TWILIO' : 'META';
        tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.dataset.tab === activeProvider.toLowerCase());
        });
        document.getElementById('metaPane').classList.toggle('active', activeProvider === 'META');
        document.getElementById('twilioPane').classList.toggle('active', activeProvider === 'TWILIO');
    }

    function setValue(id, value) {
        const field = document.getElementById(id);
        if (field) field.value = value == null ? '' : String(value);
    }

    async function loadConfig() {
        const data = await fetch('/api/whatsappconfig').then(function (response) {
            return response.json();
        });
        setValue('accessToken', data.accessToken);
        setValue('phoneNumber', data.phoneNumber);
        setValue('language', data.language || 'en');
        setValue('metaStatus', data.metaStatus || 'Enabled');
        setValue('accountSid', data.accountSid);
        setValue('authToken', data.authToken);
        setValue('fromNumber', data.fromNumber);
        setValue('twilioStatus', data.twilioStatus || 'Disabled');
        showTab(data.provider === 'TWILIO' ? 'TWILIO' : 'META');
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            showTab(tab.dataset.tab === 'twilio' ? 'TWILIO' : 'META');
        });
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const provider = currentProvider();
        const payload = provider === 'TWILIO'
            ? {
                provider: 'TWILIO',
                accountSid: document.getElementById('accountSid').value.trim(),
                authToken: document.getElementById('authToken').value.trim(),
                fromNumber: document.getElementById('fromNumber').value.trim(),
                status: document.getElementById('twilioStatus').value
            }
            : {
                provider: 'META',
                accessToken: document.getElementById('accessToken').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                language: document.getElementById('language').value.trim(),
                status: document.getElementById('metaStatus').value
            };
        try {
            const response = await fetch('/api/whatsappconfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    loadConfig().catch(function (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load settings', confirmButtonColor: '#8b5cf6' });
    });
});
