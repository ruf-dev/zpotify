package pg

import (
	"regexp"
	"strings"
)

var tsQueryTokenRe = regexp.MustCompile(`[\p{L}\p{N}]+`)

// toPrefixTSQuery turns raw user input into a prefix-matching tsquery string
// (e.g. "love story" -> "love:* & story:*"). Non-word characters are dropped so
// the result is always safe to pass to to_tsquery. Returns "" when there are no
// usable tokens.
//
// Shared by SongsStorage, ArtistsStorage and PlaylistStorage search methods -
// all of them query 'simple'-configuration tsvector columns the same way.
func toPrefixTSQuery(raw string) string {
	tokens := tsQueryTokenRe.FindAllString(raw, -1)
	if len(tokens) == 0 {
		return ""
	}

	for i, t := range tokens {
		tokens[i] = t + ":*"
	}

	return strings.Join(tokens, " & ")
}
