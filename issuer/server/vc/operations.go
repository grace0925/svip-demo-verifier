package vc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

func GenerateVC(client *http.Client, w http.ResponseWriter, userInfo db.UserInfoDB) db.PermanentResidentCardDB {
	fmt.Println("***generating vc...")
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
		http.Error(w, err.Error(), 400)
	}
	req, err := http.NewRequest("POST", "http://localhost:8085/credential", bytes.NewBuffer(requestBytes))
	if err != nil {
		http.Error(w, err.Error(), 400)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), 400)
	}

	if resp.StatusCode == 400 {
		GenerateProfile(client, w)
		resp, err = client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), 400)
		}
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	fmt.Println("vc response ", string(body))

	var vc db.PermanentResidentCardDB
	err = json.Unmarshal(body, &vc)
	if err != nil {
	} else {
		fmt.Printf("vc %+v", vc)
	}
	return vc
}

func GenerateProfile(client *http.Client, w http.ResponseWriter) {
	// calling edge service to create profile
	fmt.Println("***creating profile...")
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
		http.Error(w, err.Error(), 400)
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
	}
	fmt.Println("profile response:", string(body))
}
