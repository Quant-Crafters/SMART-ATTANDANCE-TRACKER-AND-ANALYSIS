package attendence

import (
	"fmt"
	"strings"
)

// ValidateCreateAttendance validates attendance creation data.
func ValidateCreateAttendance(req CreateAttendanceRequest) error {

	if req.StudentID == 0 {
		return fmt.Errorf("student_id is required")
	}

	if req.SubjectID == 0 {
		return fmt.Errorf("subject_id is required")
	}

	if req.FacultyID == 0 {
		return fmt.Errorf("faculty_id is required")
	}

	if req.Date.IsZero() {
		return fmt.Errorf("date is required")
	}

	if !isValidStatus(req.Status) {
		return fmt.Errorf(
			"invalid attendance status: use present, absent, or late",
		)
	}

	return nil
}

// ValidateUpdateAttendance validates attendance update data.
func ValidateUpdateAttendance(req UpdateAttendanceRequest) error {

	if !isValidStatus(req.Status) {
		return fmt.Errorf(
			"invalid attendance status: use present, absent, or late",
		)
	}

	return nil
}

// isValidStatus checks whether the attendance status is valid.
func isValidStatus(status string) bool {

	status = strings.ToLower(strings.TrimSpace(status))

	switch status {
	case "present", "absent", "late":
		return true
	default:
		return false
	}
}