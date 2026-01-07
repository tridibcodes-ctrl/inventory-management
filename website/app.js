// Smart Inventory Advisor - Frontend Logic
// Handles form submission and FastAPI integration

document.addEventListener('DOMContentLoaded', () => {
    // === Carousel Functionality ===
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    if (carouselTrack) {
        const slides = carouselTrack.querySelectorAll('.carousel-slide');
        let currentIndex = 0;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Auto-advance carousel every 5 seconds
        setInterval(nextSlide, 5000);
    }

    // === Form and UI Elements ===
    // DOM Elements
    const form = document.getElementById('recommendForm');
    const resultsArea = document.getElementById('resultsArea');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const decisionCard = document.getElementById('decisionCard');

    // Slider elements
    const discountSlider = document.getElementById('discountSlider');
    const discountValue = document.getElementById('discountValue');
    const riskSlider = document.getElementById('riskSlider');
    const riskValue = document.getElementById('riskValue');

    // Collapsible section elements
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedContent = document.getElementById('advancedContent');
    const advancedChevron = document.getElementById('advancedChevron');

    // API Configuration - Update this URL to your FastAPI backend
    const API_URL = 'http://localhost:8000/recommend';  // Change this to your FastAPI server URL

    // Update slider value displays
    function updateSliderDisplay(slider, display, suffix = '%') {
        display.textContent = slider.value + suffix;
        // Update CSS variable for gradient
        const percentage = (slider.value / slider.max) * 100;
        slider.style.setProperty('--slider-value', percentage + '%');
    }

    // Initialize slider displays
    updateSliderDisplay(discountSlider, discountValue);
    updateSliderDisplay(riskSlider, riskValue);

    // Slider event listeners
    discountSlider.addEventListener('input', () => {
        updateSliderDisplay(discountSlider, discountValue);
    });

    riskSlider.addEventListener('input', () => {
        updateSliderDisplay(riskSlider, riskValue);
    });

    // Collapsible section toggle
    advancedToggle.addEventListener('click', () => {
        advancedContent.classList.toggle('open');
        advancedChevron.classList.toggle('open');
    });

    // Helper function: Get week number of the year
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Helper function: Calculate lag values based on trend
    function calculateLag7(yesterdaySales, trend) {
        if (trend === 'increasing') {
            return Math.round(yesterdaySales * 0.85); // Sales were lower 7 days ago
        } else if (trend === 'decreasing') {
            return Math.round(yesterdaySales * 1.15); // Sales were higher 7 days ago
        } else {
            return yesterdaySales; // Stable
        }
    }

    function calculateLag14(yesterdaySales, trend) {
        if (trend === 'increasing') {
            return Math.round(yesterdaySales * 0.70); // Sales were even lower 14 days ago
        } else if (trend === 'decreasing') {
            return Math.round(yesterdaySales * 1.30); // Sales were even higher 14 days ago
        } else {
            return yesterdaySales; // Stable
        }
    }

    // Helper function: Calculate rolling mean
    function calculateRollingMean(yesterdaySales, trend) {
        if (trend === 'increasing') {
            return parseFloat((yesterdaySales * 0.90).toFixed(2)); // Average slightly lower
        } else if (trend === 'decreasing') {
            return parseFloat((yesterdaySales * 1.10).toFixed(2)); // Average slightly higher
        } else {
            return parseFloat(yesterdaySales.toFixed(2)); // Stable
        }
    }

    // Helper function: Calculate rolling standard deviation
    function calculateRollingStd(yesterdaySales, trend) {
        if (trend === 'increasing' || trend === 'decreasing') {
            return parseFloat((yesterdaySales * 0.25).toFixed(2)); // Higher variability with trends
        } else {
            return parseFloat((yesterdaySales * 0.15).toFixed(2)); // Lower variability when stable
        }
    }

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get simplified business-friendly values
        const yesterdaySales = parseInt(document.getElementById('yesterdaySales').value);
        const salesTrend = document.getElementById('salesTrend').value;
        const promoActive = document.getElementById('promoActive').checked;
        const discountPct = parseInt(document.getElementById('discountSlider').value);
        const riskTolerance = parseInt(document.getElementById('riskSlider').value);
        const festivalActive = document.getElementById('festivalActive').checked;

        // Auto-compute technical features
        const lag1 = yesterdaySales;
        const lag7 = calculateLag7(yesterdaySales, salesTrend);
        const lag14 = calculateLag14(yesterdaySales, salesTrend);
        const rollingMean7 = calculateRollingMean(yesterdaySales, salesTrend);
        const rollingStd14 = calculateRollingStd(yesterdaySales, salesTrend);
        const rollingMedian7 = yesterdaySales; // Approximate as yesterday's sales

        // Auto-compute calendar features from current date
        const today = new Date();
        const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        const weekOfYear = getWeekNumber(today);
        const month = today.getMonth() + 1;

        // Convert risk tolerance from 0-100 to 0.0-1.0
        const riskAlpha = riskTolerance / 100;

        // Prepare request payload matching FastAPI schema
        const payload = {
            lag_1: lag1,
            lag_7: lag7,
            lag_14: lag14,
            rolling_mean_7: rollingMean7,
            rolling_std_14: rollingStd14,
            rolling_median_7: rollingMedian7,
            promo: promoActive ? 1 : 0,
            festival: festivalActive ? 1 : 0,
            discount_pct: discountPct,
            day_of_week: dayOfWeek,
            week_of_year: weekOfYear,
            month: month,
            risk_alpha: riskAlpha
        };

        // Show loading state
        showLoading();

        try {
            // Make API call to FastAPI backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || `API error: ${response.status}`);
            }

            const data = await response.json();

            // Display results
            displayResults(data);

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to connect to the API. Please ensure the FastAPI backend is running.');
        }
    });

    // Show loading state
    function showLoading() {
        resultsArea.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        decisionCard.classList.add('hidden');
    }

    // Show error message
    function showError(message) {
        resultsArea.classList.remove('hidden');
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        decisionCard.classList.add('hidden');
        errorState.textContent = message;
    }

    // Generate qualitative forecast signal from API data
    function generateForecastSignal(data) {
        const action = data.action || 'UNKNOWN';
        const quantity = data.quantity || 0;
        const riskLevel = (data.risk_level || 'medium').toLowerCase();
        const confidenceBand = data.confidence_band || '';

        // Parse confidence band to understand variability
        // Expected format: "X.X–Y.Y units" or similar
        let variability = 'moderate';
        if (confidenceBand.includes('–') || confidenceBand.includes('-')) {
            const parts = confidenceBand.split(/[–-]/);
            if (parts.length === 2) {
                const lower = parseFloat(parts[0]);
                const upper = parseFloat(parts[1]);
                const range = upper - lower;
                const midpoint = (upper + lower) / 2;

                if (midpoint > 0) {
                    const rangeRatio = range / midpoint;
                    if (rangeRatio > 0.8) {
                        variability = 'high';
                    } else if (rangeRatio < 0.3) {
                        variability = 'low';
                    }
                }
            }
        }

        // Generate signal based on action, quantity, and variability
        if (action === 'NO ORDER' || quantity === 0) {
            if (variability === 'high') {
                return 'Sparse demand with high uncertainty';
            } else if (variability === 'low') {
                return 'Low baseline demand, stable pattern';
            } else {
                return 'Insufficient demand signal detected';
            }
        } else {
            // ORDER action
            if (quantity < 20) {
                if (variability === 'high') {
                    return 'Low baseline demand, elevated variability';
                } else {
                    return 'Modest demand with stable pattern';
                }
            } else if (quantity < 50) {
                if (variability === 'high') {
                    return 'Moderate demand with uncertainty';
                } else {
                    return 'Steady demand pattern detected';
                }
            } else {
                if (variability === 'high') {
                    return 'Strong demand signal, volatile conditions';
                } else if (riskLevel === 'low') {
                    return 'Strong demand signal with confidence';
                } else {
                    return 'High demand forecast, monitor closely';
                }
            }
        }
    }

    // Display results in decision card
    function displayResults(data) {
        // Hide loading and error
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');

        // Show decision card
        decisionCard.classList.remove('hidden');

        // Update decision badge (action field from API)
        const decisionBadge = document.getElementById('decisionBadge');
        const action = data.action || 'UNKNOWN';
        decisionBadge.textContent = action;
        decisionBadge.className = 'decision-badge';

        if (action === 'ORDER') {
            decisionBadge.classList.add('order');
        } else {
            decisionBadge.classList.add('no-order');
        }

        // Update risk indicator (risk_level field from API)
        const riskIndicator = document.getElementById('riskIndicator');
        const riskText = document.getElementById('riskText');
        const riskLevel = data.risk_level || 'Unknown';

        riskIndicator.className = 'risk-indicator';

        // Map risk level to CSS classes
        const riskLower = riskLevel.toLowerCase();
        if (riskLower === 'low') {
            riskIndicator.classList.add('risk-low');
            riskText.textContent = 'Low Risk';
        } else if (riskLower === 'medium') {
            riskIndicator.classList.add('risk-medium');
            riskText.textContent = 'Medium Risk';
        } else if (riskLower === 'high') {
            riskIndicator.classList.add('risk-high');
            riskText.textContent = 'High Risk';
        } else {
            riskIndicator.classList.add('risk-medium');
            riskText.textContent = riskLevel;
        }

        // Update quantity (quantity field from API)
        const quantity = data.quantity !== undefined ? data.quantity : 0;
        document.getElementById('quantityValue').textContent = quantity;

        // Generate and display forecast signal
        const forecastSignal = generateForecastSignal(data);
        document.getElementById('forecastSignalText').textContent = forecastSignal;

        // Update explanation (reason field from API)
        const explanation = data.reason || 'No explanation provided.';
        document.getElementById('explanationText').textContent = explanation;

        // Scroll to results
        decisionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
