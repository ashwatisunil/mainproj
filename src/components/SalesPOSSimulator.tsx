import React, { useState } from 'react';
import {
  SalesOrder,
  MenuItem,
  Ingredient,
  User
} from '../types';
import {
  Clock,
  ShoppingBag,
  Zap,
  PackageMinus
} from 'lucide-react';

interface SalesPOSSimulatorProps {
  salesOrders: SalesOrder[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  currentUser: User;
  onSimulateRush: (type: 'lunch' | 'dinner' | 'rainy') => void;
  onPlaceOrder: (orderItems: { menuItemId: string; quantity: number }[], platform: 'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct') => void;
  onUpdateOrderStatus: (orderId: string, status: 'new' | 'preparing' | 'ready' | 'dispatched') => void;
  lastDeductions: { ingredientName: string; amount: number; unit: string }[] | null;
  onNavigateTab: (tab: string) => void;
}

export const SalesPOSSimulator: React.FC<SalesPOSSimulatorProps> = ({
  salesOrders,
  menuItems,
  ingredients,
  currentUser,
  onSimulateRush,
  onPlaceOrder,
  onUpdateOrderStatus,
  lastDeductions,
  onNavigateTab
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct'>('Swiggy');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(menuItems[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [customCart, setCustomCart] = useState<{ menuItemId: string; quantity: number }[]>([]);

  const handleAddToCart = () => {
    if (!selectedMenuItemId || orderQuantity <= 0) return;
    setCustomCart(prev => {
      const existing = prev.find(i => i.menuItemId === selectedMenuItemId);
      if (existing) {
        return prev.map(i => i.menuItemId === selectedMenuItemId ? { ...i, quantity: i.quantity + orderQuantity } : i);
      }
      return [...prev, { menuItemId: selectedMenuItemId, quantity: orderQuantity }];
    });
  };

  const handleSubmitCustomOrder = () => {
    if (customCart.length === 0) return;
    onPlaceOrder(customCart, selectedPlatform);
    setCustomCart([]);
  };

  const totalGrossToday = salesOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalItemsSold = salesOrders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & POS Simulator Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              SWIGGY, ZOMATO, MAGICPIN &amp; ONDC DISPATCH STREAM
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Aggregator POS &amp; Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simulates live incoming delivery tickets. Every order automatically deducts its precise Indian BOM raw ingredients (Basmati, Chicken, Paneer, Ghee) from inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">Total Shift Revenue</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                ₹{totalGrossToday.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right font-mono">
              <div className="text-[11px] text-slate-400">Dishes Dispatched</div>
              <div className="text-lg font-bold text-amber-400 tabular-nums">
                {totalItemsSold} portions
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulation Fast Triggers */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Simulate Indian Kitchen Spikes:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSimulateRush('lunch')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Biryani Lunch Rush (10 Orders)</span>
            </button>
            <button
              onClick={() => onSimulateRush('rainy')}
              className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Monsoon Samosa Surge (15 Orders)</span>
            </button>
            <button
              onClick={() => onSimulateRush('dinner')}
              className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ IPL Match Night Peak (20 Orders)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Inventory Deductions Notice */}
      {lastDeductions && lastDeductions.length > 0 && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-medium">
            <span className="flex items-center gap-1.5">
              <PackageMinus className="w-4 h-4" />
              Live Raw Material Inventory Deductions Applied:
            </span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="underline text-slate-300 hover:text-white cursor-pointer"
            >
              Inspect Stock Depletion →
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            {lastDeductions.map((ded, i) => (
              <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                {ded.ingredientName.split(' ')[0]}: <strong className="text-rose-400">-{ded.amount} {ded.unit}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Manual Order Entry Form & Live Tickets Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Manual Order Dispatch Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Direct Kitchen POS
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">BOM LINKED</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Delivery Aggregator Platform</label>
              <div className="grid grid-cols-2 gap-2 font-medium">
                {(['Swiggy', 'Zomato', 'Magicpin', 'ONDC / Direct'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    className={`py-1.5 px-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedPlatform === p
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Select Indian Menu Dish</label>
              <select
                value={selectedMenuItemId}
                onChange={e => setSelectedMenuItemId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none cursor-pointer"
              >
                {menuItems.map(dish => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name} (₹{dish.price.toFixed(0)}) · {dish.brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-slate-400 block mb-1 font-medium">Portion Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
              >
                + Add Dish
              </button>
            </div>

            {/* Current Custom Ticket Cart */}
            {customCart.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Pending Order Items:
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 divide-y divide-slate-800/80">
                  {customCart.map(item => {
                    const dish = menuItems.find(m => m.id === item.menuItemId);
                    return (
                      <div key={item.menuItemId} className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-200">{item.quantity}× {dish?.name}</span>
                        <span className="font-mono text-emerald-400">
                          ₹{((dish?.price || 0) * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitCustomOrder}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Fire Ticket &amp; Deduct Mandi Stock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Kitchen Display Tickets Stream (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Bhatti &amp; Packaging Queue ({salesOrders.length} tickets)
            </h2>
            <span className="text-xs text-slate-400">
              Auto-refreshed live
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {salesOrders.map(order => {
              const isDispatched = order.status === 'dispatched';

              return (
                <div
                  key={order.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.platform === 'Swiggy'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : order.platform === 'Zomato'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {order.platform}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {order.timestamp}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isDispatched
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                      <div className="font-mono font-bold text-emerald-400 text-sm mt-1 tabular-nums">
                        ₹{order.totalAmount.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* Dishes inside order */}
                  <div className="bg-slate-900/60 rounded-lg p-2.5 divide-y divide-slate-800/80">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1 flex items-center justify-between">
                        <span className="text-slate-200">
                          <strong className="text-amber-400 mr-1.5">{item.quantity}×</strong>
                          {item.menuItemName}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ticket actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500">
                      Ustad cook line verified
                    </span>

                    <div className="flex items-center gap-1.5">
                      {order.status !== 'dispatched' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Handover to Delivery Rider
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {salesOrders.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No orders active yet. Click one of the simulation buttons above to fire a rush.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
