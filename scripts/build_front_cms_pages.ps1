$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "src\main\resources\templates\front-cms-events.html"))) {
    $root = Get-Location
}
$src = Join-Path $root "src\main\resources\templates\front-cms-events.html"
$html = [System.IO.File]::ReadAllText($src)
$start = $html.IndexOf("<main ")
$ql = $html.IndexOf("    <!-- Quick Links Modal -->")
if ($start -lt 0 -or $ql -lt 0) { throw "Could not find splice points in events template" }
$head = $html.Substring(0, $start)
$tail = $html.Substring($ql)

function New-Page($title, $cssJsName, $mainHtml) {
    $out = $head
    $out = $out.Replace("Event List - Smart School", "$title - Smart School")
    $out = $out.Replace("front-cms-events.css", "front-cms.css")
    $out = $out + $mainHtml + "`r`n" + $tail
    $out = $out.Replace("front-cms-events.js", "front-cms-common.js`"></script>`r`n    <script th:src=`"@{/js/front-cms-app.js}")
    $path = Join-Path $root "src\main\resources\templates\$cssJsName.html"
    [System.IO.File]::WriteAllText($path, $out)
    Write-Output $path
}

$toolbar = @'
                <div class="table-controls">
                    <div class="table-search">
                        <input type="text" class="table-search-input" id="searchInput" placeholder="Search">
                    </div>
                    <div class="table-actions">
                        <select class="entries-select" id="entriesSelect">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50" selected>50</option>
                            <option value="100">100</option>
                        </select>
                        <button type="button" class="icon-action-btn" id="copyBtn" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                        <button type="button" class="icon-action-btn" id="excelBtn" title="Excel"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></button>
                        <button type="button" class="icon-action-btn" id="csvBtn" title="CSV"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg></button>
                        <button type="button" class="icon-action-btn" id="pdfBtn" title="PDF"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg></button>
                        <button type="button" class="icon-action-btn" id="printBtn" title="Print"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path></svg></button>
                        <div class="column-visibility-wrap">
                            <button type="button" class="icon-action-btn" id="columnVisibilityBtn" title="Columns"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></button>
                            <div class="column-visibility-dropdown" id="columnVisibilityDropdown">COLUMNS</div>
                        </div>
                    </div>
                </div>
'@

function Get-ContentMain($cms, $title, $columnsHtml, $extraLeft, $extraGallery) {
    $cols = $columnsHtml
    return @"
        <main class="main-content front-cms-page" data-cms="$cms">
            <div class="event-list-panel">
                <div class="list-header">
                    <h2 class="panel-title">$title</h2>
                    <button type="button" class="btn-add" id="addCmsBtn">+ Add</button>
                </div>
$toolbar
                <div class="table-responsive">
                    <table class="data-table" id="cmsTable">
                        <thead><tr>$cols</tr></thead>
                        <tbody id="cmsTableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <div class="showing-info" id="showingInfo">Showing 0 to 0 of 0 entries</div>
                    <div class="pagination" id="pagination"></div>
                </div>
            </div>
        </main>
        <div class="cms-modal" id="cmsModal">
            <div class="modal-overlay" id="cmsModalOverlay"></div>
            <div class="event-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="cmsModalTitle">Add</h2>
                    <button type="button" class="modal-close-btn" id="cmsModalClose" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <form id="cmsForm">
                    <input type="hidden" id="cmsId">
                    <div class="modal-body">
                        <div class="cms-form-grid">
                            <div class="cms-form-main">
                                <div class="form-group-modal"><label for="cmsTitle">Title <span class="required">*</span></label><input type="text" id="cmsTitle" class="form-input-modal" required></div>
                                $extraLeft
                                <div class="form-group-modal">
                                    <label for="cmsDescription">Description</label>
                                    <textarea id="cmsDescription" class="form-textarea-modal"></textarea>
                                    <div class="add-media-row"><button type="button" class="btn-add-media" id="cmsAddMediaBtn">Add Media</button><input type="file" id="cmsMediaInput" class="file-input-hidden" accept="image/*"></div>
                                    $extraGallery
                                </div>
                            </div>
                            <div class="cms-form-side">
                                <div class="form-group-modal">
                                    <label>Featured Image</label>
                                    <div class="file-upload-area" id="cmsFileUploadArea">
                                        <img id="cmsImagePreview" class="featured-preview" alt="Featured image">
                                        <p id="cmsImageLabel">Drag and drop a file here or click</p>
                                        <input type="file" id="cmsImageInput" class="file-input" accept=".jpg,.jpeg,.png,.gif,.webp">
                                    </div>
                                    <button type="button" class="btn-delete-image" id="cmsDeleteImageBtn">Delete</button>
                                </div>
                                <div class="form-group-modal"><label>Sidebar</label><div class="radio-row"><label class="checkbox-label"><input type="radio" name="cmsSidebar" id="cmsSidebarYes" value="yes" checked> Yes</label><label class="checkbox-label"><input type="radio" name="cmsSidebar" id="cmsSidebarNo" value="no"> No</label></div></div>
                                <div class="seo-box">
                                    <button type="button" class="seo-toggle" id="cmsSeoToggle"><span>SEO Details</span><span class="seo-plus" id="cmsSeoPlus">+</span></button>
                                    <div class="seo-fields" id="cmsSeoFields">
                                        <div class="form-group-modal"><label for="cmsMetaTitle">Meta Title</label><input type="text" id="cmsMetaTitle" class="form-input-modal"></div>
                                        <div class="form-group-modal"><label for="cmsMetaKeyword">Meta Keyword</label><input type="text" id="cmsMetaKeyword" class="form-input-modal"></div>
                                        <div class="form-group-modal"><label for="cmsMetaDescription">Meta Description</label><textarea id="cmsMetaDescription" class="form-textarea-modal seo-textarea"></textarea></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer"><button type="submit" class="btn-save-modal">Save</button></div>
                </form>
            </div>
        </div>
    </div>
"@
}

$galleryCols = '<th class="sortable" data-sort="title">Title <span class="sort-icon"></span></th><th>Action</th>'
$galleryToolbar = $toolbar.Replace('COLUMNS', '<div class="dropdown-header"><span>Toggle Columns</span></div><div class="dropdown-content"><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="0" checked><span>Title</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="1" checked><span>Action</span></label></div>')
$newsToolbar = $toolbar.Replace('COLUMNS', '<div class="dropdown-header"><span>Toggle Columns</span></div><div class="dropdown-content"><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="0" checked><span>Title</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="1" checked><span>Date</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="2" checked><span>Action</span></label></div>')
$pagesToolbar = $toolbar.Replace('COLUMNS', '<div class="dropdown-header"><span>Toggle Columns</span></div><div class="dropdown-content"><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="0" checked><span>Title</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="1" checked><span>URL</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="2" checked><span>Page Type</span></label><label class="column-toggle-item"><input type="checkbox" class="column-toggle" data-column="3" checked><span>Action</span></label></div>')

function Get-ListPage($cms, $title, $cols, $toolbarHtml, $extraLeft, $extraGallery) {
    $main = Get-ContentMain $cms $title $cols $extraLeft $extraGallery
    return $main.Replace($toolbar, $toolbarHtml)
}

New-Page "Gallery List" "front-cms-gallery" (Get-ListPage "gallery" "Gallery List" $galleryCols $galleryToolbar "" '<div class="add-media-row"><button type="button" class="btn-add-media" id="cmsGalleryBtn">Gallery Images</button><input type="file" id="cmsGalleryInput" class="file-input-hidden" accept="image/*" multiple><div class="gallery-thumbs" id="cmsGalleryThumbs"></div></div>')
New-Page "News List" "front-cms-news" (Get-ListPage "news" "News List" '<th class="sortable" data-sort="title">Title <span class="sort-icon"></span></th><th class="sortable" data-sort="newsDate">Date <span class="sort-icon"></span></th><th>Action</th>' $newsToolbar '<div class="form-group-modal"><label for="cmsDate">Date <span class="required">*</span></label><input type="date" id="cmsDate" class="form-input-modal" required></div>' "")
New-Page "Page List" "front-cms-pages" (Get-ListPage "pages" "Page List" '<th class="sortable" data-sort="title">Title <span class="sort-icon"></span></th><th class="sortable" data-sort="url">URL <span class="sort-icon"></span></th><th class="sortable" data-sort="pageType">Page Type <span class="sort-icon"></span></th><th>Action</th>' $pagesToolbar '<div class="form-group-modal"><label for="cmsPageType">Page Type <span class="required">*</span></label><select id="cmsPageType" class="form-input-modal"><option value="STANDARD">Standard</option><option value="EVENTS">Events</option><option value="NEWS">News</option><option value="GALLERY">Gallery</option></select></div>' "")

$mediaMain = @'
        <main class="main-content front-cms-page" data-cms="media">
            <div class="media-layout">
                <div class="panel-card">
                    <h2 class="panel-title">Upload Your File</h2>
                    <form id="mediaForm">
                        <div class="form-group">
                            <label>Choose or drag file</label>
                            <div class="dropzone"><p>Drop file here or click to browse</p><input type="file" id="mediaFileInput"></div>
                        </div>
                        <div class="form-group"><label for="youtubeUrl">Upload Youtube Video URL</label><input type="url" id="youtubeUrl" class="form-control" placeholder="https://www.youtube.com/watch?v="></div>
                        <button type="submit" class="btn-submit">Submit</button>
                    </form>
                </div>
                <div class="panel-card">
                    <h2 class="panel-title">Media Manager</h2>
                    <div class="filter-row">
                        <input type="text" class="table-search-input" id="searchInput" placeholder="Search By File Name">
                        <select class="entries-select" id="mediaTypeSelect">
                            <option value="">All</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="pdf">Pdf</option>
                            <option value="zip">Zip</option>
                            <option value="text">Text</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="media-grid" id="mediaGrid"></div>
                </div>
            </div>
        </main>
    </div>
'@
New-Page "Media Manager" "front-cms-media" $mediaMain

$menuMain = @'
        <main class="main-content front-cms-page" data-cms="menus">
            <div class="two-panel">
                <div class="panel-card">
                    <h2 class="panel-title">Add Menu</h2>
                    <form id="menuForm">
                        <div class="form-group"><label for="menuName">Menu <span class="required">*</span></label><input type="text" id="menuName" class="form-control" required></div>
                        <div class="form-group"><label for="menuDescription">Description</label><textarea id="menuDescription" class="form-control" rows="3"></textarea></div>
                        <button type="submit" class="btn-submit">Save</button>
                    </form>
                </div>
                <div class="panel-card">
                    <h2 class="panel-title">Menu List</h2>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead><tr><th>Menu</th><th>Action</th></tr></thead>
                            <tbody id="menuTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="panel-card" id="menuItemsPanel" style="display:none;margin-top:1.25rem;">
                <div class="list-header">
                    <h2 class="panel-title" id="activeMenuName">Menu Item List</h2>
                    <button type="button" class="btn-add" id="addItemBtn">+ Add</button>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Menu Item</th><th>Action</th></tr></thead>
                        <tbody id="menuItemTableBody"></tbody>
                    </table>
                </div>
            </div>
        </main>
        <div class="cms-modal" id="cmsModal">
            <div class="modal-overlay" id="cmsModalOverlay"></div>
            <div class="event-modal-content" style="max-width:640px;">
                <div class="modal-header">
                    <h2 class="modal-title" id="cmsModalTitle">Add Menu Item</h2>
                    <button type="button" class="modal-close-btn" id="cmsModalClose" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <form id="menuItemForm">
                    <input type="hidden" id="menuItemId">
                    <input type="hidden" id="menuItemMenuId">
                    <div class="modal-body">
                        <div class="form-group-modal"><label for="menuItemTitle">Menu Item <span class="required">*</span></label><input type="text" id="menuItemTitle" class="form-input-modal" required></div>
                        <div class="toggle-row"><label>External URL</label><label class="switch"><input type="checkbox" id="menuItemExternal"><span></span></label></div>
                        <div class="toggle-row"><label>Open In New Tab</label><label class="switch"><input type="checkbox" id="menuItemNewTab"><span></span></label></div>
                        <div class="form-group-modal"><label for="menuItemUrl">External URL Address</label><input type="url" id="menuItemUrl" class="form-input-modal" placeholder="https://"></div>
                        <div class="form-group-modal"><label for="menuItemPage">Pages</label><select id="menuItemPage" class="form-input-modal"><option value="">Select</option></select></div>
                    </div>
                    <div class="modal-footer"><button type="submit" class="btn-save-modal">Save</button></div>
                </form>
            </div>
        </div>
    </div>
'@
New-Page "Menus" "front-cms-menus" $menuMain

$bannerMain = @'
        <main class="main-content front-cms-page" data-cms="banner">
            <div class="event-list-panel">
                <div class="list-header">
                    <h2 class="panel-title">Banner Images</h2>
                    <button type="button" class="btn-add" id="addBannerBtn">+ Add</button>
                </div>
                <div class="banner-grid" id="bannerGrid"></div>
            </div>
        </main>
        <div class="cms-modal" id="mediaPickerModal">
            <div class="modal-overlay" id="pickerOverlay"></div>
            <div class="event-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Media Manager</h2>
                    <button type="button" class="modal-close-btn" id="pickerClose" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <div class="modal-body">
                    <div class="filter-row">
                        <input type="text" class="table-search-input" id="pickerSearch" placeholder="Search By File Name">
                        <select class="entries-select" id="pickerType">
                            <option value="">All</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="pdf">Pdf</option>
                            <option value="zip">Zip</option>
                            <option value="text">Text</option>
                        </select>
                    </div>
                    <div class="media-grid" id="pickerGrid"></div>
                </div>
                <div class="modal-footer"><button type="button" class="btn-save-modal" id="pickerAddBtn">Add</button></div>
            </div>
        </div>
    </div>
'@
New-Page "Banner Images" "front-cms-banner" $bannerMain
