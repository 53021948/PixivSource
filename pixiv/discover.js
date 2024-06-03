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


// 存储seriesID 有BUG无法处理翻页
var seriesSet = new Set();

function urlCoverUrl(url) {
    return `${url},{"headers": {"Referer":"https://www.pixiv.net/"}}`
}

// 将多个长篇小说解析为一本书
function combineNovels(novels) {
    return novels.filter(novel => {
        //单本直接解析为一本书
        if (novel.seriesId === undefined || novel.seriesId === null) {
            return true
        }

        //集合中没有该系列解析为一本书
        if (!seriesSet.has(novel.seriesId)) {
            seriesSet.add(novel.seriesId)
            return true
        }

        return false
    })
}

function getAjaxJson(url) {
    return util.cacheGetAndSet(url, () => {
        return JSON.parse(java.ajax(url))
    })
}

function urlUserAllWorks(uid) {
    return `https://www.pixiv.net/ajax/user/${uid}/profile/all?lang=zh`
}

function handNovels(novels) {
    novels.forEach(novel => {
        if (novel.tags === undefined || novel.tags === null) {
            novel.tags = []
        }

        if (novel.seriesId === undefined || novel.seriesId === null) {
            novel.tags.unshift("单本")
        } else {
            let userAllWorks = getAjaxJson(urlUserAllWorks(novel.userId)).body
            for (let series of userAllWorks.novelSeries) {
                if (series.id === novel.seriesId) {
                    // let series = getAjaxJson(util.urlSeries(novel.seriesId)).body
                    novel.textCount = series.publishedTotalCharacterCount
                    novel.url = series.cover.urls["480mw"]
                    novel.title = series.title
                    novel.tags = series.tags
                    novel.description = series.caption

                    try{
                        // 发送请求获取第一章 获取标签与简介
                        if (novel.tags.length === 0 || novel.description === "") {
                            let firstNovel = getAjaxJson(util.urlNovelDetailed(series.firstNovelId)).body
                            if (novel.tags.length === 0) {
                                novel.tags = firstNovel.tags.tags.map(item => item.tag)
                            }

                            if (novel.description === "") {
                                novel.description = firstNovel.description
                            }
                        }
                        novel.tags.unshift("长篇")
                        break
                    } catch (e) {
                        java.log(e)
                    }
                }
            }
        }
    })
    return novels
}

function handlerFactory() {
    let cookie = String(java.getCookie("https://www.pixiv.net/", null))
    if (cookie === null || cookie === undefined || cookie === "") {
        return handlerNoLogin()
    }
    if (baseUrl.indexOf("/bookmark") !== -1) {
        return handlerBookMarks()
    }

    if (baseUrl.indexOf("/top") !== -1) {
        return handlerRecommend()
    }

    if (baseUrl.indexOf("/following") !== -1) {
        return handlerFollowing()
    }

    if (baseUrl.indexOf("/follow_latest") !== -1) {
        return handlerFollowLatest()
    }

    if (baseUrl.indexOf("/watch_list") !== -1) {
        return handlerWatchList()
    }
}

function handlerFollowing() {
    return () => {
        let novelList = []
        JSON.parse(result).body.users
            .filter(user => user.novels.length > 0)
            .map(user => user.novels)
            .forEach(novels => {
                return novels.forEach(novel => {
                    novelList.push(novel)
                })
            })
        return util.formatNovels(handNovels(novelList))
    }
}

function handlerRecommend() {
    return () => {
        let res = JSON.parse(result)
        const recommend = res.body.page.recommend
        const novels = res.body.thumbnails.novel
        let nidSet = new Set(recommend.ids)
        // java.log(nidSet.size)
        let list = novels.filter(novel => nidSet.has(String(novel.id)))
        // java.log(`过滤结果:${JSON.stringify(list)}`)
        return util.formatNovels(handNovels(combineNovels(list)))
    }
}

function handlerNoLogin() {
    return () => {
        java.longToast("此功能需要在书源登录后才能使用")
        return []
    }
}

function handlerBookMarks() {
    return () => {
        let resp = JSON.parse(result).body.works
        if (resp === undefined || resp.length === 0) {
            //流程无法本环节中止 只能交给下一流程处理
            return []
        }

        return util.formatNovels(handNovels(resp))
    }
}

function handlerFollowLatest() {
    return () => {
        let resp = JSON.parse(result)
        return util.formatNovels(handNovels(combineNovels(resp.body.thumbnails.novel)))
    }
}



function seriesHandler(seriesId) {
    const limit = 30
    let returnList = [];
    let allChaptersCount = (() => {
        let result = util.cacheGetAndSet(util.urlSeries(seriesId), () => {
            return JSON.parse(java.ajax(util.urlSeries(seriesId)))
        }).body.total
        util.debugFunc(() => {
            java.log(`本目录一共有:${result} 章节`);
        })
        return result;
    })();

    //发送请求获得相应数量的目录列表
    function sendAjaxForGetChapters(lastIndex) {
        let url = util.urlSeriesNovels(seriesId, limit, lastIndex)
        res = util.cacheGetAndSet(url, () => {
            return JSON.parse(java.ajax(url))
        })
        res = res.body.page.seriesContents
        res.forEach(v => {
            v.chapterUrl = util.urlNovelDetailed(v.id)
        })
        return res;
    }

    //逻辑控制者 也就是使用上面定义的两个函数来做对应功能
    //要爬取的总次数
    let max = (allChaptersCount / limit) + 1
    for (let i = 0; i < max; i++) {
        //java.log("i的值:"+i)
        let list = sendAjaxForGetChapters(i * limit);
        //取出每个值
        returnList = returnList.concat(list)
        java.log(returnList)
    }
    return returnList
}


// 关注列表
function handlerWatchList(){
    return () => {
        let resp = JSON.parse(result)
        java.log(resp.body.thumbnails.novelSeries)
        return util.formatNovels(seriesHandler(resp.body.thumbnails.novelSeries[0]))
    }
}


(() => {
    return handlerFactory()()
})()