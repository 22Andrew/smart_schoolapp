$base = "c:\Users\alhaj\OneDrive\Desktop\School Application\smart_schoolapp\src\main\resources\templates"
$source = Join-Path $base "downloadcenter-upload.html"

function Set-DownloadCenterSidebar($content, $activeHref) {
    $content = $content -replace 'href="/admin/content/upload" class="submenu-item active"', 'href="/admin/content/upload" class="submenu-item"'
    $content = $content -replace 'href="/admin/content/sharelist" class="submenu-item active"', 'href="/admin/content/sharelist" class="submenu-item"'
    $content = $content -replace 'href="/admin/content/videotutorial" class="submenu-item active"', 'href="/admin/content/videotutorial" class="submenu-item"'
    $content = $content -replace 'href="/admin/content/type" class="submenu-item active"', 'href="/admin/content/type" class="submenu-item"'
    $content = $content -replace "(href=`"$activeHref`" class=`"submenu-item`")", '$1 active'
    return $content
}

$tableControls = @'
                    <div class="table-controls">
                        <div class="table-search">
                            <input type="text" class="table-search-input" id="searchInput" placeholder="Search">
                        </div>
                        <div class="table-actions">
                            <select class="entries-select" id="entriesSelect">
                                <option value="50" selected>50</option>
                                <option value="100">100</option>
                                <option value="250">250</option>
                            </select>
                            <button type="button" class="icon-action-btn" id="copyBtn" title="Copy">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                            <button type="button" class="icon-action-btn" id="excelBtn" title="Export to Excel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="icon-action-btn" id="csvBtn" title="Export to CSV">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="icon-action-btn" id="pdfBtn" title="Export to PDF">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            <button type="button" class="icon-action-btn" id="printBtn" title="Print">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                        </div>
                    </div>
'@

$tableFooter = @'
                    <div class="table-footer">
                        <div class="showing-info">Showing <span id="showingStart">0</span> to <span id="showingEnd">0</span> of <span id="totalEntries">0</span> entries</div>
                        <div class="pagination" id="pagination"></div>
                    </div>
'@

function New-Page($file, $title, $js, $activeHref, $mainHtml, $modalsHtml) {
    $content = Get-Content $source -Raw
    $content = $content -replace '<title>[^<]+</title>', "<title>$title - Smart School</title>"
    $content = $content -replace 'downloadcenter-upload\.js', $js
    $content = Set-DownloadCenterSidebar $content $activeHref
    $content = [regex]::Replace($content, '(?s)        <!-- Main Content -->.*?        </main>', "        <!-- Main Content -->`r`n$mainHtml")
    $content = [regex]::Replace($content, '(?s)    <!-- Upload Content Modal -->.*?(?=    <!-- Quick Links Modal -->)', $modalsHtml)
    Set-Content (Join-Path $base "$file.html") $content -NoNewline
    Write-Output "Created $file.html"
}

$shareMain = @"
        <main class=`"main-content communicate-page downloadcenter-page`">
            <div class=`"communicate-container communicate-single communicate-log-page`">
                <div class=`"communicate-list-panel email-template-panel`">
                    <div class=`"content-list-header`">
                        <h2 class=`"panel-title`">Content Share List</h2>
                    </div>
                    $tableControls
                    <div class=`"table-responsive content-table-wrap`" id=`"contentTableWrap`">
                        <table class=`"data-table email-template-table`" id=`"contentTable`">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Share Date</th>
                                    <th>Valid Until</th>
                                    <th>Send To</th>
                                    <th>Content</th>
                                    <th>Roles</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id=`"recordTableBody`"></tbody>
                        </table>
                    </div>
                    $tableFooter
                </div>
            </div>
        </main>
"@

$shareModals = @'
    <!-- View Share Modal -->
    <div class="downloadcenter-modal" id="viewModal">
        <div class="modal-overlay" id="viewModalOverlay"></div>
        <div class="downloadcenter-modal-content">
            <div class="downloadcenter-modal-header">
                <h2 class="modal-title">Share Details</h2>
                <button type="button" class="modal-close-btn" id="viewModalCloseBtn" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="downloadcenter-modal-body">
                <div class="view-details-grid">
                    <div class="view-details-row"><span class="label">Title</span><span class="value" id="viewTitle">-</span></div>
                    <div class="view-details-row"><span class="label">Share Date</span><span class="value" id="viewShareDate">-</span></div>
                    <div class="view-details-row"><span class="label">Valid Until</span><span class="value" id="viewValidUntil">-</span></div>
                    <div class="view-details-row"><span class="label">Send To</span><span class="value" id="viewSendTo">-</span></div>
                    <div class="view-details-row"><span class="label">Roles</span><span class="value" id="viewRoles">-</span></div>
                    <div class="view-details-row"><span class="label">Content</span><span class="value" id="viewContentTitles">-</span></div>
                    <div class="view-details-row"><span class="label">Description</span><span class="value" id="viewDescription">-</span></div>
                    <div class="view-details-row"><span class="label">Created At</span><span class="value" id="viewCreatedAt">-</span></div>
                </div>
            </div>
        </div>
    </div>

'@

$videoMain = @"
        <main class=`"main-content communicate-page downloadcenter-page`">
            <div class=`"communicate-container communicate-single communicate-log-page`">
                <div class=`"communicate-list-panel email-template-panel`">
                    <div class=`"content-list-header`">
                        <h2 class=`"panel-title`">Video Tutorial List</h2>
                        <div class=`"header-actions`">
                            <button type=`"button`" class=`"btn-upload-content`" id=`"addTutorialBtn`">+ Add</button>
                        </div>
                    </div>
                    <div class=`"filter-controls`">
                        <select id=`"filterClassSelect`" class=`"form-control`"><option value=`"`">All Classes</option></select>
                        <select id=`"filterSectionSelect`" class=`"form-control`"><option value=`"`">All Sections</option></select>
                    </div>
                    $tableControls
                    <div class=`"table-responsive content-table-wrap`" id=`"contentTableWrap`">
                        <table class=`"data-table email-template-table`" id=`"contentTable`">
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Title</th>
                                    <th>Video Link</th>
                                    <th>Created By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id=`"recordTableBody`"></tbody>
                        </table>
                    </div>
                    $tableFooter
                </div>
            </div>
        </main>
"@

$videoModals = @'
    <!-- Add / Edit Video Tutorial Modal -->
    <div class="downloadcenter-modal" id="tutorialModal">
        <div class="modal-overlay" id="tutorialModalOverlay"></div>
        <div class="downloadcenter-modal-content">
            <div class="downloadcenter-modal-header">
                <h2 class="modal-title" id="tutorialModalTitle">Add Video Tutorial</h2>
                <button type="button" class="modal-close-btn" id="tutorialModalCloseBtn" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="downloadcenter-modal-body">
                <form id="tutorialForm">
                    <div class="form-group">
                        <label for="tutorialClassSelect">Class <span class="required">*</span></label>
                        <select id="tutorialClassSelect" class="form-control" required></select>
                    </div>
                    <div class="form-group">
                        <label for="tutorialSectionSelect">Section <span class="required">*</span></label>
                        <select id="tutorialSectionSelect" class="form-control" required></select>
                    </div>
                    <div class="form-group">
                        <label for="tutorialTitle">Title <span class="required">*</span></label>
                        <input type="text" id="tutorialTitle" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="tutorialVideoLink">Video Link (YouTube) <span class="required">*</span></label>
                        <input type="url" id="tutorialVideoLink" class="form-control" placeholder="https://www.youtube.com/watch?v=..." required>
                    </div>
                    <div class="form-group">
                        <label for="tutorialDescription">Description</label>
                        <textarea id="tutorialDescription" class="form-control" rows="4"></textarea>
                    </div>
                    <div class="downloadcenter-modal-footer">
                        <button type="submit" class="btn-save-modal">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- View Video Tutorial Modal -->
    <div class="downloadcenter-modal" id="viewModal">
        <div class="modal-overlay" id="viewModalOverlay"></div>
        <div class="downloadcenter-modal-content">
            <div class="downloadcenter-modal-header">
                <h2 class="modal-title">Video Tutorial Details</h2>
                <button type="button" class="modal-close-btn" id="viewModalCloseBtn" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="downloadcenter-modal-body">
                <div class="view-details-grid">
                    <div class="view-details-row"><span class="label">Class</span><span class="value" id="viewClassName">-</span></div>
                    <div class="view-details-row"><span class="label">Section</span><span class="value" id="viewSection">-</span></div>
                    <div class="view-details-row"><span class="label">Title</span><span class="value" id="viewTitle">-</span></div>
                    <div class="view-details-row"><span class="label">Video Link</span><span class="value" id="viewVideoLink">-</span></div>
                    <div class="view-details-row"><span class="label">Description</span><span class="value" id="viewDescription">-</span></div>
                    <div class="view-details-row"><span class="label">Created By</span><span class="value" id="viewCreatedBy">-</span></div>
                    <div class="view-details-row"><span class="label">Created At</span><span class="value" id="viewCreatedAt">-</span></div>
                </div>
            </div>
        </div>
    </div>

'@

$typeMain = @"
        <main class=`"main-content communicate-page downloadcenter-page`">
            <div class=`"communicate-container communicate-single communicate-log-page`">
                <div class=`"communicate-list-panel email-template-panel`">
                    <div class=`"content-list-header`">
                        <h2 class=`"panel-title`">Content Type List</h2>
                        <div class=`"header-actions`">
                            <button type=`"button`" class=`"btn-upload-content`" id=`"addTypeBtn`">+ Add</button>
                        </div>
                    </div>
                    $tableControls
                    <div class=`"table-responsive content-table-wrap`" id=`"contentTableWrap`">
                        <table class=`"data-table email-template-table`" id=`"contentTable`">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id=`"recordTableBody`"></tbody>
                        </table>
                    </div>
                    $tableFooter
                </div>
            </div>
        </main>
"@

$typeModals = @'
    <!-- Add / Edit Content Type Modal -->
    <div class="downloadcenter-modal" id="typeModal">
        <div class="modal-overlay" id="typeModalOverlay"></div>
        <div class="downloadcenter-modal-content">
            <div class="downloadcenter-modal-header">
                <h2 class="modal-title" id="typeModalTitle">Add Content Type</h2>
                <button type="button" class="modal-close-btn" id="typeModalCloseBtn" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="downloadcenter-modal-body">
                <form id="contentTypeForm">
                    <div class="form-group">
                        <label for="typeName">Name <span class="required">*</span></label>
                        <input type="text" id="typeName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="typeDescription">Description</label>
                        <textarea id="typeDescription" class="form-control" rows="4"></textarea>
                    </div>
                    <div class="downloadcenter-modal-footer">
                        <button type="submit" class="btn-save-modal">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

'@

New-Page 'downloadcenter-sharelist' 'Content Share List' 'downloadcenter-sharelist.js' '/admin/content/sharelist' $shareMain $shareModals
New-Page 'downloadcenter-videotutorial' 'Video Tutorial' 'downloadcenter-videotutorial.js' '/admin/content/videotutorial' $videoMain $videoModals
New-Page 'downloadcenter-contenttype' 'Content Type' 'downloadcenter-contenttype.js' '/admin/content/type' $typeMain $typeModals

$submenuOld = '(?s)<div class="submenu" id="submenu-download-center">.*?</div>'
$submenuNew = @'
                    <div class="submenu" id="submenu-download-center">
                        <a href="/admin/content/upload" class="submenu-item">Upload/Share Content</a>
                        <a href="/admin/content/sharelist" class="submenu-item">Content Share List</a>
                        <a href="/admin/content/videotutorial" class="submenu-item">Video Tutorial</a>
                        <a href="/admin/content/type" class="submenu-item">Content Type</a>
                    </div>
'@

$updatedCount = 0
Get-ChildItem (Join-Path $base "*.html") | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    if ($c -match 'submenu-download-center') {
        $updated = [regex]::Replace($c, $submenuOld, $submenuNew.TrimEnd())
        if ($updated -ne $c) {
            Set-Content $_.FullName $updated -NoNewline
            $updatedCount++
        }
    }
}

Write-Output "Updated download center submenu in $updatedCount templates"
