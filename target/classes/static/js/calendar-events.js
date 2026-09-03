document.addEventListener('DOMContentLoaded', function () {
    const monthView = document.getElementById('monthView');
    const weekView = document.getElementById('weekView');
    const dayView = document.getElementById('dayView');
    const monthDaysGrid = document.getElementById('monthDaysGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    const viewTabs = document.querySelectorAll('.cal-view-tab');
    const todoList = document.getElementById('todoList');
    const todoPagination = document.getElementById('todoPagination');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const taskModal = document.getElementById('taskModal');
    const taskModalForm = document.getElementById('taskModalForm');
    const taskModalTitle = document.getElementById('taskModalTitle');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDateInput = document.getElementById('taskDateInput');
    const closeTaskModalBtn = document.getElementById('closeTaskModal');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    let currentDate = new Date();
    let currentView = 'month';
    let events = [];
    let todoPage = 1;
    let todoTotalPages = 1;
    let editingTodoId = null;
    const todoPageSize = 10;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function formatUsDate(date) {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const y = date.getFullYear();
        return m + '/' + d + '/' + y;
    }

    function formatMonthYear(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[date.getMonth()] + ' ' + date.getFullYear();
    }

    function toIsoDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    function getMonthRange(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const gridStart = new Date(start);
        const day = gridStart.getDay();
        const offset = day === 0 ? 6 : day - 1;
        gridStart.setDate(gridStart.getDate() - offset);
        const gridEnd = new Date(end);
        const endDay = gridEnd.getDay();
        const endOffset = endDay === 0 ? 0 : 7 - endDay;
        gridEnd.setDate(gridEnd.getDate() + endOffset);
        return { start, end, gridStart, gridEnd };
    }

    function eventAppliesToDate(event, isoDate) {
        return isoDate >= event.startDate && isoDate <= event.endDate;
    }

    function renderEventLabel(event) {
        if (event.style === 'banner') {
            return escapeHtml(event.title);
        }
        const prefix = event.timeLabel ? escapeHtml(event.timeLabel) + ' ' : '';
        return prefix + escapeHtml(event.title);
    }

    async function loadEvents() {
        const range = getMonthRange(currentDate);
        const params = new URLSearchParams();
        params.set('start', toIsoDate(range.gridStart));
        params.set('end', toIsoDate(range.gridEnd));
        const response = await fetch('/api/calendar/events?' + params.toString());
        if (!response.ok) {
            throw new Error('Failed to load calendar events');
        }
        events = await response.json();
        renderMonthView();
    }

    function renderMonthView() {
        if (!monthDaysGrid) return;
        const range = getMonthRange(currentDate);
        const today = new Date();
        monthDaysGrid.innerHTML = '';

        const cursor = new Date(range.gridStart);
        while (cursor <= range.gridEnd) {
            const iso = toIsoDate(cursor);
            const inMonth = cursor.getMonth() === currentDate.getMonth();
            const dayEvents = events.filter(function (event) {
                return eventAppliesToDate(event, iso);
            });

            const cell = document.createElement('div');
            cell.className = 'cal-day-cell' + (inMonth ? '' : ' other-month');
            if (isSameDay(cursor, today)) {
                cell.classList.add('today');
            }

            let eventsHtml = dayEvents.map(function (event) {
                return '<div class="cal-event ' + escapeHtml(event.style || 'timed') + '">'
                    + renderEventLabel(event) + '</div>';
            }).join('');

            cell.innerHTML = ''
                + '<div class="cal-day-number">' + cursor.getDate() + '</div>'
                + '<div class="cal-day-events">' + eventsHtml + '</div>';
            monthDaysGrid.appendChild(cell);
            cursor.setDate(cursor.getDate() + 1);
        }

        if (calendarTitle) {
            calendarTitle.textContent = formatMonthYear(currentDate);
        }
    }

    function switchView(view) {
        currentView = view;
        viewTabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        if (monthView) monthView.hidden = view !== 'month';
        if (weekView) weekView.hidden = view !== 'week';
        if (dayView) dayView.hidden = view !== 'day';
        if (view === 'month') {
            loadEvents().catch(function (error) { showError(error.message); });
        }
    }

    function renderTodos(items) {
        if (!todoList) return;
        if (!items.length) {
            todoList.innerHTML = '<div class="cal-todo-empty">No to-do items found.</div>';
            return;
        }
        todoList.innerHTML = items.map(function (item) {
            return ''
                + '<div class="cal-todo-item' + (item.completed ? ' completed' : '') + '" data-id="' + item.id + '">'
                + '<input type="checkbox"' + (item.completed ? ' checked' : '') + ' aria-label="Complete task">'
                + '<div class="cal-todo-body">'
                + '<p class="cal-todo-title">' + escapeHtml(item.title) + '</p>'
                + '<p class="cal-todo-date">' + escapeHtml(item.dueDate) + '</p>'
                + '</div>'
                + '<div class="cal-todo-actions">'
                + '<button type="button" class="cal-todo-action edit" title="Edit">&#9998;</button>'
                + '<button type="button" class="cal-todo-action delete" title="Delete">&times;</button>'
                + '</div></div>';
        }).join('');

        todoList.querySelectorAll('.cal-todo-item input[type="checkbox"]').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                const row = checkbox.closest('.cal-todo-item');
                const id = row.getAttribute('data-id');
                toggleTodo(id, checkbox.checked).catch(function (error) {
                    checkbox.checked = !checkbox.checked;
                    showError(error.message);
                });
            });
        });

        todoList.querySelectorAll('.cal-todo-action.edit').forEach(function (button) {
            button.addEventListener('click', function () {
                const row = button.closest('.cal-todo-item');
                openTaskModal(row.getAttribute('data-id'));
            });
        });

        todoList.querySelectorAll('.cal-todo-action.delete').forEach(function (button) {
            button.addEventListener('click', function () {
                const row = button.closest('.cal-todo-item');
                deleteTodo(row.getAttribute('data-id'));
            });
        });
    }

    function renderTodoPagination(page, totalPages) {
        if (!todoPagination) return;
        if (totalPages <= 1) {
            todoPagination.innerHTML = '';
            return;
        }
        let html = '';
        for (let i = 1; i <= Math.min(totalPages, 3); i += 1) {
            html += '<button type="button" class="cal-page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button type="button" class="cal-page-btn" data-nav="next"' + (page >= totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
        html += '<button type="button" class="cal-page-btn" data-nav="last"' + (page >= totalPages ? ' disabled' : '') + '>&raquo;</button>';
        todoPagination.innerHTML = html;

        todoPagination.querySelectorAll('.cal-page-btn[data-page]').forEach(function (button) {
            button.addEventListener('click', function () {
                todoPage = parseInt(button.getAttribute('data-page'), 10);
                loadTodos();
            });
        });
        todoPagination.querySelector('[data-nav="next"]')?.addEventListener('click', function () {
            if (todoPage < totalPages) {
                todoPage += 1;
                loadTodos();
            }
        });
        todoPagination.querySelector('[data-nav="last"]')?.addEventListener('click', function () {
            todoPage = totalPages;
            loadTodos();
        });
    }

    async function loadTodos() {
        const response = await fetch('/api/calendar/todos?page=' + todoPage + '&size=' + todoPageSize);
        if (!response.ok) {
            throw new Error('Failed to load to-do list');
        }
        const payload = await response.json();
        renderTodos(payload.items || []);
        todoTotalPages = payload.totalPages || 1;
        renderTodoPagination(payload.page || 1, todoTotalPages);
    }

    async function refreshCalendarData() {
        await Promise.all([loadTodos(), loadEvents()]);
    }

    function openTaskModal(todoId) {
        editingTodoId = todoId || null;
        if (taskModalTitle) {
            taskModalTitle.textContent = editingTodoId ? 'Edit Task' : 'Add Task';
        }

        if (editingTodoId) {
            const row = Array.from(todoList.querySelectorAll('.cal-todo-item')).find(function (item) {
                return item.getAttribute('data-id') === String(editingTodoId);
            });
            taskTitleInput.value = row?.querySelector('.cal-todo-title')?.textContent || '';
            taskDateInput.value = row?.querySelector('.cal-todo-date')?.textContent || '';
        } else {
            taskTitleInput.value = '';
            taskDateInput.value = formatUsDate(new Date());
        }

        if (taskModal) {
            taskModal.hidden = false;
        }
        taskTitleInput?.focus();
    }

    function closeTaskModal() {
        editingTodoId = null;
        taskModalForm?.reset();
        if (taskModal) {
            taskModal.hidden = true;
        }
    }

    async function saveTask(event) {
        event.preventDefault();
        const title = taskTitleInput.value.trim();
        const dueDate = taskDateInput.value.trim();
        if (!title || !dueDate) {
            showError('Task title and date are required.');
            return;
        }

        if (saveTaskBtn) saveTaskBtn.disabled = true;

        try {
            const payload = { title: title, dueDate: dueDate };
            const url = editingTodoId
                ? '/api/calendar/todos/' + editingTodoId
                : '/api/calendar/todos';
            const response = await fetch(url, {
                method: editingTodoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save task');
            }

            if (!editingTodoId) {
                todoPage = 1;
            }
            closeTaskModal();
            await refreshCalendarData();
        } catch (error) {
            showError(error.message);
        } finally {
            if (saveTaskBtn) saveTaskBtn.disabled = false;
        }
    }

    async function toggleTodo(id, completed) {
        const response = await fetch('/api/calendar/todos/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || 'Failed to update to-do');
        }
        await refreshCalendarData();
    }

    async function deleteTodo(id) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete To-Do?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#e53e3e'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/calendar/todos/' + id, { method: 'DELETE' });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || 'Failed to delete to-do');
        }
        await refreshCalendarData();
    }

    prevBtn?.addEventListener('click', function () {
        if (currentView === 'month') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            loadEvents().catch(function (error) { showError(error.message); });
        }
    });

    nextBtn?.addEventListener('click', function () {
        if (currentView === 'month') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            loadEvents().catch(function (error) { showError(error.message); });
        }
    });

    todayBtn?.addEventListener('click', function () {
        currentDate = new Date();
        if (currentView === 'month') {
            loadEvents().catch(function (error) { showError(error.message); });
        }
    });

    viewTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            switchView(tab.dataset.view || 'month');
        });
    });

    addTodoBtn?.addEventListener('click', function () {
        openTaskModal();
    });

    closeTaskModalBtn?.addEventListener('click', closeTaskModal);
    taskModal?.addEventListener('click', function (event) {
        if (event.target === taskModal) {
            closeTaskModal();
        }
    });
    taskModalForm?.addEventListener('submit', saveTask);

    loadEvents().catch(function (error) { showError(error.message); });
    loadTodos().catch(function (error) { showError(error.message); });
});
