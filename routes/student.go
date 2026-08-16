package routes

import (
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/middleware"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
	"github.com/gin-gonic/gin"
)

// RegisterStudentRoutes registers all student routes.
func RegisterStudentRoutes(router *gin.Engine) {

	handler := student.NewHandler()

	api := router.Group("/api")
	{
		// Student can view ONLY their own profile added by me
		api.GET(
			"/students/me",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("student"),
			handler.GetMyStudent,
		)

		// Admin & Faculty can view all students
		api.GET(
			"/students",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GetAllStudents,
		)

		// Admin & Faculty can view a single student
		api.GET(
			"/students/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin", "faculty"),
			handler.GetStudentByID,
		)

		// Admin Only - Create Student
		api.POST(
			"/students",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.CreateStudent,
		)

		// Admin Only - Update Student
		api.PUT(
			"/students/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.UpdateStudent,
		)

		// Admin Only - Delete Student
		api.DELETE(
			"/students/:id",
			middleware.AuthMiddleware(),
			middleware.RoleMiddleware("admin"),
			handler.DeleteStudent,
		)
	}
}
