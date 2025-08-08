const express = require('express');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => res.render('index'));
app.get('/projects', (req, res) => res.render('projects'));
app.get('/about', (req, res) => res.render('about'));

app.listen(PORT, () => {
  console.log(`Portfolio live at http://localhost:${PORT}`);
});
