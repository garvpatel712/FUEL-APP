document.addEventListener('DOMContentLoaded', function() {
    // Get order number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    // If order number is in URL, automatically track it
    if (orderNumber) {
        document.getElementById('trackId').value = orderNumber;
        trackOrder();
    }
    
    // Add event listener to track button
    document.querySelector('.btn-primary').addEventListener('click', trackOrder);
    
    // Add event listener to track input for Enter key
    document.getElementById('trackId').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            trackOrder();
        }
    });
    
    // Add event listeners to logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
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
    
    async function trackOrder() {
        const trackId = document.getElementById('trackId').value.trim();
        
        if (!trackId) {
            alert('Please enter a tracking ID');
            return;
        }
        
        try {
            // Check if user is authenticated
            const authResponse = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            
            const authData = await authResponse.json();
            
            if (!authData.authenticated) {
                window.location.href = '/signin.html';
                return;
            }
            
            // Fetch order details
            const response = await fetch(`/api/orders/track/${trackId}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displayOrderDetails(data.order);
            } else {
                alert(data.message || 'Order not found. Please check your tracking ID.');
            }
        } catch (error) {
            console.error('Order tracking error:', error);
            alert('An error occurred while tracking your order. Please try again.');
        }
    }
    
    function displayOrderDetails(order) {
        const orderDetails = document.getElementById('orderDetails');
        const trackingMap = document.getElementById('trackingMap');
        
        // Format delivery date
        const deliveryDate = new Date(order.deliveryDate);
        const formattedDate = deliveryDate.toLocaleString();
        
        // Calculate time until delivery
        const now = new Date();
        const timeUntilDelivery = Math.round((deliveryDate - now) / (1000 * 60)); // minutes
        
        // Update order details
        orderDetails.innerHTML = `
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Fuel Type:</strong> ${order.fuelType}</p>
            <p><strong>Quantity:</strong> ${order.quantity} Liters</p>
            <p><strong>Delivery Status:</strong> ${order.status}</p>
            <p><strong>Delivery Address:</strong> ${formatAddress(order.deliveryAddress)}</p>
            <p><strong>Delivery Date:</strong> ${formattedDate}</p>
            <p><strong>Estimated Delivery Time:</strong> ${order.estimatedDeliveryTime}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            ${timeUntilDelivery > 0 ? `<p><strong>Time Until Delivery:</strong> ${timeUntilDelivery} minutes</p>` : ''}
        `;
        
        // Show order details and tracking map
        orderDetails.style.display = 'block';
        trackingMap.style.display = 'block';
        
        // Add cancel button if order is not delivered or cancelled
        if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn-primary';
            cancelButton.style.marginTop = '10px';
            cancelButton.textContent = 'Cancel Order';
            cancelButton.onclick = () => cancelOrder(order.orderNumber);
            orderDetails.appendChild(cancelButton);
        }
    }
    
    function formatAddress(address) {
        return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    }
    
    async function cancelOrder(orderNumber) {
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
                trackOrder(); // Refresh order details
            } else {
                alert(data.message || 'Failed to cancel order. Please try again.');
            }
        } catch (error) {
            console.error('Order cancellation error:', error);
            alert('An error occurred while cancelling your order. Please try again.');
        }
    }
}); 