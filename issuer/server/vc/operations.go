package vc

import (
	"bytes"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

func GenerateVC(client *http.Client, w http.ResponseWriter, userInfo db.UserInfoDB) db.PermanentResidentCardDB {
	log.Info("Generating VC")
	GenerateProfile(client, w)
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
		"profile": "uscis",
	}
	requestBytes, err := json.Marshal(vcRequest)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	req, err := http.NewRequest("POST", "http://vc-rest.com:8085/credential", bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, _ := client.Do(req)

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var vc db.PermanentResidentCardDB
	err = json.Unmarshal(body, &vc)
	if err != nil {
		log.Error(err)
	} else {
		fmt.Printf("vc %+v", vc)
	}
	log.Info("successfully generated vc")
	return vc
}

func GenerateProfile(client *http.Client, w http.ResponseWriter) {
	// calling edge service to create profile
	profileReq := `{
    "name": "uscis",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`
	req, _ := http.NewRequest("POST", "http://vc-rest.com:8085/profile", bytes.NewBuffer([]byte(profileReq)))
	req.Header.Set("Content-Type", "application/json")
	_, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	log.Info("Profile generated")
}
