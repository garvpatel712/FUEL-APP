// Import flatpickr
// import flatpickr from "flatpickr"

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  // const isLoggedIn = localStorage.getItem("isLoggedIn")

  // if (isLoggedIn !== "true") {
  //   window.location.href = "signin.html"
  // }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn")
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn")

  function logout() {
    console.log("Logging out...");
    
    // Call the logout API endpoint
    fetch('/api/auth/logout', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (response.ok) {
        // Clear any local storage items
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userPhone")
        
        // Redirect to signin page
        window.location.href = "signin.html"
      } else {
        console.error("Logout failed:", response.statusText);
      }
    })
    .catch(error => {
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      window.location.href = "signin.html"
    });
  }
  
  if (logoutBtn) logoutBtn.addEventListener("click", logout)
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logout)

  // Initialize date picker
  flatpickr("#delivery-date", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    minDate: "today",
    time_24hr: true
  })

  // Fuel prices (in dollars per liter)
  const fuelPrices = {
    'Petrol': 1.85,
    'Diesel': 1.95,
    'CNG': 2.05
  }

  // DOM elements
  const orderForm = document.getElementById('order-form')
  const fuelTypeSelect = document.getElementById('fuel-type')
  const quantityInput = document.getElementById('quantity')
  const decreaseBtn = document.getElementById('decrease-quantity')
  const increaseBtn = document.getElementById('increase-quantity')
  const pricePerLiter = document.getElementById('price-per-liter')
  const subtotal = document.getElementById('subtotal')
  const summaryFuelType = document.getElementById('summary-fuel-type')
  const summaryQuantity = document.getElementById('summary-quantity')
  const summaryPricePerLiter = document.getElementById('summary-price-per-liter')
  const summarySubtotal = document.getElementById('summary-subtotal')
  const summaryAddress = document.getElementById('summary-address')
  const summaryDeliveryDate = document.getElementById('summary-delivery-date')
  const summaryPaymentMethod = document.getElementById('summary-payment-method')

  // Update price when fuel type changes
  fuelTypeSelect.addEventListener('change', updatePrice)

  // Update price when quantity changes
  quantityInput.addEventListener('input', updatePrice)

  // Decrease quantity
  decreaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value)
    if (currentValue > 5) {
      quantityInput.value = currentValue - 1
      updatePrice()
    }
  })

  // Increase quantity
  increaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(quantityInput.value)
    if (currentValue < 1000) {
      quantityInput.value = currentValue + 1
      updatePrice()
    }
  })

  // Update price and summary
  function updatePrice() {
    const selectedFuelType = fuelTypeSelect.value
    const quantity = parseInt(quantityInput.value)
    
    if (selectedFuelType && !isNaN(quantity)) {
      const price = fuelPrices[selectedFuelType]
      const total = price * quantity
      
      pricePerLiter.textContent = `$${price.toFixed(2)}`
      subtotal.textContent = `$${total.toFixed(2)}`
      
      // Update summary
      summaryFuelType.textContent = selectedFuelType
      summaryQuantity.textContent = `${quantity} liters`
      summaryPricePerLiter.textContent = `$${price.toFixed(2)}`
      summarySubtotal.textContent = `$${total.toFixed(2)}`
    }
  }

  // Update summary when form fields change
  document.getElementById('address').addEventListener('input', function() {
    summaryAddress.textContent = this.value || '-'
  })

  document.getElementById('delivery-date').addEventListener('change', function() {
    summaryDeliveryDate.textContent = this.value || '-'
  })

  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const label = document.querySelector(`label[for="${this.id}"] span`).textContent
      summaryPaymentMethod.textContent = label
    })
  })

  // Handle form submission
  orderForm.addEventListener('submit', async function(event) {
    event.preventDefault()
    
    // Check if user is authenticated
    try {
      const authResponse = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })
      
      const authData = await authResponse.json()
      
      if (!authData.authenticated) {
        window.location.href = '/signin.html'
        return
      }
      
      // Prepare order data
      const fuelType = fuelTypeSelect.value
      const quantity = parseInt(quantityInput.value)
      const address = document.getElementById('address').value
      const city = document.getElementById('city').value
      const zip = document.getElementById('zip').value
      const deliveryDate = document.getElementById('delivery-date').value
      const notes = document.getElementById('notes').value
      
      // Format delivery date
      const deliveryDateTime = new Date(deliveryDate)
      const formattedDate = deliveryDateTime.toISOString()
      
      // Calculate estimated delivery time (2 hours after order)
      const estimatedTime = new Date()
      estimatedTime.setHours(estimatedTime.getHours() + 2)
      const estimatedDeliveryTime = `${estimatedTime.getHours()}:${estimatedTime.getMinutes().toString().padStart(2, '0')}`
      
      // Create order object
      const orderData = {
        fuelType: fuelType,
        quantity,
        deliveryAddress: {
          street: address,
          city,
          state: 'Your State', // This would be selected in a real app
          zipCode: zip
        },
        deliveryDate: formattedDate,
        estimatedDeliveryTime,
        notes
      }
      
      console.log('Sending order data:', orderData)
      
      // Send order to server
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Show success message
        alert(`Order placed successfully! Your order number is: ${data.order.orderNumber}`)
        
        // Redirect to order tracking page
        window.location.href = `/trackorder.html?order=${data.order.orderNumber}`
      } else {
        // Display detailed error message
        let errorMessage = data.message || 'Failed to place order. Please try again.'
        if (data.error) {
          errorMessage += `\nError: ${data.error}`
        }
        if (data.details) {
          errorMessage += '\nDetails: ' + JSON.stringify(data.details)
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Order placement error:', error)
      alert('An error occurred while placing your order. Please try again.')
    }
  })

  // Initialize prices
  updatePrice()
})

