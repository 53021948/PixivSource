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

(() => {
    let res = JSON.parse(result).body
    let content = res.content
    // 在正文内部添加小说描述
    if (res.seriesNavData !== undefined && res.seriesNavData !== null && res.description !== "") {
        content = res.description + "\n" + "——————————\n".repeat(2) + content
    }

    // 获取 [uploadedimage:] 的图片链接
    let hasEmbeddedImages = res.textEmbeddedImages !== undefined && res.textEmbeddedImages !== null
    if (hasEmbeddedImages) {
        Object.keys(res.textEmbeddedImages).forEach((key) => {
            // 不再使用 linpx 服务加载图片
            // content = content.replace(`[uploadedimage:${key}]`, `<img src="https://api.furrynovel.ink/proxy/pximg?url=${res.textEmbeddedImages[key].urls.original}">`)
            content = content.replace(`[uploadedimage:${key}]`, `<img src="${res.textEmbeddedImages[key].urls.original}">`)

        })
    }

    // // 获取 [pixivimage:] 的图片链接
    let rex = /\[pixivimage:(\d+)]/gm
    let matched = content.match(RegExp(rex))
    if (matched) {
        for (let i in matched) {
            let illustId = matched[i].match(RegExp("\\d+"))
            let res2 = JSON.parse(java.ajax(util.urlIllustDetailed(illustId))).body
            let illustOriginal = res2.urls.original
            content = content.replace(`${matched[i]}`, `<img src="${illustOriginal}">`)
        }
    }


    // 替换 Pixiv 分页符标记符号 `[newpage]`
    content = content.replace(`[newpage]`, `<div style="page-break-after:always"></div>`)

    // 替换 Pixiv 章节标记符号 `[chapter:]`
    rex = /\[chapter:(.*)]/gm
    matched = content.match(RegExp(rex))
    if (matched) {
        for (let i in matched) {
            let chapter = matched[i].replace("[chapter:", "").replace("]", "").trim()
            if (("第".includes(chapter))||("章".includes(chapter))){
                // chapter = `${chapter}`
            }
            else {
                chapter = `第${Number(i)+1}节 ${chapter}`
            }
            content = content.replace(`${matched[i]}`, `${"<p>​<p/>".repeat(3)}${chapter}<p>​<p/>`)
        }
    }


    // 替换 Pixiv 其他标记符号 `[jump: > ]]`
    // content = content.replace(`[[jumpuri: > ]]`, `<a href="https://www.w3school.com.cn">访问 w3school.com.cn!</a>`)


    return content
})()
