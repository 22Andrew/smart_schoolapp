document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('emailForm');
    const engineEl = document.getElementById('emailEngine');
    const smtpBlock = document.getElementById('smtpFields');
    const sesBlock = document.getElementById('sesFields');
    const hintEl = document.getElementById('smtpPasswordHint');
    const secretHintEl = document.getElementById('awsSecretHint');

    function setValue(id, value) {
        const field = document.getElementById(id);
        if (field) field.value = value == null ? '' : String(value);
    }

    function setHint(el, value) {
        if (!el) return;
        if (value) {
            el.textContent = value;
            el.hidden = false;
        } else {
            el.textContent = '';
            el.hidden = true;
        }
    }

    function normalizeEngine(value) {
        const engine = String(value || 'smtp').toLowerCase().replace(/\s+/g, '_');
        if (engine === 'sendmail') return 'sendmail';
        if (engine === 'aws_ses' || engine === 'awsses' || engine === 'ses') return 'aws_ses';
        return 'smtp';
    }

    function toggleEngine() {
        const engine = engineEl.value;
        smtpBlock.hidden = engine !== 'smtp';
        sesBlock.hidden = engine !== 'aws_ses';
    }

    function applyConfig(data) {
        engineEl.value = normalizeEngine(data.emailEngine);
        setValue('fromEmail', data.fromEmail);
        setValue('smtpUsername', data.smtpUsername);
        setValue('smtpPassword', '');
        setValue('smtpServer', data.smtpServer);
        setValue('smtpPort', data.smtpPort || '587');
        setValue('smtpSecurity', (data.smtpSecurity || 'tls').toLowerCase() === 'off' ? 'off' : (data.smtpSecurity || 'tls').toLowerCase());
        setValue('smtpAuth', (data.smtpAuth || 'on').toLowerCase() === 'off' ? 'off' : 'on');
        setValue('awsAccessKeyId', data.awsAccessKeyId);
        setValue('awsSecretAccessKey', '');
        setValue('awsRegion', data.awsRegion || 'us-east-1');
        setHint(hintEl, data.passwordHint);
        setHint(secretHintEl, data.awsSecretHint);
        toggleEngine();
    }

    engineEl.addEventListener('change', toggleEngine);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = {
            emailEngine: engineEl.value,
            fromEmail: document.getElementById('fromEmail').value.trim(),
            smtpUsername: document.getElementById('smtpUsername').value.trim(),
            smtpPassword: document.getElementById('smtpPassword').value,
            smtpServer: document.getElementById('smtpServer').value.trim(),
            smtpPort: document.getElementById('smtpPort').value.trim(),
            smtpSecurity: document.getElementById('smtpSecurity').value,
            smtpAuth: document.getElementById('smtpAuth').value,
            awsAccessKeyId: document.getElementById('awsAccessKeyId').value.trim(),
            awsSecretAccessKey: document.getElementById('awsSecretAccessKey').value,
            awsRegion: document.getElementById('awsRegion').value
        };
        try {
            const response = await fetch('/api/emailconfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            if (result.data) applyConfig(result.data);
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/emailconfig')
        .then(function (response) { return response.json(); })
        .then(applyConfig)
        .catch(function (error) {
            toggleEngine();
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load settings', confirmButtonColor: '#8b5cf6' });
        });
});
