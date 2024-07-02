const Chat = require('../models/ChatRoom')
const User = require('../models/User');
//Fetching chats of user!
const fetchChat = async (req, res) => {
    //const pic="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    const user=req.user;
    try{
        const userChats = await Chat.find(
            
              { users: { $in: [user._id] } },  

                  
          )
          .populate('users')
          .populate({
            path: 'messages',
            options: { sort: { updatedAt: -1 } }
          })
          .sort({ updatedAt: -1 });
        const formattedChats=userChats.map((chat)=>{
            let chatName=chat.chatName;
            let pic=chat.pic;
            if(chat.users.length==2){
                const otherUser=chat.users.find(u=>u._id.toString()!==user._id.toString());
                if(otherUser){
                    chatName=otherUser.name;
                    pic=otherUser.pic;
                }
            }
            return{
                ...chat.toObject(),
                chatName,
                pic
            }
        })
        res.status(200).json({formattedChats,user});
    }
    catch(err){
        res.status(404).send(err);
    }
}
//Searching and getting chats of searched user
const accessChat = async (req, res) => {
    //we get the chats of the user 
    const {id}=req.body;
    const user=req.user;
    try{
        const chat=await Chat.findById(id).populate({
            path:"messages",
            populate:{
                path:"sender",
                select:"name"
            }
        }).populate('users');
        if(chat.users.length==2){
            const otherUser=chat.users.find(u=>u._id.toString()!==user._id.toString());
            if(otherUser){
                chat.chatName=otherUser.name;
                chat.pic=otherUser.pic;
            }
        }
        res.status(200).json(chat);
        
    }
    catch(err){
        res.status(400).send('Error in fetching the chat!')
    }

}







const createChat=async(req,res)=>{
    const {userId}=req.body;
    //check if a chatRoom containing these 2 users exists or not
    const chat=await Chat.findOne({users:{$all:[req.user._id.toString(),userId]},isGroupChat:false});
    if(chat){
        res.status(409).send("Chat with this user already exists");
    }
    else{
        const newChat=new Chat({users:[req.user._id.toString(),userId]});
        await newChat.save();
        res.status(200).json(newChat);
    }
}

const creategroup=async(req, res)=>{
    const { chatName, users} = req.body;
    const admin=req.user;

    if(!chatName){
        return res.status(400).send('Please fill all the fields!')
    }

   if(users.length <=1){
    return res.status(400).send("Group must containt atleast 3 memebers")
   }
  
    try {
      const newChat = await Chat.create({
        chatName,
        isGroupChat: true,
        users,
        groupAdmin:admin._id,
      });
      await Chat.findByIdAndUpdate(newChat._id,{
        $addToSet:{users: [admin._id]}
      })
      newChat.save();
  
      res.status(200).json(newChat);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}
const getChatByquery=async(req,res)=>{
    const id=req.query.q;
    try{
        const chat=await Chat.findById(id).populate('users');
        res.status(200).json(chat);
    }catch(err){
        res.status(400).send(err);
    }
}

const editGroup=async(req,res)=>{
    const { chatName, users,chatid } = req.body;

    if(users.length <=2){
        return res.status(400).send("Group must containt atleast 3 memebers")
    }
    
    try{
        const editGroup=await Chat.findByIdAndUpdate(chatid,{chatName,users},{new:true});
        res.status(200).json(editGroup);
    }catch(err){
        console.log(err);
    }

}

module.exports = { fetchChat, accessChat,createChat,creategroup,getChatByquery,editGroup};
