

let source_name = "搜狐新闻";

let myEncoding = "utf-8";

let seedURL = 'https://news.sohu.com/';
let myURL = "";

let url_reg = /\/a\//;
let seedURL_format = "$('*')";

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
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
};

// request家毬奢˙fetch url
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
        seedurl_news = eval(seedURL_format);
    } catch(e) {console.log('新闻爬取失败' + e)};

    seedurl_news.each(function(i, e) {
        try {
            let href = "";
            href = $(e).attr("href");
            if (typeof href == "undefined") {
                return;
            }

            myURL = href;
            if (href.toLowerCase().indexOf('https://') >= 0 || href.toLowerCase().indexOf('https://') >= 0) myURL = href;
            else if (href.startsWith('//')) myURL = 'https:' + href;
            else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href;
        }  catch (e) {console.log('新闻爬取失败' + e)}
        if (!url_reg.test(myURL)) return;
        // 防止网页重复爬取
        let fetch_url_Sql = 'select url from fetches where url=?';
        let fetch_url_Sql_Params = [myURL];
        mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
            if (vals.length > 0) {
                console.log('URL duplicate!');
            }else newsGet(myURL);
        })
        // else newsGet(myURL);
        // console.log(myURL);
    });
});

function newsGet(myURL) {       
    superagent.get(myURL).end((err, res) => {
        if (err) {
            console.log("热点新闻抓取失败-${err}");
        } else {
            console.log("爬取新闻成功!");
            getHotNews(res, myURL);
        }
    })
}

function getHotNews(res, myURL) {
    let $ = myCheerio.load(res.text);

    let fetch = {};
    fetch.title = "";
    fetch.content = "";
    fetch.keywords = "";
    fetch.publish_date="";
    fetch.author = "";
    // fetch.desc = "";
    fetch.source_name = source_name;
    fetch.source_encoding = myEncoding;
    fetch.crawltime = new Date;
    fetch.url = myURL;


    fetch.title = $('.text-title > h1').eq(0).text().replace(/\s*/g,"");
    if (fetch.title == "") fetch.title = source_name;

    fetch.content = $(".article p").text();

    fetch.keywords = $('meta[name=\"keywords\"]').eq(0).attr("content");

    fetch.publish_date = $('.time').eq(0).text().substr(0, 10);

    fetch.author = $('.user-info h4 a').eq(0).text();

    // fetch.desc = $('meta[name=\"description\"]').eq(0).attr("content");

    // let filename = "_" + (new Date()).toFormat("YYYY-MM-DD") +
    // "_" + myURL.slice(myURL.lastIndexOf('/') + 1, myURL.lastIndexOf('?')) +".json";

    // fs.writeFileSync(filename, JSON.stringify(fetch));
    let fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
    'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
    let fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
        fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
        fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content
];

    //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
    mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
        if (qerr) {
            console.log(qerr);
        }
        console.log("插入数据库成功!");
    }); //mysql写入
}