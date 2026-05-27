
package service

import (
	"fmt"
	"math"
	"strings"
)

// routeTariff содержит компоненты тарифа для маршрута (за 10 кг)
type routeTariff struct {
	TransportRate    float64 // Тариф за перевозку (за 10 кг)
	DeclaredValueFee float64 // Объявленная ценность (за 10 кг)
}

// Тарифы по маршрутам. Ключ — "откуда-куда" в нижнем регистре.
var routeTariffs = map[string]routeTariff{
	"алматы-2-астана нұрлы жол": {TransportRate: 971.0625, DeclaredValueFee: 84},
	"астана нұрлы жол-алматы-2": {TransportRate: 971.0625, DeclaredValueFee: 84},
	"алматы-2-қарағанды":       {TransportRate: 819, DeclaredValueFee: 68},
	"қарағанды-алматы-2":       {TransportRate: 819, DeclaredValueFee: 68},
	"астана нұрлы жол-қарағанды": {TransportRate: 287, DeclaredValueFee: 16},
	"қарағанды-астана нұрлы жол": {TransportRate: 287, DeclaredValueFee: 16},
}

// Накладная — фиксированный сбор за распечатывание (₸)
const waybillFee = 107

func calculateCostByTariff(fromStation, toStation string, weightStr string, description string, isDoorToDoor bool, isIndividual bool) float64 {
	if fromStation == "" || toStation == "" || weightStr == "" {
		return 0
	}

	var weight float64
	_, err := fmt.Sscanf(weightStr, "%f", &weight)
	if err != nil || weight <= 0 {
		return 0
	}

	// Округляем вес вверх до ближайших 10 кг (минимум 10 кг)
	roundedWeight := math.Ceil(weight/10.0) * 10
	if roundedWeight < 10 {
		roundedWeight = 10
	}
	blocks := roundedWeight / 10

	// Ищем тариф по маршруту
	routeKey := strings.TrimSpace(strings.ToLower(fromStation)) + "-" + strings.TrimSpace(strings.ToLower(toStation))
	tariff, found := routeTariffs[routeKey]
	if !found {
		// Если маршрут не найден — fallback на старую логику (9769 за 100кг = 976.9 за 10кг)
		tariff = routeTariff{TransportRate: 976.9, DeclaredValueFee: 0}
	}

	cost := (blocks * tariff.TransportRate) + tariff.DeclaredValueFee

	// +10 000 тг для door-to-door от физлица (Фаза 5, status_logic.md)
	if isDoorToDoor && isIndividual {
		cost += 10000
	}

	// +107 тг за распечатывание накладной
	cost += float64(waybillFee)

	return math.Round(cost)
}
