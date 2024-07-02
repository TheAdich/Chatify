import React from 'react'
import '../../staticCss/chat.css'
import logo from '../../assets/logo.jpg'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
const Header = ({user,setProfilePageopen}) => {

  return (
    <div className='chat_header'>
        <div className='chat_name_logo'>
            <img className='chat_logo' src={logo}></img>
            <div className='chat_name'>Sharinghan</div>
        </div>
        <div className='chat_toolbar'>
            <NavLink style={{textDecoration:'none'}} className='create_grp_btn' to='/videochat'>Start a video call</NavLink>
            <NavLink style={{textDecoration:'none'}} className='create_grp_btn' to='/creategroup'>Create a group</NavLink>
            <NavLink style={{textDecoration:'none'}} className='create_grp_btn' to='/payment'>UPI Transaction</NavLink>
            <img className='bell' src={user?user.pic:logo}></img>
            <p style={{'cursor':'pointer'}} className='username' onClick={()=>setProfilePageopen((prev)=> !prev)}>{user && user.name}</p>
            <p className='logout' onClick={()=>{
              sessionStorage.removeItem('jwt');
              window.location.href='/'
            }}>Logout</p>
        </div>
    </div>
  )
}

export default Header