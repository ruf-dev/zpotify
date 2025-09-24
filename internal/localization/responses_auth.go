package localization

type Auth interface {
	SuccessfullyAuthenticated() string
}

type auth struct {
	SuccessfullyAuthenticated_ string `json:"successfully_authenticated"`
}

func (a auth) SuccessfullyAuthenticated() string {
	return a.SuccessfullyAuthenticated_
}
