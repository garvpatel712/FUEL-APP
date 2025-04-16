document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForms = document.querySelectorAll(".auth-form");

  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs and forms
      authTabs.forEach((t) => t.classList.remove("active"));
      authForms.forEach((f) => f.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding form
      const formId = this.getAttribute("data-tab") + "-form";
      document.getElementById(formId).classList.add("active");

      // signup Form submission logic
      const signupForm = document.getElementById("signup-form");
      if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
          event.preventDefault(); // Prevent the default form submission

          // Gather input values
          const name = document.getElementById("signup-name").value;
          const email = document.getElementById("signup-email").value;
          const phone = document.getElementById("signup-phone").value;
          const password = document.getElementById("signup-password").value;

          // Send data to the server
          fetch("/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, phone, password }),
          })
            .then(response => {
              if (response.ok) {
                // Handle successful signup
                window.location.href = "../pages/dashboard.html";
              } else {
                // Handle errors
                console.error("Signup failed:", response.statusText);
              }
            })
            .catch(error => {
              console.error("Error during signup:", error);
            });
        });
      }
      // signin form submission logic
      const signinForm = document.getElementById("signin-form");

      if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const email = document.getElementById("signin-email").value.trim();
          const password = document.getElementById("signin-password").value.trim();

          if (!email || !password) {
            showError("Please fill in all fields.");
            return;
          }

          try {
            const response = await fetch("/signup/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
              // Success
              if (response.redirected) {
                window.location.href = response.url;
              } else {
                showError("Unexpected response.");
              }
            } else {
              // Handle JSON error
              const data = await response.json();
              showError(data.error || "An error occurred.");
            }
          } catch (error) {
            console.error("Error during sign-in:", error);
            showError("Something went wrong. Please try again later.");
          }
        });

        function showError(message) {
          let errorElement = document.getElementById("signin-error");

          if (!errorElement) {
            errorElement = document.createElement("p");
            errorElement.id = "signin-error";
            errorElement.className = "error-message";
            signinForm.prepend(errorElement);
          }

          errorElement.textContent = message;
          errorElement.style.color = "#ff4d4d";
        }
      }
    });
  });

  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");

  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const passwordInput = this.previousElementSibling;

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else {
        passwordInput.type = "password";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      }
    });
  });

  // Password strength meter
  const signupPassword = document.getElementById("signup-password");
  const strengthSegments = document.querySelectorAll(".strength-segment");
  const strengthText = document.querySelector(".strength-text");

  if (signupPassword) {
    signupPassword.addEventListener("input", function () {
      const password = this.value;
      let strength = 0;

      // Reset segments
      strengthSegments.forEach((segment) => {
        segment.className = "strength-segment";
      });

      if (password.length >= 8) strength++;
      if (password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^A-Za-z0-9]/)) strength++;

      switch (strength) {
        case 0:
          strengthText.textContent = "Password strength";
          break;
        case 1:
          strengthText.textContent = "Weak";
          strengthSegments[0].classList.add("weak");
          break;
        case 2:
          strengthText.textContent = "Medium";
          strengthSegments[0].classList.add("medium");
          strengthSegments[1].classList.add("medium");
          break;
        case 3:
          strengthText.textContent = "Strong";
          strengthSegments[0].classList.add("strong");
          strengthSegments[1].classList.add("strong");
          strengthSegments[2].classList.add("strong");
          break;
        case 4:
          strengthText.textContent = "Very Strong";
          strengthSegments.forEach((segment) => {
            segment.classList.add("strong");
          });
          break;
      }
    });
  }

  // Function to check if user is authenticated
  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include' // Include cookies in the request
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.authenticated;
      }
      return false;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Function to update navigation based on authentication status
  async function updateNavigation() {
    const isAuthenticated = await checkAuthStatus();
    const signInBtn = document.querySelector('.desktop-nav .btn-primary');
    const mobileSignInBtn = document.querySelector('.mobile-nav .btn-primary');
    const logoutBtn = document.querySelector('.desktop-nav .logout-btn');
    const mobileLogoutBtn = document.querySelector('.mobile-nav .logout-btn');
    
    if (isAuthenticated) {
      // User is authenticated
      if (signInBtn) signInBtn.style.display = 'none';
      if (mobileSignInBtn) mobileSignInBtn.style.display = 'none';
      
      // Add logout button if it doesn't exist
      if (!logoutBtn) {
        const desktopNav = document.querySelector('.desktop-nav');
        const logoutLink = document.createElement('a');
        logoutLink.href = '/api/auth/logout';
        logoutLink.className = 'btn btn-outline logout-btn';
        logoutLink.textContent = 'Logout';
        desktopNav.appendChild(logoutLink);
      }
      
      if (!mobileLogoutBtn) {
        const mobileNav = document.querySelector('.mobile-nav .container');
        const mobileLogoutLink = document.createElement('a');
        mobileLogoutLink.href = '/api/auth/logout';
        mobileLogoutLink.className = 'btn btn-outline btn-full logout-btn';
        mobileLogoutLink.textContent = 'Logout';
        mobileNav.appendChild(mobileLogoutLink);
      }
    } else {
      // User is not authenticated
      if (signInBtn) signInBtn.style.display = 'inline-block';
      if (mobileSignInBtn) mobileSignInBtn.style.display = 'inline-block';
      
      // Remove logout buttons if they exist
      if (logoutBtn) logoutBtn.remove();
      if (mobileLogoutBtn) mobileLogoutBtn.remove();
      
      // Check if we're on a protected page and redirect to signin
      const protectedPages = ['dashboard.html', 'fuel-order.html', 'trackorder.html'];
      const currentPage = window.location.pathname.split('/').pop();
      
      if (protectedPages.includes(currentPage)) {
        window.location.href = '/signin.html';
      }
    }
  }

  // Function to handle logout
  function handleLogout(event) {
    event.preventDefault();
    
    fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            // Clear all cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Clear local storage
            localStorage.clear();
            
            // Redirect to home page
            window.location.href = '/index.html';
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Still clear storage and redirect even if there's an error
        localStorage.clear();
        window.location.href = '/index.html';
    });
  }

  // Function to handle signup
  async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                email,
                phone: phone || undefined,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/dashboard.html';
        } else {
            const errorElement = document.getElementById('signup-error');
            errorElement.textContent = data.message || 'Signup failed. Please try again.';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Signup error:', error);
        const errorElement = document.getElementById('signup-error');
        errorElement.textContent = 'An error occurred. Please try again.';
        errorElement.style.display = 'block';
    }
  }

  // Function to handle login
  async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/dashboard.html';
        } else {
            const errorElement = document.getElementById('signin-error');
            errorElement.textContent = data.message || 'Login failed. Please try again.';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorElement = document.getElementById('signin-error');
        errorElement.textContent = 'An error occurred. Please try again.';
        errorElement.style.display = 'block';
    }
  }

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to forms
    const loginForm = document.getElementById('signin-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Add event listeners to logout buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('logout-btn')) {
            handleLogout(event);
        }
    });
    
    // Update navigation based on authentication status
    updateNavigation();
  });
});
