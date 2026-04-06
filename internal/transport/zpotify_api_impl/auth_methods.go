package zpotify_api_impl

import (
	"context"

	pb "go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetAuthMethods(
	ctx context.Context, req *pb.GetAuthMethods_Request) (*pb.GetAuthMethods_Response, error) {
	return &pb.GetAuthMethods_Response{}, nil
}
