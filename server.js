const mysql= require("mysql");
const express= require("express"); //Express används här för att skapa och hantera HTTP-servern.
const cors= require("cors"); // tillåter servern att kommunicera med klienter från andra domäner (CORS).
const path= require("path");
const port= 3001;
const app= express();
const util= require("util");

app.use(express.static(path.join(__dirname))); //konfigurerar Express för att servera statiska filer, såsom HTML, CSS och JavaScript, från en specifik katalog
app.use(express.json());


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "barcelona",
    database: "rum_bokning",
});

const query= util.promisify(connection.query).bind(connection);

connection.connect((err) =>{
    if(!err){
        console.log("Connected to the database successfully");
    }
});

app.listen(port,  () =>{
    console.log(`Server listening on port ${port}`);
});

app.get('/api/ManParfymURL', (rep,res) => {
    let query= "SELECT parfym_id, parfymNamn, bild_url, pris, beskrivning FROm parfymer WHERE kön = 1";
    connection.query(query,(err,results) =>{
        if(err){
            res.status(500).send("FEl vid anslutning till servern");
            return;
        }
        res.json(results);
    });
});


app.get('/api/WomenParfymURL', (req,res) =>{
    let query= "SELECT parfym_id, parfymNamn, bild_url, pris, beskrivning FROM parfymer WHERE kön = 0";
    connection.query(query, (err,results)=>{
        if(err){
            res.status(500).send("Fel vid anslutning till servern");
            return;
        }
        res.json(results);
    });
});



app.get('/search', (req, res) => {
    const parfymName = req.query.parfymNamn;
    const sqlQuery = "SELECT parfym_id, parfymNamn, pris, beskrivning, bild_url FROM parfymer WHERE parfymNamn = ?";
    connection.query(sqlQuery, [parfymName], (err, results) => {
        if (err) {
            console.error("Error querying MySQL server:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        if (results.length > 0) {
            const parfymer = results.map(parfym => ({
                parfym_id: parfym.parfym_id,
                parfymNamn: parfym.parfymNamn,
                pris: parfym.pris,
                beskrivning: parfym.beskrivning,
                bild_url: parfym.bild_url
            }));
            res.json({ message: "Parfymen finns i databasen!", parfymer: parfymer });
        } else {
            res.json({ message: `Parfymen hittade inte ${parfymName}`});
        }
    });
});



app.get("/get_parfymer", (req, res) => {
    let parfymIdLista = req.query.parfym_id;

    if (!Array.isArray(parfymIdLista)) {
        parfymIdLista = [parfymIdLista];
    }

    let query = `SELECT antal, parfym_id FROM parfymer WHERE parfym_id IN (${parfymIdLista.join(',')})`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Fel vid hämtning av parfymer från databasen:', err);
            return res.status(500).send("Fel vid anslutning till servern");
        }
        return res.json(results);
    });
});




app.post('/update_antal', (req, res) => {
    const parfymDataList = req.body.parfym_id_lista;
  
    parfymDataList.forEach(parfymData => {
      const parfymId = parfymData.parfym_id;
      const antal = parfymData.antal;
  
      const query = 'UPDATE parfymer SET antal = antal - ? WHERE parfym_id = ?';
      connection.query(query, [antal, parfymId], (err, result) => {
        if (err) {
          console.error('Fel vid uppdatering av parfym: ' + err.stack);
          res.status(500).json({ error: 'Ett fel inträffade vid uppdatering av parfym.' });
          return;
        }
        console.log('Antalet parfym uppdaterat för ID ' + parfymId);
      });
    });
  
    res.status(200).json({ message: 1});
  });