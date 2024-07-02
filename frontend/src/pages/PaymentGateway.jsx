import React, { useState,useEffect } from 'react'
import axios from 'axios'
import '../staticCss/chat.css'
import logo from '../assets/logo.jpg'
import '../staticCss/chat.css'
import { setUser } from '../redux/userslice'

const PaymentGateway = () => {
    const [amount,setAmount]=useState(10);
    const [user,setUser]=useState(null);
    const token=sessionStorage.getItem('jwt');
    useEffect(()=>{
        const instance=axios.create({
            baseURL:`${process.env.REACT_APP_BACKEND}/api/chat`,
            withCredentials:true,
            headers:{
              'Content-Type':'application/json',
              'Accept':'application/json',
              'Authorization':`${token}`
            }
          })
          const getUser =async ()=>{
            try{
            const res=await instance.get('/fetchChat')
            setUser(res.data.user);
            }
            catch(err){
              console.log(err);
              if(err.response.status===301){
                window.location.href = '/';
              }
            }
          }
          getUser();
    },[])
    const handlePayment=async (amount)=>{
        const res_data=await axios.get(`${process.env.REACT_APP_BACKEND}/api/getkey`);
        const key=res_data.data.key;

        const res_order=await axios.post(`${process.env.REACT_APP_BACKEND}/api/payment/checkout`,{amount});
        const order=res_order.data.order;

        const options = {
            key,
            amount: order.amount,
            currency: "INR",
            name: "Sharinghan",
            description: "Donate to upgrade the performance of application",
            image: logo,
            order_id: order.id,
            callback_url: `${process.env.REACT_APP_BACKEND}/api/payment/verification`,
            prefill: {
                name:  user.name,
                email: user.email,
                contact: "9999999999"
            },
            notes: {
                "address": "Razorpay Corporate Office"
            },
            theme: {
                "color": "#121212"
            }
        };
        const razor=new window.Razorpay(options);
        razor.open();
    }

  return (
    <React.Fragment>
    <div style={{display:'flex',width:'100%',alignItems:'center',padding:'1rem'}}>
      <img style={{cursor:'pointer'}}  onClick={()=>window.location.href='/chat'}  src={logo} className='chat_logo'></img>
      <h1  style={{cursor:'pointer'}} onClick={()=>window.location.href='/chat'}  className='chat_name'>Sharinghan</h1>
    </div>
        <div style={{padding:'1rem'}}>
            <h1>Payment Gateway</h1>
            <input type='number' style={{color:'black'}} placeholder='Enter Amount' value={amount} onChange={(e)=>setAmount(e.target.value)}></input>
            <button className='create_grp_btn' style={{padding:'0.1rem 1rem',marginLeft:'1rem'}} onClick={()=>handlePayment(amount)}>Pay</button>
        </div>
    </React.Fragment>
  )
}

export default PaymentGateway