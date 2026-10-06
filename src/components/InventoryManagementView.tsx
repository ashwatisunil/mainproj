import React, { useState, useMemo } from 'react';
import {
  Ingredient,
  IngredientCategory,
  StorageZone,
  User
} from '../types';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';

interface InventoryManagementViewProps {
  ingredients: Ingredient[];
  currentUser: User;
  onUpdateStock: (ingredientId: string, newStock: number, reason: string) => void;
  onLogWaste: (ingredientId: string, amount: number, reason: 'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage') => void;
  onAddNewIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onDeleteIngredient?: (ingredientId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({
  ingredients,
  currentUser,
  onUpdateStock,
  onLogWaste,
  onAddNewIngredient,
  onDeleteIngredient,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Modals state
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Mandi physical stock audit');

  const [wastingIngredient, setWastingIngredient] = useState<Ingredient | null>(null);
  const [wasteAmount, setWasteAmount] = useState<number>(0);
  const [wasteReason, setWasteReason] = useState<'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage'>('expired');

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    category: 'Spices, Ghee & Oils',
    currentStock: 10,
    minStock: 5,
    safetyStock: 3,
    unit: 'kg',
    packSize: 5,
    unitCost: 280.0,
    supplierId: 'sup-local',
    supplierName: 'APMC Wholesale Mandi',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 30,
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    batchNumber: 'LOT-IND-01',
    lastRestocked: new Date().toISOString().split('T')[0]
  });

  const categories: (IngredientCategory | 'all')[] = [
    'all',
    'Dairy & Paneer',
    'Poultry & Meat',
    'Rice, Flour & Grains',
    'Mandi Fresh Produce',
    'Spices, Ghee & Oils',
    'Packaging & Consumables'
  ];

  const storageZones: (StorageZone | 'all')[] = [
    'all',
    'Walk-in Chiller',
    'Deep Freezer',
    'Dry Spices & Grain Store',
    'Veg Prep Station',
    'Tandoor & Hot Line'
  ];

  // Sorting & Filtering
  type InvSortField = 'name' | 'category' | 'storageZone' | 'currentStock' | 'unitCost' | 'totalVal' | 'expiryDate';
  const [sortField, setSortField] = useState<InvSortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: InvSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients
      .filter(ing => {
        const matchesSearch =
          ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ing.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ing.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || ing.category === selectedCategory;
        const matchesZone = selectedZone === 'all' || ing.storageZone === selectedZone;
        return matchesSearch && matchesCategory && matchesZone;
      })
      .sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortField === 'totalVal') {
          aVal = a.currentStock * a.unitCost;
          bVal = b.currentStock * b.unitCost;
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
  }, [ingredients, searchQuery, selectedCategory, selectedZone, sortField, sortOrder]);

  // Total inventory value in ₹
  const totalStockValue = ingredients.reduce((acc, ing) => acc + (ing.currentStock * ing.unitCost), 0);
  const lowStockCount = ingredients.filter(ing => ing.currentStock <= ing.minStock).length;

  const now = new Date();
  const getExpiryStatus = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: 'Expired', color: 'text-rose-400 font-bold', bg: 'bg-rose-500/10' };
    if (diffDays <= 2) return { label: `${diffDays}d left (48h risk)`, color: 'text-amber-400 font-semibold', bg: 'bg-amber-500/10' };
    return { label: `${diffDays}d safe`, color: 'text-slate-400', bg: 'bg-transparent' };
  };

  const handleApplyAdjustment = () => {
    if (!adjustingIngredient) return;
    onUpdateStock(adjustingIngredient.id, adjustAmount, adjustReason);
    setAdjustingIngredient(null);
  };

  const handleApplyWaste = () => {
    if (!wastingIngredient || wasteAmount <= 0) return;
    onLogWaste(wastingIngredient.id, wasteAmount, wasteReason);
    setWastingIngredient(null);
  };

  const handleSaveNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name.trim()) return;
    onAddNewIngredient(newIngredient);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and KPI Row */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              REAL-TIME INDIAN RAW INGREDIENT &amp; MANDI COMMODITY LEDGER
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Raw Inventory, Chiller &amp; Spices Stock
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tracks high-perishability items (Malai Paneer, Tomatoes, Coriander) and bulk grains (Daawat Basmati, Ghee) with automatic Mandi reorder alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">Total Stock Value</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                ₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">Items Needing Restock</div>
              <div className={`text-lg font-bold tabular-nums ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount} items
              </div>
            </div>

            {currentUser.role !== 'chef' && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mandi Item</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ingredient (e.g. Paneer, Basmati, Ghee, Pyaz)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Filter */}
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

            {/* Storage Zone Filter */}
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 outline-none cursor-pointer"
            >
              {storageZones.map(z => (
                <option key={z} value={z}>
                  {z === 'all' ? 'All Storage Zones' : z}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Raw Commodity &amp; Lot
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">
                    Category
                    {sortField === 'category' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('storageZone')}>
                  <div className="flex items-center gap-1">
                    Storage Zone
                    {sortField === 'storageZone' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('currentStock')}>
                  <div className="flex items-center justify-end gap-1">
                    Current Stock
                    {sortField === 'currentStock' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Safety Buffer</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('unitCost')}>
                  <div className="flex items-center justify-end gap-1">
                    Unit Rate
                    {sortField === 'unitCost' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('totalVal')}>
                  <div className="flex items-center justify-end gap-1">
                    Total Value
                    {sortField === 'totalVal' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('expiryDate')}>
                  <div className="flex items-center gap-1">
                    Expiry / Freshness
                    {sortField === 'expiryDate' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-3">Mandi / Dairy Vendor</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIngredients.map(ing => {
                const expiryInfo = getExpiryStatus(ing.expiryDate);
                const isBelowMin = ing.currentStock < ing.minStock;
                const isCritical = ing.currentStock <= ing.safetyStock;
                const totalVal = ing.currentStock * ing.unitCost;

                return (
                  <tr key={ing.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{ing.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {ing.batchNumber} · Pack: {ing.packSize} {ing.unit}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {ing.category}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-slate-300">
                        {ing.storageZone}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={`font-bold text-sm ${
                        isCritical ? 'text-rose-400' : isBelowMin ? 'text-amber-400' : 'text-slate-100'
                      }`}>
                        {ing.currentStock.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">{ing.unit}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                      {ing.safetyStock} {ing.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      ₹{ing.unitCost.toFixed(0)}/{ing.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-medium">
                      ₹{totalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>

                    <td className="py-3 px-3">
                      <div className={`text-[11px] px-2 py-0.5 rounded inline-block ${expiryInfo.bg} ${expiryInfo.color}`}>
                        {expiryInfo.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {ing.expiryDate}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]" title={ing.supplierName}>
                      {ing.supplierName}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setAdjustingIngredient(ing);
                            setAdjustAmount(ing.currentStock);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          title="Count / Adjust Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setWastingIngredient(ing);
                            setWasteAmount(0.5);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Log Spoilage / Wastage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteIngredient && (
                          <button
                            onClick={() => onDeleteIngredient(ing.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Delete Item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredIngredients.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No ingredients match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingIngredient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div>
              <div className="text-xs text-amber-400 font-mono mb-1">MANDI INVENTORY AUDIT &amp; ADJUSTMENT</div>
              <h3 className="text-base font-bold text-white">Adjust Stock: {adjustingIngredient.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Current record: {adjustingIngredient.currentStock} {adjustingIngredient.unit}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">New Physical Count ({adjustingIngredient.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="Mandi physical stock inventory audit">Mandi physical stock inventory audit</option>
                  <option value="Direct wholesale delivery received">Direct wholesale delivery received</option>
                  <option value="Kitchen bhatti spill correction">Kitchen bhatti spill correction</option>
                  <option value="Head Ustad shift reconciliation">Head Ustad shift reconciliation</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustingIngredient(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Spoilage / Waste Modal */}
      {wastingIngredient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div>
              <div className="text-xs text-rose-400 font-mono mb-1">FOOD WASTE PREVENTION TRACKER</div>
              <h3 className="text-base font-bold text-white">Log Spoilage: {wastingIngredient.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Deducts spoiled ingredients from inventory and logs financial rupee loss.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Quantity Wasted ({wastingIngredient.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={wastingIngredient.currentStock}
                  value={wasteAmount}
                  onChange={e => setWasteAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm outline-none focus:border-rose-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Cost loss: <span className="font-mono text-rose-400 font-bold">₹{(wasteAmount * wastingIngredient.unitCost).toFixed(0)}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Waste Cause</label>
                <select
                  value={wasteReason}
                  onChange={e => setWasteReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="expired">Expired Past Shelf Life (Paneer/Milk)</option>
                  <option value="damaged">Damaged In Transit / Crushed</option>
                  <option value="prep_error">Kitchen Prep Error / Wrong Cut</option>
                  <option value="overcooked">Overcooked / Burned in Tandoor or Handi</option>
                  <option value="storage_failure">Chiller Power Failure Deviation</option>
                  <option value="spoilage">Mandi Produce Spoilage / Wilted</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWastingIngredient(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyWaste}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Record Waste &amp; Deduct Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Raw Ingredient Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveNewIngredient} className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4">
            <div>
              <div className="text-xs text-amber-400 font-mono mb-1">MANDI CATALOG ENTRY</div>
              <h3 className="text-base font-bold text-white">Add Raw Mandi / Dairy Item</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1 font-medium">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Degi Mirch Powder"
                  value={newIngredient.name}
                  onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Category</label>
                <select
                  value={newIngredient.category}
                  onChange={e => setNewIngredient({ ...newIngredient, category: e.target.value as IngredientCategory })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="Dairy & Paneer">Dairy &amp; Paneer</option>
                  <option value="Poultry & Meat">Poultry &amp; Meat</option>
                  <option value="Rice, Flour & Grains">Rice, Flour &amp; Grains</option>
                  <option value="Mandi Fresh Produce">Mandi Fresh Produce</option>
                  <option value="Spices, Ghee & Oils">Spices, Ghee &amp; Oils</option>
                  <option value="Packaging & Consumables">Packaging &amp; Consumables</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Storage Zone</label>
                <select
                  value={newIngredient.storageZone}
                  onChange={e => setNewIngredient({ ...newIngredient, storageZone: e.target.value as StorageZone })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="Walk-in Chiller">Walk-in Chiller</option>
                  <option value="Deep Freezer">Deep Freezer</option>
                  <option value="Dry Spices & Grain Store">Dry Spices &amp; Grain Store</option>
                  <option value="Veg Prep Station">Veg Prep Station</option>
                  <option value="Tandoor & Hot Line">Tandoor &amp; Hot Line</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Unit</label>
                <select
                  value={newIngredient.unit}
                  onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="units">units</option>
                  <option value="packs">packs</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Unit Cost (₹)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={newIngredient.unitCost}
                  onChange={e => setNewIngredient({ ...newIngredient, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Initial Stock Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newIngredient.currentStock}
                  onChange={e => setNewIngredient({ ...newIngredient, currentStock: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Safety Stock Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newIngredient.safetyStock}
                  onChange={e => setNewIngredient({ ...newIngredient, safetyStock: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1 font-medium">Wholesale Mandi / Vendor</label>
                <input
                  type="text"
                  required
                  value={newIngredient.supplierName}
                  onChange={e => setNewIngredient({ ...newIngredient, supplierName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Add to Mandi Inventory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
