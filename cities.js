document.addEventListener("DOMContentLoaded", function () {
  const apiURL = "https://66c6edae732bf1b79fa4a001.mockapi.io/city/cities";
  
  let cities = [];
  let filteredCities = [];
  
  let selectedCity = null;
  
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

  const countryFilter = document.getElementById("country-filter");
  const descriptionSearch = document.getElementById("description-search");
  const citiesList = document.getElementById("cities-list");

  const cityModalElement = document.getElementById("city-modal");
  const cityModal = new bootstrap.Modal(cityModalElement);

  const addCityModalElement = document.getElementById("addCityModal");
  const addCityModal = new bootstrap.Modal(addCityModalElement);

  const userName = localStorage.getItem("userName");
  const welcomeMessageElement = document.getElementById("welcome-message");
  welcomeMessageElement.textContent = `Welcome ${userName}`;

  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("userName");
    window.location.href = "index.html";
  });

  function showCurrentTime() {
    const clockElement = document.getElementById("clock");
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  setInterval(showCurrentTime, 1000);
  showCurrentTime();

  function saveFilterToSessionStorage(filterName, value) {
    if (filterName === "timezone") {
      value = value.join(",");
    }
    sessionStorage.setItem(filterName, value);
  }

  function initializeFilters() {
    const savedCountry = sessionStorage.getItem("country");
    if (savedCountry) {
      countryFilter.value = savedCountry;
    }

    const savedDescription = sessionStorage.getItem("description");
    if (savedDescription) {
      descriptionSearch.value = savedDescription;
    }
  }

  function applyFilters() {
    const country = countryFilter.value;
    const search = descriptionSearch.value.toLowerCase();

    const selectedTimezones = Array.from(
      document.querySelectorAll("#timezone-filter input[type='checkbox']:checked")
    ).map((checkbox) => checkbox.value);

    filteredCities = cities.filter(function (city) {
      const matchesCountry = country === "" || city.countryName === country;
      const matchesTimezone =
        selectedTimezones.length === 0 || selectedTimezones.includes(city.timeZone);
      const matchesSearch = search === "" || city.description.toLowerCase().includes(search);
      return matchesCountry && matchesTimezone && matchesSearch;
    });

    displayCities(filteredCities);
  }

  function displayCities(cities) {
    citiesList.innerHTML = "";

    cities.forEach(function (city) {
      const isFavourite = favourites.some((fav) => fav.id === city.id);
      const cityCard = document.createElement("div");
      cityCard.classList.add("col-md-4");
      cityCard.setAttribute("data-id", city.id);

      const cityCardContent = `
        <div class="card h-100">
          <img src="${city.image}" class="card-img-top" alt="${city.cityName}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between">
              <h5 class="card-title">${city.id}. ${city.cityName}</h5>
              <button class="btn mt-auto toggle-favourite" data-id="${city.id}">
                <i class="bi ${isFavourite ? "bi-heart-fill" : "bi-heart"}"></i>
              </button>
            </div>
            <p class="card-text">${city.description}</p>
            <button class="btn btn-primary mt-auto" data-id="${city.id}" data-bs-toggle="modal" data-bs-target="#city-modal">Details</button>
          </div>
        </div>
      `;
      cityCard.innerHTML = cityCardContent;
      citiesList.appendChild(cityCard);
    });

    const detailButtons = document.querySelectorAll(".btn-primary");
    detailButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const cityId = this.getAttribute("data-id");
        selectedCity = cities.find(function (city) {
          return city.id === cityId;
        });
        if (selectedCity) {
          displayCityDetails(selectedCity);
          cityModal.show();
        }
      });
    });

    const toggleFavouriteButtons = document.querySelectorAll(".toggle-favourite");
    toggleFavouriteButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const cityId = this.getAttribute("data-id");
        toggleFavourite(cityId, this);
      });
    });
  }

  function displayCityDetails(city) {
    

    const modalBody = document.querySelector("#city-modal .modal-body");
    modalBody.innerHTML = `
      <img src="${city.image}" class="img-fluid w-100 mb-3" alt="${city.cityName}">
      <h5>${city.id}. ${city.cityName}, ${city.countryName}</h5>
      <p><strong>Time Zone:</strong> ${city.timeZone}</p>
      <p><strong>Description:</strong> ${city.description}</p>
      <p><strong>Zip Code:</strong> ${city.zipCode}</p>
    `;

    const deleteCityBtn = document.getElementById("delete-city-btn");
    deleteCityBtn.addEventListener("click", function () {
      deleteCity(city.id);
    });

    const editCityBtn = document.getElementById("edit-city-btn");
    editCityBtn.addEventListener("click", function () {
      displayEditForm(city);
    });
  }

  function displayEditForm(city) {
    const modalBody = document.querySelector("#city-modal .modal-body");
    modalBody.innerHTML = `
      <form id="edit-city-form">
        <div class="mb-3">
          <label for="city-name" class="form-label">City Name</label>
          <input type="text" class="form-control" id="city-name" value="${city.cityName}" required>
        </div>
        <div class="mb-3">
          <label for="country-name" class="form-label">Country</label>
          <input type="text" class="form-control" id="country-name" value="${city.countryName}" required>
        </div>
        <div class="mb-3">
          <label for="timezone" class="form-label">Time Zone</label>
          <input type="text" class="form-control" id="timezone" value="${city.timeZone}" required>
        </div>
        <div class="mb-3">
          <label for="zip-code" class="form-label">Zip Code</label>
          <input type="text" class="form-control" id="zip-code" value="${city.zipCode}" required>
        </div>
        <div class="mb-3">
          <label for="image-url" class="form-label">Image URL</label>
          <input type="text" class="form-control" id="image-url" value="${city.image}" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" rows="3" required>${city.description}</textarea>
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    `;

    const editCityForm = document.getElementById("edit-city-form");
    editCityForm.addEventListener("submit", function (event) {
      event.preventDefault();
      saveCityChanges(city.id);
    });
  }

  function saveCityChanges(cityId) {
    const updatedCity = {
      cityName: document.getElementById("city-name").value,
      countryName: document.getElementById("country-name").value,
      timeZone: document.getElementById("timezone").value,
      zipCode: document.getElementById("zip-code").value,
      image: document.getElementById("image-url").value,
      description: document.getElementById("description").value,
    };

    fetch(`${apiURL}/${cityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCity),
    })
    .then((response) => response.json())
    .then((updatedCityData) => {
      const cityIndex = cities.findIndex((city) => city.id === cityId);
      cities[cityIndex] = updatedCityData;

      applyFilters();

      cityModal.hide();
    })
    .catch((error) => console.error("Error updating city:", error));
  }

  function deleteCity(cityId) {
    fetch(`${apiURL}/${cityId}`, {
      method: "DELETE",
    })
    .then(function () {
      cities = cities.filter((city) => city.id !== cityId);
      filteredCities = filteredCities.filter((city) => city.id !== cityId);
      applyFilters();
      cityModal.hide();
    })
    .catch(function (error) {
      console.error("Error deleting city:", error);
    });
  }

  function addCity(newCity) {
    fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCity),
    })
    .then((response) => response.json())
    .then((createdCity) => {
      cities.push(createdCity);
      applyFilters();
      addCityModal.hide();
    })
    .catch((error) => console.error("Error adding new city:", error));
  }

  const addCityForm = document.getElementById("add-city-form");
  addCityForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newCity = {
      cityName: document.getElementById("new-city-name").value,
      countryName: document.getElementById("new-country-name").value,
      timeZone: document.getElementById("new-timezone").value,
      zipCode: document.getElementById("new-zip-code").value,
      image: document.getElementById("new-image-url").value,
      description: document.getElementById("new-description").value,
    };

    addCity(newCity);
  });

  function saveFavourites() {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }

  function displayFavourites() {
    citiesList.innerHTML = "";
    if (favourites.length === 0) {
      citiesList.innerHTML = "<p class='text-white'>No favourite cities added yet.</p>";
    } else {
      favourites.forEach(function (city) {
        const cityCard = document.createElement("div");
        cityCard.classList.add("col-md-4");
        cityCard.setAttribute("data-id", city.id);

        const cityCardContent = `
          <div class="card h-100">
            <img src="${city.image}" class="card-img-top" alt="${city.cityName}">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between">
                <h5 class="card-title">${city.cityName}</h5>
                <button class="btn mt-auto toggle-favourite" data-id="${city.id}">
                  <i class="bi bi-heart-fill"></i>
                </button>
              </div>
              <p class="card-text">${city.description}</p>
              <button class="btn btn-primary mt-auto" data-id="${city.id}" data-bs-toggle="modal" data-bs-target="#city-modal">Details</button>
            </div>
          </div>
        `;
        cityCard.innerHTML = cityCardContent;
        citiesList.appendChild(cityCard);
      });

      const detailButtons = document.querySelectorAll(".btn-primary");
      detailButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          const cityId = this.getAttribute("data-id");
          selectedCity = favourites.find(function (city) {
            return city.id === cityId;
          });
          if (selectedCity) {
            displayCityDetails(selectedCity);
            cityModal.show();
          }
        });
      });

      const toggleFavouriteButtons = document.querySelectorAll(".toggle-favourite");
      toggleFavouriteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          const cityId = this.getAttribute("data-id");
          toggleFavourite(cityId, this);
        });
      });
    }
  }

  function toggleFavourite(cityId, button) {
    const isFavourite = favourites.some((fav) => fav.id === cityId);

    if (isFavourite) {
      favourites = favourites.filter((fav) => fav.id !== cityId);
      button.innerHTML = '<i class="bi bi-heart"></i>';
    } else {
      const city = cities.find((c) => c.id === cityId);
      favourites.push(city);
      button.innerHTML = '<i class="bi bi-heart-fill"></i>';
    }

    saveFavourites();

    if (document.getElementById("show-favourites-btn").classList.contains("active")) {
      displayFavourites();
    }
  }

  function populateFilters() {
    const countries = [];
    const timezones = [];

    cities.forEach(function (city) {
      if (!countries.includes(city.countryName)) {
        countries.push(city.countryName);
      }
      if (!timezones.includes(city.timeZone)) {
        timezones.push(city.timeZone);
      }
    });

    countryFilter.innerHTML = '<option value="">Select Country</option>';
    countries.forEach(function (country) {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countryFilter.appendChild(option);
    });

    timezones.forEach(function (timezone) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = timezone;
      checkbox.classList.add("form-check-input");
      checkbox.id = `timezone-${timezone}`;
      
      const label = document.createElement("label");
      label.classList.add("form-check-label");
      label.htmlFor = `timezone-${timezone}`;
      label.textContent = timezone;

      const div = document.createElement("div");
      div.classList.add("form-check");
      div.appendChild(checkbox);
      div.appendChild(label);

      document.getElementById("timezone-filter").appendChild(div);
    });

    countryFilter.value = sessionStorage.getItem("country") || "";
    descriptionSearch.value = sessionStorage.getItem("description") || "";

    const savedTimezones = sessionStorage.getItem("timezone");
    if (savedTimezones) {
      const savedTimezoneArray = savedTimezones.split(",");
      savedTimezoneArray.forEach((savedTimezone) => {
        const checkbox = document.getElementById(`timezone-${savedTimezone}`);
        if (checkbox) checkbox.checked = true;
      });
    }
  }

  const showFavouritesBtn = document.getElementById("show-favourites-btn");
  showFavouritesBtn.addEventListener("click", function () {
    displayFavourites();
    this.classList.add("active");
  });

  descriptionSearch.addEventListener("input", function () {
    saveFilterToSessionStorage("description", descriptionSearch.value);
    applyFilters();
  });

  countryFilter.addEventListener("change", function () {
    saveFilterToSessionStorage("country", countryFilter.value);
    applyFilters();
  });

  document.getElementById("timezone-filter").addEventListener("change", function () {
    const selectedTimezones = Array.from(
      document.querySelectorAll("#timezone-filter input[type='checkbox']:checked")
    ).map((checkbox) => checkbox.value);

    saveFilterToSessionStorage("timezone", selectedTimezones);
    applyFilters();
  });

  function fetchCities() {
    fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      cities = data;
      filteredCities = cities;
      populateFilters();
      applyFilters();
    });
  }

  fetchCities();
});
