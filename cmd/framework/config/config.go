package config

import (
	"time"
)

// Config is a struct containing information for the Aries agent and Sidetree node
type Config struct {
	LogLevel           string        `default:"DEBUG"`
	LogFormat          string        `default:"TEXT"`
	Environment        string        `default:"DEV" required:"true"`
	Port               int           `default:"5002"`
	DrainAndDieTimeout time.Duration `default:"60s"`

	// Sidetree Config
	SidetreeURL        string `default:"http://localhost:48326/.sidetree/document"`
	SidetreeDIDDocPath string `default:"./json/didDocument.json"`
	SidetreeDIDMethod  string `default:"sidetree"`

	// Agent Config
	AgentInboundHost string `default:"localhost"`
	AgentInboundPort string `default:"20000"`
	AgentDBPath      string `default:"./db/agent"`
}
