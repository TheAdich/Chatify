import React, { useState,useEffect } from 'react';
import '../staticCss/login.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
function Signup() {
    const [name,setName]=useState();
    const [email,setEmail]=useState();
    const [password,setPassword]=useState();
    const [loggedIn, setloggedIn] = useState(null);
    const [errMsg,setErrMsg]=useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    const instance=axios.create({
        baseURL:`${process.env.REACT_APP_BACKEND}/api/user`,
        withCredentials:true,
        headers:{
            'Content-Type':'application/json',
            'Accept':'application/json'
        }
    })
    try{
      const res=await instance.post('/register',{
        name,
        email,
        password,
      });
      console.log(res.data);
      setloggedIn(true);
      window.location.href = '/';
    }
    catch(err){
      console.log(err);
      setloggedIn(false);
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
     Successfully registered!
   </Alert> : 
   <Alert variant="filled" severity="error" className='alert_prop'>
     {errMsg}
   </Alert> : 
   ""}
    <div className="container">
    <div className="glassmorphism">
        <h2 style={{'text-align':'center','color':'white'}}>Welcome to Sharinghan!</h2>
        <form onSubmit={handleSubmit} className="form-group">
            <input style={{'padding':'1.2rem'}} type='text' placeholder='Username' value={name} onChange={(e)=>setName(e.target.value)}></input>
            <input style={{'padding':'1.2rem'}} type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <input style={{'padding':'1.2rem'}} type="password" placeholder="Password" vlaue={password} onChange={(e)=>setPassword(e.target.value)}/>
            <input className="logBtn" type="submit" value='Register'></input>
        </form>
        <p style={{'font-size':'1.3rem','text-align':'center'}}>Already have an account? <NavLink style={{'color':'white'}} className='link' to='/'>SignIn</NavLink></p>
    </div>
</div>
    </React.Fragment>
  );
}
export default Signup;
