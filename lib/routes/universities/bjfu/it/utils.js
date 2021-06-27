const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { isBlank } = require('@/utils/common-utils');
const { parseDate } = require('@/utils/parse-date'); // 转码

// 完整文章页
async function load(link) {
    const response = await got(link, {
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312'); // 转码

    // 加载文章内容
    const $ = cheerio.load(data);

    // 解析日期 只有年月日就别 timezone 了，一点意义都没有
    const pubDate = parseDate($('.template-head-info').text(), 'YYYY-MM-DD');

    $('#template *').each((_, child) => {
        const childElem = $(child);
        childElem.removeAttr('style');
        if (!isBlank(childElem.text()) && !childElem.has('img')) {
            childElem.remove();
        }
    });

    // http://a.bjfu.edu.cn/xinxi/xydt/338415.html
    const contentElem = $('.template-body, .template-tail').length ? $('.template-body, .template-tail') : $('#article');

    // 提取内容
    const description = contentElem
        .map((_, it) => $(it).html())
        .get()
        .join('');

    // 返回解析的结果
    return { description, pubDate };
}

const ProcessFeed = async (base, list, caches) =>
    // 使用 Promise.all() 进行 async 并发
    await Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), base).href; // 感谢@hoilc指导

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '北林信息',
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );
module.exports = {
    ProcessFeed,
};
