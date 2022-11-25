const mongoose = require('mongoose')
const mongodb ='mongodb://localhost:27017/cars'
//"mongodb+srv://delivery:A123456s@door.mlbv9l0.mongodb.net/DoorMan"
// process.env.MONGODB

mongoose.connect(mongodb)

const toyotacarSchema = new mongoose.Schema({
   carName :{
        type: String,
        
    },

    millage:{
        type: String,
        
        
    },

    seater:{
        type: String,
       
    },

    mechnism:{
        type: String
    },
    combustion:{
        type: String
    },
    image:{
        type: String,
       
    }
   
})

const cars=mongoose.model('toyota', toyotacarSchema)
module.exports ={cars}