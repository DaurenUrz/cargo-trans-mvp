package api

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type webSocketHub struct {
	mu      sync.Mutex
	rooms   map[string]map[*webSocketClient]struct{}
	clients map[*webSocketClient]struct{}
}

type webSocketClient struct {
	conn  *websocket.Conn
	rooms map[string]struct{}
	mu    sync.Mutex
}

func newWebSocketHub() *webSocketHub {
	return &webSocketHub{
		rooms:   make(map[string]map[*webSocketClient]struct{}),
		clients: make(map[*webSocketClient]struct{}),
	}
}

func (h *webSocketHub) AddClient(client *webSocketClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client] = struct{}{}
}

func (h *webSocketHub) Join(client *webSocketClient, room string) {
	room = strings.TrimSpace(room)
	if room == "" {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[room] == nil {
		h.rooms[room] = make(map[*webSocketClient]struct{})
	}
	h.rooms[room][client] = struct{}{}
	client.rooms[room] = struct{}{}
}

func (h *webSocketHub) RemoveClient(client *webSocketClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, client)
	for room := range client.rooms {
		delete(h.rooms[room], client)
		if len(h.rooms[room]) == 0 {
			delete(h.rooms, room)
		}
	}
	_ = client.conn.Close()
}

func (h *webSocketHub) Broadcast(room, event string, data any) {
	h.mu.Lock()
	clients := make([]*webSocketClient, 0, len(h.rooms[room]))
	for client := range h.rooms[room] {
		clients = append(clients, client)
	}
	h.mu.Unlock()

	message := map[string]any{
		"event": event,
		"data":  data,
	}
	for _, client := range clients {
		client.mu.Lock()
		_ = client.conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		if err := client.conn.WriteJSON(message); err != nil {
			client.mu.Unlock()
			h.RemoveClient(client)
			continue
		}
		client.mu.Unlock()
	}
}

func (h *webSocketHub) Close() {
	h.mu.Lock()
	clients := make([]*webSocketClient, 0, len(h.clients))
	for client := range h.clients {
		clients = append(clients, client)
	}
	h.mu.Unlock()
	for _, client := range clients {
		h.RemoveClient(client)
	}
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: s.isAllowedWebSocketOrigin,
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &webSocketClient{
		conn:  conn,
		rooms: make(map[string]struct{}),
	}
	s.wsHub.AddClient(client)
	defer s.wsHub.RemoveClient(client)

	for {
		var msg struct {
			Action string `json:"action"`
			Room   string `json:"room"`
		}
		if err := conn.ReadJSON(&msg); err != nil {
			return
		}
		switch msg.Action {
		case "join-user":
			s.wsHub.Join(client, "user:"+strings.TrimSpace(msg.Room))
		case "join-station":
			s.wsHub.Join(client, s.stationRoom(msg.Room))
		}
	}
}

func (s *Server) isAllowedWebSocketOrigin(r *http.Request) bool {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		return true
	}
	for _, allowed := range parseCORSAllowedOrigins(s.cfg.CORSAllowedOrigins) {
		if allowed == "*" || strings.EqualFold(allowed, origin) {
			return true
		}
	}
	return false
}
