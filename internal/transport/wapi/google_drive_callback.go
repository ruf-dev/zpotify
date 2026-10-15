package wapi

import (
	"net/http"
	"strings"

	"github.com/rs/zerolog/log"
)

const (
	storagesPagePath         = "/storages"
	googleDriveAuthFailedUrl = "/storages?error=google_drive_auth_failed"
)

func (s *Server) GoogleDriveCallback(writer http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	query := req.URL.Query()
	baseUrl := strings.TrimRight(s.publicBaseUrl, "/")

	if query.Get("error") != "" {
		http.Redirect(writer, req, baseUrl+googleDriveAuthFailedUrl, http.StatusFound)
		return
	}

	err := s.storageService.CompleteGoogleDriveAuth(ctx, query.Get("state"), query.Get("code"))
	if err != nil {
		log.Ctx(ctx).Error().Err(err).Msg("error completing google drive auth")
		http.Redirect(writer, req, baseUrl+googleDriveAuthFailedUrl, http.StatusFound)
		return
	}

	http.Redirect(writer, req, baseUrl+storagesPagePath, http.StatusFound)
}
