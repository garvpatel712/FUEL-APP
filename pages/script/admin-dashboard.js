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
        if (mobileNav.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        } else {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    });
    
    // Initialize user modal
    const modal = document.getElementById('user-modal');
    const closeBtn = modal.querySelector('.close');
    const addUserBtn = document.getElementById('add-user-btn');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
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
});

// Check if user is authenticated and is admin
function checkAdminAuth() {
    fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.authenticated) {
            window.location.href = '/signin.html';
            return;
        }
        
        if (data.user.role !== 'admin') {
            window.location.href = '/dashboard.html';
            return;
        }
        
        // User is authenticated and is admin
        console.log('Admin authenticated:', data.user);
    })
    .catch(error => {
        console.error('Error checking authentication:', error);
        window.location.href = '/signin.html';
    });
}

// Initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.sidebar-item');
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Handle "View All" buttons
    const viewAllButtons = document.querySelectorAll('.btn-link[data-tab]');
    viewAllButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Activate the corresponding tab
            tabButtons.forEach(btn => {
                if (btn.getAttribute('data-tab') === tabName) {
                    btn.click();
                }
            });
        });
    });
}

// Logout function
function logout() {
    fetch('/api/auth/logout', {
        method: 'GET',
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
    // Load users
    loadUsers();
    
    // Load orders (if you have an orders API)
    // loadOrders();
    
    // Update dashboard stats
    updateDashboardStats();
}

// Load users
function loadUsers() {
    fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(users => {
        // Update users table
        updateUsersTable(users);
        
        // Update recent users table (show only the last 5)
        updateRecentUsersTable(users.slice(0, 5));
        
        // Update total users count
        document.getElementById('total-users').textContent = users.length;
    })
    .catch(error => {
        console.error('Error loading users:', error);
    });
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
    
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(user.createdAt);
        const formattedDate = createdDate.toLocaleDateString();
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-cancelled' : 'status-confirmed'}">
                    ${user.role}
                </span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn-link edit-user" data-id="${user.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-link text-danger delete-user" data-id="${user.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openUserModal(userId);
        });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
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
    
    recentUsersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(user.createdAt);
        const formattedDate = createdDate.toLocaleDateString();
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-cancelled' : 'status-confirmed'}">
                    ${user.role}
                </span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn-link edit-user" data-id="${user.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        
        recentUsersTable.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openUserModal(userId);
        });
    });
}

// Update dashboard stats
function updateDashboardStats() {
    // This function would update the dashboard stats based on your data
    // For now, we'll just set some placeholder values
    
    // Example: Update order counts if you have an orders API
    // document.getElementById('total-orders').textContent = orders.length;
    // document.getElementById('pending-orders').textContent = orders.filter(o => o.status === 'pending').length;
    // document.getElementById('completed-orders').textContent = orders.filter(o => o.status === 'delivered').length;
}

// Open user modal
function openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    const passwordGroup = document.getElementById('password-group');
    
    // Reset form
    userForm.reset();
    
    if (userId) {
        // Edit existing user
        modalTitle.textContent = 'Edit User';
        passwordGroup.style.display = 'block';
        passwordGroup.querySelector('small').textContent = 'Leave blank to keep current password';
        
        // Fetch user data
        fetch(`/api/admin/users/${userId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(user => {
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-phone').value = user.phone || '';
            document.getElementById('user-role').value = user.role;
        })
        .catch(error => {
            console.error('Error fetching user:', error);
        });
    } else {
        // Add new user
        modalTitle.textContent = 'Add New User';
        document.getElementById('user-id').value = '';
        passwordGroup.style.display = 'block';
        passwordGroup.querySelector('small').textContent = 'Password is required for new users';
    }
    
    modal.style.display = 'block';
}

// Save user
function saveUser() {
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-password').value;
    
    const userData = {
        name,
        email,
        phone,
        role
    };
    
    if (password) {
        userData.password = password;
    }
    
    if (userId) {
        // Update existing user
        fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('User updated:', data);
            document.getElementById('user-modal').style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Error updating user:', error);
        });
    } else {
        // Create new user
        fetch('/api/admin/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('User created:', data);
            document.getElementById('user-modal').style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Error creating user:', error);
        });
    }
}

// Delete user
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('User deleted:', data);
        loadUsers();
    })
    .catch(error => {
        console.error('Error deleting user:', error);
    });
}