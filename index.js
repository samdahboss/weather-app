//Function to get the name of any city by coordinates
const getCityName = async (latitude, longitude) => {
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

// Use the OpenWeatherMap API to get the weather data by city name
const getCityWeatherByName = async (cityName) => {
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

const getNearbyCities = ({ latitude, longitude }) => {
  const nearbyCitiesData = [];
  fetch(
    `https://api.openweathermap.org/data/2.5/find?lat=${latitude}&lon=${longitude}&cnt=10&appid=${WEATHER_API_KEY}&units=metric`
  )
    .then((res) => res.json())
    .then((data) => nearbyCitiesData.push(...data.list))
    .then(() => {
      return {
        cityNames: nearbyCitiesData.map((city) => city.name),
        citiesData: nearbyCitiesData,
      };
    });
};

(async () => {
  const { city, latitude, longitude } = await getCurrentCity();

  const currentCityData = await getCityWeatherByName(city);
  const {cityNames, citiesData} = getNearbyCities({ latitude, longitude });
})();
