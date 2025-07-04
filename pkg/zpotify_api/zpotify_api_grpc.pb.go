// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.5.1
// - protoc             v5.28.3
// source: zpotify_api.proto

package zpotify_api

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.64.0 or later.
const _ = grpc.SupportPackageIsVersion9

const (
	ZpotifyAPI_Version_FullMethodName = "/zpotify_api.ZpotifyAPI/Version"
	ZpotifyAPI_GetLink_FullMethodName = "/zpotify_api.ZpotifyAPI/GetLink"
)

// ZpotifyAPIClient is the client API for ZpotifyAPI service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type ZpotifyAPIClient interface {
	Version(ctx context.Context, in *Version_Request, opts ...grpc.CallOption) (*Version_Response, error)
	GetLink(ctx context.Context, in *GetLink_Request, opts ...grpc.CallOption) (*GetLink_Response, error)
}

type zpotifyAPIClient struct {
	cc grpc.ClientConnInterface
}

func NewZpotifyAPIClient(cc grpc.ClientConnInterface) ZpotifyAPIClient {
	return &zpotifyAPIClient{cc}
}

func (c *zpotifyAPIClient) Version(ctx context.Context, in *Version_Request, opts ...grpc.CallOption) (*Version_Response, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(Version_Response)
	err := c.cc.Invoke(ctx, ZpotifyAPI_Version_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *zpotifyAPIClient) GetLink(ctx context.Context, in *GetLink_Request, opts ...grpc.CallOption) (*GetLink_Response, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(GetLink_Response)
	err := c.cc.Invoke(ctx, ZpotifyAPI_GetLink_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// ZpotifyAPIServer is the server API for ZpotifyAPI service.
// All implementations must embed UnimplementedZpotifyAPIServer
// for forward compatibility.
type ZpotifyAPIServer interface {
	Version(context.Context, *Version_Request) (*Version_Response, error)
	GetLink(context.Context, *GetLink_Request) (*GetLink_Response, error)
	mustEmbedUnimplementedZpotifyAPIServer()
}

// UnimplementedZpotifyAPIServer must be embedded to have
// forward compatible implementations.
//
// NOTE: this should be embedded by value instead of pointer to avoid a nil
// pointer dereference when methods are called.
type UnimplementedZpotifyAPIServer struct{}

func (UnimplementedZpotifyAPIServer) Version(context.Context, *Version_Request) (*Version_Response, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Version not implemented")
}
func (UnimplementedZpotifyAPIServer) GetLink(context.Context, *GetLink_Request) (*GetLink_Response, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetLink not implemented")
}
func (UnimplementedZpotifyAPIServer) mustEmbedUnimplementedZpotifyAPIServer() {}
func (UnimplementedZpotifyAPIServer) testEmbeddedByValue()                    {}

// UnsafeZpotifyAPIServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to ZpotifyAPIServer will
// result in compilation errors.
type UnsafeZpotifyAPIServer interface {
	mustEmbedUnimplementedZpotifyAPIServer()
}

func RegisterZpotifyAPIServer(s grpc.ServiceRegistrar, srv ZpotifyAPIServer) {
	// If the following call pancis, it indicates UnimplementedZpotifyAPIServer was
	// embedded by pointer and is nil.  This will cause panics if an
	// unimplemented method is ever invoked, so we test this at initialization
	// time to prevent it from happening at runtime later due to I/O.
	if t, ok := srv.(interface{ testEmbeddedByValue() }); ok {
		t.testEmbeddedByValue()
	}
	s.RegisterService(&ZpotifyAPI_ServiceDesc, srv)
}

func _ZpotifyAPI_Version_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(Version_Request)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ZpotifyAPIServer).Version(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: ZpotifyAPI_Version_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ZpotifyAPIServer).Version(ctx, req.(*Version_Request))
	}
	return interceptor(ctx, in, info, handler)
}

func _ZpotifyAPI_GetLink_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetLink_Request)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ZpotifyAPIServer).GetLink(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: ZpotifyAPI_GetLink_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ZpotifyAPIServer).GetLink(ctx, req.(*GetLink_Request))
	}
	return interceptor(ctx, in, info, handler)
}

// ZpotifyAPI_ServiceDesc is the grpc.ServiceDesc for ZpotifyAPI service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var ZpotifyAPI_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "zpotify_api.ZpotifyAPI",
	HandlerType: (*ZpotifyAPIServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Version",
			Handler:    _ZpotifyAPI_Version_Handler,
		},
		{
			MethodName: "GetLink",
			Handler:    _ZpotifyAPI_GetLink_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "zpotify_api.proto",
}
