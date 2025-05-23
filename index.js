import {
  getCityWeatherByName,
  getCityName,
  getNearbyCities,
  formatData,
  setTheme,
  selectCity
} from "./utils.js";
setTheme();

//Get the user's current location using the Geolocation API
const getCurrentCity = async () => {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          //Getting the user's latitude and latitude
          const { latitude, longitude } = position.coords;

          //Getting the user's current city from the coordinates
          const city = await getCityName(latitude, longitude);
          resolve({ city, latitude, longitude });
        },
        (error) => {
          reject(error);
        }
      );
    });
  } else {
    throw new Error("Geolocation is not supported by this browser.");
  }
};

const searchCities = () => {
  let citiesData = [];

  // Load the JSON file once when the page loads
  fetch("./cities.json")
    .then((res) => res.json())
    .then((data) => {
      citiesData = data;
    })
    .catch((err) => console.error("Error loading city data:", err));

  const searchInput = document.getElementById("search-input");
  const autocompleteDiv = document.getElementById("autocomplete");

  // Search function using local JSON
  const searchCities = (query) => {
    if (!query || citiesData.length === 0) return [];

    return citiesData
      .filter((city) => city.name.toLowerCase().startsWith(query.toLowerCase()))
      .map((city) => city.name)
      .slice(0, 5); //Return First 5 cities that starts with that query
  };

  // Event listener for the search input
  searchInput.addEventListener("input", async (event) => {
    const userInput = event.target.value;

    // Clear previous suggestions
    autocompleteDiv.innerHTML = "";

    if (userInput.trim() === "") {
      autocompleteDiv.classList.add("hidden");
      return;
    }

    // Filter cities and display suggestions
    const matchingCities = searchCities(userInput);
    matchingCities.forEach((city) => {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.textContent = city;
      suggestionDiv.className =
        "cursor-pointer hover:bg-gray-100 px-4 py-2 border-b";
      suggestionDiv.addEventListener("click", () => {
        selectCity(city);
      });
      autocompleteDiv.appendChild(suggestionDiv);
    });

    // Show suggestions if there are matches
    if (matchingCities.length > 0) {
      autocompleteDiv.classList.remove("hidden");
    } else {
      autocompleteDiv.classList.add("hidden");
    }
  });
};

const populateCurrentCityCard = (
  cityName,
  weatherDescription,
  weatherIcon,
  temperature,
  humidity,
  windSpeed,
  pressure,
  visibility
) => {
  document.getElementById("city-name").innerHTML = cityName;
  document.getElementById("weather-description").innerHTML = weatherDescription;
  document.getElementById("weather-icon").innerHTML = weatherIcon;
  document.getElementById("temperature").innerHTML = temperature;
  document.getElementById("humidity").innerHTML = humidity;
  document.getElementById("wind-speed").innerHTML = windSpeed;
  document.getElementById("pressure").innerHTML = pressure;
  document.getElementById("visibility").innerHTML = visibility;
};

const populateNearbyCityCard = (
  id,
  cityName,
  weatherDescription,
  weatherIcon,
  temperature,
  humidity,
  windSpeed,
  pressure,
  visibility
) => {
  document.querySelector(`#${id} [data-city-name]`).innerHTML = cityName;
  document.querySelector(`#${id} [data-weather-description]`).innerHTML =
    weatherDescription;
  document.querySelector(`#${id} [data-weather-icon]`).innerHTML = weatherIcon;
  document.querySelector(`#${id} [data-temperature]`).innerHTML = temperature;
  document.querySelector(`#${id} [data-humidity]`).innerHTML = humidity;
  document.querySelector(`#${id} [data-wind-speed]`).innerHTML = windSpeed;
  document.querySelector(`#${id} [data-pressure]`).innerHTML = pressure;
  document.querySelector(`#${id} [data-visibility]`).innerHTML =
    visibility === "NaN km" ? "10 Km" : visibility;
};

const updateCityCards = async () => {
  const { city, latitude, longitude } = await getCurrentCity();

  const currentCityData = await getCityWeatherByName(city);

  // Populate the city card with the extracted data
  const fillCurrentCityCard = () => {
    const currentCityFormatedData = formatData(currentCityData);
    const {
      cityName,
      weatherDescription,
      weatherIcon,
      temperature,
      humidity,
      windSpeed,
      pressure,
      visibility,
    } = currentCityFormatedData;
    populateCurrentCityCard(
      cityName,
      weatherDescription,
      weatherIcon,
      temperature,
      humidity,
      windSpeed,
      pressure,
      visibility
    );
  };

  fillCurrentCityCard();

  const { citiesData } = await getNearbyCities({
    latitude,
    longitude,
  });

  const fillNearbyCitiesCards = () => {
    citiesData.slice(1, 4).forEach((city, index) => {
      const currentCityFormatedData = formatData(city);
      const {
        cityName,
        weatherDescription,
        weatherIcon,
        temperature,
        humidity,
        windSpeed,
        pressure,
        visibility,
      } = currentCityFormatedData;

      // console.log(city, city.visibility, visibility);

      populateNearbyCityCard(
        `nearby-card-${index + 1}`,
        cityName,
        weatherDescription,
        weatherIcon,
        temperature,
        humidity,
        windSpeed,
        pressure,
        visibility
      );
    });
  };
  fillNearbyCitiesCards();

  const fillMoreCitiesCards = () => {
    const createMoreCityDiv = (weatherIconUrl, cityName) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between bg-blue-100 dark:bg-gray-300 items-center border px-2 lg:px-6 py-4 rounded cursor-pointer";

      const innerDiv = document.createElement("div");
      innerDiv.className = "flex items-center gap-2";

      const img = document.createElement("img");
      img.src = weatherIconUrl;
      img.className = "w-12 h-12";

      const text = document.createElement("span");
      text.innerHTML = cityName;
      text.className = "font-bold dark:text-blue-500";

      innerDiv.appendChild(img);
      innerDiv.appendChild(text);

      const arrowSpan = document.createElement("span");
      arrowSpan.textContent = "↗";
      arrowSpan.className="dark:text-black"

      div.appendChild(innerDiv);
      div.appendChild(arrowSpan);

      div.addEventListener("click", () => {
        selectCity(cityName);
      });

      return div;
    };

    const moreCities = document.getElementById("more-cities");
    citiesData.forEach((city) => {
      const moreCityDiv = createMoreCityDiv(
        `https://openweathermap.org/img/wn/${city.weather[0].icon}@4x.png`,
        city.name
      );
      moreCities.append(moreCityDiv);
    });
  };

  fillMoreCitiesCards();
};

(async () => {
  //Adding Search Cities Functionality
  searchCities();

  //Function to fill in information for city cards
  updateCityCards();
})();
