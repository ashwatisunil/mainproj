import React, { useState, useMemo } from 'react';
import {
  WasteRecord,
  Ingredient,
  User
} from '../types';
import {
  Trash2,
  AlertTriangle,
  TrendingDown,
  Plus,
  ShieldCheck,
  Sparkles,
  Search,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';

interface WasteAnalyticsViewProps {
  wasteRecords: WasteRecord[];
  ingredients: Ingredient[];
  currentUser: User;
  onLogWaste: (ingredientId: string, amount: number, reason: 'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage') => void;
  onDeleteWasteRecord?: (wasteId: string) => void;
  onNavigateTab: (tab: string) => void;
}

type WasteSortField = 'loggedAt' | 'ingredientName' | 'amount' | 'costLoss' | 'reason';
type SortOrder = 'asc' | 'desc';

export const WasteAnalyticsView: React.FC<WasteAnalyticsViewProps> = ({
  wasteRecords,
  ingredients,
  currentUser,
  onLogWaste,
  onDeleteWasteRecord,
  onNavigateTab
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(ingredients[0]?.id || '');
  const [wasteAmount, setWasteAmount] = useState<number>(0.5);
  const [wasteReason, setWasteReason] = useState<'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage'>('expired');
  const [showLogModal, setShowLogModal] = useState(false);

  // Sorting & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [sortField, setSortField] = useState<WasteSortField>('loggedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: WasteSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedWasteRecords = useMemo(() => {
    return wasteRecords
      .filter(record => {
        const matchesReason = filterReason === 'all' || record.reason === filterReason;
        const matchesSearch =
          record.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.loggedBy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesReason && matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
  }, [wasteRecords, filterReason, searchQuery, sortField, sortOrder]);

  // Financial calculations in ₹
  const totalWasteCost = wasteRecords.reduce((acc, w) => acc + w.costLoss, 0);
  const totalWasteItems = wasteRecords.length;

  const reasonCosts: Record<string, number> = {
    expired: 0,
    damaged: 0,
    prep_error: 0,
    overcooked: 0,
    storage_failure: 0,
    spoilage: 0
  };

  wasteRecords.forEach(w => {
    reasonCosts[w.reason] = (reasonCosts[w.reason] || 0) + w.costLoss;
  });

  const handleRecordWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || wasteAmount <= 0) return;
    onLogWaste(selectedIngredientId, wasteAmount, wasteReason);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              INDIAN RESTAURANT FOOD WASTE &amp; PERISHABLE LOSS PREVENTION
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Kitchen Spoilage &amp; Waste Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitors perishable item loss (Malai Paneer, Coriander, Tomatoes) and keeps clean historical loss logs for kitchen auditing.
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Log Waste Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Recorded Spoilage Loss</span>
            <Trash2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
            ₹{totalWasteCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {totalWasteItems} recorded kitchen incidents
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Primary Loss Cause</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-200 capitalize">
            {Object.entries(reasonCosts).sort((a, b) => b[1] - a[1])[0]?.[0].replace('_', ' ') || 'None'}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1 font-mono">
            ₹{(Object.entries(reasonCosts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0).toLocaleString('en-IN')} total cost
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Average Loss Per Incident</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-200">
            ₹{totalWasteItems > 0 ? (totalWasteCost / totalWasteItems).toFixed(0) : '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tracked in real-time per chef batch
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ingredient or staff name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Filter Reason:</span>
          <select
            value={filterReason}
            onChange={e => setFilterReason(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="expired">Expired</option>
            <option value="spoilage">Spoilage</option>
            <option value="prep_error">Prep Error</option>
            <option value="storage_failure">Storage Failure</option>
            <option value="damaged">Damaged</option>
            <option value="overcooked">Overcooked</option>
          </select>
        </div>
      </div>

      {/* Waste Records Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('loggedAt')}>
                  <div className="flex items-center gap-1">
                    Date &amp; Time
                    {sortField === 'loggedAt' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('ingredientName')}>
                  <div className="flex items-center gap-1">
                    Wasted Ingredient
                    {sortField === 'ingredientName' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Amount Wasted
                    {sortField === 'amount' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-right" onClick={() => handleSort('costLoss')}>
                  <div className="flex items-center justify-end gap-1">
                    Financial Loss (₹)
                    {sortField === 'costLoss' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('reason')}>
                  <div className="flex items-center gap-1">
                    Spoilage Reason
                    {sortField === 'reason' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedWasteRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No waste logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                processedWasteRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {record.loggedAt}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">
                      {record.ingredientName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {record.amount} {record.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      ₹{record.costLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        record.reason === 'expired' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                        record.reason === 'storage_failure' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {record.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {record.loggedBy}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onDeleteWasteRecord && (
                        <button
                          onClick={() => onDeleteWasteRecord(record.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Waste Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log Spoilage / Wastage Incident</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordWaste} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Commodity Ingredient</label>
                <select
                  value={selectedIngredientId}
                  onChange={e => setSelectedIngredientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Stock: {ing.currentStock} {ing.unit} · ₹{ing.unitCost}/{ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Wasted Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  max="1000"
                  value={wasteAmount}
                  onChange={e => setWasteAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Spoilage / Loss Reason</label>
                <select
                  value={wasteReason}
                  onChange={e => setWasteReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="expired">Expired / Past Shelf Life</option>
                  <option value="spoilage">General Spoilage / Fungus</option>
                  <option value="storage_failure">Chiller / Deep Freezer Temp Failure</option>
                  <option value="prep_error">Veg / Meat Prep Error</option>
                  <option value="overcooked">Overcooked / Burnt Batch</option>
                  <option value="damaged">Damaged Packaging</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg cursor-pointer"
                >
                  Confirm &amp; Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
