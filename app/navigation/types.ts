import { UserAnswers } from "../components/types";

export type RootStackParamList = {
  WelcomeScreen: undefined;
  AIIntroduction: { name: string };
  LevelSelection: { name: string };
  PurposeSelection: { name: string; level: string };
  SkillsSelection: { name: string; level: string; purposes: string[] };
  PartnerSelection: {
    name: string;
    level: string;
    purposes: string[];
    skills: string[];
  };
  Recommendation: { name: string; userAnswers: UserAnswers };
};
