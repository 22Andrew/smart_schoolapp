document.addEventListener('DOMContentLoaded', function () {
    let templates = [];
    let classes = [];
    let currentPage = 1;
    let pageSize = 50;
    let editingTemplateId = null;
    let activeRankTemplateId = null;

    const fileValues = {
        headerImage: '',
        leftSign: '',
        middleSign: '',
        rightSign: '',
        backgroundImage: ''
    };

    const templateTableBody = document.getElementById('templateTableBody');
    const templateShowingInfo = document.getElementById('templateShowingInfo');
    const templatePagination = document.getElementById('templatePagination');
    const templateSearchInput = document.getElementById('templateSearchInput');
    const templateEntriesSelect = document.getElementById('templateEntriesSelect');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(error) {
        Swal.fire({ icon: 'error', title: 'Error', text: (error && error.message) || 'Something went wrong.', confirmButtonColor: '#8b5cf6' });
    }

    function showSuccess(message) {
        Swal.fire({ icon: 'success', title: 'Success', text: message, confirmButtonColor: '#8b5cf6' });
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (!document.querySelector('.cbse-modal:not([hidden])')) {
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeModal(el.closest('.cbse-modal'));
        });
    });

    function createTemplateActionsHtml() {
        return ''
            + '<div class="template-action-grid">'
            + '<button type="button" class="btn-action btn-rank" title="Generate Rank"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>'
            + '<button type="button" class="btn-action btn-view" title="View"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>'
            + '<button type="button" class="btn-action btn-link-exam" title="Link Exam"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>'
            + '<button type="button" class="btn-action btn-edit" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></button>'
            + '<button type="button" class="btn-action btn-delete" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
            + '</div>';
    }

    function renderPagination(container, current, totalPages, onChange) {
        container.innerHTML = ''
            + '<button type="button" class="pagination-btn" data-page="' + (current - 1) + '" ' + (current <= 1 ? 'disabled' : '') + '>&lsaquo;</button>'
            + '<button type="button" class="pagination-btn active">' + current + '</button>'
            + '<button type="button" class="pagination-btn" data-page="' + (current + 1) + '" ' + (current >= totalPages ? 'disabled' : '') + '>&rsaquo;</button>';
        container.querySelectorAll('.pagination-btn[data-page]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const page = Number(btn.getAttribute('data-page'));
                if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
                    onChange(page);
                }
            });
        });
    }

    function renderTemplates() {
        const term = templateSearchInput ? templateSearchInput.value.toLowerCase().trim() : '';
        const filtered = templates.filter(function (item) {
            return !term || [item.templateName, item.classSections, item.templateDescription]
                .join(' ').toLowerCase().indexOf(term) !== -1;
        });
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;

        if (!total) {
            templateTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2.5rem;color:#94a3b8;">No templates found</td></tr>';
        } else {
            const start = (currentPage - 1) * pageSize;
            templateTableBody.innerHTML = filtered.slice(start, start + pageSize).map(function (item) {
                return '<tr data-id="' + item.id + '">'
                    + '<td>' + escapeHtml(item.templateName) + '</td>'
                    + '<td>' + escapeHtml(item.classSections || '') + '</td>'
                    + '<td>' + escapeHtml(item.templateDescription || '') + '</td>'
                    + '<td class="action-cell">' + createTemplateActionsHtml() + '</td>'
                    + '</tr>';
            }).join('');
        }

        const start = total ? (currentPage - 1) * pageSize + 1 : 0;
        const end = total ? Math.min(currentPage * pageSize, total) : 0;
        templateShowingInfo.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' entries';
        renderPagination(templatePagination, currentPage, totalPages, function (page) {
            currentPage = page;
            renderTemplates();
        });
    }

    function populateClassSelect(selectedId) {
        const select = document.getElementById('templateClassSelect');
        select.innerHTML = '<option value="">Select</option>' + classes.map(function (item) {
            const selected = selectedId != null && String(selectedId) === String(item.id) ? ' selected' : '';
            return '<option value="' + item.id + '" data-name="' + escapeHtml(item.name) + '"' + selected + '>' + escapeHtml(item.name) + '</option>';
        }).join('');
    }

    function populateSectionSelect(classId, selectedSections) {
        const select = document.getElementById('templateSectionSelect');
        const selectedClass = classes.find(function (item) { return String(item.id) === String(classId); });
        const sections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const selectedSet = new Set((selectedSections || []).map(String));
        select.innerHTML = sections.map(function (section) {
            const selected = selectedSet.has(String(section)) ? ' selected' : '';
            return '<option value="' + escapeHtml(section) + '"' + selected + '>' + escapeHtml(section) + '</option>';
        }).join('');
    }

    function getSelectedSections() {
        return Array.from(document.getElementById('templateSectionSelect').selectedOptions).map(function (opt) {
            return opt.value;
        });
    }

    function setMarksheetType(value) {
        document.querySelectorAll('input[name="marksheetType"]').forEach(function (radio) {
            radio.checked = radio.value === (value || 'portrait');
        });
    }

    function resetTemplateForm(item) {
        editingTemplateId = item ? item.id : null;
        document.getElementById('templateId').value = editingTemplateId || '';
        document.getElementById('templateFormModalTitle').textContent = item ? 'Edit Template' : 'Add Template';
        document.getElementById('templateName').value = item ? item.templateName || '' : '';
        document.getElementById('schoolName').value = item ? item.schoolName || '' : '';
        document.getElementById('examCenter').value = item ? item.examCenter || '' : '';
        document.getElementById('printingDate').value = item ? item.printingDate || '' : '';
        document.getElementById('footerText').value = item ? item.footerText || '' : '';
        document.getElementById('templateDescription').value = item ? item.templateDescription || '' : '';
        setMarksheetType(item ? item.marksheetType : 'portrait');
        populateClassSelect(item ? item.classId : null);
        populateSectionSelect(item ? item.classId : null, item ? item.sections : []);
        document.getElementById('showStudentName').checked = item ? !!item.showStudentName : true;
        document.getElementById('showFatherName').checked = item ? !!item.showFatherName : true;
        document.getElementById('showMotherName').checked = item ? !!item.showMotherName : true;
        document.getElementById('showAcademicSession').checked = item ? !!item.showAcademicSession : true;
        document.getElementById('showAdmissionNo').checked = item ? !!item.showAdmissionNo : true;
        document.getElementById('showRollNo').checked = item ? !!item.showRollNo : true;
        document.getElementById('showPhoto').checked = item ? !!item.showPhoto : true;
        document.getElementById('showClass').checked = item ? !!item.showClass : false;
        document.getElementById('showSection').checked = item ? !!item.showSection : false;
        document.getElementById('showDob').checked = item ? !!item.showDob : true;
        document.getElementById('showTeacherRemark').checked = item ? !!item.showTeacherRemark : true;
        document.getElementById('showSubjectNote').checked = item ? !!item.showSubjectNote : true;
        fileValues.headerImage = item ? item.headerImage || '' : '';
        fileValues.leftSign = item ? item.leftSign || '' : '';
        fileValues.middleSign = item ? item.middleSign || '' : '';
        fileValues.rightSign = item ? item.rightSign || '' : '';
        fileValues.backgroundImage = item ? item.backgroundImage || '' : '';
        ['headerImageName', 'leftSignName', 'middleSignName', 'rightSignName', 'backgroundImageName'].forEach(function (id, index) {
            const keys = ['headerImage', 'leftSign', 'middleSign', 'rightSign', 'backgroundImage'];
            const el = document.getElementById(id);
            if (el) el.textContent = fileValues[keys[index]] || '';
        });
    }

    function buildTemplatePayload() {
        const classSelect = document.getElementById('templateClassSelect');
        const selectedOption = classSelect.options[classSelect.selectedIndex];
        return {
            templateName: document.getElementById('templateName').value.trim(),
            classId: classSelect.value || null,
            className: selectedOption && selectedOption.dataset.name ? selectedOption.dataset.name : '',
            sections: getSelectedSections(),
            marksheetType: document.querySelector('input[name="marksheetType"]:checked')?.value || 'portrait',
            schoolName: document.getElementById('schoolName').value.trim(),
            examCenter: document.getElementById('examCenter').value.trim(),
            printingDate: document.getElementById('printingDate').value.trim(),
            headerImage: fileValues.headerImage,
            footerText: document.getElementById('footerText').value.trim(),
            leftSign: fileValues.leftSign,
            middleSign: fileValues.middleSign,
            rightSign: fileValues.rightSign,
            backgroundImage: fileValues.backgroundImage,
            templateDescription: document.getElementById('templateDescription').value.trim(),
            showStudentName: document.getElementById('showStudentName').checked,
            showFatherName: document.getElementById('showFatherName').checked,
            showMotherName: document.getElementById('showMotherName').checked,
            showAcademicSession: document.getElementById('showAcademicSession').checked,
            showAdmissionNo: document.getElementById('showAdmissionNo').checked,
            showRollNo: document.getElementById('showRollNo').checked,
            showPhoto: document.getElementById('showPhoto').checked,
            showClass: document.getElementById('showClass').checked,
            showSection: document.getElementById('showSection').checked,
            showDob: document.getElementById('showDob').checked,
            showTeacherRemark: document.getElementById('showTeacherRemark').checked,
            showSubjectNote: document.getElementById('showSubjectNote').checked
        };
    }

    function setupFileDropZones() {
        document.querySelectorAll('#templateFormModal .file-drop-zone').forEach(function (zone) {
            const target = zone.getAttribute('data-target');
            const input = zone.querySelector('input[type="file"]');
            const nameEl = document.getElementById(target + 'Name');
            zone.addEventListener('click', function () { if (input) input.click(); });
            zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('dragover'); });
            zone.addEventListener('dragleave', function () { zone.classList.remove('dragover'); });
            zone.addEventListener('drop', function (e) {
                e.preventDefault();
                zone.classList.remove('dragover');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    fileValues[target] = e.dataTransfer.files[0].name;
                    if (nameEl) nameEl.textContent = fileValues[target];
                }
            });
            if (input) {
                input.addEventListener('change', function () {
                    if (input.files && input.files[0]) {
                        fileValues[target] = input.files[0].name;
                        if (nameEl) nameEl.textContent = fileValues[target];
                    }
                });
            }
        });
    }

    function renderViewTemplate(data, templateName) {
        document.getElementById('viewTemplateModalTitle').textContent = templateName;
        const student = data.student || {};
        const summary = data.summary || {};
        const attendance = data.attendance || {};
        const subjects = data.subjects || [];

        let subjectRows = subjects.map(function (subject) {
            const values = subject.values || [];
            return '<tr><td style="text-align:left;">' + escapeHtml(subject.subjectName) + ' (' + escapeHtml(subject.subjectCode) + ')</td>'
                + values.map(function (v) { return '<td>' + escapeHtml(v) + '</td>'; }).join('')
                + '</tr>';
        }).join('');

        document.getElementById('viewTemplateContent').innerHTML = ''
            + '<div class="report-card-preview">'
            + '<div class="report-title">REPORT CARD</div>'
            + '<div class="report-session">Academic Session : ' + escapeHtml(data.academicSession || '2026-27') + '</div>'
            + '<div class="report-student-grid">'
            + '<div><p><strong>Admission No.</strong> : ' + escapeHtml(student.admissionNo) + '</p><p><strong>Student\'s Name</strong> : ' + escapeHtml(student.studentName) + '</p><p><strong>Father\'s Name</strong> : ' + escapeHtml(student.fatherName) + '</p><p><strong>School Name</strong> : ' + escapeHtml(data.schoolName) + '</p><p><strong>Exam Center</strong> : ' + escapeHtml(data.examCenter) + '</p></div>'
            + '<div><p><strong>Roll No.</strong> : ' + escapeHtml(student.rollNo) + '</p><p><strong>Date of Birth</strong> : ' + escapeHtml(student.dateOfBirth) + '</p><p><strong>Mother\'s Name</strong> : ' + escapeHtml(student.motherName) + '</p><p><strong>Result Declaration Date</strong> : ' + escapeHtml(student.resultDate) + '</p></div>'
            + '<div class="report-photo-box">👤</div></div>'
            + '<table class="report-marks-table"><thead><tr><th rowspan="2">Scholastic Areas<br>(Subject)</th><th colspan="4">T1</th><th colspan="4">T2</th><th colspan="2">T1+T2</th><th rowspan="2">Rank</th></tr>'
            + '<tr><th>PT-I(10)</th><th>MA(10)</th><th>HY(80)</th><th>Total(100)</th><th>PT-II(10)</th><th>MA-2(10)</th><th>Annual(80)</th><th>Total(100)</th><th>Marks(100%)</th><th>Grade</th></tr></thead><tbody>'
            + subjectRows
            + '<tr class="report-summary-row"><td colspan="9" style="text-align:right;">Overall Marks: ' + escapeHtml(summary.overallMarks) + '</td><td colspan="2">Percentage ' + escapeHtml(summary.percentage) + '</td><td>Grade: ' + escapeHtml(summary.grade) + '</td><td>Rank: ' + escapeHtml(summary.rank) + '</td></tr>'
            + '</tbody></table>'
            + '<table class="report-attendance-table"><thead><tr><th>Total Working Days</th><th>Days Present</th><th>Attendance Percentage</th></tr></thead><tbody><tr>'
            + '<td>' + escapeHtml(attendance.workingDays) + '</td><td>' + escapeHtml(attendance.daysPresent) + '</td><td>' + escapeHtml(attendance.percentage) + '</td>'
            + '</tr></tbody></table>'
            + '<p><strong>Class Teacher Remark :</strong> Class teacher remark here</p>'
            + '<p style="text-align:center;margin-top:1rem;"><strong>Instruction</strong><br>Grading Scale : A+ (100%-90%), A (89%-80%), B1 (79%-70%), B2 (69%-60%), C1 (59%-50%), C2 (49%-40%), D (39%-33%), E (32% & Below)</p>'
            + '</div>';
    }

    function renderLinkExamTable(data) {
        const tbody = document.getElementById('linkExamTableBody');
        const linkedExamId = data.linkedExamId != null ? String(data.linkedExamId) : '';
        document.getElementById('marksheetLinkType').value = data.marksheetLinkType || 'single_exam_without_term';
        let html = '';
        (data.terms || []).forEach(function (termGroup) {
            const exams = termGroup.exams || [];
            exams.forEach(function (exam, index) {
                html += '<tr>'
                    + (index === 0 ? '<td class="term-cell" rowspan="' + exams.length + '">' + escapeHtml(termGroup.termName) + '</td>' : '')
                    + '<td><label class="link-exam-option"><input type="radio" name="linkedExamId" value="' + exam.id + '"'
                    + (linkedExamId === String(exam.id) ? ' checked' : '') + '> ' + escapeHtml(exam.examName) + '</label></td>'
                    + '</tr>';
            });
        });
        tbody.innerHTML = html || '<tr><td colspan="2" style="text-align:center;padding:2rem;color:#94a3b8;">No exams found</td></tr>';
    }

    function renderRankTable(rows, rankGenerated) {
        document.getElementById('rankAlert').hidden = !rankGenerated;
        const tbody = document.getElementById('rankTableBody');
        if (!rows || !rows.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94a3b8;">No students found</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(function (row) {
            return '<tr>'
                + '<td>' + escapeHtml(row.admissionNo) + '</td>'
                + '<td><a href="#" class="student-link">' + escapeHtml(row.studentName) + '</a></td>'
                + '<td>' + escapeHtml(row.className) + '</td>'
                + '<td>' + escapeHtml(row.fatherName) + '</td>'
                + '<td>' + escapeHtml(row.dateOfBirth) + '</td>'
                + '<td>' + escapeHtml(row.gender) + '</td>'
                + '<td>' + escapeHtml(row.mobileNumber) + '</td>'
                + '<td>' + escapeHtml(row.rank == null ? '' : row.rank) + '</td>'
                + '</tr>';
        }).join('');
    }

    async function loadTemplates() {
        templates = await fetchJson('/api/cbse-exam-templates');
        renderTemplates();
    }

    document.getElementById('addTemplateBtn')?.addEventListener('click', function () {
        resetTemplateForm(null);
        openModal(document.getElementById('templateFormModal'));
    });

    document.getElementById('templateClassSelect').addEventListener('change', function () {
        populateSectionSelect(this.value, []);
    });

    document.getElementById('templateForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const payload = buildTemplatePayload();
        const url = editingTemplateId ? '/api/cbse-exam-templates/' + editingTemplateId : '/api/cbse-exam-templates';
        const method = editingTemplateId ? 'PUT' : 'POST';
        try {
            const response = await fetchJson(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showSuccess(response.message || 'Template saved successfully!');
            closeModal(document.getElementById('templateFormModal'));
            await loadTemplates();
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('linkExamForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const templateId = document.getElementById('linkTemplateId').value;
        const selected = document.querySelector('input[name="linkedExamId"]:checked');
        try {
            const response = await fetchJson('/api/cbse-exam-templates/' + templateId + '/link-exam', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marksheetLinkType: document.getElementById('marksheetLinkType').value,
                    linkedExamId: selected ? selected.value : null
                })
            });
            showSuccess(response.message || 'Exam linked successfully!');
            closeModal(document.getElementById('linkExamModal'));
        } catch (error) {
            showError(error);
        }
    });

    document.getElementById('generateRankBtn').addEventListener('click', async function () {
        if (!activeRankTemplateId) return;
        try {
            const response = await fetchJson('/api/cbse-exam-templates/' + activeRankTemplateId + '/generate-rank', { method: 'POST' });
            renderRankTable(response.rows || [], true);
            showSuccess(response.message || 'Rank generated successfully!');
            await loadTemplates();
        } catch (error) {
            showError(error);
        }
    });

    templateTableBody.addEventListener('click', async function (event) {
        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const item = templates.find(function (entry) { return String(entry.id) === String(id); });
        if (!item) return;

        if (event.target.closest('.btn-edit')) {
            try {
                const detail = await fetchJson('/api/cbse-exam-templates/' + id);
                resetTemplateForm(detail);
                openModal(document.getElementById('templateFormModal'));
            } catch (error) {
                showError(error);
            }
        } else if (event.target.closest('.btn-view')) {
            try {
                const preview = await fetchJson('/api/cbse-exam-templates/' + id + '/preview');
                renderViewTemplate(preview, item.templateName);
                openModal(document.getElementById('viewTemplateModal'));
            } catch (error) {
                showError(error);
            }
        } else if (event.target.closest('.btn-link-exam')) {
            try {
                const linkData = await fetchJson('/api/cbse-exam-templates/' + id + '/link-exam');
                document.getElementById('linkTemplateId').value = id;
                renderLinkExamTable(linkData);
                openModal(document.getElementById('linkExamModal'));
            } catch (error) {
                showError(error);
            }
        } else if (event.target.closest('.btn-rank')) {
            try {
                activeRankTemplateId = id;
                const rankData = await fetchJson('/api/cbse-exam-templates/' + id + '/ranks');
                document.getElementById('generateRankModalTitle').textContent = 'Generate Rank : ' + item.templateName;
                renderRankTable(rankData.rows || [], rankData.rankGenerated);
                openModal(document.getElementById('generateRankModal'));
            } catch (error) {
                showError(error);
            }
        } else if (event.target.closest('.btn-delete')) {
            const confirm = await Swal.fire({
                icon: 'warning',
                title: 'Delete template?',
                text: 'This action cannot be undone.',
                showCancelButton: true,
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!confirm.isConfirmed) return;
            try {
                const response = await fetchJson('/api/cbse-exam-templates/' + id, { method: 'DELETE' });
                showSuccess(response.message || 'Template deleted successfully!');
                await loadTemplates();
            } catch (error) {
                showError(error);
            }
        }
    });

    if (templateSearchInput) {
        templateSearchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTemplates();
        });
    }
    if (templateEntriesSelect) {
        templateEntriesSelect.addEventListener('change', function () {
            pageSize = Number(templateEntriesSelect.value) || 50;
            currentPage = 1;
            renderTemplates();
        });
    }

    setupFileDropZones();

    const templateTable = document.getElementById('templateTable');

    function getVisibleTemplateRows() {
        return Array.from(templateTableBody.querySelectorAll('tr')).filter(function (row) {
            return row.querySelector('td[colspan]') == null && row.style.display !== 'none';
        });
    }

    function getTemplateTableData() {
        const headers = [];
        const data = [];
        if (!templateTable) return { headers: headers, data: data };

        const headerCells = templateTable.querySelectorAll('thead th');
        headerCells.forEach(function (th, index) {
            if (index < headerCells.length - 1 && th.style.display !== 'none') {
                headers.push(th.textContent.trim());
            }
        });

        getVisibleTemplateRows().forEach(function (row) {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(function (cell, index) {
                if (index < cells.length - 1 && cell.style.display !== 'none') {
                    rowData.push(cell.textContent.trim().replace(/\s+/g, ' '));
                }
            });
            data.push(rowData);
        });
        return { headers: headers, data: data };
    }

    function exportToast(title, text) {
        Swal.fire({ icon: 'success', title: title, text: text, timer: 2000, showConfirmButton: false, confirmButtonColor: '#8b5cf6' });
    }

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const result = getTemplateTableData();
            let text = result.headers.join('\t') + '\n';
            result.data.forEach(function (row) { text += row.join('\t') + '\n'; });
            navigator.clipboard.writeText(text).then(function () {
                exportToast('Copied!', 'Table data copied to clipboard');
            });
        });
    }

    const excelBtn = document.getElementById('excelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', function () {
            const result = getTemplateTableData();
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([result.headers].concat(result.data));
            XLSX.utils.book_append_sheet(wb, ws, 'Templates');
            XLSX.writeFile(wb, 'Templates_' + new Date().toISOString().split('T')[0] + '.xlsx');
            exportToast('Exported!', 'Excel file downloaded successfully');
        });
    }

    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            const result = getTemplateTableData();
            let csvContent = result.headers.join(',') + '\n';
            result.data.forEach(function (row) {
                csvContent += row.map(function (cell) {
                    return (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1)
                        ? '"' + cell.replace(/"/g, '""') + '"' : cell;
                }).join(',') + '\n';
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
            link.download = 'Templates_' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
            exportToast('Exported!', 'CSV file downloaded successfully');
        });
    }

    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            const result = getTemplateTableData();
            const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
            doc.setFontSize(16);
            doc.text('Template List', 40, 40);
            doc.setFontSize(10);
            doc.text('Generated on: ' + new Date().toLocaleDateString(), 40, 58);
            doc.autoTable({
                head: [result.headers],
                body: result.data,
                startY: 70,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 4 }
            });
            doc.save('Templates_' + new Date().toISOString().split('T')[0] + '.pdf');
            exportToast('Exported!', 'PDF file downloaded successfully');
        });
    }

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            const result = getTemplateTableData();
            let html = '<!DOCTYPE html><html><head><title>Template List</title><style>'
                + 'body{font-family:Arial,sans-serif;margin:20px;}table{width:100%;border-collapse:collapse;}'
                + 'th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px;}'
                + 'th{background:#1e293b;color:#fff;}</style></head><body>'
                + '<h1>Template List</h1><p>Generated on: ' + new Date().toLocaleString() + '</p><table><thead><tr>';
            result.headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
            html += '</tr></thead><tbody>';
            result.data.forEach(function (row) {
                html += '<tr>' + row.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
            });
            html += '</tbody></table></body></html>';
            const printWindow = window.open('', '_blank');
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.focus(); printWindow.print(); };
        });
    }

    const columnVisibilityBtn = document.getElementById('columnVisibilityBtn');
    const columnVisibilityDropdown = document.getElementById('columnVisibilityDropdown');
    if (columnVisibilityBtn && columnVisibilityDropdown) {
        columnVisibilityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            columnVisibilityDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function (e) {
            if (!columnVisibilityDropdown.contains(e.target) && e.target !== columnVisibilityBtn && !columnVisibilityBtn.contains(e.target)) {
                columnVisibilityDropdown.classList.remove('active');
            }
        });
        document.querySelectorAll('.column-toggle').forEach(function (toggle) {
            toggle.addEventListener('change', function () {
                const columnIndex = parseInt(this.getAttribute('data-column'), 10);
                const isVisible = this.checked;
                const headerCells = templateTable.querySelectorAll('thead th');
                if (headerCells[columnIndex]) headerCells[columnIndex].style.display = isVisible ? '' : 'none';
                templateTable.querySelectorAll('tbody tr').forEach(function (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells[columnIndex]) cells[columnIndex].style.display = isVisible ? '' : 'none';
                });
            });
        });
    }

    Promise.all([
        fetchJson('/api/classes').then(function (data) { classes = data || []; }),
        loadTemplates()
    ]).catch(showError);
});
