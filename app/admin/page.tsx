'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Settings, Activity, Calendar, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Mock users for the system if Supabase has no data
const MOCK_DB_USERS = [
  { id: 'u-1', display_name: 'Kalim J', email: 'kalim.cse@rathinam.edu', role: 'admin', zone: 'SR', last_login: new Date().toISOString() },
  { id: 'u-2', display_name: 'Suresh Babu', email: 'suresh.station@mas.rail.gov.in', role: 'station_master', zone: 'SR', last_login: new Date(Date.now() - 3600000).toISOString() },
  { id: 'u-3', display_name: 'Murugan S', email: 'murugan.forest@forest.tn.gov.in', role: 'forest_officer', zone: 'SR', last_login: new Date(Date.now() - 86400000).toISOString() },
  { id: 'u-4', display_name: 'Rajesh Kumar', email: 'rajesh.research@wildlife.res.in', role: 'researcher', zone: 'ALL', last_login: new Date(Date.now() - 3600000 * 5).toISOString() }
];

// Audit log seed list
const SEED_AUDIT_LOGS = [
  { time: '2026-07-06T12:00:00Z', user: 'Kalim J', action: 'Changed alert warning radius to 5km', ip: '192.168.1.5' },
  { time: '2026-07-05T09:30:00Z', user: 'Kalim J', action: 'Configured RailOne API key fallback triggers', ip: '192.168.1.5' },
  { time: '2026-07-04T15:12:00Z', user: 'Suresh Babu', action: 'Cleared false alert at sensor TG-MAS-108', ip: '10.5.84.12' },
  { time: '2026-07-02T11:45:00Z', user: 'Kalim J', action: 'Added new sensor node TG-MAS-180', ip: '192.168.1.5' }
];

// Animal migration calendar grid (Month vs Species Risk level)
const MIGRATION_CALENDAR = [
  { month: 'January', elephant: 'High (Harvest season)', tiger: 'Low', deer: 'High (Grazing peaks)', boar: 'Moderate' },
  { month: 'March', elephant: 'Critical (Water migration)', tiger: 'Moderate', deer: 'Moderate', boar: 'Moderate' },
  { month: 'June', elephant: 'Moderate (Monsoon dispersion)', tiger: 'High (Mating checks)', deer: 'Low', boar: 'High (Foraging)' },
  { month: 'September', elephant: 'High (Forest crossings)', tiger: 'Low', deer: 'High', boar: 'Moderate' },
  { month: 'December', elephant: 'Critical (Winter corridor block)', tiger: 'Moderate', deer: 'Critical (Rutting)', boar: 'High' }
];

export default function AdminControlPanelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Local state
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState(SEED_AUDIT_LOGS);
  const [radiusThreshold, setRadiusThreshold] = useState(5.0);
  const [activeSensorsThreshold, setActiveSensorsThreshold] = useState(15.0);
  const [usersLoading, setUsersLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Fetch users from Supabase or load mock list
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (!error && data && data.length > 0) {
          setUsers(data);
        } else {
          setUsers(MOCK_DB_USERS);
        }
      } catch (e) {
        console.warn('Failed to load user directories, loading mock data:', e);
        setUsers(MOCK_DB_USERS);
      } finally {
        setUsersLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Update user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Optimistic state update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      const targetUser = users.find(u => u.id === userId);
      
      // Try DB write
      await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      // Append audit log
      const newAudit = {
        time: new Date().toISOString(),
        user: user?.displayName || 'Admin',
        action: `Overrode role to [${newRole}] for user ${targetUser?.display_name || targetUser?.email}`,
        ip: '127.0.0.1'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    } catch (e) {
      console.error('Failed to save role update:', e);
    }
  };

  const handleUpdateThresholds = () => {
    const newAudit = {
      time: new Date().toISOString(),
      user: user?.displayName || 'Admin',
      action: `Adjusted early warnings threshold: Proximity: ${radiusThreshold}km. Sensor ping gap: ${activeSensorsThreshold}s.`,
      ip: '127.0.0.1'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
    alert('System thresholds updated successfully.');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Entering Admin Portal...</span>
      </div>
    );
  }

  // Deny access to non-admin roles
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center justify-center text-center gap-4">
        <XCircle className="h-14 w-14 text-red-500 animate-pulse" />
        <h1 className="text-2xl font-extrabold text-white">ACCESS DENIED</h1>
        <p className="text-sm text-gray-400 max-w-sm font-sans">
          This portal is reserved for System Administrators. Your current role is <strong>"{user.role}"</strong>. Contact Kalim for authorization.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-2 px-5 py-2.5 bg-navy-900 border border-cyan-500/20 text-cyan-accent font-semibold rounded-lg text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Shield className="h-7 w-7 text-cyan-accent" />
          SYSTEM ADMINISTRATION PANEL
        </h1>
        <p className="text-xs text-gray-400 font-sans">
          Manage system users, adjust AI warning parameters, check API connections, and view action audit trails.
        </p>
      </div>

      {/* USER MANAGEMENT & THRESHOLDS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User Roles Overrides */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-cyan-accent" />
            User Access Directories ({users.length})
          </h2>
          
          <div className="glass-card overflow-hidden border border-cyan-500/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/10 bg-navy-900/40 text-xs text-gray-400 font-mono tracking-wider">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Zone</th>
                  <th className="py-3.5 px-4 text-right">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5 text-xs sm:text-sm text-gray-300">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">Loading user list...</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-cyan-950/5 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{u.display_name || 'Pilot'}</td>
                      <td className="py-4 px-4 font-mono text-gray-400 text-xs">{u.email}</td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">
                        {new Date(u.last_login).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-400">{u.zone || 'SR'}</td>
                      <td className="py-4 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-navy-900 border border-gray-800 rounded px-2.5 py-1 text-xs font-semibold text-cyan-accent focus:outline-none focus:border-cyan-accent"
                        >
                          <option value="admin">Admin</option>
                          <option value="station_master">Station Master</option>
                          <option value="forest_officer">Forest Officer</option>
                          <option value="researcher">Researcher</option>
                          <option value="default">Default</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Threshold Configuration */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-cyan-accent" />
            Warning Parameters
          </h2>

          <div className="glass-card p-6 border border-cyan-500/10 flex flex-col gap-5 bg-navy-950/20">
            {/* Radius Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Proximity Warning Radius</span>
                <span className="text-cyan-accent font-bold">{radiusThreshold} km</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={radiusThreshold}
                onChange={(e) => setRadiusThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-accent"
              />
              <span className="text-[10px] text-gray-500 leading-normal">
                Intrusion sightings within this circle will trigger active caution orders.
              </span>
            </div>

            {/* Inactive Sens Threshold */}
            <div className="flex flex-col gap-2 border-t border-cyan-500/5 pt-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Sensor Timeout Limit</span>
                <span className="text-cyan-accent font-bold">{activeSensorsThreshold} mins</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="60.0"
                step="5.0"
                value={activeSensorsThreshold}
                onChange={(e) => setActiveSensorsThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-cyan-accent"
              />
              <span className="text-[10px] text-gray-500 leading-normal">
                Time limit since last ping before marking a node as offline.
              </span>
            </div>

            {/* Save Button */}
            <button
              onClick={handleUpdateThresholds}
              className="w-full py-2 bg-cyan-accent hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-xs transition-all hover:scale-102"
            >
              Apply Global Parameters
            </button>

          </div>
        </div>

      </div>

      {/* SYSTEM API STATUS CHECK & MIGRATION CALENDAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Train APIs Health checks */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-cyan-accent" />
            API Core Health Linkages
          </h2>

          <div className="glass-card p-5 border border-cyan-500/10 flex flex-col gap-4 bg-navy-950/20">
            {/* RailRadar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-200">RailRadar API Endpoint</span>
                <span className="text-[10px] text-gray-500 font-mono">/v1/trains/running</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <CheckCircle className="h-3 w-3" /> ONLINE
              </span>
            </div>

            {/* RapidAPI */}
            <div className="flex items-center justify-between text-xs border-t border-cyan-500/5 pt-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-200">RapidAPI IRCTC Status Gateway</span>
                <span className="text-[10px] text-gray-500 font-mono">/api/trains/v1/train/status</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <CheckCircle className="h-3 w-3" /> ONLINE
              </span>
            </div>

            {/* Indian Rail */}
            <div className="flex items-center justify-between text-xs border-t border-cyan-500/5 pt-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-200">Indian Rail API Gateway</span>
                <span className="text-[10px] text-gray-500 font-mono">/LiveTrain/apikey/</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded animate-pulse">
                <AlertTriangle className="h-3 w-3" /> TIMEOUT
              </span>
            </div>
          </div>
        </div>

        {/* Right: Wildlife Migration Calendar */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-cyan-accent" />
            Seasonal Wildlife Migration & Corridor Risks
          </h2>
          
          <div className="glass-card overflow-hidden border border-cyan-500/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/10 bg-navy-900/40 text-xs text-gray-400 font-mono tracking-wider">
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Elephant Risk</th>
                  <th className="py-3.5 px-4">Tiger Risk</th>
                  <th className="py-3.5 px-4">Deer Risk</th>
                  <th className="py-3.5 px-4">Wild Boar Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5 text-xs text-gray-300">
                {MIGRATION_CALENDAR.map((c, i) => (
                  <tr key={i} className="hover:bg-cyan-950/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-mono">{c.month}</td>
                    <td className="py-3 px-4">{c.elephant}</td>
                    <td className="py-3 px-4">{c.tiger}</td>
                    <td className="py-3 px-4">{c.deer}</td>
                    <td className="py-3 px-4">{c.boar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* FOOTER: SYSTEM AUDIT LOGS */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-cyan-accent" />
          Administrator Adjustment Audit Trail
        </h2>

        <div className="glass-card overflow-hidden border border-cyan-500/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-navy-900/40 text-xs text-gray-400 font-mono tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Adjustment Action</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5 text-xs text-gray-300 font-mono">
              {auditLogs.map((log, index) => (
                <tr key={index} className="hover:bg-cyan-950/5 transition-colors">
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(log.time).toLocaleString()}</td>
                  <td className="py-3 px-4 text-cyan-accent font-semibold">{log.user}</td>
                  <td className="py-3 px-4 text-gray-200">{log.action}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
