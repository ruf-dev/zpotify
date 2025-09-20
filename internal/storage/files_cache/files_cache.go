package files_cache

import (
	"github.com/dgraph-io/ristretto/v2"
	"go.redsock.ru/rerrors"
)

type FilesCache interface {
	Get(uniqueId string) *File
	Set(uniqueId string, value *File)
}

type filesCache struct {
	cache *ristretto.Cache[string, *File]
}

func New() (FilesCache, error) {
	fc := &filesCache{}

	var err error

	cfg := ristretto.Config[string, *File]{
		// TODO count NumCounters to be correct
		NumCounters: 1000,
		MaxCost:     200 << 20, // 200MB
		BufferItems: 64,
	}
	fc.cache, err = ristretto.NewCache(&cfg)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return fc, nil
}

func (s *filesCache) Get(uniqueId string) *File {
	res, _ := s.cache.Get(uniqueId)
	return res
}

func (s *filesCache) Set(uniqueId string, value *File) {
	s.cache.Set(uniqueId, value, value.size)
}
