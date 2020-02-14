package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"log"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/utils"
	"sk-git.securekey.com/labs/svip-demo-verifier/wallet/db"
)

type vc struct {
	Context          []string `json:"@context,omitempty"`
	CredentialSchema []string `json:"credentialSchema,omitempty"`
}

func transferSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userdb := db.StartUserDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
	} else {
		fmt.Printf("%+v", userInfo)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userInfo)
	w.WriteHeader(200)
}

func getVC(w http.ResponseWriter, r *http.Request) {
	fmt.Println("-----getting vc")
	fmt.Println("-----querying from db")
	id := r.FormValue("ID")
	fmt.Println(id)
	userdb := db.StartUserDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
	} else {
		fmt.Printf("%+v", userInfo)
	}
	fmt.Println("-----sending to edge service")
	profileReq := `    {
    "name": "USCIS",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`
	req, _ := http.NewRequest("POST", "http://localhost:8085/profile", bytes.NewBuffer([]byte(profileReq)))
	request := map[string]interface{}{
		"@context": []string{"https://www.w3.org/2018/credentials/v1", "https://w3id.org/citizenship/v1"},
		"type":     []string{"VerifiableCredential", "PermanentResidentCard"},
		"credentialSubject": map[string]interface{}{
			"id":                     "did:example:b34ca6cd37bbf23",
			"type":                   []string{"PermanentResident", "Person"},
			"givenName":              userInfo.CredentialSubject.GivenName,
			"familyName":             userInfo.CredentialSubject.FamilyName,
			"gender":                 userInfo.CredentialSubject.Gender,
			"image":                  "data:image/png;base64,iVBORw0KGgo...kJggg==",
			"residentSince":          userInfo.CredentialSubject.ResidentSince,
			"lprCategory":            userInfo.CredentialSubject.LPRCategory,
			"lprNumber":              userInfo.CredentialSubject.LPRNumber,
			"commuterClassification": userInfo.CredentialSubject.CommuterClassification,
			"birthCountry":           userInfo.CredentialSubject.BirthCountry,
			"birthDate":              userInfo.CredentialSubject.BirthDate,
		},
		"profile": "USCIS",
	}
	requestBytes, _ := json.Marshal(request)
	req, err = http.NewRequest("POST", "http://localhost:8085/credential", bytes.NewBuffer(requestBytes))
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("response Body:", string(body))

	var vc db.PermanentResidentCardDB
	json.Unmarshal(body, &vc)
	fmt.Println("------decoding")
	fmt.Printf("&+v", vc)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vc)
	w.WriteHeader(200)
}

func main() {

	//framework.Framework()

	port := ":8080"
	tlsCert := "../keys/tls/localhost.crt"
	tlsKey := "../keys/tls/localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // prevent CORS issues

	r.HandleFunc("/userInfo", db.HandleUserInfo).Methods("POST")
	r.HandleFunc("/getVC", getVC).Methods("GET")
	r.HandleFunc("/userInfo/{id}", transferSession).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
