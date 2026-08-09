package database

import (
	"log"

	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/config"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/attendence"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/auth"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/department"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/faculty"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/qrattendance"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/student"
	"github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS/internal/subject"
)

// Migrate runs all database migrations.
func Migrate() {
	if config.DB == nil {
		log.Println("⚠ Database connection is not available")
		return
	}

err := config.DB.AutoMigrate(
	&auth.User{},
	&student.Student{},
	&faculty.Faculty{},
	&department.Department{},
	&subject.Subject{},
	&attendence.Attendance{},
	&qrattendance.QRSession{},
	&qrattendance.QRCode{},
)

	if err != nil {
		log.Fatal("❌ Database migration failed:", err)
	}

	log.Println("✅ Database Migrated Successfully")
}