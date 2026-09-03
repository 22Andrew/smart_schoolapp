document.addEventListener('DOMContentLoaded', function () {
    const GATEWAYS = [
        { id: 'paypal', label: 'Paypal', tagline: 'Multinational Payment Gateway', url: 'https://www.paypal.com', logo: '<span class="pay-wordmark" style="color:#003087">Pay<span style="color:#009cde">Pal</span></span>', fields: [
            { key: 'username', label: 'Paypal Username' },
            { key: 'password', label: 'Paypal Password', type: 'password' },
            { key: 'signature', label: 'Paypal Signature' }
        ]},
        { id: 'stripe', label: 'Stripe', tagline: 'International Payment Gateway', url: 'https://stripe.com', logo: '<span class="pay-wordmark" style="color:#635bff">Stripe</span>', fields: [
            { key: 'secretKey', label: 'Stripe Secret Key' },
            { key: 'publishableKey', label: 'Stripe Publishable Key' }
        ]},
        { id: 'payu', label: 'PayU', tagline: 'Payment Gateway for India', url: 'https://www.payu.in', logo: '<span class="pay-wordmark" style="color:#00a651">PayU</span>', fields: [
            { key: 'key', label: 'PayU Money Key' },
            { key: 'salt', label: 'PayU Money Salt' }
        ]},
        { id: 'ccavenue', label: 'CCAvenue', tagline: 'Payment Gateway for India', url: 'https://www.ccavenue.com', logo: '<span class="pay-wordmark" style="color:#ed1c24">CCAvenue</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'workingKey', label: 'Working Key' },
            { key: 'accessCode', label: 'Access Code' }
        ]},
        { id: 'instamojo', label: 'InstaMojo', tagline: 'Payment Gateway for India', url: 'https://www.instamojo.com', logo: '<span class="pay-wordmark" style="color:#25a8e0">InstaMojo</span>', fields: [
            { key: 'apiKey', label: 'API Key' },
            { key: 'authToken', label: 'Auth Token' }
        ]},
        { id: 'paystack', label: 'Paystack', tagline: 'Payment Gateway for Africa', url: 'https://paystack.com', logo: '<span class="pay-wordmark" style="color:#011b33">Paystack</span>', fields: [
            { key: 'secretKey', label: 'Paystack Secret Key' }
        ]},
        { id: 'razorpay', label: 'Razorpay', tagline: 'Payment Gateway for India', url: 'https://razorpay.com', logo: '<span class="pay-wordmark" style="color:#072654">Razorpay</span>', fields: [
            { key: 'keyId', label: 'Razorpay Key ID' },
            { key: 'keySecret', label: 'Razorpay Key Secret' }
        ]},
        { id: 'paytm', label: 'Paytm', tagline: 'Payment Gateway for India', url: 'https://paytm.com', logo: '<span class="pay-wordmark" style="color:#00baf2">Paytm</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'merchantKey', label: 'Merchant Key' },
            { key: 'website', label: 'Website' },
            { key: 'industryType', label: 'Industry Type' }
        ]},
        { id: 'midtrans', label: 'Midtrans', tagline: 'Payment Gateway for Indonesia', url: 'https://midtrans.com', logo: '<span class="pay-wordmark" style="color:#0a3d62">Midtrans</span>', fields: [
            { key: 'serverKey', label: 'Server Key' }
        ]},
        { id: 'pesapal', label: 'Pesapal', tagline: 'Payment Gateway for Africa', url: 'https://www.pesapal.com', logo: '<span class="pay-wordmark" style="color:#5cb85c">Pesapal</span>', fields: [
            { key: 'consumerKey', label: 'Consumer Key' },
            { key: 'consumerSecret', label: 'Consumer Secret' }
        ]},
        { id: 'flutterwave', label: 'Flutter Wave', tagline: 'Payment Gateway for Africa', url: 'https://flutterwave.com', logo: '<span class="pay-wordmark" style="color:#f5a623">Flutterwave</span>', fields: [
            { key: 'publicKey', label: 'Public Key' },
            { key: 'secretKey', label: 'Secret Key' }
        ]},
        { id: 'ipayafrica', label: 'iPay Africa', tagline: 'Payment Gateway for Africa', url: 'https://www.ipayafrica.com', logo: '<span class="pay-wordmark" style="color:#1a73e8">iPay Africa</span>', fields: [
            { key: 'vendorId', label: 'Vendor ID' },
            { key: 'hashKey', label: 'Hash Key' }
        ]},
        { id: 'jazzcash', label: 'JazzCash', tagline: 'Payment Gateway for Pakistan', url: 'https://www.jazzcash.com.pk', logo: '<span class="pay-wordmark" style="color:#d52b1e">JazzCash</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'integritySalt', label: 'Integrity Salt' }
        ]},
        { id: 'billplz', label: 'Billplz', tagline: 'Payment Gateway for Malaysia', url: 'https://www.billplz.com', logo: '<span class="pay-wordmark" style="color:#00a651">Billplz</span>', fields: [
            { key: 'apiKey', label: 'API Key' },
            { key: 'customerServiceEmail', label: 'Customer Service Email' }
        ]},
        { id: 'sslcommerz', label: 'SSLCommerz', tagline: 'Payment Gateway for Bangladesh', url: 'https://sslcommerz.com', logo: '<span class="pay-wordmark" style="color:#f7941d">SSLCommerz</span>', fields: [
            { key: 'storeId', label: 'Store ID' },
            { key: 'storePassword', label: 'Store Password', type: 'password' }
        ]},
        { id: 'walkingm', label: 'Walkingm', tagline: 'Payment Gateway', url: 'https://walkingm.com', logo: '<span class="pay-wordmark" style="color:#1e88e5">Walkingm</span>', fields: [
            { key: 'clientId', label: 'Client ID' },
            { key: 'clientSecret', label: 'Client Secret' }
        ]},
        { id: 'mollie', label: 'Mollie', tagline: 'European Payment Gateway', url: 'https://www.mollie.com', logo: '<span class="pay-wordmark" style="color:#000000">mollie</span>', fields: [
            { key: 'apiKey', label: 'API Key' }
        ]},
        { id: 'cashfree', label: 'Cashfree', tagline: 'Payment Gateway for India', url: 'https://www.cashfree.com', logo: '<span class="pay-wordmark" style="color:#ff7a00">Cashfree</span>', fields: [
            { key: 'appId', label: 'App ID' },
            { key: 'secretKey', label: 'Secret Key' }
        ]},
        { id: 'payfast', label: 'Payfast', tagline: 'Payment Gateway for South Africa', url: 'https://www.payfast.co.za', logo: '<span class="pay-wordmark" style="color:#1e88e5">PayFast</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'merchantKey', label: 'Merchant Key' },
            { key: 'passphrase', label: 'Security Passphrase' }
        ]},
        { id: 'toyyibpay', label: 'ToyyibPay', tagline: 'Payment Gateway for Malaysia', url: 'https://toyyibpay.com', logo: '<span class="pay-wordmark" style="color:#00a651">ToyyibPay</span>', fields: [
            { key: 'secretKey', label: 'Secret Key' },
            { key: 'categoryCode', label: 'Category Code' }
        ]},
        { id: 'twocheckout', label: 'Twocheckout', tagline: 'Global Payment Gateway', url: 'https://www.2checkout.com', logo: '<span class="pay-wordmark" style="color:#1a73e8">2Checkout</span>', fields: [
            { key: 'merchantCode', label: 'Merchant Code' },
            { key: 'secretKey', label: 'Secret Key' }
        ]},
        { id: 'skrill', label: 'Skrill', tagline: 'Digital Wallet Payment Gateway', url: 'https://www.skrill.com', logo: '<span class="pay-wordmark" style="color:#862165">Skrill</span>', fields: [
            { key: 'merchantEmail', label: 'Merchant Email' },
            { key: 'secretWord', label: 'Secret Word' }
        ]},
        { id: 'payhere', label: 'Payhere', tagline: 'Payment Gateway for Sri Lanka', url: 'https://www.payhere.lk', logo: '<span class="pay-wordmark" style="color:#00a651">PayHere</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'merchantSecret', label: 'Merchant Secret' }
        ]},
        { id: 'onepay', label: 'Onepay', tagline: 'Payment Gateway for Sri Lanka', url: 'https://onepay.lk', logo: '<span class="pay-wordmark" style="color:#0d6efd">Onepay</span>', fields: [
            { key: 'merchantId', label: 'Merchant ID' },
            { key: 'hashKey', label: 'Hash Key' }
        ]},
        { id: 'dpopay', label: 'DPO Pay', tagline: 'Payment Gateway for Africa', url: 'https://dpogroup.com', logo: '<span class="pay-wordmark" style="color:#0b5cab">DPO Pay</span>', fields: [
            { key: 'companyToken', label: 'Company Token' },
            { key: 'serviceType', label: 'Service Type' }
        ]},
        { id: 'momopay', label: 'MOMO Pay', tagline: 'Mobile Money Payment Gateway', url: 'https://www.mtn.com', logo: '<span class="pay-wordmark" style="color:#ffcc00">MOMO Pay</span>', fields: [
            { key: 'partnerCode', label: 'Partner Code' },
            { key: 'accessKey', label: 'Access Key' },
            { key: 'secretKey', label: 'Secret Key' }
        ]}
    ];

    const tabsEl = document.getElementById('payTabs');
    const fieldsEl = document.getElementById('payFields');
    const brandEl = document.getElementById('payBrand');
    const selectListEl = document.getElementById('paySelectList');
    const form = document.getElementById('payForm');
    const activeForm = document.getElementById('payActiveForm');
    let activeId = 'paypal';
    let selectedGateway = 'none';
    let store = {};

    function gatewayById(id) {
        return GATEWAYS.find(function (item) { return item.id === id; });
    }

    function escapeAttr(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function renderTabs() {
        tabsEl.innerHTML = GATEWAYS.map(function (item) {
            return '<button type="button" class="pay-tab' + (item.id === activeId ? ' active' : '') + '" data-tab="' + item.id + '">' + item.label + '</button>';
        }).join('');
    }

    function renderSelectList() {
        const rows = GATEWAYS.map(function (item) {
            return '<label><input type="radio" name="activeGateway" value="' + item.id + '"'
                + (selectedGateway === item.id ? ' checked' : '') + '> ' + item.label + '</label>';
        }).join('')
            + '<label><input type="radio" name="activeGateway" value="none"'
            + (selectedGateway === 'none' || !selectedGateway ? ' checked' : '') + '> None</label>';
        selectListEl.innerHTML = rows;
    }

    function renderForm() {
        const gateway = gatewayById(activeId);
        const saved = store[activeId] || {};
        const feeType = saved.processingFeeType || 'none';
        fieldsEl.innerHTML = gateway.fields.map(function (field) {
            return '<div class="pay-row"><label for="pay-' + field.key + '">' + field.label
                + ' <span class="required">*</span></label>'
                + '<input type="' + (field.type || 'text') + '" id="pay-' + field.key + '" data-key="' + field.key
                + '" value="' + escapeAttr(saved[field.key]) + '" autocomplete="off"></div>';
        }).join('')
            + '<div class="pay-row"><label>Processing Fees Type</label><div class="pay-radios">'
            + '<label><input type="radio" name="processingFeeType" value="none"' + (feeType === 'none' ? ' checked' : '') + '> None</label>'
            + '<label><input type="radio" name="processingFeeType" value="percentage"' + (feeType === 'percentage' ? ' checked' : '') + '> Percentage (%)</label>'
            + '<label><input type="radio" name="processingFeeType" value="fix"' + (feeType === 'fix' ? ' checked' : '') + '> Fix Amount (\u20B9)</label>'
            + '</div></div>'
            + '<div class="pay-row"><label for="pay-feeAmount">Percentage/Fix Amount</label>'
            + '<input type="text" id="pay-feeAmount" data-key="feeAmount" value="' + escapeAttr(saved.feeAmount) + '" autocomplete="off"></div>';
        brandEl.innerHTML = '<div class="pay-tagline">' + gateway.tagline + '</div>'
            + '<div class="pay-logo">' + gateway.logo + '</div>'
            + '<a class="pay-link" href="' + gateway.url + '" target="_blank" rel="noopener">' + gateway.url + '</a>';
    }

    function collectFields() {
        const fields = {};
        fieldsEl.querySelectorAll('[data-key]').forEach(function (input) {
            fields[input.dataset.key] = input.value.trim();
        });
        const fee = fieldsEl.querySelector('input[name="processingFeeType"]:checked');
        fields.processingFeeType = fee ? fee.value : 'none';
        return fields;
    }

    function stashCurrent() {
        store[activeId] = collectFields();
    }

    tabsEl.addEventListener('click', function (event) {
        const tab = event.target.closest('[data-tab]');
        if (!tab) return;
        stashCurrent();
        activeId = tab.dataset.tab;
        renderTabs();
        renderForm();
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const gateway = gatewayById(activeId);
        const fields = collectFields();
        const missing = gateway.fields.find(function (field) {
            return !fields[field.key];
        });
        if (missing) {
            Swal.fire({ icon: 'warning', title: missing.label + ' is required', confirmButtonColor: '#8b5cf6' });
            return;
        }
        try {
            const response = await fetch('/api/paymentsettings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gateway: activeId, fields: fields })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            if (result.data && result.data.gateways) store = result.data.gateways;
            renderForm();
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    activeForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const selected = activeForm.querySelector('input[name="activeGateway"]:checked');
        const active = selected ? selected.value : 'none';
        try {
            const response = await fetch('/api/paymentsettings/active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: active })
            });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Save failed');
            selectedGateway = (result.data && result.data.active) || active;
            renderSelectList();
            Swal.fire({ icon: 'success', title: 'Saved!', text: result.message, timer: 1400, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#8b5cf6' });
        }
    });

    fetch('/api/paymentsettings')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            store = data.gateways || {};
            selectedGateway = data.active || 'none';
            renderTabs();
            renderForm();
            renderSelectList();
        })
        .catch(function () {
            renderTabs();
            renderForm();
            renderSelectList();
        });
});
