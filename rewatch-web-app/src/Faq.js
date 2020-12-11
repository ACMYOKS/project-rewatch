import React from 'react';

function Faq(props) {
	const qna = [
		{
			q: <React.Fragment>How to install?</React.Fragment>,
			a: <React.Fragment>You can download the desired version (prefer the latest) from this website. After download, you should open the downloaded APK file from your prefered file manager app. The downloaded file name should be <i>ReWatchPlayer-{"{"}version name{"}"}.apk</i>.You should go to <code>Settings > Security > Unknown sources</code> and set "Trust/Enable" in order to install this APK. If message like "Play Protect doesn't recognise this app's developer" prompts during installation, please click "Install anyway" and do not click "Report to Google".</React.Fragment>
		},
		{
			q: <React.Fragment>How to update?</React.Fragment>,
			a: <React.Fragment>Navigate <code>Info > Check update</code> in app. An update message box will prompt if there is an update. Currently (v1.0.0) the app does not open the downloaded file automatically.</React.Fragment>
		},
		{
			q: <React.Fragment>What data will ReWatch Player retrieve?</React.Fragment>,
			a: <React.Fragment>ReWatch Player will retrieve your YouTube subscriptions and personal playlists and <strong>DO NOT</strong> retrieve your personal information. None of your private information will be retrieved from Google and store to ReWatch Player.</React.Fragment>
		}
	];
	const list = qna.map((i, idx) => (
		<li className={idx === 0 ? '' : 'pt-3'}>
			<h3>{idx + 1}. {i.q}</h3>
			<p>{i.a}</p>
		</li>
	));
	return (
		<div className='container-fluid'>
			<div className='row justify-content-center'>
				<main className='bd-content col-12 col-md-6 p-4'>
					<ul className='list-unstyled'>
						{list}
					</ul>
				</main>
			</div>
		</div>
	);
}

export default Faq;