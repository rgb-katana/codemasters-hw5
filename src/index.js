import * as restService from './rest.js';

// селекторы
const progressCurrentElement = document.querySelector('.progress__current');
const progressTotalElement = document.querySelector('.quiz__total');
const scoreElement = document.querySelector('.score');
const quizBaseElement = document.querySelector('.quiz__base');
const nextButton = document.querySelector('.button-next');

// QUIZ main variables
let currentQuestion = 0;
let totalScore = 0;

function generateImageHTML(link, alt) {
  const imageElement = document.createElement('img');
  imageElement.src = link;
  imageElement.alt = alt;
  imageElement.classList.add(`base__image`);

  quizBaseElement.insertAdjacentHTML(
    'afterbegin',
    `<span class="loader quiz__loader"></span>`
  );

  imageElement.onload = function () {
    const loader = document.querySelector('.loader');
    loader.remove();
    quizBaseElement.prepend(imageElement);
  };
}

addEventListener('DOMContentLoaded', async () => {
  const data = await restService.get('questions');
  progressTotalElement.innerHTML = `${data.length}`;
});

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
    generateImageHTML(data.image, data.altForImage);
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
    <button type="button" class="quiz__button_main" id="start-button">Начать квиз снова</button>
  `;

  quizBaseElement.insertAdjacentHTML(
    'afterbegin',
    `
    ${results}
    ${replayButton}
  `
  );

  playGame();
}

function selectAnswersForQuestions() {
  const answerButtons = document.querySelectorAll('.quiz__button_secondary');

  answerButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      const chosenAnswer = Number(e.target.dataset.answerNumber);
      countOneQuestion(chosenAnswer);
    });
  });
}

nextButton.addEventListener('click', async function (e) {
  e.target.classList.remove('show-button');
  e.target.classList.add('hide-button');

  updateProgress();

  if (currentQuestion > 10) {
    finishGame();
  } else {
    await generateQuestionBlock(currentQuestion);
    selectAnswersForQuestions();
  }
});

function playGame() {
  const startButton = document.getElementById('start-button');

  startButton.addEventListener('click', async function (e) {
    currentQuestion = 0;
    totalScore = 0;
    scoreElement.textContent = 0;
    updateProgress();
    await generateQuestionBlock(currentQuestion);
    selectAnswersForQuestions();
  });
}

playGame();