package middleware

import (
	"net/http"
	"strings"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/faculty"
	jwtutil "github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/jwt"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifies JWT token and stores authenticated
// user information in the Gin request context.
func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		// --------------------------------------------------
		// Read Authorization header
		// --------------------------------------------------

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header missing",
			})

			c.Abort()
			return
		}

		// --------------------------------------------------
		// Extract Bearer token
		// --------------------------------------------------

		tokenString := strings.TrimPrefix(
			authHeader,
			"Bearer ",
		)

		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization format",
			})

			c.Abort()
			return
		}

		// --------------------------------------------------
		// Validate JWT
		// --------------------------------------------------

		claims, err := jwtutil.ValidateToken(tokenString)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
			})

			c.Abort()
			return
		}

		// --------------------------------------------------
		// Save basic user information
		// --------------------------------------------------

		c.Set(
			"user_id",
			claims.UserID,
		)

		c.Set(
			"email",
			claims.Email,
		)

		role := strings.ToLower(
			strings.TrimSpace(claims.Role),
		)

		c.Set(
			"role",
			role,
		)

		// --------------------------------------------------
		// Faculty identity
		// --------------------------------------------------
		//
		// For a faculty account, resolve the actual faculty
		// table ID from the authenticated email.
		//
		// This is important because the client must NOT be
		// trusted to send an arbitrary faculty_id.
		// --------------------------------------------------

		if role == "faculty" {

			repository := faculty.NewRepository()

			facultyMember, err :=
				repository.GetByEmail(
					claims.Email,
				)

			if err != nil ||
				facultyMember == nil {

				c.JSON(
					http.StatusForbidden,
					gin.H{
						"success": false,
						"message": "Faculty profile not found",
					},
				)

				c.Abort()
				return
			}

			// Store the real faculty table ID.
			c.Set(
				"faculty_id",
				facultyMember.ID,
			)

			// Also store useful faculty information.
			c.Set(
				"faculty_profile",
				facultyMember,
			)
		}

		c.Next()
	}
}
