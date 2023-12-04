let timeout;
let timer;
let subwayMap;
let lineName;
let panZoom;
let solved = 0;
let minSetting = parseInt(document.getElementById("min").innerText);
let minSettingInitial = minSetting;
let inactive = (document.getElementById("slider").value ** 1.5 / 1000).toString();
let viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
let flg;
const twoStations = ["신촌", "양평"];
const active = "1";
const inactiveCircle = "0.4";
const lineData = {
    "1호선": 99,
    "2호선": 51,
    "3호선": 44,
    "4호선": 51,
    "5호선": 56,
    "6호선": 39,
    "7호선": 53,
    "8호선": 18,
    "9호선": 38,
    "경강선": 11,
    "경의·중앙선": 58,
    "경춘선": 25,
    "공항철도": 14,
    "김포골드라인": 10,
    "서해선": 21,
    "수인·분당선": 63,
    "신림선": 11,
    "신분당선": 16,
    "에버라인": 15,
    "우이신설선": 13,
    "의정부경전철": 15,
    "인천1호선": 30,
    "인천2호선": 27,
}

// turn the keys into an array
const lineNames = Object.keys(lineData);

// 화면 크기에 따라, circles의 배치를 조절
function setCircleContainer() {
    let html;
    if (window.matchMedia("(max-aspect-ratio: 13/10)").matches) {
        // 13:10 비율 미만이라면
        flg = false;
        html = "";
        document.getElementById("circleContainerColumn").style.width = "0px";
        document.getElementById("circleContainerColumn").style.marginLeft = "0px";
        lineNames.forEach(line => {
            html += `<div class="clickable-off" id="circle_${line}" onclick="selectLine(this.id);">`;
            html += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></div>`;
        })
        document.getElementById("circleContainerRow").innerHTML += html;
        document.getElementById("circleContainerColumn").innerHTML = "";
    } else {
        // 13:10 비율 이상이라면
        flg = true;
        html = `<table id="progress">`;
        lineNames.forEach(line => {
            html += `<tr><td class="clickable-off" id="circle_${line}" onclick="selectLine(this.id);">`;
            html += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></td>`;
            html += `<td class="progressPercentage"><span id="percentage_${line}">0</span><span>%</span></td>`;
            html += `<td class="progressCnt"><span style="font-weight: bold;" id="cnt_${line}">0</span><span>/</span><span>${lineData[line]}</span></td></tr>`;
        })
        html += `</table>`;
        document.getElementById("circleContainerColumn").innerHTML += html;
        document.getElementById("circleContainerRow").innerHTML = "";
    }
}

// add svg pan zoom module
window.onload = function () {
    setCircleContainer();
    // set svg width
    document.getElementById("map").setAttribute("width", viewportWidth * 0.95 - 300)

    // stop panning over the borders
    let beforePan;
    beforePan = function (oldPan, newPan) {
        let sizes = this.getSizes(),
            gutterWidth = (viewportWidth * 0.95 - 300),  // as defined in the css
            gutterHeight = (viewportHeight * 0.95 - 130), // as defined in the css
            // gutterWidth = sizes.viewBox.width,
            // gutterHeight = sizes.viewBox.height,
            leftLimit = gutterWidth - (sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom,
            rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom),
            topLimit = gutterHeight - (sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom,
            bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom)
        customPan = {};
        customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
        customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

        return customPan
    }
    // initialize svg pan zoom
    panZoom = svgPanZoom("#map", {
        panEnabled: true,
        zoomEnabled: true,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 1,
        maxZoom: 5,
        zoomScaleSensitivity: 0.2,
        // beforePan: beforePan, // under development
    });
};


// 창 크기 바뀔 때
window.addEventListener("resize", function () {
    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    document.getElementById("map").setAttribute("width", viewportWidth * 0.95 - 300)
    panZoom.updateBBox();
    panZoom.resize();
    panZoom.center();
});

// local storage로부터 최고기록 가져옴
localStorage.getItem("highScore") === null ? localStorage.setItem("highScore", 0) : document.getElementById("highScore").innerHTML = localStorage.getItem("highScore");

// 역 표시 체크박스 변경 시
document.getElementById("check1").addEventListener("change", function () {
    let subwayMap = document.getElementById("map").contentDocument;
    if (this.checked) {
        subwayMap.getElementById("marks").style.display = "block";
    } else {
        subwayMap.getElementById("marks").style.display = "none";
    }
})

// 환승역 타 노선 색 표시 버튼 변경 시
let check2 = true;
document.getElementById("check2").addEventListener("change", function () {
    check2 === true ? check2 = false : check2 = true;
    changeTransferOpacity();
})

// 노선 node focus 버튼 변경 시
let check3 = true;
document.getElementById("check3").addEventListener("change", function () {
    check3 === true ? check3 = false : check3 = true;
})

// 투명도 변경 시
document.getElementById("slider").addEventListener("input", function (event) {
    event.preventDefault();
    inactive = (event.target.value ** 1.5 / 1000).toString();
    const lines = [...lineNames];
    let subwayMap = document.getElementById("map").contentDocument;
    try {
        // 현재 active한 호선 추출 (없다면 catch로 넘어감)
        lineName = [...document.getElementsByClassName("clickable-on")].filter((e) => e.style.opacity === active)[0].getAttribute("id").slice(7);

        // active하지 않은 호선의 투명도를 새로운 inactive로 변경
        lines.splice(lines.indexOf(lineName), 1);
        let notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
        notSelectedLines.forEach(line => batchSetOpacity(line, inactive));

        // 앞에서 환승역 투명도도 같이 바뀌므로 (notSelectedLines에 포함됨), 해당 호선을 다시 active로 변경
        let selectedLine = subwayMap.getElementsByClassName(lineName);
        batchSetOpacity(selectedLine, active);

        // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 새로운 inactive로 변경
        changeTransferOpacity();
    }
    catch (error) { }
})

// 제출 버튼 클릭 시
document.getElementById("answer").addEventListener("submit", function (event) {
    event.preventDefault();
    let subwayMap = document.getElementById("map").contentDocument;
    let station = event.target["station"].value;
    let line;
    if (station != "") { // 빈 form이 아니라면
        try {
            // 호선을 선택한 경우 (선택 안 할 시 catch로 넘어감)
            line = [...document.getElementsByClassName("clickable-on")].filter((e) => e.style.opacity === active)[0].getAttribute("id").slice(7);
            if (station === "이수" || station === "총신대입구") { // 역 이름이 두 개인 경우
                station = "이수";
            }
            if (twoStations.includes(station)) { // 역명이 겹치는 경우
                station = station + "_" + line;
            }
            let svgElement = subwayMap.getElementById(station);

            // 역명이 존재하고, svg에 해당 호선이 존재하는 경우
            if (svgElement != null && svgElement.classList.contains(line)) {
                let currentState = svgElement.getAttribute("visibility");
                if (currentState === "hidden") {
                    svgElement.setAttribute("visibility", "visible");
                    svgElement.style.opacity = active;
                    solved += 1;
                    document.getElementById("solved").innerHTML = solved;
                    showPopup("correct");

                    if (flg) { // 13:10 비율 이상인 경우
                        let solvedOnLine = parseInt(document.getElementById("cnt_" + line).innerHTML) + 1;
                        let linesArr = [];
                        try { // 환승역인 경우, 환승역이 지나는 모든 노선을 linesArr에 push해야 함
                            let transferStation = subwayMap.getElementById(station + "_환승");
                            for (let child of transferStation.children) {
                                let classList = [...child.classList];
                                if (classList.includes("fill")) { // fill을 뺸 나머지 class명을 linesArr에 push
                                    classList.splice(classList.indexOf("fill"), 1);
                                    linesArr.push(classList.pop());
                                }
                            }
                        }
                        catch (e) { // 환승역이 아니라면, line만 넣으면 됨
                            linesArr = [line];
                        }
                        linesArr.forEach(line => {
                            document.getElementById("cnt_" + line).innerHTML = solvedOnLine;
                            document.getElementById("percentage_" + line).innerHTML = Math.round(solvedOnLine / lineData[line] * 100);
                        });
                    }

                    if (solved === document.getElementById("total").innerHTML) {
                        document.getElementById("complete").style.display = "block";
                        giveUp();
                    }
                } else {
                    showPopup("duplicate");
                }
            } else {
                showPopup("wrong");
            }
        } catch (error) {
            showPopup("warning");
        }

    }
    document.getElementById("station").value = "";  // 입력한 역명은 clear (호선은 유지)
})

// 제한 시간 가감
function addTime(i) {
    let m = minSetting;
    if ((i === 1 && m < minSettingInitial) || (i === -1 && m > 1)) {
        m += i
    }
    document.getElementById("min").innerText = m < 10 ? "0" + m : m;
    minSetting = m
}

// 팝업창 띄우기
function showPopup(e) {
    const item = document.getElementById(e);
    // 팝업이 2초 내에 두 번 이상 뜰 때 새로 팝업 뜨게 함
    const allPopups = document.getElementsByClassName("popup");
    clearTimeout(timeout);
    for (let i = 0; i < allPopups.length; i++) {
        allPopups[i].style.display = "none";
    }
    item.classList.remove("popup");  // reset animation
    void item.offsetWidth;  // trigger reflow
    item.classList.add("popup");  // start animation
    item.style.display = "inline-block";
    timeout = setTimeout(function () { item.style.display = "none"; }, 2000);
}

// HTMLCollection 내의 element에 대해 opacity를 value로 변경
function batchSetOpacity(elements, value) {
    [...elements].forEach(element => element.style.opacity = value);
}

// 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 inactive로 변경
function changeTransferOpacity() {
    let transfer = subwayMap.getElementsByClassName("transfer");
    [...transfer].forEach(station => {
        // 호선을 선택한 경우
        if (lineName != null) {
            // 해당 호선을 포함한다면
            if (station.getElementsByClassName(lineName).length > 0) {
                if (check2 === true) {
                    batchSetOpacity(station.children, active);
                } else {
                    let filtered = [...station.children].filter((e) => (e.classList.contains("fill")) && !(e.classList.contains(lineName))); // 해당 호선을 제외한 나머지 호선들
                    batchSetOpacity(filtered, inactive);
                }
            } else { // 해당 호선을 포함하지 않는다면
                batchSetOpacity(station.children, inactive);
            }
        } else { // 호선을 선택하지 않은 경우
            batchSetOpacity(station.children, active);
        }
    })
};

// 호선 선택 버튼 클릭 시 그 부분만 확대해서 보여줌
function showNode(node) {
    const bbox = node.getBBox();

    // pan so the node is at the center
    const { width, height, realZoom } = panZoom.getSizes()
    panZoom.pan({
        x: -realZoom * (bbox.x - width / (realZoom * 2) + bbox.width / 2),
        y: -realZoom * (bbox.y - height / (realZoom * 2) + bbox.height / 2)
    })

    // we want to zoom in to see just around the node
    const relativeZoom = panZoom.getZoom();

    const desiredWidth = bbox.width * realZoom + 200; // plus 200 for some space around the node
    const desiredHeight = bbox.height * realZoom + 200;
    panZoom.zoom(relativeZoom * Math.min((width / desiredWidth), (height / desiredHeight)));
}

// 호선 선택 시
function selectLine(id) {
    const lines = [...lineNames];
    subwayMap = document.getElementById("map").contentDocument;
    lineName = id.slice(7);
    let opacity = document.getElementById(id).style.opacity;
    let circles = document.getElementsByClassName("clickable-on");

    // class가 clickable-on인지 확인
    if (document.getElementById(id).getAttribute("class") === "clickable-on") {
        // toggle off
        if (opacity === active) {
            // 선택한 동그라미 비활성화
            document.getElementById(id).style.opacity = inactiveCircle;

            // 모든 호선이 비활성화되면 투명도 active로 초기화
            if ([...circles].every(data => data.style.opacity === inactiveCircle)) {
                lines.forEach(line => batchSetOpacity(subwayMap.getElementsByClassName(line), active));
                let transfer = subwayMap.getElementsByClassName("transfer");
                [...transfer].forEach(station => batchSetOpacity(station.children, active));
                lineName = null;
            }
        }
        // toggle on
        else {
            // 선택한 동그라미 외 나머지 비활성화
            batchSetOpacity(circles, inactiveCircle);

            // 선택한 동그라미 활성화
            document.getElementById(id).style.opacity = active;

            // 선택한 호선의 투명도를 active로 변경
            let selectedLine = subwayMap.getElementsByClassName(lineName);
            batchSetOpacity(selectedLine, active);

            // 선택하지 않은 호선의 투명도를 inactive로 변경
            lines.splice(lines.indexOf(lineName), 1);
            let notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
            notSelectedLines.forEach(line => batchSetOpacity(line, inactive));

            // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 inactive로 변경
            changeTransferOpacity();

            // 노선 클릭 시 확대 버튼이 활성화되어 있다면, 그 노선만 확대해서 보여줌
            if (check3) {
                let node = subwayMap.getElementsByClassName("line " + lineName)[0];
                showNode(node);
            }
        }
    }
}

// 타이머 시작
function startTimer() {
    let min = minSetting;
    let sec = 0;
    timer = setInterval(function () {
        if (min === 0 && sec === 0) {
            giveUp();
        } else {
            if (sec === 0) {
                min--;
                sec = 59;
            } else {
                sec--;
            }
            document.getElementById("min").innerText = min < 10 ? "0" + min : min;
            document.getElementById("sec").innerText = sec < 10 ? "0" + sec : sec;
        }
    }, 1000);

    [...document.getElementsByClassName("clickable-off")].forEach(data => data.classList = ["clickable-on"]);
    document.getElementById("check1").disabled = true;
    document.getElementById("start").disabled = true;
    document.getElementById("start").classList = ["button-off"];
    document.getElementById("give-up").disabled = false;
    document.getElementById("give-up").classList = ["button-on"];
    document.getElementById("reset").disabled = true;
    document.getElementById("reset").classList = ["button-off"];
    document.getElementById("submit").disabled = false;
    document.getElementById("submit").classList = ["button-on"];
    document.getElementById("plus").style.display = "none";
    document.getElementById("minus").style.display = "none";
    document.getElementById("station").disabled = false;
    document.getElementById("markSelect1").style.display = "none";
}

// 타이머 종료
function giveUp() {
    clearInterval(timer);
    document.getElementById("min").innerText = document.getElementById("min").innerText;  // 더 이상 변경 방지
    document.getElementById("sec").innerText = document.getElementById("sec").innerText;
    let incorrect = document.getElementById("map").contentDocument.querySelectorAll('[visibility="hidden"]');
    for (let i = 0; i < incorrect.length; i++) {
        incorrect[i].setAttribute("fill", "red");
        incorrect[i].setAttribute("font-weight", "bold");
        incorrect[i].setAttribute("visibility", "visible");
    }

    // 모든 동그라미의 opacity를 inactiveCircle로 변경
    let circles = document.getElementsByClassName("clickable-on");
    batchSetOpacity(circles, inactiveCircle);

    // 모든 노선의 opacity를 active로 변경
    const lines = [...lineNames];
    let subwayMap = document.getElementById("map").contentDocument;
    let totalLines = lines.map(x => subwayMap.getElementsByClassName(x))
    totalLines.forEach(line => batchSetOpacity(line, active));

    // 환승역들의 opacity를 active로 변경
    lineName = null; // lineName 변수 초기화
    changeTransferOpacity();

    [...document.getElementsByClassName("clickable-on")].forEach(data => data.classList = ["clickable-off"]);
    document.getElementById("check1").disabled = false;
    document.getElementById("give-up").disabled = true;
    document.getElementById("give-up").classList = ["button-off"];
    document.getElementById("reset").disabled = false;
    document.getElementById("reset").classList = ["button-on"];
    document.getElementById("submit").disabled = true;
    document.getElementById("submit").classList = ["button-off"];
    document.getElementById("station").disabled = true;

    // 최고기록 갱신
    highScore = Math.max(localStorage.getItem("highScore"), solved);
    document.getElementById("highScore").innerHTML = highScore
    localStorage.setItem("highScore", highScore);
}

// 타이머 리셋
function resetTimer() {
    document.getElementById("complete").style.display = "none";
    let previousCorrect = document.getElementById("map").contentDocument.querySelectorAll('[visibility="visible"]');
    for (let i = 0; i < previousCorrect.length; i++) {
        previousCorrect[i].setAttribute("fill", "black");
        previousCorrect[i].setAttribute("font-weight", "regular");
        previousCorrect[i].setAttribute("visibility", "hidden");
    }
    document.getElementById("min").innerText = minSetting < 10 ? "0" + minSetting : minSetting;
    document.getElementById("sec").innerText = "00";
    document.getElementById("solved").innerText = 0;
    solved = 0 // solved 변수 초기화

    document.getElementById("start").disabled = false;
    document.getElementById("start").classList = ["button-on"];
    document.getElementById("reset").disabled = true;
    document.getElementById("reset").classList = ["button-off"];
    document.getElementById("plus").style.display = "inline";
    document.getElementById("minus").style.display = "inline";
    document.getElementById("markSelect1").style.display = "flex";
}