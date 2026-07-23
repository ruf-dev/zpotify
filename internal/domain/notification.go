package domain

import "time"

// Notification is a broadcast message shown to a user, together with that
// user's own read/consent state for it (sourced from notification_recipients).
type Notification struct {
	Id              int64
	Title           string
	BodyMarkdown    string
	RequiresConsent bool
	CreatedAt       time.Time
	IsRead          bool
	Consented       bool
}
