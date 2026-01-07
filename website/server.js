const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper function to calculate average
const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// Helper function to calculate standard deviation
const stdDev = (arr) => {
  const avg = average(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(average(squareDiffs));
};

// POST /recommend endpoint
app.post('/recommend', (req, res) => {
  try {
    const { recentSales, isPromotion, discount, riskAppetite } = req.body;

    // Validation
    if (!recentSales || !Array.isArray(recentSales) || recentSales.length === 0) {
      return res.status(400).json({ error: 'Recent sales data is required (array of numbers)' });
    }
    if (typeof isPromotion !== 'boolean') {
      return res.status(400).json({ error: 'Promotion flag is required (true/false)' });
    }
    if (typeof discount !== 'number' || discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'Discount must be a number between 0 and 100' });
    }
    if (!['conservative', 'moderate', 'aggressive'].includes(riskAppetite)) {
      return res.status(400).json({ error: 'Risk appetite must be: conservative, moderate, or aggressive' });
    }

    // Calculate base forecast from recent sales
    const avgSales = average(recentSales);
    const salesStdDev = stdDev(recentSales);
    
    // Apply promotion/festival multiplier
    let demandMultiplier = 1.0;
    if (isPromotion) {
      demandMultiplier = 1.3; // 30% increase for promotions
    }

    // Apply discount effect (higher discount = higher demand)
    const discountEffect = 1 + (discount / 100) * 0.5; // 50% of discount translates to demand increase
    
    // Calculate forecasted demand
    const forecastedDemand = avgSales * demandMultiplier * discountEffect;
    
    // Calculate uncertainty (confidence band)
    const uncertainty = salesStdDev * 1.5; // 1.5x std dev for confidence interval
    const confidenceLower = Math.max(0, forecastedDemand - uncertainty);
    const confidenceUpper = forecastedDemand + uncertainty;

    // Risk-aware decision making
    let recommendedQuantity;
    let riskLevel;
    let decision;
    let explanation;

    switch (riskAppetite) {
      case 'conservative':
        // Order based on lower bound to minimize overstock risk
        recommendedQuantity = Math.round(confidenceLower);
        riskLevel = 'low';
        
        if (recommendedQuantity < avgSales * 0.5) {
          decision = 'NO ORDER';
          explanation = `Based on conservative analysis, demand uncertainty is high. Current inventory should suffice. Forecasted demand: ${Math.round(forecastedDemand)} units with wide confidence band (${Math.round(confidenceLower)}-${Math.round(confidenceUpper)}).`;
        } else {
          decision = 'ORDER';
          explanation = `Conservative recommendation to minimize overstock risk. Order ${recommendedQuantity} units based on lower confidence bound. Forecasted demand: ${Math.round(forecastedDemand)} units.`;
        }
        break;

      case 'moderate':
        // Order based on forecasted demand
        recommendedQuantity = Math.round(forecastedDemand);
        riskLevel = 'medium';
        decision = 'ORDER';
        
        const promotionText = isPromotion ? ' Promotion expected to boost demand by 30%.' : '';
        const discountText = discount > 0 ? ` ${discount}% discount will drive additional sales.` : '';
        explanation = `Balanced approach based on forecasted demand of ${recommendedQuantity} units.${promotionText}${discountText} Confidence range: ${Math.round(confidenceLower)}-${Math.round(confidenceUpper)} units.`;
        break;

      case 'aggressive':
        // Order based on upper bound to maximize sales opportunity
        recommendedQuantity = Math.round(confidenceUpper);
        riskLevel = 'high';
        decision = 'ORDER';
        
        explanation = `Aggressive strategy to capture maximum sales opportunity. Order ${recommendedQuantity} units based on upper confidence bound. This minimizes stockout risk but increases overstock possibility. Forecasted demand: ${Math.round(forecastedDemand)} units.`;
        break;
    }

    // Prepare response
    const response = {
      decision,
      recommendedQuantity,
      riskLevel,
      confidence: {
        forecast: Math.round(forecastedDemand),
        lower: Math.round(confidenceLower),
        upper: Math.round(confidenceUpper)
      },
      explanation,
      metadata: {
        avgRecentSales: Math.round(avgSales),
        promotionApplied: isPromotion,
        discountApplied: discount,
        riskAppetite
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error processing recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Inventory Advisor running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: POST http://localhost:${PORT}/recommend`);
});
