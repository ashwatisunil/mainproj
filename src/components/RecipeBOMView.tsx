import React, { useState, useMemo } from 'react';
import {
  MenuItem,
  Ingredient,
  User,
  RecipeIngredient
} from '../types';
import {
  ChefHat,
  AlertCircle,
  Edit3,
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';

interface RecipeBOMViewProps {
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  currentUser: User;
  onUpdateRecipe: (menuItemId: string, updatedRecipe: RecipeIngredient[]) => void;
  onAddNewMenuItem?: (menuItem: Omit<MenuItem, 'id'>) => void;
  onDeleteMenuItem?: (menuItemId: string) => void;
  onNavigateTab: (tab: string) => void;
}

type SortField = 'name' | 'category' | 'brand' | 'price' | 'prepTimeMinutes' | 'cost' | 'margin';
type SortOrder = 'asc' | 'desc';

export const RecipeBOMView: React.FC<RecipeBOMViewProps> = ({
  menuItems,
  ingredients,
  currentUser,
  onUpdateRecipe,
  onAddNewMenuItem,
  onDeleteMenuItem,
  onNavigateTab
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Edit Modal state
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editRecipeList, setEditRecipeList] = useState<RecipeIngredient[]>([]);

  // Add New Menu Item Modal
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishBrand, setNewDishBrand] = useState('Dum Safar Biryani & Kebabs');
  const [newDishCategory, setNewDishCategory] = useState<MenuItem['category']>('Biryanis & Rice');
  const [newDishPrice, setNewDishPrice] = useState<number>(299);
  const [newDishPrepTime, setNewDishPrepTime] = useState<number>(15);
  const [newDishRecipe, setNewDishRecipe] = useState<RecipeIngredient[]>([]);

  const brands = [
    'all',
    'Dum Safar Biryani & Kebabs',
    'Tandoori Nights & Curry Lab',
    'Dosa Craft & Dakshin Tiffins',
    'Chaat Gali & Street Bites'
  ];

  const categories = [
    'all',
    'Biryanis & Rice',
    'Curries & Gravies',
    'Tandoor & Kebabs',
    'Tiffins & South Indian',
    'Chaat & Street Food',
    'Breads & Desserts'
  ];

  const calculateFoodCost = (recipe: RecipeIngredient[]) => {
    return recipe.reduce((acc, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      const cost = ing ? ing.unitCost * item.amount : 0;
      return acc + cost;
    }, 0);
  };

  const calculateMaxPortions = (recipe: RecipeIngredient[]) => {
    let minPortions = Infinity;
    let bottleneckName = 'None';

    recipe.forEach(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (!ing || item.amount <= 0) return;
      const possible = Math.floor(ing.currentStock / item.amount);
      if (possible < minPortions) {
        minPortions = possible;
        bottleneckName = ing.name;
      }
    });

    return {
      portions: minPortions === Infinity ? 0 : minPortions,
      bottleneck: bottleneckName
    };
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedMenuItems = useMemo(() => {
    return menuItems
      .filter(m => {
        const matchesBrand = selectedBrand === 'all' || m.brand === selectedBrand;
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        const matchesSearch =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBrand && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortField === 'cost') {
          aVal = calculateFoodCost(a.recipe);
          bVal = calculateFoodCost(b.recipe);
        } else if (sortField === 'margin') {
          const costA = calculateFoodCost(a.recipe);
          const costB = calculateFoodCost(b.recipe);
          aVal = (a.price - costA) / a.price;
          bVal = (b.price - costB) / b.price;
        } else {
          aVal = a[sortField];
          bVal = b[sortField];
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
  }, [menuItems, selectedBrand, selectedCategory, searchQuery, sortField, sortOrder, ingredients]);

  const handleStartEdit = (dish: MenuItem) => {
    setEditingMenuItem(dish);
    setEditRecipeList([...dish.recipe]);
  };

  const handleSaveRecipe = () => {
    if (!editingMenuItem) return;
    onUpdateRecipe(editingMenuItem.id, editRecipeList);
    setEditingMenuItem(null);
  };

  const handleRemoveIngredientFromEdit = (index: number) => {
    setEditRecipeList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredientToEdit = (ingredientId: string) => {
    const existing = editRecipeList.find(r => r.ingredientId === ingredientId);
    if (existing) return;
    setEditRecipeList(prev => [...prev, { ingredientId, amount: 0.1, notes: 'Standard portion' }]);
  };

  const handleSaveNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !onAddNewMenuItem) return;
    onAddNewMenuItem({
      name: newDishName.trim(),
      brand: newDishBrand,
      category: newDishCategory,
      price: newDishPrice,
      prepTimeMinutes: newDishPrepTime,
      active: true,
      recipe: newDishRecipe,
      historicalWeeklySales: [10, 15, 12, 18, 20, 25, 22],
      baseAverageDemand: 15,
      imageColor: 'from-amber-500 to-orange-600'
    });
    setIsAddingNew(false);
    setNewDishName('');
    setNewDishRecipe([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              STANDARD OPERATING FORMULA &amp; INGREDIENT BREAKDOWN
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Indian Menu &amp; Recipe Bill of Materials (BOM)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Defines exact gram/ml portion specs per dish (Paneer Butter Masala, Biryani) for precise inventory depletion and profit margin calculation.
            </p>
          </div>

          {currentUser.role !== 'chef' && onAddNewMenuItem && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          )}
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search dish by name or brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 outline-none cursor-pointer"
            >
              {brands.map(b => (
                <option key={b} value={b}>
                  {b === 'all' ? 'All Virtual Brands' : b}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Quick Sort Options */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort:</span>
              <button
                onClick={() => handleSort('name')}
                className={`px-1.5 py-0.5 rounded ${sortField === 'name' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}`}
              >
                Name
              </button>
              <span>·</span>
              <button
                onClick={() => handleSort('price')}
                className={`px-1.5 py-0.5 rounded ${sortField === 'price' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}`}
              >
                Price
              </button>
              <span>·</span>
              <button
                onClick={() => handleSort('margin')}
                className={`px-1.5 py-0.5 rounded ${sortField === 'margin' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}`}
              >
                Margin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Dishes with Exploded BOM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {processedMenuItems.map(dish => {
          const foodCost = calculateFoodCost(dish.recipe);
          const grossProfit = dish.price - foodCost;
          const marginPercent = dish.price > 0 ? ((grossProfit / dish.price) * 100).toFixed(1) : '0';
          const capacity = calculateMaxPortions(dish.recipe);

          return (
            <div
              key={dish.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700/80 transition-colors relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-amber-400 font-medium mb-0.5">
                    {dish.brand} · {dish.category}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {dish.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right font-mono">
                    <div className="text-lg font-bold text-emerald-400 tabular-nums">
                      ₹{dish.price.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Selling Price
                    </div>
                  </div>

                  {onDeleteMenuItem && (
                    <button
                      onClick={() => onDeleteMenuItem(dish.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Cost & Margin Metrics */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono tabular-nums">
                <div>
                  <div className="text-[10px] text-slate-400">Raw Food Cost</div>
                  <div className="font-bold text-slate-200">₹{foodCost.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Gross Margin</div>
                  <div className="font-bold text-emerald-400">{marginPercent}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Prep Ticket</div>
                  <div className="text-slate-300 font-medium">{dish.prepTimeMinutes} min</div>
                </div>
              </div>

              {/* Current Max Portions Bottleneck */}
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stock Preparation Limit:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-300">
                    {capacity.portions} portions
                  </span>
                  <div className="text-[10px] text-slate-500 truncate max-w-[170px]" title={capacity.bottleneck}>
                    Bottleneck: {capacity.bottleneck.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Recipe BOM Ingredients Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    BOM Raw Ingredients Formula:
                  </span>
                  <button
                    onClick={() => handleStartEdit(dish)}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Formula</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60 border border-slate-800/60 rounded-lg overflow-hidden bg-slate-950/40">
                  {dish.recipe.map(item => {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    const itemCost = ing ? ing.unitCost * item.amount : 0;
                    return (
                      <div key={item.ingredientId} className="p-2 flex items-center justify-between text-xs hover:bg-slate-900/50">
                        <div>
                          <div className="font-medium text-slate-200">
                            {ing?.name || item.ingredientId}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.notes || 'Component'}
                          </div>
                        </div>

                        <div className="text-right font-mono tabular-nums text-[11px]">
                          <span className="text-slate-300 font-medium">
                            {item.amount} {ing?.unit}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            ₹{itemCost.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit Recipe Formula */}
      {editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Edit Recipe Formula: {editingMenuItem.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingMenuItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto text-xs pr-1">
              <div className="text-slate-300 font-semibold mb-2">Recipe Raw Ingredient Components:</div>
              {editRecipeList.map((item, index) => {
                const ing = ingredients.find(i => i.id === item.ingredientId);
                return (
                  <div key={index} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">{ing?.name || item.ingredientId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Rate: ₹{ing?.unitCost || 0}/{ing?.unit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.001"
                        value={item.amount}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setEditRecipeList(prev =>
                            prev.map((r, i) => (i === index ? { ...r, amount: val } : r))
                          );
                        }}
                        className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-right font-mono"
                      />
                      <span className="text-slate-400 text-[11px] font-mono">{ing?.unit}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientFromEdit(index)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Raw Ingredient to Recipe */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-400 mb-1 font-medium">Add Ingredient to Formula:</label>
                <select
                  onChange={e => {
                    if (e.target.value) handleAddIngredientToEdit(e.target.value);
                  }}
                  value=""
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="">Select ingredient to add...</option>
                  {ingredients
                    .filter(ing => !editRecipeList.some(r => r.ingredientId === ing.id))
                    .map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.category} · ₹{ing.unitCost}/{ing.unit})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecipe}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
              >
                Save Formula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Menu Item */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Dish to Menu</h3>
              <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDish} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Tikka Masala"
                  value={newDishName}
                  onChange={e => setNewDishName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Virtual Brand</label>
                  <select
                    value={newDishBrand}
                    onChange={e => setNewDishBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {brands.filter(b => b !== 'all').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={newDishCategory}
                    onChange={e => setNewDishCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {categories.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={newDishPrice}
                    onChange={e => setNewDishPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newDishPrepTime}
                    onChange={e => setNewDishPrepTime(parseInt(e.target.value) || 15)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Add Menu Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
