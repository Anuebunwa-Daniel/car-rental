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

app.get('/payment-page', (req,res)=>{
    res.render('payment-page', {
        title: ''
    })
})

app.get('/otp', (req,res)=>{
    res.render('otp')
})
   

// The route where we initiate payment (Steps 1 - 3)
app.post('/payment-page', async (req, res) => {
    const payload = {
        card_number: req.body.cardNumber,
        cvv: req.body.cvv,
        expiry_month: req.body.expMonth,
        expiry_year: req.body.expYear,
        currency: 'NGN',
        amount: req.body.amount,
        email: req.body.email,
        fullname: req.body.fullName,
        // Generate a unique transaction reference
        tx_ref: "CruiseEasyAuto_" + Math.floor(Math.random(100000)),
        // redirect_url: process.env.APP_BASE_URL + '/pay/redirect',
        enckey: process.env.FLW_ENCRYPTION_KEY
    }
    const response = await flw.Charge.card(payload);

    switch (response?.meta?.authorization?.mode) {
        case 'pin':
        case 'avs_noauth':
            // Store the current payload
            req.session.charge_payload = payload;
            // Now we'll show the user a form to enter
            // the requested fields (PIN or billing details)
            req.session.auth_fields = response.meta.authorization.fields;
            req.session.auth_mode = response.meta.authorization.mode;
            return res.redirect('/otp');
        case 'redirect':
            // Store the transaction ID
            // so we can look it up later with the flw_ref
            await redis.setAsync(`txref-${response.data.tx_ref}`, response.data.id);
            // Auth type is redirect,
            // so just redirect to the customer's bank
            const authUrl = response.meta.authorization.redirect;
            return res.redirect(authUrl);
        default:
            // No authorization needed; just verify the payment
            const transactionId = response.data.id;
            const transaction = await flw.Transaction.verify({ id: transactionId });
            if (transaction.data.status == "successful") {
                return res.redirect('/payment-successful');
            } else if (transaction.data.status == "pending") {
                // Schedule a job that polls for the status of the payment every 10 minutes
                transactionVerificationQueue.add({id: transactionId});
                return res.redirect('/payment-processing');
            } else {
                return res.redirect('/payment-failed');
            }
    }
});


// The route where we send the user's auth details (Step 4)
app.post('/pay/authorize', async (req, res) => {
    const payload = req.session.charge_payload;
    // Add the auth mode and requested fields to the payload,
    // then call chargeCard again
    payload.authorization = {
        mode: req.session.auth_mode,
    };
    req.session.auth_fields.forEach(field => {
        payload.authorization.field = req.body[field];
    });
    const response = await flw.Charge.card(payload);

    switch (response?.meta?.authorization?.mode) {
        case 'otp':
            // Show the user a form to enter the OTP
            req.session.flw_ref = response.data.flw_ref;
            return res.redirect('/otp');
        case 'redirect':
            const authUrl = response.meta.authorization.redirect;
            return res.redirect(authUrl);
        default:
            // No validation needed; just verify the payment
            const transactionId = response.data.id;
            const transaction = await flw.Transaction.verify({ id: transactionId });
            if (transaction.data.status == "successful") {
                return res.redirect('/success');
            } else if (transaction.data.status == "pending") {
                // Schedule a job that polls for the status of the payment every 10 minutes
                transactionVerificationQueue.add({id: transactionId});
                return res.redirect('/payment-processing');
            } else {
                return res.redirect('/failed');
            }
    }
});


// The route where we validate and verify the payment (Steps 5 - 6)
app.post('/otp', async (req, res) => {
    const response = await flw.Charge.validate({
        otp: req.body.otp1,
        flw_ref: req.session.flw_ref
    });
    if (response.data.status === 'successful' || response.data.status === 'pending') {
        // Verify the payment
        const transactionId = response.data.id;
        const transaction = flw.Transaction.verify({ id: transactionId });
        if (transaction.data.status == "successful") {
            return res.redirect('/successful');
        } else if (transaction.data.status == "pending") {
            // Schedule a job that polls for the status of the payment every 10 minutes
            transactionVerificationQueue.add({id: transactionId});
            return res.redirect('/payment-processing');
        }
    }

    return res.redirect('/failed');
});

// Our redirect_url. For 3DS payments, Flutterwave will redirect here after authorization,
// and we can verify the payment (Step 6)
app.post('/pay/redirect', async (req, res) => {
    if (req.query.status === 'successful' || req.query.status === 'pending') {
        // Verify the payment
        const txRef = req.query.tx_ref;
        const transactionId = await redis.getAsync(`txref-${txRef}`);
        const transaction = flw.Transaction.verify({ id: transactionId });
        if (transaction.data.status == "successful") {
            return res.redirect('/payment-successful');
        } else if (transaction.data.status == "pending") {
            // Schedule a job that polls for the status of the payment every 10 minutes
            transactionVerificationQueue.add({id: transactionId});
            return res.redirect('/payment-processing');
        }
    }

    return res.redirect('/payment-failed');
});   

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