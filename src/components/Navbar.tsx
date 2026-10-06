import React from 'react';
import { User } from '../types';
import {
  Flame,
  MapPin,
  Building2,
  Package,
  Utensils,
  ChefHat,
  Users,
  Database,
  TrendingUp,
  ShoppingBag,
  UserCheck,
  LayoutDashboard,
  Truck,
  Trash2,
  Zap,
  Sparkles,
  Store
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'setup'
  | 'orders'
  | 'demand'
  | 'stock'
  | 'recipes'
  | 'prep'
  | 'staff'
  | 'procurement'
  | 'waste'
  | 'simulator';

interface NavbarProps {
  currentUser: User;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenDataBackup?: () => void;
  onOpenAccountModal?: () => void;
  onOpenAICopilot?: () => void;
  onToggleCustomerWebsite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onOpenDataBackup,
  onOpenAccountModal,
  onOpenAICopilot,
  onToggleCustomerWebsite
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'setup', label: '1. Setup', icon: Building2 },
    { id: 'orders', label: '2. Sales', icon: ShoppingBag },
    { id: 'demand', label: '3. AI Demand', icon: TrendingUp },
    { id: 'stock', label: '4. Raw Stock', icon: Package },
    { id: 'recipes', label: '5. Recipes', icon: Utensils },
    { id: 'prep', label: '6. Batch Prep', icon: ChefHat },
    { id: 'staff', label: '7. Staff', icon: Users },
    { id: 'procurement', label: '8. Mandi POs', icon: Truck },
    { id: 'waste', label: '9. Spoilage', icon: Trash2 },
    { id: 'simulator', label: '10. KDS Simulator', icon: Zap }
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 lg:px-6 py-2.5 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Kitchen Brand & Location */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                Cloud Kitchen Hub
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                {currentUser.kitchenName || 'My Kitchen'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[220px] font-medium text-slate-300">
                {currentUser.location || 'Location Not Set'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden 2xl:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as ActiveTab)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAICopilot && (
            <button
              onClick={onOpenAICopilot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all cursor-pointer"
              title="AI Head Ustad & Cloud Kitchen Operations Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden sm:inline">AI Ustad</span>
            </button>
          )}

          {onToggleCustomerWebsite && (
            <button
              onClick={onToggleCustomerWebsite}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/60 transition-all cursor-pointer"
              title="Preview Customer Website & Online Menu"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Site</span>
            </button>
          )}

          {onOpenAccountModal && (
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 transition-all cursor-pointer"
              title="Account Settings & Staff Switch"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono">{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
            </button>
          )}

          {onOpenDataBackup && (
            <button
              onClick={onOpenDataBackup}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:text-amber-400 hover:border-slate-700 transition-all cursor-pointer"
              title="Backup or Restore Data"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Backup</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bar (Medium & Mobile scrollable) */}
      <div className="flex 2xl:hidden items-center gap-1 overflow-x-auto pt-2 mt-2 border-t border-slate-800 text-xs no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as ActiveTab)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-bold shrink-0 flex items-center gap-1.5 ${
                isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-400 bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
