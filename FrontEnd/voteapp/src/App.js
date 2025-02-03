import logo from './logo.svg';
import './App.css';
import Register from './screens/Register';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './screens/Login';
import CandidateList from './screens/CandidateList';
import VoterHome from './screens/VoterHome';
import AdminHome from './screens/AdminHome';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/candidateList' element={<CandidateList />} />
        <Route path='/voterHome' element={<VoterHome />} />
        <Route path='/adminHome' element={<AdminHome />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
