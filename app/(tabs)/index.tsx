import React, { useState, useEffect } from "react";
import { ThemedText } from "../../components/ThemedText";
import {
  WelcomeScreenComponent,
  OTPLoginComponent,
  AIIntroductionComponent,
  LevelSelectionComponent,
  PurposeSelectionComponent,
  SkillsSelectionComponent,
  PartnerSelectionComponent,
  RecommendationComponent,
  SkipPopup,
  BenefitsModal,
  UserProfileComponent,
} from "@/app/components";
import { useSpeech } from "@/app/hooks/useSpeech";
import { useOnboarding } from "@/app/hooks/useOnboarding";
import { AuthService } from "@/app/services/authService";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/Colors";

export default function WelcomeScreen() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { isSpeaking, speakText, stopSpeaking } = useSpeech();
  const {
    currentStep,
    setCurrentStep,
    userAnswers,
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
  } = useOnboarding();

  const handleMembershipSuccess = () => {
    // Close the benefits modal
    setShowBenefitsModal(false);
    // Navigate to OTP login screen
    setCurrentStep("otpLogin");
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      const isLoggedIn = await AuthService.isLoggedIn();
      console.log("🔍 Checking auth status:", isLoggedIn);
      if (isLoggedIn) {
        const user = await AuthService.getCurrentUser();
        console.log("✅ User is logged in:", user);
        // Navigate to profile if user is logged in
        setCurrentStep("userProfile");
      } else {
        console.log("❌ User is not logged in");
        // Ensure we're on welcome screen if not logged in
        setCurrentStep("welcome");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setCurrentStep("welcome");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Handler for sign out that refreshes auth status
  const handleSignOutAndRefresh = async () => {
    console.log("🚪 handleSignOutAndRefresh called from profile");
    
    try {
      // First, immediately navigate to welcome screen
      console.log("📍 Step 1: Setting current step to welcome");
      setCurrentStep("welcome");
      
      // Then recheck auth status to ensure we're logged out
      console.log("📍 Step 2: Rechecking auth status");
      const isStillLoggedIn = await AuthService.isLoggedIn();
      console.log("🔍 Rechecking auth after sign out:", isStillLoggedIn);
      
      if (!isStillLoggedIn) {
        console.log("✅ Sign out verified successfully");
      } else {
        console.error("⚠️ Warning: User still appears logged in after sign out!");
      }
    } catch (error) {
      console.error("❌ Error during sign out refresh:", error);
      // Ensure we're on welcome anyway
      setCurrentStep("welcome");
    }
  };

  // Render the appropriate screen based on current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WelcomeScreenComponent
            onNext={handleRegistrationSuccess}
            onOTPLogin={handleOTPLogin}
            setName={setName}
            setMobile={setMobile}
            name={name}
            mobile={mobile}
          />
        );
      case "otpLogin":
        return (
          <OTPLoginComponent
            onNext={handleNext}
            onSignUpRedirect={handleBackToWelcome}
            onLoginSuccess={handleNavigateToProfile}
          />
        );
      case "userProfile":
        return (
          <UserProfileComponent
            onBack={handleSignOutAndRefresh}
            onEditProfile={() => {
              // TODO: Add edit profile functionality
            }}
          />
        );
      case "intro":
        return (
          <AIIntroductionComponent
            onNext={handleNext}
            name={name}
            isSpeaking={isSpeaking}
          />
        );
      case "level":
        return (
          <LevelSelectionComponent
            onNext={handleNext}
            selectedLevel={userAnswers.level}
            onLevelSelect={handleLevelSelect}
            isSpeaking={isSpeaking}
            isLoading={isLoading}
          />
        );
      case "purpose":
        return (
          <PurposeSelectionComponent
            onNext={handleNext}
            selectedPurposes={userAnswers.purpose}
            onPurposeToggle={handlePurposeToggle}
            isSpeaking={isSpeaking}
            isLoading={isLoading}
          />
        );
      case "skills":
        return (
          <SkillsSelectionComponent
            onNext={handleNext}
            selectedSkills={userAnswers.skills}
            onSkillToggle={handleSkillToggle}
            isSpeaking={isSpeaking}
          />
        );
      case "partner":
        return (
          <PartnerSelectionComponent
            onNext={handleNext}
            selectedPartner={userAnswers.partner}
            onPartnerSelect={handlePartnerSelect}
            isSpeaking={isSpeaking}
          />
        );
      case "recommendation":
        return (
          <RecommendationComponent
            userAnswers={userAnswers}
            onLanguageSelect={handleLanguageSelect}
            onSkipPress={() => setShowSkipPopup(true)}
            isSpeaking={isSpeaking}
          />
        );
      default:
        return (
          <WelcomeScreenComponent
            onNext={handleRegistrationSuccess}
            onOTPLogin={handleOTPLogin}
            setName={setName}
            setMobile={setMobile}
            name={name}
            mobile={mobile}
          />
        );
    }
  };

  // Speech effect - trigger speech when stepping into new screens
  useEffect(() => {
    stopSpeaking();

    switch (currentStep) {
      case "intro":
        speakText(
          `Hello ${name}, and welcome to SpeakEdge! My name is Rose, and I'm delighted to be your personal AI English tutor. I'm here to support you on your journey to mastering English with carefully tailored lessons and engaging practice sessions. To ensure I provide you with the best possible learning experience, I'd love to ask you a few questions to personalize your lessons. Shall we begin?`
        );
        break;
      case "level":
        speakText(
          "Now, let's talk about your current English proficiency. Could you please let me know what level you feel most comfortable with? You can choose from Beginner, Elementary, Intermediate, Upper Intermediate, Advanced, or Proficient. Take your time to select the option that best represents your current abilities."
        );
        break;
      case "purpose":
        speakText(
          "I'm curious to learn about your motivation for learning English. What are your main goals? Please feel free to select all the purposes that resonate with you. Whether it's for work, travel, education, or personal growth, I'd love to understand what drives your learning journey."
        );
        break;
      case "skills":
        speakText(
          "Wonderful! Now, let's focus on the specific skills you'd like to develop. Which areas of English would you most like to improve? You can select multiple skills - perhaps speaking for confidence, listening for better comprehension, reading for academic purposes, or writing for professional communication. Please choose all that interest you."
        );
        break;
      case "partner":
        speakText(
          "That's excellent progress! I have one more question for you. Would you be interested in practicing with a speaking partner? Having conversation practice can be incredibly valuable for building confidence and fluency. Please let me know if you'd like this option - simply choose yes or no based on your preference."
        );
        break;
      case "recommendation":
        speakText(
          `Thank you so much for sharing that information with me, ${name}. Based on everything you've told me, I'm pleased to recommend our ${userAnswers.level} English course, which I believe will be perfectly suited to your needs and goals. Let me now guide you through the simple process of getting started with your personalized learning journey.`
        );
        break;
      default:
        break;
    }
  }, [currentStep, name]);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={{ marginTop: 16 }}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <>
      {renderCurrentStep()}

      <SkipPopup
        visible={showSkipPopup}
        onClose={() => setShowSkipPopup(false)}
        onViewBenefits={() => setShowBenefitsModal(true)}
      />

      <BenefitsModal
        visible={showBenefitsModal}
        onClose={() => setShowBenefitsModal(false)}
        onSuccess={handleMembershipSuccess}
      />
    </>
  );
}
