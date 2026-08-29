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
    let autoStaffIdEnabled = false;
    let activeProfileStaff = null;
    let listCurrentPage = 1;
    let listPageSize = 50;
    let listTableSearch = '';
    let listSortField = 'staffId';
    let listSortDirection = 'asc';

    let payrollRecords = [];
    let payrollCurrentPage = 1;
    let payrollPageSize = 50;
    let payrollSearch = '';
    let payrollSortField = 'payslipNo';
    let payrollSortDirection = 'asc';

    let leaveRecords = [];
    let leaveCurrentPage = 1;
    let leavePageSize = 50;
    let leaveTableSearch = '';
    let leaveSortField = 'leaveType';
    let leaveSortDirection = 'asc';

    let staffAttendanceYear = 2026;
    let staffAttendanceExport = null;

    const staffTimelineStore = new Map();
    let staffTimelineEntries = [];
    let staffTimelineSelectedFile = null;
    let staffTimelineEventsBound = false;

    let staffDirectoryContext = {
        restricted: false,
        currentStaffMemberId: null,
        currentStaffLoginEmail: null
    };

    const staffProfileModal = document.getElementById('staffProfileModal');
    const staffProfileOverlay = document.getElementById('staffProfileOverlay');
    const staffProfileCloseBtn = document.getElementById('staffProfileCloseBtn');
    const staffProfileTabs = document.getElementById('staffProfileTabs');
    const staffProfileTabPanels = document.getElementById('staffProfileTabPanels');
    const staffProfileEditBtn = document.getElementById('staffProfileEditBtn');
    const staffFormTitle = document.getElementById('staffFormTitle');
    const saveStaffBtn = document.getElementById('saveStaffBtn');

    const staffPayslipModal = document.getElementById('staffPayslipModal');
    const staffPayslipOverlay = document.getElementById('staffPayslipOverlay');
    const staffPayslipCloseBtn = document.getElementById('staffPayslipCloseBtn');
    const staffPayslipDocument = document.getElementById('staffPayslipDocument');
    const staffPayslipColumnsDropdown = document.getElementById('staffPayslipColumnsDropdown');

    let activePayslipDetail = null;

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((error) => console.error('Staff directory init failed', error));
    });

    async function init() {
        applyDirectoryContext(readStaffDirectoryContext());
        try {
            bindEvents();
        } catch (error) {
            console.error('Staff directory event binding failed', error);
        }
        await loadFormOptions();
        await handleInitialRoute();
        ensureStaffDirectoryContext()
            .then(() => {
                applyStaffDirectoryRestrictions();
                if (staffRecords.length) {
                    renderStaff();
                }
            })
            .catch(() => {
                applyStaffDirectoryRestrictions();
            });
    }

    async function ensureStaffDirectoryContext() {
        const endpoints = ['/api/staff/session/context', '/api/staff/directory-context'];
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    continue;
                }
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    continue;
                }
                applyDirectoryContext(await response.json());
                return;
            } catch (error) {
                // Try the next endpoint or fall back to page context.
            }
        }

        applyDirectoryContext(readStaffDirectoryContext());
    }

    function applyDirectoryContext(data) {
        if (!data || typeof data !== 'object') {
            return;
        }

        staffDirectoryContext.restricted = data.restricted === true;
        staffDirectoryContext.currentStaffMemberId = data.currentStaffMemberId != null && data.currentStaffMemberId !== 'null'
            ? String(data.currentStaffMemberId)
            : null;
        staffDirectoryContext.currentStaffLoginEmail = data.loginEmail || staffDirectoryContext.currentStaffLoginEmail || null;

        if (staffDirectoryContext.restricted) {
            document.documentElement.setAttribute('data-receptionist-staff-directory', 'true');
            if (document.body) {
                document.body.classList.add('receptionist-staff-directory-mode');
            }
        }
    }

    function readStaffDirectoryContext() {
        const body = document.body;
        if (body) {
            const receptionistFlag = body.dataset.receptionistStaff;
            if (receptionistFlag === 'true' || receptionistFlag === true) {
                document.documentElement.setAttribute('data-receptionist-staff-directory', 'true');
                body.classList.add('receptionist-staff-directory-mode');
                const memberId = body.dataset.staffMemberId;
                return {
                    restricted: true,
                    currentStaffMemberId: memberId && memberId !== 'null' ? String(memberId) : null,
                    loginEmail: body.dataset.loginEmail || 'receptionist@gmail.com'
                };
            }
        }

        const fromWindow = window.staffDirectoryContext;
        if (fromWindow && typeof fromWindow === 'object') {
            const currentStaffMemberId = fromWindow.currentStaffMemberId;
            const restricted = fromWindow.restricted === true;
            if (restricted) {
                document.documentElement.setAttribute('data-receptionist-staff-directory', 'true');
                if (document.body) {
                    document.body.classList.add('receptionist-staff-directory-mode');
                }
            }
            return {
                restricted: restricted,
                currentStaffMemberId: currentStaffMemberId != null && currentStaffMemberId !== 'null'
                    ? String(currentStaffMemberId)
                    : null,
                loginEmail: fromWindow.loginEmail || null
            };
        }

        const sessionEl = document.getElementById('staffSessionContext');
        if (sessionEl && /receptionist/i.test(sessionEl.dataset.role || '')) {
            document.documentElement.setAttribute('data-receptionist-staff-directory', 'true');
            if (document.body) {
                document.body.classList.add('receptionist-staff-directory-mode');
            }
            return {
                restricted: true,
                currentStaffMemberId: null,
                loginEmail: 'receptionist@gmail.com'
            };
        }

        return { restricted: false, currentStaffMemberId: null, loginEmail: null };
    }

    function resolveOwnStaffFromRecords() {
        if (!staffRecords.length) {
            return null;
        }

        if (staffDirectoryContext.currentStaffMemberId) {
            const byId = staffRecords.find((staff) => String(staff.id) === String(staffDirectoryContext.currentStaffMemberId));
            if (byId) {
                return byId;
            }
        }

        const loginEmail = (staffDirectoryContext.currentStaffLoginEmail || 'receptionist@gmail.com').trim().toLowerCase();
        const byEmail = staffRecords.find((staff) => staff.email && staff.email.trim().toLowerCase() === loginEmail);
        if (byEmail) {
            return byEmail;
        }

        const byStaffId = staffRecords.find((staff) => String(staff.staffId) === '9006');
        if (byStaffId) {
            return byStaffId;
        }

        const byName = staffRecords.find((staff) => (staff.fullName || '').trim().toLowerCase() === 'receptionist user');
        if (byName) {
            return byName;
        }

        const receptionists = staffRecords.filter((staff) => {
            const roles = Array.isArray(staff.roles) ? staff.roles : (staff.role ? [staff.role] : []);
            return roles.some((role) => /^receptionist$/i.test(String(role || '').trim()));
        });
        if (receptionists.length === 1) {
            return receptionists[0];
        }

        return receptionists.find((staff) => (staff.fullName || '').toLowerCase().includes('receptionist')) || null;
    }

    function isOwnStaffRecord(staff) {
        if (!staff) {
            return false;
        }

        if (!isReceptionistStaffDirectoryMode()) {
            return staff.canView === true && staff.canEdit === false;
        }

        const ownStaff = resolveOwnStaffFromRecords();
        if (ownStaff && staff.id != null) {
            return String(staff.id) === String(ownStaff.id);
        }

        if (staffDirectoryContext.currentStaffMemberId && staff.id != null
            && String(staff.id) === String(staffDirectoryContext.currentStaffMemberId)) {
            return true;
        }

        if (staffDirectoryContext.currentStaffLoginEmail && staff.email) {
            return staff.email.trim().toLowerCase() === staffDirectoryContext.currentStaffLoginEmail.trim().toLowerCase();
        }

        if (String(staff.staffId) === '9006') {
            return true;
        }

        return (staff.fullName || '').trim().toLowerCase() === 'receptionist user';
    }

    function getStaffActionPermissions(staff) {
        if (isReceptionistStaffDirectoryMode()) {
            const isSelf = isOwnStaffRecord(staff);
            return { view: isSelf, edit: false };
        }

        if (staff && (staff.canView !== undefined || staff.canEdit !== undefined)) {
            return {
                view: staff.canView === true,
                edit: staff.canEdit === true
            };
        }

        return { view: true, edit: true };
    }

    function isReceptionistStaffDirectoryMode() {
        if (staffDirectoryContext.restricted) {
            return true;
        }
        if (document.documentElement.getAttribute('data-receptionist-staff-directory') === 'true') {
            return true;
        }
        if (document.body && document.body.classList.contains('receptionist-staff-directory-mode')) {
            return true;
        }
        const sessionEl = document.getElementById('staffSessionContext');
        return !!(sessionEl && /receptionist/i.test(sessionEl.dataset.role || ''));
    }

    function applyStaffDirectoryRestrictions() {
        if (!isReceptionistStaffDirectoryMode() || !addStaffBtn) {
            return;
        }
        addStaffBtn.hidden = true;
    }

    function canOpenStaffProfile(staff) {
        return getStaffActionPermissions(staff).view;
    }

    async function handleInitialRoute() {
        const editId = getEditStaffIdFromUrl();
        if (editId) {
            await openEditView(editId);
            return;
        }
        if (isAddStaffRoute()) {
            showAddViewLocal(true);
            return;
        }
        showDirectoryViewLocal();
        await loadStaff();
    }

    function getEditStaffIdFromUrl() {
        const match = window.location.pathname.match(/^\/staff\/edit\/(\d+)\/?$/);
        return match ? match[1] : null;
    }

    function isAddStaffRoute() {
        return /^\/staff\/add\/?$/.test(window.location.pathname);
    }

    function safeBind(element, eventName, handler) {
        if (element) {
            element.addEventListener(eventName, handler);
        }
    }

    function bindEvents() {
        safeBind(addStaffBtn, 'click', () => {
            window.location.href = '/staff/add';
        });
        safeBind(backToDirectoryBtn, 'click', () => {
            window.location.href = '/staff';
        });
        safeBind(roleSearchBtn, 'click', () => searchStaff('role'));
        safeBind(keywordSearchBtn, 'click', () => searchStaff('keyword'));
        safeBind(keywordFilter, 'keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchStaff('keyword');
            }
        });
        safeBind(cardViewBtn, 'click', () => setViewMode('card'));
        safeBind(listViewBtn, 'click', () => setViewMode('list'));
        safeBind(staffForm, 'submit', saveStaff);
        safeBind(staffPhoto, 'change', updatePhotoLabel);
        safeBind(staffMoreDetailsToggle, 'click', toggleMoreDetails);
        documentFields.forEach(({ inputId, labelId }) => {
            const input = document.getElementById(inputId);
            const label = document.getElementById(labelId);
            if (input && label) {
                input.addEventListener('change', () => updateFileLabel(input, label));
            }
        });
        bindCardActions();
        bindListEvents();
        bindProfileModalEvents();
        bindPayslipModalEvents();
        bindStaffTimelineEvents();
    }

    function bindListEvents() {
        const tableSearch = document.getElementById('staffTableSearch');
        const entriesSelect = document.getElementById('staffEntriesSelect');

        if (tableSearch) {
            tableSearch.addEventListener('input', () => {
                listTableSearch = tableSearch.value.trim().toLowerCase();
                listCurrentPage = 1;
                renderStaff();
            });
        }

        if (entriesSelect) {
            entriesSelect.addEventListener('change', () => {
                listPageSize = parseInt(entriesSelect.value, 10) || 50;
                listCurrentPage = 1;
                renderStaff();
            });
        }

        document.getElementById('staffCopyBtn')?.addEventListener('click', copyStaffList);
        document.getElementById('staffExcelBtn')?.addEventListener('click', exportStaffExcel);
        document.getElementById('staffCsvBtn')?.addEventListener('click', exportStaffCsv);
        document.getElementById('staffPdfBtn')?.addEventListener('click', exportStaffPdf);
        document.getElementById('staffPrintBtn')?.addEventListener('click', () => window.print());
        document.getElementById('staffColumnsBtn')?.addEventListener('click', () => {
            showAlert('info', 'Column visibility feature coming soon.');
        });

        document.querySelectorAll('#staffListTable thead th.sortable').forEach((header) => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                if (listSortField === field) {
                    listSortDirection = listSortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    listSortField = field;
                    listSortDirection = 'asc';
                }
                renderStaff();
            });
        });

        staffListWrap?.addEventListener('click', (event) => {
            const viewBtn = event.target.closest('.staff-list-view-btn');
            const editBtn = event.target.closest('.staff-list-edit-btn');
            const nameBtn = event.target.closest('.staff-name-link');
            const row = event.target.closest('tr[data-staff-id]');
            if (!row) return;

            const staff = staffRecords.find((item) => String(item.id) === row.dataset.staffId);
            if (!staff) return;

            if (viewBtn || nameBtn) {
                if (!canOpenStaffProfile(staff)) {
                    return;
                }
                viewStaffMember(staff);
            } else if (editBtn) {
                if (!getStaffActionPermissions(staff).edit) {
                    return;
                }
                editStaffMember(staff);
            }
        });

        document.getElementById('staffPagination')?.addEventListener('click', (event) => {
            const btn = event.target.closest('.staff-pagination-btn');
            if (!btn || btn.disabled) return;
            const page = btn.dataset.page;
            if (page === 'prev') {
                listCurrentPage = Math.max(1, listCurrentPage - 1);
            } else if (page === 'next') {
                listCurrentPage += 1;
            } else if (page) {
                listCurrentPage = parseInt(page, 10);
            }
            renderStaff();
        });
    }

    function bindProfileModalEvents() {
        if (!staffProfileModal || !staffProfileCloseBtn || !staffProfileTabs) return;

        staffProfileCloseBtn.addEventListener('click', closeStaffProfileModal);
        staffProfileOverlay?.addEventListener('click', closeStaffProfileModal);

        staffProfileTabs.addEventListener('click', (event) => {
            const tabBtn = event.target.closest('.staff-profile-tab');
            if (!tabBtn) return;
            switchProfileTab(tabBtn.dataset.tab);
        });

        if (staffProfileEditBtn) {
            staffProfileEditBtn.addEventListener('click', () => {
                if (!activeProfileStaff || !activeProfileStaff.id) {
                    showAlert('error', 'Staff member not found.');
                    return;
                }
                const staffId = activeProfileStaff.id;
                closeStaffProfileModal();
                window.location.href = '/staff/edit/' + encodeURIComponent(staffId);
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
            if (event.key === 'Escape' && staffTimelineModal?.classList.contains('active')) {
                closeStaffTimelineModal();
                return;
            }
            if (event.key === 'Escape' && staffPayslipModal && !staffPayslipModal.hidden) {
                return;
            }
            if (event.key === 'Escape' && staffProfileModal && !staffProfileModal.hidden) {
                closeStaffProfileModal();
            }
        });

        if (staffProfileTabPanels) {
            staffProfileTabPanels.addEventListener('input', (event) => {
                if (event.target.id === 'staffPayrollSearch') {
                    payrollSearch = event.target.value.trim().toLowerCase();
                    payrollCurrentPage = 1;
                    renderPayrollTableRows();
                    return;
                }
                if (event.target.id === 'staffLeavesSearch') {
                    leaveTableSearch = event.target.value.trim().toLowerCase();
                    leaveCurrentPage = 1;
                    renderLeavesTableRows();
                }
            });

            staffProfileTabPanels.addEventListener('change', (event) => {
                if (event.target.id === 'staffPayrollEntriesSelect') {
                    payrollPageSize = parseInt(event.target.value, 10) || 50;
                    payrollCurrentPage = 1;
                    renderPayrollTableRows();
                    return;
                }
                if (event.target.id === 'staffLeavesEntriesSelect') {
                    leavePageSize = parseInt(event.target.value, 10) || 50;
                    leaveCurrentPage = 1;
                    renderLeavesTableRows();
                    return;
                }
                if (event.target.id === 'staffAttendanceYear') {
                    staffAttendanceYear = parseInt(event.target.value, 10) || new Date().getFullYear();
                    if (activeProfileStaff) {
                        renderStaffAttendancePanel(activeProfileStaff);
                    }
                    return;
                }
                const payrollColToggle = event.target.closest('input[data-payroll-col]');
                if (payrollColToggle) {
                    togglePayrollColumn(payrollColToggle.dataset.payrollCol, payrollColToggle.checked);
                    return;
                }
                const leaveColToggle = event.target.closest('input[data-leave-col]');
                if (leaveColToggle) {
                    toggleLeaveColumn(leaveColToggle.dataset.leaveCol, leaveColToggle.checked);
                    return;
                }
                const attendanceColToggle = event.target.closest('input[data-attendance-col]');
                if (attendanceColToggle) {
                    toggleStaffAttendanceColumn(attendanceColToggle.dataset.attendanceCol, attendanceColToggle.checked);
                }
            });

            staffProfileTabPanels.addEventListener('click', (event) => {
                const sortHeader = event.target.closest('#staffPayrollTable thead th.sortable');
                if (sortHeader) {
                    const field = sortHeader.dataset.sort;
                    if (payrollSortField === field) {
                        payrollSortDirection = payrollSortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        payrollSortField = field;
                        payrollSortDirection = 'asc';
                    }
                    renderPayrollTableRows();
                    return;
                }

                const pageBtn = event.target.closest('#staffPayrollPagination .staff-pagination-btn');
                if (pageBtn && !pageBtn.disabled) {
                    const page = pageBtn.dataset.page;
                    if (page === 'prev') {
                        payrollCurrentPage = Math.max(1, payrollCurrentPage - 1);
                    } else if (page === 'next') {
                        payrollCurrentPage += 1;
                    } else if (page) {
                        payrollCurrentPage = parseInt(page, 10);
                    }
                    renderPayrollTableRows();
                    return;
                }

                if (event.target.closest('#staffPayrollCopyBtn')) {
                    copyPayrollList();
                } else if (event.target.closest('#staffPayrollExcelBtn')) {
                    exportPayrollExcel();
                } else if (event.target.closest('#staffPayrollCsvBtn')) {
                    exportPayrollCsv();
                } else if (event.target.closest('#staffPayrollPdfBtn')) {
                    exportPayrollPdf();
                } else if (event.target.closest('#staffPayrollPrintBtn')) {
                    window.print();
                } else if (event.target.closest('#staffPayrollColumnsBtn')) {
                    event.stopPropagation();
                    document.getElementById('staffPayrollColumnsDropdown')?.classList.toggle('active');
                } else if (event.target.closest('.staff-payroll-view-btn')) {
                    const row = event.target.closest('tr[data-payslip-no]');
                    if (!row || !activeProfileStaff) return;
                    const payslip = payrollRecords.find((item) => String(item.payslipNo) === String(row.dataset.payslipNo));
                    if (payslip) {
                        openPayslipModal(activeProfileStaff, payslip);
                    }
                    return;
                }

                const leaveSortHeader = event.target.closest('#staffLeavesTable thead th.sortable');
                if (leaveSortHeader) {
                    const field = leaveSortHeader.dataset.sort;
                    if (leaveSortField === field) {
                        leaveSortDirection = leaveSortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        leaveSortField = field;
                        leaveSortDirection = 'asc';
                    }
                    renderLeavesTableRows();
                    return;
                }

                const leavePageBtn = event.target.closest('#staffLeavesPagination .staff-pagination-btn');
                if (leavePageBtn && !leavePageBtn.disabled) {
                    const page = leavePageBtn.dataset.page;
                    if (page === 'prev') {
                        leaveCurrentPage = Math.max(1, leaveCurrentPage - 1);
                    } else if (page === 'next') {
                        leaveCurrentPage += 1;
                    } else if (page) {
                        leaveCurrentPage = parseInt(page, 10);
                    }
                    renderLeavesTableRows();
                    return;
                }

                if (event.target.closest('#staffLeavesCopyBtn')) {
                    copyLeavesList();
                } else if (event.target.closest('#staffLeavesExcelBtn')) {
                    exportLeavesExcel();
                } else if (event.target.closest('#staffLeavesCsvBtn')) {
                    exportLeavesCsv();
                } else if (event.target.closest('#staffLeavesPdfBtn')) {
                    exportLeavesPdf();
                } else if (event.target.closest('#staffLeavesPrintBtn')) {
                    window.print();
                } else if (event.target.closest('#staffLeavesColumnsBtn')) {
                    event.stopPropagation();
                    document.getElementById('staffLeavesColumnsDropdown')?.classList.toggle('active');
                    return;
                }

                if (event.target.closest('#staffAttendanceCopyBtn')) {
                    copyStaffAttendance();
                } else if (event.target.closest('#staffAttendanceExcelBtn')) {
                    exportStaffAttendanceExcel();
                } else if (event.target.closest('#staffAttendanceCsvBtn')) {
                    exportStaffAttendanceCsv();
                } else if (event.target.closest('#staffAttendancePdfBtn')) {
                    exportStaffAttendancePdf();
                } else if (event.target.closest('#staffAttendancePrintBtn')) {
                    window.print();
                } else if (event.target.closest('#staffAttendanceColumnsBtn')) {
                    event.stopPropagation();
                    document.getElementById('staffAttendanceColumnsDropdown')?.classList.toggle('active');
                    return;
                }

                if (event.target.closest('#staffTimelineAddBtn')) {
                    openStaffTimelineModal(null);
                    return;
                }

                const timelineItem = event.target.closest('#staffTimelineTrack .staff-timeline-item[data-id]');
                if (timelineItem) {
                    const timelineId = timelineItem.getAttribute('data-id');
                    const timelineEntry = staffTimelineEntries.find((row) => String(row.id) === String(timelineId));
                    if (!timelineEntry) return;

                    if (event.target.closest('.btn-staff-timeline-download')) {
                        downloadStaffTimelineEntry(timelineEntry);
                        return;
                    }
                    if (event.target.closest('.btn-staff-timeline-edit')) {
                        openStaffTimelineModal(timelineEntry);
                        return;
                    }
                    if (event.target.closest('.btn-staff-timeline-delete')) {
                        deleteStaffTimelineEntry(timelineEntry);
                        return;
                    }
                }
            });
        }
    }

    const staffTimelineModal = document.getElementById('staffTimelineModal');
    const staffTimelineModalTitle = document.getElementById('staffTimelineModalTitle');
    const staffTimelineEditId = document.getElementById('staffTimelineEditId');
    const staffTimelineTitleInput = document.getElementById('staffTimelineTitleInput');
    const staffTimelineDateInput = document.getElementById('staffTimelineDateInput');
    const staffTimelineDescInput = document.getElementById('staffTimelineDescInput');
    const staffTimelineVisibleCheck = document.getElementById('staffTimelineVisibleCheck');
    const staffTimelineDropzone = document.getElementById('staffTimelineDropzone');
    const staffTimelineFileInput = document.getElementById('staffTimelineFileInput');
    const staffTimelineDropzoneText = document.getElementById('staffTimelineDropzoneText');

    function bindStaffTimelineEvents() {
        if (staffTimelineEventsBound) return;
        staffTimelineEventsBound = true;

        document.getElementById('staffTimelineModalClose')?.addEventListener('click', closeStaffTimelineModal);
        document.getElementById('staffTimelineModalOverlay')?.addEventListener('click', closeStaffTimelineModal);
        document.getElementById('staffTimelineSaveBtn')?.addEventListener('click', saveStaffTimelineFromModal);

        staffTimelineDropzone?.addEventListener('click', () => {
            staffTimelineFileInput?.click();
        });
        staffTimelineFileInput?.addEventListener('change', () => {
            const file = staffTimelineFileInput.files && staffTimelineFileInput.files[0];
            setStaffTimelineFile(file || null);
        });
        staffTimelineDropzone?.addEventListener('dragover', (event) => {
            event.preventDefault();
            staffTimelineDropzone.classList.add('dragover');
        });
        staffTimelineDropzone?.addEventListener('dragleave', () => {
            staffTimelineDropzone.classList.remove('dragover');
        });
        staffTimelineDropzone?.addEventListener('drop', (event) => {
            event.preventDefault();
            staffTimelineDropzone.classList.remove('dragover');
            const file = event.dataTransfer?.files?.[0];
            setStaffTimelineFile(file || null);
        });
    }

    async function confirmStaffTimelineDelete(entry) {
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Timeline?',
                text: `Remove "${entry.title}"?`,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                customClass: { container: 'staff-swal-top' }
            });
            return result.isConfirmed;
        }
        return window.confirm(`Remove "${entry.title}"?`);
    }

    async function deleteStaffTimelineEntry(entry) {
        if (!entry) return;

        const confirmed = await confirmStaffTimelineDelete(entry);
        if (!confirmed) return;

        staffTimelineEntries = staffTimelineEntries.filter((row) => String(row.id) !== String(entry.id));
        if (activeProfileStaff?.id != null) {
            staffTimelineStore.set(String(activeProfileStaff.id), [...staffTimelineEntries]);
        }
        renderStaffTimeline();
        showAlert('success', 'Timeline entry deleted.');
    }

    function sanitizeDownloadFileName(name, fallback) {
        const base = String(name || fallback || 'download')
            .replace(/[\\/:*?"<>|]+/g, '-')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
        return base || 'download';
    }

    function triggerBlobDownload(blob, filename) {
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    }

    function downloadStaffTimelineEntry(entry) {
        if (!entry) return;

        if (entry.file instanceof Blob) {
            triggerBlobDownload(entry.file, entry.fileName || 'timeline-document');
            showAlert('success', 'Document downloaded.');
            return;
        }

        if (entry.fileUrl) {
            const link = document.createElement('a');
            link.href = entry.fileUrl;
            link.download = entry.fileName || 'timeline-document';
            link.target = '_blank';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showAlert('success', 'Document downloaded.');
            return;
        }

        const content = [
            `Date: ${entry.date || ''}`,
            `Title: ${entry.title || ''}`,
            `Description: ${entry.description || ''}`
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const filename = `${sanitizeDownloadFileName(entry.title, 'timeline-entry')}.txt`;
        triggerBlobDownload(blob, filename);
        showAlert('success', 'Timeline entry downloaded.');
    }

    function getDefaultStaffTimelineEntries() {
        return [{
            id: 1,
            date: '08/12/2026',
            title: 'sdsdsds',
            description: 'sdds',
            node: 'calendar',
            visible: true,
            fileName: ''
        }];
    }

    function getStaffTimelineEntries(staffId) {
        const key = String(staffId);
        if (!staffTimelineStore.has(key)) {
            staffTimelineStore.set(key, getDefaultStaffTimelineEntries());
        }
        return staffTimelineStore.get(key);
    }

    function todayMmDdYyyy() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${mm}/${dd}/${now.getFullYear()}`;
    }

    function staffTimelineNodeIcon(type) {
        if (type === 'clock') {
            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>`;
        }
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`;
    }

    function renderStaffTimeline() {
        const track = document.getElementById('staffTimelineTrack');
        if (!track) return;

        if (!staffTimelineEntries.length) {
            track.innerHTML = '<div class="staff-timeline-empty">No timeline records found.</div>';
            return;
        }

        const grouped = {};
        staffTimelineEntries.forEach((entry) => {
            const key = entry.date || 'No Date';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(entry);
        });

        track.innerHTML = Object.keys(grouped).map((date) => {
            const items = grouped[date].map((entry, index) => {
                const nodeType = entry.node || (index === 0 ? 'calendar' : 'clock');
                return `
                    <div class="staff-timeline-item" data-id="${escapeHtml(String(entry.id))}">
                        <span class="staff-timeline-node ${escapeHtml(nodeType)}">${staffTimelineNodeIcon(nodeType)}</span>
                        <div class="staff-timeline-card">
                            <div class="staff-timeline-card-header">
                                <h4 class="staff-timeline-card-title">${escapeHtml(entry.title || '')}</h4>
                                <div class="staff-timeline-card-actions">
                                    <button type="button" class="btn-action btn-staff-timeline-download" title="Download">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </button>
                                    <button type="button" class="btn-action btn-staff-timeline-edit" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                        </svg>
                                    </button>
                                    <button type="button" class="btn-action btn-staff-timeline-delete" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="staff-timeline-card-body">${escapeHtml(entry.description || '')}</div>
                        </div>
                    </div>
                `;
            }).join('');

            const trailingClock = `
                <div class="staff-timeline-item">
                    <span class="staff-timeline-node clock">${staffTimelineNodeIcon('clock')}</span>
                </div>
            `;

            return `
                <div class="staff-timeline-group">
                    <div class="staff-timeline-date">${escapeHtml(date)}</div>
                    ${items}
                    ${trailingClock}
                </div>
            `;
        }).join('');
    }

    function setStaffTimelineFile(file) {
        staffTimelineSelectedFile = file || null;
        if (staffTimelineDropzoneText) {
            staffTimelineDropzoneText.textContent = file
                ? file.name
                : 'Drag and drop a file here or click';
        }
    }

    function openStaffTimelineModal(existing) {
        if (!staffTimelineModal) return;
        if (staffTimelineModalTitle) {
            staffTimelineModalTitle.textContent = existing ? 'Edit Timeline' : 'Add Timeline';
        }
        if (staffTimelineEditId) staffTimelineEditId.value = existing ? String(existing.id) : '';
        if (staffTimelineTitleInput) staffTimelineTitleInput.value = existing ? (existing.title || '') : '';
        if (staffTimelineDateInput) {
            staffTimelineDateInput.value = existing ? (existing.date || todayMmDdYyyy()) : todayMmDdYyyy();
        }
        if (staffTimelineDescInput) staffTimelineDescInput.value = existing ? (existing.description || '') : '';
        if (staffTimelineVisibleCheck) {
            staffTimelineVisibleCheck.checked = existing ? existing.visible !== false : true;
        }
        setStaffTimelineFile(existing?.file || (existing?.fileName ? { name: existing.fileName } : null));
        staffTimelineModal.classList.add('active');
        staffTimelineModal.setAttribute('aria-hidden', 'false');
        staffTimelineTitleInput?.focus();
    }

    function closeStaffTimelineModal() {
        if (!staffTimelineModal) return;
        staffTimelineModal.classList.remove('active');
        staffTimelineModal.setAttribute('aria-hidden', 'true');
        setStaffTimelineFile(null);
        if (staffTimelineFileInput) staffTimelineFileInput.value = '';
    }

    function saveStaffTimelineFromModal() {
        const title = staffTimelineTitleInput ? staffTimelineTitleInput.value.trim() : '';
        const date = staffTimelineDateInput ? staffTimelineDateInput.value.trim() : '';
        const description = staffTimelineDescInput ? staffTimelineDescInput.value.trim() : '';
        const visible = staffTimelineVisibleCheck ? staffTimelineVisibleCheck.checked : true;
        const editId = staffTimelineEditId ? staffTimelineEditId.value : '';

        if (!title || !date) {
            showAlert('error', 'Title and Date are required.');
            return;
        }

        if (editId) {
            const entry = staffTimelineEntries.find((row) => String(row.id) === String(editId));
            if (entry) {
                entry.title = title;
                entry.date = date;
                entry.description = description || title;
                entry.visible = visible;
                if (staffTimelineSelectedFile instanceof File) {
                    entry.file = staffTimelineSelectedFile;
                    entry.fileName = staffTimelineSelectedFile.name;
                }
            }
        } else {
            staffTimelineEntries.unshift({
                id: Date.now(),
                date,
                title,
                description: description || title,
                visible,
                fileName: staffTimelineSelectedFile instanceof File ? staffTimelineSelectedFile.name : '',
                file: staffTimelineSelectedFile instanceof File ? staffTimelineSelectedFile : null,
                node: 'calendar'
            });
        }

        if (activeProfileStaff?.id != null) {
            staffTimelineStore.set(String(activeProfileStaff.id), [...staffTimelineEntries]);
        }

        closeStaffTimelineModal();
        renderStaffTimeline();
    }

    function renderTimelineTab() {
        return `
            <div class="staff-timeline-panel">
                <div class="staff-timeline-toolbar">
                    <button type="button" class="btn-staff-timeline-add" id="staffTimelineAddBtn">Add</button>
                </div>
                <div class="staff-timeline-track" id="staffTimelineTrack"></div>
            </div>
        `;
    }

    function initTimelineTab(staff) {
        staffTimelineEntries = [...getStaffTimelineEntries(staff.id)];
        renderStaffTimeline();
    }

    function bindPayslipModalEvents() {
        if (!staffPayslipModal) return;

        staffPayslipCloseBtn?.addEventListener('click', closePayslipModal);
        staffPayslipOverlay?.addEventListener('click', closePayslipModal);

        staffPayslipModal.addEventListener('click', (event) => {
            if (event.target.closest('#staffPayslipHeaderPrintBtn') || event.target.closest('#staffPayslipPrintBtn')) {
                event.preventDefault();
                printPayslipDetail();
                return;
            }
            if (event.target.closest('#staffPayslipCopyBtn')) {
                event.preventDefault();
                copyPayslipDetail();
                return;
            }
            if (event.target.closest('#staffPayslipExcelBtn')) {
                event.preventDefault();
                exportPayslipExcel();
                return;
            }
            if (event.target.closest('#staffPayslipCsvBtn')) {
                event.preventDefault();
                exportPayslipCsv();
                return;
            }
            if (event.target.closest('#staffPayslipPdfBtn')) {
                event.preventDefault();
                exportPayslipPdf();
                return;
            }
            if (event.target.closest('#staffPayslipColumnsBtn')) {
                event.preventDefault();
                event.stopPropagation();
                staffPayslipColumnsDropdown?.classList.toggle('active');
            }
        });

        staffPayslipColumnsDropdown?.addEventListener('change', (event) => {
            const input = event.target.closest('input[data-payslip-col]');
            if (!input) return;
            event.stopPropagation();
            togglePayslipColumn(input.dataset.payslipCol, input.checked);
        });

        staffPayslipColumnsDropdown?.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.addEventListener('click', (event) => {
            closeStaffColumnsDropdowns(event);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && staffPayslipModal && !staffPayslipModal.hidden) {
                closePayslipModal();
            }
        });
    }

    function closeStaffColumnsDropdowns(event) {
        const payslipDropdown = document.getElementById('staffPayslipColumnsDropdown');
        if (payslipDropdown?.classList.contains('active')) {
            const clickedPayslipToggle = event.target.closest('#staffPayslipColumnsBtn')
                || event.target.closest('#staffPayslipColumnsDropdown');
            if (!clickedPayslipToggle) {
                payslipDropdown.classList.remove('active');
            }
        }

        const payrollDropdown = document.getElementById('staffPayrollColumnsDropdown');
        if (payrollDropdown?.classList.contains('active')) {
            const clickedPayrollToggle = event.target.closest('#staffPayrollColumnsBtn')
                || event.target.closest('#staffPayrollColumnsDropdown');
            if (!clickedPayrollToggle) {
                payrollDropdown.classList.remove('active');
            }
        }

        const leavesDropdown = document.getElementById('staffLeavesColumnsDropdown');
        if (leavesDropdown?.classList.contains('active')) {
            const clickedLeavesToggle = event.target.closest('#staffLeavesColumnsBtn')
                || event.target.closest('#staffLeavesColumnsDropdown');
            if (!clickedLeavesToggle) {
                leavesDropdown.classList.remove('active');
            }
        }

        const attendanceDropdown = document.getElementById('staffAttendanceColumnsDropdown');
        if (attendanceDropdown?.classList.contains('active')) {
            const clickedAttendanceToggle = event.target.closest('#staffAttendanceColumnsBtn')
                || event.target.closest('#staffAttendanceColumnsDropdown');
            if (!clickedAttendanceToggle) {
                attendanceDropdown.classList.remove('active');
            }
        }
    }

    function toggleLeaveColumn(columnKey, visible) {
        document.querySelectorAll(`#staffLeavesTable [data-col="${columnKey}"]`).forEach((cell) => {
            cell.style.display = visible ? '' : 'none';
        });
    }

    function applyLeaveColumnVisibility() {
        document.querySelectorAll('#staffLeavesColumnsDropdown input[data-leave-col]').forEach((input) => {
            toggleLeaveColumn(input.dataset.leaveCol, input.checked);
        });
    }

    function togglePayrollColumn(columnKey, visible) {
        document.querySelectorAll(`#staffPayrollTable [data-col="${columnKey}"]`).forEach((cell) => {
            cell.style.display = visible ? '' : 'none';
        });
    }

    function applyPayrollColumnVisibility() {
        document.querySelectorAll('#staffPayrollColumnsDropdown input[data-payroll-col]').forEach((input) => {
            togglePayrollColumn(input.dataset.payrollCol, input.checked);
        });
    }

    function openPayslipModal(staff, payslip) {
        activePayslipDetail = { staff, payslip };
        if (staffPayslipDocument) {
            staffPayslipDocument.innerHTML = renderPayslipDocument(staff, payslip);
        }
        staffPayslipColumnsDropdown?.querySelectorAll('input[data-payslip-col]').forEach((input) => {
            input.checked = true;
            togglePayslipColumn(input.dataset.payslipCol, true);
        });
        staffPayslipColumnsDropdown?.classList.remove('active');
        staffPayslipModal.hidden = false;
    }

    function closePayslipModal() {
        if (!staffPayslipModal) return;
        staffPayslipModal.hidden = true;
        activePayslipDetail = null;
        staffPayslipColumnsDropdown?.classList.remove('active');
    }

    function togglePayslipColumn(columnKey, visible) {
        if (!staffPayslipDocument) return;
        staffPayslipDocument.querySelectorAll(`[data-payslip-section="${columnKey}"]`).forEach((section) => {
            section.classList.toggle('is-hidden', !visible);
        });
    }

    function buildPayslipDetail(staff, payslip) {
        const basicSalary = Number(payslip.basicSalary ?? staff.basicSalary ?? payslip.netSalary) || 45000;
        const grossSalary = Number(payslip.grossSalary ?? basicSalary) || basicSalary;
        const netSalary = Number(payslip.netSalary ?? basicSalary) || basicSalary;
        const totalEarning = Number(payslip.totalEarning ?? 0);
        const totalDeduction = Number(payslip.totalDeduction ?? 0);
        const periodLabel = payslip.monthYear ? payslip.monthYear.replace('-', ' ') : 'February 2021';

        return {
            payslipNo: payslip.payslipNo,
            periodLabel,
            paymentDate: payslip.paymentDate || payslip.date || '-',
            staffId: staff.staffId || '-',
            staffName: staff.fullName || '-',
            department: staff.department || '-',
            designation: staff.designation || '-',
            paymentMode: payslip.mode || '-',
            basicSalary,
            grossSalary,
            netSalary,
            totalEarning,
            totalDeduction
        };
    }

    function renderPayslipDocument(staff, payslip) {
        const detail = buildPayslipDetail(staff, payslip);

        return `
            <div class="staff-payslip-sheet" id="staffPayslipPrintArea">
                <div class="staff-payslip-sheet-header">
                    <div class="staff-payslip-brand">
                        <div class="staff-payslip-logo">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="42" height="42">
                                <rect x="8" y="10" width="34" height="32" fill="#f39c12" rx="2"/>
                                <rect x="10" y="12" width="30" height="28" fill="#f6c544" rx="1"/>
                                <path d="M 25 12 L 25 40" stroke="#f39c12" stroke-width="2"/>
                            </svg>
                            <span>SMART SCHOOL</span>
                        </div>
                        <h4 class="staff-payslip-school-name">Your School Name Here</h4>
                    </div>
                    <div class="staff-payslip-school-contact">
                        <div>Address: 25 Kings Street, CA</div>
                        <div>Phone No.: 89562423934</div>
                        <div>Email: yourschool@gmail.com</div>
                        <div>Website: www.yoursite.in</div>
                    </div>
                </div>
                <div class="staff-payslip-title-bar">Payslip</div>
                <div class="staff-payslip-sheet-body">
                    <h4 class="staff-payslip-period-title">Payslip For The Period Of ${escapeHtml(detail.periodLabel)}</h4>
                    <div class="staff-payslip-meta-row">
                        <span>Payslip #${escapeHtml(detail.payslipNo)}</span>
                        <span>Payment Date: ${escapeHtml(detail.paymentDate)}</span>
                    </div>
                    <div class="staff-payslip-staff-grid" data-payslip-section="staffInfo">
                        <div class="staff-payslip-info-row"><span>Staff ID</span><strong>${escapeHtml(detail.staffId)}</strong></div>
                        <div class="staff-payslip-info-row"><span>Name</span><strong>${escapeHtml(detail.staffName)}</strong></div>
                        <div class="staff-payslip-info-row"><span>Department</span><strong>${escapeHtml(detail.department)}</strong></div>
                        <div class="staff-payslip-info-row"><span>Designation</span><strong>${escapeHtml(detail.designation)}</strong></div>
                    </div>
                    <div class="staff-payslip-ledger">
                        <div class="staff-payslip-ledger-col" data-payslip-section="earning">
                            <table class="staff-payslip-ledger-table">
                                <thead>
                                    <tr>
                                        <th>Earning</th>
                                        <th class="text-end">Amount ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>&nbsp;</td><td class="text-end">${formatSalaryAmount(detail.totalEarning)}</td></tr>
                                    <tr class="staff-payslip-total-row"><td>Total Earning</td><td class="text-end">${formatSalaryAmount(detail.totalEarning)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="staff-payslip-ledger-col" data-payslip-section="deduction">
                            <table class="staff-payslip-ledger-table">
                                <thead>
                                    <tr>
                                        <th>Deduction</th>
                                        <th class="text-end">Amount ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>&nbsp;</td><td class="text-end">${formatSalaryAmount(detail.totalDeduction)}</td></tr>
                                    <tr class="staff-payslip-total-row"><td>Total Deduction</td><td class="text-end">${formatSalaryAmount(detail.totalDeduction)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="staff-payslip-summary" data-payslip-section="summary">
                        <div class="staff-payslip-summary-row"><span>Payment Mode</span><strong>${escapeHtml(detail.paymentMode)}</strong></div>
                        <div class="staff-payslip-summary-row"><span>Basic Salary ($)</span><strong>${formatSalaryAmount(detail.basicSalary)}</strong></div>
                        <div class="staff-payslip-summary-row"><span>Gross Salary ($)</span><strong>${formatSalaryAmount(detail.grossSalary)}</strong></div>
                        <div class="staff-payslip-summary-row"><span>Net Salary ($)</span><strong>${formatSalaryAmount(detail.netSalary)}</strong></div>
                    </div>
                    <p class="staff-payslip-note">This payslip is computer generated hence no signature is required.</p>
                </div>
            </div>
        `;
    }

    function getPayslipExportRows() {
        if (!activePayslipDetail) return [];
        const detail = buildPayslipDetail(activePayslipDetail.staff, activePayslipDetail.payslip);
        return [
            { Field: 'Payslip #', Value: detail.payslipNo },
            { Field: 'Period', Value: detail.periodLabel },
            { Field: 'Payment Date', Value: detail.paymentDate },
            { Field: 'Staff ID', Value: detail.staffId },
            { Field: 'Name', Value: detail.staffName },
            { Field: 'Department', Value: detail.department },
            { Field: 'Designation', Value: detail.designation },
            { Field: 'Payment Mode', Value: detail.paymentMode },
            { Field: 'Total Earning ($)', Value: formatSalaryAmount(detail.totalEarning) },
            { Field: 'Total Deduction ($)', Value: formatSalaryAmount(detail.totalDeduction) },
            { Field: 'Basic Salary ($)', Value: formatSalaryAmount(detail.basicSalary) },
            { Field: 'Gross Salary ($)', Value: formatSalaryAmount(detail.grossSalary) },
            { Field: 'Net Salary ($)', Value: formatSalaryAmount(detail.netSalary) }
        ];
    }

    async function copyPayslipDetail() {
        const rows = getPayslipExportRows();
        if (!rows.length) {
            showAlert('info', 'No payslip details to copy.');
            return;
        }
        const text = rows.map((row) => `${row.Field}\t${row.Value}`).join('\n');
        const copied = await copyTextToClipboard(text);
        if (copied) {
            showAlert('success', 'Payslip details copied to clipboard.');
        } else {
            showAlert('error', 'Failed to copy payslip details.');
        }
    }

    function exportPayslipExcel() {
        const rows = getPayslipExportRows();
        if (!rows.length || !window.XLSX) {
            showAlert('info', 'No payslip details to export.');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip');
        XLSX.writeFile(workbook, `payslip-${activePayslipDetail.payslip.payslipNo}.xlsx`);
    }

    function exportPayslipCsv() {
        const rows = getPayslipExportRows();
        if (!rows.length) {
            showAlert('info', 'No payslip details to export.');
            return;
        }
        const csv = ['Field,Value', ...rows.map((row) => `"${String(row.Field).replace(/"/g, '""')}","${String(row.Value).replace(/"/g, '""')}"`)].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payslip-${activePayslipDetail.payslip.payslipNo}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportPayslipPdf() {
        const rows = getPayslipExportRows();
        if (!rows.length || !window.jspdf) {
            showAlert('info', 'No payslip details to export.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Payslip Details', 14, 18);
        doc.autoTable({
            startY: 24,
            head: [['Field', 'Value']],
            body: rows.map((row) => [row.Field, row.Value]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save(`payslip-${activePayslipDetail.payslip.payslipNo}.pdf`);
    }

    function printPayslipDetail() {
        const printArea = document.getElementById('staffPayslipPrintArea');
        if (!printArea) {
            window.print();
            return;
        }
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            window.print();
            return;
        }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html><head><title>Payslip</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111; }
                .staff-payslip-sheet-header { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 0; }
                .staff-payslip-brand { display: flex; align-items: center; gap: 12px; }
                .staff-payslip-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; }
                .staff-payslip-school-name { margin: 0; font-size: 28px; }
                .staff-payslip-school-contact { text-align: right; font-size: 12px; line-height: 1.5; }
                .staff-payslip-title-bar { background: #111; color: #fff; text-align: center; padding: 6px; margin-top: 0; }
                .staff-payslip-sheet-body { background: #243447; color: #fff; padding: 16px; }
                .staff-payslip-period-title { text-align: center; margin: 0 0 12px; font-size: 22px; font-weight: 400; }
                .staff-payslip-meta-row { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 13px; }
                .staff-payslip-staff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 14px; font-size: 13px; }
                .staff-payslip-info-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 6px 0; }
                .staff-payslip-ledger { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 14px; }
                .staff-payslip-ledger-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .staff-payslip-ledger-table th, .staff-payslip-ledger-table td { border: 1px solid rgba(255,255,255,0.12); padding: 8px; }
                .staff-payslip-ledger-table th { background: rgba(255,255,255,0.08); text-align: left; }
                .text-end { text-align: right; }
                .staff-payslip-summary { margin-left: auto; width: 320px; font-size: 13px; }
                .staff-payslip-summary-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 6px 0; }
                .staff-payslip-note { font-size: 11px; margin-top: 16px; opacity: 0.85; }
                .is-hidden { display: none !important; }
            </style></head><body>${printArea.outerHTML}</body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
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

    function syncReceptionistModeFromStaffRecords() {
        if (!isReceptionistStaffDirectoryMode()) {
            return;
        }

        staffDirectoryContext.restricted = true;
        const ownRecord = resolveOwnStaffFromRecords();
        if (ownRecord && ownRecord.id != null) {
            staffDirectoryContext.currentStaffMemberId = String(ownRecord.id);
        }

        document.documentElement.setAttribute('data-receptionist-staff-directory', 'true');
        if (document.body) {
            document.body.classList.add('receptionist-staff-directory-mode');
        }
    }

    function enforceReceptionistStaffActions() {
        if (!isReceptionistStaffDirectoryMode()) {
            return;
        }

        document.querySelectorAll('.staff-card-edit-btn, .staff-list-edit-btn').forEach((button) => {
            button.remove();
        });

        const ownStaff = resolveOwnStaffFromRecords();
        const ownStaffId = ownStaff ? String(ownStaff.id) : null;

        document.querySelectorAll('.staff-card[data-staff-id], tr[data-staff-id]').forEach((row) => {
            const isOwn = ownStaffId != null && row.dataset.staffId === ownStaffId;

            if (!isOwn) {
                row.querySelectorAll('.staff-card-view-btn, .staff-list-view-btn').forEach((button) => {
                    button.remove();
                });
                row.querySelector('.staff-card-actions')?.remove();
                row.querySelector('.staff-list-action-buttons')?.remove();

                const nameLink = row.querySelector('.staff-list-name-btn');
                if (nameLink) {
                    const plainName = document.createElement('span');
                    plainName.className = 'staff-name-text';
                    plainName.textContent = nameLink.textContent;
                    nameLink.replaceWith(plainName);
                }
                return;
            }

            row.querySelectorAll('.staff-card-view-btn, .staff-list-view-btn').forEach((button) => {
                button.classList.add('staff-own-record-action');
                button.dataset.ownStaff = 'true';
            });
        });
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
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Failed to load staff directory');
            }
            const payload = await response.json();
            if (!Array.isArray(payload)) {
                throw new Error('Invalid staff directory response');
            }
            staffRecords = payload;
            syncReceptionistModeFromStaffRecords();
            listCurrentPage = 1;
            renderStaff();
        } catch (error) {
            staffRecords = [];
            renderStaff();
            showAlert('error', error.message || 'Failed to load staff directory');
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
        if (staffNoRecord) {
            staffNoRecord.hidden = hasRecords;
        }
        if (staffCardGrid) {
            staffCardGrid.hidden = !hasRecords || currentView !== 'card';
        }
        if (staffListWrap) {
            staffListWrap.hidden = !hasRecords || currentView !== 'list';
        }

        if (!hasRecords) {
            if (staffCardGrid) staffCardGrid.innerHTML = '';
            if (staffListBody) staffListBody.innerHTML = '';
            return;
        }

        if (currentView === 'card') {
            if (staffListBody) staffListBody.innerHTML = '';
            if (staffCardGrid) {
                staffCardGrid.innerHTML = staffRecords.map(renderCard).join('');
            }
        } else {
            if (staffCardGrid) staffCardGrid.innerHTML = '';
            renderStaffList();
        }

        enforceReceptionistStaffActions();
    }

    function getRoleText(staff) {
        if (staff.role) {
            return staff.role;
        }
        if (Array.isArray(staff.roles) && staff.roles.length) {
            return staff.roles.join(', ');
        }
        return '-';
    }

    function getFilteredListRecords() {
        let rows = [...staffRecords];
        if (listTableSearch) {
            rows = rows.filter((staff) => {
                const haystack = [
                    staff.staffId,
                    staff.fullName,
                    getRoleText(staff),
                    staff.department,
                    staff.designation,
                    staff.phone,
                    staff.panNumber,
                    staff.email
                ].join(' ').toLowerCase();
                return haystack.includes(listTableSearch);
            });
        }

        rows.sort((a, b) => {
            const left = String(getSortValue(a, listSortField) || '').toLowerCase();
            const right = String(getSortValue(b, listSortField) || '').toLowerCase();
            if (left < right) return listSortDirection === 'asc' ? -1 : 1;
            if (left > right) return listSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }

    function getSortValue(staff, field) {
        if (field === 'role') return getRoleText(staff);
        return staff[field];
    }

    function renderStaffList() {
        if (!staffListBody) {
            return;
        }

        const filtered = getFilteredListRecords();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / listPageSize) || 1);

        if (listCurrentPage > totalPages) {
            listCurrentPage = totalPages;
        }

        const startIndex = total === 0 ? 0 : (listCurrentPage - 1) * listPageSize;
        const pageRows = filtered.slice(startIndex, startIndex + listPageSize);

        if (pageRows.length === 0) {
            staffListBody.innerHTML = `
                <tr>
                    <td colspan="8" class="staff-list-empty">No staff found</td>
                </tr>
            `;
        } else {
            staffListBody.innerHTML = pageRows.map(renderListRow).join('');
        }

        document.getElementById('staffShowingStart').textContent = total === 0 ? '0' : String(startIndex + 1);
        document.getElementById('staffShowingEnd').textContent = total === 0 ? '0' : String(startIndex + pageRows.length);
        document.getElementById('staffTotalEntries').textContent = String(total);
        renderListPagination(totalPages);
        updateSortIndicators();
    }

    function renderListPagination(totalPages) {
        const pagination = document.getElementById('staffPagination');
        if (!pagination) return;

        let html = `<button type="button" class="staff-pagination-btn" data-page="prev" ${listCurrentPage <= 1 ? 'disabled' : ''}>&lsaquo;</button>`;
        for (let page = 1; page <= totalPages; page += 1) {
            html += `<button type="button" class="staff-pagination-btn${page === listCurrentPage ? ' active' : ''}" data-page="${page}">${page}</button>`;
        }
        html += `<button type="button" class="staff-pagination-btn" data-page="next" ${listCurrentPage >= totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
        pagination.innerHTML = html;
    }

    function updateSortIndicators() {
        document.querySelectorAll('#staffListTable thead th.sortable').forEach((header) => {
            const icon = header.querySelector('.sort-icon');
            if (!icon) return;
            if (header.dataset.sort === listSortField) {
                icon.textContent = listSortDirection === 'asc' ? '↑' : '↓';
            } else {
                icon.textContent = '↕';
            }
        });
    }

    function getListExportRows() {
        return getFilteredListRecords().map((staff) => ({
            'Staff ID': staff.staffId || '',
            'Name': staff.fullName || '',
            'Role': getRoleText(staff),
            'Department': staff.department || '',
            'Designation': staff.designation || '',
            'Mobile Number': staff.phone || '',
            'PAN Number': staff.panNumber || ''
        }));
    }

    async function copyStaffList() {
        const rows = getListExportRows();
        if (!rows.length) {
            showAlert('info', 'No staff records to copy.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const text = [headers.join('\t'), ...rows.map((row) => headers.map((key) => row[key]).join('\t'))].join('\n');
        const copied = await copyTextToClipboard(text);
        if (copied) {
            showAlert('success', 'Staff list copied to clipboard.');
        } else {
            showAlert('error', 'Failed to copy staff list.');
        }
    }

    function exportStaffExcel() {
        const rows = getListExportRows();
        if (!rows.length || typeof XLSX === 'undefined') {
            showAlert('info', 'No staff records to export.');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
        XLSX.writeFile(workbook, 'staff-directory.xlsx');
    }

    function exportStaffCsv() {
        const rows = getListExportRows();
        if (!rows.length) {
            showAlert('info', 'No staff records to export.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'staff-directory.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportStaffPdf() {
        const rows = getListExportRows();
        if (!rows.length || !window.jspdf) {
            showAlert('info', 'No staff records to export.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.autoTable({
            head: [['Staff ID', 'Name', 'Role', 'Department', 'Designation', 'Mobile Number', 'PAN Number']],
            body: rows.map((row) => [
                row['Staff ID'], row.Name, row.Role, row.Department,
                row.Designation, row['Mobile Number'], row['PAN Number']
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('staff-directory.pdf');
    }

    function bindCardActions() {
        if (!staffCardGrid) {
            return;
        }
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
                if (!canOpenStaffProfile(staff)) {
                    return;
                }
                viewStaffMember(staff);
            } else if (editBtn) {
                if (!getStaffActionPermissions(staff).edit) {
                    return;
                }
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
        const actions = renderStaffCardActions(staff);

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
                ${actions}
            </article>
        `;
    }

    function renderStaffCardActions(staff) {
        const permissions = getStaffActionPermissions(staff);
        if (!permissions.view && !permissions.edit) {
            return '';
        }

        const viewButton = permissions.view ? `
                    <button type="button" class="staff-card-action-btn staff-card-view-btn${permissions.edit ? '' : ' staff-own-record-action'}" title="View"${permissions.edit ? '' : ' data-own-staff="true"'}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>` : '';
        const editButton = permissions.edit ? `
                    <button type="button" class="staff-card-action-btn staff-card-edit-btn" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>` : '';

        return `
                <div class="staff-card-actions${permissions.edit ? '' : ' staff-own-record-actions'}">
                    ${viewButton}
                    ${editButton}
                </div>
        `;
    }

    async function viewStaffMember(staff) {
        if (!canOpenStaffProfile(staff)) {
            return;
        }

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
        updateProfileHeaderActions(staff);
        staffProfileModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function updateProfileHeaderActions(staff) {
        const headerActions = document.querySelector('.staff-profile-header-actions');
        if (!headerActions) {
            return;
        }
        if (staffDirectoryContext.restricted) {
            headerActions.hidden = true;
            return;
        }
        headerActions.hidden = false;
    }

    function closeStaffProfileModal() {
        staffProfileModal.hidden = true;
        activeProfileStaff = null;
        document.body.style.overflow = '';
        closeStaffTimelineModal();
        const profileDialog = document.querySelector('.staff-profile-dialog');
        if (profileDialog) {
            profileDialog.classList.remove('payroll-tab-active');
            profileDialog.classList.remove('leaves-tab-active');
            profileDialog.classList.remove('attendance-tab-active');
            profileDialog.classList.remove('documents-tab-active');
            profileDialog.classList.remove('timeline-tab-active');
        }
    }

    function switchProfileTab(tabName) {
        staffProfileTabs.querySelectorAll('.staff-profile-tab').forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        staffProfileTabPanels.querySelectorAll('.staff-profile-tab-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.tabPanel === tabName);
        });

        const profileDialog = document.querySelector('.staff-profile-dialog');
        if (profileDialog) {
            profileDialog.classList.toggle('payroll-tab-active', tabName === 'payroll');
            profileDialog.classList.toggle('leaves-tab-active', tabName === 'leaves');
            profileDialog.classList.toggle('attendance-tab-active', tabName === 'attendance');
            profileDialog.classList.toggle('documents-tab-active', tabName === 'documents');
            profileDialog.classList.toggle('timeline-tab-active', tabName === 'timeline');
        }
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
            <div class="staff-profile-tab-panel" data-tab-panel="leaves">${renderLeavesTab()}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="attendance">${renderAttendanceTab()}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="documents">${renderDocumentsTab()}</div>
            <div class="staff-profile-tab-panel" data-tab-panel="timeline">${renderTimelineTab()}</div>
        `;
        initPayrollTab(staff);
        initLeavesTab();
        initAttendanceTab(staff);
        initDocumentsTab(staff);
        initTimelineTab(staff);
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
        const payrollData = getStaffPayrollData(staff);
        const summary = payrollData.summary;
        const walletIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <path d="M16 12h.01"></path>
                <path d="M2 10h20"></path>
            </svg>`;

        return `
            <div class="staff-payroll-panel">
                <div class="staff-payroll-summary-grid">
                    <div class="staff-payroll-stat-card">
                        <div class="staff-payroll-stat-body">
                            <div class="staff-payroll-stat-label">Total Net Salary Paid</div>
                            <div class="staff-payroll-stat-value">${formatCurrency(summary.totalNetSalaryPaid)}</div>
                        </div>
                        <div class="staff-payroll-stat-icon">${walletIcon}</div>
                    </div>
                    <div class="staff-payroll-stat-card">
                        <div class="staff-payroll-stat-body">
                            <div class="staff-payroll-stat-label">Total Gross Salary</div>
                            <div class="staff-payroll-stat-value">${formatCurrency(summary.totalGrossSalary)}</div>
                        </div>
                        <div class="staff-payroll-stat-icon">${walletIcon}</div>
                    </div>
                    <div class="staff-payroll-stat-card">
                        <div class="staff-payroll-stat-body">
                            <div class="staff-payroll-stat-label">Total Earning</div>
                            <div class="staff-payroll-stat-value">${formatCurrency(summary.totalEarning)}</div>
                        </div>
                        <div class="staff-payroll-stat-icon">${walletIcon}</div>
                    </div>
                    <div class="staff-payroll-stat-card">
                        <div class="staff-payroll-stat-body">
                            <div class="staff-payroll-stat-label">Total Deduction</div>
                            <div class="staff-payroll-stat-value">${formatCurrency(summary.totalDeduction)}</div>
                        </div>
                        <div class="staff-payroll-stat-icon">${walletIcon}</div>
                    </div>
                </div>

                <div class="staff-payroll-table-wrap">
                    <div class="staff-table-controls staff-payroll-table-controls">
                        <div class="staff-table-search">
                            <input type="text" class="staff-table-search-input" id="staffPayrollSearch" placeholder="Search">
                        </div>
                        <div class="staff-table-actions">
                            <select class="staff-entries-select" id="staffPayrollEntriesSelect">
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="250">250</option>
                                <option value="500">500</option>
                            </select>
                            <button type="button" class="staff-icon-action-btn" id="staffPayrollCopyBtn" title="Copy">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffPayrollExcelBtn" title="Export to Excel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffPayrollCsvBtn" title="Export to CSV">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffPayrollPdfBtn" title="Export to PDF">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffPayrollPrintBtn" title="Print">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            <div class="staff-payroll-columns-wrap">
                                <button type="button" class="staff-icon-action-btn" id="staffPayrollColumnsBtn" title="Column Visibility">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                </button>
                                <div class="staff-columns-dropdown" id="staffPayrollColumnsDropdown">
                                    <div class="staff-columns-dropdown-header">Toggle Columns</div>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="payslipNo" checked><span>Payslip #</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="monthYear" checked><span>Month - Year</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="date" checked><span>Date</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="mode" checked><span>Mode</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="status" checked><span>Status</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="netSalary" checked><span>Net Salary ($)</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-payroll-col="action" checked><span>Action</span></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="staff-payroll-table" id="staffPayrollTable">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="payslipNo" data-col="payslipNo">Payslip # <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="monthYear" data-col="monthYear">Month - Year <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="date" data-col="date">Date <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="mode" data-col="mode">Mode <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="status" data-col="status">Status <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="netSalary" data-col="netSalary">Net Salary ($) <span class="sort-icon">↕</span></th>
                                    <th data-col="action">Action</th>
                                </tr>
                            </thead>
                            <tbody id="staffPayrollBody"></tbody>
                        </table>
                    </div>

                    <div class="staff-table-footer staff-payroll-table-footer">
                        <div class="staff-showing-info">
                            Showing <span id="staffPayrollShowingStart">0</span> to <span id="staffPayrollShowingEnd">0</span> of <span id="staffPayrollTotalEntries">0</span> entries
                        </div>
                        <div class="staff-pagination" id="staffPayrollPagination"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function getStaffPayrollData(staff) {
        const baseSalary = parseFloat(String(staff.basicSalary || '45000').replace(/,/g, '')) || 45000;
        const payslips = [
            { payslipNo: 1, monthYear: 'February-2021', date: '02/28/2021', paymentDate: '03/05/2021', mode: 'Cash', status: 'Paid', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 },
            { payslipNo: 7, monthYear: 'August-2021', date: '08/31/2021', paymentDate: '09/05/2021', mode: 'Cheque', status: 'Paid', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 },
            { payslipNo: 13, monthYear: 'February-2022', date: '02/28/2022', paymentDate: '03/05/2022', mode: 'Transfer to Bank Account', status: 'Paid', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 },
            { payslipNo: 19, monthYear: 'August-2022', date: '08/31/2022', paymentDate: '09/05/2022', mode: '', status: 'Generated', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 },
            { payslipNo: 25, monthYear: 'February-2023', date: '02/28/2023', paymentDate: '03/05/2023', mode: '', status: 'Generated', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 },
            { payslipNo: 31, monthYear: 'August-2023', date: '08/31/2023', paymentDate: '09/05/2023', mode: '', status: 'Generated', netSalary: baseSalary, grossSalary: baseSalary, basicSalary: baseSalary, totalEarning: 0, totalDeduction: 0 }
        ];

        const paidTotal = payslips
            .filter((row) => row.status === 'Paid')
            .reduce((sum, row) => sum + row.netSalary, 0);

        return {
            summary: {
                totalNetSalaryPaid: Math.max(paidTotal, 671970),
                totalGrossSalary: Math.max(paidTotal + 30, 672000),
                totalEarning: 500,
                totalDeduction: 3530
            },
            payslips
        };
    }

    function initPayrollTab(staff) {
        const payrollData = getStaffPayrollData(staff);
        payrollRecords = payrollData.payslips;
        payrollCurrentPage = 1;
        payrollPageSize = 50;
        payrollSearch = '';
        payrollSortField = 'payslipNo';
        payrollSortDirection = 'asc';

        const searchInput = document.getElementById('staffPayrollSearch');
        const entriesSelect = document.getElementById('staffPayrollEntriesSelect');
        if (searchInput) {
            searchInput.value = '';
        }
        if (entriesSelect) {
            entriesSelect.value = '50';
        }
        renderPayrollTableRows();
        applyPayrollColumnVisibility();
    }

    function getFilteredPayrollRecords() {
        let rows = [...payrollRecords];
        if (payrollSearch) {
            rows = rows.filter((row) => {
                const haystack = [
                    row.payslipNo,
                    row.monthYear,
                    row.date,
                    row.mode,
                    row.status,
                    row.netSalary
                ].join(' ').toLowerCase();
                return haystack.includes(payrollSearch);
            });
        }

        rows.sort((a, b) => {
            let left = a[payrollSortField];
            let right = b[payrollSortField];
            if (payrollSortField === 'payslipNo' || payrollSortField === 'netSalary') {
                left = Number(left) || 0;
                right = Number(right) || 0;
            } else {
                left = String(left || '').toLowerCase();
                right = String(right || '').toLowerCase();
            }
            if (left < right) return payrollSortDirection === 'asc' ? -1 : 1;
            if (left > right) return payrollSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }

    function renderPayrollTableRows() {
        const body = document.getElementById('staffPayrollBody');
        if (!body) return;

        const filtered = getFilteredPayrollRecords();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / payrollPageSize) || 1);

        if (payrollCurrentPage > totalPages) {
            payrollCurrentPage = totalPages;
        }

        const startIndex = total === 0 ? 0 : (payrollCurrentPage - 1) * payrollPageSize;
        const pageRows = filtered.slice(startIndex, startIndex + payrollPageSize);

        if (pageRows.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="7" class="staff-list-empty">No payslip record found</td>
                </tr>
            `;
        } else {
            body.innerHTML = pageRows.map(renderPayrollRow).join('');
        }

        const startEl = document.getElementById('staffPayrollShowingStart');
        const endEl = document.getElementById('staffPayrollShowingEnd');
        const totalEl = document.getElementById('staffPayrollTotalEntries');
        if (startEl) startEl.textContent = total === 0 ? '0' : String(startIndex + 1);
        if (endEl) endEl.textContent = total === 0 ? '0' : String(startIndex + pageRows.length);
        if (totalEl) totalEl.textContent = String(total);

        renderPayrollPagination(totalPages);
        updatePayrollSortIndicators();
        applyPayrollColumnVisibility();
    }

    function renderPayrollRow(row) {
        const statusClass = row.status === 'Paid' ? 'paid' : 'generated';
        const actionCell = row.status === 'Paid'
            ? `<button type="button" class="staff-payroll-view-btn">View Payslip</button>`
            : '';

        return `
            <tr data-payslip-no="${escapeHtml(row.payslipNo)}">
                <td data-col="payslipNo">${escapeHtml(row.payslipNo)}</td>
                <td data-col="monthYear">${escapeHtml(row.monthYear)}</td>
                <td data-col="date">${escapeHtml(row.date)}</td>
                <td data-col="mode">${escapeHtml(row.mode || '')}</td>
                <td data-col="status"><span class="staff-payroll-status staff-payroll-status-${statusClass}">${escapeHtml(row.status)}</span></td>
                <td data-col="netSalary">${escapeHtml(formatSalaryAmount(row.netSalary))}</td>
                <td data-col="action">${actionCell}</td>
            </tr>
        `;
    }

    function renderPayrollPagination(totalPages) {
        const pagination = document.getElementById('staffPayrollPagination');
        if (!pagination) return;

        let html = `<button type="button" class="staff-pagination-btn" data-page="prev" ${payrollCurrentPage <= 1 ? 'disabled' : ''}>&lsaquo;</button>`;
        for (let page = 1; page <= totalPages; page += 1) {
            html += `<button type="button" class="staff-pagination-btn${page === payrollCurrentPage ? ' active' : ''}" data-page="${page}">${page}</button>`;
        }
        html += `<button type="button" class="staff-pagination-btn" data-page="next" ${payrollCurrentPage >= totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
        pagination.innerHTML = html;
    }

    function updatePayrollSortIndicators() {
        document.querySelectorAll('#staffPayrollTable thead th.sortable').forEach((header) => {
            const icon = header.querySelector('.sort-icon');
            if (!icon) return;
            if (header.dataset.sort === payrollSortField) {
                icon.textContent = payrollSortDirection === 'asc' ? '↑' : '↓';
            } else {
                icon.textContent = '↕';
            }
        });
    }

    function getPayrollExportRows() {
        return getFilteredPayrollRecords().map((row) => ({
            'Payslip #': row.payslipNo,
            'Month - Year': row.monthYear,
            'Date': row.date,
            'Mode': row.mode || '',
            'Status': row.status,
            'Net Salary ($)': formatSalaryAmount(row.netSalary)
        }));
    }

    async function copyPayrollList() {
        const rows = getPayrollExportRows();
        if (!rows.length) {
            showAlert('info', 'No payslip records to copy.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const text = [headers.join('\t'), ...rows.map((row) => headers.map((key) => row[key]).join('\t'))].join('\n');
        const copied = await copyTextToClipboard(text);
        if (copied) {
            showAlert('success', 'Payslip records copied to clipboard.');
        } else {
            showAlert('error', 'Failed to copy payslip records.');
        }
    }

    function exportPayrollExcel() {
        const rows = getPayrollExportRows();
        if (!rows.length || !window.XLSX) {
            showAlert('info', 'No payslip records to export.');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
        XLSX.writeFile(workbook, 'staff-payroll.xlsx');
    }

    function exportPayrollCsv() {
        const rows = getPayrollExportRows();
        if (!rows.length) {
            showAlert('info', 'No payslip records to export.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'staff-payroll.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportPayrollPdf() {
        const rows = getPayrollExportRows();
        if (!rows.length || !window.jspdf) {
            showAlert('info', 'No payslip records to export.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.autoTable({
            head: [['Payslip #', 'Month - Year', 'Date', 'Mode', 'Status', 'Net Salary ($)']],
            body: rows.map((row) => [
                row['Payslip #'], row['Month - Year'], row.Date, row.Mode, row.Status, row['Net Salary ($)']
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('staff-payroll.pdf');
    }

    function formatCurrency(amount) {
        return window.formatCurrency(amount);
    }

    function formatSalaryAmount(amount) {
        if (window.AppCurrency) return window.AppCurrency.formatMoney(amount);
        const value = Number(amount) || 0;
        return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderLeavesTab() {
        return `
            <div class="staff-leaves-panel">
                <div class="staff-leaves-table-wrap">
                    <div class="staff-table-controls staff-leaves-table-controls">
                        <div class="staff-table-search">
                            <input type="text" class="staff-table-search-input" id="staffLeavesSearch" placeholder="Search">
                        </div>
                        <div class="staff-table-actions">
                            <select class="staff-entries-select" id="staffLeavesEntriesSelect">
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="250">250</option>
                                <option value="500">500</option>
                            </select>
                            <button type="button" class="staff-icon-action-btn" id="staffLeavesCopyBtn" title="Copy">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffLeavesExcelBtn" title="Export to Excel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffLeavesCsvBtn" title="Export to CSV">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffLeavesPdfBtn" title="Export to PDF">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            <button type="button" class="staff-icon-action-btn" id="staffLeavesPrintBtn" title="Print">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            <div class="staff-leaves-columns-wrap">
                                <button type="button" class="staff-icon-action-btn" id="staffLeavesColumnsBtn" title="Column Visibility">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                </button>
                                <div class="staff-columns-dropdown" id="staffLeavesColumnsDropdown">
                                    <div class="staff-columns-dropdown-header">Toggle Columns</div>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="leaveType" checked><span>Leave Type</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="leaveDate" checked><span>Leave Date</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="days" checked><span>Days</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="applyDate" checked><span>Apply Date</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="status" checked><span>Status</span></label>
                                    <label class="staff-columns-toggle"><input type="checkbox" data-leave-col="action" checked><span>Action</span></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="staff-leaves-table" id="staffLeavesTable">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="leaveType" data-col="leaveType">Leave Type <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="leaveDate" data-col="leaveDate">Leave Date <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="days" data-col="days">Days <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="applyDate" data-col="applyDate">Apply Date <span class="sort-icon">↕</span></th>
                                    <th class="sortable" data-sort="status" data-col="status">Status <span class="sort-icon">↕</span></th>
                                    <th data-col="action">Action</th>
                                </tr>
                            </thead>
                            <tbody id="staffLeavesBody"></tbody>
                        </table>
                    </div>

                    <div class="staff-table-footer staff-leaves-table-footer">
                        <div class="staff-showing-info">
                            Showing <span id="staffLeavesShowingStart">0</span> to <span id="staffLeavesShowingEnd">0</span> of <span id="staffLeavesTotalEntries">0</span> entries
                        </div>
                        <div class="staff-pagination" id="staffLeavesPagination"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function leaveEmptyStateHtml(colspan) {
        return ''
            + '<tr class="empty-row"><td colspan="' + colspan + '">'
            + '<div class="empty-state">'
            + '<p class="empty-message">No data available in table</p>'
            + '<div class="empty-illustration">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100" fill="none">'
            + '<rect x="30" y="35" width="60" height="45" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>'
            + '<path d="M30 45h60" stroke="#cbd5e1" stroke-width="2"/>'
            + '<path d="M45 35v-8a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v8" stroke="#94a3b8" stroke-width="2" fill="none"/>'
            + '<rect x="52" y="18" width="22" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(-8 63 32)"/>'
            + '<rect x="62" y="12" width="22" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(6 73 26)"/>'
            + '<rect x="42" y="14" width="22" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(-14 53 28)"/>'
            + '</svg></div>'
            + '<p class="empty-hint">← Add new record or search with different criteria.</p>'
            + '</div></td></tr>';
    }

    function initLeavesTab() {
        leaveCurrentPage = 1;
        leavePageSize = 50;
        leaveTableSearch = '';
        leaveSortField = 'leaveType';
        leaveSortDirection = 'asc';

        const searchInput = document.getElementById('staffLeavesSearch');
        const entriesSelect = document.getElementById('staffLeavesEntriesSelect');
        if (searchInput) {
            searchInput.value = '';
        }
        if (entriesSelect) {
            entriesSelect.value = '50';
        }
        renderLeavesTableRows();
        applyLeaveColumnVisibility();
    }

    function getFilteredLeaveRecords() {
        let rows = [...leaveRecords];
        if (leaveTableSearch) {
            rows = rows.filter((row) => {
                const haystack = [
                    row.leaveType,
                    row.leaveDate,
                    row.days,
                    row.applyDate,
                    row.status
                ].join(' ').toLowerCase();
                return haystack.includes(leaveTableSearch);
            });
        }

        rows.sort((a, b) => {
            let left = a[leaveSortField];
            let right = b[leaveSortField];
            if (leaveSortField === 'days') {
                left = Number(left) || 0;
                right = Number(right) || 0;
            } else {
                left = String(left || '').toLowerCase();
                right = String(right || '').toLowerCase();
            }
            if (left < right) return leaveSortDirection === 'asc' ? -1 : 1;
            if (left > right) return leaveSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }

    function renderLeavesTableRows() {
        const body = document.getElementById('staffLeavesBody');
        if (!body) return;

        const filtered = getFilteredLeaveRecords();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / leavePageSize) || 1);

        if (leaveCurrentPage > totalPages) {
            leaveCurrentPage = totalPages;
        }

        const startIndex = total === 0 ? 0 : (leaveCurrentPage - 1) * leavePageSize;
        const pageRows = filtered.slice(startIndex, startIndex + leavePageSize);

        if (pageRows.length === 0) {
            body.innerHTML = leaveEmptyStateHtml(6);
        } else {
            body.innerHTML = pageRows.map(renderLeaveRow).join('');
        }

        const startEl = document.getElementById('staffLeavesShowingStart');
        const endEl = document.getElementById('staffLeavesShowingEnd');
        const totalEl = document.getElementById('staffLeavesTotalEntries');
        if (startEl) startEl.textContent = total === 0 ? '0' : String(startIndex + 1);
        if (endEl) endEl.textContent = total === 0 ? '0' : String(startIndex + pageRows.length);
        if (totalEl) totalEl.textContent = String(total);

        renderLeavesPagination(totalPages);
        updateLeaveSortIndicators();
        applyLeaveColumnVisibility();
    }

    function renderLeaveRow(row) {
        const statusKey = String(row.status || '').toLowerCase().replace(/\s+/g, '-');
        return `
            <tr data-leave-id="${escapeHtml(row.id || '')}">
                <td data-col="leaveType">${escapeHtml(row.leaveType || '')}</td>
                <td data-col="leaveDate">${escapeHtml(row.leaveDate || '')}</td>
                <td data-col="days">${escapeHtml(row.days || '')}</td>
                <td data-col="applyDate">${escapeHtml(row.applyDate || '')}</td>
                <td data-col="status"><span class="staff-leave-status staff-leave-status-${escapeHtml(statusKey)}">${escapeHtml(row.status || '')}</span></td>
                <td data-col="action"></td>
            </tr>
        `;
    }

    function renderLeavesPagination(totalPages) {
        const pagination = document.getElementById('staffLeavesPagination');
        if (!pagination) return;

        let html = `<button type="button" class="staff-pagination-btn" data-page="prev" ${leaveCurrentPage <= 1 ? 'disabled' : ''}>&lsaquo;</button>`;
        for (let page = 1; page <= totalPages; page += 1) {
            html += `<button type="button" class="staff-pagination-btn${page === leaveCurrentPage ? ' active' : ''}" data-page="${page}">${page}</button>`;
        }
        html += `<button type="button" class="staff-pagination-btn" data-page="next" ${leaveCurrentPage >= totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
        pagination.innerHTML = html;
    }

    function updateLeaveSortIndicators() {
        document.querySelectorAll('#staffLeavesTable thead th.sortable').forEach((header) => {
            const icon = header.querySelector('.sort-icon');
            if (!icon) return;
            if (header.dataset.sort === leaveSortField) {
                icon.textContent = leaveSortDirection === 'asc' ? '↑' : '↓';
            } else {
                icon.textContent = '↕';
            }
        });
    }

    function getLeaveExportRows() {
        return getFilteredLeaveRecords().map((row) => ({
            'Leave Type': row.leaveType || '',
            'Leave Date': row.leaveDate || '',
            'Days': row.days || '',
            'Apply Date': row.applyDate || '',
            'Status': row.status || ''
        }));
    }

    async function copyLeavesList() {
        const rows = getLeaveExportRows();
        if (!rows.length) {
            showAlert('info', 'No leave records to copy.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const text = [headers.join('\t'), ...rows.map((row) => headers.map((key) => row[key]).join('\t'))].join('\n');
        const copied = await copyTextToClipboard(text);
        if (copied) {
            showAlert('success', 'Leave records copied to clipboard.');
        } else {
            showAlert('error', 'Failed to copy leave records.');
        }
    }

    function exportLeavesExcel() {
        const rows = getLeaveExportRows();
        if (!rows.length || !window.XLSX) {
            showAlert('info', 'No leave records to export.');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaves');
        XLSX.writeFile(workbook, 'staff-leaves.xlsx');
    }

    function exportLeavesCsv() {
        const rows = getLeaveExportRows();
        if (!rows.length) {
            showAlert('info', 'No leave records to export.');
            return;
        }
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'staff-leaves.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportLeavesPdf() {
        const rows = getLeaveExportRows();
        if (!rows.length || !window.jspdf) {
            showAlert('info', 'No leave records to export.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.autoTable({
            head: [['Leave Type', 'Leave Date', 'Days', 'Apply Date', 'Status']],
            body: rows.map((row) => [
                row['Leave Type'], row['Leave Date'], row.Days, row['Apply Date'], row.Status
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('staff-leaves.pdf');
    }

    function renderAttendanceTab() {
        const currentYear = new Date().getFullYear();
        const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
            .map((year) => `<option value="${year}"${year === staffAttendanceYear ? ' selected' : ''}>${year}</option>`)
            .join('');

        return `
            <div class="staff-attendance-panel">
                <div class="staff-attendance-summary-grid" id="staffAttendanceStats"></div>

                <div class="staff-attendance-controls">
                    <div class="staff-attendance-year-wrap">
                        <label class="staff-attendance-year-label" for="staffAttendanceYear">Year</label>
                        <select class="staff-attendance-year-select" id="staffAttendanceYear">${yearOptions}</select>
                    </div>

                    <div class="staff-attendance-legend">
                        <span><em class="staff-att-code present">P</em> Present</span>
                        <span><em class="staff-att-code late">L</em> Late</span>
                        <span><em class="staff-att-code absent">A</em> Absent</span>
                        <span><em class="staff-att-code half">F</em> Half Day</span>
                        <span><em class="staff-att-code holiday">H</em> Holiday</span>
                        <span><em class="staff-att-code second-half">SH</em> Half Day (Second Half)</span>
                    </div>

                    <div class="staff-attendance-actions">
                        <button type="button" class="staff-icon-action-btn" id="staffAttendanceCopyBtn" title="Copy">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button type="button" class="staff-icon-action-btn" id="staffAttendanceExcelBtn" title="Export to Excel">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </button>
                        <button type="button" class="staff-icon-action-btn" id="staffAttendanceCsvBtn" title="Export to CSV">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </button>
                        <button type="button" class="staff-icon-action-btn" id="staffAttendancePdfBtn" title="Export to PDF">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>
                        <button type="button" class="staff-icon-action-btn" id="staffAttendancePrintBtn" title="Print">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>
                        <div class="staff-attendance-columns-wrap">
                            <button type="button" class="staff-icon-action-btn" id="staffAttendanceColumnsBtn" title="Column Visibility">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </button>
                            <div class="staff-columns-dropdown" id="staffAttendanceColumnsDropdown"></div>
                        </div>
                    </div>
                </div>

                <div class="staff-attendance-table-wrap">
                    <div class="table-responsive">
                        <table class="staff-attendance-table" id="staffAttendanceTable">
                            <thead id="staffAttendanceHead"></thead>
                            <tbody id="staffAttendanceBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function initAttendanceTab(staff) {
        staffAttendanceYear = 2026;
        const yearSelect = document.getElementById('staffAttendanceYear');
        if (yearSelect) {
            yearSelect.value = String(staffAttendanceYear);
        }
        renderStaffAttendancePanel(staff);
    }

    function buildStaffAttendanceMonths(year) {
        return [
            { key: 'jan', label: 'January', monthIndex: 0, year },
            { key: 'feb', label: 'February', monthIndex: 1, year },
            { key: 'mar', label: 'March', monthIndex: 2, year },
            { key: 'apr', label: 'April', monthIndex: 3, year },
            { key: 'may', label: 'May', monthIndex: 4, year },
            { key: 'jun', label: 'June', monthIndex: 5, year },
            { key: 'jul', label: 'July', monthIndex: 6, year },
            { key: 'aug', label: 'August', monthIndex: 7, year },
            { key: 'sep', label: 'September', monthIndex: 8, year },
            { key: 'oct', label: 'October', monthIndex: 9, year },
            { key: 'nov', label: 'November', monthIndex: 10, year },
            { key: 'dec', label: 'December', monthIndex: 11, year }
        ];
    }

    function staffDaysInMonth(monthIndex, year) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function buildStaffDemoAttendance(staff, year) {
        const months = buildStaffAttendanceMonths(year);
        const seed = parseInt(staff?.id, 10) || 1;
        const pattern = ['P', 'P', 'A', 'L', 'P', 'H', 'F', 'P', 'L', 'P', 'A', 'P', 'SH', 'L', 'P', 'H', 'P', 'A', 'L', 'P', 'P', 'F', 'L', 'P', 'A', 'H', 'P', 'L', 'P', 'F', 'P'];
        const data = {};

        months.forEach((month, monthIndex) => {
            data[month.key] = {};
            const maxDay = staffDaysInMonth(month.monthIndex, month.year);
            for (let day = 1; day <= maxDay; day += 1) {
                const date = new Date(month.year, month.monthIndex, day);
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    continue;
                }
                const patternIndex = (day + monthIndex * 5 + seed + year) % pattern.length;
                data[month.key][day] = pattern[patternIndex];
            }
        });

        return { months, data, year };
    }

    function staffAttendanceCodeClass(code) {
        switch (String(code || '').toUpperCase()) {
            case 'P': return 'present';
            case 'L': return 'late';
            case 'A': return 'absent';
            case 'H': return 'holiday';
            case 'F': return 'half';
            case 'SH': return 'second-half';
            default: return '';
        }
    }

    function staffAttendanceCellHtml(code) {
        if (!code) return '';
        const cls = staffAttendanceCodeClass(code);
        return `<em class="staff-att-code ${cls}">${escapeHtml(String(code).toUpperCase())}</em>`;
    }

    function countStaffAttendance(data) {
        const counts = { P: 0, L: 0, A: 0, F: 0, H: 0, SH: 0 };
        Object.keys(data).forEach((monthKey) => {
            Object.keys(data[monthKey]).forEach((day) => {
                const code = String(data[monthKey][day] || '').toUpperCase();
                if (counts[code] != null) {
                    counts[code] += 1;
                }
            });
        });
        return counts;
    }

    function renderStaffAttendancePanel(staff) {
        const statsEl = document.getElementById('staffAttendanceStats');
        const headEl = document.getElementById('staffAttendanceHead');
        const bodyEl = document.getElementById('staffAttendanceBody');
        const columnsDropdown = document.getElementById('staffAttendanceColumnsDropdown');
        if (!statsEl || !headEl || !bodyEl) return;

        const attendance = buildStaffDemoAttendance(staff, staffAttendanceYear);
        staffAttendanceExport = attendance;
        const counts = countStaffAttendance(attendance.data);

        const checkIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                <path d="M8 12l3 3 5-6"></path>
            </svg>`;

        const cards = [
            { label: 'Total Present', value: counts.P },
            { label: 'Total Late', value: counts.L },
            { label: 'Total Absent', value: counts.A },
            { label: 'Total Half Day', value: counts.F },
            { label: 'Total Holiday', value: counts.H },
            { label: 'Half Day (Second Half)', value: counts.SH }
        ];

        statsEl.innerHTML = cards.map((card) => `
            <div class="staff-attendance-stat-card">
                <div class="staff-attendance-stat-body">
                    <div class="staff-attendance-stat-label">${escapeHtml(card.label)}</div>
                    <div class="staff-attendance-stat-value">${escapeHtml(String(card.value))}</div>
                </div>
                <div class="staff-attendance-stat-icon">${checkIcon}</div>
            </div>
        `).join('');

        if (columnsDropdown) {
            columnsDropdown.innerHTML = `
                <div class="staff-columns-dropdown-header">Toggle Columns</div>
                ${attendance.months.map((month) => `
                    <label class="staff-columns-toggle">
                        <input type="checkbox" data-attendance-col="${escapeHtml(month.key)}" checked>
                        <span>${escapeHtml(month.label)}</span>
                    </label>
                `).join('')}
            `;
        }

        headEl.innerHTML = `
            <tr>
                <th data-col="date">Date | Month</th>
                ${attendance.months.map((month) => `
                    <th data-col="${escapeHtml(month.key)}">${escapeHtml(month.label)}</th>
                `).join('')}
            </tr>
        `;

        let bodyHtml = '';
        for (let day = 1; day <= 31; day += 1) {
            const dayLabel = String(day).padStart(2, '0');
            bodyHtml += `<tr><td data-col="date">${dayLabel}</td>`;
            attendance.months.forEach((month) => {
                const maxDay = staffDaysInMonth(month.monthIndex, month.year);
                const code = day <= maxDay ? (attendance.data[month.key][day] || '') : '';
                bodyHtml += `<td data-col="${escapeHtml(month.key)}">${staffAttendanceCellHtml(code)}</td>`;
            });
            bodyHtml += '</tr>';
        }
        bodyEl.innerHTML = bodyHtml;
        applyStaffAttendanceColumnVisibility();
    }

    function toggleStaffAttendanceColumn(columnKey, visible) {
        document.querySelectorAll(`#staffAttendanceTable [data-col="${columnKey}"]`).forEach((cell) => {
            cell.style.display = visible ? '' : 'none';
        });
    }

    function applyStaffAttendanceColumnVisibility() {
        document.querySelectorAll('#staffAttendanceColumnsDropdown input[data-attendance-col]').forEach((input) => {
            toggleStaffAttendanceColumn(input.dataset.attendanceCol, input.checked);
        });
    }

    function staffAttendanceToTsv(attendance) {
        const months = attendance.months;
        const lines = [['Date | Month'].concat(months.map((month) => month.label)).join('\t')];
        for (let day = 1; day <= 31; day += 1) {
            const row = [String(day).padStart(2, '0')];
            months.forEach((month) => {
                const maxDay = staffDaysInMonth(month.monthIndex, month.year);
                row.push(day <= maxDay ? (attendance.data[month.key][day] || '') : '');
            });
            lines.push(row.join('\t'));
        }
        return lines.join('\n');
    }

    async function copyStaffAttendance() {
        if (!staffAttendanceExport) {
            showAlert('info', 'No attendance records to copy.');
            return;
        }
        const copied = await copyTextToClipboard(staffAttendanceToTsv(staffAttendanceExport));
        if (copied) {
            showAlert('success', 'Attendance copied to clipboard.');
        } else {
            showAlert('error', 'Failed to copy attendance.');
        }
    }

    function exportStaffAttendanceCsv() {
        if (!staffAttendanceExport) {
            showAlert('info', 'No attendance records to export.');
            return;
        }
        const csv = staffAttendanceToTsv(staffAttendanceExport).split('\n').map((line) => {
            return line.split('\t').map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'staff-attendance.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportStaffAttendanceExcel() {
        if (!staffAttendanceExport || !window.XLSX) {
            showAlert('info', 'No attendance records to export.');
            return;
        }
        const months = staffAttendanceExport.months;
        const rows = [];
        for (let day = 1; day <= 31; day += 1) {
            const row = { 'Date | Month': String(day).padStart(2, '0') };
            months.forEach((month) => {
                const maxDay = staffDaysInMonth(month.monthIndex, month.year);
                row[month.label] = day <= maxDay ? (staffAttendanceExport.data[month.key][day] || '') : '';
            });
            rows.push(row);
        }
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, 'staff-attendance.xlsx');
    }

    function exportStaffAttendancePdf() {
        if (!staffAttendanceExport || !window.jspdf) {
            showAlert('info', 'No attendance records to export.');
            return;
        }
        const months = staffAttendanceExport.months;
        const head = ['Date | Month'].concat(months.map((month) => month.label));
        const body = [];
        for (let day = 1; day <= 31; day += 1) {
            const row = [String(day).padStart(2, '0')];
            months.forEach((month) => {
                const maxDay = staffDaysInMonth(month.monthIndex, month.year);
                row.push(day <= maxDay ? (staffAttendanceExport.data[month.key][day] || '') : '');
            });
            body.push(row);
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.autoTable({
            head: [head],
            body,
            styles: { fontSize: 7 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('staff-attendance.pdf');
    }

    function renderDocumentsTab() {
        return `
            <div class="staff-documents-panel">
                <div class="staff-documents-content" id="staffDocumentsContent"></div>
            </div>
        `;
    }

    function getStaffDocuments(staff) {
        const entries = [
            { title: 'Resume', path: staff?.resumePath },
            { title: 'Joining Letter', path: staff?.joiningLetterPath },
            { title: 'Resignation Letter', path: staff?.resignationLetterPath },
            { title: 'Other Documents', path: staff?.otherDocumentPath }
        ];

        return entries
            .filter((entry) => entry.path)
            .map((entry) => ({
                title: entry.title,
                path: entry.path,
                fileName: entry.path.split('/').pop() || entry.path
            }));
    }

    function initDocumentsTab(staff) {
        const content = document.getElementById('staffDocumentsContent');
        if (!content) return;

        const documents = getStaffDocuments(staff);
        if (!documents.length) {
            content.innerHTML = '<div class="staff-documents-empty">No Record Found</div>';
            return;
        }

        content.innerHTML = `
            <div class="staff-documents-table-wrap">
                <table class="staff-documents-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>File Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${documents.map((doc) => `
                            <tr>
                                <td>${escapeHtml(doc.title)}</td>
                                <td>${escapeHtml(doc.fileName)}</td>
                                <td>
                                    <a href="${escapeHtml(doc.path)}" class="staff-profile-doc-link" target="_blank" rel="noopener">View</a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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
        if (!staff || !staff.id) {
            showAlert('error', 'Staff member not found.');
            return;
        }
        window.location.href = '/staff/edit/' + encodeURIComponent(staff.id);
    }

    async function openEditView(id) {
        try {
            const response = await fetch('/api/staff/' + encodeURIComponent(id));
            if (!response.ok) {
                throw new Error('Staff member not found');
            }
            const staff = await response.json();
            showAddViewLocal(false);
            populateStaffForm(staff);
        } catch (error) {
            showAlert('error', error.message);
            window.location.href = '/staff';
        }
    }

    function populateStaffForm(staff) {
        setFieldValue('staffRecordId', staff.id || '');
        setFieldValue('staffId', staff.staffId || '');
        const staffIdField = document.getElementById('staffId');
        if (staffIdField) {
            staffIdField.readOnly = false;
            staffIdField.title = '';
        }
        setFieldValue('role', staff.role || (Array.isArray(staff.roles) ? staff.roles[0] : '') || '');
        setFieldValue('designation', staff.designation || '');
        setFieldValue('department', staff.department || '');
        setFieldValue('firstName', staff.firstName || '');
        setFieldValue('lastName', staff.lastName || '');
        setFieldValue('fatherName', staff.fatherName || '');
        setFieldValue('motherName', staff.motherName || '');
        setFieldValue('email', staff.email || '');
        setFieldValue('gender', staff.gender || '');
        setFieldValue('dateOfBirth', staff.dateOfBirth || '');
        setFieldValue('dateOfJoining', staff.dateOfJoining || '');
        setFieldValue('phone', staff.phone || '');
        setFieldValue('emergencyContact', staff.emergencyContact || '');
        setFieldValue('maritalStatus', staff.maritalStatus || '');
        setFieldValue('address', staff.address || '');
        setFieldValue('permanentAddress', staff.permanentAddress || '');
        setFieldValue('qualification', staff.qualification || '');
        setFieldValue('workExperience', staff.workExperience || '');
        setFieldValue('note', staff.note || '');
        setFieldValue('panNumber', staff.panNumber || '');
        setFieldValue('location', staff.location || '');
        setFieldValue('epfNo', staff.epfNo || '');
        setFieldValue('basicSalary', staff.basicSalary || '');
        setFieldValue('contractType', staff.contractType || '');
        setFieldValue('workShift', staff.workShift || '');
        setFieldValue('workLocation', staff.workLocation || '');
        setFieldValue('medicalLeave', staff.medicalLeave ?? '');
        setFieldValue('casualLeave', staff.casualLeave ?? '');
        setFieldValue('maternityLeave', staff.maternityLeave ?? '');
        setFieldValue('sickLeave', staff.sickLeave ?? '');
        setFieldValue('mandatoryLeave', staff.mandatoryLeave ?? '');
        setFieldValue('accountTitle', staff.accountTitle || '');
        setFieldValue('bankAccountNumber', staff.bankAccountNumber || '');
        setFieldValue('bankName', staff.bankName || '');
        setFieldValue('ifscCode', staff.ifscCode || '');
        setFieldValue('bankBranchName', staff.bankBranchName || '');
        setFieldValue('facebookUrl', staff.facebookUrl || '');
        setFieldValue('twitterUrl', staff.twitterUrl || '');
        setFieldValue('linkedinUrl', staff.linkedinUrl || '');
        setFieldValue('instagramUrl', staff.instagramUrl || '');

        staffPhoto.value = '';
        staffPhotoLabel.textContent = staff.photoPath
            ? 'Current: ' + fileNameFromPath(staff.photoPath)
            : 'Drag and drop a file here or click';

        resetDocumentLabels();
        setExistingDocumentLabel('resumeFileLabel', staff.resumePath);
        setExistingDocumentLabel('joiningLetterFileLabel', staff.joiningLetterPath);
        setExistingDocumentLabel('resignationLetterFileLabel', staff.resignationLetterPath);
        setExistingDocumentLabel('otherDocumentFileLabel', staff.otherDocumentPath);

        if (hasExtendedStaffDetails(staff)) {
            expandMoreDetails();
        } else {
            collapseMoreDetails();
        }

        updateFormMode(Boolean(staff.id));
    }

    function setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (field) {
            field.value = value == null ? '' : String(value);
        }
    }

    function fileNameFromPath(path) {
        if (!path) return '';
        const parts = String(path).split('/');
        return parts[parts.length - 1] || String(path);
    }

    function setExistingDocumentLabel(labelId, path) {
        const label = document.getElementById(labelId);
        if (label && path) {
            label.textContent = 'Current: ' + fileNameFromPath(path);
        }
    }

    function hasExtendedStaffDetails(staff) {
        const fields = [
            'epfNo', 'basicSalary', 'contractType', 'workShift', 'workLocation',
            'medicalLeave', 'casualLeave', 'maternityLeave', 'sickLeave', 'mandatoryLeave',
            'accountTitle', 'bankAccountNumber', 'bankName', 'ifscCode', 'bankBranchName',
            'facebookUrl', 'twitterUrl', 'linkedinUrl', 'instagramUrl',
            'resumePath', 'joiningLetterPath', 'resignationLetterPath', 'otherDocumentPath'
        ];
        return fields.some((field) => {
            const value = staff[field];
            return value !== null && value !== undefined && String(value).trim() !== '';
        });
    }

    function updateFormMode(isEdit) {
        if (staffFormTitle) {
            staffFormTitle.textContent = isEdit ? 'Edit Staff' : 'Basic Information';
        }
        if (saveStaffBtn) {
            saveStaffBtn.textContent = isEdit ? 'Update' : 'Save';
        }
    }

    function renderListRow(staff) {
        const roles = getRoleText(staff);
        const permissions = getStaffActionPermissions(staff);
        const nameCell = permissions.view
            ? `<button type="button" class="staff-name-link staff-list-name-btn">${escapeHtml(staff.fullName || '')}</button>`
            : `<span class="staff-name-text">${escapeHtml(staff.fullName || '')}</span>`;
        const actions = renderStaffListActions(staff, permissions);

        return `
            <tr data-staff-id="${escapeHtml(staff.id)}">
                <td>${escapeHtml(staff.staffId || '')}</td>
                <td>${nameCell}</td>
                <td>${escapeHtml(roles)}</td>
                <td>${escapeHtml(staff.department || '-')}</td>
                <td>${escapeHtml(staff.designation || '-')}</td>
                <td>${escapeHtml(staff.phone || '-')}</td>
                <td>${escapeHtml(staff.panNumber || '-')}</td>
                <td>${actions}</td>
            </tr>
        `;
    }

    function renderStaffListActions(staff, permissions) {
        if (!permissions.view && !permissions.edit) {
            return '';
        }

        const viewButton = permissions.view ? `
                        <button type="button" class="staff-list-action-btn staff-list-view-btn${permissions.edit ? '' : ' staff-own-record-action'}" title="View"${permissions.edit ? '' : ' data-own-staff="true"'}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>` : '';
        const editButton = permissions.edit ? `
                        <button type="button" class="staff-list-action-btn staff-list-edit-btn" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                            </svg>
                        </button>` : '';

        return `
                    <div class="staff-list-action-buttons${permissions.edit ? '' : ' staff-own-record-actions'}">
                        ${viewButton}
                        ${editButton}
                    </div>
        `;
    }

    function showAddViewLocal(resetForm = true) {
        directoryView.hidden = true;
        addView.hidden = false;
        if (!resetForm) {
            return;
        }
        staffForm.reset();
        document.getElementById('staffRecordId').value = '';
        staffPhoto.value = '';
        staffPhotoLabel.textContent = 'Drag and drop a file here or click';
        collapseMoreDetails();
        resetDocumentLabels();
        updateFormMode(false);
        applyAutoStaffId();
    }

    async function applyAutoStaffId() {
        const field = document.getElementById('staffId');
        if (!field) return;

        try {
            const response = await fetch('/api/schsettings/id-auto-generation/next-staff-id');
            if (!response.ok) return;
            const data = await response.json();
            autoStaffIdEnabled = !!data.autoEnabled;

            if (autoStaffIdEnabled && data.nextId) {
                field.value = data.nextId;
                field.readOnly = true;
                field.title = 'Staff ID is generated automatically';
            } else {
                field.readOnly = false;
                field.title = '';
            }
        } catch (error) {
            console.error(error);
        }
    }

    function showDirectoryViewLocal() {
        addView.hidden = true;
        directoryView.hidden = false;
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
        documentFields.forEach(({ inputId, labelId }) => {
            const input = document.getElementById(inputId);
            const label = document.getElementById(labelId);
            if (input) {
                input.value = '';
            }
            if (label) {
                label.textContent = 'Drag and drop a file here or click';
            }
        });
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

        const recordId = document.getElementById('staffRecordId').value.trim();
        const url = recordId ? '/api/staff/' + encodeURIComponent(recordId) : '/api/staff';
        const method = recordId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save staff member');
            }
            showAlert('success', result.message || 'Staff member saved successfully!');
            window.location.href = '/staff';
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

    async function copyTextToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            // Fall through to legacy copy method.
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }
        document.body.removeChild(textarea);
        return copied;
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
