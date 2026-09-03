$base = "c:\Users\alhaj\OneDrive\Desktop\School Application\smart_schoolapp\src\main\resources\templates"
$recipientOptions = @'
<option value="">Select</option>
                                <option value="Student">Student</option>
                                <option value="Guardian">Guardian</option>
                                <option value="Staff">Staff</option>
                                <option value="Class">Class</option>
                                <option value="Individual">Individual</option>
                                <option value="All">All</option>
'@

function Get-TableFooter {
    return @'
                    <div class="table-footer">
                        <div class="showing-info">Showing <span id="showingStart">0</span> to <span id="showingEnd">0</span> of <span id="totalEntries">0</span> entries</div>
                        <div class="pagination" id="pagination"></div>
                    </div>
'@
}

function Patch-Page($file, $title, $js, $activeHref, $mainHtml) {
    $path = Join-Path $base "$file.html"
    $content = Get-Content $path -Raw
    $content = $content -replace '<title>[^<]+</title>', "<title>$title - Smart School</title>"
    $content = $content -replace 'department\.css', 'communicate.css'
    $content = $content -replace 'department\.js', $js
    $content = $content -replace '(?s)        <!-- Main Content -->.*?        </main>', "        <!-- Main Content -->`r`n$mainHtml"
    $content = $content -replace 'href="#" class="submenu-item">Notice Board', "href=`"/communicate/noticeboard`" class=`"submenu-item`">Notice Board"
    $content = $content -replace 'href="#" class="submenu-item">Send Email', "href=`"/communicate/sendemail`" class=`"submenu-item`">Send Email"
    $content = $content -replace 'href="#" class="submenu-item">Send SMS', "href=`"/communicate/sendsms`" class=`"submenu-item`">Send SMS"
    $content = $content -replace 'href="#" class="submenu-item">Email / SMS Log', "href=`"/admin/mailsms/index`" class=`"submenu-item`">Email / SMS Log"
    $content = $content -replace 'href="#" class="submenu-item">Schedule Email SMS Log', "href=`"/admin/mailsms/schedule`" class=`"submenu-item`">Schedule Email SMS Log"
    $content = $content -replace 'href="#" class="submenu-item">Login Credentials Send', "href=`"/student/bulkmail`" class=`"submenu-item`">Login Credentials Send"
    $content = $content -replace 'href="#" class="submenu-item">Email Template', "href=`"/admin/mailsms/emailtemplate`" class=`"submenu-item`">Email Template"
    $content = $content -replace 'href="#" class="submenu-item">SMS Template', "href=`"/admin/mailsms/smsemplate`" class=`"submenu-item`">SMS Template"
    $content = $content -replace 'href="#" class="submenu-item">Email/SMS Log', "href=`"/admin/mailsms/index`" class=`"submenu-item`">Email / SMS Log"
    $content = $content -replace "(href=`"$activeHref`" class=`"submenu-item`")", '$1 active'
    Set-Content $path $content -NoNewline
    Write-Output "Patched $file"
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
                            </select>
                        </div>
                    </div>
'@

$noticeMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container`">
                <div class=`"communicate-form-panel`">
                    <h2 class=`"panel-title`" id=`"formTitle`">Add Notice</h2>
                    <form id=`"recordForm`">
                        <div class=`"form-group`"><label for=`"noticeTitle`">Title <span class=`"required`">*</span></label><input type=`"text`" id=`"noticeTitle`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"noticeDate`">Date <span class=`"required`">*</span></label><input type=`"date`" id=`"noticeDate`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"publishTo`">Publish To <span class=`"required`">*</span></label><select id=`"publishTo`" class=`"form-control`" required>$recipientOptions</select></div>
                        <div class=`"form-group`"><label><input type=`"checkbox`" id=`"showOnWebsite`"> Show on Website</label></div>
                        <div class=`"form-group`"><label for=`"noticeMessage`">Message <span class=`"required`">*</span></label><textarea id=`"noticeMessage`" class=`"form-control`" rows=`"5`" required></textarea></div>
                        <div class=`"form-actions`"><button type=`"submit`" class=`"btn-save-primary`">Save</button></div>
                    </form>
                </div>
                <div class=`"communicate-list-panel`">
                    <h2 class=`"panel-title`">Notice List</h2>
                    $tableControls
                    <div class=`"table-responsive`"><table class=`"data-table`"><thead><tr><th>Title</th><th>Date</th><th>Publish To</th><th>Website</th><th>Message</th><th>Action</th></tr></thead><tbody id=`"recordTableBody`"></tbody></table></div>
                    $(Get-TableFooter)
                </div>
            </div>
        </main>
"@

$sendEmailMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container communicate-single`">
                <div class=`"communicate-form-panel`">
                    <h2 class=`"panel-title`">Send Email</h2>
                    <form id=`"recordForm`">
                        <div class=`"form-group`"><label for=`"emailTemplateSelect`">Email Template</label><select id=`"emailTemplateSelect`" class=`"form-control`"><option value=`"`">Select Template (Optional)</option></select></div>
                        <div class=`"form-group`"><label for=`"messageTitle`">Subject <span class=`"required`">*</span></label><input type=`"text`" id=`"messageTitle`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"recipientType`">Send To <span class=`"required`">*</span></label><select id=`"recipientType`" class=`"form-control`" required>$recipientOptions</select></div>
                        <div class=`"form-group`"><label for=`"recipientDetails`">Recipient Details</label><input type=`"text`" id=`"recipientDetails`" class=`"form-control`" placeholder=`"Class, emails, or names`"></div>
                        <div class=`"form-group`"><label for=`"messageBody`">Message <span class=`"required`">*</span></label><textarea id=`"messageBody`" class=`"form-control`" rows=`"8`" required></textarea></div>
                        <div class=`"form-actions`"><button type=`"submit`" class=`"btn-save-primary`">Send Email</button></div>
                    </form>
                </div>
            </div>
        </main>
"@

$sendSmsMain = $sendEmailMain -replace 'Send Email','Send SMS' -replace 'emailTemplateSelect','smsTemplateSelect' -replace 'Email Template','SMS Template' -replace 'Subject','Title' -replace 'Send Email</button>','Send SMS</button>'

$mailSmsLogMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container communicate-single`">
                <div class=`"communicate-list-panel`">
                    <h2 class=`"panel-title`">Email / SMS Log</h2>
                    <div class=`"table-controls`">
                        <div class=`"table-search`"><input type=`"text`" class=`"table-search-input`" id=`"searchInput`" placeholder=`"Search`"></div>
                        <div class=`"table-actions`">
                            <select class=`"entries-select`" id=`"filterType`"><option value=`"`">All Types</option><option value=`"EMAIL`">Email</option><option value=`"SMS`">SMS</option></select>
                            <select class=`"entries-select`" id=`"entriesSelect`"><option value=`"50`" selected>50</option><option value=`"100`">100</option></select>
                        </div>
                    </div>
                    <div class=`"table-responsive`"><table class=`"data-table`"><thead><tr><th>Type</th><th>Title</th><th>Recipient Type</th><th>Details</th><th>Status</th><th>Sent At</th><th>Action</th></tr></thead><tbody id=`"recordTableBody`"></tbody></table></div>
                    $(Get-TableFooter)
                </div>
            </div>
        </main>
"@

$scheduleMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container`">
                <div class=`"communicate-form-panel`">
                    <h2 class=`"panel-title`">Schedule Email / SMS</h2>
                    <form id=`"recordForm`">
                        <div class=`"form-group`"><label for=`"messageType`">Type <span class=`"required`">*</span></label><select id=`"messageType`" class=`"form-control`" required><option value=`"EMAIL`">Email</option><option value=`"SMS`">SMS</option></select></div>
                        <div class=`"form-group`"><label for=`"messageTitle`">Title <span class=`"required`">*</span></label><input type=`"text`" id=`"messageTitle`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"recipientType`">Send To <span class=`"required`">*</span></label><select id=`"recipientType`" class=`"form-control`" required>$recipientOptions</select></div>
                        <div class=`"form-group`"><label for=`"recipientDetails`">Recipient Details</label><input type=`"text`" id=`"recipientDetails`" class=`"form-control`"></div>
                        <div class=`"form-group`"><label for=`"scheduledAt`">Schedule Date & Time <span class=`"required`">*</span></label><input type=`"datetime-local`" id=`"scheduledAt`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"messageBody`">Message <span class=`"required`">*</span></label><textarea id=`"messageBody`" class=`"form-control`" rows=`"5`" required></textarea></div>
                        <div class=`"form-actions`"><button type=`"submit`" class=`"btn-save-primary`">Schedule</button></div>
                    </form>
                </div>
                <div class=`"communicate-list-panel`">
                    <h2 class=`"panel-title`">Scheduled Messages</h2>
                    $tableControls
                    <div class=`"table-responsive`"><table class=`"data-table`"><thead><tr><th>Type</th><th>Title</th><th>Recipient</th><th>Details</th><th>Scheduled At</th><th>Status</th><th>Action</th></tr></thead><tbody id=`"recordTableBody`"></tbody></table></div>
                    $(Get-TableFooter)
                </div>
            </div>
        </main>
"@

$loginCredMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container`">
                <div class=`"communicate-form-panel`">
                    <h2 class=`"panel-title`">Login Credentials Send</h2>
                    <form id=`"recordForm`">
                        <div class=`"form-group`"><label for=`"userType`">User Type <span class=`"required`">*</span></label><select id=`"userType`" class=`"form-control`" required><option value=`"`">Select</option><option value=`"Student`">Student</option><option value=`"Staff`">Staff</option><option value=`"Guardian`">Guardian</option></select></div>
                        <div class=`"form-group`"><label for=`"sendVia`">Send Via <span class=`"required`">*</span></label><select id=`"sendVia`" class=`"form-control`" required><option value=`"`">Select</option><option value=`"Email`">Email</option><option value=`"SMS`">SMS</option><option value=`"Both`">Both</option></select></div>
                        <div class=`"form-group`"><label for=`"recipientType`">Recipient Type <span class=`"required`">*</span></label><select id=`"recipientType`" class=`"form-control`" required>$recipientOptions</select></div>
                        <div class=`"form-group`"><label for=`"recipientDetails`">Recipient Details</label><input type=`"text`" id=`"recipientDetails`" class=`"form-control`" placeholder=`"Class, section, or individual details`"></div>
                        <div class=`"form-actions`"><button type=`"submit`" class=`"btn-save-primary`">Send Credentials</button></div>
                    </form>
                </div>
                <div class=`"communicate-list-panel`">
                    <h2 class=`"panel-title`">Send Log</h2>
                    $tableControls
                    <div class=`"table-responsive`"><table class=`"data-table`"><thead><tr><th>User Type</th><th>Send Via</th><th>Recipient Type</th><th>Details</th><th>Status</th><th>Sent At</th></tr></thead><tbody id=`"recordTableBody`"></tbody></table></div>
                    $(Get-TableFooter)
                </div>
            </div>
        </main>
"@

$emailTemplateMain = @"
        <main class=`"main-content communicate-page`">
            <div class=`"communicate-container`">
                <div class=`"communicate-form-panel`">
                    <h2 class=`"panel-title`" id=`"formTitle`">Add Email Template</h2>
                    <form id=`"recordForm`">
                        <div class=`"form-group`"><label for=`"templateTitle`">Title <span class=`"required`">*</span></label><input type=`"text`" id=`"templateTitle`" class=`"form-control`" required></div>
                        <div class=`"form-group`"><label for=`"templateBody`">Template <span class=`"required`">*</span></label><textarea id=`"templateBody`" class=`"form-control`" rows=`"8`" required></textarea></div>
                        <div class=`"form-actions`"><button type=`"submit`" class=`"btn-save-primary`">Save</button></div>
                    </form>
                </div>
                <div class=`"communicate-list-panel`">
                    <h2 class=`"panel-title`">Email Template List</h2>
                    $tableControls
                    <div class=`"table-responsive`"><table class=`"data-table`"><thead><tr><th>Title</th><th>Template</th><th>Action</th></tr></thead><tbody id=`"recordTableBody`"></tbody></table></div>
                    $(Get-TableFooter)
                </div>
            </div>
        </main>
"@

$smsTemplateMain = $emailTemplateMain -replace 'Email Template','SMS Template' -replace 'Email Template List','SMS Template List'

Patch-Page 'communicate-noticeboard' 'Notice Board' 'communicate-noticeboard.js' '/communicate/noticeboard' $noticeMain
Patch-Page 'communicate-sendemail' 'Send Email' 'communicate-sendemail.js' '/communicate/sendemail' $sendEmailMain
Patch-Page 'communicate-sendsms' 'Send SMS' 'communicate-sendsms.js' '/communicate/sendsms' $sendSmsMain
Patch-Page 'communicate-mailsmslog' 'Email / SMS Log' 'communicate-mailsmslog.js' '/admin/mailsms/index' $mailSmsLogMain
Patch-Page 'communicate-schedulelog' 'Schedule Email SMS Log' 'communicate-schedulelog.js' '/admin/mailsms/schedule' $scheduleMain
Patch-Page 'communicate-logincredential' 'Login Credentials Send' 'communicate-logincredential.js' '/student/bulkmail' $loginCredMain
Patch-Page 'communicate-emailtemplate' 'Email Template' 'communicate-emailtemplate.js' '/admin/mailsms/emailtemplate' $emailTemplateMain
Patch-Page 'communicate-smstemplate' 'SMS Template' 'communicate-smstemplate.js' '/admin/mailsms/smsemplate' $smsTemplateMain

# Update all templates with communicate submenu links
$submenuOld = '(?s)<div class="submenu" id="submenu-communicate">.*?</div>'
$submenuNew = @'
                    <div class="submenu" id="submenu-communicate">
                        <a href="/communicate/noticeboard" class="submenu-item">Notice Board</a>
                        <a href="/communicate/sendemail" class="submenu-item">Send Email</a>
                        <a href="/communicate/sendsms" class="submenu-item">Send SMS</a>
                        <a href="/admin/mailsms/index" class="submenu-item">Email / SMS Log</a>
                        <a href="/admin/mailsms/schedule" class="submenu-item">Schedule Email SMS Log</a>
                        <a href="/student/bulkmail" class="submenu-item">Login Credentials Send</a>
                        <a href="/admin/mailsms/emailtemplate" class="submenu-item">Email Template</a>
                        <a href="/admin/mailsms/smsemplate" class="submenu-item">SMS Template</a>
                    </div>
'@

Get-ChildItem (Join-Path $base "*.html") -Recurse | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    if ($c -match 'submenu-communicate') {
        $updated = [regex]::Replace($c, $submenuOld, $submenuNew.TrimEnd())
        if ($updated -ne $c) {
            Set-Content $_.FullName $updated -NoNewline
            Write-Output "Updated submenu in $($_.Name)"
        }
    }
}

Write-Output "Done"
