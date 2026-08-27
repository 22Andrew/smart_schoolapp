if (typeof window.applyAppBranding !== 'function') {
(function () {
    let cachedBranding = null;

    async function fetchBranding(forceRefresh) {
        if (forceRefresh) {
            cachedBranding = null;
        }
        if (cachedBranding) {
            return cachedBranding;
        }

        try {
            const response = await fetch('/api/schsettings/branding');
            if (!response.ok) {
                return null;
            }
            cachedBranding = await response.json();
            return cachedBranding;
        } catch (error) {
            console.warn('Failed to load app branding', error);
            return null;
        }
    }

    function setLogoImage(container, url, alt, className, size) {
        if (!container || !url) {
            return;
        }

        container.innerHTML = '';
        const img = document.createElement('img');
        img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        img.alt = alt || 'School logo';
        if (className) {
            img.className = className;
        }
        if (size) {
            img.width = size;
            img.height = size;
        }
        container.appendChild(img);
    }

    window.applyAppBranding = async function (forceRefresh) {
        const branding = await fetchBranding(forceRefresh);
        if (!branding) {
            return;
        }

        const schoolName = branding.schoolName || 'Smart School';
        const navbarLogo = branding.adminSmallLogo || branding.adminLogo;
        const loginLogo = branding.adminLogo || branding.adminSmallLogo;

        document.querySelectorAll('.brand-badge').forEach(function (el) {
            el.textContent = schoolName;
        });
        document.querySelectorAll('.school-name').forEach(function (el) {
            el.textContent = schoolName;
        });

        if (branding.session) {
            document.querySelectorAll('.session-value, .sidebar-session-value').forEach(function (el) {
                el.textContent = branding.session;
            });
        }

        document.querySelectorAll('.top-navbar .logo-icon').forEach(function (el) {
            if (navbarLogo) {
                setLogoImage(el, navbarLogo, schoolName, 'navbar-logo-img', 35);
            }
        });

        document.querySelectorAll('.login-left .logo-icon, .logo-section .logo-icon').forEach(function (el) {
            if (loginLogo) {
                setLogoImage(el, loginLogo, schoolName, 'login-logo-img', 50);
            }
        });

        document.querySelectorAll('.logo-text').forEach(function (el) {
            el.textContent = schoolName.toUpperCase();
        });

        if (branding.appLogo) {
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = branding.appLogo;
        }

        if (branding.printLogo) {
            document.documentElement.style.setProperty('--brand-print-logo', 'url("' + branding.printLogo + '")');
        }
        if (branding.adminLogo) {
            document.documentElement.style.setProperty('--brand-admin-logo', 'url("' + branding.adminLogo + '")');
        }
        if (branding.appLogo) {
            document.documentElement.style.setProperty('--brand-app-logo', 'url("' + branding.appLogo + '")');
        }

        if (document.title && document.title.includes('Smart School') && schoolName !== 'Smart School') {
            document.title = document.title.replace(/Smart School/g, schoolName);
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        window.applyAppBranding();
        if (typeof window.applyBackendTheme === 'function') {
            window.applyBackendTheme();
        }
    });
})();
}

// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
    // Chart.js default configuration (only if Chart.js is loaded)
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = 'Poppins, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#718096';
    }

    // Hamburger menu toggle functionality
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Fees Collection Bar Chart
    const feesCtx = document.getElementById('feesChart');
    if (feesCtx && typeof Chart !== 'undefined') {
        new Chart(feesCtx, {
            type: 'bar',
            data: {
                labels: ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
                datasets: [{
                    label: 'Main Menu Navigation',
                    data: [0, 0, 0, 0, 0, 0, 0, 8000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 2000, 0, 0, 0, 0],
                    backgroundColor: '#48bb78',
                    borderRadius: 4
                }, {
                    label: 'Currently Selected Session',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4000, 0, 0, 0, 0, 0],
                    backgroundColor: '#f6ad55',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f7fafc'
                        },
                        ticks: {
                            callback: function(value) {
                                return window.formatCurrency(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Students Present Today Donut Chart
    const studentsPresentCtx = document.getElementById('studentsPresentChart');
    if (studentsPresentCtx && typeof Chart !== 'undefined') {
        new Chart(studentsPresentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Donation', 'Rent', 'Miscellaneous'],
                datasets: [{
                    data: [35, 45, 20],
                    backgroundColor: ['#48bb78', '#f6ad55', '#4299e1'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Expense Donut Chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx && typeof Chart !== 'undefined') {
        new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Electricity Bill', 'Miscellaneous', 'Telephone Bill'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#9f7aea', '#4299e1', '#f6ad55'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Fees Collection Year Chart (Line)
    const feesYearCtx = document.getElementById('feesCollectionYearChart');
    if (feesYearCtx && typeof Chart !== 'undefined') {
        new Chart(feesYearCtx, {
            type: 'line',
            data: {
                labels: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'],
                datasets: [{
                    label: 'Fees Collection',
                    data: [0, 3000, 0, 0, 5000, 0, 0, 0, 9000, 0, 0, 0],
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4299e1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }, {
                    label: 'Expenses',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 420, 0, 0, 0],
                    borderColor: '#f6ad55',
                    backgroundColor: 'rgba(246, 173, 85, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f6ad55',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f7fafc'
                        },
                        ticks: {
                            callback: function(value) {
                                return window.formatCurrency(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    function findSubmenu(expandable) {
        const wrapper = expandable.closest('.menu-item-wrapper, .submenu-group');
        if (wrapper) {
            for (let i = 0; i < wrapper.children.length; i++) {
                const el = wrapper.children[i];
                if (el.classList && (el.classList.contains('submenu') || el.classList.contains('sub-submenu'))) {
                    return el;
                }
            }
        }
        const submenuId = expandable.getAttribute('data-submenu');
        return submenuId ? document.getElementById('submenu-' + submenuId) : null;
    }

    function activateSidebarParents(element) {
        document.querySelectorAll('.sidebar .menu-item-expandable').forEach(function (item) {
            item.classList.remove('active');
        });
        document.querySelectorAll('.sidebar .submenu-item-expandable').forEach(function (item) {
            item.classList.remove('active');
        });

        var submenu = element.closest('.submenu, .sub-submenu');
        while (submenu) {
            submenu.classList.add('open');
            var parentExpandable = submenu.parentElement
                ? submenu.parentElement.querySelector(':scope > .menu-item-expandable, :scope > .submenu-item-expandable')
                : null;
            if (parentExpandable) {
                parentExpandable.classList.add('expanded', 'active');
            }
            var parentGroup = submenu.parentElement;
            submenu = parentGroup ? parentGroup.closest('.submenu, .sub-submenu') : null;
        }
    }

    // Sidebar menu active state
    const menuItems = document.querySelectorAll('.sidebar .menu-item:not(.menu-item-expandable)');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            menuItems.forEach(mi => mi.classList.remove('active'));
            document.querySelectorAll('.sidebar .menu-item-expandable').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Expandable menu items (with submenus)
    const expandableItems = document.querySelectorAll('.sidebar .menu-item-expandable');
    
    expandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isCurrentlyExpanded = this.classList.contains('expanded');
            const currentSubmenu = findSubmenu(this);
            
            expandableItems.forEach(otherItem => {
                if (otherItem !== this) {
                    otherItem.classList.remove('expanded');
                    const otherSubmenu = findSubmenu(otherItem);
                    if (otherSubmenu) {
                        otherSubmenu.classList.remove('open');
                    }
                }
            });
            
            if (isCurrentlyExpanded) {
                this.classList.remove('expanded');
                if (currentSubmenu) {
                    currentSubmenu.classList.remove('open');
                }
            } else {
                this.classList.add('expanded');
                if (currentSubmenu) {
                    currentSubmenu.classList.add('open');
                }
            }
        });
    });

    // Submenu item active state and navigation
    const submenuItems = document.querySelectorAll('.sidebar .submenu-item:not(.submenu-item-expandable)');
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Stop event from bubbling to parent menu item
            e.stopPropagation();
            
            // Don't prevent default - allow navigation
            // Mark this item as active
            submenuItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            activateSidebarParents(this);
        });
    });

    // Nested expandable submenu items (within submenus)
    const nestedExpandableItems = document.querySelectorAll('.sidebar .submenu-item-expandable');
    nestedExpandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = this.classList.contains('expanded');
            const currentSubmenu = findSubmenu(this);
            
            const parentSubmenu = this.closest('.submenu');
            if (parentSubmenu) {
                const otherNestedItems = parentSubmenu.querySelectorAll('.submenu-item-expandable');
                otherNestedItems.forEach(otherItem => {
                    if (otherItem !== this) {
                        otherItem.classList.remove('expanded');
                        const otherSubSubmenu = findSubmenu(otherItem);
                        if (otherSubSubmenu) {
                            otherSubSubmenu.classList.remove('open');
                        }
                    }
                });
            }
            
            if (isExpanded) {
                this.classList.remove('expanded');
                if (currentSubmenu) {
                    currentSubmenu.classList.remove('open');
                }
            } else {
                this.classList.add('expanded');
                if (currentSubmenu) {
                    currentSubmenu.classList.add('open');
                }
            }
        });
    });

    // Sub-submenu item active state
    const subSubmenuItems = document.querySelectorAll('.sub-submenu-item');
    subSubmenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            subSubmenuItems.forEach(ssi => ssi.classList.remove('active'));
            this.classList.add('active');
            activateSidebarParents(this);
        });
    });

    // Auto-expand menu and activate submenu item based on current page
    function setActiveMenuFromCurrentPage() {
        let currentPath = window.location.pathname;
        // Keep Student Details menu active on individual student profile pages
        if (/^\/student\/view\/\d+\/?$/.test(currentPath)) {
            currentPath = '/student/search';
        }
        // Normalize Fees Group aliases
        if (currentPath === '/feegroup' || currentPath === '/feegroup/') {
            currentPath = '/feegroup/index';
        }
        // Normalize Fees Carry Forward aliases
        if (currentPath === '/feesforward' || currentPath === '/feesforward/') {
            currentPath = '/feesforward/index';
        }
        // Normalize Fees Reminder aliases
        if (currentPath === '/feereminder' || currentPath === '/feereminder/' || currentPath === '/feereminder/settings') {
            currentPath = '/feereminder/setting';
        }
        // Keep Fees Master menu active on assign page
        if (/^\/feemaster\/assign\/\d+\/?$/.test(currentPath)) {
            currentPath = '/feemaster';
        }
        // Keep Collect Fees menu active on student add-fee page
        if (/^\/studentfee\/addfee\/\d+\/?$/.test(currentPath)) {
            currentPath = '/studentfee';
        }
        // Normalize Collect Fees trailing slash
        if (currentPath === '/studentfee/') {
            currentPath = '/studentfee';
        }
        // Normalize Search Fees Payment trailing slash
        if (currentPath === '/studentfee/searchpayment/') {
            currentPath = '/studentfee/searchpayment';
        }
        // Normalize Offline Bank Payments trailing slash
        if (currentPath === '/offlinepayment/') {
            currentPath = '/offlinepayment';
        }
        // Normalize Online Course aliases
        if (currentPath === '/onlinecourse/course' || currentPath === '/onlinecourse/course/') {
            currentPath = '/onlinecourse/course/index';
        }
        // Normalize Behaviour Records aliases
        if (currentPath.startsWith('/behaviour/report/')) {
            currentPath = '/behaviour/report/studentincidentreport';
        }
        if (currentPath.startsWith('/report/') && currentPath.endsWith('/')) {
            currentPath = currentPath.slice(0, -1);
        }
        if (currentPath === '/attendencereports/attendance/') {
            currentPath = '/attendencereports/attendance';
        } else if (currentPath === '/admin/financereports/finance/') {
            currentPath = '/admin/financereports/finance';
        } else if (currentPath.startsWith('/financereports/')) {
            if (currentPath.endsWith('/') && currentPath.length > 1) {
                currentPath = currentPath.slice(0, -1);
            }
        } else if (currentPath === '/admin/examresult/examinations/') {
            currentPath = '/admin/examresult/examinations';
        } else if (currentPath === '/admin/onlineexam/report/') {
            currentPath = '/admin/onlineexam/report';
        }
        if (currentPath === '/behaviour/studentincidents/') {
            currentPath = '/behaviour/studentincidents';
        }
        if (currentPath === '/behaviour/incidents/') {
            currentPath = '/behaviour/incidents';
        }
        if (currentPath === '/behaviour/behavioursetting/') {
            currentPath = '/behaviour/behavioursetting';
        }
        if (currentPath === '/gmeet/timetable/') {
            currentPath = '/gmeet/timetable';
        } else if (currentPath === '/gmeet/meeting/') {
            currentPath = '/gmeet/meeting';
        } else if (currentPath === '/gmeet/classreport/') {
            currentPath = '/gmeet/classreport';
        } else if (currentPath === '/gmeet/meetingreport/') {
            currentPath = '/gmeet/meetingreport';
        } else if (currentPath === '/gmeet/index/') {
            currentPath = '/gmeet/index';
        } else if (currentPath === '/conference/meeting/') {
            currentPath = '/conference/meeting';
        } else if (currentPath === '/conference/timetable/') {
            currentPath = '/conference/timetable';
        } else if (currentPath === '/conference/classreport/') {
            currentPath = '/conference/classreport';
        } else if (currentPath === '/conference/meetingreport/') {
            currentPath = '/conference/meetingreport';
        } else if (currentPath === '/conference/') {
            currentPath = '/conference';
        } else if (currentPath === '/income/') {
            currentPath = '/income';
        } else if (currentPath === '/income/incomesearch/') {
            currentPath = '/income/incomesearch';
        } else if (currentPath === '/income/incomehead/') {
            currentPath = '/income/incomehead';
        } else if (currentPath === '/expense/') {
            currentPath = '/expense';
        } else if (currentPath === '/expense/searchexpense/') {
            currentPath = '/expense/searchexpense';
        } else if (currentPath === '/expense/expensehead/') {
            currentPath = '/expense/expensehead';
        } else if (currentPath === '/qrattendance/attendance/index/') {
            currentPath = '/qrattendance/attendance/index';
        } else if (currentPath === '/qrattendance/qrsetting/index/') {
            currentPath = '/qrattendance/qrsetting/index';
        } else if (currentPath === '/examgroup/') {
            currentPath = '/examgroup';
        } else if (currentPath === '/cbseexam/exam/') {
            currentPath = '/cbseexam/exam';
        } else if (currentPath === '/cbseexam/cbsecategory/index/') {
            currentPath = '/cbseexam/cbsecategory/index';
        } else if (currentPath === '/cbseexam/cbsegrade/index/') {
            currentPath = '/cbseexam/cbsegrade/index';
        } else if (currentPath === '/cbseexam/cbseassessment/index/') {
            currentPath = '/cbseexam/cbseassessment/index';
        } else if (currentPath === '/cbseexam/cbseterm/index/') {
            currentPath = '/cbseexam/cbseterm/index';
        } else if (currentPath === '/cbseexam/report/examsubject/') {
            currentPath = '/cbseexam/report/examsubject';
        } else if (currentPath === '/cbseexam/report/examtemplate/') {
            currentPath = '/cbseexam/report/examtemplate';
        } else if (currentPath === '/cbseexam/cbseadmitcard/admitcard/') {
            currentPath = '/cbseexam/cbseadmitcard/admitcard';
        } else if (currentPath === '/cbseexam/observation/assign/') {
            currentPath = '/cbseexam/observation/assign';
        } else if (currentPath === '/cbseexam/template/') {
            currentPath = '/cbseexam/template';
        } else if (currentPath === '/cbseexam/result/marksheet/') {
            currentPath = '/cbseexam/result/marksheet';
        } else if (currentPath === '/cbseexam/exam/examtimetable/') {
            currentPath = '/cbseexam/exam/examtimetable';
        } else if (currentPath === '/cbseexam/exam/examschedule/') {
            currentPath = '/cbseexam/exam/examschedule';
        } else if (currentPath === '/cbseexam/examresult/') {
            currentPath = '/cbseexam/examresult';
        } else if (currentPath === '/admitcard/') {
            currentPath = '/admitcard';
        } else if (currentPath === '/examresult/admitcard/') {
            currentPath = '/examresult/admitcard';
        } else if (currentPath === '/examresult/marksheet/') {
            currentPath = '/examresult/marksheet';
        } else if (currentPath === '/emarksheet/') {
            currentPath = '/emarksheet';
        } else if (currentPath === '/grade/') {
            currentPath = '/grade';
        } else if (currentPath === '/marksdivision/') {
            currentPath = '/marksdivision';
        } else if (currentPath === '/stuattendance/index/') {
            currentPath = '/stuattendance/index';
        } else if (currentPath === '/approveleave/') {
            currentPath = '/approveleave';
        } else if (currentPath === '/stuattendence/attendencereport/') {
            currentPath = '/stuattendence/attendencereport';
        } else if (currentPath === '/onlineexam/') {
            currentPath = '/onlineexam';
        } else if (currentPath === '/question/') {
            currentPath = '/question';
        } else if (currentPath === '/holiday/index/') {
            currentPath = '/holiday/index';
        } else if (currentPath === '/holidaytype/') {
            currentPath = '/holidaytype';
        } else if (currentPath === '/lessonplan/topic/') {
            currentPath = '/lessonplan/topic';
        } else if (currentPath === '/lessonplan/syllabus/status/') {
            currentPath = '/lessonplan/syllabus/status';
        } else if (currentPath === '/lesson/') {
            currentPath = '/lesson';
        } else if (currentPath === '/syllabus/') {
            currentPath = '/syllabus';
        } else if (currentPath === '/lessonplan/copylesson/') {
            currentPath = '/lessonplan/copylesson';
        } else if (currentPath === '/staffattendance/index/') {
            currentPath = '/staffattendance/index';
        } else if (currentPath === '/payroll/') {
            currentPath = '/payroll';
        } else if (currentPath === '/leaverequest/') {
            currentPath = '/leaverequest';
        } else if (currentPath === '/staff/leaverequest/') {
            currentPath = '/staff/leaverequest';
        } else if (currentPath === '/staff/leavetypes/') {
            currentPath = '/staff/leavetypes';
        } else if (currentPath === '/staff/rating/') {
            currentPath = '/staff/rating';
        } else if (currentPath === '/department/') {
            currentPath = '/department';
        } else if (currentPath === '/sessions/') {
            currentPath = '/sessions';
        } else if (currentPath === '/admin/notification/setting/') {
            currentPath = '/admin/notification/setting';
        } else if (currentPath === '/designation/') {
            currentPath = '/designation';
        } else if (currentPath === '/schsettings/') {
            currentPath = '/schsettings';
        } else if (currentPath === '/schsettings/logo/') {
            currentPath = '/schsettings/logo';
        } else if (currentPath === '/schsettings/logopagebackground/') {
            currentPath = '/schsettings/logopagebackground';
        } else if (currentPath === '/schsettings/backendtheme/') {
            currentPath = '/schsettings/backendtheme';
        } else if (currentPath === '/schsettings/mobileapp/') {
            currentPath = '/schsettings/mobileapp';
        } else if (currentPath === '/schsettings/studentguardianpanel/') {
            currentPath = '/schsettings/studentguardianpanel';
        } else if (currentPath === '/schsettings/fees/') {
            currentPath = '/schsettings/fees';
        } else if (currentPath === '/schsettings/idautogeneration/') {
            currentPath = '/schsettings/idautogeneration';
        } else if (currentPath === '/schsettings/attendancetype/') {
            currentPath = '/schsettings/attendancetype';
        } else if (currentPath === '/schsettings/googledrivesetting/') {
            currentPath = '/schsettings/googledrivesetting';
        } else if (currentPath === '/smsconfig/') {
            currentPath = '/smsconfig';
        } else if (currentPath === '/emailconfig/') {
            currentPath = '/emailconfig';
        } else if (currentPath === '/admin/paymentsettings/' || currentPath === '/admin/paymentsettings/index') {
            currentPath = '/admin/paymentsettings';
        } else if (currentPath === '/admin/printheaderfooter/' || currentPath === '/admin/printheaderfooter/index') {
            currentPath = '/admin/printheaderfooter';
        } else if (currentPath === '/admin/thermalprint' || currentPath === '/admin/thermalprint/' || currentPath === '/admin/thermalprint/index') {
            currentPath = '/admin/thermalprint/index';
        } else if (currentPath === '/admin/frontcms/' || currentPath === '/admin/frontcms/index') {
            currentPath = '/admin/frontcms';
        } else if (currentPath === '/admin/roles/' || currentPath === '/admin/roles/index') {
            currentPath = '/admin/roles';
        } else if (currentPath === '/admin/backup/' || currentPath === '/admin/backup/index') {
            currentPath = '/admin/backup';
        } else if (currentPath === '/admin/language/' || currentPath === '/admin/language/index') {
            currentPath = '/admin/language';
        } else if (currentPath === '/admin/currency/' || currentPath === '/admin/currency/index') {
            currentPath = '/admin/currency';
        } else if (currentPath === '/admin/addons/' || currentPath === '/admin/addons/index') {
            currentPath = '/admin/addons';
        } else if (currentPath === '/admin/users/' || currentPath === '/admin/users/index') {
            currentPath = '/admin/users';
        } else if (currentPath === '/admin/module/' || currentPath === '/admin/module/index') {
            currentPath = '/admin/module';
        } else if (currentPath === '/admin/customfield/' || currentPath === '/admin/customfield/index') {
            currentPath = '/admin/customfield';
        } else if (currentPath === '/admin/captcha/' || currentPath === '/admin/captcha/index') {
            currentPath = '/admin/captcha';
        } else if (currentPath === '/admin/systemfield/' || currentPath === '/admin/systemfield/index') {
            currentPath = '/admin/systemfield';
        } else if (currentPath === '/admin/profilesetting/' || currentPath === '/admin/profilesetting/index'
                || currentPath === '/student/profilesetting/' || currentPath === '/student/profilesetting/index') {
            currentPath = '/admin/profilesetting';
        } else if (currentPath === '/admin/onlineadmission/admissionsetting/'
                || currentPath === '/admin/onlineadmission/admissionsetting/index') {
            currentPath = '/admin/onlineadmission/admissionsetting';
        } else if (currentPath === '/admin/filetype/' || currentPath === '/admin/filetype/index'
                || currentPath === '/admin/admin/filetype/' || currentPath === '/admin/admin/filetype/index') {
            currentPath = '/admin/filetype';
        } else if (currentPath === '/admin/sidemenu/' || currentPath === '/admin/sidemenu/index') {
            currentPath = '/admin/sidemenu';
        } else if (currentPath === '/whatsappconfig' || currentPath === '/whatsappconfig/') {
            currentPath = '/whatsappconfig/index';
        } else if (currentPath === '/schsettings/whatsappsettings/') {
            currentPath = '/schsettings/whatsappsettings';
        } else if (currentPath === '/schsettings/chatsetting/') {
            currentPath = '/schsettings/chatsetting';
        } else if (currentPath === '/schsettings/maintenance/') {
            currentPath = '/schsettings/maintenance';
        } else if (currentPath === '/schsettings/miscellaneous/') {
            currentPath = '/schsettings/miscellaneous';
        } else if (currentPath === '/staff/disablestafflist/') {
            currentPath = '/staff/disablestafflist';
        } else if (currentPath === '/staff/') {
            currentPath = '/staff';
        } else if (currentPath.startsWith('/staff/edit/') || currentPath === '/staff/add') {
            currentPath = '/staff';
        }
        if (currentPath === '/multibranch/branch/overview/') {
            currentPath = '/multibranch/branch/overview';
        } else if (currentPath === '/multibranch/branch/') {
            currentPath = '/multibranch/branch';
        }
        if (/^\/admin\/resume\/fill\/\d+\/?$/.test(currentPath)) {
            currentPath = '/admin/resume/index';
        }
        if (currentPath.startsWith('/multibranch/finance/')) {
            if (currentPath.includes('payrollreport')) {
                currentPath = '/multibranch/finance/payrollreport';
            } else if (currentPath.includes('incomereport')) {
                currentPath = '/multibranch/finance/incomereport';
            } else if (currentPath.includes('expensereport')) {
                currentPath = '/multibranch/finance/expensereport';
            } else if (currentPath.includes('userlogreport')) {
                currentPath = '/multibranch/finance/userlogreport';
            } else {
                currentPath = '/multibranch/finance/dailycollectionreport';
            }
        }

        const expandableItems = document.querySelectorAll('.sidebar .menu-item-expandable');
        const allSubmenuItems = document.querySelectorAll('.sidebar .submenu-item');

        // Reset sidebar state so JS controls expand/active consistently
        expandableItems.forEach(item => item.classList.remove('expanded', 'active'));
        document.querySelectorAll('.sidebar .submenu, .sidebar .sub-submenu').forEach(submenu => submenu.classList.remove('open', 'active'));
        allSubmenuItems.forEach(item => item.classList.remove('active'));

        let bestMatch = null;
        let bestLength = -1;
        
        allSubmenuItems.forEach(item => {
            const itemHref = item.getAttribute('href');
            if (!itemHref || itemHref === '#') return;

            // Exact match, or nested path (e.g. /timetable matches /timetable/create)
            // Avoid false positives like /hostel matching /hostelroom
            const isExact = currentPath === itemHref;
            const isNested = currentPath.startsWith(itemHref + '/');
            if (!isExact && !isNested) return;

            if (itemHref.length > bestLength) {
                bestMatch = item;
                bestLength = itemHref.length;
            }
        });

        if (currentPath === '/cbseexam/cbsecategory/index'
                || currentPath === '/cbseexam/cbsegrade/index'
                || currentPath === '/cbseexam/cbseassessment/index'
                || currentPath === '/cbseexam/cbseterm/index') {
            const settingItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/cbsecategory/index"]');
            if (settingItem) {
                bestMatch = settingItem;
                bestLength = settingItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/report/examsubject') {
            const reportsItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/report/examsubject"]');
            if (reportsItem) {
                bestMatch = reportsItem;
                bestLength = reportsItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/report/examtemplate') {
            const reportsItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/report/examsubject"]');
            if (reportsItem) {
                bestMatch = reportsItem;
                bestLength = reportsItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/cbseadmitcard/admitcard') {
            const admitCardItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/cbseadmitcard/admitcard"]');
            if (admitCardItem) {
                bestMatch = admitCardItem;
                bestLength = admitCardItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/observation/assign') {
            const assignItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/observation/assign"]');
            if (assignItem) {
                bestMatch = assignItem;
                bestLength = assignItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/template') {
            const templateItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/template"]');
            if (templateItem) {
                bestMatch = templateItem;
                bestLength = templateItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/result/marksheet') {
            const marksheetItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/result/marksheet"]');
            if (marksheetItem) {
                bestMatch = marksheetItem;
                bestLength = marksheetItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/exam/examtimetable') {
            const examScheduleItem = document.querySelector('#submenu-cbse-examination a[href="/cbseexam/exam/examtimetable"]');
            if (examScheduleItem) {
                bestMatch = examScheduleItem;
                bestLength = examScheduleItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/exam/examschedule') {
            const examScheduleItem = document.querySelector('#submenu-examinations a[href="/cbseexam/exam/examschedule"]');
            if (examScheduleItem) {
                bestMatch = examScheduleItem;
                bestLength = examScheduleItem.getAttribute('href').length;
            }
        } else if (currentPath === '/cbseexam/examresult') {
            const examResultItem = document.querySelector('#submenu-examinations a[href="/cbseexam/examresult"]');
            if (examResultItem) {
                bestMatch = examResultItem;
                bestLength = examResultItem.getAttribute('href').length;
            }
        } else if (currentPath === '/admitcard') {
            const designAdmitCardItem = document.querySelector('#submenu-examinations a[href="/admitcard"]');
            if (designAdmitCardItem) {
                bestMatch = designAdmitCardItem;
                bestLength = designAdmitCardItem.getAttribute('href').length;
            }
        } else if (currentPath === '/examresult/admitcard') {
            const printAdmitCardItem = document.querySelector('#submenu-examinations a[href="/examresult/admitcard"]');
            if (printAdmitCardItem) {
                bestMatch = printAdmitCardItem;
                bestLength = printAdmitCardItem.getAttribute('href').length;
            }
        } else if (currentPath === '/emarksheet') {
            const designMarksheetItem = document.querySelector('#submenu-examinations a[href="/emarksheet"]');
            if (designMarksheetItem) {
                bestMatch = designMarksheetItem;
                bestLength = designMarksheetItem.getAttribute('href').length;
            }
        } else if (currentPath === '/examresult/marksheet') {
            const printMarksheetItem = document.querySelector('#submenu-examinations a[href="/examresult/marksheet"]');
            if (printMarksheetItem) {
                bestMatch = printMarksheetItem;
                bestLength = printMarksheetItem.getAttribute('href').length;
            }
        } else if (currentPath === '/grade') {
            const marksGradeItem = document.querySelector('#submenu-examinations a[href="/grade"]');
            if (marksGradeItem) {
                bestMatch = marksGradeItem;
                bestLength = marksGradeItem.getAttribute('href').length;
            }
        } else if (currentPath === '/marksdivision') {
            const marksDivisionItem = document.querySelector('#submenu-examinations a[href="/marksdivision"]');
            if (marksDivisionItem) {
                bestMatch = marksDivisionItem;
                bestLength = marksDivisionItem.getAttribute('href').length;
            }
        } else if (currentPath === '/stuattendance/index') {
            const studentAttendanceItem = document.querySelector('#submenu-attendance a[href="/stuattendance/index"]');
            if (studentAttendanceItem) {
                bestMatch = studentAttendanceItem;
                bestLength = studentAttendanceItem.getAttribute('href').length;
            }
        } else if (currentPath === '/approveleave') {
            const approveLeaveItem = document.querySelector('#submenu-attendance a[href="/approveleave"]');
            if (approveLeaveItem) {
                bestMatch = approveLeaveItem;
                bestLength = approveLeaveItem.getAttribute('href').length;
            }
        } else if (currentPath === '/stuattendence/attendencereport') {
            const attendanceByDateItem = document.querySelector('#submenu-attendance a[href="/stuattendence/attendencereport"]');
            if (attendanceByDateItem) {
                bestMatch = attendanceByDateItem;
                bestLength = attendanceByDateItem.getAttribute('href').length;
            }
        } else if (currentPath === '/onlineexam') {
            const onlineExamItem = document.querySelector('#submenu-online-examinations a[href="/onlineexam"]');
            if (onlineExamItem) {
                bestMatch = onlineExamItem;
                bestLength = onlineExamItem.getAttribute('href').length;
            }
        } else if (currentPath === '/question') {
            const questionBankItem = document.querySelector('#submenu-online-examinations a[href="/question"]');
            if (questionBankItem) {
                bestMatch = questionBankItem;
                bestLength = questionBankItem.getAttribute('href').length;
            }
        } else if (currentPath === '/holiday/index') {
            const annualCalendarItem = document.querySelector('#submenu-annual-calendar a[href="/holiday/index"]');
            if (annualCalendarItem) {
                bestMatch = annualCalendarItem;
                bestLength = annualCalendarItem.getAttribute('href').length;
            }
        } else if (currentPath === '/holidaytype') {
            const holidayTypeItem = document.querySelector('#submenu-annual-calendar a[href="/holidaytype"]');
            if (holidayTypeItem) {
                bestMatch = holidayTypeItem;
                bestLength = holidayTypeItem.getAttribute('href').length;
            }
        } else if (currentPath === '/lessonplan/topic') {
            const topicItem = document.querySelector('#submenu-lesson-plan a[href="/lessonplan/topic"]');
            if (topicItem) {
                bestMatch = topicItem;
                bestLength = topicItem.getAttribute('href').length;
            }
        } else if (currentPath === '/lessonplan/syllabus/status') {
            const syllabusStatusItem = document.querySelector('#submenu-lesson-plan a[href="/lessonplan/syllabus/status"]');
            if (syllabusStatusItem) {
                bestMatch = syllabusStatusItem;
                bestLength = syllabusStatusItem.getAttribute('href').length;
            }
        } else if (currentPath === '/lesson') {
            const lessonItem = document.querySelector('#submenu-lesson-plan a[href="/lesson"]');
            if (lessonItem) {
                bestMatch = lessonItem;
                bestLength = lessonItem.getAttribute('href').length;
            }
        } else if (currentPath === '/syllabus') {
            const syllabusItem = document.querySelector('#submenu-lesson-plan a[href="/syllabus"]');
            if (syllabusItem) {
                bestMatch = syllabusItem;
                bestLength = syllabusItem.getAttribute('href').length;
            }
        } else if (currentPath === '/lessonplan/copylesson') {
            const copyLessonItem = document.querySelector('#submenu-lesson-plan a[href="/lessonplan/copylesson"]');
            if (copyLessonItem) {
                bestMatch = copyLessonItem;
                bestLength = copyLessonItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staff') {
            const staffItem = document.querySelector('#submenu-human-resource a[href="/staff"]');
            if (staffItem) {
                bestMatch = staffItem;
                bestLength = staffItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staffattendance/index') {
            const staffAttendanceItem = document.querySelector('#submenu-human-resource a[href="/staffattendance/index"]');
            if (staffAttendanceItem) {
                bestMatch = staffAttendanceItem;
                bestLength = staffAttendanceItem.getAttribute('href').length;
            }
        } else if (currentPath === '/payroll') {
            const payrollItem = document.querySelector('#submenu-human-resource a[href="/payroll"]');
            if (payrollItem) {
                bestMatch = payrollItem;
                bestLength = payrollItem.getAttribute('href').length;
            }
        } else if (currentPath === '/leaverequest') {
            const leaveRequestItem = document.querySelector('#submenu-human-resource a[href="/leaverequest"]');
            if (leaveRequestItem) {
                bestMatch = leaveRequestItem;
                bestLength = leaveRequestItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staff/leaverequest') {
            const applyLeaveItem = document.querySelector('#submenu-human-resource a[href="/staff/leaverequest"]');
            if (applyLeaveItem) {
                bestMatch = applyLeaveItem;
                bestLength = applyLeaveItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staff/leavetypes') {
            const leaveTypeItem = document.querySelector('#submenu-human-resource a[href="/staff/leavetypes"]');
            if (leaveTypeItem) {
                bestMatch = leaveTypeItem;
                bestLength = leaveTypeItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staff/rating') {
            const teachersRatingItem = document.querySelector('#submenu-human-resource a[href="/staff/rating"]');
            if (teachersRatingItem) {
                bestMatch = teachersRatingItem;
                bestLength = teachersRatingItem.getAttribute('href').length;
            }
        } else if (currentPath === '/department') {
            const departmentItem = document.querySelector('#submenu-human-resource a[href="/department"]');
            if (departmentItem) {
                bestMatch = departmentItem;
                bestLength = departmentItem.getAttribute('href').length;
            }
        } else if (currentPath === '/sessions') {
            const sessionsItem = document.querySelector('#submenu-system-settings a[href="/sessions"], #submenu-system-setting a[href="/sessions"]');
            if (sessionsItem) {
                bestMatch = sessionsItem;
                bestLength = sessionsItem.getAttribute('href').length;
            }
        } else if (currentPath === '/admin/notification/setting') {
            const notificationItem = document.querySelector('#submenu-system-settings a[href="/admin/notification/setting"], #submenu-system-setting a[href="/admin/notification/setting"]');
            if (notificationItem) {
                bestMatch = notificationItem;
                bestLength = notificationItem.getAttribute('href').length;
            }
        } else if (currentPath === '/designation') {
            const designationItem = document.querySelector('#submenu-human-resource a[href="/designation"]');
            if (designationItem) {
                bestMatch = designationItem;
                bestLength = designationItem.getAttribute('href').length;
            }
        } else if (currentPath === '/staff/disablestafflist') {
            const disabledStaffItem = document.querySelector('#submenu-human-resource a[href="/staff/disablestafflist"]');
            if (disabledStaffItem) {
                bestMatch = disabledStaffItem;
                bestLength = disabledStaffItem.getAttribute('href').length;
            }
        } else if (currentPath === '/schsettings') {
            const generalSettingItem = document.querySelector('#submenu-system-setting a[href="/schsettings"], #submenu-system-settings a[href="/schsettings"]');
            if (generalSettingItem) {
                bestMatch = generalSettingItem;
                bestLength = generalSettingItem.getAttribute('href').length;
            }
        } else if (currentPath === '/schsettings/logo' || currentPath === '/schsettings/logopagebackground' || currentPath === '/schsettings/backendtheme' || currentPath === '/schsettings/mobileapp' || currentPath === '/schsettings/studentguardianpanel' || currentPath === '/schsettings/fees' || currentPath === '/schsettings/idautogeneration' || currentPath === '/schsettings/attendancetype' || currentPath === '/schsettings/googledrivesetting' || currentPath === '/schsettings/whatsappsettings' || currentPath === '/schsettings/chatsetting' || currentPath === '/schsettings/maintenance' || currentPath === '/schsettings/miscellaneous') {
            const generalSettingItem = document.querySelector('#submenu-system-setting a[href="/schsettings"], #submenu-system-settings a[href="/schsettings"]');
            if (generalSettingItem) {
                bestMatch = generalSettingItem;
                bestLength = generalSettingItem.getAttribute('href').length;
            }
        } else if (currentPath.startsWith('/financereports/')) {
            const financeReportItem = document.querySelector('#submenu-reports a[href="/admin/financereports/finance"]');
            if (financeReportItem) {
                bestMatch = financeReportItem;
                bestLength = financeReportItem.getAttribute('href').length;
            }
        } else if (currentPath === '/report/alumnireport' || currentPath === '/report/alumni') {
            const alumniReportItem = document.querySelector('#submenu-reports a[href="/report/alumnireport"]');
            if (alumniReportItem) {
                bestMatch = alumniReportItem;
                bestLength = alumniReportItem.getAttribute('href').length;
            }
        } else if (currentPath === '/admin/userlog' || currentPath === '/report/userlog') {
            const userLogItem = document.querySelector('#submenu-reports a[href="/admin/userlog"]');
            if (userLogItem) {
                bestMatch = userLogItem;
                bestLength = userLogItem.getAttribute('href').length;
            }
        } else if (currentPath === '/admin/audit' || currentPath === '/report/audittrail') {
            const auditTrailItem = document.querySelector('#submenu-reports a[href="/admin/audit"]');
            if (auditTrailItem) {
                bestMatch = auditTrailItem;
                bestLength = auditTrailItem.getAttribute('href').length;
            }
        } else if (currentPath === '/admin/calendar/events') {
            const calendarItem = document.querySelector('#submenu-annual-calendar a[href="/holiday/index"]');
            if (calendarItem) {
                bestMatch = calendarItem;
                bestLength = calendarItem.getAttribute('href').length;
            }
        }

        if (!bestMatch) return;

        bestMatch.classList.add('active');
        activateSidebarParents(bestMatch);
    }
    
    // Call on page load
    setActiveMenuFromCurrentPage();

    // Add animation to stat cards on load (optimized)
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        // Use CSS classes instead of direct style manipulation
        card.classList.add('stat-card-animate');
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Calendar Functionality (only on dashboard)
    const monthView = document.getElementById('monthView');
    const weekView = document.getElementById('weekView');
    const dayView = document.getElementById('dayView');
    const calendarTitle = document.getElementById('calendarTitle');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    const viewTabs = document.querySelectorAll('.view-tab');

    // Only initialize calendar if elements exist
    if (monthView && weekView && dayView && prevBtn && nextBtn && todayBtn) {
        let currentDate = new Date();
        let currentView = 'week'; // default view

        // Format date helper functions
        function formatMonthYear(date) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }

        function formatWeekRange(date) {
            const startOfWeek = getStartOfWeek(date);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${months[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
        }

        function formatDayDate(date) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
            return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }

        function getStartOfWeek(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day;
            return new Date(d.setDate(diff));
        }

        function isSameDay(date1, date2) {
            return date1.getDate() === date2.getDate() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getFullYear() === date2.getFullYear();
        }

        // Render Month View
        function renderMonthView() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const prevLastDay = new Date(year, month, 0);
            
            const firstDayOfWeek = firstDay.getDay();
            const lastDateOfMonth = lastDay.getDate();
            const prevLastDate = prevLastDay.getDate();
            
            const monthDaysGrid = document.getElementById('monthDaysGrid');
            monthDaysGrid.innerHTML = '';
            
            const today = new Date();
            
            // Previous month days
            for (let i = firstDayOfWeek; i > 0; i--) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'month-day other-month';
                dayDiv.innerHTML = `<div class="month-day-number">${prevLastDate - i + 1}</div>`;
                monthDaysGrid.appendChild(dayDiv);
            }
            
            // Current month days
            for (let day = 1; day <= lastDateOfMonth; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'month-day';
                
                const currentDateCheck = new Date(year, month, day);
                if (isSameDay(currentDateCheck, today)) {
                    dayDiv.classList.add('today');
                }
                
                dayDiv.innerHTML = `<div class="month-day-number">${day}</div>`;
                dayDiv.addEventListener('click', () => {
                    currentDate = new Date(year, month, day);
                    switchView('day');
                });
                monthDaysGrid.appendChild(dayDiv);
            }
            
            // Next month days
            const remainingDays = 42 - (firstDayOfWeek + lastDateOfMonth);
            for (let day = 1; day <= remainingDays; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'month-day other-month';
                dayDiv.innerHTML = `<div class="month-day-number">${day}</div>`;
                monthDaysGrid.appendChild(dayDiv);
            }
            
            calendarTitle.textContent = formatMonthYear(currentDate);
        }

        // Render Week View
        function renderWeekView() {
            const startOfWeek = getStartOfWeek(currentDate);
            const weekDaysHeaders = document.getElementById('weekDaysHeaders');
            const weekDaysBody = document.getElementById('weekDaysBody');
            
            weekDaysHeaders.innerHTML = '';
            weekDaysBody.innerHTML = '';
            
            const today = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(date.getDate() + i);
                
                // Header
                const headerDiv = document.createElement('div');
                headerDiv.className = 'calendar-day-header';
                if (isSameDay(date, today)) {
                    headerDiv.classList.add('today');
                }
                headerDiv.innerHTML = `
                    <div class="day-name">${days[date.getDay()]}</div>
                    <div class="day-number">${date.getDate()}</div>
                `;
                weekDaysHeaders.appendChild(headerDiv);
                
                // Body column
                const columnDiv = document.createElement('div');
                columnDiv.className = 'calendar-day-column';
                
                // Create 24 time slots
                for (let hour = 0; hour < 24; hour++) {
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'day-time-slot';
                    columnDiv.appendChild(slotDiv);
                }
                
                weekDaysBody.appendChild(columnDiv);
            }
            
            calendarTitle.textContent = formatWeekRange(currentDate);
        }

        // Render Day View
        function renderDayView() {
            const dayHeader = document.getElementById('dayHeader');
            const dayBody = document.getElementById('dayBody');
            
            dayHeader.innerHTML = '';
            dayBody.innerHTML = '';
            
            const today = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'calendar-day-header';
            if (isSameDay(currentDate, today)) {
                headerDiv.classList.add('today');
            }
            headerDiv.innerHTML = `
                <div class="day-name">${days[currentDate.getDay()]}</div>
                <div class="day-number">${currentDate.getDate()}</div>
            `;
            dayHeader.appendChild(headerDiv);
            
            // Body column
            const columnDiv = document.createElement('div');
            columnDiv.className = 'calendar-day-column';
            
            // Create 24 time slots
            for (let hour = 0; hour < 24; hour++) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'day-time-slot';
                columnDiv.appendChild(slotDiv);
            }
            
            dayBody.appendChild(columnDiv);
            
            calendarTitle.textContent = formatDayDate(currentDate);
        }

        // Switch View
        function switchView(view) {
            currentView = view;
            
            // Hide all views
            monthView.style.display = 'none';
            weekView.style.display = 'none';
            dayView.style.display = 'none';
            
            // Update active tab
            viewTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-view') === view) {
                    tab.classList.add('active');
                }
            });
            
            // Show and render selected view
            switch(view) {
                case 'month':
                    monthView.style.display = 'block';
                    renderMonthView();
                    break;
                case 'week':
                    weekView.style.display = 'block';
                    renderWeekView();
                    break;
                case 'day':
                    dayView.style.display = 'block';
                    renderDayView();
                    break;
            }
        }

        // Navigation functions
        function goToNext() {
            switch(currentView) {
                case 'month':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    renderMonthView();
                    break;
                case 'week':
                    currentDate.setDate(currentDate.getDate() + 7);
                    renderWeekView();
                    break;
                case 'day':
                    currentDate.setDate(currentDate.getDate() + 1);
                    renderDayView();
                    break;
            }
        }

        function goToPrev() {
            switch(currentView) {
                case 'month':
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    renderMonthView();
                    break;
                case 'week':
                    currentDate.setDate(currentDate.getDate() - 7);
                    renderWeekView();
                    break;
                case 'day':
                    currentDate.setDate(currentDate.getDate() - 1);
                    renderDayView();
                    break;
            }
        }

        function goToToday() {
            currentDate = new Date();
            switch(currentView) {
                case 'month':
                    renderMonthView();
                    break;
                case 'week':
                    renderWeekView();
                    break;
                case 'day':
                    renderDayView();
                    break;
            }
        }

        // Event listeners
        prevBtn.addEventListener('click', goToPrev);
        nextBtn.addEventListener('click', goToNext);
        todayBtn.addEventListener('click', goToToday);
        
        viewTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.getAttribute('data-view');
                switchView(view);
            });
        });

        // Initialize calendar with week view
        renderWeekView();
    } // End of calendar functionality check

    // Profile Dropdown Functionality
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    // Toggle profile dropdown
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileDropdown.classList.contains('active')) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    function normalizeMenuPath(path) {
        if (!path || path === '#') {
            return '';
        }
        let value = String(path).split('?')[0].split('#')[0];
        if (!value.startsWith('/')) {
            value = '/' + value;
        }
        if (value.length > 1 && value.endsWith('/')) {
            value = value.slice(0, -1);
        }
        return value.toLowerCase();
    }

    async function fetchSidebarMenuSettings() {
        try {
            const response = await fetch('/api/sidebar-menu-settings');
            if (!response.ok) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.warn('Failed to load sidebar menu settings', error);
            return null;
        }
    }

    function applySidebarMenuSettings(settings) {
        const sidebarMenu = document.querySelector('.sidebar .sidebar-menu');
        if (!sidebarMenu || !settings) {
            return;
        }

        const selectedMenus = settings.selectedMenus || [];
        const selectedSlugs = new Set(selectedMenus.map(function (menu) { return menu.slug; }));
        const submenusByParent = settings.submenus || {};

        selectedMenus.forEach(function (menu) {
            const expandable = sidebarMenu.querySelector('.menu-item-expandable[data-submenu="' + menu.slug + '"]');
            const wrapper = expandable ? expandable.closest('.menu-item-wrapper') : null;
            if (wrapper) {
                wrapper.style.display = '';
                sidebarMenu.appendChild(wrapper);
                applySidebarSubMenus(menu.slug, submenusByParent[menu.slug], wrapper);
            }
        });

        sidebarMenu.querySelectorAll('.menu-item-wrapper').forEach(function (wrapper) {
            const expandable = wrapper.querySelector('.menu-item-expandable[data-submenu]');
            if (!expandable) {
                return;
            }
            const slug = expandable.getAttribute('data-submenu');
            if (slug && !selectedSlugs.has(slug)) {
                wrapper.style.display = 'none';
            }
        });
    }

    function applySidebarSubMenus(parentSlug, submenuItems, wrapper) {
        const submenuEl = wrapper ? wrapper.querySelector('#submenu-' + parentSlug) : document.getElementById('submenu-' + parentSlug);
        if (!submenuEl) {
            return;
        }

        const links = Array.from(submenuEl.querySelectorAll('.submenu-item'));
        if (!Array.isArray(submenuItems) || !submenuItems.length) {
            links.forEach(function (link) {
                if (!link.classList.contains('submenu-item-expandable')) {
                    link.style.display = 'none';
                }
            });
            return;
        }

        const linkByHref = new Map();
        links.forEach(function (link) {
            linkByHref.set(normalizeMenuPath(link.getAttribute('href')), link);
        });

        submenuItems.forEach(function (item) {
            const hrefKey = normalizeMenuPath(item.href);
            const link = linkByHref.get(hrefKey);
            if (link) {
                link.setAttribute('data-submenu-slug', item.slug);
            }
        });

        links.forEach(function (link) {
            if (link.classList.contains('submenu-item-expandable')) {
                return;
            }
            link.style.display = 'none';
        });

        submenuItems.forEach(function (item) {
            const link = submenuEl.querySelector('[data-submenu-slug="' + item.slug + '"]');
            if (!link) {
                return;
            }
            link.style.display = item.selected === false ? 'none' : '';
        });

        const visibleItems = submenuItems
            .filter(function (item) { return item.selected !== false; })
            .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });

        visibleItems.forEach(function (item) {
            const link = submenuEl.querySelector('[data-submenu-slug="' + item.slug + '"]');
            if (link) {
                submenuEl.appendChild(link);
            }
        });
    }

    window.applySidebarMenuSettings = applySidebarMenuSettings;

    fetchSidebarMenuSettings().then(function (settings) {
        if (settings) {
            applySidebarMenuSettings(settings);
        }
    });

    document.querySelectorAll('.nav-icons .icon-btn[title="Messages"], .nav-icons a.icon-btn[title="Messages"]').forEach(function (button) {
        if (button.dataset.chatBound === 'true') return;
        button.dataset.chatBound = 'true';
        button.addEventListener('click', function (event) {
            if (button.tagName.toLowerCase() === 'a') return;
            event.preventDefault();
            window.location.href = '/admin/chat';
        });
    });

    document.querySelectorAll('.nav-icons .icon-btn[title="Calendar"], .nav-icons a.icon-btn[title="Calendar"]').forEach(function (button) {
        if (button.dataset.calendarBound === 'true') return;
        button.dataset.calendarBound = 'true';
        button.addEventListener('click', function (event) {
            if (button.tagName.toLowerCase() === 'a') return;
            event.preventDefault();
            window.location.href = '/admin/calendar/events';
        });
    });

    initCurrentSessionModal();
    initQuickLinksModal();
});

function initQuickLinksModal() {
    let modal = document.getElementById('quickLinksModal');
    let modalPromise = null;

    function bindModalEvents(targetModal) {
        const overlay = targetModal.querySelector('#modalOverlay');
        const closeBtn = targetModal.querySelector('#modalCloseBtn');

        if (overlay && overlay.dataset.quickLinksBound !== 'true') {
            overlay.dataset.quickLinksBound = 'true';
            overlay.addEventListener('click', closeQuickLinksModal);
        }

        if (closeBtn && closeBtn.dataset.quickLinksBound !== 'true') {
            closeBtn.dataset.quickLinksBound = 'true';
            closeBtn.addEventListener('click', closeQuickLinksModal);
        }
    }

    function ensureModalOnBody() {
        if (!modal) {
            return null;
        }
        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('quick-links-modal-content');
        }
        bindModalEvents(modal);
        return modal;
    }

    function loadQuickLinksModal() {
        if (modal) {
            return Promise.resolve(ensureModalOnBody());
        }
        if (modalPromise) {
            return modalPromise;
        }

        modalPromise = fetch('/partials/quick-links-modal', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load quick links modal');
                }
                return response.text();
            })
            .then(function (html) {
                if (!document.getElementById('quickLinksModal')) {
                    document.body.insertAdjacentHTML('beforeend', html.trim());
                }
                modal = document.getElementById('quickLinksModal');
                return ensureModalOnBody();
            })
            .catch(function (error) {
                console.warn(error);
                return null;
            });

        return modalPromise;
    }

    function openQuickLinksModal() {
        loadQuickLinksModal().then(function (targetModal) {
            if (!targetModal) {
                return;
            }
            targetModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeQuickLinksModal() {
        if (!modal) {
            return;
        }
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    ensureModalOnBody();

    function bindTrigger(element) {
        if (!element || element.dataset.quickLinksBound === 'true') {
            return;
        }
        element.dataset.quickLinksBound = 'true';
        element.addEventListener('click', function (event) {
            event.preventDefault();
            openQuickLinksModal();
        });
        if (element.tabIndex >= 0 || element.getAttribute('role') === 'button') {
            element.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openQuickLinksModal();
                }
            });
        }
    }

    bindTrigger(document.getElementById('quickLinksBtn'));
    bindTrigger(document.getElementById('topQuickLinksBtn'));
    bindTrigger(document.getElementById('sidebarQuickLinksTitle'));

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeQuickLinksModal();
        }
    });

    window.openQuickLinksModal = openQuickLinksModal;
    window.closeQuickLinksModal = closeQuickLinksModal;
}

function initCurrentSessionModal() {
    let modal = document.getElementById('currentSessionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'quick-links-modal';
        modal.id = 'currentSessionModal';
        document.body.appendChild(modal);
    } else if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    modal.innerHTML = ''
        + '<div class="modal-overlay" id="currentSessionModalOverlay"></div>'
        + '<div class="modal-content session-picker-modal" role="dialog" aria-modal="true" aria-labelledby="currentSessionModalTitle">'
        + '<div class="modal-header">'
        + '<h2 class="modal-title" id="currentSessionModalTitle">Current Session</h2>'
        + '<button type="button" class="modal-close-btn" id="closeCurrentSessionModal" aria-label="Close">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
        + '<line x1="18" y1="6" x2="6" y2="18"></line>'
        + '<line x1="6" y1="6" x2="18" y2="18"></line>'
        + '</svg>'
        + '</button>'
        + '</div>'
        + '<form id="currentSessionForm">'
        + '<div class="modal-body session-picker-body">'
        + '<div class="session-picker-row">'
        + '<label for="currentSessionSelect">Session</label>'
        + '<select id="currentSessionSelect" name="sessionId" class="form-select" required></select>'
        + '<button type="submit" class="session-picker-save-btn" id="saveCurrentSessionBtn">Save</button>'
        + '</div>'
        + '</div>'
        + '</form>'
        + '</div>';

    const form = document.getElementById('currentSessionForm');
    const select = document.getElementById('currentSessionSelect');
    const saveBtn = document.getElementById('saveCurrentSessionBtn');
    const closeBtn = document.getElementById('closeCurrentSessionModal');
    const overlay = document.getElementById('currentSessionModalOverlay');

    if (!form || !select) {
        return;
    }

    function updateSessionLabels(sessionName) {
        if (!sessionName) return;
        document.querySelectorAll('.session-value, .sidebar-session-value').forEach(function (el) {
            el.textContent = sessionName;
        });
    }

    async function loadCurrentSession() {
        const response = await fetch('/api/sessions/current');
        if (!response.ok) {
            throw new Error('Failed to load current session');
        }
        const payload = await response.json();
        updateSessionLabels(payload.sessionName);
        return payload;
    }

    async function loadSessions() {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
            throw new Error('Failed to load sessions');
        }
        const sessions = await response.json();
        const current = await loadCurrentSession().catch(function () { return null; });
        select.innerHTML = sessions.map(function (session) {
            const selected = current && String(current.id) === String(session.id) ? ' selected' : '';
            return '<option value="' + session.id + '"' + selected + '>' + session.sessionName + '</option>';
        }).join('');
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        loadSessions().catch(function (error) {
            window.alert(error.message || 'Unable to load sessions.');
        });
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async function saveSession(event) {
        event.preventDefault();
        const sessionId = select.value;
        if (!sessionId) {
            window.alert('Please select a session.');
            return;
        }
        if (saveBtn) saveBtn.disabled = true;
        try {
            const response = await fetch('/api/sessions/current', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionId })
            });
            const payload = await response.json().catch(function () { return {}; });
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Failed to save session');
            }
            updateSessionLabels(payload.data && payload.data.sessionName ? payload.data.sessionName : select.options[select.selectedIndex].text);
            closeModal();
        } catch (error) {
            window.alert(error.message || 'Failed to save session.');
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    document.querySelectorAll('.sidebar-session-text, .sidebar-session-edit-btn').forEach(function (trigger) {
        if (trigger.dataset.sessionModalBound === 'true') return;
        trigger.dataset.sessionModalBound = 'true';
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openModal();
        });
        if (trigger.classList.contains('sidebar-session-text')) {
            trigger.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openModal();
                }
            });
        }
    });

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    form.addEventListener('submit', saveSession);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    loadCurrentSession().catch(function () {
        // Branding may still populate the label.
    });
}
