const mongoose = require('mongoose')
const dotenv = require("dotenv");
const path = require("path");
const envpath = path.join(__dirname, "/config.env");
dotenv.config({ path: envpath })

const DB = process.env.DATABASE;
// const DB = "mongodb+srv://azeem:2765@cluster0.jpazi.mongodb.net/sticky_notes101?retryWrites=true&w=majority";
// mongoose.connect("mongodb://localhost:27017/Sticky_Notes", {
mongoose.connect(`${DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Success")
}).catch((err) => {
    console.log("error: " + err);
});
const userData = new mongoose.Schema({

    Name: {
        type: String,
        unique: false,
        required: true
    },
    Username: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    data: {
        type: Array,
        items: {
            type: Object,
            properties: {
                title: {
                    type: String
                },
                desc: {
                    type: String
                }
            }
        }
    }

})
const list = new mongoose.model("Data", userData);

module.exports = list;
// module.exports = mongoose.model('DB123', userData2)