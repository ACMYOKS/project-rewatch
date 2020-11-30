import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import * as qs from 'query-string'; 
import logo from './logo.svg';
// import './App.css';
import Home from './Home.js';
import Guide from './Guide.js';
import Release from './Release.js';
import NoMatch from './NoMatch.js';

function MainView() {
  const [noNav, setNoNav] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const query = qs.parse(location.search);
    setNoNav(query['no_nav']);
  }, [location]);

  function createLink(path, name) {
    return (
      <Link
        className={'nav-item nav-link' + (location.pathname === path ? ' active' : '')}
        to={path}
      >
        {name}
      </Link>
    );
  }

  return (
    <div>
      {!noNav &&
        <header className='navbar navbar-expand-md sticky-top navbar-dark bg-primary'>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavAltMarkup" 
            aria-controls="navbarNavAltMarkup" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className='navbar-collapse collapse' id='navbarNavAltMarkup'>
            <div className='navbar-nav'>
              { createLink('/', 'Home') }
              { createLink('/guide', 'Guide') }
              { createLink('/releases', 'Releases') }
            </div>
          </div>
        </header>
      }
      <div className='App'>
        <Switch>
          <Route path='/guide'>
            <Guide />
          </Route>
          <Route path='/releases'>
            <Release />
          </Route>
          <Route exact path='/'>
            <Home />
          </Route>
          <Route path='*'>
            <NoMatch />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainView />
    </Router>
  );
}

export default App;
