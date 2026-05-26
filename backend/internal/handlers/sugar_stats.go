package handlers

import (
	"health-buddy/internal/models"
	"health-buddy/pkg/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetSugarSummary(c *gin.Context) {
	userID := c.GetUint("user_id")

	days := 30
	if d := c.Query("days"); d != "" {
		if val, err := strconv.Atoi(d); err == nil && val > 0 {
			days = val
		}
	}

	startDate := time.Now().AddDate(0, 0, -days)
	records := database.FindSugarRecordsByDateRange(userID, startDate)

	if len(records) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"avgSugar":    0,
			"maxSugar":    0,
			"minSugar":    0,
			"count":       0,
			"healthLevel": "无数据",
			"healthAdvice": "暂无血糖记录，请开始记录您的血糖数据",
		})
		return
	}

	var sumSugar float64
	var maxSugar, minSugar float64

	minSugar = records[0].SugarValue

	for _, r := range records {
		sumSugar += r.SugarValue

		if r.SugarValue > maxSugar {
			maxSugar = r.SugarValue
		}
		if r.SugarValue < minSugar {
			minSugar = r.SugarValue
		}
	}

	count := len(records)
	avgSugar := sumSugar / float64(count)

	// 使用最近一条记录的类型来判断健康等级
	lastRecord := records[len(records)-1]
	healthLevel := getSugarHealthLevel(avgSugar, lastRecord.MeasureType)
	healthAdvice := getSugarHealthAdvice(healthLevel)

	c.JSON(http.StatusOK, gin.H{
		"avgSugar":    avgSugar,
		"maxSugar":    maxSugar,
		"minSugar":    minSugar,
		"count":       count,
		"healthLevel": healthLevel,
		"healthAdvice": healthAdvice,
	})
}

func GetSugarTrend(c *gin.Context) {
	userID := c.GetUint("user_id")

	days := 30
	if d := c.Query("days"); d != "" {
		if val, err := strconv.Atoi(d); err == nil && val > 0 {
			days = val
		}
	}

	startDate := time.Now().AddDate(0, 0, -days)
	records := database.FindSugarRecordsByDateRange(userID, startDate)

	trendData := make([]gin.H, len(records))
	for i, r := range records {
		level := getSugarHealthLevel(r.SugarValue, r.MeasureType)
		trendData[i] = gin.H{
			"id":          r.ID,
			"date":        r.MeasureAt.Format("2006-01-02"),
			"measured_at": r.MeasureAt.Format(time.RFC3339),
			"sugar_value": r.SugarValue,
			"measure_type": r.MeasureType,
			"healthLevel": level,
			"medication":  r.Medication,
			"notes":       r.Notes,
		}
	}

	c.JSON(http.StatusOK, trendData)
}

// 血糖健康等级判断（中国标准）
func getSugarHealthLevel(sugarValue float64, measureType models.MeasureType) string {
	switch measureType {
	case "fasting":
		// 空腹血糖标准: 正常 3.9-6.1, 糖尿病前期 6.1-7.0, 糖尿病 >=7.0
		if sugarValue < 3.9 {
			return "偏低"
		} else if sugarValue <= 6.1 {
			return "正常"
		} else if sugarValue < 7.0 {
			return "偏高"
		} else if sugarValue < 10.0 {
			return "较高"
		} else {
			return "严重偏高"
		}
	case "postmeal_2h":
		// 餐后2小时标准: 正常 <7.8, 糖尿病前期 7.8-11.1, 糖尿病 >=11.1
		if sugarValue < 7.8 {
			return "正常"
		} else if sugarValue < 11.1 {
			return "偏高"
		} else if sugarValue < 16.0 {
			return "较高"
		} else {
			return "严重偏高"
		}
	default:
		// 随机/睡前
		if sugarValue < 7.8 {
			return "正常"
		} else if sugarValue < 11.1 {
			return "偏高"
		} else {
			return "较高"
		}
	}
}

func getSugarHealthAdvice(level string) string {
	switch level {
	case "偏低":
		return "血糖偏低，请注意饮食，避免低血糖"
	case "正常":
		return "血糖正常，继续保持健康的生活方式"
	case "偏高":
		return "血糖偏高，建议改善饮食结构、适度运动，定期监测"
	case "较高":
		return "血糖较高，建议就医检查，遵医嘱进行治疗"
	case "严重偏高":
		return "血糖严重偏高，请立即就医！"
	default:
		return "请定期监测血糖"
	}
}