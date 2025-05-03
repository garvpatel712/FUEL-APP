// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and is admin
    checkAdminAuth();
    
    // Initialize tabs
    initTabs();
    
    // Initialize logout buttons
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('mobile-logout-btn').addEventListener('click', logout);
    
    // Initialize mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const menuIcon = document.getElementById('menu-icon');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-times');
    });
    
    // Initialize user modal
    const modal = document.getElementById('user-modal');
    const closeBtn = modal.querySelector('.close');
    const addUserBtn = document.getElementById('add-user-btn');
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    addUserBtn.addEventListener('click', function() {
        openUserModal();
    });
    
    // Initialize user form
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    // Load dashboard data
    loadDashboardData();

    // Load orders
    loadOrders();
});

// Modal functions
function closeModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'none';
    // Clear form
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

// Check if user is authenticated and is admin
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/signin.html';
            return;
        }
        
        if (data.user.role !== 'admin') {
            window.location.href = '/dashboard.html';
            return;
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/signin.html';
    }
}

// Initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.sidebar-item');
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Logout function
function logout() {
    fetch('/api/auth/logout', {
        credentials: 'include'
    })
    .then(() => {
        window.location.href = '/signin.html';
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}

// Load dashboard data
function loadDashboardData() {
    loadUsers();
    updateDashboardStats();
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            credentials: 'include'
        });
        const users = await response.json();
        
        updateUsersTable(users);
        updateRecentUsersTable(users.slice(0, 5));
        document.getElementById('total-users').textContent = users.length;
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Error loading users');
    }
}

// Update users table
function updateUsersTable(users) {
    const usersTable = document.getElementById('users-table');
    
    if (users.length === 0) {
        usersTable.innerHTML = `
            <tr class="empty-state">
                <td colspan="7">
                    <div class="empty-state-content">
                        <i class="fas fa-users"></i>
                        <p>No users found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    usersTable.innerHTML = users.map(user => `
        <tr>
            <td>${user._id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-cancelled' : 'status-confirmed'}">
                    ${user.role}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-link edit-user" data-id="${user._id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-link text-danger delete-user" data-id="${user._id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', () => openUserModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', () => deleteUser(button.dataset.id));
    });
}

// Update recent users table
function updateRecentUsersTable(users) {
    const recentUsersTable = document.getElementById('recent-users-table');
    
    if (users.length === 0) {
        recentUsersTable.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-state-content">
                        <i class="fas fa-users"></i>
                        <p>No users found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    recentUsersTable.innerHTML = users.map(user => `
        <tr>
            <td>${user._id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-cancelled' : 'status-confirmed'}">
                    ${user.role}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-link edit-user" data-id="${user._id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', () => openUserModal(button.dataset.id));
    });
}

// Open user modal
async function openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    const passwordGroup = document.getElementById('password-group');
    
    // Reset form
    userForm.reset();
    document.getElementById('user-id').value = '';
    
    if (userId) {
        try {
            modalTitle.textContent = 'Edit User';
            passwordGroup.style.display = 'block';
            passwordGroup.querySelector('small').textContent = 'Leave blank to keep current password';
            
            const response = await fetch(`/api/admin/users/${userId}`, {
                credentials: 'include'
            });
            const user = await response.json();
            
            document.getElementById('user-id').value = user._id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-phone').value = user.phone || '';
            document.getElementById('user-role').value = user.role;
        } catch (error) {
            console.error('Error fetching user:', error);
            showError('Error loading user data');
            return;
        }
    } else {
        modalTitle.textContent = 'Add New User';
        passwordGroup.style.display = 'block';
        passwordGroup.querySelector('small').textContent = 'Password is required for new users';
    }
    
    modal.style.display = 'block';
}

// Save user
async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const userData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        phone: document.getElementById('user-phone').value,
        role: document.getElementById('user-role').value,
        password: document.getElementById('user-password').value
    };
    
    try {
        const url = userId 
            ? `/api/admin/users/${userId}`
            : '/api/admin/users';
            
        const method = userId ? 'PUT' : 'POST';
        
        // Remove password if it's empty on edit
        if (userId && !userData.password) {
            delete userData.password;
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error saving user');
        }
        
        showSuccess(data.message || 'User saved successfully');
        closeModal();
        loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
        showError(error.message || 'Error saving user');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error deleting user');
        }
        
        showSuccess(data.message || 'User deleted successfully');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showError(error.message || 'Error deleting user');
    }
}

// Update dashboard stats
async function updateDashboardStats() {
    try {
        const response = await fetch('/api/admin/orders', {
            credentials: 'include'
        });
        const orders = await response.json();

        // Calculate stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => 
            ['Pending', 'Confirmed', 'Processing', 'Out for Delivery'].includes(order.status)
        ).length;
        const completedOrders = orders.filter(order => order.status === 'Delivered').length;

        // Update the DOM
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('completed-orders').textContent = completedOrders;
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        showError('Error updating dashboard stats');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            credentials: 'include'
        });
        const orders = await response.json();

        updateOrdersTable(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Error loading orders');
    }
}

// Update orders table
function updateOrdersTable(orders) {
    const ordersTable = document.getElementById('orders-table');

    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr class="empty-state">
                <td colspan="7">
                    <div class="empty-state-content">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No orders found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber}</td>
            <td>${order.user ? order.user.name : 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>${order.fuelType}</td>
            <td>${order.quantity} L</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase().replace(/ /g, '-')}">
                    ${order.status}
                </span>
            </td>
            <td>
                ${order.status !== 'Cancelled' ? `<button class="btn-link" onclick="updateOrderStatus('${order._id}', 'Delivered')">Mark as Delivered</button>` : ''}
                <button class="btn-link text-danger" onclick="deleteOrder('${order._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        // Fetch the current order details to check its status
        const orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(orderData.message || 'Error fetching order details');
        }

        // Prevent updating to Delivered if the order is Cancelled
        if (orderData.status === 'Cancelled' && status === 'Delivered') {
            showError('Cannot mark a cancelled order as delivered');
            return;
        }

        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error updating order status');
        }

        showSuccess('Order status updated successfully');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Error updating order status');
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error deleting order');
        }

        showSuccess('Order deleted successfully');
        loadOrders();
    } catch (error) {
        console.error('Error deleting order:', error);
        showError('Error deleting order');
    }
}