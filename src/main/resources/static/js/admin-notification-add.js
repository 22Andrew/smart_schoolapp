let editingId = null;
let quillEditor = null;

const MESSAGE_TO_ROLES = [
    'Student', 'Parent', 'Admin', 'Teacher',
    'Accountant', 'Librarian', 'Receptionist', 'Super Admin'
];

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    if (editId) {
        editingId = parseInt(editId, 10);
    }

    initQuillEditor();
    initAttachmentDropzone();
    document.getElementById('noticeForm')?.addEventListener('submit', saveNotice);

    if (editingId) {
        loadNoticeForEdit(editingId);
    } else {
        resetComposeForm();
    }
});

function initQuillEditor() {
    const editorEl = document.getElementById('noticeMessageEditor');
    if (!editorEl || typeof Quill === 'undefined') return;

    quillEditor = new Quill(editorEl, {
        theme: 'snow',
        placeholder: 'Type your message here...',
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ size: ['small', false, 'large'] }],
                ['blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['link', 'image']
            ]
        }
    });
}

function initAttachmentDropzone() {
    const dropzone = document.getElementById('attachmentDropzone');
    const fileInput = document.getElementById('noticeAttachment');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        updateAttachmentLabel(fileInput.files[0]);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, event => {
            event.preventDefault();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, event => {
            event.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', event => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        fileInput.files = event.dataTransfer.files;
        updateAttachmentLabel(file);
    });
}

function updateAttachmentLabel(file) {
    const label = document.getElementById('attachmentFileName');
    if (!label) return;
    label.textContent = file ? file.name : '';
}

function resetComposeForm() {
    document.getElementById('noticeForm')?.reset();
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('noticeDate').value = today;
    document.getElementById('publishOn').value = today;

    document.querySelectorAll('#messageToList input[name="messageTo"]').forEach(input => {
        input.checked = input.value === 'Super Admin';
    });
    document.getElementById('sendByEmail').checked = false;
    document.getElementById('sendBySms').checked = false;

    const fileInput = document.getElementById('noticeAttachment');
    if (fileInput) fileInput.value = '';
    updateAttachmentLabel(null);

    if (quillEditor) {
        quillEditor.setContents([]);
    }
}

async function loadNoticeForEdit(id) {
    try {
        const response = await fetch('/api/communicate/notices');
        if (!response.ok) throw new Error('Failed to load notice');
        const notices = await response.json();
        const notice = notices.find(item => item.id === id);
        if (!notice) throw new Error('Notice not found');

        document.getElementById('noticeComposeTitle').textContent = 'Compose New Message';
        document.getElementById('noticeTitle').value = notice.title || '';
        document.getElementById('noticeDate').value = notice.noticeDate || '';
        document.getElementById('publishOn').value = notice.publishOn || notice.noticeDate || '';

        const roles = parseMessageTo(notice.messageTo || notice.publishTo);
        document.querySelectorAll('#messageToList input[name="messageTo"]').forEach(input => {
            input.checked = roles.includes(input.value);
        });

        document.getElementById('sendByEmail').checked = !!notice.sendByEmail;
        document.getElementById('sendBySms').checked = !!notice.sendBySms;

        if (notice.attachmentPath) {
            const fileName = notice.attachmentPath.split('/').pop();
            updateAttachmentLabel({ name: fileName + ' (saved)' });
        }

        if (quillEditor) {
            if (notice.message && notice.message.includes('<')) {
                quillEditor.root.innerHTML = notice.message;
            } else {
                quillEditor.setText(notice.message || '');
            }
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load notice' })
            .then(() => { window.location.href = '/admin/notification'; });
    }
}

function parseMessageTo(value) {
    if (!value) return [];
    if (value === 'Multiple') return MESSAGE_TO_ROLES.slice();
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

function getSelectedMessageTo() {
    return Array.from(document.querySelectorAll('#messageToList input[name="messageTo"]:checked'))
        .map(input => input.value);
}

async function saveNotice(event) {
    event.preventDefault();

    const title = document.getElementById('noticeTitle').value.trim();
    const noticeDate = document.getElementById('noticeDate').value;
    const publishOn = document.getElementById('publishOn').value;
    const messageTo = getSelectedMessageTo();
    const messageHtml = quillEditor ? quillEditor.root.innerHTML : '';
    const messageText = quillEditor ? quillEditor.getText().trim() : '';

    if (!title) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Title is required.' });
        return;
    }
    if (!noticeDate || !publishOn) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Notice date and publish on are required.' });
        return;
    }
    if (!messageText) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Message is required.' });
        return;
    }
    if (!messageTo.length) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Select at least one recipient under Message To.' });
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('noticeDate', noticeDate);
    formData.append('publishOn', publishOn);
    formData.append('message', messageHtml);
    formData.append('messageTo', messageTo.join(', '));
    formData.append('sendByEmail', document.getElementById('sendByEmail').checked);
    formData.append('sendBySms', document.getElementById('sendBySms').checked);

    const attachment = document.getElementById('noticeAttachment')?.files?.[0];
    if (attachment) {
        formData.append('attachment', attachment);
    }

    const url = editingId ? `/api/communicate/notices/${editingId}` : '/api/communicate/notices';
    const method = editingId ? 'PUT' : 'POST';

    const sendBtn = document.getElementById('noticeSendBtn');
    if (sendBtn) sendBtn.disabled = true;

    try {
        const response = await fetch(url, { method, body: formData });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: result.message || 'Message saved successfully!',
            timer: 2000,
            showConfirmButton: false
        });
        window.location.href = '/admin/notification';
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save notice' });
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}
