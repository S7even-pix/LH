import math
import re
from datetime import datetime, timedelta
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Incident, ConsumerReport, Escalation, StatusHistory, SystemNotification, SLAConfig, RepairTeam

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km."""
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def text_similarity(text1: str, text2: str) -> float:
    """Simple token-based Jaccard similarity between two texts."""
    words1 = set(re.findall(r'\b\w{3,}\b', (text1 or '').lower()))
    words2 = set(re.findall(r'\b\w{3,}\b', (text2 or '').lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union) if union else 0.0

CRITICAL_FACILITY_KEYWORDS = [
    "hospital", "clinic", "medical", "icu", "emergency", "dialysis", "oxygen",
    "water treatment", "pumping", "water supply", "fire station", "police",
    "school", "daycare", "elderly", "nursing home", "traffic light", "traffic signal",
    "substation", "grid transformer", "high voltage"
]

def detect_critical_infrastructure(text: str) -> Tuple[bool, List[str]]:
    """Scan text for critical infrastructure keywords."""
    found = []
    text_lower = (text or "").lower()
    for kw in CRITICAL_FACILITY_KEYWORDS:
        if kw in text_lower:
            found.append(kw)
    return (len(found) > 0, found)

class GridGuardIntelligenceEngine:

    @staticmethod
    def calculate_priority_score(
        severity: str,
        category: str,
        report_count: int,
        description: str,
        address: str,
        elapsed_minutes: int = 0
    ) -> Tuple[str, float, str]:
        """
        Calculates recommended priority and provides transparent explanation.
        Returns: (priority_str, score_float, explanation_str)
        """
        score = 0.0
        reasons = []

        # 1. Severity weight (0-30)
        sev_map = {
            "critical": 30.0,
            "high": 22.0,
            "medium": 14.0,
            "low": 6.0
        }
        sev_score = sev_map.get((severity or "medium").lower(), 14.0)
        score += sev_score
        reasons.append(f"Reported severity is '{severity}' (+{int(sev_score)} pts)")

        # 2. Cluster size / consumer impact (0-25)
        if report_count >= 10:
            c_score = 25.0
            reasons.append(f"High consumer density with {report_count} linked reports (+25 pts)")
        elif report_count >= 5:
            c_score = 18.0
            reasons.append(f"Significant localized outage cluster of {report_count} reports (+18 pts)")
        elif report_count >= 2:
            c_score = 12.0
            reasons.append(f"Multiple consumer reports ({report_count}) confirming outage (+12 pts)")
        else:
            c_score = 6.0
            reasons.append("Single initial consumer report (+6 pts)")
        score += c_score

        # 3. Category hazard factor (0-25)
        cat_lower = (category or "").lower()
        if "damaged electrical infrastructure" in cat_lower:
            cat_score = 25.0
            reasons.append("Damaged physical infrastructure presents acute public safety hazard (+25 pts)")
        elif "complete power failure" in cat_lower:
            cat_score = 20.0
            reasons.append("Complete total blackout in sector (+20 pts)")
        elif "fluctuation" in cat_lower:
            cat_score = 13.0
            reasons.append("Frequent voltage fluctuations causing equipment strain (+13 pts)")
        elif "low voltage" in cat_lower:
            cat_score = 9.0
            reasons.append("Low voltage supply reported (+9 pts)")
        else:
            cat_score = 5.0
            reasons.append(f"Category '{category}' (+5 pts)")
        score += cat_score

        # 4. Critical service detection (0-20)
        has_critical, matched_keywords = detect_critical_infrastructure(f"{description} {address}")
        if has_critical:
            crit_score = 20.0
            reasons.append(f"CRITICAL INFRASTRUCTURE DETECTED: {', '.join(matched_keywords)} nearby (+20 pts)")
            score += crit_score

        # 5. Elapsed duration factor
        if elapsed_minutes >= 60:
            score += 10.0
            reasons.append(f"Prolonged outage (>60 min unaddressed) (+10 pts)")
        elif elapsed_minutes >= 30:
            score += 5.0
            reasons.append(f"Extended outage (>30 min) (+5 pts)")

        # Map score to Priority category
        if score >= 75.0:
            priority = "Critical"
        elif score >= 50.0:
            priority = "High"
        elif score >= 28.0:
            priority = "Medium"
        else:
            priority = "Low"

        # Build readable explanation
        explanation = (
            f"Recommended {priority.upper()} Priority (Calculated Score: {int(score)}/100). "
            f"Key factors: " + "; ".join(reasons) + "."
        )

        return priority, score, explanation

    @classmethod
    def find_matching_incident(
        cls,
        db: Session,
        lat: float,
        lon: float,
        category: str,
        description: str,
        max_distance_km: float = 1.5,
        max_age_hours: int = 24
    ) -> Optional[Incident]:
        """
        Identifies if a new report matches an active unresolved incident within
        distance and category/text similarity thresholds.
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        # Only look at unresolved incidents
        active_incidents = db.query(Incident).filter(
            Incident.status != "Resolved",
            Incident.created_at >= cutoff_time
        ).all()

        best_match = None
        best_score = -1.0

        for inc in active_incidents:
            dist = haversine_distance_km(lat, lon, inc.latitude, inc.longitude)
            if dist <= max_distance_km:
                # Calculate category match and text similarity
                cat_match = 1.0 if inc.category.lower() == category.lower() else 0.3
                sim = text_similarity(description, inc.description)
                
                # Proximity score (1.0 at 0km, 0.0 at max_distance_km)
                prox_score = max(0.0, 1.0 - (dist / max_distance_km))
                
                combined_match_score = (prox_score * 0.6) + (cat_match * 0.3) + (sim * 0.1)
                
                if combined_match_score > best_score and combined_match_score >= 0.45:
                    best_score = combined_match_score
                    best_match = inc

        return best_match

    @classmethod
    def process_new_report(cls, db: Session, report_data: Dict[str, Any]) -> Tuple[ConsumerReport, Incident, bool]:
        """
        Core intelligent grouping logic:
        1. Checks for matching active incident.
        2. If matched: groups report into existing incident, updates consumer count & priority.
        3. If no match: creates new incident and assigns initial priority and SLA deadline.
        Returns: (ConsumerReport, Incident, is_new_incident_flag)
        """
        lat = float(report_data["latitude"])
        lon = float(report_data["longitude"])
        category = report_data.get("category", "Complete power failure")
        severity = report_data.get("severity", "Medium")
        description = report_data.get("description", "")
        address = report_data.get("address", "Green Valley")
        consumer_name = report_data.get("consumer_name", "Anonymous Citizen")
        consumer_phone = report_data.get("consumer_phone", "")

        # Check for critical keywords
        is_crit, _ = detect_critical_infrastructure(f"{description} {address}")

        # Find matching incident
        matching_incident = cls.find_matching_incident(
            db, lat, lon, category, description, max_distance_km=1.5
        )

        is_new_incident = False

        if matching_incident:
            incident = matching_incident
            incident.affected_consumers_count = (incident.affected_consumers_count or 1) + 1
            
            # Recalculate priority with new count
            if not incident.priority_overridden:
                new_priority, new_score, new_reason = cls.calculate_priority_score(
                    severity=max([incident.severity, severity], key=lambda s: {"critical":4,"high":3,"medium":2,"low":1}.get(s.lower(), 1)),
                    category=incident.category,
                    report_count=incident.affected_consumers_count,
                    description=f"{incident.description} | {description}",
                    address=incident.primary_location
                )
                incident.priority = new_priority
                incident.priority_score = new_score
                incident.priority_reason = new_reason
                
                # Update SLA deadline if priority escalated
                threshold_mins = cls.get_sla_threshold(db, new_priority)
                incident.sla_deadline = incident.reported_at + timedelta(minutes=threshold_mins)

            incident.updated_at = datetime.utcnow()
        else:
            is_new_incident = True
            # Generate incident title
            title = f"{category} near {address.split(',')[0].strip()}"
            
            # Priority calculation
            priority, score, reason = cls.calculate_priority_score(
                severity=severity,
                category=category,
                report_count=1,
                description=description,
                address=address
            )

            # Generate unique incident number
            inc_count = db.query(Incident).count() + 1
            incident_number = f"INC-GV-{1000 + inc_count}"

            # SLA threshold
            threshold_mins = cls.get_sla_threshold(db, priority)
            now = datetime.utcnow()
            sla_deadline = now + timedelta(minutes=threshold_mins)

            # Estimated initial restoration time (e.g., 2 hours default)
            etr = now + timedelta(minutes=threshold_mins + 30)

            incident = Incident(
                incident_number=incident_number,
                title=title,
                description=description,
                primary_location=address,
                latitude=lat,
                longitude=lon,
                category=category,
                severity=severity,
                priority=priority,
                priority_score=score,
                priority_reason=reason,
                status="Reported",
                affected_consumers_count=1,
                estimated_restoration_time=etr,
                reported_at=now,
                sla_deadline=sla_deadline,
                created_at=now,
                updated_at=now
            )
            db.add(incident)
            db.flush() # Populate incident.id

            # Initial status history
            history = StatusHistory(
                incident_id=incident.id,
                status="Reported",
                note=f"Outage incident established by GridGuard Engine. Priority assigned: {priority}.",
                updated_by="GridGuard Intelligence Engine",
                created_at=now
            )
            db.add(history)

        # Generate unique report number
        rep_count = db.query(ConsumerReport).count() + 1
        report_number = f"REP-GV-{2000 + rep_count}"

        consumer_report = ConsumerReport(
            report_number=report_number,
            consumer_name=consumer_name,
            consumer_phone=consumer_phone,
            address=address,
            latitude=lat,
            longitude=lon,
            category=category,
            severity=severity,
            description=description,
            is_critical_facility_flag=is_crit,
            status=incident.status,
            incident_id=incident.id,
            created_at=datetime.utcnow()
        )
        db.add(consumer_report)
        db.commit()
        db.refresh(consumer_report)
        db.refresh(incident)

        # Create system notification
        notif = SystemNotification(
            title=f"New Outage Report: {report_number}",
            message=f"Reported at {address} ({category}). Linked to Incident #{incident.incident_number}.",
            type="warning" if incident.priority in ["High", "Critical"] else "info",
            target_role="operator",
            reference_id=incident.incident_number,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()

        return consumer_report, incident, is_new_incident

    @staticmethod
    def get_sla_threshold(db: Session, priority: str) -> int:
        """Fetch configured SLA threshold in minutes for a given priority."""
        config = db.query(SLAConfig).filter(
            SLAConfig.priority.ilike(priority),
            SLAConfig.is_active == True
        ).first()
        if config:
            return config.threshold_minutes

        defaults = {
            "critical": 15,
            "high": 30,
            "medium": 60,
            "low": 120
        }
        return defaults.get((priority or "medium").lower(), 60)

    @classmethod
    def run_auto_escalation_cycle(cls, db: Session) -> List[Escalation]:
        """
        Feature 3: Automatic escalation service.
        Monitors unresolved incidents against SLA thresholds and escalates if overdue.
        """
        now = datetime.utcnow()
        active_incidents = db.query(Incident).filter(
            Incident.status != "Resolved"
        ).all()

        new_escalations = []

        for inc in active_incidents:
            elapsed_minutes = int((now - inc.reported_at).total_seconds() / 60)
            threshold = cls.get_sla_threshold(db, inc.priority)

            if elapsed_minutes >= threshold:
                # Check if already escalated for this threshold
                existing_esc = db.query(Escalation).filter(
                    Escalation.incident_id == inc.id
                ).first()

                if not existing_esc:
                    inc.is_escalated = True
                    reason = (
                        f"Automated SLA Breach: Incident has remained unresolved for {elapsed_minutes} minutes, "
                        f"exceeding the {inc.priority} priority threshold of {threshold} minutes."
                    )
                    
                    esc = Escalation(
                        incident_id=inc.id,
                        trigger_reason=reason,
                        threshold_minutes=threshold,
                        elapsed_minutes=elapsed_minutes,
                        status="Escalated",
                        created_at=now
                    )
                    db.add(esc)
                    
                    # Record history
                    hist = StatusHistory(
                        incident_id=inc.id,
                        status=inc.status,
                        note=f"AUTO-ESCALATION TO SUPERVISOR: Exceeded {threshold} min SLA by {elapsed_minutes - threshold} mins.",
                        updated_by="GridGuard Auto-Escalation Engine",
                        created_at=now
                    )
                    db.add(hist)

                    # Supervisor notification
                    notif = SystemNotification(
                        title=f"URGENT: Escalation for Incident #{inc.incident_number}",
                        message=f"{inc.priority} priority outage at {inc.primary_location} exceeded SLA by {elapsed_minutes - threshold} mins.",
                        type="critical",
                        target_role="supervisor",
                        reference_id=inc.incident_number,
                        created_at=now
                    )
                    db.add(notif)
                    new_escalations.append(esc)

        if new_escalations:
            db.commit()

        return new_escalations

    @staticmethod
    def get_historical_pattern_analytics(db: Session) -> Dict[str, Any]:
        """
        Feature 4: Historical statistical analytics.
        Analyzes hotspots, categories, resolution times, overdue metrics, and team performance.
        """
        incidents = db.query(Incident).all()
        reports = db.query(ConsumerReport).all()
        teams = db.query(RepairTeam).all()

        # 1. Location Hotspots
        location_counts = {}
        for inc in incidents:
            # Group by area
            area = inc.primary_location.split(',')[0].strip()
            if area not in location_counts:
                location_counts[area] = {"count": 0, "affected": 0, "critical_count": 0}
            location_counts[area]["count"] += 1
            location_counts[area]["affected"] += inc.affected_consumers_count or 1
            if inc.priority in ["High", "Critical"]:
                location_counts[area]["critical_count"] += 1

        hotspots = [
            {"location": loc, "outages": data["count"], "affected_consumers": data["affected"], "high_priority": data["critical_count"]}
            for loc, data in sorted(location_counts.items(), key=lambda x: x[1]["count"], reverse=True)
        ]

        # 2. Category Distribution
        cat_counts = {}
        for inc in incidents:
            cat = inc.category
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        
        category_distribution = [
            {"category": cat, "count": count}
            for cat, count in cat_counts.items()
        ]

        # 3. Priority Distribution
        prio_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        for inc in incidents:
            p = inc.priority or "Medium"
            prio_counts[p] = prio_counts.get(p, 0) + 1
        
        priority_distribution = [
            {"priority": k, "count": v} for k, v in prio_counts.items()
        ]

        # 4. Resolution Times
        resolved = [inc for inc in incidents if inc.status == "Resolved" and inc.resolved_at and inc.reported_at]
        resolution_durations = [
            (inc.resolved_at - inc.reported_at).total_seconds() / 60
            for inc in resolved
        ]
        avg_resolution_min = round(sum(resolution_durations) / len(resolution_durations), 1) if resolution_durations else 45.0

        # 5. Overdue and Escalated counts
        now = datetime.utcnow()
        overdue_count = 0
        active_count = 0
        resolved_count = 0
        critical_active_count = 0
        total_affected = sum(inc.affected_consumers_count or 1 for inc in incidents)

        for inc in incidents:
            if inc.status == "Resolved":
                resolved_count += 1
            else:
                active_count += 1
                if inc.priority == "Critical":
                    critical_active_count += 1
                # Check overdue
                if inc.sla_deadline and now > inc.sla_deadline:
                    overdue_count += 1

        # 6. Repair Team Performance
        team_stats = []
        for team in teams:
            team_incidents = [inc for inc in incidents if inc.assigned_team_id == team.id]
            resolved_by_team = [inc for inc in team_incidents if inc.status == "Resolved"]
            active_by_team = [inc for inc in team_incidents if inc.status != "Resolved"]
            
            durations = [
                (inc.resolved_at - inc.reported_at).total_seconds() / 60
                for inc in resolved_by_team if inc.resolved_at and inc.reported_at
            ]
            avg_time = round(sum(durations) / len(durations), 1) if durations else 0.0

            team_stats.append({
                "team_id": team.id,
                "team_name": team.name,
                "specialization": team.specialization,
                "total_assigned": len(team_incidents),
                "resolved_count": len(resolved_by_team),
                "active_count": len(active_by_team),
                "avg_resolution_minutes": avg_time,
                "status": team.status
            })

        # 7. Trends (simulated weekly / recent days)
        trends = [
            {"day": "Mon", "reported": 4, "resolved": 4},
            {"day": "Tue", "reported": 6, "resolved": 5},
            {"day": "Wed", "reported": 8, "resolved": 7},
            {"day": "Thu", "reported": 5, "resolved": 6},
            {"day": "Fri", "reported": 11, "resolved": 9},
            {"day": "Sat", "reported": 7, "resolved": 8},
            {"day": "Sun (Today)", "reported": len(incidents) - 15 if len(incidents) > 15 else 5, "resolved": resolved_count}
        ]

        return {
            "summary": {
                "total_reports": len(reports),
                "total_incidents": len(incidents),
                "active_incidents": active_count,
                "critical_incidents": critical_active_count,
                "resolved_incidents": resolved_count,
                "overdue_incidents": overdue_count,
                "total_affected_consumers": total_affected,
                "avg_resolution_minutes": avg_resolution_min,
                "sla_compliance_rate": round((resolved_count / max(1, len(incidents))) * 100, 1)
            },
            "hotspots": hotspots,
            "category_distribution": category_distribution,
            "priority_distribution": priority_distribution,
            "team_performance": team_stats,
            "trends": trends
        }
