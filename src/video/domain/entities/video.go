package entities

type Video struct {
	ID          int    `json:"id"`
	Titulo      string `json:"titulo"`
	Descripcion string `json:"descripcion"`
	RutaArchivo string `json:"ruta_archivo"`
	FechaSubida string `json:"fecha_subida"`
}