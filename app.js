const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const filterType = document.getElementById("filter-type");
const filterPeriod = document.getElementById("filter-period");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingTransactionId = null;
let transactionToDelete = null;

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Por favor, insira uma descrição válida e um valor maior que zero.");
        return; 
    }

    if (editingTransactionId !== null) {
        const transactionIndex = transactions.findIndex(t => t.id === editingTransactionId);

        // Verifica se a transação existe
        if (transactionIndex !== -1) {
            transactions[transactionIndex] = {
                id: editingTransactionId,
                description,
                amount,
                type,
                category,
                date: transactions[transactionIndex].date  
            };
        }
        editingTransactionId = null;  
    } else {
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date: new Date().toISOString()  
        };
        transactions.push(transaction);
    }

    saveTransactions();
    updateDashboard();
    displayTransactions();
    transactionForm.reset();  
});


filterType.addEventListener("change", displayTransactions);
filterPeriod.addEventListener("change", displayTransactions);

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateDashboard() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expenses;

    balanceElement.textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
    incomeElement.textContent = `R$ ${income.toFixed(2).replace('.', ',')}`;
    expensesElement.textContent = `R$ ${expenses.toFixed(2).replace('.', ',')}`;
}

function translateType(category) {
    const translations = {
        "Salário": "Salário",
        "Alimentação": "Alimentação",
        "Entretenimento": "Entretenimento",
        "Transporte": "Transporte"
    };
    return translations[category] || category;
}

function displayTransactions() {
    transactionList.innerHTML = "";
    let filteredTransactions = transactions;

    if (filterType.value !== "all") {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType.value);
    }

    if (filterPeriod.value !== "all") {
        const now = new Date();
        if (filterPeriod.value === "week") {
            const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= oneWeekAgo);
        } else if (filterPeriod.value === "month") {
            const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= oneMonthAgo);
        }
    }

    filteredTransactions.forEach(transaction => {
        const transactionItem = document.createElement("li");
        transactionItem.classList.add("transaction-item", transaction.type);

        transactionItem.innerHTML = `
            <span class="transaction-description">${transaction.description} (${translateType(transaction.category)})</span>
            <span class="transaction-amount">R$ ${transaction.amount.toFixed(2).replace('.', ',')}</span>
            <div class="actions" style="display: inline-flex; gap: 5px;">
                <button class="edit" onclick="openEditModal(${transaction.id})">Editar</button>
                <button class="delete" onclick="confirmDeleteTransaction(${transaction.id})">Excluir</button>
            </div>
        `;

        transactionList.appendChild(transactionItem);
    });
}

function openEditModal(id) {
    const transaction = transactions.find(t => t.id === id);
    document.getElementById("edit-description").value = transaction.description;
    document.getElementById("edit-amount").value = transaction.amount;
    document.getElementById("edit-type").value = transaction.type;
    document.getElementById("edit-category").value = transaction.category;
    editingTransactionId = id;

    document.getElementById("edit-modal").style.display = "flex";
}

document.getElementById("cancel-edit").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("edit-transaction-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const description = document.getElementById("edit-description").value;
    const amount = parseFloat(document.getElementById("edit-amount").value);
    const type = document.getElementById("edit-type").value;
    const category = document.getElementById("edit-category").value;

    const transactionIndex = transactions.findIndex(t => t.id === editingTransactionId);
    transactions[transactionIndex] = {
        id: editingTransactionId,
        description,
        amount,
        type,
        category,
        date: transactions[transactionIndex].date
    };

    saveTransactions();
    updateDashboard();
    displayTransactions();
    document.getElementById("edit-modal").style.display = "none";
});

function confirmDeleteTransaction(id) {
    transactionToDelete = id;
    document.getElementById("delete-confirmation").style.display = "flex";
}

document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("delete-confirmation").style.display = "none";
});

document.getElementById("confirm-delete").addEventListener("click", () => {
    if (transactionToDelete) {
        transactions = transactions.filter(t => t.id !== transactionToDelete);
        saveTransactions();
        updateDashboard();
        displayTransactions();
        transactionToDelete = null;
        document.getElementById("delete-confirmation").style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    updateDashboard();
    displayTransactions();
});
