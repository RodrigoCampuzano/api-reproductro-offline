package repositories

import "ReproductorOffline/src/video/domain/entities"

type HistorialRepository interface {
	Save(historial entities.Historial) error
}