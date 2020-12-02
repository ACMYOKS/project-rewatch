'use strict';

const fs = require('fs');
const functions = require('firebase-functions');
const https = require('https');
const express = require('express');
const cors = require('cors')({origin: true});
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const YTSearcher = require('./util/script-searcher.js');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();

const requestLogger = (req, res, next) => {
	functions.logger.info({
		request: `${req.method} ${req.path}`,
		query: req.query,
		params: req.params,
		body: req.body
	});
	next();
};

app.use(cors);

app.get('/ytinfo/:vid', requestLogger, async(req, res) => {
	const currentTime = Date.now();
	const vid = req.params.vid;
	if (!vid || typeof vid !== 'string') {
		functions.logger.info('no vid');
		res.status(400).json({message: 'absence of argument \'vid\''});
		return;
	}
	const responseDocRef = db.collection('yt_info_response').doc(vid);
	const responseDocRefData = await responseDocRef.get();
	if (responseDocRefData.exists) {
		let response = responseDocRefData.data();
		if (typeof response.lastUpdateTime !== "undefined") {
			if (currentTime - response.lastUpdateTime > 4 * 60 * 1000) {	// response expires after 4 hours
				functions.logger.info(
					`response for ${vid} expires, lastUpdateTime: ${response.lastUpdateTime}, currentTime: ${currentTime}`
				);
			} else {
				if (typeof response.statusCode !== "undefined" && typeof response.message !== "undefined") {
					// is an error
					functions.logger.info(`hit response cache for ${vid}, is an error`);
					res.status(response.statusCode).json({statusCode: response.statusCode, message: response.message});
					return;
				} else if (typeof response.result !== "undefined") {
					// is a success
					functions.logger.info(`hit response cache for ${vid}, is a success`);
					res.status(200).json(JSON.parse(response.result));
					return;
				} else {
					// is an unknown result
					functions.logger.info(`hit response cache for ${vid}, result unknown`);
				}
			}
		}
	}
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
		if (infoMap.errorcode && infoMap.status && infoMap.status == 'fail') {
			res.status(404).json({statusCode: 404, message: 'no such video id'});
			await responseDocRef.set({statusCode: 404, message: 'no such video id', lastUpdateTime: currentTime});
			return;
		}
		if (!infoMap.player_response) {
			// player response not exists
			res.status(500).json({statusCode: 500, message: 'player_response does not exists'});
			await responseDocRef.set({statusCode: 500, message: 'player_response does not exists', lastUpdateTime: currentTime});
			return;
		}
		let playerResJson;
		try {
			// replace all '+' with ' ' in player_response string 
			playerResJson = JSON.parse(decodeURIComponent(infoMap.player_response.replace(/\+/g, ' ')));
		} catch(e) {
			// throw new functions.https.HttpsError('internal', e.message);
			await responseDocRef.set({statusCode: 500, message: e.message, lastUpdateTime: currentTime});
			res.status(500).json({statusCode: 500, message: e.message});
			return;
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

		let formats = [], aFormats = [];
		if (sd) {
			if (sd.formats) formats = sd.formats;
			if (sd.adaptiveFormats) aFormats = sd.adaptiveFormats;
		}
		resultMap.formats = [];
		resultMap.adaptiveFormats = [];
		if (formats.some((i) => 'signatureCipher' in i || 'cipher' in i)) {
			// use player script to decrypt url
			try {
				const embededPage = await fetch('https://www.youtube.com/embed/' + vid);
				const embededPageBody = await embededPage.text();
				const scriptUrl = YTSearcher.getScriptUrl(embededPageBody);
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
					const searcher = new YTSearcher.Searcher(scriptBody);
					codes = searcher.decipherCode;
					codes.createdAt = admin.firestore.Timestamp.now();
					functions.logger.info('add new record to db');
					await docRef.set(codes);
				}
				functions.logger.info({code: codes});
				const decrypter = new YTSearcher.Decrypter(codes);
				formats.forEach((f) => {
					if (f.mimeType && f.mimeType.includes('mp4')) {
						const cipher = f.signatureCipher || f.cipher;
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
						const cipher = f.signatureCipher || f.cipher;
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
		resultMap.requestTime = currentTime;
		res.status(200).json(resultMap);
		await responseDocRef.set({result: JSON.stringify(resultMap), lastUpdateTime: currentTime});
	} catch (err) {
		functions.logger.error({
			err: err.message
		});
		// throw new functions.https.HttpsError('internal', err.message);
		res.status(500).json({statusCode: 500, message: err.message});
		await responseDocRef.set({statusCode: 500, message: err.message, lastUpdateTime: currentTime});
		return;
	}
});

app.get('/archives/:version?', requestLogger, async (req, res) => {
	try {
		let archiveRef = await db.collection('app_info').doc('version-manifest.json').get();
		if (archiveRef.exists) {
			let archiveInfo = archiveRef.data();
			const version = req.params.version;
			if (version && typeof version === 'string') {
				let target = archiveInfo.releaseList.find(item => item.version === version);
				if (target) {
					res.status(200).json(target);
				} else {
					res.status(404).json({statusCode: 404, message: 'No such version'});
				}
				return;
			}
			res.status(200).json(archiveInfo);
		} else {
			functions.logger.error({
				err: 'version-manifest.json does not exists'
			});
			res.status(500).json({statusCode: 500, message: 'version-manifest.json does not exists'});
		}
	} catch (err) {
		functions.logger.error({
			err: err.message
		});
		res.status(500).json({statusCode: 500, message: err.message});
	}
});

app.get('/app_version_update', requestLogger, async (req, res) => {
	try {
		let archiveRef = await db.collection('app_info').doc('version-manifest.json').get();
		if (archiveRef.exists) {
			let archiveInfo = archiveRef.data();
			const currentVersion = req.query.currentVersion;
			if (!currentVersion || typeof currentVersion !== 'string') {
				res.status(400).json({statusCode: 400, message: 'Please provide "currentVersion"'});
				return;
			}
			if (currentVersion === archiveInfo.latestVersion) {
				res.status(200).json({message: 'You are up to date'});
			} else {
				let target = archiveInfo.releaseList.find(item => item.version === archiveInfo.latestVersion);
				if (target) {
					res.status(200).json({target: target});
				} else {
					res.status(404).json({statusCode: 404, message: 'No such version'});
				}
			}
		} else {
			functions.logger.error({
				err: 'version-manifest.json does not exists'
			});
			res.status(500).json({statusCode: 500, message: 'version-manifest.json does not exists'});
		}
	} catch (err) {
		functions.logger.error({
			err: err.message
		});
		res.status(500).json({statusCode: 500, message: err.message});
	}
})

app.all('*', requestLogger, (req, res) => {
	res.status(400).json({statusCode: 400, message: 'No such API / not allowed'});
});

exports.api = functions
	.region('asia-east2')
	.https.onRequest(app);
