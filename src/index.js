const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const DB = require("./db");
const session = require('express-session');

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1200000 } }))

app.use(bodyParser.urlencoded({ extended: false }));

let Port = process.env.PORT || 8000;

let temp_path = path.join(__dirname, "..", "templates", "views");
const static_path = path.join(__dirname, "..", "templates");
app.use(express.static(static_path));

app.set("view engine", "ejs");
app.set("views", temp_path);

app.get("/signup", (req, res) => {
    res.render("signup", {
        chk: 0
    });
})

app.post("/", (req, res) => {
    const getDocument = async() => {
        try {
            let a = await DB.find({ $and: [{ Username: req.body.username.toLowerCase() }, { Password: req.body.password }] }).select({ data: 1, Name: 1, Username: 1 }).countDocuments();
            if (a != 0) {
                req.session.views = 1;
                const result = await DB.find({ Username: req.body.username.toLowerCase() }).select({ data: 1, Name: 1, Username: 1 });
                req.session.UserData = result;
                res.redirect("/");
            } else {
                res.render("index", {
                    chk: 1
                });
            }
            res.end();

        } catch (err) {
            req.session.views = 0;
            res.render("index", {
                chk: 1
            });

        }
    }
    getDocument();
})

app.post("/signup", (req, res) => {
    const createDocument = async() => {
        try {
            const data = new DB({
                Name: req.body.name,
                Username: req.body.username,
                Password: req.body.password
            })
            req.session.views = 1;
            const result = await data.save();
            const getDocument1 = async() => {
                try {
                    const result = await DB.find({ Username: req.body.username }).select({ data: 1, Name: 1, Username: 1 });
                    req.session.UserData = result;
                    res.redirect("/");
                    res.end();
                } catch (err) {
                    req.session.views = 0;
                    res.render("notes", {
                        chk: 1
                    });

                }
            }
            getDocument1();

        } catch (err) {
            // console.log(err);
            req.session.views = 0;
            res.render("signup", {
                chk: 1
            });

        }
    }
    createDocument();
})

app.post("/submit", (req, res) => {
    if (req.session.views == 1) {
        const updateDocument = async() => {
            try {
                const result = await DB.updateOne({ Username: req.session.UserData[0].Username }, {
                    $push: {
                        data: {
                            title: req.body.title,
                            desc: req.body.desc
                        }
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
        updateDocument();
        res.redirect('/update');
    }
})

app.get("/update", (req, res) => {
    if (req.session.views == 1) {
        const getDocument1 = async() => {
            try {
                const result = await DB.find({ Username: req.session.UserData[0].Username }).select({ data: 1, Name: 1, Username: 1 });
                req.session.UserData = result;
                res.redirect("/");
                res.end();
            } catch (err) {
                req.session.views = 0;
                res.render("notes", {
                    chk: 1
                });

            }
        }
        getDocument1();
    } else {
        res.redirect("/");
    }
})

app.get("/", (req, res) => {
    const d = new Date();
    if (req.session.views == 1) {
        res.render("notes", {
            session: req.session,
            chk: 0,
            year: d.getFullYear()
        });

    } else {
        res.render("index", {
            chk: 0
        });
    }
});

app.get('/delete/:id', (req, res) => {
    if (req.session.views == 1) {
        const getDocument1 = async() => {
            try {
                let result2 = await DB.updateOne({ Username: req.session.UserData[0].Username }, {
                    $pull: {
                        data: {

                            title: req.session.UserData[0].data[req.params.id].title,
                            desc: req.session.UserData[0].data[req.params.id].desc
                        }
                    }
                });
                // console.log(result2);
                res.end();
            } catch (err) {
                //error
                console.log("err")

            }
        }
        getDocument1();

        res.redirect("/update");
    } else {
        res.redirect("/");
    }
})

app.post('/nupdate', (req, res) => {
    if (req.session.views == 1) {
        const getDocument12 = async() => {
            try {
                let result2 = await DB.updateMany({ Username: req.session.UserData[0].Username, "data.desc": req.session.UserData[0].data[req.body.id].desc, "data.title": req.session.UserData[0].data[req.body.id].title }, {
                    $set: {
                        'data.$.title': req.body.title1,
                        "data.$.desc": req.body.desc1
                    }
                });
                console.log(result2);
            } catch (err) {
                //error
                console.log(err)
            }
        }
        getDocument12();
        res.redirect('/update');
    } else {
        res.redirect("/");
    }
})

app.get("/logout", (req, res) => {
    if (req.session.views == 1) {
        req.session.views = 0;
        res.redirect("/");
    } else {
        res.redirect("/");
    }
})

app.listen(Port, () => {
    console.log(`Listing on Port ${Port}`);
});