package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	var err error
	dsn := os.Getenv("DB_USER") + ":" + os.Getenv("DB_PASSWORD") + "@tcp(" + os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT") + ")/" + os.Getenv("DB_NAME")
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error al conectar a la base de datos: %v", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatalf("Error al hacer ping a la base de datos: %v", err)
	}
	log.Println("Conectado a MySQL correctamente.")
}

func CloseDB() {
	if err := DB.Close(); err != nil {
		log.Printf("Error al cerrar la conexión a la base de datos: %v", err)
	}
}