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
)

type IssuerInfo struct {
	DID  string
	Name string
}

func GenerateVC(client *http.Client, issuer IssuerInfo, userInfo db.UserInfoDB) (db.PermanentResidentCardDB, error) {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	credReqURL := "http://" + vcsHost + vcsPort + "/credential"

	var vc db.PermanentResidentCardDB
	var data []byte

	//issuanceDate := time.Now().Format(time.RFC3339)

	log.Info("Generating VC")

	vcRequest := map[string]interface{}{
		"@context": []string{"https://www.w3.org/2018/credentials/v1", "https://w3id.org/citizenship/v1"},
		"type":     []string{"VerifiableCredential", "PermanentResidentCard"},
		"credentialSubject": map[string]interface{}{
			"id":                     "did:v1:test:nym:z6MkrLJRYaVAEM1GR4rL592t2AXLpjpsuLJyBcxSpqMnG2Vq",
			"type":                   []string{"PermanentResident", "Person"},
			"givenName":              userInfo.CredentialSubject.GivenName,
			"familyName":             userInfo.CredentialSubject.FamilyName,
			"gender":                 userInfo.CredentialSubject.Gender,
			"image":                  userInfo.Image,
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
	data, _ = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("create credential error => ", data, err)
		return vc, err
	}
	log.Print("create credential response => ", string(data))

	defer resp.Body.Close()

	if json.Unmarshal(data, &vc) != nil {
		log.Error("marshal cred response json error => ", err)
		return vc, err
	} else {
		log.Info("credential json => ", vc)
		log.Info("successfully generated vc")
	}
	return vc, nil
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
