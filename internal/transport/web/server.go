package web

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed all:dist
var frontend embed.FS

func NewServer() http.Handler {
	mux := http.NewServeMux()

	stripped, err := fs.Sub(frontend, "dist")
	if err != nil {
		log.Fatal(err)
	}

	ffs := http.FileServer(http.FS(stripped))
	mux.Handle("/", ffs)

	return mux
}
