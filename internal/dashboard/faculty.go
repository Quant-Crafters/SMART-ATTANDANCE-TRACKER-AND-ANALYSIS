package dashboard

import (
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
)

// FacultyDashboard represents faculty dashboard statistics.
type FacultyDashboard struct {
	FacultyID       uint    `json:"faculty_id"`
	TotalAttendance int64   `json:"total_attendance"`
	PresentToday    int64   `json:"present_today"`
	AbsentToday     int64   `json:"absent_today"`
	AttendanceRate  float64 `json:"attendance_rate"`
}

// GetFacultyDashboard returns dashboard statistics for a faculty member.
func GetFacultyDashboard(facultyID uint) (*FacultyDashboard, error) {

	db := config.DB

	var totalAttendance int64
	var presentToday int64
	var absentToday int64

	// Total attendance records taken by this faculty.
	if err := db.Model(&attendence.Attendance{}).
		Where("faculty_id = ?", facultyID).
		Count(&totalAttendance).Error; err != nil {
		return nil, err
	}

	// Today's date.
	today := time.Now().Format("2006-01-02")

	// Present today.
	if err := db.Model(&attendence.Attendance{}).
		Where(
			"faculty_id = ? AND DATE(date) = ? AND status = ?",
			facultyID,
			today,
			"present",
		).
		Count(&presentToday).Error; err != nil {
		return nil, err
	}

	// Absent today.
	if err := db.Model(&attendence.Attendance{}).
		Where(
			"faculty_id = ? AND DATE(date) = ? AND status = ?",
			facultyID,
			today,
			"absent",
		).
		Count(&absentToday).Error; err != nil {
		return nil, err
	}

	// Calculate attendance rate.
	var attendanceRate float64

	todayTotal := presentToday + absentToday

	if todayTotal > 0 {
		attendanceRate =
			(float64(presentToday) / float64(todayTotal)) * 100
	}

	return &FacultyDashboard{
		FacultyID:       facultyID,
		TotalAttendance: totalAttendance,
		PresentToday:    presentToday,
		AbsentToday:     absentToday,
		AttendanceRate:  attendanceRate,
	}, nil
}