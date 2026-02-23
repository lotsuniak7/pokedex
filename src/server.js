const app = require('./app');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Le serveur lance sur http://localhost:${PORT}`);
});