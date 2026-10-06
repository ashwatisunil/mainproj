import React, { useState } from 'react';
import { User, Ingredient, MenuItem, SalesOrder, UserRole } from '../types';
import { Step1Setup } from './Step1Setup';
import { Step2StockAndMenu } from './Step2StockAndMenu';
import { Step3RecordOrders } from './Step3RecordOrders';
import { StaffManagementView } from './StaffManagementView';
import { Building2, Package, ShoppingBag, Users, ArrowLeft, ShieldCheck, Sparkles, Database } from 'lucide-react';

interface OwnerPortalViewProps {
  currentUser: User;
  users: User[];
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  salesOrders: SalesOrder[];
  lastDeductions: { ingredientName: string; amount: number; unit: string }[] | null;
  onSaveSetup: (setupData: { name: string; email: string; phone: string; kitchenName: string; location: string }) => void;
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onDeleteIngredient: (id: string) => void;
  onAddMenuItem: (dish: Omit<MenuItem, 'id'>) => void;
  onDeleteMenuItem: (id: string) => void;
  onLoadSampleData: () => void;
  onPlaceOrder: (items: { menuItemId: string; quantity: number }[], platform: 'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS', customerName?: string, notes?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: 'new' | 'preparing' | 'ready' | 'dispatched') => void;
  onDeleteOrder: (orderId: string) => void;
  onAddStaff: (staff: Omit<User, 'id' | 'avatarInitials'>) => void;
  onUpdateStaff: (userId: string, data: Partial<User>) => void;
  onDeleteStaff: (userId: string) => void;
  onSwitchUser: (user: User) => void;
  onBackToCustomerWebsite: () => void;
}

export const OwnerPortalView: React.FC<OwnerPortalViewProps> = ({
  currentUser,
  users,
  ingredients,
  menuItems,
  salesOrders,
  lastDeductions,
  onSaveSetup,
  onAddIngredient,
  onDeleteIngredient,
  onAddMenuItem,
  onDeleteMenuItem,
  onLoadSampleData,
  onPlaceOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onSwitchUser,
  onBackToCustomerWebsite
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'setup' | 'stock' | 'orders' | 'staff'>('setup');

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Portal Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>KITCHEN OWNER &amp; ADMIN PORTAL</span>
            <span>·</span>
            <span className="text-slate-400 font-sans">{currentUser.kitchenName}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cloud Kitchen Management Web Portal
          </h2>
        </div>

        <button
          onClick={onBackToCustomerWebsite}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Website</span>
        </button>
      </div>

      {/* Portal Management Tabs */}
      <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
        <button
          onClick={() => setActivePortalTab('setup')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'setup'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Kitchen &amp; Location Setup</span>
        </button>

        <button
          onClick={() => setActivePortalTab('stock')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'stock'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>2. Ingredients &amp; Menu Dishes</span>
        </button>

        <button
          onClick={() => setActivePortalTab('orders')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>3. Record &amp; Dispatch Orders ({salesOrders.length})</span>
        </button>

        <button
          onClick={() => setActivePortalTab('staff')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'staff'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>4. Staff &amp; Co-Admins ({users.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activePortalTab === 'setup' && (
        <Step1Setup
          currentUser={currentUser}
          onSaveSetup={onSaveSetup}
          onNextStep={() => setActivePortalTab('stock')}
        />
      )}

      {activePortalTab === 'stock' && (
        <Step2StockAndMenu
          ingredients={ingredients}
          menuItems={menuItems}
          onAddIngredient={onAddIngredient}
          onDeleteIngredient={onDeleteIngredient}
          onAddMenuItem={onAddMenuItem}
          onDeleteMenuItem={onDeleteMenuItem}
          onLoadSampleData={onLoadSampleData}
          onPrevStep={() => setActivePortalTab('setup')}
          onNextStep={() => setActivePortalTab('orders')}
        />
      )}

      {activePortalTab === 'orders' && (
        <Step3RecordOrders
          salesOrders={salesOrders}
          menuItems={menuItems}
          ingredients={ingredients}
          currentUser={currentUser}
          onPlaceOrder={onPlaceOrder}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onDeleteOrder={onDeleteOrder}
          lastDeductions={lastDeductions}
          onPrevStep={() => setActivePortalTab('stock')}
        />
      )}

      {activePortalTab === 'staff' && (
        <StaffManagementView
          users={users}
          currentUser={currentUser}
          onAddStaff={onAddStaff}
          onUpdateStaff={onUpdateStaff}
          onDeleteStaff={onDeleteStaff}
          onSwitchUser={onSwitchUser}
          onNavigateTab={() => {}}
        />
      )}
    </div>
  );
};
