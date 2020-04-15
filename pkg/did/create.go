package did

import (
	"crypto/ed25519"
	"crypto/rand"
	docdid "github.com/hyperledger/aries-framework-go/pkg/doc/did"
	log "github.com/sirupsen/logrus"
	tb "github.com/trustbloc/trustbloc-did-method/pkg/did"
)

func GenerateDID() (string, error) {
	pubKey, _, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		log.Error("failed to generate public key", err)
	}

	c := tb.New()
	log.Println("Created Trustbloc Client")

	doc, err := c.CreateDID("testnet.trustbloc.dev", tb.WithPublicKey(&docdid.PublicKey{ID: "#key-1", Value: pubKey, Type: "Ed25519VerificationKey2018"}))
	if err != nil || doc == nil {
		log.Error(err)
		return "", err
	}
	log.Printf("Created Trustbloc DID Doc: %+v", doc)
	did := doc.ID

	return did, nil
}
