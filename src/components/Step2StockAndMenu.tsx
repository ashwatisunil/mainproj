import React, { useState } from 'react';
import { Ingredient, MenuItem, RecipeIngredient, IngredientCategory } from '../types';
import { Package, Utensils, Plus, Trash2, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

interface Step2StockAndMenuProps {
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onDeleteIngredient: (id: string) => void;
  onAddMenuItem: (dish: Omit<MenuItem, 'id'>) => void;
  onDeleteMenuItem: (id: string) => void;
  onLoadSampleData: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step2StockAndMenu: React.FC<Step2StockAndMenuProps> = ({
  ingredients,
  menuItems,
  onAddIngredient,
  onDeleteIngredient,
  onAddMenuItem,
  onDeleteMenuItem,
  onLoadSampleData,
  onPrevStep,
  onNextStep
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ingredients' | 'menu'>('ingredients');

  // Ingredient Form State
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState<IngredientCategory>('Rice, Flour & Grains');
  const [ingStock, setIngStock] = useState<number>(10);
  const [ingUnit, setIngUnit] = useState<'kg' | 'g' | 'L' | 'ml' | 'units' | 'packs'>('kg');
  const [ingError, setIngError] = useState<string | null>(null);

  // Menu Dish Form State
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState<MenuItem['category']>('Biryanis & Rice');
  const [dishPrepTime, setDishPrepTime] = useState<number>(15);
  const [selectedRecipeItems, setSelectedRecipeItems] = useState<{ ingredientId: string; amount: number }[]>([]);
  const [dishError, setDishError] = useState<string | null>(null);

  // Add Ingredient Submit with Validation
  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    setIngError(null);

    if (!ingName.trim() || ingName.trim().length < 2) {
      setIngError('Ingredient name is required (at least 2 characters).');
      return;
    }

    if (ingStock < 0) {
      setIngError('Initial stock cannot be negative.');
      return;
    }

    onAddIngredient({
      name: ingName.trim(),
      category: ingCategory,
      currentStock: ingStock,
      minStock: 5,
      safetyStock: 3,
      unit: ingUnit,
      packSize: 5,
      unitCost: 0,
      supplierId: 'sup-mandi',
      supplierName: 'Mandi Supplier',
      storageZone: 'Dry Spices & Grain Store',
      shelfLifeDays: 30,
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      batchNumber: 'LOT-ING-01',
      lastRestocked: new Date().toISOString().split('T')[0]
    });

    setIngName('');
    setIngStock(10);
  };

  // Add Dish Submit with Validation
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    setDishError(null);

    if (!dishName.trim() || dishName.trim().length < 2) {
      setDishError('Dish name is required (at least 2 characters).');
      return;
    }

    if (selectedRecipeItems.length === 0) {
      setDishError('Please add at least one recipe ingredient portion for this dish.');
      return;
    }

    const recipe: RecipeIngredient[] = selectedRecipeItems.map(r => ({
      ingredientId: r.ingredientId,
      amount: r.amount,
      notes: 'Standard portion'
    }));

    onAddMenuItem({
      name: dishName.trim(),
      brand: 'Main Kitchen',
      category: dishCategory,
      price: 0,
      prepTimeMinutes: dishPrepTime > 0 ? dishPrepTime : 10,
      active: true,
      recipe,
      historicalWeeklySales: [10, 15, 12, 18, 20, 25, 22],
      baseAverageDemand: 15,
      imageColor: 'from-amber-500 to-orange-600'
    });

    setDishName('');
    setSelectedRecipeItems([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raw Stock &amp; Recipe Formulas</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Raw Stock Ledger &amp; Recipe Ingredients
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Keep track of raw kitchen ingredients (Rice, Paneer, Chicken, Ghee) and define recipe ingredient portions per dish.
          </p>
        </div>

        <button
          onClick={onLoadSampleData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-colors border border-amber-500/30 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load Standard Dishes &amp; Stock</span>
        </button>
      </div>

      {/* Sub Tab Selector */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveSubTab('ingredients')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'ingredients'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Raw Stock Items ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('menu')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'menu'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>2. Recipe Formulas ({menuItems.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: INGREDIENTS */}
      {activeSubTab === 'ingredients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Ingredient Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-1 self-start">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Add Raw Ingredient Item
            </h3>

            {ingError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{ingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateIngredient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rice / Paneer / Chicken"
                  value={ingName}
                  onChange={e => {
                    setIngName(e.target.value);
                    setIngError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={ingCategory}
                  onChange={e => setIngCategory(e.target.value as IngredientCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="Dairy & Paneer">Dairy &amp; Paneer</option>
                  <option value="Poultry & Meat">Poultry &amp; Meat</option>
                  <option value="Rice, Flour & Grains">Rice, Flour &amp; Grains</option>
                  <option value="Mandi Fresh Produce">Mandi Fresh Produce</option>
                  <option value="Spices, Ghee & Oils">Spices, Ghee &amp; Oils</option>
                  <option value="Packaging & Consumables">Packaging &amp; Consumables</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingStock}
                    onChange={e => setIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <select
                    value={ingUnit}
                    onChange={e => setIngUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="packs">packs</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer mt-2"
              >
                Add Ingredient to Stock
              </button>
            </form>
          </div>

          {/* Ingredient List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Raw Stock Inventory</span>
              <span className="text-xs text-slate-400 font-mono">({ingredients.length} items)</span>
            </h3>

            {ingredients.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <Package className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-slate-400 text-xs">No raw ingredients in stock ledger yet.</div>
                <button
                  onClick={onLoadSampleData}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-500/30"
                >
                  Load Sample Kitchen Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ingredients.map(ing => (
                  <div key={ing.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{ing.name}</div>
                      <div className="text-[11px] text-slate-400">{ing.category}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400 text-sm">{ing.currentStock} {ing.unit}</div>
                        <div className="text-[10px] text-slate-500">Available Stock</div>
                      </div>
                      <button
                        onClick={() => onDeleteIngredient(ing.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: MENU DISHES */}
      {activeSubTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Dish Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-1 self-start">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Add Kitchen Dish
            </h3>

            {dishError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{dishError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. Biryani / Paneer Curry"
                  value={dishName}
                  onChange={e => {
                    setDishName(e.target.value);
                    setDishError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={dishCategory}
                  onChange={e => setDishCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="Biryanis & Rice">Biryanis &amp; Rice</option>
                  <option value="Curries & Gravies">Curries &amp; Gravies</option>
                  <option value="Tandoor & Kebabs">Tandoor &amp; Kebabs</option>
                  <option value="Tiffins & South Indian">Tiffins &amp; South Indian</option>
                  <option value="Chaat & Street Food">Chaat &amp; Street Food</option>
                  <option value="Breads & Desserts">Breads &amp; Desserts</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prep Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={dishPrepTime}
                  onChange={e => setDishPrepTime(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Recipe ingredient picker */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipe Ingredients per Portion:</label>
                <select
                  onChange={e => {
                    const ingId = e.target.value;
                    if (!ingId) return;
                    setDishError(null);
                    if (!selectedRecipeItems.some(r => r.ingredientId === ingId)) {
                      setSelectedRecipeItems(prev => [...prev, { ingredientId: ingId, amount: 0.2 }]);
                    }
                  }}
                  value=""
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300"
                >
                  <option value="">Select raw item to add...</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>

                {selectedRecipeItems.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {selectedRecipeItems.map((rec, i) => {
                      const ing = ingredients.find(ing => ing.id === rec.ingredientId);
                      return (
                        <div key={i} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                          <span className="text-[11px] text-slate-200 font-medium">{ing?.name}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              value={rec.amount}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setSelectedRecipeItems(prev =>
                                  prev.map((r, idx) => (idx === i ? { ...r, amount: val } : r))
                                );
                              }}
                              className="w-14 bg-slate-900 border border-slate-800 rounded text-center text-white font-mono"
                            />
                            <span className="text-[10px] text-slate-400 font-mono">{ing?.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer mt-2"
              >
                Save Recipe Formula
              </button>
            </form>
          </div>

          {/* Menu Items Grid */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Recipe Formulas per Dish</span>
              <span className="text-xs text-slate-400 font-mono">({menuItems.length} dishes)</span>
            </h3>

            {menuItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-slate-400 text-xs">No recipe formulas configured yet.</div>
                <button
                  onClick={onLoadSampleData}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-500/30"
                >
                  Load Sample Recipe Formulas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map(dish => {
                  return (
                    <div key={dish.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] text-amber-400 font-mono">{dish.category}</div>
                          <div className="font-bold text-white text-base">{dish.name}</div>
                          <div className="text-[11px] text-slate-400">Prep time: {dish.prepTimeMinutes} mins</div>
                        </div>
                        <button
                          onClick={() => onDeleteMenuItem(dish.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Portion Ingredients:</div>
                        {dish.recipe.map(item => {
                          const ing = ingredients.find(i => i.id === item.ingredientId);
                          return (
                            <div key={item.ingredientId} className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-300">{ing?.name || item.ingredientId}</span>
                              <span className="text-amber-400 font-bold">{item.amount} {ing?.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Step 1: Kitchen Setup</span>
        </button>

        <button
          onClick={onNextStep}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>Proceed to Batch Prep Logs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
