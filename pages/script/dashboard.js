document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const userNameElement = document.getElementById('user-name');
    const totalOrdersElement = document.getElementById('total-orders');
    const pendingOrdersElement = document.getElementById('pending-orders');
    const completedOrdersElement = document.getElementById('completed-orders');
    const recentOrdersTable = document.getElementById('recent-orders-table');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    // Check authentication and load user data
    checkAuthAndLoadData();
    
    // Add event listeners to sidebar items
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Add event listeners to logout buttons
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    
    // Logout function
    function handleLogout() {
        console.log("Logging out...");
        
        // Call the logout API endpoint
        fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                // Clear any local storage items
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userPhone");
                
                // Redirect to signin page
                window.location.href = "signin.html";
            } else {
                console.error("Logout failed:", response.statusText);
            }
        })
        .catch(error => {
            console.error("Logout error:", error);
            // Still redirect even if there's an error
            window.location.href = "signin.html";
        });
    }
    
    async function checkAuthAndLoadData() {
        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.authenticated) {
                // Update user name
                userNameElement.textContent = data.user.name || data.user.email;
                
                // Load orders
                loadOrders();
            } else {
                window.location.href = '/signin.html';
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            window.location.href = '/signin.html';
        }
    }
    
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders/my-orders', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                updateOrderStats(data.orders);
                updateRecentOrders(data.orders);
            } else {
                console.error('Failed to load orders:', data.message);
            }
        } catch (error) {
            console.error('Order loading error:', error);
        }
    }
    
    function updateOrderStats(orders) {
        const total = orders.length;
        const pending = orders.filter(order => 
            ['Pending', 'Confirmed', 'Processing', 'Out for Delivery'].includes(order.status)
        ).length;
        const completed = orders.filter(order => 
            order.status === 'Delivered'
        ).length;
        
        totalOrdersElement.textContent = total;
        pendingOrdersElement.textContent = pending;
        completedOrdersElement.textContent = completed;
    }
    
    function updateRecentOrders(orders) {
        // Sort orders by date (newest first)
        const sortedOrders = [...orders].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Take only the 5 most recent orders
        const recentOrders = sortedOrders.slice(0, 5);
        
        if (recentOrders.length === 0) {
            recentOrdersTable.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">
                        <div class="empty-state-content">
                            <i class="fas fa-shopping-cart"></i>
                            <p>No orders yet</p>
                            <a href="fuel-order.html" class="btn btn-primary">Place Your First Order</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        recentOrdersTable.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.fuelType}</td>
                <td>${order.quantity} L</td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <a href="trackorder.html?order=${order.orderNumber}" class="btn-link">
                        Track
                    </a>
                </td>
            </tr>
        `).join('');
    }
    
    function switchTab(tabId) {
        // Update sidebar items
        sidebarItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update dashboard tabs
        dashboardTabs.forEach(tab => {
            if (tab.id === `${tabId}-tab`) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // If switching to orders tab, load all orders
        if (tabId === 'orders') {
            loadAllOrders();
        }
    }
    
    async function loadAllOrders() {
        try {
            const response = await fetch('/api/orders/my-orders', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const ordersTab = document.getElementById('orders-tab');
                const ordersTable = ordersTab.querySelector('.orders-table tbody');
                
                if (data.orders.length === 0) {
                    ordersTable.innerHTML = `
                        <tr class="empty-state">
                            <td colspan="6">
                                <div class="empty-state-content">
                                    <i class="fas fa-shopping-cart"></i>
                                    <p>No orders yet</p>
                                    <a href="fuel-order.html" class="btn btn-primary">Place Your First Order</a>
                                </div>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                ordersTable.innerHTML = data.orders.map(order => `
                    <tr>
                        <td>${order.orderNumber}</td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${order.fuelType}</td>
                        <td>${order.quantity} L</td>
                        <td>
                            <span class="status-badge status-${order.status.toLowerCase()}">
                                ${order.status}
                            </span>
                        </td>
                        <td>
                            <a href="trackorder.html?order=${order.orderNumber}" class="btn-link">
                                Track
                            </a>
                            ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? `
                                <button class="btn-link text-danger" onclick="cancelOrder('${order.orderNumber}')">
                                    Cancel
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('');
            } else {
                console.error('Failed to load orders:', data.message);
            }
        } catch (error) {
            console.error('Order loading error:', error);
        }
    }
    
    // Add cancel order function to window object
    window.cancelOrder = async function(orderNumber) {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/orders/cancel/${orderNumber}`, {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Order cancelled successfully');
                loadAllOrders(); // Refresh orders list
            } else {
                alert(data.message || 'Failed to cancel order. Please try again.');
            }
        } catch (error) {
            console.error('Order cancellation error:', error);
            alert('An error occurred while cancelling your order. Please try again.');
        }
    };
});

