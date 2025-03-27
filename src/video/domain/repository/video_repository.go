package repositories

import "ReproductorOffline/src/video/domain/entities"

type VideoRepository interface {
	FindAll() ([]entities.Video, error)
	FindByID(id int) (entities.Video, error)
}