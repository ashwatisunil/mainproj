import React from 'react';
import {
  Ingredient,
  MenuItem,
  SalesOrder,
  PurchaseOrder,
  WasteRecord,
  User,
  IngredientRequirement
} from '../types';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Truck,
  Trash2,
  ChefHat,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  MapPin,
  Users
} from 'lucide-react';

interface DashboardOverviewProps {
  currentUser: User;
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  wasteRecords: WasteRecord[];
  requirements: IngredientRequirement[];
  expiringIngredients: Ingredient[];
  onNavigateTab: (tab: string) => void;
  onCreatePOFromShortages: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  ingredients,
  menuItems,
  salesOrders,
  purchaseOrders,
  wasteRecords,
  requirements,
  expiringIngredients,
  onNavigateTab,
  onCreatePOFromShortages
}) => {
  // Real Operational KPI Calculations
  const totalStockValue = ingredients.reduce((acc, ing) => acc + (ing.currentStock * ing.unitCost), 0);
  const lowStockItems = ingredients.filter(ing => ing.currentStock <= ing.minStock);
  const criticalStockItems = ingredients.filter(ing => ing.currentStock <= ing.safetyStock);

  const activeOrders = salesOrders.filter(o => o.status !== 'dispatched');
  const totalOrdersRevenue = salesOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingPOs = purchaseOrders.filter(po => po.status === 'submitted');
  const totalWasteLoss = wasteRecords.reduce((acc, w) => acc + w.costLoss, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Operations Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-mono mb-1">
              <span className="font-bold text-slate-100">{currentUser.kitchenName}</span>
              <span>·</span>
              <span className="text-slate-400 font-sans flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {currentUser.location}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Cloud Kitchen Operations &amp; Inventory Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time ledger of sorted raw commodities, recipe formulas, active aggregator orders, and vendor procurement status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Manage Inventory</span>
            </button>
            <button
              onClick={() => onNavigateTab('staff')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Assign Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Inventory Value</span>
            <Package className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            ₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {ingredients.length} raw commodities &amp; grains
          </div>
        </div>

        {/* Active Kitchen Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Kitchen Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {activeOrders.length} active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ₹{totalOrdersRevenue.toLocaleString('en-IN')} total orders value today
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Stock Restock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
            {lowStockItems.length} items
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">
            {criticalStockItems.length} critical stockouts risk
          </div>
        </div>

        {/* Pending Vendor POs */}
        <div
          onClick={() => onNavigateTab('procurement')}
          className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Vendor Mandi POs</span>
            <Truck className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-400">
            {pendingPOs.length} dispatches
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            In-transit for kitchen replenishment
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert Actions & Active Orders Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Reorder & Perishable Freshness Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Stock Restock &amp; Expiry Alerts</h2>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Full Stock Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockItems.length === 0 && expiringIngredients.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              All raw materials and chiller items are sufficiently stocked!
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.slice(0, 4).map(ing => (
                <div key={ing.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{ing.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Category: {ing.category} · Storage: {ing.storageZone}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-rose-400">
                      {ing.currentStock} {ing.unit} (Min: {ing.minStock})
                    </div>
                    <div className="text-[10px] text-slate-500">Rate: ₹{ing.unitCost}/{ing.unit}</div>
                  </div>
                </div>
              ))}

              {lowStockItems.length > 0 && (
                <button
                  onClick={onCreatePOFromShortages}
                  className="w-full py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>1-Click Generate POs for Low Stock Items</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Orders Quick Stream */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Recent Kitchen Orders Stream</h2>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {salesOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800">
              No orders recorded yet. Click "New Order" to add kitchen orders.
            </div>
          ) : (
            <div className="space-y-2.5">
              {salesOrders.slice(0, 4).map(order => (
                <div key={order.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{order.orderNumber}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">{order.platform}</span>
                    </div>
                    <div className="text-slate-300 mt-1">
                      {order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-400 text-sm">₹{order.totalAmount}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
