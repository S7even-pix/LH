from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class ReportCreate(BaseModel):
    address: str = Field(..., example="452 Oak Ridge Lane, Green Valley")
    latitude: float = Field(..., example=45.5152)
    longitude: float = Field(..., example=-122.6784)
    category: str = Field(..., example="Complete power failure")
    severity: str = Field(..., example="High")
    description: Optional[str] = Field("", example="Transformer sparked and entire block lost electricity.")
    consumer_name: Optional[str] = Field("Anonymous Citizen", example="Jane Doe")
    consumer_phone: Optional[str] = Field("", example="555-0199")

class ReportResponse(BaseModel):
    id: int
    report_number: str
    consumer_name: Optional[str]
    consumer_phone: Optional[str]
    address: str
    latitude: float
    longitude: float
    category: str
    severity: str
    description: Optional[str]
    is_critical_facility_flag: bool
    status: str
    incident_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class RepairTeamResponse(BaseModel):
    id: int
    name: str
    contact: str
    leader: str
    specialization: str
    status: str
    vehicle_number: str
    latitude: float
    longitude: float
    created_at: datetime

    class Config:
        from_attributes = True

class StatusHistoryResponse(BaseModel):
    id: int
    incident_id: int
    status: str
    note: Optional[str]
    updated_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SupervisorCommentResponse(BaseModel):
    id: int
    escalation_id: int
    supervisor_name: str
    comment: str
    action_required: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EscalationResponse(BaseModel):
    id: int
    incident_id: int
    trigger_reason: str
    threshold_minutes: int
    elapsed_minutes: int
    status: str
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    supervisor_action: Optional[str]
    created_at: datetime
    comments: List[SupervisorCommentResponse] = []

    class Config:
        from_attributes = True

class IncidentListItem(BaseModel):
    id: int
    incident_number: str
    title: str
    primary_location: str
    latitude: float
    longitude: float
    category: str
    severity: str
    priority: str
    priority_score: Optional[float]
    priority_reason: Optional[str]
    priority_overridden: bool
    status: str
    affected_consumers_count: int
    estimated_restoration_time: Optional[datetime]
    assigned_team_id: Optional[int]
    reported_at: datetime
    resolved_at: Optional[datetime]
    sla_deadline: Optional[datetime]
    is_escalated: bool
    assigned_team_name: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentDetailResponse(BaseModel):
    id: int
    incident_number: str
    title: str
    description: Optional[str]
    primary_location: str
    latitude: float
    longitude: float
    category: str
    severity: str
    priority: str
    priority_score: Optional[float]
    priority_reason: Optional[str]
    priority_overridden: bool
    override_reason: Optional[str]
    status: str
    affected_consumers_count: int
    estimated_restoration_time: Optional[datetime]
    assigned_team_id: Optional[int]
    reported_at: datetime
    resolved_at: Optional[datetime]
    sla_deadline: Optional[datetime]
    is_escalated: bool
    created_at: datetime
    updated_at: Optional[datetime]
    assigned_team: Optional[RepairTeamResponse] = None
    reports: List[ReportResponse] = []
    status_history: List[StatusHistoryResponse] = []
    escalations: List[EscalationResponse] = []

    class Config:
        from_attributes = True

class IncidentUpdateStatus(BaseModel):
    status: str = Field(..., example="Repair in Progress")
    note: Optional[str] = Field("Status updated by operator", example="Crew arrived at substation")
    updated_by: Optional[str] = Field("Control Room Operator", example="Operator Vance")

class IncidentAssignTeam(BaseModel):
    team_id: int
    note: Optional[str] = Field("Dispatching team to location", example="High priority dispatch")
    updated_by: Optional[str] = Field("Control Room Operator", example="Operator Vance")

class IncidentOverridePriority(BaseModel):
    priority: str = Field(..., example="Critical")
    override_reason: str = Field(..., example="Confirmed critical medical equipment at nearby senior clinic")
    updated_by: Optional[str] = Field("Control Room Operator", example="Operator Vance")

class IncidentUpdateETR(BaseModel):
    estimated_restoration_time: datetime
    note: Optional[str] = Field("ETR updated based on field assessment")
    updated_by: Optional[str] = Field("Control Room Operator")

class EscalationAcknowledge(BaseModel):
    supervisor_name: str = Field(default="Supervisor Rodriguez")
    comment: Optional[str] = Field(default="Escalation noted. Following up with dispatch.")

class EscalationReview(BaseModel):
    supervisor_name: str = Field(default="Supervisor Rodriguez")
    supervisor_action: str = Field(..., example="Dispatched secondary crew GV-03 and authorized emergency parts.")
    comment: Optional[str] = Field(default="Review completed and mitigation measures activated.")

class SupervisorCommentCreate(BaseModel):
    supervisor_name: str = Field(default="Supervisor Rodriguez")
    comment: str = Field(..., example="Directing team to isolate feeder section B.")
    action_required: Optional[str] = Field(default="Inspect transformer bushing")

class SLAConfigUpdate(BaseModel):
    priority: str
    threshold_minutes: int
