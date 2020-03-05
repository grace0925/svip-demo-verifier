# Overview

A demo Verifier / Relying Party website that can collect and process Verifiable Credentials.
Focused on the SVIP project.

# Prerequisites

*  Go 1.13
*  Docker
*  Docker-compose
*  Make

# Demo Set-up

In order to access docker images used in the demo you have to create personal token with read:packages and repo permissions (instructions [here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)).
Run the following command using your newly generated personal token: 

```bash
docker login -u <username> -p <github token with read:packages and repo permission> docker.pkg.github.com
```

# Demo instructions

To start the demo, navigate to the project's root directory and run ```make demo-start```
This command also restarts the demo if it is currently running.

To stop the demo without restarting, run ```make demo-stop```