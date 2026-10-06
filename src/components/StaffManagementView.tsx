import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ChefHat,
  Search,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  X,
  Phone,
  Mail,
  CheckCircle2,
  Briefcase,
  UserCheck,
  UserX
} from 'lucide-react';

interface StaffManagementViewProps {
  users: User[];
  currentUser: User;
  onAddStaff: (staffData: Omit<User, 'id' | 'avatarInitials'>) => void;
  onUpdateStaff: (userId: string, updatedData: Partial<User>) => void;
  onDeleteStaff: (userId: string) => void;
  onSwitchUser: (user: User) => void;
  onNavigateTab: (tab: string) => void;
}

type StaffSortField = 'name' | 'role' | 'station' | 'status';
type SortOrder = 'asc' | 'desc';

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  users,
  currentUser,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onSwitchUser,
  onNavigateTab
}) => {
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<StaffSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal State
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cook');
  const [station, setStation] = useState('Veg Prep & Chiller');
  const [status, setStatus] = useState<'active' | 'on_shift' | 'off_duty'>('on_shift');

  const stations = [
    'Hot Line & Biryani',
    'Tandoor & Starters',
    'Veg Prep & Chiller',
    'Procurement & Mandi',
    'Billing & Orders',
    'All Stations'
  ];

  const handleSort = (field: StaffSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedUsers = useMemo(() => {
    return users
      .filter(u => {
        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || (u.status || 'active') === selectedStatus;
        const matchesSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.station && u.station.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRole && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField] || '';
        let bVal: any = b[sortField] || '';

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
  }, [users, selectedRole, selectedStatus, searchQuery, sortField, sortOrder]);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddStaff({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 43210',
      role,
      station,
      status,
      kitchenName: currentUser.kitchenName,
      location: currentUser.location,
      isSetupCompleted: true
    });

    setIsAddingStaff(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    onUpdateStaff(editingStaff.id, {
      name: editingStaff.name,
      email: editingStaff.email,
      phone: editingStaff.phone,
      role: editingStaff.role,
      station: editingStaff.station,
      status: editingStaff.status
    });

    setEditingStaff(null);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Admin / Owner</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">Kitchen Manager</span>;
      case 'chef':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Head Chef</span>;
      case 'cook':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">Line Cook</span>;
      case 'inventory_staff':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">Inventory Specialist</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-mono mb-1">
              CLOUD KITCHEN STAFF &amp; ROLE-BASED ACCESS CONTROL (RBAC)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Assign Staff Members &amp; Co-Admins
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Assign kitchen managers, head chefs, line cooks, and co-admins to your {currentUser.kitchenName} hub in {currentUser.location}.
            </p>
          </div>

          <button
            onClick={() => setIsAddingStaff(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign New Staff Member</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Total Kitchen Team</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">{users.length} members</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Owners &amp; Admins</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {users.filter(u => u.role === 'admin').length} admins
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Chefs &amp; Managers</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {users.filter(u => u.role === 'chef' || u.role === 'manager').length} staff
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">On-Shift Active Team</div>
            <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
              {users.filter(u => (u.status || 'active') === 'on_shift' || (u.status || 'active') === 'active').length} on duty
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff name, email, or station..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin / Owner</option>
            <option value="manager">Kitchen Manager</option>
            <option value="chef">Head Chef</option>
            <option value="cook">Line Cook</option>
            <option value="inventory_staff">Inventory Specialist</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Duty Statuses</option>
            <option value="on_shift">On Shift</option>
            <option value="active">Active</option>
            <option value="off_duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Staff Member
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-1">
                    Assigned Role
                    {sortField === 'role' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('station')}>
                  <div className="flex items-center gap-1">
                    Assigned Kitchen Station
                    {sortField === 'station' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">
                    Shift Duty Status
                    {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedUsers.map(user => {
                const isCurrent = user.id === currentUser.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-800/40 transition-colors ${isCurrent ? 'bg-amber-500/5' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                          {user.avatarInitials || user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                Active Logged In
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-slate-300">
                        {user.station || 'All Kitchen Stations'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <Phone className="w-3 h-3 text-slate-600 shrink-0" />
                        <span>{user.phone || '+91 98765 43210'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-mono ${
                        (user.status || 'on_shift') === 'on_shift'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : (user.status || 'active') === 'active'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {(user.status || 'on_shift').replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isCurrent && (
                          <button
                            onClick={() => onSwitchUser(user)}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Switch Logged-in Session to this user"
                          >
                            Switch Session
                          </button>
                        )}

                        <button
                          onClick={() => setEditingStaff(user)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isCurrent && users.length > 1 && (
                          <button
                            onClick={() => onDeleteStaff(user.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Remove Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Assign New Staff / Admin</h3>
              </div>
              <button onClick={() => setIsAddingStaff(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Staff Member Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address <span className="text-rose-400">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@rasoikitchens.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="admin">Admin / Co-Owner</option>
                    <option value="manager">Kitchen Manager</option>
                    <option value="chef">Head Chef</option>
                    <option value="cook">Line Cook / Prep</option>
                    <option value="inventory_staff">Inventory Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kitchen Station / Shift</label>
                  <select
                    value={station}
                    onChange={e => setStation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {stations.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duty Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="on_shift">On Shift (Active Duty)</option>
                  <option value="active">Active Staff</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingStaff(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Assign Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff Member */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Staff Details: {editingStaff.name}</h3>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email}
                    onChange={e => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={e => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={e => setEditingStaff({ ...editingStaff, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="admin">Admin / Co-Owner</option>
                    <option value="manager">Kitchen Manager</option>
                    <option value="chef">Head Chef</option>
                    <option value="cook">Line Cook / Prep</option>
                    <option value="inventory_staff">Inventory Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Station</label>
                  <select
                    value={editingStaff.station || 'All Stations'}
                    onChange={e => setEditingStaff({ ...editingStaff, station: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {stations.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duty Status</label>
                <select
                  value={editingStaff.status || 'on_shift'}
                  onChange={e => setEditingStaff({ ...editingStaff, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="on_shift">On Shift</option>
                  <option value="active">Active</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
