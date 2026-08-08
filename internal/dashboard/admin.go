package dashboard

import (
	"time"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
)

// AdminDashboard represents admin dashboard statistics.
type AdminDashboard struct {
	TotalStudents      int64   `json:"total_students"`
	TotalAttendance    int64   `json:"total_attendance"`
	PresentToday       int64   `json:"present_today"`
	AbsentToday        int64   `json:"absent_today"`
	AttendanceRate     float64 `json:"attendance_rate"`
	LowAttendanceCount int64   `json:"low_attendance_count"`
}

// GetAdminDashboard returns dashboard statistics for admin.
func GetAdminDashboard() (*AdminDashboard, error) {

	db := config.DB

	var totalStudents int64
	var totalAttendance int64
	var presentToday int64
	var absentToday int64
	var lowAttendanceCount int64

	// Total students
	if err := db.Model(&student.Student{}).
		Where("status = ?", true).
		Count(&totalStudents).Error; err != nil {
		return nil, err
	}

	// Total attendance records
	if err := db.Model(&attendence.Attendance{}).
		Count(&totalAttendance).Error; err != nil {
		return nil, err
	}

	// Today's attendance
	today := time.Now().Format("2006-01-02")

	if err := db.Model(&attendence.Attendance{}).
		Where("DATE(date) = ? AND status = ?", today, "present").
		Count(&presentToday).Error; err != nil {
		return nil, err
	}

	if err := db.Model(&attendence.Attendance{}).
		Where("DATE(date) = ? AND status = ?", today, "absent").
		Count(&absentToday).Error; err != nil {
		return nil, err
	}

	// Calculate today's attendance rate.
	var attendanceRate float64

	todayTotal := presentToday + absentToday

	if todayTotal > 0 {
		attendanceRate =
			(float64(presentToday) / float64(todayTotal)) * 100
	}

	// Count students below 75% attendance.
	// This is calculated from attendance records.
	var studentIDs []uint

	if err := db.Model(&attendence.Attendance{}).
		Distinct("student_id").
		Pluck("student_id", &studentIDs).Error; err != nil {
		return nil, err
	}

	for _, studentID := range studentIDs {

		var total int64
		var present int64

		if err := db.Model(&attendence.Attendance{}).
			Where("student_id = ?", studentID).
			Count(&total).Error; err != nil {
			return nil, err
		}

		if err := db.Model(&attendence.Attendance{}).
			Where(
				"student_id = ? AND status = ?",
				studentID,
				"present",
			).
			Count(&present).Error; err != nil {
			return nil, err
		}

		if total > 0 {
			rate := (float64(present) / float64(total)) * 100

			if rate < 75 {
				lowAttendanceCount++
			}
		}
	}

	return &AdminDashboard{
		TotalStudents:      totalStudents,
		TotalAttendance:    totalAttendance,
		PresentToday:       presentToday,
		AbsentToday:        absentToday,
		AttendanceRate:     attendanceRate,
		LowAttendanceCount: lowAttendanceCount,
	}, nil
}