import React, { useState, useEffect } from 'react';
import YtInfoSearcher from './YtInfoSearcher.js';
import FeedImage from './components/FeedImage.js';
import FeatureItem from './components/FeatureItem.js';
import logo from './logo.svg';
import { getApiUrl } from './util/api.js';

function Home() {

	const [latestAppInfo, setLatestAppInfo] = useState(null);

	useEffect(() => {
		fetch(getApiUrl() + '/archives')
		.then(res => res.json())
		.then(json => {
			const latestVersionCode = json.latestVersionCode;
			if (json.releaseList) {
				const target = json.releaseList.find(item => item.versionCode === latestVersionCode);
				if (target) {
					setLatestAppInfo(target);
				}
			}
		})
		.catch(e => console.log(e));
	}, []);

	return (
		<div className='container-fluid'>
			<div className='bd-content row justify-content-around'>

				<div className='col-12'>
					<div className='intro-banner row bg-light'>
						<div className='col-12 col-sm-10 col-lg-8 mx-auto my-5'>
							<div className='banner-content row'>
								<div className='banner-logo order-md-2 col-10 col-md-4 mx-auto d-flex justify-content-center'>
									<img src={logo} alt='logo' />
								</div>
								<div className='banner-text col-10 col-md-8 mx-auto'>
									<h1 className='my-3'>
										Welcome to ReWatch Player!
									</h1>
									<p>
										An alternative app to watch YouTube without disturbance.
									</p>
									{
										latestAppInfo !== null &&
										<div className='d-flex flex-column flex-md-row'>
											<a
												className='download btn btn-primary'
												href={latestAppInfo.url}
												download=''
											>
												{ `Download Latest (v${latestAppInfo.version})` }
											</a>
										</div>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='bd-feature col-10 col-lg-6 mx-auto px-3 px-lg-5 py-3'>
					<div className='row'>
						<FeatureItem 
							title='No disturbance'
							detail='No ads will pop while video is playing, nor at any place in the app'
							src={process.env.PUBLIC_URL + '/tutor/bookmark01.png'}
							alt='No ads'
						/>
						<FeatureItem 
							title='Watch anywhere'
							detail='Download videos and play offline, regardless of the environment'
							src={process.env.PUBLIC_URL + '/tutor/download01.png'}
							alt='Download beforehand'
						/>
						<FeatureItem 
							title='Multi-tasking'
							detail='Play videos while using another app or the screen is switched off utilizing background play and PIP mode'
							src={process.env.PUBLIC_URL + '/tutor/pip.png'}
							alt='background / PIP'
						/>
					</div>
				</div>
				<div className='col-10 col-lg-4 mx-auto px-3 px-lg-5 py-3'>
					<div className='card'>
						<div className='card-body'>
							<h5 className='card-title'>Give a try!</h5>
							<h6 className='card-subtitle my-2'>Paste a YouTube link to get the video links!</h6>
							<YtInfoSearcher />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;