'use strict';

const secondToReadable = function(second) {
	const s = Number(second);
	if (isNaN(s)) {
		return null;
	}
	const ss = Math.floor(s % 60);
	const mm = Math.floor(s % (60 * 60) / 60);
	const hh = Math.floor(s / (60 * 60));
	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

const YouTubeITag = {
	18: "360p (MUX)",
    82: "360p (MUX)",
    83: "480p (MUX)",
    22: "720p (MUX)",
    84: "720p (MUX)",
    37: "1080p (MUX)",
    85: "1080p (MUX)",
    38: "3072p (MUX)",
    160: "144p",
    133: "240p",
    134: "360p",
    135: "480p",
    136: "720p",
    298: "720p60",
    137: "1080p",
    299: "1080p60",
    263: "1440p",
    138: "2160p60",
    266: "2160p60",
    139: "48k",
    140: "128k",
    141: "256k"
}

export { secondToReadable, YouTubeITag };