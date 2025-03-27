package repositories

import (
	"ReproductorOffline/src/core/db"
	"ReproductorOffline/src/video/domain/entities"
)

type HistorialRepositoryMySQL struct{}

func NewHistorialRepositoryMySQL() *HistorialRepositoryMySQL {
	return &HistorialRepositoryMySQL{}
}

func (r *HistorialRepositoryMySQL) Save(historial entities.Historial) error {
	_, err := db.DB.Exec("INSERT INTO historial_reproduccion (usuario_id, video_id, ultimo_segundo_reproducido) VALUES (?, ?, ?)",
		historial.UsuarioID, historial.VideoID, historial.UltimoSegundo)
	return err
}