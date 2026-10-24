from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class ConsumerReport(Base):
    __tablename__ = "consumer_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, index=True)
    consumer_name = Column(String(100), default="Anonymous Citizen")
    consumer_phone = Column(String(50), default="")
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    description = Column(Text, default="")
    is_critical_facility_flag = Column(Boolean, default=False)
    status = Column(String(50), default="Reported")
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = relationship("Incident", back_populates="reports")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(50), unique=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    primary_location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(String(50), default="Medium")
    priority = Column(String(50), default="Medium") # Low, Medium, High, Critical
    priority_score = Column(Float, default=50.0)
    priority_reason = Column(Text, default="")
    priority_overridden = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    status = Column(String(50), default="Reported") # Reported, Under Review, Team Assigned, Repair in Progress, Resolved
    affected_consumers_count = Column(Integer, default=1)
    estimated_restoration_time = Column(DateTime, nullable=True)
    assigned_team_id = Column(Integer, ForeignKey("repair_teams.id", ondelete="SET NULL"), nullable=True)
    reported_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    sla_deadline = Column(DateTime, nullable=True)
    is_escalated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_team = relationship("RepairTeam", back_populates="incidents", foreign_keys=[assigned_team_id])
    reports = relationship("ConsumerReport", back_populates="incident")
    status_history = relationship("StatusHistory", back_populates="incident", cascade="all, delete-orphan", order_by="desc(StatusHistory.created_at)")
    escalations = relationship("Escalation", back_populates="incident", cascade="all, delete-orphan", order_by="desc(Escalation.created_at)")


class RepairTeam(Base):
    __tablename__ = "repair_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50), default="+1 (555) 010-0000")
    leader = Column(String(100), default="Lead Engineer")
    specialization = Column(String(150), default="Grid Maintenance & High Voltage")
    status = Column(String(50), default="Available") # Available, Dispatched, On Break, Maintenance
    vehicle_number = Column(String(50), default="GV-PWR-01")
    latitude = Column(Float, default=45.5152)
    longitude = Column(Float, default=-122.6784)
    created_at = Column(DateTime, default=datetime.utcnow)

    incidents = relationship("Incident", back_populates="assigned_team", foreign_keys=[Incident.assigned_team_id])


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    note = Column(Text, default="")
    updated_by = Column(String(100), default="Operator")
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="status_history")


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    trigger_reason = Column(Text, nullable=False)
    threshold_minutes = Column(Integer, nullable=False)
    elapsed_minutes = Column(Integer, nullable=False)
    status = Column(String(50), default="Escalated") # Escalated, Acknowledged, Reviewed, Resolved
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    supervisor_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="escalations")
    comments = relationship("SupervisorComment", back_populates="escalation", cascade="all, delete-orphan", order_by="desc(SupervisorComment.created_at)")


class SupervisorComment(Base):
    __tablename__ = "supervisor_comments"

    id = Column(Integer, primary_key=True, index=True)
    escalation_id = Column(Integer, ForeignKey("escalations.id", ondelete="CASCADE"), nullable=False)
    supervisor_name = Column(String(100), default="Senior Grid Supervisor")
    comment = Column(Text, nullable=False)
    action_required = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    escalation = relationship("Escalation", back_populates="comments")


class SystemNotification(Base):
    __tablename__ = "system_notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # info, warning, critical, success
    target_role = Column(String(50), default="all") # consumer, operator, supervisor, all
    reference_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SLAConfig(Base):
    __tablename__ = "sla_configs"

    id = Column(Integer, primary_key=True, index=True)
    priority = Column(String(50), unique=True, nullable=False) # Critical, High, Medium, Low
    threshold_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
