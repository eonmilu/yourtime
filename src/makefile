buildDir = ../build
target = firefox # Default build to firefox
dir = "$(buildDir)/$(target)"

yourtime: $(target)/scripts/* common/*
	# Make new build/$(target)
	mkdir -p $(buildDir)
	rm -rf $(dir)
	mkdir $(dir)

	# Copy common resources
	cp -rf common/* $(dir)/

	# Copy licenses
	cp node_modules/@types/jquery/LICENSE $(dir)/LEGAL/THIRD_PARTIES/tsjquery
	cp node_modules/jquery/LICENSE.txt $(dir)/LEGAL/THIRD_PARTIES/jquery

	# Compile TypeScript
	tsc

	# Compile SCSS
	sass common/resources/stylesheet.scss $(dir)/resources/stylesheet.css
	sass common/popup/popup.scss $(dir)/popup/popup.css

	# Copy manifest and libraries
	cp $(target)/manifest.json $(dir)/
	cp node_modules/jquery/dist/jquery.min.js $(dir)/scripts/jquery.min.js

	# Move popup.js from scripts/ to popup/
	mv $(dir)/scripts/popup.js $(dir)/popup/popup.js
