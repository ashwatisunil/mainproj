import React, { useState, useMemo } from 'react';
import { KitchenPrepLog, MenuItem, Ingredient, User } from '../types';
import { ChefHat, Plus, Trash2, PackageMinus, Search, ChevronUp, ChevronDown, X, AlertCircle } from 'lucide-react';

interface Step4BatchPrepProps {
  prepLogs: KitchenPrepLog[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  currentUser: User;
  onLogPrepBatch: (
    menuItemId: string,
    portionsCount: number,
    preparedBy: string,
    notes?: string
  ) => void;
  onDeletePrepLog: (logId: string) => void;
  lastDeductions: { ingredientName: string; amount: number; unit: string }[] | null;
}

type LogSortField = 'timestamp' | 'batchNumber' | 'menuItemName' | 'portionsCount' | 'preparedBy';
type SortOrder = 'asc' | 'desc';

export const Step4BatchPrep: React.FC<Step4BatchPrepProps> = ({
  prepLogs,
  menuItems,
  ingredients,
  currentUser,
  onLogPrepBatch,
  onDeletePrepLog,
  lastDeductions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<LogSortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string>(menuItems[0]?.id || '');
  const [portionsCount, setPortionsCount] = useState<number>(10);
  const [preparedBy, setPreparedBy] = useState<string>(currentUser.name || 'Head Chef');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSort = (field: LogSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedLogs = useMemo(() => {
    return prepLogs
      .filter(log => {
        const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
        const matchesSearch =
          log.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.preparedBy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
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
  }, [prepLogs, selectedCategory, searchQuery, sortField, sortOrder]);

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedDishId) {
      setValidationError('Please select a dish formula.');
      return;
    }

    if (portionsCount <= 0) {
      setValidationError('Portions count must be greater than 0.');
      return;
    }

    // Check raw ingredient stock sufficiency for batch prep!
    const dish = menuItems.find(m => m.id === selectedDishId);
    if (dish) {
      const shortages: string[] = [];
      dish.recipe.forEach(rec => {
        const needed = rec.amount * portionsCount;
        const ing = ingredients.find(i => i.id === rec.ingredientId);
        if (ing && needed > ing.currentStock) {
          shortages.push(`${ing.name} (Need ${needed.toFixed(2)} ${ing.unit}, available ${ing.currentStock.toFixed(2)} ${ing.unit})`);
        }
      });

      if (shortages.length > 0) {
        setValidationError(`Insufficient Stock: Cannot prepare batch! Shortages: ${shortages.join('; ')}.`);
        return;
      }
    }

    onLogPrepBatch(
      selectedDishId,
      portionsCount,
      preparedBy.trim() || currentUser.name,
      notes.trim() || undefined
    );

    setIsModalOpen(false);
    setPortionsCount(10);
    setNotes('');
  };

  const totalPortionsPrepared = prepLogs.reduce((acc, l) => acc + l.portionsCount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-2">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Dish Preparation &amp; Batch Production Log</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kitchen Dish Batch Preparation Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Log completed dish batches prepared by chefs. Every logged batch automatically calculates and deducts raw ingredient portions from your stock ledger.
          </p>
        </div>

        <button
          onClick={() => {
            setValidationError(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Prepared Dish Batch</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Total Preparation Batches</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{prepLogs.length} batches</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Total Portions Produced</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{totalPortionsPrepared} portions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Active Recipe Dishes</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-0.5">{menuItems.length} formulas</div>
        </div>
      </div>

      {/* Last Deductions Notice */}
      {lastDeductions && lastDeductions.length > 0 && (
        <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-xs space-y-2">
          <div className="text-amber-400 font-bold flex items-center gap-1.5">
            <PackageMinus className="w-4 h-4" />
            Raw Material Ingredient Deductions Applied to Latest Batch:
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[11px]">
            {lastDeductions.map((ded, i) => (
              <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                {ded.ingredientName}: <strong className="text-rose-400">-{ded.amount} {ded.unit}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Batch #, Dish Name, Chef..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Biryanis & Rice">Biryanis &amp; Rice</option>
            <option value="Curries & Gravies">Curries &amp; Gravies</option>
            <option value="Tandoor & Kebabs">Tandoor &amp; Kebabs</option>
            <option value="Tiffins & South Indian">Tiffins &amp; South Indian</option>
            <option value="Chaat & Street Food">Chaat &amp; Street Food</option>
            <option value="Breads & Desserts">Breads &amp; Desserts</option>
          </select>
        </div>
      </div>

      {/* Preparation Batch Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('batchNumber')}>
                  <div className="flex items-center gap-1">
                    Batch #
                    {sortField === 'batchNumber' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('menuItemName')}>
                  <div className="flex items-center gap-1">
                    Prepared Dish Name
                    {sortField === 'menuItemName' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort('portionsCount')}>
                  <div className="flex items-center justify-center gap-1">
                    Portions Count
                    {sortField === 'portionsCount' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Raw Ingredient Deductions</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('preparedBy')}>
                  <div className="flex items-center gap-1">
                    Prepared By Chef
                    {sortField === 'preparedBy' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center gap-1">
                    Date &amp; Time
                    {sortField === 'timestamp' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No dish preparation batches logged yet. Click "Log Prepared Dish Batch" above to record kitchen cooking.
                  </td>
                </tr>
              ) : (
                processedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {log.batchNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{log.menuItemName}</div>
                      <div className="text-[11px] text-slate-500">{log.category}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                        {log.portionsCount} portions
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                        {log.deductedIngredients.map((d, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                            {d.ingredientName}: -{d.amount} {d.unit}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {log.preparedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeletePrepLog(log.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Batch Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Log Prepared Dish Batch</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Prepared Recipe Dish</label>
                <select
                  value={selectedDishId}
                  onChange={e => {
                    setSelectedDishId(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  {menuItems.map(dish => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} ({dish.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Portions Prepared Count</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={portionsCount}
                  onChange={e => {
                    setPortionsCount(parseInt(e.target.value) || 1);
                    setValidationError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prepared By (Chef Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Chef Mohammed Farooq"
                  value={preparedBy}
                  onChange={e => setPreparedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kitchen Preparation Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch shift batch prep"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Log Batch &amp; Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
