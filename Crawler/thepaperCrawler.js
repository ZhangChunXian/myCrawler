let source_name = "¼ê´û·s?"

let myEncoding = "utf-8";

let seedURL = 'https://www.thepaper.cn/'
let myURL = "";

let seedURL_format = "$('*')";
let url_reg = /newsDetail/;

let fs = require('fs');
let myRequest = require('request');
let myCheerio = require('cheerio');
let https = require('https');
let myIconv = require('iconv-lite');
let superagent = require('superagent');
let mysql = require('./mysql.js');
let schedule = require('node-schedule');
require('date-utils');


let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
}


function request(url, callback) {
    let options = {
        url: url,
        encoding: null,
        headers: headers,
        timeout: 10000
    }
    myRequest(options, callback);
}

request(seedURL, function(err, res, body) {
    let html = myIconv.decode(body, myEncoding);

    let $ = myCheerio.load(html, {decodeEntities: true});

    let seedurl_news;

    try {
        seedurl_news= eval(seedURL_format);
    }catch(e) {console.log('·s?ª¦¨ú¥¢?' + e)};

    seedurl_news.each(function(i, e) {
        try {
            let href = "";
            href = $(e).attr("href");
            if (typeof href == "undefined") {
                return;
            }

            myURL = href;
            // if (href.toLowerCase().indexOf('https://') >= 0 || href.toLowerCase().indexOf('https://') >= 0) myURL = href;
            // else if (href.startsWith('//')) myURL = 'https:' + href;
            // else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href;
        } catch(e) {console.log('·s?ª¦¨ú¥¢?')}
        if (!url_reg.test(myURL)) return;
        else newsGet(myURL);
        // let fetch_url_Sql = 'select url from fetches where url=?';
        // let fetch_url_Sql_Params = [myURL];
        // mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
        //     if (vals.length > 0) {
        //         console.log('URL duplicate!');
        //     }else newsGet(myURL);
        // })

    });
});

function newsGet(myURL) {
    superagent.get(myURL).end((err, res) => {
        if (err) {
            console.log("?˜ò·s?§ì¨ú¥¢?-${err}");
        }else {
            console.log("ª¦¨ú·s?¦¨¥\!");
            getHotNews(res, myURL);
        }
    })
}

function getHotNews(res, myURL) {
    let $ = myCheerio.load(res.text);

    let fetch = {};
    fetch.author = "";
    fetch.title = "";
    fetch.content = "";
    fetch.keywords = "";
    fetch.publish_date = "";
    fetch.desc = "";
    fetch.source_name = source_name;
    fetch.source_encoding = myEncoding;
    fetch.crawltime = new Date;
    fetch.url = myURL;

    fetch.title = $('.news_title').text();
    if (fetch.title == "") fetch.title = source_name;

    fetch.content = $(".news_txt").eq(0).text().replace(/\s*/g,"");

    fetch.keywords = $('meta[name=\"Keywords\"]').eq(0).attr("content");

    fetch.author = $('.news_about p').eq(0).text();

    fetch.publish_date = $('.news_about p').eq(0).text();

    // fetch.author = $('.author').eq(0).attr("content");

    // fetch.desc = $('.Description').eq(0).attr("content");

    let filename = "_" + (new Date()).toFormat("YYYY-MM-DD")
    + myURL.slice(myURL.lastIndexOf('/') + 1, myURL.lastIndexOf('.')) +".json";

    fs.writeFileSync(filename, JSON.stringify(fetch));

    // let fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
    // 'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
    // let fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
    //     fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
    //     fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content
// ];

//     //?¦æsql¡A?Õu?¤¤fetchªí¨½ªºurl˜í©Ê¬Ouniqueªº¡A¤£‰N§â­«Î`ªºurl?®e?¤J?Õu?
//     mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
//         if (qerr) {
//             console.log(qerr);
//         }
//         console.log("´¡¤J?Õu?¦¨¥\!");
//     }); //mysql?¤J
}
