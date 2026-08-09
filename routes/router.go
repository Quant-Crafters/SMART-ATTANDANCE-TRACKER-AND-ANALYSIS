package routes

import "github.com/gin-gonic/gin"

// SetupRouter registers all application routes.
func SetupRouter(router *gin.Engine) {

	// Authentication
	RegisterAuthRoutes(router)

	// Students
	RegisterStudentRoutes(router)

	// Faculty
	RegisterFacultyRoutes(router)

	// Departments
	RegisterDepartmentRoutes(router)

	// Subjects
	RegisterSubjectRoutes(router)

	// Attendance
	RegisterAttendenceRoutes(router)

	// Analytics
	RegisterAnalyticsRoutes(router)

	// Reports
	RegisterReportRoutes(router)
}