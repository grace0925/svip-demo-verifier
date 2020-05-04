package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/btcsuite/btcutil/base58"
	"github.com/hyperledger/aries-framework-go/pkg/controller/command/verifiable"
	"github.com/hyperledger/aries-framework-go/pkg/framework/aries"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ed25519"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/did"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
	"strings"
	"time"
)

func CreateWalletAccountHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("creating wallet account")
	var newAccount db.AccountDB

	username := r.FormValue("username")
	password := r.FormValue("password")
	newAccount.Username = username
	newAccount.Password = password

	// register did and store did + private key in db
	didStr, privateKey, err := did.RegisterDID(did.DIDUSAGEAUTH)
	newAccount.DID = didStr
	newAccount.PrivateKey = base58.Encode(privateKey)

	err = auth.CreateAccount(newAccount, db.WALLETACCOUNT)
	if err != nil {
		if err.Error() == "Account exists" {
			w.WriteHeader(200)
			w.Write([]byte("Account exists"))
		} else {
			log.Error("failed to create account ", err)
			http.Error(w, err.Error(), 500)
			return
		}
	} else {
		log.Println("wallet account created")
	}

	walletDBName := db.WALLETDBPREFIX + newAccount.Username
	err = db.StoreWalletDID(newAccount.DID, walletDBName)
	if err != nil {
		log.Error("error storing wallet did in db", err)
		http.Error(w, err.Error(), 500)
		return
	}

	err = json.NewEncoder(w).Encode(didStr)
	if err != nil {
		log.Error("error encoding data ", err)
		http.Error(w, err.Error(), 500)
	}
	w.WriteHeader(200)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("log in handler")

	var accountInfo db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&accountInfo); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	// validate username and password
	if err := auth.ValidateCred(accountInfo, db.WALLETACCOUNT); err != nil {
		w.WriteHeader(200)
		_, _ = w.Write([]byte(err.Error()))
	}
	log.Info("log in credential validated")

	// create jwt token string
	jwtString, err := auth.CreateToken(accountInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}
	log.Info("wallet token created => ", jwtString)

	// set cookie
	http.SetCookie(w, &http.Cookie{
		Name:  "wallet_token",
		Value: jwtString,
	})
	w.WriteHeader(200)

}

func StoreVCHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("storing VC ")
	var PRVC db.VerifiableCredentialDB
	err := json.NewDecoder(r.Body).Decode(&PRVC)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	} else {
		fmt.Printf("got vc %+v", PRVC)
	}

	reqToken := r.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer")
	reqToken = splitToken[1]
	fmt.Println("reqToken => ", reqToken)

	username := ""
	// validate cookie string and parse jwt token
	if reqToken == "" {
		log.Error("Invalid token")
		http.Error(w, "Invalid token", 500)
	} else {
		// parse token
		parsedToken, err := auth.ParseToken(reqToken)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
		// obtain username value from token
		username, err = auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
		if err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 400)
		}
	}

	if err = db.StoreVC(PRVC, username); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.WriteHeader(200)
}

func GetVCHandler(w http.ResponseWriter, r *http.Request) {
	token := r.FormValue("token")
	log.Info(token)

	// obtain username value from token string
	parsedToken, err := auth.ParseToken(token)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	username, err := auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	dbName := db.WALLETDBPREFIX + username
	// fetch vc from db
	walletDb := db.StartDB(dbName)
	VCs, err := db.FetchAllWalletInfo(walletDb)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(VCs)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.WriteHeader(200)
}

func GenerateKeysHandler(w http.ResponseWriter, r *http.Request) {
	public, private, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		log.Error("error generating ed25519 keys", err)
		http.Error(w, err.Error(), 500)
		return
	}

	keypair := did.KeyPairs{
		PublicKey:    public,
		PrivateKey:   private,
		PublicKey58:  base58.Encode(public),
		PrivateKey58: base58.Encode(private),
		PublicKey64:  base64.StdEncoding.EncodeToString(public),
		PrivateKey64: base64.StdEncoding.EncodeToString(private),
	}

	log.Println("publicKey => ", base58.Encode(public))
	log.Println("private key => ", base58.Encode(private))

	err = json.NewEncoder(w).Encode(keypair)
	if err != nil {
		log.Error("error encoding keypair")
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(200)
}

func GetPrivateKeyHandler(w http.ResponseWriter, r *http.Request) {
	didStr := r.FormValue("did")
	if didStr == "" {
		log.Error("empty did ")
		http.Error(w, "empty did ", 400)
	}

	privateKey, err := db.GetPrivateKey(didStr, db.WALLETACCOUNT)
	if err != nil {
		log.Error("error getting private key from db ", err)
		http.Error(w, err.Error(), 500)
	}

	log.Println("got privte key => ", privateKey)
	err = json.NewEncoder(w).Encode(privateKey)
	if err != nil {
		log.Error("error encoding private key ", err)
		http.Error(w, err.Error(), 500)
	}
}

func GetWalletDIDHandler(w http.ResponseWriter, r *http.Request) {
	token := r.FormValue("token")
	if token == "" {
		log.Error("empty token")
		http.Error(w, "empty token", 400)
	}

	parsedToken, err := auth.ParseToken(token)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	username, err := auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	didStr, err := db.GetDID(username, db.WALLETACCOUNT)
	if err != nil {
		log.Error("error getting did from db ", err)
		http.Error(w, err.Error(), 500)
		return
	} else if didStr == "" {
		log.Error("did string cannot be empty")
		http.Error(w, "did string cannot be empty ", 500)
		return
	}

	if err = json.NewEncoder(w).Encode(didStr); err != nil {
		log.Error("error encoding did ", err)
		http.Error(w, err.Error(), 500)
	}
}

func DIDAuthGeneratePresentationHandler(w http.ResponseWriter, r *http.Request) {
	walletDID := r.FormValue("did")
	token := r.FormValue("token")
	if walletDID == "" {
		log.Error("empty did ")
		http.Error(w, "empty did ", 400)
	}
	if token == "" {
		log.Error("empty token")
		http.Error(w, "empty token", 400)
	}
	parsedToken, err := auth.ParseToken(token)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	username, err := auth.GetTokenField(auth.TOKEN_USERNAME, parsedToken)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
		return
	}
	profileName := "test-" + username

	// generate/get holder profile for wallet did
	profileExist, profileDID, err := vc.CheckHolderProfileExist(profileName)
	if err != nil {
		log.Error("error getting holder profile")
		http.Error(w, "error getting holder profile", 500)
	}
	if profileExist && (profileDID != walletDID) {
		log.Error("profile did and wallet did do not match")
		http.Error(w, "profile did and wallet did do not match", 500)
	}

	if !profileExist {
		if err := vc.GenerateHolderProfile(profileName, walletDID); err != nil {
			log.Println("error generating holder profile ", err)
			http.Error(w, err.Error(), 500)
		}
		log.Println("holder profile generated")
	}

	wait, _ := time.ParseDuration("2.5s")
	time.Sleep(wait)

	// generate and sign presentation
	signedPresentation, err := vc.GenerateSignedPresentation(profileName, walletDID)
	if err != nil {
		log.Error("error generating signed presentation ", err)
		http.Error(w, err.Error(), 500)
	}

	if err = json.NewEncoder(w).Encode(signedPresentation); err != nil {
		log.Error("error encoding presentation ", err)
		http.Error(w, err.Error(), 500)
	}

}

func TestAriesHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("test aries handler")
	framework, _ := aries.New()
	ctx, _ := framework.Context()
	client, _ := verifiable.New(ctx)

	const vc = `
{ 
   "@context":[ 
      "https://www.w3.org/2018/credentials/v1"
   ],
   "id":"http://example.edu/credentials/1989",
   "type":"VerifiableCredential",
   "credentialSubject":{ 
      "id":"did:example:iuajk1f712ebc6f1c276e12ec21"
   },
   "issuer":{ 
      "id":"did:example:09s12ec712ebc6f1c671ebfeb1f",
      "name":"Example University"
   },
   "issuanceDate":"2020-01-01T10:54:01Z",
   "credentialStatus":{ 
      "id":"https://example.gov/status/65",
      "type":"CredentialStatusList2017"
   }
}
`
	vcs := []json.RawMessage{[]byte(vc)}

	presReq := verifiable.PresentationRequest{
		VerifiableCredentials: vcs,
		DID:                   "did:peer:21tDAKCERh95uGgKbJNHYp",
		ProofOptions: &verifiable.ProofOptions{
			SignatureType: verifiable.Ed25519Signature2018,
		},
	}

	presReqBytes, err := json.Marshal(presReq)
	if err != nil {
		log.Error("error marshalling ", err)
	}

	var b bytes.Buffer
	err = client.GeneratePresentation(&b, bytes.NewBuffer(presReqBytes))
	if err != nil {
		log.Error("error generating pres ", err)
	}
}
