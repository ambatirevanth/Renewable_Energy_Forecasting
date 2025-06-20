// Handle form prediction
document.getElementById('predict-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value.toString(); // Convert all values to strings
  });

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("Prediction response:", result);

    const pred = result.predictions?.[0];
    if (pred) {
      const { value, lower_bound, upper_bound } = pred;
      document.getElementById('result').innerHTML = `
        <strong>Predicted Solar Irradiation:</strong> ${value.toFixed(2)} kWh/m²<br>
        <strong>Confidence Interval:</strong> [${lower_bound.toFixed(2)} – ${upper_bound.toFixed(2)}]
      `;
    } else {
      document.getElementById('result').textContent = `Unexpected response: ${JSON.stringify(result)}`;
    }
  } catch (err) {
    console.error("Frontend error:", err);
    document.getElementById('result').textContent = `Error: ${err.message}`;
  }
});

// Expose initMap globally for Google Maps
window.initMap = function () {
  const defaultPosition = { lat: 17.385044, lng: 78.486671 }; // Default: Hyderabad

  const map = new google.maps.Map(document.getElementById('map'), {
    center: defaultPosition,
    zoom: 6,
  });

  const marker = new google.maps.Marker({
    position: defaultPosition,
    map: map,
    draggable: true,
  });

  const geocoder = new google.maps.Geocoder();

  marker.addListener('dragend', async function () {
    const pos = marker.getPosition();
    const lat = pos.lat();
    const lon = pos.lng();

    // Auto-fill date
    const today = new Date();
    document.querySelector('input[name="year"]').value = today.getFullYear();
    document.querySelector('input[name="month"]').value = today.getMonth() + 1;
    document.querySelector('input[name="day"]').value = today.getDate();

    // Auto-select city
    geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const city = results[0].address_components.find(c => c.types.includes('locality'))?.long_name;
        const cityDropdown = document.querySelector('select[name="City"]');
        if (cityDropdown) {
          let found = false;
          if (city) {
            [...cityDropdown.options].forEach(opt => {
              if (opt.value.toLowerCase() === city.toLowerCase()) {
                cityDropdown.value = opt.value;
                found = true;
              }
            });
          }
          if (!found) {
            cityDropdown.value = "Other City";
          }
        }
      }
    });

    // Fetch weather from Tomorrow.io (via backend)
    try {
      const res = await fetch(`/weather-from-coords?lat=${lat}&lon=${lon}`);
      const data = await res.json();

      if (!data || !data.temperature) {
        alert("No weather data available for this location.");
        return;
      }

      document.querySelector('input[name="temperatu"]').value = data.temperature;
      document.querySelector('input[name="humidity"]').value = data.humidity;
      document.querySelector('input[name="dew_point"]').value = data.dew_point;
      document.querySelector('input[name="wind_spee"]').value = data.wind_speed;

      // Temp-dew gap
      if (data.temp_dew !== undefined) {
        document.querySelector('input[name="temp_dew"]').value = data.temp_dew.toFixed(2);
      } else {
        document.querySelector('input[name="temp_dew"]').value = '';
      }

      // Heat index
      if (data.heat_index !== undefined && !isNaN(data.heat_index)) {
        document.querySelector('input[name="heat_index"]').value = data.heat_index.toFixed(2);
      } else {
        const T = parseFloat(data.temperature);
        const R = parseFloat(data.humidity);
        const fallbackHI = T + 0.33 * R - 0.7;
        document.querySelector('input[name="heat_index"]').value = fallbackHI.toFixed(2);
      }
    } catch (err) {
      console.error('Tomorrow.io fetch failed:', err);
      alert("Failed to fetch weather data.");
    }
  });
};

// Wind map initialization
window.initWindMap = function () {
  const defaultPosition = { lat: 17.385044, lng: 78.486671 }; // Example: Hyderabad

  const map = new google.maps.Map(document.getElementById('wind-map'), {
    center: defaultPosition,
    zoom: 6,
  });

  const marker = new google.maps.Marker({
    position: defaultPosition,
    map: map,
    draggable: true,
  });

  // You can add event listeners here if you want to fetch weather or update form fields
};

function toggleDashboard() {
  const dropdown = document.getElementById('dashboardDropdown');
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (!dashboardContainer.contains(event.target)) {
    document.getElementById('dashboardDropdown').classList.remove('show');
  }
});
