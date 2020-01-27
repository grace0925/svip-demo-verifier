package models

import (
	"github.com/hyperledger/aries-framework-go/pkg/framework/context"
)

// Context is a struct that contains information about an Aries agent and its Sidetree URL
type Context struct {
	AgentCtx    *context.Provider
	SidetreeURL string
}
