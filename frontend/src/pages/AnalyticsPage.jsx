import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, Activity, Clock, ShieldAlert, CheckCircle2, 
  MapPin, AlertTriangle, TrendingUp, Info
} from 'lucide-react';

const COLORS = ['#ea580c', '#f97316', '#f59e0b', '#64748b', '#10b981', '#8b5cf6'];

export default function AnalyticsPage({ storeData }) {
  const incidents = storeData?.incidents || [];
  const reports = storeData?.reports || [];
  const escalations = storeData?.escalations || [];
  const teams = storeData?.teams || [];

  // Summary Metrics
  const metrics = useMemo(() => {
    let resolvedCount = 0;
    let totalResolutionMinutes = 0;
    let overdueCount = 0;

    incidents.forEach(inc => {
      if (inc.status === 'Restored' || inc.status === 'Closed') {
        resolvedCount++;
        if (inc.reportedAt && inc.resolvedAt) {
          const m = (new Date(inc.resolvedAt).getTime() - new Date(inc.reportedAt).getTime()) / (60 * 1000);
          totalResolutionMinutes += Math.max(15, m);
        }
      }
      if (inc.isOverdue) overdueCount++;
    });

    const avgResolutionTime = resolvedCount > 0 ? Math.round(totalResolutionMinutes / resolvedCount) : 45;
    const slaCompliance = incidents.length > 0 ? Math.round(((incidents.length - overdueCount) / incidents.length) * 100) : 85;

    return {
      totalIncidents: incidents.length,
      totalReports: reports.length,
      resolvedCount,
      overdueCount,
      totalEscalations: escalations.length,
      avgResolutionTime,
      slaCompliance
    };
  }, [incidents, reports, escalations]);

  // Outages by Locality Hotspots
  const locationData = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      const loc = inc.locationName.split(',')[0].trim();
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({
      location: k,
      outages: counts[k],
    })).sort((a, b) => b.outages - a.outages);
  }, [incidents]);

  // Outages by Category
  const categoryData = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({
      name: k.replace('electrical ', ''),
      count: counts[k],
    }));
  }, [incidents]);

  // Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    incidents.forEach(inc => {
      const p = inc.assignedPriority || inc.recommendedPriority || 'Medium';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k],
    }));
  }, [incidents]);

  // Weekly Trend Simulation
  const trendData = [
    { day: 'Mon', reported: 3, resolved: 3 },
    { day: 'Tue', reported: 5, resolved: 4 },
    { day: 'Wed', reported: 7, resolved: 6 },
    { day: 'Thu', reported: 4, resolved: 5 },
    { day: 'Fri', reported: 9, resolved: 8 },
    { day: 'Sat', reported: 6, resolved: 6 },
    { day: 'Sun (Today)', reported: incidents.length, resolved: metrics.resolvedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Grid Intelligence & Historical Outage Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical aggregation of fault frequencies, hotspot sectors, repair cycle times, and SLA compliance metrics
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 font-medium">
          <Info className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <span>Derived from stored benchmark demonstration data (Kerala, India).</span>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 text-xs block font-bold">SLA Compliance Rate</span>
          <div className="text-2xl font-black text-orange-600 mt-1">{metrics.slaCompliance}%</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Resolved within SLA target</span>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 text-xs block font-bold">Average Cycle Time</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.avgResolutionTime} mins</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">From report to line energization</span>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 text-xs block font-bold">Overdue Incidents</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{metrics.overdueCount}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Breached SLA threshold</span>
        </div>

        <div className="bg-white border border-orange-200/90 p-4 rounded-2xl shadow-sm">
          <span className="text-slate-500 text-xs block font-bold">Total Escalation Notices</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{metrics.totalEscalations}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Sent to higher officials</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Outages by Category */}
        <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Outages by Fault Classification</h3>
            <span className="text-xs text-slate-500 font-semibold">{metrics.totalIncidents} Total Incidents</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="#ea580c" radius={[6, 6, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Priority Distribution */}
        <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Explainable Priority Distribution</h3>
            <span className="text-xs text-slate-500 font-semibold">Rules-based intelligence</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Frequently Affected Sectors / Hotspots */}
        <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recurring Sector Hotspots (Kochi Metro)</h3>
            <span className="text-xs text-slate-500 font-semibold">Incident Frequency</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="location" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="outages" fill="#f97316" radius={[0, 6, 6, 0]} name="Total Outages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Outage & Resolution Trends */}
        <div className="bg-white border border-orange-200/90 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Weekly Outage Volume vs Resolution Velocity</h3>
            <span className="text-xs text-slate-500 font-semibold">Demonstration Trend</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Line type="monotone" dataKey="reported" stroke="#ea580c" strokeWidth={2.5} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent AI Insights Box */}
      <div className="bg-white border border-orange-200/90 p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Explainable Grid Intelligence & Recurring Outage Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-1">
            <span className="font-bold text-amber-900 block text-xs">Kalamassery & Kakkanad IT Corridor</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              High density of underground cable and 33kV substation bushing flashovers. Suggest prioritizing thermal imaging audits for feeder tap changers.
            </p>
          </div>

          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-1">
            <span className="font-bold text-rose-900 block text-xs">MG Road Commercial Sector</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Exceeded SLA resolution commitments due to traffic signal co-dependencies. Recommend dedicated emergency bypass switchgear.
            </p>
          </div>

          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 space-y-1">
            <span className="font-bold text-orange-950 block text-xs">Coastal Salt-Mist Vulnerability</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Fort Kochi heritage area exhibits frequent low-tension insulator tracking due to coastal moisture and fallen vegetation during monsoon squalls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
