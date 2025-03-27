package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"ReproductorOffline/src/core/db"
	"ReproductorOffline/src/core/middleware"
	"ReproductorOffline/src/video/infraestructure/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env")
	}
	db.InitDB()
	defer db.CloseDB()
	router := gin.Default()
	router.Use(middleware.CORS())
	routes.SetupVideoRoutes(router)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("API corriendo en http://localhost:%s", port)
	router.Run(":" + port)
}