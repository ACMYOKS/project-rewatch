import FeedImage from './components/FeedImage.js';
import './App.css';

function Guide() {
	return (
		<div className='container-fluid'>
			<div className='row justify-content-end'>
				<div className='d-none d-md-block col-md-3 p-4 order-last side-menu-container'>
					<ul className='border-left list-unstyled side-menu'>
						<li className='side-menu-item'>
							<a className='text-dark' href='#subscriptions-playlists'>Subscriptions and playlists</a>
						</li>
						<li className='side-menu-item'>
							<a className='text-dark' href='#search'>Search</a>
						</li>
						<li className='side-menu-item'>
							<a className='text-dark' href='#bookmark'>Bookmark</a>
						</li>
						<li className='side-menu-item'>
							<a className='text-dark' href='#archive'>Archive</a>
						</li>
						<li className='side-menu-item'>
							<a className='text-dark' href='#player'>Player</a>
						</li>
					</ul>
				</div>
				<main className='bd-content col-12 col-md-6 p-4'>
					<h3 id='subscriptions-playlists'>
						<div>Subscriptions and playlists</div>
					</h3>
					<hr />
					<p>
						Once you have logged in your YouTube account, you can find your subscribed channels and your own playlists from <i>Library</i> tab.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							className='p-2'
							src={process.env.PUBLIC_URL + '/tutor/channel.png'}
							caption='YouTube subscriptions'
							alt='YouTube subscriptions'/>
						<FeedImage
							className='p-2'
							src={process.env.PUBLIC_URL + '/tutor/playlist.png'}
							caption='Your playlists'
							alt='Your playlists'/>
					</div>
					<p>
						You cannot update (add/remove/sort/reorder) them through this app.
						You must change them through YouTube app.
						If you have any changes done on YouTube, press <b>Reload</b> to reflect them.
					</p>
					<br />

					<h3 id='search'>
						<div>Search</div>
					</h3>
					<hr />
					<h4>In-app search flow</h4>
					<p>
						You can find video by inputting video ID in <i>Search</i>. 
						Currently you can only search with <b>exact video ID</b>.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							className='p-2'
							src={process.env.PUBLIC_URL + '/tutor/search01.png'}
							caption='Search video by ID'
							alt='search function'/>
					</div>
					<h4>Search from hyperlink</h4>
					<p>
						You can open any hyperlink of YouTube videos with the following formats:
					</p>
					<ul>
						<li>{'https://www.youtube.com/watch?v={videoId}'}</li>
						<li>{'https://m.youtube.com/watch?v={videoId}'}</li>
						<li>{'https://youtube.com/watch?v={videoId}'}</li>
						<li>{'https://youtu.be/{videoId}'}</li>
					</ul>
					<p>
						The app will redirect you to <i>Search</i> with the search result.
					</p>
					<div className='alert alert-info'>
						<h5 className='alert-heading'>Note</h5>
						<p className='mb-0'>
							You need to change ReWatch Player's <code>setting -> Go to support URLs -> Always ask</code> in order to use this functionality.
						</p>	
					</div>
					<h4>Search with <i>Share</i></h4>
					<p>
						You can click <i>Share</i> in YouTube app and choose <b>Find in ReWatch Player</b> from app picker. 
						The app will redirect you to <i>Search</i> with the search result.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/search02.png'}
							caption='Search in app picker'
							alt='search in app picker'/>
					</div>
					<br />

					<h3 id='bookmark'>
						<div>Bookmark</div>
					</h3>
					<hr />
					<p>
						This feature allows you to bookmark the videos from search results and your playlists locally.
						You can manage your bookmarked videos in <i>Bookmark</i> tab inside <i>Library</i>.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/bookmark01.png'}
							caption='Bookmark through video card'
							alt='downloads'/>

						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/bookmark02.png'}
							caption='Bookmarked videos'
							alt='PIP mode'/>
					</div>
					<br />

					<h3 id='archive'>
						<div>Archive</div>
					</h3>
					<hr />
					<p>
						You can archive (download) videos to your phone locally.
						You can review the download progress and manage all downloaded resources in <i>Download</i> tab.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/download01.png'}
							caption='Download list'
							alt='downloads list'/>

						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/download02.png'}
							caption='Download details, including progress and quality'
							alt='download detail'/>
					</div>
					<p>
						By default, once the download is completed, the app will play resource offline automatically with the best available quality.
						You can alternate this behaviour in <i>Setting</i> and turn off <i>Always play downloaded video if exist</i>.
					</p>
					<br />

					<h3 id='player'>
						<div>Player</div>
					</h3>
					<hr />
					<p>
						This app enables Picture-In-Picture (PIP) Mode and background playing by default.
						If your phone is Android 8.0 or above, you can use PIP by enable PIP in app settings.
						When you switch app or press home button with PIP enabled while playing media, the player will show as a small window, allows you to work with other apps without stopping the media.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/pip.png'}
							caption='PIP mode'
							alt='PIP mode'/>
					</div>
					<p>
						If you enable background playing feature, the app will continue playing even if you switch off the screen or stop the app.
					</p>
					<div className='d-flex flex-wrap justify-content-around'>
						<FeedImage
							src={process.env.PUBLIC_URL + '/tutor/background.png'}
							caption='Background playing'
							alt='background play'/>
					</div>
				</main>
			</div>
		</div>
	);
}

export default Guide;