(function () {
    'use strict';

    const directoryView = document.getElementById('staffDirectoryView');
    const addView = document.getElementById('staffAddView');
    const addStaffBtn = document.getElementById('addStaffBtn');
    const backToDirectoryBtn = document.getElementById('backToDirectoryBtn');
    const roleFilter = document.getElementById('roleFilter');
    const keywordFilter = document.getElementById('keywordFilter');
    const roleSearchBtn = document.getElementById('roleSearchBtn');
    const keywordSearchBtn = document.getElementById('keywordSearchBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const staffCardGrid = document.getElementById('staffCardGrid');
    const staffListWrap = document.getElementById('staffListWrap');
    const staffListBody = document.getElementById('staffListBody');
    const staffNoRecord = document.getElementById('staffNoRecord');
    const staffForm = document.getElementById('staffForm');
    const staffPhoto = document.getElementById('staffPhoto');
    const staffPhotoLabel = document.getElementById('staffPhotoLabel');
    const staffMoreDetailsToggle = document.getElementById('staffMoreDetailsToggle');
    const staffMoreDetailsPanel = document.getElementById('staffMoreDetailsPanel');
    const staffMoreDetailsIcon = document.getElementById('staffMoreDetailsIcon');

    const documentFields = [
        { inputId: 'resumeFile', labelId: 'resumeFileLabel', formKey: 'resume' },
        { inputId: 'joiningLetterFile', labelId: 'joiningLetterFileLabel', formKey: 'joiningLetter' },
        { inputId: 'resignationLetterFile', labelId: 'resignationLetterFileLabel', formKey: 'resignationLetter' },
        { inputId: 'otherDocumentFile', labelId: 'otherDocumentFileLabel', formKey: 'otherDocument' }
    ];

    let currentView = 'card';
    let staffRecords = [];
    let formOptions = {};
    let activeProfileStaff = null;

    const staffProfileModal = document.getElementById('staffProfileModal');
    const staffProfileOverlay = document.getElementById('staffProfileOverlay');
    const staffProfileCloseBtn = document.getElementById('staffProfileCloseBtn');
    const staffProfileTabs = document.getElementById('staffProfileTabs');
    const staffProfileTabPanels = document.getElementById('staffProfileTabPanels');
    const staffProfileEditBtn = document.getElementById('staffProfileEditBtn');

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        bindEvents();
        loadFormOptions().then(loadStaff);
    }

    function bindEvents() {
        addStaffBtn.addEventListener('click', showAddView);
        backToDirectoryBtn.addEventListener('click', showDirectoryView);
        roleSearchBtn.addEventListener('click', () => searchStaff('role'));
        keywordSearchBtn.addEventListener('click', () => searchStaff('keyword'));
        keywordFilter.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchStaff('keyword');
            }
        });
        cardViewBtn.addEventListener('click', () => setViewMode('card'));
        listViewBtn.addEventListener('click', () => setViewMode('list'));
        staffForm.addEventListener('submit', saveStaff);
        staffPhoto.addEventListener('change', updatePhotoLabel);
        staffMoreDetailsToggle.addEventListener('click', toggleMoreDetails);
        documentFields.forEach(({ inputId, labelId }) => {
            const input = document.getElementById(inputId);
            const label = document.getElementById(labelId);
            if (input && label) {
                input.addEventListener('change', () => updateFileLabel(input, label));
            }
        });
        bindCardActions();
        bindProfileModalEvents();
    }

    function bindProfileModalEvents() {
        if (!staffProfileModal || !staffProfileCloseBtn || !staffProfileTabs) return;

        staffProfileCloseBtn.addEventListener('click', closeStaffProfileModal);
        staffProfileOverlay.addEventListener('click', closeStaffProfileModal);

        staffProfileTabs.addEventListener('click', (event) => {
            const tabBtn = event.target.closest('.staff-profile-tab');
            if (!tabBtn) return;
            switchProfileTab(tabBtn.dataset.tab);
        });

        if (staffProfileEditBtn) {
            staffProfileEditBtn.addEventListener('click', () => {
                if (!activeProfileStaff) return;
                closeStaffProfileModal();
                editStaffMember(activeProfileStaff);
            });
        }

        const keyBtn = document.getElementById('staffProfileKeyBtn');
        const disableBtn = document.getElementById('staffProfileDisableBtn');
        if (keyBtn) {
            keyBtn.addEventListener('click', () => showAlert('info', 'Login credentials feature coming soon.'));
        }
        if (disableBtn) {
            disableBtn.addEventListener('click', () => showAlert('info', 'Disable staff feature coming soon.'));
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && staffProfileModal && !staffProfileModal.hidden) {
                closeStaffProfileModal();
            }
        });
    }

    async function loadFormOptions() {
        try {
            const response = await fetch('/api/staff/form-options');
            if (!response.ok) {
                throw new Error('Failed to load form options');
            }
            formOptions = await response.json();
            populateSelect(roleFilter, formOptions.roles, 'Select');
            populateSelect(document.getElementById('role'), formOptions.roles, 'Select');
            populateSelect(document.getElementById('designation'), formOptions.designations, 'Select');
            populateSelect(document.getElementById('department'), formOptions.departments, 'Select');
            populateSelect(document.getElementById('gender'), formOptions.genders, 'Select');
            populateSelect(document.getElementById('maritalStatus'), formOptions.maritalStatuses, 'Select');
            populateSelect(document.getElementById('contractType'), formOptions.contractTypes, 'Select');
        } catch (error) {
            showAlert('error', error.message);
        }
    }

    async function loadStaff(role, keyword) {
        try {
            const params = new URLSearchParams();
            if (role) params.set('role', role);
            if (keyword) params.set('keyword', keyword);
            const query = params.toString();
            const response = await fetch('/api/staff' + (query ? '?' + query : ''));
            if (!response.ok) {
                throw new Error('Failed to load staff directory');
            }
            staffRecords = await response.json();
            renderStaff();
        } catch (error) {
            showAlert('error', error.message);
        }
    }

    function searchStaff(type) {
        if (type === 'role') {
            loadStaff(roleFilter.value, '');
            return;
        }
        loadStaff('', keywordFilter.value.trim());
    }

    function setViewMode(mode) {
        currentView = mode;
        cardViewBtn.classList.toggle('active', mode === 'card');
        listViewBtn.classList.toggle('active', mode === 'list');
        renderStaff();
    }

    function renderStaff() {
        const hasRecords = staffRecords.length > 0;
        staffNoRecord.hidden = hasRecords;
        staffCardGrid.hidden = !hasRecords || currentView !== 'card';
        staffListWrap.hidden = !hasRecords || currentView !== 'list';

        if (!hasRecords) {
            staffCardGrid.innerHTML = '';
            staffListBody.innerHTML = '';
            return;
        }

        if (currentView === 'card') {
            staffCardGrid.innerHTML = staffRecords.map(renderCard).join('');
        } else {
            staffListBody.innerHTML = staffRecords.map(renderListRow).join('');
        }
    }

    function bindCardActions() {
        staffCardGrid.addEventListener('click', (event) => {
            const viewBtn = event.target.closest('.staff-card-view-btn');
            const editBtn = event.target.closest('.staff-card-edit-btn');
            if (!viewBtn && !editBtn) {
                return;
            }

            const card = event.target.closest('.staff-card');
            const staffId = card ? card.dataset.staffId : null;
            const staff = staffRecords.find((row) => String(row.id) === String(staffId));
            if (!staff) {
                return;
            }

            if (viewBtn) {
                viewStaffMember(staff);
            } else if (editBtn) {
                editStaffMember(staff);
            }
        });
    }

    function renderCard(staff) {
        const roles = Array.isArray(staff.roles) ? staff.roles : [];
        const roleTags = roles.map((role) => `<span class="staff-role-tag">${escapeHtml(role)}</span>`).join('');
        const photo = staff.photoPath
            ? `<img src="${escapeHtml(staff.photoPath)}" alt="${escapeHtml(staff.fullName)}">`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
               </svg>`;

        return `
            <article class="staff-card" data-staff-id="${escapeHtml(staff.id)}">
                <div class="staff-card-photo">${photo}</div>
                <div class="staff-card-body">
                    <h3 class="staff-card-name">${escapeHtml(staff.fullName || '')}</h3>
                    <div class="staff-card-meta">
                        <div>${escapeHtml(staff.staffId || '')}</div>
                        <div>${escapeHtml(staff.phone || '-')}</div>
                        <div>${escapeHtml(staff.location || '-')}</div>
                    </div>
                    <div class="staff-role-tags">${roleTags}</div>
                </div>
                <div class="staff-card-actions">
                    <button type="button" class="staff-card-action-btn staff-card-view-btn" title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                    <button type="button" class="staff-card-action-btn staff-card-edit-btn" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>
                </div>
            </article>
        `;
    }

    async function viewStaffMember(staff) {
        let data = staff;
        if (staff.id) {
            try {
                const response = await fetch(`/api/staff/${staff.id}`);
                if (response.ok) {
                    data = await response.json();
                }
            } catch (error) {
                showAlert('error', 'Failed to load staff profile.');
                return;
            }
        }
        openStaffProfileModal(data);
    }

    function openStaffProfileModal(staff) {
        activeProfileStaff = staff;
        const modalTitle = document.getElementById('staffProfileModalTitle');
        if (modalTitle) {
            modalTitle.textContent = staff.fullName || 'Staff Details';
        }
        renderProfileSidebar(staff);
        renderProfileTabPanels(staff);
        switchProfileTab('profile');
        staffProfileModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeStaffProfileModal() {
        staffProfileModal.hidden = true;
        activeProfileStaff = null;
        document.body.style.overflow = '';
    }

    function switchProfileTab(tabName) {
        staffProfileTabs.querySelectorAll('.staff-profile-tab').forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        staffProfileTabPanels.querySelectorAll('.staff-profile-tab-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.tabPanel === tabName);
        });
    }

    function renderProfileSidebar(staff) {
        const photoWrap = document.getElementById('staffProfilePhotoWrap');
        const nameEl = document.getElementById('staffProfileName');
        const summaryEl = document.getElementById('staffProfileSummary');
        const barcodeEl = document.getElementById('staffProfileBarcode');
        const barcodeIdEl = document.getElementById('staffProfileBarcodeId');
        const qrEl = document.getElementById('staffProfileQr');

        nameEl.textContent = staff.fullName || '-';

        if (staff.photoPath) {
            photoWrap.innerHTML = `<img src="${escapeHtml(staff.photoPath)}" alt="${escapeHtml(staff.fullName || 'Staff')}">`;
        } else {
            photoWrap.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>`;
        }

        const roleText = Array.isArray(staff.roles) ? staff.roles.join(', ') : (staff.role || '-');
        const summaryRows = [
            ['Staff ID', staff.staffId],
            ['Role', roleText],
            ['Designation', staff.designation],
            ['Department', staff.department],
            ['EPF No.', staff.epfNo],
            ['Basic Salary', staff.basicSalary],
            ['Contract Type', staff.contractType],
            ['Work Shift', staff.workShift],
            ['Work Location', staff.workLocation || staff.location],
            ['Date Of Joining', formatDisplayDate(staff.dateOfJoining)]
        ];

        summaryEl.innerHTML = summaryRows.map(([label, value]) => `
            <div class="staff-profile-summary-row">
                <span class="summary-label">${escapeHtml(label)}</span>
                <span class="summary-value">${escapeHtml(displayValue(value))}</span>
            </div>
        `).join('');

        barcodeEl.innerHTML = buildBarcodeBars(staff.staffId || '0');
        barcodeIdEl.textContent = staff.staffId || '-';

        const qrData = encodeURIComponent(staff.staffId || staff.id || 'staff');
        qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}" alt="Staff QR Code">`;
    }

    function renderProfileTabPanels(staff) {
        staffProfileTabPanels.innerHTML = `
            <div class="staff-profile-tab-panel active" data-tab-panel="profile">${renderProfileTab(staff)}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="payroll">${renderPayrollTab(staff)}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="leaves">${renderLeavesTab(staff)}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="attendance">${renderEmptyTab('No attendance record found')}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="documents">${renderDocumentsTab(staff)}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="timeline">${renderEmptyTab('No timeline record found')}</div>
        `;
    }

    function renderProfileTab(staff) {
        return `
            ${renderDetailSection('', [
                ['Phone', staff.phone],
                ['Emergency Contact Number', staff.emergencyContact],
                ['Email', staff.email],
                ['Gender', staff.gender],
                ['Date of Birth', formatDisplayDate(staff.dateOfBirth)],
                ['Marital Status', staff.maritalStatus],
                ['Father Name', staff.fatherName],
                ['Mother Name', staff.motherName],
                ['Qualification', staff.qualification],
                ['Work Experience', staff.workExperience],
                ['Note', staff.note],
                ['PAN Number', staff.panNumber]
            ])}
            ${renderDetailSection('Address Details', [
                ['Current Address', staff.address],
                ['Permanent Address', staff.permanentAddress]
            ])}
            ${renderDetailSection('Bank Account Details', [
                ['Account Title', staff.accountTitle],
                ['Bank Name', staff.bankName],
                ['Bank Branch Name', staff.bankBranchName],
                ['Bank Account Number', staff.bankAccountNumber],
                ['IFSC Code', staff.ifscCode]
            ])}
            ${renderDetailSection('Social Media Link', [
                ['Facebook URL', staff.facebookUrl],
                ['Twitter URL', staff.twitterUrl],
                ['Linkedin URL', staff.linkedinUrl],
                ['Instagram URL', staff.instagramUrl]
            ])}
        `;
    }

    function renderPayrollTab(staff) {
        return renderDetailSection('Payroll', [
            ['EPF No.', staff.epfNo],
            ['Basic Salary', staff.basicSalary],
            ['Contract Type', staff.contractType],
            ['Work Shift', staff.workShift],
            ['Work Location', staff.workLocation || staff.location],
            ['Date Of Joining', formatDisplayDate(staff.dateOfJoining)]
        ]);
    }

    function renderLeavesTab(staff) {
        return renderDetailSection('Leaves', [
            ['Medical Leave', staff.medicalLeave],
            ['Casual Leave', staff.casualLeave],
            ['Maternity Leave', staff.maternityLeave],
            ['Sick Leave', staff.sickLeave],
            ['Mandatory Leave', staff.mandatoryLeave]
        ]);
    }

    function renderDocumentsTab(staff) {
        const docs = [
            ['Resume', staff.resumePath],
            ['Joining Letter', staff.joiningLetterPath],
            ['Resignation Letter', staff.resignationLetterPath],
            ['Other Documents', staff.otherDocumentPath]
        ];

        const rows = docs.map(([label, path]) => {
            const value = path
                ? `<a href="${escapeHtml(path)}" class="staff-profile-doc-link" target="_blank" rel="noopener">View Document</a>`
                : '-';
            return `
                <div class="staff-profile-detail-row">
                    <div class="detail-label">${escapeHtml(label)}</div>
                    <div class="detail-value">${value}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="staff-profile-section">
                <div class="staff-profile-section-title">Documents</div>
                <div class="staff-profile-detail-table">${rows}</div>
            </div>
        `;
    }

    function renderDetailSection(title, rows) {
        const rowHtml = rows.map(([label, value]) => `
            <div class="staff-profile-detail-row">
                <div class="detail-label">${escapeHtml(label)}</div>
                <div class="detail-value">${escapeHtml(displayValue(value))}</div>
            </div>
        `).join('');

        const titleHtml = title
            ? `<div class="staff-profile-section-title">${escapeHtml(title)}</div>`
            : '';

        return `
            <div class="staff-profile-section">
                ${titleHtml}
                <div class="staff-profile-detail-table">${rowHtml}</div>
            </div>
        `;
    }

    function renderEmptyTab(message) {
        return `<div class="staff-profile-empty">${escapeHtml(message)}</div>`;
    }

    function buildBarcodeBars(value) {
        const seed = String(value);
        let bars = '';
        for (let i = 0; i < 42; i++) {
            const code = seed.charCodeAt(i % seed.length) + i;
            const width = (code % 3) + 1;
            bars += `<span style="width:${width}px"></span>`;
        }
        return bars;
    }

    function displayValue(value) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return String(value);
    }

    function formatDisplayDate(value) {
        if (!value) return '-';
        const parts = String(value).split('-');
        if (parts.length === 3) {
            return `${parts[1]}/${parts[2]}/${parts[0]}`;
        }
        return String(value);
    }

    function editStaffMember(staff) {
        showAddView();
        document.getElementById('staffRecordId').value = staff.id || '';
        document.getElementById('staffId').value = staff.staffId || '';
        document.getElementById('role').value = staff.role || (Array.isArray(staff.roles) ? staff.roles[0] : '') || '';
        document.getElementById('designation').value = staff.designation || '';
        document.getElementById('department').value = staff.department || '';
        document.getElementById('firstName').value = staff.firstName || '';
        document.getElementById('lastName').value = staff.lastName || '';
        document.getElementById('email').value = staff.email || '';
        document.getElementById('gender').value = staff.gender || '';
        document.getElementById('phone').value = staff.phone || '';
        document.getElementById('location').value = staff.location || '';
        document.getElementById('panNumber').value = staff.panNumber || '';
    }

    function renderListRow(staff) {
        const roles = Array.isArray(staff.roles) ? staff.roles.join(', ') : '';
        return `
            <tr>
                <td>${escapeHtml(staff.staffId || '')}</td>
                <td>${escapeHtml(staff.fullName || '')}</td>
                <td>${escapeHtml(staff.phone || '-')}</td>
                <td>${escapeHtml(staff.location || '-')}</td>
                <td>${escapeHtml(roles)}</td>
                <td>${escapeHtml(staff.department || '-')}</td>
            </tr>
        `;
    }

    function showAddView() {
        directoryView.hidden = true;
        addView.hidden = false;
        staffForm.reset();
        document.getElementById('staffRecordId').value = '';
        staffPhotoLabel.textContent = 'Drag and drop a file here or click';
        collapseMoreDetails();
        resetDocumentLabels();
    }

    function toggleMoreDetails() {
        const isExpanded = !staffMoreDetailsPanel.hidden;
        if (isExpanded) {
            collapseMoreDetails();
        } else {
            expandMoreDetails();
        }
    }

    function expandMoreDetails() {
        staffMoreDetailsPanel.hidden = false;
        staffMoreDetailsPanel.classList.add('is-open');
        staffMoreDetailsIcon.textContent = '−';
        staffMoreDetailsToggle.setAttribute('aria-expanded', 'true');
    }

    function collapseMoreDetails() {
        staffMoreDetailsPanel.hidden = true;
        staffMoreDetailsPanel.classList.remove('is-open');
        staffMoreDetailsIcon.textContent = '+';
        staffMoreDetailsToggle.setAttribute('aria-expanded', 'false');
    }

    function resetDocumentLabels() {
        documentFields.forEach(({ labelId }) => {
            const label = document.getElementById(labelId);
            if (label) {
                label.textContent = 'Drag and drop a file here or click';
            }
        });
    }

    function showDirectoryView() {
        addView.hidden = true;
        directoryView.hidden = false;
    }

    function updatePhotoLabel() {
        updateFileLabel(staffPhoto, staffPhotoLabel);
    }

    function updateFileLabel(input, labelElement) {
        if (input.files && input.files[0]) {
            labelElement.textContent = input.files[0].name;
        } else {
            labelElement.textContent = 'Drag and drop a file here or click';
        }
    }

    async function saveStaff(event) {
        event.preventDefault();

        const payload = {
            staffId: document.getElementById('staffId').value.trim(),
            role: document.getElementById('role').value,
            designation: document.getElementById('designation').value,
            department: document.getElementById('department').value,
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            fatherName: document.getElementById('fatherName').value.trim(),
            motherName: document.getElementById('motherName').value.trim(),
            email: document.getElementById('email').value.trim(),
            gender: document.getElementById('gender').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            dateOfJoining: document.getElementById('dateOfJoining').value,
            phone: document.getElementById('phone').value.trim(),
            emergencyContact: document.getElementById('emergencyContact').value.trim(),
            maritalStatus: document.getElementById('maritalStatus').value,
            address: document.getElementById('address').value.trim(),
            permanentAddress: document.getElementById('permanentAddress').value.trim(),
            qualification: document.getElementById('qualification').value.trim(),
            workExperience: document.getElementById('workExperience').value.trim(),
            note: document.getElementById('note').value.trim(),
            panNumber: document.getElementById('panNumber').value.trim(),
            location: document.getElementById('location').value.trim(),
            epfNo: document.getElementById('epfNo').value.trim(),
            basicSalary: document.getElementById('basicSalary').value.trim(),
            contractType: document.getElementById('contractType').value,
            workShift: document.getElementById('workShift').value.trim(),
            workLocation: document.getElementById('workLocation').value.trim(),
            medicalLeave: document.getElementById('medicalLeave').value,
            casualLeave: document.getElementById('casualLeave').value,
            maternityLeave: document.getElementById('maternityLeave').value,
            sickLeave: document.getElementById('sickLeave').value,
            mandatoryLeave: document.getElementById('mandatoryLeave').value,
            accountTitle: document.getElementById('accountTitle').value.trim(),
            bankAccountNumber: document.getElementById('bankAccountNumber').value.trim(),
            bankName: document.getElementById('bankName').value.trim(),
            ifscCode: document.getElementById('ifscCode').value.trim(),
            bankBranchName: document.getElementById('bankBranchName').value.trim(),
            facebookUrl: document.getElementById('facebookUrl').value.trim(),
            twitterUrl: document.getElementById('twitterUrl').value.trim(),
            linkedinUrl: document.getElementById('linkedinUrl').value.trim(),
            instagramUrl: document.getElementById('instagramUrl').value.trim()
        };

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (staffPhoto.files && staffPhoto.files[0]) {
            formData.append('staffPhoto', staffPhoto.files[0]);
        }
        documentFields.forEach(({ inputId, formKey }) => {
            const input = document.getElementById(inputId);
            if (input && input.files && input.files[0]) {
                formData.append(formKey, input.files[0]);
            }
        });

        try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save staff member');
            }
            showAlert('success', result.message || 'Staff member saved successfully!');
            showDirectoryView();
            loadStaff();
        } catch (error) {
            showAlert('error', error.message);
        }
    }

    function populateSelect(select, items, placeholder) {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        (items || []).forEach((item) => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showAlert(type, message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type === 'info' ? 'info' : type,
                title: type === 'success' ? 'Success' : type === 'info' ? 'Info' : 'Error',
                text: message,
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }
        alert(message);
    }
})();
