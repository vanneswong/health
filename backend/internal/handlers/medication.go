package handlers

import (
	"health-buddy/internal/models"
	"health-buddy/pkg/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetMedications 获取用户所有药品
func GetMedications(c *gin.Context) {
	userID := c.GetUint("user_id")

	activeOnly := c.Query("active") == "true"

	if activeOnly {
		meds := database.FindActiveMedications(userID)
		c.JSON(http.StatusOK, gin.H{"medications": meds})
	} else {
		meds := database.FindMedications(userID)
		c.JSON(http.StatusOK, gin.H{"medications": meds})
	}
}

// GetMedication 获取单个药品
func GetMedication(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	med, err := database.FindMedicationByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药品不存在"})
		return
	}

	c.JSON(http.StatusOK, med)
}

// CreateMedication 创建药品计划
func CreateMedication(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.CreateMedicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	startDate := time.Now()
	if req.StartDate != "" {
		t, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			startDate = t
		}
	}

	med := &models.Medication{
		UserID:    userID,
		Name:      req.Name,
		Dosage:    req.Dosage,
		Unit:      req.Unit,
		Frequency: req.Frequency,
		Times:     req.Times,
		Duration:  req.Duration,
		StartDate: startDate,
		Notes:     req.Notes,
	}

	if req.Duration > 0 {
		endDate := startDate.AddDate(0, 0, req.Duration)
		med.EndDate = &endDate
	}

	if err := database.CreateMedication(med); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, med)
}

// UpdateMedication 更新药品计划
func UpdateMedication(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	med, err := database.FindMedicationByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药品不存在"})
		return
	}

	var req models.UpdateMedicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	startDate := med.StartDate
	if req.StartDate != "" {
		t, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			startDate = t
		}
	}

	med.Name = req.Name
	med.Dosage = req.Dosage
	med.Unit = req.Unit
	med.Frequency = req.Frequency
	med.Times = req.Times
	med.Duration = req.Duration
	med.StartDate = startDate
	med.Notes = req.Notes
	med.IsActive = req.IsActive

	if req.Duration > 0 {
		endDate := startDate.AddDate(0, 0, req.Duration)
		med.EndDate = &endDate
	}

	if err := database.UpdateMedication(med); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, med)
}

// DeleteMedication 删除药品计划
func DeleteMedication(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	if err := database.DeleteMedication(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药品不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// CreateMedicationLog 服药打卡
func CreateMedicationLog(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.CreateMedicationLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 获取药品信息
	med, err := database.FindMedicationByID(req.MedicationID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药品不存在"})
		return
	}

	takenAt := time.Now()
	if req.TakenAt != "" {
		t, err := time.Parse(time.RFC3339, req.TakenAt)
		if err == nil {
			takenAt = t
		}
	}

	dosage := req.Dosage
	if dosage == "" {
		dosage = med.Dosage
	}

	log := &models.MedicationLog{
		UserID:         userID,
		MedicationID:   req.MedicationID,
		MedicationName: med.Name,
		Dosage:         dosage,
		ScheduledTime:  req.ScheduledTime,
		TakenAt:        takenAt,
		Status:         req.Status,
		Notes:          req.Notes,
	}

	if err := database.CreateMedicationLog(log); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "记录失败"})
		return
	}

	c.JSON(http.StatusOK, log)
}

// GetMedicationLogs 获取服药记录
func GetMedicationLogs(c *gin.Context) {
	userID := c.GetUint("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	logs, total := database.FindMedicationLogs(userID, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"logs":     logs,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// GetTodayMedicationLogs 获取今日服药记录
func GetTodayMedicationLogs(c *gin.Context) {
	userID := c.GetUint("user_id")

	logs := database.FindMedicationLogsByDate(userID, time.Now())
	activeMeds := database.FindActiveMedications(userID)

	// 计算今日服药进度
	takenCount := 0
	for _, log := range logs {
		if log.Status == "taken" {
			takenCount++
		}
	}

	// 估算今日应该服用的次数
	expectedCount := 0
	for _, med := range activeMeds {
		switch med.Frequency {
		case models.FrequencyDaily:
			expectedCount += len(med.Times)
		case models.FrequencyTwiceDaily:
			expectedCount += 2
		case models.FrequencyThreeDaily:
			expectedCount += 3
		case models.FrequencyWeekly:
			// 检查是否是今天
			if med.StartDate.Weekday() == time.Now().Weekday() {
				expectedCount += len(med.Times)
			}
		default:
			expectedCount += len(med.Times)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":           logs,
		"active_meds":    activeMeds,
		"taken_count":    takenCount,
		"expected_count": expectedCount,
	})
}

// GetMedicationStats 获取用药统计
func GetMedicationStats(c *gin.Context) {
	userID := c.GetUint("user_id")
	days := 30

	daysStr := c.Query("days")
	if daysStr != "" {
		if val, err := strconv.Atoi(daysStr); err == nil && val > 0 {
			days = val
		}
	}

	activeMeds := database.FindActiveMedications(userID)

	stats := make([]gin.H, len(activeMeds))
	for i, med := range activeMeds {
		logs := database.FindMedicationLogsByMedication(userID, med.ID, days)

		takenCount := 0
		skippedCount := 0
		missedCount := 0

		for _, log := range logs {
			switch log.Status {
			case "taken":
				takenCount++
			case "skipped":
				skippedCount++
			case "missed":
				missedCount++
			}
		}

		adherenceRate := 0.0
		totalLogs := takenCount + skippedCount + missedCount
		if totalLogs > 0 {
			adherenceRate = float64(takenCount) / float64(totalLogs) * 100
		}

		stats[i] = gin.H{
			"medication_id":   med.ID,
			"medication_name": med.Name,
			"dosage":          med.Dosage,
			"frequency":       med.Frequency,
			"taken_count":     takenCount,
			"skipped_count":   skippedCount,
			"missed_count":    missedCount,
			"adherence_rate":  adherenceRate,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"days":  days,
	})
}