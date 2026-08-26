(function () {
    'use strict';

    (function ensureBehaviourStylesheet() {
        if (document.getElementById('user-profile-behaviour-css')) {
            return;
        }
        var link = document.createElement('link');
        link.id = 'user-profile-behaviour-css';
        link.rel = 'stylesheet';
        link.href = '/css/user-profile-behaviour.css';
        document.head.appendChild(link);
    })();

    var behaviourLoaded = false;
    var behaviourRecords = [];
    var filteredRecords = [];
    var searchTerm = '';
    var pageSize = 50;
    var currentPage = 1;
    var activeIncidentId = null;
    var visibleColumns = {
        title: true,
        point: true,
        date: true,
        description: true,
        assignBy: true,
        action: true
    };

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function sortIconHtml() {
        return ''
            + '<span class="sp-beh-sort-icon" aria-hidden="true">'
            + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>'
            + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>'
            + '</span>';
    }

    function applyFilters() {
        filteredRecords = behaviourRecords.filter(function (row) {
            if (!searchTerm) {
                return true;
            }
            var haystack = [
                row.title,
                row.points,
                row.date,
                row.description,
                row.assignBy
            ].join(' ').toLowerCase();
            return haystack.indexOf(searchTerm) !== -1;
        });
        var maxPage = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
        if (currentPage > maxPage) {
            currentPage = maxPage;
        }
    }

    function pageRecords() {
        var start = (currentPage - 1) * pageSize;
        return filteredRecords.slice(start, start + pageSize);
    }

    function updateBehaviourScore(totalScore) {
        var scoreEl = document.querySelector('.sp-left-row .sp-row-label');
        var rows = document.querySelectorAll('.sp-left-row');
        rows.forEach(function (row) {
            var label = row.querySelector('.sp-row-label');
            if (label && label.textContent.trim() === 'Behaviour Score') {
                var value = row.querySelector('.sp-row-value');
                if (value) {
                    value.textContent = String(totalScore);
                }
            }
        });
    }

    function renderBehaviourTable() {
        var body = document.getElementById('profileBehaviourBody');
        var footer = document.getElementById('profileBehaviourFooter');
        if (!body) {
            return;
        }

        applyFilters();
        var rows = pageRecords();

        if (!filteredRecords.length) {
            body.innerHTML = '<tr class="sp-behaviour-empty"><td colspan="6">No Record Found</td></tr>';
        } else {
            body.innerHTML = rows.map(function (row) {
                var negative = Number(row.points) < 0;
                return ''
                    + '<tr class="' + (negative ? 'sp-behaviour-row-negative' : '') + '" data-incident-id="' + escapeHtml(String(row.id)) + '">'
                    + (visibleColumns.title ? '<td>' + escapeHtml(row.title || '') + '</td>' : '')
                    + (visibleColumns.point
                        ? '<td class="sp-beh-col-point"><span class="sp-behaviour-point ' + (negative ? 'negative' : 'positive') + '">'
                        + escapeHtml(String(row.points)) + '</span></td>' : '')
                    + (visibleColumns.date ? '<td class="sp-beh-col-date">' + escapeHtml(row.date || '') + '</td>' : '')
                    + (visibleColumns.description
                        ? '<td><div class="sp-behaviour-desc">' + escapeHtml(row.description || '') + '</div></td>' : '')
                    + (visibleColumns.assignBy ? '<td>' + escapeHtml(row.assignBy || '') + '</td>' : '')
                    + (visibleColumns.action
                        ? '<td class="sp-beh-col-action">'
                        + '<button type="button" class="sp-behaviour-comment-btn" title="Comment" data-incident-id="' + escapeHtml(String(row.id)) + '">'
                        + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
                        + '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'
                        + '</svg></button></td>' : '')
                    + '</tr>';
            }).join('');
        }

        if (footer) {
            var from = filteredRecords.length ? ((currentPage - 1) * pageSize + 1) : 0;
            var to = Math.min(currentPage * pageSize, filteredRecords.length);
            footer.textContent = 'Showing ' + from + ' to ' + to + ' of ' + filteredRecords.length + ' entries';
        }

        updateHeaderVisibility();
    }

    function updateHeaderVisibility() {
        var table = document.getElementById('profileBehaviourTable');
        if (!table) {
            return;
        }
        var map = [
            ['title', 0],
            ['point', 1],
            ['date', 2],
            ['description', 3],
            ['assignBy', 4],
            ['action', 5]
        ];
        var headers = table.querySelectorAll('thead th');
        map.forEach(function (item) {
            if (headers[item[1]]) {
                headers[item[1]].style.display = visibleColumns[item[0]] ? '' : 'none';
            }
        });
    }

    function behaviourToTsv(rows) {
        var lines = [['Title', 'Point', 'Date', 'Description', 'Assign By'].join('\t')];
        rows.forEach(function (row) {
            lines.push([
                row.title || '',
                row.points,
                row.date || '',
                row.description || '',
                row.assignBy || ''
            ].join('\t'));
        });
        return lines.join('\n');
    }

    function downloadCsv(rows) {
        var text = behaviourToTsv(rows).split('\n').map(function (line) {
            return line.split('\t').map(function (value) {
                return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        var blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'student-behaviour.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function renderCommentList(comments) {
        var list = document.getElementById('profileBehaviourCommentList');
        if (!list) {
            return;
        }
        if (!comments || !comments.length) {
            list.innerHTML = '<div class="sp-behaviour-comment-empty">No comments yet.</div>';
            return;
        }
        list.innerHTML = comments.map(function (item) {
            return ''
                + '<div class="sp-behaviour-comment-item">'
                + escapeHtml(item.comment || '')
                + '<div class="sp-behaviour-comment-item-meta">' + escapeHtml(item.authorName || 'Student') + '</div>'
                + '</div>';
        }).join('');
    }

    function loadComments(incidentId) {
        return fetch('/api/user/user/behaviour/' + encodeURIComponent(String(incidentId)) + '/comments', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            return response.json();
        }).then(function (data) {
            renderCommentList((data && data.comments) || []);
        });
    }

    function openCommentModal(incidentId) {
        activeIncidentId = incidentId;
        var modal = document.getElementById('profileBehaviourCommentModal');
        var input = document.getElementById('profileBehaviourCommentInput');
        if (!modal) {
            return;
        }
        if (input) {
            input.value = '';
        }
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        loadComments(incidentId).catch(function () {
            renderCommentList([]);
        });
        if (input) {
            input.focus();
        }
    }

    function closeCommentModal() {
        activeIncidentId = null;
        var modal = document.getElementById('profileBehaviourCommentModal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    function sendComment() {
        if (!activeIncidentId) {
            return;
        }
        var input = document.getElementById('profileBehaviourCommentInput');
        var text = input ? input.value.trim() : '';
        if (!text) {
            return;
        }
        fetch('/api/user/user/behaviour/' + encodeURIComponent(String(activeIncidentId)) + '/comments', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment: text })
        }).then(function (response) {
            return response.json().then(function (payload) {
                if (!response.ok) {
                    throw new Error((payload && payload.message) || 'Failed to save comment');
                }
                return payload;
            });
        }).then(function () {
            if (input) {
                input.value = '';
            }
            return loadComments(activeIncidentId);
        }).catch(function (error) {
            window.alert(error.message || 'Failed to save comment.');
        });
    }

    function bindControls() {
        var searchInput = document.getElementById('profileBehaviourSearch');
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = '1';
            searchInput.addEventListener('input', function () {
                searchTerm = searchInput.value.trim().toLowerCase();
                currentPage = 1;
                renderBehaviourTable();
            });
        }

        var pageSizeSelect = document.getElementById('profileBehaviourPageSize');
        if (pageSizeSelect && !pageSizeSelect.dataset.bound) {
            pageSizeSelect.dataset.bound = '1';
            pageSizeSelect.addEventListener('change', function () {
                pageSize = Number(pageSizeSelect.value) || 50;
                currentPage = 1;
                renderBehaviourTable();
            });
        }

        var copyBtn = document.getElementById('profileBehCopyBtn');
        if (copyBtn && !copyBtn.dataset.bound) {
            copyBtn.dataset.bound = '1';
            copyBtn.addEventListener('click', function () {
                navigator.clipboard.writeText(behaviourToTsv(filteredRecords)).catch(function () {});
            });
        }

        ['profileBehCsvBtn', 'profileBehExcelBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', function () {
                    downloadCsv(filteredRecords);
                });
            }
        });

        ['profileBehPrintBtn', 'profileBehPdfBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', function () {
                    window.print();
                });
            }
        });

        var columnsBtn = document.getElementById('profileBehColumnsBtn');
        var columnsDropdown = document.getElementById('profileBehColumnsDropdown');
        if (columnsBtn && columnsDropdown && !columnsBtn.dataset.bound) {
            columnsBtn.dataset.bound = '1';
            columnsDropdown.innerHTML = Object.keys(visibleColumns).map(function (key) {
                var label = key === 'assignBy' ? 'Assign By' : key.charAt(0).toUpperCase() + key.slice(1);
                return ''
                    + '<label class="column-toggle-item">'
                    + '<input type="checkbox" class="column-toggle" data-column="' + key + '" checked>'
                    + '<span>' + label + '</span>'
                    + '</label>';
            }).join('');
            columnsBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                columnsDropdown.classList.toggle('active');
            });
            columnsDropdown.addEventListener('change', function (event) {
                var input = event.target.closest('input[data-column]');
                if (!input) {
                    return;
                }
                visibleColumns[input.getAttribute('data-column')] = input.checked;
                renderBehaviourTable();
            });
            document.addEventListener('click', function (event) {
                if (!columnsDropdown.contains(event.target) && event.target !== columnsBtn) {
                    columnsDropdown.classList.remove('active');
                }
            });
        }

        var body = document.getElementById('profileBehaviourBody');
        if (body && !body.dataset.bound) {
            body.dataset.bound = '1';
            body.addEventListener('click', function (event) {
                var btn = event.target.closest('.sp-behaviour-comment-btn');
                if (!btn) {
                    return;
                }
                openCommentModal(btn.getAttribute('data-incident-id'));
            });
        }

        var closeBtn = document.getElementById('profileBehaviourCommentClose');
        var overlay = document.getElementById('profileBehaviourCommentOverlay');
        var sendBtn = document.getElementById('profileBehaviourCommentSend');
        var commentInput = document.getElementById('profileBehaviourCommentInput');
        if (closeBtn && !closeBtn.dataset.bound) {
            closeBtn.dataset.bound = '1';
            closeBtn.addEventListener('click', closeCommentModal);
        }
        if (overlay && !overlay.dataset.bound) {
            overlay.dataset.bound = '1';
            overlay.addEventListener('click', closeCommentModal);
        }
        if (sendBtn && !sendBtn.dataset.bound) {
            sendBtn.dataset.bound = '1';
            sendBtn.addEventListener('click', sendComment);
        }
        if (commentInput && !commentInput.dataset.bound) {
            commentInput.dataset.bound = '1';
            commentInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendComment();
                }
            });
        }
    }

    function loadBehaviour(force) {
        if (behaviourLoaded && !force) {
            return;
        }
        behaviourLoaded = true;

        var body = document.getElementById('profileBehaviourBody');
        if (body) {
            body.innerHTML = '<tr class="sp-behaviour-empty"><td colspan="6">Loading...</td></tr>';
        }

        fetch('/api/user/user/behaviour', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load behaviour records');
                }
                return response.json();
            })
            .then(function (data) {
                behaviourRecords = (data && data.records) || [];
                updateBehaviourScore((data && data.totalScore) || 0);
                bindControls();
                renderBehaviourTable();
            })
            .catch(function () {
                behaviourRecords = [];
                renderBehaviourTable();
            });
    }

    function initBehaviourTabLoader() {
        bindControls();
        var behaviourTab = document.querySelector('.sp-tab[data-profile-tab="behaviour"]');
        if (behaviourTab) {
            behaviourTab.addEventListener('click', function () {
                loadBehaviour(true);
            });
        }
        var behaviourPanel = document.querySelector('.sp-tab-content[data-profile-panel="behaviour"]');
        if (behaviourPanel && behaviourPanel.classList.contains('active')) {
            loadBehaviour();
        }
    }

    document.addEventListener('DOMContentLoaded', initBehaviourTabLoader);
})();
