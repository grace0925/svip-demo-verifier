package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/btcsuite/btcutil/base58"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"github.com/square/go-jose"
	"golang.org/x/crypto/ed25519"
	"image/png"
	"math/rand"
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/did"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
	"strings"
	"time"
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
		log.Error("couldn't decode userinfo ", err)
		http.Error(w, err.Error(), 400)
	}

	reqToken := r.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer")
	reqToken = splitToken[1]
	fmt.Println("reqToken => ", reqToken)

	userdb := db.StartDB(db.USERDB)
	err = db.StoreUserInfo(userdb, info)

	if err != nil {
		log.Error("couldn't store user info ", err)
		http.Error(w, err.Error(), 400)
	}

	w.WriteHeader(200)
}

// call edge service to generate verifiable credential with user information and send vc back
func HandleCreateVC(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("ID")

	didstring := "did:test"
	info := vc.IssuerInfo{
		DID:  didstring,
		Name: "uscis",
	}

	// fetch user information from user_info db
	fmt.Println("***fetching vc info from database...")
	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}

	client := &http.Client{}
	// calling edge service to generate credentials
	err = vc.GenerateProfile(client, info)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}
	wait, _ := time.ParseDuration("2.5s")
	time.Sleep(wait)
	card, err := vc.GenerateVC(client, info, userInfo)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	} else {
		log.Info(card)
	}
	// encode vc
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(card)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	} else {
		w.WriteHeader(200)
	}
}

func HandleCreateIssuerAccount(w http.ResponseWriter, r *http.Request) {
	log.Info("creating issuer account")
	var newAccount db.AccountDB
	if err := json.NewDecoder(r.Body).Decode(&newAccount); err != nil {
		log.Error("failed to decode ", err)
		http.Error(w, err.Error(), 400)
	}
	err := auth.CreateAccount(newAccount, db.ISSUERACCOUNT)
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
		log.Println("issuer account created")
	}
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

// return a
func GetRandomProfilePic(w http.ResponseWriter, r *http.Request) {
	// generate random number to select random images
	rand.Seed(time.Now().UTC().UnixNano())
	min, max := 0, 7
	i := rand.Intn(max-min) + min

	var imageMap = map[int]string{
		0: "./client/src/assets/perry.png",
		1: "./client/src/assets/pooh.png",
		2: "./client/src/assets/panda.png",
		3: "./client/src/assets/drDoof.png",
		4: "./client/src/assets/spongebob.png",
		5: "./client/src/assets/princess.png",
		6: "./client/src/assets/pumba.png",
	}

	file, err := os.Open(imageMap[i])
	if err != nil {
		log.Error(err)
	}
	image, err := png.Decode(file)
	if err != nil {
		log.Error(err)
	}
	w.Header().Set("Content-Type", "image/png")
	png.Encode(w, image)
	w.WriteHeader(200)

	/*
		// read png into byte array
		reader := bufio.NewReader(file)
		imageContent, err := ioutil.ReadAll(reader)
		// encode as base64
		_ := base64.StdEncoding.EncodeToString(imageContent)

		buffer := new(bytes.Buffer)
		if err := png.Encode(buffer, file); err != nil {

		}*/
}

func VerifyDIDAuthPresentation(w http.ResponseWriter, r *http.Request) {
	verifyReq := did.VerifyDidAuthPresentationRequest{}
	err := json.NewDecoder(r.Body).Decode(&verifyReq)
	if err != nil {
		log.Error("decoding did auth req err ", err)
		http.Error(w, err.Error(), 400)
		return
	}

	log.Printf("got resolution => %+v", verifyReq)
	didauthPresentation := verifyReq.DidAuthPresentation

	if didauthPresentation.Holder == "" {
		log.Error("empty holder field ")
		http.Error(w, "empty holder field", 400)
	} else if didauthPresentation.Proof.JWS == "" {
		log.Error("invalid proof ")
		http.Error(w, "invalid proof", 400)
	}

	didResolution, err := did.ResolveDID(didauthPresentation.Holder)
	if err != nil {
		log.Error("error resolving DID ", err)
		http.Error(w, err.Error(), 500)
	}

	publicKey := ed25519.PublicKey(base58.Decode(didResolution.DIDDocument.PublicKey[0].PublicKeyBase58))
	jwsStr := did.UnformatJWS(didauthPresentation.Proof.JWS)
	log.Println("unformated jws Str => ", jwsStr)

	object, err := jose.ParseSigned(jwsStr)
	if err != nil {
		log.Error("error parsing signed jws ", err)
		http.Error(w, err.Error(), 400)
	}
	log.Println("parsed jws => ", object)

	output, _ := object.Verify(publicKey)

	log.Println("result => ", string(output))
	log.Println("expected result => ", didauthPresentation.Proof.Challenge)

	/*if string(output) == didauthPresentation.Proof.Challenge {
		w.WriteHeader(200)
	} else {
		http.Error(w, "didAuth failed", 500)
		return
	}*/
}
