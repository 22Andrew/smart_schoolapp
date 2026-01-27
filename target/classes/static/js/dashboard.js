// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
    // Chart.js default configuration
    Chart.defaults.font.family = 'Poppins, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#718096';

    // Fees Collection Bar Chart
    const feesCtx = document.getElementById('feesChart');
    if (feesCtx) {
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
    if (studentsPresentCtx) {
        new Chart(studentsPresentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Donation', 'Fees', 'Miscellaneous'],
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
    if (expenseCtx) {
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
    if (feesYearCtx) {
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
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add animation to stat cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s, transform 0.5s';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
});
