package domain

import "encoding/json"

type FeatureFlag struct {
	ID        string
	IsEnabled bool
	Value     json.RawMessage
}
