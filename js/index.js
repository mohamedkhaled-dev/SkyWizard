// Select DOM elements
var mainContent = document.querySelector(".main-content");
var currentTemp = document.querySelector(".current-temp");
var currentDate = document.querySelector(".current-date");
var currentCondition = document.querySelector(".current-condition");
var cityInputElement = document.getElementById("cityInput");
var locationValue = document.querySelector(".location-value");
var aqiValue = document.querySelector(".aqi-info");
var aqiStatus = document.querySelector(".aqi-status");
var forecastRow = document.querySelector(".forecast-row");
var windStatus = document.querySelector(".wind-status");
var windValue = document.querySelector(".wind-value");
var humidityStatus = document.querySelector(".humidity-status");
var humidityValue = document.querySelector(".humidity-value");
var cloudStatus = document.querySelector(".cloud-status");
var cloudValue = document.querySelector(".cloud-value");
var pressureValue = document.querySelector(".pressure-value");
var pressureStatus = document.querySelector(".pressure-status");

var debounceTimeout;
var cityValue = "";
var baseURL = "https://api.weatherapi.com/v1/forecast.json";
var apiKey = "41d2a0a855384bb99cc151653240112";
var days = 3;
var aqi = "yes";

// Debounced input event
cityInputElement.addEventListener("input", function (e) {
  clearTimeout(debounceTimeout);
  cityValue = e.target.value.toLowerCase();

  debounceTimeout = setTimeout(function () {
    checkWeather();
  }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
  cityValue = "cairo";
  checkWeather();
});

// Fetch weather data
async function checkWeather() {
  var city = cityValue || "cairo";
  var apiURL = `${baseURL}?key=${apiKey}&q=${city}&days=${days}&aqi=${aqi}`;

  try {
    var response = await fetch(apiURL);
    var data = await response.json();

    // Update weather data
    var currentWeather = {
      location: data.location.country + ", " + data.location.name,
      date: data.location.localtime,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      aqi: data.current.air_quality["us-epa-index"],
      wind: data.current.wind_kph,
      humidity: data.current.humidity,
      cloud: data.current.cloud,
      pressure: data.current.pressure_mb,
    };

    var forecastData = [];
    for (var i = 0; i < data.forecast.forecastday.length; i++) {
      var forecast = data.forecast.forecastday[i];
      var currentDateTime = new Date(data.location.localtime);
      var currentHour = currentDateTime.getHours();
      var currentHourData = forecast.hour[currentHour];

      var forecastObject = {
        location: data.location.country + ", " + data.location.name,
        date: forecast.date,
        temp: currentHourData.temp_c,
        condition: currentHourData.condition.text,
        icon: "https:" + currentHourData.condition.icon,
      };

      forecastData.push(forecastObject);
    }

    // Display updated weather
    displayWeather(currentWeather);
    displayForecast(forecastData);
  } catch (error) {
    displayError();
  }
}

// Display weather data
function displayWeather(currentWeather) {
  locationValue.textContent = currentWeather.location;
  currentTemp.textContent = Math.round(currentWeather.temperature) + "°C";
  currentDate.textContent = formatDate(currentWeather.date);
  currentCondition.textContent = currentWeather.condition;
  cloudValue.innerHTML = `${currentWeather.cloud}<span>%</span>`;
  pressureValue.innerHTML = `${currentWeather.pressure}<span>mb</span>`;
  windValue.innerHTML = `${currentWeather.wind}<span>km/h</span>`;
  humidityValue.innerHTML = `${currentWeather.humidity}<span>%</span>`;
  aqiValue.textContent = currentWeather.aqi;

  // Set air quality status
  setAqiStatus(currentWeather.aqi);
  setCloudStatus(currentWeather.cloud);
  setPressureStatus(currentWeather.pressure);
  setHumidityStatus(currentWeather.humidity);
  setCloudStatus(currentWeather.cloud);
}

// Display forecast
function displayForecast(forecastData) {
  var container = "";
  for (var i = 0; i < forecastData.length; i++) {
    container += `
          <!-- Forecast Cards -->
          <div class="col-12 col-sm-6 col-lg-4 col-xl-4">
            <div class="forecast-card card p-4 pb-2 pb-xl-3">
              <div class="forecast-icon position-absolute top-0 start-50 translate-middle">
                <img src="${forecastData[i].icon}" alt="forecast-icon" />
              </div>
              <h3 class="mb-1 pt-4 forecast-temp${i + 1}">${Math.round(
      forecastData[i].temp
    )}<span>°C</span></h3>
              <p class="text-muted m-0 pb-1 pt-4 forecast-condition-${i + 1}">${
      forecastData[i].condition
    }</p>
              <p class="fw-bold m-0 forecast-date-${i + 1}">${formatDate(
      forecastData[i].date
    )}</p>
            </div>
          </div>
        `;
  }

  forecastRow.innerHTML = container;
}

// Function to format date as "2024, 30th Dec"
function formatDate(dateString) {
  var date = new Date(dateString);

  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  var day = date.getDate();
  var month = months[date.getMonth()];
  var year = date.getFullYear();

  return `${year}, ${day}${getDaySuffix(day)} ${month}`;
}

// Function to get day suffix (st, nd, rd, th)
function getDaySuffix(day) {
  if (day === 1 || day === 21 || day === 31) {
    return "st";
  } else if (day === 2 || day === 22) {
    return "nd";
  } else if (day === 3 || day === 23) {
    return "rd";
  } else {
    return "th";
  }
}

// Function to set Wind status
function setWindStatus(windSpeed) {
  var statusText;

  if (windSpeed <= 10) {
    statusText = "Normal";
  } else if (windSpeed > 10 && windSpeed <= 30) {
    statusText = "Moderate";
  } else {
    statusText = "Strong";
  }

  windStatus.textContent = statusText;
}

// Function to set Pressure status
function setPressureStatus(pressure) {
  var statusText;

  if (pressure >= 1013 && pressure <= 1020) {
    statusText = "Normal";
  } else if (pressure > 1020) {
    statusText = "High";
  } else if (pressure < 1000) {
    statusText = "Low";
  } else {
    statusText = "Normal";
  }
  pressureStatus.textContent = statusText;
}

// Function to set Humidity status
function setHumidityStatus(humidity) {
  var statusText;

  if (humidity < 30) {
    statusText = "Low";
  } else if (humidity >= 30 && humidity <= 60) {
    statusText = "Normal";
  } else {
    statusText = "High";
  }

  humidityStatus.textContent = statusText;
}

// Function to set Cloud status
function setCloudStatus(cloudCover) {
  var statusText;

  if (cloudCover <= 20) {
    statusText = "Clear";
  } else if (cloudCover > 20 && cloudCover <= 70) {
    statusText = "Partly Cloudy";
  } else {
    statusText = "Cloudy";
  }

  cloudStatus.textContent = statusText;
}

// Function to set Air Quality status
function setAqiStatus(aqi) {
  var aqiClasses = {
    50: { class: "status-good", text: "Good" },
    100: { class: "status-moderate", text: "Moderate" },
    150: { class: "status-unhealthy", text: "Unhealthy" },
    151: { class: "status-hazardous", text: "Hazardous" },
  };

  aqiStatus.classList.remove(
    "status-good",
    "status-moderate",
    "status-unhealthy",
    "status-hazardous"
  );

  var statusClass, statusText;
  if (aqi <= 50) {
    statusClass = aqiClasses[50].class;
    statusText = aqiClasses[50].text;
  } else if (aqi <= 100) {
    statusClass = aqiClasses[100].class;
    statusText = aqiClasses[100].text;
  } else if (aqi <= 150) {
    statusClass = aqiClasses[150].class;
    statusText = aqiClasses[150].text;
  } else {
    statusClass = aqiClasses[151].class;
    statusText = aqiClasses[151].text;
  }

  aqiStatus.classList.add(statusClass);
  aqiStatus.textContent = statusText;
}

// Display error message
function displayError() {
  locationValue.textContent = "Not Found";
  currentTemp.textContent = "N/A";
  currentDate.textContent = "N/A";
  currentCondition.textContent = "N/A";
  windValue.textContent = "N/A";
  pressureValue.textContent = "N/A";
  humidityValue.textContent = "N/A";
  cloudValue.textContent = "N/A";
  aqiValue.textContent = "N/A";
  pressureStatus.textContent = "Invalid";
  humidityStatus.textContent = "Invalid";
  windStatus.textContent = "Invalid";
  cloudStatus.textContent = "Invalid";
  aqiStatus.textContent = "";
  aqiStatus.classList.remove(
    "status-good",
    "status-moderate",
    "status-unhealthy",
    "status-hazardous"
  );
  forecastRow.innerHTML = `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-4">
      <div class="forecast-card card p-4 pb-2 pb-xl-3">
        <h3 class="mb-1 pt-4 forecast-temp1">N/A</h3>
        <p class="text-muted m-0 pb-1 pt-4 forecast-condition-1">N/A</p>
        <p class="fw-bold m-0 forecast-date-1">Invalid date</p>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-lg-4 col-xl-4">
      <div class="forecast-card card p-4 pb-2 pb-xl-3">
        <h3 class="mb-1 pt-4 forecast-temp2">N/A</h3>
        <p class="text-muted m-0 pb-1 pt-4 forecast-condition-2">N/A</p>
        <p class="fw-bold m-0 forecast-date-2">Invalid date</p>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-lg-4 col-xl-4">
      <div class="forecast-card card p-4 pb-2 pb-xl-3">
        <h3 class="mb-1 pt-4 forecast-temp3">N/A</h3>
        <p class="text-muted m-0 pb-1 pt-4 forecast-condition-3">N/A</p>
        <p class="fw-bold m-0 forecast-date-3">Invalid date</p>
      </div>
    </div>
  `;
}
