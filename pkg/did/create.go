package did

import (
	"crypto/ed25519"
	"crypto/rand"
	"github.com/btcsuite/btcutil/base58"
	log "github.com/sirupsen/logrus"
)

func GenerateDID() (string, string, error) {
	pubKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	log.Printf("public key => %s", base58.Encode(pubKey))
	if err != nil {
		log.Error("failed to generate public key", err)
	}
	//c := tb.New()
	log.Println("Created Trustbloc Client")
	/*doc, err := c.CreateDID("testnet.trustbloc.dev", tb.WithPublicKey(&docdid.PublicKey{Type:"Ed25519VerificationKey2018", ID:"#key-1", Value:pubKey}))
	if err != nil || doc == nil {
		log.Error(err)
		return "","", err
	}*/
	doc := map[string]interface{}{}
	log.Printf("Created Trustbloc DID Doc: %+v", doc)
	did := "tesint did"

	return did, base58.Encode(privateKey), nil
}
