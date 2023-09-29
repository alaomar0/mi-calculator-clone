const screenHistory = document.querySelector(".screenhistory");
const screenTxt = document.querySelector(".screentxt");
const screenEql = document.querySelector(".screeneql");

//calcultor keyboard
document.querySelector(".buttons").addEventListener("click", (e) => {
  const screenEqlIsActive = screenEql.classList.contains("active");
  const crnt = e.target;
  const crntType = crnt.classList[0];
  const txt = crnt.innerText;
  let last = screenTxt.lastElementChild;
  let lastIsNum = last.classList[0] === "numb";

  if (screenEqlIsActive && ["no", "opr", "prc"].includes(crntType)) {
    const ans = screenEql.innerText;
    //history
    addToHistory(ans);
    //after equal click
    resetScreen();
    last = screenTxt.lastElementChild;
    last.innerText = crntType === "no" ? "0" : ans;
    lastIsNum = true;
  }
  switch (crntType) {
    // NUMBERS click
    case "no":
      if (!lastIsNum) {
        //create num span
        createSpan("numb", txt === "." ? "0." : txt);
      } else if (last.innerText === "0") {
        //replace in case of only zero
        last.innerText = txt === "." ? "0." : txt;
      } else if (!(txt === "." && last.innerText.includes("."))) {
        //add to last num span
        last.innerText += txt;
      }
      break;
    // OPERATIONS click
    case "opr":
      if (lastIsNum) {
        //remove the dot
        if (last.innerText.slice(-1) === ".") {
          last.innerText = last.innerText.slice(0, -1);
        }
        //create opr span
        createSpan(crnt.classList[1], txt);
      } else {
        //replace type class
        last.classList.value = crnt.classList[1];
        last.innerText = txt;
      }
      break;
    // PERCENT click
    case "prc":
      if (lastIsNum) {
        last.innerText /= 100;
      }
      break;
    // DELETE click
    case "dlt":
      if (!screenEqlIsActive) {
        last.innerText = last.innerText.slice(0, -1);
        if (!last.innerText) {
          last.remove();
          if (!screenTxt.firstChild) {
            //create initial
            createSpan("numb", "0");
          }
        }
      }
      break;
    // CLEAR click
    case "clr":
      if (screenTxt.innerText === "0") {
        document.querySelector(".screenhistory").innerHTML = "";
      } else {
        resetScreen();
      }
      break;
    // EQUAL click
    case "eql":
      if (screenTxt.innerText !== "0") {
        screenEql.classList.add("active");
        screenTxt.classList.remove("active");
      }
      break;
  }
  checking();
});

function createSpan(cls, txt) {
  const sp = document.createElement("span");
  sp.classList.add(cls);
  sp.innerText = txt;
  screenTxt.append(sp);
}

function checking() {
  //change clr text and display answer
  if (screenTxt.innerText !== "0") {
    screenEql.innerText = calculate();
    document.querySelector(".clr").innerText = "C";
  } else {
    screenEql.innerText = "";
    document.querySelector(".clr").innerText = "AC";
    screenEql.classList.remove("active");
    screenTxt.classList.add("active");
  }
}

function resetScreen() {
  while (screenTxt.firstChild) {
    screenTxt.removeChild(screenTxt.firstChild);
  }
  //create initial
  createSpan("numb", "0");
  checking();
}

function addToHistory(resultTxt) {
  //history container
  const history = document.createElement("div");
  history.classList.add("history");
  //equation container
  const equation = document.createElement("div");
  equation.classList.add("equation");
  //add the equation text
  [...screenTxt.children].forEach((v) => {
    equation.append(v.innerText);
  });
  //result container
  const result = document.createElement("div");
  result.classList.add("result");
  //add the result text
  result.innerText = resultTxt;
  //append everything
  history.append(equation, result);
  screenHistory.append(history);
}

function calculate() {
  // precision factor
  const precisionFactor = 10 ** 100;
  const operations = ["mlt dv", "plus minus"];

  // Convert the children of screenTxt into an array of objects
  // Each object has a value (the inner text) and a class (the class list value)
  let calcArr = [...screenTxt.children].map((e) => {
    return {
      value: e.innerText,
      class: e.classList.value,
    };
  });

  // Loop over the operations
  operations.forEach((operation, index) => {
    // Loop over the elements in calcArr, excluding the last one
    for (let i = 0; i < calcArr.length - 1; i++) {
      // If the current element's class is included in the current operation
      if (operation.includes(calcArr[i].class)) {
        // Multiply the values of the current and next elements by the precision factor
        const firstValue = calcArr[i - 1].value * precisionFactor;
        const secondValue = calcArr[i + 1].value * precisionFactor;

        // Calculate the result based on the operation and class
        let result;
        if (index === 0) {
          // If it's a multiplication or division operation
          result =
            calcArr[i].class === "mlt"
              ? (firstValue * secondValue) / precisionFactor ** 2
              : firstValue / secondValue;
        } else {
          // If it's an addition or subtraction operation
          result =
            calcArr[i].class === "plus"
              ? (firstValue + secondValue) / precisionFactor
              : (firstValue - secondValue) / precisionFactor;
        }

        // Replace the three elements (two numbers and one operator) with the result
        calcArr.splice(i - 1, 3, { value: result, class: "numb" });

        // Decrement i to adjust for the removed elements
        i--;
      }
    }
  });

  // Check if the final result is a finite number, and format it to seven decimal places if it is
  const answer = isFinite(calcArr[0].value)
    ? parseFloat((+calcArr[0].value).toFixed(7))
    : "Error";

  // Display the answer
  return answer;
}
