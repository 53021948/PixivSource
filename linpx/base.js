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

    u.cacheGetAndSet = function (key, supplyFunc) {
        let v = cache.get(key)
        if (v === undefined || v === null) {
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

    u.urlNovelUrl = function (id){
        return `https://api.furrynovel.ink/pixiv/novel/${id}/cache`
    }
    u.urlSeriesUrl = function (id){
        return `https://api.furrynovel.ink/pixiv/series/${id}/cache`
    }
    u.urlUserUrl = function (id) {
        return `https://api.furrynovel.ink/pixiv/user/${id}/cache`
    }
    u.urlSearchUsers = function (username) {
        return `https://api.furrynovel.ink/pixiv/search/user/${username}/cache`
    }
    u.urlSearchNovel = function (novelname) {
        return `https://api.furrynovel.ink/pixiv/search/novel/${novelname}/cache`
    }
    u.urlUserDetailed = function (uidList) {
        return `https://api.furrynovel.ink/pixiv/users/cache?${uidList.map(v => "ids[]=" + v).join("&")}`
    }
    u.urlNovelsDetailed = function (nidList) {
        return `https://api.furrynovel.ink/pixiv/novels/cache?${nidList.map(v => "ids[]=" + v).join("&")}`
    }
    // u.urlIllustDetailed = function (nidList) {
    //     return `https://api.furrynovel.ink/pixiv/illusts/${nidList.map(v => "ids[]=" + v).join("&")}`
    // }
    u.urlCoverUrl = function (pxImgUrl) {
        return `https://pximg.furrynovel.ink/?url=${pxImgUrl}`
    }
    u.urlIllustOriginalUrl = function (illustId) {
        // 使用 pixiv.cat 获取插图
        // return `https://pixiv.cat/${illustId}.png`  // 已墙不可用
        return `https://pixiv.re/${illustId}.png`
        // return `https://pixiv.nl/${illustId}.png`
    }

    util = u
    java.put("util", objStringify(u))
}

publicFunc()

// 获取请求的user id方便其他ajax请求构造
let uid = java.getResponse().headers().get("x-userid")
if (uid != null) {
    cache.put("pixiv:uid", uid)
}
java.getStrResponse(null, null)