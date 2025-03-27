package repositories

import (
	"ReproductorOffline/src/core/db"
	"ReproductorOffline/src/video/domain/entities"
)

type VideoRepositoryMySQL struct{}

func NewVideoRepositoryMySQL() *VideoRepositoryMySQL {
	return &VideoRepositoryMySQL{}
}

func (r *VideoRepositoryMySQL) FindAll() ([]entities.Video, error) {
	rows, err := db.DB.Query("SELECT id, titulo, descripcion, ruta_archivo, fecha_subida FROM videos")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	videos := []entities.Video{}
	for rows.Next() {
		var v entities.Video
		if err := rows.Scan(&v.ID, &v.Titulo, &v.Descripcion, &v.RutaArchivo, &v.FechaSubida); err != nil {
			return nil, err
		}
		videos = append(videos, v)
	}
	return videos, nil
}

func (r *VideoRepositoryMySQL) FindByID(id int) (entities.Video, error) {
	var v entities.Video
	err := db.DB.QueryRow("SELECT id, titulo, descripcion, ruta_archivo, fecha_subida FROM videos WHERE id = ?", id).
		Scan(&v.ID, &v.Titulo, &v.Descripcion, &v.RutaArchivo, &v.FechaSubida)
	if err != nil {
		return v, err
	}
	return v, nil
}