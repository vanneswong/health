package main

import (
	"health-buddy/internal/handlers"
	"health-buddy/internal/middleware"
	"health-buddy/pkg/database"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	database.InitDB()

	// 设置运行模式
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建路由
	r := gin.Default()

	// 配置CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 认证路由（无需登录）
	auth := r.Group("/api/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.PUT("/password", middleware.AuthMiddleware(), handlers.ChangePassword)
	}

	// 个人资料路由（需要登录）
	profile := r.Group("/api/profile")
	profile.Use(middleware.AuthMiddleware())
	{
		profile.GET("", handlers.GetProfile)
		profile.PUT("", handlers.UpdateProfile)
	}

	// 血压记录路由（需要登录）
	records := r.Group("/api/records")
	records.Use(middleware.AuthMiddleware())
	{
		records.GET("", handlers.GetRecords)
		records.GET("/:id", handlers.GetRecord)
		records.POST("", handlers.CreateRecord)
		records.PUT("/:id", handlers.UpdateRecord)
		records.DELETE("/:id", handlers.DeleteRecord)
	}

	// 统计路由（需要登录）
	stats := r.Group("/api/stats")
	stats.Use(middleware.AuthMiddleware())
	{
		stats.GET("/summary", handlers.GetSummary)
		stats.GET("/trend", handlers.GetTrend)
	}

	// 血糖记录路由（需要登录）
	sugar := r.Group("/api/sugar")
	sugar.Use(middleware.AuthMiddleware())
	{
		sugar.GET("", handlers.GetSugarRecords)
		sugar.GET("/:id", handlers.GetSugarRecord)
		sugar.POST("", handlers.CreateSugarRecord)
		sugar.PUT("/:id", handlers.UpdateSugarRecord)
		sugar.DELETE("/:id", handlers.DeleteSugarRecord)
	}

	// 血糖统计路由（需要登录）
	sugarStats := r.Group("/api/sugar/stats")
	sugarStats.Use(middleware.AuthMiddleware())
	{
		sugarStats.GET("/summary", handlers.GetSugarSummary)
		sugarStats.GET("/trend", handlers.GetSugarTrend)
	}

	// 用药管理路由（需要登录）
	medication := r.Group("/api/medication")
	medication.Use(middleware.AuthMiddleware())
	{
		medication.GET("", handlers.GetMedications)
		medication.GET("/:id", handlers.GetMedication)
		medication.POST("", handlers.CreateMedication)
		medication.PUT("/:id", handlers.UpdateMedication)
		medication.DELETE("/:id", handlers.DeleteMedication)
	}

	// 服药记录路由（需要登录）
	medicationLogs := r.Group("/api/medication/logs")
	medicationLogs.Use(middleware.AuthMiddleware())
	{
		medicationLogs.GET("", handlers.GetMedicationLogs)
		medicationLogs.GET("/today", handlers.GetTodayMedicationLogs)
		medicationLogs.POST("", handlers.CreateMedicationLog)
	}

	// 用药统计路由（需要登录）
	medicationStats := r.Group("/api/medication/stats")
	medicationStats.Use(middleware.AuthMiddleware())
	{
		medicationStats.GET("", handlers.GetMedicationStats)
	}

	// 静态文件服务（前端）
	r.Static("/assets", "./frontend/assets")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	// 获取端口（支持环境变量）
	port := os.Getenv("BP_PORT")
	if port == "" {
		port = "8080"
	}

	// 验证端口格式
	portNum, err := strconv.Atoi(port)
	if err != nil || portNum < 1 || portNum > 65535 {
		port = "8080"
	}

	// 启动服务器
	r.Run(":" + port)
}