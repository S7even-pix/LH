import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Zap, MapPin, FileText, LayoutDashboard, ShieldAlert, 
  BarChart3, Settings, Bell, Clock, RefreshCw, UserCheck, 
  AlertTriangle, Check, CheckCircle2, ChevronDown
} from 'lucide-react';
import { incidentStore } from '../data/incidentStore';

export default function Navbar({ currentRole, setCurrentRole, storeData }) {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const escalations = storeData?.escalations || [];
  const pendingEscalations = escalations.filter(e => e.status === 'Pending');
  const clockOffset = storeData?.simulatedClockOffsetMinutes || 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdvanceClock = (minutes) => {
    const res = incidentStore.advanceSimulatedClock(minutes);
    if (res.newEscalations && res.newEscalations.length > 0) {
      showToast(`Advanced simulated time by +${minutes}m. SLA breach triggered ${res.newEscalations.length} new escalation(s)!`);
    } else {
      showToast(`Advanced simulated time by +${minutes}m. SLA checked.`);
    }
  };

  const handleCheckSLA = () => {
    const res = incidentStore.triggerSLACheckNow();
    if (res.newEscalations && res.newEscalations.length > 0) {
      showToast(`SLA Check Complete: ${res.newEscalations.length} new overdue incident(s) escalated.`);
    } else {
      showToast('SLA Check Complete: All active incidents within compliance.');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to initial Kerala demonstration state?')) {
      incidentStore.resetDemoSeed();
      showToast('Demo data successfully restored to pristine Kerala benchmark state!');
      setShowDemoModal(false);
    }
  };

  const roles = [
    { id: 'consumer', label: 'Consumer', icon: UserCheck, desc: 'Public reporting & tracking' },
    { id: 'operator', label: 'Utility Operator', icon: LayoutDashboard, desc: 'Control room & dispatch' },
    { id: 'supervisor', label: 'Supervisor / Official', icon: ShieldAlert, desc: 'Escalations & oversight' }
  ];

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-[9999] bg-white border-2 border-orange-400 text-slate-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-[2000] bg-white/95 backdrop-blur-md border-b border-orange-200/80 shadow-sm">
        {/* Top Demo Context Banner */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-200/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-700">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-700 border border-orange-300">
              <Zap className="w-3 h-3 text-orange-600" />
              Demo Mode &bull; Kerala, India
            </span>
            <span className="hidden md:inline text-slate-500">
              Simulated demonstration data (Kochi & Ernakulam District). No real-world utility tie.
            </span>
            {clockOffset > 0 && (
              <span className="inline-flex items-center gap-1 text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded font-mono font-semibold">
                <Clock className="w-3 h-3 text-orange-600" />
                Simulated Clock: +{clockOffset}m offset
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdvanceClock(15)}
              className="text-slate-700 hover:text-orange-700 hover:bg-orange-100/70 px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] font-semibold border border-transparent hover:border-orange-200"
              title="Advance simulated time by 15 mins to demonstrate SLA breaches"
            >
              <Clock className="w-3 h-3 text-orange-500" />
              <span>+15m Sim</span>
            </button>
            <button
              onClick={handleCheckSLA}
              className="text-slate-700 hover:text-orange-700 hover:bg-orange-100/70 px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] font-semibold border border-transparent hover:border-orange-200"
              title="Trigger SLA Sentinel check now"
            >
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Check SLA</span>
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="text-slate-700 hover:text-orange-700 hover:bg-orange-100/70 px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] font-semibold border border-transparent hover:border-orange-200"
              title="Open Demo Controls and Reset"
            >
              <Settings className="w-3 h-3 text-slate-500" />
              <span>Demo Controls</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  Grid<span className="text-orange-600">Guard</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-1 font-medium">
                Location-Based Outage Monitoring & Escalation
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold shadow-sm' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold shadow-sm' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                }`
              }
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Outage Map</span>
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                }`
              }
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Report Outage</span>
            </NavLink>

            {(currentRole === 'operator' || currentRole === 'supervisor') && (
              <NavLink
                to="/incidents"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold shadow-sm' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                  }`
                }
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Incident Management</span>
              </NavLink>
            )}

            {(currentRole === 'supervisor' || currentRole === 'operator') && (
              <NavLink
                to="/escalations"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive ? 'bg-rose-50 text-rose-700 border border-rose-300 font-bold shadow-sm' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                  }`
                }
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Escalation Centre</span>
                {pendingEscalations.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {pendingEscalations.length}
                  </span>
                )}
              </NavLink>
            )}

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold shadow-sm' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                }`
              }
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </NavLink>
          </nav>

          {/* Right Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-orange-50/80 border border-orange-200 rounded-xl p-1 shadow-sm">
              {roles.map(r => {
                const isCurrent = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentRole(r.id);
                      showToast(`Role switched to: ${r.label}`);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/50'
                    }`}
                    title={r.desc}
                  >
                    <r.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl border border-orange-200 transition shadow-sm bg-white"
              title="View live simulated alerts"
            >
              <Bell className="w-4 h-4" />
              {pendingEscalations.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-orange-200 py-2 px-2 text-[11px] font-semibold bg-orange-50/60">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-orange-600 font-bold' : 'text-slate-600'}>
            Overview
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => isActive ? 'text-orange-600 font-bold' : 'text-slate-600'}>
            Map
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => isActive ? 'text-orange-600 font-bold' : 'text-slate-600'}>
            Report
          </NavLink>
          <NavLink to="/incidents" className={({ isActive }) => isActive ? 'text-orange-600 font-bold' : 'text-slate-600'}>
            Incidents
          </NavLink>
          <NavLink to="/escalations" className={({ isActive }) => isActive ? 'text-rose-600 font-bold' : 'text-slate-600'}>
            Escalations ({pendingEscalations.length})
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'text-orange-600 font-bold' : 'text-slate-600'}>
            Analytics
          </NavLink>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifDrawer && (
        <div className="fixed top-20 right-4 z-[3000] w-80 md:w-96 bg-white border border-orange-300 rounded-2xl shadow-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-orange-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Bell className="w-4 h-4 text-orange-500" />
              <span>Simulated In-App Alerts</span>
            </div>
            <button 
              onClick={() => setShowNotifDrawer(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {pendingEscalations.map(esc => (
              <div 
                key={esc.id}
                onClick={() => {
                  navigate('/escalations');
                  setShowNotifDrawer(false);
                }}
                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-400 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-rose-700 font-bold mb-1">
                  <span>🚨 SLA Breach Alert</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">{esc.priority}</span>
                </div>
                <p className="text-slate-700 line-clamp-2 text-xs">{esc.triggerReason}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Incident #{esc.incidentId}</span>
                  <span className="text-orange-600 font-bold hover:underline">Review in Escalation Centre &rarr;</span>
                </div>
              </div>
            ))}

            {pendingEscalations.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">No active unhandled SLA breaches.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Use "+15m Sim" above to trigger a demo escalation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Controls Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200 max-w-md w-full rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900">Hackathon Demo Controls</h3>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                These controls allow judges and evaluators to test time-dependent behaviors (SLA breaches, overdue escalations) deterministically without waiting minutes or hours.
              </p>

              <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200 space-y-2">
                <span className="font-bold text-slate-800 block">Simulate Time Elapsed:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAdvanceClock(15)}
                    className="py-2 px-2 bg-white hover:bg-orange-500 hover:text-white border border-orange-300 rounded-lg text-center font-bold text-orange-700 shadow-sm transition"
                  >
                    +15 Minutes
                  </button>
                  <button
                    onClick={() => handleAdvanceClock(30)}
                    className="py-2 px-2 bg-white hover:bg-orange-500 hover:text-white border border-orange-300 rounded-lg text-center font-bold text-orange-700 shadow-sm transition"
                  >
                    +30 Minutes
                  </button>
                  <button
                    onClick={() => handleAdvanceClock(60)}
                    className="py-2 px-2 bg-white hover:bg-orange-500 hover:text-white border border-orange-300 rounded-lg text-center font-bold text-orange-700 shadow-sm transition"
                  >
                    +60 Minutes
                  </button>
                </div>
              </div>

              <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200 space-y-2">
                <span className="font-bold text-slate-800 block">Manual SLA Sentinel Run:</span>
                <button
                  onClick={handleCheckSLA}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-center font-bold shadow-sm transition"
                >
                  Evaluate All Active Incidents Against SLA Thresholds
                </button>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 space-y-2">
                <span className="font-bold text-rose-800 block">Reset Benchmark Dataset:</span>
                <p className="text-slate-600 text-[11px]">
                  Restores 8 incidents, 18 consumer reports, and 4 field squads around Kochi & Ernakulam, Kerala.
                </p>
                <button
                  onClick={handleResetDemo}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-center font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data to Initial State</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-orange-100 flex justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
