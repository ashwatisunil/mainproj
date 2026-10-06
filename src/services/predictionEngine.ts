import {
  MenuItem,
  Ingredient,
  WeatherCondition,
  CalendarEvent,
  DemandPrediction,
  IngredientRequirement
} from '../types';

export const DAY_OF_WEEK_FACTORS: Record<string, number> = {
  Monday: 0.85,
  Tuesday: 0.88,
  Wednesday: 0.95,
  Thursday: 1.08,
  Friday: 1.35,
  Saturday: 1.45,
  Sunday: 1.25
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Calculates 7-day Simple Moving Average (SMA) from historical sales array
 */
export function calculateSMA(history: number[]): number {
  if (!history || history.length === 0) return 40;
  const sum = history.reduce((acc, val) => acc + val, 0);
  return Number((sum / history.length).toFixed(1));
}

/**
 * Generates demand prediction for all active menu items based on:
 * - 7-day historical sales moving average (SMA)
 * - Day of week seasonality
 * - Real-time/preset Weather heuristics
 * - Local Calendar event & holiday heuristics
 */
export function generateDemandPredictions(
  menuItems: MenuItem[],
  targetDayOfWeek: string,
  weather: WeatherCondition,
  event: CalendarEvent
): DemandPrediction[] {
  const dowFactor = DAY_OF_WEEK_FACTORS[targetDayOfWeek] || 1.0;

  return menuItems
    .filter(item => item.active)
    .map(item => {
      const baseDemand = item.baseAverageDemand || calculateSMA(item.historicalWeeklySales);
      
      // Weather coefficient for this specific menu category
      const weatherMultiplier = weather.categoryMultipliers[item.category] ?? weather.deliveryMultiplier ?? 1.0;
      
      // Event coefficient
      const eventMultiplier = event.categoryMultipliers[item.category] ?? 1.0;

      // Combined formula
      const rawForecast = baseDemand * dowFactor * weatherMultiplier * eventMultiplier;
      const forecastUnits = Math.max(5, Math.round(rawForecast));

      // Calculate confidence interval (+/- 10%)
      const confidenceLower = Math.max(1, Math.round(forecastUnits * 0.88));
      const confidenceUpper = Math.round(forecastUnits * 1.14);

      const projectedRevenue = Number((forecastUnits * item.price).toFixed(2));

      // Human-readable transparent heuristic reasoning
      const reasons: string[] = [];
      if (dowFactor > 1.1) reasons.push(`${targetDayOfWeek} peak surge (+${Math.round((dowFactor - 1) * 100)}%)`);
      else if (dowFactor < 0.9) reasons.push(`${targetDayOfWeek} lower volume (${Math.round((dowFactor - 1) * 100)}%)`);

      if (weatherMultiplier > 1.05) reasons.push(`${weather.type} climate boost (+${Math.round((weatherMultiplier - 1) * 100)}%)`);
      else if (weatherMultiplier < 0.95) reasons.push(`${weather.type} dampens orders (${Math.round((weatherMultiplier - 1) * 100)}%)`);

      if (eventMultiplier > 1.05) reasons.push(`${event.title.split(' ')[0]} lift (+${Math.round((eventMultiplier - 1) * 100)}%)`);

      const reasoning = reasons.length > 0 ? reasons.join(' · ') : 'Standard baseline demand';

      return {
        menuItemId: item.id,
        menuItemName: item.name,
        brand: item.brand,
        category: item.category,
        baseDemand,
        dowFactor,
        weatherFactor: weatherMultiplier,
        eventFactor: eventMultiplier,
        forecastUnits,
        confidenceLower,
        confidenceUpper,
        projectedRevenue,
        reasoning
      };
    });
}

/**
 * Explodes Bill of Materials (BOM) from forecast to raw ingredients
 * Compares required stock against on-hand inventory and safety thresholds.
 */
export function calculateIngredientRequirements(
  predictions: DemandPrediction[],
  menuItems: MenuItem[],
  ingredients: Ingredient[]
): IngredientRequirement[] {
  // Aggregate required raw amounts per ingredientId
  const neededMap: Record<string, number> = {};

  predictions.forEach(prediction => {
    const menuItem = menuItems.find(m => m.id === prediction.menuItemId);
    if (!menuItem) return;

    menuItem.recipe.forEach(recipeItem => {
      const totalAmount = recipeItem.amount * prediction.forecastUnits;
      neededMap[recipeItem.ingredientId] = (neededMap[recipeItem.ingredientId] || 0) + totalAmount;
    });
  });

  return ingredients.map(ing => {
    const rawRequired = neededMap[ing.id] || 0;
    const requiredAmount = Number(rawRequired.toFixed(2));
    const currentStock = Number(ing.currentStock.toFixed(2));
    const safetyStock = ing.safetyStock;

    // Shortage formula: Needed for shift + Safety Buffer - Available On Hand
    const netShortage = Math.max(0, Number(((requiredAmount + safetyStock) - currentStock).toFixed(2)));

    // Recommended order quantity (rounded up to nearest pack or logical increment)
    let recommendedOrder = 0;
    if (netShortage > 0) {
      if (ing.packSize > 1) {
        recommendedOrder = Math.ceil(netShortage / ing.packSize) * ing.packSize;
      } else {
        recommendedOrder = Math.ceil(netShortage);
      }
    }

    const estimatedCost = Number((recommendedOrder * ing.unitCost).toFixed(2));

    let status: 'critical' | 'warning' | 'sufficient' = 'sufficient';
    if (currentStock < requiredAmount) {
      status = 'critical'; // Will stock out mid-shift!
    } else if (currentStock < requiredAmount + safetyStock) {
      status = 'warning'; // Below safety threshold
    }

    return {
      ingredientId: ing.id,
      ingredientName: ing.name,
      unit: ing.unit,
      requiredAmount,
      currentStock,
      safetyStock,
      shortageAmount: netShortage,
      recommendedOrder,
      unitCost: ing.unitCost,
      estimatedCost,
      supplierName: ing.supplierName,
      storageZone: ing.storageZone,
      status
    };
  });
}

/**
 * Checks for ingredients expiring within the next 48 hours to alert chef & manager
 */
export function getExpiringIngredients(ingredients: Ingredient[]) {
  const now = new Date();
  const thresholdDays = 3; // within 3 days
  
  return ingredients.filter(ing => {
    const exp = new Date(ing.expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= thresholdDays;
  });
}
