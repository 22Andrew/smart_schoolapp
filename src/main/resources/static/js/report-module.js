document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('reportPageRoot');
    if (!root) return;

    const category = root.dataset.category || '';
    const reportType = root.dataset.reportType || '';
    const apiUrl = root.dataset.apiUrl || '';
    const showClassSection = root.dataset.showClassSection === 'true';
    const showDateRange = root.dataset.showDateRange === 'true';
    const needsSearch = root.dataset.needsSearch === 'true';
    const showStudentFilters = root.dataset.showStudentFilters === 'true';
    const showStaffAttendanceCriteria = root.dataset.showStaffAttendanceCriteria === 'true';
    const showStaffDayWiseCriteria = root.dataset.showStaffDayWiseCriteria === 'true';
    const showOnlineExamCriteria = root.dataset.showOnlineExamCriteria === 'true';
    const showOnlineExamDateCriteria = root.dataset.showOnlineExamDateCriteria === 'true';
    const showFinanceSearchTypeCriteria = root.dataset.showFinanceSearchTypeCriteria === 'true';
    const showFinanceCollectionCriteria = root.dataset.showFinanceCollectionCriteria === 'true';
    const showFinanceFeesStatementCriteria = root.dataset.showFinanceFeesStatementCriteria === 'true';
    const showFinanceIncomeHeadCriteria = root.dataset.showFinanceIncomeHeadCriteria === 'true';
    const showFinanceExpenseHeadCriteria = root.dataset.showFinanceExpenseHeadCriteria === 'true';

    const classSelect = document.getElementById('classSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const categorySelect = document.getElementById('categorySelect');
    const genderSelect = document.getElementById('genderSelect');
    const rteSelect = document.getElementById('rteSelect');
    const onlineExamSelect = document.getElementById('onlineExamSelect');
    const onlineExamSearchType = document.getElementById('onlineExamSearchType');
    const onlineExamDateType = document.getElementById('onlineExamDateType');
    const staffRoleSelect = document.getElementById('staffRoleSelect');
    const staffMonthSelect = document.getElementById('staffMonthSelect');
    const staffYearSelect = document.getElementById('staffYearSelect');
    const staffDateInput = document.getElementById('staffDateInput');
    const staffSourceSelect = document.getElementById('staffSourceSelect');
    const financeSearchType = document.getElementById('financeSearchType');
    const financeSearchDuration = document.getElementById('financeSearchDuration');
    const financeFeeTypeSelect = document.getElementById('financeFeeTypeSelect');
    const financeCollectBySelect = document.getElementById('financeCollectBySelect');
    const financeGroupBySelect = document.getElementById('financeGroupBySelect');
    const financeStudentSelect = document.getElementById('financeStudentSelect');
    const financeIncomeHeadSelect = document.getElementById('financeIncomeHeadSelect');
    const financeExpenseHeadSelect = document.getElementById('financeExpenseHeadSelect');
    const dateFromInput = document.getElementById('dateFromInput');
    const dateToInput = document.getElementById('dateToInput');
    const searchBtn = document.getElementById('searchBtn');
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const tableSearchInput = document.getElementById('tableSearchInput');
    const entriesSelect = document.getElementById('entriesSelect');
    const showingInfo = document.getElementById('showingInfo');
    const pagination = document.getElementById('pagination');
    const emptyHint = document.getElementById('emptyHint');
    const listTitle = document.getElementById('listTitle');

    let classes = [];
    let masterSections = [];
    let rows = [];
    let columns = [];
    let currentPage = 1;
    let pageSize = parseInt(entriesSelect && entriesSelect.value, 10) || 50;
    let tableFilter = '';
    let sortKey = '';
    let sortDir = 'asc';

    const LABELS = {
        admissionNo: 'Admission No',
        rollNumber: 'Roll Number',
        name: 'Name',
        studentName: 'Student Name',
        className: 'Class',
        section: 'Section',
        gender: 'Gender',
        mobileNumber: 'Mobile',
        email: 'Email',
        dateOfBirth: 'Date Of Birth',
        admissionDate: 'Admission Date',
        guardianName: 'Guardian Name',
        guardianPhone: 'Guardian Phone',
        guardianEmail: 'Guardian Email',
        guardianRelation: 'Guardian Relation',
        guardianAddress: 'Guardian Address',
        paymentRef: 'Payment Ref',
        paidAmount: 'Paid Amount',
        paymentDate: 'Payment Date',
        paymentMode: 'Payment Mode',
        attendanceDate: 'Attendance Date',
        status: 'Status',
        examName: 'Exam Name',
        percentage: 'Percentage',
        rank: 'Rank',
        result: 'Result',
        username: 'Username',
        password: 'Password',
        staffId: 'Staff ID',
        staffName: 'Staff Name',
        bookTitle: 'Book Title',
        memberName: 'Member Name',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        returnDate: 'Return Date',
        itemName: 'Item Name',
        quantity: 'Quantity',
        routeTitle: 'Route',
        hostelName: 'Hostel',
        eventTitle: 'Event Title',
        userType: 'User Type',
        action: 'Action',
        module: 'Module',
        user: 'User',
        date: 'Date',
        description: 'Description',
        totalAttempt: 'Total Attempt',
        remainingAttempt: 'Remaining Attempt',
        examSubmitted: 'Exam Submitted',
        action: 'Action',
        examTitle: 'Exam Title',
        rank: 'Rank',
        percentage: 'Percentage',
        result: 'Result',
        attempt: 'Attempt',
        passingPercentage: 'Passing Percentage',
        publishExam: 'Publish Exam',
        publishResult: 'Publish Result',
        assignedStudents: 'Assigned Students',
        duration: 'Duration',
        monthYear: 'Month - Year',
        payslipNo: 'Payslip #',
        basicSalary: 'Basic Salary ($)',
        earning: 'Earning ($)',
        deduction: 'Deduction ($)',
        grossSalary: 'Gross Salary ($)',
        tax: 'Tax ($)',
        netSalary: 'Net Salary ($)',
        role: 'Role',
        designation: 'Designation',
        invoiceNumber: 'Invoice Number',
        incomeHead: 'Income Head',
        amount: 'Amount ($)',
        expenseHead: 'Expense Head',
        incomeId: 'Income ID',
        expenseId: 'Expense ID',
        incomeExpenseHead: 'Income Expense Head',
        incomeMoneyIn: 'Income Money in ($)',
        expenseMoneyOut: 'Expense Money Out ($)',
        overallBalance: 'Overall Balance ($)'
    };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function labelForKey(key) {
        if (LABELS[key]) return LABELS[key];
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
    }

    function buildColumnsFromRows(dataRows) {
        if (!dataRows.length) {
            return [];
        }
        const keys = Object.keys(dataRows[0]).filter(function (key) {
            return key !== 'id';
        });
        return keys.map(function (key) {
            return {
                key: key,
                label: labelForKey(key),
                numeric: typeof dataRows[0][key] === 'number'
            };
        });
    }

    function cellValue(row, key) {
        if (key === 'name' && row.name) return row.name;
        if (key === 'class' && row.className) {
            return row.section ? row.className + ' (' + row.section + ')' : row.className;
        }
        return row[key] == null ? '' : row[key];
    }

    function renderHead() {
        if (!tableHead) return;
        const cols = columns.map(function (col) {
            return '<th data-sort="' + escapeHtml(col.key) + '">' + escapeHtml(col.label)
                + ' <span class="sort-icon">↑↓</span></th>';
        }).join('');
        tableHead.innerHTML = '<tr>' + cols + '</tr>';

        tableHead.querySelectorAll('th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                const key = th.getAttribute('data-sort');
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else {
                    sortKey = key;
                    sortDir = 'asc';
                }
                renderTable();
            });
        });
    }

    function getFilteredRows() {
        let list = rows.slice();
        const filter = tableFilter.trim().toLowerCase();
        if (filter) {
            list = list.filter(function (row) {
                const haystack = columns.map(function (col) {
                    return cellValue(row, col.key);
                }).join(' ').toLowerCase();
                return haystack.indexOf(filter) !== -1;
            });
        }
        if (sortKey) {
            const col = columns.find(function (c) { return c.key === sortKey; });
            list.sort(function (a, b) {
                const av = cellValue(a, sortKey);
                const bv = cellValue(b, sortKey);
                if (col && col.numeric) {
                    return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
                }
                const as = String(av).toLowerCase();
                const bs = String(bv).toLowerCase();
                if (as < bs) return sortDir === 'asc' ? -1 : 1;
                if (as > bs) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return list;
    }

    function renderPagination(el, page, totalPages, total) {
        if (!el) return;
        let html = '<button type="button" class="pagination-btn" data-nav="prev"'
            + (page <= 1 ? ' disabled' : '') + '>‹</button>';
        for (let p = 1; p <= totalPages; p++) {
            html += '<button type="button" class="pagination-btn'
                + (p === page ? ' active' : '') + '" data-nav-page="' + p + '">' + p + '</button>';
        }
        html += '<button type="button" class="pagination-btn" data-nav="next"'
            + (page >= totalPages || total === 0 ? ' disabled' : '') + '>›</button>';
        el.innerHTML = html;
    }

    function renderTable() {
        const filtered = getFilteredRows();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
        if (currentPage > totalPages) currentPage = totalPages;
        const colspan = Math.max(columns.length, 1);

        if (!total) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="' + colspan + '">'
                + '<div class="empty-state"><p class="empty-message">No data available in table</p>'
                + '<p class="empty-hint">' + escapeHtml(getEmptyHint()) + '</p></div></td></tr>';
            if (showingInfo) showingInfo.textContent = 'Showing 0 to 0 of 0 entries';
            renderPagination(pagination, 1, 1, 0);
            return;
        }

        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        tableBody.innerHTML = filtered.slice(start, end).map(function (row) {
            const cells = columns.map(function (col) {
                let value = cellValue(row, col.key);
                if (col.key === 'name' && row.id) {
                    return '<td><a class="student-link" href="/student/view/'
                        + encodeURIComponent(String(row.id)) + '">' + escapeHtml(value) + '</a></td>';
                }
                return '<td>' + escapeHtml(String(value)) + '</td>';
            }).join('');
            return '<tr>' + cells + '</tr>';
        }).join('');

        if (showingInfo) {
            showingInfo.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
        }
        renderPagination(pagination, currentPage, totalPages, total);
    }

    function getEmptyHint() {
        if (showFinanceSearchTypeCriteria && !showFinanceIncomeHeadCriteria && !showFinanceExpenseHeadCriteria) {
            return 'Select search type, then click Search.';
        }
        if (showFinanceCollectionCriteria) {
            return 'Select search duration, then click Search.';
        }
        if (showFinanceFeesStatementCriteria) {
            return 'Select class, section or student, then click Search.';
        }
        if (showFinanceIncomeHeadCriteria) {
            return 'Select search type and income head, then click Search.';
        }
        if (showFinanceExpenseHeadCriteria) {
            return 'Select search type and expense head, then click Search.';
        }
        if (showOnlineExamDateCriteria && !showOnlineExamCriteria) {
            return 'Select search type and date type, then click Search.';
        }
        if (showOnlineExamCriteria) return 'Select exam, class and section, then click Search.';
        if (showStaffAttendanceCriteria) return 'Select month and year, then click Search.';
        if (showStaffDayWiseCriteria) return 'Select date, then click Search.';
        if (needsSearch && showClassSection) return 'Select class and click Search.';
        if (needsSearch && showDateRange) return 'Select date range and click Search.';
        if (needsSearch) return 'Click Search to load report data.';
        return 'No records found for this report.';
    }

    function fillClassSelect() {
        if (!classSelect) return;
        const current = classSelect.value;
        classSelect.innerHTML = '<option value="">Select</option>';
        classes.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.name;
            classSelect.appendChild(option);
        });
        if (current) classSelect.value = current;
    }

    function fillSectionSelect(preferred) {
        if (!sectionSelect) return;
        sectionSelect.innerHTML = '<option value="">Select</option>';
        const selectedClass = classes.find(function (c) {
            return String(c.id) === String(classSelect.value);
        });
        const classSections = selectedClass && selectedClass.sections ? selectedClass.sections : [];
        const sections = classSections.length
            ? classSections
            : masterSections.map(function (s) { return s.sectionName || s.name || s; });
        sections.forEach(function (section) {
            const value = String(section);
            if (!value) return;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            sectionSelect.appendChild(option);
        });
        if (preferred) sectionSelect.value = preferred;
    }

    async function loadClasses() {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to load classes');
        classes = await response.json();
        fillClassSelect();
        fillSectionSelect();
    }

    async function loadSections() {
        const response = await fetch('/api/sections');
        if (!response.ok) throw new Error('Failed to load sections');
        masterSections = await response.json();
        fillSectionSelect();
    }

    async function loadOnlineExamLookups() {
        if (!showOnlineExamCriteria) return;
        const [examsRes] = await Promise.all([
            fetch('/api/online-exams/options')
        ]);
        if (!examsRes.ok) throw new Error('Failed to load online exam filters');

        const exams = await examsRes.json();
        if (onlineExamSelect) {
            onlineExamSelect.innerHTML = '<option value="">Select</option>';
            exams.forEach(function (exam) {
                const option = document.createElement('option');
                option.value = String(exam.id);
                option.textContent = exam.title || '';
                onlineExamSelect.appendChild(option);
            });
        }
    }

    async function loadStaffDayWiseLookups() {
        if (!showStaffDayWiseCriteria) return;
        const [rolesRes, sourcesRes] = await Promise.all([
            fetch('/api/staff-attendance/roles'),
            fetch('/api/staff-attendance/sources')
        ]);
        if (!rolesRes.ok || !sourcesRes.ok) throw new Error('Failed to load staff day wise filters');

        const roles = await rolesRes.json();
        const sources = await sourcesRes.json();

        if (staffRoleSelect) {
            staffRoleSelect.innerHTML = '<option value="">Select</option>';
            roles.forEach(function (role) {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                staffRoleSelect.appendChild(option);
            });
        }

        if (staffSourceSelect) {
            staffSourceSelect.innerHTML = '<option value="">Select</option>';
            sources.forEach(function (source) {
                const option = document.createElement('option');
                option.value = source;
                option.textContent = source;
                staffSourceSelect.appendChild(option);
            });
        }

        if (staffDateInput) {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            staffDateInput.value = today.getFullYear() + '-' + month + '-' + day;
        }
    }

    async function loadStaffAttendanceLookups() {
        if (!showStaffAttendanceCriteria) return;
        const [rolesRes, monthsRes] = await Promise.all([
            fetch('/api/payroll/roles'),
            fetch('/api/payroll/months')
        ]);
        if (!rolesRes.ok || !monthsRes.ok) throw new Error('Failed to load staff attendance filters');

        const roles = await rolesRes.json();
        const months = await monthsRes.json();

        if (staffRoleSelect) {
            staffRoleSelect.innerHTML = '<option value="">Select</option>';
            roles.forEach(function (role) {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                staffRoleSelect.appendChild(option);
            });
        }

        if (staffMonthSelect) {
            staffMonthSelect.innerHTML = '';
            months.forEach(function (month) {
                const option = document.createElement('option');
                option.value = month.value;
                option.textContent = month.label;
                staffMonthSelect.appendChild(option);
            });
            staffMonthSelect.value = String(new Date().getMonth() + 1);
        }

        if (staffYearSelect) {
            const currentYear = new Date().getFullYear();
            staffYearSelect.innerHTML = '';
            for (let year = currentYear + 1; year >= currentYear - 5; year -= 1) {
                const option = document.createElement('option');
                option.value = String(year);
                option.textContent = String(year);
                staffYearSelect.appendChild(option);
            }
            staffYearSelect.value = String(currentYear);
        }
    }

    async function loadFinanceLookups() {
        const loaders = [];

        if (showFinanceCollectionCriteria || showFinanceFeesStatementCriteria) {
            loaders.push(loadClasses(), loadSections());
        }

        if (showFinanceCollectionCriteria && financeFeeTypeSelect) {
            loaders.push(fetch('/api/fee-types').then(function (response) {
                if (!response.ok) throw new Error('Failed to load fee types');
                return response.json();
            }).then(function (feeTypes) {
                financeFeeTypeSelect.innerHTML = '<option value="">Select</option>';
                feeTypes.forEach(function (feeType) {
                    const option = document.createElement('option');
                    option.value = String(feeType.id);
                    option.textContent = feeType.name || '';
                    financeFeeTypeSelect.appendChild(option);
                });
            }));
        }

        if (showFinanceCollectionCriteria && financeCollectBySelect) {
            loaders.push(fetch('/api/staff').then(function (response) {
                if (!response.ok) return [];
                return response.json();
            }).then(function (staffMembers) {
                financeCollectBySelect.innerHTML = '<option value="">Select</option>';
                staffMembers.forEach(function (staff) {
                    const option = document.createElement('option');
                    option.value = String(staff.id);
                    const name = [staff.firstName, staff.lastName].filter(Boolean).join(' ').trim();
                    option.textContent = name || staff.staffId || 'Staff';
                    financeCollectBySelect.appendChild(option);
                });
            }).catch(function () {
                financeCollectBySelect.innerHTML = '<option value="">Select</option>';
            }));
        }

        if (showFinanceIncomeHeadCriteria && financeIncomeHeadSelect) {
            loaders.push(fetch('/api/income-heads').then(function (response) {
                if (!response.ok) throw new Error('Failed to load income heads');
                return response.json();
            }).then(function (heads) {
                financeIncomeHeadSelect.innerHTML = '<option value="">Select</option>';
                heads.forEach(function (head) {
                    const option = document.createElement('option');
                    option.value = head.name || '';
                    option.textContent = head.name || '';
                    financeIncomeHeadSelect.appendChild(option);
                });
            }));
        }

        if (showFinanceExpenseHeadCriteria && financeExpenseHeadSelect) {
            loaders.push(fetch('/api/expense-heads').then(function (response) {
                if (!response.ok) throw new Error('Failed to load expense heads');
                return response.json();
            }).then(function (heads) {
                financeExpenseHeadSelect.innerHTML = '<option value="">Select</option>';
                heads.forEach(function (head) {
                    const option = document.createElement('option');
                    option.value = head.name || '';
                    option.textContent = head.name || '';
                    financeExpenseHeadSelect.appendChild(option);
                });
            }));
        }

        await Promise.all(loaders);
    }

    async function loadFinanceStudents() {
        if (!showFinanceFeesStatementCriteria || !financeStudentSelect) return;
        const params = new URLSearchParams();
        if (classSelect && classSelect.value) params.set('classId', classSelect.value);
        if (sectionSelect && sectionSelect.value) params.set('section', sectionSelect.value);
        params.set('disabled', 'false');
        const response = await fetch('/api/student-admissions?' + params.toString());
        if (!response.ok) throw new Error('Failed to load students');
        const students = await response.json();
        const current = financeStudentSelect.value;
        financeStudentSelect.innerHTML = '<option value="">Select</option>';
        students.forEach(function (student) {
            const option = document.createElement('option');
            option.value = String(student.id);
            const name = [student.firstName, student.lastName].filter(Boolean).join(' ').trim();
            const admissionNo = student.admissionNo ? ' (' + student.admissionNo + ')' : '';
            option.textContent = name + admissionNo;
            financeStudentSelect.appendChild(option);
        });
        if (current) financeStudentSelect.value = current;
    }

    async function loadCategories() {
        if (!showStudentFilters || !categorySelect) return;
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        const categories = await response.json();
        const current = categorySelect.value;
        categorySelect.innerHTML = '<option value="">Select</option>';
        categories.forEach(function (item) {
            const option = document.createElement('option');
            option.value = String(item.id);
            option.textContent = item.categoryName || item.name || '';
            categorySelect.appendChild(option);
        });
        if (current) categorySelect.value = current;
    }

    async function loadReport() {
        let url = apiUrl;
        const query = new URLSearchParams();

        if (showFinanceSearchTypeCriteria && financeSearchType) {
            const searchTypeValue = financeSearchType.value;
            if (!searchTypeValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please select search type to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            query.set('searchType', searchTypeValue);
        }

        if (showFinanceCollectionCriteria) {
            const durationValue = financeSearchDuration ? financeSearchDuration.value : '';
            if (!durationValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please select search duration to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            query.set('searchDuration', durationValue);
            if (classSelect && classSelect.value) query.set('classId', classSelect.value);
            if (sectionSelect && sectionSelect.value) query.set('section', sectionSelect.value);
            if (financeFeeTypeSelect && financeFeeTypeSelect.value) query.set('feeTypeId', financeFeeTypeSelect.value);
            if (financeCollectBySelect && financeCollectBySelect.value) query.set('collectBy', financeCollectBySelect.value);
            if (financeGroupBySelect && financeGroupBySelect.value) query.set('groupBy', financeGroupBySelect.value);
        }

        if (showFinanceFeesStatementCriteria) {
            if (classSelect && classSelect.value) query.set('classId', classSelect.value);
            if (sectionSelect && sectionSelect.value) query.set('section', sectionSelect.value);
            if (financeStudentSelect && financeStudentSelect.value) query.set('studentId', financeStudentSelect.value);
        }

        if (showFinanceIncomeHeadCriteria && financeIncomeHeadSelect && financeIncomeHeadSelect.value) {
            query.set('incomeHead', financeIncomeHeadSelect.value);
        }

        if (showFinanceExpenseHeadCriteria && financeExpenseHeadSelect && financeExpenseHeadSelect.value) {
            query.set('expenseHead', financeExpenseHeadSelect.value);
        }

        if (showOnlineExamDateCriteria && !showOnlineExamCriteria) {
            const searchTypeValue = onlineExamSearchType ? onlineExamSearchType.value : '';
            const dateTypeValue = onlineExamDateType ? onlineExamDateType.value : '';
            if (!searchTypeValue || !dateTypeValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Fields',
                    text: 'Please select search type and date type to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            query.set('searchType', searchTypeValue);
            query.set('dateType', dateTypeValue);
        }

        if (showClassSection || showOnlineExamCriteria) {
            const classValue = classSelect ? classSelect.value : '';
            if (showClassSection && !showFinanceCollectionCriteria && !showFinanceFeesStatementCriteria && !classValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Class Required',
                    text: 'Please select a class to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (showOnlineExamCriteria) {
                const examValue = onlineExamSelect ? onlineExamSelect.value : '';
                const sectionValue = sectionSelect ? sectionSelect.value : '';
                if (!examValue || !classValue || !sectionValue) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Required Fields',
                        text: 'Please select exam, class and section to search.',
                        confirmButtonColor: '#8b5cf6'
                    });
                    return;
                }
                query.set('examId', examValue);
                query.set('classId', classValue);
                query.set('section', sectionValue);
            } else {
                query.set('classId', classValue);
                if (sectionSelect && sectionSelect.value) query.set('section', sectionSelect.value);
            }
        }

        if (showStudentFilters) {
            if (categorySelect && categorySelect.value) query.set('categoryId', categorySelect.value);
            if (genderSelect && genderSelect.value) query.set('gender', genderSelect.value);
            if (rteSelect && rteSelect.value) query.set('rte', rteSelect.value);
        }

        if (showStaffDayWiseCriteria) {
            const dateValue = staffDateInput ? staffDateInput.value : '';
            if (!dateValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Field',
                    text: 'Please select a date to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (staffRoleSelect && staffRoleSelect.value) query.set('role', staffRoleSelect.value);
            query.set('dateFrom', dateValue);
            if (staffSourceSelect && staffSourceSelect.value) query.set('source', staffSourceSelect.value);
        }

        if (showStaffAttendanceCriteria) {
            const monthValue = staffMonthSelect ? staffMonthSelect.value : '';
            const yearValue = staffYearSelect ? staffYearSelect.value : '';
            if (!monthValue || !yearValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Fields',
                    text: 'Please select month and year to search.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }
            if (staffRoleSelect && staffRoleSelect.value) query.set('role', staffRoleSelect.value);
            query.set('month', monthValue);
            query.set('year', yearValue);
        }

        if (showDateRange) {
            if (dateFromInput && dateFromInput.value) query.set('dateFrom', dateFromInput.value);
            if (dateToInput && dateToInput.value) query.set('dateTo', dateToInput.value);
        }

        const queryString = query.toString();
        if (queryString) {
            url += (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
        }

        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(function () { return {}; });
            throw new Error(err.message || 'Failed to load report');
        }
        rows = await response.json();
        columns = buildColumnsFromRows(rows);
        currentPage = 1;
        renderHead();
        renderTable();
    }

    function exportRows(filename, type) {
        const filtered = getFilteredRows();
        const headers = columns.map(function (col) { return col.label; });
        const body = filtered.map(function (row) {
            return columns.map(function (col) { return cellValue(row, col.key); });
        });

        if (type === 'csv') {
            const lines = [headers.join(',')];
            body.forEach(function (line) {
                lines.push(line.map(function (value) {
                    return '"' + String(value).replace(/"/g, '""') + '"';
                }).join(','));
            });
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        if (type === 'excel' && window.XLSX) {
            const sheetData = [headers].concat(body);
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            XLSX.writeFile(wb, filename + '.xlsx');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
            doc.autoTable({
                head: [headers],
                body: body
            });
            doc.save(filename + '.pdf');
        }
    }

    if (emptyHint) emptyHint.textContent = getEmptyHint();
    renderHead();
    renderTable();

    if (showClassSection) {
        const loaders = [loadClasses(), loadSections()];
        if (showStudentFilters) loaders.push(loadCategories());
        Promise.all(loaders).catch(function (error) {
            console.error(error);
        });
    } else if (showFinanceCollectionCriteria || showFinanceFeesStatementCriteria
        || showFinanceIncomeHeadCriteria || showFinanceExpenseHeadCriteria) {
        loadFinanceLookups().catch(function (error) {
            console.error(error);
        });
    } else if (showOnlineExamCriteria) {
        Promise.all([loadOnlineExamLookups(), loadClasses(), loadSections()]).catch(function (error) {
            console.error(error);
        });
    } else if (showStaffAttendanceCriteria) {
        loadStaffAttendanceLookups().catch(function (error) {
            console.error(error);
        });
    } else if (showStaffDayWiseCriteria) {
        loadStaffDayWiseLookups().catch(function (error) {
            console.error(error);
        });
    } else if (!needsSearch) {
        loadReport().catch(function (error) {
            console.error(error);
        });
    }

    if (classSelect) {
        classSelect.addEventListener('change', function () {
            fillSectionSelect();
            if (showFinanceFeesStatementCriteria) {
                loadFinanceStudents().catch(function (error) {
                    console.error(error);
                });
            }
        });
    }

    if (sectionSelect && showFinanceFeesStatementCriteria) {
        sectionSelect.addEventListener('change', function () {
            loadFinanceStudents().catch(function (error) {
                console.error(error);
            });
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            loadReport().catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to load report.',
                    confirmButtonColor: '#8b5cf6'
                });
            });
        });
    }

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function () {
            tableFilter = tableSearchInput.value;
            currentPage = 1;
            renderTable();
        });
    }

    if (entriesSelect) {
        entriesSelect.addEventListener('change', function () {
            pageSize = parseInt(entriesSelect.value, 10) || 100;
            currentPage = 1;
            renderTable();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (e) {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.disabled) return;
            if (btn.dataset.nav === 'prev') currentPage -= 1;
            else if (btn.dataset.nav === 'next') currentPage += 1;
            else if (btn.dataset.navPage) currentPage = parseInt(btn.dataset.navPage, 10);
            renderTable();
        });
    }

    const exportName = (category + '-' + reportType).replace(/[^\w-]+/g, '-');
    const excelBtn = document.getElementById('excelBtn');
    const csvBtn = document.getElementById('csvBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');

    if (excelBtn) excelBtn.addEventListener('click', function () { exportRows(exportName, 'excel'); });
    if (csvBtn) csvBtn.addEventListener('click', function () { exportRows(exportName, 'csv'); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { exportRows(exportName, 'pdf'); });
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
});
