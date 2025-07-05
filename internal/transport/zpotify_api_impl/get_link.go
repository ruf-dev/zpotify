package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) GetLink(ctx context.Context, req *zpotify_api.GetLink_Request) (*zpotify_api.GetLink_Response, error) {
	link, err := impl.fileService.GetInfo(ctx, req.TgId)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}
	return &zpotify_api.GetLink_Response{Url: link.FilePath}, nil

	//resp, err := http.Get(link)
	//if err != nil {
	//	http.Error(w, err.Error(), http.StatusBadRequest)
	//}
	//
	//_, err = io.Copy(w, resp.Body)
	//if err != nil {
	//	http.Error(w, err.Error(), http.StatusBadRequest)
	//}
}
