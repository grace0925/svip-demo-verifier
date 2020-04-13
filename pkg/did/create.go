package did

import (
	"crypto/ed25519"
	"crypto/rand"
	"github.com/btcsuite/btcutil/base58"
	mocklegacykms "github.com/hyperledger/aries-framework-go/pkg/mock/kms/legacykms"
	log "github.com/sirupsen/logrus"
	tb "github.com/trustbloc/trustbloc-did-method/pkg/did"
)

func GenerateDID() (string, error) {
	pubKey, _, err := ed25519.GenerateKey(rand.Reader)
	c := tb.New(tb.WithKMS(&mocklegacykms.CloseableKMS{CreateSigningKeyValue: base58.Encode(pubKey)}))
	log.Print("Created Trustbloc Client")
	doc, err := c.CreateDID("testnet.trustbloc.local")
	if err != nil || doc == nil {
		log.Error(err)
		return "", err
	}
	log.Print("Created Trustbloc DID Doc: ", *doc)
	did := doc.ID
	return did, nil
}
