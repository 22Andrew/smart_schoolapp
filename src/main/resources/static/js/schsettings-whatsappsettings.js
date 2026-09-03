document.addEventListener('DOMContentLoaded', function () {
    setupWhatsappForm();
    loadWhatsappSettings();
});

function setupWhatsappForm() {
    document.getElementById('whatsappSettingsForm')?.addEventListener('submit', handleSave);
}

async function loadWhatsappSettings() {
    try {
        const response = await fetch('/api/schsettings/whatsapp');
        if (!response.ok) throw new Error('Failed to load Whatsapp settings');
        const data = await response.json();

        setChecked('frontSiteWhatsappLinkEnabled', data.frontSiteWhatsappLinkEnabled);
        setValue('frontSiteMobileNo', data.frontSiteMobileNo);
        setValue('frontSiteTimeFrom', data.frontSiteTimeFrom);
        setValue('frontSiteTimeTo', data.frontSiteTimeTo);

        setChecked('adminPanelWhatsappLinkEnabled', data.adminPanelWhatsappLinkEnabled);
        setValue('adminPanelMobileNo', data.adminPanelMobileNo);
        setValue('adminPanelTimeFrom', data.adminPanelTimeFrom);
        setValue('adminPanelTimeTo', data.adminPanelTimeTo);

        setChecked('studentGuardianPanelWhatsappLinkEnabled', data.studentGuardianPanelWhatsappLinkEnabled);
        setValue('studentGuardianPanelMobileNo', data.studentGuardianPanelMobileNo);
        setValue('studentGuardianPanelTimeFrom', data.studentGuardianPanelTimeFrom);
        setValue('studentGuardianPanelTimeTo', data.studentGuardianPanelTimeTo);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load Whatsapp settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        frontSiteWhatsappLinkEnabled: getChecked('frontSiteWhatsappLinkEnabled'),
        frontSiteMobileNo: getValue('frontSiteMobileNo'),
        frontSiteTimeFrom: getValue('frontSiteTimeFrom'),
        frontSiteTimeTo: getValue('frontSiteTimeTo'),
        adminPanelWhatsappLinkEnabled: getChecked('adminPanelWhatsappLinkEnabled'),
        adminPanelMobileNo: getValue('adminPanelMobileNo'),
        adminPanelTimeFrom: getValue('adminPanelTimeFrom'),
        adminPanelTimeTo: getValue('adminPanelTimeTo'),
        studentGuardianPanelWhatsappLinkEnabled: getChecked('studentGuardianPanelWhatsappLinkEnabled'),
        studentGuardianPanelMobileNo: getValue('studentGuardianPanelMobileNo'),
        studentGuardianPanelTimeFrom: getValue('studentGuardianPanelTimeFrom'),
        studentGuardianPanelTimeTo: getValue('studentGuardianPanelTimeTo')
    };

    try {
        const response = await fetch('/api/schsettings/whatsapp', {
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
            text: error.message || 'Failed to save Whatsapp settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}

function setChecked(id, value) {
    const field = document.getElementById(id);
    if (field) field.checked = !!value;
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value ?? '';
}
