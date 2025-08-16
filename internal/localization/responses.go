package localization

// responses - contains all available user responses
// Read ONLY struct
type responses struct {
	Hello string `json:"hello"`
	File  file   `json:"file"`
	Auth  auth   `json:"auth"`
}

type file struct {
	NotProvided         string `json:"not_provided"`
	SuccessAdding       string `json:"success_adding"`
	AlreadyExists       string `json:"already_exists"`
	UserNowAllowedToAdd string `json:"user_now_allowed_to_add"`
}

type auth struct {
	SuccessfullyAuthenticated string `json:"successfully_authenticated"`
}
