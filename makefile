# Just a quick utility so that I can just do "make run" to run the server.
# If I end up needing a compile step, this would make it easier.

runp:
	NODE_ENV=prod node main.js

run:
	NODE_ENV=dev node main.js

# OK this made it easier
# & to make it a background process
watch:
	npm run watch &

build-svgs:
	node build_scripts/build-svgs.js

build-background:
	node build_scripts/build-background.js