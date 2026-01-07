# Smart Inventory Advisor - FastAPI Integration

> **AI-powered inventory decision system with FastAPI ML backend**

A production-ready web application that connects to a FastAPI backend for ML-driven inventory recommendations.

## 🎯 Overview

This frontend application integrates with a FastAPI backend that uses machine learning features for inventory forecasting. The system collects sales lag data, rolling statistics, promotional flags, and risk tolerance to generate actionable recommendations.

## 🔌 FastAPI Integration

### API Endpoint

```
POST /recommend
```

### Request Headers

```
Content-Type: application/json
```

### Request Body Schema

```json
{
  "lag_1": 0,           // Yesterday's sales
  "lag_7": 1,           // Sales 7 days ago
  "lag_14": 1,          // Sales 14 days ago
  "rolling_mean_7": 0.6,    // 7-day average sales
  "rolling_std_14": 1.2,    // 14-day sales variability
  "rolling_median_7": 1,    // 7-day median sales
  "promo": 1,           // Promotion flag (0 or 1)
  "festival": 0,        // Festival flag (0 or 1)
  "discount_pct": 20,   // Discount percentage (0-100)
  "day_of_week": 3,     // Day of week (0=Mon, 6=Sun)
  "week_of_year": 35,   // Week number (1-52)
  "month": 8,           // Month (1-12)
  "risk_alpha": 0.8     // Risk tolerance (0.0-1.0)
}
```

### Response Schema

```json
{
  "action": "ORDER",
  "quantity": 1,
  "risk_level": "High",
  "confidence_band": "0–1 units",
  "reason": "Baseline demand is low, but recent demand variability introduces uncertainty."
}
```

## 🛠️ Setup Instructions

### 1. Configure API URL

Edit `app.js` and update the API_URL constant:

```javascript
const API_URL = 'http://localhost:8000/recommend';  // Change to your FastAPI server URL
```

For production, use your deployed FastAPI URL:
```javascript
const API_URL = 'https://your-api-domain.com/recommend';
```

### 2. Start the Frontend

```bash
# Install dependencies (if not already done)
npm install

# Start the Express server (serves static files)
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Start Your FastAPI Backend

Make sure your FastAPI backend is running and accessible at the configured URL.

Example FastAPI startup:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Enable CORS on FastAPI

Your FastAPI backend must allow CORS requests from the frontend:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Form Fields Explained

| Field | API Parameter | Description |
|-------|---------------|-------------|
| Yesterday's Sales | `lag_1` | Sales from 1 day ago |
| Sales 7 Days Ago | `lag_7` | Sales from 7 days ago |
| Sales 14 Days Ago | `lag_14` | Sales from 14 days ago |
| 7-Day Average Sales | `rolling_mean_7` | Mean of last 7 days |
| 14-Day Sales Variability | `rolling_std_14` | Standard deviation of last 14 days |
| 7-Day Median Sales | `rolling_median_7` | Median of last 7 days |
| Promotion active | `promo` | 1 if promotion, 0 otherwise |
| Festival/Holiday | `festival` | 1 if festival, 0 otherwise |
| Discount Percentage | `discount_pct` | Discount % (0-100) |
| Day of Week | `day_of_week` | 0=Monday, 6=Sunday |
| Week of Year | `week_of_year` | Week number (1-52) |
| Month | `month` | Month number (1-12) |
| Risk Tolerance | `risk_alpha` | 0.0=conservative, 1.0=aggressive |

## 🎨 UI Features

- **Loading State**: Displays spinner while API request is in progress
- **Decision Cards**: Shows ORDER/NO ORDER with color-coded badges
- **Risk Indicators**: Visual risk level with colored dots (Low/Medium/High)
- **Confidence Band**: Displays the range from API response
- **Explanations**: Shows the reasoning from the ML model
- **Error Handling**: User-friendly error messages for API failures

## 🔍 Testing the Integration

### Test with cURL

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

### Test with Frontend

1. Open `http://localhost:3000`
2. Fill in the form with test values
3. Click "Get AI Recommendation"
4. Verify the decision card displays correctly

## 🚨 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Ensure your FastAPI backend has CORS middleware configured
- Check that `allow_origins` includes your frontend URL
- Verify the API URL in `app.js` is correct

### Connection Refused

If you see "Failed to connect to the API":
- Verify your FastAPI backend is running
- Check the API URL and port number
- Ensure there are no firewall blocking the connection

### Invalid Response

If the API returns unexpected data:
- Check the FastAPI response schema matches the expected format
- Verify all required fields are present: `action`, `quantity`, `risk_level`, `confidence_band`, `reason`
- Check the browser console for detailed error messages

## 📁 Project Structure

```
d:\website\
├── index.html          # Frontend UI with ML feature form
├── app.js              # API integration logic
├── styles.css          # Modern SaaS design
├── server.js           # Express server (serves static files)
├── package.json        # Dependencies
└── README.md           # This file
```

## � Customization

### Changing Default Values

Edit the `value` attributes in `index.html`:

```html
<input type="number" id="lag1" value="0" required>
```

### Updating Field Labels

Modify the `<label>` elements in `index.html` to match your business terminology.

### Styling

All styles are in `styles.css`. The design uses CSS variables for easy customization:

```css
--color-primary: hsl(174, 62%, 47%);  /* Teal */
--color-secondary: hsl(24, 95%, 58%); /* Orange */
```

## 📝 License

MIT License - feel free to use this project for demos, portfolios, or production.

---

**Built for seamless FastAPI ML backend integration**
