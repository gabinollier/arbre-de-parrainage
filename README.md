# Student Mentorship Tree Builder

## 📖 Overview

In many engineering schools, first-year students are paired with older students who act as mentors. As these students progress and become mentors themselves, a complex genealogical tree emerges. Unlike traditional family trees, these structures can be quite complex (for example, a student may have more than two mentors).

This application allows students to create and edit these mentorship trees through a graphical interface. It focuses on data longevity and high-quality sharing.

### Key Features

* **Complex Lineage Support:** Handles complex relationships involving multiple mentors per student.
* **JSON Data Management:** Data is imported and exported in JSON format. This ensures that the data remains raw and readable by humans or other scripts, even if this specific web interface eventually becomes obsolete.
* **Vector PDF Export:** The tree is generated as a PDF. This allows the file to be shared on social media groups without compression artifacts, enabling infinite zoom on large trees without any loss of quality.

## 🛠 Tech Stack

The application is built using a modern web stack:

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Language:** TypeScript
* **Visualization:** [viz.js](https://github.com/mdaines/viz.js/) (a version of Graphviz compiled to WebAssembly) is used to generate an SVG of the tree from the JSON data.
* **Export:** [jsPDF](https://github.com/parallax/jsPDF) is used to convert the generated SVG into a downloadable PDF.

## 🚀 Getting Started

First, clone the repository:

```bash
git clone https://github.com/gabinollier/arbre-de-parrainage.git
cd arbre-de-parrainage
```
