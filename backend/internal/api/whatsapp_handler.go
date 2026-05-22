package api

import (
	"net/http"

	"cargo/backend/internal/model"
	"cargo/backend/internal/whatsapp"
)

func (s *Server) handleWhatsAppStatus(w http.ResponseWriter, r *http.Request) {
	user, ok := s.mustAuth(w, r)
	if !ok {
		return
	}
	if err := s.requireRole(user, model.RoleAdmin); err != nil {
		handleServiceError(w, err)
		return
	}
	connected := whatsapp.IsConnected()
	status := "disconnected"
	if connected {
		status = "connected"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"status":    status,
		"connected": connected,
	})
}

func (s *Server) handleWhatsAppTest(w http.ResponseWriter, r *http.Request) {
	user, ok := s.mustAuth(w, r)
	if !ok {
		return
	}
	if err := s.requireRole(user, model.RoleAdmin); err != nil {
		handleServiceError(w, err)
		return
	}
	var req struct {
		Phone   string `json:"phone"`
		Message string `json:"message"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	if req.Phone == "" {
		writeError(w, http.StatusBadRequest, "phone is required")
		return
	}
	if req.Message == "" {
		req.Message = "✅ Тест WhatsApp-бота: сообщение успешно доставлено!"
	}
	err := whatsapp.SendMessage(req.Phone, req.Message)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "Ошибка отправки: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "sent",
		"phone":   req.Phone,
		"message": req.Message,
	})
}

