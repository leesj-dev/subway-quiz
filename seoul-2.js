let timeout;
let timer;
let solved = 0;
let minSetting = 10;

document.getElementById("answer").addEventListener("submit", function (event) {
    event.preventDefault();
    let station = event.target["station"].value;
    // let line = event.target["line"].value;
    if (station != "") { // 빈 form이 아니라면
        let svgStation = document.getElementById("map").contentDocument.getElementById(station);
        // let svgLine = document.getElementsByClassName(station + "_환승");
        // 역명이 존재하는 경우
        if (svgStation != null) {
            let currentState = svgStation.getAttribute("visibility");
            if (currentState === "hidden") {
                svgStation.setAttribute("visibility", "visible");
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
    }
    document.getElementById("station").value = "";  // 입력한 역명은 clear (호선은 유지)
})

// 제한 시간 가감
function add(i) {
    let m = minSetting;
    if ((i === 1 && m < 60) || (i === -1 && m > 1)) {
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
    document.getElementById("line").disabled = false;
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
    document.getElementById("give-up").disabled = true;
    document.getElementById("give-up").classList = ["button-off"];
    document.getElementById("reset").disabled = false;
    document.getElementById("reset").classList = ["button-on"];
    document.getElementById("submit").disabled = true;
    document.getElementById("submit").classList = ["button-off"];
    document.getElementById("line").disabled = true;
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