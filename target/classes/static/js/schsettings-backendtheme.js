let themeSettings = {
    themeMode: 'dark',
    skin: 'shadow',
    sideMenuStyle: 'default',
    primaryColor: '#8b5cf6',
    boxContent: 'wide'
};

document.addEventListener('DOMContentLoaded', function() {
    setupThemeForm();
    loadThemeSettings();
});

function setupThemeForm() {
    document.querySelectorAll('.theme-option-group').forEach(function(group) {
        const field = group.dataset.field;
        group.querySelectorAll('.theme-option-btn').forEach(function(button) {
            button.addEventListener('click', function() {
                group.querySelectorAll('.theme-option-btn').forEach(function(item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                themeSettings[field] = button.dataset.value;
                previewTheme();
            });
        });
    });

    document.querySelectorAll('.color-swatch').forEach(function(swatch) {
        swatch.addEventListener('click', function() {
            selectPrimaryColor(swatch.dataset.color);
        });
    });

    document.getElementById('customPrimaryColor')?.addEventListener('input', function(event) {
        selectPrimaryColor(event.target.value);
    });

    document.getElementById('backendThemeForm')?.addEventListener('submit', handleSave);
}

function previewTheme() {
    if (window.applyBackendTheme) {
        window.applyBackendTheme(false, { ...themeSettings });
    }
}

async function loadThemeSettings() {
    try {
        const response = await fetch('/api/schsettings/backend-theme');
        if (!response.ok) throw new Error('Failed to load backend theme settings');
        const data = await response.json();
        themeSettings = {
            themeMode: data.themeMode || 'dark',
            skin: data.skin || 'shadow',
            sideMenuStyle: data.sideMenuStyle || 'default',
            primaryColor: data.primaryColor || '#8b5cf6',
            boxContent: data.boxContent || 'wide'
        };
        renderThemeSettings(data);
        previewTheme();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load backend theme settings',
            confirmButtonColor: '#ef4444'
        });
    }
}

function renderThemeSettings(data) {
    setActiveOption('themeMode', data.themeMode);
    setActiveOption('skin', data.skin);
    setActiveOption('sideMenuStyle', data.sideMenuStyle);
    setActiveOption('boxContent', data.boxContent);
    selectPrimaryColor(data.primaryColor || '#8b5cf6', false);

    const customColor = document.getElementById('customPrimaryColor');
    if (customColor) {
        customColor.value = data.primaryColor || '#8b5cf6';
    }
}

function setActiveOption(field, value) {
    const group = document.querySelector(`.theme-option-group[data-field="${field}"]`);
    if (!group) return;

    group.querySelectorAll('.theme-option-btn').forEach(function(button) {
        button.classList.toggle('active', button.dataset.value === value);
    });
}

function selectPrimaryColor(color, updateCustomInput) {
    if (!color) return;

    themeSettings.primaryColor = color;
    document.querySelectorAll('.color-swatch').forEach(function(swatch) {
        swatch.classList.toggle('active', swatch.dataset.color.toLowerCase() === color.toLowerCase());
    });

    if (updateCustomInput !== false) {
        const customColor = document.getElementById('customPrimaryColor');
        if (customColor) {
            customColor.value = color;
        }
    }

    previewTheme();
}

async function handleSave(event) {
    event.preventDefault();

    try {
        const response = await fetch('/api/schsettings/backend-theme', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(themeSettings)
        });
        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: result.message,
                confirmButtonColor: '#10b981',
                timer: 2500,
                timerProgressBar: true
            });
            if (window.applyBackendTheme) {
                window.applyBackendTheme(true);
            }
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save backend theme',
            confirmButtonColor: '#ef4444'
        });
    }
}
