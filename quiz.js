const form = document.getElementById('quiz');
const container = document.getElementById('questions');
const retry = document.getElementById('retry');
let order = [];
let score = 0;
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
    complete.textContent = `Quiz complete! ${Math.round(score / questions.length * 100)}% correct`;
    complete.tabIndex = -1;
    container.append(complete);
    if (focus) complete.focus();
    return;
  }
  const item = order[current];
  const field = document.createElement('fieldset');
  const answerRow = document.createElement('div');
  answerRow.className = 'answer-row';
  answerRow.append(field);
  const legend = document.createElement('h2');
  legend.id = 'question-title';
  field.setAttribute('aria-labelledby', legend.id);
  legend.lang = 'es';
  legend.tabIndex = -1;
  legend.textContent = `${current + 1}. ${item.question}`;
  let graded = false;
  shuffle(item.choices.map((text, value) => ({text, value}))).forEach(choice => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = choice.value;
    const text = document.createElement('span');
    text.textContent = choice.text;
    label.append(input, text);
    field.append(label);
    input.addEventListener('change', () => {
      if (graded) return;
      graded = true;
      const correct = choice.value === item.answer;
      if (correct) score++;
      field.classList.add(correct ? 'correct' : 'incorrect');
      field.querySelector(`input[value="${item.answer}"]`).closest('label').classList.add('right-answer');
      field.querySelectorAll('input').forEach(radio => { radio.disabled = true; });
      if (correct) {
        advanceTimer = setTimeout(advance, 2000);
      } else {
        enableTranslations(legend, item);
        const next = document.createElement('button');
        next.type = 'button';
        next.id = 'next';
        next.textContent = 'Next';
        next.lang = 'en';
        next.addEventListener('click', advance, {once: true});
        const navigation = document.createElement('div');
        navigation.className = 'question-navigation';
        navigation.append(next);
        field.prepend(navigation);
      }
    });
  });
  container.append(legend, answerRow);
  if (focus) legend.focus();
}

function restart(focus = false) {
  clearTimeout(advanceTimer);
  const previous = order;
  order = shuffle(questions);
  if (order.every((item, index) => item === previous[index])) order.push(order.shift());
  score = 0;
  current = 0;
  showQuestion(focus);
}

form.addEventListener('submit', event => event.preventDefault());
retry.addEventListener('click', () => restart(true));
restart();
