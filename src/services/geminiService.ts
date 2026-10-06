import { GoogleGenAI } from '@google/genai';
import { DemandPrediction, IngredientRequirement, WeatherCondition, CalendarEvent } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (apiKey) {
    try {
      aiInstance = new GoogleGenAI({ apiKey });
      return aiInstance;
    } catch (e) {
      console.warn('Error initializing GoogleGenAI:', e);
    }
  }
  return null;
}

export interface CopilotBriefing {
  summary: string;
  urgentActions: string[];
  prepRecommendations: string[];
  costOptimizationTip: string;
}

/**
 * Generates an executive daily Indian cloud kitchen operations briefing
 */
export async function getKitchenBriefing(
  dayOfWeek: string,
  weather: WeatherCondition,
  event: CalendarEvent,
  predictions: DemandPrediction[],
  shortages: IngredientRequirement[]
): Promise<CopilotBriefing> {
  const criticalItems = shortages.filter(s => s.status === 'critical');
  const warningItems = shortages.filter(s => s.status === 'warning');
  const topDishes = [...predictions].sort((a, b) => b.forecastUnits - a.forecastUnits).slice(0, 3);

  const client = getAIClient();
  if (client) {
    try {
      const prompt = `
You are the AI Kitchen Operations Director for a high-volume Indian Cloud Kitchen / Ghost Kitchen Hub operating on Swiggy, Zomato, Magicpin, and ONDC.
Context for today's shift:
- Day: ${dayOfWeek}
- Weather: ${weather.label} (Precipitation: ${weather.precipitationProb}%)
- Event/Festival: ${event.title}
- Top Predicted Dishes: ${topDishes.map(d => `${d.menuItemName} (${d.forecastUnits} portions, +${d.reasoning})`).join(', ')}
- Critical Ingredient Shortages: ${criticalItems.length > 0 ? criticalItems.map(c => `${c.ingredientName} (Need ${c.requiredAmount} ${c.unit}, In Stock: ${c.currentStock})`).join(', ') : 'None'}
- Low Safety Stock Warnings: ${warningItems.map(w => w.ingredientName).join(', ')}

Provide an authentic Indian commercial kitchen operational briefing for the kitchen manager and Head Ustad.
Account for Indian kitchen realities (e.g. Tandoor heating cycle, Dum Biryani handi sealing, fresh paneer 48h shelf life, monsoon delivery rider delays).
Return in JSON format with exact keys:
{
  "summary": "2-3 sentences executive summary of today's Swiggy & Zomato rush timing and weather/festival impact in Indian Rupee (₹) context",
  "urgentActions": ["Action 1", "Action 2"],
  "prepRecommendations": ["Prep recommendation 1", "Prep recommendation 2"],
  "costOptimizationTip": "One actionable tip to avoid spoilage of perishable ingredients (paneer, coriander, tomatoes) or save procurement cost at Mandi"
}
`;
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          summary: parsed.summary || 'Shift forecast calculated.',
          urgentActions: Array.isArray(parsed.urgentActions) ? parsed.urgentActions : [],
          prepRecommendations: Array.isArray(parsed.prepRecommendations) ? parsed.prepRecommendations : [],
          costOptimizationTip: parsed.costOptimizationTip || 'Monitor FIFO storage rotation in walk-in chiller.'
        };
      }
    } catch (err) {
      console.warn('Gemini briefing generation fallback engaged:', err);
    }
  }

  // Authentic Indian commercial kitchen fallback briefing
  const urgentActions: string[] = [];
  if (criticalItems.length > 0) {
    urgentActions.push(`Immediately call wholesale suppliers for emergency dispatch of ${criticalItems.map(c => c.ingredientName.split(' ')[0]).join(', ')} before the 12:30 PM lunch rush.`);
  }
  if (weather.precipitationProb > 60) {
    urgentActions.push(`Heavy rain alert: Pre-package tamper-proof moisture bags for Swiggy and Zomato delivery riders to avoid soggy packaging.`);
  }
  if (urgentActions.length === 0) {
    urgentActions.push('All core commodities (Basmati, Desi Ghee, Paneer, Chicken) are well above minimum safety thresholds.');
    urgentActions.push('Fire the clay tandoor at 10:45 AM sharp to reach 350°C before peak lunch naan & tikka orders.');
  }

  const prepRecommendations = [
    `Stage ${topDishes[0]?.forecastUnits || 75} portions of ${topDishes[0]?.menuItemName || 'Hyderabadi Dum Biryani'} by 11:30 AM for Dum seal timing.`,
    weather.type === 'monsoon_rain' || weather.type === 'thunderstorm_monsoon'
      ? 'Increase Samosa Ragda Chaat and Masala Chai kettle simmer by +45% for the 4:30 PM tea-time surge.'
      : 'Simmer Master Makhani gravy in bulk batch early to prevent dinner curry bottlenecks.',
    'Inspect Malai Paneer and fresh coriander batches in the walk-in chiller to adhere to strict 48-hour FIFO usage.'
  ];

  return {
    summary: `Today is ${dayOfWeek} with ${weather.label}. Due to ${weather.precipitationProb > 50 ? 'torrential monsoon rainfall keeping customers indoors' : 'scheduled weekend/evening delivery peaks'}, expect major order surges on Swiggy and Zomato between 13:00–14:30 and 19:30–22:45. Leading demand will be driven by ${topDishes.map(d => d.menuItemName).join(' & ')}.`,
    urgentActions,
    prepRecommendations,
    costOptimizationTip: `Purchasing Nashik onions in 50kg wholesale bags from APMC Mandi saves ₹12/kg compared to spot retail reorders. Ensure Malai Paneer is consumed within 72 hours to prevent spoilage loss.`
  };
}

/**
 * Interactive Copilot Query for Indian restaurant managers and chefs
 */
export async function askKitchenCopilot(
  query: string,
  contextData: {
    dayOfWeek: string;
    weather: string;
    totalOrders: number;
    revenue: number;
    shortagesCount: number;
  }
): Promise<string> {
  const client = getAIClient();
  if (client) {
    try {
      const prompt = `
You are the AI Kitchen Intelligence Copilot for an Indian Ghost Kitchen & Delivery Restaurant Hub.
Operational Context:
- Day: ${contextData.dayOfWeek}
- Weather: ${contextData.weather}
- Forecasted Daily Orders: ${contextData.totalOrders}
- Projected Gross Revenue: ₹${contextData.revenue.toLocaleString('en-IN')}
- Active Raw Ingredient Shortages: ${contextData.shortagesCount}

User Question: "${query}"

Provide an authentic, highly actionable Indian culinary operations answer in 2-4 sentences. Use terms familiar to Indian restaurateurs (Mandi, Birista, Tandoor, Handi, Swiggy, Zomato, Dum, FIFO, Malai Paneer). Mention costs in Indian Rupees (₹).
`;
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini query error, falling back:', err);
    }
  }

  // Heuristic authentic replies for Indian kitchens
  const q = query.toLowerCase();
  if (q.includes('rain') || q.includes('monsoon') || q.includes('weather')) {
    return `During heavy monsoon rain, Swiggy and Zomato order frequency surges by ~35% with huge spikes in hot comfort food—specifically Samosa Chaat, Hyderabadi Biryani, and Butter Chicken. Pre-seal delivery carry bags with tamper-proof waterproof tape to prevent rain moisture complaints.`;
  }
  if (q.includes('ipl') || q.includes('cricket') || q.includes('match')) {
    return `IPL match nights trigger a 65% surge in Biryanis, Tandoori wings, and kebab platters starting 30 minutes before toss (around 7:00 PM). We recommend pre-marinating extra chicken and firing the tandoor at 6:30 PM to maintain sub-10 minute kitchen ticket dispatch times.`;
  }
  if (q.includes('shortage') || q.includes('po') || q.includes('order')) {
    return `You have ${contextData.shortagesCount} ingredient shortage(s) projected for this shift. Approve the bundled wholesale PO in the Purchase Orders tab before 10:30 AM so APMC Mandi and dairy trucks can deliver before lunch prep commences.`;
  }
  if (q.includes('paneer') || q.includes('waste') || q.includes('spoilage')) {
    return `Fresh Malai Paneer has an active shelf life of only 3 to 4 days. If stock is aging near the 48-hour cutoff, run a temporary flash promotion for 'Amritsari Paneer Tikka Masala' on Swiggy & Zomato to accelerate turnover and recover ₹1,200+ in potential spoilage.`;
  }
  return `Based on today's forecast of ${contextData.totalOrders} orders (estimated gross revenue of ₹${contextData.revenue.toLocaleString('en-IN')}), stagger your prep into two shifts: morning bulk gravy and birista prep, followed by afternoon tandoori marinations for the dinner rush.`;
}
