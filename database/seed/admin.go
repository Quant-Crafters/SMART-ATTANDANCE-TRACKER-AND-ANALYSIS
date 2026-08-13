package seed

import (
	"log"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/pkg/password"
)

func SeedAdmin() {

	var count int64

	config.DB.Model(&auth.User{}).Where("email = ?", "admin@attendsmart.com").Count(&count)

	if count > 0 {
		log.Println("✅ Admin already exists")
		return
	}

	hashedPassword, err := password.HashPassword("Admin@123")
	if err != nil {
		log.Fatal(err)
	}

	admin := auth.User{
		Name:     "Admin",
		Email:    "admin@attendsmart.com",
		Password: hashedPassword,
		Role:     "admin",
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Default Admin Created")
}