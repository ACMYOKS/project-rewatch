function FeedImage(props) {
	const src = props.src || '';
	const caption = props.caption;
	const alt = props.alt || '';
	return (
		<div className={props.className}>
			<figure
				className='figure'>
				<img
					className='figure-img img-fluid feed-img'
					src={src}
					alt={alt}
					width={props.width} height={props.height} 
				/>
				{caption &&
					<figcaption
						className='figure-caption feed-caption'>
						{caption}
					</figcaption>
				}
			</figure>
		</div>
	);
}

export default FeedImage;