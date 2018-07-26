yourtime: scripts/* ../common/resources/stylesheet.scss ../common/*
	# Create build directory if it does not exist
	mkdir -p ../../build
	# Delete the previous Firefox build if it exists
	rm -rf ../../build/firefox
	# Create an empty Firefox directory
	mkdir -p ../../build/firefox
	# Copy all common files and folders to the new directory
	cp -rf ../common/* ../../build/firefox/
	# Copy bundled manifest.json to build directory
	cp manifest.json ../../build/firefox/
	# Create scripts folder
	mkdir ../../build/firefox/scripts/
	# Copy jQuery JS file to scripts
	cp ../node_modules/jquery/dist/jquery.min.js ../../build/firefox/scripts/
	# Compile SCSS to the resource folder in the build directory
	sass -Cf ../common/resources/stylesheet.scss ../../build/firefox/resources/stylesheet.css
	# Compile TS files using tsconfig.json
	tsc
