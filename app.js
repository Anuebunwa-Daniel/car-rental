require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const ejsLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser  = require('body-parser')
const {cloudinary} =require('./utis/cloudinary')
const multer = require('multer')
const upload = require('./utis/multer')
const toyotacarSchema = require('./toyotacarSchema')


const app = express()

// connecting to the database
const mongodb = 'mongodb://localhost:27017/cars'
mongoose.connect(mongodb)
.then(()=>{
    console.log('connected to the database')
})
.catch((err)=>{
    console.log(err + 'Database connection failed')
})

// static files
app.use(express.static ('assets'))
app.use('/css', express.static(__dirname + 'assets/css'))
app.set('views engine', 'ejs')

// setting the templates
app.set('view engine', 'ejs')



//Navigation
app.get('/', (req,res)=>{
    res.render('home',{
        title: 'Home page'
    }
    )
})

app.get('/toyota-cars', async(req,res)=>{
    const toyotaCars= await toyotacarSchema.find()
    // console.log(toyotaCars)

    res.render('toyota-cars',{
        title: 'toyota-cars page',
        toyotas: toyotaCars
    })
})

app.get('/admin', (req,res)=>{
    res.render('admin',{
        title: 'admin page'
    })
})

app.get('/failed', (req,res)=>{
    res.render('failed',{
        // title: 'failed page'
    })
})

app.get('/success', (req,res)=>{
    res.render('success',{
        // title: 'success page'
    })
})

app.post('/admin', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/toyota cars'})
    const carInfo = req.body
    console.log(result)

    toyota()
    async function toyota(){

        try{
        const toyota =new toyotacarSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            image:result.url
            
        })
    await toyota.save()
    res.render('success')
}catch(err){
    console.log(err)
    res.render('failed')
 }

}


})




const port = 12345
app.listen(port, ()=>{
    console.log ('server started at port 12345')
})