package attendence

import (
	"time"

	"gorm.io/gorm"
)

// AttendanceAnalytics contains calculated attendance statistics.
type AttendanceAnalytics struct {
	TotalClasses     int64   `json:"total_classes"`
	PresentCount     int64   `json:"present_count"`
	AbsentCount      int64   `json:"absent_count"`
	AttendanceRate   float64 `json:"attendance_rate"`
	CurrentStreak    int     `json:"current_streak"`
}

// StudentAttendanceAnalytics contains analytics for a specific student.
type StudentAttendanceAnalytics struct {
	StudentID        uint    `json:"student_id"`
	TotalClasses     int64   `json:"total_classes"`
	PresentCount     int64   `json:"present_count"`
	AbsentCount      int64   `json:"absent_count"`
	AttendanceRate   float64 `json:"attendance_rate"`
	LowAttendance    bool    `json:"low_attendance"`
}

// GetStudentAnalytics calculates attendance analytics for a student.
func GetStudentAnalytics(
	db *gorm.DB,
	studentID uint,
) (*StudentAttendanceAnalytics, error) {

	var totalClasses int64
	var presentCount int64

	// Total attendance records
	if err := db.Model(&Attendance{}).
		Where("student_id = ?", studentID).
		Count(&totalClasses).Error; err != nil {
		return nil, err
	}

	// Present attendance records
	if err := db.Model(&Attendance{}).
		Where("student_id = ? AND status = ?", studentID, "present").
		Count(&presentCount).Error; err != nil {
		return nil, err
	}

	absentCount := totalClasses - presentCount

	var attendanceRate float64

	if totalClasses > 0 {
		attendanceRate = (float64(presentCount) / float64(totalClasses)) * 100
	}

	return &StudentAttendanceAnalytics{
		StudentID:      studentID,
		TotalClasses:   totalClasses,
		PresentCount:   presentCount,
		AbsentCount:    absentCount,
		AttendanceRate: attendanceRate,
		LowAttendance:  attendanceRate < 75,
	}, nil
}

// GetCurrentStreak calculates the student's current consecutive
// present attendance streak.
func GetCurrentStreak(
	db *gorm.DB,
	studentID uint,
) (int, error) {

	var records []Attendance

	err := db.
		Where("student_id = ?", studentID).
		Order("date DESC").
		Find(&records).Error

	if err != nil {
		return 0, err
	}

	streak := 0

	for _, record := range records {

		if record.Status == "present" {
			streak++
			continue
		}

		break
	}

	return streak, nil
}

// GetAttendanceRate calculates attendance percentage.
func GetAttendanceRate(
	totalClasses int64,
	presentCount int64,
) float64 {

	if totalClasses == 0 {
		return 0
	}

	return (float64(presentCount) / float64(totalClasses)) * 100
}

// IsLowAttendance checks whether attendance is below the
// minimum required percentage.
func IsLowAttendance(attendanceRate float64) bool {
	return attendanceRate < 75
}

// GetDateRange returns the start and end dates for analytics.
func GetDateRange(days int) (time.Time, time.Time) {

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	return startDate, endDate
}