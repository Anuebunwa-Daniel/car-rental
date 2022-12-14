require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const ejsLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser  = require('body-parser')
const {cloudinary} =require('./utis/cloudinary')
const {otp} =require('./assets/script/script.js')
const multer = require('multer')
const upload = require('./utis/multer')
const toyotacarSchema = require('./schema/toyotacarSchema')
const rollsSchema = require('./schema/rollsSchema')
const audiSchema = require('./schema/audiSchema')
const bmwSchema = require('./schema/bmwSchema')
const hyundaiSchema = require('./schema/hyundaiSchema')
const jeepSchema = require('./schema/jeepSchema')
const Flutterwave = require('flutterwave-node-v3');
const open = require('open');
var axios = require('axios');


const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


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
        rollsroyces: rollsCars
    })
})

app.get('/flutter', (req,res)=>{
    res.render('flutter', {
        title: ''
    })
})

app.get('/otp', (req,res)=>{
    res.render('otp')
})
   
app.post('/next', (req,res)=>{
// Initiating the transaction
    const payload = {
        "card_number": '5531886652142950',
        "cvv": "564",
        "expiry_month": "09",
        "expiry_year": "32",
        "currency": "NGN",
        "amount": "200",
        "redirect_url": "http://localhost:12345/success",
        "fullname": "Odunze ",
        "email": "anuebunwadaniel66@gmail.com",
        "phone_number": "08036541679",
        "enckey": process.env.FLW_ENCRYPTION_KEY,
        "tx_ref": "cruiseAuto-" + Math.floor(Math.random() * 100000)
    
    }
    
    const chargeCard = async () => {
        try {
            const response = await flw.Charge.card(payload)
            // console.log(response)
            
            // Authorizing transactions
            
            // For PIN transactions
            if (response.meta.authorization.mode === 'pin') {
                let payload2 = payload
                payload2.authorization = {
                    "mode": "pin",
                    "fields": [
                        "pin"
                    ],
                    "pin": 3310
                }
                const reCallCharge = await flw.Charge.card(payload2)
                
                // Add the OTP to authorize the transaction
                var data = JSON.stringify({
                    "length": 6,
                    "customer": {
                      "name": "dahumble",
                      "email": "anuebunwadaniel66@gmail.com",
                      "phone": "08036541679"
                    },
                    "sender": "CruiseAuto",
                    "send": true,
                    "medium": [
                      "email"
                    ],
                    "expiry": 5
                  });
                  
                  var config = {
                    method: 'post',
                    url: 'https://api.flutterwave.com/v3/otps',
                    headers: {
                      'Authorization': 'Bearer FLWSECK_TEST-c7f0c75524a7718f3e4598814af028ea-X',
                      'Content-Type': 'application/json'
                    },
                    data : data
                  };
                  
                  axios(config)
                  .then(function (response) {
                    res.render('otp')
                    console.log(JSON.stringify(response.data));
                  })
                  .catch(function (error) {
                    res.send('failed')
                    // console.log(error);
                  });
                  
                  var otp =req.body.otp1 + req.body.otp2+req.body.otp3+req.body.otp4+req.body.otp5+req.body.otp6

                  console.log(otp)
                const callValidate = await flw.Charge.validate({

                    "otp":otp ,
                    "flw_ref": reCallCharge.data.flw_ref
                })
                // console.log(callValidate)
                
            }
            // For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
            if (response.meta.authorization.mode === 'redirect') {
                
                var url = response.meta.authorization.redirect
                open(url)
            }
            
            // console.log(response)
            // res.render('success')
            
            
        } catch (error) {
            // console.log(error)
            // res.render('failed')
        }
    }
    
    chargeCard();
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/toyota cars',
        width:600,
        height:400
        
})
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/Rolls Royce',
        width:600,
        height:400
        })
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/Audi',
        width:600,
        height:400
    })
    const carInfo = req.body
    console.log(result)

    audis()
    async function audis(){

        try{
        const audi =new audiSchema({
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/BMW',
        width:600,
        height:400
    })
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/Hyundai',
        width:600,
        height:400
    })
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
    const result = await cloudinary.uploader.upload(req. file.path, {
        folder: 'car rental cars/Jeep',
        width:600,
        height:400
    })
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