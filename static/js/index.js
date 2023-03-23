class Carousel {
    #el;
    #interval = 6000;
    #intervalObj = null;
    #images = [];
    #imagesIndex = 0;
    #imageEl;
    #liList = [];
    constructor(el, images, interval = 6000) {
        if (!(el instanceof Element)) {
            return;
        }
        if (!(images instanceof Array) || images.length <= 0) {
            //
            return;
        }
        var img = document.createElement("img");
        img.src = images[0];
        img.class = "image";

        var btnPrevious = this.#buildAElement("previous", "&lt;", () => { this.#previous() });
        var btnNext = this.#buildAElement("next", "&gt;", () => { this.#next() });

        var ul = document.createElement("ul");
        ul.classList.add("flex-row");
        ul.classList.add("absolute-center");
        images.forEach((_, index) => {
            let li = document.createElement("li");
            li.setAttribute("data-index", index);
            ul.append(li);
            li.onclick = (obj) => {
                this.#jump(parseInt(obj.target.getAttribute("data-index")));
            }
            if (index === 0) {
                li.classList.add("active");
            }
            this.#liList.push(li);
        });

        el.append(img);
        el.append(btnPrevious);
        el.append(btnNext);
        el.append(ul);

        this.#images = images
        this.#el = el;
        this.#imageEl = img;
        this.#interval = interval;
        this.#el.onmouseover = () => {
            this.stop();
        }
        this.#el.onmouseout = () => {
            this.start();
        }
    }


    #buildAElement(className, content, onclick) {
        var btnNext = document.createElement("a");
        btnNext.href = "javascript:void(0)";
        btnNext.className = className;
        btnNext.innerHTML = content;
        btnNext.classList.add("absolute-middle");
        btnNext.onclick = onclick;
        return btnNext;
    }

    #previous() {
        if (this.#imagesIndex <= 0) {
            this.#imagesIndex = this.#images.length - 1;
        } else {
            this.#imagesIndex--;
        }
        this.#jump(this.#imagesIndex);
    }
    #next() {
        if (this.#imagesIndex >= this.#images.length - 1) {
            this.#imagesIndex = 0;
        } else {
            this.#imagesIndex++;
        }
        this.#jump(this.#imagesIndex);
    }

    #jump(index) {
        this.#imageEl.src = this.#images[index];
        this.#liList.forEach((element, i) => {
            if (i === index) {
                element.classList.add("active");
            } else {
                element.classList.remove("active");
            }
        })
    }

    start() {
        if (this.#intervalObj === null) {
            this.#intervalObj = setInterval(() => {
                this.#next();
            }, this.#interval);
        }
    }

    stop() {
        if (this.#intervalObj) {
            clearInterval(this.#intervalObj);
            this.#intervalObj = null;
        }
    }

}

const navUl = document.querySelectorAll(".main-top .main-top-nav ul")[0];
const navUlLis = document.querySelectorAll(".main-top .main-top-nav ul li");

window.onload = () => {
    const carousel = new Carousel(document.getElementsByClassName("carousel")[0], ["./static/images/1.avif", "./static/images/2.avif", "./static/images/3.avif", "./static/images/4.avif", "./static/images/5.avif"]);
    carousel.start();

    navUl.onclick = (e) => {
        let li = null;
        if (e.target.nodeName === "A") {
            li = e.target.parentNode;
        } else if (e.target.nodeName === "LI") {
            li = e.target;
        }
        if (li !== null) {
            navUlLis.forEach(element => {
                if (element === li) {
                    element.classList.add("active");
                } else {
                    element.classList.remove("active");
                }
            })
        }
    }

    simpleGetJson("https://edu.telking.com/api/?type=month")
        .then(function (json) {
            showLineChart(json.data);
        }, function (error) {
            console.error('请求出错了', error);
        });

    simpleGetJson("https://edu.telking.com/api/?type=week")
        .then(function (json) {
            showPieChart(json.data);
            showBarChart(json.data);
        }, function (error) {
            console.error('请求出错了', error);
        });
}

window.onresize = () => {
    if (lineChart)
        lineChart.resize();
    if (barChart)
        barChart.resize();
    if (pieChart)
        pieChart.resize();

}

let lineChart, barChart, pieChart;
function showLineChart(data) {
    lineChart = echarts.init(document.getElementsByClassName('line-chart')[0]);
    let option = {
        title: {
            text: '曲线图数据展示',
            x: 'center',
            textStyle: {
                color: '#202124'
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#E72431'
                }
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: ['20%', '20%'],
                data: data.xAxis,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: '{value} 元'
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            }
        ],
        series: [
            {
                name: '销售单量',
                type: 'line',
                smooth: true,
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                itemStyle: {
                    color: '#E72431'
                },
                lineStyle: {
                    color: '#E72431',
                },
                data: data.series
            }
        ]
    };
    lineChart.setOption(option);
}

function showPieChart(data) {
    pieChart = echarts.init(document.getElementsByClassName('pie-chart')[0]);
    let option = {
        title: {
            text: '饼状图数据展示',
            x: 'center',
            textStyle: {
                fontWeight: 'normal',
                color: '#202124'
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [
            {
                name: '销售单量占比',
                type: 'pie',
                center: ['50%', '50%'],
                data: parseToPieChartData(data)
            }
        ]
    };

    pieChart.setOption(option);
}

function parseToPieChartData(data) {
    const newData = [];
    for (var i = 0; i < data.series.length; i++) {
        newData.push({ value: data.series[i], name: parseToChineseWeek(data.xAxis[i]) });
    }
    return newData;
}

function parseToChineseWeek(str) {
    switch (str) {
        case "Mon": return "星期一";
        case "Tue": return "星期二";
        case "Wed": return "星期三";
        case "Thu": return "星期四";
        case "Fri": return "星期五";
        case "Sat": return "星期六";
        case "Sun": return "星期天";
        default: return "未知日期";
    }
}

function showBarChart(data) {
    barChart = echarts.init(document.getElementsByClassName('bar-chart')[0]);
    let option = {
        title: {
            text: '柱状图数据展示',
            x: 'center',
            textStyle: {
                fontWeight: 'normal',
                color: '#202124'
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.xAxis.map(t=>parseToChineseWeek(t)),
                axisTick: {
                    alignWithLabel: true
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: '{value} 元'
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            }
        ],
        series: [
            {
                name: '销售单量',
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: '#E72431'
                },
                data: data.series
            }
        ]
    };

    barChart.setOption(option);
}

function simpleGetJson(url) {
    const promise = new Promise(function (resolve, reject) {
        const handler = function () {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status === 200) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText));
            }
        };
        const client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();
    });

    return promise;
};