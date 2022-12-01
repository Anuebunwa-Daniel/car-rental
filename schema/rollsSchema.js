const mongoose = require('mongoose')
const mongodb ='mongodb://localhost:27017/cars'
//"mongodb+srv://delivery:A123456s@door.mlbv9l0.mongodb.net/DoorMan"
// process.env.MONGODB

mongoose.connect(mongodb)

const rollsSchema = new mongoose.Schema({
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
       
    },

    price:{
        type: String
    }
   
})

module.exports=mongoose.model('RollsRoyce', rollsSchema)
