// ===============================
// CONFIGURATION
// ===============================

// 👉 PASTE YOUR OPENAI API KEY HERE LOCALLY
// ❌ Do NOT push the real key to GitHub
const OPENAI_API_KEY = "API_KEY_NOT_PROVIDED";
let currentQuestions = [];

// ===============================
// GENERATE QUESTIONS (LLM)
// ===============================
async function generateQuestions() {
    const role = document.getElementById("role").value.trim();
    const difficulty = document.getElementById("difficulty").value;
    const status = document.getElementById("status");
    const list = document.getElementById("questionList");

    if (!role) {
        alert("Please enter a role");
        return;
    }

    list.innerHTML = "";
    status.innerText = "Generating questions using AI...";

    const prompt = `
Generate 10 interview questions for a ${role} at ${difficulty} level.
Questions should be clear and relevant.
`;

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + OPENAI_API_KEY
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7
                })
            }
        );

        const data = await response.json();
        const text = data.choices[0].message.content;

        currentQuestions = text
            .split("\n")
            .filter(q => q.trim());

        status.innerText = "Questions generated using LLM";

    } catch (error) {
        // Fallback if API fails
        currentQuestions = [
            "What is SDLC?",
            "Explain REST API.",
            "Difference between frontend and backend?",
            "What is OOP?",
            "What is a database?"
        ];
        status.innerText = "LLM failed, showing demo questions";
    }

    currentQuestions.forEach(q => {
        const li = document.createElement("li");
        li.innerText = q;
        list.appendChild(li);
    });
}

// ===============================
// SAVE QUESTION SET
// ===============================
function saveSet() {
    if (currentQuestions.length === 0) {
        alert("No questions to save");
        return;
    }

    const sets = JSON.parse(localStorage.getItem("questionSets")) || [];

    sets.push({
        role: document.getElementById("role").value,
        difficulty: document.getElementById("difficulty").value,
        questions: currentQuestions,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("questionSets", JSON.stringify(sets));
    loadSavedSets();
}

// ===============================
// LOAD SAVED SETS
// ===============================
function loadSavedSets() {
    const list = document.getElementById("savedSets");
    list.innerHTML = "";

    const sets = JSON.parse(localStorage.getItem("questionSets")) || [];

    sets.forEach(set => {
        const li = document.createElement("li");
        li.innerText = `${set.role} - ${set.difficulty} (${set.time})`;
        li.onclick = () => {
            document.getElementById("questionList").innerHTML =
                set.questions.map(q => `<li>${q}</li>`).join("");
        };
        list.appendChild(li);
    });
}

// ===============================
// EXPORT CSV
// ===============================
function exportCSV() {
    const sets = JSON.parse(localStorage.getItem("questionSets")) || [];
    if (sets.length === 0) {
        alert("No saved data");
        return;
    }

    const lastSet = sets[sets.length - 1];
    let csv = "Question\n";

    lastSet.questions.forEach(q => {
        csv += `"${q.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "interview_questions.csv";
    a.click();
}

// Load saved data on page load
loadSavedSets();
