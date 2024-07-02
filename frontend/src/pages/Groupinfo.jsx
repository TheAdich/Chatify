import React, { useState } from 'react'
import Adduser from '../components/Chatify/Adduser';
import { useSelector } from 'react-redux';
import '../staticCss/groupInfo.css'
import axios from 'axios';
import { Alert } from '@mui/material';
const Groupinfo = () => {
    const [members, setMembers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const token = sessionStorage.getItem('jwt');
    const [showAlert, setAlert] = useState(null);
    const [msg, setMsg] = useState("");
    const handleSubmit = async () => {
        const ids = members.map((u) => u._id);
        const grpdata = {
            chatName: groupName,
            users: ids,
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
            const data = await instance.post('/creategroup', grpdata);
            console.log(data);
            setAlert(true);
            setMsg('Group has been created successfully')
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
    return (
        <React.Fragment>
            {showAlert !== null ? showAlert ? <Alert variant="filled" severity="success" className='alert_prop'>
                {msg}
            </Alert> : <Alert variant="filled" severity="error" className='alert_prop'>
                {msg}
            </Alert> : ""}
            <div className='create_group_section'>
                <div className='add_user_box'>
                    <h1 style={{'color':'black'}}>Search to add User</h1>
                    <Adduser setMembers={setMembers} />
                </div>
                <div className='group_info_details'>
                    <h1>Group Details</h1>
                    <div className='group_info_form'>
                        <legend for='group_name' style={{ 'fontSize': '1.4rem' }}>Group Name:</legend>
                        <input className='input_group_name' type='text' placeholder='Group Name' name='group_name' value={groupName} onChange={(e) => setGroupName(e.target.value)}></input>
                        <input className='input_submit' type='submit' value='Create Group' onClick={() => handleSubmit()}></input>
                        <button className='input_submit' onClick={()=> window.location.href='/chat'}>Back</button>
                        <p style={{ "fontSize": "1.3rem" }}>Members:</p>
                        <div className='members_list' style={{"overflowY":"scroll"}}>
                            {
                                members.map((user) => (
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