require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const ejsLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser  = require('body-parser')
const {cloudinary} =require('./utis/cloudinary')
const multer = require('multer')
const upload = require('./utis/multer')
const toyotacarSchema = require('./schema/toyotacarSchema')
const rollsSchema = require('./schema/rollsSchema')
const audiSchema = require('./schema/audiSchema')
const bmwSchema = require('./schema/bmwSchema')
const hyundaiSchema = require('./schema/hyundaiSchema')
const jeepSchema = require('./schema/jeepSchema')


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


// setting the templates
app.set('view engine',  'ejs')



//Navigation the Home page
app.get('/', (req,res)=>{
    res.render('home',{
        title: 'Home page'
    }
    )
})
//Navigating the car-folders
app.get('/toyota-cars', async(req,res)=>{
    const toyotaCars= await toyotacarSchema.find()
    res.render('carFolder/toyota-cars',{
        title: 'toyota-cars page',
        toyotas: toyotaCars
    })
})

app.get('/Audi-cars', async(req,res)=>{
    const audiCars= await audiSchema.find()
    res.render('carFolder/Audi-cars',{
        title: 'Audi-cars page',
        audis: audiCars
    })
})

app.get('/BMW-cars', async(req,res)=>{
    const bmwCars= await bmwSchema.find()
    res.render('carFolder/BMW-cars',{
        title: 'BMW-cars page',
        bmws: bmwCars
    })
})

app.get('/Hyundai-cars', async(req,res)=>{
    const hyundaiCars= await hyundaiSchema.find()
    res.render('carFolder/Hyundai-cars',{
        title: 'Hyundai-cars page',
        hyundais: hyundaiCars
    })
})

app.get('/Jeep-cars', async(req,res)=>{
    const jeepCars= await jeepSchema.find()
    res.render('carFolder/Jeep-cars',{
        title: 'BMW-cars page',
        jeeps: jeepCars
    })
})

app.get('/Rolls-Royce-cars', async(req,res)=>{
    const rollsCars= await rollsSchema.find()
    res.render('carFolder/Rolls-Royce-cars',{
        title: 'Rolls-Royce-cars page',
        rollsRoyces: rollsCars
    })
})

//Navigating through the Admin page
app.get('/toyota', (req,res)=>{
    res.render('admin/toyota',{
        title: 'admin page'
    })
})

app.get('/rolls', (req,res)=>{
    res.render('admin/rolls',{
        title: 'admin page'
    })
})

app.get('/Audi', (req,res)=>{
    res.render('admin/Audi',{
        title: 'admin page'
    })
})

app.get('/Bmw', (req,res)=>{
    res.render('admin/Bmw',{
        title: 'admin page'
    })
})

app.get('/jeep', (req,res)=>{
    res.render('admin/jeep',{
        title: 'admin page'
    })
})

app.get('/hyundai', (req,res)=>{
    res.render('admin/hyundai',{
        title: 'admin page'
    })
})

app.get('/admin-dashboard', (req,res)=>{
    res.render('admin/admin-dashboard',{
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

app.post('/toyota', upload.single('image'),  async(req, res, next)=>{
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
            price:carInfo.price,
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

app.post('/rolls', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/Rolls Royce'})
    const carInfo = req.body
    console.log(result)

    rolls()
    async function rolls(){

        try{
        const rolls =new rollsSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            price:carInfo.price,
            image:result.url
            
        })
    await rolls.save()
    res.render('success')
}catch(err){
    console.log(err)
    res.render('failed')
 }
}
})

app.post('/Audi', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/Audi'})
    const carInfo = req.body
    console.log(result)

    audi()
    async function audi(){

        try{
        const rolls =new audiSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            price:carInfo.price,
            image:result.url
            
        })
    await audi.save()
    res.render('success')
}catch(err){
    console.log(err)
    res.render('failed')
 }
}
})

app.post('/Bmw', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/BMW'})
    const carInfo = req.body
    console.log(result)

    bmw()
    async function bmw(){

        try{
        const bmw =new bmwSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            price:carInfo.price,
            image:result.url
            
        })
    await bmw.save()
    res.render('success')
}catch(err){
    console.log(err)
    res.render('failed')
 }
}
})

app.post('/hyundai', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/Hyundai'})
    const carInfo = req.body
    console.log(result)

    hyundai()
    async function hyundai(){

        try{
        const hyundai=new hyundaiSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            price:carInfo.price,
            image:result.url
            
        })
    await hyundai.save()
    res.render('success')
}catch(err){
    console.log(err)
    res.render('failed')
 }
}
})

app.post('/jeep', upload.single('image'),  async(req, res, next)=>{
    console.log(req.body)
    const result = await cloudinary.uploader.upload(req. file.path, {folder: 'car rental cars/Jeep'})
    const carInfo = req.body
    console.log(result)

    jeep()
    async function jeep(){

        try{
        const jeep =new jeepSchema({
            carName: carInfo.carName,
            millage: carInfo.millage,
            seater: carInfo.seater,
            mechnism:carInfo.mechnism,
            combustion:carInfo.combustion,
            price:carInfo.price,
            image:result.url
            
        })
    await jeep.save()
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