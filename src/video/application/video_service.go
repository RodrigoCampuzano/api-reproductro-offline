package application

import (
	"ReproductorOffline/src/video/domain/entities"
	"ReproductorOffline/src/video/domain/repository"
)

type VideoService struct {
	videoRepo    repositories.VideoRepository
	historialRepo repositories.HistorialRepository
}

func NewVideoService(videoRepo repositories.VideoRepository, historialRepo repositories.HistorialRepository) *VideoService {
	return &VideoService{
		videoRepo:    videoRepo,
		historialRepo: historialRepo,
	}
}

func (s *VideoService) GetAllVideos() ([]entities.Video, error) {
	return s.videoRepo.FindAll()
}

func (s *VideoService) GetVideoByID(id int) (entities.Video, error) {
	return s.videoRepo.FindByID(id)
}

func (s *VideoService) SaveHistorial(historial entities.Historial) error {
	return s.historialRepo.Save(historial)
}