// utils/sendOTP.js
export const sendOTP = async (mobile, otp) => {
  console.log(`📱 Sending OTP ${otp} to ${mobile}`);

  // Simulate a short delay like real SMS API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return true;
};
