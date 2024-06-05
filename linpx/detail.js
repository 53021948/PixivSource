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
        let matchResult = baseUrl.match(new RegExp("pn|pixiv/novel"))
        if (matchResult == null) {
            return []
        }
        let id = baseUrl.match(new RegExp("\\d+"))[0]
        // if (baseUrl.includes("/cache")) {
        //     res = JSON.parse(java.ajax(`https://api.furrynovel.ink/pixiv/novel/${id}/cache`))
        //     // 不获取缓存系列
        //     res.series = null
        // } else {
        //     res = JSON.parse(java.ajax(`https://api.furrynovel.ink/pixiv/novel/${id}`))
        // }
        res = JSON.parse(java.ajax(`https://api.furrynovel.ink/pixiv/novel/${id}/cache`))
    } else {
        res = JSON.parse(res)
        if (res.total === 0) {
            return []
        }
    }

    let prop = {}
    //为了兼顾导入书架直接走详情页逻辑
    //这里不能直接用book.xxx 来复用搜索页处理结果
    prop.author = res.userName
    prop.count = book.wordCount
    prop.desc = res.desc
    prop.cover_url = util.urlCoverUrl(res.coverUrl)

    if (res.series === undefined || res.series === null) {
        prop.name = res.title
        // if (baseUrl.includes("/cache")) {
        //     prop.catalog = `https://api.furrynovel.ink/pixiv/novel/${res.id}/cache`
        // } else {
        //     prop.catalog = `https://api.furrynovel.ink/pixiv/novel/${res.id}`
        // }
        prop.catalog = `https://api.furrynovel.ink/pixiv/novel/${res.id}/cache`
        res.tags.unshift('单本')
    } else {
        prop.name = res.series.title
        res.tags.unshift('长篇')
        prop.catalog = `https://api.furrynovel.ink/pixiv/series/${res.series.id}/cache`
    }
    prop.classes = res.tags.join(",")
    return prop
})(result)
