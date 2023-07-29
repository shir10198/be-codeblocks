const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const CodeBlock = require('./schema');



const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
    cors :{
        origin: '*'
    }
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

let firstUserSocket = null; // To keep track of the first user

app.get('/', (req, res) => {
    
    res.json("Welcome to my server!");
}    
);

app.get('/getCodeBlocks',async (req,res)=> {
    const codeBlocks = await CodeBlock.find();
    console.log(codeBlocks);
    res.json(codeBlocks)
});

app.get('/getFirstSocket', (req, res) => {
    res.json( firstUserSocket.id );
});

app.post('/addCodeBlock',async (req,res) => {
    const { id, title, code } = req.body;
  
    
    const newCodeBlock = new CodeBlock({
      id,
      title,
      code
    });


    const savedCB = await newCodeBlock.save();
    res.json(savedCB);

})

app.post('/updateCodeBlock',async (req,res) => {
    const { title, code } = req.body;
  
    const existingCodeBlock = await CodeBlock.findOne({ title });

    // Update the code field
    existingCodeBlock.code = code;

    // Save the updated CodeBlock
    const updatedCodeBlock = await existingCodeBlock.save();
    res.json(updatedCodeBlock);

})





io.on('connection', (socket) => {
  console.log('New client connected');

  // The first user to connect will be assigned to the 'room1' room
  if (!firstUserSocket) {
    firstUserSocket = socket;
    console.log('mentor')
    socket.join('room1');
    socket.emit('readOnly'); // Send a signal to the first user to set the textbox to read-only
  } else {
    console.log('student')
    socket.join('room1');
    socket.emit('editable'); // Send a signal to other users to set the textbox to editable
  }

  socket.on('textUpdate', (updatedText) => {
    // Broadcast the updated text to other connected clients in the same room
    socket.to('room1').emit('textUpdate', updatedText);

    // Save the updated text to the database
    // Implement the database storage logic here


  });

  socket.on('disconnect', () => {
    console.log('user disconnected')
    if (firstUserSocket === socket) {
      firstUserSocket = null; // Reset firstUserSocket if the first user disconnects
    }
  });
});





const port = process.env.PORT || 5000;
const connectionString = process.env.MONGODB_CONNECTION_STRING;
server.listen(port, () => console.log(`Server running on port ${port}`));



mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB Atlas:', error);
    });