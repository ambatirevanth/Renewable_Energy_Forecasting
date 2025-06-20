require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Vertex AI configuration
const PROJECT_ID = 'tenacious-tiger-460508-h0'; // ✅ Replace if needed
const REGION = 'us-central1';
const ENDPOINT_ID = '2197876464924229632'; // ✅ Replace if needed
const ENDPOINT_ID2 = '1665325808987668480'; // ✅ Replace if needed
const MODEL_URL = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID}:predict`;
const MODEL_URL_2 = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${ENDPOINT_ID2}:predict`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Predict route
app.post('/predict', async (req, res) => {
  try {
    const raw = req.body;
    console.log("\n📩 Incoming Request Body:", raw);

    const instance = {
      year: String(raw.year),
      month: String(raw.month),
      day: String(raw.day),
      temperature: String(raw.temperatu),
      humidity: String(raw.humidity),
      dew_point: String(raw.dew_point),
      wind_speed: String(raw.wind_spee),
      City: raw.City,
      temp_dew_gap: String(raw.temp_dew),
      heat_index: String(raw.heat_index)
    };
    

    const payload = { instances: [instance] };
    console.log("📦 Payload Sent to Vertex AI:", JSON.stringify(payload, null, 2));

    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, 'key.json'),
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await axios.post(MODEL_URL, payload, {
      headers: {
        Authorization: `Bearer ${accessToken.token || accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Vertex AI Prediction Response:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('\n🔴 Vertex AI Prediction Error:');
    console.error('📛 Message:', error.message);
    console.error('📄 Response Data:', error.response?.data);
    console.error('🧱 Stack:', error.stack);

    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Predict route for wind
app.post('/predict-wind', async (req, res) => {
  try {
    const raw = req.body;
    console.log("\n📩 [WIND] Incoming Request Body:", raw);

    // Use new wind model parameters
    const instance = {
      YEAR: String(raw.YEAR ?? '2024'),
      MO: String(raw.MO ?? '1'),
      DY: String(raw.DY ?? '1'),
      HR: String(raw.HR ?? '0'),
      WS10M: String(raw.WS10M ?? '0'),
      WD50M: String(raw.WD50M ?? '0'),
      T2M: String(raw.T2M ?? '0'),
      RH2M: String(raw.RH2M ?? '0'),
      PS: String(raw.PS ?? '1013')
    };

    const payload = { instances: [instance] };
    console.log("📦 [WIND] Payload Sent to Vertex AI:", JSON.stringify(payload, null, 2));

    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, 'key.json'),
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await axios.post(MODEL_URL_2, payload, {
      headers: {
        Authorization: `Bearer ${accessToken.token || accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ [WIND] Vertex AI Prediction Response:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('\n🔴 [WIND] Vertex AI Prediction Error:');
    console.error('📛 Message:', error.message);
    console.error('📄 Response Data:', error.response?.data);
    console.error('🧱 Stack:', error.stack);

    res.status(500).json({ error: 'Wind prediction failed' });
  }
});

// Weather data fetch from Tomorrow.io
app.get('/weather-from-coords', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.TOMORROW_API_KEY;

  try {
    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${apiKey}&timesteps=1d&fields=temperatureAvg,humidityAvg,dewPointAvg,windSpeedAvg,heatIndexAvg,solarGHIAvg`;
    const response = await axios.get(url);
    const values = response.data.timelines.daily[0].values;

    const temperature = values.temperatureAvg;
    const humidity = values.humidityAvg;
    const dew_point = values.dewPointAvg;
    const wind_speed = values.windSpeedAvg;
    const heat_index = values.heatIndexAvg;
    const temp_dew = temperature - dew_point;

    res.json({ temperature, humidity, dew_point, wind_speed, heat_index, temp_dew });
  } catch (err) {
    console.error('Tomorrow.io API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data from Tomorrow.io' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});