const savedTheme = localStorage.getItem("network-learning-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const page = document.body.dataset.page;
const themeToggle = document.getElementById("themeToggle");
const themeModes = document.querySelectorAll("[data-theme-mode]");

function applyTheme(mode) {
  document.body.classList.toggle("dark", mode === "dark");
  if (themeToggle) {
    themeToggle.checked = mode === "light";
    themeToggle.setAttribute(
      "aria-label",
      mode === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"
    );
  }
  themeModes.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.themeMode === mode);
  });
  localStorage.setItem("network-learning-theme", mode);
}

applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === page) {
    link.classList.add("active");
  }
});

document.querySelectorAll("[data-quiz-form]").forEach((quizForm) => {
  const resultBox = quizForm.querySelector("[data-quiz-result]");
  const questions = Array.from(quizForm.querySelectorAll("[data-question]"));

  if (!resultBox || questions.length === 0) {
    return;
  }

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let score = 0;
    let answered = 0;
    const feedback = [];

    questions.forEach((question, index) => {
      question.classList.remove("is-correct", "is-wrong");

      const selected = question.querySelector('input[type="radio"]:checked');
      const correct = question.querySelector('input[type="radio"][data-correct="true"]');
      const explanation = question.dataset.explanation;
      const label = question.dataset.question || `q${index + 1}`;

      if (selected) {
        answered += 1;
      }

      if (!selected || !correct) {
        return;
      }

      const isCorrect = selected === correct;

      question.classList.add(isCorrect ? "is-correct" : "is-wrong");

      if (isCorrect) {
        score += 1;
      }

      if (explanation) {
        feedback.push(`<li>${label.toUpperCase()}: ${explanation}</li>`);
      }
    });

    if (answered < questions.length) {
      resultBox.innerHTML = `
        <strong>未回答があります</strong>
        <div class="muted">${questions.length}問すべて回答してから採点してください。</div>
      `;
      return;
    }

    const ratio = score / questions.length;
    let summary = "";

    if (ratio === 1) {
      summary = "満点です。この単元の要点がかなりしっかり整理できています。";
    } else if (ratio >= 0.75) {
      summary = "良い結果です。構成図とコマンド例をもう一度見ると、さらに定着しやすくなります。";
    } else if (ratio >= 0.5) {
      summary = "基礎は掴めています。構成図のIPと機器の役割を見直してから、もう一度答えると理解が深まります。";
    } else {
      summary = "ここから伸ばせます。最初の構成図と step by step を上から見直してから再挑戦してみてください。";
    }

    resultBox.innerHTML = `
      <strong>スコア: ${score} / ${questions.length}</strong>
      <div class="muted">${summary}</div>
      <ol class="feedback-list">${feedback.join("")}</ol>
    `;
  });
});
