# Overview

A demo Verifier / Relying Party website that can collect and process Verifiable Credentials.
Focused on the SVIP project.

# Prerequisites

*  Go 1.13+
*  Docker
*  Docker-compose
*  Make

# Set-up

In order to access docker images used in the demo you have to create a personal token with read:packages and repo permissions (instructions [here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)).
Run the following command using your newly generated personal token: 

```bash
docker login -u <github username> -p <github token with read:packages and repo permission> docker.pkg.github.com
```

Some of the images also need special host configuration, which is as simple as appending the following lines to the /etc/hosts file of your *NIX machine:

```bash
127.0.0.1 testnet.trustbloc.local
127.0.0.1 stakeholder.one
127.0.0.1 sidetree-mock
```

# Demo instructions

To start the demo, navigate to the project's root directory and run ```make demo-start```
This command also restarts the demo if it is currently running.

To stop the demo without restarting, run ```make demo-stop```

For developers there is the additional ```make demo-debug``` command which prints the demo's (very noisy) logs to the console for debugging purposes

The user flow is as follows:

1.  Navigate to the Wallet (default https://localhost:8082) to create an account and register a wallet
2.  Visit the Issuer (default https://localhost:8080) to create an account and issue a verifiable credential to a wallet
3.  Open the Verifier (default https://localhost:8081) to create an account and verify a verifiable presentation from a wallet