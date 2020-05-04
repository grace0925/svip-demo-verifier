package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"image/png"
	"math/rand"
	"net/http"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/auth"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
	"time"
)

type PresentationFromWallet struct {
	Presentation vc.SignPresentationResp `json:"presentation"`
}

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
	walletDID := r.FormValue("walletDID")
	if id == "" {
		log.Error("empty session id")
		http.Error(w, "empty sesion id", 400)
	} else if walletDID == "" {
		log.Error("empty wallet did")
		http.Error(w, "empty wallet did", 400)
	}
	decodedDID, _ := base64.StdEncoding.DecodeString(walletDID)

	exist, issuerDID, err := vc.GetProfile("grace2")
	if err != nil {
		log.Error(err)
	}

	wait, _ := time.ParseDuration("2.5s")
	time.Sleep(wait)

	if !exist {
		err := vc.GenerateProfile("grace2")
		if err != nil {
			log.Error("error generating profile ", err)
			http.Error(w, err.Error(), 500)
		}
	}

	// fetch user information from user_info db
	userdb := db.StartDB(db.USERDB)
	userInfo, err := db.FetchUserInfo(userdb, id)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	log.Printf("fetched user info from db => %+v", userInfo)

	rawVC, err := vc.GenerateVC(userInfo, "grace2", issuerDID, string(decodedDID))
	if err != nil {
		log.Error("Error generating vc ", err)
		http.Error(w, err.Error(), 500)
	} else {
		log.Printf("generated vc => %+v ", rawVC)
	}
	// encode vc
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(rawVC)
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

func HandleVerifyPresentation(w http.ResponseWriter, r *http.Request) {
	log.Println("verifying presentation")
	presentation := vc.PresentationFromWallet{}
	if err := json.NewDecoder(r.Body).Decode(&presentation); err != nil {
		log.Error("error decoding presentation")
		http.Error(w, err.Error(), 400)
		return
	}
	log.Printf("got presentation from wallet => %+v", presentation)

	verified, err := vc.VerifyVP(presentation)
	if err != nil {
		log.Error("error verifying VP ", err)
		http.Error(w, err.Error(), 500)
	}

	log.Println("vp is verified => ", verified)
	if err = json.NewEncoder(w).Encode(verified); err != nil {
		log.Error("error encoding vp")
		http.Error(w, err.Error(), 500)
	}
}
