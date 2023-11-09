// селекторы
const progressCurrentElement = document.querySelector('.progress__current');
const scoreElement = document.querySelector('.score');
const quizBaseElement = document.querySelector('.quiz__base');

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
  const answersList = answerArr.reduce(function (accum, currentValue) {
    return (
      accum +
      `
      <li class="base__answer">
        <button class="quiz__button_secondary">${currentValue}</button>
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
    const response = await fetch(`http://localhost:3000/questions/${question}`);
    const data = await response.json();
    console.log(data);
    quizBaseElement.insertAdjacentHTML(
      'afterbegin',
      generateQuestionAnswersHTML(data.question, data.answers)
    );
    quizBaseElement.insertAdjacentHTML(
      'afterbegin',
      generateImageHTML(data.image)
    );
  } catch (error) {
    console.error(error);
  }
}

// function playQuiz() {
//   generateQuestionBlock(currentQuestion);
// }

// use data attributes

let currentQuestion = 1;

document.addEventListener('click', function (e) {
  console.log(e.target.classList);
  if (e.target.classList.contains('button-next')) {
    generateQuestionBlock(currentQuestion);
    currentQuestion++;
  }
});
