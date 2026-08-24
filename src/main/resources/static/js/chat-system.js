document.addEventListener('DOMContentLoaded', function () {
    const contactList = document.getElementById('chatContactList');
    const chatMessages = document.getElementById('chatMessages');
    const chatHeaderCenter = document.getElementById('chatHeaderCenter');
    const chatComposeForm = document.getElementById('chatComposeForm');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const addContactModal = document.getElementById('addContactModal');
    const closeAddContactModal = document.getElementById('closeAddContactModal');
    const addContactSearch = document.getElementById('addContactSearch');
    const addContactSpinner = document.getElementById('addContactSpinner');
    const addContactResults = document.getElementById('addContactResults');
    const addContactBtn = document.getElementById('addContactBtn');

    let contacts = [];
    let activeContact = null;
    let messages = [];
    let searchResults = [];
    let selectedSearchContact = null;
    let searchTimer = null;
    let searchRequestId = 0;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Something went wrong.',
            confirmButtonColor: '#8b5cf6'
        });
    }

    function contactKey(contact) {
        return contact.contactType + ':' + contact.contactSourceId;
    }

    function renderHeader(contact) {
        if (!chatHeaderCenter) return;
        if (!contact) {
            chatHeaderCenter.innerHTML = ''
                + '<div class="chat-header-avatar no-image">NO IMAGE</div>'
                + '<span class="chat-header-text">Select Any User To Start Your Chat</span>';
            return;
        }
        chatHeaderCenter.innerHTML = ''
            + '<img class="chat-header-avatar" src="' + escapeHtml(contact.avatarUrl) + '" alt="">'
            + '<span class="chat-header-text">' + escapeHtml(contact.name) + ' (' + escapeHtml(contact.roleLabel) + ')</span>';
    }

    function renderContacts() {
        if (!contactList) return;
        if (!contacts.length) {
            contactList.innerHTML = '<div class="chat-empty-state"><p>No users available for chat.</p></div>';
            return;
        }

        contactList.innerHTML = contacts.map(function (contact) {
            const active = activeContact && contactKey(activeContact) === contactKey(contact);
            return ''
                + '<button type="button" class="chat-contact-item' + (active ? ' active' : '') + '"'
                + ' data-type="' + escapeHtml(contact.contactType) + '"'
                + ' data-id="' + escapeHtml(String(contact.contactSourceId)) + '">'
                + renderAvatarHtml(contact, 'chat-contact-avatar')
                + '<div class="chat-contact-body">'
                + '<p class="chat-contact-name">' + escapeHtml(contact.name) + ' (' + escapeHtml(contact.roleLabel) + ')</p>'
                + '<p class="chat-contact-preview">' + escapeHtml(contact.lastMessage || '') + '</p>'
                + '</div></button>';
        }).join('');

        contactList.querySelectorAll('.chat-contact-item').forEach(function (button) {
            button.addEventListener('click', function () {
                const type = button.getAttribute('data-type');
                const id = parseInt(button.getAttribute('data-id'), 10);
                const contact = contacts.find(function (item) {
                    return item.contactType === type && String(item.contactSourceId) === String(id);
                });
                if (contact) {
                    selectContact(contact);
                }
            });
        });
    }

    function renderMessages() {
        if (!chatMessages) return;
        if (!activeContact) {
            chatMessages.innerHTML = ''
                + '<div class="chat-empty-state">'
                + '<div class="chat-empty-avatar no-image">NO IMAGE</div>'
                + '<p>Select a user from the list to view the conversation.</p>'
                + '</div>';
            return;
        }

        if (!messages.length) {
            chatMessages.innerHTML = ''
                + '<div class="chat-empty-state">'
                + '<img class="chat-empty-avatar" src="' + escapeHtml(activeContact.avatarUrl) + '" alt="">'
                + '<p>Start your conversation with ' + escapeHtml(activeContact.name) + '.</p>'
                + '</div>';
            return;
        }

        let html = ''
            + '<div class="chat-connected-banner">'
            + '<span>You Are Now Connected On Chat</span>'
            + '</div>';

        html += messages.map(function (message) {
            const ownerClass = message.sentByOwner ? ' owner' : '';
            const deleteBtn = message.sentByOwner
                ? '<button type="button" class="chat-message-delete" data-id="' + escapeHtml(String(message.id)) + '" title="Delete message">&times;</button>'
                : '';
            return ''
                + '<div class="chat-message-row' + ownerClass + '">'
                + '<div class="chat-message-wrap">'
                + '<div class="chat-message-bubble">'
                + '<div class="chat-message-content">'
                + '<span class="chat-message-text">' + escapeHtml(message.message) + '</span>'
                + deleteBtn
                + '</div></div>'
                + '<div class="chat-message-time-outside">' + escapeHtml(message.sentAt || '') + '</div>'
                + '</div></div>';
        }).join('');

        chatMessages.innerHTML = html;

        chatMessages.querySelectorAll('.chat-message-delete').forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                const messageId = parseInt(button.getAttribute('data-id'), 10);
                deleteMessage(messageId).catch(function (error) {
                    showError(error.message);
                });
            });
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateContactPreview() {
        if (!activeContact) return;
        const last = messages.length ? messages[messages.length - 1] : null;
        activeContact.lastMessage = last
            ? (last.message.length > 42 ? last.message.substring(0, 42) + '...' : last.message)
            : '';
        renderContacts();
    }

    async function deleteMessage(messageId) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete Message?',
            text: 'This message will be permanently removed.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#e53e3e'
        });
        if (!result.isConfirmed) return;

        const response = await fetch('/api/chat/messages/' + messageId, { method: 'DELETE' });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || 'Failed to delete message');
        }

        messages = messages.filter(function (item) {
            return String(item.id) !== String(messageId);
        });
        updateContactPreview();
        renderMessages();
    }

    function setComposeEnabled(enabled) {
        if (chatMessageInput) chatMessageInput.disabled = !enabled;
        if (chatSendBtn) chatSendBtn.disabled = !enabled;
    }

    async function loadContacts() {
        const response = await fetch('/api/chat/contacts');
        if (!response.ok) {
            throw new Error('Failed to load chat contacts');
        }
        contacts = await response.json();
        renderContacts();
    }

    async function loadMessages() {
        if (!activeContact) return;
        const params = new URLSearchParams();
        params.set('contactType', activeContact.contactType);
        params.set('contactSourceId', String(activeContact.contactSourceId));
        const response = await fetch('/api/chat/messages?' + params.toString());
        if (!response.ok) {
            throw new Error('Failed to load chat messages');
        }
        messages = await response.json();
        renderMessages();
    }

    async function selectContact(contact) {
        activeContact = contact;
        renderHeader(contact);
        renderContacts();
        setComposeEnabled(true);
        if (chatMessageInput) chatMessageInput.value = '';
        await loadMessages();
    }

    async function sendMessage(text) {
        if (!activeContact || !text.trim()) return;
        const payload = {
            contactType: activeContact.contactType,
            contactSourceId: activeContact.contactSourceId,
            contactName: activeContact.name,
            contactRole: activeContact.roleLabel,
            message: text.trim()
        };
        const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to send message');
        }
        messages.push(result.data);
        activeContact.lastMessage = text.trim().length > 42 ? text.trim().substring(0, 42) + '...' : text.trim();
        renderContacts();
        renderMessages();
    }

    function renderAvatarHtml(contact, className) {
        if (contact.hasPhoto === false || !contact.avatarUrl) {
            return '<div class="' + className + ' no-image">NO IMAGE</div>';
        }
        return '<img class="' + className + '" src="' + escapeHtml(contact.avatarUrl) + '" alt="">';
    }

    function setSearchLoading(loading) {
        if (!addContactSpinner) return;
        addContactSpinner.hidden = !loading;
    }

    function renderSearchResults() {
        if (!addContactResults) return;
        if (!addContactSearch || !addContactSearch.value.trim()) {
            addContactResults.innerHTML = '';
            return;
        }
        if (!searchResults.length) {
            addContactResults.innerHTML = '<div class="chat-modal-empty">No users found.</div>';
            return;
        }

        addContactResults.innerHTML = searchResults.map(function (contact) {
            const selected = selectedSearchContact
                && contactKey(selectedSearchContact) === contactKey(contact);
            return ''
                + '<button type="button" class="chat-modal-result' + (selected ? ' selected' : '') + '"'
                + ' data-type="' + escapeHtml(contact.contactType) + '"'
                + ' data-id="' + escapeHtml(String(contact.contactSourceId)) + '">'
                + renderAvatarHtml(contact, 'chat-modal-avatar')
                + '<div>'
                + '<p class="chat-modal-result-name">' + escapeHtml(contact.name) + '</p>'
                + '<p class="chat-modal-result-role">(' + escapeHtml(contact.roleLabel) + ')</p>'
                + '</div></button>';
        }).join('');

        addContactResults.querySelectorAll('.chat-modal-result').forEach(function (button) {
            button.addEventListener('click', function () {
                const type = button.getAttribute('data-type');
                const id = parseInt(button.getAttribute('data-id'), 10);
                selectedSearchContact = searchResults.find(function (item) {
                    return item.contactType === type && String(item.contactSourceId) === String(id);
                }) || null;
                if (addContactBtn) addContactBtn.disabled = !selectedSearchContact;
                renderSearchResults();
            });
        });
    }

    async function performSearch(query) {
        const requestId = ++searchRequestId;
        setSearchLoading(true);
        try {
            const response = await fetch('/api/chat/search?q=' + encodeURIComponent(query));
            if (!response.ok) {
                throw new Error('Failed to search users');
            }
            const results = await response.json();
            if (requestId !== searchRequestId) return;
            searchResults = results;
            if (selectedSearchContact) {
                const stillExists = searchResults.some(function (item) {
                    return contactKey(item) === contactKey(selectedSearchContact);
                });
                if (!stillExists) {
                    selectedSearchContact = null;
                    if (addContactBtn) addContactBtn.disabled = true;
                }
            }
            renderSearchResults();
        } catch (error) {
            if (requestId === searchRequestId) {
                searchResults = [];
                addContactResults.innerHTML = '<div class="chat-modal-empty">' + escapeHtml(error.message) + '</div>';
            }
        } finally {
            if (requestId === searchRequestId) {
                setSearchLoading(false);
            }
        }
    }

    function handleSearchInput() {
        const query = addContactSearch ? addContactSearch.value.trim() : '';
        if (searchTimer) {
            clearTimeout(searchTimer);
            searchTimer = null;
        }

        if (!query) {
            searchRequestId += 1;
            searchResults = [];
            selectedSearchContact = null;
            if (addContactBtn) addContactBtn.disabled = true;
            setSearchLoading(false);
            renderSearchResults();
            return;
        }

        setSearchLoading(true);
        searchTimer = setTimeout(function () {
            performSearch(query);
        }, 300);
    }

    function openAddContactModal() {
        if (!addContactModal) return;
        addContactModal.hidden = false;
        searchResults = [];
        selectedSearchContact = null;
        if (addContactSearch) addContactSearch.value = '';
        if (addContactBtn) addContactBtn.disabled = true;
        setSearchLoading(false);
        renderSearchResults();
        if (addContactSearch) addContactSearch.focus();
    }

    function closeAddContactModalFn() {
        if (!addContactModal) return;
        addContactModal.hidden = true;
        searchRequestId += 1;
        if (searchTimer) {
            clearTimeout(searchTimer);
            searchTimer = null;
        }
        setSearchLoading(false);
    }

    function addSelectedContact() {
        if (!selectedSearchContact) return;
        const selected = selectedSearchContact;
        const existing = contacts.find(function (item) {
            return contactKey(item) === contactKey(selected);
        });
        if (!existing) {
            contacts.unshift({
                contactType: selected.contactType,
                contactSourceId: selected.contactSourceId,
                name: selected.name,
                roleLabel: selected.roleLabel,
                avatarUrl: selected.avatarUrl,
                hasPhoto: selected.hasPhoto,
                lastMessage: ''
            });
            renderContacts();
        }
        closeAddContactModalFn();
        selectContact(existing || selected).catch(function (error) {
            showError(error.message);
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', openAddContactModal);
    }

    if (closeAddContactModal) {
        closeAddContactModal.addEventListener('click', closeAddContactModalFn);
    }

    if (addContactModal) {
        addContactModal.addEventListener('click', function (event) {
            if (event.target === addContactModal) {
                closeAddContactModalFn();
            }
        });
    }

    if (addContactSearch) {
        addContactSearch.addEventListener('input', handleSearchInput);
    }

    if (addContactBtn) {
        addContactBtn.addEventListener('click', addSelectedContact);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && addContactModal && !addContactModal.hidden) {
            closeAddContactModalFn();
        }
    });

    if (chatComposeForm) {
        chatComposeForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const text = chatMessageInput ? chatMessageInput.value : '';
            sendMessage(text).then(function () {
                if (chatMessageInput) chatMessageInput.value = '';
            }).catch(function (error) {
                showError(error.message);
            });
        });
    }

    renderHeader(null);
    setComposeEnabled(false);
    loadContacts().catch(function (error) {
        showError(error.message);
    });
});
