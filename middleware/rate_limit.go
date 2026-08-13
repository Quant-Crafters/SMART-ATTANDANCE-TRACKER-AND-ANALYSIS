package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	lastRequest time.Time
	count       int
}

var (
	visitors = make(map[string]*visitor)
	mu       sync.Mutex
)

// RateLimitMiddleware limits requests from each IP.
// Limit: 60 requests per minute.
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		ip := c.ClientIP()
		now := time.Now()

		mu.Lock()

		v, exists := visitors[ip]

		if !exists || now.Sub(v.lastRequest) >= time.Minute {
			visitors[ip] = &visitor{
				lastRequest: now,
				count:       1,
			}
			mu.Unlock()

			c.Next()
			return
		}

		v.count++

		if v.count > 60 {
			mu.Unlock()

			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		mu.Unlock()

		c.Next()
	}
}