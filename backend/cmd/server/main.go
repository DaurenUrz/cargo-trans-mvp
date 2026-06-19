package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cargo/backend/internal/api"
	"cargo/backend/internal/config"
	"cargo/backend/internal/service"
	"cargo/backend/internal/storage/postgres"
)

func main() {
	cfg := config.Load()

	if cfg.JWTSecret == "dev-secret" {
		log.Printf("==========================================================================")
		log.Printf("⚠️  WARNING: JWT_SECRET is set to the default 'dev-secret' value!")
		log.Printf("⚠️  This is highly insecure for production environments.")
		log.Printf("⚠️  Please set the JWT_SECRET environment variable.")
		log.Printf("==========================================================================")
	}

	// Create context that listens for the interrupt signals from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := postgres.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open postgres: %v", err)
	}
	defer db.Close()

	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate postgres: %v", err)
	}

	repo := postgres.NewRepository(db.Pool())
	services := service.NewServices(repo, cfg.JWTSecret)
	server, err := api.NewServer(cfg, services, db.Pool())
	if err != nil {
		log.Fatalf("create server: %v", err)
	}

	// Start background storage penalty worker
	go service.StoragePenaltyWorker(ctx, repo)

	srv := &http.Server{
		Addr:    cfg.Addr(),
		Handler: server.Router(),
	}

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		log.Printf("server listening on %s", cfg.Addr())
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal
	<-ctx.Done()

	// Restore default behavior on the interrupt signal and notify user of shutdown
	stop()
	log.Println("shutting down gracefully...")

	// Close server to cancel transit worker context and close socket.io server
	server.Close()

	// The context is used to inform the server it has 5 seconds to finish
	// the requests it is currently handling
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}
