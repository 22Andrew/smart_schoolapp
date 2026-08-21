let currencies = [];

document.addEventListener('DOMContentLoaded', loadCurrencies);

async function loadCurrencies() {
    try {
        const response = await fetch('/api/currencies');
        if (!response.ok) throw new Error('Failed to load currencies');
        currencies = await response.json();
        renderTable();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load currencies',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderTable() {
    const tbody = document.getElementById('currencyTableBody');
    if (!tbody) return;

    if (!currencies.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No currencies found</td></tr>';
        return;
    }

    tbody.innerHTML = currencies.map((row, index) => {
        const radios = row.isEnabled ? `
            <td>
                <input type="radio" name="baseCurrency" ${row.isBase ? 'checked' : ''} onchange="setBaseCurrency(${row.id})">
                ${row.isBase ? '<span class="status-badge">Base</span>' : ''}
            </td>
            <td>
                <input type="radio" name="activeCurrency" ${row.isCurrent ? 'checked' : ''} onchange="setActiveCurrency(${row.id})">
                ${row.isCurrent ? '<span class="status-badge">Active</span>' : ''}
            </td>
        ` : '<td></td><td></td>';

        return `
            <tr>
                <td>${index + 1}.</td>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.shortCode)}</td>
                <td>
                    <input type="text" class="currency-input" value="${escapeHtml(row.symbol)}"
                           onblur="saveSymbol(${row.id}, this.value)">
                </td>
                <td>
                    <input type="text" class="currency-input rate" value="${escapeHtml(row.conversionRate)}"
                           onblur="saveRate(${row.id}, this.value)">
                </td>
                ${radios}
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${row.isEnabled ? 'checked' : ''} onchange="saveEnabled(${row.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveSymbol(id, value) {
    await patchCurrency(id, { symbol: value.trim() });
}

async function saveRate(id, value) {
    const ok = await patchCurrency(id, { conversionRate: value.trim() });
    if (!ok) loadCurrencies();
}

async function saveEnabled(id, isEnabled) {
    const ok = await patchCurrency(id, { isEnabled });
    if (!ok) loadCurrencies();
}

async function setBaseCurrency(id) {
    try {
        const response = await fetch(`/api/currencies/${id}/base`, { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await loadCurrencies();
        if (window.refreshActiveCurrency) {
            await window.refreshActiveCurrency(true);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save base currency',
            confirmButtonColor: '#ef4444'
        });
        loadCurrencies();
    }
}

async function setActiveCurrency(id) {
    try {
        const response = await fetch(`/api/currencies/${id}/activate`, { method: 'POST' });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await loadCurrencies();
        if (window.refreshActiveCurrency) {
            await window.refreshActiveCurrency(true);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save active currency',
            confirmButtonColor: '#ef4444'
        });
        loadCurrencies();
    }
}

async function patchCurrency(id, payload) {
    try {
        const response = await fetch(`/api/currencies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        await loadCurrencies();
        if (window.refreshActiveCurrency) {
            await window.refreshActiveCurrency(true);
        }
        return true;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save currency',
            confirmButtonColor: '#ef4444'
        });
        return false;
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.saveSymbol = saveSymbol;
window.saveRate = saveRate;
window.saveEnabled = saveEnabled;
window.setBaseCurrency = setBaseCurrency;
window.setActiveCurrency = setActiveCurrency;
