// Kerala, India - Realistic Demonstration Seed Data for GridGuard
// Center: Kochi / Ernakulam Metropolitan Area (9.9816° N, 76.2999° E)
// Clearly identified as simulated demonstration data.

export const KERALA_CENTER = {
  lat: 9.9816,
  lng: 76.2999,
  zoom: 12,
  regionName: "Kochi & Ernakulam District, Kerala",
};

export const INITIAL_FIELD_TEAMS = [
  {
    id: "TEAM-KSEB-01",
    name: "Alpha 110kV Substation Squad",
    contact: "+91 94460 01101",
    leader: "Er. K. V. Ramesh (Asst. Exec. Engineer)",
    specialization: "High Voltage Transmission & Substation Breakers",
    status: "Busy",
    assignedIncidentId: "GG-KL-1001",
    vehicleNumber: "KL-07-CD-4012",
    baseStation: "Kalamassery 220kV Substation",
    currentLocation: { lat: 10.0468, lng: 76.3218 }
  },
  {
    id: "TEAM-KSEB-02",
    name: "Feeder Rapid Response Unit 02",
    contact: "+91 94460 01102",
    leader: "Lineman Biju Thomas",
    specialization: "11kV Feeder Lines & Overhead Distribution",
    status: "Busy",
    assignedIncidentId: "GG-KL-1002",
    vehicleNumber: "KL-07-BQ-8819",
    baseStation: "Kakkanad Electrical Major Section",
    currentLocation: { lat: 10.0104, lng: 76.3624 }
  },
  {
    id: "TEAM-KSEB-03",
    name: "Coastal & Heritage Emergency Gang",
    contact: "+91 94460 01103",
    leader: "Sr. Tech Suresh Kumar",
    specialization: "Hazard Clearing, Transformer Oil & Salt Corrosion",
    status: "Available",
    assignedIncidentId: null,
    vehicleNumber: "KL-07-ET-1920",
    baseStation: "Fort Kochi Section Office",
    currentLocation: { lat: 9.9658, lng: 76.2421 }
  },
  {
    id: "TEAM-KSEB-04",
    name: "Metro Underground Cable Patrol",
    contact: "+91 94460 01104",
    leader: "Er. Priya Nair",
    specialization: "Underground HT Cable Fault Locating & Splicing",
    status: "Available",
    assignedIncidentId: null,
    vehicleNumber: "KL-07-AW-5501",
    baseStation: "Ernakulam North Section",
    currentLocation: { lat: 9.9850, lng: 76.2880 }
  }
];

export const INITIAL_SLA_CONFIGS = [
  { priority: "Critical", thresholdMinutes: 15, label: "Critical Priority SLA" },
  { priority: "High", thresholdMinutes: 30, label: "High Priority SLA" },
  { priority: "Medium", thresholdMinutes: 60, label: "Medium Priority SLA" },
  { priority: "Low", thresholdMinutes: 120, label: "Low Priority SLA" },
];

export function getInitialSeedData() {
  const now = Date.now();
  const minute = 60 * 1000;

  // Initial Incidents
  const incidents = [
    {
      id: "GG-KL-1001",
      reportIds: ["REP-001", "REP-002", "REP-003"],
      locationName: "Govt. Medical College Road, Kalamassery, Kochi",
      latitude: 10.0468,
      longitude: 76.3218,
      category: "Damaged electrical infrastructure",
      description: "33kV feeder insulator flashover near Medical College gate. Neonatal ICU and oxygen generation plant operating on auxiliary diesel generator backup.",
      reportCount: 3,
      estimatedAffectedConsumers: 340,
      severity: "Critical",
      criticalServiceImpact: true,
      criticalFacilities: ["Govt. Medical College Hospital", "Neonatal ICU", "Oxygen Plant"],
      safetyHazard: true,
      hazardDetails: "Smoking transformer bushing with oil leakage onto concrete base",
      status: "Repair in Progress",
      recommendedPriority: "Critical",
      priorityScore: 95,
      priorityReasons: [
        "Reported severity is 'Critical' (+30 pts)",
        "Critical facility impacted: Govt. Medical College Hospital & Neonatal ICU (+20 pts)",
        "Safety hazard: Active smoking electrical equipment (+25 pts)",
        "Estimated 340 consumers affected (+20 pts)"
      ],
      assignedPriority: "Critical",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: "TEAM-KSEB-01",
      assignedTeamName: "Alpha 110kV Substation Squad",
      createdAt: new Date(now - 45 * minute).toISOString(),
      updatedAt: new Date(now - 10 * minute).toISOString(),
      reportedAt: new Date(now - 45 * minute).toISOString(),
      slaDeadline: new Date(now - 30 * minute).toISOString(), // Breached by 30 mins!
      estimatedRestorationAt: new Date(now + 25 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: true,
      isEscalated: true,
      escalationIds: ["ESC-001"],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 40 * minute).toISOString(),
          author: "Operator Vance (KSEB Control Room)",
          note: "Incident established. Verified emergency status with Hospital Chief Security Officer."
        },
        {
          timestamp: new Date(now - 35 * minute).toISOString(),
          author: "Operator Vance",
          note: "Dispatched Alpha 110kV Substation Squad with replacement polymer bushing kit."
        },
        {
          timestamp: new Date(now - 15 * minute).toISOString(),
          author: "Er. K. V. Ramesh (Alpha Lead)",
          note: "Arrived on-site. Feeder line isolated and earthed. Replacement in progress."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 45 * minute).toISOString(), action: "Incident created via 3 grouped consumer reports" },
        { timestamp: new Date(now - 45 * minute).toISOString(), action: "Explainable Priority Intelligence scored incident: 95/100 (Critical)" },
        { timestamp: new Date(now - 35 * minute).toISOString(), action: "Assigned to Alpha 110kV Substation Squad" },
        { timestamp: new Date(now - 30 * minute).toISOString(), action: "SLA Deadline reached (15 mins exceeded). Automated escalation triggered." }
      ]
    },
    {
      id: "GG-KL-1002",
      reportIds: ["REP-004", "REP-005", "REP-006", "REP-007"],
      locationName: "InfoPark Expressway, Phase 2, Kakkanad",
      latitude: 10.0104,
      longitude: 76.3624,
      category: "Frequent power fluctuations",
      description: "Severe voltage hunting and phase imbalance between 140V and 260V. IT campuses and data server racks shifting continuously to UPS batteries.",
      reportCount: 4,
      estimatedAffectedConsumers: 520,
      severity: "High",
      criticalServiceImpact: false,
      criticalFacilities: ["InfoPark IT Campuses", "Fintech Data Hub"],
      safetyHazard: false,
      hazardDetails: null,
      status: "Assigned",
      recommendedPriority: "High",
      priorityScore: 72,
      priorityReasons: [
        "Reported severity is 'High' (+22 pts)",
        "High consumer cluster: 520 estimated consumers (+25 pts)",
        "Frequent voltage fluctuations affecting sensitive commercial infrastructure (+15 pts)",
        "Repeated incident in Kakkanad IT corridor (+10 pts)"
      ],
      assignedPriority: "High",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: "TEAM-KSEB-02",
      assignedTeamName: "Feeder Rapid Response Unit 02",
      createdAt: new Date(now - 22 * minute).toISOString(),
      updatedAt: new Date(now - 8 * minute).toISOString(),
      reportedAt: new Date(now - 22 * minute).toISOString(),
      slaDeadline: new Date(now + 8 * minute).toISOString(), // Approaching deadline
      estimatedRestorationAt: new Date(now + 40 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: false,
      isEscalated: false,
      escalationIds: [],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 15 * minute).toISOString(),
          author: "Operator Vance",
          note: "Feeder Unit 02 dispatched to inspect Kakkanad 11kV RMU tap changer."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 22 * minute).toISOString(), action: "Incident created via 4 consumer reports" },
        { timestamp: new Date(now - 15 * minute).toISOString(), action: "Assigned to Feeder Rapid Response Unit 02" }
      ]
    },
    {
      id: "GG-KL-1003",
      reportIds: ["REP-008", "REP-009", "REP-010"],
      locationName: "MG Road Commercial Corridor & Metro Station, Ernakulam",
      latitude: 9.9723,
      longitude: 76.2842,
      category: "Complete outage",
      description: "Complete blackout along MG Road stretch between Shenoys junction and Maharajas Metro. Commercial shops and traffic signals completely unpowered.",
      reportCount: 3,
      estimatedAffectedConsumers: 280,
      severity: "High",
      criticalServiceImpact: true,
      criticalFacilities: ["Kochi Metro Station Entrance", "Traffic Signals"],
      safetyHazard: true,
      hazardDetails: "Traffic signal blackout causing major gridlock at Shenoys junction",
      status: "Verified",
      recommendedPriority: "High",
      priorityScore: 78,
      priorityReasons: [
        "Reported severity is 'High' (+22 pts)",
        "Critical traffic signals down creating pedestrian hazard (+20 pts)",
        "Complete blackout in central business district (+20 pts)",
        "Duration exceeding 70 mins (+16 pts)"
      ],
      assignedPriority: "High",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: null,
      assignedTeamName: null,
      createdAt: new Date(now - 75 * minute).toISOString(),
      updatedAt: new Date(now - 25 * minute).toISOString(),
      reportedAt: new Date(now - 75 * minute).toISOString(),
      slaDeadline: new Date(now - 45 * minute).toISOString(), // Breached by 45 mins! Overdue!
      estimatedRestorationAt: new Date(now + 60 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: true,
      isEscalated: true,
      escalationIds: ["ESC-002"],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 50 * minute).toISOString(),
          author: "Operator Vance",
          note: "Verified fault on 11kV feeder 3. Awaiting available field team for dispatch."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 75 * minute).toISOString(), action: "Incident reported" },
        { timestamp: new Date(now - 45 * minute).toISOString(), action: "SLA Breach (Threshold 30m exceeded by 45m). Escalated to Higher Officials." }
      ]
    },
    {
      id: "GG-KL-1004",
      reportIds: ["REP-011", "REP-012"],
      locationName: "Fort Kochi Heritage Pier & Bastion Street",
      latitude: 9.9658,
      longitude: 76.2421,
      category: "Damaged electrical infrastructure",
      description: "Coconut tree frond snapped during gusty coastal winds and dragged down low-tension ABC conductor across Bastion street.",
      reportCount: 2,
      estimatedAffectedConsumers: 75,
      severity: "Medium",
      criticalServiceImpact: false,
      criticalFacilities: [],
      safetyHazard: true,
      hazardDetails: "Snapped low-tension cable resting on metal compound wall",
      status: "Reported",
      recommendedPriority: "Medium",
      priorityScore: 48,
      priorityReasons: [
        "Reported severity is 'Medium' (+14 pts)",
        "Safety hazard reported: live cable touching compound wall (+25 pts)",
        "Localized outage affecting 75 consumers (+9 pts)"
      ],
      assignedPriority: "Medium",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: null,
      assignedTeamName: null,
      createdAt: new Date(now - 18 * minute).toISOString(),
      updatedAt: new Date(now - 18 * minute).toISOString(),
      reportedAt: new Date(now - 18 * minute).toISOString(),
      slaDeadline: new Date(now + 42 * minute).toISOString(),
      estimatedRestorationAt: new Date(now + 90 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: false,
      isEscalated: false,
      escalationIds: [],
      isSimulated: true,
      progressNotes: [],
      activityLog: [
        { timestamp: new Date(now - 18 * minute).toISOString(), action: "Incident reported by 2 local residents" }
      ]
    },
    {
      id: "GG-KL-1005",
      reportIds: ["REP-013"],
      locationName: "Vyttila Mobility Hub West Terminal",
      latitude: 9.9678,
      longitude: 76.3190,
      category: "Voltage fluctuation",
      description: "Low line voltage causing bus ticket vending kiosks and LED passenger display boards to reset.",
      reportCount: 1,
      estimatedAffectedConsumers: 110,
      severity: "Low",
      criticalServiceImpact: false,
      criticalFacilities: ["Bus Terminal Ticketing"],
      safetyHazard: false,
      hazardDetails: null,
      status: "Reported",
      recommendedPriority: "Low",
      priorityScore: 24,
      priorityReasons: [
        "Reported severity is 'Low' (+6 pts)",
        "Single report (+6 pts)",
        "Voltage drop without structural damage (+12 pts)"
      ],
      assignedPriority: "Low",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: null,
      assignedTeamName: null,
      createdAt: new Date(now - 12 * minute).toISOString(),
      updatedAt: new Date(now - 12 * minute).toISOString(),
      reportedAt: new Date(now - 12 * minute).toISOString(),
      slaDeadline: new Date(now + 108 * minute).toISOString(),
      estimatedRestorationAt: new Date(now + 120 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: false,
      isEscalated: false,
      escalationIds: [],
      isSimulated: true,
      progressNotes: [],
      activityLog: [
        { timestamp: new Date(now - 12 * minute).toISOString(), action: "Incident reported by terminal supervisor" }
      ]
    },
    {
      id: "GG-KL-1006",
      reportIds: ["REP-014", "REP-015"],
      locationName: "Aluva Railway Station Substation Enclave",
      latitude: 10.1076,
      longitude: 76.3516,
      category: "Complete outage",
      description: "Underground feed to railway yard auxiliary lighting severed during storm drain culvert dredging.",
      reportCount: 2,
      estimatedAffectedConsumers: 190,
      severity: "High",
      criticalServiceImpact: true,
      criticalFacilities: ["Railway Passenger Reservation Center"],
      safetyHazard: false,
      hazardDetails: null,
      status: "Assigned",
      recommendedPriority: "High",
      priorityScore: 68,
      priorityReasons: [
        "Severity 'High' (+22 pts)",
        "Railway reservation facility impacted (+20 pts)",
        "Complete power loss to sector (+20 pts)",
        "Elapsed duration (+6 pts)"
      ],
      assignedPriority: "High",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: "TEAM-KSEB-04",
      assignedTeamName: "Metro Underground Cable Patrol",
      createdAt: new Date(now - 55 * minute).toISOString(),
      updatedAt: new Date(now - 15 * minute).toISOString(),
      reportedAt: new Date(now - 55 * minute).toISOString(),
      slaDeadline: new Date(now - 25 * minute).toISOString(), // Breached!
      estimatedRestorationAt: new Date(now + 45 * minute).toISOString(),
      resolvedAt: null,
      isOverdue: true,
      isEscalated: true,
      escalationIds: ["ESC-003"],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 20 * minute).toISOString(),
          author: "Operator Vance",
          note: "Assigned Metro Underground Cable Patrol with cable fault locator van."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 55 * minute).toISOString(), action: "Incident reported" },
        { timestamp: new Date(now - 25 * minute).toISOString(), action: "SLA threshold exceeded (30 mins). Auto-escalation recorded." }
      ]
    },
    {
      id: "GG-KL-1007",
      reportIds: ["REP-016", "REP-017"],
      locationName: "Palarivattom Residential Bypass, Pipeline Road",
      latitude: 10.0031,
      longitude: 76.3075,
      category: "Complete outage",
      description: "Transformer fuse barrel opened due to localized lightning surge. Restored successfully by field crew.",
      reportCount: 2,
      estimatedAffectedConsumers: 140,
      severity: "Medium",
      criticalServiceImpact: false,
      criticalFacilities: [],
      safetyHazard: false,
      hazardDetails: null,
      status: "Restored",
      recommendedPriority: "Medium",
      priorityScore: 42,
      priorityReasons: ["Medium severity outage resolved within normal operating SLA."],
      assignedPriority: "Medium",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: "TEAM-KSEB-03",
      assignedTeamName: "Coastal & Heritage Emergency Gang",
      createdAt: new Date(now - 180 * minute).toISOString(),
      updatedAt: new Date(now - 60 * minute).toISOString(),
      reportedAt: new Date(now - 180 * minute).toISOString(),
      slaDeadline: new Date(now - 120 * minute).toISOString(),
      estimatedRestorationAt: new Date(now - 60 * minute).toISOString(),
      resolvedAt: new Date(now - 60 * minute).toISOString(), // Restored 60m ago
      isOverdue: false,
      isEscalated: false,
      escalationIds: [],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 60 * minute).toISOString(),
          author: "Sr. Tech Suresh Kumar",
          note: "Replaced blown 11kV fuse element and energized feeder. Voltages nominal across all 3 phases."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 180 * minute).toISOString(), action: "Incident reported" },
        { timestamp: new Date(now - 60 * minute).toISOString(), action: "Restoration verified and completed by Team 03" }
      ]
    },
    {
      id: "GG-KL-1008",
      reportIds: ["REP-018"],
      locationName: "Marine Drive Walkway & High Court Ferry",
      latitude: 9.9816,
      longitude: 76.2750,
      category: "Partial outage",
      description: "Ferry boarding gate floodlights out due to rusted junction box. Boarding operations unaffected.",
      reportCount: 1,
      estimatedAffectedConsumers: 20,
      severity: "Low",
      criticalServiceImpact: false,
      criticalFacilities: [],
      safetyHazard: false,
      hazardDetails: null,
      status: "Closed",
      recommendedPriority: "Low",
      priorityScore: 18,
      priorityReasons: ["Low impact single circuit fault."],
      assignedPriority: "Low",
      priorityOverridden: false,
      priorityOverrideReason: null,
      assignedTeamId: null,
      assignedTeamName: null,
      createdAt: new Date(now - 300 * minute).toISOString(),
      updatedAt: new Date(now - 180 * minute).toISOString(),
      reportedAt: new Date(now - 300 * minute).toISOString(),
      slaDeadline: new Date(now - 180 * minute).toISOString(),
      estimatedRestorationAt: new Date(now - 180 * minute).toISOString(),
      resolvedAt: new Date(now - 180 * minute).toISOString(),
      isOverdue: false,
      isEscalated: false,
      escalationIds: [],
      isSimulated: true,
      progressNotes: [
        {
          timestamp: new Date(now - 180 * minute).toISOString(),
          author: "Operator Vance",
          note: "Port electrical staff replaced circuit breaker. Closed."
        }
      ],
      activityLog: [
        { timestamp: new Date(now - 300 * minute).toISOString(), action: "Reported" },
        { timestamp: new Date(now - 180 * minute).toISOString(), action: "Closed after verification" }
      ]
    }
  ];

  // Consumer Reports
  const reports = [
    {
      id: "REP-001",
      reportNumber: "REP-KL-501",
      incidentId: "GG-KL-1001",
      consumerName: "Dr. Mathew Joseph",
      consumerPhone: "+91 98470 12345",
      address: "Govt. Medical College Campus, Kalamassery",
      latitude: 10.0468,
      longitude: 76.3218,
      category: "Damaged electrical infrastructure",
      severity: "Critical",
      description: "Severe sparks from 33kV substation feeder bushing. Hospital main power disconnected.",
      criticalFacilityNearby: "Govt. Medical College Hospital",
      safetyHazard: "Active smoke from transformer base",
      status: "Repair in Progress",
      createdAt: new Date(now - 45 * minute).toISOString()
    },
    {
      id: "REP-002",
      reportNumber: "REP-KL-502",
      incidentId: "GG-KL-1001",
      consumerName: "Nurse Suja K.",
      consumerPhone: "+91 98470 23456",
      address: "Neonatal Care Wing, Medical College, Kalamassery",
      latitude: 10.0470,
      longitude: 76.3220,
      category: "Complete outage",
      severity: "Critical",
      description: "Neonatal ICU shifted to generator supply. Please expedite restoration.",
      criticalFacilityNearby: "Neonatal ICU",
      safetyHazard: "None inside building",
      status: "Repair in Progress",
      createdAt: new Date(now - 43 * minute).toISOString()
    },
    {
      id: "REP-003",
      reportNumber: "REP-KL-503",
      incidentId: "GG-KL-1001",
      consumerName: "Kalamassery Dialysis Center",
      consumerPhone: "+91 98470 34567",
      address: "HMT Road, Near Medical College, Kalamassery",
      latitude: 10.0465,
      longitude: 76.3215,
      category: "Complete outage",
      severity: "High",
      description: "Dialysis machines running on emergency inverter bank.",
      criticalFacilityNearby: "Dialysis Center",
      safetyHazard: "None",
      status: "Repair in Progress",
      createdAt: new Date(now - 40 * minute).toISOString()
    },
    {
      id: "REP-004",
      reportNumber: "REP-KL-504",
      incidentId: "GG-KL-1002",
      consumerName: "Wipro Campus Facilities",
      consumerPhone: "+91 98470 45678",
      address: "InfoPark Phase 2, Kakkanad",
      latitude: 10.0104,
      longitude: 76.3624,
      category: "Frequent power fluctuations",
      severity: "High",
      description: "Voltage cycling continuously between 140V and 260V. Equipment tripping.",
      criticalFacilityNearby: "Data Center",
      safetyHazard: "Electrical fire risk on unconditioned lines",
      status: "Assigned",
      createdAt: new Date(now - 22 * minute).toISOString()
    },
    {
      id: "REP-005",
      reportNumber: "REP-KL-505",
      incidentId: "GG-KL-1002",
      consumerName: "Anil George",
      consumerPhone: "+91 98470 56789",
      address: "Infopark Expressway, SmartCity Road, Kakkanad",
      latitude: 10.0108,
      longitude: 76.3620,
      category: "Frequent power fluctuations",
      severity: "High",
      description: "Street lights strobing and apartment elevator shutdown.",
      criticalFacilityNearby: "",
      safetyHazard: "Elevator stuck with passenger earlier (rescued)",
      status: "Assigned",
      createdAt: new Date(now - 20 * minute).toISOString()
    },
    {
      id: "REP-006",
      reportNumber: "REP-KL-506",
      incidentId: "GG-KL-1002",
      consumerName: "Tech Hub Cafe",
      consumerPhone: "+91 98470 67890",
      address: "Kakkanad Infopark Gate 1",
      latitude: 10.0101,
      longitude: 76.3628,
      category: "Voltage fluctuation",
      severity: "Medium",
      description: "POS terminals and refrigeration units turning off and on.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Assigned",
      createdAt: new Date(now - 18 * minute).toISOString()
    },
    {
      id: "REP-007",
      reportNumber: "REP-KL-507",
      incidentId: "GG-KL-1002",
      consumerName: "Preetha Varma",
      consumerPhone: "+91 98470 78901",
      address: "Edachira Road, Near Infopark, Kakkanad",
      latitude: 10.0099,
      longitude: 76.3630,
      category: "Frequent power fluctuations",
      severity: "Medium",
      description: "Ceiling fans humming loudly and lights dimming drastically.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Assigned",
      createdAt: new Date(now - 16 * minute).toISOString()
    },
    {
      id: "REP-008",
      reportNumber: "REP-KL-508",
      incidentId: "GG-KL-1003",
      consumerName: "Shenoys Mall Association",
      consumerPhone: "+91 98470 89012",
      address: "MG Road, Shenoys Junction, Ernakulam",
      latitude: 9.9723,
      longitude: 76.2842,
      category: "Complete outage",
      severity: "High",
      description: "Total power cutoff across entire block. Backup generators struggling.",
      criticalFacilityNearby: "Kochi Metro Corridor",
      safetyHazard: "Traffic signals dark at major intersection",
      status: "Verified",
      createdAt: new Date(now - 75 * minute).toISOString()
    },
    {
      id: "REP-009",
      reportNumber: "REP-KL-509",
      incidentId: "GG-KL-1003",
      consumerName: "Metro Pharmacy",
      consumerPhone: "+91 98470 90123",
      address: "Opposite Maharajas Ground, MG Road, Ernakulam",
      latitude: 9.9725,
      longitude: 76.2840,
      category: "Complete outage",
      severity: "High",
      description: "Power cut has lasted over 1 hour. Vaccine cold storage temperature rising.",
      criticalFacilityNearby: "Pharmacy cold chain",
      safetyHazard: "None",
      status: "Verified",
      createdAt: new Date(now - 70 * minute).toISOString()
    },
    {
      id: "REP-010",
      reportNumber: "REP-KL-510",
      incidentId: "GG-KL-1003",
      consumerName: "Kochi Traffic Police Cell",
      consumerPhone: "+91 98470 01234",
      address: "MG Road & Jos Junction, Ernakulam",
      latitude: 9.9720,
      longitude: 76.2845,
      category: "Complete outage",
      severity: "High",
      description: "Signal controllers at Jos Junction dead. Manual traffic regulation underway.",
      criticalFacilityNearby: "Traffic Junction",
      safetyHazard: "Congested crossroads risk",
      status: "Verified",
      createdAt: new Date(now - 65 * minute).toISOString()
    },
    {
      id: "REP-011",
      reportNumber: "REP-KL-511",
      incidentId: "GG-KL-1004",
      consumerName: "Father Francis",
      consumerPhone: "+91 98470 11223",
      address: "Bastion Street, Fort Kochi",
      latitude: 9.9658,
      longitude: 76.2421,
      category: "Damaged electrical infrastructure",
      severity: "Medium",
      description: "Heavy palm branch fell on overhead distribution wire and broke it.",
      criticalFacilityNearby: "",
      safetyHazard: "Live cable dangling near metal gate",
      status: "Reported",
      createdAt: new Date(now - 18 * minute).toISOString()
    },
    {
      id: "REP-012",
      reportNumber: "REP-KL-512",
      incidentId: "GG-KL-1004",
      consumerName: "Kochi Homestay Owners Group",
      consumerPhone: "+91 98470 22334",
      address: "Princess Street, Fort Kochi",
      latitude: 9.9660,
      longitude: 76.2425,
      category: "Complete outage",
      severity: "Medium",
      description: "Power went out right after palm tree struck cable on Bastion street.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Reported",
      createdAt: new Date(now - 15 * minute).toISOString()
    },
    {
      id: "REP-013",
      reportNumber: "REP-KL-513",
      incidentId: "GG-KL-1005",
      consumerName: "Vyttila Hub Station Master",
      consumerPhone: "+91 98470 33445",
      address: "Vyttila Mobility Hub, Ernakulam",
      latitude: 9.9678,
      longitude: 76.3190,
      category: "Voltage fluctuation",
      severity: "Low",
      description: "Low voltage causing electronic ticket displays to flicker.",
      criticalFacilityNearby: "Transit Hub",
      safetyHazard: "None",
      status: "Reported",
      createdAt: new Date(now - 12 * minute).toISOString()
    },
    {
      id: "REP-014",
      reportNumber: "REP-KL-514",
      incidentId: "GG-KL-1006",
      consumerName: "Aluva Station Manager",
      consumerPhone: "+91 98470 44556",
      address: "Railway Station Road, Aluva",
      latitude: 10.1076,
      longitude: 76.3516,
      category: "Complete outage",
      severity: "High",
      description: "Contractor excavator ruptured 11kV cable during canal work.",
      criticalFacilityNearby: "Railway Reservation Counter",
      safetyHazard: "Exposed cable trench with potential live conductors",
      status: "Assigned",
      createdAt: new Date(now - 55 * minute).toISOString()
    },
    {
      id: "REP-015",
      reportNumber: "REP-KL-515",
      incidentId: "GG-KL-1006",
      consumerName: "Aluva Merchants Association",
      consumerPhone: "+91 98470 55667",
      address: "Substation Enclave, Aluva",
      latitude: 10.1080,
      longitude: 76.3512,
      category: "Complete outage",
      severity: "Medium",
      description: "Surrounding commercial establishments out of power since culvert dig started.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Assigned",
      createdAt: new Date(now - 50 * minute).toISOString()
    },
    {
      id: "REP-016",
      reportNumber: "REP-KL-516",
      incidentId: "GG-KL-1007",
      consumerName: "Palarivattom Residents Welfare",
      consumerPhone: "+91 98470 66778",
      address: "Pipeline Road, Palarivattom",
      latitude: 10.0031,
      longitude: 76.3075,
      category: "Complete outage",
      severity: "Medium",
      description: "Loud blast from transformer fuse after lightning flash.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Restored",
      createdAt: new Date(now - 180 * minute).toISOString()
    },
    {
      id: "REP-017",
      reportNumber: "REP-KL-517",
      incidentId: "GG-KL-1007",
      consumerName: "Manoj Nambiar",
      consumerPhone: "+91 98470 77889",
      address: "Pipeline Road Cross 4, Palarivattom",
      latitude: 10.0033,
      longitude: 76.3072,
      category: "Complete outage",
      severity: "Medium",
      description: "Entire colony without power.",
      criticalFacilityNearby: "",
      safetyHazard: "None",
      status: "Restored",
      createdAt: new Date(now - 175 * minute).toISOString()
    },
    {
      id: "REP-018",
      reportNumber: "REP-KL-518",
      incidentId: "GG-KL-1008",
      consumerName: "High Court Ferry In-Charge",
      consumerPhone: "+91 98470 88990",
      address: "Marine Drive Walkway, Ernakulam",
      latitude: 9.9816,
      longitude: 76.2750,
      category: "Partial outage",
      severity: "Low",
      description: "Gangway lighting circuit tripping at distribution box.",
      criticalFacilityNearby: "Ferry Terminal",
      safetyHazard: "None",
      status: "Closed",
      createdAt: new Date(now - 300 * minute).toISOString()
    }
  ];

  // Escalations
  const escalations = [
    {
      id: "ESC-001",
      incidentId: "GG-KL-1001",
      incidentNumber: "GG-KL-1001",
      incidentTitle: "Govt. Medical College Road, Kalamassery, Kochi",
      priority: "Critical",
      escalationLevel: 2,
      recipientRole: "Chief Electrical Inspector & District Disaster Management",
      triggerReason: "Critical Priority SLA Breach (>15 min resolution delay at Hospital Sector). Elapsed duration: 45 minutes.",
      thresholdMinutes: 15,
      elapsedMinutes: 45,
      overdueByMinutes: 30,
      status: "Acknowledged", // Pending, Acknowledged, Resolved
      generatedMessage: `Subject: URGENT ACTION REQUIRED — Power Outage Exceeded Critical SLA

Incident ID: GG-KL-1001
Location: Govt. Medical College Road, Kalamassery, Kochi (Lat: 10.0468, Lon: 76.3218)
Priority: CRITICAL (Score: 95/100)
Outage Duration: 45 minutes
Configured SLA Deadline: 15 minutes (Overdue by 30 minutes)
Estimated Affected Consumers: 340 (Simulated estimate)
Critical Facilities Involved: Govt. Medical College Hospital, Neonatal ICU, Oxygen Plant
Current Status: Repair in Progress
Assigned Field Team: Alpha 110kV Substation Squad (Lead: Er. K. V. Ramesh)
Safety Hazard: Active smoking electrical equipment reported on 33kV bushing.

Reason for Escalation:
The configured restoration deadline has been exceeded by 30 minutes. Medical facility generator fuel reserves are running.

Requested Directive:
1. Coordinate directly with Executive Engineer, Kalamassery Substation.
2. Authorize backup mobile transformer deployment if bushing bypass cannot complete within 20 minutes.
3. Ensure continuous generator fuel supply to Neonatal ICU.`,
      messageStatus: "Delivered (In-App)",
      acknowledgedBy: "Dr. K. G. Radhakrishnan (Deputy Chief Engineer, KSEB)",
      acknowledgedAt: new Date(now - 20 * minute).toISOString(),
      followUpAction: "Authorized auxiliary mobile diesel transformer unit from Kalamassery Central Stores. On high-priority alert.",
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 30 * minute).toISOString(),
      auditTrail: [
        {
          timestamp: new Date(now - 30 * minute).toISOString(),
          event: "Automatic SLA Breach Triggered (Elapsed 15m)",
          actor: "GridGuard SLA Sentinel Engine"
        },
        {
          timestamp: new Date(now - 20 * minute).toISOString(),
          event: "Escalation Acknowledged with directives",
          actor: "Deputy Chief Engineer, KSEB"
        }
      ]
    },
    {
      id: "ESC-002",
      incidentId: "GG-KL-1003",
      incidentNumber: "GG-KL-1003",
      incidentTitle: "MG Road Commercial Corridor & Metro Station, Ernakulam",
      priority: "High",
      escalationLevel: 1,
      recipientRole: "Executive Engineer (Ernakulam Central Division)",
      triggerReason: "High Priority SLA Breach (>30 min resolution delay). Elapsed duration: 75 minutes without assigned field crew.",
      thresholdMinutes: 30,
      elapsedMinutes: 75,
      overdueByMinutes: 45,
      status: "Pending", // Pending review by supervisor
      generatedMessage: `Subject: Action Required — Power Outage Exceeded High SLA

Incident ID: GG-KL-1003
Location: MG Road Commercial Corridor & Metro Station, Ernakulam (Lat: 9.9723, Lon: 76.2842)
Priority: HIGH (Score: 78/100)
Outage Duration: 1 hour 15 minutes
Configured SLA Deadline: 30 minutes (Overdue by 45 minutes)
Estimated Affected Consumers: 280 (Simulated estimate)
Critical Facilities Involved: Kochi Metro Station Entrance, Traffic Signals
Current Status: Verified (Unassigned)
Assigned Field Team: Unassigned

Reason for Escalation:
The configured 30-minute restoration threshold has been breached by 45 minutes. Traffic signals at Jos Junction and Shenoys are completely dead, causing major vehicular gridlock in central Kochi.

Requested Directive:
Assign emergency squad immediately or divert Metro Underground Cable Patrol to restore traffic signals.`,
      messageStatus: "Generated & Queued (In-App)",
      acknowledgedBy: null,
      acknowledgedAt: null,
      followUpAction: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 45 * minute).toISOString(),
      auditTrail: [
        {
          timestamp: new Date(now - 45 * minute).toISOString(),
          event: "Automatic SLA Breach Triggered (>30m delay)",
          actor: "GridGuard SLA Sentinel Engine"
        }
      ]
    },
    {
      id: "ESC-003",
      incidentId: "GG-KL-1006",
      incidentNumber: "GG-KL-1006",
      incidentTitle: "Aluva Railway Station Substation Enclave",
      priority: "High",
      escalationLevel: 1,
      recipientRole: "Assistant Executive Engineer (Aluva Section)",
      triggerReason: "High Priority SLA Breach (>30 min delay). Elapsed duration: 55 minutes.",
      thresholdMinutes: 30,
      elapsedMinutes: 55,
      overdueByMinutes: 25,
      status: "Acknowledged",
      generatedMessage: `Subject: Action Required — Power Outage Exceeded High SLA

Incident ID: GG-KL-1006
Location: Aluva Railway Station Substation Enclave (Lat: 10.1076, Lon: 76.3516)
Priority: HIGH (Score: 68/100)
Outage Duration: 55 minutes
Configured SLA Deadline: 30 minutes (Overdue by 25 minutes)
Estimated Affected Consumers: 190 (Simulated estimate)
Critical Facilities Involved: Railway Passenger Reservation Center
Current Status: Assigned
Assigned Field Team: Metro Underground Cable Patrol

Reason for Escalation:
Railway passenger reservation counters operating on auxiliary UPS which is nearing low-battery threshold. Cable trench exposed.

Requested Directive:
Expedite joint inspection with Southern Railway electrical supervisors and provide revised ETR.`,
      messageStatus: "Delivered (In-App)",
      acknowledgedBy: "Er. George Kurian (Asst. Exec. Engineer)",
      acknowledgedAt: new Date(now - 15 * minute).toISOString(),
      followUpAction: "Contacted Railway Electrical Division; temporary overhead bypass cable being strung.",
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 25 * minute).toISOString(),
      auditTrail: [
        {
          timestamp: new Date(now - 25 * minute).toISOString(),
          event: "Automatic SLA Breach Triggered (>30m delay)",
          actor: "GridGuard SLA Sentinel Engine"
        },
        {
          timestamp: new Date(now - 15 * minute).toISOString(),
          event: "Acknowledged by Asst. Exec. Engineer",
          actor: "Er. George Kurian"
        }
      ]
    }
  ];

  return {
    incidents,
    reports,
    escalations,
    teams: INITIAL_FIELD_TEAMS,
    slaConfigs: INITIAL_SLA_CONFIGS,
    simulatedClockOffsetMinutes: 0,
    lastSlaCheckTime: new Date(now).toISOString()
  };
}
