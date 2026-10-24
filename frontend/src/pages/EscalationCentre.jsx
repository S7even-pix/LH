import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Copy, 
  Check, MessageSquare, Send, UserCheck, Settings, Eye, ExternalLink, X
} from 'lucide-react';
import { incidentStore } from '../data/incidentStore';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function EscalationCentre({ storeData }) {
  const escalations = storeData?.escalations || [];
  const incidents = storeData?.incidents || [];
  const slaConfigs = storeData?.slaConfigs || [];

  // Active tab: 'pending', 'acknowledged', 'resolved'
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Supervisor Form states
  const [supervisorName, setSupervisorName] = useState('Dr. K. G. Radhakrishnan (Deputy Chief Engineer)');
  const [directivesInput, setDirectivesInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');
  const [showSlaSettings, setShowSlaSettings] = useState(false);

  // Filtered escalations by status tab
  const filtered = useMemo(() => {
    return escalations.filter(e => {
      if (activeTab === 'pending') return e.status === 'Pending';
      if (activeTab === 'acknowledged') return e.status === 'Acknowledged';
      if (activeTab === 'resolved') return e.status === 'Resolved';
      return true;
    });
  }, [escalations, activeTab]);

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleAcknowledge = (e) => {
    e.preventDefault();
    if (!selectedEscalation || !directivesInput.trim()) return;
    incidentStore.acknowledgeEscalation(selectedEscalation.id, supervisorName, directivesInput);
    setSelectedEscalation(null);
    setDirectivesInput('');
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!selectedEscalation || !resolutionInput.trim()) return;
    incidentStore.resolveEscalation(selectedEscalation.id, supervisorName, resolutionInput);
    setSelectedEscalation(null);
    setResolutionInput('');
  };

  const handleUpdateThreshold = (priority, newMinutes) => {
    incidentStore.updateSLAThreshold(priority, newMinutes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Executive Escalation Centre & Disaster Response Oversight
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Automated SLA breach surveillance, formal supervisory intervention directives, and official audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSlaSettings(!showSlaSettings)}
            className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-slate-800 rounded-xl border border-orange-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-orange-600" />
            <span>SLA Threshold Settings</span>
          </button>
        </div>
      </div>

      {/* SLA Threshold Config Drawer */}
      {showSlaSettings && (
        <div className="bg-orange-50/80 border border-orange-300 p-5 rounded-2xl shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-orange-200 pb-2">
            <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Configurable Service Level Agreement (SLA) Thresholds</span>
            </h4>
            <button onClick={() => setShowSlaSettings(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Adjusting these demonstration thresholds triggers automated SLA checks. Lowering a threshold allows instant demonstration of overdue escalations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {slaConfigs.map(cfg => (
              <div key={cfg.priority} className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={cfg.priority} />
                  <span className="font-mono text-orange-600 font-bold">{cfg.thresholdMinutes}m</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={cfg.thresholdMinutes}
                    onChange={(e) => handleUpdateThreshold(cfg.priority, parseInt(e.target.value) || 15)}
                    className="w-full bg-orange-50/50 border border-orange-200 rounded px-2 py-1 text-slate-800 font-mono text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold">mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-orange-200 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
          <span>Pending Escalations ({escalations.filter(e => e.status === 'Pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('acknowledged')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'acknowledged'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-white" />
          <span>Acknowledged ({escalations.filter(e => e.status === 'Acknowledged').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'resolved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span>Resolved / Closed ({escalations.filter(e => e.status === 'Resolved').length})</span>
        </button>
      </div>

      {/* Escalations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(esc => {
          const inc = incidents.find(i => i.id === esc.incidentId);
          return (
            <div
              key={esc.id}
              className="bg-white border border-orange-200/90 hover:border-orange-400 p-5 rounded-2xl shadow-sm space-y-4 transition"
            >
              <div className="flex items-start justify-between gap-2 border-b border-orange-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-600">{esc.id}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                      Level {esc.escalationLevel} Escalation
                    </span>
                    <PriorityBadge priority={esc.priority} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{esc.incidentTitle}</h4>
                </div>

                <StatusBadge status={esc.status} />
              </div>

              {/* Breach Telemetry */}
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-rose-800 font-bold">
                  <span>SLA Threshold Exceeded:</span>
                  <span>+{esc.overdueByMinutes} minutes overdue</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                  {esc.triggerReason}
                </p>
              </div>

              {/* Impact Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px] font-semibold">Elapsed Duration:</span>
                  <span className="font-bold text-slate-900 font-mono">{esc.elapsedMinutes} mins</span>
                </div>

                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px] font-semibold">Assigned Team:</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {inc?.assignedTeamName || 'Unassigned'}
                  </span>
                </div>

                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px] font-semibold">Recipient Role:</span>
                  <span className="font-bold text-purple-700 truncate block">{esc.recipientRole}</span>
                </div>

                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px] font-semibold">Message Status:</span>
                  <span className="font-bold text-orange-700 truncate block">{esc.messageStatus}</span>
                </div>
              </div>

              {/* Acknowledged / Resolved Notes */}
              {esc.acknowledgedBy && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-800 text-[11px]">
                    <span>Acknowledged by {esc.acknowledgedBy}</span>
                    <span className="text-slate-500 font-normal">
                      {new Date(esc.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{esc.followUpAction}</p>
                </div>
              )}

              {esc.resolutionNotes && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-800 text-[11px] block">Official Resolution Notes:</span>
                  <p className="text-slate-700 font-medium">{esc.resolutionNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-orange-100">
                <button
                  onClick={() => setShowMessageModal(esc)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-600" />
                  <span>View Message</span>
                </button>

                <button
                  onClick={() => handleCopyMessage(esc.generatedMessage)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  title="Copy formatted message to clipboard"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copySuccess ? 'Copied!' : 'Copy Notice'}</span>
                </button>

                {esc.status === 'Pending' && (
                  <button
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setDirectivesInput('Acknowledged. Directing Kalamassery Section to deploy emergency crew immediately.');
                    }}
                    className="ml-auto px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Acknowledge & Direct</span>
                  </button>
                )}

                {esc.status === 'Acknowledged' && (
                  <button
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setResolutionInput('Underlying fault cleared and line tested. Escalation closed.');
                    }}
                    className="ml-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Escalation Resolved</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white border border-orange-200 p-12 text-center rounded-2xl text-slate-500 space-y-2 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">No Escalations in "{activeTab}" Category</h4>
            <p className="text-xs">
              All active incidents in Kochi & Ernakulam district are currently adhering to service-level commitments.
            </p>
          </div>
        )}
      </div>

      {/* SUPERVISOR ACTION MODAL (Acknowledge / Resolve) */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200 max-w-lg w-full rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedEscalation.status === 'Pending' ? 'Supervisor Official Acknowledgement' : 'Close Escalation Record'}
              </h3>
              <button onClick={() => setSelectedEscalation(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-mono text-orange-600 font-bold">{selectedEscalation.id} &bull; {selectedEscalation.incidentTitle}</p>
              <p className="text-slate-500">{selectedEscalation.triggerReason}</p>
            </div>

            {selectedEscalation.status === 'Pending' ? (
              <form onSubmit={handleAcknowledge} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Official Name & Designation:</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full bg-orange-50/40 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Directives & Follow-up Action Required:</label>
                  <textarea
                    rows={4}
                    value={directivesInput}
                    onChange={(e) => setDirectivesInput(e.target.value)}
                    placeholder="Enter explicit directives issued to the control room or emergency squads..."
                    className="w-full bg-orange-50/40 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEscalation(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Record Acknowledgement
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResolve} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Official Name:</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full bg-orange-50/40 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Resolution Summary & Audit Notes:</label>
                  <textarea
                    rows={4}
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    placeholder="Document root cause mitigation and confirmation that power was restored..."
                    className="w-full bg-orange-50/40 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEscalation(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Close Escalation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL ESCALATION MESSAGE MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200 max-w-2xl w-full rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Automatically Generated Escalation Message</h3>
              <button onClick={() => setShowMessageModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 select-all max-h-[360px] overflow-y-auto">
                {showMessageModal.generatedMessage}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-orange-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Message Status: <strong className="text-orange-700">{showMessageModal.messageStatus}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyMessage(showMessageModal.generatedMessage)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>

                <button
                  onClick={() => setShowMessageModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
