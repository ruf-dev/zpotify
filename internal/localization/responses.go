package localization

// responses - contains all available user responses
// Read ONLY struct
type responses struct {
	Hello_ string `json:"hello"`
	File_  file   `json:"file"`
	Auth_  auth   `json:"auth"`
}

func (r responses) Hello() string {
	return r.Hello_
}

func (r responses) File() File {
	return r.File_
}
func (r responses) Auth() Auth {
	return r.Auth_
}
