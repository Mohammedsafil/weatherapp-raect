import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForecast, setShowForecast] = useState(false);

  const fetchWeather = async () => {
    if (!location.trim()) return alert('Enter a valid location');

    setIsLoading(true);
    setError('');
    try {

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=895284fb2d2c50a520ea537456963d9c`
      );
      if (!weatherResponse.ok) throw new Error('Location not found');
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=895284fb2d2c50a520ea537456963d9c`
      );
      if (!forecastResponse.ok) throw new Error('Forecast data not found');
      const forecast = await forecastResponse.json();
      setForecastData(forecast);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
    if (weatherData) fetchWeather();
  };

  const handleForecastToggle = () => {
    setShowForecast((prev) => !prev);
  };

  const filteredForecast = forecastData
    ? forecastData.list
        .filter((item) => {
          const forecastDate = new Date(item.dt_txt);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return forecastDate > today;
        })
        .reduce((acc, item) => {
          const forecastDate = new Date(item.dt_txt);
          const day = forecastDate.toLocaleDateString();
          if (!acc.some((forecast) => forecast.date === day)) {
            acc.push({
              date: day,
              temp: Math.round(item.main.temp),
              description: item.weather[0].description,
              icon: item.weather[0].icon,
            });
          }
          return acc;
        }, [])
        .slice(0, 4)
    : [];

  return (
    <div
      className={`app ${
        weatherData ? weatherData.weather[0].main.toLowerCase() : 'default'
      }`}
    >
      <div className="content-container">
        <div className="main-box">
          <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter a location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <button onClick={fetchWeather}>Search</button>
          </div>
          {isLoading && <p className="loading">Fetching weather data...</p>}
          {error && <p className="error">{error}</p>}
          {weatherData && (
            <div className="weather-container">
              <div className="main-weather">
                <h2>{weatherData.name}</h2>
                <h1>
                  {Math.round(weatherData.main.temp)}
                  {unit === 'metric' ? '°C' : '°F'}
                </h1>
                <p className="condition">{weatherData.weather[0].description}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                  alt="weather icon"
                />
              </div>
              <div className="details-grid">
                <div className="detail-card">
                  <h3>{weatherData.main.humidity}%</h3>
                  <p>Humidity</p>
                </div>
                <div className="detail-card">
                  <h3>{Math.round(weatherData.wind.speed)}</h3>
                  <p>{unit === 'metric' ? 'm/s' : 'mph'} Wind</p>
                </div>
                <div className="detail-card">
                  <h3>{Math.round(weatherData.visibility / 1000)} km</h3>
                  <p>Visibility</p>
                </div>
              </div>
              <button className="unit-toggle" onClick={toggleUnit}>
                Switch to {unit === 'metric' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
              </button>

              <button className="forecast-toggle" onClick={handleForecastToggle}>
                {showForecast ? 'Hide Forecast Report' : 'Check Forecast Report'}
              </button>
            </div>
          )}
          </div>

          {showForecast && filteredForecast.length > 0 && (
            <div className="forecast-container">
              <h3>4-Day Forecast:</h3>
              <div className="forecast-grid">
                {filteredForecast.map((item, index) => (
                  <div key={index} className="forecast-card">
                    <h4>{item.date}</h4>
                    <p>{item.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
                    <p>{item.description}</p>
                    <img
                      src={`http://openweathermap.org/img/wn/${item.icon}.png`}
                      alt="weather icon"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
