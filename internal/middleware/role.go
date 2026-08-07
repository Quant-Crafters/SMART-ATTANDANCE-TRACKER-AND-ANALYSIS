package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RoleMiddleware checks if the user has one of the allowed roles.
func RoleMiddleware(roles ...string) gin.HandlerFunc {

	return func(c *gin.Context) {

		role := c.GetString("role")

		for _, allowedRole := range roles {

			if role == allowedRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})

		c.Abort()
	}
}