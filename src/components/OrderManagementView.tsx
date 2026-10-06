import React, { useState, useMemo } from 'react';
import {
  SalesOrder,
  MenuItem,
  Ingredient,
  User
} from '../types';
import {
  Clock,
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle,
  PackageMinus,
  ArrowUpDown,
  Filter,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  ChefHat
} from 'lucide-react';

interface OrderManagementViewProps {
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
  onNavigateTab: (tab: string) => void;
}

type SortField = 'orderNumber' | 'platform' | 'customerName' | 'timestamp' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({
  salesOrders,
  menuItems,
  ingredients,
  currentUser,
  onPlaceOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  lastDeductions,
  onNavigateTab
}) => {
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // New Order Modal State
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderPlatform, setOrderPlatform] = useState<'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS'>('Swiggy');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<string>(menuItems[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedItemForAdd || itemQuantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === selectedItemForAdd);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === selectedItemForAdd ? { ...i, quantity: i.quantity + itemQuantity } : i
        );
      }
      return [...prev, { menuItemId: selectedItemForAdd, quantity: itemQuantity }];
    });
    setItemQuantity(1);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    onPlaceOrder(cart, orderPlatform, customerName.trim() || undefined, orderNotes.trim() || undefined);
    setCart([]);
    setCustomerName('');
    setOrderNotes('');
    setIsCreatingOrder(false);
  };

  // Filtered and Sorted Orders
  const processedOrders = useMemo(() => {
    return salesOrders
      .filter(order => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          order.items.some(i => i.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPlatform = selectedPlatform === 'all' || order.platform === selectedPlatform;
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;

        return matchesSearch && matchesPlatform && matchesStatus;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'customerName') {
          aVal = a.customerName || '';
          bVal = b.customerName || '';
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
  }, [salesOrders, searchQuery, selectedPlatform, selectedStatus, sortField, sortOrder]);

  // KPI Calculations
  const totalRevenue = salesOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeOrdersCount = salesOrders.filter(o => o.status !== 'dispatched').length;
  const dispatchedCount = salesOrders.filter(o => o.status === 'dispatched').length;
  const totalDishesPrepared = salesOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  const getStatusBadge = (status: SalesOrder['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">New Order</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Preparing</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Ready for Dispatch</span>;
      case 'dispatched':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Dispatched</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & KPI Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              REAL KITCHEN DISPATCH &amp; INVENTORY ORDER LEDGER
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Kitchen Orders &amp; Preparation Stream
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Track and manage actual kitchen orders across Swiggy, Zomato, Direct, Magicpin &amp; Counter POS. Every submitted order automatically deducts recipe ingredients from stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreatingOrder(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Kitchen Order</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Active Kitchen Orders</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{activeOrdersCount} orders</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Dispatched Today</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{dispatchedCount} orders</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Total Portions Prepared</div>
            <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">{totalDishesPrepared} items</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Total Orders Value</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Deductions Banner */}
      {lastDeductions && lastDeductions.length > 0 && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-medium">
            <span className="flex items-center gap-1.5">
              <PackageMinus className="w-4 h-4" />
              Raw Material Stock Deductions Applied to Latest Order:
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

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Dish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Platform Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Channel:</span>
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Channels</option>
              <option value="Swiggy">Swiggy</option>
              <option value="Zomato">Zomato</option>
              <option value="Magicpin">Magicpin</option>
              <option value="ONDC / Direct">ONDC / Direct</option>
              <option value="Counter POS">Counter POS</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="dispatched">Dispatched</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('orderNumber')}>
                  <div className="flex items-center gap-1">
                    Order #
                    {sortField === 'orderNumber' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('platform')}>
                  <div className="flex items-center gap-1">
                    Channel / Platform
                    {sortField === 'platform' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center gap-1">
                    Customer / Details
                    {sortField === 'customerName' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center gap-1">
                    Date &amp; Time
                    {sortField === 'timestamp' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Dishes Ordered</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-right" onClick={() => handleSort('totalAmount')}>
                  <div className="flex items-center justify-end gap-1">
                    Total (₹)
                    {sortField === 'totalAmount' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">
                    Status
                    {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Kitchen Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No orders match your filter criteria. Click "New Kitchen Order" to create one.
                  </td>
                </tr>
              ) : (
                processedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        order.platform === 'Swiggy' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        order.platform === 'Zomato' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        order.platform === 'Magicpin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        order.platform === 'ONDC / Direct' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {order.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {order.customerName || 'Walk-in / Aggregator Customer'}
                      {order.notes && (
                        <div className="text-[11px] text-slate-500 font-normal italic">
                          Note: {order.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(order.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-slate-200 text-xs">
                            <span className="font-semibold text-amber-400">{item.quantity}x</span> {item.menuItemName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'new' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold rounded cursor-pointer transition-colors"
                          >
                            Start Cooking
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold rounded cursor-pointer transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold rounded cursor-pointer transition-colors"
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          title="Delete Order"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      {isCreatingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Create New Kitchen Order</h2>
              </div>
              <button
                onClick={() => setIsCreatingOrder(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Order Channel / Aggregator</label>
                  <select
                    value={orderPlatform}
                    onChange={e => setOrderPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Swiggy">Swiggy</option>
                    <option value="Zomato">Zomato</option>
                    <option value="Magicpin">Magicpin</option>
                    <option value="ONDC / Direct">ONDC / Direct</option>
                    <option value="Counter POS">Counter POS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name / Table #</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul S. / Table 3"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Add Dish items */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="font-semibold text-slate-300">Add Menu Dish to Order</div>
                <div className="flex gap-2">
                  <select
                    value={selectedItemForAdd}
                    onChange={e => setSelectedItemForAdd(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} — ₹{item.price} ({item.brand.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={itemQuantity}
                    onChange={e => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Cart list */}
                {cart.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-medium">Selected Dishes:</div>
                    {cart.map((cartItem, i) => {
                      const dish = menuItems.find(m => m.id === cartItem.menuItemId);
                      return (
                        <div key={i} className="flex items-center justify-between bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                          <span>
                            <strong className="text-amber-400">{cartItem.quantity}x</strong> {dish?.name} (₹{(dish?.price || 0) * cartItem.quantity})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(i)}
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

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Special Cooking Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy gravy, less ghee"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                    cart.length > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Submit Order &amp; Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
