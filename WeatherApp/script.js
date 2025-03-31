// API key for OpenWeatherMap
const apiKey = '6c4122b8fa22469792638e624dc24798';

// API key for Unsplash (using a demo access key - for production, you should use your own)
const unsplashApiKey = '9abo-ZyiVVXcleZB60xFHJM0nvfVIXmClcpZ-Kht40s';

// Cities data for autocomplete
let citiesData = [];

const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const forecastSection = document.querySelector('.forecast');
const forecastContainer = document.querySelector('.forecast-container');
const searchInput = document.querySelector('.search-box input');
const dateTimeElement = document.querySelector('.date-time');
const citySuggestionsContainer = document.querySelector('.city-suggestions');
const cityImageContainer = document.querySelector('.city-image-container');
const cityImage = document.querySelector('.city-image');
const imageAttribution = document.querySelector('.image-attribution');

// Function to load city data for autocomplete
function loadCitiesData() {
    // We'll use a public API endpoint to get city data
    fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json')
        .then(response => response.json())
        .then(data => {
            citiesData = data;
            console.log('Cities data loaded successfully');
        })
        .catch(error => {
            console.error('Error loading cities data:', error);
            // Fallback to a smaller local dataset if the fetch fails
            citiesData = [
                { name: 'New York', country: 'US' },
                { name: 'London', country: 'GB' },
                { name: 'Paris', country: 'FR' },
                { name: 'Tokyo', country: 'JP' },
                { name: 'Sydney', country: 'AU' },
                { name: 'Dubai', country: 'AE' },
                { name: 'Delhi', country: 'IN' },
                { name: 'Moscow', country: 'RU' },
                { name: 'Beijing', country: 'CN' },
                { name: 'Los Angeles', country: 'US' }
            ];
        });
}

// Function to get city image from Unsplash
function getCityImage(city) {
    console.log('Attempting to fetch image for:', city);
    
    // Hide image container until we have a new image
    cityImageContainer.style.display = 'none';
    
    // Get random nature image if city name is not available
    const query = city ? `${city} city skyline` : 'nature landscape';
    
    // Set a default image in case API fails
    const defaultImageUrl = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800';
    
    // Fetch image from Unsplash API using a new endpoint that's more reliable
    fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${unsplashApiKey}`)
        .then(response => {
            console.log('Unsplash response status:', response.status);
            if (!response.ok) {
                throw new Error(`Unsplash API returned ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Image data received:', data ? 'yes' : 'no');
            
            if (data && data.urls) {
                cityImage.src = data.urls.regular;
                
                // Update attribution
                if (data.user) {
                    imageAttribution.innerHTML = `Photo by <a href="${data.user.links.html}?utm_source=WeatherVue&utm_medium=referral" target="_blank" style="color: white;">${data.user.name}</a> on <a href="https://unsplash.com/?utm_source=WeatherVue&utm_medium=referral" target="_blank" style="color: white;">Unsplash</a>`;
                }
                
                console.log('Setting image src to:', data.urls.regular);
                
                // Force image to be shown after a short delay
                setTimeout(() => {
                    cityImageContainer.style.display = 'block';
                }, 500);
                
                // When image loads, show the container
                cityImage.onload = function() {
                    console.log('Image loaded successfully');
                    cityImageContainer.style.display = 'block';
                };
                
                // Handle image loading errors
                cityImage.onerror = function() {
                    console.error('Error loading image:', cityImage.src);
                    useFallbackImage();
                };
            } else {
                console.error('Invalid image data structure:', data);
                useFallbackImage();
            }
        })
        .catch(error => {
            console.error('Error fetching city image:', error);
            useFallbackImage();
        });
        
    // Function to use fallback image
    function useFallbackImage() {
        console.log('Using fallback image');
        cityImage.src = defaultImageUrl;
        imageAttribution.innerHTML = 'Photo from Unsplash';
        
        // Force display regardless of load status
        setTimeout(() => {
            cityImageContainer.style.display = 'block';
        }, 300);
    }
}

// Function to get current location using geolocation
function getCurrentLocation() {
    // Show loading state
    showLoading();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoordinates(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
            // Default to a location if geolocation fails
            getWeatherByCity('New York');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        // Default to a location if geolocation is not supported
        getWeatherByCity('New York');
    }
}

// Function to show loading state
function showLoading() {
    // Make weather elements visible but with loading indicators
    weatherBox.style.display = 'block';
    weatherDetails.style.display = 'flex';
    forecastSection.style.display = 'block';
    
    const cityName = document.querySelector('.weather-box .city-name');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    
    cityName.textContent = 'Loading...';
    temperature.innerHTML = `--<span>°C</span>`;
    description.innerHTML = 'Fetching weather data';
    
    document.querySelector('.humidity span').textContent = '--';
    document.querySelector('.wind span').textContent = '--';
    
    forecastContainer.innerHTML = '<div style="width:100%; text-align:center;">Loading forecast...</div>';
}

// Function to update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    dateTimeElement.textContent = formattedDate;
    
    // Update every second
    setTimeout(updateDateTime, 1000);
}

// Function to get weather by coordinates
function getWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(json => {
            // Get city name from coordinates
            const cityName = json.name;
            // Get weather for the detected city
            getWeatherByCity(cityName);
        })
        .catch(error => {
            console.error('Error fetching location data:', error);
            // Default to a location if fetch fails
            getWeatherByCity('New York');
        });
}

// Function to filter city suggestions
function filterCities(query) {
    if (!query || query.length < 1) {
        citySuggestionsContainer.innerHTML = '';
        citySuggestionsContainer.style.display = 'none';
        return;
    }
    
    query = query.toLowerCase();
    
    // Make sure citiesData is loaded
    if (!citiesData || citiesData.length === 0) {
        citySuggestionsContainer.innerHTML = '<div class="city-suggestion">Loading cities data...</div>';
        citySuggestionsContainer.style.display = 'block';
        return;
    }
    
    const filtered = citiesData
        .filter(city => city.name.toLowerCase().startsWith(query))
        .slice(0, 5); // Limit to 5 suggestions
    
    citySuggestionsContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        citySuggestionsContainer.innerHTML = '<div class="city-suggestion">No cities found</div>';
        citySuggestionsContainer.style.display = 'block';
        return;
    }
    
    filtered.forEach(city => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('city-suggestion');
        suggestion.textContent = `${city.name}, ${city.country}`;
        suggestion.addEventListener('click', function() {
            console.log('City suggestion clicked:', city.name);
            searchInput.value = city.name;
            citySuggestionsContainer.innerHTML = '';
            citySuggestionsContainer.style.display = 'none';
            getWeatherByCity(city.name);
        });
        citySuggestionsContainer.appendChild(suggestion);
    });
    
    citySuggestionsContainer.style.display = 'block';
}

// Function to get weather by city name
function getWeatherByCity(city) {
    console.log('Getting weather for city:', city);
    
    // Get city image
    getCityImage(city);
    
    // API URL for current weather
    const currentWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    // API URL for 5-day forecast
    const forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    // Fetch current weather data
    fetch(currentWeatherAPI)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                showError();
                return;
            }

            // Hide error message
            error404.style.display = 'none';
            error404.classList.remove('fade-in');

            // Extract weather data
            const image = document.querySelector('.weather-box img');
            const temperature = document.querySelector('.weather-box .temperature');
            const description = document.querySelector('.weather-box .description');
            const cityName = document.querySelector('.weather-box .city-name');
            const humidity = document.querySelector('.humidity span');
            const wind = document.querySelector('.wind span');

            // Set city name
            cityName.textContent = json.name + ', ' + json.sys.country;

            // Set weather icon based on weather condition
            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'https://openweathermap.org/img/wn/01d@4x.png';
                    break;
                case 'Rain':
                    image.src = 'https://openweathermap.org/img/wn/10d@4x.png';
                    break;
                case 'Snow':
                    image.src = 'https://openweathermap.org/img/wn/13d@4x.png';
                    break;
                case 'Clouds':
                    image.src = 'https://openweathermap.org/img/wn/03d@4x.png';
                    break;
                case 'Mist':
                case 'Haze':
                    image.src = 'https://openweathermap.org/img/wn/50d@4x.png';
                    break;
                case 'Thunderstorm':
                    image.src = 'https://openweathermap.org/img/wn/11d@4x.png';
                    break;
                default:
                    image.src = 'https://openweathermap.org/img/wn/01d@4x.png';
            }

            // Set temperature, description, humidity, and wind speed
            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)} km/h`;

            // Show weather info with animation
            weatherBox.style.display = 'block';
            weatherDetails.style.display = 'flex';
            
            // We're showing elements immediately rather than animating them in
            weatherBox.classList.remove('fade-in');
            weatherDetails.classList.remove('fade-in');
            
            // Update background gradient based on temperature
            updateBackground(json.main.temp);

            // Fetch and display forecast data
            fetch(forecastAPI)
                .then(response => response.json())
                .then(forecastData => {
                    displayForecast(forecastData, 3); // Show only 3 days of forecast
                    forecastSection.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error fetching forecast data:', error);
                    forecastContainer.innerHTML = '<div style="width:100%; text-align:center;">Failed to load forecast</div>';
                    forecastSection.style.display = 'block';
                });
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            showError();
        });
}

// Function to display forecast - modified to accept a days parameter
function displayForecast(data, days = 5) {
    // Clear previous forecast data
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (data is every 3 hours)
    const dailyForecasts = {};
    
    // Group by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Only take first entry for each day
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });
    
    // Create forecast item for each day (limit to specified days)
    let count = 0;
    for (const day in dailyForecasts) {
        if (count >= days) break;
        
        const item = dailyForecasts[day];
        const temp = parseInt(item.main.temp);
        const icon = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
        
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <div class="day">${day}</div>
            <img src="${iconUrl}" alt="Weather icon">
            <div class="temp">${temp}°C</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
        count++;
    }
}

// Function to show error message
function showError() {
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    forecastSection.style.display = 'none';
    cityImageContainer.style.display = 'none';
    
    error404.style.display = 'block';
}

// Function to update the background gradient based on temperature
function updateBackground(temp) {
    let colorStart, colorEnd;
    
    if (temp < 0) {
        // Very cold
        colorStart = '#A1C4FD';
        colorEnd = '#C2E9FB';
    } else if (temp < 10) {
        // Cold
        colorStart = '#89F7FE';
        colorEnd = '#66A6FF';
    } else if (temp < 20) {
        // Mild
        colorStart = '#87CEEB';
        colorEnd = '#4169E1';
    } else if (temp < 30) {
        // Warm
        colorStart = '#FEE140';
        colorEnd = '#FA709A';
    } else {
        // Hot
        colorStart = '#FF9A9E';
        colorEnd = '#FECFEF';
    }
    
    document.body.style.background = `linear-gradient(to bottom, ${colorStart}, ${colorEnd})`;
}

// Event listener for search button
search.addEventListener('click', () => {
    const city = searchInput.value;
    if (city) {
        getWeatherByCity(city);
        // Clear suggestions when searching
        citySuggestionsContainer.innerHTML = '';
        citySuggestionsContainer.style.display = 'none';
    }
});

// Event listener for search input
searchInput.addEventListener('input', () => {
    filterCities(searchInput.value);
});

// Event listener for Enter key on search input
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = searchInput.value;
        if (city) {
            getWeatherByCity(city);
            // Clear suggestions when searching
            citySuggestionsContainer.innerHTML = '';
            citySuggestionsContainer.style.display = 'none';
        }
    }
});

// Load cities data and initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Show elements by default
    weatherBox.style.display = 'block';
    weatherDetails.style.display = 'flex';
    forecastSection.style.display = 'block';
    
    // Show default city image on initial load
    cityImageContainer.style.display = 'block';
    
    // Remove the display:none from CSS
    weatherBox.style.opacity = 1;
    weatherBox.style.scale = 1;
    weatherDetails.style.opacity = 1;
    weatherDetails.style.scale = 1;
    forecastSection.style.opacity = 1;
    forecastSection.style.scale = 1;
    
    // Start date and time updates
    updateDateTime();
    
    // Load cities data for autocomplete
    loadCitiesData();
    
    // Get weather for user's current location
    getCurrentLocation();
}); 