package main

import (
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"sk-git.securekey.com/labs/svip-demo-verifier/cmd/framework/models"
	"sk-git.securekey.com/labs/svip-demo-verifier/cmd/framework/routes"
	"sk-git.securekey.com/labs/svip-demo-verifier/cmd/framework/routes/handlers"
)

type routerConfig struct {
	Entry *logrus.Entry
	ctx   *models.Context
}

// InitRouter initializes the router
func InitRouter(conf *routerConfig) *mux.Router {
	router := mux.NewRouter()

	// DID Handler
	didHandler := &handlers.DIDHandler{Entry: conf.Entry, Ctx: conf.ctx}

	router.HandleFunc(routes.VarDID, didHandler.ResolveAnyDID).Methods("GET")
	router.HandleFunc("/", didHandler.CreateDID).Methods("POST")

	return router
}
