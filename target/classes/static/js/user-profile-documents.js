(function () {
    'use strict';

    (function ensureDocumentsStylesheet() {
        if (document.getElementById('user-profile-documents-css')) {
            return;
        }
        var link = document.createElement('link');
        link.id = 'user-profile-documents-css';
        link.rel = 'stylesheet';
        link.href = '/css/user-profile-documents.css';
        document.head.appendChild(link);
    })();

    var documentsLoaded = false;
    var studentDocuments = [];
    var googleDriveConfig = null;
    var googleApiLoading = false;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function downloadIconSvg() {
        return ''
            + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>'
            + '<polyline points="7 10 12 15 17 10"></polyline>'
            + '<line x1="12" y1="15" x2="12" y2="3"></line>'
            + '</svg>';
    }

    function renderDocumentsTable() {
        var body = document.getElementById('profileDocumentsBody');
        if (!body) {
            return;
        }

        if (!studentDocuments.length) {
            body.innerHTML = '<div class="sp-documents-empty">No Record Found</div>';
            return;
        }

        body.innerHTML = studentDocuments.map(function (doc) {
            var downloadUrl = doc.downloadUrl || ('/api/user/user/documents/' + doc.id + '/download');
            return ''
                + '<div class="sp-documents-row sp-documents-data-row" data-document-id="' + escapeHtml(String(doc.id)) + '">'
                + '<div class="sp-documents-cell sp-documents-cell-title">' + escapeHtml(doc.title || 'Document') + '</div>'
                + '<div class="sp-documents-cell sp-documents-cell-filename">' + escapeHtml(doc.fileName || '') + '</div>'
                + '<div class="sp-documents-cell sp-documents-cell-action">'
                + '<div class="sp-documents-actions">'
                + '<a class="sp-doc-download-btn" title="Download" href="' + escapeHtml(downloadUrl) + '" download>'
                + downloadIconSvg()
                + '</a>'
                + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function ensureGoogleApiLoaded() {
        if (window.gapi && window.google && window.google.picker) {
            return Promise.resolve();
        }
        if (googleApiLoading) {
            return new Promise(function (resolve) {
                var timer = setInterval(function () {
                    if (window.gapi && window.google && window.google.picker) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        }

        googleApiLoading = true;
        return loadScript('https://apis.google.com/js/api.js')
            .then(function () {
                return new Promise(function (resolve, reject) {
                    window.gapi.load('client:auth2:picker', {
                        callback: resolve,
                        onerror: reject
                    });
                });
            });
    }

    function openGooglePicker(accessToken) {
        if (!window.google || !window.google.picker || !googleDriveConfig) {
            throw new Error('Google Drive picker is not available');
        }

        var view = new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setIncludeFolders(false)
            .setSelectFolderEnabled(false);

        var picker = new google.picker.PickerBuilder()
            .setAppId(googleDriveConfig.projectNumberAppId || undefined)
            .setDeveloperKey(googleDriveConfig.apiKey)
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback(handleGooglePickerSelection)
            .setTitle('Select a document from Google Drive')
            .build();

        picker.setVisible(true);
    }

    function handleGooglePickerSelection(data) {
        if (!data || data.action !== google.picker.Action.PICKED || !data.docs || !data.docs.length) {
            return;
        }

        var file = data.docs[0];
        fetch('/api/user/user/documents/google-drive', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: file.id,
                fileName: file.name || file.id,
                title: (file.name || '').replace(/\.[^/.]+$/, '') || file.name,
                url: file.url || file.embedUrl || '',
                mimeType: file.mimeType || '',
                fileSize: file.sizeBytes || null
            })
        })
            .then(function (response) {
                return response.json().then(function (payload) {
                    if (!response.ok) {
                        throw new Error((payload && payload.message) || 'Failed to save Google Drive document');
                    }
                    return payload;
                });
            })
            .then(function (savedDoc) {
                studentDocuments.unshift(savedDoc);
                renderDocumentsTable();
            })
            .catch(function (error) {
                window.alert(error.message || 'Failed to upload document from Google Drive.');
            });
    }

    function fetchGoogleDriveConfig() {
        return fetch('/api/user/user/documents/google-drive-config', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load Google Drive settings');
                }
                return response.json();
            })
            .then(function (config) {
                googleDriveConfig = config || null;
                return googleDriveConfig;
            });
    }

    function getAuthInstance() {
        if (!window.gapi || !window.gapi.auth2) {
            return null;
        }
        try {
            return window.gapi.auth2.getAuthInstance();
        } catch (error) {
            return null;
        }
    }

    function uploadThroughGoogleDrive() {
        fetchGoogleDriveConfig()
            .then(function (config) {
                if (!config || !config.enabled) {
                    throw new Error('Google Drive upload is not enabled. Please contact the school administrator.');
                }
                return ensureGoogleApiLoaded();
            })
            .then(function () {
                var authInstance = getAuthInstance();
                if (!authInstance) {
                    return window.gapi.client.init({
                        apiKey: googleDriveConfig.apiKey,
                        clientId: googleDriveConfig.clientId,
                        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file'
                    });
                }
                return Promise.resolve();
            })
            .then(function () {
                var authInstance = getAuthInstance();
                if (!authInstance) {
                    throw new Error('Google sign-in is not available');
                }
                if (!authInstance.isSignedIn.get()) {
                    return authInstance.signIn({ prompt: 'select_account' });
                }
                return Promise.resolve();
            })
            .then(function () {
                var authInstance = getAuthInstance();
                if (!authInstance) {
                    throw new Error('Google sign-in is not available');
                }
                var accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
                if (!accessToken) {
                    throw new Error('Unable to authenticate with Google Drive');
                }
                openGooglePicker(accessToken);
            })
            .catch(function (error) {
                window.alert(error.message || 'Unable to open Google Drive picker.');
            });
    }

    function uploadLocalFiles(fileList) {
        var files = Array.prototype.slice.call(fileList || []);
        if (!files.length) {
            return;
        }

        var uploads = files.map(function (file) {
            var formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, '') || file.name);
            return fetch('/api/user/user/documents/upload', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            }).then(function (response) {
                return response.json().then(function (payload) {
                    if (!response.ok) {
                        throw new Error((payload && payload.message) || 'Failed to upload document');
                    }
                    return payload;
                });
            });
        });

        Promise.all(uploads)
            .then(function (savedDocs) {
                savedDocs.reverse().forEach(function (doc) {
                    studentDocuments.unshift(doc);
                });
                renderDocumentsTable();
            })
            .catch(function (error) {
                window.alert(error.message || 'Failed to upload document.');
            });
    }

    function bindDocumentControls() {
        var uploadBtn = document.getElementById('profileUploadDocumentsBtn');
        var fileInput = document.getElementById('profileDocumentFileInput');
        if (uploadBtn && fileInput && !uploadBtn.dataset.bound) {
            uploadBtn.dataset.bound = '1';
            uploadBtn.addEventListener('click', function () {
                fileInput.click();
            });
            fileInput.addEventListener('change', function () {
                uploadLocalFiles(fileInput.files);
                fileInput.value = '';
            });
        }

        var googleBtn = document.getElementById('profileUploadGoogleDriveBtn');
        if (googleBtn && !googleBtn.dataset.bound) {
            googleBtn.dataset.bound = '1';
            googleBtn.addEventListener('click', uploadThroughGoogleDrive);
        }
    }

    function loadDocuments(force) {
        if (documentsLoaded && !force) {
            return;
        }
        documentsLoaded = true;

        var body = document.getElementById('profileDocumentsBody');
        if (body) {
            body.innerHTML = '<div class="sp-documents-empty">Loading...</div>';
        }

        fetch('/api/user/user/documents', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load documents');
                }
                return response.json();
            })
            .then(function (data) {
                studentDocuments = (data && data.documents) || [];
                googleDriveConfig = (data && data.googleDrive) || null;
                bindDocumentControls();
                renderDocumentsTable();
            })
            .catch(function () {
                studentDocuments = [];
                renderDocumentsTable();
            });
    }

    function initDocumentsTabLoader() {
        bindDocumentControls();
        var documentsTab = document.querySelector('.sp-tab[data-profile-tab="documents"]');
        if (documentsTab) {
            documentsTab.addEventListener('click', function () {
                loadDocuments(true);
            });
        }
        var documentsPanel = document.querySelector('.sp-tab-content[data-profile-panel="documents"]');
        if (documentsPanel && documentsPanel.classList.contains('active')) {
            loadDocuments();
        }
    }

    document.addEventListener('DOMContentLoaded', initDocumentsTabLoader);
})();
