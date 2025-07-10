package telegram

import (
	"github.com/hashicorp/golang-lru/v2"
)

const maxUsersInCache = 100

type userCache struct {
	*lru.Cache[int64, struct{}]
}

func newUserCache() (*userCache, error) {
	c, err := lru.New[int64, struct{}](maxUsersInCache)
	if err != nil {
		return nil, err
	}

	return &userCache{
		Cache: c,
	}, nil
}
