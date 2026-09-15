(function () {
    function applyCount(badge, count) {
        const unread = Number(count) || 0;
        if (unread <= 0) {
            badge.textContent = '';
            badge.classList.add('is-empty');
            badge.setAttribute('hidden', 'hidden');
            badge.setAttribute('aria-hidden', 'true');
            return;
        }
        badge.textContent = unread > 99 ? '99+' : String(unread);
        badge.classList.remove('is-empty');
        badge.removeAttribute('hidden');
        badge.setAttribute('aria-hidden', 'false');
    }

    function readWatermarks() {
        try {
            return JSON.parse(localStorage.getItem('chatReadAt') || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    async function fallbackUnreadCount() {
        const contactsResponse = await fetch('/api/chat/contacts', { credentials: 'same-origin' });
        if (!contactsResponse.ok) {
            return 0;
        }
        const contacts = await contactsResponse.json();
        const withMessages = (Array.isArray(contacts) ? contacts : []).filter(function (contact) {
            return contact && contact.lastMessage;
        });
        if (!withMessages.length) {
            return 0;
        }

        const watermarks = readWatermarks();
        const counts = await Promise.all(withMessages.map(async function (contact) {
            const params = new URLSearchParams();
            params.set('contactType', contact.contactType);
            params.set('contactSourceId', String(contact.contactSourceId));
            const response = await fetch('/api/chat/messages?' + params.toString(), { credentials: 'same-origin' });
            if (!response.ok) {
                return 0;
            }
            const messages = await response.json();
            const key = contact.contactType + ':' + contact.contactSourceId;
            const seenId = Number(watermarks[key]) || 0;
            return (Array.isArray(messages) ? messages : []).filter(function (message) {
                return !message.sentByOwner && Number(message.id) > seenId;
            }).length;
        }));
        return counts.reduce(function (total, value) {
            return total + value;
        }, 0);
    }

    function initChatUnreadBadge() {
        const badge = document.getElementById('chatUnreadBadge');
        if (!badge) {
            return;
        }

        async function refreshChatUnreadBadge() {
            try {
                const response = await fetch('/api/chat/unread-count', { credentials: 'same-origin' });
                if (response.ok) {
                    const data = await response.json();
                    applyCount(badge, data && data.count);
                    return;
                }
                if (response.status === 404 || response.status === 405) {
                    applyCount(badge, await fallbackUnreadCount());
                }
            } catch (error) {
                // Keep the last known badge state if the count cannot be refreshed.
            }
        }

        window.refreshChatUnreadBadge = refreshChatUnreadBadge;
        refreshChatUnreadBadge();
        setInterval(refreshChatUnreadBadge, 15000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatUnreadBadge);
    } else {
        initChatUnreadBadge();
    }
})();
