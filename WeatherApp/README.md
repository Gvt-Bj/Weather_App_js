# WeatherVue - Real-time Weather App

A beautiful and interactive weather application that provides real-time weather information and a 5-day forecast.

![WeatherVue App Screenshot](https://i.imgur.com/JIw9Vw6.jpg)

## Features

- **Real-time Weather Data**: Get accurate, up-to-date weather information using the OpenWeatherMap API
- **Geolocation Support**: Automatically detects and displays weather for your current location
- **Search Functionality**: Search for weather in any city worldwide
- **5-Day Forecast**: View weather predictions for the next 5 days
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Dynamic Background**: Background changes based on the current temperature
- **Smooth Animations**: Enjoy a polished user experience with smooth transitions and animations

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection
- An API key from OpenWeatherMap

### Setup

1. Clone or download this repository to your local machine
2. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
3. Open the `script.js` file and replace `'YOUR_API_KEY'` with your actual API key:
   ```javascript
   const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
   ```
4. Open `index.html` in your web browser

## Usage

1. When you first load the app, it will request permission to access your location
   - If you allow access, it will show weather for your current location
   - If you deny access or if geolocation fails, it will default to New York
2. To search for a different location:
   - Type a city name in the search box
   - Press Enter or click the search button
3. The app will display:
   - Current temperature
   - Weather description
   - Humidity percentage
   - Wind speed
   - A 5-day forecast

## Customization

Feel free to customize this app by:

- Changing the color scheme in the CSS file
- Adding more weather details like air pressure, visibility, etc.
- Implementing unit conversion (°C to °F)
- Adding a dark/light mode toggle

## Credits

- Weather data: [OpenWeatherMap API](https://openweathermap.org/api)
- Icons: [Font Awesome](https://fontawesome.com/) and OpenWeatherMap
- Fonts: [Google Fonts](https://fonts.google.com/) (Poppins)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Thanks to OpenWeatherMap for providing free access to their API
- Inspired by various modern weather app interfaces 