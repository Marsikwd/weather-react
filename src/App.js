import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import { ReactComponent as CloudIcon } from "./assets/clouds.svg";
import { ReactComponent as LensIcon } from "./assets/loupe.svg";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [showContainer, setShowContainer] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [weatherBg, setWeatherBg] = useState("");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=4654c6cfae1b7e19afda479fcf100455`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord?.lat}&lon=${data.coord?.lon}&units=metric&appid=4654c6cfae1b7e19afda479fcf100455`;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=4654c6cfae1b7e19afda479fcf100455`
            );
            setData(response.data);
            setLoading(false);
            setShowContainer(true);
            console.log(response.data);

            const forecastResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=4654c6cfae1b7e19afda479fcf100455`
            );
            const filteredForecastData = filterForecastData(
              forecastResponse.data.list
            );
            setForecastData(filteredForecastData);
            console.log(filteredForecastData);
          } catch (error) {
            console.error("Error fetching weather data:", error);
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error retrieving location:", error);
          setLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const response = await axios.get(forecastUrl);
        const filteredForecastData = filterForecastData(response.data.list);
        setForecastData(filteredForecastData);
        console.log(filteredForecastData);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    if (location && forecastUrl) {
      fetchForecastData();
    }
  }, [location, forecastUrl]);

  useEffect(() => {
    const setWeatherBackground = (weather) => {
      let bgClass = "";

      if (weather.includes("clear")) {
        bgClass = "app-sunny";
      } else if (weather.includes("cloud")) {
        bgClass = "app-cloudy";
      } else if (weather.includes("rain") || weather.includes("drizzle")) {
        bgClass = "app-rainy";
      } else if (weather.includes("snow")) {
        bgClass = "app-snowy";
      } else if (weather.includes("haze")) {
        bgClass = "app-haze";
      } else {
        bgClass = "app-default";
      }

      setWeatherBg(bgClass);
    };

    if (data.weather) {
      const weather = data.weather[0].main.toLowerCase();
      setWeatherBackground(weather);
    }
  }, [data.weather]);

  const filterForecastData = (forecastList) => {
    const filteredData = {};
    forecastList.forEach((time) => {
      const date = new Date(time.dt * 1000).toLocaleDateString();
      if (!filteredData[date]) {
        filteredData[date] = time;
      }
    });
    return Object.values(filteredData);
  };

  const searchLocation = async (event) => {
    if (event.key === "Enter") {
      try {
        const response = await axios.get(url);
        setData(response.data);
        setShowContainer(true);
        console.log(response.data);
      } catch (error) {
        setData({});
        setShowContainer(false);
        console.error("Error fetching weather data:", error);
      }
      setLocation("");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={`app ${weatherBg}`}>
      <motion.div
        className="search"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter Location.."
          onKeyPress={searchLocation}
          type="text"
        />
        <div className="symbol">
          <CloudIcon className="cloud" />
          <LensIcon className="lens" />
        </div>
      </motion.div>

      {showContainer && (
        <motion.div
          className="container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="top">
            <div className="main-top">
              <div className="location">
                <p>{data.name}</p>
              </div>
              <div className="temp">
                {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
              </div>
            </div>
            <div className="description">
              {data.weather ? (
                <>
                  <img
                    className="weather-icon"
                    src={`https://res.cloudinary.com/du7jxc1n6/image/upload/${data.weather[0].icon}.svg`}
                    alt="weather icon"
                  />
                  <p>{data.weather[0].main}</p>
                </>
              ) : null}
            </div>
          </div>

          {data.name !== undefined && (
            <div className="bottom">
              <div className="feels">
                {data.main ? (
                  <p className="bold">{data.main.feels_like}</p>
                ) : null}
                <p>Feels like</p>
              </div>
              <div className="humidity">
                {data.main ? (
                  <p className="bold">{data.main.humidity}%</p>
                ) : null}
                <p>Humidity</p>
              </div>
              <div className="wind">
                {data.wind ? (
                  <p className="bold">{data.wind.speed} MPH</p>
                ) : null}
                <p>Wind Speed</p>
              </div>
            </div>
          )}
          <motion.div
            className="week-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Weather for 5 Days</h2>
            <div className="forecast-days">
              {forecastData.slice(0, 5).map((time) => (
                <div className="day-weather" key={time.dt}>
                  <p>
                    {new Date(time.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </p>
                  <img
                    className="weather-icon"
                    src={`https://res.cloudinary.com/du7jxc1n6/image/upload/${time.weather[0].icon}.svg`}
                    alt="weather icon"
                  />
                  <p>{time.main.temp.toFixed()}°C</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
