package main

import (
	"log"

	"github.com/hyperledger/aries-framework-go/pkg/didmethod/httpbinding"
	"github.com/hyperledger/aries-framework-go/pkg/framework/aries"
	"github.com/hyperledger/aries-framework-go/pkg/framework/aries/defaults"
	"github.com/hyperledger/aries-framework-go/pkg/framework/didresolver"

	"sk-git.securekey.com/labs/orgid-resolver/cmd/framework/config"
)

func handleErr(e error) {
	if e != nil {
		log.Fatal(e.Error())
	}
}

func main() {

	// create new config struct (using defaults for now)
	conf, err := config.New()
	handleErr(err)

	sidetreeHTTPResolver, err := httpbinding.New(conf.SidetreeURL, httpbinding.WithAccept(func(method string) bool { return method == conf.SidetreeDIDMethod }))
	handleErr(err)

	// create an array of agent options and append required agent options one at a time
	var opts []aries.Option
	opts = append(opts, defaults.WithStorePath(conf.AgentDBPath))
	opts = append(opts, defaults.WithInboundHTTPAddr(conf.AgentInboundHost, conf.AgentInboundPort))
	opts = append(opts, aries.WithDIDResolver(didresolver.New(didresolver.WithDidMethod(sidetreeHTTPResolver))))

	agent, err := aries.New(opts...)
	handleErr(err)

	agentCTX, err := agent.Context()

	agentCTX.DIDCreator()

}
