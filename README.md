
# Cyber Attack Dashboard (React 19 + TypeScript + Vite)

A modern cyber security analytics dashboard built using **React 19**, **TypeScript**, and **Vite 5**, featuring an interactive **SVG world map (TopoJSON → SVG)** and a filterable, paginated attack events table.

---

## 🚀 Features

- **Login / Logout Authentication**
  - Session state stored using `localStorage` (acts as local DB simulation)
- **Sidebar Navigation**
  - Two main pages: **Threat Map** and **Attack Events**
- **Threat Map Page**
  - Interactive **SVG world map**
  - **Country hover tooltip** displaying real attack statistics:
    ```
    Detected Attacks:
      Type of attack | count | affected system
    ```
  - Data sourced from a local CSV file
- **Attack Events Table Page**
  - **Pagination** (15 rows per page)
  - **Rounded select dropdown filters** matching the UI theme
  - Filtering by:
    - Country
    - Attack Type
    - Affected System
    - Protocol
    - Protocol Type
- **Refresh Button**
  - Instantly reloads the current page
- **Optimized Data Logic**
  - Efficient country and attack grouping using `useMemo`
  - Clean, merged codebase with **no duplicates**
  - High-performance structure using strong problem-solving practices

---

## 🖼️ Screenshots

### Login Page
![Register Page](screenshots/register.png)

### Register Page
![Login Page](screenshots/login.png)

### Threat Map
![Threat Map](screenshots/Mapview.png)

### Attack Events Table
![Attack Events Table](screenshots/tableview.png)

---

## 🛠️ Installation & Run

Run the following commands in your **command line / terminal**:

```bash
cd cyber-attack-dashboard
npm install
npm run dev
````

---

## 🎯 Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Frontend      | React 19, TypeScript, TailwindCSS |
| Bundler       | Vite 5                            |
| Map Rendering | TopoJSON → SVG                    |
| Data Parsing  | PapaParse                         |
| Storage       | localStorage (login simulation)   |

---

## 💡 Strengths Highlighted

* Strong **problem-solving** and **algorithmic thinking**
* Clean, maintainable, and efficient component design
* Suitable for entry-level roles requiring solid CS fundamentals

---

## 👨‍💻 Author

**Chowdam Tarun Kumar**




