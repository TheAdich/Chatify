import React, { useState, useEffect } from 'react';
import '../staticCss/login.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { setUser } from '../redux/userslice';
import { useDispatch } from 'react-redux';
import Alert from '@mui/material/Alert';

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loggedIn, setloggedIn] = useState(null);
  const [errMsg,setErrMsg]=useState("");
  useEffect(() => {

    if (data !== null) {
      sessionStorage.setItem('jwt', data.user.token);
    }
  }, [data])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const instance = axios.create({
      baseURL: `${process.env.REACT_APP_BACKEND}/api/user`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    try {
      const res = await instance.post('/login', {
        email,
        password,
      });
      console.log(res.data)
      setData(res.data);
      setloggedIn(true);
      window.location.href = '/chat';
    }
    catch (err) {
      setloggedIn(false);
      console.log(err);
      setErrMsg(err.response.data);
    }

  }

  useEffect(()=>{
    //console.log('Running');
  },[loggedIn,errMsg]);


  return (
    <React.Fragment>
      {loggedIn !== null ?
         loggedIn ? 
         <Alert variant="filled" severity="success" className='alert_prop'>
        Successfully logged in
      </Alert> : 
      <Alert variant="filled" severity="error" className='alert_prop'>
        {errMsg}
      </Alert> : 
      ""}
      <div className="container">
        <div className="glassmorphism">
          <h2 style={{ 'text-align': 'center', 'color': 'white' }}>Welcome to Sharinghan</h2>
          <form className="form-group" onSubmit={handleSubmit}>
            <input type="email" style={{ 'padding': '1.2rem' }} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" style={{ 'padding': '1.2rem' }} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="logBtn" type="submit" value='Login'></input>
          </form>
          <p style={{ 'font-size': '1.3rem', 'text-align': 'center' }}>Don't have an account? <NavLink style={{ 'color': 'white' }} className='link' to='/signup'>Register</NavLink></p>
        </div>
      </div>
    </React.Fragment>
  );
}
export default Login;
