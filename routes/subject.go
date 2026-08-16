package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/subject"
	"github.com/gin-gonic/gin"
)

// RegisterSubjectRoutes registers all subject routes.
func RegisterSubjectRoutes(router *gin.Engine) {

	handler := subject.NewHandler()

	api := router.Group("/api/subjects")
	{
		// Get all subjects
		api.GET(
			"/",
			middleware.AuthMiddleware(),
			handler.GetSubjects,
		)

		// Get subject by ID
		api.GET(
			"/:id",
			middleware.AuthMiddleware(),
			handler.GetSubjectByID,
		)

		// Create subject - Admin only
		api.POST(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.CreateSubject,
		)

		// Update subject - Admin only
		api.PUT(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.UpdateSubject,
		)

		// Delete subject - Admin only
		api.DELETE(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.DeleteSubject,
		)
	}
}
