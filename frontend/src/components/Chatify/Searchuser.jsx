import React, { useState, useEffect } from 'react'
import '../../staticCss/chat.css';
import axios from 'axios';
import { Alert } from '@mui/material';
const Searchuser = ({ searchBoxstyle,user }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const authorisedUser = user
    const token = sessionStorage.getItem('jwt');
    const [showAlert, setAlert] = useState(null);
    const [msg, setMsg] = useState("");
    const createChatWithUser = async (userId) => {
        const instance = axios.create({
            baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        })
        try {
            const res = await instance.post('/createChat', { userId });
            console.log(res.data);
            setAlert(true);
            setMsg("Chat Created");
            window.location.href = '/chat'
        } catch (err) {
            console.log(err);
            setAlert(false);
            setMsg('Internal error occurred!');
        }
    }

    useEffect(() => {
        if (query.length >= 0) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/user/find?q=${query}`);
                    setResults(response.data);
                } catch (err) { console.log(err); }
            }
            fetchData();
        }
        else {
            setResults([])
        }
    }, [query])
    return (
        <React.Fragment>
            {showAlert !== null ? showAlert ? <Alert variant="filled" severity="success" className='alert_prop'>
                {msg}
            </Alert> : <Alert variant="filled" severity="error" className='alert_prop'>
                {msg}
            </Alert> : ""}
            <div className='search_user_popUp' style={searchBoxstyle}>
                <form className='userSearchBar' onSubmit={(e) => e.preventDefault()}>
                    <input type='text' placeholder='Type username of user' value={query} onChange={(e) => setQuery(e.target.value)}></input>
                </form>
                <div className='result_section'>
                    {results.filter(user => user.name !== authorisedUser.name).map((user) => (

                        <div className='resultedUser'>
                            <h4>{user.name}</h4>
                            <button onClick={() => createChatWithUser(user._id)}>Chat</button>
                        </div>
                    ))}

                </div>
            </div>
        </React.Fragment>

    )
}

export default Searchuser