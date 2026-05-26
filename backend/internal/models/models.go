package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"password_hash"`
	Profile      Profile   `json:"profile"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Profile struct {
	Name   string `json:"name"`    // 姓名
	Age    int    `json:"age"`     // 年龄
	Height int    `json:"height"`  // 身高(cm)
	Weight int    `json:"weight"`  // 体重(kg)
	Gender string `json:"gender"`  // 性别
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

// 测量类型枚举
type MeasureType string

const (
	MeasureTypeFasting     MeasureType = "fasting"      // 空腹
	MeasureTypePostMeal2h  MeasureType = "postmeal_2h"  // 餐后2小时
	MeasureTypeRandom      MeasureType = "random"       // 随机
	MeasureTypeBeforeSleep MeasureType = "before_sleep" // 睡前
)

// 血糖记录
type SugarRecord struct {
	ID          uint        `json:"id"`
	UserID      uint        `json:"user_id"`
	SugarValue   float64     `json:"sugar_value"`    // 血糖值 mmol/L
	MeasureAt    time.Time   `json:"measure_at"`     // 测量时间
	MeasureType  MeasureType `json:"measure_type"`   // 测量类型
	MealContext  string      `json:"meal_context"`   // 餐前/餐后备注
	Medication   string      `json:"medication"`     // 用药
	Notes        string      `json:"notes"`          // 备注
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
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

type UpdateProfileRequest struct {
	Name   string `json:"name"`
	Age    int    `json:"age" binding:"min=0,max=150"`
	Height int    `json:"height" binding:"min=0,max=300"`
	Weight int    `json:"weight" binding:"min=0,max=500"`
	Gender string `json:"gender"`
}

// 血糖记录请求
type CreateSugarRecordRequest struct {
	SugarValue   float64     `json:"sugar_value" binding:"required,min=1,max=40"`
	MeasureAt    string      `json:"measure_at"`
	MeasureType  MeasureType `json:"measure_type" binding:"required"`
	MealContext  string      `json:"meal_context"`
	Medication   string      `json:"medication"`
	Notes        string      `json:"notes"`
}

type UpdateSugarRecordRequest struct {
	SugarValue   float64     `json:"sugar_value" binding:"required,min=1,max=40"`
	MeasureAt    string      `json:"measure_at"`
	MeasureType  MeasureType `json:"measure_type" binding:"required"`
	MealContext  string      `json:"meal_context"`
	Medication   string      `json:"medication"`
	Notes        string      `json:"notes"`
}

// 用药频率类型
type FrequencyType string

const (
	FrequencyDaily     FrequencyType = "daily"      // 每天
	FrequencyTwiceDaily FrequencyType = "twice_daily" // 每天两次
	FrequencyThreeDaily FrequencyType = "three_daily" // 每天三次
	FrequencyWeekly    FrequencyType = "weekly"     // 每周
	FrequencyCustom    FrequencyType = "custom"     // 自定义
)

// 药品信息
type Medication struct {
	ID           uint      `json:"id"`
	UserID       uint      `json:"user_id"`
	Name         string    `json:"name"`          // 药品名称
	Dosage       string    `json:"dosage"`        // 剂量（如：10mg）
	Unit         string    `json:"unit"`          // 单位（片、粒、ml等）
	Frequency    FrequencyType `json:"frequency"`  // 服用频率
	Times        []string  `json:"times"`         // 服用时间点（如：["08:00", "20:00"]）
	Duration     int       `json:"duration"`      // 用药天数（0表示长期）
	StartDate    time.Time `json:"start_date"`    // 开始日期
	EndDate      *time.Time `json:"end_date"`     // 结束日期（null表示长期）
	Notes        string    `json:"notes"`         // 备注
	IsActive     bool      `json:"is_active"`     // 是否正在使用
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// 服药记录（打卡）
type MedicationLog struct {
	ID           uint      `json:"id"`
	UserID       uint      `json:"user_id"`
	MedicationID uint      `json:"medication_id"`
	MedicationName string  `json:"medication_name"` // 药品名称快照
	Dosage       string    `json:"dosage"`          // 实际服用剂量
	ScheduledTime string   `json:"scheduled_time"`  // 计划服用时间
	TakenAt      time.Time `json:"taken_at"`        // 实际服用时间
	Status       string    `json:"status"`          // taken/skipped/missed
	Notes        string    `json:"notes"`           // 备注
	CreatedAt    time.Time `json:"created_at"`
}

// 用药计划请求
type CreateMedicationRequest struct {
	Name      string        `json:"name" binding:"required"`
	Dosage    string        `json:"dosage" binding:"required"`
	Unit      string        `json:"unit"`
	Frequency FrequencyType `json:"frequency" binding:"required"`
	Times     []string      `json:"times"`
	Duration  int           `json:"duration"`           // 用药天数
	StartDate string        `json:"start_date"`         // 开始日期
	Notes     string        `json:"notes"`
}

type UpdateMedicationRequest struct {
	Name      string        `json:"name" binding:"required"`
	Dosage    string        `json:"dosage" binding:"required"`
	Unit      string        `json:"unit"`
	Frequency FrequencyType `json:"frequency" binding:"required"`
	Times     []string      `json:"times"`
	Duration  int           `json:"duration"`
	StartDate string        `json:"start_date"`
	Notes     string        `json:"notes"`
	IsActive  bool          `json:"is_active"`
}

// 服药打卡请求
type CreateMedicationLogRequest struct {
	MedicationID   uint   `json:"medication_id" binding:"required"`
	Dosage         string `json:"dosage"`
	ScheduledTime  string `json:"scheduled_time"`
	TakenAt        string `json:"taken_at"`        // 实际服用时间
	Status         string `json:"status" binding:"required"` // taken/skipped/missed
	Notes          string `json:"notes"`
}