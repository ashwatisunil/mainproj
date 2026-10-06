import React, { useState } from 'react';
import { SalesOrder, MenuItem, Ingredient, User } from '../types';
import { ShoppingBag, Plus, Trash2, PackageMinus, Search, X, ArrowLeft, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

interface Step3RecordOrdersProps {
  salesOrders: SalesOrder[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  currentUser: User;
  onPlaceOrder: (
    orderItems: { menuItemId: string; quantity: number }[],
    platform: 'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS',
    customerName?: string,
    notes?: string
  ) => void;
  onUpdateOrderStatus: (orderId: string, status: 'new' | 'preparing' | 'ready' | 'dispatched') => void;
  onDeleteOrder: (orderId: string) => void;
  lastDeductions: { ingredientName: string; amount: number; unit: string }[] | null;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const Step3RecordOrders: React.FC<Step3RecordOrdersProps> = ({
  salesOrders,
  menuItems,
  ingredients,
  currentUser,
  onPlaceOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  lastDeductions,
  onPrevStep,
  onNextStep
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [platform, setPlatform] = useState<'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS'>('Swiggy');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string>(menuItems[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [stockValidationError, setStockValidationError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setStockValidationError(null);
    if (!selectedDishId || quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === selectedDishId);
      if (existing) {
        return prev.map(i => (i.menuItemId === selectedDishId ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { menuItemId: selectedDishId, quantity }];
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setStockValidationError(null);
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Check Raw Stock Sufficiency Validation before placing order!
  const validateStockForCart = (): { valid: boolean; missingDetails?: string } => {
    const neededMap: Record<string, { needed: number; available: number; name: string; unit: string }> = {};

    cart.forEach(item => {
      const dish = menuItems.find(m => m.id === item.menuItemId);
      if (!dish) return;

      dish.recipe.forEach(rec => {
        const required = rec.amount * item.quantity;
        const ing = ingredients.find(i => i.id === rec.ingredientId);
        if (!ing) return;

        if (!neededMap[ing.id]) {
          neededMap[ing.id] = {
            needed: 0,
            available: ing.currentStock,
            name: ing.name,
            unit: ing.unit
          };
        }
        neededMap[ing.id].needed += required;
      });
    });

    const shortages: string[] = [];
    Object.values(neededMap).forEach(item => {
      if (item.needed > item.available) {
        shortages.push(`${item.name} (Need ${item.needed.toFixed(2)} ${item.unit}, but only ${item.available.toFixed(2)} ${item.unit} in stock)`);
      }
    });

    if (shortages.length > 0) {
      return {
        valid: false,
        missingDetails: shortages.join('; ')
      };
    }

    return { valid: true };
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setStockValidationError(null);

    if (cart.length === 0) {
      setStockValidationError('Please select at least one dish to record a sales order.');
      return;
    }

    const stockCheck = validateStockForCart();
    if (!stockCheck.valid) {
      setStockValidationError(`Stock Shortage: Insufficient ingredients! Details: ${stockCheck.missingDetails}. Please restock or reduce portion quantity.`);
      return;
    }

    onPlaceOrder(cart, platform, customerName.trim() || undefined, notes.trim() || undefined);
    setCart([]);
    setCustomerName('');
    setNotes('');
    setIsNewOrderModalOpen(false);
  };

  const filteredOrders = salesOrders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.items.some(i => i.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || o.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const totalPortionsSold = salesOrders.reduce((acc, o) => {
    return acc + o.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Record Dish Sales &amp; Auto Stock Deduction</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Record Dish Sales Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            When sales orders are recorded, raw ingredients are automatically deducted from stock (triggering Restock alerts if low), and demand predictions update for future shifts!
          </p>
        </div>

        <button
          onClick={() => {
            setStockValidationError(null);
            setIsNewOrderModalOpen(true);
          }}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sales Order</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Total Sales Orders Logged</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{salesOrders.length} orders</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Total Dish Portions Sold</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{totalPortionsSold} portions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-[11px]">Active Recipe Formulas</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-0.5">{menuItems.length} dishes</div>
        </div>
      </div>

      {/* Last Deductions Notice */}
      {lastDeductions && lastDeductions.length > 0 && (
        <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-xs space-y-2">
          <div className="text-amber-400 font-bold flex items-center gap-1.5">
            <PackageMinus className="w-4 h-4" />
            Automatic Stock Deductions Applied to Last Sale:
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[11px]">
            {lastDeductions.map((ded, i) => (
              <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                {ded.ingredientName}: <strong className="text-rose-400">-{ded.amount} {ded.unit}</strong>
              </span>
            ))}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Demand prediction updated! Higher demand will be forecasted for sold dishes.</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Dish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Channel:</span>
          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Channels</option>
            <option value="Swiggy">Swiggy</option>
            <option value="Zomato">Zomato</option>
            <option value="Magicpin">Magicpin</option>
            <option value="ONDC / Direct">ONDC / Direct</option>
            <option value="Counter POS">Counter POS</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Dishes Sold</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No sales orders recorded yet. Click "Record New Sales Order" above to log dish sales.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                        {order.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {order.customerName || 'Walk-in / Delivery Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      {order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        order.status === 'new' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        order.status === 'preparing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'new' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-bold"
                          >
                            Start Cooking
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                            className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record New Dish Sales Order</h3>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Error Banner */}
            {stockValidationError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{stockValidationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order Channel</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Swiggy">Swiggy</option>
                    <option value="Zomato">Zomato</option>
                    <option value="Magicpin">Magicpin</option>
                    <option value="ONDC / Direct">ONDC / Direct</option>
                    <option value="Counter POS">Counter POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul S."
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Add items to order */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-slate-300">Select Dish Sold:</div>
                <div className="flex gap-2">
                  <select
                    value={selectedDishId}
                    onChange={e => setSelectedDishId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium"
                  >
                    {menuItems.map(dish => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name} ({dish.category})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 text-center text-white font-mono font-bold"
                  />

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {cart.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium">Order Items:</div>
                    {cart.map((item, idx) => {
                      const dish = menuItems.find(m => m.id === item.menuItemId);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
                          <span>
                            <strong className="text-amber-400 font-bold">{item.quantity} portions</strong> of {dish?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`px-4 py-2 font-bold rounded-lg ${
                    cart.length > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Log Sale &amp; Deduct Raw Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      {(onPrevStep || onNextStep) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {onPrevStep ? (
            <button
              onClick={onPrevStep}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Step 1: Account Setup</span>
            </button>
          ) : <div />}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Demand Records →</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
