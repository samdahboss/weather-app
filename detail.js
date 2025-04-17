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

const populateDetails = async () => {
  const weatherData = await getCityWeatherByName(city);
  latitude = weatherData.coord.lat;
  longitude = weatherData.coord.lon;
  console.log(weatherData);

  const { citiesData } = await getNearbyCities({
    latitude,
    longitude,
  });

  const populateWeatherInfo = (
    cityName,
    weatherMain,
    weatherDescription,
    weatherIcon,
    temperature,
    humidity,
    windSpeed,
    pressure,
    visibility
  ) => {
    document.getElementById("city-name").innerHTML = cityName;
    document.getElementById("weather-main").innerHTML = weatherMain;
    document.getElementById("weather-desc").innerHTML = weatherDescription;
    document.getElementById("weather-icon").src = weatherIcon;
    document.getElementById("current-temp").innerHTML = temperature;
    document.getElementById("humidity").innerHTML = humidity;
    document.getElementById("wind-speed").innerHTML = windSpeed;
    document.getElementById("pressure").innerHTML = pressure;
    document.getElementById("visibility").innerHTML = visibility;
  };

  const {
    cityName,
    weatherDescription,
    temperature,
    humidity,
    windSpeed,
    pressure,
    visibility,
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

  const seaLevel = document.getElementById("sea-level");
  seaLevel.innerHTML = weatherData.main.sea_level;

  const weatherMain = weatherData.weather[0].main;

  const weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  populateWeatherInfo(
    cityName,
    weatherMain,
    weatherDescription,
    weatherIcon,
    temperature,
    humidity,
    windSpeed,
    pressure,
    visibility
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
