import asyncio
from datetime import datetime, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from backend.database import engine, Base, get_db, SessionLocal
from backend.models import (
    ConsumerReport, Incident, RepairTeam, StatusHistory,
    Escalation, SupervisorComment, SystemNotification, SLAConfig
)
from backend.schemas import (
    ReportCreate, ReportResponse, IncidentListItem, IncidentDetailResponse,
    IncidentUpdateStatus, IncidentAssignTeam, IncidentOverridePriority,
    IncidentUpdateETR, EscalationResponse, EscalationAcknowledge,
    EscalationReview, SupervisorCommentCreate, RepairTeamResponse,
    SLAConfigUpdate
)
from backend.engine import GridGuardIntelligenceEngine
from backend.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Auto-escalation background worker
async def periodic_sla_monitor():
    """Background service that checks active incidents for SLA breaches."""
    while True:
        try:
            db = SessionLocal()
            GridGuardIntelligenceEngine.run_auto_escalation_cycle(db)
            db.close()
        except Exception as e:
            print(f"Error in SLA monitor cycle: {e}")
        await asyncio.sleep(20) # Check every 20 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if database has data, if not seed it automatically
    db = SessionLocal()
    count = db.query(Incident).count()
    db.close()
    if count == 0:
        print("Empty database detected. Seeding with demonstration data...")
        seed_database()

    # Start background task
    monitor_task = asyncio.create_task(periodic_sla_monitor())
    yield
    monitor_task.cancel()

app = FastAPI(
    title="GridGuard API",
    description="AI-Assisted Power Outage Monitoring & Escalation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Consumer Reports Endpoints -----------------

@app.post("/api/reports", response_model=dict, status_code=status.HTTP_201_CREATED)
def submit_consumer_report(report_in: ReportCreate, db: Session = Depends(get_db)):
    """
    Consumer submits an outage report.
    GridGuard Intelligence Engine clusters spatial-temporally and associates
    with existing incident or creates a new one.
    """
    report_dict = report_in.dict()
    report, incident, is_new = GridGuardIntelligenceEngine.process_new_report(db, report_dict)

    return {
        "status": "success",
        "message": "Incident established and priority evaluated." if is_new else f"Grouped with existing incident #{incident.incident_number}",
        "is_new_incident": is_new,
        "report": {
            "id": report.id,
            "report_number": report.report_number,
            "consumer_name": report.consumer_name,
            "address": report.address,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "category": report.category,
            "severity": report.severity,
            "description": report.description,
            "status": report.status,
            "incident_id": report.incident_id,
            "created_at": report.created_at
        },
        "incident": {
            "id": incident.id,
            "incident_number": incident.incident_number,
            "title": incident.title,
            "priority": incident.priority,
            "priority_score": incident.priority_score,
            "priority_reason": incident.priority_reason,
            "status": incident.status,
            "affected_consumers_count": incident.affected_consumers_count,
            "estimated_restoration_time": incident.estimated_restoration_time
        }
    }

@app.get("/api/reports", response_model=List[ReportResponse])
def get_consumer_reports(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(ConsumerReport).order_by(desc(ConsumerReport.created_at))
    if status:
        query = query.filter(ConsumerReport.status == status)
    if category:
        query = query.filter(ConsumerReport.category == category)
    return query.limit(limit).all()

@app.get("/api/reports/{identifier}")
def get_consumer_report_detail(identifier: str, db: Session = Depends(get_db)):
    """Fetch report by numeric ID or report_number (e.g., REP-GV-2001)."""
    if identifier.isdigit():
        report = db.query(ConsumerReport).filter(ConsumerReport.id == int(identifier)).first()
    else:
        report = db.query(ConsumerReport).filter(ConsumerReport.report_number == identifier).first()

    if not report:
        raise HTTPException(status_code=404, detail="Outage report not found")

    incident_data = None
    if report.incident_id:
        inc = db.query(Incident).filter(Incident.id == report.incident_id).first()
        if inc:
            team_info = None
            if inc.assigned_team:
                team_info = {
                    "name": inc.assigned_team.name,
                    "contact": inc.assigned_team.contact,
                    "leader": inc.assigned_team.leader
                }
            incident_data = {
                "id": inc.id,
                "incident_number": inc.incident_number,
                "title": inc.title,
                "status": inc.status,
                "priority": inc.priority,
                "priority_reason": inc.priority_reason,
                "estimated_restoration_time": inc.estimated_restoration_time,
                "affected_consumers_count": inc.affected_consumers_count,
                "assigned_team": team_info,
                "status_history": [
                    {
                        "id": h.id,
                        "status": h.status,
                        "note": h.note,
                        "updated_by": h.updated_by,
                        "created_at": h.created_at
                    }
                    for h in inc.status_history
                ]
            }

    return {
        "report": {
            "id": report.id,
            "report_number": report.report_number,
            "consumer_name": report.consumer_name,
            "consumer_phone": report.consumer_phone,
            "address": report.address,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "category": report.category,
            "severity": report.severity,
            "description": report.description,
            "status": report.status,
            "incident_id": report.incident_id,
            "created_at": report.created_at
        },
        "incident": incident_data
    }

# ----------------- Incidents Endpoints -----------------

@app.get("/api/incidents", response_model=List[IncidentListItem])
def get_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).order_by(desc(Incident.created_at))

    if status and status != "All":
        query = query.filter(Incident.status == status)
    if priority and priority != "All":
        query = query.filter(Incident.priority == priority)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Incident.title.ilike(search_pattern)) |
            (Incident.incident_number.ilike(search_pattern)) |
            (Incident.primary_location.ilike(search_pattern)) |
            (Incident.category.ilike(search_pattern))
        )
    if overdue_only:
        now = datetime.utcnow()
        query = query.filter(Incident.status != "Resolved", Incident.sla_deadline < now)

    incidents = query.all()
    results = []
    for inc in incidents:
        results.append(IncidentListItem(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            primary_location=inc.primary_location,
            latitude=inc.latitude,
            longitude=inc.longitude,
            category=inc.category,
            severity=inc.severity,
            priority=inc.priority,
            priority_score=inc.priority_score,
            priority_reason=inc.priority_reason,
            priority_overridden=inc.priority_overridden,
            status=inc.status,
            affected_consumers_count=inc.affected_consumers_count,
            estimated_restoration_time=inc.estimated_restoration_time,
            assigned_team_id=inc.assigned_team_id,
            reported_at=inc.reported_at,
            resolved_at=inc.resolved_at,
            sla_deadline=inc.sla_deadline,
            is_escalated=inc.is_escalated,
            assigned_team_name=inc.assigned_team.name if inc.assigned_team else None
        ))
    return results

@app.get("/api/incidents/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_detail(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).options(
        joinedload(Incident.assigned_team),
        joinedload(Incident.reports),
        joinedload(Incident.status_history),
        joinedload(Incident.escalations)
    ).filter(Incident.id == incident_id).first()

    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.patch("/api/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    payload: IncidentUpdateStatus,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = inc.status
    new_status = payload.status
    inc.status = new_status
    inc.updated_at = datetime.utcnow()

    # If marking resolved
    if new_status == "Resolved":
        inc.resolved_at = datetime.utcnow()
        if inc.assigned_team:
            inc.assigned_team.status = "Available"

    # Synchronize status to all grouped consumer reports
    for rep in inc.reports:
        rep.status = new_status
        rep.updated_at = datetime.utcnow()

    # Add status history
    history = StatusHistory(
        incident_id=inc.id,
        status=new_status,
        note=payload.note or f"Status shifted from {old_status} to {new_status}",
        updated_by=payload.updated_by or "Control Room Operator",
        created_at=datetime.utcnow()
    )
    db.add(history)

    # System notification
    notif = SystemNotification(
        title=f"Incident #{inc.incident_number} Updated",
        message=f"Status set to '{new_status}'. Location: {inc.primary_location}",
        type="success" if new_status == "Resolved" else "info",
        target_role="all",
        reference_id=inc.incident_number,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    return {"status": "success", "new_status": new_status, "incident_id": inc.id}

@app.patch("/api/incidents/{incident_id}/assign")
def assign_repair_team(
    incident_id: int,
    payload: IncidentAssignTeam,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    team = db.query(RepairTeam).filter(RepairTeam.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Repair team not found")

    inc.assigned_team_id = team.id
    if inc.status in ["Reported", "Under Review"]:
        inc.status = "Team Assigned"
    inc.updated_at = datetime.utcnow()

    # Update team status
    team.status = "Dispatched"

    # Sync consumer reports
    for rep in inc.reports:
        if rep.status in ["Reported", "Under Review"]:
            rep.status = "Team Assigned"

    # Status history
    history = StatusHistory(
        incident_id=inc.id,
        status=inc.status,
        note=f"Assigned repair team '{team.name}' (Leader: {team.leader}). {payload.note}",
        updated_by=payload.updated_by or "Control Room Operator",
        created_at=datetime.utcnow()
    )
    db.add(history)

    # Notification
    notif = SystemNotification(
        title=f"Team Dispatched: {team.name}",
        message=f"Crew assigned to Incident #{inc.incident_number} at {inc.primary_location}",
        type="info",
        target_role="all",
        reference_id=inc.incident_number,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    return {"status": "success", "assigned_team": team.name, "incident_status": inc.status}

@app.patch("/api/incidents/{incident_id}/priority")
def override_priority(
    incident_id: int,
    payload: IncidentOverridePriority,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_priority = inc.priority
    new_priority = payload.priority
    inc.priority = new_priority
    inc.priority_overridden = True
    inc.override_reason = payload.override_reason
    inc.updated_at = datetime.utcnow()

    # Recalculate SLA deadline based on new priority
    threshold_mins = GridGuardIntelligenceEngine.get_sla_threshold(db, new_priority)
    inc.sla_deadline = inc.reported_at + timedelta(minutes=threshold_mins)

    # Record history
    history = StatusHistory(
        incident_id=inc.id,
        status=inc.status,
        note=f"OPERATOR PRIORITY OVERRIDE: Changed from {old_priority} to {new_priority}. Reason: {payload.override_reason}",
        updated_by=payload.updated_by or "Control Room Operator",
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "new_priority": new_priority, "incident_id": inc.id}

@app.patch("/api/incidents/{incident_id}/etr")
def update_etr(
    incident_id: int,
    payload: IncidentUpdateETR,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc.estimated_restoration_time = payload.estimated_restoration_time
    inc.updated_at = datetime.utcnow()

    history = StatusHistory(
        incident_id=inc.id,
        status=inc.status,
        note=f"Estimated Restoration Time updated to {payload.estimated_restoration_time.strftime('%Y-%m-%d %H:%M UTC')}. {payload.note}",
        updated_by=payload.updated_by or "Control Room Operator",
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "new_etr": inc.estimated_restoration_time}

# ----------------- Repair Teams Endpoints -----------------

@app.get("/api/teams", response_model=List[RepairTeamResponse])
def get_repair_teams(db: Session = Depends(get_db)):
    return db.query(RepairTeam).all()

@app.patch("/api/teams/{team_id}/status")
def update_team_status(
    team_id: int,
    status_val: str = Query(..., alias="status"),
    db: Session = Depends(get_db)
):
    team = db.query(RepairTeam).filter(RepairTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team.status = status_val
    db.commit()
    return {"status": "success", "team_id": team.id, "team_status": team.status}

# ----------------- Escalation & Supervisor Endpoints -----------------

@app.get("/api/escalations", response_model=List[dict])
def get_escalations(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Escalation).order_by(desc(Escalation.created_at))
    if status and status != "All":
        query = query.filter(Escalation.status == status)

    escalations = query.all()
    results = []
    now = datetime.utcnow()

    for esc in escalations:
        inc = esc.incident
        elapsed = int((now - inc.reported_at).total_seconds() / 60) if inc else esc.elapsed_minutes
        results.append({
            "id": esc.id,
            "incident_id": esc.incident_id,
            "incident_number": inc.incident_number if inc else "N/A",
            "incident_title": inc.title if inc else "N/A",
            "location": inc.primary_location if inc else "N/A",
            "priority": inc.priority if inc else "N/A",
            "priority_score": inc.priority_score if inc else 50.0,
            "incident_status": inc.status if inc else "N/A",
            "assigned_team": inc.assigned_team.name if inc and inc.assigned_team else "Unassigned",
            "affected_consumers": inc.affected_consumers_count if inc else 1,
            "trigger_reason": esc.trigger_reason,
            "threshold_minutes": esc.threshold_minutes,
            "elapsed_minutes": elapsed,
            "overdue_by_minutes": max(0, elapsed - esc.threshold_minutes),
            "status": esc.status,
            "acknowledged_by": esc.acknowledged_by,
            "acknowledged_at": esc.acknowledged_at,
            "reviewed_by": esc.reviewed_by,
            "reviewed_at": esc.reviewed_at,
            "supervisor_action": esc.supervisor_action,
            "created_at": esc.created_at,
            "comments": [
                {
                    "id": c.id,
                    "supervisor_name": c.supervisor_name,
                    "comment": c.comment,
                    "action_required": c.action_required,
                    "created_at": c.created_at
                }
                for c in esc.comments
            ]
        })
    return results

@app.post("/api/escalations/{escalation_id}/acknowledge")
def acknowledge_escalation(
    escalation_id: int,
    payload: EscalationAcknowledge,
    db: Session = Depends(get_db)
):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation record not found")

    esc.status = "Acknowledged"
    esc.acknowledged_by = payload.supervisor_name
    esc.acknowledged_at = datetime.utcnow()

    # Add comment if provided
    if payload.comment:
        c = SupervisorComment(
            escalation_id=esc.id,
            supervisor_name=payload.supervisor_name,
            comment=payload.comment,
            action_required="Acknowledge & Monitor",
            created_at=datetime.utcnow()
        )
        db.add(c)

    # History
    history = StatusHistory(
        incident_id=esc.incident_id,
        status=esc.incident.status,
        note=f"SUPERVISOR ACKNOWLEDGEMENT: Escalation acknowledged by {payload.supervisor_name}.",
        updated_by=payload.supervisor_name,
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "escalation_status": "Acknowledged"}

@app.post("/api/escalations/{escalation_id}/review")
def review_escalation(
    escalation_id: int,
    payload: EscalationReview,
    db: Session = Depends(get_db)
):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation record not found")

    esc.status = "Reviewed"
    esc.reviewed_by = payload.supervisor_name
    esc.reviewed_at = datetime.utcnow()
    esc.supervisor_action = payload.supervisor_action

    # Add comment
    if payload.comment:
        c = SupervisorComment(
            escalation_id=esc.id,
            supervisor_name=payload.supervisor_name,
            comment=f"{payload.comment} | Action: {payload.supervisor_action}",
            action_required=payload.supervisor_action,
            created_at=datetime.utcnow()
        )
        db.add(c)

    # Record history
    history = StatusHistory(
        incident_id=esc.incident_id,
        status=esc.incident.status,
        note=f"SUPERVISOR REVIEW COMPLETED: {payload.supervisor_action}",
        updated_by=payload.supervisor_name,
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "escalation_status": "Reviewed"}

@app.post("/api/escalations/{escalation_id}/comments")
def add_supervisor_comment(
    escalation_id: int,
    payload: SupervisorCommentCreate,
    db: Session = Depends(get_db)
):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")

    comment = SupervisorComment(
        escalation_id=esc.id,
        supervisor_name=payload.supervisor_name,
        comment=payload.comment,
        action_required=payload.action_required,
        created_at=datetime.utcnow()
    )
    db.add(comment)

    history = StatusHistory(
        incident_id=esc.incident_id,
        status=esc.incident.status,
        note=f"SUPERVISOR INSTRUCTION ({payload.supervisor_name}): {payload.comment}",
        updated_by=payload.supervisor_name,
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "comment_id": comment.id}

# ----------------- SLA Configurations -----------------

@app.get("/api/sla-configs")
def get_sla_configs(db: Session = Depends(get_db)):
    return db.query(SLAConfig).all()

@app.put("/api/sla-configs")
def update_sla_config(payload: SLAConfigUpdate, db: Session = Depends(get_db)):
    cfg = db.query(SLAConfig).filter(SLAConfig.priority.ilike(payload.priority)).first()
    if not cfg:
        cfg = SLAConfig(priority=payload.priority, threshold_minutes=payload.threshold_minutes)
        db.add(cfg)
    else:
        cfg.threshold_minutes = payload.threshold_minutes
    db.commit()
    # Run auto-escalation check right after threshold changes
    GridGuardIntelligenceEngine.run_auto_escalation_cycle(db)
    return {"status": "success", "priority": payload.priority, "new_threshold": payload.threshold_minutes}

@app.post("/api/engine/check-escalations")
def trigger_escalation_check(db: Session = Depends(get_db)):
    new_escs = GridGuardIntelligenceEngine.run_auto_escalation_cycle(db)
    return {
        "status": "success",
        "new_escalations_count": len(new_escs),
        "message": f"Evaluated active incidents. {len(new_escs)} new SLA escalations triggered."
    }

# ----------------- Analytics -----------------

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return GridGuardIntelligenceEngine.get_historical_pattern_analytics(db)

# ----------------- Notifications -----------------

@app.get("/api/notifications")
def get_notifications(
    role: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(SystemNotification).order_by(desc(SystemNotification.created_at))
    if role and role != "all":
        query = query.filter((SystemNotification.target_role == role) | (SystemNotification.target_role == "all"))
    return query.limit(limit).all()

@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(SystemNotification).filter(SystemNotification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

# ----------------- Demo Seeding Endpoint -----------------

@app.post("/api/seed")
def reseed_demo_data():
    seed_database()
    return {"status": "success", "message": "Demo data reset successfully for Green Valley town."}
