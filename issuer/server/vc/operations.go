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

func GenerateVC(client *http.Client, w http.ResponseWriter, userInfo db.UserInfoDB) db.PermanentResidentCardDB {

	initConfig()

	vcsHost := viper.GetString("vcs.host")
	vcsPort := viper.GetString("vcs.port")

	credReqURL := "http://" + vcsHost + vcsPort + "/credential"

	log.Info("Generating VC")
	GenerateProfile(client, w)
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
		http.Error(w, err.Error(), 400)
	}
	req, err := http.NewRequest("POST", credReqURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		log.Error("create cred request error => ", err)
		http.Error(w, err.Error(), 400)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	defer resp.Body.Close()
	if err != nil || resp == nil {
		log.Error("create credential error => ", err)
		http.Error(w, err.Error(), 400)
	}

	/*defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	fmt.Printf("%+v", string(body))
	var vc db.PermanentResidentCardDB
	err = json.Unmarshal(body, &vc)
	if err != nil {
		log.Error(err)
	} else {
		fmt.Printf("vc %+v", vc)
	}*/
	var vc db.PermanentResidentCardDB
	err = json.NewDecoder(resp.Body).Decode(&vc)
	log.Info("credential json => ", vc)
	if err != nil {
		log.Error("marshal cred response json error => ", err)
		http.Error(w, err.Error(), 400)
	} else {
		log.Info("successfully generated vc")
	}
	return vc
}

func GenerateProfile(client *http.Client, w http.ResponseWriter) {

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
		http.Error(w, err.Error(), 400)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	body, _ := ioutil.ReadAll(resp.Body)
	log.Info("Profile response => ", string(body))
	if err != nil {
		log.Error("create profile request failed => ", err)
		http.Error(w, err.Error(), 400)
	} else {
		log.Info("Profile generated")
	}
}

func initConfig() {

	// Use vcsconfig.yaml configurations
	viper.AddConfigPath("/pkg/config/")
	viper.SetConfigName("vcsconfig")
	viper.SetConfigType("yaml")
	viper.SetEnvPrefix("svip")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".","_"))
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("could not read config file: ", err)
	}
}
