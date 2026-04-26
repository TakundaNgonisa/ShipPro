let balance = 30000;
let bet = 0;
let multiplier = 1;
let running = false;
let crashPoint = 0;
let interval;
let cashedOut = false;

let autoBet = false;
let autoCash = false;
let autoCashValue = 0;

let boat = document.getElementById("boat");
let cashBtn = document.getElementById("cashBtn");
let popup = document.getElementById("popup");

/* SAVE */
function saveGame() {
    localStorage.setItem("shippro_data", JSON.stringify({
        balance, autoBet, autoCash, autoCashValue
    }));
}

/* LOAD */
window.onload = function () {

    let phone = localStorage.getItem("shippro_user");
    if (phone) {
        document.getElementById("userBox").innerText = "📱 " + phone;
    }

    let data = JSON.parse(localStorage.getItem("shippro_data"));

    if (data) {
        balance = data.balance || 30000;
        autoBet = data.autoBet || false;
        autoCash = data.autoCash || false;
        autoCashValue = data.autoCashValue || 0;
    }

    document.getElementById("balance").innerText = balance;
};

/* START */
function startGame() {

    bet = Number(document.getElementById("bet").value);

    if (bet < 1 || bet > 5000 || bet > balance || running) return;

    balance -= bet;
    document.getElementById("balance").innerText = balance;

    multiplier = 1;
    running = true;
    cashedOut = false;

    crashPoint = Number((Math.random()*24+1).toFixed(2));

    boat.classList.add("shake");
    popup.style.display = "none";

    saveGame();

    interval = setInterval(updateGame, 80);
}

/* LOOP */
function updateGame() {

    multiplier += 0.03;
    if (multiplier > 25) multiplier = 25;

    document.getElementById("multiplier").innerText =
    multiplier.toFixed(2) + "x";

    updateCashButton();

    if (autoCash && multiplier >= autoCashValue) {
        cashOut();
    }

    if (multiplier >= crashPoint || multiplier >= 25) {
        crash();
    }
}

/* CASHOUT */
function cashOut() {

    if (!running || cashedOut) return;

    cashedOut = true;

    let win = bet * multiplier;
    balance += win;

    document.getElementById("balance").innerText = balance;

    addHistory("💰 CASHED", multiplier, bet);

    saveGame();
}

/* BUTTON */
function updateCashButton() {
    if (!running || cashedOut) {
        cashBtn.innerText = "🔐 Locked";
    } else {
        cashBtn.innerText = "$" + (bet * multiplier).toFixed(2);
    }
}

/* WALLET */
function deposit() {
    let a = Number(document.getElementById("amount").value);
    balance += a;
    document.getElementById("balance").innerText = balance;
    saveGame();
}

function withdraw() {
    let a = Number(document.getElementById("amount").value);
    if (a > balance) return;
    balance -= a;
    document.getElementById("balance").innerText = balance;
    saveGame();
}

/* AUTO */
function toggleAutoBet() {
    autoBet = !autoBet;
    document.getElementById("autoBetBtn").innerText =
    autoBet ? "Auto Bet ON" : "Auto Bet OFF";
    saveGame();
}

function toggleAutoCash() {
    autoCash = !autoCash;
    autoCashValue = Number(document.getElementById("autoCash").value);
    document.getElementById("autoCashBtn").innerText =
    autoCash ? "Auto Cash ON" : "Auto Cash OFF";
    saveGame();
}

/* HISTORY */
function addHistory(type, mult, betAmount) {

    let box = document.getElementById("historyBox");

    let color = mult <= 5 ? "blue" :
                mult <= 10 ? "purple" : "pink";

    let div = document.createElement("div");
    div.className = "history-item " + color;

    div.innerText = `${type} | $${betAmount} | ${mult.toFixed(2)}x`;

    box.prepend(div);

    if (box.children.length > 20) {
        box.removeChild(box.lastChild);
    }
}

/* CRASH */
function crash() {

    running = false;
    clearInterval(interval);

    boat.classList.remove("shake");

    popup.style.display = "block";
    popup.innerText = crashPoint.toFixed(2) + "x";

    addHistory("💥 SANK", crashPoint, bet);

    updateCashButton();

    saveGame();

    setTimeout(() => {
        popup.style.display = "none";
    }, 2000);

    document.getElementById("status").innerText =
    "Tap BET to play again";

    if (autoBet) {
        setTimeout(startGame, 2000);
    }
}