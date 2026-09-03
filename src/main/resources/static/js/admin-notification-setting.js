let notificationSettings = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('notificationSettingsForm')?.addEventListener('submit', handleSave);
    loadNotificationSettings();
});

async function loadNotificationSettings() {
    const tbody = document.getElementById('notificationSettingsTableBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/notification/settings');
        if (!response.ok) throw new Error('Failed to load notification settings');
        notificationSettings = await response.json();
        renderTable();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="notification-loading-cell">${escapeHtml(error.message || 'Failed to load notification settings')}</td></tr>`;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load notification settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable() {
    const tbody = document.getElementById('notificationSettingsTableBody');
    if (!tbody) return;

    if (!notificationSettings.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="notification-loading-cell">No notification settings found</td></tr>';
        return;
    }

    tbody.innerHTML = notificationSettings.map((row, index) => `
        <tr data-index="${index}">
            <td class="notification-event-name">${escapeHtml(row.eventName)}</td>
            <td>
                <div class="notification-checkbox-group">
                    ${destinationCheckbox(index, 'notifyEmail', 'Email', row.notifyEmail)}
                    ${destinationCheckbox(index, 'notifySms', 'SMS', row.notifySms)}
                    ${destinationCheckbox(index, 'notifyMobileApp', 'Mobile App', row.notifyMobileApp)}
                    ${destinationCheckbox(index, 'notifyWhatsapp', 'WhatsApp', row.notifyWhatsapp)}
                </div>
            </td>
            <td>
                <div class="notification-checkbox-group">
                    ${recipientCheckbox(index, 'recipientStudent', 'Student', row.recipientStudent)}
                    ${recipientCheckbox(index, 'recipientGuardian', 'Guardian', row.recipientGuardian)}
                    ${recipientCheckbox(index, 'recipientStaff', 'Staff', row.recipientStaff)}
                </div>
            </td>
            <td>
                <input type="text" class="notification-template-input" data-index="${index}" data-field="smsTemplateId" value="${escapeAttr(row.smsTemplateId || '')}">
            </td>
            <td>
                <input type="text" class="notification-template-input" data-index="${index}" data-field="whatsappTemplateId" value="${escapeAttr(row.whatsappTemplateId || '')}">
            </td>
            <td>
                <div class="notification-message-box">
                    <div class="notification-message-text">${escapeHtml(row.sampleMessage || '')}</div>
                    <div class="notification-message-actions">
                        <button type="button" class="notification-icon-btn" onclick="editSampleMessage(${index})" title="Edit Sample Message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                        </button>
                        <button type="button" class="notification-icon-btn" onclick="viewMessageVariables(${index})" title="View Variables">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.notification-template-input').forEach(input => {
        input.addEventListener('input', handleTemplateInput);
    });

    tbody.querySelectorAll('.notification-setting-checkbox').forEach(input => {
        input.addEventListener('change', handleCheckboxChange);
    });
}

function destinationCheckbox(index, field, label, checked) {
    return checkboxItem(index, field, label, checked);
}

function recipientCheckbox(index, field, label, checked) {
    return checkboxItem(index, field, label, checked);
}

function checkboxItem(index, field, label, checked) {
    return `
        <label class="notification-checkbox-item">
            <input type="checkbox" class="notification-setting-checkbox" data-index="${index}" data-field="${field}" ${checked ? 'checked' : ''}>
            <span>${label}</span>
        </label>
    `;
}

function handleCheckboxChange(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const field = event.target.dataset.field;
    if (notificationSettings[index]) {
        notificationSettings[index][field] = event.target.checked;
    }
}

function handleTemplateInput(event) {
    const index = parseInt(event.target.dataset.index, 10);
    const field = event.target.dataset.field;
    if (notificationSettings[index]) {
        notificationSettings[index][field] = event.target.value;
    }
}

function buildEditModalHtml() {
    return `
        <div class="swal-notification-field">
            <label for="notificationMessageSubject">Subject</label>
            <input type="text" id="notificationMessageSubject" class="swal-notification-input" placeholder="Email subject">
        </div>
        <div class="swal-notification-field">
            <label for="notificationTemplateId">Template ID</label>
            <input type="text" id="notificationTemplateId" class="swal-notification-input" placeholder="DLT / SMS template ID">
        </div>
        <div class="swal-notification-field">
            <label for="notificationMessageEditor">Template</label>
            <textarea id="notificationMessageEditor" class="swal-notification-textarea" placeholder="Notification message template"></textarea>
        </div>
    `;
}

async function editSampleMessage(index) {
    const row = notificationSettings[index];
    if (!row) return;

    const { value: saved } = await Swal.fire({
        title: 'Edit Sample Message',
        html: buildEditModalHtml(),
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        confirmButtonColor: getThemePrimary(),
        cancelButtonColor: '#64748b',
        width: 640,
        didOpen: () => {
            document.getElementById('notificationMessageSubject').value = row.messageSubject || row.eventName || '';
            document.getElementById('notificationTemplateId').value = row.smsTemplateId || '';
            document.getElementById('notificationMessageEditor').value = row.sampleMessage || '';
        },
        preConfirm: () => ({
            messageSubject: document.getElementById('notificationMessageSubject')?.value?.trim() || '',
            smsTemplateId: document.getElementById('notificationTemplateId')?.value?.trim() || '',
            sampleMessage: document.getElementById('notificationMessageEditor')?.value || ''
        })
    });

    if (saved === undefined) return;

    notificationSettings[index].messageSubject = saved.messageSubject;
    notificationSettings[index].smsTemplateId = saved.smsTemplateId;
    notificationSettings[index].sampleMessage = saved.sampleMessage;
    renderTable();
}

function extractVariables(message) {
    if (!message) return [];
    const matches = message.match(/\{\{?\s*([a-zA-Z0-9_]+)\s*\}?\}?/g) || [];
    const unique = new Set();
    matches.forEach(token => {
        const cleaned = token.replace(/[{}\s]/g, '');
        if (cleaned) unique.add(cleaned);
    });
    return Array.from(unique).sort();
}

function viewMessageVariables(index) {
    const row = notificationSettings[index];
    if (!row) return;

    const variables = extractVariables(row.sampleMessage);
    const variableHtml = variables.length
        ? variables.map(v => `<code>{{${v}}}</code>`).join('')
        : '<span style="color:#888;">No variables found in this template.</span>';

    Swal.fire({
        title: row.eventName,
        html: `
            <div class="notification-variables-list">
                <p style="margin:0 0 10px;font-size:13px;color:#666;">Available variables in this template:</p>
                ${variableHtml}
            </div>
        `,
        confirmButtonText: 'Close',
        confirmButtonColor: getThemePrimary(),
        width: 560
    });
}

function getThemePrimary() {
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
    return primary || '#727cf5';
}

function syncFromDom() {
    document.querySelectorAll('.notification-setting-checkbox').forEach(input => {
        const index = parseInt(input.dataset.index, 10);
        const field = input.dataset.field;
        if (notificationSettings[index] && field) {
            notificationSettings[index][field] = input.checked;
        }
    });

    document.querySelectorAll('.notification-template-input').forEach(input => {
        const index = parseInt(input.dataset.index, 10);
        const field = input.dataset.field;
        if (notificationSettings[index] && field) {
            notificationSettings[index][field] = input.value;
        }
    });
}

async function handleSave(event) {
    event.preventDefault();
    syncFromDom();

    try {
        const response = await fetch('/api/admin/notification/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationSettings)
        });
        const result = await response.json();

        if (result.success) {
            notificationSettings = result.data || notificationSettings;
            renderTable();
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
            text: error.message || 'Failed to save notification settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
}

window.editSampleMessage = editSampleMessage;
window.viewMessageVariables = viewMessageVariables;
