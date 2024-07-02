import React,{useState,useEffect} from 'react'
import '../../staticCss/chat.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
const Adduser = ({members,setMembers}) => {
    const [query,setQuery]=useState('');
    const [results,setResults]=useState([]);
    const authorisedUser = useSelector((state) => state.user);
    const [addedUsers, setAddedUsers] = useState([]);
    const token = localStorage.getItem('jwt');
    useEffect(()=>{
        if(query.length>0){
            const fetchData=async()=>{
                try{
                    const response=await axios.get(`${process.env.REACT_APP_BACKEND}/api/user/find?q=${query}`);
                    setResults(response.data);
                }catch(err){console.log(err);}
            }
            fetchData();
        }
        else{
            setResults([])
        }
    },[query])

    useEffect(()=>{
        members && setAddedUsers(members.map(u=>u._id));
    },[members])

    

    const handleAddUser=(user)=>{
        setMembers((prev)=>{
            const userExists=prev.some(u=>user._id===u._id);

            if(userExists){
                return prev.filter(u=>user._id!==u._id);
            }
            return [...prev,user]
        })

        setAddedUsers((prev) =>{

                if(prev.includes(user._id)){
                    return prev.filter(u=>u!==user._id);
                }else{
                    return [...prev,user._id];
                }
            }
        );
    }
    

  return (
    <div className='add_user_popUp'>
        <form className='userSearchBar' onSubmit={(e)=>e.preventDefault()}>
            <input type='text' placeholder='Type username of user' value={query} onChange={(e)=>setQuery(e.target.value)}></input>
        </form>
        <div className='result_section' style={{"overflowY":"scroll"}}>
        {results.filter(user=>user.name!==authorisedUser.name).map((user)=>(
            
            <div className='resultedUser'>
                <h2>{user.name}</h2>
                <button onClick={()=>handleAddUser(user)}> {addedUsers.includes(user._id) ? 'Remove' : 'Add'}</button>
            </div>
        ))}
            
        </div>
    </div>
  )
}

export default Adduser;