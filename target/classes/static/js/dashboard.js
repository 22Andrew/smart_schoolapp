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

    // Sidebar menu active state
    const menuItems = document.querySelectorAll('.menu-item:not(.menu-item-expandable)');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            menuItems.forEach(mi => mi.classList.remove('active'));
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
            
            // Keep the parent menu expanded
            const parentSubmenu = this.closest('.submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('open');
                const parentMenuId = parentSubmenu.id.replace('submenu-', '');
                const parentMenuItem = document.querySelector(`.menu-item-expandable[data-submenu="${parentMenuId}"]`);
                if (parentMenuItem) {
                    parentMenuItem.classList.add('expanded');
                }
            }
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
        const allSubmenuItems = document.querySelectorAll('.submenu-item');

        // Clear previous submenu highlights so only one item stays active
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

        if (!bestMatch) return;

        bestMatch.classList.add('active');

        const parentSubmenu = bestMatch.closest('.submenu');
        if (parentSubmenu) {
            parentSubmenu.classList.add('open');

            const parentMenuId = parentSubmenu.id.replace('submenu-', '');
            const parentMenuItem = document.querySelector(`.menu-item-expandable[data-submenu="${parentMenuId}"]`);
            if (parentMenuItem) {
                parentMenuItem.classList.add('expanded');
            }
        }
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
