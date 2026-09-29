const form = document.getElementById('quiz');
const container = document.getElementById('questions');
const retry = document.getElementById('retry');
let order = [];
let score = 0;
let answered = 0;

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

function render() {
  const previous = order;
  order = shuffle(questions);
  if (order.every((item, index) => item === previous[index])) order.push(order.shift());
  score = 0;
  answered = 0;
  container.replaceChildren();
  order.forEach((item, index) => {
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.lang = 'es';
    legend.textContent = `${index + 1}. ${item.question}`;
    field.append(legend);
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.id = `feedback-${index}`;
    feedback.setAttribute('aria-live', 'polite');
    let graded = false;
    shuffle(item.choices.map((text, value) => ({text, value}))).forEach(choice => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${index}`;
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
        feedback.textContent = correct
          ? 'Correct'
          : `Correct Answer: ${item.choices[item.answer]}`;
        field.querySelectorAll('input').forEach(radio => { radio.disabled = true; });
        updateScore();
      });
    });
    field.append(feedback);
    container.append(field);
  });
  updateScore();
}

form.addEventListener('submit', event => event.preventDefault());
retry.addEventListener('click', () => {
  render();
  container.querySelector('input').focus();
});
render();
