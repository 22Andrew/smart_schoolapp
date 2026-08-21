document.addEventListener('DOMContentLoaded', function () {
    const TYPES = [
        { id: 'fees_receipt', label: 'Fees Receipt' },
        { id: 'payslip', label: 'Payslip' },
        { id: 'online_admission', label: 'Online Admission Receipt' },
        { id: 'online_exam', label: 'Online Exam' },
        { id: 'email', label: 'Email' },
        { id: 'general', label: 'General Purpose' }
    ];
    const DEFAULT_FOOTERS = {
        fees_receipt: 'This receipt is computer generated hence no signature is required.',
        email: 'Note: This email was sent from an email address that can\'t receive emails. Please don\'t reply to this email'
    };

    const tabsEl = document.getElementById('phfTabs');
    const subtitleEl = document.getElementById('phfSubtitle');
    const schoolNameEl = document.getElementById('phfSchoolName');
    const contactEl = document.getElementById('phfContact');
    const logoEl = document.getElementById('phfLogo');
    const mockEl = document.getElementById('phfMock');
    const uploadedEl = document.getElementById('phfUploaded');
    const removeBtn = document.getElementById('phfRemove');
    const fileInput = document.getElementById('phfFile');
    const previewWrap = document.getElementById('phfPreview');
    const editor = document.getElementById('phfEditor');
    const form = document.getElementById('phfForm');
    const toolbar = document.getElementById('phfToolbar');

    let activeId = 'fees_receipt';
    let school = {};
    let store = {};
    let pendingFile = null;
    let removeHeader = false;

    function typeById(id) {
        return TYPES.find(function (item) { return item.id === id; });
    }

    function current() {
        return store[activeId] || { headerImage: '', footerContent: '' };
    }

    function renderTabs() {
        tabsEl.innerHTML = TYPES.map(function (item) {
            return '<button type="button" class="phf-tab' + (item.id === activeId ? ' active' : '') + '" data-tab="' + item.id + '">' + item.label + '</button>';
        }).join('');
    }

    function renderSchool() {
        schoolNameEl.textContent = school.schoolName || 'Your School Name Here';
        contactEl.innerHTML =
            'Address: ' + (school.address || '25 Kings Street, CA') + '<br>' +
            'Phone No.: ' + (school.phone || '89562423934') + '<br>' +
            'Email: ' + (school.email || 'yourschool@gmail.com') + '<br>' +
            'Website: ' + (school.website || 'www.yoursite.in');
        if (school.logo) {
            logoEl.innerHTML = '<img src="' + school.logo + '" alt="Logo">';
        }
    }

    function renderPreview() {
        const item = current();
        subtitleEl.textContent = typeById(activeId).label;
        mockEl.classList.toggle('is-email', activeId === 'email');
        const hasImage = !!(item.headerImage && !removeHeader) || !!pendingFile;
        if (item.headerImage && !removeHeader && !pendingFile) {
            uploadedEl.src = item.headerImage;
            uploadedEl.hidden = false;
            mockEl.hidden = true;
        } else if (pendingFile) {
            uploadedEl.hidden = false;
            mockEl.hidden = true;
        } else {
            uploadedEl.hidden = true;
            mockEl.hidden = false;
        }
        removeBtn.hidden = !hasImage;
    }

    function renderEditor() {
        editor.innerHTML = current().footerContent || DEFAULT_FOOTERS[activeId] || '';
    }

    function stashEditor() {
        store[activeId] = Object.assign({}, current(), { footerContent: editor.innerHTML });
    }

    function showLocalImage(file) {
        const url = URL.createObjectURL(file);
        uploadedEl.src = url;
        uploadedEl.hidden = false;
        mockEl.hidden = true;
        removeBtn.hidden = false;
    }

    tabsEl.addEventListener('click', function (event) {
        const tab = event.target.closest('[data-tab]');
        if (!tab) return;
        stashEditor();
        pendingFile = null;
        removeHeader = false;
        fileInput.value = '';
        activeId = tab.dataset.tab;
        renderTabs();
        renderPreview();
        renderEditor();
    });

    previewWrap.addEventListener('click', function (event) {
        if (event.target.closest('#phfRemove')) return;
        fileInput.click();
    });

    previewWrap.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    previewWrap.addEventListener('drop', function (event) {
        event.preventDefault();
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        pendingFile = file;
        removeHeader = false;
        showLocalImage(file);
    });

    fileInput.addEventListener('change', function () {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        pendingFile = file;
        removeHeader = false;
        showLocalImage(file);
    });

    removeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        pendingFile = null;
        removeHeader = true;
        fileInput.value = '';
        store[activeId] = Object.assign({}, current(), { headerImage: '' });
        renderPreview();
    });

    toolbar.addEventListener('click', function (event) {
        const button = event.target.closest('[data-cmd]');
        if (!button) return;
        event.preventDefault();
        const cmd = button.dataset.cmd;
        if (cmd === 'small') {
            document.execCommand('fontSize', false, '2');
            return;
        }
        if (cmd === 'blockquote') {
            document.execCommand('formatBlock', false, 'blockquote');
            return;
        }
        if (cmd === 'createLink') {
            const url = window.prompt('Enter URL');
            if (url) document.execCommand('createLink', false, url);
            return;
        }
        if (cmd === 'insertImage') {
            const url = window.prompt('Enter image URL');
            if (url) document.execCommand('insertImage', false, url);
            return;
        }
        document.execCommand(cmd, false, null);
    });

    toolbar.addEventListener('change', function (event) {
        if (event.target.id !== 'phfFormat') return;
        const value = event.target.value;
        if (value === 'small') document.execCommand('fontSize', false, '2');
        else document.execCommand('formatBlock', false, value);
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        stashEditor();
        const data = new FormData();
        data.append('documentType', activeId);
        data.append('footerContent', current().footerContent || '');
        if (removeHeader) data.append('removeHeader', 'true');
        if (pendingFile) data.append('header', pendingFile);
        try {
            const response = await fetch('/api/printheaderfooter', { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            if (result.data && result.data.documents) store = result.data.documents;
            pendingFile = null;
            removeHeader = false;
            renderPreview();
            renderEditor();
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/printheaderfooter')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            store = data.documents || {};
            school = data.school || {};
            renderTabs();
            renderSchool();
            renderPreview();
            renderEditor();
        })
        .catch(function () {
            renderTabs();
            renderSchool();
            renderPreview();
            renderEditor();
        });
});
