package auth

import (
	"errors"
	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"
	"os"
	"sk-git.securekey.com/labs/svip-demo-verifier/db"
)

const TOKEN_USERNAME = "username"

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

func ParseToken(tokenString string) (*jwt.Token, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (i interface{}, err error) {
		return jwtKey, nil
	})
	if err != nil {
		log.Error(err)
		var empty = jwt.Token{}
		return &empty, err
	}
	return token, nil
}

func GetTokenField(fieldName string, parsedToken *jwt.Token) (string, error) {
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		field := claims[fieldName]
		log.WithFields(log.Fields{
			fieldName: field,
		}).Info("got username")
		return field.(string), nil
	} else {
		return "", errors.New("Error parsing token, invalid token")
	}
}
