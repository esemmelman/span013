const form = document.getElementById('quiz');
const container = document.getElementById('questions');
const retry = document.getElementById('retry');
let order = [];
let score = 0;
let answered = 0;
let current = 0;
let advanceTimer;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function updateScore() {
  document.getElementById('progress-text').textContent = `${answered} of ${questions.length} answered`;
  document.getElementById('progress').value = answered;
  document.getElementById('score').textContent = answered === questions.length
    ? `Final score: ${score} out of ${questions.length} (${Math.round(score / questions.length * 100)}%)`
    : `Score: ${score} correct · ${answered} answered`;
}

function enableTranslations(legend, item) {
  legend.replaceChildren(document.createTextNode(`${current + 1}. `));
  item.question.split(' ').forEach((word, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word';
    button.textContent = word;
    button.lang = 'es';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Translate ${word} into English`);
    button.addEventListener('click', () => {
      const translated = button.getAttribute('aria-pressed') !== 'true';
      button.textContent = translated ? item.wordTranslations[index] : word;
      button.lang = translated ? 'en' : 'es';
      button.setAttribute('aria-pressed', String(translated));
      button.setAttribute('aria-label', translated ? `${item.wordTranslations[index]}. Show Spanish word` : `Translate ${word} into English`);
    });
    legend.append(button, document.createTextNode(' '));
  });
}

function advance() {
  clearTimeout(advanceTimer);
  current++;
  showQuestion(true);
}

function showQuestion(focus = false) {
  container.replaceChildren();
  if (current >= order.length) {
    const complete = document.createElement('h2');
    complete.textContent = 'Quiz complete!';
    complete.tabIndex = -1;
    container.append(complete);
    if (focus) complete.focus();
    return;
  }
  const item = order[current];
  const field = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.lang = 'es';
  legend.tabIndex = -1;
  legend.textContent = `${current + 1}. ${item.question}`;
  field.append(legend);
  const feedback = document.createElement('p');
  feedback.className = 'feedback';
  feedback.id = 'feedback';
  feedback.setAttribute('aria-live', 'polite');
  let graded = false;
  shuffle(item.choices.map((text, value) => ({text, value}))).forEach(choice => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = choice.value;
    input.setAttribute('aria-describedby', feedback.id);
    const text = document.createElement('span');
    text.textContent = choice.text;
    label.append(input, text);
    field.append(label);
    input.addEventListener('change', () => {
      if (graded) return;
      graded = true;
      const correct = choice.value === item.answer;
      answered++;
      if (correct) score++;
      field.classList.add(correct ? 'correct' : 'incorrect');
      feedback.textContent = correct ? 'Correct' : `Correct Answer: ${item.choices[item.answer]}`;
      field.querySelectorAll('input').forEach(radio => { radio.disabled = true; });
      updateScore();
      if (correct) {
        advanceTimer = setTimeout(advance, 2000);
      } else {
        enableTranslations(legend, item);
        const hint = document.createElement('p');
        hint.textContent = 'Click a Spanish word to see its English meaning. Click again to switch back.';
        field.append(hint);
        const next = document.createElement('button');
        next.type = 'button';
        next.id = 'next';
        next.textContent = current === order.length - 1 ? 'Finish quiz' : 'Next';
        next.addEventListener('click', advance, {once: true});
        container.append(next);
      }
    });
  });
  field.append(feedback);
  container.append(field);
  if (focus) legend.focus();
}

function restart(focus = false) {
  clearTimeout(advanceTimer);
  const previous = order;
  order = shuffle(questions);
  if (order.every((item, index) => item === previous[index])) order.push(order.shift());
  score = 0;
  answered = 0;
  current = 0;
  updateScore();
  showQuestion(focus);
}

form.addEventListener('submit', event => event.preventDefault());
retry.addEventListener('click', () => restart(true));
restart();
