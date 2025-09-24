package localization

type File interface {
	NotProvided() string
	SuccessAdding() string
	AlreadyExists() string
	UserNowAllowedToAdd() string

	MustHaveTitle() string
	MustHavePerformer() string
}

type file struct {
	NotProvided_         string `json:"not_provided"`
	SuccessAdding_       string `json:"success_adding"`
	AlreadyExists_       string `json:"already_exists"`
	UserNowAllowedToAdd_ string `json:"user_now_allowed_to_add"`
	MustHaveTitle_       string `json:"must_have_title"`
	MustHavePerformer_   string `json:"must_have_performer"`
}

func (f file) NotProvided() string         { return f.NotProvided_ }
func (f file) SuccessAdding() string       { return f.SuccessAdding_ }
func (f file) AlreadyExists() string       { return f.AlreadyExists_ }
func (f file) UserNowAllowedToAdd() string { return f.UserNowAllowedToAdd_ }
func (f file) MustHaveTitle() string       { return f.MustHaveTitle_ }
func (f file) MustHavePerformer() string   { return f.MustHavePerformer_ }
