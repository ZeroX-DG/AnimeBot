var fs = require('fs'),
  request = require('request'),
  sql = require('mssql');
var url = require("url");
var path = require("path");


var api_url = "https://api.jikan.moe/anime/"
var anime_count = 0
var anime_image_path = '/home/zerox/NetBeansProjects/ASStore/ASStore-war/web/assets/img/anime'

const config = {
  user: 'sa',
  password: 'ZeroX123',
  server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
  database: 'Test'
}

var download = function (uri, filename) {
  request.head(uri, function (err, res, body) {
    var out = fs.createWriteStream(filename);
    request(uri).pipe(out);
  });
};

function connectDB(callback) {
  sql.connect(config).then(function () {
    callback()
  }).catch(function (err) {
    if (err) {
      console.log('SQL Connection Error: ' + err);
      process.exit(1)
    }
  });
}

function saveDB(i, name, description, image, callback) {

  var request = new sql.Request();
  request.input('name', sql.NVarChar, name);
  request.input('description', sql.NVarChar, description);
  request.input('image', sql.NVarChar, image)
  request.query('INSERT INTO Anime (Name, Description, Picture) VALUES (@name, @description, @image)').then(function (recordset) {
    callback()
  }).catch(function (err) {
    console.log(i)
    console.log('Request error: ' + err);
    process.exit(1)
  });
}

connectDB(function() {
  for (let i = 0; i <= 150; i++) {
    request(api_url + i, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        anime_count++
        const data = JSON.parse(body)
        var parsed = url.parse(data.image_url);
        //console.log(data.image_url);
        saveDB(i, data.title, data.synopsis, path.basename(parsed.pathname), function () {
          download(data.image_url, path.join(anime_image_path, path.basename(parsed.pathname)))
          console.log("[ DONE ] => " + data.title)
  
          if (i == 100) {
            console.log("Total anime saved: " + anime_count)
          }
        })
      }
    })
  }
})



// download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
//   console.log('done');
// });
