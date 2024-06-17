var util = {}

function objStringify(obj) {
    return JSON.stringify(obj, (n, v) => {
        if (typeof v == "function")
            return v.toString();
        return v;
    });
}

function publicFunc() {
    let u = {}

    u.cacheGetAndSet = (key, supplyFunc) => {
        let v = cache.get(key)
        if (!v) {
            v = JSON.stringify(supplyFunc())
            // 缓存10分钟
            cache.put(key, v, 600)
        }
        return JSON.parse(v)
    }
    u.debugFunc = (func) => {
        if (String(source.getVariable()) === "debug") {
            func()
        }
    }

    u.debugLog = (msg) => {
        util.debugFunc(() => {
            java.log(`[debug] ${msg}`)
        })
    }

    u.urlNovelDetailed = (nid) => {
        return `https://www.pixiv.net/ajax/novel/${nid}`
    }
    u.urlSeries = (seriesId) => {
        return `https://www.pixiv.net/ajax/novel/series/${seriesId}?lang=zh`
    }
    u.urlSeriesNovels = (seriesId, limit, offset) => {
        if (limit > 30) {
            limit = 30
        }

        if (limit < 10) {
            limit = 10
        }

        return `https://www.pixiv.net/ajax/novel/series_content/${seriesId}?limit=${limit}&last_order=${offset}&order_by=asc&lang=zh`
    }

    u.formatNovels = function (novels) {
        novels.forEach(novel => {
            novel.detailedUrl = util.urlNovelDetailed(novel.id)
            const time = this.dateFormat(novel.updateDate);
            novel.tags = novel.tags.join(",")
            novel.coverUrl = urlCoverUrl(novel.url)
            novel.description += `\n更新时间:${time}`
        })
        return novels
    }

    u.dateFormat = function (str) {
        let addZero = function (num) {
            return num < 10 ? '0' + num : num;
        }

        let time = new Date(str);

        let Y = time.getFullYear() + "年";
        let M = addZero(time.getMonth() + 1) + "月";
        let D = addZero(time.getDate()) + "日";
        return Y + M + D;
    }


    util = u
    java.put("util", objStringify(u))
}

publicFunc()

// 获取请求的user id方便其他ajax请求构造

util.debugLog("获取响应，并解析用户id")
let uid = java.getResponse().headers().get("x-userid")
if (uid != null) {
    util.debugLog("写入缓存")
    cache.put("pixiv:uid", uid)
}
util.debugLog("返回响应体")
java.getStrResponse(null, null)