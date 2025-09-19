package files_cache

import (
	"github.com/dgraph-io/ristretto/v2"
	"go.redsock.ru/rerrors"
)

type FilesCache interface {
	Get(uniqueId string, offset, limit int64) []byte
	Set(uniqueId string, value []byte)
}

type filesCache struct {
	cache *ristretto.Cache[string, []byte]
}

func New() (FilesCache, error) {
	fc := &filesCache{}

	var err error

	cfg := ristretto.Config[string, []byte]{
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

func (s *filesCache) Get(uniqueId string, offset, limit int64) []byte {
	res, ok := s.cache.Get(uniqueId)
	if !ok {
		return nil
	}

	if offset > int64(len(res)) {
		return nil
	}

	if limit < 1 {
		limit = int64(len(res)) - offset
	}

	return res[offset : offset+limit]
}

func (s *filesCache) Set(uniqueId string, value []byte) {
	s.cache.Set(uniqueId, value, int64(len(value)))
}
