package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"cargo/backend/internal/model"
)

// handleAdminCleanup — очистка всех данных кроме сотрудников.
// POST /api/admin/cleanup
func (s *Server) handleAdminCleanup(w http.ResponseWriter, r *http.Request) {
	user, ok := s.mustAuth(w, r)
	if !ok {
		return
	}
	if err := s.requireRole(user, model.RoleAdmin); err != nil {
		handleServiceError(w, err)
		return
	}
	if s.pool == nil {
		writeError(w, http.StatusInternalServerError, "Database pool not available")
		return
	}

	ctx := r.Context()

	var req struct {
		ShipmentNumbers []string `json:"shipment_numbers"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	if len(req.ShipmentNumbers) > 0 {
		tag, err := s.pool.Exec(ctx, "DELETE FROM shipments WHERE shipment_number = ANY($1)", req.ShipmentNumbers)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"message":       fmt.Sprintf("Удалено указанных посылок: %d", tag.RowsAffected()),
			"deleted_count": tag.RowsAffected(),
			"cleaned_by":    fmt.Sprintf("%s (%s)", user.Name, user.Role),
		})
		return
	}

	results := []map[string]any{}

	queries := []struct {
		desc string
		sql  string
	}{
		{"wagon_shipments", "DELETE FROM wagon_shipments"},
		{"wagons", "DELETE FROM wagons"},
		{"scan_events", "DELETE FROM scan_events"},
		{"transit_events", "DELETE FROM transit_events"},
		{"arrival_events", "DELETE FROM arrival_events"},
		{"shipment_history", "DELETE FROM shipment_history"},
		{"payments", "DELETE FROM payments"},
		{"notifications", "DELETE FROM notifications"},
		{"qr_codes", "DELETE FROM qr_codes"},
		{"audit_log", "DELETE FROM audit_log"},
		{"frequent_clients", "DELETE FROM frequent_clients"},
		{"shipments", "DELETE FROM shipments"},
		{"clients (individual+corporate)", "DELETE FROM users WHERE role IN ('individual', 'corporate') OR client_segment IN ('individual', 'legal_entity')"},
	}

	for _, q := range queries {
		tag, err := s.pool.Exec(ctx, q.sql)
		if err != nil {
			results = append(results, map[string]any{"table": q.desc, "error": err.Error()})
		} else {
			results = append(results, map[string]any{"table": q.desc, "deleted": tag.RowsAffected()})
		}
	}

	var staffCount int
	_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&staffCount)

	writeJSON(w, http.StatusOK, map[string]any{
		"message":      "Очистка завершена",
		"staff_remaining": staffCount,
		"details":      results,
		"cleaned_by":   fmt.Sprintf("%s (%s)", user.Name, user.Role),
	})
}
