const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf');

const utils = require('util');
const puppeteer = require('puppeteer');
const hb = require('handlebars');

const app = express();



app.set('view engine', 'ejs');
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 3000;




let options = { format: 'A4' };
let file = { content: path.dirname('/views/index.ejs') };


app.get('/', async (req, res) => {

  var content = fs.readFileSync('./views/index.ejs', 'utf8');
  let htmlToPdfOptions = {
    type: 'pdf',
    height: '650px',
    width: '850px',
    renderDelay: 2000,
    // "base": 'http://localhost:3000',
    "base": `${req.protocol}://${req.get('host')}`,
    "format": "A4",
    "orientation": "portrait",
    "dpi": 200,
    "quality": 80,
    "border": {
      "left": "1cm",
      "right": "1cm",
      "top": "1cm",
      "bottom": "1cm"
    },
    "header": {
      "height": "10mm"
    },
    "footer": {
      "height": "10mm"
    }
  }

  htmlPdf.create(content, htmlToPdfOptions).toFile('pdf/contract.pdf', (err, result) => {
    if (err) return console.log(err, 'err');
    console.log(result, 'result');
    res.render(`index`);
    // downloadFile(res);

  });

});


const downloadFile = (res) => {
  res.download(path.join(__dirname, 'pdf/contract.pdf'))
}
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
