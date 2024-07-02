import React, { useState, useEffect } from 'react'
import Adduser from '../components/Chatify/Adduser';
import { useSelector } from 'react-redux';
import '../staticCss/groupInfo.css'
import { useLocation } from 'react-router-dom';
import { Alert } from '@mui/material';
import axios from 'axios';
const Groupinfo = () => {
    const [showAlert, setAlert] = useState(null);
    const [msg, setMsg] = useState("");
    const location = useLocation();
    const [data, setData] = useState();
    const [rename, setrename] = useState();
    const [members, setMembers] = useState();
    const token = sessionStorage.getItem('jwt');
    const queryParams = new URLSearchParams(location.search);
    const groupid = queryParams.get('q');
    const handleSubmit = async () => {
        const ids = members.map((u) => u._id);
        const grpdata = {
            chatName: rename,
            users: ids,
            chatid: groupid,
        }
        const instance = axios.create({
            baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
            withCredentials: true,
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        })
        try {
            const data = await instance.put('/editgroup', grpdata);
            console.log(data);
            setAlert(true);
            setMsg('Group has been updated successfully')
            window.location.href = '/chat';
        } catch (err) {
            console.log(err);
            setAlert(false);
            setMsg(err.response.data);
            if(err.response.status===301){
                window.location.href = '/';
              }
        }


    }
    useEffect(() => {
        const getChatByquery = async () => {
            const instance = axios.create({
                baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
                withCredentials: true,
                headers: {
                    "Content-Type": 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `${token}`
                }
            })
            try {
                const res = await instance.get(`/getChatbyquery?q=${groupid}`);
                setData(res.data);
                setMembers(res.data.users);
            } catch (err) {
                console.log(err);
                if(err.response.status===301){
                    window.location.href = '/';
                  }
            }
        }
        getChatByquery();
    }, [])
    //console.log(members)
    return (
        <React.Fragment> {showAlert !== null ? showAlert ? <Alert variant="filled" severity="success" className='alert_prop'>
            {msg}
        </Alert> : <Alert variant="filled" severity="error" className='alert_prop'>
            {msg}
        </Alert> : ""} <div className='create_group_section'>
                <div className='add_user_box'>
                    <h1>Search to add User</h1>
                    <Adduser members={members} setMembers={setMembers} />
                </div>
                <div className='group_info_details'>
                    <h1>Group Details</h1>
                    <div className='group_info_form'>
                        <legend for='group_name' style={{ 'fontSize': '1.4rem' }}>Rename Group Name:</legend>
                        <input className='input_group_name' type='text' placeholder='Rename Group Name' value={rename} name='group_name' onChange={(e) => setrename(e.target.value)}></input>
                        <input className='input_submit' type='submit' value='Edit Details' onClick={() => handleSubmit()}></input>
                        <button className='input_submit' onClick={()=> window.location.href='/chat'}>Back</button>
                        <p style={{ "fontSize": "1.3rem" }}>Group Members:</p>
                        <div className='members_list'>
                            {
                                data && members.map((user) => (
                                    <h3 className='grp_user_name'>{user.name}</h3>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div></React.Fragment>

    )
}

export default Groupinfo