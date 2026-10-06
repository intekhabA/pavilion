"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Search, RefreshCw, UserCheck } from "lucide-react";
import { apiService } from "@/services/api";
import { AuditLog } from "@/types";
import { formatDate } from "@/utils/format";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.adminAudit.list({ q: search || undefined });
      if (res.success) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Security & Activity Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident record of administrative operations, logins, project publishes, and access events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {log.user_name || "System"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-amber-500/15 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-200">{log.entity}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{log.ip_address || "127.0.0.1"}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate font-mono text-[10px]">
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
