import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Check } from 'lucide-react';
import { INITIAL_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterUser: (name: string, email: string, role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onRegisterUser
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('manager');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    onRegisterUser(newName, newEmail, newRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-0.5">ROLE-BASED ACCESS CONTROL (RBAC)</div>
            <h3 className="text-base font-bold text-white">Indian Cloud Kitchen Team Access</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'switch' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Select Staff Profile
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'register' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Add Kitchen Staff
          </button>
        </div>

        {activeTab === 'switch' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Quickly switch between kitchen roles to evaluate permission boundaries:
            </p>

            <div className="space-y-2">
              {INITIAL_USERS.map(u => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 border border-slate-800 text-amber-300">
                        {u.role === 'chef' ? 'Head Ustad' : u.role}
                      </span>
                      {isCurrent && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-1">
                          <Check className="w-3 h-3" /> Active
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div><strong className="text-slate-200">Admin:</strong> Full control over recipes, Mandi suppliers, Swiggy/Zomato margins.</div>
              <div><strong className="text-slate-200">Manager:</strong> Mandi procurement, stock reconciliation, daily shift forecasting.</div>
              <div><strong className="text-slate-200">Head Ustad / Chef:</strong> Bhatti, tandoor &amp; Dum biryani prep, logging perishables.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Kulkarni"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                placeholder="anand.chef@swiggykitchens.in"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Role Assignment</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none"
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="manager">Kitchen Operations Manager</option>
                <option value="chef">Head Ustad / Prep Chef</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Register &amp; Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
