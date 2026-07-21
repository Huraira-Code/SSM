import axios from "axios";
const SMS_API_URL = process.env.SMS_API_URL;

export const sendOtpSMS = async (phone, otp) => {
    try {
        const response = await axios.post(`https://27f3-39-34-129-191.ngrok-free.app/send-otp`, {
            phone: phone,
            otp: otp
        });

        console.log("OTP SENT RESPONSE:", response.data);

        return {
            success: true,
            data: response.data,
        };

    } catch (error) {
        console.error("SMS ERROR:", error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};
