let timeout;
let timer;
let solved = 0;
let minSetting = parseInt(document.getElementById("min").innerText);
let minSettingInitial = minSetting;
const twoStations = ["신촌", "양평"];
const active = "1";
const inactiveCircle = "0.3";
let inactive = ((document.getElementById("slider").value) ** 1.5 / 1000).toString();

// 역 표시 체크박스 변경 시
document.getElementById("check").addEventListener("change", function () {
    let subwayMap = document.getElementById("map").contentDocument;
    if (this.checked) {
        subwayMap.getElementById("marks").style.display = "block";
    } else {
        subwayMap.getElementById("marks").style.display = "none";
    }

})

// 투명도 변경 시
document.getElementById("slider").addEventListener("input", function (event) {
    event.preventDefault();
    inactive = ((event.target.value) ** 1.5 / 1000).toString();
    const lines = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선", "경강선", "경의·중앙선", "경춘선", "공항철도", "김포골드라인", "서해선", "수인·분당선", "신림선", "신분당선", "에버라인", "우이신설선", "의정부경전철", "인천1호선", "인천2호선"]
    let subwayMap = document.getElementById("map").contentDocument;
    try {
        // 현재 active한 호선 추출 (없다면 catch로 넘어감)
        lineName = [...document.getElementsByClassName("clickable-on")].filter((e) => e.style.opacity === active)[0].getAttribute("id").slice(7);

        // active하지 않은 호선의 투명도를 새로운 inactive로 변경
        lines.splice(lines.indexOf(lineName), 1);
        let notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
        notSelectedLines.forEach(line => setOpacity(line, inactive));

        // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 새로운 inactive로 변경
        let transfer = subwayMap.getElementsByClassName("transfer");
        [...transfer].forEach(station => {
            station.style.opacity = station.getElementsByClassName(lineName).length > 0 ? active : inactive;
        });
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
        if (station === "이수" || station === "총신대입구") {
            station = "이수";
        }
        if (twoStations.includes(station)) {
            station = station + "_" + line;
        }
        let svgElement = subwayMap.getElementById(station);

        try {
            // 호선을 선택한 경우 (선택 안 할 시 catch로 넘어감)
            line = [...document.getElementsByClassName("clickable-on")].filter((e) => e.style.opacity === active)[0].getAttribute("id").slice(7);

            // 역명이 존재하고, svg에 해당 호선이 존재하는 경우
            if (svgElement != null && svgElement.classList.contains(line)) {
                let currentState = svgElement.getAttribute("visibility");
                if (currentState === "hidden") {
                    svgElement.setAttribute("visibility", "visible");
                    svgElement.style.opacity = active;
                    solved += 1;
                    document.getElementById("solved").innerHTML = solved;
                    showPopup("correct");
                    if (document.getElementById("solved").innerHTML === document.getElementById("total").innerHTML) {
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
function add(i) {
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
function setOpacity(elements, value) {
    [...elements].forEach(element => element.style.opacity = value);
}

// 호선 선택 시
function selectLine(id) {
    const lines = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선", "경강선", "경의·중앙선", "경춘선", "공항철도", "김포골드라인", "서해선", "수인·분당선", "신림선", "신분당선", "에버라인", "우이신설선", "의정부경전철", "인천1호선", "인천2호선"]
    let subwayMap = document.getElementById("map").contentDocument;
    let lineName = id.slice(7);
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
                lines.forEach(line => setOpacity(subwayMap.getElementsByClassName(line), active));
                setOpacity(subwayMap.getElementsByClassName("transfer"), active);
            }
        }
        // toggle on
        else {
            // 선택한 동그라미 외 나머지 비활성화
            setOpacity(circles, inactiveCircle);

            // 선택한 동그라미 활성화
            document.getElementById(id).style.opacity = active;

            // 선택한 호선의 투명도를 active로 변경
            let selectedLine = subwayMap.getElementsByClassName(lineName);
            setOpacity(selectedLine, active);

            // 선택하지 않은 호선의 투명도를 inactive로 변경
            lines.splice(lines.indexOf(lineName), 1);
            let notSelectedLines = lines.map(x => subwayMap.getElementsByClassName(x));
            notSelectedLines.forEach(line => setOpacity(line, inactive));

            // 환승역에 선택한 호선이 있다면 투명도를 active로 변경, 없다면 inactive로 변경
            let transfer = subwayMap.getElementsByClassName("transfer");
            [...transfer].forEach(station => {
                station.style.opacity = station.getElementsByClassName(lineName).length > 0 ? active : inactive;
            });
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
    document.getElementById("check").disabled = true;
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

    // 모든 동그라미의 opacity를 inactive로 변경
    let circles = document.getElementsByClassName("clickable-on");
    setOpacity(circles, inactive);

    // 모든 노선의 opacity를 active로 변경
    const lines = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선", "경강선", "경의·중앙선", "경춘선", "공항철도", "김포골드라인", "서해선", "수인·분당선", "신림선", "신분당선", "에버라인", "우이신설선", "의정부경전철", "인천1호선", "인천2호선"]
    let subwayMap = document.getElementById("map").contentDocument;
    let totalLines = lines.map(x => subwayMap.getElementsByClassName(x))
    totalLines.forEach(line => setOpacity(line, active));

    // 환승역들의 opacity를 active로 변경
    let transfer = subwayMap.getElementsByClassName("transfer");
    setOpacity(transfer, active);

    [...document.getElementsByClassName("clickable-on")].forEach(data => data.classList = ["clickable-off"]);
    document.getElementById("check").disabled = false;
    document.getElementById("give-up").disabled = true;
    document.getElementById("give-up").classList = ["button-off"];
    document.getElementById("reset").disabled = false;
    document.getElementById("reset").classList = ["button-on"];
    document.getElementById("submit").disabled = true;
    document.getElementById("submit").classList = ["button-off"];
    document.getElementById("station").disabled = true;
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
}