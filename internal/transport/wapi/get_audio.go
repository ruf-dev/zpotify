package wapi

import (
	"net/http"
)

func (s *Server) GetAudio(w http.ResponseWriter, r *http.Request) {
	//TODO
	//// Replace with dynamic file path fetching logic
	//telegramFilePath := "documents/file_123.ogg"
	//
	//// Get Telegram file download URL
	//fileURL := fmt.Sprintf("https://api.telegram.org/file/bot<YOUR_TOKEN>/%s", telegramFilePath)
	//
	//// Stream from Telegram directly
	//resp, err := http.Get(fileURL)
	//if err != nil {
	//	http.Error(w, "Unable to fetch Telegram file", http.StatusBadGateway)
	//	return
	//}
	//defer resp.Body.Close()
	//
	//// Set headers so the browser knows how to stream it
	//w.Header().Set("Content-Type", "audio/ogg") // or "audio/mpeg" if MP3
	//w.Header().Set("Content-Disposition", "inline; filename=\"audio.ogg\"")
	//w.Header().Set("Transfer-Encoding", "chunked")
	//
	//// Stream it directly
	//io.Copy(w, resp.Body)
}
