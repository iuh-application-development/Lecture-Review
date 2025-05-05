document.addEventListener('DOMContentLoaded', function () {
    console.log('Notification.js loaded!');

    // Kiểm tra các phần tử cần thiết
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('unreadCount');
    const notificationList = document.getElementById('notificationList');
    const markAllReadBtn = document.getElementById('markAllRead');

    console.log('Elements found:', {
        notificationDropdown: !!notificationDropdown,
        notificationBadge: !!notificationBadge,
        notificationList: !!notificationList,
        markAllReadBtn: !!markAllReadBtn
    });

    // Nếu có các phần tử cần thiết
    if (notificationDropdown && notificationBadge && notificationList) {
        // Tải thông báo khi trang được tải
        loadNotifications();

        // Cập nhật thông báo mỗi 30 giây
        setInterval(loadNotifications, 30000);

        // Sự kiện đánh dấu tất cả đã đọc
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', markAllAsRead);
        }
    }

    // Hàm tải thông báo
    async function loadNotifications() {
        try {
            console.log('Fetching notifications...');
            const response = await fetch('/api/notifications?limit=5');
            const data = await response.json();
            console.log('Received notification data:', data);

            if (data.status === 'success') {
                const notifications = data.data.notifications;
                const unreadCount = data.data.unread_count;

                // Cập nhật số thông báo chưa đọc
                updateUnreadCount(unreadCount);

                // Hiển thị thông báo
                if (notificationList) {
                    renderNotifications(notifications);
                }

                console.log('Updated notifications successfully!');
            } else {
                console.error('Failed to get notifications:', data.message);
                // Hiển thị thông báo lỗi
                notificationList.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${data.message || 'Unable to load notifications'}
                </div>
            `;
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Hiển thị thông báo lỗi mạng
            if (notificationList) {
                notificationList.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-wifi-off me-2"></i>
                    Network error. Unable to load notifications.
                </div>
            `;
            }
        }
    }

    // Cập nhật số thông báo chưa đọc
    function updateUnreadCount(count) {
        if (!notificationBadge) return;

        console.log('Updating unread count:', count);

        if (count > 0) {
            notificationBadge.textContent = count > 9 ? '9+' : count;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    }

    // Hiển thị danh sách thông báo
    function renderNotifications(notifications) {
        const notificationList = document.getElementById('notificationList');
        const unreadCount = document.getElementById('unreadCount');

        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-bell-slash fs-4 mb-2"></i>
                <p>No notifications</p>
            </div>
        `;
            unreadCount.style.display = 'none';
            return;
        }

        // Clear existing content
        notificationList.innerHTML = '';

        // Render each notification
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `dropdown-item py-2 ${!notification.is_read ? 'bg-light-subtle' : ''}`;
            notificationItem.setAttribute('data-id', notification.id);
            notificationItem.style.transition = 'none';

            // Chọn icon dựa trên loại thông báo
            let iconClass = 'text-primary';
            let iconName = 'info-circle';

            switch (notification.type) {
                case 'warning':
                    iconClass = 'text-warning';
                    iconName = 'exclamation-triangle';
                    break;
                case 'success':
                    iconClass = 'text-success';
                    iconName = 'check-circle';
                    break;
                case 'error':
                    iconClass = 'text-danger';
                    iconName = 'x-circle';
                    break;
            }

            notificationItem.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <i class="bi bi-${iconName} fs-5 ${iconClass}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <strong class="me-2">${notification.title}</strong>
                        <small class="text-muted">${formatTimeAgo(notification.created_at)}</small>
                    </div>
                    <p class="text-muted mb-0">${notification.message}</p>
                </div>
            </div>
        `;

            // Thêm sự kiện click để đánh dấu đã đọc
            notificationItem.addEventListener('click', function () {
                markAsRead(notification.id);
                if (notification.link) {
                    window.location.href = notification.link;
                }
            });

            notificationList.appendChild(notificationItem);
        });
    }

    // Hàm format thời gian
    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHour < 24) return `${diffHour} hr ago`;
        if (diffDay < 7) return `${diffDay} day ago`;
        return date.toLocaleDateString();
    }

    // Đánh dấu thông báo đã đọc
    async function markAsRead(notificationId) {
        try {
            console.log('Marking notification as read:', notificationId);
            const response = await fetch(`/api/notifications/mark-read/${notificationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Mark read response:', data);

            if (data.status === 'success') {
                // Tải lại thông báo sau khi đánh dấu đã đọc
                loadNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Đánh dấu tất cả đã đọc
    async function markAllAsRead(e) {
        if (e) e.preventDefault();

        try {
            console.log('Marking all notifications as read');
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Mark all read response:', data);

            if (data.status === 'success') {
                // Tải lại thông báo
                loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
});