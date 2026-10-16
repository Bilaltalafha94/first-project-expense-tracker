// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3001/api/expenses";
let allExpenses = [];
let editingId = null;
async function getExpenses() {
  try {
        showLoading(true);

    const response = await fetch(API_URL);
    const expenses = await response.json();
    if (!response.ok) {
  throw new Error("Failed to load expenses.");
}
    allExpenses = expenses;
    renderSummary(allExpenses);
    renderTable(allExpenses);


    return expenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
     showAlert("Failed to load expenses.", "danger");
  }
  finally {
  showLoading(false);
}
}
async function refresh() {
  await getExpenses();
}
getExpenses().then((expenses) => {
  console.log(expenses);
});
function renderTable(expenses) {
  const tableBody = document.getElementById("expenses-table-body");

  tableBody.innerHTML = "";

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${Number(expense.amount).toFixed(2)}</td>      <td>${expense.category}</td>
      <td>${expense.date}</td>
 <td>
  <button class="btn btn-warning btn-sm" data-action="edit" data-id="${expense.id}">Edit</button>
  <button class="btn btn-danger btn-sm" data-action="delete" data-id="${expense.id}">Delete</button>
</td>

    `;

    tableBody.appendChild(row);
  });
}
function applyFilter() {
  const selectedCategory = document.getElementById("category-filter").value;
const filteredExpenses =
  selectedCategory === "All"
    ? allExpenses
    : allExpenses.filter(
        (expense) => expense.category === selectedCategory
      );

renderTable(filteredExpenses);
renderSummary(filteredExpenses);
}
function showAlert(message, type) {
  const alertContainer = document.getElementById("alert-container");

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}
function showLoading(isLoading) {
  const spinner = document.getElementById("loading-spinner");

  if (isLoading) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}
document.getElementById("category-filter").addEventListener("change", applyFilter);
function renderSummary(expenses) {
      const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => {
     return sum + Number(expense.amount);
      }, 0);
      const averageExpense =
  totalExpenses > 0 ? totalAmount / totalExpenses : 0;
      const summaryCards = document.getElementById("summary-cards");
summaryCards.innerHTML = `
  <div class="col-md-6">
    <div class="card p-3">
      <h5>Total Expenses</h5>
      <h3>${totalExpenses}</h3>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card p-3">
      <h5>Total Amount</h5>
      <h3>${totalAmount.toFixed(2)}</h3>
    </div>
  </div>
  <div class="col-md-6">
  <div class="card p-3">
    <h5>Average Expense</h5>
    <h3>${averageExpense.toFixed(2)}</h3>
  </div>
</div>
`;
}
async function addExpense(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to add expense.");
  }

  return await response.json();
 }


    document.getElementById("expense-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const expenseData = {
    title: title,
  amount: amount,
  category: category,
  date: date
};
if (title === "") {
  showAlert("Title is required.", "danger");
  return;
}
if (date === "") {
  showAlert("Date is required.", "danger");
  return;
}
if (amount <= 0) {
  showAlert("Amount must be greater than zero.", "danger");
  return;
}
try {
  await addExpense(expenseData);
   await refresh();
   showAlert("Expense added successfully.", "success");
   document.getElementById("expense-form").reset();
} catch (error) {
  console.error("Error adding expense:", error);
  showAlert("Failed to add expense.", "danger");
}
});
document.getElementById("expenses-table-body").addEventListener("click", async function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

if (action === "delete") {
  try {
    await deleteExpense(id);
    await refresh();
    showAlert(" Expense deleted successfully ." , "success");
  } catch (error) {
    showAlert("Failed to delete expense.", "danger");
  }
}
if (action === "edit") {
  editingId = id;
  const expense = allExpenses.find((expense) => expense.id == id);

  document.getElementById("edit-title").value = expense.title;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;
  document.getElementById("edit-date").value = expense.date;

  const modal = new bootstrap.Modal(
    document.getElementById("editExpenseModal")
  );

  modal.show();
}
});
async function deleteExpense(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense.");
  }
}
async function updateExpense(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to update expense.");
  }

  return await response.json();
}
document.getElementById("edit-expense-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("edit-title").value.trim();
  const amount = Number(document.getElementById("edit-amount").value);
  const category = document.getElementById("edit-category").value;
  const date = document.getElementById("edit-date").value;
  const expenseData = {
  title: title,
  amount: amount,
  category: category,
  date: date
};
try {
  await updateExpense(editingId, expenseData);
  await refresh();
  showAlert("Expense updated successfully.", "success");
} catch (error) {
  showAlert("Failed to update expense.", "danger");
}

});