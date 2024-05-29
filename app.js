const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')
const { body, validationResult, check } = require('express-validator');
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const methodOverride = require('method-override')

require('./utils/db');
const Contact = require('./model/contact.js')

const app = express();
const port = 3000;

// setup method override
app.use(methodOverride('_method'));

// gunakan ejs
app.set('view engine', 'ejs');
// third-pary middleware
app.use(expressLayouts);
// built-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
    // res.sendFile('./index.html', { root: __dirname })
    res.render('index', { title: 'Home', layout: 'layouts/main-layout' });
});

// Halaman About
app.get('/about', (req, res) => {
    res.render('about', { title: 'about', layout: 'layouts/main-layout' });
});

// Halaman Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    // console.log(contacts)
    res.render('contact', { title: 'contact', layout: 'layouts/main-layout', contacts, msg: req.flash('msg') });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {title: 'form tambah data contact', layout:'layouts/main-layout'})
})

// proses tambah data contact
app.post('/contact', [
    body('name').custom(async(value) => {
        const duplikat = await Contact.findOne({ name: value  })
        if(duplikat) {
            throw new Error('Name already exists!')
        }
        return true;
    }),
    check('email', 'Email is not valid!').isEmail(),
    check('phone', 'Phone Number is not valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    //   return res.status(400).json({ errors: errors.array( )});  
    res.render('add-contact', {title: 'Form Tambah Data Contact', layout: 'layouts/main-layout', errors : errors.array()})
    } else {
        Contact.insertMany(req.body, (error, result) => {
         // kirimkan flash message
        req.flash('msg', 'New Contact Added!')
        res.redirect('/contact');
        })
    }
})

// halaman detail contact
app.get('/contact/:name', async (req, res) => {
    // const contact = findContact(req.params.nama);
    const contact = await Contact.findOne({ name:req.params.name });
    // console.log(contacts)
    res.render('detail', { title: 'detail contact', layout: 'layouts/main-layout', contact });
});

// // proses delete contact
// app.get('/contact/delete/:name', async (req, res) => {
//     const contact = await Contact.findOne({ name: req.params.name});
//     // jika contact tidak ada
//     if(!contact){
//         res.status(404);
//         res.send('<h1>404<h1>'); 
//     } else {
//         Contact.deleteOne({_id: contact._id}).then((result) => {
//             req.flash('msg', 'Contact deleted!')
//             res.redirect('/contact');
//         })
//     }
// })

// delete data menggunakan package method override
app.delete('/contact', (req, res) => {
    Contact.deleteOne({name: req.body.name}).then((result) => {
    req.flash('msg', 'Contact deleted!')
    res.redirect('/contact');
    })
})

// form ubah data contact
app.get('/contact/edit/:name', async (req, res) => {
    const contact = await Contact.findOne({name: req.params.name})
    res.render('edit-contact', {title: 'form ubah data contact', layout:'layouts/main-layout', contact})
})

// proses ubah data
app.put('/contact', [
    body('name').custom( async (value, {req}) => {
        const duplikat = await Contact.findOne({name : value})
        if(value !== req.body.oldName && duplikat) {
            throw new Error('Name already exists!')
        }
        return true;
    }),
    check('email', 'Email is not valid!').isEmail(),
    check('phone', 'Phone Number is not valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    //   return res.status(400).json({ errors: errors.array( )});  
    res.render('edit-contact', {title: 'Form Ubah Data Contact', layout: 'layouts/main-layout', errors : errors.array(), contact: req.body})
    } else {
        Contact.updateOne({ _id: req.body._id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone
            },    
        }
    ).then((result) => {
         // kirimkan flash message
         req.flash('msg', 'Contact Updated!')
         res.redirect('/contact');
    })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});