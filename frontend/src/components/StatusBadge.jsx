import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, Wrench, Radio } from 'lucide-react';

export function PriorityBadge({ priority, size = 'sm' }) {
  const p = (priority || 'medium').toLowerCase();
  
  const styles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm animate-pulse font-bold',
    high: 'bg-orange-50 text-orange-700 border-orange-300 font-bold',
    medium: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold',
    low: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
  };

  const icons = {
    critical: <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-600" />,
    high: <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-orange-600" />,
    medium: <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-600" />,
    low: <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />,
  };

  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border ${styles[p] || styles.medium} ${sizeClass}`}>
      {icons[p] || icons.medium}
      {priority || 'Medium'}
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }) {
  const s = (status || 'reported').toLowerCase();

  const styles = {
    'reported': 'bg-orange-50 text-orange-600 border-orange-200',
    'under review': 'bg-blue-50 text-blue-700 border-blue-200',
    'verified': 'bg-blue-50 text-blue-700 border-blue-200',
    'team assigned': 'bg-amber-50 text-amber-700 border-amber-200',
    'assigned': 'bg-amber-50 text-amber-700 border-amber-200',
    'repair in progress': 'bg-orange-100 text-orange-800 border-orange-300 font-bold',
    'resolved': 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
    'restored': 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
    'closed': 'bg-slate-100 text-slate-600 border-slate-200',
    'escalated': 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold',
    'acknowledged': 'bg-purple-50 text-purple-700 border-purple-200',
    'reviewed': 'bg-teal-50 text-teal-700 border-teal-200',
  };

  const icons = {
    'reported': <Radio className="w-3 h-3 inline mr-1 text-orange-500" />,
    'under review': <Clock className="w-3 h-3 inline mr-1 text-blue-500" />,
    'verified': <Clock className="w-3 h-3 inline mr-1 text-blue-500" />,
    'team assigned': <Wrench className="w-3 h-3 inline mr-1 text-amber-600" />,
    'assigned': <Wrench className="w-3 h-3 inline mr-1 text-amber-600" />,
    'repair in progress': <Wrench className="w-3 h-3 inline mr-1 text-orange-600 animate-spin" />,
    'resolved': <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-600" />,
    'restored': <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-600" />,
    'closed': <CheckCircle2 className="w-3 h-3 inline mr-1 text-slate-500" />,
    'escalated': <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-600" />,
    'acknowledged': <Clock className="w-3 h-3 inline mr-1 text-purple-600" />,
    'reviewed': <CheckCircle2 className="w-3 h-3 inline mr-1 text-teal-600" />,
  };

  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border ${styles[s] || styles['reported']} ${sizeClass}`}>
      {icons[s]}
      {status || 'Reported'}
    </span>
  );
}
