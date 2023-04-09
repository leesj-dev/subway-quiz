let min, sec;
let timer;
let solved = 0
let stations = new Array();

document.getElementById("answer").addEventListener("submit", function (event) {
    event.preventDefault();
    let line = event.target["line"].value;
    let station = event.target["station"].value;
    let svgElement = document.getElementById("map").contentDocument.getElementById(station);
    if (station != "") { // 빈 form이 아니라면
        // 역명이 존재하고, [호선 옵션이 비활성화되어 있거나 svg에 해당 호선이 존재하는 경우]
        if (svgElement != null && (line === "disabled" || svgElement.classList.contains(line))) {
            let currentState = svgElement.getAttribute("visibility");
            if (currentState === "hidden") {
                svgElement.setAttribute("visibility", "visible");
                stations.push(svgElement.id);
                solved += 1;
                document.getElementById("solved").innerHTML = solved;
                showPopup("correct");
                if (document.getElementById("solved").innerHTML == document.getElementById("total").innerHTML) {
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

function showPopup(e) {
    const item = document.getElementById(e);
    item.style.display = "inline-block";
    setTimeout(function () { item.style.display = "none"; }, 2000);
}

function optionCheck(e) {
    if (e != "") {
        try {
            document.getElementById("default-option").outerHTML = "";
        } catch (e) {
            // pass
        }
    }
}

function switchButtons(param) {
    if (param === true) {
        document.getElementById("start").disabled = false;
        document.getElementById("line").disabled = true;
        document.getElementById("station").disabled = true;
        document.getElementById("submit").disabled = true;
    } else if (param === false) {
        document.getElementById("start").disabled = true;
        document.getElementById("line").disabled = false;
        document.getElementById("station").disabled = false;
        document.getElementById("submit").disabled = false;
    }
}

function startTimer() {
    min = 10;
    sec = 0;
    timer = setInterval(countTimer, min * 60 + sec);
    switchButtons(false);
}

function countTimer() {
    if (sec != 0) {
        sec--;
        document.getElementById("display").innerText = min + " : " + sec;
    } else {
        if (min != 0) {
            min--;
            sec = 59;
        } else {
            clearTimer(timer, "종료");
        }
    }
}

function resetTimer() {
    clearTimer(timer, "10 : 00");
    switchButtons(true);
}

function clearTimer(t, text) {
    clearInterval(t);
    document.getElementById("display").innerText = text;

    // 기존에 표시되었던 역을 다시 숨김
    for (let i = 0; i < stations.length; i++) {
        let svgElement = document.getElementById("map").contentDocument.getElementById(stations[i]);
        svgElement.setAttribute("visibility", "hidden");
    }
}
