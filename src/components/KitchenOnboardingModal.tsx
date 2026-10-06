import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ChefHat, MapPin, Store, UserCheck, Sparkles, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

interface KitchenOnboardingModalProps {
  isOpen: boolean;
  onCompleteSetup: (setupData: {
    name: string;
    email: string;
    role: UserRole;
    kitchenName: string;
    location: string;
    templateType: 'starter' | 'blank';
  }) => void;
  onCancel?: () => void;
  isInitialSetup?: boolean;
}

export const KitchenOnboardingModal: React.FC<KitchenOnboardingModalProps> = ({
  isOpen,
  onCompleteSetup,
  onCancel,
  isInitialSetup = false
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');

  const [kitchenName, setKitchenName] = useState('');
  const [location, setLocation] = useState('');
  const [templateType, setTemplateType] = useState<'starter' | 'blank'>('starter');

  if (!isOpen) return null;

  const popularLocations = [
    'Koramangala, Bengaluru',
    'Indiranagar, Bengaluru',
    'HSR Layout, Bengaluru',
    'Bandra West, Mumbai',
    'Andheri East, Mumbai',
    'Connaught Place, New Delhi',
    'Cyber City, Gurugram',
    'Gachibowli, Hyderabad',
    'T. Nagar, Chennai'
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !email.trim()) return;
      setStep(2);
    } else if (step === 2) {
      if (!kitchenName.trim() || !location.trim()) return;
      setStep(3);
    } else if (step === 3) {
      onCompleteSetup({
        name: name.trim(),
        email: email.trim(),
        role,
        kitchenName: kitchenName.trim(),
        location: location.trim(),
        templateType
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs text-amber-400 font-mono font-bold tracking-wider uppercase mb-1">
              Cloud Kitchen Onboarding · Step {step} of 3
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {step === 1 && 'Create Your Owner Account'}
              {step === 2 && 'Set Up Your Cloud Kitchen & Location'}
              {step === 3 && 'Choose Your Inventory Starter Template'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-amber-400' : 'bg-slate-700'}`} />
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-amber-400' : 'bg-slate-700'}`} />
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-amber-400' : 'bg-slate-700'}`} />
          </div>
        </div>

        <form onSubmit={handleNextStep} className="space-y-5 text-xs">
          {/* STEP 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Welcome! Enter your details to create your Cloud Kitchen Management account and begin configuring your operation.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Full Name / Entrepreneur Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand@rasoikitchens.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Operating Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'admin', label: 'Owner / Admin' },
                    { id: 'manager', label: 'Kitchen Manager' },
                    { id: 'chef', label: 'Head Chef' }
                  ].map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id as UserRole)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                        role === r.id
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Kitchen & Location Details */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Provide your Cloud Kitchen hub name and location so supplier orders, delivery channels, and inventory can be mapped accurately.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Cloud Kitchen Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spice Route Cloud Kitchen"
                    value={kitchenName}
                    onChange={e => setKitchenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Kitchen Location / Address &amp; City <span className="text-rose-400">*</span>
                </label>
                <div className="relative mb-2">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala 5th Block, Bengaluru"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="text-[11px] text-slate-500 mb-1">Quick Select Popular Metro Hubs:</div>
                <div className="flex flex-wrap gap-1.5">
                  {popularLocations.map(loc => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                        location === loc
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Starter Template Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Choose how you'd like to start managing your raw commodities, menu formulas, and purchase orders:
              </p>

              <div className="space-y-3">
                <div
                  onClick={() => setTemplateType('starter')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    templateType === 'starter'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Starter Indian Cloud Kitchen Pack (Recommended)
                    </span>
                    {templateType === 'starter' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pre-loaded with standard Indian grains (Daawat Basmati), dairy (Amul Paneer, Ghee), spices, and sample Virtual Brand menu recipes.
                  </p>
                </div>

                <div
                  onClick={() => setTemplateType('blank')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    templateType === 'blank'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">
                      Clean Blank Slate
                    </span>
                    {templateType === 'blank' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Start completely fresh with zero pre-existing inventory, recipes, or purchase orders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => (prev - 1) as any)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>{step === 3 ? 'Launch Cloud Kitchen Hub' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
