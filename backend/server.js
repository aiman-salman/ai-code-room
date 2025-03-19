import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js'

const port = process.env.PORT || 3000; 


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// middleware
io.use(async (socket, next) => {

    try{

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        console.log("Project ID from handshake:", projectId);

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId)


        if(!token){
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return next(new Error('Authentication error'))
        }

        socket.user = decoded;

        next();

    }catch(error){
        next(error)
    }
})


io.on('connection', socket => {

    if (!socket.project) {
        console.error('No valid project found for this socket connection');
        return;
    }

    socket.roomId = socket.project._id.toString();
    
    console.log('Socket connected:', socket.id);

    console.log('a user connected');

    socket.join(socket.roomId);
    console.log("room",socket.roomId);


    socket.on('project-message', async data => {

        const message = data.message;
        console.log("Raw message:", `"${message}"`);

        const aiIsPresentInMessage = /\s?@ai\s?/i.test(message);
        console.log("AI Check:", aiIsPresentInMessage); 

        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if(aiIsPresentInMessage){ 

            const prompt = message.replace('@ai', '');
           
            const result = await generateResult(prompt);

            console.log("AI response:", result);//debug

            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            })
            return
        }
    });
    
    socket.on('disconnect', () => { 
        console.log("user disconnected")
        socket.leave(socket.roomId)
    });
});

server.listen(port, '0.0.0.0', () =>{
    console.log(`Server running on port ${port}`);
}); 
