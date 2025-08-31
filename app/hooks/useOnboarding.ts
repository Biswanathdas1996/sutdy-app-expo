import { useState, useCallback } from "react";
import { UserAnswers, StepType } from "@/app/components";
import { ApiService } from "@/app/services/apiService";

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<StepType>("welcome");
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    level: "",
    purpose: [],
    skills: [],
    partner: "",
    language: "English",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = useCallback(async () => {
    const steps: StepType[] = [
      "welcome",
      "otpLogin",
      "intro",
      "level",
      "purpose",
      "skills",
      "partner",
      "recommendation",
    ];
    const currentIndex = steps.indexOf(currentStep);

    console.log("🔄 handleNext called:", {
      currentStep,
      currentIndex,
      nextStep: steps[currentIndex + 1],
      allSteps: steps,
    });

    setIsLoading(true);
    try {
      // If moving from level selection, update the API
      if (currentStep === "level" && userAnswers.level) {
        console.log("About to update English level:", userAnswers.level);
        const result = await ApiService.updateEnglishLevel(userAnswers.level);
        console.log("English level update result:", result);
        if (!result.success) {
          console.error("Failed to update English level:", result.message);
          // You might want to show an error message to the user here
        } else {
          console.log("✅ English level updated successfully!");
        }
      }

      // If moving from purpose selection, update the learning goals API
      if (currentStep === "purpose" && userAnswers.purpose.length > 0) {
        const result = await ApiService.updateLearningGoals(
          userAnswers.purpose
        );
        if (!result.success) {
          console.error("Failed to update learning goals:", result.message);
          // You might want to show an error message to the user here
        }
      }

      // If moving from skills selection, update the skills focus API
      if (currentStep === "skills" && userAnswers.skills.length > 0) {
        const result = await ApiService.updateSkillsFocus(userAnswers.skills);
        if (!result.success) {
          console.error("Failed to update skills focus:", result.message);
          // You might want to show an error message to the user here
        }
      }

      // If moving from partner selection, update the speaking partner API
      if (currentStep === "partner" && userAnswers.partner) {
        const result = await ApiService.updateSpeakingPartner(
          userAnswers.partner
        );
        if (!result.success) {
          console.error(
            "Failed to update speaking partner preference:",
            result.message
          );
          // You might want to show an error message to the user here
        }
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log("🚀 Moving to next step:", nextStep);
      setCurrentStep(nextStep);
    } else {
      console.log("⚠️ Already at last step or invalid step");
    }
  }, [
    currentStep,
    userAnswers.level,
    userAnswers.purpose,
    userAnswers.skills,
    userAnswers.partner,
  ]);

  const handleLevelSelect = useCallback((level: string) => {
    setUserAnswers((prev) => ({ ...prev, level }));
  }, []);

  const handlePurposeToggle = useCallback((purpose: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      purpose: prev.purpose.includes(purpose)
        ? prev.purpose.filter((p) => p !== purpose)
        : [...prev.purpose, purpose],
    }));
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }, []);

  const handlePartnerSelect = useCallback((partner: string) => {
    setUserAnswers((prev) => ({ ...prev, partner }));
  }, []);

  const handleLanguageSelect = useCallback((language: string) => {
    setUserAnswers((prev) => ({ ...prev, language }));
  }, []);

  const handleOTPLogin = useCallback(() => {
    setCurrentStep("otpLogin");
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setCurrentStep("welcome");
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    setCurrentStep("userProfile");
  }, []);

  const handleRegistrationSuccess = useCallback(() => {
    console.log("🎉 Registration successful, skipping to intro");
    setCurrentStep("intro");
  }, []);

  return {
    currentStep,
    setCurrentStep,
    userAnswers,
    setUserAnswers,
    handleNext,
    handleLevelSelect,
    handlePurposeToggle,
    handleSkillToggle,
    handlePartnerSelect,
    handleLanguageSelect,
    handleOTPLogin,
    handleBackToWelcome,
    handleNavigateToProfile,
    handleRegistrationSuccess,
    isLoading,
  };
};
