let languages = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addLanguageBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeLanguageModal')?.addEventListener('click', closeAddModal);
    document.getElementById('addLanguageOverlay')?.addEventListener('click', closeAddModal);
    document.getElementById('addLanguageForm')?.addEventListener('submit', saveLanguage);
    loadLanguages();
});

async function loadLanguages() {
    try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error('Failed to load languages');
        languages = await response.json();
        renderTable();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load languages',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable() {
    const tbody = document.getElementById('languageTableBody');
    if (!tbody) return;

    if (!languages.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No languages found</td></tr>';
        return;
    }

    tbody.innerHTML = languages.map((lang, index) => {
        const flag = (lang.countryCode || '').toLowerCase();
        const radio = lang.isEnabled
            ? `<input type="radio" name="activeLanguage" ${lang.isDefault ? 'checked' : ''} onchange="activateLanguage(${lang.id})">`
            : '';
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <span class="language-name">
                        <img src="https://flagcdn.com/w40/${escapeHtml(flag)}.png" alt="" onerror="this.style.visibility='hidden'">
                        ${escapeHtml(lang.name)}
                    </span>
                </td>
                <td>${escapeHtml(lang.shortCode)}</td>
                <td>
                    <input type="text" class="country-code-input" value="${escapeHtml(lang.countryCode)}"
                           onblur="saveCountryCode(${lang.id}, this.value)">
                </td>
                <td>${lang.isDefault ? '<span class="status-badge">Active</span>' : ''}</td>
                <td>${radio}</td>
                <td>
                    <input type="checkbox" ${lang.isRtl ? 'checked' : ''} onchange="saveRtl(${lang.id}, this.checked)">
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${lang.isEnabled ? 'checked' : ''} onchange="saveEnabled(${lang.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveCountryCode(id, value) {
    await patchLanguage(id, { countryCode: value.trim() });
}

async function saveRtl(id, isRtl) {
    await patchLanguage(id, { isRtl }, false);
}

async function saveEnabled(id, isEnabled) {
    const ok = await patchLanguage(id, { isEnabled });
    if (!ok) loadLanguages();
}

async function activateLanguage(id) {
    try {
        const response = await fetch(`/api/languages/${id}/activate`, { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await loadLanguages();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save active language',
            confirmButtonColor: '#ef4444'
        });
        loadLanguages();
    }
}

async function patchLanguage(id, payload, reload = true) {
    try {
        const response = await fetch(`/api/languages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        if (reload) await loadLanguages();
        return true;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save language',
            confirmButtonColor: '#ef4444'
        });
        return false;
    }
}

function openAddModal() {
    document.getElementById('addLanguageForm')?.reset();
    const modal = document.getElementById('addLanguageModal');
    if (modal) modal.hidden = false;
    document.getElementById('langName')?.focus();
}

function closeAddModal() {
    const modal = document.getElementById('addLanguageModal');
    if (modal) modal.hidden = true;
}

async function saveLanguage(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById('langName').value.trim(),
        shortCode: document.getElementById('langShortCode').value.trim(),
        countryCode: document.getElementById('langCountryCode').value.trim(),
        isRtl: document.getElementById('langIsRtl').checked
    };

    try {
        const response = await fetch('/api/languages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        closeAddModal();
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: data.message,
            confirmButtonColor: '#10b981',
            timer: 2000,
            timerProgressBar: true
        });
        loadLanguages();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save language',
            confirmButtonColor: '#ef4444'
        });
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.saveCountryCode = saveCountryCode;
window.saveRtl = saveRtl;
window.saveEnabled = saveEnabled;
window.activateLanguage = activateLanguage;
