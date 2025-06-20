# 🌤️ Renewable Energy Forecasting using Cloud Services

This project focuses on forecasting renewable energy generation (Solar & Wind) using machine learning models deployed on the cloud. It provides a full-stack solution for data ingestion, analysis, prediction, and real-time visualization.

## 🚀 Project Features

- 📈 **Time Series Forecasting**: Predict solar and wind energy generation using historical weather and energy data.
- ☁️ **Google Cloud Integration**:
  - BigQuery for data storage
  - Vertex AI for model training and deployment
- 🗺️ **Interactive Dashboard**:
  - Visualizations (Bar, Line, Pie charts)
  - City-wise energy data mapping

## 🛠️ Technologies Used

| Layer              | Tools & Services |
|-------------------|------------------|
| Frontend          | HTML, CSS, JavaScript |
| Backend           | Node.js, Express.js |
| ML & Prediction   | Vertex AI, Python |
| Database          | BigQuery |
| Hosting           | Google Cloud Platform (GCP) |
| Visualization     | Google Charts / D3.js |

## 📊 Dashboards

- **Solar Forecast Dashboard** – Real-time solar generation trends.
- **Wind Forecast Dashboard** – Visualizes wind energy predictions.
- **Combined Energy Report** – Interactive charts and comparisons.

## 🧠 ML Model

- Trained on time series weather and generation data
- Deployed using Vertex AI
- Automated pipeline triggers via GCP

## 📦 Folder Structure

```bash
cloud-app/
│
├── backend/               # Node.js API
├── frontend/              # HTML, CSS, JS for UI
├── model/                 # ML model & prediction scripts
├── data/                  # Dataset files (CSV/JSON)
└── README.md
