function NoMatch() {
	return (
		<div className='container-fluid'>
			<div className='no-match my-3 row justify-content-center'>
				<div className='col-10 col-md-8'>
					<h1 className='text-dark'>404 Not Found</h1>
					<h4 className='text-dark mt-3'>Oops! The requested page is not found!</h4>
				</div>
			</div>
		</div>
	);
}

export default NoMatch;