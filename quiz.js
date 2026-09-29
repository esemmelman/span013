const form = document.getElementById('quiz');
const container = document.getElementById('questions');
const results = document.getElementById('results');
const retry = document.getElementById('retry');
const notice = document.getElementById('notice');
let graded = false;

function render() {
  graded = false;
  container.replaceChildren();
  questions.forEach((item, index) => {
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.lang = 'es';
    legend.textContent = `${index + 1}. ${item.question}`;
    field.append(legend);
    const choices = item.choices.map((text, value) => ({text, value}));
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    choices.forEach(choice => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${index}`;
      input.value = choice.value;
      const text = document.createElement('span');
      text.textContent = choice.text;
      label.append(input, text);
      field.append(label);
    });
    container.append(field);
  });
  notice.textContent = '';
  results.hidden = true;
  retry.hidden = true;
  document.getElementById('check').hidden = false;
  updateProgress();
}

function updateProgress() {
  const answered = container.querySelectorAll('input:checked').length;
  document.getElementById('progress-text').textContent = `${answered} of ${questions.length} answered`;
  document.getElementById('progress').value = answered;
  notice.textContent = '';
}

form.addEventListener('change', updateProgress);
form.addEventListener('submit', event => {
  event.preventDefault();
  if (graded) return;
  const fields = [...container.querySelectorAll('fieldset')];
  const missing = fields.find(field => !field.querySelector('input:checked'));
  if (missing) {
    notice.textContent = 'Please answer all 14 questions before checking your score.';
    missing.querySelector('input').focus();
    return;
  }
  let score = 0;
  fields.forEach((field, index) => {
    const correct = Number(field.querySelector('input:checked').value) === questions[index].answer;
    if (correct) score++;
    field.classList.add(correct ? 'correct' : 'incorrect');
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.textContent = correct ? 'Correct!' : `Correct answer: ${questions[index].choices[questions[index].answer]}`;
    field.append(feedback);
    field.querySelectorAll('input').forEach(input => { input.disabled = true; });
  });
  graded = true;
  results.replaceChildren();
  const heading = document.createElement('h2');
  heading.id = 'score';
  heading.textContent = `You scored ${score} out of 14 (${Math.round(score / 14 * 100)}%)`;
  const message = document.createElement('p');
  message.textContent = score === 14 ? 'Perfect score! You understood every question.' : 'Review the feedback above, then try again to practice.';
  results.append(heading, message);
  results.hidden = false;
  retry.hidden = false;
  document.getElementById('check').hidden = true;
  results.focus();
});
retry.addEventListener('click', () => {
  render();
  container.querySelector('input').focus();
});
render();
