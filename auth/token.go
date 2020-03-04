package auth

import (
	"github.com/dgrijalva/jwt-go"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

var jwtKey = []byte(os.Getenv("JWT_KEY"))

type Claims struct {
	Username string `json:"username, omitempty"`
	jwt.StandardClaims
}

func CreateToken(info db.AccountDB) (string, error) {
	claim := &Claims{
		Username:       info.Username,
		StandardClaims: jwt.StandardClaims{},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	jwtString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return jwtString, nil
}
