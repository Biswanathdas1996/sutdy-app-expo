import { useState, useCallback } from "react";
import * as Speech from "expo-speech";

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Utility function to list only female voices (useful for debugging)
  const listAvailableVoices = useCallback(async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();

      // Filter for female voices only
      const femaleVoices = voices.filter((voice) => {
        const id = voice.identifier?.toLowerCase() || "";
        const name = voice.name?.toLowerCase() || "";

        // Exclude any male voice patterns
        const hasMalePattern =
          id.includes("male") ||
          name.includes("male") ||
          id.includes("david") ||
          id.includes("aaron") ||
          id.includes("fred") ||
          id.includes("jorge") ||
          id.includes("arthur") ||
          id.includes("daniel") ||
          id.includes("thomas") ||
          id.includes("rishi") ||
          id.includes("alex");

        // Include only confirmed female voice patterns
        const hasFemalePattern =
          id.includes("female") ||
          name.includes("female") ||
          id.includes("samantha") ||
          id.includes("allison") ||
          id.includes("zoe") ||
          id.includes("isha") ||
          id.includes("veena") ||
          id.includes("kanya");

        return !hasMalePattern && hasFemalePattern;
      });

      const indianFemaleVoices = femaleVoices.filter(
        (voice) =>
          voice.language?.toLowerCase().includes("en-in") ||
          voice.language?.toLowerCase().includes("english (india)") ||
          voice.language?.toLowerCase().includes("india")
      );

      console.log("=== FEMALE VOICES DEBUG INFO ===");
      console.log("Total available voices:", voices.length);
      console.log("Female voices found:", femaleVoices.length);
      console.log("Indian English female voices:", indianFemaleVoices.length);
      console.log(
        "All female voices:",
        femaleVoices.map((v) => ({
          id: v.identifier,
          name: v.name,
          language: v.language,
        }))
      );

      return {
        all: voices,
        female: femaleVoices,
        indianFemale: indianFemaleVoices,
      };
    } catch (error) {
      console.log("Error listing voices:", error);
      return { all: [], female: [], indianFemale: [] };
    }
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      if (isSpeaking) {
        stopSpeaking();
      }

      try {
        setIsSpeaking(true);

        // Get available voices to choose the best Indian English female voice
        const voices = await Speech.getAvailableVoicesAsync();

        // Debug: Log available voices to help with voice selection
        console.log(
          "Available voices:",
          voices.map((v) => ({
            id: v.identifier,
            name: v.name,
            language: v.language,
          }))
        );

        // Filter to get only female voices - exclude any voice with male patterns
        const femaleVoices = voices.filter((voice) => {
          const id = voice.identifier?.toLowerCase() || "";
          const name = voice.name?.toLowerCase() || "";

          // Strict exclusion of any male voice patterns
          const hasMalePattern =
            id.includes("male") ||
            name.includes("male") ||
            id.includes("david") ||
            id.includes("aaron") ||
            id.includes("fred") ||
            id.includes("jorge") ||
            id.includes("arthur") ||
            id.includes("daniel") ||
            id.includes("thomas") ||
            id.includes("rishi") ||
            id.includes("alex") ||
            id.includes("jacob") ||
            id.includes("martin") ||
            id.includes("tom");

          // Include only confirmed female voice patterns
          const hasFemalePattern =
            id.includes("female") ||
            name.includes("female") ||
            id.includes("samantha") ||
            id.includes("allison") ||
            id.includes("zoe") ||
            id.includes("karen") ||
            id.includes("moira") ||
            id.includes("tessa") ||
            id.includes("isha") ||
            id.includes("veena") ||
            id.includes("kanya") ||
            id.includes("siri_female") ||
            id.includes("enhanced_female") ||
            name.includes("samantha") ||
            name.includes("allison");

          // Only include voices that are definitely female and not male
          return !hasMalePattern && hasFemalePattern;
        });

        console.log(
          "Available female voices:",
          femaleVoices.map((v) => ({
            id: v.identifier,
            name: v.name,
            language: v.language,
          }))
        );

        // Preferred female voices for Indian English (in priority order)
        const preferredFemaleVoices = [
          "en-in-x-ene#female_1-local",
          "en-in-x-ene#female_2-local",
          "com.apple.voice.enhanced.en-IN.Isha",
          "com.apple.voice.compact.en-IN.Isha",
          "com.apple.ttsbundle.Veena-compact",
          "en-IN-Standard-A",
          "en-IN-Wavenet-A",
          "com.apple.ttsbundle.siri_female_en-IN_compact",
          "en-us-x-sfg#female_1-local",
          "com.apple.ttsbundle.Samantha-compact",
        ];

        // Select the best available female voice
        let selectedVoice = null;

        // Try preferred female voices first
        for (const preferredVoice of preferredFemaleVoices) {
          if (
            femaleVoices.some((voice) => voice.identifier === preferredVoice)
          ) {
            selectedVoice = preferredVoice;
            console.log("Selected preferred female voice:", selectedVoice);
            break;
          }
        }

        // Fallback to any Indian English female voice
        if (!selectedVoice) {
          const indianFemale = femaleVoices.find((voice) => {
            const lang = voice.language?.toLowerCase() || "";
            return lang.includes("en-in") || lang.includes("india");
          });
          if (indianFemale) {
            selectedVoice = indianFemale.identifier;
            console.log("Selected Indian female voice:", selectedVoice);
          }
        }

        // Fallback to any English female voice
        if (!selectedVoice) {
          const englishFemale = femaleVoices.find((voice) => {
            const lang = voice.language?.toLowerCase() || "";
            return lang.includes("en");
          });
          if (englishFemale) {
            selectedVoice = englishFemale.identifier;
            console.log("Selected English female voice:", selectedVoice);
          }
        }

        // Final fallback to any available female voice
        if (!selectedVoice && femaleVoices.length > 0) {
          selectedVoice = femaleVoices[0].identifier;
          console.log("Selected first available female voice:", selectedVoice);
        }

        // Ultimate fallback - force a known female voice
        if (!selectedVoice) {
          selectedVoice = "com.apple.ttsbundle.Samantha-compact";
          console.log("Using hardcoded female voice fallback:", selectedVoice);
        }

        // Add natural pauses and improve text flow
        const enhancedText = text
          .replace(/\./g, ". ") // Add extra space after periods
          .replace(/\,/g, ", ") // Add extra space after commas
          .replace(/\?/g, "? ") // Add extra space after questions
          .replace(/\!/g, "! ") // Add extra space after exclamations
          .replace(/\s+/g, " ") // Clean up multiple spaces
          .trim();

        console.log("Final selected voice:", selectedVoice);

        const speechOptions = {
          language: "en-IN", // Indian English language setting
          pitch: 1.0, // Slightly higher pitch suitable for female voice
          rate: 0.78, // Moderate rate for clear pronunciation
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: (error: any) => {
            console.log("Speech playback error:", error);
            setIsSpeaking(false);
          },
          ...(selectedVoice ? { voice: selectedVoice } : {}), // Only add voice if we have one
        };

        await Speech.speak(enhancedText, speechOptions);
      } catch (error) {
        console.log("Speech error:", error);
        setIsSpeaking(false);
      }
    },
    [isSpeaking]
  );

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
    listAvailableVoices, // Utility function for debugging voices
  };
};
