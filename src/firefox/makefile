yourtime: scripts/* ../common/* ../node_modules/*
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
	# Compile SCSS to the resource folder in the build directory
	sass -Cf ../common/resources/stylesheet.scss ../../build/firefox/resources/stylesheet.css
	# Compile TS files using tsconfig.json
	tsc
	# Copy third party licenses
	cp ../node_modules/@types/jquery/LICENSE ../../build/firefox/LEGAL/THIRD_PARTIES/tsjquery
	# Move popup.js to the popup folder
	mv ../../build/firefox/scripts/popup.js ../../build/firefox/popup/popup.js
	# Clean up
	rm -rf ../../build/firefox/resources/stylesheet.css.map ../../build/firefox/resources/stylesheet.scss
