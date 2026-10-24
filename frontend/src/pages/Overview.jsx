import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, AlertTriangle, ShieldAlert, CheckCircle2, Clock, 
  Users, MapPin, ArrowRight, Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import MapViewer from '../components/MapViewer';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { incidentStore } from '../data/incidentStore';

export default function Overview({ storeData, currentRole }) {
  const navigate = useNavigate();

  const incidents = storeData?.incidents || [];
  const escalations = storeData?.escalations || [];

  // Compute live KPIs from shared incident data
  const kpis = useMemo(() => {
    let active = 0;
    let criticalHigh = 0;
    let overdue = 0;
    let totalConsumers = 0;
    let resolvedCount = 0;
    let totalResolutionMinutes = 0;

    incidents.forEach(inc => {
      const isResolved = inc.status === 'Restored' || inc.status === 'Closed';
      if (!isResolved) {
        active++;
        const p = (inc.assignedPriority || inc.recommendedPriority || '').toLowerCase();
        if (p === 'critical' || p === 'high') criticalHigh++;
        if (inc.isOverdue) overdue++;
        totalConsumers += Number(inc.estimatedAffectedConsumers) || 0;
      } else {
        resolvedCount++;
        if (inc.reportedAt && inc.resolvedAt) {
          const diffMin = (new Date(inc.resolvedAt).getTime() - new Date(inc.reportedAt).getTime()) / (60 * 1000);
          totalResolutionMinutes += Math.max(10, diffMin);
        }
      }
    });

    const pendingEsc = escalations.filter(e => e.status === 'Pending').length;
    const avgResMinutes = resolvedCount > 0 ? Math.round(totalResolutionMinutes / resolvedCount) : 48;

    return {
      activeIncidents: active,
      criticalHigh,
      overdue,
      totalConsumers,
      pendingEscalations: pendingEsc,
      avgResolutionMinutes: avgResMinutes,
      resolvedCount
    };
  }, [incidents, escalations]);

  // Overdue / Breached incidents list for warnings
  const overdueIncidents = useMemo(() => {
    return incidents.filter(i => i.isOverdue && i.status !== 'Restored' && i.status !== 'Closed');
  }, [incidents]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Live Mission Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-orange-100/90 via-amber-50 to-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Grid Operations Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Grid Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl font-medium">
            Real-time geospatial monitoring, explainable priority intelligence, and automated supervisory escalation for Kochi & Ernakulam district distribution networks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-xs flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 text-white fill-white" />
            <span>Report Outage</span>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 bg-white hover:bg-orange-50 text-slate-800 font-bold rounded-xl border border-orange-300 text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Open Full Map</span>
          </button>
        </div>
      </div>

      {/* SLA Breach Alert Banner if any overdue incidents */}
      {overdueIncidents.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <span>Critical Notice: {overdueIncidents.length} Incident(s) Exceeded Resolution SLA Threshold</span>
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                Automated escalation records generated and delivered to Senior Executive Engineers.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/escalations')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Review in Escalation Centre &rarr;</span>
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-orange-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Active Outages</span>
            <Activity className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{kpis.activeIncidents}</div>
          <p className="text-[10px] text-slate-400 mt-1">Unresolved electrical faults</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Consumers Affected</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 mt-2">{kpis.totalConsumers.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-1">Simulated statistical estimate</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-rose-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Critical & High</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{kpis.criticalHigh}</div>
          <p className="text-[10px] text-slate-400 mt-1">High public/safety impact</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-rose-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Overdue Breaches</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{kpis.overdue}</div>
          <p className="text-[10px] text-slate-400 mt-1">Exceeded target deadline</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-600"></div>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-purple-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Pending Escalations</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{kpis.pendingEscalations}</div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting official action</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-400 hover:shadow-md transition">
          <div className="text-slate-500 text-xs font-bold flex items-center justify-between">
            <span>Avg Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{kpis.avgResolutionMinutes}m</div>
          <p className="text-[10px] text-slate-400 mt-1">{kpis.resolvedCount} resolved incidents</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>
      </div>

      {/* Main Grid: Interactive Map Preview + Urgent Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Outage Geographic Distribution</h3>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Explore Interactive View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapViewer
            incidents={incidents}
            height="430px"
            onSelectIncident={(inc) => navigate('/incidents')}
          />
        </div>

        {/* Right Col: Priority Outage Incidents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-sm">Priority Incidents Queue</h3>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-semibold text-slate-500 hover:text-orange-600"
            >
              View All ({incidents.length})
            </button>
          </div>

          <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
            {incidents.slice(0, 5).map(inc => (
              <div
                key={inc.id}
                onClick={() => navigate('/incidents')}
                className="p-3.5 bg-white border border-orange-200/90 hover:border-orange-400 rounded-xl cursor-pointer transition shadow-sm hover:shadow group space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-orange-600">{inc.id}</span>
                  <div className="flex items-center gap-1">
                    <PriorityBadge priority={inc.assignedPriority || inc.recommendedPriority} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 line-clamp-1 transition-colors">
                    {inc.locationName}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                    {inc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-orange-100">
                  <span>Assigned: <strong className="text-slate-700">{inc.assignedTeamName || 'Unassigned'}</strong></span>
                  <span className="text-orange-700 font-bold">
                    ~{inc.estimatedAffectedConsumers} consumers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick System Guide & Trust Disclaimers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Intelligent Grouping</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Spatial-temporal clustering groups nearby consumer complaints within 2.0 km, minimizing duplicate dispatches and aggregating consumer outage counts.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Explainable Priority Intelligence</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Multi-factor scoring (0-100) automatically prioritizes critical infrastructure (hospitals, ICUs, water plants) and public hazards with transparent explanations.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Automated Supervisory Escalation</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Active incidents exceeding SLA deadlines trigger formal escalation records and structured action notices for higher utility officials and disaster units.
          </p>
        </div>
      </div>
    </div>
  );
}
