"use client";

import { useEffect, useState } from "react";
import { Users2, Shield, Plus, Trash2, Key, CheckCircle2 } from "lucide-react";
import { apiService } from "@/services/api";
import { User, Role } from "@/types";
import { formatDate } from "@/utils/format";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // New User Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        apiService.adminUsers.list(),
        apiService.adminUsers.getRoles(),
      ]);
      if (uRes.success) setUsers(uRes.data);
      if (rRes.success) setRoles(rRes.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.adminUsers.create({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role_id: roleId,
      });
      setShowCreateModal(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Users & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authenticated administrative staff and role permissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role Assigned</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                      {u.role?.name || "Staff"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 text-xs font-semibold">Active</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.last_login_at ? formatDate(u.last_login_at) : "Never"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={async () => {
                        if (confirm(`Remove user ${u.email}?`)) {
                          await apiService.adminUsers.delete(u.id);
                          loadData();
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions Breakdown */}
      <div className="pt-6 border-t border-slate-800">
        <h2 className="text-lg font-bold font-serif text-white mb-4">
          Configured Granular Roles & Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">{r.name}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{r.description || "System RBAC Profile"}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions?.slice(0, 4).map((p) => (
                  <span key={p.id} className="text-[9px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    {p.name}
                  </span>
                ))}
                {r.permissions && r.permissions.length > 4 && (
                  <span className="text-[9px] text-amber-400 py-0.5 px-1">
                    +{r.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold font-serif text-white mb-2">New Administrative Staff</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <input
              type="email"
              required
              placeholder="Staff Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <input
              type="password"
              required
              placeholder="Password (Min 8 chars, 1 uppercase, 1 symbol)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Create Staff User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
