# Just a quick utility so that I can just do "make run" to run the server.
# If I end up needing a compile step, this would make it easier.


run:
	node main.js

test-argon:
	node stuff/argon_test.js

build-svgs:
	node build_scripts/build-svgs.js

build-background:
	node build_scripts/build-background.js