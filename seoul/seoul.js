let timeout;
let timer;
let minSetting;
let subwayMap;
let lineName;
let panZoom;
let solved = 0;
let inactive = (document.getElementById("slider").value ** 1.5 / 1000).toString();
const minSettingMax = 99;
const twoStations = ["신촌", "양평"];
const active = "1";
const inactiveCircle = "0.4";
const lineData = { // [맞힌 개수, 총 개수]
    "1호선": [0, 99],
    "2호선": [0, 51],
    "3호선": [0, 44],
    "4호선": [0, 51],
    "5호선": [0, 56],
    "6호선": [0, 39],
    "7호선": [0, 53],
    "8호선": [0, 18],
    "9호선": [0, 38],
    "경강선": [0, 11],
    "경의·중앙선": [0, 58],
    "경춘선": [0, 25],
    "공항철도": [0, 14],
    "김포골드라인": [0, 10],
    "서해선": [0, 21],
    "수인·분당선": [0, 63],
    "신림선": [0, 11],
    "신분당선": [0, 16],
    "에버라인": [0, 15],
    "우이신설선": [0, 13],
    "의정부경전철": [0, 15],
    "인천1호선": [0, 30],
    "인천2호선": [0, 27],
}

// lineData의 key를 array로 반환
const lineNames = Object.keys(lineData);

// local storage로부터 데이터 가져옴
highScore = localStorage.getItem("highScore")
if (highScore === null) {
    highScore = 0;
    localStorage.setItem("highScore", highScore);
} else {
    document.getElementById("highScore").innerHTML = localStorage.getItem("highScore");
}

minSetting = localStorage.getItem("minSetting");
if (minSetting === null) {
    minSetting = 90;
    localStorage.setItem("minSetting", minSetting);
} else {
    minSetting = parseInt(minSetting);
    document.getElementById("min").innerHTML = minSetting < 10 ? "0" + minSetting : minSetting;
}

// circleContainerRow 내 HTML 생성
let html = "";
lineNames.forEach(line => {
    html += `<div class="clickable-off" id="circle_${line}" onclick="selectLine(this.id);">`;
    html += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></div>`;
})
document.getElementById("circleContainerRow").innerHTML += html;

// circleContainerColumn 내 HTML 생성
html = `<table id="progress">`;
lineNames.forEach(line => {
    html += `<tr><td class="circleBox">`;
    html += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></td>`;
    html += `<td class="progressPercentage"><span id="percentage_${line}">0</span><span>%</span></td>`;
    html += `<td class="progressCnt"><span style="font-weight: bold;" id="cnt_${line}">0</span><span>/</span><span>${lineData[line][1]}</span></td></tr>`;
})
html += `</table>`;
document.getElementById("circleContainerColumn").innerHTML += html;

// svg가 화면을 꽉 채우도록 width 설정 (css에 정의된 main의 width와 같게 설정)
const mainWidth = document.getElementById("main").offsetWidth;
document.getElementById("map").setAttribute("width", mainWidth);

// svg-pan-zoom이 지도 넘어서 패닝하는 것 방지
let beforePan = function (oldPan, newPan) {
    let sizes = this.getSizes(),
        gutterWidth = document.getElementById("map").offsetWidth,
        gutterHeight = document.getElementById("map").offsetHeight,
        leftLimit = gutterWidth - (sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom,
        rightLimit = sizes.width - gutterWidth - sizes.viewBox.x * sizes.realZoom,
        topLimit = gutterHeight - (sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom,
        bottomLimit = sizes.height - gutterHeight - sizes.viewBox.y * sizes.realZoom,
        customPan = {};

    if (leftLimit < 0) {
        customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x))
    } else {
        customPan.x = Math.min(leftLimit, Math.max(rightLimit, newPan.x))
    }

    if (topLimit < 0) {
        customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y))
    } else {
        customPan.y = Math.min(topLimit, Math.max(bottomLimit, newPan.y))
    }
    return customPan
}

// 로딩이 완료되면 svg-pan-zoom initialization
window.onload = function () {
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
        beforePan: beforePan,
    });
    // 화면을 처음부터 채우고 싶을 때
    // panZoom.contain()
    // panZoom.setMinZoom(window.panZoom.getZoom())
};

// 창 크기 바뀔 때
window.addEventListener("resize", function () {
    const mainWidth = document.getElementById("main").offsetWidth;
    document.getElementById("map").setAttribute("width", mainWidth);
    panZoom.updateBBox();
    panZoom.resize();
    panZoom.center();

    // 모든 노선이 비활성화된 게 아니라면, node 확대 update
    const circles = document.getElementsByClassName("clickable-on");
    if (![...circles].every(data => data.style.opacity === inactiveCircle) && document.getElementById("check3").checked === true) {
        const node = subwayMap.getElementsByClassName("line " + lineName)[0];
        showNode(node);
    }
});

// 역 표시 체크박스 변경 시
document.getElementById("check1").addEventListener("change", function () {
    subwayMap = document.getElementById("map").contentDocument;
    if (this.checked) {
        subwayMap.getElementById("marks").style.display = "block";
    } else {
        subwayMap.getElementById("marks").style.display = "none";
    }
})

// 투명도 변경 시
document.getElementById("slider").addEventListener("input", function (event) {
    event.preventDefault();
    inactive = (event.target.value ** 1.5 / 1000).toString();
    subwayMap = document.getElementById("map").contentDocument;
    const lines = [...lineNames];
    try {
        // 현재 active한 호선 추출 (없다면 catch로 넘어감)
        lineName = [...document.getElementsByClassName("clickable-on")].filter((e) => e.style.opacity === active)[0].getAttribute("id").slice(7);

        // active하지 않은 호선의 투명도를 새로운 inactive로 변경
        lines.splice(lines.indexOf(lineName), 1);
        const notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
        notSelectedLines.forEach(line => batchSetOpacity(line, inactive));

        // 앞에서 환승역 투명도도 같이 바뀌므로 (notSelectedLines에 포함됨), 해당 호선을 다시 active로 변경
        const selectedLine = subwayMap.getElementsByClassName(lineName);
        batchSetOpacity(selectedLine, active);

        // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 새로운 inactive로 변경
        changeTransferOpacity();
    }
    catch (error) { }
})

// 제출 버튼 클릭 시
document.getElementById("answer").addEventListener("submit", function (event) {
    event.preventDefault();
    subwayMap = document.getElementById("map").contentDocument;
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
            const svgElement = subwayMap.getElementById(station);

            // 역명이 존재하고, svg에 해당 호선이 존재하는 경우
            if (svgElement != null && svgElement.classList.contains(line)) {
                const currentState = svgElement.getAttribute("visibility");
                if (currentState === "hidden") {
                    svgElement.setAttribute("visibility", "visible");
                    svgElement.style.opacity = active;
                    solved += 1;
                    document.getElementById("solved").innerHTML = solved;
                    showPopup("correct");

                    // 13:10 비율 이상인 경우에서만 보임
                    let linesArr = [];
                    try { // 환승역인 경우, 환승역이 지나는 모든 노선을 linesArr에 push해야 함
                        const transferStation = subwayMap.getElementById(station + "_환승");
                        for (const child of transferStation.children) {
                            const classList = [...child.classList];
                            if (classList.includes("fill")) { // fill을 뺸 나머지 class명을 linesArr에 push
                                classList.splice(classList.indexOf("fill"), 1);
                                linesArr.push(classList.pop());
                            }
                        }
                    }
                    catch (error) { // 환승역이 아니라면, line만 넣으면 됨
                        linesArr = [line];
                    }
                    linesArr.forEach(line => { // 해당 호선의 맞힌 개수와 퍼센트를 업데이트
                        lineData[line][0] += 1;
                        const solvedOnLine = lineData[line][0];
                        const totalQuestions = lineData[line][1];
                        document.getElementById("cnt_" + line).innerHTML = solvedOnLine;
                        document.getElementById("percentage_" + line).innerHTML = Math.round(solvedOnLine / totalQuestions * 100);
                    });

                    // 다 맞혔다면 게임 종료
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
            console.log(error);
        }
    }
    document.getElementById("station").value = "";  // 입력한 역명은 clear (호선은 유지)
})

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
    subwayMap = document.getElementById("map").contentDocument;
    const transfer = subwayMap.getElementsByClassName("transfer");
    [...transfer].forEach(station => {
        // 호선을 선택한 경우
        if (lineName != null) {
            // 해당 호선을 포함한다면
            if (station.getElementsByClassName(lineName).length > 0) {
                batchSetOpacity(station.children, active);
                if (document.getElementById("check2").checked === false) { // 환승역 타 노선 색 표시 버튼이 꺼져있다면
                    const filtered = [...station.children].filter((e) => (e.classList.contains("fill")) && !(e.classList.contains(lineName))); // 해당 호선을 제외한 나머지 호선들
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
    // beforePan이 panning을 못하게 방해하므로 잠시 비활성화
    panZoom.setBeforePan(null);

    // node의 bounding box를 구함
    const bbox = node.getBBox();

    // node가 가운데에 오도록 pan
    const { width, height, realZoom } = panZoom.getSizes();
    panZoom.pan({
        x: -realZoom * (bbox.x - width / (realZoom * 2) + bbox.width / 2),
        y: -realZoom * (bbox.y - height / (realZoom * 2) + bbox.height / 2)
    });

    // node에 focus하도록 zoom
    const relativeZoom = panZoom.getZoom();
    const desiredWidth = (bbox.width + 200) * realZoom; // 200px 여유공간
    const desiredHeight = (bbox.height + 200) * realZoom;
    panZoom.zoom(relativeZoom * Math.min((width / desiredWidth), (height / desiredHeight)));

    // beforePan 재활성화
    panZoom.setBeforePan(beforePan);
}

// 호선 선택 시
function selectLine(id) {
    subwayMap = document.getElementById("map").contentDocument;
    lineName = id.slice(7);
    const lines = [...lineNames];
    const opacity = document.getElementById(id).style.opacity;
    const circles = document.getElementsByClassName("clickable-on");

    // class가 clickable-on인지 확인
    if (document.getElementById(id).getAttribute("class") === "clickable-on") {
        if (opacity === active) {  // toggle off
            // 선택한 동그라미 비활성화
            document.getElementById(id).style.opacity = inactiveCircle;

            // 모든 호선이 비활성화되면 투명도 active로 초기화
            if ([...circles].every(data => data.style.opacity === inactiveCircle)) {
                lines.forEach(line => batchSetOpacity(subwayMap.getElementsByClassName(line), active));
                const transfer = subwayMap.getElementsByClassName("transfer");
                [...transfer].forEach(station => batchSetOpacity(station.children, active));
                lineName = null;
            }
        } else {  // toggle on
            // 선택한 동그라미 외 나머지 비활성화
            batchSetOpacity(circles, inactiveCircle);

            // 선택한 동그라미 활성화
            document.getElementById(id).style.opacity = active;

            // 선택한 호선의 투명도를 active로 변경
            const selectedLine = subwayMap.getElementsByClassName(lineName);
            batchSetOpacity(selectedLine, active);

            // 선택하지 않은 호선의 투명도를 inactive로 변경
            lines.splice(lines.indexOf(lineName), 1);
            const notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
            notSelectedLines.forEach(line => batchSetOpacity(line, inactive));

            // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 inactive로 변경
            changeTransferOpacity();

            // 노선 클릭 시 확대 버튼이 활성화되어 있다면, 그 노선만 확대해서 보여줌
            if (document.getElementById("check3").checked === true) {
                const node = subwayMap.getElementsByClassName("line " + lineName)[0];
                showNode(node);
            }
        }
    }
}

// 제한 시간 가감
function addTime(i) {
    let min = minSetting;
    if ((i === 1 && min < minSettingMax) || (i === -1 && min > 1)) {
        min += i
    }
    document.getElementById("min").innerText = min < 10 ? "0" + min : min;
    minSetting = min
    localStorage.setItem("minSetting", minSetting);
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
    for (const element of incorrect) {
        element.setAttribute("fill", "red");
        // element.setAttribute("font-weight", "bold");
        element.setAttribute("visibility", "visible");
    }

    // 모든 동그라미의 opacity를 inactiveCircle로 변경
    const circles = document.getElementsByClassName("clickable-on");
    batchSetOpacity(circles, inactiveCircle);

    // 모든 노선의 opacity를 active로 변경
    subwayMap = document.getElementById("map").contentDocument;
    const lines = [...lineNames];
    const totalLines = lines.map(x => subwayMap.getElementsByClassName(x))
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
    document.getElementById("markSelect1").style.display = "flex";

    // 최고기록 갱신
    highScore = Math.max(localStorage.getItem("highScore"), solved);
    document.getElementById("highScore").innerHTML = highScore
    localStorage.setItem("highScore", highScore);
}

// 타이머 리셋
function resetTimer() {
    document.getElementById("complete").style.display = "none";
    const previousCorrect = document.getElementById("map").contentDocument.querySelectorAll('[visibility="visible"]');
    for (const element of previousCorrect) {
        element.setAttribute("fill", "black");
        // element.setAttribute("font-weight", "bold");
        element.setAttribute("visibility", "hidden");
    }
    document.getElementById("min").innerText = minSetting < 10 ? "0" + minSetting : minSetting;
    document.getElementById("sec").innerText = "00";
    document.getElementById("solved").innerText = 0;
    solved = 0; // solved 변수 초기화
    panZoom.zoom(1); // 확대 비율 초기화

    document.getElementById("start").disabled = false;
    document.getElementById("start").classList = ["button-on"];
    document.getElementById("reset").disabled = true;
    document.getElementById("reset").classList = ["button-off"];
    document.getElementById("plus").style.display = "inline";
    document.getElementById("minus").style.display = "inline";
}