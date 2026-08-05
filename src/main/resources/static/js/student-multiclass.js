document.addEventListener('DOMContentLoaded', function () {
    const criteriaForm = document.getElementById('criteriaForm');
    const classOptions = [
        '', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
    ];
    const sectionOptions = ['', 'A', 'B', 'C', 'D'];

    function buildSelectOptions(options, selectedValue, isClass) {
        return options.map(function (opt, index) {
            if (index === 0) {
                return '<option value="">Select</option>';
            }
            const value = isClass ? String(index) : opt;
            const label = isClass ? opt : opt;
            const selected = String(selectedValue) === value ? ' selected' : '';
            return '<option value="' + value + '"' + selected + '>' + label + '</option>';
        }).join('');
    }

    function createClassRow(classValue, sectionValue) {
        const row = document.createElement('div');
        row.className = 'class-row';
        row.innerHTML =
            '<div class="form-group">' +
                '<label>Class</label>' +
                '<select class="form-select student-class">' +
                    buildSelectOptions(classOptions, classValue || '2', true) +
                '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>Section</label>' +
                '<select class="form-select student-section">' +
                    buildSelectOptions(sectionOptions, sectionValue || 'A', false) +
                '</select>' +
            '</div>' +
            '<div class="form-group remove-group">' +
                '<label>&nbsp;</label>' +
                '<button type="button" class="btn-remove">Remove</button>' +
            '</div>';
        return row;
    }

    if (criteriaForm) {
        criteriaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const classValue = document.getElementById('classSelect').value;
            const sectionValue = document.getElementById('sectionSelect').value;

            if (!classValue || !sectionValue) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Required Fields',
                    text: 'Please select both Class and Section.',
                    confirmButtonColor: '#8b5cf6'
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'Search Complete',
                text: 'Showing students for the selected class and section.',
                timer: 1600,
                showConfirmButton: false
            });
        });
    }

    document.querySelectorAll('.student-card').forEach(function (card) {
        const rowsContainer = card.querySelector('[data-class-rows]');
        const addBtn = card.querySelector('.btn-add-class');
        const updateBtn = card.querySelector('.btn-update');

        if (addBtn && rowsContainer) {
            addBtn.addEventListener('click', function () {
                rowsContainer.appendChild(createClassRow('2', 'A'));
            });
        }

        if (rowsContainer) {
            rowsContainer.addEventListener('click', function (e) {
                const removeBtn = e.target.closest('.btn-remove');
                if (!removeBtn) return;

                const rows = rowsContainer.querySelectorAll('.class-row');
                if (rows.length <= 1) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Cannot Remove',
                        text: 'At least one class/section row is required.',
                        confirmButtonColor: '#8b5cf6'
                    });
                    return;
                }
                removeBtn.closest('.class-row').remove();
            });
        }

        if (updateBtn) {
            updateBtn.addEventListener('click', function () {
                const studentName = card.querySelector('.student-card-name').textContent;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated',
                    text: studentName + ' class details updated.',
                    timer: 1600,
                    showConfirmButton: false
                });
            });
        }
    });
});
