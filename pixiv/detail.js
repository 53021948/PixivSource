@js:
var util = objParse(String(java.get("util")))

function objParse(obj) {
    return JSON.parse(obj, (n, v) => {
        if (typeof v == "string" && v.match("()")) {
            return eval(`(${v})`)
        }
        return v;
    })
}


(function (res) {
    let isHtml = res.startsWith("<!DOCTYPE html>")
    if (isHtml) {
        let matchResult = baseUrl.match(new RegExp("pixiv.net/novel"))
        if (matchResult == null) {
            return []
        }
        let id = baseUrl.match(new RegExp("\\d+"))[0]
        res = JSON.parse(java.ajax(util.urlNovelDetailed(id)))

    } else {
        res = JSON.parse(res)
        if (res.total === 0) {
            return []
        }
    }


    java.log(`详情信息:${result}`)
    res = JSON.parse(result)
    info = {}
    info.author = res.userName
    // info.name = res.title
    // info.tags = res.tags.tags
    info.wordCount = res.wordCount
    info.latestChapter = null
    info.desc = res.description
    info.coverUrl = res.coverUrl
    info.catalogUrl = util.urlNovelDetailed(res.id)

    // info.author = book.author
    // info.name = book.name
    // info.tags = book.kind
    // info.wordCount = book.wordCount
    // info.latestChapter = null
    // info.desc = book.intro
    // info.coverUrl = book.coverUrl
    // info.catalogUrl = util.urlNovelDetailed(res.id)

    if (res.series === undefined || res.series === null) {
        info.name = res.title
        info.catalog = util.urlNovelDetailed(res.id)
        res.tags.unshift('单本')
    } else {
        info.name = res.seriesNavData.title
        res.tags.unshift('长篇')
        info.catalog = util.urlSeries(res.seriesNavData.id)
            // `https://www.pixiv.net/ajax/novel/series/${res.seriesNavData.id}?lang=zh`
    }
    info['classes'] = res.tags.join(",")

    return info
})();