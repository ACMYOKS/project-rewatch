// For temp usage, for long term usage, please create multiple environment

const USE_EMULATOR = false;

function getApiUrl() {
	if (USE_EMULATOR) {
		return 'http://localhost:5001/project-rewatch/asia-east2/api'
	} else {
		return 'https://asia-east2-project-rewatch.cloudfunctions.net/api'
	}
}

export { getApiUrl };