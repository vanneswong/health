package handlers

import (
	"health-buddy/internal/models"
	"health-buddy/pkg/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	user, err := database.FindUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"profile": user.Profile,
	})
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	user, err := database.FindUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	user.Profile = models.Profile{
		Name:   req.Name,
		Age:    req.Age,
		Height: req.Height,
		Weight: req.Weight,
		Gender: req.Gender,
	}
	user.UpdatedAt = time.Now()

	if err := database.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "资料更新成功",
		"profile": user.Profile,
	})
}