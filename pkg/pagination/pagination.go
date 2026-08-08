package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func GetPagination(c *gin.Context) Pagination {

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	// Prevent excessively large requests.
	if limit > 100 {
		limit = 100
	}

	return Pagination{
		Page:  page,
		Limit: limit,
	}
}

func (p *Pagination) SetTotal(total int64) {

	p.Total = total

	p.TotalPages = int((total + int64(p.Limit) - 1) / int64(p.Limit))
}

func (p Pagination) Offset() int {
	return (p.Page - 1) * p.Limit
}