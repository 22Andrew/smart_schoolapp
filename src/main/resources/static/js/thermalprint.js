document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('tpForm');
    const enabledEl = document.getElementById('tpEnabled');
    const schoolNameEl = document.getElementById('tpSchoolName');
    const addressEl = document.getElementById('tpAddress');
    const footerEl = document.getElementById('tpFooter');

    function apply(data) {
        enabledEl.checked = !!data.thermalPrintEnabled;
        schoolNameEl.value = data.schoolName || '';
        addressEl.value = data.address || '';
        footerEl.value = data.footerText || '';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const schoolName = schoolNameEl.value.trim();
        if (!schoolName) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'School name is required', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const response = await fetch('/api/thermalprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thermalPrintEnabled: enabledEl.checked,
                    schoolName: schoolName,
                    address: addressEl.value,
                    footerText: footerEl.value
                })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            if (result.data) apply(result.data);
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/thermalprint')
        .then(function (response) { return response.json(); })
        .then(apply)
        .catch(function () {});
});
