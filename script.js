let solved = 0;
let timeout;
let timer;
let min, sec;
const twoStations = ["동래", "부전", "좌천"];

document.getElementById("answer").addEventListener("submit", function (event) {
    event.preventDefault();
    let line = event.target["line"].value;
    let station = event.target["station"].value;
    if (station != "") { // 빈 form이 아니라면
        if (station === "경성대부경대" || station === "경성대.부경대") {
            station = "경성대·부경대";
        } else if (station === "국제금융센터부산은행" || station === "국제금융센터.부산은행") {
            station = "국제금융센터·부산은행";
        }
        if (line === "동해선" && twoStations.includes(station)) {
            station = station + "_동해선";
        }
        let svgElement = document.getElementById("map").contentDocument.getElementById(station);
        // 역명이 존재하고, svg에 해당 호선이 존재하는 경우
        if (svgElement != null && svgElement.classList.contains(line)) {
            let currentState = svgElement.getAttribute("visibility");
            if (currentState === "hidden") {
                svgElement.setAttribute("visibility", "visible");
                solved += 1;
                document.getElementById("solved").innerHTML = solved;
                showPopup("correct");
                if (document.getElementById("solved").innerHTML === document.getElementById("total").innerHTML) {
                    document.getElementById("complete").style.display = "block";
                    switchButtons(false);
                }
            } else {
                showPopup("duplicate");
            }
        } else {
            showPopup("wrong");
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
    item.classList.remove('popup');  // reset animation
    void item.offsetWidth;  // trigger reflow
    item.classList.add('popup');  // start animation
    item.style.display = "inline-block";
    timeout = setTimeout(function () { item.style.display = "none"; }, 2000);
}

// 호선 선택 시 init option 제거
function optionCheck(e) {
    if (e != "") {
        document.getElementById("line").style.boxShadow = "inset 1px 1px 2px #BABECC, inset -1px -1px 2px #FFFFFF";
        try {
            document.getElementById("default-option").outerHTML = "";
        } catch (e) {
            // pass
        }
    }
}

// 시작 <-> 포기 시 버튼 활성화/비활성화
function switchButtons(param) {
    if (param === true) { // 시작을 눌렀을 때
        document.getElementById("start").disabled = false;
        document.getElementById("start").classList = ["button-on"];
        document.getElementById("give-up").disabled = true;
        document.getElementById("give-up").classList = ["button-off"];
        document.getElementById("submit").disabled = true;
        document.getElementById("submit").classList = ["button-off"];
        document.getElementById("line").disabled = true;
        document.getElementById("station").disabled = true;
    } else if (param === false) { // 포기를 눌렀거나 종료될 때
        document.getElementById("start").disabled = true;
        document.getElementById("start").classList = ["button-off"];
        document.getElementById("give-up").disabled = false;
        document.getElementById("give-up").classList = ["button-on"];
        document.getElementById("submit").disabled = false;
        document.getElementById("submit").classList = ["button-on"];
        document.getElementById("line").disabled = false;
        document.getElementById("station").disabled = false;
    }
}

// 타이머 시작
function startTimer() {
    document.getElementById("solved").innerHTML = 0;  // solved 변수 초기화
    let previousCorrect = document.getElementById("map").contentDocument.querySelectorAll('[visibility="visible"]');
    for (let i = 0; i < previousCorrect.length; i++) {
        previousCorrect[i].setAttribute("fill", "black");
        previousCorrect[i].setAttribute("font-weight", "regular");
        previousCorrect[i].setAttribute("visibility", "hidden");
    }
    min = 10;
    sec = 0;
    timer = setInterval(function() {
        if (min === 0 && sec === 0) {
            clearTimer(timer, "시간 초과");
        } else {
            if (sec === 0) {
                min--;
                sec = 59;
            } else {
                sec--;
            }
            let minT = min < 10 ? "0" + min : min;
            let secT = sec < 10 ? "0" + sec : sec;
            document.getElementById("display").innerText = minT + " : " + secT;
        }
    }, 1000);
    switchButtons(false);
}

// 타이머 종료
function clearTimer(t, text) {
    clearInterval(t);
    document.getElementById("display").innerText = text;
    let incorrect = document.getElementById("map").contentDocument.querySelectorAll('[visibility="hidden"]');
    for (let i = 0; i < incorrect.length; i++) {
        incorrect[i].setAttribute("fill", "red");
        incorrect[i].setAttribute("font-weight", "bold");
        incorrect[i].setAttribute("visibility", "visible");
    }
    switchButtons(true);
}