package database

import (
	"bp-buddy/internal/models"
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
	dataFile = "bp_buddy.json"
)

type Store struct {
	Users     []models.User     `json:"users"`
	BPRecords []models.BPRecord `json:"bp_records"`
}

func InitDB() {
	DB = &Store{
		Users:     []models.User{},
		BPRecords: []models.BPRecord{},
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