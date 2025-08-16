package tests

import (
	"testing"

	"github.com/stretchr/testify/suite"
)

type AuthTestSuite struct {
	suite.Suite

	env TestEnv
}

func (s *AuthTestSuite) SetupSuite() {
	s.env = NewTestEnv(s.T())
}

func (s *AuthTestSuite) Test_AuthorizeGrpc() {
	//TODO
}

func (s *AuthTestSuite) Test_AuthorizeWapi() {
	//TODO
}

func Test_Auth(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}
