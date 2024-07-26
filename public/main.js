document.addEventListener("DOMContentLoaded", () => {
  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Log data to see the structure

      if (data && data.length > 1) {
        const dataTranscript = document.getElementById("data-transcript");
        const studentName = document.getElementById("student-name");

        if (data[1] && dataTranscript) {
          dataTranscript.innerText = data[1].text;
        }

        if (data[0] && studentName) {
          studentName.innerText = data[0].name;
        }
      } else {
        console.log("Data format is not as expected.");
      }
    })
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
});

// Download File PDF
document.getElementById("downloadPdf").addEventListener("click", () => {
  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      generatePdf(data[1].text);
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
});

function generatePdf(jsonData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  let yPosition = margin;
  const lineHeight = 10;

  function concatenateJsonValues(data) {
    let text = "";
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (typeof value === "object" && value !== null) {
          text += concatenateJsonValues(value) + " ";
        } else {
          text += `${value} `;
        }
      }
    }
    return text.trim(); // Remove trailing spaces
  }

  const text = concatenateJsonValues(jsonData);

  function addTextToPdf(doc, text, x, y, maxWidth, lineHeight) {
    const textArray = doc.splitTextToSize(text, maxWidth);
    textArray.forEach((line) => {
      if (y + lineHeight > doc.internal.pageSize.height - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, x, y);
      y += lineHeight;
    });
  }

  addTextToPdf(doc, text, margin, yPosition, pageWidth, lineHeight);

  doc.save("data.pdf");
}

// From Folder design
let toggleBtn = document.getElementById("toggle-btn");
let body = document.body;
let darkMode = localStorage.getItem("dark-mode");

const enableDarkMode = () => {
  toggleBtn.classList.replace("fa-sun", "fa-moon");
  body.classList.add("dark");
  localStorage.setItem("dark-mode", "enabled");
};

const disableDarkMode = () => {
  toggleBtn.classList.replace("fa-moon", "fa-sun");
  body.classList.remove("dark");
  localStorage.setItem("dark-mode", "disabled");
};

if (darkMode === "enabled") {
  enableDarkMode();
}

toggleBtn.onclick = (e) => {
  darkMode = localStorage.getItem("dark-mode");
  if (darkMode === "disabled") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
};

let profile = document.querySelector(".header .flex .profile");

document.querySelector("#user-btn").onclick = () => {
  profile.classList.toggle("active");
  search.classList.remove("active");
};

let search = document.querySelector(".header .flex .search-form");

document.querySelector("#search-btn").onclick = () => {
  search.classList.toggle("active");
  profile.classList.remove("active");
};

let sideBar = document.querySelector(".side-bar");

document.querySelector("#menu-btn").onclick = () => {
  sideBar.classList.toggle("active");
  body.classList.toggle("active");
};

document.querySelector("#close-btn").onclick = () => {
  sideBar.classList.remove("active");
  body.classList.remove("active");
};

window.onscroll = () => {
  profile.classList.remove("active");
  search.classList.remove("active");

  if (window.innerWidth < 1200) {
    sideBar.classList.remove("active");
    body.classList.remove("active");
  }
};
//
