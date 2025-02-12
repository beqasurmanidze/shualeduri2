const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const EXPENSES_FILE = path.join(__dirname, "expenses.json");

// Middleware JSON და ფორმის მონაცემების დასამუშავებლად
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static ფაილების სერვინგი (CSS)
app.use(express.static(path.join(__dirname, "public")));

// EJS ტემპლეიტის ჩართვა
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ხარჯების წაკითხვა ფაილიდან
const readExpenses = () => {
  if (!fs.existsSync(EXPENSES_FILE)) {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(EXPENSES_FILE);
  return JSON.parse(data);
};

// ხარჯების ჩაწერა ფაილში
const writeExpenses = (expenses) => {
  fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
};

// 1) ხარჯების სია
app.get("/expense-list", (req, res) => {
  const expenses = readExpenses();
  res.render("expense-list", { expenses });
});

// 2) ხარჯის დეტალები
app.get("/expense-list/:id", (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses();
  const expense = expenses.find((exp) => exp.id === id);

  if (!expense) {
    return res.status(404).send("Expense not found");
  }

  res.render("expense-details", { expense });
});

// 3) ხარჯის წაშლა
app.post("/expense-list/:id/delete", (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses();
  const updatedExpenses = expenses.filter((exp) => exp.id !== id);

  if (expenses.length === updatedExpenses.length) {
    return res.status(404).send("Expense not found");
  }

  writeExpenses(updatedExpenses);
  res.redirect("/expense-list");
});

// 4) ხარჯის დამატების ფორმა
app.get("/create-expense", (req, res) => {
  res.render("create-expense");
});

// 4) ახალი ხარჯის დამატება
app.post("/create-expense", (req, res) => {
  const expenses = readExpenses();
  const newExpense = { id: Date.now().toString(), ...req.body };
  expenses.push(newExpense);
  writeExpenses(expenses);
  res.redirect("/expense-list");
});

// სერვერის გაშვება
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
