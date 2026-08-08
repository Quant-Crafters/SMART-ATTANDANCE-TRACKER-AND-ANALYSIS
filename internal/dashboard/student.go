package dashboard

import (
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
)

// StudentDashboard represents student dashboard statistics.
type StudentDashboard struct {
	StudentID      uint    `json:"student_id"`
	TotalClasses   int64   `json:"total_classes"`
	PresentClasses int64   `json:"present_classes"`
	AbsentClasses  int64   `json:"absent_classes"`
	AttendanceRate float64 `json:"attendance_rate"`
	LowAttendance  bool    `json:"low_attendance"`
}

// GetStudentDashboard returns dashboard statistics for a student.
func GetStudentDashboard(studentID uint) (*StudentDashboard, error) {

	db := config.DB

	var totalClasses int64
	var presentClasses int64
	var absentClasses int64

	// Total classes attended/recorded.
	if err := db.Model(&attendence.Attendance{}).
		Where("student_id = ?", studentID).
		Count(&totalClasses).Error; err != nil {
		return nil, err
	}

	// Present classes.
	if err := db.Model(&attendence.Attendance{}).
		Where(
			"student_id = ? AND status = ?",
			studentID,
			"present",
		).
		Count(&presentClasses).Error; err != nil {
		return nil, err
	}

	// Absent classes.
	if err := db.Model(&attendence.Attendance{}).
		Where(
			"student_id = ? AND status = ?",
			studentID,
			"absent",
		).
		Count(&absentClasses).Error; err != nil {
		return nil, err
	}

	// Calculate attendance percentage.
	var attendanceRate float64

	if totalClasses > 0 {
		attendanceRate =
			(float64(presentClasses) / float64(totalClasses)) * 100
	}

	return &StudentDashboard{
		StudentID:      studentID,
		TotalClasses:   totalClasses,
		PresentClasses: presentClasses,
		AbsentClasses:  absentClasses,
		AttendanceRate: attendanceRate,
		LowAttendance:  attendanceRate < 75,
	}, nil
}

// GetStudentAttendanceToday checks today's attendance.
func GetStudentAttendanceToday(studentID uint) ([]attendence.Attendance, error) {

	var records []attendence.Attendance

	today := time.Now().Format("2006-01-02")

	err := config.DB.
		Where(
			"student_id = ? AND DATE(date) = ?",
			studentID,
			today,
		).
		Order("date DESC").
		Find(&records).Error

	return records, err
}