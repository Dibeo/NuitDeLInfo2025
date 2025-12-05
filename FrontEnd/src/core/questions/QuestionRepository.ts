import quizData from './questions.json';

export interface Question {
  question: string;
  a: string;
  b: string;
  correctAnswer: string; // Ajouté pour pouvoir valider la réponse
}

export default class {
  public static getQuestion(index: number): Question | null {
    if (index < 0 || index >= quizData.length) {
      return null;
    }
    return quizData[index] as Question;
  }

  public static getCount(): number {
    return quizData.length;
  }
}
