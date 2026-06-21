package api

import (
	"encoding/json"
	"net/http"
	"time"
)

type SyncClientUser struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Login          string    `json:"login"`
	PasswordHash   string    `json:"password_hash"`
	Role           string    `json:"role"`
	ClientSegment  string    `json:"client_segment"`
	Company        *string   `json:"company"`
	DepositBalance float64   `json:"deposit_balance"`
	ContractNumber *string   `json:"contract_number"`
	Phone          *string   `json:"phone"`
	Station        *string   `json:"station"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleSyncClients(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token != "SecretSyncToken2026" {
		writeError(w, http.StatusForbidden, "Invalid sync token")
		return
	}

	if r.Method == http.MethodPost {
		var incoming []SyncClientUser
		if err := json.NewDecoder(r.Body).Decode(&incoming); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid JSON body")
			return
		}

		ctx := r.Context()
		for _, u := range incoming {
			// Insert or update client in users table
			_, err := s.pool.Exec(ctx, `
				INSERT INTO users (id, name, login, password_hash, role, client_segment, company, deposit_balance, contract_number, phone, station, is_active, created_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
				ON CONFLICT (id) DO UPDATE SET
					name = EXCLUDED.name,
					login = EXCLUDED.login,
					password_hash = EXCLUDED.password_hash,
					role = EXCLUDED.role,
					client_segment = EXCLUDED.client_segment,
					company = EXCLUDED.company,
					deposit_balance = EXCLUDED.deposit_balance,
					contract_number = EXCLUDED.contract_number,
					phone = EXCLUDED.phone,
					station = EXCLUDED.station,
					is_active = EXCLUDED.is_active,
					created_at = EXCLUDED.created_at
			`, u.ID, u.Name, u.Login, u.PasswordHash, u.Role, u.ClientSegment, u.Company, u.DepositBalance, u.ContractNumber, u.Phone, u.Station, u.IsActive, u.CreatedAt)
			if err != nil {
				http.Error(w, "Failed to insert user "+u.Login+": "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	// Fetch current corporate clients to return
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, name, login, password_hash, role, client_segment, company, deposit_balance, contract_number, phone, station, is_active, created_at
		FROM users
		WHERE role = 'corporate' OR client_segment = 'legal_entity'
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to query database: "+err.Error())
		return
	}
	defer rows.Close()

	var clients []SyncClientUser
	for rows.Next() {
		var u SyncClientUser
		err := rows.Scan(&u.ID, &u.Name, &u.Login, &u.PasswordHash, &u.Role, &u.ClientSegment, &u.Company, &u.DepositBalance, &u.ContractNumber, &u.Phone, &u.Station, &u.IsActive, &u.CreatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to scan row: "+err.Error())
			return
		}
		clients = append(clients, u)
	}

	writeJSON(w, http.StatusOK, clients)
}
