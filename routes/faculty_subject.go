package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/faculty_subject"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterFacultySubjectRoutes registers faculty-subject assignment routes.
func RegisterFacultySubjectRoutes(router *gin.Engine) {

	handler := faculty_subject.NewHandler()

	api := router.Group("/api/faculty-subjects")
	{
		// --------------------------------------------------
		// Faculty:
		// Get only their own assigned subjects.
		// --------------------------------------------------
		api.GET(
			"/me",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("faculty"),
			handler.GetMySubjects,
		)

		// --------------------------------------------------
		// Admin:
		// Assign a subject to a faculty member.
		// --------------------------------------------------
		api.POST(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.AssignSubject,
		)

		// --------------------------------------------------
		// Admin:
		// Get all subjects assigned to a faculty member.
		// --------------------------------------------------
		api.GET(
			"/faculty/:faculty_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.GetFacultySubjects,
		)

		// --------------------------------------------------
		// Admin:
		// Remove a subject assignment.
		// --------------------------------------------------
		api.DELETE(
			"/faculty/:faculty_id/subject/:subject_id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.RemoveSubjectAssignment,
		)
	}
}
