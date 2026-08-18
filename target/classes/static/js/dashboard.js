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
                                return '$' + value;
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
                                return '$' + value;
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

    function activateSidebarParents(element) {
        document.querySelectorAll('.menu-item-expandable').forEach(function (item) {
            item.classList.remove('active');
        });
        document.querySelectorAll('.submenu-item-expandable').forEach(function (item) {
            item.classList.remove('active');
        });

        var submenu = element.closest('.submenu');
        while (submenu) {
            submenu.classList.add('open');
            var submenuId = submenu.id.replace('submenu-', '');
            var parentExpandable = document.querySelector(
                '.menu-item-expandable[data-submenu="' + submenuId + '"], .submenu-item-expandable[data-submenu="' + submenuId + '"]'
            );
            if (parentExpandable) {
                parentExpandable.classList.add('expanded', 'active');
            }
            var parentGroup = submenu.parentElement;
            submenu = parentGroup ? parentGroup.closest('.submenu') : null;
        }
    }

    // Sidebar menu active state
    const menuItems = document.querySelectorAll('.menu-item:not(.menu-item-expandable)');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            menuItems.forEach(mi => mi.classList.remove('active'));
            document.querySelectorAll('.menu-item-expandable').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Expandable menu items (with submenus)
    const expandableItems = document.querySelectorAll('.menu-item-expandable');
    
    expandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the current state before any changes
            const isCurrentlyExpanded = this.classList.contains('expanded');
            const submenuId = 'submenu-' + this.getAttribute('data-submenu');
            const currentSubmenu = document.getElementById(submenuId);
            
            // Close all other expanded items first
            expandableItems.forEach(otherItem => {
                if (otherItem !== this) {
                    otherItem.classList.remove('expanded');
                    const otherSubmenuId = 'submenu-' + otherItem.getAttribute('data-submenu');
                    const otherSubmenu = document.getElementById(otherSubmenuId);
                    if (otherSubmenu) {
                        otherSubmenu.classList.remove('open');
                    }
                }
            });
            
            // Toggle current item and its submenu
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
    const submenuItems = document.querySelectorAll('.submenu-item:not(.submenu-item-expandable)');
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
    const nestedExpandableItems = document.querySelectorAll('.submenu-item-expandable');
    nestedExpandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle expanded state
            const isExpanded = this.classList.contains('expanded');
            
            // Close all other nested expanded items in the same parent submenu
            const parentSubmenu = this.closest('.submenu');
            if (parentSubmenu) {
                const otherNestedItems = parentSubmenu.querySelectorAll('.submenu-item-expandable');
                otherNestedItems.forEach(otherItem => {
                    if (otherItem !== this) {
                        otherItem.classList.remove('expanded');
                        const otherSubmenuId = 'submenu-' + otherItem.getAttribute('data-submenu');
                        const otherSubSubmenu = document.getElementById(otherSubmenuId);
                        if (otherSubSubmenu) {
                            otherSubSubmenu.classList.remove('open');
                        }
                    }
                });
            }
            
            // Toggle current item
            if (isExpanded) {
                this.classList.remove('expanded');
            } else {
                this.classList.add('expanded');
            }
            
            // Toggle sub-submenu
            const submenuId = 'submenu-' + this.getAttribute('data-submenu');
            const subSubmenu = document.getElementById(submenuId);
            if (subSubmenu) {
                subSubmenu.classList.toggle('open');
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

        const expandableItems = document.querySelectorAll('.menu-item-expandable');
        const allSubmenuItems = document.querySelectorAll('.submenu-item');

        // Reset sidebar state so JS controls expand/active consistently
        expandableItems.forEach(item => item.classList.remove('expanded', 'active'));
        document.querySelectorAll('.submenu').forEach(submenu => submenu.classList.remove('open', 'active'));
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

    // Quick Links Modal Functionality
    const quickLinksBtn = document.getElementById('quickLinksBtn');
    const quickLinksModal = document.getElementById('quickLinksModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Open modal
    function openQuickLinksModal() {
        quickLinksModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close modal
    function closeQuickLinksModal() {
        quickLinksModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event listeners for modal
    if (quickLinksBtn) {
        quickLinksBtn.addEventListener('click', openQuickLinksModal);
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeQuickLinksModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeQuickLinksModal);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quickLinksModal.classList.contains('active')) {
            closeQuickLinksModal();
        }
    });

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
});
