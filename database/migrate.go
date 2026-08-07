package database

import (
	"log"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
)

func Migrate() {

	err := config.DB.AutoMigrate(
		&auth.User{},
		&student.Student{},
	)

	if err != nil {
		log.Fatal("❌ Migration Failed:", err)
	}

	log.Println("✅ Database Migrated Successfully")
}