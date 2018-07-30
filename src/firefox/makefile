yourtime: scripts/* ../common/resources/* ../common/* ../node_modules/*
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
	# Copy Firebase UI JavaScript
	cp -f ../node_modules/firebaseui/dist/firebaseui.js ../../build/firefox/scripts/firebaseui.js
	# Copy Firebase UI CSS
	cp -f ../node_modules/firebaseui/dist/firebaseui.css ../../build/firefox/resources/firebaseui.css
	# Compile TS files using tsconfig.json
	tsc
	# Copy third party licenses
	cp ../node_modules/dialog-polyfill/LICENSE ../../build/firefox/LEGAL/THIRD_PARTIES/dialog-polyfill
	cp ../node_modules/firebaseui/LICENSE ../../build/firefox/LEGAL/THIRD_PARTIES/firebaseui
	cp ../node_modules/jquery/LICENSE.txt ../../build/firefox/LEGAL/THIRD_PARTIES/jquery
	cp ../node_modules/@types/jquery/LICENSE ../../build/firefox/LEGAL/THIRD_PARTIES/tsjquery
	# Clean up
	rm -rf ../../build/firefox/resources/stylesheet.css.map ../../build/firefox/resources/stylesheet.scss ../../build/firefox/package-lock.json ../../build/firefox/package.json
