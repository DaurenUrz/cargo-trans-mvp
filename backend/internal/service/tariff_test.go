package service

import (
	"testing"
)

func TestCalculateCostByTariff(t *testing.T) {
	tests := []struct {
		name          string
		from          string
		to            string
		weight        string
		description   string
		isDoorToDoor  bool
		isIndividual  bool
		expectedCost  float64
	}{
		{
			name:         "Base case: Almaty to Astana 10kg",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Normal cargo",
			isDoorToDoor: false,
			isIndividual: true,
			expectedCost: 1162,
		},
		{
			name:         "Individual Door-to-Door (+10,000)",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Normal cargo",
			isDoorToDoor: true,
			isIndividual: true,
			expectedCost: 11162,
		},
		{
			name:         "Corporate Door-to-Door (No surcharge)",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Normal cargo",
			isDoorToDoor: true,
			isIndividual: false,
			expectedCost: 1162,
		},
		{
			name:         "Fragile Surcharge (No surcharge)",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Хрупкий груз",
			isDoorToDoor: false,
			isIndividual: true,
			expectedCost: 1162,
		},
		{
			name:         "Oversized Surcharge (No surcharge)",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Негабаритный груз",
			isDoorToDoor: false,
			isIndividual: true,
			expectedCost: 1162,
		},
		{
			name:         "Combined Surcharges (Individual + D2D + Fragile)",
			from:         "Алматы-2",
			to:           "Астана Нұрлы Жол",
			weight:       "10",
			description:  "Очень хрупкий",
			isDoorToDoor: true,
			isIndividual: true,
			expectedCost: 11162,
		},
		{
			name:         "Different Route: Karaganda to Almaty 20kg",
			from:         "Қарағанды",
			to:           "Алматы-2",
			weight:       "20",
			description:  "Normal",
			isDoorToDoor: false,
			isIndividual: true,
			expectedCost: 1813,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cost := calculateCostByTariff(tt.from, tt.to, tt.weight, tt.description, tt.isDoorToDoor, tt.isIndividual)
			if cost != tt.expectedCost {
				t.Errorf("calculateCostByTariff() = %v, want %v", cost, tt.expectedCost)
			}
		})
	}
}
