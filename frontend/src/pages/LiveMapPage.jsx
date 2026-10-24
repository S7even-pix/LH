import React, { useState, useMemo } from 'react';
import { 
  MapPin, Filter, Search, Layers, LayoutList, Map as MapIcon, 
  AlertTriangle, ShieldAlert, Clock, Users, Wrench, X, ExternalLink
} from 'lucide-react';
import MapViewer from '../components/MapViewer';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function LiveMapPage({ storeData }) {
  const navigate = useNavigate();
  const incidents = storeData?.incidents || [];

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const p = (inc.assignedPriority || inc.recommendedPriority || '').toLowerCase();
      const s = (inc.status || '').toLowerCase();
      const c = (inc.category || '').toLowerCase();

      if (priorityFilter !== 'All' && p !== priorityFilter.toLowerCase()) return false;
      if (statusFilter !== 'All' && s !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== 'All' && c !== categoryFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (inc.id || '').toLowerCase().includes(q);
        const matchesLoc = (inc.locationName || '').toLowerCase().includes(q);
        const matchesDesc = (inc.description || '').toLowerCase().includes(q);
        if (!matchesId && !matchesLoc && !matchesDesc) return false;
      }

      return true;
    });
  }, [incidents, priorityFilter, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Outage Geographic Map</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredIncidents.length} of {incidents.length} incidents in Kochi & Ernakulam district
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, street, ID..."
              className="w-full bg-orange-50/50 border border-orange-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center bg-orange-50/80 border border-orange-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'map' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'list' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white border border-orange-200/90 px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-1 text-slate-600 font-bold mr-1">
          <Filter className="w-3.5 h-3.5 text-orange-600" />
          <span>Filters:</span>
        </div>

        {/* Priority Filter */}
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

        {/* Status Filter */}
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

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-orange-50/60 border border-orange-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:border-orange-500"
        >
          <option value="All">All Categories</option>
          <option value="Damaged electrical infrastructure">Damaged Infrastructure</option>
          <option value="Complete outage">Complete Outage</option>
          <option value="Frequent power fluctuations">Frequent Fluctuations</option>
          <option value="Voltage fluctuation">Voltage Fluctuation</option>
          <option value="Partial outage">Partial Outage</option>
        </select>

        {(priorityFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setPriorityFilter('All');
              setStatusFilter('All');
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className="text-orange-600 hover:text-orange-700 font-bold ml-auto flex items-center gap-1 hover:underline"
          >
            <X className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Main Map or List Display */}
      {viewMode === 'map' ? (
        <div className="relative">
          <MapViewer
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="580px"
          />

          {/* Incident Detail Drawer (when selected) */}
          {selectedIncident && (
            <div className="absolute top-4 right-4 z-[1500] w-96 bg-white/95 backdrop-blur-md border border-orange-300 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[550px] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-orange-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-orange-600 block">{selectedIncident.id}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedIncident.locationName}</h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedIncident.assignedPriority || selectedIncident.recommendedPriority} />
                <StatusBadge status={selectedIncident.status} />
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 block">Description:</span>
                <p className="text-slate-700 bg-orange-50/60 p-3 rounded-xl border border-orange-200">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Explainable Priority Score Breakdown */}
              <div className="bg-orange-50 border border-orange-300 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-orange-900">
                  <span>Explainable Priority Intelligence</span>
                  <span className="bg-orange-200/80 px-2 py-0.5 rounded text-orange-900 font-mono">
                    Score: {selectedIncident.priorityScore}/100
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                  {(selectedIncident.priorityReasons || []).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px]">Estimated Impact:</span>
                  <span className="font-bold text-orange-700">{selectedIncident.estimatedAffectedConsumers} consumers</span>
                  <span className="text-[9px] text-slate-400 block">simulated estimate</span>
                </div>

                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                  <span className="text-slate-500 block text-[10px]">Assigned Field Team:</span>
                  <span className="font-bold text-slate-800">{selectedIncident.assignedTeamName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-orange-100">
                <button
                  onClick={() => navigate('/incidents')}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Open in Incident Management</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map(inc => (
            <div
              key={inc.id}
              onClick={() => {
                setSelectedIncident(inc);
                setViewMode('map');
              }}
              className="bg-white border border-orange-200/90 hover:border-orange-400 p-4 rounded-2xl shadow-sm hover:shadow cursor-pointer transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-orange-600">{inc.id}</span>
                <div className="flex items-center gap-1">
                  <PriorityBadge priority={inc.assignedPriority || inc.recommendedPriority} />
                  <StatusBadge status={inc.status} />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{inc.locationName}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{inc.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-orange-100">
                <div>
                  <span>Category:</span>
                  <span className="text-slate-800 block font-semibold">{inc.category}</span>
                </div>
                <div>
                  <span>Consumers:</span>
                  <span className="text-orange-700 block font-bold">~{inc.estimatedAffectedConsumers}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-orange-600 pt-1 font-bold">
                <span>View on map &rarr;</span>
                <span className="text-slate-400 text-[11px] font-normal">{inc.reportCount} linked report(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
