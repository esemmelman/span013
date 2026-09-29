import json
import re
from pathlib import Path

source = Path('spanish-quiz.html').read_text(encoding='utf-8')
questions = []
for i, (question, choices) in enumerate(re.findall(r'<h2 lang="es">\d+\. (.*?)</h2><ol type="A">(.*?)</ol>', source)):
    questions.append({'question': question, 'choices': re.findall(r'<li>(.*?)</li>', choices), 'answer': i % 4})
assert len(questions) == 14
Path('questions.js').write_text('const questions = ' + json.dumps(questions, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
