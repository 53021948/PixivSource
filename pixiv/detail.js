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
    let isHtml = result.startsWith("<!DOCTYPE html>")
    java.log(isHtml)
    if (isHtml) {
        let matchResult = baseUrl.match(new RegExp("pixiv.net/novel"))
        if (matchResult == null) {
            return []
        }
        let id = baseUrl.match(new RegExp("\\d+"))[0]
        java.log(id)
        res = JSON.parse(java.ajax(util.urlNovelDetailed(id)))["body"]
        return res
    } else {
        res = JSON.parse(res)
        if (res.total === 0) {
            return []
        }
    }

    let info = {}
    info.author = res.userName
    info.name = res.title
    // info.tags = res.tags.tags
    info.wordCount = res.wordCount
    info.latestChapter = null
    info.desc = res.description
    info.coverUrl = res.coverUrl
    info.catalogUrl = util.urlNovelDetailed(res.body.id)

    if (res.seriesNavData === undefined || res.seriesNavData === null) {
        info.name = res.title
        info.catalog = util.urlNovelDetailed(res.id)
        res.tags.unshift('单本')
    } else {
        info.name = res.seriesNavData.title
        res.tags.unshift('长篇')
        info.catalog = util.urlSeries(res.seriesNavData.id)
    }
    // info['classes'] = res.tags.join(",")

    return info
})();