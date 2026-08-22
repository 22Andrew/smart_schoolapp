let menuListSortable = null;
let selectedSortable = null;
let subMenuListSortable = null;
let subMenuSortables = [];
let settingsData = { submenus: {} };
let expandedParentSlugs = new Set();
let activeSubMenuParentSlug = null;

const DRAG_ICON = '<svg class="sidemenu-drag-icon sidemenu-drag-handle-main" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '<circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>'
    + '<circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>'
    + '</svg>';

const PLUS_ICON = '<svg class="sidemenu-expand-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

const MINUS_ICON = '<svg class="sidemenu-expand-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '<line x1="5" y1="12" x2="19" y2="12"></line></svg>';

document.addEventListener('DOMContentLoaded', function () {
    loadSettings();
});

async function loadSettings() {
    try {
        const response = await fetch('/api/sidebar-menu-settings');
        if (!response.ok) throw new Error('Failed to load sidebar menu settings');
        settingsData = await response.json();
        pruneExpandedParents();
        renderMainColumns();
        updateLeftSubMenuColumn();
        initSortable();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load sidebar menu settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function pruneExpandedParents() {
    const selectedSlugs = new Set((settingsData.selectedMenus || []).map(function (item) { return item.slug; }));
    expandedParentSlugs.forEach(function (slug) {
        if (!selectedSlugs.has(slug) || !hasSubMenuItems(slug)) {
            expandedParentSlugs.delete(slug);
        }
    });
    if (activeSubMenuParentSlug && !expandedParentSlugs.has(activeSubMenuParentSlug)) {
        activeSubMenuParentSlug = expandedParentSlugs.size
            ? Array.from(expandedParentSlugs)[expandedParentSlugs.size - 1]
            : null;
    }
}

function hasSubMenuItems(parentSlug) {
    return !!(settingsData.submenus && settingsData.submenus[parentSlug] && settingsData.submenus[parentSlug].length);
}

function renderMainColumns() {
    renderMainList('menuListContainer', settingsData.menuList || [], false);
    renderSelectedMenusList(settingsData.selectedMenus || []);
}

function renderMainList(containerId, items, withExpand) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<li class="sidemenu-list-empty">No menu items</li>';
        return;
    }

    container.innerHTML = items.map(function (item) {
        return buildMainMenuRow(item, withExpand);
    }).join('');
}

function renderSelectedMenusList(items) {
    const container = document.getElementById('selectedMenusContainer');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<li class="sidemenu-list-empty">No menu items</li>';
        return;
    }

    container.innerHTML = items.map(function (item) {
        const hasSubmenus = hasSubMenuItems(item.slug);
        const isExpanded = expandedParentSlugs.has(item.slug);
        const mainRow = buildMainMenuRow(item, true);

        if (!hasSubmenus || !isExpanded) {
            return mainRow;
        }

        return mainRow.replace('</li>', ''
            + '<ul class="sidemenu-inline-sublist" data-parent-slug="' + escapeHtml(item.slug) + '">'
            + renderSubMenuItemsHtml(getSelectedSubMenus(item.slug))
            + '</ul></li>');
    }).join('');
}

function buildMainMenuRow(item, withExpand) {
    const hasSubmenus = withExpand && hasSubMenuItems(item.slug);
    const isExpanded = expandedParentSlugs.has(item.slug);
    let leadingIcon;

    if (hasSubmenus) {
        leadingIcon = '<button type="button" class="sidemenu-expand-btn' + (isExpanded ? ' expanded' : '') + '" '
            + 'data-slug="' + escapeHtml(item.slug) + '" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" '
            + 'title="' + (isExpanded ? 'Collapse sub menus' : 'Expand sub menus') + '">'
            + (isExpanded ? MINUS_ICON : PLUS_ICON)
            + '</button>';
    } else {
        leadingIcon = DRAG_ICON;
    }

    return '<li class="sidemenu-group" data-slug="' + escapeHtml(item.slug) + '">'
        + '<div class="sidemenu-item sidemenu-item-main" data-slug="' + escapeHtml(item.slug) + '">'
        + leadingIcon
        + '<span class="sidemenu-item-label">' + escapeHtml(item.name) + '</span>'
        + '</div></li>';
}

function renderSubMenuItemsHtml(items) {
    if (!items.length) {
        return '<li class="sidemenu-list-empty sidemenu-inline-empty">No selected sub menus</li>';
    }

    return items.map(function (item) {
        return '<li class="sidemenu-subitem" data-slug="' + escapeHtml(item.slug) + '">'
            + DRAG_ICON.replace('sidemenu-drag-handle-main', 'sidemenu-drag-handle-sub')
            + '<span class="sidemenu-subitem-label">' + escapeHtml(item.name) + '</span>'
            + '</li>';
    }).join('');
}

function getSelectedSubMenus(parentSlug) {
    return (settingsData.submenus[parentSlug] || [])
        .filter(function (item) { return item.selected !== false; })
        .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
}

function getAvailableSubMenus(parentSlug) {
    return (settingsData.submenus[parentSlug] || [])
        .filter(function (item) { return item.selected === false; })
        .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
}

function toggleParentExpand(slug) {
    if (!hasSubMenuItems(slug)) {
        return;
    }

    if (expandedParentSlugs.has(slug)) {
        expandedParentSlugs.delete(slug);
        if (activeSubMenuParentSlug === slug) {
            activeSubMenuParentSlug = expandedParentSlugs.size
                ? Array.from(expandedParentSlugs)[expandedParentSlugs.size - 1]
                : null;
        }
    } else {
        expandedParentSlugs.add(slug);
        activeSubMenuParentSlug = slug;
    }

    renderSelectedMenusList(settingsData.selectedMenus || []);
    updateLeftSubMenuColumn();
    initSortable();
}

function updateLeftSubMenuColumn() {
    const leftTitle = document.getElementById('leftColumnTitle');
    const menuListContainer = document.getElementById('menuListContainer');
    const subMenuListContainer = document.getElementById('subMenuListContainer');

    if (activeSubMenuParentSlug && expandedParentSlugs.has(activeSubMenuParentSlug)) {
        if (leftTitle) leftTitle.textContent = 'Sub Menu List';
        if (menuListContainer) menuListContainer.hidden = true;
        if (subMenuListContainer) subMenuListContainer.hidden = false;
        renderSubMenuList('subMenuListContainer', getAvailableSubMenus(activeSubMenuParentSlug));
    } else {
        if (leftTitle) leftTitle.textContent = 'Menu List';
        if (menuListContainer) menuListContainer.hidden = false;
        if (subMenuListContainer) subMenuListContainer.hidden = true;
    }
}

function renderSubMenuList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<li class="sidemenu-list-empty">No menu items</li>';
        return;
    }

    container.innerHTML = items.map(function (item) {
        return '<li class="sidemenu-subitem" data-slug="' + escapeHtml(item.slug) + '">'
            + DRAG_ICON.replace('sidemenu-drag-handle-main', 'sidemenu-drag-handle-sub')
            + '<span class="sidemenu-subitem-label">' + escapeHtml(item.name) + '</span>'
            + '</li>';
    }).join('');
}

function bindExpandHandlers() {
    document.querySelectorAll('.sidemenu-expand-btn').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleParentExpand(button.getAttribute('data-slug'));
        });
    });
}

function initSortable() {
    if (typeof Sortable === 'undefined') {
        return;
    }

    destroySortables();

    const mainOptions = {
        group: 'sidebar-menu',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        draggable: '.sidemenu-group',
        handle: '.sidemenu-item-main',
        filter: '.sidemenu-expand-btn, .sidemenu-inline-sublist, .sidemenu-subitem',
        preventOnFilter: false,
        onEnd: saveSettings
    };

    const menuListOptions = Object.assign({}, mainOptions, {
        handle: '.sidemenu-drag-handle-main'
    });

    menuListSortable = Sortable.create(document.getElementById('menuListContainer'), menuListOptions);
    selectedSortable = Sortable.create(document.getElementById('selectedMenusContainer'), mainOptions);

    if (activeSubMenuParentSlug && expandedParentSlugs.has(activeSubMenuParentSlug)) {
        initAvailableSubMenuSortable();
    }

    document.querySelectorAll('#selectedMenusContainer .sidemenu-inline-sublist').forEach(function (sublist) {
        initInlineSubMenuSortable(sublist);
    });

    bindExpandHandlers();
}

function initAvailableSubMenuSortable() {
    const subMenuListEl = document.getElementById('subMenuListContainer');
    if (!subMenuListEl || subMenuListEl.hidden || !activeSubMenuParentSlug) {
        return;
    }

    subMenuListSortable = Sortable.create(subMenuListEl, {
        group: 'sidebar-submenu-' + activeSubMenuParentSlug,
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        draggable: '.sidemenu-subitem',
        handle: '.sidemenu-drag-handle-sub',
        onEnd: saveSettings
    });
}

function initInlineSubMenuSortable(sublist) {
    const parentSlug = sublist.getAttribute('data-parent-slug');
    if (!parentSlug) {
        return;
    }

    subMenuSortables.push(Sortable.create(sublist, {
        group: 'sidebar-submenu-' + parentSlug,
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        draggable: '.sidemenu-subitem',
        handle: '.sidemenu-drag-handle-sub',
        onEnd: saveSettings
    }));
}

function destroySortables() {
    if (menuListSortable) {
        menuListSortable.destroy();
        menuListSortable = null;
    }
    if (selectedSortable) {
        selectedSortable.destroy();
        selectedSortable = null;
    }
    if (subMenuListSortable) {
        subMenuListSortable.destroy();
        subMenuListSortable = null;
    }
    subMenuSortables.forEach(function (instance) {
        instance.destroy();
    });
    subMenuSortables = [];
}

async function saveSettings() {
    try {
        await persistSettings(
            collectMenuSlugs('menuListContainer'),
            collectMenuSlugs('selectedMenusContainer'),
            collectSubMenuSelections()
        );
    } catch (error) {
        showSaveError(error);
    }
}

async function persistSettings(menuList, selectedMenus, submenus) {
    const response = await fetch('/api/sidebar-menu-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            menuList: menuList,
            selectedMenus: selectedMenus,
            submenus: submenus
        })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);

    if (data.data) {
        settingsData = data.data;
        pruneExpandedParents();
        renderMainColumns();
        updateLeftSubMenuColumn();
        initSortable();
    }

    if (typeof window.applySidebarMenuSettings === 'function') {
        window.applySidebarMenuSettings(settingsData);
    }

    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message || 'Sidebar menu updated successfully',
        confirmButtonColor: '#10b981',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false
    });
}

function showSaveError(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save sidebar menu settings',
        confirmButtonColor: '#ef4444'
    });
    loadSettings();
}

function collectMenuSlugs(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.hidden) return [];
    return Array.from(container.querySelectorAll(':scope > .sidemenu-group'))
        .map(function (item) { return item.getAttribute('data-slug'); })
        .filter(Boolean);
}

function collectSubMenuSelections() {
    const result = {};
    const allParents = Object.keys(settingsData.submenus || {});

    allParents.forEach(function (parentSlug) {
        const inlineList = document.querySelector(
            '#selectedMenusContainer .sidemenu-inline-sublist[data-parent-slug="' + parentSlug + '"]'
        );

        if (inlineList) {
            result[parentSlug] = Array.from(inlineList.querySelectorAll('.sidemenu-subitem'))
                .map(function (item) { return item.getAttribute('data-slug'); })
                .filter(Boolean);
            return;
        }

        result[parentSlug] = (settingsData.submenus[parentSlug] || [])
            .filter(function (item) { return item.selected !== false; })
            .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
            .map(function (item) { return item.slug; });
    });

    return result;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
