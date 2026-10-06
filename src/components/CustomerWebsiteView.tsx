import React, { useState } from 'react';
import { MenuItem, SalesOrder, User } from '../types';
import { ShoppingBag, Utensils, MapPin, Clock, Flame, ChevronRight, CheckCircle2, Star, Plus, Minus, X, ArrowRight, ShieldCheck, Bike } from 'lucide-react';

interface CustomerWebsiteViewProps {
  currentUser: User;
  menuItems: MenuItem[];
  salesOrders: SalesOrder[];
  onPlaceCustomerOrder: (
    items: { menuItemId: string; quantity: number }[],
    customerName: string,
    phone: string,
    address: string,
    platform: 'ONDC / Direct'
  ) => void;
  onOpenOwnerPortal: () => void;
}

export const CustomerWebsiteView: React.FC<CustomerWebsiteViewProps> = ({
  currentUser,
  menuItems,
  salesOrders,
  onPlaceCustomerOrder,
  onOpenOwnerPortal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'track'>('menu');
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);

  const categories = [
    'all',
    'Biryanis & Rice',
    'Curries & Gravies',
    'Tandoor & Kebabs',
    'Tiffins & South Indian',
    'Chaat & Street Food',
    'Breads & Desserts'
  ];

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(m => m.category === selectedCategory);

  const handleAddToCart = (dishId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === dishId);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === dishId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuItemId: dishId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === dishId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(item => item.menuItemId !== dishId);
      }
      return prev.map(item =>
        item.menuItemId === dishId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => {
    const dish = menuItems.find(m => m.id === i.menuItemId);
    return acc + (dish ? dish.price * i.quantity : 0);
  }, 0);

  const deliveryFee = cartSubtotal > 499 ? 0 : 35;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !phone.trim() || !deliveryAddress.trim()) return;

    onPlaceCustomerOrder(
      cart,
      customerName.trim(),
      phone.trim(),
      deliveryAddress.trim(),
      'ONDC / Direct'
    );

    const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setLatestOrderId(generatedId);
    setCart([]);
    setIsCartOpen(false);
    setActiveTab('track');
  };

  const myOrders = salesOrders.filter(o => o.platform === 'ONDC / Direct');

  return (
    <div className="space-y-8 font-sans">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Official Cloud Kitchen Website</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {currentUser.kitchenName || 'Rasoi Master Cloud Kitchen'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <MapPin className="w-4 h-4 text-rose-400" />
              {currentUser.location || 'Indiranagar, Bengaluru'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Clock className="w-4 h-4" />
              Fresh Prep 25-30 Mins Delivery
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              4.8 ★ (1,240+ Website Direct Reviews)
            </span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Order authentic gourmet Indian meals freshly prepared in our cloud kitchen hub. Direct website orders get free delivery on orders above ₹499!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('menu')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Food Menu &amp; Order Online</span>
            </button>

            <button
              onClick={onOpenOwnerPortal}
              className="px-5 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Kitchen Owner Portal Login →</span>
            </button>
          </div>
        </div>

        {/* Decorative Graphic Background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Website View Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-4 text-sm font-bold">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'menu' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Online Food Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'track' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Track Live Order Status ({myOrders.length})</span>
          </button>
        </div>

        {/* Floating Cart Button */}
        {totalCartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{totalCartCount} items · ₹{grandTotal}</span>
          </button>
        )}
      </div>

      {/* TAB 1: ONLINE FOOD MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {c === 'all' ? 'All Dishes' : c}
              </button>
            ))}
          </div>

          {/* Food Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMenuItems.length === 0 ? (
              <div className="p-10 text-center text-slate-500 col-span-full bg-slate-900 border border-slate-800 rounded-2xl">
                No menu dishes found for this category.
              </div>
            ) : (
              filteredMenuItems.map(dish => {
                const cartItem = cart.find(i => i.menuItemId === dish.id);
                const qty = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={dish.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 font-mono font-semibold">{dish.category}</span>
                        <span className="text-slate-400 font-mono">{dish.prepTimeMinutes} mins prep</span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {dish.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        Authentic recipe crafted with fresh ingredients in our cloud kitchen hub.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="text-lg font-extrabold text-emerald-400 font-mono">
                          ₹{dish.price}
                        </div>
                        <div className="text-[10px] text-slate-500">Taxes Included</div>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                          <button
                            onClick={() => handleUpdateQuantity(dish.id, -1)}
                            className="w-7 h-7 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-white text-xs font-mono">{qty}</span>
                          <button
                            onClick={() => handleUpdateQuantity(dish.id, 1)}
                            className="w-7 h-7 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center cursor-pointer font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(dish.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ORDER TRACKER */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              Website Direct Orders &amp; Live Tracking
            </h2>

            {myOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                No orders placed yet. Select items from the Food Menu and order online!
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-amber-400 text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-slate-400">{order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'new' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          order.status === 'preparing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {order.status === 'new' ? 'Received at Kitchen' :
                           order.status === 'preparing' ? 'Cooking in Kitchen' :
                           order.status === 'ready' ? 'Dispatched for Delivery' : 'Delivered'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 divide-y divide-slate-800 border-t border-slate-800 pt-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between">
                          <span>{item.quantity}x {item.menuItemName}</span>
                          <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Total Order Invoice:</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Your Order Checkout</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              {/* Items in cart */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {cart.map((item, idx) => {
                  const dish = menuItems.find(m => m.id === item.menuItemId);
                  if (!dish) return null;
                  return (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-200">{dish.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">₹{dish.price} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(dish.id, -1)}
                          className="w-6 h-6 bg-slate-800 text-slate-300 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-bold font-mono text-white text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(dish.id, 1)}
                          className="w-6 h-6 bg-amber-500 text-slate-950 font-bold rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-200">Delivery Details:</h4>

                <div>
                  <label className="block text-slate-400 mb-1">Your Full Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Phone Number <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Delivery Address <span className="text-rose-400">*</span></label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Flat 402, Sunshine Apartments, Indiranagar"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Confirm Order &amp; Pay ₹{grandTotal}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
