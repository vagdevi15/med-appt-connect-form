
// Simulate sending verification codes
export const sendVerificationCode = (type: 'phone' | 'email', target: string): string => {
  // In a real app, this would call an API to send an SMS or email
  // For demo purposes, we'll generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`Sending ${type} verification code to ${target}: ${code}`);
  
  return code;
};

// Simulate code verification
export const verifyCode = (sentCode: string, enteredCode: string): boolean => {
  return sentCode === enteredCode;
};
