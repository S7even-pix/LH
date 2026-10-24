from datetime import datetime, timedelta
from backend.database import SessionLocal, Base, engine
from backend.models import (
    ConsumerReport, Incident, RepairTeam, StatusHistory,
    Escalation, SupervisorComment, SystemNotification, SLAConfig
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean demo seed
    db.query(SupervisorComment).delete()
    db.query(Escalation).delete()
    db.query(StatusHistory).delete()
    db.query(ConsumerReport).delete()
    db.query(Incident).delete()
    db.query(RepairTeam).delete()
    db.query(SystemNotification).delete()
    db.query(SLAConfig).delete()
    db.commit()

    now = datetime.utcnow()

    # 1. SLA Configurations (Kerala demonstration settings)
    sla_configs = [
        SLAConfig(priority="Critical", threshold_minutes=15, is_active=True),
        SLAConfig(priority="High", threshold_minutes=30, is_active=True),
        SLAConfig(priority="Medium", threshold_minutes=60, is_active=True),
        SLAConfig(priority="Low", threshold_minutes=120, is_active=True),
    ]
    db.add_all(sla_configs)
    db.commit()

    # 2. Repair Teams (4 Kerala KSEB units)
    teams = [
        RepairTeam(
            name="Alpha 110kV Substation Squad",
            contact="+91 94460 01101",
            leader="Er. K. V. Ramesh (Asst. Exec. Engineer)",
            specialization="High Voltage Transmission & Substation Breakers",
            status="Dispatched",
            vehicle_number="KL-07-CD-4012",
            latitude=10.0468,
            longitude=76.3218
        ),
        RepairTeam(
            name="Feeder Rapid Response Unit 02",
            contact="+91 94460 01102",
            leader="Lineman Biju Thomas",
            specialization="11kV Feeder Lines & Overhead Distribution",
            status="Dispatched",
            vehicle_number="KL-07-BQ-8819",
            latitude=10.0104,
            longitude=76.3624
        ),
        RepairTeam(
            name="Coastal & Heritage Emergency Gang",
            contact="+91 94460 01103",
            leader="Sr. Tech Suresh Kumar",
            specialization="Hazard Clearing, Transformer Oil & Salt Corrosion",
            status="Available",
            vehicle_number="KL-07-ET-1920",
            latitude=9.9658,
            longitude=76.2421
        ),
        RepairTeam(
            name="Metro Underground Cable Patrol",
            contact="+91 94460 01104",
            leader="Er. Priya Nair",
            specialization="Underground HT Cable Fault Locating & Splicing",
            status="Available",
            vehicle_number="KL-07-AW-5501",
            latitude=9.9850,
            longitude=76.2880
        ),
    ]
    db.add_all(teams)
    db.commit()
    for t in teams:
        db.refresh(t)

    # 3. Incidents (Kerala benchmark dataset)
    inc1_reported = now - timedelta(minutes=45)
    inc1 = Incident(
        incident_number="GG-KL-1001",
        title="Feeder Insulator Flashover at Govt. Medical College Road",
        description="33kV feeder insulator flashover near Medical College gate. Neonatal ICU and oxygen generation plant operating on auxiliary diesel backup.",
        primary_location="Govt. Medical College Road, Kalamassery, Kochi",
        latitude=10.0468,
        longitude=76.3218,
        category="Damaged electrical infrastructure",
        severity="Critical",
        priority="Critical",
        priority_score=95.0,
        priority_reason="Recommended CRITICAL priority (Score: 95/100) based on explainable rule-based intelligence: Reported severity 'Critical' (+30 pts); Critical facility impacted: Govt. Medical College Hospital & Neonatal ICU (+20 pts); Safety hazard: Active smoking electrical equipment (+25 pts); Estimated 340 consumers affected (+20 pts).",
        status="Repair in Progress",
        affected_consumers_count=340,
        estimated_restoration_time=now + timedelta(minutes=25),
        assigned_team_id=teams[0].id,
        reported_at=inc1_reported,
        sla_deadline=inc1_reported + timedelta(minutes=15),
        is_escalated=True,
        created_at=inc1_reported,
        updated_at=now - timedelta(minutes=5)
    )

    inc2_reported = now - timedelta(minutes=22)
    inc2 = Incident(
        incident_number="GG-KL-1002",
        title="Severe Voltage Hunting on InfoPark Expressway",
        description="Severe voltage hunting and phase imbalance between 140V and 260V. IT campuses and data server racks shifting continuously to UPS batteries.",
        primary_location="InfoPark Expressway, Phase 2, Kakkanad",
        latitude=10.0104,
        longitude=76.3624,
        category="Frequent power fluctuations",
        severity="High",
        priority="High",
        priority_score=72.0,
        priority_reason="Recommended HIGH priority (Score: 72/100) based on explainable rule-based intelligence: Reported severity 'High' (+22 pts); High consumer cluster: 520 estimated consumers (+25 pts); Frequent voltage fluctuations affecting sensitive commercial infrastructure (+15 pts); Repeated incident in Kakkanad IT corridor (+10 pts).",
        status="Team Assigned",
        affected_consumers_count=520,
        estimated_restoration_time=now + timedelta(minutes=40),
        assigned_team_id=teams[1].id,
        reported_at=inc2_reported,
        sla_deadline=inc2_reported + timedelta(minutes=30),
        is_escalated=False,
        created_at=inc2_reported,
        updated_at=now - timedelta(minutes=8)
    )

    inc3_reported = now - timedelta(minutes=75) # Overdue by 45 mins!
    inc3 = Incident(
        incident_number="GG-KL-1003",
        title="Complete Blackout along MG Road Commercial Corridor",
        description="Complete blackout along MG Road stretch between Shenoys junction and Maharajas Metro. Commercial shops and traffic signals completely unpowered.",
        primary_location="MG Road Commercial Corridor & Metro Station, Ernakulam",
        latitude=9.9723,
        longitude=76.2842,
        category="Complete outage",
        severity="High",
        priority="High",
        priority_score=78.0,
        priority_reason="Recommended HIGH priority (Score: 78/100) based on explainable rule-based intelligence: Reported severity 'High' (+22 pts); Critical traffic signals down creating pedestrian hazard (+20 pts); Complete blackout in central business district (+20 pts); Duration exceeding 70 mins (+16 pts).",
        status="Under Review",
        affected_consumers_count=280,
        estimated_restoration_time=now + timedelta(minutes=60),
        assigned_team_id=None,
        reported_at=inc3_reported,
        sla_deadline=inc3_reported + timedelta(minutes=30),
        is_escalated=True,
        created_at=inc3_reported,
        updated_at=now - timedelta(minutes=25)
    )

    inc4_reported = now - timedelta(minutes=18)
    inc4 = Incident(
        incident_number="GG-KL-1004",
        title="Snapped Low-Tension Conductor on Bastion Street",
        description="Coconut tree frond snapped during gusty coastal winds and dragged down low-tension ABC conductor across Bastion street.",
        primary_location="Fort Kochi Heritage Pier & Bastion Street",
        latitude=9.9658,
        longitude=76.2421,
        category="Damaged electrical infrastructure",
        severity="Medium",
        priority="Medium",
        priority_score=48.0,
        priority_reason="Recommended MEDIUM priority (Score: 48/100): Safety hazard reported: live cable touching compound wall (+25 pts); Localized outage affecting 75 consumers (+9 pts).",
        status="Reported",
        affected_consumers_count=75,
        estimated_restoration_time=now + timedelta(minutes=90),
        assigned_team_id=None,
        reported_at=inc4_reported,
        sla_deadline=inc4_reported + timedelta(minutes=60),
        is_escalated=False,
        created_at=inc4_reported,
        updated_at=inc4_reported
    )

    inc5_reported = now - timedelta(minutes=55) # Overdue!
    inc5 = Incident(
        incident_number="GG-KL-1006",
        title="Cable Rupture at Aluva Railway Substation Enclave",
        description="Underground feed to railway yard auxiliary lighting severed during storm drain culvert dredging.",
        primary_location="Aluva Railway Station Substation Enclave",
        latitude=10.1076,
        longitude=76.3516,
        category="Complete outage",
        severity="High",
        priority="High",
        priority_score=68.0,
        priority_reason="Recommended HIGH priority: Railway reservation facility impacted (+20 pts); Complete power loss to sector (+20 pts).",
        status="Team Assigned",
        affected_consumers_count=190,
        estimated_restoration_time=now + timedelta(minutes=45),
        assigned_team_id=teams[3].id,
        reported_at=inc5_reported,
        sla_deadline=inc5_reported + timedelta(minutes=30),
        is_escalated=True,
        created_at=inc5_reported,
        updated_at=now - timedelta(minutes=15)
    )

    inc6_reported = now - timedelta(hours=3)
    inc6_resolved = now - timedelta(hours=1)
    inc6 = Incident(
        incident_number="GG-KL-1007",
        title="Transformer Fuse Element Blown at Palarivattom Bypass",
        description="Transformer fuse barrel opened due to localized lightning surge. Restored successfully by field crew.",
        primary_location="Palarivattom Residential Bypass, Pipeline Road",
        latitude=10.0031,
        longitude=76.3075,
        category="Complete outage",
        severity="Medium",
        priority="Medium",
        priority_score=42.0,
        priority_reason="Recommended MEDIUM priority: Normal residential fault resolved within operating SLA window.",
        status="Resolved",
        affected_consumers_count=140,
        estimated_restoration_time=inc6_resolved,
        assigned_team_id=teams[2].id,
        reported_at=inc6_reported,
        resolved_at=inc6_resolved,
        sla_deadline=inc6_reported + timedelta(minutes=60),
        is_escalated=False,
        created_at=inc6_reported,
        updated_at=inc6_resolved
    )

    incidents = [inc1, inc2, inc3, inc4, inc5, inc6]
    db.add_all(incidents)
    db.commit()
    for inc in incidents:
        db.refresh(inc)

    # 4. Consumer Reports
    rep1 = ConsumerReport(
        report_number="REP-KL-501",
        consumer_name="Dr. Mathew Joseph",
        consumer_phone="+91 98470 12345",
        address="Govt. Medical College Campus, Kalamassery",
        latitude=10.0468,
        longitude=76.3218,
        category="Damaged electrical infrastructure",
        severity="Critical",
        description="Severe sparks from 33kV substation feeder bushing. Hospital main power disconnected.",
        is_critical_facility_flag=True,
        status=inc1.status,
        incident_id=inc1.id,
        created_at=inc1_reported
    )
    rep2 = ConsumerReport(
        report_number="REP-KL-502",
        consumer_name="Nurse Suja K.",
        consumer_phone="+91 98470 23456",
        address="Neonatal Care Wing, Medical College, Kalamassery",
        latitude=10.0470,
        longitude=76.3220,
        category="Complete outage",
        severity="Critical",
        description="Neonatal ICU shifted to generator supply. Please expedite restoration.",
        is_critical_facility_flag=True,
        status=inc1.status,
        incident_id=inc1.id,
        created_at=inc1_reported + timedelta(minutes=2)
    )
    rep3 = ConsumerReport(
        report_number="REP-KL-504",
        consumer_name="Wipro Campus Facilities",
        consumer_phone="+91 98470 45678",
        address="InfoPark Phase 2, Kakkanad",
        latitude=10.0104,
        longitude=76.3624,
        category="Frequent power fluctuations",
        severity="High",
        description="Voltage cycling continuously between 140V and 260V. Equipment tripping.",
        is_critical_facility_flag=False,
        status=inc2.status,
        incident_id=inc2.id,
        created_at=inc2_reported
    )
    rep4 = ConsumerReport(
        report_number="REP-KL-508",
        consumer_name="Shenoys Mall Association",
        consumer_phone="+91 98470 89012",
        address="MG Road, Shenoys Junction, Ernakulam",
        latitude=9.9723,
        longitude=76.2842,
        category="Complete outage",
        severity="High",
        description="Total power cutoff across entire block. Traffic signals completely dead.",
        is_critical_facility_flag=True,
        status=inc3.status,
        incident_id=inc3.id,
        created_at=inc3_reported
    )
    db.add_all([rep1, rep2, rep3, rep4])
    db.commit()

    # 5. Escalations
    esc1 = Escalation(
        incident_id=inc1.id,
        trigger_reason="Critical Priority SLA Breach (>15 min resolution delay at Hospital Sector). Elapsed duration: 45 minutes.",
        threshold_minutes=15,
        elapsed_minutes=45,
        status="Acknowledged",
        acknowledged_by="Dr. K. G. Radhakrishnan (Deputy Chief Engineer, KSEB)",
        acknowledged_at=now - timedelta(minutes=20),
        supervisor_action="Authorized auxiliary mobile diesel transformer unit from Kalamassery Central Stores.",
        created_at=inc1_reported + timedelta(minutes=16)
    )
    esc2 = Escalation(
        incident_id=inc3.id,
        trigger_reason="High Priority SLA Breach (>30 min resolution delay). Elapsed duration: 75 minutes without assigned field crew.",
        threshold_minutes=30,
        elapsed_minutes=75,
        status="Escalated",
        created_at=inc3_reported + timedelta(minutes=31)
    )
    db.add_all([esc1, esc2])
    db.commit()

    # 6. Status History
    hist1 = StatusHistory(
        incident_id=inc1.id,
        status="Reported",
        note="Incident established from multiple critical hospital reports.",
        updated_by="GridGuard Intelligence Engine",
        created_at=inc1_reported
    )
    hist2 = StatusHistory(
        incident_id=inc1.id,
        status="Repair in Progress",
        note="Alpha 110kV crew arrived on-site. Replacing bushing.",
        updated_by="Er. K. V. Ramesh",
        created_at=inc1_reported + timedelta(minutes=20)
    )
    db.add_all([hist1, hist2])
    db.commit()
    db.close()
    print("Database successfully seeded with realistic Kerala (Kochi/Ernakulam) demonstration data!")

if __name__ == "__main__":
    seed_database()
