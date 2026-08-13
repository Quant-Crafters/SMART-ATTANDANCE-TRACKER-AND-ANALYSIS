
package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/department"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterDepartmentRoutes registers all department routes.
func RegisterDepartmentRoutes(router *gin.Engine) {

	handler := department.NewHandler()

	api := router.Group("/api/departments")
	{
		// Get all departments
		api.GET(
			"/",
			middleware.AuthMiddleware(),
			handler.GetDepartments,
		)

		// Get department by ID
		api.GET(
			"/:id",
			middleware.AuthMiddleware(),
			handler.GetDepartmentByID,
		)

		// Create department - Admin only
		api.POST(
			"/",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.CreateDepartment,
		)

		// Update department - Admin only
		api.PUT(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.UpdateDepartment,
		)

		// Delete department - Admin only
		api.DELETE(
			"/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.DeleteDepartment,
		)
	}
}