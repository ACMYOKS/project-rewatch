const functions = require('firebase-functions');
const https = require('https');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const YTSeacher = require('./util/script-searcher.js');

// admin.initializeApp(functions.config().firebase);
admin.initializeApp();

const db = admin.firestore();

exports.getYtInfo = functions.https.onRequest(async (req, res) => {
	const vid = req.query.v;
	if (!vid || typeof vid !== 'string') {
		functions.logger.info('no vid');
		throw new functions.https.HttpsError('invalid-argument', 'Absence of video id');
	} else {
		try {
			const info = await fetch('https://www.youtube.com/get_video_info?video_id='+vid);
			const body = await info.text();
			const infoPairs = body.split('&');
			let infoMap = {};
			infoPairs.forEach((pair) => {
				let kV = pair.split('=');
				if (kV.length == 2) {
					infoMap[kV[0]] = kV[1];
				}
			});
			if (!infoMap.player_response) {
				// player response not exists
				throw new functions.https.HttpsError('not-found', 'Absence of "player_response" in YouTube info');
			} else {
				let playerResJson;
				try {
					playerResJson = JSON.parse(decodeURIComponent(infoMap.player_response));
				} catch(e) {
					throw new functions.https.HttpsError('internal', e.message);
				}
				let resultMap = {};
				const vd = playerResJson.videoDetails;
				const sd = playerResJson.streamingData;
				if (vd) {
					resultMap.videoDetails = {
						videoId: vd.videoId,
						title: vd.title,
						author: vd.author,
						lengthSeconds: vd.lengthSeconds,
						keywords: vd.keywords,
						channelId: vd.channelId,
						shortDescription: vd.shortDescription
					};
				} else {
					resultMap.videoDetails = {};
				}

				let formats, aFormats;
				if (sd) {
					formats = (sd.formats) ? sd.formats : [];
					aFormats = (sd.adaptiveFormats) ? sd.adaptiveFormats : [];
				}
				resultMap.formats = [];
				resultMap.adaptiveFormats = [];
				if (formats.some((i) => 'signatureCipher' in i || 'cipher' in i)) {
					// use player script to decrypt url
					try {
						const embededPage = await fetch('https://www.youtube.com/embed/' + vid);
						const embededPageBody = await embededPage.text();
						const scriptUrl = YTSeacher.getScriptUrl(embededPageBody);
						const docRef = db.collection('decrypt_scripts').doc(encodeURIComponent(scriptUrl));
						const docData = await docRef.get();
						let codes = null;
						if (docData.exists) {
							functions.logger.info('use db record');
							codes = docData.data();
						} else {
							const script = await fetch('https://www.youtube.com' + scriptUrl);
							const scriptBody = await script.text();
							functions.logger.info({url: scriptUrl});
							const searcher = new YTSeacher.Searcher(scriptBody);
							codes = searcher.decipherCode;
							codes.createdAt = admin.firestore.Timestamp.now();
							functions.logger.info('add new record to db');
							await docRef.set(codes);
						}
						functions.logger.info({code: codes});
						const decrypter = new YTSeacher.Decrypter(codes);
						formats.forEach((f) => {
							if (f.mimeType && f.mimeType.includes('mp4')) {
								const cipher = f.signatureCipher ?? f.cipher;
								if (cipher) {
									try {
										const resultUrl = decrypter.getDecryptedUrl(cipher);
										resultMap.formats.push({itag: f.itag, url: resultUrl});
									} catch (err) {
										functions.logger.error({err: err.message});
									}
								}
							}
						});
						aFormats.forEach((f) => {
							if (f.mimeType && f.mimeType.includes('mp4')) {
								const cipher = f.signatureCipher ?? f.cipher;
								if (cipher) {
									try {
										const resultUrl = decrypter.getDecryptedUrl(cipher);
										resultMap.adaptiveFormats.push({itag: f.itag, url: resultUrl});
									} catch (err) {
										functions.logger.error({err: err.message});
									}
								}
							}
						});
					} catch (err) {
						functions.logger.error({
							err: err.message
						});
					}
				} else {
					formats.forEach((f) => {
						// only get mp4 streaming formats
						if (f.mimeType && f.mimeType.includes('mp4')) {
							resultMap.formats.push({itag: f.itag, url: f.url});
						}
					});
					aFormats.forEach((f) => {
						// only get mp4 streaming formats
						if (f.mimeType && f.mimeType.includes('mp4')) {
							resultMap.adaptiveFormats.push({itag: f.itag, url: f.url});
						}
					});
				}
				res.status(200).json({data:resultMap});
			}
		} catch (err) {
			functions.logger.error({
				err: err.message
			});
			throw new functions.https.HttpsError('internal', err.message);
		}
	}
});