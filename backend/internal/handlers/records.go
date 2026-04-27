package handlers

import (
	"bp-buddy/internal/models"
	"bp-buddy/pkg/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetRecords(c *gin.Context) {
	userID := c.GetUint("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	records, total := database.FindBPRecords(userID, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"records":  records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	record, err := database.FindBPRecordByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func CreateRecord(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.CreateRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	measuredAt := time.Now()
	if req.MeasuredAt != "" {
		t, err := time.Parse(time.RFC3339, req.MeasuredAt)
		if err == nil {
			measuredAt = t
		}
	}

	record := &models.BPRecord{
		UserID:     userID,
		Systolic:   req.Systolic,
		Diastolic:  req.Diastolic,
		Pulse:      req.Pulse,
		MeasuredAt: measuredAt,
		Medication: req.Medication,
		Notes:      req.Notes,
	}

	if err := database.CreateBPRecord(record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func UpdateRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	record, err := database.FindBPRecordByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	var req models.UpdateRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	measuredAt := record.MeasuredAt
	if req.MeasuredAt != "" {
		t, err := time.Parse(time.RFC3339, req.MeasuredAt)
		if err == nil {
			measuredAt = t
		}
	}

	record.Systolic = req.Systolic
	record.Diastolic = req.Diastolic
	record.Pulse = req.Pulse
	record.MeasuredAt = measuredAt
	record.Medication = req.Medication
	record.Notes = req.Notes
	record.UpdatedAt = time.Now()

	if err := database.UpdateBPRecord(record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func DeleteRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	if err := database.DeleteBPRecord(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}