import React, { useState } from 'react';
import {
  DemandPrediction,
  WeatherCondition,
  CalendarEvent,
  MenuItem,
  Ingredient
} from '../types';
import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_FACTORS,
  calculateIngredientRequirements
} from '../services/predictionEngine';
import {
  CloudRain,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

interface DemandPredictorViewProps {
  predictions: DemandPrediction[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  selectedDay: string;
  onChangeDay: (day: string) => void;
  currentWeather: WeatherCondition;
  onChangeWeather: (type: string) => void;
  currentEvent: CalendarEvent;
  onChangeEvent: (eventId: string) => void;
  onNavigateTab: (tab: 'setup' | 'demand' | 'stock' | 'recipes' | 'prep' | 'staff') => void;
}

export const DemandPredictorView: React.FC<DemandPredictorViewProps> = ({
  predictions,
  menuItems,
  ingredients,
  selectedDay,
  onChangeDay,
  currentWeather,
  onChangeWeather,
  currentEvent,
  onChangeEvent,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);

  const categories = [
    'all',
    'Biryanis & Rice',
    'Curries & Gravies',
    'Tandoor & Kebabs',
    'Tiffins & South Indian',
    'Chaat & Street Food',
    'Breads & Desserts'
  ];

  const filteredPredictions = selectedCategory === 'all'
    ? predictions
    : predictions.filter(p => p.category === selectedCategory);

  const totalForecastPortions = filteredPredictions.reduce((acc, p) => acc + p.forecastUnits, 0);
  const maxForecast = Math.max(...predictions.map(p => p.forecastUnits), 1);

  // Ingredient stock requirement calculations from predictions
  const ingredientRequirements = calculateIngredientRequirements(predictions, menuItems, ingredients);
  const shortageCount = ingredientRequirements.filter(r => r.status === 'critical' || r.status === 'warning').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kitchen Operations · Demand Prediction Records</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dish Demand Forecast &amp; Stock Requirements
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Automatic demand prediction based on historical portion logs, day-of-week shifts, weather conditions, and events.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono">
            <div>
              <div className="text-[11px] text-slate-400">Total Shift Demand</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">{totalForecastPortions} portions</div>
            </div>
            <div className="w-px h-8 bg-slate-800 mx-2" />
            <div>
              <div className="text-[11px] text-slate-400">Stock Alerts</div>
              <div className={`text-2xl font-bold tabular-nums ${shortageCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {shortageCount} items
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Parameter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          {/* Day of Week */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Day of Week
            </label>
            <select
              value={selectedDay}
              onChange={e => onChangeDay(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer font-medium"
            >
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>
                  {d} (Factor: {DAY_OF_WEEK_FACTORS[d]}x)
                </option>
              ))}
            </select>
          </div>

          {/* Weather Condition */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1.5">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              Weather Condition
            </label>
            <select
              value={currentWeather.type}
              onChange={e => onChangeWeather(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="monsoon_rain">Heavy Rain (23°C)</option>
              <option value="thunderstorm_monsoon">Heavy Storm (21°C)</option>
              <option value="summer_heatwave">Extreme Heat (42°C)</option>
              <option value="winter_chill">Winter Cold (9°C)</option>
              <option value="pleasant_dry">Normal Weather (24°C)</option>
            </select>
          </div>

          {/* Special Events */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              Calendar Events
            </label>
            <select
              value={currentEvent.id}
              onChange={e => onChangeEvent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="evt-regular">Standard Day (No Events)</option>
              <option value="evt-ipl-match">Match / Game Night</option>
              <option value="evt-diwali">Festival Week</option>
              <option value="evt-weekend-biryani">Weekend Surge</option>
            </select>
          </div>

          {/* Dish Category Filter */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1.5">
              <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Heuristic Formula Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Prediction Formula:</strong>{' '}
            <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-amber-300">
              Demand = Average × Day Factor × Weather Factor × Event Factor
            </code>
          </span>
        </div>
        <button
          onClick={() => onNavigateTab('recipes')}
          className="text-amber-400 hover:text-amber-300 font-medium underline shrink-0 cursor-pointer"
        >
          View Recipe Formulas &amp; Ingredient Requirements →
        </button>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Dish Demand Predictions ({filteredPredictions.length} dishes)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                <th className="pb-3">Dish Name</th>
                <th className="pb-3 text-right">Base Avg</th>
                <th className="pb-3 text-right">Day Factor</th>
                <th className="pb-3 text-right">Weather Factor</th>
                <th className="pb-3 text-right">Event Factor</th>
                <th className="pb-3 text-right">Predicted Demand</th>
                <th className="pb-3 text-right">Confidence Range</th>
                <th className="pb-3 text-center">Recipe Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPredictions.map(pred => {
                const menuItem = menuItems.find(m => m.id === pred.menuItemId);
                const isExpanded = expandedDishId === pred.menuItemId;

                return (
                  <React.Fragment key={pred.menuItemId}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="font-bold text-white text-sm">{pred.menuItemName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{pred.category}</div>
                        <div className="text-[10px] text-slate-500 mt-1 italic">{pred.reasoning}</div>
                      </td>

                      <td className="py-3.5 text-right font-mono tabular-nums text-slate-300">
                        {pred.baseDemand} portions
                      </td>

                      <td className="py-3.5 text-right font-mono tabular-nums text-slate-400">
                        {pred.dowFactor.toFixed(2)}x
                      </td>

                      <td className="py-3.5 text-right font-mono tabular-nums">
                        <span className={pred.weatherFactor > 1.0 ? 'text-emerald-400' : pred.weatherFactor < 1.0 ? 'text-rose-400' : 'text-slate-400'}>
                          {pred.weatherFactor.toFixed(2)}x
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono tabular-nums">
                        <span className={pred.eventFactor > 1.0 ? 'text-emerald-400' : pred.eventFactor < 1.0 ? 'text-rose-400' : 'text-slate-400'}>
                          {pred.eventFactor.toFixed(2)}x
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <span className="font-bold text-base font-mono tabular-nums text-amber-400">
                          {pred.forecastUnits} portions
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono text-[11px] tabular-nums text-slate-400">
                        [{pred.confidenceLower} – {pred.confidenceUpper}]
                      </td>

                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => setExpandedDishId(isExpanded ? null : pred.menuItemId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-700"
                        >
                          <span>Recipe</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Exploded Recipe BOM Row */}
                    {isExpanded && menuItem && (
                      <tr className="bg-slate-950">
                        <td colSpan={8} className="p-4 border-t border-slate-800">
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-amber-400">
                              Ingredients required for {pred.forecastUnits} portions of {pred.menuItemName}:
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                              {menuItem.recipe.map(item => {
                                const ing = ingredients.find(i => i.id === item.ingredientId);
                                const totalNeeded = (item.amount * pred.forecastUnits).toFixed(2);
                                return (
                                  <div key={item.ingredientId} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs">
                                    <div className="font-bold text-slate-200">{ing?.name || item.ingredientId}</div>
                                    <div className="text-slate-400 text-[11px] mt-1 flex justify-between font-mono tabular-nums">
                                      <span>Per portion: {item.amount} {ing?.unit}</span>
                                      <span className="text-amber-400 font-bold">Needed: {totalNeeded} {ing?.unit}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Ingredients Stock Level vs Demand Requirements */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Raw Ingredient Stock vs Predicted Shift Demand
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculates whether current kitchen stock is sufficient to cook all predicted dish portions.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('stock')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
          >
            Manage Stock Ledger →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {ingredientRequirements.map(req => {
            const isCritical = req.status === 'critical';
            const isWarning = req.status === 'warning';

            return (
              <div
                key={req.ingredientId}
                className={`p-3.5 rounded-xl border ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white text-sm">{req.ingredientName}</div>
                  {isCritical ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Stockout Risk
                    </span>
                  ) : isWarning ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sufficient
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[10px]">Current Stock</div>
                    <div className="font-bold text-slate-200">{req.currentStock} {req.unit}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Required Demand</div>
                    <div className="font-bold text-amber-400">{req.requiredAmount} {req.unit}</div>
                  </div>
                </div>

                {req.shortageAmount > 0 && (
                  <div className="mt-2 text-[11px] font-mono text-rose-300 flex justify-between bg-rose-950/60 px-2 py-1 rounded border border-rose-900/40">
                    <span>Reorder Needed:</span>
                    <span className="font-bold">+{req.recommendedOrder} {req.unit}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Portion Demand Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">
          Predicted Dish Volume Comparison
        </h2>
        <div className="space-y-3">
          {filteredPredictions.map(pred => {
            const widthPct = Math.min(100, Math.round((pred.forecastUnits / maxForecast) * 100));
            return (
              <div key={pred.menuItemId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{pred.menuItemName}</span>
                  <span className="font-bold text-amber-400 font-mono">{pred.forecastUnits} portions</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
