document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileNav = document.getElementById("mobile-nav")
  const menuIcon = document.getElementById("menu-icon")

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("active")
      menuIcon.classList.toggle("fa-bars")
      menuIcon.classList.toggle("fa-times")
    })
  }

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll(".faq-question")

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const faqId = this.getAttribute("data-faq")
      const answer = document.getElementById(`faq-${faqId}`)

      // Toggle active class on question
      this.classList.toggle("active")

      // Toggle active class on answer
      answer.classList.toggle("active")

      // Toggle icon
      const icon = this.querySelector(".faq-icon")
      if (answer.classList.contains("active")) {
        icon.classList.remove("fa-plus")
        icon.classList.add("fa-minus")
      } else {
        icon.classList.remove("fa-minus")
        icon.classList.add("fa-plus")
      }
    })
  })

  // Close mobile menu when clicking on a link
  const mobileNavLinks = document.querySelectorAll(".mobile-nav .nav-link, .mobile-nav .btn")

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active")
      menuIcon.classList.remove("fa-times")
      menuIcon.classList.add("fa-bars")
    })
  })

  // Form submission (prevent default)
  const subscribeForm = document.querySelector(".subscribe-form")

  if (subscribeForm) {
    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const emailInput = this.querySelector('input[type="email"]')

      if (emailInput.value) {
        alert("Thank you for subscribing!")
        emailInput.value = ""
      } else {
        alert("Please enter your email address.")
      }
    })
  }
})

