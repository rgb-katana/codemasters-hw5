import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Question } from '../models/question.model';
import * as restService from '../rest';
import * as app from '..';

const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'Значение числа Пи (π)?',
    answers: ['3.14', '2.71', '1.61', '4.20'],
    image:
      'https://m.media-amazon.com/images/M/MV5BMTg4NTczNTk1N15BMl5BanBnXkFtZTcwNjg0MDE2MQ@@._V1_.jpg',
    altForImage: 'число пи',
  },
  {
    id: 2,
    question:
      'Как называется теорема, которая устанавливает связь между сторонами прямоугольного треугольника?',
    answers: [
      'Теорема Пифагора',
      'Теорема Ферма',
      'Теорема Эйлера',
      'Теорема Ньютона',
    ],
    image:
      'http://papakarp.ru/wp-content/uploads/2021/01/teorema-pifagora-1.png',
    altForImage: 'треугольник',
  },
  {
    id: 3,
    question: 'Чему равен квадратный корень из 144?',
    answers: ['10', '12', '14', '16'],
    image: 'https://i.ytimg.com/vi/ORl6bdJW89o/maxresdefault.jpg',
    altForImage: 'корень 144',
  },
];

describe('Quiz', () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div class="quiz main__quiz">
      <div class="quiz__heading">
        <h2 class="quiz__title">Простой квиз</h2>
        <div class="quiz__progress progress">
          <b class="progress__current">0</b> из <b class="quiz__total">0</b>
        </div>
        <div class="quiz__score">Score: <b class="score">0</b></div>
      </div>
      <div class="quiz__base base">
        <button type="button" class="quiz__button_main" id="start-button">
          Начать квиз
        </button>
      </div>
      <div class="quiz__status">
        <button class="button-next hide-button" type="button">
          Следующий
        </button>
      </div>
    </div>`;

    jest
      .spyOn(restService, 'get')
      .mockReturnValue(Promise.resolve(mockQuestions));
  });

  it('Current question and total score should be 0 at start', () => {
    expect(app.currentQuestion).toEqual(0);
    expect(app.totalScore).toEqual(0);
  });

  it('Should display total number of questions after DOMContentLoaded', () => {
    const progressTotalElement: HTMLElement =
      document.querySelector('.quiz__total')!;

    document.addEventListener('DOMContentLoaded', () => {
      expect(progressTotalElement).toEqual(mockQuestions.length);
    });
  });

  it('If start button exists it should start the game', () => {
    const startButton: HTMLElement | null =
      document.getElementById('start-button');

    const spyUpdate = jest.spyOn(app, 'updateProgress');
    const spyGenerateQuestionBlock = jest.spyOn(app, 'generateQuestionBlock');

    expect(app.currentQuestion).toEqual(0);

    if (startButton) {
      startButton.addEventListener('click', function () {
        expect(spyUpdate).toHaveBeenCalled();
        expect(app.currentQuestion).toEqual(app.currentQuestion + 1);
        expect(spyGenerateQuestionBlock).toHaveBeenCalled();
        expect(spyGenerateQuestionBlock).toHaveBeenNthCalledWith(
          app.currentQuestion
        );
      });
    }
  });

  it('If current progress > 10 should finish the game', () => {
    const spyFinish = jest.spyOn(app, 'finishGame');

    if (app.currentQuestion > 10) {
      // const userScore = document.querySelector('.progress__current');
      const replayButton = document.getElementById('start-button');
      expect(spyFinish).toHaveBeenCalled();
      expect(replayButton).toBeTruthy();
    }
  });

  it('If current progress is between 1 and 10 there should not be a restart button', () => {
    if (app.currentQuestion <= 10 && app.currentQuestion > 1) {
      const replayButton = document.getElementById('start-button');
      expect(replayButton).toBeFalsy();
    }
  });

  it('Next button should not be displayed if progress > 10', () => {
    const nextButton = app.nextButton;

    if (app.currentQuestion > 10) {
      expect(nextButton.classList).toContain('hide-button');
    }
  });

  it('Next button should update progress and load new question if progress < 10', () => {
    const spyUpdate = jest.spyOn(app, 'updateProgress');
    const spyGenerateQuestionBlock = jest.spyOn(app, 'generateQuestionBlock');
    const nextButton = app.nextButton;

    if (app.currentQuestion < 10 && app.currentQuestion > 0) {
      nextButton!.addEventListener('click', () => {
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyGenerateQuestionBlock).toHaveBeenCalled();
        expect(spyGenerateQuestionBlock).toHaveBeenCalledWith(
          app.currentQuestion
        );
      });
    }
  });
});
