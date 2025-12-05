import UserProgressRepository from '../UserProgressAPI/UserProgressRepository';
import QuestionRepository, { Question } from './QuestionRepository';

export default class {
  private _count: number = 0;
  private _currentQuestion: Question | null = null;

  constructor() {
    this._loadQuestion();
  }

  // public getCount(): number {
  //   return QuestionRepository.getCount();
  // }

  public reset(): void {
    UserProgressRepository.resetXp();
    this._count = 0;
    this._loadQuestion();
  }

  public next(): void {
    this._count++;
    this._loadQuestion();
  }

  public choose(answer: 'A' | 'B'): boolean {
    if (!this._currentQuestion) {
      return false;
    }
    const choiceKey = answer.toLowerCase();
    const correctKey = this._currentQuestion.correctAnswer.toLowerCase();
    const success: boolean = correctKey.endsWith(choiceKey);
    if (success) {
      UserProgressRepository.addXp(1);
    }
    return success;
  }

  public getQuestion(): string {
    return this._currentQuestion?.question || '';
  }

  public getAnswers(): string[] {
    console.log(this._currentQuestion);
    if (!this._currentQuestion) {
      return [];
    }
    return [this._currentQuestion.a, this._currentQuestion.b];
  }

  public isFinished(): boolean {
    return this._currentQuestion === null;
  }

  private _loadQuestion(): void {
    this._currentQuestion = QuestionRepository.getQuestion(this._count);
  }
}
