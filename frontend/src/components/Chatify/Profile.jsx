import React,{useState} from 'react'
import '../../staticCss/profile.css';
import profileimg from '../../assets/profile.svg';
import { storage } from "../../firebase";
import {ref, uploadBytes,getDownloadURL,uploadBytesResumable} from 'firebase/storage';
import { v4 } from "uuid";
import axios from 'axios';
const Profile = ({user}) => {
    const token=sessionStorage.getItem('jwt');
    const [username,setusername]=useState(user.name);
    const [email,setEmail]=useState(user.email);
    const [pic,setPic]=useState(null);
    const [imageUrl,setImageUrl]=useState(user.pic);
    const [bio,setBio]=useState(user.bio);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadFile=()=>{
        if(pic===null) return;
        const imageRef=ref(storage,`userprofile/${pic.name + v4()}`);
        const uploadTask = uploadBytesResumable(imageRef, pic);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    setImageUrl(url);
                    alert('Image set successfully!');
                });
            }
        );
    }

    const updateChanges = async()=>{
        const data={
            name:username,
            email:email,
            bio:bio,
            pic:imageUrl
        }
        const instance=axios.create({
            baseURL:`${process.env.REACT_APP_BACKEND}/api/user`,
            withCredentials:true,
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json',
                'Authorization':`${token}`
            }
        })
        try{
            const res=await instance.put('/updateuser',data);
            console.log(res.data);
            window.location.href = '/chat';
            
        }catch(err){
            console.log(err);
        }
    }
    
    return (
        <div className='profile_section_wrapper'>
            <div className='profile_section'>
                <h2>Edit profile</h2>
                <div className='user_wrapper'>
                    <div className='left_section'>
                        <img src={imageUrl?imageUrl:profileimg} style={{ "width": "8vw", height:"8vw", 'border': '1px solid white', 'borderRadius': '50%' }}></img>
                        <input type="file" onChange={(e)=>setPic(e.target.files[0])}></input>
                        <button onClick={uploadFile}>Upload</button>
                        {uploadProgress > 0 && (
                            <div className='progress-bar'>
                                <div className='progress' style={{ width: `${uploadProgress}%` }}>{Math.round(uploadProgress)}%</div>
                            </div>
                        )}
                    </div>
                    <div className='right_section'>
                        <legend style={{ "fontSize": "1.3rem" }} for='username'>Username:</legend>
                        <input style={{ "color": "black" }} type='text' placeholder='new username' name='username' value={username} onChange={(e)=>setusername(e.target.value)}></input>
                        <legend style={{ "fontSize": "1.3rem" }} for='bio'>Bio:</legend>
                        <textarea type='text' placeholder='Write something about yourself' cols={50} rows={10} name='bio' style={{ 'resize': 'vertical', "color": "black" }} value={bio} onChange={(e)=>setBio(e.target.value)}></textarea>
                        <legend style={{ "fontSize": "1.3rem" }} for='email'>New email Id:</legend>
                        <input style={{ "color": "black" }} type='email' placeholder='Enter new email id' name='email' value={email} onChange={(e)=>setEmail(e.target.value)}></input>

                    </div>
                </div>
                <button className='updateProfileBtn' onClick={()=>updateChanges()}>Save Changes</button>

            </div>
        </div>
    )
}

export default Profile