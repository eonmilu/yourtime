const SELECT_URL = "https://oxygenrain.com/yourtime/search";
const INSERT_URL = "https://oxygenrain.com/yourtime/insert";
const META = JSON.parse($("meta[name='your-time-meta'").attr('content'));
const DEFAULT_TIMEOUT = 1500;
const EXTENSION_URL = "https://addons.mozilla.org/firefox/addon/yourtime/";
const PLAYING = 1;
const VOTES_URL = "https://oxygenrain.com/yourtime/votes";
const STATUS_CODE = {
	FOUND: "200",
	NOT_FOUND: "210",
	ERROR: "220"
};
