package handlers

import (
	"health-buddy/internal/models"
	"health-buddy/pkg/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetSugarRecords(c *gin.Context) {
	userID := c.GetUint("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	records, total := database.FindSugarRecords(userID, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"records":  records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetSugarRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	record, err := database.FindSugarRecordByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func CreateSugarRecord(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.CreateSugarRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	measureAt := time.Now()
	if req.MeasureAt != "" {
		t, err := time.Parse(time.RFC3339, req.MeasureAt)
		if err == nil {
			measureAt = t
		}
	}

	record := &models.SugarRecord{
		UserID:      userID,
		SugarValue:   req.SugarValue,
		MeasureAt:    measureAt,
		MeasureType:  req.MeasureType,
		MealContext:  req.MealContext,
		Medication:   req.Medication,
		Notes:        req.Notes,
	}

	if err := database.CreateSugarRecord(record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func UpdateSugarRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	record, err := database.FindSugarRecordByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	var req models.UpdateSugarRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	measureAt := record.MeasureAt
	if req.MeasureAt != "" {
		t, err := time.Parse(time.RFC3339, req.MeasureAt)
		if err == nil {
			measureAt = t
		}
	}

	record.SugarValue = req.SugarValue
	record.MeasureAt = measureAt
	record.MeasureType = req.MeasureType
	record.MealContext = req.MealContext
	record.Medication = req.Medication
	record.Notes = req.Notes
	record.UpdatedAt = time.Now()

	if err := database.UpdateSugarRecord(record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func DeleteSugarRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	if err := database.DeleteSugarRecord(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}