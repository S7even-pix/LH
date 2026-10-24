// GridGuard Centralized Incident Data Store & Reactive Intelligence Engine
// Uses versioned localStorage for instant, zero-config persistence across refreshes.

import { getInitialSeedData, INITIAL_SLA_CONFIGS, INITIAL_FIELD_TEAMS } from './seedData';

const STORAGE_KEY = 'gridguard_data_v2';

// ----------------- Geospatial & Intelligence Utilities -----------------

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const CRITICAL_FACILITY_PATTERNS = [
  'hospital', 'medical college', 'clinic', 'icu', 'dialysis', 'oxygen',
  'water treatment', 'pumping station', 'railway', 'metro', 'fire station',
  'police', 'airport', 'emergency', 'neonatal', 'cold storage'
];

export function detectCriticalFacility(text) {
  if (!text) return { detected: false, matched: [] };
  const lower = text.toLowerCase();
  const matched = CRITICAL_FACILITY_PATTERNS.filter(p => lower.includes(p));
  return {
    detected: matched.length > 0,
    matched
  };
}

// ----------------- Explainable Priority Intelligence -----------------

export function calculateExplainablePriority({
  severity = 'Medium',
  category = 'Complete outage',
  estimatedAffectedConsumers = 50,
  description = '',
  locationName = '',
  criticalServiceImpact = false,
  safetyHazard = false,
  elapsedMinutes = 0
}) {
  let score = 0;
  const reasons = [];

  // 1. Severity factor (0-30 pts)
  const sevMap = {
    critical: 30,
    high: 22,
    medium: 14,
    low: 6
  };
  const sevScore = sevMap[(severity || 'medium').toLowerCase()] || 14;
  score += sevScore;
  reasons.push(`Reported severity '${severity}' (+${sevScore} pts)`);

  // 2. Affected consumers estimate (0-25 pts)
  const count = Number(estimatedAffectedConsumers) || 1;
  let consumerScore = 6;
  if (count >= 300) {
    consumerScore = 25;
    reasons.push(`High consumer density cluster (${count} estimated consumers) (+25 pts)`);
  } else if (count >= 100) {
    consumerScore = 18;
    reasons.push(`Significant consumer cluster (${count} estimated consumers) (+18 pts)`);
  } else if (count >= 20) {
    consumerScore = 12;
    reasons.push(`Moderate consumer impact (${count} consumers) (+12 pts)`);
  } else {
    consumerScore = 6;
    reasons.push(`Localized consumer report (${count} consumers) (+6 pts)`);
  }
  score += consumerScore;

  // 3. Category & Hazard risk (0-25 pts)
  const catLower = (category || '').toLowerCase();
  if (safetyHazard || catLower.includes('damaged') || catLower.includes('hazard')) {
    score += 25;
    reasons.push('Safety hazard / damaged electrical infrastructure (+25 pts)');
  } else if (catLower.includes('complete')) {
    score += 20;
    reasons.push('Complete power failure (+20 pts)');
  } else if (catLower.includes('repeated')) {
    score += 15;
    reasons.push('Recurring fault in same distribution segment (+15 pts)');
  } else if (catLower.includes('fluctuation')) {
    score += 12;
    reasons.push('Voltage instability endangering equipment (+12 pts)');
  } else {
    score += 8;
    reasons.push(`Category '${category}' (+8 pts)`);
  }

  // 4. Critical facility impact (0-20 pts)
  const textToScan = `${description} ${locationName}`;
  const facilityCheck = detectCriticalFacility(textToScan);
  if (criticalServiceImpact || facilityCheck.detected) {
    score += 20;
    const facilities = facilityCheck.matched.length > 0 ? facilityCheck.matched.join(', ') : 'essential service';
    reasons.push(`Critical infrastructure detected (${facilities}) (+20 pts)`);
  }

  // 5. Outage duration urgency (0-10 pts)
  if (elapsedMinutes >= 60) {
    score += 10;
    reasons.push('Extended outage duration (>60m unaddressed) (+10 pts)');
  } else if (elapsedMinutes >= 30) {
    score += 5;
    reasons.push('Unresolved duration (>30m) (+5 pts)');
  }

  // Cap score 0 - 100
  score = Math.min(100, Math.max(0, Math.round(score)));

  let priority = 'Low';
  if (score >= 75) priority = 'Critical';
  else if (score >= 50) priority = 'High';
  else if (score >= 25) priority = 'Medium';
  else priority = 'Low';

  return {
    priority,
    score,
    reasons,
    explanation: `Recommended ${priority.toUpperCase()} priority (Score: ${score}/100) based on explainable rule-based intelligence: ${reasons.join('; ')}.`
  };
}

// ----------------- Incident Grouping Engine -----------------

export function findGroupingCandidate(newReport, existingIncidents, maxDistanceKm = 2.0, maxTimeHours = 12) {
  const activeIncidents = existingIncidents.filter(
    inc => inc.status !== 'Restored' && inc.status !== 'Closed'
  );

  let bestCandidate = null;
  let highestConfidence = 0;

  for (const inc of activeIncidents) {
    const distKm = calculateDistanceKm(
      Number(newReport.latitude),
      Number(newReport.longitude),
      inc.latitude,
      inc.longitude
    );

    if (distKm <= maxDistanceKm) {
      // Calculate time delta in hours
      const incTime = new Date(inc.createdAt).getTime();
      const reportTime = newReport.createdAt ? new Date(newReport.createdAt).getTime() : Date.now();
      const timeDiffHours = Math.abs(reportTime - incTime) / (1000 * 60 * 60);

      if (timeDiffHours <= maxTimeHours) {
        // Spatial proximity score (0 to 1)
        const spatialScore = Math.max(0, 1 - (distKm / maxDistanceKm));
        // Category similarity
        const categoryMatch = inc.category.toLowerCase() === (newReport.category || '').toLowerCase() ? 1.0 : 0.4;
        
        // Confidence calculation (0% to 100%)
        const confidence = Math.round(((spatialScore * 0.65) + (categoryMatch * 0.35)) * 100);

        if (confidence > highestConfidence && confidence >= 40) {
          highestConfidence = confidence;
          bestCandidate = {
            incident: inc,
            distanceKm: Number(distKm.toFixed(2)),
            distanceMeters: Math.round(distKm * 1000),
            confidence,
            timeDiffHours: Number(timeDiffHours.toFixed(1)),
            reasoning: `Located ${Math.round(distKm * 1000)}m from active incident #${inc.id} with ${confidence}% spatial-temporal correlation and ${categoryMatch === 1.0 ? 'matching fault category' : 'related electrical characteristics'}.`
          };
        }
      }
    }
  }

  return bestCandidate;
}

// ----------------- Storage Management & Reactive Listeners -----------------

let listeners = [];

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Listener callback error:', e);
    }
  });
}

export function subscribeToStore(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveStore(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.incidents)) {
      const initial = getInitialSeedData();
      saveStore(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage, resetting to seed data:', err);
    const initial = getInitialSeedData();
    saveStore(initial);
    return initial;
  }
}

export function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ----------------- SLA Sentinel & Auto-Escalation Engine -----------------

export function checkSLAStatusAndEscalate(data = null) {
  const store = data || loadStore();
  const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
  const slaMap = {};
  (store.slaConfigs || INITIAL_SLA_CONFIGS).forEach(cfg => {
    slaMap[cfg.priority.toLowerCase()] = cfg.thresholdMinutes;
  });

  let modified = false;
  const newEscalations = [];

  store.incidents.forEach(inc => {
    // Only monitor active unresolved incidents
    if (inc.status === 'Restored' || inc.status === 'Closed') {
      return;
    }

    const reportedTime = new Date(inc.reportedAt || inc.createdAt).getTime();
    const elapsedMinutes = Math.floor((now - reportedTime) / (60 * 1000));
    const prio = (inc.assignedPriority || inc.recommendedPriority || 'medium').toLowerCase();
    const thresholdMinutes = slaMap[prio] || 60;

    // Check if overdue
    const isOverdue = elapsedMinutes > thresholdMinutes;
    if (isOverdue !== inc.isOverdue) {
      inc.isOverdue = isOverdue;
      modified = true;
    }

    if (isOverdue) {
      // Check if an escalation already exists for this breach
      const existingEsc = store.escalations.find(e => e.incidentId === inc.id);
      
      if (!existingEsc) {
        inc.isEscalated = true;
        const overdueBy = elapsedMinutes - thresholdMinutes;
        const escId = `ESC-${String(store.escalations.length + 1).padStart(3, '0')}`;

        const escalationMessage = `Subject: Action Required — Power Outage Exceeded SLA

Incident ID: ${inc.id}
Location: ${inc.locationName} (Lat: ${inc.latitude.toFixed(4)}, Lon: ${inc.longitude.toFixed(4)})
Priority: ${inc.assignedPriority || inc.recommendedPriority} (Score: ${inc.priorityScore}/100)
Outage Duration: ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m
Configured SLA Deadline: ${thresholdMinutes} minutes (Overdue by ${overdueBy} minutes)
Estimated Affected Consumers: ${inc.estimatedAffectedConsumers} (Simulated estimate)
Critical Facilities Involved: ${inc.criticalFacilities && inc.criticalFacilities.length > 0 ? inc.criticalFacilities.join(', ') : 'None explicitly tagged'}
Current Status: ${inc.status}
Assigned Field Team: ${inc.assignedTeamName || 'Unassigned'}
Safety Hazard: ${inc.safetyHazard ? inc.hazardDetails || 'Active hazard present' : 'None reported'}

Reason for Escalation:
The configured restoration deadline has been exceeded by ${overdueBy} minutes. Immediate executive intervention is requested.

Requested Directive:
1. Review field progress with ${inc.assignedTeamName || 'the dispatch desk'}.
2. Authorize auxiliary feeder bypass or additional repair squad if needed.
3. Update public estimated restoration time.`;

        const newEsc = {
          id: escId,
          incidentId: inc.id,
          incidentNumber: inc.id,
          incidentTitle: inc.locationName,
          priority: inc.assignedPriority || inc.recommendedPriority,
          escalationLevel: 1,
          recipientRole: 'Executive Engineer & Senior Grid Official',
          triggerReason: `Automatic SLA breach: ${inc.assignedPriority || inc.recommendedPriority} priority exceeded configured ${thresholdMinutes}m SLA by ${overdueBy}m.`,
          thresholdMinutes,
          elapsedMinutes,
          overdueByMinutes: overdueBy,
          status: 'Pending',
          generatedMessage: escalationMessage,
          messageStatus: 'Generated & Queued (In-App)',
          acknowledgedBy: null,
          acknowledgedAt: null,
          followUpAction: null,
          resolutionNotes: null,
          resolvedAt: null,
          createdAt: new Date(now).toISOString(),
          auditTrail: [
            {
              timestamp: new Date(now).toISOString(),
              event: `Automated SLA Breach Triggered (${elapsedMinutes}m elapsed vs ${thresholdMinutes}m threshold)`,
              actor: 'GridGuard SLA Sentinel Engine'
            }
          ]
        };

        store.escalations.unshift(newEsc);
        if (!inc.escalationIds) inc.escalationIds = [];
        inc.escalationIds.push(escId);

        // Add activity log entry
        inc.activityLog.push({
          timestamp: new Date(now).toISOString(),
          action: `Automated SLA Breach Triggered (Overdue by ${overdueBy} mins). Escalated to Higher Officials.`
        });

        modified = true;
        newEscalations.push(newEsc);
      }
    }
  });

  store.lastSlaCheckTime = new Date(now).toISOString();

  if (modified) {
    saveStore(store);
  }
  return { store, newEscalations };
}

// ----------------- Core Operations -----------------

export const incidentStore = {
  getStore() {
    return loadStore();
  },

  getIncidents() {
    return loadStore().incidents;
  },

  getIncidentById(id) {
    const store = loadStore();
    return store.incidents.find(i => i.id === id);
  },

  getReports() {
    return loadStore().reports;
  },

  getReportsForIncident(incidentId) {
    const store = loadStore();
    return store.reports.filter(r => r.incidentId === incidentId);
  },

  getEscalations() {
    return loadStore().escalations;
  },

  getTeams() {
    return loadStore().teams;
  },

  getSLAConfigs() {
    return loadStore().slaConfigs || INITIAL_SLA_CONFIGS;
  },

  // Consumer Report Submission with Intelligent Grouping
  submitConsumerReport(reportInput, confirmGroupingIncidentId = null) {
    const store = loadStore();
    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    const reportId = `REP-${String(store.reports.length + 1).padStart(3, '0')}`;
    const reportNumber = `REP-KL-${600 + store.reports.length + 1}`;

    const report = {
      id: reportId,
      reportNumber,
      incidentId: null,
      consumerName: reportInput.consumerName || 'Anonymous Citizen',
      consumerPhone: reportInput.consumerPhone || '',
      address: reportInput.address || 'Kerala, India',
      latitude: Number(reportInput.latitude),
      longitude: Number(reportInput.longitude),
      category: reportInput.category || 'Complete outage',
      severity: reportInput.severity || 'Medium',
      description: reportInput.description || '',
      criticalFacilityNearby: reportInput.criticalFacilityNearby || '',
      safetyHazard: reportInput.safetyHazard || '',
      status: 'Reported',
      createdAt: nowIso
    };

    let targetIncident = null;
    let isNewIncident = false;
    let groupingResult = null;

    if (confirmGroupingIncidentId) {
      // Operator or Consumer explicitly confirmed grouping to existing incident
      targetIncident = store.incidents.find(i => i.id === confirmGroupingIncidentId);
    } else {
      // Automatic intelligent proximity check
      groupingResult = findGroupingCandidate(report, store.incidents);
      if (groupingResult && groupingResult.confidence >= 65) {
        targetIncident = groupingResult.incident;
      }
    }

    if (targetIncident) {
      // Group with existing incident
      report.incidentId = targetIncident.id;
      report.status = targetIncident.status;
      targetIncident.reportIds.push(report.id);
      targetIncident.reportCount = (targetIncident.reportCount || 0) + 1;
      targetIncident.estimatedAffectedConsumers = (targetIncident.estimatedAffectedConsumers || 50) + Math.floor(Math.random() * 30 + 15);
      targetIncident.updatedAt = nowIso;

      // Recalculate priority if not manually overridden by operator
      if (!targetIncident.priorityOverridden) {
        const intel = calculateExplainablePriority({
          severity: targetIncident.severity === 'Critical' || report.severity === 'Critical' ? 'Critical' : targetIncident.severity,
          category: targetIncident.category,
          estimatedAffectedConsumers: targetIncident.estimatedAffectedConsumers,
          description: `${targetIncident.description} | ${report.description}`,
          locationName: targetIncident.locationName,
          criticalServiceImpact: targetIncident.criticalServiceImpact || Boolean(report.criticalFacilityNearby),
          safetyHazard: targetIncident.safetyHazard || Boolean(report.safetyHazard)
        });
        targetIncident.recommendedPriority = intel.priority;
        targetIncident.assignedPriority = intel.priority;
        targetIncident.priorityScore = intel.score;
        targetIncident.priorityReasons = intel.reasons;
      }

      targetIncident.activityLog.push({
        timestamp: nowIso,
        action: `Consumer report #${report.reportNumber} attached via intelligent grouping (${groupingResult ? `${groupingResult.confidence}% confidence, ${groupingResult.distanceMeters}m away` : 'confirmed'}).`
      });
    } else {
      // Create new incident
      isNewIncident = true;
      const incidentId = `GG-KL-${1000 + store.incidents.length + 1}`;
      report.incidentId = incidentId;

      const prioIntel = calculateExplainablePriority({
        severity: report.severity,
        category: report.category,
        estimatedAffectedConsumers: reportInput.estimatedConsumers || 35,
        description: report.description,
        locationName: report.address,
        criticalServiceImpact: Boolean(report.criticalFacilityNearby),
        safetyHazard: Boolean(report.safetyHazard)
      });

      const slaMap = { critical: 15, high: 30, medium: 60, low: 120 };
      const thresholdMins = slaMap[prioIntel.priority.toLowerCase()] || 60;
      const slaDeadline = new Date(now + thresholdMins * 60 * 1000).toISOString();
      const etr = new Date(now + (thresholdMins + 45) * 60 * 1000).toISOString();

      targetIncident = {
        id: incidentId,
        reportIds: [report.id],
        locationName: report.address,
        latitude: report.latitude,
        longitude: report.longitude,
        category: report.category,
        description: report.description,
        reportCount: 1,
        estimatedAffectedConsumers: reportInput.estimatedConsumers || 35,
        severity: report.severity,
        criticalServiceImpact: Boolean(report.criticalFacilityNearby),
        criticalFacilities: report.criticalFacilityNearby ? [report.criticalFacilityNearby] : [],
        safetyHazard: Boolean(report.safetyHazard),
        hazardDetails: report.safetyHazard || null,
        status: 'Reported',
        recommendedPriority: prioIntel.priority,
        priorityScore: prioIntel.score,
        priorityReasons: prioIntel.reasons,
        assignedPriority: prioIntel.priority,
        priorityOverridden: false,
        priorityOverrideReason: null,
        assignedTeamId: null,
        assignedTeamName: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        reportedAt: nowIso,
        slaDeadline,
        estimatedRestorationAt: etr,
        resolvedAt: null,
        isOverdue: false,
        isEscalated: false,
        escalationIds: [],
        isSimulated: true,
        progressNotes: [
          {
            timestamp: nowIso,
            author: 'GridGuard Sentinel Engine',
            note: `Incident automatically opened from consumer report #${report.reportNumber}. Initial priority calculated: ${prioIntel.priority} (${prioIntel.score}/100).`
          }
        ],
        activityLog: [
          { timestamp: nowIso, action: `Incident initialized from consumer report #${report.reportNumber}` }
        ]
      };

      store.incidents.unshift(targetIncident);
    }

    store.reports.unshift(report);
    saveStore(store);

    // Run SLA check
    checkSLAStatusAndEscalate(store);

    return {
      report,
      incident: targetIncident,
      isNewIncident,
      groupingResult
    };
  },

  // Update Status Workflow
  updateIncidentStatus(incidentId, newStatus, author = 'Operator Vance', note = '') {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    if (!inc) return false;

    const oldStatus = inc.status;
    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    inc.status = newStatus;
    inc.updatedAt = nowIso;

    if (newStatus === 'Restored' || newStatus === 'Closed') {
      inc.resolvedAt = nowIso;
      inc.isOverdue = false;
      // Free assigned team
      if (inc.assignedTeamId) {
        const team = store.teams.find(t => t.id === inc.assignedTeamId);
        if (team) {
          team.status = 'Available';
          team.assignedIncidentId = null;
        }
      }
    }

    // Synchronize to consumer reports
    store.reports.forEach(rep => {
      if (rep.incidentId === inc.id) {
        rep.status = newStatus;
      }
    });

    if (note) {
      inc.progressNotes.push({
        timestamp: nowIso,
        author,
        note
      });
    }

    inc.activityLog.push({
      timestamp: nowIso,
      action: `Status transitioned from ${oldStatus} to ${newStatus} by ${author}.`
    });

    saveStore(store);
    return true;
  },

  // Assign Field Team
  assignTeam(incidentId, teamId, author = 'Operator Vance', note = '') {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    const team = store.teams.find(t => t.id === teamId);
    if (!inc || !team) return false;

    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    inc.assignedTeamId = team.id;
    inc.assignedTeamName = team.name;
    team.status = 'Busy';
    team.assignedIncidentId = inc.id;

    if (inc.status === 'Reported' || inc.status === 'Verified') {
      inc.status = 'Assigned';
    }
    inc.updatedAt = nowIso;

    // Sync reports
    store.reports.forEach(rep => {
      if (rep.incidentId === inc.id && (rep.status === 'Reported' || rep.status === 'Verified')) {
        rep.status = 'Assigned';
      }
    });

    inc.progressNotes.push({
      timestamp: nowIso,
      author,
      note: note || `Assigned field crew '${team.name}' (Leader: ${team.leader}, Contact: ${team.contact}).`
    });

    inc.activityLog.push({
      timestamp: nowIso,
      action: `Assigned to ${team.name}. Status updated to Assigned.`
    });

    saveStore(store);
    return true;
  },

  // Override Priority with Audit Trail
  overridePriority(incidentId, newPriority, reason, author = 'Operator Vance') {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    if (!inc) return false;

    const oldPriority = inc.assignedPriority;
    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    inc.assignedPriority = newPriority;
    inc.priorityOverridden = true;
    inc.priorityOverrideReason = reason;
    inc.updatedAt = nowIso;

    // Recalculate SLA deadline based on new priority
    const slaMap = { critical: 15, high: 30, medium: 60, low: 120 };
    const thresholdMins = slaMap[newPriority.toLowerCase()] || 60;
    const reportedTime = new Date(inc.reportedAt || inc.createdAt).getTime();
    inc.slaDeadline = new Date(reportedTime + thresholdMins * 60 * 1000).toISOString();

    inc.progressNotes.push({
      timestamp: nowIso,
      author,
      note: `OPERATOR PRIORITY OVERRIDE: Shifted priority from ${oldPriority} to ${newPriority}. Reason: ${reason}`
    });

    inc.activityLog.push({
      timestamp: nowIso,
      action: `Operator overridden priority to ${newPriority} (Reason: ${reason})`
    });

    saveStore(store);
    checkSLAStatusAndEscalate(store);
    return true;
  },

  // Update Estimated Restoration Time (ETR)
  updateETR(incidentId, newEtrIso, author = 'Operator Vance', note = '') {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    if (!inc) return false;

    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    inc.estimatedRestorationAt = newEtrIso;
    inc.updatedAt = nowIso;

    inc.progressNotes.push({
      timestamp: nowIso,
      author,
      note: `Estimated restoration time updated to ${new Date(newEtrIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${note}`
    });

    inc.activityLog.push({
      timestamp: nowIso,
      action: `Estimated restoration time updated to ${new Date(newEtrIso).toLocaleTimeString()}`
    });

    saveStore(store);
    return true;
  },

  // Add Progress Note
  addNote(incidentId, author, note) {
    const store = loadStore();
    const inc = store.incidents.find(i => i.id === incidentId);
    if (!inc || !note) return false;

    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    inc.progressNotes.push({
      timestamp: new Date(now).toISOString(),
      author,
      note
    });
    inc.updatedAt = new Date(now).toISOString();

    saveStore(store);
    return true;
  },

  // Supervisor Acknowledge Escalation
  acknowledgeEscalation(escalationId, officialName = 'Dr. K. G. Radhakrishnan (Deputy Chief Engineer)', directives = '') {
    const store = loadStore();
    const esc = store.escalations.find(e => e.id === escalationId);
    if (!esc) return false;

    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    esc.status = 'Acknowledged';
    esc.acknowledgedBy = officialName;
    esc.acknowledgedAt = nowIso;
    esc.followUpAction = directives;
    esc.auditTrail.push({
      timestamp: nowIso,
      event: `Escalation Acknowledged with directives: "${directives}"`,
      actor: officialName
    });

    const inc = store.incidents.find(i => i.id === esc.incidentId);
    if (inc) {
      inc.progressNotes.push({
        timestamp: nowIso,
        author: officialName,
        note: `SUPERVISOR DIRECTIVE: ${directives}`
      });
      inc.activityLog.push({
        timestamp: nowIso,
        action: `Supervisor acknowledged escalation. Directives issued.`
      });
    }

    saveStore(store);
    return true;
  },

  // Supervisor Resolve Escalation
  resolveEscalation(escalationId, officialName = 'Dr. K. G. Radhakrishnan', resolutionNotes = '') {
    const store = loadStore();
    const esc = store.escalations.find(e => e.id === escalationId);
    if (!esc) return false;

    const now = Date.now() + ((store.simulatedClockOffsetMinutes || 0) * 60 * 1000);
    const nowIso = new Date(now).toISOString();

    esc.status = 'Resolved';
    esc.resolutionNotes = resolutionNotes;
    esc.resolvedAt = nowIso;
    esc.auditTrail.push({
      timestamp: nowIso,
      event: `Escalation Closed by Supervisor: "${resolutionNotes}"`,
      actor: officialName
    });

    saveStore(store);
    return true;
  },

  // Update SLA Configuration
  updateSLAThreshold(priority, newThresholdMinutes) {
    const store = loadStore();
    const cfg = (store.slaConfigs || INITIAL_SLA_CONFIGS).find(c => c.priority.toLowerCase() === priority.toLowerCase());
    if (cfg) {
      cfg.thresholdMinutes = Number(newThresholdMinutes);
      saveStore(store);
      checkSLAStatusAndEscalate(store);
      return true;
    }
    return false;
  },

  // Demo Controls: Advance Simulated Clock
  advanceSimulatedClock(minutesToAdd = 15) {
    const store = loadStore();
    store.simulatedClockOffsetMinutes = (store.simulatedClockOffsetMinutes || 0) + minutesToAdd;
    saveStore(store);
    // Immediately evaluate SLA breaches with advanced time!
    return checkSLAStatusAndEscalate(store);
  },

  // Demo Controls: Reset to pristine seed
  resetDemoSeed() {
    const initial = getInitialSeedData();
    saveStore(initial);
    return initial;
  },

  // Demo Controls: Trigger SLA Check Now
  triggerSLACheckNow() {
    return checkSLAStatusAndEscalate();
  }
};
