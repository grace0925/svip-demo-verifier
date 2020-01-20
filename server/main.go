package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func IssueCred(w http.ResponseWriter, r *http.Request) {
	fmt.Println("issuing verifiable credential...")
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Hello")
	})
	r.HandleFunc("/issueCred", IssueCred).Methods("POST")

	log.Fatal(http.ListenAndServe(":8080", r))
}
