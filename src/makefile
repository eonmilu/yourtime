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
	cp node_modules/jquery/LICENSE.txt    $(dir)/LEGAL/THIRD_PARTIES/jquery

	# Compile TypeScript
	tsc -t ES6 --outFile $(dir)/scripts/scriptloader.js $(target)/scripts/scriptloader_ts/*.ts
	tsc -t ES6 --outFile $(dir)/scripts/xmi.lu.js   $(target)/scripts/xmi.lu_ts/*
	tsc -t ES6 --outFile $(dir)/scripts/content.js      $(target)/scripts/content_ts/*
	tsc -t ES6 --outFile $(dir)/scripts/popup.js        $(target)/scripts/popup_ts/*

	# Compile SCSS
	sass common/resources/stylesheet.scss $(dir)/resources/stylesheet.css
	sass common/popup/popup.scss 		  $(dir)/popup/popup.css

	# Copy manifest and libraries
	cp $(target)/manifest.json $(dir)/
	cp node_modules/jquery/dist/jquery.js $(dir)/scripts/jquery.min.js

	# Move popup.js from scripts/ to popup/
	mv $(dir)/scripts/popup.js $(dir)/popup/popup.js

	# Cleanup
	rm $(dir)/popup/popup.css.map $(dir)/popup/popup.scss
	rm $(dir)/resources/stylesheet.css.map $(dir)/resources/stylesheet.scss
