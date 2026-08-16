package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/faculty"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterFacultyRoutes registers all faculty routes.
func RegisterFacultyRoutes(router *gin.Engine) {

	handler := faculty.NewHandler()

	api := router.Group("/api/faculty")
	{
		// Logged-in faculty can view ONLY their own profile.
		api.GET(
			"/me",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("faculty"),
			handler.GetMyFaculty,
		)

		// Authenticated users can view faculty directory.
		// Frontend will show this to admin.
		api.GET(
			"/",
			middleware.AuthMiddleware(),
			handler.GetFaculties,
		)

		// Get faculty by ID.
		api.GET(
			"/:id",
			middleware.AuthMiddleware(),
			handler.GetFacultyByID,
		)

		// Create faculty - Admin only.
		api.POST(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.CreateFaculty,
		)

		// Update faculty - Admin only.
		api.PUT(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.UpdateFaculty,
		)

		// Delete faculty - Admin only.
		api.DELETE(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.DeleteFaculty,
		)
	}
}
