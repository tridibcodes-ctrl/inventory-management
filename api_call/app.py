from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware


# Load ML artifacts ONCE at startup
model = joblib.load("artifacts/demand_forecast_model.pkl")
FEATURES = joblib.load("artifacts/feature_list.pkl")
q90 = joblib.load("artifacts/residual_q90.pkl")

app = FastAPI(
    title="Smart Inventory Advisor API",
    description="ML-powered demand forecasting and inventory recommendation service",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_methods=["*"],      
    allow_headers=["*"],      
)



# Request Schema
class RecommendationRequest(BaseModel):
    lag_1: float
    lag_7: float
    lag_14: float
    rolling_mean_7: float
    rolling_std_14: float
    rolling_median_7: float
    promo: int
    festival: int
    discount_pct: float
    day_of_week: int
    week_of_year: int
    month: int
    risk_alpha: float = 0.8   # default risk appetite (0–1)

# Response Schema (BUSINESS-FRIENDLY)
class RecommendationResponse(BaseModel):
    action: str
    quantity: int
    risk_level: str
    confidence_band: str
    reason: str

def build_explanation(req, p50_intensity, p90_intensity):
    reasons = []

    # Demand level
    if req.lag_1 > req.rolling_mean_7:
        reasons.append("recent sales are higher than usual")
    else:
        reasons.append("recent sales are lower than average")

    # Uncertainty
    if (p90_intensity - p50_intensity) > 0.5 * p50_intensity:
        reasons.append("demand uncertainty is elevated")
    else:
        reasons.append("demand uncertainty is low")

    # Promotions & events
    if req.promo:
        reasons.append("a promotion is currently active")

    if req.festival:
        reasons.append("the period coincides with a festival")

    if req.discount_pct >= 30:
        reasons.append("a high discount is applied")

    # Risk appetite
    if req.risk_alpha >= 0.7:
        reasons.append("a higher risk tolerance was selected")
    else:
        reasons.append("a conservative risk setting was selected")

    # Final sentence
    explanation = (
        "The recommendation considers that " +
        ", ".join(reasons) +
        "."
    )

    return explanation

# Helper Function
def risk_label(alpha: float) -> str:
    if alpha < 0.4:
        return "Low"
    elif alpha < 0.7:
        return "Medium"
    else:
        return "High"

# API Endpoint
@app.post("/recommend", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):

    # Build input DataFrame in correct feature order
    x_input = pd.DataFrame(
        [[getattr(req, feature) for feature in FEATURES]],
        columns=FEATURES
    )

    # Demand Forecast
    p50 = float(model.predict(x_input)[0])
    p90 = p50 + q90

    # Inventory Decision Logic
    recommended_order = max(
        0.0,
        p50 + req.risk_alpha * (p90 - p50)
    )

    order_qty = int(round(recommended_order))
    action = "ORDER" if order_qty > 0 else "NO_ORDER"

    # Explanation (Human-readable)
    reason = (
        "Baseline demand is low, but recent demand variability introduces uncertainty. "
        "A small safety buffer is recommended to reduce the risk of stock-outs."
    )

    return RecommendationResponse(
        action=action,
        quantity = int(req.lag_1 * (1 + req.discount_pct / 100) * req.risk_alpha),
        risk_level=risk_label(req.risk_alpha),
        confidence_band=f"{int(p50)}–{int(p90)} units",
        reason = build_explanation(req, p50, p90)

    )
