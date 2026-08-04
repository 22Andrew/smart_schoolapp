document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.view-tab');
    const listPanel = document.getElementById('listViewPanel');
    const detailsPanel = document.getElementById('detailsViewPanel');
    const classSectionSearchBtn = document.getElementById('classSectionSearchBtn');
    const keywordSearchBtn = document.getElementById('keywordSearchBtn');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            const view = tab.getAttribute('data-view');
            if (view === 'details') {
                listPanel.classList.remove('active');
                detailsPanel.classList.add('active');
            } else {
                detailsPanel.classList.remove('active');
                listPanel.classList.add('active');
            }
        });
    });

    if (classSectionSearchBtn) {
        classSectionSearchBtn.addEventListener('click', function () {
            const classValue = document.getElementById('classSelect').value;
            if (!classValue) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Class Required',
                        text: 'Please select a class to search.',
                        confirmButtonColor: '#8b5cf6'
                    });
                } else {
                    alert('Please select a class to search.');
                }
                return;
            }
            // Search wiring can be added when student API is available
        });
    }

    if (keywordSearchBtn) {
        keywordSearchBtn.addEventListener('click', function () {
            // Keyword search wiring can be added when student API is available
        });
    }
});
