import {
  setTheme,
  getCityWeatherByName,
  getNearbyCities,
  selectCity,
  formatData,
} from "./utils.js";
setTheme();

const params = new URLSearchParams(window.location.search);
const city = params.get("name");

let latitude,
  longitude = "";

const getRealTime = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000); // Convert to milliseconds

  // Format the date to a readable time
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getForecast = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }

    const forecastData = await response.json();
    const result = forecastData.daily.time.map((_, index) => {
      const weatherIcons = {
        0: "sun.png",                        // Clear sky
        1: "partly-cloudy-day.png",         // Mainly clear
        2: "clouds.png",                    // Partly cloudy
        3: "cloud.png",                     // Overcast
      
        45: "fog-day.png",                  // Fog
        48: "fog-night.png",                // Depositing rime fog
      
        51: "light-rain.png",              // Drizzle: Light
        53: "light-rain.png",              // Drizzle: Moderate
        55: "light-rain.png",              // Drizzle: Dense
      
        56: "rain.png",           // Freezing drizzle: Light
        57: "rain.png",           // Freezing drizzle: Dense
      
        61: "rain.png",                    // Rain: Slight
        63: "rain.png",                    // Rain: Moderate
        65: "rain.png",                    // Rain: Heavy
      
        66: "rain.png",           // Freezing rain: Light
        67: "rain.png",           // Freezing rain: Heavy
      
        71: "snow.png",                    // Snow: Slight
        73: "snow.png",                    // Snow: Moderate
        75: "snow.png",                    // Snow: Heavy
      
        77: "snowflake.png",              // Snow grains
      
        80: "rain.png",             // Rain showers: Slight
        81: "rain.png",             // Rain showers: Moderate
        82: "rain.png",             // Rain showers: Violent
      
        85: "snow.png",             // Snow showers: Slight
        86: "snow.png",             // Snow showers: Heavy
      
        95: "storm.png",                  // Thunderstorm: Moderate
        96: "storm.png",       // Thunderstorm with slight hail
        99: "storm.png",       // Thunderstorm with heavy hail
      };
      

      const max_temp = forecastData.daily.temperature_2m_max[index];
      const min_temp = forecastData.daily.temperature_2m_min[index];

      const weatherCode = forecastData.daily.weathercode[index];
      console.log(weatherCode);
      const iconName = weatherIcons[weatherCode];
      const iconLink = (iconName) => `https://img.icons8.com/color/48/${iconName}`;
      

      const day = new Date(forecastData.daily.time[index]).toLocaleDateString(
        "en-US",
        { weekday: "short" }
      );

      return {
        day,
        max_temp,
        min_temp,
        weather_icon: iconLink(iconName),
      };
    });
    return result;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return [];
  }
};

const populateForecast = (forecast) => {
  const forecastcards = document.querySelectorAll(".forecast-card");

  forecastcards.forEach((card, index) => {
    const cardData = forecast[index]; // Adjust index to match forecast data
    const {
      day,
      max_temp,
      min_temp,
      weather_icon,
    } = cardData;

    card.querySelector(".forecast-day").innerHTML = day;
    card.querySelector(".forecast-temperature").innerHTML = `${max_temp}°C / ${min_temp}°C`;
    // card.querySelector(".min-temp").innerHTML = `${min_temp}°C`;
    card.querySelector(".forecast-icon").src = weather_icon;
  });
};

const populateDetails = async () => {
  const weatherData = await getCityWeatherByName(city);
  latitude = weatherData.coord.lat;
  longitude = weatherData.coord.lon;
  // console.log(weatherData);

  const forecast = await getForecast(latitude, longitude);
  populateForecast(forecast);

  const { citiesData } = await getNearbyCities({
    latitude,
    longitude,
  });

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
        .filter((city) =>
          city.name.toLowerCase().startsWith(query.toLowerCase())
        )
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

  searchCities();

  const populateWeatherInfo = (
    cityName,
    weatherMain,
    weatherDescription,
    weatherIcon,
    temperature,
    humidity,
    windSpeed,
    pressure,
    seaLevel,
    sunrise,
    sunset
  ) => {
    document.getElementById("city-name").innerHTML = cityName;
    document.getElementById("weather-main").innerHTML = weatherMain;
    document.getElementById("weather-desc").innerHTML = weatherDescription;
    document.getElementById("weather-icon").src = weatherIcon;
    document.getElementById("current-temp").innerHTML = temperature;
    document.getElementById("humidity").innerHTML = humidity;
    document.getElementById("wind-speed").innerHTML = windSpeed;
    document.getElementById("pressure").innerHTML = pressure;
    document.getElementById("sea-level").innerHTML = seaLevel;
    document.getElementById("sunrise").innerHTML = sunrise;
    document.getElementById("sunset").innerHTML = sunset;
  };

  const {
    cityName,
    weatherDescription,
    temperature,
    humidity,
    windSpeed,
    pressure,
    seaLevel,
    weatherMain,
    weatherIconUrl,
    sunrise,
    sunset,
  } = formatData(weatherData);

  async function getCityImage(city) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${city}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      const data = await response.json();
      const imageUrl = data.results[0]?.urls?.regular;

      return imageUrl;
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  }

  const cityImage = await getCityImage(cityName);
  document.getElementById("city-image").src =
    cityImage ||
    "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  populateWeatherInfo(
    cityName,
    weatherMain,
    weatherDescription,
    weatherIconUrl,
    temperature,
    humidity,
    windSpeed,
    pressure,
    seaLevel,
    getRealTime(sunrise),
    getRealTime(sunset)
  );

  const fillNearbyCitiesCards = () => {
    const createMoreCityDiv = (weatherIconUrl, cityName) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between bg-blue-100 dark:bg-gray-300 items-center border px-6 py-4 rounded cursor-pointer";

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
      arrowSpan.className = "dark:text-black";

      div.appendChild(innerDiv);
      div.appendChild(arrowSpan);

      div.addEventListener("click", () => {
        selectCity(cityName);
      });

      return div;
    };

    const nearbyCities = document.getElementById("more-cities");
    citiesData.slice(1, 10).forEach((city) => {
      const moreCityDiv = createMoreCityDiv(
        `https://openweathermap.org/img/wn/${city.weather[0].icon}@4x.png`,
        city.name
      );
      nearbyCities.append(moreCityDiv);
    });
  };
  fillNearbyCitiesCards();
};
populateDetails();
