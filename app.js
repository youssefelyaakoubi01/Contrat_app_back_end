const express = require("express");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const pdfParse = require("pdf-parse");
const fs = require("fs");
const multer = require("multer");
const user = require("./models/user");
const upload = multer({ dest: "D:/Stage_Contrat/Contrat_app/public/pdf/" });
const Mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const Morgan= require('morgan')
const routeUser= require('./routes/routeUser');


/* Donner l'accées aux autres serveur d'interagir avec ce serveur */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Method", "*");
  next();
});

app.use(express.static("public"));
app.use(express.json());
app.set("views engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(routeUser);
app.use(Morgan('dev'))



// Connexion a la base de données
Mongoose.connect(
  //Pour utiliser les bases de donnèes cloud
  //"mongodb+srv://youssefelyaakoubi:good123@cluster0.adzwbmr.mongodb.net/?retryWrites=true&w=majority"
  "mongodb://127.0.0.1:27017/app"
)
  .then((result) => {
    app.listen(port, () => {
      console.log("Bien connecté avec la base de donnée");
      console.log(`Example app listening on port at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log(" problème");
  });



const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/cdd", (req, res) => {
  res.render("cdi.ejs");
});
app.get("/verifier_contrat", (req, res) => {
  res.render("verifier_contrat.ejs");
});
app.post("/verifier_contrat", async (req, res) => {
  try {
    async function extractTextFromPdf(file) {
      const dataBuffer = fs.readFileSync(file);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    }

    const filePath = "./public/pdf/contrat_test.pdf"; // Remplacez par le chemin de votre fichier PDF
    let contractText = await extractTextFromPdf(filePath);
    console.log(contractText);
    const prompt = contractText;
    console.log(prompt);

    response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Ce contrat est légal  au maroc ,repondre par 1 si le contrat légal ou 0 si le contrat est illégal ? :\n\n ${prompt} \n  `,
        },
      ],
      max_tokens: 2048,
    });

    res.render("affichage.ejs", {
      response: response["data"]["choices"][0]["message"]["content"],
      nom: "",
      prenom: "",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});

app.post("/verifier_form", async (req, res) => {
  nom = req.body.nom;
  prenom = req.body.prenom;
  temps_hebdo = req.body.temps_hebdo;
  type_contrat = req.body.type_contrat;
  salaire = req.body.salaire;
  prompt = nom + prenom + temps_hebdo + type_contrat;
  console.log(prompt);
  response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: ` le type de contrat est ${type_contrat},le temps hébdomadaire est ${temps_hebdo} heurs, le salaire Mensuel est ${salaire} \n\n,Ce contrat est légal  au maroc ,repondre par 1 si le contrat légal ou 0 si le contrat est illégal ? `,
      },
    ],
    max_tokens: 2048,
  });

  res.render("affichage.ejs", {
    response: response["data"]["choices"][0]["message"]["content"],
    nom: nom,
    prenom: prenom,
  });
});
function uploadFiles(req, res) {
  console.log(req.body);
  console.log(req.files);
  res.json({ message: "Successfully uploaded files" });
}
app.post("/upload_files", upload.array("files"), uploadFiles);
