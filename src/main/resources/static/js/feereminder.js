document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('feeReminderTableBody');
    const saveBtn = document.getElementById('saveBtn');
    let reminders = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function typeLabel(type) {
        return type === 'AFTER' ? 'After' : 'Before';
    }

    function renderReminders() {
        if (!reminders.length) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">No reminder settings found</td></tr>';
            return;
        }

        tableBody.innerHTML = reminders.map(function (item, index) {
            return '<tr data-index="' + index + '">'
                + '<td><label class="active-label">'
                + '<input type="checkbox" class="active-checkbox"' + (item.active ? ' checked' : '') + '>'
                + '<span>Active</span></label></td>'
                + '<td class="reminder-type">' + escapeHtml(typeLabel(item.reminderType)) + '</td>'
                + '<td><input type="number" min="0" step="1" class="days-input" value="'
                + escapeHtml(item.days == null ? '' : String(item.days)) + '"></td>'
                + '</tr>';
        }).join('');
    }

    function collectFromDom() {
        return Array.from(tableBody.querySelectorAll('tr[data-index]')).map(function (row, index) {
            const source = reminders[index] || {};
            const checkbox = row.querySelector('.active-checkbox');
            const daysInput = row.querySelector('.days-input');
            return {
                id: source.id || null,
                active: !!(checkbox && checkbox.checked),
                reminderType: source.reminderType || 'BEFORE',
                days: daysInput ? daysInput.value : ''
            };
        });
    }

    async function parseErrorMessage(response) {
        try {
            const data = await response.json();
            return data.message || 'Request failed';
        } catch (e) {
            return 'Request failed';
        }
    }

    async function loadReminders() {
        try {
            const response = await fetch('/api/fee-reminders');
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            reminders = await response.json();
            renderReminders();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load fees reminder settings.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    async function saveReminders() {
        const items = collectFromDom();
        for (let i = 0; i < items.length; i++) {
            if (items[i].days === '' || Number(items[i].days) < 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required',
                    text: 'Please enter valid days for all reminder rows.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
        }

        try {
            const response = await fetch('/api/fee-reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: items })
            });
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            reminders = await response.json();
            renderReminders();
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Fees reminder settings saved.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save fees reminder settings.',
                confirmButtonColor: '#8b5cf6'
            });
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveReminders);
    }

    loadReminders();
});
