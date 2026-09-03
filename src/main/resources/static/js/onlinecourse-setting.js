document.addEventListener('DOMContentLoaded', function () {
    const enableQuiz = document.getElementById('enableQuiz');
    const enableExam = document.getElementById('enableExam');
    const enableAssignment = document.getElementById('enableAssignment');
    const awsAccessKey = document.getElementById('awsAccessKey');
    const awsSecretKey = document.getElementById('awsSecretKey');
    const awsBucketName = document.getElementById('awsBucketName');
    const awsRegion = document.getElementById('awsRegion');
    const guestLoginEnabled = document.getElementById('guestLoginEnabled');
    const guestPrefix = document.getElementById('guestPrefix');
    const guestIdStart = document.getElementById('guestIdStart');
    const saveCurriculumBtn = document.getElementById('saveCurriculumBtn');
    const saveAwsBtn = document.getElementById('saveAwsBtn');
    const saveGuestBtn = document.getElementById('saveGuestBtn');

    function applySettings(data) {
        if (!data) return;
        enableQuiz.checked = !!data.enableQuiz;
        enableExam.checked = !!data.enableExam;
        enableAssignment.checked = !!data.enableAssignment;
        awsAccessKey.value = data.awsAccessKey || '';
        awsSecretKey.value = data.awsSecretKey || '';
        awsBucketName.value = data.awsBucketName || '';
        awsRegion.value = data.awsRegion || '';
        guestLoginEnabled.checked = !!data.guestLoginEnabled;
        guestPrefix.value = data.guestPrefix || 'Guest';
        guestIdStart.value = data.guestIdStart == null ? 100 : data.guestIdStart;
    }

    async function loadSettings() {
        const response = await fetch('/api/online-course-settings');
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load settings');
        }
        applySettings(await response.json());
    }

    async function putJson(url, body) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save settings');
        }
        return data;
    }

    async function saveCurriculum() {
        saveCurriculumBtn.disabled = true;
        try {
            const data = await putJson('/api/online-course-settings/curriculum', {
                enableQuiz: enableQuiz.checked,
                enableExam: enableExam.checked,
                enableAssignment: enableAssignment.checked
            });
            applySettings(data);
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Curriculum settings updated.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveCurriculumBtn.disabled = false;
        }
    }

    async function saveAws() {
        saveAwsBtn.disabled = true;
        try {
            const data = await putJson('/api/online-course-settings/aws', {
                awsAccessKey: awsAccessKey.value.trim(),
                awsSecretKey: awsSecretKey.value.trim(),
                awsBucketName: awsBucketName.value.trim(),
                awsRegion: awsRegion.value.trim()
            });
            applySettings(data);
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'AWS S3 settings updated.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveAwsBtn.disabled = false;
        }
    }

    async function saveGuest() {
        saveGuestBtn.disabled = true;
        try {
            const data = await putJson('/api/online-course-settings/guest', {
                guestLoginEnabled: guestLoginEnabled.checked,
                guestPrefix: guestPrefix.value.trim(),
                guestIdStart: guestIdStart.value
            });
            applySettings(data);
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Guest user settings updated.',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#8b5cf6'
            });
        } finally {
            saveGuestBtn.disabled = false;
        }
    }

    if (saveCurriculumBtn) saveCurriculumBtn.addEventListener('click', saveCurriculum);
    if (saveAwsBtn) saveAwsBtn.addEventListener('click', saveAws);
    if (saveGuestBtn) saveGuestBtn.addEventListener('click', saveGuest);

    loadSettings().catch(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load settings.',
            confirmButtonColor: '#8b5cf6'
        });
    });
});
