# Smart Inventory Advisor

> **AI-powered inventory management system with ML-driven demand forecasting**

A full-stack application combining a FastAPI backend with machine learning models and a modern web frontend for intelligent inventory recommendations.

## 🎯 Overview

This system uses machine learning to analyze sales patterns, promotional activities, and seasonal trends to provide actionable inventory recommendations. It helps businesses optimize stock levels by balancing demand forecasts with risk tolerance.

## 🏗️ Architecture

```
inventory_management/
├── api_call/              # FastAPI ML Backend
│   ├── app.py            # Main API server
│   └── artifacts/        # ML model files
│       ├── demand_forecast_model.pkl
│       ├── feature_list.pkl
│       ├── model_metadata.pkl
│       └── residual_q90.pkl
│
└── website/              # Frontend Application
    ├── index.html        # UI with ML feature form
    ├── app.js            # API integration logic
    ├── styles.css        # Modern SaaS design
    ├── server.js         # Express server
    └── images/           # UI assets
```

## ✨ Features

### Backend (FastAPI)
- **ML-Powered Forecasting**: Quantile regression for demand prediction
- **Risk-Adjusted Recommendations**: Customizable risk tolerance (0.0-1.0)
- **Feature Engineering**: Lag features, rolling statistics, promotional flags
- **Business-Friendly Responses**: Clear action items with explanations
- **CORS Enabled**: Ready for frontend integration

### Frontend (Web App)
- **Modern SaaS Design**: Clean, professional interface
- **Real-time Recommendations**: Instant API integration
- **Risk Visualization**: Color-coded risk levels (Low/Medium/High)
- **Decision Cards**: Clear ORDER/NO ORDER actions
- **Loading States**: Smooth UX with spinners
- **Error Handling**: User-friendly error messages

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to API directory**
   ```bash
   cd api_call
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**
   ```bash
   uvicorn app:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   
   View API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to website directory**
   ```bash
   cd website
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Start the Express server**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 📊 API Usage

### Endpoint
```
POST /recommend
```

### Request Example
```json
{
  "lag_1": 0,
  "lag_7": 1,
  "lag_14": 1,
  "rolling_mean_7": 0.6,
  "rolling_std_14": 1.2,
  "rolling_median_7": 1,
  "promo": 1,
  "festival": 0,
  "discount_pct": 20,
  "day_of_week": 3,
  "week_of_year": 35,
  "month": 8,
  "risk_alpha": 0.8
}
```

### Response Example
```json
{
  "action": "ORDER",
  "quantity": 1,
  "risk_level": "High",
  "confidence_band": "0–1 units",
  "reason": "The recommendation considers that recent sales are lower than average, demand uncertainty is elevated, a promotion is currently active, a higher risk tolerance was selected."
}
```

## 🔧 Configuration

### API URL (Frontend)
Edit `website/app.js`:
```javascript
const API_URL = 'http://localhost:8000/recommend';
```

For production:
```javascript
const API_URL = 'https://your-api-domain.com/recommend';
```

### CORS Settings (Backend)
Edit `api_call/app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📈 ML Features Explained

| Feature | Description | Range |
|---------|-------------|-------|
| `lag_1` | Yesterday's sales | 0+ |
| `lag_7` | Sales 7 days ago | 0+ |
| `lag_14` | Sales 14 days ago | 0+ |
| `rolling_mean_7` | 7-day average sales | 0+ |
| `rolling_std_14` | 14-day sales variability | 0+ |
| `rolling_median_7` | 7-day median sales | 0+ |
| `promo` | Promotion flag | 0 or 1 |
| `festival` | Festival/holiday flag | 0 or 1 |
| `discount_pct` | Discount percentage | 0-100 |
| `day_of_week` | Day of week | 0-6 (0=Mon) |
| `week_of_year` | Week number | 1-52 |
| `month` | Month | 1-12 |
| `risk_alpha` | Risk tolerance | 0.0-1.0 |

## 🧪 Testing

### Test Backend with cURL
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "lag_1": 0,
    "lag_7": 1,
    "lag_14": 1,
    "rolling_mean_7": 0.6,
    "rolling_std_14": 1.2,
    "rolling_median_7": 1,
    "promo": 1,
    "festival": 0,
    "discount_pct": 20,
    "day_of_week": 3,
    "week_of_year": 35,
    "month": 8,
    "risk_alpha": 0.8
  }'
```

### Test Frontend
1. Open `http://localhost:3000`
2. Fill in the form with test values
3. Click "Get AI Recommendation"
4. Verify the decision card displays correctly

## 🛠️ Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- Scikit-learn - ML model (Quantile Regression)
- Pandas - Data manipulation
- Joblib - Model serialization
- Uvicorn - ASGI server

**Frontend:**
- HTML5 - Structure
- CSS3 - Modern SaaS styling
- Vanilla JavaScript - API integration
- Express.js - Static file server
- Node.js - Runtime

## 🚨 Troubleshooting

### CORS Errors
- Ensure FastAPI CORS middleware is configured
- Verify `allow_origins` includes your frontend URL
- Check API URL in `app.js` is correct

### Connection Refused
- Verify FastAPI backend is running on port 8000
- Check firewall settings
- Ensure correct API URL and port

### Invalid Response
- Verify response schema matches expected format
- Check browser console for detailed errors
- Ensure all required fields are present in response

## 📝 License

MIT License - feel free to use this project for demos, portfolios, or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for intelligent inventory management**
