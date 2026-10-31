// 21 chapters of examples and exercises. `inputs` (optional) are only used by the automated tests to answer input().
const r = String.raw;
const C = (id, en, fr, ar, examples) => ({ id, title: { en, fr, ar }, examples });
const E = (id, title, code, o = {}) => ({ id, title, code: code.replace(/^\n/, ''), ...o });

export const CHAPTERS = [
C(1, 'Introduction to Python', 'Introduction à Python', 'مدخل إلى بايثون', [
  E('hello', 'Hello World', r`
print("Hello, World!")
print("Welcome to Bouira Python Studio")
`),
  E('calc', 'Python as a calculator', r`
print(2 + 3 * 4)
print((2 + 3) * 4)
print(10 / 4, 10 // 4, 10 % 4, 2 ** 10)
`)]),
C(2, 'Variables and Data Types', 'Variables et types de données', 'المتغيرات وأنواع البيانات', [
  E('types', 'Basic types', r`
n = 42            # int
x = 3.14          # float
s = "Bouira"      # str
ok = True         # bool
for v in (n, x, s, ok):
    print(v, type(v).__name__)
print(int("12") + 1, float("2.5") * 2, str(7) + "!")
`),
  E('ex_vars', 'Exercise: swap two variables', r`
# Exercise: swap a and b WITHOUT using a third variable.
a, b = 3, 8
# your code here
a, b = b, a
print("a =", a, "b =", b)
`, { exercise: true })]),
C(3, 'Arithmetic Operators', 'Opérateurs arithmétiques', 'العمليات الحسابية', [
  E('ops', 'Operators', r`
a, b = 17, 5
print("a + b =", a + b)
print("a - b =", a - b)
print("a * b =", a * b)
print("a / b =", a / b)
print("a // b =", a // b)
print("a % b =", a % b)
print("a ** b =", a ** b)
print(round(a / b, 2), abs(-7), divmod(a, b))
`),
  E('ex_avg', 'Exercise: average of three numbers', r`
# Exercise: compute the average of three grades.
g1, g2, g3 = 12.5, 14, 9.75
average = (g1 + g2 + g3) / 3
print("Average:", round(average, 2))
`, { exercise: true })]),
C(4, 'Input and Output', 'Entrées et sorties', 'الإدخال والإخراج', [
  E('input_basic', 'Interactive input()', r`
name = input("Enter your name: ")
age = int(input("Enter your age: "))
salary = float(input("Enter your salary: "))

print("Name:", name)
print("Age:", age)
print("Salary:", salary)
`, { inputs: ['Amina', '20', '3500.5'] }),
  E('ex_salary', 'Exercise: net salary', r`
# Exercise: the tax rate is 10%. Display the net salary.
gross = float(input("Gross salary (DZD): "))
tax = gross * 0.10
print(f"Tax: {tax:.2f} DZD")
print(f"Net salary: {gross - tax:.2f} DZD")
`, { exercise: true, inputs: ['45000'] })]),
C(5, 'Conditional Statements', 'Instructions conditionnelles', 'الجمل الشرطية', [
  E('grades', 'Student grade', r`
grade = float(input("Enter a grade (0-20): "))
if grade >= 16:
    print("Excellent")
elif grade >= 12:
    print("Good")
elif grade >= 10:
    print("Pass")
else:
    print("Fail")
`, { inputs: ['13'] }),
  E('ex_discount', 'Exercise: discount', r`
# Exercise: 10% discount if total >= 5000 DZD, 20% if total >= 10000 DZD.
total = float(input("Total (DZD): "))
if total >= 10000:
    rate = 0.20
elif total >= 5000:
    rate = 0.10
else:
    rate = 0
print("Discount:", rate * 100, "%  ->  to pay:", total * (1 - rate))
`, { exercise: true, inputs: ['7000'] })]),
C(6, 'For Loops', 'Boucles for', 'حلقات for', [
  E('for_range', 'range() and lists', r`
for i in range(1, 6):
    print(i, "squared is", i ** 2)
for index, fruit in enumerate(["apple", "banana", "cherry"]):
    print(index, fruit)
print("Sum 1..100 =", sum(range(1, 101)))
`),
  E('ex_table', 'Exercise: multiplication table', r`
n = int(input("Table of: "))
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
`, { exercise: true, inputs: ['7'] })]),
C(7, 'While Loops', 'Boucles while', 'حلقات while', [
  E('while_login', 'Login exercise (while + input)', r`
PASSWORD = "bouira2024"
attempts = 0
while attempts < 3:
    pwd = input("Password: ")
    if pwd == PASSWORD:
        print("Welcome!")
        break
    attempts += 1
    print("Wrong password.", 3 - attempts, "attempt(s) left")
else:
    print("Account locked")
`, { inputs: ['abc', 'bouira2024'] }),
  E('while_sum', 'Sum until 0', r`
total = 0
while True:
    n = float(input("Number (0 to stop): "))
    if n == 0:
        break
    total += n
print("Total =", total)
`, { inputs: ['4', '5.5', '0'] })]),
C(8, 'Break, Continue, and Pass', 'Break, Continue et Pass', 'break و continue و pass', [
  E('bcp', 'break / continue / pass', r`
for n in range(1, 21):
    if n % 2 == 0:
        continue          # skip even numbers
    if n > 11:
        break             # stop the loop
    print(n, end=" ")
print()
def todo():
    pass                  # empty block placeholder
todo()
`)]),
C(9, 'Functions', 'Fonctions', 'الدوال', [
  E('func', 'Defining functions', r`
def factorial(n):
    """Return n! computed with a loop."""
    result = 1
    for k in range(2, n + 1):
        result *= k
    return result

def describe(values, label="data"):
    return f"{label}: min={min(values)}, max={max(values)}, mean={sum(values)/len(values):.2f}"

print(factorial(10))
print(describe([4, 8, 15, 16, 23, 42]))
print(describe([1, 2, 3], label="small"))
`),
  E('ex_compound', 'Exercise: compound interest function', r`
def compound(capital, rate, years):
    return capital * (1 + rate) ** years

for y in (1, 5, 10):
    print(y, "years:", round(compound(100000, 0.05, y), 2), "DZD")
`, { exercise: true })]),
C(10, 'Lists and Tuples', 'Listes et tuples', 'القوائم و tuples', [
  E('lists', 'Lists', r`
numbers = [5, 3, 9, 1]
numbers.append(7)
numbers.sort()
print(numbers, "squares:", [x * x for x in numbers])
print(numbers[0], numbers[-1], numbers[1:3], len(numbers))
point = (3, 4)          # tuple: immutable
x, y = point
print("distance from origin:", (x ** 2 + y ** 2) ** 0.5)
`),
  E('ex_seq', 'Exercise: arithmetic sequence', r`
u0, r, n = 3, 4, 10
terms = [u0 + r * k for k in range(n)]
print(terms)
print("Sum of the first", n, "terms:", sum(terms), "=", n * (2 * u0 + (n - 1) * r) / 2)
`, { exercise: true })]),
C(11, 'Dictionaries', 'Dictionnaires', 'القواميس', [
  E('dicts', 'Dictionaries', r`
student = {"name": "Amina", "grades": [14, 17, 12]}
student["average"] = sum(student["grades"]) / len(student["grades"])
for key, value in student.items():
    print(key, "->", value)
counts = {}
for w in "to be or not to be".split():
    counts[w] = counts.get(w, 0) + 1
print(counts)
`)]),
C(12, 'File Handling', 'Gestion de fichiers', 'التعامل مع الملفات', [
  E('files', 'Write and read a text file', r`
# Files live in your project folder: notes.txt will appear in the Files panel.
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("First line\n")
    f.write("Second line\n")

with open("notes.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(number, line.strip())
`),
  E('csvfile', 'Read a CSV file', r`
import csv
with open("grades.csv", "w", newline="") as f:
    csv.writer(f).writerows([["student", "grade"], ["Amina", 15], ["Yacine", 11], ["Sara", 18]])
with open("grades.csv") as f:
    rows = list(csv.DictReader(f))
print(rows)
print("Mean grade:", sum(float(r["grade"]) for r in rows) / len(rows))
`)]),
C(13, 'Object-Oriented Programming', 'Programmation orientée objet', 'البرمجة كائنية التوجه', [
  E('oop', 'Classes and objects', r`
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount

    def __str__(self):
        return f"{self.owner}: {self.balance} DZD"

acc = Account("Amina", 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc)
`)]),
C(14, 'Mathematics with Python', 'Mathématiques avec Python', 'الرياضيات مع بايثون', [
  E('math', 'math module and equations', r`
import math
print(math.sqrt(2), math.pi, math.factorial(6), math.comb(5, 2))
print(math.sin(math.radians(30)), math.log(100, 10), math.gcd(48, 18))
a, b, c = 1, -3, 2
delta = b ** 2 - 4 * a * c
x1 = (-b + math.sqrt(delta)) / (2 * a)
x2 = (-b - math.sqrt(delta)) / (2 * a)
print("roots:", x1, x2)
`),
  E('sympy', 'Symbolic maths with SymPy', r`
import sympy as sp
x = sp.symbols("x")
f = x**3 - 6*x**2 + 11*x - 6
print("factor     :", sp.factor(f))
print("roots      :", sp.solve(f, x))
print("derivative :", sp.diff(f, x))
print("integral   :", sp.integrate(f, x))
print("limit      :", sp.limit(sp.sin(x) / x, x, 0))
`)]),
C(15, 'Descriptive Statistics', 'Statistiques descriptives', 'الإحصاء الوصفي', [
  E('stats', 'mean / median / std', r`
import statistics as st
data = [12, 15, 11, 18, 20, 15, 14, 19, 15, 13]
print("n        =", len(data))
print("mean     =", st.mean(data))
print("median   =", st.median(data))
print("mode     =", st.mode(data))
print("variance =", round(st.variance(data), 3), "(sample)")
print("std dev  =", round(st.stdev(data), 3), "(sample)")
print("quartiles=", st.quantiles(data, n=4))
`),
  E('hist_box', 'Histogram and box plot', r`
import numpy as np
import matplotlib.pyplot as plt
rng = np.random.default_rng(1)
data = rng.normal(50, 10, 300)
plt.hist(data, bins=20, color="#6A8759", edgecolor="white")
plt.title("Histogram")
plt.show()
plt.boxplot(data, vert=False)
plt.title("Box plot")
plt.show()
`)]),
C(16, 'Probability Distributions', 'Lois de probabilité', 'التوزيعات الاحتمالية', [
  E('normal', 'Standard normal distribution (PDF and CDF)', r`
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

x = np.linspace(-4, 4, 500)
y = np.exp(-x**2 / 2) / np.sqrt(2*np.pi)

plt.plot(x, y)
plt.title("Standard Normal Distribution")
plt.xlabel("Z")
plt.ylabel("Density")
plt.grid(True)
plt.show()

plt.plot(x, stats.norm.cdf(x))
plt.title("Cumulative distribution function")
plt.grid(True)
plt.show()
print("P(Z < 1.96) =", round(stats.norm.cdf(1.96), 4))
`),
  E('binom', 'Binomial and dice simulation', r`
import random
from math import comb
from scipy import stats
random.seed(42)
N = 10000
rolls = [random.randint(1, 6) + random.randint(1, 6) for _ in range(N)]
print("P(sum = 7) simulated:", rolls.count(7) / N, " exact:", round(6 / 36, 4))
print("P(X = 3), n=5, p=0.5 :", comb(5, 3) * 0.5 ** 5)
print("P(X <= 3), n=10, p=0.5:", round(stats.binom.cdf(3, 10, 0.5), 4))
`)]),
C(17, 'NumPy', 'NumPy', 'NumPy', [
  E('numpy', 'Arrays and linear algebra', r`
import numpy as np
a = np.array([1, 2, 3, 4, 5])
print("a * 2   =", a * 2)
print("mean/std:", a.mean(), a.std())
M = np.array([[2, 1], [1, 3]])
print("det     =", round(np.linalg.det(M), 3))
print("inverse =\n", np.linalg.inv(M))
print("solve Mx=[1,2] ->", np.linalg.solve(M, [1, 2]))
`)]),
C(18, 'pandas', 'pandas', 'pandas', [
  E('pandas', 'DataFrame of students', r`
import pandas as pd
df = pd.DataFrame({"student": ["Amina", "Yacine", "Sara", "Karim", "Lina"],
                   "math": [14, 11, 18, 9, 16], "physics": [12, 13, 17, 10, 15]})
df["average"] = df[["math", "physics"]].mean(axis=1)
print(df)
print()
print(df.describe())
print(df.sort_values("average", ascending=False).head(3))
print("Correlation math/physics:", round(df["math"].corr(df["physics"]), 3))
`)]),
C(19, 'SciPy', 'SciPy', 'SciPy', [
  E('ttest', 't-test and correlation', r`
from scipy import stats
a = [78, 82, 69, 91, 85, 74, 88, 80]
b = [72, 75, 65, 80, 77, 70, 79, 73]
t, p = stats.ttest_ind(a, b)
print(f"t = {t:.3f}, p-value = {p:.4f}, reject H0 at 5%? {p < 0.05}")
r, p = stats.pearsonr(a, b)
print(f"Pearson r = {r:.3f}")
res = stats.linregress(a, b)
print(f"slope = {res.slope:.3f}, intercept = {res.intercept:.3f}, R^2 = {res.rvalue**2:.3f}")
`),
  E('sklearn_reg', 'Regression with statsmodels and scikit-learn', r`
import numpy as np
import statsmodels.api as sm
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(3)
x = rng.uniform(0, 10, 60)
y = 3 + 1.5 * x + rng.normal(0, 1.5, 60)
fit = sm.OLS(y, sm.add_constant(x)).fit()
print(fit.params.round(3), "R2 =", round(fit.rsquared, 3))
m = LinearRegression().fit(x.reshape(-1, 1), y)
print("sklearn:", round(m.intercept_, 3), round(m.coef_[0], 3))
`)]),
C(20, 'Matplotlib', 'Matplotlib', 'Matplotlib', [
  E('plots', 'Line, bar, scatter and pie charts', r`
import numpy as np
import matplotlib.pyplot as plt
x = np.linspace(0, 2 * np.pi, 200)
plt.plot(x, np.sin(x), label="sin"); plt.plot(x, np.cos(x), label="cos")
plt.title("Line chart"); plt.legend(); plt.grid(True); plt.show()
plt.bar(["A", "B", "C", "D"], [23, 17, 35, 29], color="#4A88C7"); plt.title("Bar chart"); plt.show()
rng = np.random.default_rng(1)
xs = rng.uniform(0, 10, 80); ys = 2 * xs + rng.normal(0, 2, 80)
plt.scatter(xs, ys); plt.title("Scatter plot"); plt.show()
plt.pie([40, 30, 20, 10], labels=["Math", "Physics", "Chemistry", "Other"], autopct="%1.0f%%"); plt.title("Pie chart"); plt.show()
`),
  E('heatmap', 'Correlation heatmap (seaborn)', r`
import numpy as np, pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
rng = np.random.default_rng(0)
df = pd.DataFrame(rng.normal(size=(100, 4)), columns=list("ABCD"))
df["E"] = df["A"] * 0.8 + rng.normal(scale=0.5, size=100)
sns.heatmap(df.corr(), annot=True, cmap="coolwarm", vmin=-1, vmax=1)
plt.title("Correlation matrix")
plt.show()
`)]),
C(21, 'Economic and Financial Applications', 'Applications économiques et financières', 'تطبيقات اقتصادية ومالية', [
  E('interest', 'Compound interest over time', r`
import matplotlib.pyplot as plt
capital, rate = 100000, 0.06
years = list(range(0, 21))
values = [capital * (1 + rate) ** y for y in years]
print(f"After 20 years: {values[-1]:,.0f} DZD")
plt.plot(years, values, marker="o")
plt.title("Compound interest (6 %)"); plt.xlabel("years"); plt.ylabel("DZD"); plt.grid(True)
plt.show()
`),
  E('loan', 'Loan repayment schedule', r`
principal = float(input("Loan amount (DZD): "))
annual = float(input("Annual rate (%): ")) / 100
months = int(input("Duration (months): "))
m = annual / 12
payment = principal * m / (1 - (1 + m) ** -months)
print(f"Monthly payment: {payment:,.2f} DZD")
print(f"Total cost of credit: {payment * months - principal:,.2f} DZD")
`, { exercise: true, inputs: ['1000000', '6', '24'] }),
  E('econ_data', 'Economic data with pandas (GDP growth)', r`
import pandas as pd
df = pd.DataFrame({"year": [2019, 2020, 2021, 2022, 2023],
                   "gdp": [171.0, 164.9, 167.4, 190.7, 187.2]})   # illustrative values, billion USD
df["growth_%"] = df["gdp"].pct_change() * 100
print(df.round(2))
print("Mean growth:", round(df["growth_%"].mean(), 2), "%")
`)]),
];
export const ALL_EXAMPLES = CHAPTERS.flatMap(c => c.examples.map(e => ({ ...e, chapter: c.id })));
export const exampleFileName = (ex) => `ch${String(ex.chapter).padStart(2, '0')}_${ex.id}.py`;
// File names that would shadow an importable library ("pandas.py" breaks "import pandas").
export const SHADOWING = new Set(['numpy', 'pandas', 'scipy', 'sympy', 'matplotlib', 'seaborn', 'statsmodels', 'sklearn', 'math', 'statistics', 'random', 'csv', 'json', 'datetime', 'decimal', 'itertools', 'collections', 'time', 'string', 'os', 'sys', 're', 'test', 'io', 'copy', 'types']);
