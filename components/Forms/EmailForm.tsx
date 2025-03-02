import ImagesPath from "@/assets/ImagesPath";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Platform, ActivityIndicator } from "react-native";
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'; 
import useFormStore from "../../store/formStore";

interface RegistrationFormProps {
  onNext: (data: FormData) => void;
  formData: FormData;
}

interface FormData {
  email: string;
}

const SecondValidationEmailForm: React.FC<{ 
  onBack: () => void; 
  onNext: () => void;
}> = ({ onBack, onNext }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!inputValue.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    // Verificamos si el código es correcto (916363)
    if (inputValue.trim() !== '916363') {
      setError('Invalid verification code. Please try again.');
      return;
    }
    
    // Iniciamos el proceso de verificación
    setIsVerifying(true);
    setError(null);
    
    // Esperamos 2 segundos antes de continuar
    setTimeout(() => {
      setIsVerifying(false);
      onNext();
    }, 2000);
  };

  return (
    <>
      <View className="flex-row mb-3 items-center">
        <Text className="text-left text-[40px] text-white font-extralight ">
          Email sent!
        </Text>
      </View>
      <Text className="text-left text-[16px] text-white font-light mb-1">
        We've sent a code to <Text className="font-semibold">matt@seniorcarealliance.ai</Text>.
      </Text>
      <Text className="text-left text-[16px] text-white font-light ">
        Enter it below to continue!
      </Text>
      <View className="py-4" />
      <View className="flex-row items-center">
        <View className="items-center gap-3 border bg-[#105cb4] border-white/25 rounded-lg w-full overflow-hidden">
          <TextInput
            className="text-white font-extralight bg-[#105cb4] px-4 py-3 w-full flex-1"
            placeholder={"Enter verification code"}
            multiline={true}
            textAlignVertical="top"
            value={inputValue}
            numberOfLines={3}
            onChangeText={(text) => {
              setInputValue(text);
              if (error) setError(null);
            }}
            style={[Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
          />
          <View className="flex-row justify-end p-3 w-full">
            <TouchableOpacity
              className="bg-white px-5 text-sm font-semibold text-dark-blue py-3 rounded-lg"
              onPress={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#105cb4" />
                  <Text className="text-dark-blue font-semibold ml-2">Verifying...</Text>
                </View>
              ) : (
                <Text className="text-dark-blue font-semibold">Verify email address</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {error && <Text className="text-red-900 mt-2">{error}</Text>}
      <View className="py-2" />
      <Text className="text-left text-[15px] text-white font-light ">
        Not seeing the email in your inbox? <Text className="underline" onPress={() => {onBack()}}>Try sending again.</Text> 
      </Text>
    </>
  );
};

const EmailForm: React.FC<RegistrationFormProps> = ({ onNext, formData }) => {
  const { email, loading, validateEmail } = useFormStore();
  const [localEmail, setLocalEmail] = useState(email || "");
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleShowSecondForm = () => {
    setFadeKey(prev => prev + 1); 
    setShowSecondForm(true);
  };

  const handleBackToEmailForm = () => {
    setFadeKey(prev => prev + 1); 
    setShowSecondForm(false);
  };

  const handleNextStep = () => {
    setIsExiting(true);
    // Añadir pequeño retraso para permitir que la animación de salida se complete
    setTimeout(() => {
      onNext({ email });
    }, 300);
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmailFormat(localEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    const success = await validateEmail(localEmail);
    if (success) {
      handleShowSecondForm();
    } else {
      setError("Failed to validate email. Please try again.");
    }
  };

  return (
    <View className="w-[35vw]">
      {!showSecondForm ? (
        <Animated.View 
          key={`form-${fadeKey}`} 
          entering={FadeInDown} 
        >
          <View className="flex-row gap-x-2 items-center">
            <Image source={ImagesPath.DITA_LOGO} className="w-1/2 aspect-square py-10" resizeMode="contain" />
            <Text className="text-left text-[40px] text-white font-extralight ">
              Hello, I'm Dita
            </Text>
          </View>
          <Text className="text-left text-[16px] text-white font-light ">
            I'm your AI assistant, here to help with your registration.
          </Text>
          <Text className="text-left text-[16px] text-white font-semibold ">
            First, enter your email to get started!
          </Text>
          <View className="py-5" />
          <View className="flex-row items-center">
            <View className="items-center gap-3 border bg-[#105cb4] border-white/25 rounded-lg w-full overflow-hidden">
              <TextInput
                className="text-white font-extralight bg-[#105cb4] px-4 py-4 w-full flex-1"
                placeholder="Enter your personal or work email"
                value={localEmail}
                onChangeText={(text) => {
                  setLocalEmail(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
              />
              <View className="flex-row justify-end p-3 w-full">
                <TouchableOpacity
                  className="bg-white px-5 text-sm font-semibold text-dark-blue py-3 rounded-lg"
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#105cb4" />
                  ) : (
                    <Text className="text-dark-blue font-semibold">Continue with email</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {error && <Text className="text-red-900 mt-2">{error}</Text>}
        </Animated.View>
      ) : (
        <Animated.View 
          key={fadeKey} 
          entering={FadeInDown.delay(300)}
          style={{ opacity: isExiting ? 0 : 1 }}
        >
          <SecondValidationEmailForm 
            onBack={handleBackToEmailForm} 
            onNext={handleNextStep} 
          />
        </Animated.View>
      )}
    </View>
  );
};

export default EmailForm;