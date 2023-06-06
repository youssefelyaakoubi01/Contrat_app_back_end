const mongoose = require('mongoose');
const Schema =mongoose.Schema;


const contratShema = new Schema(

    {
        nom:String,
        prenom: String,
        entreprise: String,
        temps_hebdo: String
    }

)
const contrat = mongoose.model("contratShema",contratShema);

module.exports = contrat;