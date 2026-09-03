from pathlib import Path

root = Path(__file__).resolve().parents[1]
src = (root / "src/main/resources/templates/student-cv-download.html").read_text(encoding="utf-8")
start = src.index("<main")
end = src.index("</main>") + len("</main>")
head, tail = src[:start], src[end:]
head = head.replace("Download CV - Smart School", "{title}").replace("student-cv.css", "certificate.css")
tail = tail.replace("student-cv-ui.js", "certificate-ui.js").replace("student-cv-download.js", "{script}")

search_table_students = """
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr>{cols}</tr></thead>
                        <tbody id="certificateTableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <div class="showing-info" id="showingInfo">Showing 0 to 0 of 0 entries</div>
                    <div class="pagination" id="pagination"></div>
                </div>
"""

def search_page(title, extra_select, cols, generate=False):
    generate_btn = '<div class="form-group"><button type="button" class="btn-generate" id="generateSelectedBtn">Generate</button></div>' if generate else ""
    return f'''        <main class="main-content certificate-page">
            <div class="criteria-section">
                <h2 class="section-title">Select Criteria</h2>
                <form id="criteriaForm" class="criteria-form">
                    <div class="form-row">
                        <div class="form-group"><label>Class <span class="required">*</span></label><select id="criteriaClassSelect" class="form-select" required><option value="">Select</option></select></div>
                        <div class="form-group"><label>Section</label><select id="criteriaSectionSelect" class="form-select"><option value="">Select</option></select></div>
                        {extra_select}
                        <div class="form-group"><button type="submit" class="btn-search">Search</button></div>
                        {generate_btn}
                    </div>
                </form>
            </div>
            <div class="table-section">
                <h2 class="section-title">{title}</h2>
                <div class="table-controls">
                    <div class="table-search"><input type="text" class="table-search-input" id="searchInput" placeholder="Search"></div>
                    <div class="table-actions"><select class="entries-select" id="entriesSelect"><option value="10" selected>10</option><option value="20">20</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select></div>
                </div>
                {search_table_students.format(cols=cols)}
            </div>
        </main>'''

def designer_page(form_title, list_title, fields):
    return f'''        <main class="main-content certificate-page">
            <div class="certificate-designer">
                <div class="designer-panel">
                    <h2 class="panel-title">{form_title}</h2>
                    <form id="designerForm">
                        <input type="hidden" name="id" id="recordId">
                        {fields}
                        <button type="submit" class="btn-save" id="saveBtn">Save</button>
                    </form>
                </div>
                <div class="list-panel">
                    <h2 class="panel-title">{list_title}</h2>
                    <div class="table-controls">
                        <div class="table-search"><input type="text" class="table-search-input" id="searchInput" placeholder="Search"></div>
                        <div class="table-actions"><select class="entries-select" id="entriesSelect"><option value="10" selected>10</option><option value="20">20</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select></div>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead><tr><th>Certificate Name</th><th>Action</th></tr></thead>
                            <tbody id="designerTableBody"></tbody>
                        </table>
                    </div>
                    <div class="table-footer">
                        <div class="showing-info" id="showingInfo">Showing 0 to 0 of 0 entries</div>
                        <div class="pagination" id="pagination"></div>
                    </div>
                </div>
            </div>
        </main>'''

def field(name, label, required=False, textarea=False, typ="text"):
    star = ' <span class="required">*</span>' if required else ""
    if textarea:
        return f'<div class="form-group"><label>{label}{star}</label><textarea name="{name}" class="form-control" {"required" if required else ""}></textarea></div>'
    return f'<div class="form-group"><label>{label}{star}</label><input type="{typ}" name="{name}" class="form-control" {"required" if required else ""}></div>'

cert_fields = (
    field("certificateName", "Certificate Name", True)
    + field("headerLeftText", "Header Left Text")
    + field("headerCenterText", "Header Center Text")
    + field("headerRightText", "Header Right Text")
    + '<p class="keyword-hint">Body keywords: [name] [dob] [present_address] [guardian] [created_at] [admission_no] [roll_no] [class] [section] [gender] [admission_date] [category] [father_name] [mother_name] [religion] [email] [phone]</p>'
    + field("bodyText", "Body Text", True, True)
    + field("footerLeftText", "Footer Left Text")
    + field("footerCenterText", "Footer Center Text")
    + field("footerRightText", "Footer Right Text")
    + field("headerHeight", "Header Height", typ="number")
    + field("footerHeight", "Footer Height", typ="number")
    + field("bodyHeight", "Body Height", typ="number")
    + field("bodyWidth", "Body Width", typ="number")
    + '<div class="form-group"><label>Student Photo</label><select name="studentPhoto" class="form-select"><option value="true">Yes</option><option value="false">No</option></select></div>'
    + '<div class="form-group"><label>Background Image</label><input type="file" name="backgroundImage" class="form-control" accept="image/*"></div>'
)

id_toggles = "".join(
    f'<label><input type="checkbox" name="{name}" checked> {label}</label>'
    for name, label in [
        ("showAdmissionNo", "Admission No"), ("showStudentName", "Student Name"), ("showClass", "Class"),
        ("showFatherName", "Father Name"), ("showMotherName", "Mother Name"), ("showAddress", "Student Address"),
        ("showPhone", "Phone"), ("showDob", "Date Of Birth"), ("showBloodGroup", "Blood Group"),
        ("showRollNo", "Roll No"), ("showHouse", "House"), ("showBarcode", "Barcode / QR Code")
    ]
)
student_id_fields = (
    field("idCardTitle", "ID Card Title", True)
    + field("schoolName", "School Name")
    + field("schoolAddress", "Address / Phone / Email")
    + field("headerColor", "Header Color", typ="color")
    + '<div class="form-group"><label>Design Type</label><select name="designType" class="form-select"><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></div>'
    + '<div class="form-group"><label>Background Image</label><input type="file" name="backgroundImage" class="form-control" accept="image/*"></div>'
    + '<div class="form-group"><label>Logo</label><input type="file" name="logo" class="form-control" accept="image/*"></div>'
    + '<div class="form-group"><label>Signature</label><input type="file" name="signature" class="form-control" accept="image/*"></div>'
    + '<div class="toggle-grid">' + id_toggles + "</div>"
)

staff_toggles = "".join(
    f'<label><input type="checkbox" name="{name}" checked> {label}</label>'
    for name, label in [
        ("showStaffId", "Staff ID"), ("showStaffName", "Staff Name"), ("showDesignation", "Designation"),
        ("showDepartment", "Department"), ("showFatherName", "Father Name"), ("showMotherName", "Mother Name"),
        ("showDob", "Date Of Birth"), ("showPhone", "Phone"), ("showAddress", "Address"), ("showBarcode", "Barcode / QR Code")
    ]
)
staff_id_fields = (
    field("idCardTitle", "ID Card Title", True)
    + field("schoolName", "School Name")
    + field("schoolAddress", "Address / Phone / Email")
    + field("headerColor", "Header Color", typ="color")
    + '<div class="form-group"><label>Design Type</label><select name="designType" class="form-select"><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></div>'
    + '<div class="form-group"><label>Background Image</label><input type="file" name="backgroundImage" class="form-control" accept="image/*"></div>'
    + '<div class="form-group"><label>Logo</label><input type="file" name="logo" class="form-control" accept="image/*"></div>'
    + '<div class="form-group"><label>Signature</label><input type="file" name="signature" class="form-control" accept="image/*"></div>'
    + '<div class="toggle-grid">' + staff_toggles + "</div>"
)

student_cols = "<th>Admission No</th><th>Student Name</th><th>Class</th><th>Father Name</th><th>Date Of Birth</th><th>Gender</th><th>Category</th><th>Mobile Number</th><th>Action</th>"
generate_cols = "<th><input type='checkbox' id='selectAllRows'></th><th>Admission No</th><th>Student Name</th><th>Class</th><th>Father Name</th><th>Date Of Birth</th><th>Gender</th><th>Category</th><th>Mobile Number</th>"
staff_cols = "<th><input type='checkbox' id='selectAllRows'></th><th>Staff ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Phone</th>"

staff_search = '''        <main class="main-content certificate-page">
            <div class="criteria-section">
                <h2 class="section-title">Select Criteria</h2>
                <form id="criteriaForm" class="criteria-form">
                    <div class="form-row">
                        <div class="form-group"><label>ID Card <span class="required">*</span></label><select id="criteriaTemplateSelect" class="form-select" required><option value="">Select</option></select></div>
                        <div class="form-group"><button type="submit" class="btn-search">Search</button></div>
                        <div class="form-group"><button type="button" class="btn-generate" id="generateSelectedBtn">Generate</button></div>
                    </div>
                </form>
            </div>
            <div class="table-section">
                <h2 class="section-title">Staff List</h2>
                <div class="table-controls">
                    <div class="table-search"><input type="text" class="table-search-input" id="searchInput" placeholder="Search"></div>
                    <div class="table-actions"><select class="entries-select" id="entriesSelect"><option value="10" selected>10</option><option value="20">20</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select></div>
                </div>
                ''' + search_table_students.format(cols=staff_cols) + '''
            </div>
        </main>'''

pages = [
    ("transfer-certificate.html", "Transfer Certificate - Smart School", "transfer", "certificate-search.js",
     search_page("Student List", "", student_cols)),
    ("generate-certificate.html", "Generate Certificate - Smart School", "certificate", "certificate-search.js",
     search_page("Student List", '<div class="form-group"><label>Certificate <span class="required">*</span></label><select id="criteriaTemplateSelect" class="form-select" required><option value="">Select</option></select></div>', generate_cols, True)),
    ("generate-id-card.html", "Generate ID Card - Smart School", "id-card", "certificate-search.js",
     search_page("Student List", '<div class="form-group"><label>ID Card <span class="required">*</span></label><select id="criteriaTemplateSelect" class="form-select" required><option value="">Select</option></select></div>', generate_cols, True)),
    ("generate-staff-id-card.html", "Generate Staff ID Card - Smart School", "staff-id", "certificate-search.js",
     staff_search),
    ("student-certificate.html", "Student Certificate - Smart School", "student-certificate", "certificate-designer.js",
     designer_page("Add Student Certificate", "Student Certificate List", cert_fields).replace("Certificate Name</th>", "Certificate Name</th>")),
    ("student-id-card.html", "Student ID Card - Smart School", "student-id", "certificate-designer.js",
     designer_page("Add Student ID Card", "Student ID Card List", student_id_fields).replace("<th>Certificate Name</th>", "<th>ID Card Title</th>")),
    ("staff-id-card.html", "Staff ID Card - Smart School", "staff-id", "certificate-designer.js",
     designer_page("Add Staff ID Card", "Staff ID Card List", staff_id_fields).replace("<th>Certificate Name</th>", "<th>ID Card Title</th>")),
]

out_dir = root / "src/main/resources/templates"
for filename, title, page, script, main in pages:
    html = head.replace("{title}", title)
    html = html.replace("<body>", f'<body data-certificate-page="{page}">')
    html = html + main + tail.replace("{script}", script)
    (out_dir / filename).write_text(html, encoding="utf-8")
    print("wrote", filename)
