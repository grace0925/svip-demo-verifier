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

// query and send user information using on url encoded session id
func transferSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
	} else {
		fmt.Printf("%+v", userInfo)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userInfo)
	if err != nil {
		fmt.Println(err)
	}
	w.WriteHeader(200)
}

// call edge service to generate verifiable credential with user information and send vc back
func createVC(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("ID")

	// fetch user information from user_info db
	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("%+v", userInfo)
	}

	client := &http.Client{}

	// calling edge service to create profile
	profileReq := `{
    "name": "USCIS",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`
	req, _ := http.NewRequest("POST", "http://localhost:8085/profile", bytes.NewBuffer([]byte(profileReq)))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}
	/*defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	fmt.Println("response Body:", string(body))*/

	// calling edge service to generate credentials
	vcRequest := map[string]interface{}{
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
	requestBytes, err := json.Marshal(vcRequest)
	if err != nil {
		fmt.Println(err)
	}
	req, err = http.NewRequest("POST", "http://localhost:8085/credential", bytes.NewBuffer(requestBytes))
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(400)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var vc db.PermanentResidentCardDB
	err = json.Unmarshal(body, &vc)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf("vc %+v", vc)

	// encode vc
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(vc)
	if err != nil {
		fmt.Println(err)
	}
	w.WriteHeader(200)
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
		w.WriteHeader(400)
		panic(err)
	}

	w.WriteHeader(200)
}

func main() {

	port := ":8080"
	tlsCert := "../keys/tls/localhost.crt"
	tlsKey := "../keys/tls/localhost.key"

	r := mux.NewRouter()
	r.Use(utils.CommonMiddleware) // CORS

	r.HandleFunc("/storeUserInfo", HandleStoreUserInfo).Methods("POST")
	r.HandleFunc("/createVC", createVC).Methods("GET")
	r.HandleFunc("/userInfo/{id}", transferSession).Methods("GET")

	react := utils.ReactHandler{StaticPath: "client/build", IndexPath: "index.html"}
	r.PathPrefix("/").HandlerFunc(react.ServeReactApp)

	log.Fatal(http.ListenAndServeTLS(port, tlsCert, tlsKey, r))
}
