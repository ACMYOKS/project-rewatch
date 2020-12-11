import React, { useState, useEffect } from 'react';
import { secondToReadable, YouTubeITag } from './util/formatters.js';
import { getApiUrl } from './util/api.js';

function YtInfoSearcher() {

	const [ytInfo, setYtInfo] = useState(null);
	// const [ytError, setYtError] = useState(null);
	const [userInput, setUserInput] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(userInput);
		if (userInput) {
			// https://www.youtube.com/watch?v={videoId}
			// https://m.youtube.com/watch?v={videoId}
			// https://youtube.com/watch?v={videoId}
			// https://youtu.be/{videoId}
			const matches = [...userInput.matchAll(/^(?:https?:\/\/(?:(?:www\.|m\.)*youtube\.com\/watch\?v=|youtu\.be\/))(?<vid>[\w-]+)$/g)];
			if (matches.length > 0) {
				const videoId = matches[0].groups.vid;
				fetch(`${getApiUrl()}/ytinfo/${videoId}`)
					.then(res => res.json())
					.then(json => {
						console.log(json);
						if (validateJson(json)) {
							setYtInfo(json);
						} else if (json.statusCode === 404) {
							// setYtError(`Cannot find video with id: ${videoId}`);
							alert(`Cannot find video with id: ${videoId}`);
						}
					})
					.catch(err => {
						console.log(err);
					});
			} else {
				alert('Please put link in the following formats:\n'+
					'https://www.youtube.com/watch?v={videoId}\n' +
					'https://m.youtube.com/watch?v={videoId}\n' +
					'https://youtube.com/watch?v={videoId}\n' +
					'https://youtu.be/{videoId}\n{videoId}');
			}
		}
	}

	const handleClose = (e) => {
		e.preventDefault();
		setYtInfo(null);
		// setYtError(null);
	}

	const validateJson = (json) => {
		if (!json.videoDetails ||
					!json.videoDetails.title ||
					!json.videoDetails.author||
					!json.videoDetails.lengthSeconds ||
					!json.formats ||
					!json.adaptiveFormats) return false;
		return true;
	}

	const createLinks = (list) => {
		return (
			list.map((e) => (
					<React.Fragment>
						<a href={e.url}>{YouTubeITag[e.itag] || `unsupported itag ${e.itag}`}</a>
						<br />
					</React.Fragment>
				)
			)
		);
	}

	return (
		<div className="yt-info-searcher">
			
			<div className='input-group input-group-sm'>
				<input
					className='form-control'
					type='search'
					aria-describedby='btn-submit'
					placeholder='https://youtu.be/{videoId}'
					onChange={e => {setUserInput(e.target.value)}}
				/>
				<div>
					<button
						className='btn btn-outline-secondary'
						type='button'
						id='btn-submit'
						onClick={handleSubmit}
					>
						Search
					</button>
				</div>
			</div>
			{	ytInfo !== null && 
				<div>
					<button type="button" className="close" aria-label="close" onClick={handleClose}>
						<span aria-hidden="true">&times;</span>
					</button>
					<table className="table yt-info-table">
						<tbody>
							<tr>
								<th>Title:</th>
								<td>{ytInfo.videoDetails.title}</td>
							</tr>
							<tr>
								<th>Channel name:</th>
								<td>{ytInfo.videoDetails.author}</td>
							</tr>
							<tr>
								<th>Length:</th>
								<td>{secondToReadable(ytInfo.videoDetails.lengthSeconds)}</td>
							</tr>
							<tr>
								<th>Download links:</th>
								<td>{createLinks(ytInfo.formats.concat(ytInfo.adaptiveFormats))}</td>
							</tr>
						</tbody>
					</table>
				</div>
			}
			{
				// ytError !== null &&
				// <div>
				// 	<button type="button" className="close" aria-label="close" onClick={handleClose}>
				// 		<span aria-hidden="true">&times;</span>
				// 	</button>
				// 	<p>{ytError}</p>
				// </div>
			}
		</div>
	);
}

export default YtInfoSearcher;