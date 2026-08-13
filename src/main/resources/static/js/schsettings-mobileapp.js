document.addEventListener('DOMContentLoaded', function() {
    setupMobileAppForm();
    loadMobileAppSettings();
});

function setupMobileAppForm() {
    document.getElementById('mobileAppForm')?.addEventListener('submit', handleSave);
    document.getElementById('registerAndroidAppBtn')?.addEventListener('click', openAndroidRegisterModal);
    document.getElementById('androidRegisterCloseBtn')?.addEventListener('click', closeAndroidRegisterModal);
    document.getElementById('androidRegisterOverlay')?.addEventListener('click', closeAndroidRegisterModal);
    document.getElementById('androidRegisterForm')?.addEventListener('submit', handleRegisterSave);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAndroidRegisterModal();
        }
    });
}

async function loadMobileAppSettings() {
    try {
        const response = await fetch('/api/schsettings/mobile-app');
        if (!response.ok) throw new Error('Failed to load mobile app settings');
        const data = await response.json();

        setValue('apiUrl', data.apiUrl);
        setValue('primaryColor', data.primaryColor);
        setValue('secondaryColor', data.secondaryColor);
        setValue('envatoPurchaseCode', data.envatoPurchaseCode);
        setValue('envatoEmail', data.envatoEmail);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load mobile app settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function openAndroidRegisterModal() {
    const modal = document.getElementById('androidRegisterModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeAndroidRegisterModal() {
    const modal = document.getElementById('androidRegisterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        apiUrl: getValue('apiUrl'),
        primaryColor: getValue('primaryColor'),
        secondaryColor: getValue('secondaryColor')
    };

    try {
        const response = await fetch('/api/schsettings/mobile-app', {
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
            text: error.message || 'Failed to save mobile app settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleRegisterSave(event) {
    event.preventDefault();

    const payload = {
        envatoPurchaseCode: getValue('envatoPurchaseCode'),
        envatoEmail: getValue('envatoEmail')
    };

    try {
        const response = await fetch('/api/schsettings/mobile-app/register', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            closeAndroidRegisterModal();
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
            text: error.message || 'Failed to register Android app',
            confirmButtonColor: '#ef4444'
        });
    }
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value ?? '';
}
