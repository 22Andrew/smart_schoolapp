document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('studentViewRoot');
    const studentId = root ? root.getAttribute('data-student-id') : null;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function display(value) {
        if (value == null || String(value).trim() === '') return '';
        return String(value);
    }

    function formatDate(value) {
        if (!value) return '';
        const text = String(value).trim();
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return isoMatch[2] + '/' + isoMatch[3] + '/' + isoMatch[1];
        }
        return text;
    }

    function fullName(row) {
        return [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value == null || value === '' ? '-' : String(value);
    }

    function money(value) {
        const num = Number(value || 0);
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function statusBadge(status) {
        const key = String(status || 'Unpaid').toLowerCase();
        return '<span class="fees-status ' + escapeHtml(key) + '">' + escapeHtml(status) + '</span>';
    }

    function amountCell(amount, fine) {
        const base = money(amount);
        if (fine && Number(fine) > 0) {
            return escapeHtml(base) + ' <span class="fee-amount-fine">+ ' + escapeHtml(money(fine)) + '</span>';
        }
        return escapeHtml(base);
    }

    function paymentBranchHtml() {
        return ''
            + '<span class="fees-payment-branch">'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>'
            + '</svg></span>';
    }

    function buildDemoFees() {
        const months = [
            ['April', 'apr', '04/01/2026'],
            ['May', 'may', '05/01/2026'],
            ['June', 'jun', '06/01/2026'],
            ['July', 'jul', '07/01/2026'],
            ['August', 'aug', '08/01/2026'],
            ['September', 'sep', '09/01/2026'],
            ['October', 'oct', '10/01/2026'],
            ['November', 'nov', '11/01/2026'],
            ['December', 'dec', '12/01/2026'],
            ['January', 'jan', '01/01/2027'],
            ['February', 'feb', '02/01/2027'],
            ['March', 'mar', '03/01/2027']
        ];

        const fees = months.map(function (item, index) {
            const row = {
                name: item[0] + ' Month Fees',
                slug: item[1] + '-month-fees',
                dueDate: item[2],
                amount: 350,
                fine: 0,
                discount: 0,
                paid: 0,
                status: 'Unpaid',
                alert: false,
                payments: []
            };

            if (index === 1) {
                row.status = 'Partial';
                row.paid = 200;
                row.payments = [{
                    paymentId: '5490/1',
                    mode: 'Cash',
                    date: '05/02/2026',
                    discount: 0,
                    fine: 0,
                    paid: 200,
                    balance: 150
                }];
            } else if (index === 3) {
                row.status = 'Paid';
                row.paid = 350;
                row.payments = [{
                    paymentId: '5490/2',
                    mode: 'Cash',
                    date: '07/05/2026',
                    discount: 0,
                    fine: 0,
                    paid: 350,
                    balance: 0
                }];
            } else if (index === 0) {
                row.fine = 50;
            }

            return row;
        });

        fees.push({
            name: 'Admission Fees',
            slug: 'admission-fees',
            dueDate: '04/01/2026',
            amount: 2000,
            fine: 0,
            discount: 0,
            paid: 0,
            status: 'Unpaid',
            alert: false,
            payments: []
        });

        for (let i = 1; i <= 6; i++) {
            fees.push({
                name: i + (i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th') + ' Installment Fees',
                slug: i + '-installment-fees',
                dueDate: '0' + Math.min(i + 3, 9) + '/15/2026',
                amount: 2500,
                fine: i === 1 ? 100 : 0,
                discount: 0,
                paid: 0,
                status: 'Unpaid',
                alert: i <= 2,
                payments: []
            });
        }

        months.forEach(function (item, index) {
            fees.push({
                name: item[0] + ' Transport Fees',
                slug: item[1] + '-transport-fees',
                dueDate: item[2],
                amount: 800,
                fine: index === 0 ? 50 : 0,
                discount: 0,
                paid: index === 0 ? 50 : 0,
                status: index === 0 ? 'Partial' : 'Unpaid',
                alert: index === 0,
                payments: index === 0 ? [{
                    paymentId: '5491/1',
                    mode: 'Cash',
                    date: '04/10/2026',
                    discount: 0,
                    fine: 50,
                    paid: 50,
                    balance: 800
                }] : []
            });
        });

        return fees;
    }

    function renderFeesTable() {
        const body = document.getElementById('studentFeesBody');
        const foot = document.getElementById('studentFeesFoot');
        if (!body || !foot) return;

        const fees = buildDemoFees();
        let totalAmount = 0;
        let totalFineOnAmount = 0;
        let totalDiscount = 0;
        let totalFine = 0;
        let totalPaid = 0;
        let totalBalance = 0;
        let html = '';

        fees.forEach(function (fee) {
            const balance = Math.max(0, Number(fee.amount) + Number(fee.fine || 0) - Number(fee.discount || 0) - Number(fee.paid || 0));
            totalAmount += Number(fee.amount || 0);
            totalFineOnAmount += Number(fee.fine || 0);
            totalDiscount += Number(fee.discount || 0);
            totalFine += Number(fee.fine || 0);
            totalPaid += Number(fee.paid || 0);
            totalBalance += balance;

            html += '<tr class="' + (fee.alert ? 'fees-row-alert' : '') + '">'
                + '<td><span class="fee-name">' + escapeHtml(fee.name)
                + ' <span class="fee-slug">(' + escapeHtml(fee.slug) + ')</span></span></td>'
                + '<td>' + escapeHtml(fee.dueDate) + '</td>'
                + '<td>' + statusBadge(fee.status) + '</td>'
                + '<td>' + amountCell(fee.amount, fee.fine) + '</td>'
                + '<td></td><td></td><td></td>'
                + '<td></td><td></td><td></td>'
                + '<td>' + escapeHtml(money(balance)) + '</td>'
                + '</tr>';

            (fee.payments || []).forEach(function (payment) {
                html += '<tr class="fees-payment-row">'
                    + '<td>' + paymentBranchHtml() + '</td>'
                    + '<td></td><td></td><td></td>'
                    + '<td>' + escapeHtml(payment.paymentId || '') + '</td>'
                    + '<td>' + escapeHtml(payment.mode || '') + '</td>'
                    + '<td>' + escapeHtml(payment.date || '') + '</td>'
                    + '<td>' + escapeHtml(money(payment.discount)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.fine)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.paid)) + '</td>'
                    + '<td>' + escapeHtml(money(payment.balance)) + '</td>'
                    + '</tr>';
            });
        });

        body.innerHTML = html;
        foot.innerHTML = ''
            + '<tr>'
            + '<td colspan="3" class="fees-grand-label">Grand Total</td>'
            + '<td class="fees-grand-total">' + amountCell(totalAmount, totalFineOnAmount) + '</td>'
            + '<td colspan="3"></td>'
            + '<td>$' + escapeHtml(money(totalDiscount)) + '</td>'
            + '<td>$' + escapeHtml(money(totalFine)) + '</td>'
            + '<td>$' + escapeHtml(money(totalPaid)) + '</td>'
            + '<td>$' + escapeHtml(money(totalBalance)) + '</td>'
            + '</tr>';
    }

    function activateTab(key) {
        document.querySelectorAll('.profile-tab').forEach(function (t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === key);
        });
        document.querySelectorAll('.profile-tab-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'tab-' + key);
        });
    }

    function examResultBadge(result) {
        const key = String(result || '').toLowerCase();
        if (!result) return '';
        return '<span class="exam-result ' + escapeHtml(key) + '">' + escapeHtml(result) + '</span>';
    }

    function marksCell(value) {
        if (value == null || value === '') return '';
        const text = String(value);
        if (text.toUpperCase() === 'ABS') {
            return '<span class="exam-absent">ABS</span>';
        }
        const num = Number(value);
        if (!Number.isNaN(num)) {
            return escapeHtml(num.toFixed(2));
        }
        return escapeHtml(text);
    }

    function buildDemoExams() {
        return [
            {
                title: 'CBSE Monthly Test - May',
                outcomeColumn: 'Result',
                subjects: [
                    { name: 'English', code: '210', max: 100, min: 33, obtained: 65, outcome: 'Pass', note: '' },
                    { name: 'Hindi', code: '230', max: 100, min: 33, obtained: 72, outcome: 'Pass', note: '' },
                    { name: 'Mathematics', code: '110', max: 100, min: 33, obtained: 58, outcome: 'Pass', note: '' },
                    { name: 'Science', code: '111', max: 100, min: 33, obtained: 69, outcome: 'Pass', note: '' }
                ],
                summary: {
                    grandTotal: 400,
                    totalObtain: 264,
                    percentage: '66.00',
                    rank: 1,
                    result: 'Pass',
                    division: 'First'
                }
            },
            {
                title: 'CBSE Periodic Test 1(May)',
                outcomeColumn: 'Grade',
                subjects: [
                    { name: 'Mathematics', code: '110', max: 100, min: 33, obtained: 54, outcome: 'B+', note: '' },
                    { name: 'Science', code: '111', max: 100, min: 33, obtained: 48, outcome: 'B', note: '' },
                    { name: 'English', code: '210', max: 100, min: 33, obtained: 53, outcome: 'B+', note: '' }
                ],
                summary: {
                    grandTotal: 300,
                    totalObtain: 155,
                    percentage: '51.67',
                    rank: 3,
                    result: 'Pass',
                    division: 'Second'
                }
            },
            {
                title: 'College Grade Test (May-2026)',
                outcomeColumn: 'Grade',
                subjects: [
                    { name: 'English', code: '210', max: 100, min: 33, obtained: 61, outcome: 'B+', note: '' },
                    { name: 'Mathematics', code: '110', max: 100, min: 33, obtained: 'ABS', outcome: 'B-', note: '' },
                    { name: 'Science', code: '111', max: 100, min: 33, obtained: 91, outcome: 'A', note: '' }
                ],
                summary: {
                    grandTotal: 300,
                    totalObtain: 152,
                    percentage: '50.67',
                    rank: 4,
                    result: 'Fail',
                    division: ''
                }
            }
        ];
    }

    function renderExamPanels() {
        const container = document.getElementById('examPanels');
        if (!container) return;

        const exams = buildDemoExams();
        container.innerHTML = exams.map(function (exam) {
            const rows = exam.subjects.map(function (subject) {
                return ''
                    + '<tr>'
                    + '<td><span class="exam-subject">' + escapeHtml(subject.name)
                    + ' <span class="exam-subject-code">(' + escapeHtml(subject.code) + ')</span></span></td>'
                    + '<td>' + escapeHtml(String(subject.max)) + '</td>'
                    + '<td>' + escapeHtml(String(subject.min)) + '</td>'
                    + '<td>' + marksCell(subject.obtained) + '</td>'
                    + '<td>' + (exam.outcomeColumn === 'Result'
                        ? examResultBadge(subject.outcome)
                        : escapeHtml(subject.outcome || '')) + '</td>'
                    + '<td>' + escapeHtml(subject.note || '') + '</td>'
                    + '</tr>';
            }).join('');

            const summary = exam.summary || {};
            return ''
                + '<div class="exam-card">'
                + '<h3 class="exam-card-title">' + escapeHtml(exam.title) + '</h3>'
                + '<div class="exam-table-wrap">'
                + '<table class="exam-table">'
                + '<thead><tr>'
                + '<th>Subject</th><th>Max Marks</th><th>Min Marks</th><th>Marks Obtained</th>'
                + '<th>' + escapeHtml(exam.outcomeColumn) + '</th><th>Note</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table></div>'
                + '<div class="exam-summary">'
                + '<div class="exam-summary-item"><span>Grand Total</span> <strong>'
                + escapeHtml(String(summary.grandTotal != null ? summary.grandTotal : '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Total Obtain Marks</span> <strong>'
                + escapeHtml(String(summary.totalObtain != null ? summary.totalObtain : '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Percentage</span> <strong>'
                + escapeHtml(String(summary.percentage != null ? summary.percentage : '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Rank</span> <strong>'
                + escapeHtml(String(summary.rank != null ? summary.rank : '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Result</span> '
                + examResultBadge(summary.result) + '</div>'
                + (summary.division
                    ? '<div class="exam-summary-item"><span>Division</span> <strong>'
                        + escapeHtml(summary.division) + '</strong></div>'
                    : '')
                + '</div></div>';
        }).join('');
    }

    function buildDemoCbseExams() {
        return [
            {
                title: 'CBSE All Term Examination (August 2026)',
                columns: [
                    { key: 'theory', label: 'Theory (TH02)', max: 100 },
                    { key: 'practical', label: 'Practical (PC03)', max: 75 }
                ],
                subjects: [
                    { name: 'English', code: '210', theory: 56, practical: 46, total: 102 },
                    { name: 'Mathematics', code: '110', theory: 56, practical: 72, total: 128 },
                    { name: 'Science', code: '111', theory: 35, practical: 'ABS', total: 35 }
                ],
                summary: { totalMarks: '265/525', percentage: '50.48', grade: 'C', rank: 3 }
            },
            {
                title: 'CBSE Single Term Report Card (August 2026)',
                columns: [
                    { key: 'theory', label: 'Theory (TH02)', max: 100 },
                    { key: 'practical', label: 'Practical (PC03)', max: 75 }
                ],
                subjects: [
                    { name: 'Mathematics', code: '110', theory: 67, practical: 65, total: 132 },
                    { name: 'Science', code: '111', theory: 67, practical: 54, total: 121 },
                    { name: 'Social Studies', code: '212', theory: 78, practical: 45, total: 123 }
                ],
                summary: { totalMarks: '376/525', percentage: '71.62', grade: 'B+', rank: 3 }
            },
            {
                title: 'CBSE Combined Assessment (August 2026)',
                columns: [
                    { key: 'theory', label: 'Theory (TH02)', max: 100 },
                    { key: 'practical', label: 'Practical (PC03)', max: 75 },
                    { key: 'assignment', label: 'Assignment (AS05)', max: 20 }
                ],
                subjects: [
                    { name: 'Mathematics', code: '110', theory: 65, practical: 46, assignment: 8, total: 119 },
                    { name: 'Science', code: '111', theory: 56, practical: 45, assignment: 18, total: 119 },
                    { name: 'Computer', code: '00220', theory: 76, practical: 56, assignment: 11, total: 143 }
                ],
                summary: { totalMarks: '381/585', percentage: '65.13', grade: 'B', rank: 1 }
            },
            {
                title: 'CBSE Combined Assessment (July 2026)',
                columns: [
                    { key: 'theory', label: 'Theory (TH02)', max: 100 },
                    { key: 'practical', label: 'Practical (PC03)', max: 75 }
                ],
                subjects: [
                    { name: 'Computer', code: '00220', theory: 45, practical: 54, total: 99 },
                    { name: 'Mathematics', code: '110', theory: 58, practical: 60, total: 118 },
                    { name: 'Science', code: '111', theory: 62, practical: 55, total: 117 }
                ],
                summary: { totalMarks: '334/525', percentage: '63.62', grade: 'B', rank: 2 }
            }
        ];
    }

    function renderCbsePanels() {
        const container = document.getElementById('cbsePanels');
        if (!container) return;

        const exams = buildDemoCbseExams();
        container.innerHTML = exams.map(function (exam) {
            const headerCols = exam.columns.map(function (col) {
                return '<th><span class="cbse-th-main">' + escapeHtml(col.label) + '</span>'
                    + '<span class="cbse-th-sub">(Max ' + escapeHtml(String(col.max)) + ')</span></th>';
            }).join('');

            const rows = exam.subjects.map(function (subject) {
                const markCells = exam.columns.map(function (col) {
                    return '<td>' + marksCell(subject[col.key]) + '</td>';
                }).join('');
                return ''
                    + '<tr>'
                    + '<td><span class="exam-subject">' + escapeHtml(subject.name)
                    + ' <span class="exam-subject-code">(' + escapeHtml(subject.code) + ')</span></span></td>'
                    + markCells
                    + '<td>' + marksCell(subject.total) + '</td>'
                    + '</tr>';
            }).join('');

            const summary = exam.summary || {};
            return ''
                + '<div class="exam-card">'
                + '<h3 class="exam-card-title">' + escapeHtml(exam.title) + '</h3>'
                + '<div class="exam-table-wrap">'
                + '<table class="exam-table cbse-table">'
                + '<thead><tr>'
                + '<th>Subject</th>'
                + headerCols
                + '<th>Total</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table></div>'
                + '<div class="exam-summary cbse-summary">'
                + '<div class="exam-summary-item"><span>Total Marks:</span> <strong>'
                + escapeHtml(String(summary.totalMarks || '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Percentage (%):</span> <strong>'
                + escapeHtml(String(summary.percentage || '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Grade:</span> <strong>'
                + escapeHtml(String(summary.grade || '')) + '</strong></div>'
                + '<div class="exam-summary-item"><span>Rank:</span> <strong>'
                + escapeHtml(String(summary.rank != null ? summary.rank : '')) + '</strong></div>'
                + '</div></div>';
        }).join('');
    }

    function attendanceCodeClass(code) {
        switch (String(code || '').toUpperCase()) {
            case 'P': return 'present';
            case 'L': return 'late';
            case 'A': return 'absent';
            case 'H': return 'holiday';
            case 'F': return 'half';
            default: return '';
        }
    }

    function attendanceCellHtml(code) {
        if (!code) return '';
        const cls = attendanceCodeClass(code);
        return '<em class="att-code ' + cls + '">' + escapeHtml(String(code).toUpperCase()) + '</em>';
    }

    function daysInMonth(monthIndex, year) {
        // monthIndex: 0=Jan ... 11=Dec
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function buildDemoAttendance() {
        const months = [
            { key: 'apr', label: 'April', monthIndex: 3, year: 2026 },
            { key: 'may', label: 'May', monthIndex: 4, year: 2026 },
            { key: 'jun', label: 'June', monthIndex: 5, year: 2026 },
            { key: 'jul', label: 'July', monthIndex: 6, year: 2026 },
            { key: 'aug', label: 'August', monthIndex: 7, year: 2026 },
            { key: 'sep', label: 'September', monthIndex: 8, year: 2026 },
            { key: 'oct', label: 'October', monthIndex: 9, year: 2026 },
            { key: 'nov', label: 'November', monthIndex: 10, year: 2026 },
            { key: 'dec', label: 'December', monthIndex: 11, year: 2026 },
            { key: 'jan', label: 'January', monthIndex: 0, year: 2027 },
            { key: 'feb', label: 'February', monthIndex: 1, year: 2027 },
            { key: 'mar', label: 'March', monthIndex: 2, year: 2027 }
        ];

        const pattern = ['P', '', 'A', 'L', 'P', 'H', 'F', 'P', 'L', 'P', 'A', 'P', 'F', 'L', 'P', 'H', 'P', 'A', 'L', 'P', 'P', 'F', 'L', 'P', 'A', 'H', 'P', 'L', 'P', 'F', 'P'];
        const data = {};

        months.forEach(function (month) {
            data[month.key] = {};
            // Populate July and August like the screenshot sample
            if (month.key === 'jul' || month.key === 'aug') {
                const maxDay = daysInMonth(month.monthIndex, month.year);
                for (let day = 1; day <= maxDay; day++) {
                    data[month.key][day] = pattern[(day - 1) % pattern.length] || '';
                }
            }
        });

        return { months: months, data: data };
    }

    function countAttendance(data) {
        const counts = { P: 0, L: 0, A: 0, F: 0, H: 0 };
        Object.keys(data).forEach(function (monthKey) {
            Object.keys(data[monthKey]).forEach(function (day) {
                const code = String(data[monthKey][day] || '').toUpperCase();
                if (counts[code] != null) counts[code] += 1;
            });
        });
        return counts;
    }

    function renderAttendancePanel() {
        const statsEl = document.getElementById('attendanceStats');
        const headEl = document.getElementById('attendanceHead');
        const bodyEl = document.getElementById('attendanceBody');
        if (!statsEl || !headEl || !bodyEl) return;

        const attendance = buildDemoAttendance();
        const counts = countAttendance(attendance.data);

        const cards = [
            { label: 'Total Present', value: counts.P },
            { label: 'Total Late', value: counts.L },
            { label: 'Total Absent', value: counts.A },
            { label: 'Total Half Day', value: counts.F },
            { label: 'Total Holiday', value: counts.H }
        ];

        statsEl.innerHTML = cards.map(function (card) {
            return ''
                + '<div class="attendance-stat-card">'
                + '<span class="attendance-stat-icon" aria-hidden="true">✓</span>'
                + '<h4>' + escapeHtml(card.label) + '</h4>'
                + '<strong>' + escapeHtml(String(card.value)) + '</strong>'
                + '</div>';
        }).join('');

        headEl.innerHTML = '<tr><th>Date | Month</th>'
            + attendance.months.map(function (m) {
                return '<th>' + escapeHtml(m.label) + '</th>';
            }).join('')
            + '</tr>';

        let bodyHtml = '';
        for (let day = 1; day <= 31; day++) {
            bodyHtml += '<tr><td>' + day + '</td>';
            attendance.months.forEach(function (month) {
                const maxDay = daysInMonth(month.monthIndex, month.year);
                const code = day <= maxDay ? (attendance.data[month.key][day] || '') : '';
                bodyHtml += '<td>' + attendanceCellHtml(code) + '</td>';
            });
            bodyHtml += '</tr>';
        }
        bodyEl.innerHTML = bodyHtml;

        window.__studentAttendanceExport = attendance;
    }

    function attendanceToTsv(attendance) {
        const months = attendance.months;
        const lines = [['Date | Month'].concat(months.map(function (m) { return m.label; })).join('\t')];
        for (let day = 1; day <= 31; day++) {
            const row = [String(day)];
            months.forEach(function (month) {
                const maxDay = daysInMonth(month.monthIndex, month.year);
                row.push(day <= maxDay ? (attendance.data[month.key][day] || '') : '');
            });
            lines.push(row.join('\t'));
        }
        return lines.join('\n');
    }

    function renderRows(containerId, rows) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = rows.map(function (row) {
            return ''
                + '<div class="profile-row">'
                + '<div class="profile-label">' + escapeHtml(row.label) + '</div>'
                + '<div class="profile-value">' + escapeHtml(display(row.value)) + '</div>'
                + '</div>';
        }).join('');
    }

    function renderCodes(admissionNo) {
        const code = admissionNo || '0';
        const barcodeEl = document.getElementById('admissionBarcode');
        if (barcodeEl && typeof JsBarcode !== 'undefined') {
            try {
                JsBarcode(barcodeEl, String(code), {
                    format: 'CODE128',
                    displayValue: true,
                    fontSize: 12,
                    height: 40,
                    margin: 4,
                    background: '#ffffff',
                    lineColor: '#111827'
                });
            } catch (e) {
                console.error(e);
            }
        }

        const qrEl = document.getElementById('admissionQr');
        if (qrEl && typeof QRCode !== 'undefined') {
            qrEl.innerHTML = '';
            try {
                new QRCode(qrEl, {
                    text: String(code),
                    width: 88,
                    height: 88,
                    colorDark: '#111827',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    function fillStudent(row) {
        const name = fullName(row) || 'Student';
        const sessionLabel = document.querySelector('.session-value');
        const session = sessionLabel ? sessionLabel.textContent.trim() : '';
        const classLabel = row.className
            ? (session ? row.className + ' (' + session + ')' : row.className)
            : '-';

        setText('summaryName', name);
        setText('summaryAdmissionNo', row.admissionNo || '-');
        setText('summaryRollNo', row.rollNumber || '-');
        setText('summaryClass', classLabel);
        setText('summarySection', row.section || '-');
        setText('summaryGender', row.gender || '-');
        setText('summaryRte', row.rte || 'No');
        setText('summaryBehaviour', String(getBehaviourScore()));
        document.title = name + ' - Smart School';

        const avatar = document.getElementById('summaryAvatar');
        if (avatar) {
            const photoUrl = row.photoUrl || row.photoPath || '';
            if (photoUrl) {
                avatar.removeAttribute('aria-hidden');
                avatar.innerHTML = '<img src="' + escapeHtml(photoUrl)
                    + '" alt="' + escapeHtml(name)
                    + '" onerror="this.style.display=\'none\'">';
            }
        }

        renderRows('generalDetailsRows', [
            { label: 'Admission Date', value: formatDate(row.admissionDate) },
            { label: 'Date Of Birth', value: formatDate(row.dateOfBirth) },
            { label: 'Category', value: row.categoryName },
            { label: 'Mobile Number', value: row.mobileNumber },
            { label: 'Caste', value: '' },
            { label: 'Religion', value: row.religion },
            { label: 'Email', value: row.email },
            { label: 'Medical History', value: row.medicalHistory },
            { label: 'Note', value: row.note }
        ]);

        renderRows('addressRows', [
            { label: 'Current Address', value: row.currentAddress },
            { label: 'Permanent Address', value: row.permanentAddress }
        ]);

        renderRows('guardianRows', [
            { label: 'Father Name', value: row.fatherName },
            { label: 'Father Phone', value: row.fatherPhone },
            { label: 'Father Occupation', value: row.fatherOccupation },
            { label: 'Mother Name', value: row.motherName },
            { label: 'Mother Phone', value: row.motherPhone },
            { label: 'Mother Occupation', value: row.motherOccupation },
            { label: 'Guardian Name', value: row.guardianName },
            { label: 'Guardian Email', value: row.guardianEmail },
            { label: 'Guardian Relation', value: row.guardianRelation || row.guardianIs },
            { label: 'Guardian Phone', value: row.guardianPhone },
            { label: 'Guardian Occupation', value: row.guardianOccupation },
            { label: 'Guardian Address', value: row.guardianAddress }
        ]);

        renderRows('routeRows', [
            { label: 'Route List', value: row.routeList },
            { label: 'Pickup Point', value: row.pickupPoint },
            { label: 'Fees Month', value: row.feesMonth }
        ]);

        renderCodes(row.admissionNo || String(row.id || ''));
    }

    async function loadStudent() {
        if (!studentId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Student id is missing.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        try {
            const response = await fetch('/api/student-admissions/' + encodeURIComponent(studentId));
            if (response.status === 404) {
                throw new Error('Student not found');
            }
            if (!response.ok) {
                const err = await response.json().catch(function () { return {}; });
                throw new Error(err.message || 'Failed to load student');
            }
            const row = await response.json();
            fillStudent(row);
            renderFeesTable();
            renderExamPanels();
            renderCbsePanels();
            renderAttendancePanel();
            renderBehaviourTable();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load student details.',
                confirmButtonColor: '#8b5cf6'
            }).then(function () {
                window.location.href = '/student/search';
            });
        }
    }

    document.querySelectorAll('.profile-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            activateTab(tab.getAttribute('data-tab'));
        });
    });

    const printBtn = document.getElementById('viewPrintBtn');
    const examPrintBtn = document.getElementById('examPrintBtn');
    const attPrintBtn = document.getElementById('attPrintBtn');
    [printBtn, examPrintBtn, attPrintBtn, document.getElementById('attPdfBtn')].forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener('click', function () {
            window.print();
        });
    });

    const attCopyBtn = document.getElementById('attCopyBtn');
    if (attCopyBtn) {
        attCopyBtn.addEventListener('click', async function () {
            const attendance = window.__studentAttendanceExport;
            if (!attendance) return;
            try {
                await navigator.clipboard.writeText(attendanceToTsv(attendance));
                Swal.fire({
                    icon: 'success',
                    title: 'Copied',
                    text: 'Attendance copied to clipboard.',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unable to copy attendance.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    function downloadAttendanceCsv() {
        const attendance = window.__studentAttendanceExport;
        if (!attendance) return;
        const text = attendanceToTsv(attendance).split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student-attendance.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    ['attCsvBtn', 'attExcelBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', downloadAttendanceCsv);
    });

    let studentDocuments = [];

    function renderDocumentsTable() {
        const body = document.getElementById('documentsTableBody');
        if (!body) return;

        if (!studentDocuments.length) {
            body.innerHTML = '<tr class="documents-empty-row"><td colspan="3">No Record Found</td></tr>';
            return;
        }

        body.innerHTML = studentDocuments.map(function (doc, index) {
            return ''
                + '<tr data-index="' + index + '">'
                + '<td>' + escapeHtml(doc.title) + '</td>'
                + '<td>' + escapeHtml(doc.fileName) + '</td>'
                + '<td><div class="documents-actions">'
                + '<button type="button" class="btn-action btn-doc-delete" title="Delete">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<polyline points="3 6 5 6 21 6"></polyline>'
                + '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
                + '</svg></button>'
                + '</div></td>'
                + '</tr>';
        }).join('');
    }

    const uploadDocumentsBtn = document.getElementById('uploadDocumentsBtn');
    const documentFileInput = document.getElementById('documentFileInput');
    const uploadGoogleDriveBtn = document.getElementById('uploadGoogleDriveBtn');
    const documentsTableBody = document.getElementById('documentsTableBody');

    if (uploadDocumentsBtn && documentFileInput) {
        uploadDocumentsBtn.addEventListener('click', function () {
            documentFileInput.click();
        });

        documentFileInput.addEventListener('change', function () {
            const files = Array.prototype.slice.call(documentFileInput.files || []);
            files.forEach(function (file) {
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                studentDocuments.push({
                    title: baseName || file.name,
                    fileName: file.name
                });
            });
            documentFileInput.value = '';
            renderDocumentsTable();
        });
    }

    if (uploadGoogleDriveBtn) {
        uploadGoogleDriveBtn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Coming Soon',
                text: 'Google Drive upload will be available in a later update.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    }

    if (documentsTableBody) {
        documentsTableBody.addEventListener('click', async function (e) {
            const deleteBtn = e.target.closest('.btn-doc-delete');
            if (!deleteBtn) return;
            const row = deleteBtn.closest('tr[data-index]');
            if (!row) return;
            const index = parseInt(row.getAttribute('data-index'), 10);
            const doc = studentDocuments[index];
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Delete Document?',
                text: 'Remove "' + (doc ? doc.fileName : 'this document') + '"?',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Delete'
            });
            if (!result.isConfirmed) return;
            studentDocuments.splice(index, 1);
            renderDocumentsTable();
        });
    }

    renderDocumentsTable();

    let timelineEntries = [
        {
            id: 1,
            date: '05/06/2026',
            title: 'School Time line',
            description: 'School Time Line',
            node: 'calendar'
        }
    ];

    function timelineNodeIcon(type) {
        if (type === 'clock') {
            return ''
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<circle cx="12" cy="12" r="10"></circle>'
                + '<polyline points="12 6 12 12 16 14"></polyline>'
                + '</svg>';
        }
        return ''
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            + '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>'
            + '<line x1="16" y1="2" x2="16" y2="6"></line>'
            + '<line x1="8" y1="2" x2="8" y2="6"></line>'
            + '<line x1="3" y1="10" x2="21" y2="10"></line>'
            + '</svg>';
    }

    function renderTimeline() {
        const track = document.getElementById('timelineTrack');
        if (!track) return;

        if (!timelineEntries.length) {
            track.innerHTML = '<div class="timeline-empty">No timeline records found.</div>';
            return;
        }

        const grouped = {};
        timelineEntries.forEach(function (entry) {
            const key = entry.date || 'No Date';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(entry);
        });

        track.innerHTML = Object.keys(grouped).map(function (date) {
            const items = grouped[date].map(function (entry, index) {
                const nodeType = entry.node || (index === 0 ? 'calendar' : 'clock');
                return ''
                    + '<div class="timeline-item" data-id="' + escapeHtml(String(entry.id)) + '">'
                    + '<span class="timeline-node ' + escapeHtml(nodeType) + '">' + timelineNodeIcon(nodeType) + '</span>'
                    + '<div class="timeline-card">'
                    + '<div class="timeline-card-header">'
                    + '<h4 class="timeline-card-title">' + escapeHtml(entry.title || '') + '</h4>'
                    + '<div class="timeline-card-actions">'
                    + '<button type="button" class="btn-action btn-timeline-download" title="Download">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                    + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>'
                    + '<polyline points="7 10 12 15 17 10"></polyline>'
                    + '<line x1="12" y1="15" x2="12" y2="3"></line>'
                    + '</svg></button>'
                    + '<button type="button" class="btn-action btn-timeline-edit" title="Edit">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                    + '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'
                    + '</svg></button>'
                    + '<button type="button" class="btn-action btn-timeline-delete" title="Delete">'
                    + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                    + '<polyline points="3 6 5 6 21 6"></polyline>'
                    + '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
                    + '</svg></button>'
                    + '</div></div>'
                    + '<div class="timeline-card-body">' + escapeHtml(entry.description || '') + '</div>'
                    + '</div></div>';
            }).join('');

            // trailing clock node like the screenshot
            const trailingClock = ''
                + '<div class="timeline-item">'
                + '<span class="timeline-node clock">' + timelineNodeIcon('clock') + '</span>'
                + '</div>';

            return ''
                + '<div class="timeline-group">'
                + '<div class="timeline-date">' + escapeHtml(date) + '</div>'
                + items
                + trailingClock
                + '</div>';
        }).join('');
    }

    const timelineModal = document.getElementById('timelineModal');
    const timelineModalTitle = document.getElementById('timelineModalTitle');
    const timelineEditId = document.getElementById('timelineEditId');
    const timelineTitleInput = document.getElementById('timelineTitleInput');
    const timelineDateInput = document.getElementById('timelineDateInput');
    const timelineDescInput = document.getElementById('timelineDescInput');
    const timelineVisibleCheck = document.getElementById('timelineVisibleCheck');
    const timelineDropzone = document.getElementById('timelineDropzone');
    const timelineFileInput = document.getElementById('timelineFileInput');
    const timelineDropzoneText = document.getElementById('timelineDropzoneText');
    let timelineSelectedFile = null;

    function todayMmDdYyyy() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return mm + '/' + dd + '/' + now.getFullYear();
    }

    function setTimelineFile(file) {
        timelineSelectedFile = file || null;
        if (timelineDropzoneText) {
            timelineDropzoneText.textContent = file
                ? file.name
                : 'Drag and drop a file here or click';
        }
    }

    function openTimelineModal(existing) {
        if (!timelineModal) return;
        if (timelineModalTitle) {
            timelineModalTitle.textContent = existing ? 'Edit Timeline' : 'Add Timeline';
        }
        if (timelineEditId) timelineEditId.value = existing ? String(existing.id) : '';
        if (timelineTitleInput) timelineTitleInput.value = existing ? (existing.title || '') : '';
        if (timelineDateInput) timelineDateInput.value = existing ? (existing.date || todayMmDdYyyy()) : todayMmDdYyyy();
        if (timelineDescInput) timelineDescInput.value = existing ? (existing.description || '') : '';
        if (timelineVisibleCheck) {
            timelineVisibleCheck.checked = existing ? existing.visible !== false : true;
        }
        setTimelineFile(existing && existing.fileName
            ? { name: existing.fileName }
            : null);
        timelineModal.classList.add('active');
        timelineModal.setAttribute('aria-hidden', 'false');
        if (timelineTitleInput) timelineTitleInput.focus();
    }

    function closeTimelineModal() {
        if (!timelineModal) return;
        timelineModal.classList.remove('active');
        timelineModal.setAttribute('aria-hidden', 'true');
        setTimelineFile(null);
        if (timelineFileInput) timelineFileInput.value = '';
    }

    function saveTimelineFromModal() {
        const title = timelineTitleInput ? timelineTitleInput.value.trim() : '';
        const date = timelineDateInput ? timelineDateInput.value.trim() : '';
        const description = timelineDescInput ? timelineDescInput.value.trim() : '';
        const visible = timelineVisibleCheck ? timelineVisibleCheck.checked : true;
        const editId = timelineEditId ? timelineEditId.value : '';

        if (!title || !date) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Fields',
                text: 'Title and Date are required.',
                confirmButtonColor: '#8b5cf6'
            });
            return;
        }

        if (editId) {
            const entry = timelineEntries.find(function (row) { return String(row.id) === String(editId); });
            if (entry) {
                entry.title = title;
                entry.date = date;
                entry.description = description || title;
                entry.visible = visible;
                entry.fileName = timelineSelectedFile ? timelineSelectedFile.name : (entry.fileName || '');
            }
        } else {
            timelineEntries.unshift({
                id: Date.now(),
                date: date,
                title: title,
                description: description || title,
                visible: visible,
                fileName: timelineSelectedFile ? timelineSelectedFile.name : '',
                node: 'calendar'
            });
        }

        closeTimelineModal();
        renderTimeline();
    }

    const timelineAddBtn = document.getElementById('timelineAddBtn');
    if (timelineAddBtn) {
        timelineAddBtn.addEventListener('click', function () {
            openTimelineModal(null);
        });
    }

    const timelineModalClose = document.getElementById('timelineModalClose');
    const timelineModalOverlay = document.getElementById('timelineModalOverlay');
    const timelineSaveBtn = document.getElementById('timelineSaveBtn');
    if (timelineModalClose) timelineModalClose.addEventListener('click', closeTimelineModal);
    if (timelineModalOverlay) timelineModalOverlay.addEventListener('click', closeTimelineModal);
    if (timelineSaveBtn) timelineSaveBtn.addEventListener('click', saveTimelineFromModal);

    if (timelineDropzone && timelineFileInput) {
        timelineDropzone.addEventListener('click', function () {
            timelineFileInput.click();
        });
        timelineFileInput.addEventListener('change', function () {
            const file = timelineFileInput.files && timelineFileInput.files[0];
            setTimelineFile(file || null);
        });
        timelineDropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
            timelineDropzone.classList.add('dragover');
        });
        timelineDropzone.addEventListener('dragleave', function () {
            timelineDropzone.classList.remove('dragover');
        });
        timelineDropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            timelineDropzone.classList.remove('dragover');
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            setTimelineFile(file || null);
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && timelineModal && timelineModal.classList.contains('active')) {
            closeTimelineModal();
        }
    });

    const timelineTrack = document.getElementById('timelineTrack');
    if (timelineTrack) {
        timelineTrack.addEventListener('click', async function (e) {
            const item = e.target.closest('.timeline-item[data-id]');
            if (!item) return;
            const id = item.getAttribute('data-id');
            const entry = timelineEntries.find(function (row) { return String(row.id) === String(id); });
            if (!entry) return;

            if (e.target.closest('.btn-timeline-download')) {
                const text = [entry.date, entry.title, entry.description].join('\n');
                try {
                    await navigator.clipboard.writeText(text);
                    Swal.fire({
                        icon: 'success',
                        title: 'Copied',
                        timer: 1000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'info',
                        title: entry.title,
                        text: entry.description,
                        confirmButtonColor: '#8b5cf6'
                    });
                }
                return;
            }

            if (e.target.closest('.btn-timeline-edit')) {
                openTimelineModal(entry);
                return;
            }

            if (e.target.closest('.btn-timeline-delete')) {
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Delete Timeline?',
                    text: 'Remove "' + entry.title + '"?',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Delete'
                });
                if (!result.isConfirmed) return;
                timelineEntries = timelineEntries.filter(function (row) {
                    return String(row.id) !== String(id);
                });
                renderTimeline();
            }
        });
    }

    renderTimeline();

    let behaviourRecords = [
        {
            title: 'Theft',
            point: -15,
            date: '07/03/2026',
            description: "It's important to report cases of theft on campus so that the university or school can increase security where needed. They could also consider other options to combat incidents of theft, such as lockers.",
            assignBy: 'Joe Black (9000)'
        },
        {
            title: 'Student Good Behaviour',
            point: 20,
            date: '07/03/2026',
            description: 'Smile & have a good attitude and good behaviour.',
            assignBy: 'Joe Black (9000)'
        },
        {
            title: 'Respect others/property.',
            point: 10,
            date: '07/03/2026',
            description: 'Respect others/property.',
            assignBy: 'Joe Black (9000)'
        },
        {
            title: 'Student Good Behaviour',
            point: 20,
            date: '04/01/2026',
            description: 'Smile & have a good attitude and good behaviour.',
            assignBy: 'Joe Black (9000)'
        }
    ];

    function getBehaviourScore() {
        return behaviourRecords.reduce(function (sum, row) {
            return sum + Number(row.point || 0);
        }, 0);
    }

    function renderBehaviourTable() {
        const body = document.getElementById('behaviourTableBody');
        if (!body) return;

        if (!behaviourRecords.length) {
            body.innerHTML = '<tr class="behaviour-empty"><td colspan="6">No Record Found</td></tr>';
            setText('summaryBehaviour', '0');
            return;
        }

        body.innerHTML = behaviourRecords.map(function (row, index) {
            const negative = Number(row.point) < 0;
            return ''
                + '<tr class="' + (negative ? 'behaviour-row-negative' : '') + '" data-index="' + index + '">'
                + '<td>' + escapeHtml(row.title || '') + '</td>'
                + '<td><span class="behaviour-point ' + (negative ? 'negative' : 'positive') + '">'
                + escapeHtml(String(row.point)) + '</span></td>'
                + '<td>' + escapeHtml(row.date || '') + '</td>'
                + '<td><div class="behaviour-desc">' + escapeHtml(row.description || '') + '</div></td>'
                + '<td>' + escapeHtml(row.assignBy || '') + '</td>'
                + '<td>'
                + '<button type="button" class="behaviour-action-btn btn-behaviour-comment" title="Comment">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                + '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'
                + '</svg></button>'
                + '</td>'
                + '</tr>';
        }).join('');

        setText('summaryBehaviour', String(getBehaviourScore()));
    }

    function behaviourToTsv() {
        const lines = [['Title', 'Point', 'Date', 'Description', 'Assign'].join('\t')];
        behaviourRecords.forEach(function (row) {
            lines.push([
                row.title || '',
                row.point,
                row.date || '',
                row.description || '',
                row.assignBy || ''
            ].join('\t'));
        });
        return lines.join('\n');
    }

    function downloadBehaviourCsv() {
        const text = behaviourToTsv().split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student-behaviour.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const behaviourCopyBtn = document.getElementById('behaviourCopyBtn');
    if (behaviourCopyBtn) {
        behaviourCopyBtn.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(behaviourToTsv());
                Swal.fire({
                    icon: 'success',
                    title: 'Copied',
                    text: 'Behaviour records copied to clipboard.',
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unable to copy behaviour records.',
                    confirmButtonColor: '#8b5cf6'
                });
            }
        });
    }

    ['behaviourExcelBtn', 'behaviourCsvBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', downloadBehaviourCsv);
    });

    ['behaviourPdfBtn', 'behaviourPrintBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            window.print();
        });
    });

    const behaviourColumnsBtn = document.getElementById('behaviourColumnsBtn');
    if (behaviourColumnsBtn) {
        behaviourColumnsBtn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Coming Soon',
                text: 'Column visibility will be available in a later update.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    }

    const behaviourTableBody = document.getElementById('behaviourTableBody');
    if (behaviourTableBody) {
        behaviourTableBody.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-behaviour-comment');
            if (!btn) return;
            const row = btn.closest('tr[data-index]');
            if (!row) return;
            const record = behaviourRecords[parseInt(row.getAttribute('data-index'), 10)];
            if (!record) return;
            Swal.fire({
                icon: 'info',
                title: record.title,
                text: record.description,
                confirmButtonColor: '#8b5cf6'
            });
        });
    }

    renderBehaviourTable();

    const feesBtn = document.getElementById('viewFeesBtn');
    if (feesBtn) {
        feesBtn.addEventListener('click', function () {
            if (studentId) {
                window.location.href = '/studentfee/addfee/' + encodeURIComponent(String(studentId));
            }
        });
    }

    const viewEditBtn = document.getElementById('viewEditBtn');
    if (viewEditBtn) {
        viewEditBtn.addEventListener('click', function () {
            if (studentId) {
                window.location.href = '/student/edit/' + encodeURIComponent(String(studentId));
            }
        });
    }

    ['viewKeyBtn', 'viewDisableBtn', 'viewInfoBtn'].forEach(function (id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Coming Soon',
                text: 'This action will be available in a later update.',
                confirmButtonColor: '#8b5cf6'
            });
        });
    });

    loadStudent();
});
