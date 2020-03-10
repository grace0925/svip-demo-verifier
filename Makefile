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

.PHONY: debug
demo-debug:
	@chmod +x scripts/demo-debug.sh
	@scripts/demo-debug.sh