package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/db"
	"sk-git.securekey.com/labs/svip-demo-verifier/pkg/vc"
)

func VerifyVCHandler(w http.ResponseWriter, r *http.Request) {
	log.Info("----- verify VC handler")

	var rawVC db.VerifiableCredentialDB
	if err := json.NewDecoder(r.Body).Decode(&rawVC); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 400)
	}
	fmt.Printf("%+v", rawVC)

	verified, err := vc.VerifyVC(rawVC)
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), 500)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	if err = json.NewEncoder(w).Encode(verified); err != nil {
		log.Error(err)
	}
}

func GetProfilePictureHandler(w http.ResponseWriter, r *http.Request) {
	reqMap := map[string]string{}
	if err := json.NewDecoder(r.Body).Decode(&reqMap); err != nil {
		log.Error("error decoding image string ", err)
		http.Error(w, err.Error(), 400)
	}

	shortenedImageStr := reqMap["shortenedImageStr"]
	shortenedImageStr = shortenedImageStr[len(shortenedImageStr)-6:]
	if shortenedImageStr == "" {
		log.Error("empty image string ")
		http.Error(w, "empty image string", 400)
	}

	database := db.StartDB(db.USERDB)
	regex := shortenedImageStr + "$"

	query := map[string]interface{}{
		"selector": map[string]interface{}{
			"credentialSubject.image": map[string]interface{}{
				"$regex": regex,
			},
		},
	}
	rows, err := database.Find(context.TODO(), query)
	if err != nil {
		log.Error("error retrieving rows from db ", err)
		http.Error(w, err.Error(), 500)
		return
	}

	var info db.UserInfoDB
	for rows.Next() {
		if err := rows.ScanDoc(&info); err != nil {
			log.Error(err)
			http.Error(w, err.Error(), 500)
			return
		}
		log.Printf("info %+v", info)
		break
	}
	if rows.Err() != nil {
		log.Error("error scan doc ", rows.Err())
		http.Error(w, err.Error(), 500)
		return
	}

	image := info.CredentialSubject.Image
	_ = json.NewEncoder(w).Encode(image)

}
