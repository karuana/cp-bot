var _ = require('lodash');
var TelegramBot = require('node-telegram-bot-api');
var jenkinsapi = require('jenkins-api');

var token = '261687433:AAHAw6oxfcWN958jaE3pzfyiHSiBvGQ5ql8';
var jenkins = jenkinsapi.init("http://192.168.1.69:8080", {timeout:10});
// Setup polling way
var bot = new TelegramBot(token, {polling: true});
var http = require('http');
var url = require('url');
var lastBuildRequestChatting = null;

//http://192.168.1.69:8080/job/UnityControlPoint/472/console
// Matches /echo [whatever]

http.createServer(function (req, res) {


    var result =  url.parse(req.url,true).query;
    result = (_.isNull(result) || _.isUndefined(result['result'])) ? false: (result['result'] === "true");
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Hello nodejs');

    if(!_.isNull(lastBuildRequestChatting)) {
        var message = result ? "빌드가 완료되었어요!!": "빌드가 실패하였어요ㅜㅠ";
        bot.sendMessage(lastBuildRequestChatting, message);
        lastBuildRequestChatting = null;
    }
    res.end();
}).listen(8888);

bot.onText(/\/echo (.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/build/, function (msg, match) {
    var chatId = msg.chat.id;
    lastBuildRequestChatting = chatId;

    jenkins.build('UnityControlPoint', function(err, data) {
        if (err){
            bot.sendMessage(chatId, "빌드 요청에 실패 했어요..");
        } else {
            bot.sendMessage(chatId, "빌드를 정상적으로 요청하였습니다.");
        }
    });

});

bot.onText(/\/apk/, function (msg, match) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "http://cp.visualcube.co.kr:8085/");
});

bot.onText(/\/help/, function (msg, match) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "/build Control Point 빌드 시작 \n/apk APK 링크 반환 \n");
});

