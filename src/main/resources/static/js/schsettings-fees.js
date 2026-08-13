document.addEventListener('DOMContentLoaded', function() {
    setupFeesForm();
    loadFeesSettings();
});

function setupFeesForm() {
    document.getElementById('feesSettingsForm')?.addEventListener('submit', handleSave);

    const toolbar = document.getElementById('offlineBankPaymentToolbar');
    const editor = document.getElementById('offlineBankPaymentInstruction');
    if (toolbar && editor) {
        toolbar.addEventListener('click', function(event) {
            const button = event.target.closest('[data-cmd]');
            if (!button) return;
            document.execCommand(button.getAttribute('data-cmd'), false, null);
            editor.focus();
        });
    }
}

async function loadFeesSettings() {
    try {
        const response = await fetch('/api/schsettings/fees');
        if (!response.ok) throw new Error('Failed to load fees settings');
        const data = await response.json();

        setChecked('offlineBankPaymentInStudentPanel', data.offlineBankPaymentInStudentPanel);
        setEditorContent('offlineBankPaymentInstruction', data.offlineBankPaymentInstruction);
        setChecked('lockStudentPanelIfFeesRemaining', data.lockStudentPanelIfFeesRemaining);
        setChecked('printFeesReceiptOfficeCopy', data.printFeesReceiptOfficeCopy);
        setChecked('printFeesReceiptStudentCopy', data.printFeesReceiptStudentCopy);
        setChecked('printFeesReceiptBankCopy', data.printFeesReceiptBankCopy);
        setValue('carryForwardFeesDueDays', data.carryForwardFeesDueDays);
        setChecked('singlePageFeesPrint', data.singlePageFeesPrint);
        setChecked('collectFeesInBackDate', data.collectFeesInBackDate);
        setChecked('studentGuardianPanelFeesDiscount', data.studentGuardianPanelFeesDiscount);
        setChecked('displayPreviousFees', data.displayPreviousFees);
        setChecked('allowStudentPartialPayment', data.allowStudentPartialPayment);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load fees settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function handleSave(event) {
    event.preventDefault();

    const payload = {
        offlineBankPaymentInStudentPanel: getChecked('offlineBankPaymentInStudentPanel'),
        offlineBankPaymentInstruction: getEditorContent('offlineBankPaymentInstruction'),
        lockStudentPanelIfFeesRemaining: getChecked('lockStudentPanelIfFeesRemaining'),
        printFeesReceiptOfficeCopy: getChecked('printFeesReceiptOfficeCopy'),
        printFeesReceiptStudentCopy: getChecked('printFeesReceiptStudentCopy'),
        printFeesReceiptBankCopy: getChecked('printFeesReceiptBankCopy'),
        carryForwardFeesDueDays: getValue('carryForwardFeesDueDays'),
        singlePageFeesPrint: getChecked('singlePageFeesPrint'),
        collectFeesInBackDate: getChecked('collectFeesInBackDate'),
        studentGuardianPanelFeesDiscount: getChecked('studentGuardianPanelFeesDiscount'),
        displayPreviousFees: getChecked('displayPreviousFees'),
        allowStudentPartialPayment: getChecked('allowStudentPartialPayment')
    };

    try {
        const response = await fetch('/api/schsettings/fees', {
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
            text: error.message || 'Failed to save fees settings',
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

function getEditorContent(id) {
    const editor = document.getElementById(id);
    return editor ? editor.innerText.trim() : '';
}

function setEditorContent(id, value) {
    const editor = document.getElementById(id);
    if (editor) {
        editor.textContent = value ?? '';
    }
}
