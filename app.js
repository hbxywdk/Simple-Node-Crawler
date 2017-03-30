var http = require("http");
var fs = require('fs');
var cheerio = require("cheerio");
var request =  require("request");

const setting = {
	'domain': 'http://www.w3cplus.com',
	'link':'/canvas/drawing-regular-polygons.html'
}
function getPageNum(link) {
    var html = ""
    http.get(setting.domain + link, function (res) {
    	res.setEncoding('utf-8'); //防止中文乱码
        res.on('data', function (data) {
            html += data;
        });
        res.on('end', function () {
            var $ = cheerio.load(html);
            var pageTitle = $('#page-title.title').text().trim();

            console.log('文章标题：' + pageTitle);
            // 储存
            saveContent($, pageTitle);
            // 找上一篇文章
            var prevLink =$('.prev').next().attr('href');

            console.log('上一篇地址：' + prevLink)
            // 有上一篇文章
            // 
            if ( !!prevLink ) {
            	//三秒后继续
            	setTimeout(() => {
            		getPageNum(prevLink)
            	},5000)
            }else{
            	console.log('木有了');
            }
          
        });
    }).on('error', function (e) {
    	console.log('出了点错误:'+ e);
    })
}
// 储存文章内容
function saveContent($, pageTitle) {
	console.log('开始写入' + pageTitle)
	// 创建文件夹 路径 读写权限 cb
	fs.mkdir('./data/'+ pageTitle, 0777, function(err){
		if(err){
			console.log('文件夹创建错误:' + err)
		}else{
			// 储存文字
			$('.field-items p').each(function(i, item){
				// 每一段的文字 换行
				var text = $(this).text().trim() + '\r\n';
				// console.log('写入：./data/'+pageTitle+'/'+pageTitle+'.txt中');
		        fs.appendFile('./data/' + pageTitle + '/' + pageTitle + '.txt', text, 'utf-8', function (err) {
		            if (err) {
		                console.log(err);
		            }
		        });
			})
			// 储存图片
			$('.field-items p img').each(function(i, item){
				// console.log(i)
				// 当前图片的src
				var imgSrc = setting.domain + $(this).attr('src');
				// console.log(imgSrc)
				// 扩展名正则
				var r = /\.[a-zA-Z]+$/;
				// 找到当前图片的扩展名
				var thisPicType = imgSrc.match(r)[0];
				// 每张图片的名字
				var imgName = pageTitle + i + thisPicType;
				// console.log(imgName)

				// request模块 请求图片地址
		        request.head(imgSrc, function(err,res,body){
		            if(err){
		                console.log(' 图片请求错误 '+err);
		            }else{
						request(imgSrc)
						.pipe(
							// 创建流
							fs.createWriteStream('./data/' + pageTitle + '/' + imgName)
						); 
		            }
				});

			})
		}
	})

}

getPageNum(setting.link)


