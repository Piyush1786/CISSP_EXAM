let questions = [];
let currentQuestion = 0;
let userAnswers = {};

function showCard(id) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('show'));
  document.getElementById(id).classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mixed-btn').onclick = () => startQuiz('questions.json');
  document.getElementById('scenario-btn').onclick = () => startQuiz('scenario.json');
  document.getElementById('domain-btn').onclick = () => showCard('domain-selection');
  document.getElementById('study-btn').onclick = () => showCard('study-section');

  document.getElementById('start-domain-btn').onclick = () => {
    const file = document.getElementById('domain-dropdown').value;
    startQuiz(file);
  };

  document.getElementById('back-btn-domain').onclick = () => showCard('start-screen');
  document.getElementById('back-btn-study').onclick = () => showCard('start-screen');
  document.getElementById('back-btn-quiz').onclick = () => {
    showCard('start-screen');
    questions = [];
    currentQuestion = 0;
    userAnswers = {};
    document.getElementById('results').innerText = '';
    removeExplanations();
  };

  document.getElementById('submit-btn').onclick = submitQuiz;
});

function startQuiz(file) {
  fetch(file)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        alert('Error: Question file is not a valid JSON array!');
        return;
      }
      questions = data;
      currentQuestion = 0;
      userAnswers = {};
      showCard('quiz-container');
      renderQuestion();
      renderNavigation();
      document.getElementById('results').innerText = '';
      removeExplanations();
    })
    .catch(() => {
      alert('Could not load question file!');
    });
}

function renderQuestion() {
  const question = questions[currentQuestion];
  const container = document.getElementById('question-area');
  container.innerHTML = `<div class="quiz-q">
    <span style="font-weight:700;">Q${currentQuestion + 1}.</span> ${question.question}
  </div>`;

  Object.entries(question.options).forEach(([key, value]) => {
    const option = document.createElement('div');
    option.className = 'option';
    option.innerText = `${key}. ${value}`;
    option.onclick = () => selectOption(key);
    if (userAnswers[currentQuestion] === key) option.classList.add('selected');
    container.appendChild(option);
  });

  removeExplanations();
  document.getElementById('results').innerText = '';
}

function renderNavigation() {
  const nav = document.getElementById('navigation');
  nav.innerHTML = '';
  questions.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.innerText = idx + 1;
    if (idx === currentQuestion) btn.classList.add('current');
    if (userAnswers[idx]) btn.classList.add('answered');
    btn.onclick = () => {
      currentQuestion = idx;
      renderQuestion();
      renderNavigation();
    };
    nav.appendChild(btn);
  });
}

function selectOption(optionKey) {
  userAnswers[currentQuestion] = optionKey;
  renderQuestion();
  renderNavigation();
}

function submitQuiz() {
  let score = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correct) score++;
  });
  document.getElementById('results').innerText = `You scored ${score} out of ${questions.length}`;

  renderQuestion();

  // Highlight current question options for feedback
  const options = document.querySelectorAll('.option');
  const q = questions[currentQuestion];
  options.forEach(option => {
    const key = option.innerText[0];
    if (key === q.correct) option.classList.add('correct');
    else if (userAnswers[currentQuestion] === key) option.classList.add('incorrect');
  });

  // Highlight wrong answers in navigation
  const nav = document.getElementById('navigation');
  const navBtns = nav.querySelectorAll('button');
  questions.forEach((q, idx) => {
    navBtns[idx].classList.remove('wrong'); // Reset first
    if (userAnswers[idx] !== q.correct) {
      navBtns[idx].classList.add('wrong');
    }
  });

  // Show explanations for all incorrect answers
  const explanationsDiv = document.createElement('div');
  explanationsDiv.style.marginTop = '32px';

  let wrongCount = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] !== q.correct) {
      wrongCount++;
      const block = document.createElement('div');
      block.style.background = '#fff8e5';
      block.style.border = '1.5px dashed #f4b942';
      block.style.padding = '18px 18px 13px 18px';
      block.style.marginBottom = '20px';
      block.style.borderRadius = '12px';

      block.innerHTML = `
        <div style="font-weight:700;margin-bottom:4px;">Q${idx + 1}. ${q.question}</div>
        <div><b>Your answer:</b> 
          <span style="color:#d32f2f;">${
            userAnswers[idx]
              ? userAnswers[idx] + '. ' + (q.options[userAnswers[idx]] || '')
              : "<span style='color:#888;'>No answer</span>"
          }</span></div>
        <div><b>Correct answer:</b> <span style="color:#388e3c;">${q.correct}. ${q.options[q.correct]}</span></div>
        <div style="margin-top:10px;"><b>Explanation:</b> ${q.explanation}</div>
      `;
      explanationsDiv.appendChild(block);
    }
  });

  removeExplanations();
  if (wrongCount > 0) {
    explanationsDiv.id = 'quiz-explanations';
    document.getElementById('results').insertAdjacentElement('afterend', explanationsDiv);
  }
}

function removeExplanations() {
  const oldEx = document.getElementById('quiz-explanations');
  if (oldEx) oldEx.remove();
}
document.getElementById('global-back-btn').onclick = () => {
  showCard('start-screen');
  questions = [];
  currentQuestion = 0;
  userAnswers = {};
  document.getElementById('results').innerText = '';
  removeExplanations();
};

