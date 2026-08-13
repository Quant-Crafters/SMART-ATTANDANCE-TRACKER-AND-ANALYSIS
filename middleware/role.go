package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RoleMiddleware allows access only to the specified roles.
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get role from JWT middleware
		role, exists := c.Get("role")

		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "User role not found",
			})
			return
		}

		userRole, ok := role.(string)

		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Invalid user role",
			})
			return
		}

		// Check whether user's role is allowed
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				c.Next()
				return
			}
		}

		// Role not allowed
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
	}
}