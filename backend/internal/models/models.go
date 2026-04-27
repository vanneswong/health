package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"password_hash"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type BPRecord struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	Systolic   int       `gorm:"not null" json:"systolic"`     // 收缩压
	Diastolic  int       `gorm:"not null" json:"diastolic"`    // 舒张压
	Pulse      int       `gorm:"not null" json:"pulse"`        // 脉搏
	MeasuredAt time.Time `gorm:"not null;index" json:"measured_at"` // 测量时间
	Medication string    `json:"medication"`                   // 用药
	Notes      string    `json:"notes"`                        // 备注
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type CreateRecordRequest struct {
	Systolic   int    `json:"systolic" binding:"required,min=60,max=250"`
	Diastolic  int    `json:"diastolic" binding:"required,min=40,max=150"`
	Pulse      int    `json:"pulse" binding:"required,min=30,max=200"`
	MeasuredAt string `json:"measured_at"` // ISO格式时间字符串
	Medication string `json:"medication"`
	Notes      string `json:"notes"`
}

type UpdateRecordRequest struct {
	Systolic   int    `json:"systolic" binding:"required,min=60,max=250"`
	Diastolic  int    `json:"diastolic" binding:"required,min=40,max=150"`
	Pulse      int    `json:"pulse" binding:"required,min=30,max=200"`
	MeasuredAt string `json:"measured_at"`
	Medication string `json:"medication"`
	Notes      string `json:"notes"`
}