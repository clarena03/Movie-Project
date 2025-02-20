
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx'
import Films from './FilmsPage.jsx'
import Customers from './CustomersPage.jsx';



function App() {
  return (
    <>
  <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="FilmsPage" element={<Films />} />
        <Route path="CustomersPage" element={<Customers />} />
      </Routes>
    </div>
    
    </>
  );
  
}

export default App;
