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
const cdotMap = {
    "전대.에버랜드": "전대·에버랜드",
    "전대에버랜드": "전대·에버랜드",
    "4.19민주묘지": "4·19민주묘지",
    "419민주묘지": "4·19민주묘지",
    "시청.용인대": "시청·용인대",
    "시청용인대": "시청·용인대",
    "운동장.송담대": "운동장·송담대",
    "운동장송담대": "운동장·송담대"
};
const lineData = { // [맞힌 개수, 총 개수]
    "1호선": [0, 102],
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
};

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
    minSetting = Number(minSetting);
    document.getElementById("min").innerHTML = minSetting < 10 ? "0" + minSetting : minSetting;
}

// circleContainerRow 내 HTML 생성
let htmlRow = "";
lineNames.forEach(line => {
    htmlRow += `<div class="clickable-off" id="circle_${line}" onclick="selectLine(this.id);">`;
    htmlRow += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></div>`;
})
document.getElementById("circleContainerRow").innerHTML += htmlRow;

// circleContainerColumn 내 HTML 생성
let htmlColumn = ""
htmlColumn = `<table id="progress">`;
lineNames.forEach(line => {
    htmlColumn += `<tr><td class="circleBox">`;
    htmlColumn += `<object class="circle" data="circles/${line}.svg" type="image/svg+xml"></object></td>`;
    htmlColumn += `<td class="progressPercentage"><span id="percentage_${line}">0</span><span>%</span></td>`;
    htmlColumn += `<td class="progressCnt"><span style="font-weight: bold;" id="cnt_${line}">0</span><span>/</span><span>${lineData[line][1]}</span></td></tr>`;
})
htmlColumn += `</table>`;
document.getElementById("circleContainerColumn").innerHTML += htmlColumn;

// svg가 화면을 꽉 채우도록 width 설정 (css에 정의된 main의 width와 같게 설정)
const mainWidth = document.getElementById("main").offsetWidth;
document.getElementById("map").setAttribute("width", mainWidth);

// 지원되는 창 크기인지 체크
let checkResolution = function () {
    const wrapper = document.getElementById("wrapper");
    const unsupportedScreen = document.getElementById("unsupportedScreen");
    const isPortrait = window.matchMedia("(max-aspect-ratio: 6.5/10)").matches;
    const isLongLandscape = window.matchMedia("(min-aspect-ratio: 15/10) and (min-width: 1460px)").matches;
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if ((isPortrait && viewportWidth < 440) || (!isPortrait && (viewportWidth < 855 || viewportHeight < 750)) || (isLongLandscape && viewportHeight < 830)) {
        wrapper.style.display = "none";
        unsupportedScreen.style.display = "flex";
    } else {
        wrapper.style.display = "flex";
        unsupportedScreen.style.display = "none";
    }
}

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
        customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
    } else {
        customPan.x = Math.min(leftLimit, Math.max(rightLimit, newPan.x));
    }

    if (topLimit < 0) {
        customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));
    } else {
        customPan.y = Math.min(topLimit, Math.max(bottomLimit, newPan.y));
    }
    return customPan
}

// touch support using hammer.js
let eventsHandler = {
    haltEventListeners: ["touchstart", "touchend", "touchmove", "touchleave", "touchcancel"], init: function (options) {
        let instance = options.instance,
            initialScale = 1,
            pannedX = 0,
            pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = Hammer(options.svgElement, { inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput });

        // Enable pinch
        this.hammer.get("pinch").set({ enable: true });

        // Handle double tap
        this.hammer.on("doubletap", function (ev) { instance.zoomIn() });

        // Handle pan
        this.hammer.on("panstart panmove", function (ev) {
            // On pan start reset panned variables
            if (ev.type === "panstart") {
                pannedX = 0;
                pannedY = 0;
            };
            // Pan only the difference
            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
            pannedX = ev.deltaX;
            pannedY = ev.deltaY;
        });

        // Handle pinch
        this.hammer.on("pinchstart pinchmove", function (ev) {
            // On pinch start remember initial zoom
            if (ev.type === "pinchstart") {
                initialScale = instance.getZoom();
                instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
            }
            instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
        })

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener("touchmove", function (e) { e.preventDefault(); });
    }
    , destroy: function () {
        this.hammer.destroy();
    }
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
        customEventsHandler: eventsHandler
    });
    // 화면을 처음부터 채우고 싶을 때
    // panZoom.contain();
    // panZoom.setMinZoom(window.panZoom.getZoom());
    checkResolution();
};

// 창 크기 바뀔 때
window.addEventListener("resize", function () {
    checkResolution();
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
            if (cdotMap.hasOwnProperty(station)) { // cdot이 포함된 경우, 온점이나 공백 허용
                station = cdotMap[station];
            }
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
                    let linesSet = new Set(); // array가 아닌 set을 쓰는 이유는 지선 환승역 때문
                    try { // 환승역인 경우, 환승역이 지나는 모든 노선을 linesSet에 push해야 함
                        const transferStation = subwayMap.getElementById(station + "_환승");
                        for (const child of transferStation.children) {
                            const classList = [...child.classList];
                            if (classList.includes("fill")) { // fill을 뺸 나머지 class명을 linesSet에 push
                                classList.splice(classList.indexOf("fill"), 1);
                                linesSet.add(classList.pop());
                            }
                        }
                    }
                    catch (error) { // 환승역이 아니라면, line만 넣으면 됨
                        linesSet = new Set([line]);
                    }
                    linesSet.forEach(line => { // 해당 호선의 맞힌 개수와 퍼센트를 업데이트
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
    [...allPopups].forEach(item => item.style.display = "none");
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

            // 선택하지 않은 호선의 투명도를 inactive로 변경
            lines.splice(lines.indexOf(lineName), 1);
            const notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
            notSelectedLines.forEach(line => batchSetOpacity(line, inactive));

            // 선택한 호선의 투명도를 active로 변경
            const selectedLine = subwayMap.getElementsByClassName(lineName);
            batchSetOpacity(selectedLine, active);

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

// 제한시간 min 텍스트 기반 수정
function showInput() {
    document.getElementById("min").style.display = "none";
    document.getElementById("min-input").style.display = "inline-block";
    document.getElementById("min-input").value = document.getElementById("min").innerText;
    document.getElementById("min-input").focus();
}

function hideInput() {
    document.getElementById("min").style.display = "inline";
    document.getElementById("min-input").style.display = "none";
}

// 한 자리수 앞에 0 붙이기 
function leadingZeros(input) {
    if (!isNaN(input.value)) { // 숫자라면
        if (input.value.length > 2 && input.value[0] === "0") { // 0이 붙은 두 자리 수 이상의 수일 때 앞에 붙은 0 모두 제거
            input.value = Number(input.value);
        }
        if (input.value.length === 1 && input.value != "0") { // 0이 아닌 한 자리 수일 때 앞에 0 붙이기 (0을 제외하는 이유는 0X에서 X를 지우는 순간 00이 되기 때문)
            input.value = "0" + input.value;
        }
    }
}

// 엔터 키 입력 시 min 수정
document.getElementById("min-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        if (this.value != "" && !isNaN(this.value)) { // 숫자이고 공백이 아니면
            if (this.value > minSettingMax) { // 최댓값 초과 시 최댓값으로 설정
                this.value = minSettingMax;
            } else if (Number(this.value) < 1) { // 1 미만의 숫자일 떄 1로 설정
                this.value = "01";
            }
            document.getElementById("min").innerText = this.value
            minSetting = Number(this.value);
            localStorage.setItem("minSetting", minSetting);
        } else { // 숫자가 아니거나 공백이라면 이전 값으로 설정
            document.getElementById("min").innerText = minSetting;
        }
        hideInput();
    }
});

// 제한 시간 가감
function addTime(i) {
    let min = minSetting;
    if ((i === 1 && min < minSettingMax) || (i === -1 && min > 1)) {
        min += i;
    }
    document.getElementById("min").innerText = min < 10 ? "0" + min : min;
    minSetting = min;
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

    // lineData 초기화
    [...document.getElementsByClassName("progressPercentage")].forEach(element => element.firstChild.innerHTML = "0");
    [...document.getElementsByClassName("progressCnt")].forEach(element => element.firstChild.innerHTML = "0");
    for (const key in lineData) {
        lineData[key][0] = 0;
    }

    document.getElementById("start").disabled = false;
    document.getElementById("start").classList = ["button-on"];
    document.getElementById("reset").disabled = true;
    document.getElementById("reset").classList = ["button-off"];
    document.getElementById("plus").style.display = "inline";
    document.getElementById("minus").style.display = "inline";
}