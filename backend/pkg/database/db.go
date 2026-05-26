package database

import (
	"health-buddy/internal/models"
	"encoding/json"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
	"sync"
	"time"
)

var (
	DB     *Store
	dbLock sync.Mutex
	dataFile = "health_buddy.json"
)

type Store struct {
	Users         []models.User         `json:"users"`
	BPRecords     []models.BPRecord     `json:"bp_records"`
	SugarRecords  []models.SugarRecord  `json:"sugar_records"`
	Medications   []models.Medication   `json:"medications"`
	MedicationLogs []models.MedicationLog `json:"medication_logs"`
}

func InitDB() {
	DB = &Store{
		Users:          []models.User{},
		BPRecords:      []models.BPRecord{},
		SugarRecords:   []models.SugarRecord{},
		Medications:    []models.Medication{},
		MedicationLogs: []models.MedicationLog{},
	}

	// 读取数据文件
	if data, err := os.ReadFile(dataFile); err == nil {
		if err := json.Unmarshal(data, DB); err != nil {
			log.Println("Failed to parse data file:", err)
		}
	}

	// 创建默认用户
	createDefaultUser()
}

func saveData() {
	dbLock.Lock()
	defer dbLock.Unlock()

	data, err := json.MarshalIndent(DB, "", "  ")
	if err != nil {
		log.Println("Failed to marshal data:", err)
		return
	}

	if err := os.WriteFile(dataFile, data, 0644); err != nil {
		log.Println("Failed to write data file:", err)
	}
}

func createDefaultUser() {
	if len(DB.Users) == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Failed to hash password:", err)
		}
		user := models.User{
			ID:           1,
			Username:     "admin",
			PasswordHash: string(hashedPassword),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		DB.Users = append(DB.Users, user)
		saveData()
		log.Println("Default user created: admin/admin")
	}
}

// User operations
func FindUserByUsername(username string) (*models.User, error) {
	for i := range DB.Users {
		if DB.Users[i].Username == username {
			return &DB.Users[i], nil
		}
	}
	return nil, os.ErrNotExist
}

func FindUserByID(id uint) (*models.User, error) {
	for i := range DB.Users {
		if DB.Users[i].ID == id {
			return &DB.Users[i], nil
		}
	}
	return nil, os.ErrNotExist
}

func UpdateUser(user *models.User) error {
	for i := range DB.Users {
		if DB.Users[i].ID == user.ID {
			DB.Users[i] = *user
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

// BPRecord operations
func CreateBPRecord(record *models.BPRecord) error {
	record.ID = uint(len(DB.BPRecords) + 1)
	record.CreatedAt = time.Now()
	record.UpdatedAt = time.Now()
	DB.BPRecords = append(DB.BPRecords, *record)
	saveData()
	return nil
}

func FindBPRecordByID(id uint, userID uint) (*models.BPRecord, error) {
	for i := range DB.BPRecords {
		if DB.BPRecords[i].ID == id && DB.BPRecords[i].UserID == userID {
			return &DB.BPRecords[i], nil
		}
	}
	return nil, os.ErrNotExist
}

func UpdateBPRecord(record *models.BPRecord) error {
	for i := range DB.BPRecords {
		if DB.BPRecords[i].ID == record.ID {
			DB.BPRecords[i] = *record
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func DeleteBPRecord(id uint, userID uint) error {
	for i := range DB.BPRecords {
		if DB.BPRecords[i].ID == id && DB.BPRecords[i].UserID == userID {
			DB.BPRecords = append(DB.BPRecords[:i], DB.BPRecords[i+1:]...)
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func FindBPRecords(userID uint, page int, pageSize int) ([]models.BPRecord, int64) {
	var records []models.BPRecord
	for i := len(DB.BPRecords) - 1; i >= 0; i-- {
		if DB.BPRecords[i].UserID == userID {
			records = append(records, DB.BPRecords[i])
		}
	}

	total := int64(len(records))
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(records) {
		return []models.BPRecord{}, total
	}
	if end > len(records) {
		end = len(records)
	}

	return records[start:end], total
}

func FindBPRecordsByDateRange(userID uint, startDate time.Time) []models.BPRecord {
	var records []models.BPRecord
	for i := range DB.BPRecords {
		if DB.BPRecords[i].UserID == userID && DB.BPRecords[i].MeasuredAt.After(startDate) {
			records = append(records, DB.BPRecords[i])
		}
	}
	return records
}

// SugarRecord operations
func CreateSugarRecord(record *models.SugarRecord) error {
	record.ID = uint(len(DB.SugarRecords) + 1)
	record.CreatedAt = time.Now()
	record.UpdatedAt = time.Now()
	DB.SugarRecords = append(DB.SugarRecords, *record)
	saveData()
	return nil
}

func FindSugarRecordByID(id uint, userID uint) (*models.SugarRecord, error) {
	for i := range DB.SugarRecords {
		if DB.SugarRecords[i].ID == id && DB.SugarRecords[i].UserID == userID {
			return &DB.SugarRecords[i], nil
		}
	}
	return nil, os.ErrNotExist
}

func UpdateSugarRecord(record *models.SugarRecord) error {
	for i := range DB.SugarRecords {
		if DB.SugarRecords[i].ID == record.ID {
			DB.SugarRecords[i] = *record
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func DeleteSugarRecord(id uint, userID uint) error {
	for i := range DB.SugarRecords {
		if DB.SugarRecords[i].ID == id && DB.SugarRecords[i].UserID == userID {
			DB.SugarRecords = append(DB.SugarRecords[:i], DB.SugarRecords[i+1:]...)
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func FindSugarRecords(userID uint, page int, pageSize int) ([]models.SugarRecord, int64) {
	var records []models.SugarRecord
	for i := len(DB.SugarRecords) - 1; i >= 0; i-- {
		if DB.SugarRecords[i].UserID == userID {
			records = append(records, DB.SugarRecords[i])
		}
	}

	total := int64(len(records))
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(records) {
		return []models.SugarRecord{}, total
	}
	if end > len(records) {
		end = len(records)
	}

	return records[start:end], total
}

func FindSugarRecordsByDateRange(userID uint, startDate time.Time) []models.SugarRecord {
	var records []models.SugarRecord
	for i := range DB.SugarRecords {
		if DB.SugarRecords[i].UserID == userID && DB.SugarRecords[i].MeasureAt.After(startDate) {
			records = append(records, DB.SugarRecords[i])
		}
	}
	return records
}

// Medication operations
func CreateMedication(med *models.Medication) error {
	med.ID = uint(len(DB.Medications) + 1)
	med.CreatedAt = time.Now()
	med.UpdatedAt = time.Now()
	med.IsActive = true
	DB.Medications = append(DB.Medications, *med)
	saveData()
	return nil
}

func FindMedicationByID(id uint, userID uint) (*models.Medication, error) {
	for i := range DB.Medications {
		if DB.Medications[i].ID == id && DB.Medications[i].UserID == userID {
			return &DB.Medications[i], nil
		}
	}
	return nil, os.ErrNotExist
}

func UpdateMedication(med *models.Medication) error {
	for i := range DB.Medications {
		if DB.Medications[i].ID == med.ID {
			DB.Medications[i] = *med
			DB.Medications[i].UpdatedAt = time.Now()
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func DeleteMedication(id uint, userID uint) error {
	for i := range DB.Medications {
		if DB.Medications[i].ID == id && DB.Medications[i].UserID == userID {
			DB.Medications = append(DB.Medications[:i], DB.Medications[i+1:]...)
			saveData()
			return nil
		}
	}
	return os.ErrNotExist
}

func FindMedications(userID uint) []models.Medication {
	var meds []models.Medication
	for i := range DB.Medications {
		if DB.Medications[i].UserID == userID {
			meds = append(meds, DB.Medications[i])
		}
	}
	return meds
}

func FindActiveMedications(userID uint) []models.Medication {
	var meds []models.Medication
	for i := range DB.Medications {
		if DB.Medications[i].UserID == userID && DB.Medications[i].IsActive {
			meds = append(meds, DB.Medications[i])
		}
	}
	return meds
}

// MedicationLog operations
func CreateMedicationLog(log *models.MedicationLog) error {
	log.ID = uint(len(DB.MedicationLogs) + 1)
	log.CreatedAt = time.Now()
	DB.MedicationLogs = append(DB.MedicationLogs, *log)
	saveData()
	return nil
}

func FindMedicationLogs(userID uint, page int, pageSize int) ([]models.MedicationLog, int64) {
	var logs []models.MedicationLog
	for i := len(DB.MedicationLogs) - 1; i >= 0; i-- {
		if DB.MedicationLogs[i].UserID == userID {
			logs = append(logs, DB.MedicationLogs[i])
		}
	}

	total := int64(len(logs))
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(logs) {
		return []models.MedicationLog{}, total
	}
	if end > len(logs) {
		end = len(logs)
	}

	return logs[start:end], total
}

func FindMedicationLogsByDate(userID uint, date time.Time) []models.MedicationLog {
	var logs []models.MedicationLog
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	for i := range DB.MedicationLogs {
		if DB.MedicationLogs[i].UserID == userID &&
			DB.MedicationLogs[i].TakenAt.After(startOfDay) &&
			DB.MedicationLogs[i].TakenAt.Before(endOfDay) {
			logs = append(logs, DB.MedicationLogs[i])
		}
	}
	return logs
}

func FindMedicationLogsByMedication(userID uint, medicationID uint, days int) []models.MedicationLog {
	var logs []models.MedicationLog
	startDate := time.Now().AddDate(0, 0, -days)

	for i := range DB.MedicationLogs {
		if DB.MedicationLogs[i].UserID == userID &&
			DB.MedicationLogs[i].MedicationID == medicationID &&
			DB.MedicationLogs[i].TakenAt.After(startDate) {
			logs = append(logs, DB.MedicationLogs[i])
		}
	}
	return logs
}