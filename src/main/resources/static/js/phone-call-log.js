// Phone Call Log specific JavaScript
let callRecords = [];
let currentEditId = null;

// DOM Elements
const callForm = document.getElementById('callForm');
const callLogTableBody = document.getElementById('callLogTableBody');
const searchInput = document.getElementById('searchInput');

// Form Submission
callForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get the call type from radio buttons
    const callTypeRadio = document.querySelector('input[name="callType"]:checked');
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        callType: callTypeRadio ? callTypeRadio.value : '',
        date: document.getElementById('date').value,
        followUpDate: document.getElementById('followUpDate').value || null,
        callDuration: document.getElementById('callDuration').value || null,
        description: document.getElementById('description').value || null
    };

    try {
        let response;
        if (currentEditId) {
            // Update existing call
            response = await fetch(`/api/phone-calls/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new call
            response = await fetch('/api/phone-calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: currentEditId ? 'Call updated successfully' : 'Call added successfully',
                timer: 2000,
                showConfirmButton: false
            });
            resetForm();
            loadCallRecords();
        } else {
            throw new Error('Failed to save call record');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to save call record. Please try again.'
        });
    }
});

// Reset Form
function resetForm() {
    callForm.reset();
    currentEditId = null;
    document.getElementById('callId').value = '';
}

// Load Call Records
async function loadCallRecords() {
    try {
        const response = await fetch('/api/phone-calls');
        if (response.ok) {
            callRecords = await response.json();
            renderTable();
        }
    } catch (error) {
        console.error('Error loading call records:', error);
    }
}

// Render Table
function renderTable(records = callRecords) {
    if (records.length === 0) {
        callLogTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">No call records found</td>
            </tr>
        `;
        updatePagination(0);
        return;
    }

    callLogTableBody.innerHTML = records.map(call => `
        <tr>
            <td>${call.name}</td>
            <td>${call.phone}</td>
            <td>${formatDate(call.date)}</td>
            <td>${call.followUpDate ? formatDate(call.followUpDate) : '-'}</td>
            <td><span class="badge badge-${call.callType.toLowerCase()}">${call.callType}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editCall(${call.id})" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteCall(${call.id})" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination(records.length);
}

// Edit Call
window.editCall = function(id) {
    const call = callRecords.find(c => c.id === id);
    if (call) {
        currentEditId = call.id;
        document.getElementById('callId').value = call.id;
        document.getElementById('name').value = call.name;
        document.getElementById('phone').value = call.phone;
        document.getElementById('date').value = call.date;
        document.getElementById('followUpDate').value = call.followUpDate || '';
        document.getElementById('callDuration').value = call.callDuration || '';
        document.getElementById('description').value = call.description || '';
        
        // Set the radio button
        if (call.callType === 'Incoming') {
            document.getElementById('callTypeIncoming').checked = true;
        } else {
            document.getElementById('callTypeOutgoing').checked = true;
        }
        
        // Scroll to form
        document.querySelector('.add-call-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Delete Call
window.deleteCall = async function(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/phone-calls/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Call record has been deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
                loadCallRecords();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete call record.'
            });
        }
    }
};

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = callRecords.filter(call => 
        call.name.toLowerCase().includes(searchTerm) ||
        call.phone.includes(searchTerm) ||
        call.callType.toLowerCase().includes(searchTerm) ||
        (call.description && call.description.toLowerCase().includes(searchTerm))
    );
    renderTable(filtered);
});

// Export Functions
document.getElementById('copyBtn').addEventListener('click', () => {
    const table = document.getElementById('callLogTable');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Table copied to clipboard',
        timer: 1500,
        showConfirmButton: false
    });
});

document.getElementById('excelBtn').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(callRecords);
    XLSX.utils.book_append_sheet(wb, ws, 'Phone Calls');
    XLSX.writeFile(wb, 'phone-call-log.xlsx');
});

document.getElementById('csvBtn').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(callRecords);
    XLSX.utils.book_append_sheet(wb, ws, 'Phone Calls');
    XLSX.writeFile(wb, 'phone-call-log.csv');
});

document.getElementById('pdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.autoTable({
        head: [['Name', 'Phone', 'Date', 'Next Follow Up', 'Call Type']],
        body: callRecords.map(call => [
            call.name,
            call.phone,
            formatDate(call.date),
            call.followUpDate ? formatDate(call.followUpDate) : '-',
            call.callType
        ])
    });
    
    doc.save('phone-call-log.pdf');
});

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function updatePagination(count) {
    document.getElementById('showingStart').textContent = count > 0 ? '1' : '0';
    document.getElementById('showingEnd').textContent = count;
    document.getElementById('totalEntries').textContent = count;
}

// Initialize
loadCallRecords();
