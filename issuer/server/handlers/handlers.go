package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-kivik/kivik"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
)

// query and send user information using on url encoded session id
func HandleTransferSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("%+v", userInfo)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userInfo)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	} else {
		w.WriteHeader(200)
	}
}

// Store user information in database "user_info"
func HandleStoreUserInfo(w http.ResponseWriter, r *http.Request) {

	var info db.UserInfoDB
	err := json.NewDecoder(r.Body).Decode(&info)
	if err != nil {
		w.WriteHeader(400)
		panic(err)
	}

	userdb := db.StartDB(db.USERDB)
	err = db.StoreUserInfo(userdb, info)
	if err != nil {
		http.Error(w, err.Error(), 400)
		panic(err)
	}

	w.WriteHeader(200)
}

// call edge service to generate verifiable credential with user information and send vc back
func HandleCreateVC(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("ID")

	// fetch user information from user_info db
	fmt.Println("***fetching vc from database...")
	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	} else {
		fmt.Printf("%+v", userInfo)
	}

	client := &http.Client{}
	// calling edge service to generate credentials
	_, err = vc.GenerateProfile(client, "uscis")
	vc, err := vc.GenerateVC(client, userInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	} else {
		log.Info(vc)
	}
	// encode vc
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(vc)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	} else {
		w.WriteHeader(200)
	}
}

func HandleCreateIssuerAccount(w http.ResponseWriter, r *http.Request) {
	log.Info("creating issuer account")
	auth.CreateAccount(w, r, db.ISSUERACCOUNT)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("login handler")
	var accountInfo db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&accountInfo); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// validate username and password
	if err := auth.ValidateCred(accountInfo, db.ISSUERACCOUNT); err != nil {
		w.WriteHeader(200)
		_, _ = w.Write([]byte(err.Error()))
	}

	// create jwt token string
	jwtString, err := auth.CreateToken(accountInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	// set cookie
	http.SetCookie(w, &http.Cookie{
		Name:  "issuer_token",
		Value: jwtString,
	})
	w.WriteHeader(200)
}

type query struct {
	Selector interface{} `json:"selector, omitempty"`
	Fields   []string    `json:"fields, omitempty"`
}

type DDoc struct {
	ID    string                 `json:"_id, omitempty"`
	Views map[string]interface{} `json:"views, omitempty"`
}

func TestHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("-----------------")
	database := db.StartDB(db.ISSUERACCOUNT)

	//queryString := `{"selector": {"email": "$eq": }}`
	//database.Find(context.(), )

	/*var ddoc DDoc
	row := database.Get(context.TODO(), "_design/grace")
	if err := row.ScanDoc(&ddoc); err != nil {
		log.Error(err)
	}
	fmt.Printf("%+v", ddoc)*/

	/*ddoc := DDoc{
		ID:    "_design/grace",
		Views: map[string]interface{}{
			"heyy": map[string]interface{}{
				"map": "function (doc) {\n emit(doc._id,1);\n}",
			},
		},
	}*/

	//_, err := database.Put(context.TODO(), "_design/grace",ddoc)
	rows, err := database.Query(context.TODO(), "_design/grace", "_view/graceliu", kivik.Options{"include_docs": true, "startkey": `"email"`})
	if err != nil {
		log.Error(err)
	}
	var doc interface{}
	var docs []interface{}
	for rows.Next() {
		if err := rows.ScanDoc(&doc); err != nil {
			log.Error(err)
		}
		docs = append(docs, doc)
	}
	fmt.Printf("%+v", docs)
	if rows.Err() != nil {
		log.Error(rows.Err())
	}
}

func PopulateHandler(w http.ResponseWriter, r *http.Request) {
	database := db.StartDB(db.ISSUERACCOUNT)
	ddoc := DDoc{
		ID: "_design/grace",
		Views: map[string]interface{}{
			"graceliu": map[string]interface{}{
				"map": "function (doc) {\n emit(doc.email,doc.password);\n}",
			},
		},
	}

	database.Put(context.TODO(), "_design/grace", ddoc)
	database.Put(context.TODO(), "number-1", map[string]interface{}{
		"email": "sofjsdofj@gmail.com",
	})
	database.Put(context.TODO(), "number-2", map[string]interface{}{
		"password": "sofsdofjdsofsdjojggojofjdo",
	})
	database.Put(context.TODO(), "number-3", map[string]interface{}{
		"email": "22121212121@gmail.com",
	})
}
