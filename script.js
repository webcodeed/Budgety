const dateLabel = ".budget__title--month"
const inputType = ".form__type"
const inputDescription = ".form__description"
const inputValue = ".form__value"

const dateLabelEl = document.querySelector(dateLabel)
const inputTypeEl = document.querySelector(inputType)
const inputDescriptionEl = document.querySelector(inputDescription)
const inputValueEl = document.querySelector(inputValue)
const formEl = document.querySelector(".form")

// Display month/year

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

// Initializing Date constructor
const date = new Date()
const currentMonth = date.getMonth()
const currentYear = date.getFullYear()

dateLabelEl.textContent = `${monthNames[currentMonth]}, ${currentYear}`

// toggle input form colours on depending
const formInputs = document.querySelectorAll(
    `${inputType}, ${inputDescription}, ${inputValue}`
)
function changed(item, className) {
    item.classList.toggle(className)
}

inputTypeEl.addEventListener("change", () => {
    formInputs.forEach((item) => {
        changed(item, "red-focus")
    })
    const formBtn = document.querySelector(".form__btn")
    changed(formBtn, "form__btn--red")
})

// stores all the budget data
let data = {
    items: {
        expenses: [],
        income: [],
    },
    totals: {
        expenses: 0,
        income: 0,
    },
    budget: 0,
    percent: -1,
}

// updating the local storage
const localStr = () => {
    localStorage.setItem("localData", JSON.stringify(data))
}
document.addEventListener("DOMContentLoaded", () => {
    data = JSON.parse(localStorage.getItem("localData")) || {
        items: {
            expenses: [],
            income: [],
        },
        totals: {
            expenses: 0,
            income: 0,
        },
        budget: 0,
        percent: -1,
    }
    function passIn(type) {
        data.items[type].forEach((item) => {
            addNewItem(
                item.id,
                type,
                item.description,
                formatNumber(item.amount)
            )
        })
    }
    if (data && data.items) {
        passIn("expenses")
        passIn("income")
        updateBudgetValues()
        updatePercentValues()
    }
})



function getInputs() {
    return {
        type: inputTypeEl.value,
        desc: inputDescriptionEl.value,
        amount: +inputValueEl.value,
    }
}

formEl.addEventListener("submit", (event) => {
    event.preventDefault()
    const formValues = getInputs()
    // Object Destructuring
    const { type, desc: description, amount } = formValues

    if (type && description && amount) {
        let id = crypto.randomUUID()
        data.items[type].push({ id, description, amount })

        // Clear form fields
        inputDescriptionEl.value = ""
        inputValueEl.value = ""

        // update UI
        addNewItem(id, type, description, formatNumber(amount))

        // Update Budget
        updateBudgetValues()

        // update percentage values
        updatePercentValues()

        localStr()
    } else {
        alert("please input valid description and amount")
    }
})
function addNewItem(id, type, desc, amount) {
    const html = `
        <div class="item" id="${id}">
            <div class="item__description">${desc}</div>
            <div class="item__values-container">
            <div class="item__value" data-value="${amount}">
            ${amount}
            </div>
           ${
               type === "expenses"
                   ? `<div class="item__percentage">0%</div>`
                   : ""
           } 
                                   <div class="item__edit">
                                    <button class="item__edit--btn">
                                        <ion-icon
                                        id="edit--btn"
                                        data-item="${type} ${id}"
                                        name="create-outline"></ion-icon>
                                    </button>
                                </div>
                                <div class="item__delete">
                    <button class="item__delete--btn">
                        <i
                            class="ion-ios-close-outline"
                            id="delete--btn"
                            data-item="${type} ${id}"
                        ></i>
                    </button>
                </div>
            </div>
        </div>
    `
    // insert the innerhtml
    document.querySelector(`.${type}__list`).innerHTML += html
}

function calaculateTotal(type) {
    let sum = 0
    data.items[type].forEach((item) => (sum += item.amount))
    data.totals[type] = sum
}

const formatNumber = (num) => {
    return num.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function updateBudgetValues() {
    // calculate total income and expenses
    // income total
    calaculateTotal("income")
    // expense total
    calaculateTotal("expenses")
    data.budget = data.totals.income - data.totals.expenses

    // calculate the percentage
    if (data.totals.income > 0) {
        data.percent = Math.round(
            (data.totals.expenses / data.totals.income) * 100
        )
    } else {
        data.percent = -1
    }
    
    // Display the budget in the UI
    document.querySelector(".budget__value").textContent = formatNumber(
        data.budget
    )
    document.querySelector(".budget__income--value").textContent = formatNumber(
        data.totals.income
    )
    document.querySelector(".budget__expenses--value").textContent =
        formatNumber(data.totals.expenses)
    const percent = document.querySelector(".budget__expenses--percentage")
    if (data.percent >= 0) {
        percent.textContent = data.percent + "%"
    } else {
        percent.textContent = "---"
    }
}
function updatePercentValues() {
    const listItems = document.querySelectorAll(".expenses__list > div")
    listItems.forEach(function (el) {
        const expense = el.querySelector(".item__value").textContent
        const percent = el.querySelector(".item__percentage")

        if (data.totals.income > 0) {

            percent.textContent =
                Math.round((+expense.split(",").join("") / data.totals.income) * 100) +
                "%"
        } else {
            percent.textContent = "---"
        }
    })
}

const Btn = document.querySelector(".container")

Btn.addEventListener("click", (e) => {
    const tarId = e.target.id
    if (tarId === "delete--btn") {
        const item = e.target.getAttribute("data-item")

        // const itemSplit = item.split(" ")
        // const type = itemSplit[0];
        // const id = itemSplit[1]
        const [type, id] = item.split(" ")

        const newData = data.items[type].filter((item) => item.id !== id)
        data.items[type] = newData

        // Update Budget
        updateBudgetValues()

        // Update Percent
        updatePercentValues()

        localStr()

        // Remove element from the DOM
        document.getElementById(id).remove()

    } else if (tarId === "edit--btn") {
        // get the id and type
        const itemData = e.target.getAttribute("data-item")
        // array destructuring
        const [type, id] = itemData.split(" ")
        //  create a new array threough map
        const newItem = data.items[type].map((item) => {
            if (item.id == id) {
                const newAmount = prompt("Edit your amount:", `${item.amount}`)
                const newName = prompt(`Edit your ${type}:`, item.description)

                if (newAmount) {
                    item.description = newName.trim()
                    item.amount = +newAmount.trim()
                    const element = e.target.closest(".item")
                    const descEL = element.querySelector(".item__description")
                    const valueEl = element.querySelector(".item__value")

                    if (valueEl) {
                        valueEl.textContent = formatNumber(item.amount)
                        valueEl.setAttribute("data-value", item.amount)
                        // ✅ Keep it editable
                        descEL.textContent = item.description
                    }
                    return item
                }
            }return item
        })
        // update the parent object
        data.items[type] = newItem

        // update
        updateBudgetValues()
        updatePercentValues()
        localStr()
    } else {
        return
    }
})

const reset = document.querySelector(".reset__btn")

function clear() {
    document.querySelector(".expenses__list").innerHTML = ""
    document.querySelector(".income__list").innerHTML = ""
}

reset.addEventListener("click", () => {
    const resetData = {
        items: {
            expenses: [],
            income: [],
        },
        totals: {
            expenses: 0,
            income: 0,
        },
        budget: 0,
        percent: -1,
    }

    data = resetData

    clear()
    updateBudgetValues()
    updatePercentValues()
    localStr()
})

