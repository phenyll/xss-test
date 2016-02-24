/**
 * Created by Oliver on 23.02.2016.
 */

var Crawler = require("simplecrawler");
var cheerio = require('cheerio');
var forms = [];
var startTime = new Date();

var myCrawler = new Crawler("www.kueche-co.de", "/", 443);
myCrawler.maxDepth = 3;
myCrawler.maxConcurrency = 5;
myCrawler.interval = 50;
myCrawler.userAgent = 'Mozilla/5.0';

myCrawler.on("crawlstart", function() {
  console.log("Crawl starting");
});

myCrawler.on("fetchtimeout", function(queueItem) {
  console.log("timeout@", queueItem.path);
});

myCrawler.on("fetchstart", function(queueItem, requestOptions) {
  //console.log("start: ", queueItem.path);
});

myCrawler.on("fetchheaders", function(queueItem, responseObject) {
  //console.log("headers: ", queueItem.path);
});

var excludeFiles = myCrawler.addFetchCondition(function(parsedURL, queueItem) {
  return !parsedURL.path.match(/\.(pdf|png|jpg|jpeg|gif|act|css|ico|js|woff)$/i);
});

myCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
  console.log("completed " + queueItem.path);
  var $ = cheerio.load(responseBuffer);
  $('form').each(function(i, elem){
    if(forms.filter(function(e,i,a){
          return e.action != $(this).attr('action')
        }))
      forms[forms.length] = {
        path: queueItem.path,
        action: $(this).attr('action')
      }
  });
});

myCrawler.on('complete', function(){
  var endTime = new Date();
  console.dir(forms);
  console.dir(myCrawler.queue.complete());
  console.dir(myCrawler.queue.errors());

  //use phantomjs to try the xss!
  // https://github.com/cgiffard/node-simplecrawler/blob/master/example/phantom-example/index.js
  console.log("Scan took ", (endTime.getTime()-startTime.getTime())/1000, " sec");
});

myCrawler.start();