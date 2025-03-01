import express from "express";
import { PORT , mongoDBURL} from "./config.js"
import mongoose from 'mongoose';
import { Book } from './models/bookModel.js'
import booksRoute from './routes/booksRoute.js'
import cors from 'cors';
const app = express();

app.use(express.json());

//middleware for handling cors policy
//option 1:allow all originns with default of cors
app.use(cors());

// //option 2:allow customorigin
app.use(
  cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Contents-Type'],
  })
)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");  // ✅ Explicitly allow frontend
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.get('/',(request,response)=>{
    console.log(request)
    return response.status(234).send('Welcome To MERN STACK tutotial')
});

app.use('/books',booksRoute)
//route for save a new book
app.post('/books',async(request,response)=>{
    try{
          if(
            !request.body.title ||
            !request.body.author ||             
            !request.body.publishYear
          ){
            return response.status(400).send({
                message:'send all required filde:title,author,publishYear',
            });
          }

          const newBook={
            title:request.body.title,
            author:request.body.author,
            publishYear:request.body.publishYear,
          };
          const book=await Book.create(newBook);

          return response.status(201).send(book);
    }
    catch(error){
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
})
//Route for get all books free database
app.get('/books',async(request,response)=>{
  try{
    const books=await Book.find({});
    return response.status(200).json({
      count:books.length,
      data:books
    });

  }catch(error){
    console.log(error.message);
    response.status(500).send({message:error.message});
  }
})
//Route for get all books free database by id
app.get('/books/:id',async(request,response)=>{
  try{
    const { id }=request.params;

    const book=await Book.findById(id);
    return response.status(200).json(book);

  }catch(error){
    console.log(error.message);
    response.status(500).send({message:error.message});
  }
})
//Route fro update a book
app.put('/books/:id',async(request,response)=>{
  try{
    if(
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ){
      return response.status(400).send({
        message:'send all required fields:title,author,publishYear',
    });
    }
   const { id }=request.params;
   const result=await Book.findByIdAndUpdate(id,request.body); 

   if(!result){
    return response.status(404).json({message:'Book not found'});
   }
   return response.status(200).send({message:'Book updated sucessfully'});
  }catch(error){
      console.log(error.message);
      response.status(500).send({message: error.message});
  }
});

//ROute fo rdelete a book
app.delete('/books/:id',async(request,response)=>{
  try{
    const { id }=request.params;
    const result=await Book.findByIdAndDelete(id,request);
    if(!result){
      return response.status(404).json({message:'Book not found'});
    }
    return response.status(200).send({message:'Book deleted sucessfully'});
  }
  catch(error){
    console.log(error.message);
    response.status(500).send({message: error.message});
  }
})
mongoose
   .connect(mongoDBURL)
   .then(() =>{
      console.log("App connected to database");
      app.listen(PORT,() => {
        console.log(`App is listening to port : ${PORT}`);
    });
   })
   .catch((error)=>{
       console.log(error);
   });