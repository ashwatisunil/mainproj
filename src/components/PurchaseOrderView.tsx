import React, { useState, useMemo } from 'react';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  IngredientRequirement,
  Ingredient,
  User
} from '../types';
import {
  Truck,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  AlertTriangle,
  PackageCheck,
  Search,
  ChevronUp,
  ChevronDown,
  Trash2,
  X
} from 'lucide-react';

interface PurchaseOrderViewProps {
  purchaseOrders: PurchaseOrder[];
  shortageRequirements: IngredientRequirement[];
  ingredients: Ingredient[];
  currentUser: User;
  onCreatePOFromShortages: () => void;
  onUpdatePOStatus: (poId: string, status: 'draft' | 'submitted' | 'received') => void;
  onReceivePOShipment: (po: PurchaseOrder) => void;
  onDeletePO?: (poId: string) => void;
  onNavigateTab: (tab: string) => void;
}

type POSortField = 'poNumber' | 'supplierName' | 'createdAt' | 'deliveryDate' | 'itemsCount' | 'totalCost' | 'status';
type SortOrder = 'asc' | 'desc';

export const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({
  purchaseOrders,
  shortageRequirements,
  ingredients,
  currentUser,
  onCreatePOFromShortages,
  onUpdatePOStatus,
  onReceivePOShipment,
  onDeletePO,
  onNavigateTab
}) => {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<POSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: POSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedPOs = useMemo(() => {
    return purchaseOrders
      .filter(po => {
        const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
        const matchesSearch =
          po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortField === 'itemsCount') {
          aVal = a.items.length;
          bVal = b.items.length;
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
  }, [purchaseOrders, filterStatus, searchQuery, sortField, sortOrder]);

  const pendingShortages = shortageRequirements.filter(s => s.status === 'critical' || s.status === 'warning');
  const totalSpent = purchaseOrders
    .filter(po => po.status === 'received')
    .reduce((acc, po) => acc + po.totalCost, 0);

  const pendingDeliveries = purchaseOrders
    .filter(po => po.status === 'submitted')
    .length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & KPI Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              APMC MANDI &amp; WHOLESALE DAIRY REPLENISHMENT
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Vendor Purchase Orders &amp; Procurement
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Bundles forecast raw commodity deficits into wholesale purchase orders with standard sack/crate packaging and automated 1-click stock replenishment upon delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">Received Spend (YTD)</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">In-Transit Mandi Shipments</div>
              <div className="text-lg font-bold text-amber-400 tabular-nums">
                {pendingDeliveries} dispatches
              </div>
            </div>
          </div>
        </div>

        {/* Shortages Alert & Auto-PO Builder */}
        {pendingShortages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300">
                  {pendingShortages.length} Commodities Require Mandi Reordering ({pendingShortages.filter(p => p.status === 'critical').length} Critical Stockouts)
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Items low on stock: {pendingShortages.map(s => s.ingredientName.split(' ')[0]).join(', ')}
                </div>
              </div>
            </div>

            <button
              onClick={onCreatePOFromShortages}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              Generate Draft Mandi POs →
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search PO Number, Vendor, Item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Filter Status:</span>
          {['all', 'draft', 'submitted', 'received'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2 select-none">
                <th className="pb-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('poNumber')}>
                  <div className="flex items-center gap-1">
                    PO Number
                    {sortField === 'poNumber' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('supplierName')}>
                  <div className="flex items-center gap-1">
                    Wholesale Vendor / Mandi
                    {sortField === 'supplierName' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Created Date
                    {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('deliveryDate')}>
                  <div className="flex items-center gap-1">
                    Delivery ETA
                    {sortField === 'deliveryDate' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('itemsCount')}>
                  <div className="flex items-center gap-1">
                    Items Count
                    {sortField === 'itemsCount' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('totalCost')}>
                  <div className="flex items-center justify-end gap-1">
                    Total Invoice
                    {sortField === 'totalCost' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 text-center cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">
                    Status
                    {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="pb-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {processedPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No purchase orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                processedPOs.map(po => {
                  const isDraft = po.status === 'draft';
                  const isSubmitted = po.status === 'submitted';
                  const isReceived = po.status === 'received';

                  return (
                    <tr key={po.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                        {po.poNumber}
                      </td>

                      <td className="py-3.5 px-3 text-slate-200 font-medium">
                        {po.supplierName}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-400 tabular-nums">
                        {po.createdAt}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-300 tabular-nums">
                        {po.deliveryDate}
                      </td>

                      <td className="py-3.5 px-3 text-slate-400">
                        {po.items.length} items
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold text-sm">
                        ₹{po.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase font-mono ${
                          isReceived
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isSubmitted
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {po.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            View PO
                          </button>

                          {isDraft && (
                            <button
                              onClick={() => onUpdatePOStatus(po.id, 'submitted')}
                              className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit PO</span>
                            </button>
                          )}

                          {isSubmitted && (
                            <button
                              onClick={() => onReceivePOShipment(po)}
                              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <PackageCheck className="w-3 h-3" />
                              <span>Receive Stock</span>
                            </button>
                          )}

                          {onDeletePO && (
                            <button
                              onClick={() => onDeletePO(po.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                              title="Delete PO"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Drawer/Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-amber-400 font-mono">PURCHASE ORDER BREAKDOWN</div>
                <h3 className="text-base font-bold text-white">
                  {selectedPO.poNumber} — {selectedPO.supplierName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div>
                  <div className="text-[11px] text-slate-400">Created Date:</div>
                  <div className="font-mono text-slate-200">{selectedPO.createdAt}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Expected Delivery:</div>
                  <div className="font-mono text-slate-200">{selectedPO.deliveryDate}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-slate-300">Commodity Line Items:</div>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950/50 overflow-hidden">
                  {selectedPO.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">₹{item.unitCost}/{item.unit}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-300">{item.quantity} {item.unit}</div>
                        <div className="text-emerald-400 font-semibold">₹{item.totalCost.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm font-bold font-mono">
                <span className="text-slate-300">Total PO Invoice:</span>
                <span className="text-emerald-400">₹{selectedPO.totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
