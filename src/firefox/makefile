yourtime: scripts/* ../common/*
	# Make new build/firefox
	mkdir -p ../../build
	rm -rf ../../build/firefox
	mkdir ../../build/firefox

	# Copy common resources
	cp -rf ../common/* ../../build/firefox/

	# Copy licenses
	cp ../node_modules/@types/jquery/LICENSE ../../build/firefox/LEGAL/THIRD_PARTIES/tsjquery
	cp ../node_modules/jquery/LICENSE.txt ../../build/firefox/LEGAL/THIRD_PARTIES/jquery

	# Compile TypeScript
	tsc

	# Compile SCSS
	sass ../common/resources/stylesheet.scss ../../build/firefox/resources/stylesheet.css
	sass ../common/popup/popup.scss ../../build/firefox/popup/popup.css

	# Copy manifest and libraries
	cp manifest.json ../../build/firefox/
	cp ../node_modules/jquery/dist/jquery.min.js ../../build/firefox/scripts/jquery.min.js

	# Move popup.js from scripts/ to popup/
	mv ../../build/firefox/scripts/popup.js ../../build/firefox/popup/popup.js
