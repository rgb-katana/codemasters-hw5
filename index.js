import * as restService from './rest.js';

// селекторы
const progressCurrentElement = document.querySelector('.progress__current');
const scoreElement = document.querySelector('.score');
const quizBaseElement = document.querySelector('.quiz__base');
const quizElement = document.querySelector('.quiz');
const nextButton = document.querySelector('.button-next');

// QUIZ main variables
let currentQuestion = 0;
let totalScore = 0;

function generateImageHTML(link, alt) {
  return `
  <img
    class="base__image"
    src="${link}"
    alt="${alt}"
    />
  `;
}

function generateQuestionAnswersHTML(question, answerArr) {
  const questionHeading = `<h2 class="base__question">${question}</h2>`;
  const answersList = answerArr.reduce(function (accum, currentValue, index) {
    return (
      accum +
      `
      <li class="base__answer">
        <button class="quiz__button_secondary" data-answer-number="${index}">${currentValue}</button>
      </li>
    `
    );
  }, '');
  const answersBlock = `<ul class="base__answers">${answersList}</ul>`;
  return `
    ${questionHeading}
    ${answersBlock}
  `;
}

async function generateQuestionBlock(question) {
  quizBaseElement.innerHTML = '';

  try {
    const data = await restService.get(`questions/${question}`);
    quizBaseElement.insertAdjacentHTML(
      'afterbegin',
      generateQuestionAnswersHTML(data.question, data.answers)
    );
    quizBaseElement.insertAdjacentHTML(
      'afterbegin',
      generateImageHTML(data.image) /* Тут не используется alt*/
    );
  } catch (error) {
    console.error(error);
  }
}

async function countOneQuestion(userPick) {
  const result = await restService.get(`answers/${currentQuestion}`);
  const currentRightAnswer = result.correctIndex;
  const isUserCorrect = userPick === currentRightAnswer;

  const correctElement = document.querySelector(
    `[data-answer-number="${currentRightAnswer}"]`
  );
  correctElement.classList.add('correct-answer');

  if (!isUserCorrect) {
    const userChoiceElement = document.querySelector(
      `[data-answer-number="${userPick}"]`
    );
    userChoiceElement.classList.add('wrong-answer');
  } else {
    totalScore += 1;
    scoreElement.textContent = totalScore;
  }

  const allButtonElements = document.querySelectorAll(
    '.quiz__button_secondary'
  );

  allButtonElements.forEach(button => {
    button.disabled = true;
  });

  nextButton.classList.remove('hide-button');
  nextButton.classList.add('show-button');
}

function updateProgress() {
  currentQuestion++;
  progressCurrentElement.textContent = currentQuestion;
}

function finishGame() {
  quizBaseElement.innerHTML = '';

  progressCurrentElement.textContent = '10';

  const results = `
    <h3>Ваш счет:</h3>
    <div class="quiz__progress progress quiz__progress_end">
      <b class="progress__current">${totalScore}</b> из
      <b class="quiz__total">10</b>
    </div>
  `;
  const replayButton = `
    <button type="button" class="quiz__button_main">Сыграть снова</button>
  `;

  quizBaseElement.insertAdjacentHTML(
    'afterbegin',
    `
    ${results}
    ${replayButton}
  `
  );
}

/*
 Не лучшая идея добавлять такой обработчик. Он будет срабатывать на все клики внутри формы, это удар по производительности (небольшой но всё же)
  Тут стоит получть конкретную кнопку по её id и добавить обработчик конкретно к ней. Тогда еще и проблема с тем что функция делает много всего пропадёт
*/
quizElement.addEventListener('click', function (e) {
  /* Эта функция делает слишком много всего, лучше разбить её на несколько, так и тестировать проще будет*/

  if (e.target.classList.contains('quiz__button_main')) {  // Тут лучше пологаться на id поскольку quiz__button_main может быть чем угодно, судя по названию
    currentQuestion = 0;
    totalScore = 0;
    scoreElement.textContent = 0;
    updateProgress();
    generateQuestionBlock(currentQuestion);
  }
  if (e.target.classList.contains('quiz__button_secondary')) {
    const chosenAnswer = Number(e.target.dataset.answerNumber);
    countOneQuestion(chosenAnswer);
  }
  if (e.target.classList.contains('button-next')) {
    nextButton.classList.remove('show-button');
    nextButton.classList.add('hide-button');
    updateProgress();
    if (currentQuestion > 10) {
      finishGame();
    } else {
      generateQuestionBlock(currentQuestion);
    }
  }
});
