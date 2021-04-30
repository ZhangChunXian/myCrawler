$(document).ready(function() {
    // 页面加载完成
    // 间事件发生
    /* 网易新闻条目数 */
    let news163Item = 0;
    /* 看看新闻条目数 */
    let kknewsItem = 0;
    /* 搜狐新闻条目数 */
    let sohunewsItem = 0;
    /* 中新网新闻条目数 */
    let chinanewsItem = 0;
    // // 搜狐新闻代码块的高度
    // let sohuNewsBlockHeight = 0;
    // // 中国新闻网代码块的高度
    // let chinaNewsBlockHeight = 0;
    // // 最终高度
    // let blockHeight = 0;
    $("input:button").click(function() {
        $.get('/process_get?title=' + $("input:text").val(), function(data) {
            news163Item = 0;
            kknewsItem = 0;
            sohunewsItem = 0;
            chinanewsItem = 0;
            // 清空id为record163的表格
            $("#record163").empty();
            // 表格加入表头
            $("#record163").append('<tr>' +'<th>id</th><th>title</th><th>author</th><th>publish_date</th></tr>');
            // 清空id为kknewsrecord的表格
            $("#kknewsrecord").empty();
            // 表格加入表头
            $("#kknewsrecord").append('<tr>' +'<th>id</th><th>title</th><th>author</th><th>publish_date</th></tr>');
            // 清空id为sohunewsrecord的表格
            $("#sohunewsrecord").empty();
            // 表格加入表头
            $("#sohunewsrecord").append('<tr>' +'<th>id</th><th>title</th><th>author</th><th>publish_date</th></tr>');
            // 清空id为sohunewsrecord的表格
            $("#chinanewsrecord").empty();
            // 表格加入表头
            $("#chinanewsrecord").append('<tr>' +'<th>id</th><th>title</th><th>author</th><th>publish_date</th></tr>');
            // 表格添加值 list即新爬取的json文件
            for (let list of data) {
                if (list.source_name == "网易新闻") {
                    let table = '<tr><td>';
                    Object.values(list).forEach(element => {
                        if (element == list.title || element == list.author || element == list.publish_date) {
                            if (element == list.title) {
                                news163Item++;
                                table += (news163Item + '</td><td><a href="' + list.url + '">' + element + '</a>');
                                table += '</td><td>';
                            } else if (element == list.author ) {
                                table += (element.substring(0, element.lastIndexOf('_')) + '</td><td>');
                            } else if (element == list.publish_date) {
                                table += (element.substr(0, 10) + '</td>');
                            }
                        }
                    });
                    $("#record163").append (table + '</td></tr>');
                }

                if (list.source_name == "看看新闻网国际板块") {
                    let table = '<tr><td>';
                    Object.values(list).forEach(element => {
                        if (element == list.title || element == list.author || element == list.publish_date) {
                            if (element == list.title) {
                                kknewsItem++;
                                table += (kknewsItem + '</td><td><a href="' + list.url + '">' + element + '</a>');
                                table += '</td><td>';
                            } else if (element == list.author ) {
                                table += (element + '</td><td>');
                            } else if (element == list.publish_date) {
                                table += (element.substr(0, 10) + '</td>');
                            }
                        }
                    });
                    $("#kknewsrecord").append (table + '</td></tr>');
                }
            }

            let sohuNewsBlockHeight = document.querySelector('.block163').clientHeight;
            let chinaNewsBlockHeight = document.querySelector('.kknewsblock').clientHeight;
            let blockHeight = sohuNewsBlockHeight > chinaNewsBlockHeight ? sohuNewsBlockHeight + 370 + 'px': chinaNewsBlockHeight + 370 + 'px';

            document.querySelector('.sohunewsblock').style.top = blockHeight;
            document.querySelector('.chinanewsblock').style.top = blockHeight;
            for (let list of data) {
                if (list.source_name == "搜狐新闻") {
                    let table = '<tr><td>';
                    Object.values(list).forEach(element => {
                        if (element == list.title || element == list.author || element == list.publish_date) {
                            if (element == list.title) {
                                sohunewsItem++;
                                table += (sohunewsItem + '</td><td><a href="' + list.url + '">' + element + '</a>');
                                table += '</td><td>';
                            } else if (element == list.author ) {
                                table += (element + '</td><td>');
                            } else if (element == list.publish_date) {
                                table += (element.substr(0, 10) + '</td>');
                            }
                        }
                    });
                    $("#sohunewsrecord").append (table + '</td></tr>');
                }

                if (list.source_name == "中国新闻网") {
                    let table = '<tr><td>';
                    Object.values(list).forEach(element => {
                        if (element == list.title || element == list.author || element == list.publish_date) {
                            if (element == list.title) {
                                chinanewsItem++;
                                table += (chinanewsItem + '</td><td><a href="' + list.url + '">' + element + '</a>');
                                table += '</td><td>';
                            } else if (element == list.author ) {
                                table += (element + '</td><td>');
                            } else if (element == list.publish_date) {
                                table += (element.substr(0, 10) + '</td>');
                            }
                        }
                    });
                    $("#chinanewsrecord").append (table + '</td></tr>');
                }
            }
            });
        });
});