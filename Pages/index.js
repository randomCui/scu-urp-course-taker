let fs = require("fs");
let fetch = require("node-fetch");
let readline = require('readline-sync');
let http = require('http')
// let httpProxyAgent = require('http-proxy-agent')
// const stream = require("stream");

// let users = [
//     {id: 1, name: "John"},
//     {id: 2, name: "Pete"},
//     {id: 3, name: "Mary"}
// ];
//
// // 返回前两个用户的数组
// let someUsers = users.filter(item => item.id < 3);
//
// console.log(someUsers); // 2
//
// let arr = [12, 114514, 1919810]
// let value = arr.reduce(function (accumulator, item, index, array) {
//     // ..
// }, 893)


let jwc_entry_url = 'http://zhjw.scu.edu.cn/login'
let jwc_captcha_url = 'http://zhjw.scu.edu.cn/img/captcha.jpg'
let jwc_jc = "http://zhjw.scu.edu.cn/j_spring_security_check"

let http_head = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.163 Safari/535.1";

let agent = new http.Agent({keepAlive : true});

(async () => {
    let response = await fetch(jwc_entry_url,{
        headers:{
            'User-Agent': http_head,
        },
        // agent: new httpProxyAgent("http://localhost:8888"),
        agent,
    })

    if (!response.ok) {
        // 如果出现问题，进行处理
    }
// 正常程序逻辑

    let entry_cookie = parseJESSIONID(response.headers.get('set-cookie'))
    console.log(response.headers.get('set-cookie'))
    console.log(entry_cookie)
    console.log('JSESSIONID=' + entry_cookie.get('JSESSIONID'))

    let captcha_img_response = await fetch(jwc_captcha_url, {
        headers: {
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cookie': 'JSESSIONID=' + entry_cookie.get('JSESSIONID'),
            'User-Agent': http_head,
            'Host': 'zhjw.scu.edu.cn',
            'Referer': 'http://zhjw.scu.edu.cn/login',
        },
        // agent: new httpProxyAgent("http://localhost:8888"),
        agent,
    })


    let buffer = await captcha_img_response.buffer()

    let outputFilename = 'test.jpg'

    fs.writeFileSync(outputFilename,buffer,null)

    let post_data = {
        "j_username": '',
        "j_password": '',
        "j_captcha": '',
    }

    post_data['j_captcha'] = readline.question('captcha: ')
    console.log(post_data)

    let res_2 = await fetch(jwc_jc, {
        method: 'POST',
        headers: {
            // 'Accept-Encoding': 'gzip, deflate',
            // 'Accept-Language': 'zh-CN,zh;q=0.9',
            // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Cookie': 'JSESSIONID=' + entry_cookie.get('JSESSIONID'),
            // 'Host': 'zhjw.scu.edu.cn',
            // 'Referer': 'http://zhjw.scu.edu.cn/login',
            // 'Origin': 'http://zhjw.scu.edu.cn',
            'User-Agent': http_head,
            agent
            // "Content-Type":"application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(post_data),
        // agent: new httpProxyAgent("http://localhost:8888"),
        // credentials:'strict-origin-when-cross-origin'
    })

    let text = await res_2.text()

    console.log(text)
    console.log(new URLSearchParams(post_data).toString())
    console.log(res_2.url)
    // console.log(res_2.headers)
})();

function parseJESSIONID(cookie_str) {
    let cookie_list = []
    cookie_str.split(';').forEach(item => {
        cookie_list.push(item.split('='))
    })
    return new Map(cookie_list)
}