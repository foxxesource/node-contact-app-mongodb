const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/practice', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// // Menambah 1 Data
// const contact1 = new Contact({
//     name: 'Bintang Duinata',
//     phone: '089639640252',
//     email: 'bintang.duinata31@gmail.com'
// });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact))