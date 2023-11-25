import * as restService from './rest.js';
import { Answer } from './models/answer.model.js';
import { Question } from './models/question.model.js';

// селекторы
const progressCurrentElement: HTMLElement =
  document.querySelector('.progress__current')!;
const progressTotalElement: HTMLElement =
  document.querySelector('.quiz__total')!;
const scoreElement: HTMLElement = document.querySelector('.score')!;
const quizBaseElement: HTMLElement = document.querySelector('.quiz__base')!;
const nextButton: HTMLButtonElement = document.querySelector('.button-next')!;

// QUIZ main variables
let currentQuestion: number = 0;
let totalScore: number = 0;

function generateImageHTML(link: string, alt: string): void {
  const imageElement = document.createElement('img');
  imageElement.src = link;
  imageElement.alt = alt;
  imageElement.classList.add(`base__image`);

  quizBaseElement.insertAdjacentHTML(
    'afterbegin',
    `<span class="loader quiz__loader"></span>`
  );

  imageElement.onload = function () {
    const loader: HTMLElement = document.querySelector('.loader')!;
    loader.remove();
    quizBaseElement.prepend(imageElement);
  };
}

addEventListener('DOMContentLoaded', async () => {
  const data = await restService.get<Question[]>('questions');
  progressTotalElement.innerHTML = `${data.length}`;
});

function generateQuestionAnswersHTML(question: string, answerArr: string[]) {
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

async function generateQuestionBlock(question: string) {
  quizBaseElement.innerHTML = '';

  try {
    const data: Question = await restService.get(`questions/${question}`);
    quizBaseElement.insertAdjacentHTML(
      'afterbegin',
      generateQuestionAnswersHTML(data.question, data.answers)
    );
    generateImageHTML(data.image, data.altForImage);
  } catch (error) {
    console.error(error);
  }
}

async function countOneQuestion(userPick: number) {
  const result: Answer = await restService.get(`answers/${currentQuestion}`);
  const currentRightAnswer = result.correctIndex;
  const isUserCorrect = userPick === currentRightAnswer;

  const correctElement: HTMLElement = document.querySelector(
    `[data-answer-number="${currentRightAnswer}"]`
  )!;

  correctElement.classList.add('correct-answer');

  if (!isUserCorrect) {
    const userChoiceElement: HTMLElement = document.querySelector(
      `[data-answer-number="${userPick}"]`
    )!;
    userChoiceElement.classList.add('wrong-answer');
  } else {
    totalScore += 1;
    scoreElement.textContent = String(totalScore);
  }

  const allButtonElements: NodeListOf<HTMLButtonElement> =
    document.querySelectorAll('.quiz__button_secondary');

  allButtonElements.forEach(button => {
    button.disabled = true;
  });

  nextButton.classList.remove('hide-button');
  nextButton.classList.add('show-button');
}

function updateProgress() {
  currentQuestion++;
  progressCurrentElement.textContent = String(currentQuestion);
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
  const answerButtons: NodeListOf<HTMLElement> = document.querySelectorAll(
    '.quiz__button_secondary'
  );

  answerButtons.forEach(button => {
    button.addEventListener('click', () => {
      const chosenAnswer = Number(button.dataset.answerNumber);
      countOneQuestion(chosenAnswer);
    });
  });
}

nextButton.addEventListener('click', async function (e) {
  const target = e.target as Element;
  target.classList.remove('show-button');
  target.classList.add('hide-button');

  updateProgress();

  if (currentQuestion > 10) {
    finishGame();
  } else {
    await generateQuestionBlock(String(currentQuestion));
    selectAnswersForQuestions();
  }
});

function playGame() {
  const startButton: HTMLElement = document.getElementById('start-button')!;

  startButton.addEventListener('click', async function (e) {
    currentQuestion = 0;
    totalScore = 0;
    scoreElement.textContent = '0';
    updateProgress();
    await generateQuestionBlock(String(currentQuestion));
    selectAnswersForQuestions();
  });
}

playGame();
