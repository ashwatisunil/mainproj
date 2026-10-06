import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Ingredient,
  MenuItem,
  KitchenPrepLog,
  WeatherCondition,
  CalendarEvent,
  SalesOrder,
  PurchaseOrder,
  WasteRecord,
  UserRole,
  RecipeIngredient,
  IngredientRequirement
} from './types';
import {
  INITIAL_USERS,
  INITIAL_INGREDIENTS,
  INITIAL_MENU_ITEMS,
  WEATHER_PRESETS,
  CALENDAR_EVENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_WASTE_RECORDS
} from './data/mockData';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { Step1Setup } from './components/Step1Setup';
import { Step3RecordOrders } from './components/Step3RecordOrders';
import { OrderManagementView } from './components/OrderManagementView';
import { DemandPredictorView } from './components/DemandPredictorView';
import { Step2StockAndMenu } from './components/Step2StockAndMenu';
import { InventoryManagementView } from './components/InventoryManagementView';
import { RecipeBOMView } from './components/RecipeBOMView';
import { Step4BatchPrep } from './components/Step4BatchPrep';
import { StaffManagementView } from './components/StaffManagementView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { WasteAnalyticsView } from './components/WasteAnalyticsView';
import { SalesPOSSimulator } from './components/SalesPOSSimulator';
import { CustomerWebsiteView } from './components/CustomerWebsiteView';
import { AICopilotModal } from './components/AICopilotModal';
import { AuthModal } from './components/AuthModal';
import { KitchenOnboardingModal } from './components/KitchenOnboardingModal';
import { generateDemandPredictions, calculateIngredientRequirements, getExpiringIngredients } from './services/predictionEngine';
import { Database, Download, Upload, RotateCcw, X } from 'lucide-react';

export default function App() {
  // Navigation & View Mode State
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [viewMode, setViewMode] = useState<'portal' | 'customer_website'>('portal');

  // Prediction Parameters State
  const [selectedDay, setSelectedDay] = useState<string>('Friday');
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>(WEATHER_PRESETS[0]);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent>(CALENDAR_EVENTS[0]);

  // Persistent Operations State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_sales_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ord-101',
        orderNumber: '#SWIGGY-901',
        platform: 'Swiggy',
        timestamp: new Date().toISOString(),
        items: [
          { menuItemId: INITIAL_MENU_ITEMS[0]?.id || 'menu-hyderabadi-biryani', menuItemName: 'Biryani', quantity: 5, price: 349 }
        ],
        totalAmount: 1745,
        status: 'dispatched'
      }
    ];
  });

  const [prepLogs, setPrepLogs] = useState<KitchenPrepLog[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_preplogs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-1',
        batchNumber: 'BATCH-101',
        menuItemId: INITIAL_MENU_ITEMS[0]?.id || 'menu-hyderabadi-biryani',
        menuItemName: 'Biryani',
        category: 'Biryanis & Rice',
        portionsCount: 15,
        timestamp: new Date().toISOString(),
        preparedBy: 'Chef Mohammed Farooq',
        deductedIngredients: [
          { ingredientName: 'Rice', amount: 3.75, unit: 'kg' },
          { ingredientName: 'Chicken', amount: 4.2, unit: 'kg' },
          { ingredientName: 'Ghee', amount: 0.52, unit: 'kg' }
        ]
      }
    ];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(() => {
    const saved = localStorage.getItem('rasoi_kitchen_waste_records');
    return saved ? JSON.parse(saved) : INITIAL_WASTE_RECORDS;
  });

  // Modal States
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);
  const [isInitialOnboardingOpen, setIsInitialOnboardingOpen] = useState(!currentUser.isSetupCompleted);
  const [lastDeductions, setLastDeductions] = useState<{ ingredientName: string; amount: number; unit: string }[] | null>(null);

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_sales_orders', JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_preplogs', JSON.stringify(prepLogs));
  }, [prepLogs]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('rasoi_kitchen_waste_records', JSON.stringify(wasteRecords));
  }, [wasteRecords]);

  // Dynamic Demand Predictions Engine Output
  const predictions = useMemo(() => {
    return generateDemandPredictions(menuItems, selectedDay, currentWeather, currentEvent);
  }, [menuItems, selectedDay, currentWeather, currentEvent]);

  // Dynamic Stock Requirements
  const requirements = useMemo(() => {
    return calculateIngredientRequirements(predictions, menuItems, ingredients);
  }, [predictions, menuItems, ingredients]);

  // Expiring Ingredients
  const expiringIngredients = useMemo(() => {
    return getExpiringIngredients(ingredients);
  }, [ingredients]);

  // Save Setup
  const handleSaveSetup = (setupData: {
    name: string;
    email: string;
    phone: string;
    kitchenName: string;
    location: string;
  }) => {
    const initials = setupData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updatedUser: User = {
      ...currentUser,
      name: setupData.name,
      email: setupData.email,
      phone: setupData.phone,
      kitchenName: setupData.kitchenName,
      location: setupData.location,
      avatarInitials: initials || 'CK',
      isSetupCompleted: true
    };

    setCurrentUser(updatedUser);
    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      return exists ? prev.map(u => (u.id === updatedUser.id ? updatedUser : u)) : [updatedUser, ...prev];
    });
  };

  // User Account Creation & Switching
  const handleRegisterUser = (name: string, email: string, role: UserRole) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      kitchenName: currentUser.kitchenName || 'My Cloud Kitchen',
      location: currentUser.location || 'Koramangala, Bengaluru',
      avatarInitials: initials || 'CK',
      isSetupCompleted: true
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  // Onboarding Wizard Completion
  const handleCompleteOnboarding = (setupData: {
    name: string;
    email: string;
    role: UserRole;
    kitchenName: string;
    location: string;
    templateType: 'starter' | 'blank';
  }) => {
    const initials = setupData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updatedUser: User = {
      ...currentUser,
      name: setupData.name,
      email: setupData.email,
      role: setupData.role,
      kitchenName: setupData.kitchenName,
      location: setupData.location,
      avatarInitials: initials || 'CK',
      isSetupCompleted: true
    };

    setCurrentUser(updatedUser);
    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      return exists ? prev.map(u => (u.id === updatedUser.id ? updatedUser : u)) : [updatedUser, ...prev];
    });

    if (setupData.templateType === 'blank') {
      setIngredients([]);
      setMenuItems([]);
      setSalesOrders([]);
      setPrepLogs([]);
      setPurchaseOrders([]);
      setWasteRecords([]);
    } else {
      setIngredients(INITIAL_INGREDIENTS);
      setMenuItems(INITIAL_MENU_ITEMS);
    }

    setIsInitialOnboardingOpen(false);
  };

  // Place Sales Order -> Deducts Raw Ingredients & Boosts Dish Demand Prediction!
  const handlePlaceSalesOrder = (
    orderItems: { menuItemId: string; quantity: number }[],
    platform: 'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS',
    customerName?: string,
    notes?: string
  ) => {
    const deductionsNotice: { ingredientName: string; amount: number; unit: string }[] = [];
    const deductionsMap: Record<string, number> = {};
    const salesMap: Record<string, number> = {};
    let calculatedTotal = 0;

    orderItems.forEach(item => {
      const dish = menuItems.find(m => m.id === item.menuItemId);
      if (!dish) return;

      salesMap[dish.id] = (salesMap[dish.id] || 0) + item.quantity;
      calculatedTotal += (dish.price || 250) * item.quantity;

      dish.recipe.forEach(rec => {
        const required = rec.amount * item.quantity;
        deductionsMap[rec.ingredientId] = (deductionsMap[rec.ingredientId] || 0) + required;
      });
    });

    // 1. Deduct Stock in Real-Time
    setIngredients(prev =>
      prev.map(ing => {
        const deduction = deductionsMap[ing.id];
        if (deduction && deduction > 0) {
          const newStock = Math.max(0, Number((ing.currentStock - deduction).toFixed(2)));
          deductionsNotice.push({
            ingredientName: ing.name,
            amount: parseFloat(deduction.toFixed(2)),
            unit: ing.unit
          });
          return { ...ing, currentStock: newStock };
        }
        return ing;
      })
    );

    setLastDeductions(deductionsNotice);

    // 2. Feedback Loop into Demand Prediction (Increase Dish Baseline Sales & Historical SMA)
    setMenuItems(prev =>
      prev.map(m => {
        const qtySold = salesMap[m.id];
        if (qtySold && qtySold > 0) {
          const updatedHistory = [...(m.historicalWeeklySales || [50]), m.baseAverageDemand + qtySold];
          const newBaseDemand = Math.round(m.baseAverageDemand + qtySold * 0.5);
          return {
            ...m,
            baseAverageDemand: newBaseDemand,
            historicalWeeklySales: updatedHistory
          };
        }
        return m;
      })
    );

    // 3. Log Sales Order
    const newOrder: SalesOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `#${platform.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      platform,
      customerName,
      timestamp: new Date().toISOString(),
      items: orderItems.map(i => {
        const dish = menuItems.find(m => m.id === i.menuItemId);
        return {
          menuItemId: i.menuItemId,
          menuItemName: dish?.name || 'Dish',
          quantity: i.quantity,
          price: dish?.price || 250
        };
      }),
      totalAmount: calculatedTotal,
      status: 'new',
      notes
    };

    setSalesOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'new' | 'preparing' | 'ready' | 'dispatched') => {
    setSalesOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setSalesOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Ingredient Handlers
  const handleAddIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const created: Ingredient = {
      ...newIng,
      id: `ing-${Date.now()}`
    };
    setIngredients(prev => [...prev, created]);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateStock = (ingredientId: string, newStock: number, _reason: string) => {
    setIngredients(prev =>
      prev.map(ing => (ing.id === ingredientId ? { ...ing, currentStock: newStock } : ing))
    );
  };

  // Dish Recipe Handlers
  const handleAddMenuItem = (newDish: Omit<MenuItem, 'id'>) => {
    const created: MenuItem = {
      ...newDish,
      id: `dish-${Date.now()}`
    };
    setMenuItems(prev => [...prev, created]);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateRecipe = (menuItemId: string, updatedRecipe: RecipeIngredient[]) => {
    setMenuItems(prev =>
      prev.map(m => (m.id === menuItemId ? { ...m, recipe: updatedRecipe } : m))
    );
  };

  const handleLoadSampleData = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setMenuItems(INITIAL_MENU_ITEMS);
  };

  // Log Batch Preparation
  const handleLogPrepBatch = (
    menuItemId: string,
    portionsCount: number,
    preparedBy: string,
    notes?: string
  ) => {
    const dish = menuItems.find(m => m.id === menuItemId);
    if (!dish) return;

    const deductionsNotice: { ingredientName: string; amount: number; unit: string }[] = [];
    const deductionsMap: Record<string, number> = {};

    dish.recipe.forEach(rec => {
      const requiredAmount = rec.amount * portionsCount;
      deductionsMap[rec.ingredientId] = (deductionsMap[rec.ingredientId] || 0) + requiredAmount;
    });

    setIngredients(prev =>
      prev.map(ing => {
        const deduction = deductionsMap[ing.id];
        if (deduction && deduction > 0) {
          const newStock = Math.max(0, Number((ing.currentStock - deduction).toFixed(2)));
          deductionsNotice.push({
            ingredientName: ing.name,
            amount: parseFloat(deduction.toFixed(2)),
            unit: ing.unit
          });
          return { ...ing, currentStock: newStock };
        }
        return ing;
      })
    );

    setLastDeductions(deductionsNotice);

    const newLog: KitchenPrepLog = {
      id: `prep-${Date.now()}`,
      batchNumber: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      menuItemId: dish.id,
      menuItemName: dish.name,
      category: dish.category,
      portionsCount,
      timestamp: new Date().toISOString(),
      preparedBy,
      notes,
      deductedIngredients: deductionsNotice
    };

    setPrepLogs(prev => [newLog, ...prev]);
  };

  const handleDeletePrepLog = (logId: string) => {
    setPrepLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Purchase Order Handlers
  const handleCreatePOFromShortages = () => {
    const shortages = requirements.filter(r => r.recommendedOrder > 0);
    if (shortages.length === 0) {
      alert('All raw materials are currently sufficient! No POs needed.');
      return;
    }

    const grouped: Record<string, { ing: IngredientRequirement; qty: number }[]> = {};
    shortages.forEach(s => {
      if (!grouped[s.supplierName]) grouped[s.supplierName] = [];
      grouped[s.supplierName].push({ ing: s, qty: s.recommendedOrder });
    });

    const newPOs: PurchaseOrder[] = Object.entries(grouped).map(([supplierName, items], index) => {
      const poItems = items.map(item => ({
        ingredientId: item.ing.ingredientId,
        name: item.ing.ingredientName,
        quantity: item.qty,
        unit: item.ing.unit,
        unitCost: item.ing.unitCost,
        totalCost: item.qty * item.ing.unitCost
      }));
      const totalCost = poItems.reduce((acc, i) => acc + i.totalCost, 0);

      return {
        id: `po-${Date.now()}-${index}`,
        poNumber: `PO-MANDI-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName,
        createdAt: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'draft',
        items: poItems,
        totalCost,
        notes: 'Generated from AI Demand Forecast Stock Requirements'
      };
    });

    setPurchaseOrders(prev => [...newPOs, ...prev]);
    setCurrentTab('procurement');
    alert(`Successfully generated ${newPOs.length} draft Purchase Orders for wholesale suppliers!`);
  };

  const handleUpdatePOStatus = (poId: string, status: 'draft' | 'submitted' | 'received') => {
    setPurchaseOrders(prev => prev.map(p => (p.id === poId ? { ...p, status } : p)));
  };

  const handleReceivePOShipment = (po: PurchaseOrder) => {
    const additionMap: Record<string, number> = {};
    po.items.forEach(item => {
      additionMap[item.ingredientId] = (additionMap[item.ingredientId] || 0) + item.quantity;
    });

    setIngredients(prev =>
      prev.map(ing => {
        const added = additionMap[ing.id];
        if (added && added > 0) {
          const newStock = Number((ing.currentStock + added).toFixed(2));
          return {
            ...ing,
            currentStock: newStock,
            lastRestocked: new Date().toISOString().split('T')[0]
          };
        }
        return ing;
      })
    );

    setPurchaseOrders(prev =>
      prev.map(p => (p.id === po.id ? { ...p, status: 'received' } : p))
    );

    alert(`Stock Replenished! Received ${po.items.length} items from ${po.supplierName}. Inventory updated successfully.`);
  };

  const handleDeletePO = (poId: string) => {
    setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
  };

  // Food Waste Handlers
  const handleLogWaste = (
    ingredientId: string,
    amount: number,
    reason: 'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage'
  ) => {
    const ing = ingredients.find(i => i.id === ingredientId);
    if (!ing) return;

    const newStock = Math.max(0, Number((ing.currentStock - amount).toFixed(2)));
    const costLoss = Number((amount * ing.unitCost).toFixed(2));

    setIngredients(prev =>
      prev.map(i => (i.id === ingredientId ? { ...i, currentStock: newStock } : i))
    );

    const newRecord: WasteRecord = {
      id: `waste-${Date.now()}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      amount,
      unit: ing.unit,
      costLoss,
      reason,
      loggedAt: new Date().toLocaleString('en-IN'),
      loggedBy: currentUser.name
    };

    setWasteRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteWasteRecord = (wasteId: string) => {
    setWasteRecords(prev => prev.filter(w => w.id !== wasteId));
  };

  // Simulator Handler
  const handleSimulateRush = (type: 'lunch' | 'dinner' | 'rainy') => {
    const count = type === 'lunch' ? 10 : type === 'rainy' ? 15 : 20;
    const platforms: ('Swiggy' | 'Zomato' | 'Magicpin')[] = ['Swiggy', 'Zomato', 'Magicpin'];

    for (let i = 0; i < count; i++) {
      const randomDish = menuItems[Math.floor(Math.random() * menuItems.length)];
      if (!randomDish) continue;
      const qty = Math.floor(1 + Math.random() * 3);
      const plat = platforms[Math.floor(Math.random() * platforms.length)];
      handlePlaceSalesOrder([{ menuItemId: randomDish.id, quantity: qty }], plat, `Rush Customer ${i + 1}`);
    }

    alert(`Simulated ${count} live ${type} rush orders across Swiggy and Zomato! Ingredients deducted and demand baseline updated.`);
  };

  // Staff Handlers
  const handleAddStaff = (newStaff: Omit<User, 'id' | 'avatarInitials'>) => {
    const initials = newStaff.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const createdUser: User = {
      ...newStaff,
      id: `user-${Date.now()}`,
      avatarInitials: initials || 'ST'
    };

    setUsers(prev => [...prev, createdUser]);
  };

  const handleUpdateStaff = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updatedData } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
  };

  const handleDeleteStaff = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Backup / Export
  const handleExportDataJSON = () => {
    const data = {
      user: currentUser,
      users,
      ingredients,
      menuItems,
      salesOrders,
      prepLogs,
      purchaseOrders,
      wasteRecords,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloud_kitchen_operations_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDataJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.user) setCurrentUser(imported.user);
        if (imported.users) setUsers(imported.users);
        if (imported.ingredients) setIngredients(imported.ingredients);
        if (imported.menuItems) setMenuItems(imported.menuItems);
        if (imported.salesOrders) setSalesOrders(imported.salesOrders);
        if (imported.prepLogs) setPrepLogs(imported.prepLogs);
        if (imported.purchaseOrders) setPurchaseOrders(imported.purchaseOrders);
        if (imported.wasteRecords) setWasteRecords(imported.wasteRecords);
        alert('Kitchen Data Imported Successfully!');
        setIsDataModalOpen(false);
      } catch (err) {
        alert('Invalid JSON File!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all kitchen stock, recipes, sales orders, purchase orders, and prep logs to initial defaults?')) {
      setIngredients(INITIAL_INGREDIENTS);
      setMenuItems(INITIAL_MENU_ITEMS);
      setUsers(INITIAL_USERS);
      setSalesOrders([]);
      setPrepLogs([]);
      setPurchaseOrders([]);
      setWasteRecords([]);
      localStorage.clear();
      setIsDataModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 pb-16">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDataBackup={() => setIsDataModalOpen(true)}
        onOpenAccountModal={() => setIsAuthModalOpen(true)}
        onOpenAICopilot={() => setIsCopilotModalOpen(true)}
        onToggleCustomerWebsite={() => setViewMode(viewMode === 'customer_website' ? 'portal' : 'customer_website')}
      />

      {/* Main Operations Views */}
      <main className="px-4 lg:px-8 py-6">
        {viewMode === 'customer_website' ? (
          <CustomerWebsiteView
            currentUser={currentUser}
            menuItems={menuItems}
            salesOrders={salesOrders}
            onPlaceCustomerOrder={(items, name, phone, address) =>
              handlePlaceSalesOrder(items, 'ONDC / Direct', name, `Phone: ${phone} | Addr: ${address}`)
            }
            onOpenOwnerPortal={() => setViewMode('portal')}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardOverview
                currentUser={currentUser}
                ingredients={ingredients}
                menuItems={menuItems}
                salesOrders={salesOrders}
                purchaseOrders={purchaseOrders}
                wasteRecords={wasteRecords}
                requirements={requirements}
                expiringIngredients={expiringIngredients}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
                onCreatePOFromShortages={handleCreatePOFromShortages}
              />
            )}

            {currentTab === 'setup' && (
              <Step1Setup
                currentUser={currentUser}
                onSaveSetup={handleSaveSetup}
                onNextStep={() => setCurrentTab('orders')}
              />
            )}

            {currentTab === 'orders' && (
              <OrderManagementView
                salesOrders={salesOrders}
                menuItems={menuItems}
                ingredients={ingredients}
                currentUser={currentUser}
                onPlaceOrder={handlePlaceSalesOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                lastDeductions={lastDeductions}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'demand' && (
              <DemandPredictorView
                predictions={predictions}
                menuItems={menuItems}
                ingredients={ingredients}
                selectedDay={selectedDay}
                onChangeDay={setSelectedDay}
                currentWeather={currentWeather}
                onChangeWeather={type => {
                  const found = WEATHER_PRESETS.find(w => w.type === type);
                  if (found) setCurrentWeather(found);
                }}
                currentEvent={currentEvent}
                onChangeEvent={eventId => {
                  const found = CALENDAR_EVENTS.find(e => e.id === eventId);
                  if (found) setCurrentEvent(found);
                }}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'stock' && (
              <InventoryManagementView
                ingredients={ingredients}
                currentUser={currentUser}
                onUpdateStock={handleUpdateStock}
                onLogWaste={handleLogWaste}
                onAddNewIngredient={handleAddIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'recipes' && (
              <RecipeBOMView
                menuItems={menuItems}
                ingredients={ingredients}
                currentUser={currentUser}
                onUpdateRecipe={handleUpdateRecipe}
                onAddNewMenuItem={handleAddMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'prep' && (
              <Step4BatchPrep
                prepLogs={prepLogs}
                menuItems={menuItems}
                ingredients={ingredients}
                currentUser={currentUser}
                onLogPrepBatch={handleLogPrepBatch}
                onDeletePrepLog={handleDeletePrepLog}
                lastDeductions={lastDeductions}
              />
            )}

            {currentTab === 'staff' && (
              <StaffManagementView
                users={users}
                currentUser={currentUser}
                onAddStaff={handleAddStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                onSwitchUser={setCurrentUser}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'procurement' && (
              <PurchaseOrderView
                purchaseOrders={purchaseOrders}
                shortageRequirements={requirements}
                ingredients={ingredients}
                currentUser={currentUser}
                onCreatePOFromShortages={handleCreatePOFromShortages}
                onUpdatePOStatus={handleUpdatePOStatus}
                onReceivePOShipment={handleReceivePOShipment}
                onDeletePO={handleDeletePO}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'waste' && (
              <WasteAnalyticsView
                wasteRecords={wasteRecords}
                ingredients={ingredients}
                currentUser={currentUser}
                onLogWaste={handleLogWaste}
                onDeleteWasteRecord={handleDeleteWasteRecord}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}

            {currentTab === 'simulator' && (
              <SalesPOSSimulator
                salesOrders={salesOrders}
                menuItems={menuItems}
                ingredients={ingredients}
                currentUser={currentUser}
                onSimulateRush={handleSimulateRush}
                onPlaceOrder={handlePlaceSalesOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                lastDeductions={lastDeductions}
                onNavigateTab={(tab) => setCurrentTab(tab as ActiveTab)}
              />
            )}
          </>
        )}
      </main>

      {/* AI Head Ustad Copilot Modal */}
      <AICopilotModal
        isOpen={isCopilotModalOpen}
        onClose={() => setIsCopilotModalOpen(false)}
        dayOfWeek={selectedDay}
        weather={currentWeather.label}
        totalOrders={salesOrders.length}
        revenue={salesOrders.reduce((acc, o) => acc + o.totalAmount, 0)}
        shortagesCount={requirements.filter(r => r.status === 'critical').length}
      />

      {/* Onboarding Setup Modal */}
      <KitchenOnboardingModal
        isOpen={isInitialOnboardingOpen}
        onCompleteSetup={handleCompleteOnboarding}
        isInitialSetup={true}
      />

      {/* Account & Staff RBAC Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        onRegisterUser={handleRegisterUser}
      />

      {/* Backup Modal */}
      {isDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Kitchen Data Persistence &amp; Backup</h3>
              </div>
              <button onClick={() => setIsDataModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                All details (Kitchen Name, Location, Ingredients, Recipes, Sales Orders, Prep Logs, Purchase Orders, Waste Logs) are saved automatically to your browser's local storage.
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleExportDataJSON}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Kitchen Operations Backup (JSON)</span>
                </button>

                <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Import Data from Backup JSON</span>
                  <input type="file" accept=".json" onChange={handleImportDataJSON} className="hidden" />
                </label>

                <button
                  onClick={handleResetToDefaults}
                  className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Data to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
