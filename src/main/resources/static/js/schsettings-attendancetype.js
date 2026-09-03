document.addEventListener('DOMContentLoaded', function () {
    setupAttendanceTypePage();
    loadAttendanceTypeSettings();
});

let currentAudience = 'staff';
let selectedStudentClassId = null;
let settingsCache = null;

const STAFF_RULE_LABELS = {
    P: 'Present (P)',
    L: 'Late (L)',
    F: 'Half Day (F)',
    SH: 'Half Day (Second Half) (SH)'
};

const STUDENT_RULE_LABELS = {
    P: 'Present (P)',
    L: 'Late (L)',
    F: 'Half Day (F)'
};

function setupAttendanceTypePage() {
    document.getElementById('attendanceGeneralForm')?.addEventListener('submit', saveGeneralSettings);
    document.getElementById('attendanceClassTimesForm')?.addEventListener('submit', saveClassTimes);
    document.getElementById('copyFirstDetailForAll')?.addEventListener('change', handleCopyFirstDetail);
    document.getElementById('studentClassSelect')?.addEventListener('change', function () {
        selectedStudentClassId = this.value || null;
        renderStudentAttendanceRules();
    });

    document.querySelectorAll('.attendance-rules-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            currentAudience = tab.dataset.audience || 'staff';
            document.querySelectorAll('.attendance-rules-tab').forEach(function (item) {
                item.classList.toggle('active', item === tab);
            });
            updateRulesHeader();
            renderAttendanceRules();
        });
    });
}

function updateRulesHeader() {
    const title = document.getElementById('attendanceRulesTitle');
    const classSelect = document.getElementById('studentClassSelect');
    if (!title || !classSelect) return;

    if (currentAudience === 'staff') {
        title.textContent = 'Staff Attendance Setting';
        classSelect.hidden = true;
    } else {
        title.textContent = 'Student Attendance Setting';
        classSelect.hidden = false;
        populateStudentClassSelect();
    }
}

function populateStudentClassSelect() {
    const classSelect = document.getElementById('studentClassSelect');
    if (!classSelect || !settingsCache) return;

    const classes = (settingsCache.studentRules && settingsCache.studentRules.classes) || [];
    const current = selectedStudentClassId || (classes[0] ? String(classes[0].classId) : '');

    classSelect.innerHTML = classes.map(function (classRow) {
        return '<option value="' + escapeHtml(classRow.classId) + '">' + escapeHtml(classRow.className) + '</option>';
    }).join('');

    if (current) {
        classSelect.value = current;
        selectedStudentClassId = current;
    }
}

async function loadAttendanceTypeSettings() {
    try {
        const response = await fetch('/api/schsettings/attendance-type');
        if (!response.ok) throw new Error('Failed to load attendance type settings');
        settingsCache = await response.json();
        populateGeneralSettings(settingsCache.general || {});
        renderClassTimes(settingsCache.classTimes || []);
        updateRulesHeader();
        renderAttendanceRules();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load attendance type settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function populateGeneralSettings(data) {
    const mode = data.attendanceMode || 'day_wise';
    document.querySelectorAll('input[name="attendanceMode"]').forEach(function (input) {
        input.checked = input.value === mode;
    });
    setChecked('qrBarcodeBiometricEnabled', data.qrBarcodeBiometricEnabled);
    setValue('attendanceDevices', data.devices);
    setValue('lowAttendanceLimit', data.lowAttendanceLimit != null ? data.lowAttendanceLimit : '75.00');
}

function renderClassTimes(classTimes) {
    const container = document.getElementById('classAttendanceTimesContainer');
    if (!container) return;

    const grouped = {};
    (classTimes || []).forEach(function (row) {
        const key = String(row.classId);
        if (!grouped[key]) {
            grouped[key] = {
                classId: row.classId,
                className: row.className || ('Class ' + row.classId),
                sections: []
            };
        }
        grouped[key].sections.push(row);
    });

    const classList = Object.values(grouped);
    if (!classList.length) {
        container.innerHTML = '<p class="attendance-type-empty">No classes found. Add classes first to configure attendance times.</p>';
        return;
    }

    container.innerHTML = classList.map(function (classRow) {
        const sectionsHtml = classRow.sections.map(function (sectionRow) {
            return ''
                + '<div class="class-attendance-section-item">'
                + '<span class="class-attendance-section-label">' + escapeHtml(sectionRow.section) + '</span>'
                + '<input type="time" class="form-control class-attendance-time-input"'
                + ' data-class-id="' + escapeHtml(sectionRow.classId) + '"'
                + ' data-section="' + escapeHtml(sectionRow.section) + '"'
                + ' value="' + escapeHtml(toTimeInputValue(sectionRow.submitTime)) + '"'
                + ' placeholder="Enter time">'
                + '</div>';
        }).join('');

        return ''
            + '<div class="class-attendance-row">'
            + '<div class="class-attendance-class-name">' + escapeHtml(classRow.className) + '</div>'
            + '<div class="class-attendance-sections">' + sectionsHtml + '</div>'
            + '</div>';
    }).join('');
}

function renderAttendanceRules() {
    if (currentAudience === 'student') {
        renderStudentAttendanceRules();
        return;
    }
    renderStaffAttendanceRules();
}

function renderStaffAttendanceRules() {
    const container = document.getElementById('attendanceRulesContainer');
    if (!container || !settingsCache) return;

    const rulesMap = settingsCache.staffRules || {};
    const roles = Object.keys(rulesMap);
    if (!roles.length) {
        container.innerHTML = '<p class="attendance-type-empty">No attendance rules configured.</p>';
        return;
    }

    container.innerHTML = roles.map(function (role) {
        return renderRolePanel(role, rulesMap[role] || [], STAFF_RULE_LABELS, 'staff');
    }).join('');

    bindStaffUpdateButtons();
}

function renderStudentAttendanceRules() {
    const container = document.getElementById('attendanceRulesContainer');
    if (!container || !settingsCache) return;

    const classes = (settingsCache.studentRules && settingsCache.studentRules.classes) || [];
    if (!classes.length) {
        container.innerHTML = '<p class="attendance-type-empty">No classes found. Add classes first to configure student attendance rules.</p>';
        return;
    }

    const selectedClass = classes.find(function (classRow) {
        return String(classRow.classId) === String(selectedStudentClassId);
    }) || classes[0];

    selectedStudentClassId = String(selectedClass.classId);
    const classSelect = document.getElementById('studentClassSelect');
    if (classSelect) {
        classSelect.value = selectedStudentClassId;
    }

    const sections = selectedClass.sections || {};
    const sectionNames = Object.keys(sections);
    if (!sectionNames.length) {
        container.innerHTML = '<p class="attendance-type-empty">No sections found for the selected class.</p>';
        return;
    }

    const sectionsHtml = sectionNames.map(function (sectionName) {
        const rules = sections[sectionName] || [];
        const rowsHtml = rules.map(function (rule, index) {
            const label = STUDENT_RULE_LABELS[rule.ruleType] || rule.ruleType;
            return ''
                + '<tr>'
                + '<td>' + escapeHtml(label) + '</td>'
                + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
                + ' data-field="entryFrom" data-section="' + escapeHtml(sectionName) + '" data-index="' + index + '"'
                + ' value="' + escapeHtml(toTimeInputValue(rule.entryFrom, true)) + '"></td>'
                + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
                + ' data-field="entryUpto" data-section="' + escapeHtml(sectionName) + '" data-index="' + index + '"'
                + ' value="' + escapeHtml(toTimeInputValue(rule.entryUpto, true)) + '"></td>'
                + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
                + ' data-field="totalHour" data-section="' + escapeHtml(sectionName) + '" data-index="' + index + '"'
                + ' value="' + escapeHtml(toTimeInputValue(rule.totalHour, true)) + '"></td>'
                + '</tr>';
        }).join('');

        return ''
            + '<div class="student-attendance-section-block" data-section="' + escapeHtml(sectionName) + '">'
            + '<h4 class="student-attendance-section-title">Section: ' + escapeHtml(sectionName) + '</h4>'
            + '<div class="attendance-role-table-wrap">'
            + '<table class="attendance-role-table">'
            + '<thead><tr>'
            + '<th>Attendance Type</th>'
            + '<th>Entry From (hh:mm:ss)</th>'
            + '<th>Entry Upto (hh:mm:ss)</th>'
            + '<th>Total Hour</th>'
            + '</tr></thead>'
            + '<tbody>' + rowsHtml + '</tbody>'
            + '</table>'
            + '</div>'
            + '</div>';
    }).join('');

    container.innerHTML = ''
        + '<div class="student-attendance-class-panel" data-class-id="' + escapeHtml(selectedClass.classId) + '">'
        + '<div class="student-attendance-class-header">'
        + '<h3 class="student-attendance-class-title">Class: ' + escapeHtml(selectedClass.className) + '</h3>'
        + '<button type="button" class="btn-schsettings-save student-class-update-btn">Update</button>'
        + '</div>'
        + '<div class="student-attendance-sections-wrap">' + sectionsHtml + '</div>'
        + '</div>';

    container.querySelector('.student-class-update-btn')?.addEventListener('click', saveStudentClassRules);
}

function renderRolePanel(role, rules, labels, audience) {
    const rowsHtml = rules.map(function (rule, index) {
        const label = labels[rule.ruleType] || rule.ruleType;
        return ''
            + '<tr>'
            + '<td>' + escapeHtml(label) + '</td>'
            + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
            + ' data-field="entryFrom" data-role="' + escapeHtml(role) + '" data-index="' + index + '"'
            + ' value="' + escapeHtml(toTimeInputValue(rule.entryFrom, true)) + '"></td>'
            + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
            + ' data-field="entryUpto" data-role="' + escapeHtml(role) + '" data-index="' + index + '"'
            + ' value="' + escapeHtml(toTimeInputValue(rule.entryUpto, true)) + '"></td>'
            + '<td><input type="time" step="1" class="form-control attendance-rule-input"'
            + ' data-field="totalHour" data-role="' + escapeHtml(role) + '" data-index="' + index + '"'
            + ' value="' + escapeHtml(toTimeInputValue(rule.totalHour, true)) + '"></td>'
            + '</tr>';
    }).join('');

    return ''
        + '<div class="attendance-role-panel" data-role="' + escapeHtml(role) + '" data-audience="' + audience + '">'
        + '<div class="attendance-role-header">'
        + '<h3 class="attendance-role-title">' + escapeHtml(role) + '</h3>'
        + '<button type="button" class="btn-schsettings-save attendance-role-update-btn" data-role="' + escapeHtml(role) + '">Update</button>'
        + '</div>'
        + '<div class="attendance-role-table-wrap">'
        + '<table class="attendance-role-table">'
        + '<thead><tr>'
        + '<th>Attendance Type</th>'
        + '<th>Entry From (HH:mm:ss)</th>'
        + '<th>Entry Upto (HH:mm:ss)</th>'
        + '<th>Total Hour</th>'
        + '</tr></thead>'
        + '<tbody>' + rowsHtml + '</tbody>'
        + '</table>'
        + '</div>'
        + '</div>';
}

function bindStaffUpdateButtons() {
    document.querySelectorAll('.attendance-role-update-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            saveStaffRoleRules(button.dataset.role);
        });
    });
}

function handleCopyFirstDetail() {
    const checkbox = document.getElementById('copyFirstDetailForAll');
    if (!checkbox || !checkbox.checked) return;

    const inputs = Array.from(document.querySelectorAll('.class-attendance-time-input'));
    if (!inputs.length) return;
    const firstValue = inputs[0].value;
    inputs.forEach(function (input) {
        input.value = firstValue;
    });
}

async function saveGeneralSettings(event) {
    event.preventDefault();
    const selectedMode = document.querySelector('input[name="attendanceMode"]:checked');
    const payload = {
        attendanceMode: selectedMode ? selectedMode.value : 'day_wise',
        qrBarcodeBiometricEnabled: getChecked('qrBarcodeBiometricEnabled'),
        devices: getValue('attendanceDevices'),
        lowAttendanceLimit: getValue('lowAttendanceLimit')
    };

    await saveRequest('/api/schsettings/attendance-type/general', payload, 'Attendance type settings saved successfully!');
}

async function saveClassTimes(event) {
    event.preventDefault();
    const classTimes = Array.from(document.querySelectorAll('.class-attendance-time-input')).map(function (input) {
        return {
            classId: input.dataset.classId,
            section: input.dataset.section,
            submitTime: fromTimeInputValue(input.value)
        };
    });

    const result = await saveRequest('/api/schsettings/attendance-type/class-times', { classTimes: classTimes }, 'Class attendance times saved successfully!');
    if (result && result.data) {
        settingsCache.classTimes = result.data;
        renderClassTimes(result.data);
    }
}

async function saveStaffRoleRules(role) {
    const panel = document.querySelector('.attendance-role-panel[data-role="' + cssEscape(role) + '"]');
    if (!panel) return;

    const baseRules = ((settingsCache.staffRules || {})[role] || []).map(function (rule) {
        return Object.assign({}, rule);
    });

    panel.querySelectorAll('.attendance-rule-input').forEach(function (input) {
        const index = Number(input.dataset.index);
        const field = input.dataset.field;
        if (!baseRules[index] || !field) return;
        baseRules[index][field] = fromTimeInputValue(input.value, true);
    });

    const payload = {
        audience: 'staff',
        roleName: role,
        rules: baseRules
    };

    const result = await saveRequest('/api/schsettings/attendance-type/rules', payload, 'Attendance rules saved successfully!');
    if (result && result.data) {
        settingsCache.staffRules = result.data;
        renderStaffAttendanceRules();
    }
}

async function saveStudentClassRules() {
    const panel = document.querySelector('.student-attendance-class-panel');
    if (!panel) return;

    const classId = panel.dataset.classId;
    const classes = (settingsCache.studentRules && settingsCache.studentRules.classes) || [];
    const classRow = classes.find(function (item) {
        return String(item.classId) === String(classId);
    });
    if (!classRow) return;

    const sections = {};
    panel.querySelectorAll('.student-attendance-section-block').forEach(function (sectionBlock) {
        const sectionName = sectionBlock.dataset.section;
        const baseRules = ((classRow.sections || {})[sectionName] || []).map(function (rule) {
            return Object.assign({}, rule);
        });

        sectionBlock.querySelectorAll('.attendance-rule-input').forEach(function (input) {
            const index = Number(input.dataset.index);
            const field = input.dataset.field;
            if (!baseRules[index] || !field) return;
            baseRules[index][field] = fromTimeInputValue(input.value, true);
        });

        sections[sectionName] = baseRules;
    });

    const result = await saveRequest('/api/schsettings/attendance-type/student-rules', {
        classId: classId,
        sections: sections
    }, 'Student attendance rules saved successfully!');

    if (result && result.data) {
        settingsCache.studentRules = result.data;
        renderStudentAttendanceRules();
    }
}

async function saveRequest(url, payload, successMessage) {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to save settings');
        }
        Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: result.message || successMessage,
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
        });
        return result;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save settings',
            confirmButtonColor: '#ef4444'
        });
        return null;
    }
}

function toTimeInputValue(value, withSeconds) {
    if (!value) return '';
    const parts = String(value).split(':');
    if (withSeconds) {
        if (parts.length === 3) return value;
        if (parts.length === 2) return parts[0] + ':' + parts[1] + ':00';
    }
    if (parts.length >= 2) return parts[0] + ':' + parts[1];
    return value;
}

function fromTimeInputValue(value, withSeconds) {
    if (!value) return '';
    if (withSeconds) {
        const parts = value.split(':');
        if (parts.length === 2) return value + ':00';
    }
    return value;
}

function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}

function setChecked(id, value) {
    const field = document.getElementById(id);
    if (field) field.checked = !!value;
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value ?? '';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function cssEscape(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
