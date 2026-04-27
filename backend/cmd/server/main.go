package main

import (
	"bp-buddy/internal/handlers"
	"bp-buddy/internal/middleware"
	"bp-buddy/pkg/database"
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