document.addEventListener('DOMContentLoaded', function () {
    const page = document.querySelector('[data-cms]');
    if (!page || !window.FrontCms) return;
    const type = page.dataset.cms;
    if (type === 'gallery') initContent('gallery');
    if (type === 'news') initContent('news');
    if (type === 'pages') initContent('pages');
    if (type === 'media') initMedia();
    if (type === 'menus') initMenus();
    if (type === 'banner') initBanner();

    function initContent(kind) {
        const cms = window.FrontCms;
        const state = cms.tableState();
        const modal = document.getElementById('cmsModal');
        const form = document.getElementById('cmsForm');
        const config = {
            gallery: { url: '/api/front/galleries', headers: ['Title'], file: 'front-cms-gallery', sort: 'title' },
            news: { url: '/api/front/news', headers: ['Title', 'Date'], file: 'front-cms-news', sort: 'newsDate' },
            pages: { url: '/api/front/pages', headers: ['Title', 'URL', 'Page Type'], file: 'front-cms-pages', sort: 'title' }
        }[kind];
        state.sortKey = config.sort;
        let removeImage = false;
        let extraImages = [];

        function filtered() {
            const keyword = (document.getElementById('searchInput').value || '').toLowerCase();
            const rows = state.rows.filter(function (row) {
                return [row.title, row.url, row.pageType, row.newsDate, row.description]
                    .some(function (value) { return String(value || '').toLowerCase().includes(keyword); });
            });
            const dir = state.sortDir === 'desc' ? -1 : 1;
            return rows.slice().sort(function (a, b) {
                const left = String(a[state.sortKey] || '').toLowerCase();
                const right = String(b[state.sortKey] || '').toLowerCase();
                if (left < right) return -1 * dir;
                if (left > right) return 1 * dir;
                return 0;
            });
        }

        function renderRow(row) {
            let cells = '<td' + (cms.columnVisible(0) ? '' : ' style="display:none"') + '><span class="cms-title-tip">' + cms.escapeHtml(row.title) + '</span></td>';
            if (kind === 'news') {
                cells += '<td' + (cms.columnVisible(1) ? '' : ' style="display:none"') + '>' + cms.escapeHtml(cms.formatDate(row.newsDate)) + '</td>';
            }
            if (kind === 'pages') {
                cells += '<td' + (cms.columnVisible(1) ? '' : ' style="display:none"') + '>' + cms.escapeHtml(row.url) + '</td>';
                cells += '<td' + (cms.columnVisible(2) ? '' : ' style="display:none"') + '>' + cms.escapeHtml(row.pageType) + '</td>';
            }
            const actionIndex = kind === 'gallery' ? 1 : (kind === 'news' ? 2 : 3);
            const deleteBtn = (kind === 'pages' && row.systemPage) ? ''
                : '<button type="button" class="btn-action" data-delete="' + row.id + '" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
            cells += '<td' + (cms.columnVisible(actionIndex) ? '' : ' style="display:none"') + '><div class="list-actions">'
                + '<button type="button" class="btn-action" data-edit="' + row.id + '" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>'
                + deleteBtn + '</div></td>';
            return '<tr data-id="' + row.id + '">' + cells + '</tr>';
        }

        function render() {
            cms.paginate(state, filtered(), renderRow, kind === 'gallery' ? 2 : 4);
        }

        async function load() {
            state.rows = await fetch(config.url).then(function (r) { return r.json(); }).catch(function () { return []; });
            render();
        }

        function openModal(row) {
            form.reset();
            removeImage = false;
            extraImages = row && row.galleryImages ? row.galleryImages.slice() : [];
            document.getElementById('cmsId').value = row && row.id ? row.id : '';
            document.getElementById('cmsTitle').value = row ? row.title || '' : '';
            if (document.getElementById('cmsDate')) document.getElementById('cmsDate').value = row && row.newsDate ? String(row.newsDate).slice(0, 10) : '';
            if (document.getElementById('cmsPageType')) {
                document.getElementById('cmsPageType').value = row && row.pageType ? row.pageType : 'STANDARD';
                document.getElementById('cmsPageType').disabled = Boolean(row && row.systemPage);
            }
            document.getElementById('cmsDescription').value = row ? row.description || '' : '';
            document.getElementById('cmsSidebarYes').checked = !row || row.showSidebar !== false;
            document.getElementById('cmsSidebarNo').checked = Boolean(row && row.showSidebar === false);
            document.getElementById('cmsMetaTitle').value = row ? row.metaTitle || '' : '';
            document.getElementById('cmsMetaKeyword').value = row ? row.metaKeyword || '' : '';
            document.getElementById('cmsMetaDescription').value = row ? row.metaDescription || '' : '';
            document.getElementById('cmsSeoFields').classList.remove('open');
            document.getElementById('cmsSeoPlus').textContent = '+';
            document.getElementById('cmsModalTitle').textContent = row && row.id ? 'Edit' : 'Add';
            cms.setPreview('cms', row && row.imageUrl ? row.imageUrl : '', row && row.imageUrl ? row.imageUrl.split('/').pop() : '');
            renderGalleryThumbs();
            modal.classList.add('active');
        }

        function renderGalleryThumbs() {
            const wrap = document.getElementById('cmsGalleryThumbs');
            if (!wrap) return;
            wrap.innerHTML = extraImages.map(function (url) { return '<img src="' + cms.escapeHtml(url) + '" alt="">'; }).join('');
        }

        document.getElementById('addCmsBtn').addEventListener('click', function () { openModal(null); });
        document.getElementById('cmsModalClose').addEventListener('click', function () { modal.classList.remove('active'); });
        document.getElementById('cmsModalOverlay').addEventListener('click', function () { modal.classList.remove('active'); });
        cms.bindSeo('cms');
        cms.bindMediaInsert('cms');
        const imageInput = document.getElementById('cmsImageInput');
        if (imageInput) {
            imageInput.addEventListener('change', function () {
                const file = imageInput.files && imageInput.files[0];
                removeImage = false;
                cms.setPreview('cms', file ? URL.createObjectURL(file) : '', file ? file.name : '');
            });
        }
        const deleteBtn = document.getElementById('cmsDeleteImageBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                if (imageInput) imageInput.value = '';
                removeImage = true;
                cms.setPreview('cms', '', '');
            });
        }
        const galleryInput = document.getElementById('cmsGalleryInput');
        if (galleryInput) {
            document.getElementById('cmsGalleryBtn').addEventListener('click', function () { galleryInput.click(); });
        }
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = document.getElementById('cmsId').value;
            const payload = {
                title: document.getElementById('cmsTitle').value.trim(),
                description: document.getElementById('cmsDescription').value.trim(),
                showSidebar: document.getElementById('cmsSidebarYes').checked,
                metaTitle: document.getElementById('cmsMetaTitle').value.trim(),
                metaKeyword: document.getElementById('cmsMetaKeyword').value.trim(),
                metaDescription: document.getElementById('cmsMetaDescription').value.trim(),
                removeImage: removeImage,
                galleryImages: extraImages.join(',')
            };
            if (kind === 'news') payload.newsDate = document.getElementById('cmsDate').value;
            if (kind === 'pages') payload.pageType = document.getElementById('cmsPageType').value;
            try {
                const result = await cms.api(id ? config.url + '/' + id : config.url, {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const savedId = (result.data && result.data.id) || id;
                if (savedId && imageInput && imageInput.files && imageInput.files[0]) {
                    const fd = new FormData();
                    fd.append('file', imageInput.files[0]);
                    if (kind === 'gallery') fd.append('featured', 'true');
                    await cms.api(config.url + '/' + savedId + '/image', { method: 'POST', body: fd });
                }
                if (savedId && galleryInput && galleryInput.files) {
                    for (let i = 0; i < galleryInput.files.length; i++) {
                        const fd = new FormData();
                        fd.append('file', galleryInput.files[i]);
                        fd.append('featured', 'false');
                        await cms.api(config.url + '/' + savedId + '/image', { method: 'POST', body: fd });
                    }
                }
                modal.classList.remove('active');
                await load();
                Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1400, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        document.getElementById('cmsTableBody').addEventListener('click', async function (e) {
            const editBtn = e.target.closest('[data-edit]');
            const deleteBtnEl = e.target.closest('[data-delete]');
            if (editBtn) {
                const row = state.rows.find(function (item) { return String(item.id) === String(editBtn.dataset.edit); });
                if (row) openModal(row);
                return;
            }
            if (!deleteBtnEl) return;
            if (!(await cms.confirmDelete('This record will be removed.'))) return;
            try {
                const result = await cms.api(config.url + '/' + deleteBtnEl.dataset.delete, { method: 'DELETE' });
                await load();
                Swal.fire({ icon: 'success', title: 'Deleted', text: result.message, timer: 1200, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        cms.bindToolbar(state, render, function () {
            return filtered().map(function (row) {
                if (kind === 'news') return [row.title, cms.formatDate(row.newsDate)];
                if (kind === 'pages') return [row.title, row.url, row.pageType];
                return [row.title];
            });
        }, config.headers, config.file);
        load();
    }

    function initMedia() {
        const cms = window.FrontCms;
        const grid = document.getElementById('mediaGrid');
        const searchInput = document.getElementById('searchInput');
        const typeSelect = document.getElementById('mediaTypeSelect');
        let rows = [];

        function render() {
            const keyword = (searchInput.value || '').toLowerCase();
            const type = typeSelect.value;
            const data = rows.filter(function (row) {
                const name = String(row.fileName || '').toLowerCase();
                return name.includes(keyword) && (!type || row.fileType === type);
            });
            grid.innerHTML = data.length ? data.map(function (row) {
                const youtubeId = youtubeIdFrom(row.youtubeUrl || row.fileUrl);
                const isImage = row.fileType === 'image';
                const thumb = isImage
                    ? '<img src="' + cms.escapeHtml(row.fileUrl) + '" alt="">'
                    : (youtubeId
                        ? '<img src="https://img.youtube.com/vi/' + youtubeId + '/mqdefault.jpg" alt="">'
                        : '<span>' + cms.escapeHtml((row.fileType || 'file').toUpperCase()) + '</span>');
                const label = cms.escapeHtml(displayName(row));
                return '<div class="media-card" data-id="' + row.id + '">'
                    + '<div class="media-thumb">'
                    + thumb
                    + '<span class="media-type-badge" title="' + cms.escapeHtml(row.fileType || 'file') + '"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></span>'
                    + '<div class="media-overlay">'
                    + '<button type="button" class="media-overlay-btn" data-view="' + row.id + '" title="View"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg></button>'
                    + '<button type="button" class="media-overlay-btn" data-delete="' + row.id + '" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg></button>'
                    + '</div></div>'
                    + '<div class="media-meta">' + label + '</div></div>';
            }).join('') : '<p class="empty-message">No media found</p>';
        }

        async function load() {
            rows = await fetch('/api/front/media').then(function (r) { return r.json(); }).catch(function () { return []; });
            render();
        }

        const fileInput = document.getElementById('mediaFileInput');
        const fileLabel = document.getElementById('mediaFileLabel');
        if (fileInput && fileLabel) {
            fileInput.addEventListener('change', function () {
                fileLabel.textContent = fileInput.files && fileInput.files[0]
                    ? fileInput.files[0].name
                    : 'Drag and drop a file here or click';
            });
        }

        document.getElementById('mediaForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const youtubeUrl = document.getElementById('youtubeUrl').value.trim();
            const fd = new FormData();
            if (fileInput.files && fileInput.files[0]) fd.append('file', fileInput.files[0]);
            fd.append('youtubeUrl', youtubeUrl);
            try {
                const result = await cms.api('/api/front/media', { method: 'POST', body: fd });
                fileInput.value = '';
                if (fileLabel) fileLabel.textContent = 'Drag and drop a file here or click';
                document.getElementById('youtubeUrl').value = '';
                await load();
                Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1200, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        searchInput.addEventListener('input', render);
        typeSelect.addEventListener('change', render);

        function youtubeIdFrom(url) {
            const match = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
            return match ? match[1] : '';
        }

        function displayName(row) {
            const name = String(row.fileName || '');
            if (name.indexOf('http') === 0) return 'youtube.mp4';
            return name;
        }

        function youtubeEmbed(url) {
            const id = youtubeIdFrom(url);
            return id ? 'https://www.youtube.com/embed/' + id : url;
        }

        function openView(row) {
            const modal = document.getElementById('mediaViewModal');
            const body = document.getElementById('mediaViewBody');
            document.getElementById('mediaViewTitle').textContent = row.fileName || 'View';
            if (row.fileType === 'image') {
                body.innerHTML = '<img src="' + cms.escapeHtml(row.fileUrl) + '" alt="">';
            } else if (row.fileType === 'video' || row.youtubeUrl) {
                body.innerHTML = '<iframe width="100%" height="360" src="' + cms.escapeHtml(youtubeEmbed(row.youtubeUrl || row.fileUrl)) + '" allowfullscreen></iframe>';
            } else {
                body.innerHTML = '<a href="' + cms.escapeHtml(row.fileUrl) + '" target="_blank" rel="noopener">' + cms.escapeHtml(row.fileName || 'Open file') + '</a>';
            }
            modal.classList.add('active');
        }

        document.getElementById('mediaViewClose').addEventListener('click', function () {
            document.getElementById('mediaViewModal').classList.remove('active');
        });
        document.getElementById('mediaViewOverlay').addEventListener('click', function () {
            document.getElementById('mediaViewModal').classList.remove('active');
        });

        grid.addEventListener('click', async function (e) {
            const viewBtn = e.target.closest('[data-view]');
            const btn = e.target.closest('[data-delete]');
            if (viewBtn) {
                const row = rows.find(function (item) { return String(item.id) === String(viewBtn.dataset.view); });
                if (row) openView(row);
                return;
            }
            if (!btn) return;
            if (!(await cms.confirmDelete('This media file will be removed.'))) return;
            try {
                await cms.api('/api/front/media/' + btn.dataset.delete, { method: 'DELETE' });
                await load();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        load();
    }

    function initMenus() {
        const cms = window.FrontCms;
        const form = document.getElementById('menuItemForm');
        const tree = document.getElementById('menuTree');
        const switcher = document.getElementById('menuSwitcher');
        const titleEl = document.getElementById('menuItemFormTitle');
        const gridIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
        const pencilIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
        const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        let menus = [];
        let items = [];
        let pages = [];
        let activeMenuId = null;
        let dragNode = null;

        function childrenOf(parentId) {
            return items.filter(function (row) {
                return parentId == null ? row.parentId == null : String(row.parentId) === String(parentId);
            }).sort(function (a, b) {
                return (a.sortOrder || 0) - (b.sortOrder || 0) || a.id - b.id;
            });
        }

        function resetForm() {
            form.reset();
            document.getElementById('menuItemId').value = '';
            document.getElementById('menuItemParentId').value = '';
            document.getElementById('menuItemPage').value = '';
            titleEl.textContent = 'Add Menu Item';
            syncToggles();
        }

        function syncToggles() {
            const external = document.getElementById('menuItemExternal').checked;
            document.getElementById('menuItemUrl').disabled = !external;
            document.getElementById('menuItemPage').disabled = external;
        }

        function fillForm(row) {
            document.getElementById('menuItemId').value = row && row.id ? row.id : '';
            document.getElementById('menuItemParentId').value = row && row.parentId ? row.parentId : '';
            document.getElementById('menuItemTitle').value = row ? row.title || '' : '';
            document.getElementById('menuItemExternal').checked = Boolean(row && row.external);
            document.getElementById('menuItemNewTab').checked = Boolean(row && row.openNewTab);
            document.getElementById('menuItemUrl').value = row ? row.externalUrl || '' : '';
            document.getElementById('menuItemPage').value = row && row.pageId ? row.pageId : '';
            titleEl.textContent = row && row.id ? 'Edit Menu Item' : 'Add Menu Item';
            syncToggles();
        }

        function renderSwitcher() {
            switcher.innerHTML = menus.map(function (menu) {
                const active = String(menu.id) === String(activeMenuId) ? ' active' : '';
                return '<button type="button" class="menu-switch' + active + '" data-menu-id="' + menu.id + '">' + cms.escapeHtml(menu.name) + '</button>';
            }).join('');
        }

        function renderNode(row, isChild) {
            const kids = childrenOf(row.id);
            return '<div class="menu-node" data-id="' + row.id + '">'
                + '<div class="menu-tree-item' + (isChild ? ' is-child' : '') + '" data-id="' + row.id + '" draggable="true">'
                + '<span class="menu-drag-handle" title="Drag to reorder">' + gridIcon + '</span>'
                + '<span class="menu-item-title">' + cms.escapeHtml(row.title) + '</span>'
                + '<span class="menu-item-actions">'
                + '<button type="button" class="menu-icon-btn" data-edit-item="' + row.id + '" title="Edit">' + pencilIcon + '</button>'
                + '<button type="button" class="menu-icon-btn" data-delete-item="' + row.id + '" title="Delete">' + closeIcon + '</button>'
                + '</span></div>'
                + '<div class="menu-tree-children">' + kids.map(function (child) { return renderNode(child, true); }).join('') + '</div>'
                + '</div>';
        }

        function renderTree() {
            const roots = childrenOf(null);
            tree.innerHTML = roots.length ? roots.map(function (row) { return renderNode(row, false); }).join('') : '<p class="menu-tree-empty">No menu items</p>';
        }

        async function loadPages() {
            pages = await fetch('/api/front/pages').then(function (r) { return r.json(); }).catch(function () { return []; });
            document.getElementById('menuItemPage').innerHTML = '<option value="">Select</option>' + pages.map(function (page) {
                return '<option value="' + page.id + '">' + cms.escapeHtml(page.title) + '</option>';
            }).join('');
        }

        async function loadItems() {
            if (!activeMenuId) return;
            items = await fetch('/api/front/menus/' + activeMenuId + '/items').then(function (r) { return r.json(); }).catch(function () { return []; });
            renderTree();
        }

        async function loadMenus() {
            menus = await fetch('/api/front/menus').then(function (r) { return r.json(); }).catch(function () { return []; });
            if (!menus.length) {
                switcher.innerHTML = '';
                tree.innerHTML = '<p class="menu-tree-empty">No menus found</p>';
                return;
            }
            const preferred = menus.find(function (menu) { return String(menu.name).toLowerCase() === 'main menu'; });
            if (!activeMenuId || !menus.some(function (menu) { return String(menu.id) === String(activeMenuId); })) {
                activeMenuId = (preferred || menus[0]).id;
            }
            renderSwitcher();
            await loadItems();
        }

        function collectTree(container, parentId) {
            const payload = [];
            Array.from(container.children).forEach(function (node, index) {
                if (!node.classList || !node.classList.contains('menu-node')) return;
                const id = Number(node.dataset.id);
                payload.push({ id: id, parentId: parentId, sortOrder: index + 1 });
                const kids = node.querySelector(':scope > .menu-tree-children');
                if (kids) payload.push.apply(payload, collectTree(kids, id));
            });
            return payload;
        }

        function clearDropState() {
            tree.querySelectorAll('.drop-before, .drop-after, .drop-child').forEach(function (el) {
                el.classList.remove('drop-before', 'drop-after', 'drop-child');
            });
        }

        function dropMode(itemEl, event) {
            const rect = itemEl.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const x = event.clientX - rect.left;
            if (x > 64 && y > rect.height * 0.22 && y < rect.height * 0.78) return 'child';
            return y < rect.height / 2 ? 'before' : 'after';
        }

        async function persistTree() {
            await cms.api('/api/front/menus/' + activeMenuId + '/items/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: collectTree(tree, null) })
            });
            await loadItems();
        }

        document.getElementById('menuItemExternal').addEventListener('change', syncToggles);
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = document.getElementById('menuItemId').value;
            const payload = {
                menuId: activeMenuId,
                parentId: document.getElementById('menuItemParentId').value || null,
                title: document.getElementById('menuItemTitle').value.trim(),
                external: document.getElementById('menuItemExternal').checked,
                openNewTab: document.getElementById('menuItemNewTab').checked,
                externalUrl: document.getElementById('menuItemUrl').value.trim(),
                pageId: document.getElementById('menuItemPage').value
            };
            try {
                const result = await cms.api(id ? '/api/front/menu-items/' + id : '/api/front/menu-items', {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                resetForm();
                await loadItems();
                Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1200, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        switcher.addEventListener('click', async function (e) {
            const btn = e.target.closest('[data-menu-id]');
            if (!btn) return;
            activeMenuId = btn.dataset.menuId;
            resetForm();
            renderSwitcher();
            await loadItems();
        });
        tree.addEventListener('click', async function (e) {
            const editBtn = e.target.closest('[data-edit-item]');
            const delBtn = e.target.closest('[data-delete-item]');
            if (editBtn) {
                const row = items.find(function (item) { return String(item.id) === String(editBtn.dataset.editItem); });
                if (row) fillForm(row);
                return;
            }
            if (!delBtn) return;
            if (!(await cms.confirmDelete('This menu item will be removed.'))) return;
            await cms.api('/api/front/menu-items/' + delBtn.dataset.deleteItem, { method: 'DELETE' });
            resetForm();
            await loadItems();
        });
        tree.addEventListener('dragstart', function (e) {
            if (e.target.closest('button')) {
                e.preventDefault();
                return;
            }
            const item = e.target.closest('.menu-tree-item');
            if (!item) return;
            dragNode = item.closest('.menu-node');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragNode.dataset.id);
            setTimeout(function () { if (dragNode) dragNode.classList.add('dragging'); }, 0);
        });
        tree.addEventListener('dragend', function () {
            if (dragNode) dragNode.classList.remove('dragging');
            dragNode = null;
            clearDropState();
        });
        tree.addEventListener('dragover', function (e) {
            e.preventDefault();
            clearDropState();
            const overItem = e.target.closest('.menu-tree-item');
            if (!dragNode || !overItem) return;
            const overNode = overItem.closest('.menu-node');
            if (!overNode || overNode === dragNode || dragNode.contains(overNode)) return;
            overItem.classList.add('drop-' + dropMode(overItem, e));
        });
        tree.addEventListener('drop', async function (e) {
            e.preventDefault();
            const overItem = e.target.closest('.menu-tree-item');
            const mode = overItem ? dropMode(overItem, e) : 'after';
            clearDropState();
            if (!dragNode || !overItem) return;
            const overNode = overItem.closest('.menu-node');
            if (!overNode || overNode === dragNode || dragNode.contains(overNode)) return;
            if (mode === 'child') {
                let kids = overNode.querySelector(':scope > .menu-tree-children');
                if (!kids) {
                    kids = document.createElement('div');
                    kids.className = 'menu-tree-children';
                    overNode.appendChild(kids);
                }
                kids.appendChild(dragNode);
            } else if (mode === 'before') {
                overNode.parentNode.insertBefore(dragNode, overNode);
            } else {
                overNode.parentNode.insertBefore(dragNode, overNode.nextSibling);
            }
            dragNode.classList.remove('dragging');
            dragNode = null;
            try {
                await persistTree();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
                await loadItems();
            }
        });
        syncToggles();
        loadPages().then(loadMenus);
    }

    function initBanner() {
        const cms = window.FrontCms;
        const grid = document.getElementById('bannerGrid');
        const picker = document.getElementById('mediaPickerModal');
        const pickerGrid = document.getElementById('pickerGrid');
        const typeBadge = '<span class="media-type-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></span>';
        const deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
        const typeInput = document.getElementById('pickerType');
        const typeWrap = document.getElementById('pickerTypeWrap');
        const typeBtn = document.getElementById('pickerTypeBtn');
        const typeMenu = document.getElementById('pickerTypeMenu');
        const typeLabel = document.getElementById('pickerTypeLabel');
        const typeExts = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'jfif'],
            video: ['mp4', 'webm', 'avi', 'mov', 'mkv'],
            text: ['txt', 'rtf'],
            zip: ['zip', '7z'],
            rar: ['rar'],
            pdf: ['pdf'],
            word: ['doc', 'docx'],
            excel: ['xls', 'xlsx', 'csv']
        };
        let selectedIds = [];
        let media = [];

        function fileExt(name) {
            const value = String(name || '').toLowerCase();
            return value.includes('.') ? value.substring(value.lastIndexOf('.') + 1) : '';
        }

        function matchesType(row, type) {
            if (!type) return true;
            if (String(row.fileType || '') === type) return true;
            const ext = fileExt(row.fileName || row.fileUrl);
            if (type === 'other') {
                return !Object.keys(typeExts).some(function (key) { return typeExts[key].indexOf(ext) >= 0; });
            }
            return (typeExts[type] || []).indexOf(ext) >= 0;
        }

        function setPickerType(value, label) {
            typeInput.value = value;
            typeLabel.textContent = label || 'Select';
            typeMenu.querySelectorAll('li').forEach(function (item) {
                item.classList.toggle('active', item.getAttribute('data-value') === value);
            });
            closeTypeMenu();
            renderPicker();
        }

        function closeTypeMenu() {
            typeWrap.classList.remove('open');
            typeBtn.setAttribute('aria-expanded', 'false');
            typeMenu.hidden = true;
        }

        function openTypeMenu() {
            typeWrap.classList.add('open');
            typeBtn.setAttribute('aria-expanded', 'true');
            typeMenu.hidden = false;
        }

        function youtubeIdFrom(url) {
            const match = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
            return match ? match[1] : '';
        }

        function thumbHtml(row) {
            const youtubeId = youtubeIdFrom(row.youtubeUrl || row.fileUrl || row.imageUrl);
            if (row.fileType === 'image' || row.imageUrl) {
                return '<img src="' + cms.escapeHtml(row.imageUrl || row.fileUrl) + '" alt="">';
            }
            if (youtubeId) return '<img src="https://img.youtube.com/vi/' + youtubeId + '/mqdefault.jpg" alt="">';
            return '<span>' + cms.escapeHtml((row.fileType || 'FILE').toUpperCase()) + '</span>';
        }

        async function loadBanners() {
            const rows = await fetch('/api/front/banners').then(function (r) { return r.json(); }).catch(function () { return []; });
            grid.innerHTML = rows.length ? rows.map(function (row) {
                return '<div class="banner-card">'
                    + '<div class="media-thumb">'
                    + (row.imageUrl ? '<img src="' + cms.escapeHtml(row.imageUrl) + '" alt="">' : '<span>FILE</span>')
                    + typeBadge
                    + '<div class="media-overlay"><button type="button" class="media-overlay-btn" data-delete="' + row.id + '" title="Delete">' + deleteIcon + '</button></div>'
                    + '</div><div class="media-meta">' + cms.escapeHtml(row.fileName || '') + '</div></div>';
            }).join('') : '<p class="empty-message">No banner images</p>';
        }

        function closePicker() {
            closeTypeMenu();
            picker.classList.remove('active');
        }

        async function openPicker() {
            media = await fetch('/api/front/media').then(function (r) { return r.json(); }).catch(function () { return []; });
            selectedIds = [];
            document.getElementById('pickerSearch').value = '';
            setPickerType('', 'Select');
            picker.classList.add('active');
        }

        function renderPicker() {
            const keyword = (document.getElementById('pickerSearch').value || '').toLowerCase();
            const type = typeInput.value;
            const data = media.filter(function (row) {
                return String(row.fileName || '').toLowerCase().includes(keyword) && matchesType(row, type);
            });
            pickerGrid.innerHTML = data.length ? data.map(function (row) {
                const selected = selectedIds.indexOf(String(row.id)) >= 0;
                return '<div class="media-card' + (selected ? ' selected' : '') + '" data-select="' + row.id + '">'
                    + '<div class="media-thumb">' + thumbHtml(row) + typeBadge + '</div>'
                    + '<div class="media-meta">' + cms.escapeHtml(row.fileName || '') + '</div></div>';
            }).join('') : '<p class="empty-message">No media found. Upload files in Media Manager first.</p>';
        }

        document.getElementById('addBannerBtn').addEventListener('click', openPicker);
        document.getElementById('pickerClose').addEventListener('click', closePicker);
        document.getElementById('pickerCancelBtn').addEventListener('click', closePicker);
        document.getElementById('pickerOverlay').addEventListener('click', closePicker);
        document.getElementById('pickerSearch').addEventListener('input', renderPicker);
        typeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (typeMenu.hidden) openTypeMenu();
            else closeTypeMenu();
        });
        typeMenu.addEventListener('click', function (e) {
            const item = e.target.closest('li[data-value]');
            if (!item) return;
            setPickerType(item.getAttribute('data-value'), item.textContent.trim());
        });
        document.addEventListener('click', function (e) {
            if (!typeWrap.contains(e.target)) closeTypeMenu();
        });
        pickerGrid.addEventListener('click', function (e) {
            const card = e.target.closest('[data-select]');
            if (!card) return;
            const id = String(card.dataset.select);
            const index = selectedIds.indexOf(id);
            if (index >= 0) selectedIds.splice(index, 1);
            else selectedIds.push(id);
            renderPicker();
        });
        document.getElementById('pickerAddBtn').addEventListener('click', async function () {
            if (!selectedIds.length) {
                Swal.fire({ icon: 'warning', title: 'Select a file', confirmButtonColor: '#8b5cf6' });
                return;
            }
            try {
                const result = await cms.api('/api/front/banners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mediaIds: selectedIds })
                });
                closePicker();
                await loadBanners();
                Swal.fire({ icon: 'success', title: 'Success', text: result.message, timer: 1200, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#8b5cf6' });
            }
        });
        grid.addEventListener('click', async function (e) {
            const btn = e.target.closest('[data-delete]');
            if (!btn) return;
            if (!(await cms.confirmDelete('This banner image will be removed.'))) return;
            await cms.api('/api/front/banners/' + btn.dataset.delete, { method: 'DELETE' });
            await loadBanners();
        });
        loadBanners();
    }
});
