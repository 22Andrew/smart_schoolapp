document.addEventListener('DOMContentLoaded', function () {
    const GATEWAYS = [
        {
            id: 'clickatell',
            label: 'Clickatell Sms Gateway',
            url: 'https://www.clickatell.com',
            fields: [
                { key: 'username', label: 'Clickatell Username' },
                { key: 'password', label: 'Clickatell Password' },
                { key: 'apiKey', label: 'API Key' }
            ],
            logo: '<svg width="54" height="36" viewBox="0 0 54 36" fill="none"><circle cx="16" cy="18" r="12" fill="#7ac143"/><circle cx="30" cy="18" r="12" fill="#00a4e4"/></svg><span>Clickatell</span>'
        },
        {
            id: 'twilio',
            label: 'Twilio SMS Gateway',
            url: 'https://www.twilio.com',
            fields: [
                { key: 'sid', label: 'SID' },
                { key: 'token', label: 'Token' },
                { key: 'senderNumber', label: 'Sender Number' }
            ],
            logo: '/images/sms/twilio.png'
        },
        {
            id: 'msg91',
            label: 'MSG91',
            url: 'https://msg91.com',
            fields: [
                { key: 'authKey', label: 'Auth Key' },
                { key: 'senderId', label: 'Sender ID' }
            ],
            logo: '/images/sms/msg91.png'
        },
        {
            id: 'textlocal',
            label: 'Text Local',
            url: 'https://www.textlocal.in',
            fields: [
                { key: 'username', label: 'Username' },
                { key: 'hash', label: 'Hash Key' },
                { key: 'senderId', label: 'Sender ID' }
            ],
            logo: '/images/sms/textlocal.png'
        },
        {
            id: 'smscountry',
            label: 'SMS Country',
            url: 'https://www.smscountry.com',
            fields: [
                { key: 'username', label: 'Username' },
                { key: 'authKey', label: 'Auth Key' },
                { key: 'authToken', label: 'Authentication Token' },
                { key: 'senderId', label: 'Sender ID' },
                { key: 'password', label: 'Password', type: 'password' }
            ],
            logo: '/images/sms/smscountry.png'
        },
        {
            id: 'bulksms',
            label: 'Bulk SMS',
            url: 'https://www.bulksms.com',
            fields: [
                { key: 'username', label: 'Username' },
                { key: 'password', label: 'Password' }
            ],
            logo: '/images/sms/bulksms.png'
        },
        {
            id: 'mobireach',
            label: 'Mobi Reach',
            url: 'https://mobireach.com.bd',
            fields: [
                { key: 'authKey', label: 'Auth Key' },
                { key: 'senderId', label: 'Sender ID' },
                { key: 'routeId', label: 'Route ID' }
            ],
            logo: '/images/sms/mobireach.png'
        },
        {
            id: 'nexmo',
            label: 'Nexmo',
            url: 'https://www.nexmo.com',
            fields: [
                { key: 'apiKey', label: 'Nexmo API Key' },
                { key: 'apiSecret', label: 'Nexmo API Secret' },
                { key: 'from', label: 'Registered Phone Number' }
            ],
            logo: '/images/sms/nexmo.png'
        },
        {
            id: 'africastalking',
            label: 'AfricasTalking',
            url: 'https://africastalking.com',
            fields: [
                { key: 'username', label: 'Username' },
                { key: 'apiKey', label: 'API Key' },
                { key: 'from', label: 'Short Code / Sender ID' }
            ],
            logo: '/images/sms/africastalking.png'
        },
        {
            id: 'smsegypt',
            label: 'SMS Egypt',
            url: 'https://smsegypt.net',
            fields: [
                { key: 'username', label: 'Username' },
                { key: 'password', label: 'Password' },
                { key: 'senderId', label: 'Sender ID' },
                { key: 'type', label: 'Type', type: 'select', options: [
                    { value: '', label: 'Select' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'unicode', label: 'Unicode' }
                ] }
            ],
            logo: '/images/sms/smsegypt.png'
        },
        {
            id: 'smsgatewayhub',
            label: 'SMS Gateway Hub',
            url: 'https://www.smsgatewayhub.com',
            fields: [
                { key: 'apiKey', label: 'API Key' },
                { key: 'senderId', label: 'Sender ID' },
                { key: 'entityId', label: 'Entity ID' }
            ],
            logo: '/images/sms/smsgatewayhub.png'
        },
        {
            id: 'custom',
            label: 'Custom SMS Gateway',
            url: '',
            fields: [
                { key: 'gatewayName', label: 'Gateway Name' },
                { key: 'apiUrl', label: 'API URL ({phone}, {message}, {sender})' },
                { key: 'senderId', label: 'Sender ID' },
                { key: 'apiMethod', label: 'HTTP Method', type: 'select', options: [
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' }
                ] }
            ],
            logo: '/images/sms/custom.png'
        }
    ];

    const tabsEl = document.getElementById('smsTabs');
    const fieldsEl = document.getElementById('smsFields');
    const brandEl = document.getElementById('smsBrand');
    const form = document.getElementById('smsForm');
    let activeId = 'clickatell';
    let store = {};

    function gatewayById(id) {
        return GATEWAYS.find(function (item) { return item.id === id; });
    }

    function renderTabs() {
        tabsEl.innerHTML = GATEWAYS.map(function (item) {
            return '<button type="button" class="sms-tab' + (item.id === activeId ? ' active' : '') + '" data-tab="' + item.id + '">' + item.label + '</button>';
        }).join('');
    }

    function renderForm() {
        const gateway = gatewayById(activeId);
        const saved = store[activeId] || {};
        fieldsEl.innerHTML = gateway.fields.map(function (field) {
            var control;
            if (field.type === 'select') {
                var options = (field.options || []).map(function (option) {
                    return '<option value="' + escapeAttr(option.value) + '">' + option.label + '</option>';
                }).join('');
                control = '<select id="sms-' + field.key + '" data-key="' + field.key + '">' + options + '</select>';
            } else {
                control = '<input type="' + (field.type || 'text') + '" id="sms-' + field.key + '" data-key="' + field.key + '" value="' + escapeAttr(saved[field.key]) + '" autocomplete="off">';
            }
            return '<div class="sms-row"><label for="sms-' + field.key + '">' + field.label + ' <span class="required">*</span></label>' + control + '</div>';
        }).join('') + '<div class="sms-row"><label for="sms-status">Status <span class="required">*</span></label>'
            + '<select id="sms-status"><option value="">Select</option><option value="Enabled">Enabled</option><option value="Disabled">Disabled</option></select></div>';
        gateway.fields.forEach(function (field) {
            if (field.type === 'select') {
                document.getElementById('sms-' + field.key).value = saved[field.key] || '';
            }
        });
        document.getElementById('sms-status').value = saved.status || '';
        var logoHtml = gateway.logo && gateway.logo.indexOf('/images/') === 0
            ? '<img src="' + gateway.logo + '" alt="' + gateway.label + '">'
            : gateway.logo;
        brandEl.innerHTML = '<div class="sms-logo">' + logoHtml + '</div>'
            + (gateway.url ? '<a class="sms-link" href="' + gateway.url + '" target="_blank" rel="noopener">' + gateway.url + '</a>' : '');
    }

    function escapeAttr(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function collectFields() {
        const fields = {};
        fieldsEl.querySelectorAll('[data-key]').forEach(function (input) {
            fields[input.dataset.key] = input.value.trim();
        });
        return fields;
    }

    tabsEl.addEventListener('click', function (event) {
        const tab = event.target.closest('[data-tab]');
        if (!tab) return;
        store[activeId] = Object.assign({}, collectFields(), { status: document.getElementById('sms-status').value });
        activeId = tab.dataset.tab;
        renderTabs();
        renderForm();
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const status = document.getElementById('sms-status').value;
        const fields = collectFields();
        if (!status) {
            Swal.fire({ icon: 'warning', title: 'Status is required', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const response = await fetch('/api/smsconfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gateway: activeId, status: status, fields: fields })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            if (result.data && result.data.gateways) store = result.data.gateways;
            renderTabs();
            renderForm();
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/smsconfig')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            store = data.gateways || {};
            activeId = data.active || 'clickatell';
            renderTabs();
            renderForm();
        })
        .catch(function () {
            renderTabs();
            renderForm();
        });
});
