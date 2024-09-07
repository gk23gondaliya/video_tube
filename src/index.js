const dotenv = require('dotenv');
const {app} = require('./app.js');
const {connectDB} = require('./db/dbConnection.js');
const port = process.env.PORT || 5100;
dotenv.config({
    path: './.env',
});

connectDB()
    .then(()=>{
    app.listen(port, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
}).catch(err=>{
    console.log("MONGO db connection failed !!! ", err);
})