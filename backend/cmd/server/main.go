package main

import (
	"bp-buddy/internal/handlers"
	"bp-buddy/internal/middleware"
	"bp-buddy/pkg/database"
	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	database.InitDB()

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

	// 启动服务器
	r.Run(":8080")
}