const express = require('express')
const ejs = require('ejs')
const ejsLayouts = require('express-ejs-layouts')


const app = express()

// static files
app.use(express.static ('assets'))
app.use('/css', express.static(__dirname + 'assets/css'))
app.set('views engine', 'ejs')

// setting the templates

app.set('view engine', 'ejs')
// app.set('layout', './layouts/homeLayout')
// app.use(ejsLayouts)


//Navigation
app.get('/', (req,res)=>{
    res.render('home',{
        title: 'Home page'
    }
    )
})

app.get('/car-select', (req,res)=>{
    res.render('car-select',{
        title: 'car select page'
    })
})



const port = 12345
app.listen(port, ()=>{
    console.log ('server started at port 12345')
})