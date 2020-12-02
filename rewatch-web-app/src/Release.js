import { useState, useEffect } from 'react';
import { getApiUrl } from './util/api.js';

function Release() {

	function createList(list) {
		const viewList = list.map(i => {
			const versionView = (
				<h3>
					<a download={`v${i.version}.apk`} href={i.url}>
						{`v${i.version} (${new Date(i.releaseDate).toLocaleDateString()})`}
					</a>
				</h3>
			);
			const notesView = (
				<ul className='list-unstyled'>
					{
						i.releaseNote.map(note => {
							const { name, details } = note;
							return (
								<li>
									<div>
										<h4 className='text-secondary'>{name}</h4>
										<ul>
											{
												details.map(detail => <li className='text-secondary'>{detail}</li>)
											}
										</ul>
									</div>
								</li>
							);
						})
					}
				</ul>
			);
			return (
				<li>
					<div>
						{versionView}
						<hr />
						{notesView}
					</div>
				</li>
			);
		});
		return (
			<ul className='list-unstyled'>{viewList}</ul>
		);
	}

	const [releases, setReleases] = useState(null);

	useEffect(() => {
		fetch(getApiUrl() + '/archives')
			.then(res => res.json())
			.then(json => {
				if (json.releaseList) {
					setReleases(json.releaseList);
				}
			})
			.catch(e => console.log(e));
	}, []);

	return (
		<div className='container-fluid'>
			<div className='row justify-content-center'>
				<div className='bd-content col-12 col-md-6 p-4'>
				{
					releases !== null && createList(releases)
				}
				</div>
			</div>
		</div>
	);
}

export default Release;