function FeatureItem(props) {
	const title = props.title || '';
	const detail = props.detail || '';
	const src = props.src || '';
	const alt = props.alt || '';
	const imageFirst = props.imageFirst;
	return (
		<div className='col-12 my-5'>
			<div className='row justify-content-around'>
				<div className='col-10 col-sm-4 my-3 d-flex flex-column align-self-center'>
					<h1>{title}</h1>
					<p className='mt-1'>{detail}</p>
				</div>
				<div className={'col-10 col-sm-6 d-flex justify-content-center' + (imageFirst ? ' order-sm-first' : '')}>
					<img className='img-fluid style-contain' src={src} alt={alt} width={props.width} height={props.height}/>
				</div>
			</div>
		</div>
	);
}

export default FeatureItem;