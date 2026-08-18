document.addEventListener('DOMContentLoaded', function () {
    const UI = window.StudentCvUI;
    const studentId = (window.location.pathname.match(/\/admin\/resume\/fill\/(\d+)/) || [])[1];
    const profileCard = document.getElementById('cvProfileCard');
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    const removeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    if (!studentId) {
        UI.error('Student not found');
        return;
    }

    function fieldValue(student, key) {
        if (key === 'photo') return student.photoUrl || student.photoPath || '';
        const value = student[key];
        return value == null ? '' : String(value);
    }

    function photoSrc(student) {
        const path = student.photoUrl || student.photoPath || '';
        if (!path) return '';
        return path.charAt(0) === '/' ? path : '/' + path;
    }

    function input(name, label, value, type) {
        const tag = type === 'textarea'
            ? '<textarea name="' + name + '" class="form-control" rows="3">' + UI.escapeHtml(value) + '</textarea>'
            : '<input type="text" name="' + name + '" class="form-control" value="' + UI.escapeHtml(value) + '">';
        return '<div class="form-group' + (type === 'textarea' ? ' full' : '') + '"><label>' + label + '</label>' + tag + '</div>';
    }

    function rowActions() {
        return '<div class="cv-inline-actions">'
            + '<button type="button" class="btn-add-row btn-row-add" title="Add">' + plusIcon + '</button>'
            + '<button type="button" class="btn-remove-row" title="Remove">' + removeIcon + '</button>'
            + '</div>';
    }

    function workRow(item) {
        item = item || {};
        return '<div class="cv-repeat-row">'
            + input('institution', 'Institution', item.institution)
            + input('designation', 'Designation', item.designation)
            + input('years', 'Years', item.years)
            + input('location', 'Location', item.location)
            + input('details', 'Detail', item.details, 'textarea')
            + rowActions()
            + '</div>';
    }

    function educationRow(item) {
        item = item || {};
        return '<div class="cv-repeat-row">'
            + input('qualification', 'Course', item.qualification)
            + input('schoolName', 'School Name', item.schoolName)
            + input('year', 'Year of Passing', item.year)
            + input('marks', 'Marks / Grade', item.marks)
            + input('details', 'Detail', item.details, 'textarea')
            + rowActions()
            + '</div>';
    }

    function skillRow(item) {
        item = item || {};
        return '<div class="cv-repeat-row">'
            + input('skillCategory', 'Skill Category', item.skillCategory)
            + input('details', 'Details', item.details, 'textarea')
            + rowActions()
            + '</div>';
    }

    function referenceRow(item) {
        item = item || {};
        return '<div class="cv-repeat-row">'
            + input('name', 'Name', item.name)
            + input('relation', 'Relation', item.relation)
            + input('contact', 'Contact', item.contact)
            + input('designation', 'Designation', item.designation)
            + input('details', 'Detail', item.details, 'textarea')
            + rowActions()
            + '</div>';
    }

    function renderRows(containerId, items, builder) {
        const container = document.getElementById(containerId);
        const rows = items && items.length ? items : [{}];
        container.innerHTML = rows.map(builder).join('');
    }

    function collectItems(containerId) {
        return Array.from(document.getElementById(containerId).querySelectorAll('.cv-repeat-row')).map(function (row) {
            const item = {};
            row.querySelectorAll('input, textarea').forEach(function (field) {
                item[field.name] = field.value.trim();
            });
            return item;
        }).filter(function (item) {
            return Object.keys(item).some(function (key) { return item[key]; });
        });
    }

    function renderProfile(resume) {
        const student = resume.student || {};
        const settings = resume.settings || {};
        const enabled = settings.enabledStudentFields || [];
        const photoEnabled = enabled.indexOf('photo') >= 0;
        const src = photoSrc(student);
        let html = '';
        if (photoEnabled) {
            html += src
                ? '<img class="cv-photo" src="' + UI.escapeHtml(src) + '" alt="' + UI.escapeHtml(student.studentName) + '">'
                : '<div class="cv-photo cv-photo-placeholder">No Photo</div>';
        }
        html += '<h3 class="cv-profile-name">' + UI.escapeHtml(student.studentName || 'Student') + '</h3>';
        (settings.studentFields || []).forEach(function (field) {
            if (field.key === 'photo' || enabled.indexOf(field.key) < 0) return;
            html += '<div class="cv-profile-row"><strong>' + UI.escapeHtml(field.label) + '</strong><span>'
                + UI.escapeHtml(fieldValue(student, field.key) || '-') + '</span></div>';
        });
        profileCard.innerHTML = html;
    }

    function applyTabSettings(settings) {
        const visibility = {
            work: settings.workExperienceEnabled !== false,
            education: settings.educationEnabled !== false,
            skills: settings.skillsEnabled !== false,
            references: settings.referencesEnabled !== false,
            other: settings.otherDetailsEnabled !== false
        };
        let firstVisible = null;
        document.querySelectorAll('.cv-tab').forEach(function (tab) {
            const key = tab.getAttribute('data-tab');
            const visible = !!visibility[key];
            tab.style.display = visible ? '' : 'none';
            const panel = document.querySelector('.cv-tab-panel[data-panel="' + key + '"]');
            if (panel) panel.style.display = visible ? '' : 'none';
            if (visible && !firstVisible) firstVisible = tab;
        });
        const active = document.querySelector('.cv-tab.active');
        if (!active || active.style.display === 'none') {
            document.querySelectorAll('.cv-tab, .cv-tab-panel').forEach(function (el) { el.classList.remove('active'); });
            if (firstVisible) {
                firstVisible.classList.add('active');
                const panel = document.querySelector('.cv-tab-panel[data-panel="' + firstVisible.getAttribute('data-tab') + '"]');
                if (panel) {
                    panel.classList.add('active');
                    panel.style.display = '';
                }
            }
        }
    }

    function fillForms(resume) {
        renderRows('workRows', resume.workExperiences, workRow);
        renderRows('educationRows', resume.educations, educationRow);
        renderRows('skillRows', resume.skills, skillRow);
        renderRows('referenceRows', resume.references, referenceRow);
        document.getElementById('otherDesignation').value = resume.designation || '';
        document.getElementById('otherAbout').value = resume.about || '';
    }

    async function confirmRemove(row, container) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This additional field will be removed.',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#8b5cf6'
        });
        if (!result.isConfirmed) return;
        row.remove();
        if (!container.querySelector('.cv-repeat-row')) {
            if (container.id === 'workRows') container.insertAdjacentHTML('beforeend', workRow());
            if (container.id === 'educationRows') container.insertAdjacentHTML('beforeend', educationRow());
            if (container.id === 'skillRows') container.insertAdjacentHTML('beforeend', skillRow());
            if (container.id === 'referenceRows') container.insertAdjacentHTML('beforeend', referenceRow());
        }
    }

    document.getElementById('cvTabs').addEventListener('click', function (e) {
        const tab = e.target.closest('.cv-tab');
        if (!tab || tab.style.display === 'none') return;
        document.querySelectorAll('.cv-tab').forEach(function (item) { item.classList.remove('active'); });
        document.querySelectorAll('.cv-tab-panel').forEach(function (panel) { panel.classList.remove('active'); });
        tab.classList.add('active');
        const panel = document.querySelector('.cv-tab-panel[data-panel="' + tab.getAttribute('data-tab') + '"]');
        if (panel) panel.classList.add('active');
    });

    document.getElementById('addWorkBtn').addEventListener('click', function () {
        document.getElementById('workRows').insertAdjacentHTML('beforeend', workRow());
    });
    document.getElementById('addEducationBtn').addEventListener('click', function () {
        document.getElementById('educationRows').insertAdjacentHTML('beforeend', educationRow());
    });
    document.getElementById('addSkillBtn').addEventListener('click', function () {
        document.getElementById('skillRows').insertAdjacentHTML('beforeend', skillRow());
    });
    document.getElementById('addReferenceBtn').addEventListener('click', function () {
        document.getElementById('referenceRows').insertAdjacentHTML('beforeend', referenceRow());
    });

    document.querySelector('.cv-resume-card').addEventListener('click', function (e) {
        const addBtn = e.target.closest('.btn-row-add');
        const removeBtn = e.target.closest('.btn-remove-row');
        if (addBtn) {
            const row = addBtn.closest('.cv-repeat-row');
            const container = row.parentElement;
            if (container.id === 'workRows') row.insertAdjacentHTML('afterend', workRow());
            if (container.id === 'educationRows') row.insertAdjacentHTML('afterend', educationRow());
            if (container.id === 'skillRows') row.insertAdjacentHTML('afterend', skillRow());
            if (container.id === 'referenceRows') row.insertAdjacentHTML('afterend', referenceRow());
        }
        if (removeBtn) {
            const row = removeBtn.closest('.cv-repeat-row');
            confirmRemove(row, row.parentElement);
        }
    });

    async function saveSection(url, payload) {
        try {
            const data = await UI.fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            UI.toast(data.message);
            if (data.data) {
                renderProfile(data.data);
                applyTabSettings(data.data.settings || {});
            }
        } catch (err) {
            UI.error(err.message);
        }
    }

    document.getElementById('workForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSection('/api/resume/student/' + studentId + '/work', { items: collectItems('workRows') });
    });
    document.getElementById('educationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSection('/api/resume/student/' + studentId + '/education', { items: collectItems('educationRows') });
    });
    document.getElementById('skillsForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSection('/api/resume/student/' + studentId + '/skills', { items: collectItems('skillRows') });
    });
    document.getElementById('referencesForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSection('/api/resume/student/' + studentId + '/references', { items: collectItems('referenceRows') });
    });
    document.getElementById('otherForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSection('/api/resume/student/' + studentId + '/other', {
            designation: document.getElementById('otherDesignation').value,
            about: document.getElementById('otherAbout').value
        });
    });

    UI.fetchJson('/api/resume/student/' + studentId).then(function (resume) {
        renderProfile(resume);
        applyTabSettings(resume.settings || {});
        fillForms(resume);
    }).catch(function (err) {
        UI.error(err.message);
    });
});
