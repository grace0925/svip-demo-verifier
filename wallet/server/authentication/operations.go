package authentication

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

type UserAccount struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
}

func CreateAccountHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("creating account handler")
	// receive info from front end
	var newAccount UserAccount
	err := json.NewDecoder(r.Body).Decode(&newAccount)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// bcrypt password
}
