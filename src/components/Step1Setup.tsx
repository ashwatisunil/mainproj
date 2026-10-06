import React, { useState } from 'react';
import { User } from '../types';
import { Building2, MapPin, UserCheck, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface Step1SetupProps {
  currentUser: User;
  onSaveSetup: (setupData: {
    name: string;
    email: string;
    phone: string;
    kitchenName: string;
    location: string;
  }) => void;
  onNextStep: () => void;
}

export const Step1Setup: React.FC<Step1SetupProps> = ({
  currentUser,
  onSaveSetup,
  onNextStep
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [kitchenName, setKitchenName] = useState(currentUser.kitchenName || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [isSaved, setIsSaved] = useState(currentUser.isSetupCompleted || false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!kitchenName.trim() || kitchenName.trim().length < 2) {
      errs.kitchenName = 'Kitchen Name is required (at least 2 characters).';
    }

    if (!location.trim() || location.trim().length < 3) {
      errs.location = 'Location / Address is required (e.g. Koramangala, Bengaluru).';
    }

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Your Full Name is required.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSaveSetup({
      name: name.trim(),
      email: email.trim() || 'owner@cloudkitchen.in',
      phone: phone.trim() || '+91 98765 43210',
      kitchenName: kitchenName.trim(),
      location: location.trim()
    });

    setIsSaved(true);
  };

  const handleProceed = () => {
    if (validate()) {
      onSaveSetup({
        name: name.trim(),
        email: email.trim() || 'owner@cloudkitchen.in',
        phone: phone.trim() || '+91 98765 43210',
        kitchenName: kitchenName.trim(),
        location: location.trim()
      });
      onNextStep();
    }
  };

  const quickLocations = [
    'Koramangala 5th Block, Bengaluru',
    'Indiranagar 100ft Road, Bengaluru',
    'HSR Layout Sector 1, Bengaluru',
    'Bandra West, Mumbai',
    'Andheri West, Mumbai',
    'Connaught Place, New Delhi',
    'Cyber City, Gurugram',
    'Gachibowli, Hyderabad'
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 3 · Kitchen Account &amp; Location Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Set Up Your Cloud Kitchen Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Enter your cloud kitchen name, operating location, and owner details.
        </p>
      </div>

      {/* Main Setup Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              1. Cloud Kitchen Hub &amp; Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Cloud Kitchen Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Spices Kitchen"
                  value={kitchenName}
                  onChange={e => {
                    setKitchenName(e.target.value);
                    setIsSaved(false);
                    if (errors.kitchenName) setErrors(prev => ({ ...prev, kitchenName: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.kitchenName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
                {errors.kitchenName && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.kitchenName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Location / Address &amp; City <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Koramangala, Bengaluru"
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value);
                      setIsSaved(false);
                      if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                    }}
                    className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                      errors.location ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/50'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Location Pickers */}
            <div>
              <div className="text-[11px] text-slate-400 mb-2 font-medium">Popular Metro Hub Locations:</div>
              <div className="flex flex-wrap gap-2">
                {quickLocations.map(loc => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setIsSaved(false);
                      if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all cursor-pointer ${
                      location === loc
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              2. Owner / Account Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anand Kumar"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setIsSaved(false);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="anand@mykitchen.in"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setIsSaved(false);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    setIsSaved(false);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none ${
                    errors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/50'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {isSaved ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Kitchen details saved &amp; verified!
                </span>
              ) : (
                <span>Please confirm your details.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Save Details
              </button>

              <button
                type="button"
                onClick={handleProceed}
                className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Proceed to Record Sales</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
