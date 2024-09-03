document.addEventListener("DOMContentLoaded", function () {
  const apiURL = "https://66c6edae732bf1b79fa4a001.mockapi.io/city/users";

  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");

  // Register User
  registerBtn.addEventListener("click", function (event) {
    const firstName = document.getElementById("register-firstname");
    const lastName = document.getElementById("register-lastname");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const phoneNumber = document.getElementById("register-phone");
    let isValid = true;

    // Validacija
    if (firstName.value.length < 3) {
      firstName.classList.add("is-invalid");
      isValid = false;
    } else {
      firstName.classList.remove("is-invalid");
    }

    if (lastName.value.length < 3) {
      lastName.classList.add("is-invalid");
      isValid = false;
    } else {
      lastName.classList.remove("is-invalid");
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      email.classList.add("is-invalid");
      isValid = false;
    } else {
      email.classList.remove("is-invalid");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password.value)) {
      password.classList.add("is-invalid");
      isValid = false;
    } else {
      password.classList.remove("is-invalid");
    }

    
    if (isValid) {
      fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
          phoneNumber: phoneNumber.value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          
          localStorage.setItem(
            "userDetails",
            JSON.stringify({
              firstName: firstName.value,
              lastName: lastName.value,
              email: email.value,
              phoneNumber: phoneNumber.value,
              password:password.value
            })
          );

          alert("Registration successful!");
          firstName.value = "";
          lastName.value = "";
          email.value = "";
          password.value = "";
          phoneNumber.value = "";
        })
        .catch((error) => console.error("Error:", error));
    } else {
      event.preventDefault(); 
    }
  });

  loginBtn.addEventListener("click", function (event) {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (email && password) {
      fetch(apiURL)
        .then((response) => response.json())
        .then((users) => {
          const user = users.find(
            (user) => user.email === email && user.password === password
          );
          if (user) {
           
            localStorage.setItem(
              "userName",
              `${user.firstName} ${user.lastName}`
            );
            window.location.href = "cities.html";
          } else {
            alert("Invalid email or password.");
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      alert("Please enter your email and password.");
    }
  });
});
