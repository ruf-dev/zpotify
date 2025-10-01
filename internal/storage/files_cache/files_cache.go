package files_cache

import (
	"sync"

	"github.com/dgraph-io/ristretto/v2"
	"go.redsock.ru/rerrors"
)

type FilesCache interface {
	Set(uniqueId string, value *File)

	GetOrCreate(uniqueId string) (f *File, isNew bool)
}

type filesCache struct {
	cache *ristretto.Cache[string, *File]

	createMutex sync.Mutex
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

func (s *filesCache) GetOrCreate(uniqueId string) (res *File, isNew bool) {
	res, _ = s.cache.Get(uniqueId)
	if res != nil {
		return res, false
	}

	s.createMutex.Lock()

	res, _ = s.cache.Get(uniqueId)
	if res == nil {
		res = NewFile()
		s.cache.Set(uniqueId, res, 1)
		isNew = true
	}

	s.createMutex.Unlock()

	return res, isNew
}

func (s *filesCache) Set(uniqueId string, value *File) {
	s.cache.Set(uniqueId, value, value.size)
}
