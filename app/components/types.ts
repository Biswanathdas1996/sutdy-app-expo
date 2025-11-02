export interface UserAnswers {
  level: string;
  purpose: string[];
  skills: string[];
  partner: string;
  language: string;
}

export interface Option {
  name: string;
  emoji: string;
  color: string;
}

export type StepType =
  | "welcome"
  | "otpLogin"
  | "userProfile"
  | "plans"
  | "intro"
  | "level"
  | "purpose"
  | "skills"
  | "partner"
  | "recommendation";

export interface ScreenProps {
  onNext: () => void;
  onBack?: () => void;
  userAnswers?: UserAnswers;
  setUserAnswers?: (answers: UserAnswers) => void;
  name?: string;
  isSpeaking?: boolean;
}
