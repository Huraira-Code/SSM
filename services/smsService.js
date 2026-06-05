import axios from "axios";

export const sendOtpSMS = async (phone, otp) => {
    try {
        const response = await axios.post("https://fyphelper.com/send-otp", {
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