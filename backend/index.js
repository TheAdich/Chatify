const express = require('express');
const mongoose = require('mongoose');
const { Server } = require("socket.io");
const userRouter = require('./routers/userRouter');
const { createServer } = require('http');
const chatRouter = require('./routers/chatRouter');
const msgRouter = require('./routers/msgRouter');
const paymentRouter=require('./routers/paymentRouter');
const authMiddleware = require('./middlewares/authToken');
const cookieParser = require("cookie-parser")
const cors = require('cors');
const app = express();
const port = process.env.PORT || 10000;
//const dbUri = 'mongodb+srv://testing_node:test1234@cluster0.jriry7x.mongodb.net/Chatify?retryWrites=true&w=majority&appName=Cluster0'

require('dotenv').config()

//Monogdb Connection
mongoose.connect(process.env.MONGO_URL)
    .then((success) => console.log('Database connected!'))
    .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000','https://chat-app-frontend-rho-jet.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))


//app.use('/',(req,res)=>res.send('hi'))
app.use('/api/user', userRouter);
app.use('/api/payment',paymentRouter);
app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/msg', authMiddleware, msgRouter);
app.get('/',(req,res)=> res.send('Hello!'));
//app.listen(port,()=>{
//    console.log('Server is running!');
//})
app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RZ_KEY_ID})
);

//Connection for socket.io
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000','https://chat-app-frontend-rho-jet.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
})

server.listen(port, () => {
    console.log('Server is running!');
})

io.on('connection', (socket) => {


    socket.emit('welcomeEvent', `Welcome to the server ${socket.id}`);
    //Creating a room for users to chat
    socket.on('joinChat', (room) => {
        socket.join(room)
       // console.log(`${socket.id} has joined a chat room: ${room}`);
    })
    //Reading a message then sending it
    socket.on('newMessage',({msg,room})=>{
        //console.log(msg,room);
        socket.to(room).emit('getMessage',msg);
    })

    socket.on('disconnect', () => {
        //console.log('A user disconnected:', socket.id);
    });
})

