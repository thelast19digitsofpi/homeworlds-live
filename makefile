# Just a quick utility so that I can just do "make run" to run the server.
# If I end up needing a compile step, this would make it easier.

runp:
	NODE_ENV=prod node --experimental-modules main.js

run:
	NODE_ENV=dev node --experimental-modules main.js

# OK this made it easier
# & to make it a background process
watch:
	npm run watch &

# This was also partially to give me a quick way to build the SVG files needed
build-svgs:
	node build_scripts/build-svgs.js

build-background:
	node build_scripts/build-background.js
	