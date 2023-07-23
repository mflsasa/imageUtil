function timeString(date) {
    date = new Date(date)
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
}
function compare(prop, align) {
    return function (a, b) {
        const v1 = a[prop]
        const v2 = b[prop]
        if (align === 'positive') {
            //正序
            return v1 - v2
        } else if (align === 'inverted') {
            //倒序
            return v2 - v1
        }
    }
}
let zIndex = 2
class ImageUtil {
    categoryList = new Array(5).fill('').map((t, i) => { return { type: i, name: `分类${i}` } })
    categoryBoxName = 'category'
    imgList = new Array(20).fill('').map((t, i) => {
        return {
            imageId: i,
            type: i % 5,
            imageUrl: `img/${i + 1}.jpg`,
            name: `图片${i}`,
            time: new Date().getTime() + i * 1000
        }
    })
    imgListBoxName = 'card-box'
    activeType = 0
    moveInType = 0
    draggedNode = null
    lock = false
    constructor({ categoryList, categoryBoxName, imgListBoxName, imgList }) {
        this.categoryList = categoryList || this.categoryList
        this.categoryBoxName = categoryBoxName || this.categoryBoxName
        this.imgListBoxName = imgListBoxName || this.imgListBoxName
        this.imgList = imgList || this.imgList
    }
    init() {
        this.setCategory() // 创建分类栏
        this.imgList.sort(compare('time', 'inverted'))
        this.setImgList() // 创建图片列表
    }
    compareImgList(type = 'category') {
        const obj = {
            time: () => {
                this.lock = true
                this.setImgList('time')
            },
            category: () => {
                this.lock = false
                this.setImgList('category', this.activeType)
            }
        }
        if (obj[type]) {
            obj[type]()
        }
    }
    setCategory() {
        let categorydom = document.getElementsByClassName(this.categoryBoxName)
        if (categorydom.length === 0) {
            categorydom = document.createElement('div')
            const ul = document.createElement('ul')
            categorydom.classList.add(this.categoryBoxName)
            ul.classList.add('flex-box')
            categorydom.appendChild(ul)
            document.body.append(categorydom)
        } else {
            categorydom = categorydom[0]
            categorydom.innerHTML = '<ul class="flex-box"></ul>'
        }
        window.categorydom = categorydom
        const _this = this
        this.categoryList.forEach((item, i) => {
            const li = document.createElement('li')
            li.innerHTML = item.name
            li.setAttribute('type-id', item.type)
            this.activeType === i && li.classList.add('active')
            li.onclick = () => {
                if (this.activeType !== i) {
                    categorydom.children[0].children[i].classList.add('active')
                    categorydom.children[0].children[this.activeType].classList.remove('active') // 去除原来的
                    this.activeType = i
                    this.setImgList('category', i)
                }
            }
            li.onmouseenter = (e) => {
                _this.moveInType = i
                console.log(_this.draggedNode)
                if (_this.draggedNode && _this.draggedNode.typeId !== i && !_this.lock) {
                    _this.imgList.forEach(t => {
                        t.imageId === _this.draggedNode.imageId && (t.type = i)
                    })
                    console.log(_this.imgList)
                }
            }
            categorydom.children[0].append(li)
        })
    }
    setImgList(type = 'category', idx = 0) {
        const imgListdom = document.getElementsByClassName(this.imgListBoxName)[0]
        imgListdom.innerHTML = '<ul class="flex-box"></ul>'
        const typeObj = {}
        this.categoryList.forEach(t => typeObj[t.type] = t.name)
        const thisTypeImgList = type === 'category' ? this.imgList.filter(f => f.type === idx) : this.imgList
        thisTypeImgList.forEach(item => {
            const li = document.createElement('li')
            // li.draggable = true
            li.imageId = item.imageId
            li.typeId = item.type
            this.drag(li, imgListdom)
            li.innerHTML = `
                <img draggable="false" data-src="${item.imageUrl}" src="${item.imageUrl}">
                <div class="info">
                    <h1>名字：${item.name}</h1>
                    <h2>分类：${typeObj[item.type]}</h2>
                    <h3>时间：${timeString(item.time)}</h3>
                </div>
            `
            imgListdom.children[0].append(li)
        })
    }
    closer({ x3, y3 }, obj) {
        //碰撞检测
        let L1 = obj.offsetLeft
        let R1 = obj.offsetLeft + obj.offsetWidth
        let T1 = obj.offsetTop
        let B1 = obj.offsetTop + obj.offsetHeight
        console.log(x3, y3, L1, R1, T1, B1)
        if (L1 < x3 && R1 > x3 && T1 < y3 && B1 > y3) {
            return true
        } else {
            return false
        }
    }
    drag(obj, parent) {
        const _this = this
        obj.ontouchstart = obj.onmousedown = function (e) {
            _this.draggedNode = obj
            e = e || event;
            let x1 = e.type === 'touchstart' ? e.changedTouches[0].clientX : e.clientX
            let y1 = e.type === 'touchstart' ? e.changedTouches[0].clientY : e.clientY
            obj.style.zIndex = zIndex++
            obj.style.position = 'relative'
            let px = parent.offsetLeft
            let py = parent.offsetTop
            let disX = x1 - obj.offsetLeft - px
            const offsetLeft = obj.offsetLeft
            let disY = y1 - obj.offsetTop - py
            let offsetTop = obj.offsetTop
            document.ontouchmove = document.onmousemove = function (ev) {
                let x2 = ev.type === 'touchmove' ? ev.changedTouches[0].clientX : ev.clientX
                let y2 = ev.type === 'touchmove' ? ev.changedTouches[0].clientY : ev.clientY
                console.log(py, ev.type)
                obj.style.left = x2 - offsetLeft - disX - px + 'px'
                obj.style.top = y2 - offsetTop - disY - py + 'px'
            }
            document.ontouchend = document.onmouseup = function (ev) {
                document.onmousemove = document.onmouseup = document.ontouchend = null
                let x3 = ev.type === 'touchend' ? ev.changedTouches[0].clientX : ev.clientX
                let y3 = ev.type === 'touchend' ? ev.changedTouches[0].clientY : ev.clientY
                obj.style.left = 0
                obj.style.top = 0
                if (_this.lock) return
                if (isMobile) {
                    const list = Array.prototype.slice.call(categorydom.children[0].children)
                    for (let i = 0; i < list.length; i++) {
                        const iscloser = _this.closer({ x3, y3 }, list[i])
                        if (iscloser) {
                            _this.moveInType = i
                            if (_this.draggedNode && _this.draggedNode.typeId !== i) {
                                _this.imgList.forEach(t => {
                                    t.imageId === _this.draggedNode.imageId && (t.type = i)
                                })
                            }
                            break
                        }
                    }
                    console.log(list)
                }
                setTimeout(() => {
                    if (_this.moveInType !== _this.draggedNode.typeId) {
                        _this.draggedNode.remove()
                    }
                    _this.draggedNode = null
                }, 50)
            }
            return false;
        }
    }
}
