package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/btcsuite/btcutil/base58"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ed25519"
	"gopkg.in/square/go-jose.v2"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/did"
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
	didStr, privateKey, err := did.RegisterDID()
	newAccount.DID = didStr
	newAccount.PrivateKey = privateKey

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

	// create jwt token string
	jwtString, err := auth.CreateToken(accountInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	// set cookie
	http.SetCookie(w, &http.Cookie{
		Name:  "wallet_token",
		Value: jwtString,
	})
	w.WriteHeader(200)

}

func StoreVCHandler(w http.ResponseWriter, r *http.Request) {
	var PRVC db.PermanentResidentCardDB
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
		PublicKey:     public,
		PrivateKey:    private,
		PublicKeyStr:  base58.Encode(public),
		PrivateKeyStr: base58.Encode(private),
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

func GenerateDIDAuthPresentation(w http.ResponseWriter, r *http.Request) {
	didStr := r.FormValue("did")
	domain := r.FormValue("domain")
	challenge := r.FormValue("challenge")

	log.Println("did => ", didStr)
	log.Println("domain => ", domain)
	log.Println("challenge => ", challenge)

	if didStr == "" {
		log.Error("did empty")
		http.Error(w, "did cannot be empty", 400)
		return
	}

	// resolve did
	didResolution, err := did.ResolveDID(didStr)
	if err != nil {
		log.Error("error resolving did ", err)
		http.Error(w, err.Error(), 500)
	}
	log.Printf("successfully resolved did => %+v", didResolution)

	privateKey, err := db.GetPrivateKey(didStr, db.WALLETACCOUNT)
	if err != nil {
		log.Error("error retrieving private key ", err)
		http.Error(w, err.Error(), 500)
		return
	}
	log.Println("successfully got private key for did " + didStr + " => " + base58.Encode(privateKey))

	var contextArr []string
	contextArr = append(contextArr, "https://www.w3.org/2018/credentials/v1")
	createdTime := time.Now()

	proof := did.Proof{
		Type:               did.KEYTYPE,
		Created:            &createdTime,
		JWS:                "",
		ProofPurpose:       did.PROOFPURPOSE,
		Domain:             domain,
		Challenge:          challenge,
		VerificationMethod: didResolution.DIDDocument.PublicKey[0].PublicKeyBase58,
	}

	signer, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.EdDSA, Key: privateKey}, nil)
	if err != nil {
		log.Error("error creating jose signer")
		http.Error(w, err.Error(), 500)
	}

	var payload = []byte(challenge)

	object, err := signer.Sign(payload)
	if err != nil {
		log.Error("error signing payload")
		http.Error(w, err.Error(), 500)
	}
	serialized := object.FullSerialize()
	jws := did.FormatJWS(serialized)
	proof.JWS = jws

	presentation := did.DidAuthPresentation{
		Context: contextArr,
		Type:    did.PRESENTATIONTYPE,
		Holder:  didStr,
		Proof:   proof,
	}
	log.Printf("generated presentation %+v", presentation)
	err = json.NewEncoder(w).Encode(presentation)
	if err != nil {
		log.Error("error encoding json ", err)
		http.Error(w, err.Error(), 500)
	}
	w.WriteHeader(200)
}
