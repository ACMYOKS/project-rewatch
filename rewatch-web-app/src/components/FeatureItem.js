function FeatureItem(props) {
	const title = props.title ?? '';
	const detail = props.detail ?? '';
	const src = props.src ?? '';
	const alt = props.alt ?? '';
	return (
		<div className='col-12 my-4'>
			<div className='row justify-content-around'>
				<div className='col-10 col-sm-5'>
					<h1>{title}</h1>
					<p className='mt-1'>{detail}</p>
				</div>
				<img className='col-10 col-sm-5' src={src} alt={alt} />
			</div>
		</div>
	);
}

export default FeatureItem;