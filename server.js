const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
const port = 2525; //

app.get('/', (req, res) => {
  res.render("index");
});

// Endpoint to handle email sending
app.get('/sendEmail', async (req, res) => {
  console.log("HELLOOOO");
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
