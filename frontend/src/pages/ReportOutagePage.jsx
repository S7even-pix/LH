import React, { useState } from 'react';
import { 
  Zap, MapPin, AlertTriangle, ShieldAlert, CheckCircle2, 
  Search, Clock, Phone, User, Info, Navigation, ArrowRight
} from 'lucide-react';
import MapViewer from '../components/MapViewer';
import { incidentStore } from '../data/incidentStore';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { KERALA_CENTER } from '../data/seedData';

export default function ReportOutagePage({ storeData }) {
  // Tab state: 'report' or 'track'
  const [activeTab, setActiveTab] = useState('report');

  // Form fields
  const [formData, setFormData] = useState({
    consumerName: '',
    consumerPhone: '',
    address: 'Palarivattom Junction, Ernakulam, Kerala',
    latitude: 10.0031,
    longitude: 76.3075,
    category: 'Complete outage',
    severity: 'High',
    description: '',
    criticalFacilityNearby: '',
    safetyHazard: '',
    estimatedConsumers: 50
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Tracking tab state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedIncident, setTrackedIncident] = useState(null);
  const [trackError, setTrackError] = useState(null);

  // Map picker update
  const handleLocationSelect = (coords) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(coords.lat.toFixed(5)),
      longitude: Number(coords.lng.toFixed(5)),
      address: prev.address || `Kerala Coordinates (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
    }));
  };

  // Quick preset locations in Kerala for quick demo filling
  const presetLocations = [
    { label: 'Kalamassery (Near Medical College)', lat: 10.0468, lng: 76.3218, address: 'Near Govt. Medical College, Kalamassery' },
    { label: 'Kakkanad InfoPark Sector 2', lat: 10.0104, lng: 76.3624, address: 'InfoPark Expressway, Kakkanad' },
    { label: 'MG Road, Shenoys Junction', lat: 9.9723, lng: 76.2842, address: 'Shenoys Junction, MG Road, Ernakulam' },
    { label: 'Fort Kochi Heritage Area', lat: 9.9658, lng: 76.2421, address: 'Bastion Street, Fort Kochi' },
  ];

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      address: preset.address,
      latitude: preset.lat,
      longitude: preset.lng
    }));
  };

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.address.trim()) errors.address = 'Location or locality address is required.';
    if (!formData.latitude || !formData.longitude) errors.location = 'Please select a location on the map.';
    if (!formData.category) errors.category = 'Outage category is required.';
    if (!formData.description.trim()) errors.description = 'Please provide a brief description of the fault.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const result = incidentStore.submitConsumerReport(formData);
        setSubmissionResult(result);
        setIsSubmitting(false);
      } catch (err) {
        console.error('Submission error:', err);
        setIsSubmitting(false);
      }
    }, 400);
  };

  // Handle Track Query
  const handleTrackSearch = (e) => {
    e.preventDefault();
    setTrackError(null);
    setTrackedIncident(null);

    const q = trackQuery.trim().toUpperCase();
    if (!q) {
      setTrackError('Please enter an Incident ID (e.g. GG-KL-1001) or Report ID (e.g. REP-KL-501).');
      return;
    }

    const incidents = storeData?.incidents || [];
    const reports = storeData?.reports || [];

    // Search by incident ID
    let foundInc = incidents.find(i => i.id.toUpperCase() === q);

    // If not found, search by report ID or report number
    if (!foundInc) {
      const foundRep = reports.find(r => r.id.toUpperCase() === q || (r.reportNumber && r.reportNumber.toUpperCase() === q));
      if (foundRep && foundRep.incidentId) {
        foundInc = incidents.find(i => i.id === foundRep.incidentId);
      }
    }

    if (foundInc) {
      setTrackedIncident(foundInc);
    } else {
      setTrackError(`No active record found for "${q}". Please verify your ticket ID.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Warning Banner for Safety */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-amber-900">
            Public Safety Warning & Kerala Emergency Contacts
          </p>
          <p className="text-slate-600 leading-relaxed font-medium">
            Never approach damaged electrical infrastructure, sagging high-tension wires, or smoking transformers. Maintain at least 10 meters distance.
            For life-threatening emergencies, dial <strong>112</strong> (Police/Emergency), <strong>101</strong> (Fire & Rescue), or the KSEB 24/7 Helpline at <strong>1912</strong>.
          </p>
        </div>
      </div>

      {/* Tabs: Report vs Track */}
      <div className="flex items-center justify-between border-b border-orange-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('report'); setSubmissionResult(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-orange-200'
            }`}
          >
            <Zap className="w-4 h-4 text-white fill-white" />
            <span>Submit Outage Report</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'track'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-orange-200'
            }`}
          >
            <Search className="w-4 h-4 text-orange-500" />
            <span>Track Outage by ID</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
          Demo Area: Ernakulam & Kochi, Kerala
        </span>
      </div>

      {/* TAB 1: SUBMIT OUTAGE REPORT */}
      {activeTab === 'report' && (
        <>
          {submissionResult ? (
            /* Success Confirmation Card with Grouping Breakdown */
            <div className="bg-white border border-emerald-400 rounded-2xl p-6 shadow-md space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
                <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Outage Report Successfully Registered!</h3>
                  <p className="text-xs text-slate-500">
                    Report ID: <span className="font-mono text-orange-600 font-bold">{submissionResult.report.reportNumber}</span>
                  </p>
                </div>
              </div>

              {/* Grouping Insight Banner */}
              {submissionResult.groupingResult ? (
                <div className="bg-orange-50 border border-orange-300 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-orange-900 text-xs">
                    <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                    <span>Intelligent Incident Grouping Activated</span>
                    <span className="ml-auto bg-orange-200 px-2 py-0.5 rounded text-[10px] text-orange-800 font-bold">
                      {submissionResult.groupingResult.confidence}% Proximity Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {submissionResult.groupingResult.reasoning}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your report has been linked to existing master incident <strong>#{submissionResult.incident.id}</strong>. This ensures repair teams have coordinated telemetry and avoids redundant dispatches.
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50/70 border border-orange-300 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-orange-900 text-xs">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>New Master Incident Established: #{submissionResult.incident.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    No matching active fault was found nearby. A new incident ticket has been initialized and assigned an initial priority of <strong>{submissionResult.incident.assignedPriority}</strong>.
                  </p>
                </div>
              )}

              {/* Incident Details Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-orange-50/40 p-4 rounded-xl border border-orange-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Incident ID:</span>
                  <span className="font-mono font-bold text-orange-600 text-sm">{submissionResult.incident.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Recommended Priority:</span>
                  <PriorityBadge priority={submissionResult.incident.assignedPriority} />
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Status:</span>
                  <StatusBadge status={submissionResult.incident.status} />
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Location:</span>
                  <span className="font-semibold text-slate-800">{submissionResult.incident.locationName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Restoration:</span>
                  <span className="font-bold text-orange-600">
                    {new Date(submissionResult.incident.estimatedRestorationAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Consumers:</span>
                  <span className="font-bold text-amber-700">~{submissionResult.incident.estimatedAffectedConsumers} (simulated)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setTrackedIncident(submissionResult.incident);
                    setActiveTab('track');
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track This Outage Now</span>
                </button>

                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setFormData(prev => ({ ...prev, description: '' }));
                  }}
                  className="px-4 py-2 bg-white hover:bg-orange-50 text-slate-700 rounded-xl text-xs font-semibold border border-orange-200 transition"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          ) : (
            /* Report Input Form */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Inputs) */}
              <div className="lg:col-span-7 bg-white border border-orange-200/90 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-orange-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Consumer Outage Report Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide accurate location and fault details so the Intelligence Engine can prioritize repair squads.
                  </p>
                </div>

                {/* Quick Presets for Demo */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Quick Demo Presets (Kochi Metro Area):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presetLocations.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="text-left px-3 py-1.5 rounded-lg bg-orange-50/70 hover:bg-orange-100 border border-orange-200 text-[11px] text-slate-700 hover:text-orange-900 font-medium truncate transition"
                      >
                        📍 {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location / Locality text */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Locality / Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Infopark Expressway, Kakkanad, Kochi"
                    className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                  {formErrors.address && <p className="text-rose-600 text-[11px] font-semibold">{formErrors.address}</p>}
                </div>

                {/* Coordinates Preview */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Outage Category & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Outage Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                    >
                      <option value="Complete outage">Complete Outage (Blackout)</option>
                      <option value="Damaged electrical infrastructure">Damaged Electrical Infrastructure</option>
                      <option value="Frequent power fluctuations">Frequent Power Fluctuations</option>
                      <option value="Voltage fluctuation">Voltage Fluctuation / Sag</option>
                      <option value="Partial outage">Partial Outage</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Reported Severity <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                    >
                      <option value="Critical">Critical (Immediate Hazard / Life Support)</option>
                      <option value="High">High (Major Area / Commercial)</option>
                      <option value="Medium">Medium (Residential Block)</option>
                      <option value="Low">Low (Isolated / Minor)</option>
                    </select>
                  </div>
                </div>

                {/* Description of Problem */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe sounds, visible sparking, fallen branches, whether neighbors are also affected..."
                    className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                  {formErrors.description && <p className="text-rose-600 text-[11px] font-semibold">{formErrors.description}</p>}
                </div>

                {/* Critical Facility Involvement */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                    <span>Critical Infrastructure Nearby (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.criticalFacilityNearby}
                    onChange={(e) => setFormData({ ...formData, criticalFacilityNearby: e.target.value })}
                    placeholder="e.g. Govt. Hospital, Dialysis Clinic, Water Pumping Station, School..."
                    className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                {/* Safety Hazard Details */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Physical Safety Hazard (if any)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.safetyHazard}
                    onChange={(e) => setFormData({ ...formData, safetyHazard: e.target.value })}
                    placeholder="e.g. Downed wire on wet road, sparking transformer pole, fire hazard..."
                    className="w-full bg-rose-50/30 border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                {/* Optional Consumer Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-100">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Reporter Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.consumerName}
                      onChange={(e) => setFormData({ ...formData, consumerName: e.target.value })}
                      placeholder="Anonymous Citizen"
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>Mobile Number (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.consumerPhone}
                      onChange={(e) => setFormData({ ...formData, consumerPhone: e.target.value })}
                      placeholder="+91 94460 00000"
                      className="w-full bg-orange-50/30 border border-orange-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-white fill-white" />
                    <span>{isSubmitting ? 'Evaluating & Registering...' : 'Submit Outage Report'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column (Interactive Leaflet Map Pin Picker) */}
              <div className="lg:col-span-5 bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-3 flex flex-col">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>Interactive Map Location Picker</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click anywhere on the map to place the outage pin, or click "My Location" to detect coordinates.
                  </p>
                </div>

                <div className="flex-1 min-h-[380px]">
                  <MapViewer
                    isPickerMode={true}
                    pickerLocation={{ lat: formData.latitude, lng: formData.longitude }}
                    onLocationSelect={handleLocationSelect}
                    height="420px"
                  />
                </div>

                <div className="text-[11px] text-slate-600 bg-orange-50/70 p-3 rounded-xl border border-orange-200">
                  💡 <strong>Tip:</strong> Submitting nearby coordinates to an active incident (within 2.0 km) automatically demonstrates GridGuard's <strong>Intelligent Incident Grouping</strong>!
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: TRACK OUTAGE BY ID */}
      {activeTab === 'track' && (
        <div className="bg-white border border-orange-200/90 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="max-w-xl mx-auto space-y-3 text-center">
            <h3 className="text-lg font-bold text-slate-900">Track Outage Status & Restoration Progress</h3>
            <p className="text-xs text-slate-600">
              Enter your incident ticket ID (e.g. <span className="font-mono text-orange-600 font-bold">GG-KL-1001</span>) or report reference (e.g. <span className="font-mono text-orange-600 font-bold">REP-KL-501</span>).
            </p>

            <form onSubmit={handleTrackSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter Ticket ID (e.g. GG-KL-1001)"
                className="flex-1 bg-orange-50/30 border border-orange-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-sm transition"
              >
                Track
              </button>
            </form>

            {trackError && (
              <p className="text-rose-600 text-xs font-bold">{trackError}</p>
            )}
          </div>

          {/* Incident Tracking Display Card */}
          {trackedIncident && (
            <div className="bg-orange-50/40 border border-orange-200 rounded-2xl p-6 space-y-5 mt-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-orange-200 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-orange-600">{trackedIncident.id}</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{trackedIncident.locationName}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={trackedIncident.assignedPriority || trackedIncident.recommendedPriority} />
                  <StatusBadge status={trackedIncident.status} />
                </div>
              </div>

              {/* Status Stepper Progression */}
              <div className="py-2">
                <span className="text-[11px] font-bold text-slate-600 block mb-3">Incident Progress Stepper:</span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                  {[
                    { label: 'Reported', val: 'Reported' },
                    { label: 'Verified', val: 'Verified' },
                    { label: 'Assigned', val: 'Assigned' },
                    { label: 'In Progress', val: 'Repair in Progress' },
                    { label: 'Restored', val: 'Restored' }
                  ].map((step, idx) => {
                    const statusOrder = ['reported', 'verified', 'assigned', 'repair in progress', 'restored', 'closed'];
                    const currentIdx = statusOrder.indexOf(trackedIncident.status.toLowerCase());
                    const stepIdx = statusOrder.indexOf(step.val.toLowerCase());
                    const isPassed = currentIdx >= stepIdx;
                    const isCurrent = currentIdx === stepIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-all ${
                          isCurrent
                            ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-orange-200 text-slate-400'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className={`font-semibold ${isCurrent ? 'text-orange-700 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Restoration Timeline & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Restoration:</span>
                  <span className="font-bold text-orange-600 text-sm">
                    {trackedIncident.estimatedRestorationAt ? new Date(trackedIncident.estimatedRestorationAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Under field evaluation'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Field Squad:</span>
                  <span className="font-bold text-slate-900">{trackedIncident.assignedTeamName || 'Queued for dispatch'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Impact:</span>
                  <span className="font-bold text-amber-700">~{trackedIncident.estimatedAffectedConsumers} consumers (simulated)</span>
                </div>
              </div>

              {/* Progress Notes Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Field Activity Log & Control Room Updates:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(trackedIncident.progressNotes || []).map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-orange-200 text-xs space-y-0.5 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] text-orange-600 font-bold">
                        <span>{note.author}</span>
                        <span className="text-slate-400 font-normal">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{note.note}</p>
                    </div>
                  ))}

                  {(!trackedIncident.progressNotes || trackedIncident.progressNotes.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
