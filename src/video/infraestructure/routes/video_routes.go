package routes

import (
	"github.com/gin-gonic/gin"
	"ReproductorOffline/src/video/application"
	"ReproductorOffline/src/video/infraestructure/controller"
	"ReproductorOffline/src/video/infraestructure/repository"
)

func SetupVideoRoutes(router *gin.Engine) {
	// Inicializar repositorios
	videoRepo := repositories.NewVideoRepositoryMySQL()
	historialRepo := repositories.NewHistorialRepositoryMySQL()
	videoService := application.NewVideoService(videoRepo, historialRepo)	
	videoController := controllers.NewVideoController(videoService)
	videoGroup := router.Group("/api/videos")
	{
		videoGroup.GET("", videoController.GetAllVideos)
		videoGroup.GET("/:id", videoController.GetVideoByID)
	}
	router.POST("/api/historial", videoController.SaveHistorial)
	router.Static("/videos", "./videos")
}