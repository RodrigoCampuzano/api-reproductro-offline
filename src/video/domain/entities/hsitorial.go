package entities

type Historial struct {
	UsuarioID       int `json:"usuario_id"`
	VideoID         int `json:"video_id"`
	UltimoSegundo   int `json:"ultimo_segundo"`
}