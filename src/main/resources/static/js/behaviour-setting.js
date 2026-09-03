document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('behaviourSettingForm');
    const studentComment = document.getElementById('studentCommentEnabled');
    const parentComment = document.getElementById('parentCommentEnabled');
    const saveBtn = document.getElementById('saveBehaviourSettingBtn');

    async function loadSettings() {
        const response = await fetch('/api/behaviour-settings');
        if (!response.ok) throw new Error('Failed to load settings');
        const data = await response.json();
        studentComment.checked = !!data.studentCommentEnabled;
        parentComment.checked = !!data.parentCommentEnabled;
    }

    async function saveSettings(e) {
        e.preventDefault();
        saveBtn.disabled = true;
        try {
            const response = await fetch('/api/behaviour-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentCommentEnabled: studentComment.checked,
                    parentCommentEnabled: parentComment.checked
                })
            });
            if (!response.ok) {
                let message = 'Failed to save settings';
                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch (err) { /* ignore */ }
                throw new Error(message);
            }
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Behaviour settings saved to database.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save settings.',
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveBtn.disabled = false;
        }
    }

    if (form) form.addEventListener('submit', saveSettings);

    loadSettings().catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load settings.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
