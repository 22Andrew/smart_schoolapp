document.addEventListener('DOMContentLoaded', function () {
    const UI = window.StudentCvUI;
    const studentId = (window.location.pathname.match(/\/admin\/resume\/print\/(\d+)/) || [])[1];
    const root = document.getElementById('cvPrintRoot');

    if (!studentId) {
        root.innerHTML = '<p>Student not found.</p>';
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

    function block(title, inner) {
        if (!inner) return '';
        return '<section class="cv-print-section"><h3>' + UI.escapeHtml(title) + '</h3>' + inner + '</section>';
    }

    function itemCard(title, lines, details) {
        return '<div class="cv-print-item"><div class="cv-print-item-title">' + UI.escapeHtml(title) + '</div>'
            + (lines ? '<div class="cv-print-item-meta">' + UI.escapeHtml(lines) + '</div>' : '')
            + (details ? '<p>' + UI.escapeHtml(details) + '</p>' : '')
            + '</div>';
    }

    function render(resume) {
        const student = resume.student || {};
        const settings = resume.settings || {};
        const enabled = settings.enabledStudentFields || [];
        const src = photoSrc(student);
        const showPhoto = enabled.indexOf('photo') >= 0 && src;
        let details = '';
        (settings.studentFields || []).forEach(function (field) {
            if (field.key === 'photo' || enabled.indexOf(field.key) < 0) return;
            const value = fieldValue(student, field.key);
            if (!value) return;
            details += '<div class="cv-print-detail"><span>' + UI.escapeHtml(field.label) + '</span><strong>'
                + UI.escapeHtml(value) + '</strong></div>';
        });

        let work = '';
        if (settings.workExperienceEnabled !== false) {
            (resume.workExperiences || []).forEach(function (row) {
                const meta = [row.designation, row.years, row.location].filter(Boolean).join(' | ');
                work += itemCard(row.institution || 'Work Experience', meta, row.details);
            });
        }
        let education = '';
        if (settings.educationEnabled !== false) {
            (resume.educations || []).forEach(function (row) {
                const meta = [row.schoolName, row.year, row.marks].filter(Boolean).join(' | ');
                education += itemCard(row.qualification || 'Qualification', meta, row.details);
            });
        }
        let skills = '';
        if (settings.skillsEnabled !== false) {
            (resume.skills || []).forEach(function (row) {
                skills += itemCard(row.skillCategory || 'Skill', '', row.details);
            });
        }
        let references = '';
        if (settings.referencesEnabled !== false) {
            (resume.references || []).forEach(function (row) {
                const meta = [row.relation, row.contact, row.designation].filter(Boolean).join(' | ');
                references += itemCard(row.name || 'Reference', meta, row.details);
            });
        }
        let other = '';
        if (settings.otherDetailsEnabled !== false && (resume.designation || resume.about)) {
            other = (resume.designation ? '<p><strong>Designation:</strong> ' + UI.escapeHtml(resume.designation) + '</p>' : '')
                + (resume.about ? '<p>' + UI.escapeHtml(resume.about) + '</p>' : '');
        }

        root.innerHTML = '<div class="cv-print-header">'
            + '<div><div class="cv-print-school">' + UI.escapeHtml(resume.schoolName || 'Smart School') + '</div>'
            + '<h1>' + UI.escapeHtml(student.studentName || 'Student CV') + '</h1>'
            + (resume.designation ? '<div class="cv-print-role">' + UI.escapeHtml(resume.designation) + '</div>' : '')
            + '</div>'
            + (showPhoto ? '<img class="cv-print-photo" src="' + UI.escapeHtml(src) + '" alt="">' : '')
            + '</div>'
            + block('Personal Details', details ? '<div class="cv-print-details">' + details + '</div>' : '')
            + block('Work Experience', work)
            + block('Education / Qualification', education)
            + block('Technical Skills', skills)
            + block('References', references)
            + block('Other Details', other);
    }

    document.getElementById('cvPrintBtn').addEventListener('click', function () {
        window.print();
    });
    document.getElementById('cvCloseBtn').addEventListener('click', function () {
        window.close();
        window.location.href = '/admin/resume/download';
    });

    UI.fetchJson('/api/resume/student/' + studentId).then(function (resume) {
        document.title = (resume.student && resume.student.studentName ? resume.student.studentName + ' - ' : '') + 'Student CV';
        render(resume);
        setTimeout(function () { window.print(); }, 400);
    }).catch(function (err) {
        root.innerHTML = '<p>' + UI.escapeHtml(err.message) + '</p>';
    });
});
