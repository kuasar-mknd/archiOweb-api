import express from 'express';
import { connect } from 'mongoose';

const app = express();

connect('mongodb://localhost:27017/mydatabase', {useNewUrlParser: true, useUnifiedTopology: true});

app.get('/', (req, res) => {
    res.send('Bonjour le Monde !');
});

app.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur le port 3000');
});
