//Set Theme Function
export const setTheme = () => {
  const toggleTheme = document.querySelector("#toggleThemeBtn");
  // Check if the user has a theme preference saved in localStorage
  const theme = localStorage.getItem("theme");
  // If no preference is saved, check the user's system preference
  if (theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    toggleTheme.innerHTML = theme === "dark" ? "🌙 Dark" : "☀️ Light";
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
    toggleTheme.innerHTML = "🌙 Dark";
  } else {
    document.documentElement.classList.remove("dark");
    toggleTheme.innerHTML = "☀️ Light";
  }

  toggleTheme.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.contains("dark")?
        toggleTheme.innerHTML = "☀️ Light":
            toggleTheme.innerHTML="🌙 Dark"
            
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );

    
  });
};
//Function to get the name of any city by coordinates
export const getCityName = async (latitude, longitude) => {
  try {
    const res = await fetch(
      // Use reverse geocoding to get the city
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    const data = await res.json();
    return data.city;
  } catch (err) {
    console.log(err);
  }
};

// Use the OpenWeatherMap API to get the weather data by city name
export const getCityWeatherByName = async (cityName) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getNearbyCities = async ({ latitude, longitude }) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/find?lat=${latitude}&lon=${longitude}&cnt=10&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await res.json();

    // Extract city names and full data
    const cityNames = data.list.map((city) => city.name);
    const citiesData = data.list;

    return { cityNames, citiesData };
  } catch (error) {
    console.error("Error fetching nearby cities:", error);
  }
};

export const formatData = (data) => {
  return {
    cityName: data.name, // City name
    weatherDescription: data.weather[0].description, // Weather description
    weatherIcon: `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">`, // Weather icon
    temperature: `${data.main.temp}°C`, // Temperature
    humidity: `${data.main.humidity}%`, // Humidity
    windSpeed: `${data.wind.speed} m/s`, // Wind speed
    pressure: `${data.main.pressure} hPa`, // Pressure
    visibility: `${data.visibility / 1000} km`, // Visibility in kilometers
  };
};
