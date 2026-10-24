import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Wrench, ShieldAlert, AlertTriangle, 
  Clock, CheckCircle2, Users, Edit3, MessageSquare, Plus, X, 
  ExternalLink, ArrowUpDown, ChevronRight, UserCheck
} from 'lucide-react';
import { incidentStore } from '../data/incidentStore';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function IncidentManagement({ storeData }) {
  const incidents = storeData?.incidents || [];
  const teams = storeData?.teams || [];

  // Table filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Active drawer tab: 'workflow', 'teams', 'override', 'notes', 'reports'
  const [activeTab, setActiveTab] = useState('workflow');

  // Form states for modal actions
  const [statusInput, setStatusInput] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [teamInput, setTeamInput] = useState('');
  const [teamNote, setTeamNote] = useState('');
  const [overridePriorityInput, setOverridePriorityInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [etrInput, setEtrInput] = useState('');

  // Filtered incidents
  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      const s = (inc.status || '').toLowerCase();
      const p = (inc.assignedPriority || inc.recommendedPriority || '').toLowerCase();

      if (statusFilter !== 'All' && s !== statusFilter.toLowerCase()) return false;
      if (priorityFilter !== 'All' && p !== priorityFilter.toLowerCase()) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = (inc.id || '').toLowerCase().includes(q);
        const matchesLoc = (inc.locationName || '').toLowerCase().includes(q);
        const matchesTeam = (inc.assignedTeamName || '').toLowerCase().includes(q);
        if (!matchesId && !matchesLoc && !matchesTeam) return false;
      }
      return true;
    });
  }, [incidents, statusFilter, priorityFilter, search]);

  // Open drawer and initialize forms
  const handleOpenDetail = (inc) => {
    setSelectedIncident(inc);
    setStatusInput(inc.status);
    setStatusNote('');
    setTeamInput(inc.assignedTeamId || '');
    setTeamNote('');
    setOverridePriorityInput(inc.assignedPriority);
    setOverrideReasonInput('');
    setNewNoteInput('');
    setEtrInput(inc.estimatedRestorationAt ? inc.estimatedRestorationAt.slice(0, 16) : '');
    setActiveTab('workflow');
  };

  // Actions
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!statusInput || !selectedIncident) return;
    incidentStore.updateIncidentStatus(selectedIncident.id, statusInput, 'Operator Vance', statusNote);
    const updated = incidentStore.getIncidentById(selectedIncident.id);
    setSelectedIncident(updated);
    setStatusNote('');
  };

  const handleAssignTeam = (e) => {
    e.preventDefault();
    if (!teamInput || !selectedIncident) return;
    incidentStore.assignTeam(selectedIncident.id, teamInput, 'Operator Vance', teamNote);
    const updated = incidentStore.getIncidentById(selectedIncident.id);
    setSelectedIncident(updated);
    setTeamNote('');
  };

  const handleOverridePriority = (e) => {
    e.preventDefault();
    if (!overridePriorityInput || !overrideReasonInput.trim() || !selectedIncident) return;
    incidentStore.overridePriority(selectedIncident.id, overridePriorityInput, overrideReasonInput, 'Operator Vance');
    const updated = incidentStore.getIncidentById(selectedIncident.id);
    setSelectedIncident(updated);
    setOverrideReasonInput('');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !selectedIncident) return;
    incidentStore.addNote(selectedIncident.id, 'Operator Vance', newNoteInput);
    const updated = incidentStore.getIncidentById(selectedIncident.id);
    setSelectedIncident(updated);
    setNewNoteInput('');
  };

  const handleUpdateETR = (e) => {
    e.preventDefault();
    if (!etrInput || !selectedIncident) return;
    const iso = new Date(etrInput).toISOString();
    incidentStore.updateETR(selectedIncident.id, iso, 'Operator Vance', 'ETR modified via Control Room console');
    const updated = incidentStore.getIncidentById(selectedIncident.id);
    setSelectedIncident(updated);
  };

  // Grouped reports for selected incident
  const groupedReports = useMemo(() => {
    if (!selectedIncident) return [];
    return incidentStore.getReportsForIncident(selectedIncident.id);
  }, [selectedIncident, storeData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Utility Control Room — Incident Management</h2>
            <p className="text-xs text-slate-500">
              Coordinated telemetry, team dispatch, explainable priority override, and SLA monitoring
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, location, or team..."
              className="w-full bg-orange-50/40 border border-orange-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap text-xs bg-white border border-orange-200/90 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1 text-slate-600 font-bold mr-1">
          <Filter className="w-3.5 h-3.5 text-orange-600" />
          <span>Filter Incidents:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-orange-50/60 border border-orange-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:border-orange-500"
        >
          <option value="All">All Statuses</option>
          <option value="Reported">Reported</option>
          <option value="Verified">Verified</option>
          <option value="Assigned">Assigned</option>
          <option value="Repair in Progress">Repair in Progress</option>
          <option value="Restored">Restored</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-orange-50/60 border border-orange-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:border-orange-500"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical Priority</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <span className="text-slate-500 ml-auto font-semibold text-[11px]">
          Showing {filtered.length} of {incidents.length} incidents
        </span>
      </div>

      {/* Incidents Data Table */}
      <div className="bg-white border border-orange-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-orange-50/70 border-b border-orange-200 text-[11px] uppercase tracking-wider text-slate-700 font-bold">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Location / Area</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Reports</th>
                <th className="py-3 px-4 text-right">Est. Consumers</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {filtered.map(inc => {
                const isResolved = inc.status === 'Restored' || inc.status === 'Closed';
                return (
                  <tr 
                    key={inc.id}
                    className="hover:bg-orange-50/50 transition cursor-pointer"
                    onClick={() => handleOpenDetail(inc)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-orange-600 whitespace-nowrap">
                      {inc.id}
                      {inc.isOverdue && !isResolved && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-[9px] font-sans font-bold animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate font-bold text-slate-900">
                      {inc.locationName}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {inc.category}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-orange-600">
                      {inc.reportCount || 1}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-amber-700 whitespace-nowrap">
                      ~{inc.estimatedAffectedConsumers} <span className="text-[9px] text-slate-400 font-normal">(sim)</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={inc.assignedPriority || inc.recommendedPriority} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-semibold whitespace-nowrap">
                      {inc.assignedTeamName ? (
                        <span>{inc.assignedTeamName}</span>
                      ) : (
                        <span className="text-rose-600 italic font-normal">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-[11px] font-mono">
                      {inc.slaDeadline ? new Date(inc.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(inc);
                        }}
                        className="px-3 py-1 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 rounded-lg border border-orange-300 text-xs font-bold transition shadow-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No matching incidents found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Squads Overview Section */}
      <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">Active KSEB Field Response Units</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {teams.filter(t => t.status === 'Available').length} of {teams.length} squads available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {teams.map(t => (
            <div key={t.id} className="bg-orange-50/40 p-3.5 rounded-xl border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate">{t.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status === 'Available' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-700">Lead: <strong>{t.leader}</strong></p>
              <p className="text-[11px] text-slate-500 font-medium">{t.specialization}</p>
              <div className="text-[10px] text-slate-500 pt-1.5 border-t border-orange-200/60 flex justify-between">
                <span>Vehicle: {t.vehicleNumber}</span>
                <span className="text-orange-700 font-mono font-bold">{t.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INCIDENT DETAIL MANAGEMENT MODAL / DRAWER */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white border border-orange-200 max-w-4xl w-full rounded-2xl shadow-2xl p-6 text-slate-800 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-orange-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-orange-600">{selectedIncident.id}</span>
                  <PriorityBadge priority={selectedIncident.assignedPriority || selectedIncident.recommendedPriority} />
                  <StatusBadge status={selectedIncident.status} />
                  {selectedIncident.isOverdue && selectedIncident.status !== 'Restored' && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-xs font-bold animate-pulse">
                      SLA Overdue
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedIncident.locationName}</h3>
                <p className="text-xs text-slate-500">{selectedIncident.description}</p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xl"
              >
                &times;
              </button>
            </div>

            {/* Navigation Tabs inside Drawer */}
            <div className="flex items-center gap-2 border-b border-orange-100 pb-2 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('workflow')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'workflow' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-orange-50'}`}
              >
                Status & Progress
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'teams' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-orange-50'}`}
              >
                Assign Field Squad
              </button>

              <button
                onClick={() => setActiveTab('override')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'override' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-orange-50'}`}
              >
                Priority Intelligence & Override
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'notes' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-orange-50'}`}
              >
                Notes & Timeline ({selectedIncident.progressNotes?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'reports' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-orange-50'}`}
              >
                Linked Reports ({groupedReports.length})
              </button>
            </div>

            {/* TAB CONTENT: WORKFLOW & STATUS */}
            {activeTab === 'workflow' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleUpdateStatus} className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Advance Incident Workflow Status</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">New Workflow Status:</label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-orange-500"
                      >
                        <option value="Reported">Reported</option>
                        <option value="Verified">Verified</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Repair in Progress">Repair in Progress</option>
                        <option value="Restored">Restored (Powers Nominal)</option>
                        <option value="Closed">Closed (Incident Resolved)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Update Progress Note:</label>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Crew arrived on site, isolated transformer segment B..."
                        className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-sm transition"
                  >
                    Commit Status Transition
                  </button>
                </form>

                {/* ETR Update Form */}
                <form onSubmit={handleUpdateETR} className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Update Estimated Restoration Time (ETR)</span>
                  </h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="datetime-local"
                      value={etrInput}
                      onChange={(e) => setEtrInput(e.target.value)}
                      className="bg-white border border-orange-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm transition"
                    >
                      Update Public ETR
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB CONTENT: ASSIGN TEAM */}
            {activeTab === 'teams' && (
              <form onSubmit={handleAssignTeam} className="space-y-4 text-xs">
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-orange-600" />
                    <span>Dispatch Field Repair Squad</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-slate-700 font-bold block">Select Field Crew:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {teams.map(t => (
                        <label
                          key={t.id}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                            teamInput === t.id
                              ? 'bg-orange-100 border-orange-500'
                              : 'bg-white border-orange-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{t.name}</span>
                            <span className="text-[11px] text-slate-500">{t.specialization} &bull; Lead: {t.leader}</span>
                          </div>
                          <input
                            type="radio"
                            name="teamSelect"
                            value={t.id}
                            checked={teamInput === t.id}
                            onChange={(e) => setTeamInput(e.target.value)}
                            className="text-orange-500 focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Dispatch Instructions / Note:</label>
                    <input
                      type="text"
                      value={teamNote}
                      onChange={(e) => setTeamNote(e.target.value)}
                      placeholder="e.g. High priority hospital feeder issue, prepare backup bypass cable..."
                      className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-sm transition"
                  >
                    Confirm Team Assignment
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: PRIORITY INTELLIGENCE & OVERRIDE */}
            {activeTab === 'override' && (
              <div className="space-y-4 text-xs">
                <div className="bg-orange-50 border border-orange-300 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-orange-950 text-sm">Explainable Priority Intelligence Breakdown</h4>
                    <span className="font-bold font-mono text-orange-900 text-sm bg-orange-200 px-2 py-0.5 rounded border border-orange-300">
                      Calculated Score: {selectedIncident.priorityScore}/100
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {(selectedIncident.priorityReasons || []).map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  {selectedIncident.priorityOverridden && (
                    <div className="bg-amber-100 border border-amber-300 p-2.5 rounded-lg text-amber-900 mt-2 font-medium">
                      ⚠️ <strong>Operator Override Active:</strong> Priority manually set to <strong>{selectedIncident.assignedPriority}</strong>.
                      <p className="mt-0.5 text-[11px] text-slate-700">Reason: {selectedIncident.priorityOverrideReason}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleOverridePriority} className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-orange-600" />
                    <span>Operator Priority Override (with Mandatory Audit Reason)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Override Priority Level:</label>
                      <select
                        value={overridePriorityInput}
                        onChange={(e) => setOverridePriorityInput(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-800 font-bold"
                      >
                        <option value="Critical">Critical Priority (15m SLA)</option>
                        <option value="High">High Priority (30m SLA)</option>
                        <option value="Medium">Medium Priority (60m SLA)</option>
                        <option value="Low">Low Priority (120m SLA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Mandatory Override Reason:</label>
                      <input
                        type="text"
                        value={overrideReasonInput}
                        onChange={(e) => setOverrideReasonInput(e.target.value)}
                        placeholder="e.g. Confirmed dialysis unit operating at clinic in sector..."
                        className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-sm transition"
                  >
                    Commit Priority Override & Audit Record
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: NOTES & TIMELINE */}
            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Enter internal control room progress note..."
                    className="flex-1 bg-orange-50/40 border border-orange-200 rounded-xl px-4 py-2 text-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Add Note
                  </button>
                </form>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(selectedIncident.progressNotes || []).map((n, i) => (
                    <div key={i} className="p-3 bg-orange-50/40 rounded-xl border border-orange-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-orange-600 font-bold">
                        <span>{n.author}</span>
                        <span className="text-slate-400 font-normal">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{n.note}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-orange-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">Automated Activity Audit Trail:</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] text-slate-500">
                    {(selectedIncident.activityLog || []).map((act, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-mono text-slate-400 flex-shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slate-700">{act.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LINKED CONSUMER REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">
                  GridGuard Intelligent Grouping aggregated these individual consumer outage tickets into this common master incident:
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {groupedReports.map(rep => (
                    <div key={rep.id} className="p-3 bg-orange-50/40 rounded-xl border border-orange-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-orange-600 font-mono">{rep.reportNumber}</span>
                        <span className="text-slate-400 text-[11px] font-normal">{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700">{rep.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-orange-200/60 font-medium">
                        <span>Reporter: {rep.consumerName}</span>
                        <span>Severity: {rep.severity}</span>
                      </div>
                    </div>
                  ))}

                  {groupedReports.length === 0 && (
                    <p className="text-slate-400 italic">No individual reports found for this incident.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
