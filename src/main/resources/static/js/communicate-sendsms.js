let activeTab = 'group';
let classesCache = [];
let individualRecipients = [];
let individualSearchResults = [];
let birthdayStudents = [];

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initSmsCharCount();
    bindFormEvents();
    loadSmsTemplates();
    loadClasses();
    loadBirthdayStudents();
    renderIndividualSelected();
});

function initTabs() {
    document.querySelectorAll('.send-email-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.send-email-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.recipient-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === tab);
    });
    if (tab === 'birthday') {
        loadBirthdayStudents();
    }
}

function initSmsCharCount() {
    const textarea = document.getElementById('smsMessage');
    const counter = document.getElementById('smsCharCount');
    if (!textarea || !counter) return;

    const updateCount = () => {
        counter.textContent = textarea.value.length;
    };
    textarea.addEventListener('input', updateCount);
    updateCount();
}

function bindFormEvents() {
    document.getElementById('sendSmsForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('individualAddBtn')?.addEventListener('click', enableIndividualSearch);
    document.getElementById('individualSearchBtn')?.addEventListener('click', searchIndividuals);
    document.getElementById('individualSearchInput')?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchIndividuals();
        }
    });
    document.getElementById('classSelect')?.addEventListener('change', renderClassSections);
    document.getElementById('birthdaySelectAll')?.addEventListener('change', toggleAllBirthdays);

    document.querySelectorAll('input[name="sendMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const scheduleInput = document.getElementById('scheduledAt');
            const isSchedule = document.querySelector('input[name="sendMode"]:checked')?.value === 'SCHEDULE';
            scheduleInput?.classList.toggle('hidden', !isSchedule);
        });
    });
}

async function loadSmsTemplates() {
    try {
        const response = await fetch('/api/communicate/sms-templates');
        if (!response.ok) return;
        const templates = await response.json();
        const select = document.getElementById('smsTemplateSelect');
        if (!select) return;

        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.title;
            option.dataset.body = template.templateBody || '';
            select.appendChild(option);
        });

        select.addEventListener('change', function() {
            const selected = select.options[select.selectedIndex];
            const textarea = document.getElementById('smsMessage');
            if (selected?.dataset.body && textarea) {
                textarea.value = selected.dataset.body;
                textarea.dispatchEvent(new Event('input'));
            }
        });
    } catch (error) {
        console.warn('Could not load SMS templates', error);
    }
}

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        if (!response.ok) return;
        classesCache = await response.json();
        const select = document.getElementById('classSelect');
        if (!select) return;

        classesCache.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            option.dataset.sections = JSON.stringify(item.sections || []);
            select.appendChild(option);
        });
    } catch (error) {
        console.warn('Could not load classes', error);
    }
}

function renderClassSections() {
    const select = document.getElementById('classSelect');
    const tbody = document.getElementById('classSectionTableBody');
    if (!select || !tbody) return;

    const option = select.options[select.selectedIndex];
    if (!option || !option.value) {
        tbody.innerHTML = '<tr><td colspan="2" class="class-section-empty">Select a class to load sections</td></tr>';
        return;
    }

    let sections = [];
    try {
        sections = JSON.parse(option.dataset.sections || '[]');
    } catch (error) {
        sections = [];
    }

    if (!sections.length) {
        tbody.innerHTML = '<tr><td colspan="2" class="class-section-empty">No sections found for this class</td></tr>';
        return;
    }

    tbody.innerHTML = sections.map(section => `
        <tr>
            <td>${escapeHtml(section)}</td>
            <td>
                <select class="class-section-send-to" data-section="${escapeHtml(section)}">
                    <option value="Students">Students</option>
                    <option value="Guardians">Guardians</option>
                    <option value="Students-Guardians">Students-Guardians</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function loadBirthdayStudents() {
    const tbody = document.getElementById('birthdayTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="birthday-empty">Loading birthday students...</td></tr>';

    try {
        const response = await fetch('/api/communicate/compose/birthdays');
        if (!response.ok) throw new Error('Failed to load birthdays');
        birthdayStudents = await response.json();
        renderBirthdayTable();
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="birthday-empty">Could not load birthday students</td></tr>';
    }
}

function renderBirthdayTable() {
    const tbody = document.getElementById('birthdayTableBody');
    if (!tbody) return;

    if (!birthdayStudents.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="birthday-empty">No birthdays today</td></tr>';
        return;
    }

    tbody.innerHTML = birthdayStudents.map(student => `
        <tr>
            <td><input type="checkbox" class="birthday-checkbox" value="${student.id}" checked></td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.className || '-')}</td>
            <td>${escapeHtml(student.section || '-')}</td>
        </tr>
    `).join('');
}

function toggleAllBirthdays(event) {
    document.querySelectorAll('.birthday-checkbox').forEach(box => {
        box.checked = event.target.checked;
    });
}

function enableIndividualSearch() {
    const role = document.getElementById('individualRoleSelect')?.value;
    if (!role) {
        Swal.fire({ icon: 'warning', title: 'Select Role', text: 'Please select a message to role first.' });
        return;
    }
    searchIndividuals();
}

async function searchIndividuals() {
    const role = document.getElementById('individualRoleSelect')?.value;
    const keyword = document.getElementById('individualSearchInput')?.value.trim() || '';
    const resultsEl = document.getElementById('individualResults');

    if (!role) {
        Swal.fire({ icon: 'warning', title: 'Select Role', text: 'Please select a message to role first.' });
        return;
    }

    resultsEl.innerHTML = '<div class="individual-result-item">Searching...</div>';

    try {
        let results = [];
        if (role === 'Students' || role === 'Guardians' || role === 'Students-Guardians') {
            const params = new URLSearchParams({ disabled: 'false' });
            if (keyword) params.set('keyword', keyword);
            const response = await fetch(`/api/student-admissions?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to search students');
            const students = await response.json();
            results = students.map(item => ({
                id: `student-${item.id}`,
                sourceId: item.id,
                type: role,
                name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.admissionNo,
                detail: `${item.className || ''} ${item.section || ''}`.trim()
            }));
        } else {
            const params = new URLSearchParams({ role, keyword });
            const response = await fetch(`/api/staff?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to search staff');
            const staff = await response.json();
            results = staff.map(item => ({
                id: `staff-${item.id}`,
                sourceId: item.id,
                type: role,
                name: item.name || item.staffId,
                detail: item.role || role
            }));
        }

        individualSearchResults = results;
        renderIndividualResults();
    } catch (error) {
        resultsEl.innerHTML = `<div class="individual-result-item">${escapeHtml(error.message)}</div>`;
    }
}

function renderIndividualResults() {
    const resultsEl = document.getElementById('individualResults');
    if (!resultsEl) return;

    if (!individualSearchResults.length) {
        resultsEl.innerHTML = '<div class="individual-result-item">No results found</div>';
        return;
    }

    resultsEl.innerHTML = individualSearchResults.map(item => `
        <div class="individual-result-item">
            <span>${escapeHtml(item.name)} <small>${escapeHtml(item.detail)}</small></span>
            <button type="button" data-id="${escapeHtml(item.id)}">Add</button>
        </div>
    `).join('');

    resultsEl.querySelectorAll('button[data-id]').forEach(button => {
        button.addEventListener('click', () => addIndividualRecipient(button.dataset.id));
    });
}

function addIndividualRecipient(id) {
    const item = individualSearchResults.find(row => String(row.id) === String(id));
    if (!item) return;
    if (individualRecipients.some(row => row.id === item.id)) return;
    individualRecipients.push(item);
    renderIndividualSelected();
}

function removeIndividualRecipient(id) {
    individualRecipients = individualRecipients.filter(row => row.id !== id);
    renderIndividualSelected();
}

function renderIndividualSelected() {
    const selectedEl = document.getElementById('individualSelected');
    if (!selectedEl) return;

    if (!individualRecipients.length) {
        selectedEl.innerHTML = '<div class="individual-result-item">No recipients added yet</div>';
        return;
    }

    selectedEl.innerHTML = individualRecipients.map(item => `
        <div class="individual-selected-item">
            <span>${escapeHtml(item.name)} <small>(${escapeHtml(item.type)})</small></span>
            <button type="button" data-id="${escapeHtml(item.id)}">Remove</button>
        </div>
    `).join('');

    selectedEl.querySelectorAll('button[data-id]').forEach(button => {
        button.addEventListener('click', () => removeIndividualRecipient(button.dataset.id));
    });
}

function collectRecipientPayload() {
    if (activeTab === 'group') {
        const roles = Array.from(document.querySelectorAll('input[name="groupRecipient"]:checked')).map(input => input.value);
        if (!roles.length) throw new Error('Select at least one recipient under Message To.');
        return {
            recipientType: 'Group',
            recipientDetails: JSON.stringify({ roles })
        };
    }

    if (activeTab === 'individual') {
        if (!individualRecipients.length) throw new Error('Add at least one individual recipient.');
        return {
            recipientType: 'Individual',
            recipientDetails: JSON.stringify({ recipients: individualRecipients })
        };
    }

    if (activeTab === 'class') {
        const classSelect = document.getElementById('classSelect');
        const classId = classSelect?.value;
        const className = classSelect?.options[classSelect.selectedIndex]?.textContent || '';
        if (!classId) throw new Error('Select a class under Message To.');

        const sections = Array.from(document.querySelectorAll('.class-section-send-to')).map(select => ({
            section: select.dataset.section,
            sendTo: select.value
        }));
        if (!sections.length) throw new Error('No sections available for the selected class.');

        return {
            recipientType: 'Class',
            recipientDetails: JSON.stringify({ classId, className, sections })
        };
    }

    const selected = Array.from(document.querySelectorAll('.birthday-checkbox:checked')).map(box => {
        return birthdayStudents.find(item => String(item.id) === box.value);
    }).filter(Boolean);

    if (!selected.length) throw new Error('Select at least one birthday student.');

    return {
        recipientType: 'Birthday',
        recipientDetails: JSON.stringify({ students: selected })
    };
}

async function handleSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('smsTitle')?.value.trim();
    const message = document.getElementById('smsMessage')?.value.trim();
    const sendMode = document.querySelector('input[name="sendMode"]:checked')?.value || 'NOW';
    const scheduledAt = document.getElementById('scheduledAt')?.value;
    const smsTemplateId = document.getElementById('smsTemplateSelect')?.value;
    const sendThrough = Array.from(document.querySelectorAll('input[name="sendThrough"]:checked'))
        .map((input) => input.value);
    const smsGatewayTemplateId = document.getElementById('smsGatewayTemplateId')?.value.trim();

    if (!title) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Title is required.' });
        return;
    }
    if (sendThrough.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Select at least one Send Through option.' });
        return;
    }
    if (!message) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Message is required.' });
        return;
    }
    if (sendMode === 'SCHEDULE' && !scheduledAt) {
        Swal.fire({ icon: 'warning', title: 'Required', text: 'Select a schedule date and time.' });
        return;
    }

    let recipientPayload;
    try {
        recipientPayload = collectRecipientPayload();
    } catch (error) {
        Swal.fire({ icon: 'warning', title: 'Recipients', text: error.message });
        return;
    }

    const payload = {
        composeTab: capitalizeTab(activeTab),
        title,
        message,
        recipientType: recipientPayload.recipientType,
        recipientDetails: recipientPayload.recipientDetails,
        sendMode,
        scheduledAt: sendMode === 'SCHEDULE' ? scheduledAt : null,
        smsTemplateId: smsTemplateId || null,
        sendThrough,
        smsGatewayTemplateId: smsGatewayTemplateId || null
    };

    try {
        const response = await fetch('/api/communicate/messages/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: result.message,
            timer: 2200,
            showConfirmButton: false
        });

        resetForm();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to send SMS' });
    }
}

function resetForm() {
    document.getElementById('sendSmsForm')?.reset();
    document.getElementById('scheduledAt')?.classList.add('hidden');
    document.getElementById('smsCharCount').textContent = '0';
    individualRecipients = [];
    individualSearchResults = [];
    renderIndividualSelected();
    document.getElementById('individualResults').innerHTML = '';
    renderClassSections();
}

function capitalizeTab(tab) {
    if (tab === 'birthday') return "Today's Birthday";
    return tab.charAt(0).toUpperCase() + tab.slice(1);
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
