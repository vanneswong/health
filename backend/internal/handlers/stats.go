package handlers

import (
	"bp-buddy/pkg/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetSummary(c *gin.Context) {
	userID := c.GetUint("user_id")

	days := 30
	if d := c.Query("days"); d != "" {
		if val, err := strconv.Atoi(d); err == nil && val > 0 {
			days = val
		}
	}

	startDate := time.Now().AddDate(0, 0, -days)
	records := database.FindBPRecordsByDateRange(userID, startDate)

	if len(records) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"avgSystolic":  0,
			"avgDiastolic": 0,
			"avgPulse":     0,
			"maxSystolic":  0,
			"minSystolic":  0,
			"maxDiastolic": 0,
			"minDiastolic": 0,
			"maxPulse":     0,
			"minPulse":     0,
			"count":        0,
			"healthLevel":  "无数据",
			"healthAdvice": "暂无血压记录，请开始记录您的血压数据",
		})
		return
	}

	var sumSystolic, sumDiastolic, sumPulse int
	var maxSystolic, minSystolic, maxDiastolic, minDiastolic, maxPulse, minPulse int

	minSystolic = records[0].Systolic
	minDiastolic = records[0].Diastolic
	minPulse = records[0].Pulse

	for _, r := range records {
		sumSystolic += r.Systolic
		sumDiastolic += r.Diastolic
		sumPulse += r.Pulse

		if r.Systolic > maxSystolic {
			maxSystolic = r.Systolic
		}
		if r.Systolic < minSystolic {
			minSystolic = r.Systolic
		}
		if r.Diastolic > maxDiastolic {
			maxDiastolic = r.Diastolic
		}
		if r.Diastolic < minDiastolic {
			minDiastolic = r.Diastolic
		}
		if r.Pulse > maxPulse {
			maxPulse = r.Pulse
		}
		if r.Pulse < minPulse {
			minPulse = r.Pulse
		}
	}

	count := len(records)
	avgSystolic := sumSystolic / count
	avgDiastolic := sumDiastolic / count
	avgPulse := sumPulse / count

	healthLevel := getHealthLevel(avgSystolic, avgDiastolic)
	healthAdvice := getHealthAdvice(avgSystolic, avgDiastolic)

	c.JSON(http.StatusOK, gin.H{
		"avgSystolic":  avgSystolic,
		"avgDiastolic": avgDiastolic,
		"avgPulse":     avgPulse,
		"maxSystolic":  maxSystolic,
		"minSystolic":  minSystolic,
		"maxDiastolic": maxDiastolic,
		"minDiastolic": minDiastolic,
		"maxPulse":     maxPulse,
		"minPulse":     minPulse,
		"count":        count,
		"healthLevel":  healthLevel,
		"healthAdvice": healthAdvice,
	})
}

func GetTrend(c *gin.Context) {
	userID := c.GetUint("user_id")

	days := 30
	if d := c.Query("days"); d != "" {
		if val, err := strconv.Atoi(d); err == nil && val > 0 {
			days = val
		}
	}

	startDate := time.Now().AddDate(0, 0, -days)
	records := database.FindBPRecordsByDateRange(userID, startDate)

	trendData := make([]gin.H, len(records))
	for i, r := range records {
		level := getHealthLevel(r.Systolic, r.Diastolic)
		trendData[i] = gin.H{
			"id":          r.ID,
			"date":        r.MeasuredAt.Format("2006-01-02"),
			"measured_at": r.MeasuredAt.Format(time.RFC3339),
			"systolic":    r.Systolic,
			"diastolic":   r.Diastolic,
			"pulse":       r.Pulse,
			"healthLevel": level,
			"medication":  r.Medication,
			"notes":       r.Notes,
		}
	}

	c.JSON(http.StatusOK, trendData)
}

func getHealthLevel(systolic, diastolic int) string {
	if systolic < 120 && diastolic < 80 {
		return "正常"
	} else if systolic < 140 && diastolic < 90 {
		return "正常高值"
	} else if systolic < 160 && diastolic < 100 {
		return "高血压1级"
	} else if systolic < 180 && diastolic < 110 {
		return "高血压2级"
	} else {
		return "高血压3级"
	}
}

func getHealthAdvice(systolic, diastolic int) string {
	if systolic < 120 && diastolic < 80 {
		return "血压正常，继续保持健康的生活方式"
	} else if systolic < 140 && diastolic < 90 {
		return "血压偏高，建议改善生活方式：减少盐摄入、适度运动、保持良好心态"
	} else if systolic < 160 && diastolic < 100 {
		return "血压较高，建议就医检查，可能需要药物治疗"
	} else if systolic < 180 && diastolic < 110 {
		return "血压明显偏高，请尽快就医，遵医嘱服药"
	} else {
		return "血压严重偏高，请立即就医！"
	}
}