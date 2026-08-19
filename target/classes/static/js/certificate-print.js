document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('certificatePrintRoot');
    const id = location.pathname.split('/').pop();

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function row(label, value) {
        return '<tr><th>' + escapeHtml(label) + '</th><td>' + escapeHtml(value || '-') + '</td></tr>';
    }

    function barcode(value) {
        return '<div class="id-barcode">' + escapeHtml(value || '') + '</div>';
    }

    fetch('/api/certificates/print/' + id).then(function (r) { return r.json(); }).then(function (data) {
        const student = data.student || {};
        const staff = data.staff || {};
        const template = data.template || {};
        const school = escapeHtml(data.schoolName);
        if (data.issueType === 'TRANSFER') {
            root.innerHTML = '<article class="tc-sheet">'
                + '<header class="tc-header"><h1>' + school + '</h1><p>' + escapeHtml(data.schoolAddress) + '</p><p>Phone: ' + escapeHtml(data.schoolPhone) + ' | Email: ' + escapeHtml(data.schoolEmail) + '</p><h2>Transfer Certificate</h2><p>TC No. ' + escapeHtml(data.documentNumber) + '</p></header>'
                + '<table class="tc-table">'
                + row('Admission No', student.admissionNo)
                + row('Student Name', student.studentName)
                + row('Father Name', student.fatherName)
                + row('Mother Name', student.motherName)
                + row('Date of Birth', student.dateOfBirth)
                + row('Gender', student.gender)
                + row('Category', student.categoryName)
                + row('Religion', student.religion)
                + row('Class last studied', data.lastClass || student.classLabel)
                + row('Date of Admission', student.admissionDate)
                + row('Date of Leaving', data.leavingDate)
                + row('Qualified for promotion', data.qualified)
                + row('Whether all dues paid', data.duesPaid)
                + row('Conduct', data.conduct)
                + row('Reason for leaving', data.reason)
                + row('Remarks', data.remarks)
                + row('Date of Issue', data.issueDate)
                + '</table>'
                + '<div class="tc-signs"><span>Class Teacher</span><span>Checked By</span><span>Principal</span></div></article>';
        } else if (data.issueType === 'CERTIFICATE') {
            const photo = template.studentPhoto && student.photoUrl ? '<img class="cert-photo" src="' + escapeHtml(student.photoUrl) + '" alt="Student">' : '';
            root.innerHTML = '<article class="student-cert-sheet" style="' + (template.backgroundImageUrl ? 'background-image:url(' + template.backgroundImageUrl + ')' : '') + '">'
                + '<div class="cert-head" style="min-height:' + (template.headerHeight || 80) + 'px"><span>' + escapeHtml(template.headerLeftText) + '</span><strong>' + escapeHtml(template.headerCenterText || template.certificateName) + '</strong><span>' + escapeHtml(template.headerRightText) + '</span></div>'
                + '<div class="cert-body" style="min-height:' + (template.bodyHeight || 420) + 'px;max-width:' + (template.bodyWidth || 800) + 'px">' + photo + '<p>' + escapeHtml(template.renderedBody) + '</p></div>'
                + '<div class="cert-foot" style="min-height:' + (template.footerHeight || 70) + 'px"><span>' + escapeHtml(template.footerLeftText) + '</span><span>' + escapeHtml(template.footerCenterText) + '</span><span>' + escapeHtml(template.footerRightText) + '</span></div></article>';
        } else if (data.issueType === 'STUDENT_ID') {
            const color = template.headerColor || '#8b5cf6';
            root.innerHTML = '<article class="id-card" style="border-color:' + color + '">'
                + '<div class="id-card-head" style="background:' + color + '">' + (template.logoUrl ? '<img src="' + escapeHtml(template.logoUrl) + '" alt="Logo">' : '') + '<div><h2>' + escapeHtml(template.schoolName || school) + '</h2><p>' + escapeHtml(template.schoolAddress) + '</p><strong>' + escapeHtml(template.idCardTitle) + '</strong></div></div>'
                + '<div class="id-card-body">' + (student.photoUrl ? '<img class="id-photo" src="' + escapeHtml(student.photoUrl) + '" alt="Student">' : '<div class="id-photo placeholder">Photo</div>')
                + '<dl>'
                + (template.showStudentName ? '<div><dt>Name</dt><dd>' + escapeHtml(student.studentName) + '</dd></div>' : '')
                + (template.showAdmissionNo ? '<div><dt>Admission No</dt><dd>' + escapeHtml(student.admissionNo) + '</dd></div>' : '')
                + (template.showClass ? '<div><dt>Class</dt><dd>' + escapeHtml(student.classLabel) + '</dd></div>' : '')
                + (template.showRollNo ? '<div><dt>Roll No</dt><dd>' + escapeHtml(student.rollNumber) + '</dd></div>' : '')
                + (template.showFatherName ? '<div><dt>Father</dt><dd>' + escapeHtml(student.fatherName) + '</dd></div>' : '')
                + (template.showMotherName ? '<div><dt>Mother</dt><dd>' + escapeHtml(student.motherName) + '</dd></div>' : '')
                + (template.showDob ? '<div><dt>DOB</dt><dd>' + escapeHtml(student.dateOfBirth) + '</dd></div>' : '')
                + (template.showBloodGroup ? '<div><dt>Blood Group</dt><dd>' + escapeHtml(student.bloodGroup) + '</dd></div>' : '')
                + (template.showPhone ? '<div><dt>Phone</dt><dd>' + escapeHtml(student.mobileNumber) + '</dd></div>' : '')
                + (template.showAddress ? '<div><dt>Address</dt><dd>' + escapeHtml(student.currentAddress) + '</dd></div>' : '')
                + (template.showHouse ? '<div><dt>House</dt><dd>' + escapeHtml(student.houseName) + '</dd></div>' : '')
                + '</dl></div>'
                + (template.showBarcode ? barcode(student.admissionNo) : '')
                + (template.signatureUrl ? '<img class="id-sign" src="' + escapeHtml(template.signatureUrl) + '" alt="Sign">' : '')
                + '</article>';
        } else {
            const color = template.headerColor || '#8b5cf6';
            root.innerHTML = '<article class="id-card" style="border-color:' + color + '">'
                + '<div class="id-card-head" style="background:' + color + '">' + (template.logoUrl ? '<img src="' + escapeHtml(template.logoUrl) + '" alt="Logo">' : '') + '<div><h2>' + escapeHtml(template.schoolName || school) + '</h2><p>' + escapeHtml(template.schoolAddress) + '</p><strong>' + escapeHtml(template.idCardTitle) + '</strong></div></div>'
                + '<div class="id-card-body">' + (staff.photoPath ? '<img class="id-photo" src="' + escapeHtml(staff.photoPath) + '" alt="Staff">' : '<div class="id-photo placeholder">Photo</div>')
                + '<dl>'
                + (template.showStaffName ? '<div><dt>Name</dt><dd>' + escapeHtml(staff.fullName) + '</dd></div>' : '')
                + (template.showStaffId ? '<div><dt>Staff ID</dt><dd>' + escapeHtml(staff.staffId) + '</dd></div>' : '')
                + (template.showDesignation ? '<div><dt>Designation</dt><dd>' + escapeHtml(staff.designation) + '</dd></div>' : '')
                + (template.showDepartment ? '<div><dt>Department</dt><dd>' + escapeHtml(staff.department) + '</dd></div>' : '')
                + (template.showFatherName ? '<div><dt>Father</dt><dd>' + escapeHtml(staff.fatherName) + '</dd></div>' : '')
                + (template.showMotherName ? '<div><dt>Mother</dt><dd>' + escapeHtml(staff.motherName) + '</dd></div>' : '')
                + (template.showDateOfJoining ? '<div><dt>Date Of Joining</dt><dd>' + escapeHtml(staff.dateOfJoining) + '</dd></div>' : '')
                + (template.showDob ? '<div><dt>DOB</dt><dd>' + escapeHtml(staff.dateOfBirth) + '</dd></div>' : '')
                + (template.showPhone ? '<div><dt>Phone</dt><dd>' + escapeHtml(staff.phone) + '</dd></div>' : '')
                + (template.showAddress ? '<div><dt>Address</dt><dd>' + escapeHtml(staff.address) + '</dd></div>' : '')
                + '</dl></div>'
                + (template.showBarcode ? barcode(staff.staffId) : '')
                + (template.signatureUrl ? '<img class="id-sign" src="' + escapeHtml(template.signatureUrl) + '" alt="Sign">' : '')
                + '</article>';
        }
    }).catch(function () {
        root.innerHTML = '<p class="empty-message">Unable to load certificate.</p>';
    });

    document.getElementById('certificatePrintBtn').addEventListener('click', function () { window.print(); });
});
