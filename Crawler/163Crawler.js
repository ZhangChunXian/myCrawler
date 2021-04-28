// 新闻来源
let source_name = "网易新闻";
// 编码格式
let myEncoding = "utf-8";
// 网址URL
let seedURL = 'https://www.163.com/';
let myURL = "";

let seedURL_format = "$('*')";
// let keywords_format = "$('meta[name=\"keywords\"]'].eq(0).attr(\"content\")";
// let title_format = "$('title').text()";
// let dateAndSource_format = "$('.post_info').text()";
// let author_format = "$('.post_author').text()";
// let content_format = "$('.post_body').text()";
// let desc_format = "$('meta[name=\"description\"]').eq(0).attr(\"content\")";
let url_reg = /article/;

// 导入所需模块
let fs = require('fs');
let myRequest = require('request');
let myCheerio = require('cheerio');
let https = require('https');
let myIconv = require('iconv-lite');
let superagent = require('superagent');
let mysql = require('./mysql.js');
let schedule = require('node-schedule');
require('date-utils');

// 防止网站屏蔽我们的爬虫
let headers = {
    'user-agent': "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
};

// request模块异步fetch url
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
    // 用iconv转换编码
    let html = myIconv.decode(body, myEncoding);
    let $ = myCheerio.load(html, {decodeEntities: true});
    let seedurl_news;
    try {
        seedurl_news = eval(seedURL_format);
    } catch(e) {console.log('url列表所处的html模块识别出错' + e)};
    seedurl_news.each(function(i, e) {
        try {
            let href = "";
            href = $(e).attr("href");
            if (typeof href == "undefined") {
                return;
            }
            myURL = href;
            if (myURL == "https://jubao.163.com/") return;
            if (href.toLowerCase().indexOf('https://') >= 0 || href.toLowerCase().indexOf('https://') >= 0) myURL = href;
            else if (href.startsWith('//')) myURL = 'https:' + href;
            else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href;
        }  catch (e) {console.log('识别种子页面中的新闻链接出错：' + e)}
        if (!url_reg.test(myURL) || myURL == "https://jubao.163.com/") return;
        // newsGet(myURL);
        // 防止网页重复爬取
        let fetch_url_Sql = 'select url from fetches where url=?';
        let fetch_url_Sql_Params = [myURL];
        mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
            if (vals.length > 0) {
                console.log('URL duplicate!');
            }else newsGet(myURL);
        })
    });
});




function newsGet(myURL) {       // 读取新闻页面
    superagent.get(myURL).end((err, res) => {
        if (err) {
            console.log("热点新闻抓取失败-${err}");
        } else {
            console.log("爬取新闻成功!");
            if (myURL == "https://jubao.163.com/") return;
            getHotNews(res, myURL);
        }
    })
}



function getHotNews(res, myURL) {
    let $ = myCheerio.load(res.text, { decodeEntities: true });
    let fetch = {};
    fetch.title = "";
    fetch.content = "";
    fetch.keywords = "";
    fetch.publish_date = "";
    fetch.author = "";
    fetch.desc = "";
    fetch.source_name = source_name;
    fetch.source_encoding = myEncoding;
    fetch.crawltime = new Date;
    fetch.url = myURL;

    fetch.title = $('title').eq(0).text();
    if (fetch.title == "") fetch.title = source_name;

    fetch.content = $(".post_body").eq(0).text().replace(/\s*/g,"");

    fetch.keywords = $('meta[name=\"keywords\"]').eq(0).attr("content");

    fetch.publish_date = $('.post_info').eq(0).text().replace(/\s*/g,"").substr(0, 10);

    fetch.author = $('.post_author').eq(0).text().replace(/\s*/g,"");

    fetch.desc = $('meta[name=\"description\"]').eq(0).attr("content");

    // let filename = source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
    // "_" + myURL.slice(myURL.lastIndexOf('/') + 1, myURL.lastIndexOf('.')) +".json";
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
};
