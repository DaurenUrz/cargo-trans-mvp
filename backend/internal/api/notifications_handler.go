package api

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func (s *Server) mountNotificationRoutes(r chi.Router) {
	r.With(s.requireAuth).Get("/notifications", s.handleListNotifications)
	r.With(s.requireAuth).Patch("/notifications/{id}/read", s.handleMarkNotificationRead)
	r.With(s.requireAuth).Delete("/notifications/{id}", s.handleDeleteNotification)
}

func (s *Server) handleListNotifications(w http.ResponseWriter, r *http.Request) {
	user, ok := s.mustAuth(w, r)
	if !ok {
		return
	}
	// Only allow users to list their own notifications
	userID := r.URL.Query().Get("userId")
	if userID == "" || userID != user.ID {
		userID = user.ID
	}
	items, err := s.services.Notifications.List(r.Context(), userID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleMarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	if _, ok := s.mustAuth(w, r); !ok {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid notification id")
		return
	}
	if err := s.services.Notifications.MarkRead(r.Context(), id); err != nil {
		handleServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (s *Server) handleDeleteNotification(w http.ResponseWriter, r *http.Request) {
	if _, ok := s.mustAuth(w, r); !ok {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid notification id")
		return
	}
	if err := s.services.Notifications.Delete(r.Context(), id); err != nil {
		handleServiceError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

