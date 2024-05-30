@js:

var util = objParse(String(java.get("util")))

(() => {
    let res = JSON.parse(result).body
    let content = res.content
    // 正文内部加入小说描述
    if (res.seriesNavData !== undefined && res.seriesNavData !== null && res.description !== "") {
        content = res.description + "\n" + "——————————\n".repeat(2) + content
    }
    // 获取 [uploadedimage:] 的图片链接
    let hasEmbeddedImages = res.textEmbeddedImages !== undefined && res.textEmbeddedImages !== null
    if (hasEmbeddedImages) {
        Object.keys(res.textEmbeddedImages).forEach((key) => {
            // 不再使用 linpx 服务加载图片
            // content = content.replace(`[uploadedimage:${key}]`, `<img src="https://linpxapi.linpicio.com/proxy/pximg?url=${res.textEmbeddedImages[key].urls.original}">`)
            content = content.replace(`[uploadedimage:${key}]`, `< img src="${res.textEmbeddedImages[key].urls.original}" >`)

        })
    }

    // // 获取 [pixivimage:] 的图片链接
    let rex = RegExp("(?<=\\[pixivimage:) ?(\\d+)(?=])");
    let matched = content.matchAll(rex)

    if (matched) {
    content = content.replace(`[pixivimage:${key}]`, `< img src="${util.urlArtworkOriginal(key)}" >`)
    }


    return content
})()
