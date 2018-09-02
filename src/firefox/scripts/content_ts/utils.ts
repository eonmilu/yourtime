function votesToRGBA(votes: number, onHover = false) {
	// Anything beyond these will be considered as infinity
	const MaxColorVotes = 100;
	const DefTransparency = 0.6;

	// Edge cases
	if (votes == 0) {
		if (onHover) {
			return `rgba(200, 200, 200, ${DefTransparency - 0.2})`;
		}
		return `rgba(255, 255, 255, ${DefTransparency})`;
	}

	const IsNegative = votes < 0;
	const AbsTransparency = Math.log(Math.abs(votes)) / Math.log(MaxColorVotes);
	var trueTransparency = AbsTransparency > 0.6 ? 0.6 : AbsTransparency;

	var redValue, greenValue, blueValue;
	if (IsNegative) {
		redValue = 40;
		greenValue = 120;
		blueValue = 240;
	} else {
		redValue = 240;
		greenValue = 120;
		blueValue = 40;
	}

	if (onHover) {
		trueTransparency += 0.3;
	}

	return `rgba(${redValue}, ${greenValue}, ${blueValue}, ${trueTransparency})`;
}

// Transform seconds to [(days):(hours):]minutes:seconds
function secondsToTimestamp(seconds: any): string {
	// Ignore negative seconds and types other than number
	if (seconds < 0 || typeof seconds != "number")
		return undefined;

	let days: any = Math.floor(seconds / (3600 * 24));
	seconds -= days * 3600 * 24;
	let hours: any = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	let minutes: any = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	ensureTwoDigits();

	const Time = `${days}:${hours}:${minutes}:${seconds}`;

	// Remove unnecessary "00:"s, keeping the last two for formatting
	return Time.replace(/^(00\:){1,2}/gm, "");

	function ensureTwoDigits() {
		if (days < 10)
			days = "0" + days;
		if (hours < 10)
			hours = "0" + hours;
		if (minutes < 10)
			minutes = "0" + minutes;
		if (seconds < 10)
			seconds = "0" + seconds;
	}
}

// Make numbers human-readable
function readablizeNumber(number: number): string {
	if (number == 0) return "0"
	const suffixes = ['', 'k', 'M', 'B'];
	const e = Math.floor(Math.log(Math.abs(number)) / Math.log(1000));
	return Math.round((number / Math.pow(1000, e))) + suffixes[e];
}
