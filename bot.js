// ==========================================
// AI SUMMARIZER
// ==========================================

// ⚠️ For a local/student project only.
// Do NOT publish your real API key to GitHub.
const GEMINI_API_KEY = "AQ.Ab8RN6KkZHS6WY4jC1DZfe6aObCz2MUdMybdarMxj1p7E7V0aw";

const MODEL = "gemini-3.5-flash-lite";

// ==========================================
// DOM ELEMENTS
// ==========================================

const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");
const uploadZone = document.getElementById("uploadZone");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const removeFileBtn = document.getElementById("removeFileBtn");

const wordCount = document.getElementById("wordCount");

const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");

const outputBox = document.getElementById("outputBox");
const placeholderText = document.getElementById("placeholderText");

const copyBtn = document.getElementById("copyBtn");

const statsRow = document.getElementById("statsRow");
const statOriginal = document.getElementById("statOriginal");
const statSummary = document.getElementById("statSummary");
const statReduced = document.getElementById("statReduced");

const themeSwitch = document.getElementById("themeSwitch");

let selectedFile = null;
let currentSummary = "";

// ==========================================
// WORD COUNT
// ==========================================

function countWords(text) {
  if (!text || !text.trim()) {
    return 0;
  }

  return text.trim().split(/\s+/).length;
}

function updateWordCount() {
  const count = countWords(inputText.value);

  wordCount.textContent = `${count} ${count === 1 ? "word" : "words"}`;
}

inputText.addEventListener("input", updateWordCount);

// ==========================================
// FILE SELECTION
// ==========================================

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) {
    return;
  }

  selectedFile = file;

  fileName.textContent = file.name;
  fileInfo.classList.remove("d-none");

  // If a file is selected, clear manually typed text
  inputText.value = "";

  updateWordCount();
});

// ==========================================
// REMOVE FILE
// ==========================================

removeFileBtn.addEventListener("click", function () {
  selectedFile = null;
  fileInput.value = "";

  fileInfo.classList.add("d-none");
  fileName.textContent = "No file selected";

  updateWordCount();
});

// ==========================================
// READ TEXT FILE
// ==========================================

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      resolve(event.target.result);
    };

    reader.onerror = function () {
      reject(new Error("Could not read the text file."));
    };

    reader.readAsText(file);
  });
}

// ==========================================
// READ PDF FILE
// ==========================================

async function readPDFFile(file) {
  // Load PDF.js if it isn't already loaded
  if (!window.pdfjsLib) {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs",
      true,
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await window.pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const textContent = await page.getTextContent();

    const pageText = textContent.items.map((item) => item.str).join(" ");

    fullText += pageText + "\n\n";
  }

  return fullText.trim();
}

// ==========================================
// READ DOCX FILE
// ==========================================

async function readDOCXFile(file) {
  if (!window.mammoth) {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.9.0/mammoth.browser.min.js",
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer: arrayBuffer,
  });

  return result.value.trim();
}

// ==========================================
// DYNAMIC SCRIPT LOADER
// ==========================================

function loadScript(src, isModule = false) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = src;

    if (isModule) {
      script.type = "module";
    }

    script.onload = resolve;

    script.onerror = function () {
      reject(new Error("Could not load the required file reader."));
    };

    document.head.appendChild(script);
  });
}

// ==========================================
// GET TEXT FROM SELECTED FILE
// ==========================================

async function extractFileText(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "txt") {
    return await readTextFile(file);
  }

  if (extension === "pdf") {
    return await readPDFFile(file);
  }

  if (extension === "docx") {
    return await readDOCXFile(file);
  }

  if (extension === "doc") {
    throw new Error(
      "Old .doc files are not supported directly in the browser. Please save the file as .docx or .pdf.",
    );
  }

  throw new Error("Unsupported file type.");
}

// ==========================================
// GET USER'S TEXT
// ==========================================

async function getInputContent() {
  // If a file was attached, use the file
  if (selectedFile) {
    const text = await extractFileText(selectedFile);

    if (!text.trim()) {
      throw new Error(
        "The selected file does not appear to contain readable text.",
      );
    }

    return text;
  }

  // Otherwise use textarea
  const text = inputText.value.trim();

  if (!text) {
    throw new Error("Please enter some text or attach a file.");
  }

  return text;
}

// ==========================================
// SUMMARIZE WITH OPENAI
async function summarizeText(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: `
You are an AI text summarization assistant.

Your job is to summarize the user's provided text accurately and clearly.

Rules:
1. Summarize ONLY the text provided by the user.
2. Do not introduce information that is not present in the original text.
3. Preserve the main ideas, important facts, arguments, and conclusions.
4. Remove unnecessary repetition and minor details.
5. Make the summary significantly shorter than the original.
6. Use clear and natural language.
7. Keep the original meaning and context.
8. Do not criticize or evaluate the text unless the user explicitly asks you to.
9. Do not answer questions contained inside the text. Summarize them as part of the text instead.
10. If the text is already very short, provide a concise summary rather than unnecessarily expanding it.

Return ONLY the summary.
              `,
            },
          ],
        },
        contents: [
          {
            parts: [
              {
                text: text,
              },
            ],
          },
        ],
      }),
    },
  );

  // Handle API errors
  if (!response.ok) {
    let errorMessage = "Something went wrong with the Gemini API.";

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch (error) {
      // Ignore JSON parsing error
    }

    throw new Error(errorMessage);
  }

  // Read Gemini response
  const data = await response.json();

  console.log("FULL GEMINI API RESPONSE:", data);

  const summary = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    ?.join("")
    ?.trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary.");
  }

  return summary;
}
// ==========================================
// DISPLAY SUMMARY
// ==========================================

function displaySummary(summary, originalText) {
  currentSummary = summary;

  placeholderText.classList.add("d-none");

  // Use textContent so AI-generated text isn't interpreted as HTML
  outputBox.textContent = summary;

  // Copy button
  copyBtn.disabled = false;

  // ======================================
  // STATISTICS
  // ======================================

  const originalWords = countWords(originalText);
  const summaryWords = countWords(summary);

  let reduction = 0;

  if (originalWords > 0) {
    reduction = Math.round(
      ((originalWords - summaryWords) / originalWords) * 100,
    );
  }

  // Don't display a negative reduction
  reduction = Math.max(0, reduction);

  statOriginal.textContent = originalWords;
  statSummary.textContent = summaryWords;
  statReduced.textContent = `${reduction}%`;

  statsRow.classList.remove("d-none");
}

// ==========================================
// SUMMARIZE BUTTON
// ==========================================

summarizeBtn.addEventListener("click", async function () {
  try {
    // Prevent multiple requests
    summarizeBtn.disabled = true;

    const originalButtonText = summarizeBtn.textContent;

    summarizeBtn.textContent = "Summarizing...";

    // Get text from textarea or file
    const text = await getInputContent();

    // Check API key
    if (!GEMINI_API_KEY) {
      throw new Error("Please add your Gemini API key to the JavaScript file.");
    }

    // Show loading state
    placeholderText.classList.add("d-none");

    outputBox.textContent = "Generating your summary...";

    // Call OpenAI
    const summary = await summarizeText(text);

    // Display result
    displaySummary(summary, text);

    summarizeBtn.textContent = originalButtonText;
  } catch (error) {
    console.error("Summarization error:", error);

    outputBox.textContent = `Error: ${error.message}`;

    copyBtn.disabled = true;

    summarizeBtn.textContent = "Summarize";
  } finally {
    summarizeBtn.disabled = false;
  }
});

// ==========================================
// CLEAR BUTTON
// ==========================================

clearBtn.addEventListener("click", function () {
  inputText.value = "";

  selectedFile = null;

  fileInput.value = "";

  fileInfo.classList.add("d-none");

  fileName.textContent = "No file selected";

  updateWordCount();

  // Clear output
  currentSummary = "";

  outputBox.innerHTML = "";

  outputBox.appendChild(placeholderText);

  placeholderText.classList.remove("d-none");

  // Disable copy
  copyBtn.disabled = true;

  // Hide statistics
  statsRow.classList.add("d-none");
});

// ==========================================
// COPY SUMMARY
// ==========================================

copyBtn.addEventListener("click", async function () {
  if (!currentSummary) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentSummary);

    const originalText = copyBtn.textContent;

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1500);
  } catch (error) {
    console.error("Copy failed:", error);

    copyBtn.textContent = "Failed";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  }
});

// ==========================================
// DARK / LIGHT THEME
// ==========================================

if (themeSwitch) {
  themeSwitch.addEventListener("change", function () {
    document.body.classList.toggle("light-mode", themeSwitch.checked);
  });
}

// ==========================================
// INITIAL STATE
// ==========================================

updateWordCount();
