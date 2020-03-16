package vc

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"strings"
	"time"
)

func GenerateVC(client *http.Client, userInfo db.UserInfoDB) (db.PermanentResidentCardDB, error) {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	credReqURL := "http://" + vcsHost + vcsPort + "/credential"

	var vc db.PermanentResidentCardDB

	log.Info("Generating VC")
	if err := GenerateProfile(client); err != nil {
		return vc, err
	}

	wait, _ := time.ParseDuration("2.5s")
	time.Sleep(wait)

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
		log.Error("marshal cred request json error => ", err)
		return vc, err
	}

	req, err := http.NewRequest("POST", credReqURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error("create cred request error => ", err)
		return vc, err
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)

	defer resp.Body.Close()
	if err != nil || resp == nil {
		log.Error("create credential error => ", err)
		return vc, err
	}

	err = json.NewDecoder(resp.Body).Decode(&vc)
	if err != nil {
		log.Error("marshal cred response json error => ", err)
		return vc, err
	} else {
		log.Info("credential json => ", vc)
		log.Info("successfully generated vc")
	}
	return vc, nil
}

func GenerateProfile(client *http.Client) error {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	// calling edge service to create profile
	profileReq := `{
    "name": "uscis",
    "did": "did:example:28394728934792387",
    "uri": "https://issuer.oidp.uscis.gov/credentials",
    "signatureType": "Ed25519Signature2018",
    "creator": "SecureKey Technologies"
	}
	`

	profReqURL := "http://" + vcsHost + vcsPort + "/profile"

	req, err := http.NewRequest("POST", profReqURL, bytes.NewBuffer([]byte(profileReq)))
	if err != nil {
		log.Error(err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	body, _ := ioutil.ReadAll(resp.Body)
	log.Info("Profile response => ", string(body))
	if err != nil {
		log.Error("create profile request failed => ", err)
		return err
	} else {
		log.Info("Profile generated")
	}
	return nil
}

func initConfig() {
	// Use vcsconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("vcsconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
