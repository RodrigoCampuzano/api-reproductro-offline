package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"ReproductorOffline/src/video/application"
	"ReproductorOffline/src/video/domain/entities"
)

type VideoController struct {
	videoService *application.VideoService
}

func NewVideoController(videoService *application.VideoService) *VideoController {
	return &VideoController{videoService: videoService}
}

func (c *VideoController) GetAllVideos(ctx *gin.Context) {
	videos, err := c.videoService.GetAllVideos()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, videos)
}

func (c *VideoController) GetVideoByID(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	video, err := c.videoService.GetVideoByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Video no encontrado"})
		return
	}
	ctx.JSON(http.StatusOK, video)
}

func (c *VideoController) SaveHistorial(ctx *gin.Context) {
	var historial entities.Historial
	if err := ctx.ShouldBindJSON(&historial); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.videoService.SaveHistorial(historial); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"status": "Historial guardado"})
}