# Candy Pop Weather (Frontend Only)

A playful, vibrant React weather dashboard using OpenWeatherMap's free API.
Features:
- Header with city search
- Current weather card (temp, feels-like, humidity, wind, pressure)
- Horizontal 7-day forecast scroller
- Units toggle (°C/°F)
- Informative loading and error states
- No login/signup (frontend only)

## Setup

1) Install dependencies:
   npm install

2) Create a .env file:
   cp .env.example .env
   # Edit .env and set:
   # REACT_APP_OWM_API_KEY=your_api_key

Get a free API key from: https://openweathermap.org/appid

3) Start:
   npm start

Open http://localhost:3000

## Free API Endpoints Used

- Geocoding: https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API key}
- One Call 3.0: https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&units=metric&appid={API key}

Notes:
- No server proxy is required for this demo; requests are made from the browser.
- Respect rate limits on the free tier; avoid excessive searches.

## Environment Variables

- REACT_APP_OWM_API_KEY: Your OpenWeatherMap API key.

## Styling

Candy Pop theme: sweet pastels & bright accents; playful rounded cards; cheerful gradients. See src/theme.css

## Structure

- src/services/weatherApi.js: API helpers and light error handling
- src/App.js: UI and state management
- src/theme.css: main visuals
- src/App.css: minimal resets

## Credits

- Data: OpenWeatherMap
- Icons: OpenWeatherMap icon set
- Built with React
