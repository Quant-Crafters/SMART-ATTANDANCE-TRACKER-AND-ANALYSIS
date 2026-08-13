import sys
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional, List

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.constants import TOTAL_SEMESTER_WEEKS, TEACHING_DAYS_PER_WEEK, CLASSES_PER_TEACHING_DAY
from utils.logger import get_logger

logger = get_logger(__name__)

# Standardized Data Provider Marker
DATA_PROVIDER_TYPE = "SYNTHETIC_DEVELOPMENT"

DEMO_DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics"]
DEMO_SUBJECTS = [
    {"subject_id": 101, "subject_name": "Operating Systems", "faculty_id": 1},
    {"subject_id": 102, "subject_name": "Database Management Systems", "faculty_id": 2},
    {"subject_id": 103, "subject_name": "Data Structures & Algorithms", "faculty_id": 3},
    {"subject_id": 104, "subject_name": "Computer Networks", "faculty_id": 1},
    {"subject_id": 105, "subject_name": "Machine Learning", "faculty_id": 4}
]

# Demo holidays placed explicitly on Mon-Fri teaching days during semester
DEMO_HOLIDAYS = [
    {"date": "2026-08-14", "holiday_name": "Independence Day Eve (Demo)", "holiday_type": "NATIONAL"},
    {"date": "2026-08-26", "holiday_name": "Festival Break (Demo)", "holiday_type": "FESTIVAL"},
    {"date": "2026-08-27", "holiday_name": "Festival Break Day 2 (Demo)", "holiday_type": "FESTIVAL"},
    {"date": "2026-09-17", "holiday_name": "Teachers Seminar Break (Demo)", "holiday_type": "ACADEMIC_BREAK"},
    {"date": "2026-10-02", "holiday_name": "Gandhi Jayanti (Demo)", "holiday_type": "NATIONAL"}
]

# Student Leave Schedules for Synthetic Data
DEMO_LEAVES = [
    {"leave_id": 1, "student_id": 5, "start_date": "2026-08-10", "end_date": "2026-08-12", "leave_days": 3, "reason": "Medical Leave"},
    {"leave_id": 2, "student_id": 12, "start_date": "2026-09-01", "end_date": "2026-09-03", "leave_days": 3, "reason": "Family Emergency"},
    {"leave_id": 3, "student_id": 20, "start_date": "2026-09-15", "end_date": "2026-09-16", "leave_days": 2, "reason": "Sports Competition"}
]

class SyntheticTrainingDataProvider:
    """
    Development/SIH Demo Data Provider generating realistic, temporal student attendance datasets.
    Fix 1: Uses exact 10-week exclusive date boundaries (70 calendar days = 50 teaching days = 100 scheduled sessions).
    """

    def __init__(self, random_seed: int = 42):
        self.random_seed = random_seed
        np.random.seed(random_seed)

    def get_total_scheduled_sessions(self, num_weeks: int = TOTAL_SEMESTER_WEEKS) -> int:
        """
        Derives raw scheduled sessions before holiday exclusions (e.g. 10 weeks * 5 days * 2 classes = 100).
        """
        return num_weeks * TEACHING_DAYS_PER_WEEK * CLASSES_PER_TEACHING_DAY

    def get_total_actual_semester_sessions(self, start_date_str: str = "2026-08-03", num_weeks: int = TOTAL_SEMESTER_WEEKS) -> int:
        """
        Fix 1: Authoritative calculation of total actual teaching sessions = Scheduled Sessions - Holiday Sessions.
        Uses exclusive end date boundary (start_dt + num_weeks) for exact 10-week range.
        """
        start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_dt_exclusive = start_dt + timedelta(weeks=num_weeks)
        holiday_dates_set = {h["date"] for h in DEMO_HOLIDAYS}

        actual_sessions = 0
        curr_dt = start_dt
        while curr_dt < end_dt_exclusive:
            date_str = curr_dt.strftime("%Y-%m-%d")
            weekday = curr_dt.weekday()
            # Only count teaching sessions on Mon-Fri non-holidays
            if weekday < 5 and date_str not in holiday_dates_set:
                actual_sessions += CLASSES_PER_TEACHING_DAY
            curr_dt += timedelta(days=1)

        return actual_sessions

    def generate_full_synthetic_dataset(
        self,
        num_students: int = 60,
        start_date_str: str = "2026-08-03",
        num_weeks: int = TOTAL_SEMESTER_WEEKS
    ) -> Dict[str, pd.DataFrame]:
        """
        Generates realistic student profiles, subjects, dated attendance logs, multi-day leaves,
        and academic calendar holiday records on actual teaching days over an exact 10-week window.
        """
        logger.info(f"Generating realistic synthetic dataset ({num_students} students, {num_weeks} weeks)... [Mode: {DATA_PROVIDER_TYPE}]")

        # 1. Students & Faculty
        students = []
        for s_id in range(1, num_students + 1):
            dept = DEMO_DEPARTMENTS[(s_id - 1) % len(DEMO_DEPARTMENTS)]
            sem = 5
            sec = "A" if s_id <= (num_students // 2) else "B"
            if s_id % 5 == 0:
                profile = "LOW"         # 50-75% attendance
            elif s_id % 4 == 0:
                profile = "DECLINING"   # Recent drop
            elif s_id % 3 == 0:
                profile = "IMPROVING"   # Recent boost
            elif s_id % 7 == 0:
                profile = "WEDNESDAY_ABSENT" # Frequently misses Wednesdays
            else:
                profile = "HIGH"        # 80-98% attendance
            
            students.append({
                "student_id": s_id,
                "department": dept,
                "semester": sem,
                "section": sec,
                "profile": profile
            })
        df_students = pd.DataFrame(students)

        df_subjects = pd.DataFrame(DEMO_SUBJECTS)
        df_faculty = pd.DataFrame([
            {"faculty_id": 1, "department": "Computer Science"},
            {"faculty_id": 2, "department": "Computer Science"},
            {"faculty_id": 3, "department": "Information Technology"},
            {"faculty_id": 4, "department": "Electronics"}
        ])

        # 2. Academic Calendar / Holidays (Exclusive end-date boundary for exact 10-week academic window)
        start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_dt_exclusive = start_dt + timedelta(weeks=num_weeks)
        
        calendar_records = []
        curr_dt = start_dt
        holiday_dates_set = {h["date"]: h for h in DEMO_HOLIDAYS}

        while curr_dt < end_dt_exclusive:
            date_str = curr_dt.strftime("%Y-%m-%d")
            is_hol = 1 if date_str in holiday_dates_set else 0
            hol_info = holiday_dates_set.get(date_str, {})
            calendar_records.append({
                "date": curr_dt,
                "date_str": date_str,
                "holiday_name": hol_info.get("holiday_name", "Regular Class Day" if not is_hol else "Holiday"),
                "holiday_type": hol_info.get("holiday_type", "NONE" if not is_hol else "FESTIVAL"),
                "is_holiday": is_hol
            })
            curr_dt += timedelta(days=1)
        df_calendar = pd.DataFrame(calendar_records)
        holiday_date_list = set(df_calendar[df_calendar["is_holiday"] == 1]["date_str"].tolist())

        # 3. Multi-Day Leaves Preparation
        leaves_data = []
        for l in DEMO_LEAVES:
            leaves_data.append({
                "leave_id": l["leave_id"],
                "student_id": l["student_id"],
                "start_date": pd.to_datetime(l["start_date"]),
                "end_date": pd.to_datetime(l["end_date"]),
                "leave_days": l["leave_days"],
                "reason": l["reason"]
            })
        df_leaves = pd.DataFrame(leaves_data)

        # 4. Attendance Logs Generation (Exclusive end-date boundary)
        attendance_logs = []
        att_id = 1
        curr_dt = start_dt

        while curr_dt < end_dt_exclusive:
            date_str = curr_dt.strftime("%Y-%m-%d")
            weekday = curr_dt.weekday() # 0=Mon, 4=Fri, 5=Sat, 6=Sun

            # Only hold classes Mon-Fri on non-holidays
            if weekday < 5 and date_str not in holiday_date_list:
                next_day_str = (curr_dt + timedelta(days=1)).strftime("%Y-%m-%d")
                is_pre_holiday = next_day_str in holiday_date_list or weekday == 4

                for student in students:
                    s_id = student["student_id"]
                    prof = student["profile"]

                    # Check if student s_id has an approved leave covering curr_dt
                    is_on_approved_leave = False
                    if not df_leaves.empty:
                        student_l = df_leaves[df_leaves["student_id"] == s_id]
                        for _, l_row in student_l.iterrows():
                            if l_row["start_date"] <= curr_dt <= l_row["end_date"]:
                                is_on_approved_leave = True
                                break

                    # Determine base attendance probability
                    if prof == "HIGH":
                        base_prob = 0.92
                    elif prof == "LOW":
                        base_prob = 0.62
                    elif prof == "DECLINING":
                        base_prob = 0.85 if (curr_dt - start_dt).days < 25 else 0.55
                    elif prof == "IMPROVING":
                        base_prob = 0.60 if (curr_dt - start_dt).days < 25 else 0.90
                    elif prof == "WEDNESDAY_ABSENT" and weekday == 2:
                        base_prob = 0.25
                    else:
                        base_prob = 0.80

                    if is_pre_holiday:
                        base_prob -= 0.15

                    todays_subjects = [DEMO_SUBJECTS[weekday % len(DEMO_SUBJECTS)], DEMO_SUBJECTS[(weekday + 1) % len(DEMO_SUBJECTS)]]
                    for sub in todays_subjects:
                        if is_on_approved_leave:
                            status = "EXCUSED"
                        else:
                            sub_prob = base_prob - 0.10 if sub["subject_id"] == 101 else base_prob
                            rand_val = np.random.rand()
                            if rand_val < sub_prob:
                                status = "PRESENT"
                            elif rand_val < (sub_prob + 0.05):
                                status = "LATE"
                            else:
                                status = "ABSENT"

                        attendance_logs.append({
                            "attendance_id": att_id,
                            "student_id": s_id,
                            "subject_id": sub["subject_id"],
                            "date": curr_dt,
                            "status": status
                        })
                        att_id += 1

            curr_dt += timedelta(days=1)

        df_attendance = pd.DataFrame(attendance_logs)

        actual_sessions = self.get_total_actual_semester_sessions(start_date_str, num_weeks)
        logger.info(f"Generated {len(df_attendance)} attendance records across {actual_sessions} actual teaching sessions per student ({len(df_calendar)} calendar days, {len(df_leaves)} leaves). [Provider: {DATA_PROVIDER_TYPE}]")

        return {
            "students": df_students,
            "faculty": df_faculty,
            "subjects": df_subjects,
            "attendance": df_attendance,
            "leaves": df_leaves,
            "academic_calendar": df_calendar,
            "total_actual_semester_sessions": actual_sessions
        }
