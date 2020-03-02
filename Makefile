#
#
#

.PHONY: start
demo-start:
	@scripts/demo-start.sh

.PHONY: stop
demo-stop:
	@chmod +x scripts/demo-stop.sh
	@scripts/demo-stop.sh