const axios = require("axios")

const sendEmail = async (templateParams) => {
  try {
    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: "service_9u1am7n",
        template_id: "template_xl6bjcb",
        user_id:'lIAF2_-bnQ6QL5Ll9',
        accessToken: "aoB0MEi2ZgYL2UgKT7-vO",
        template_params: templateParams,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Email sent successfully!", response.data);
  } catch (error) {
    console.error("Failed to send email.", error.response?.data || error.message);
  }
};

module.exports= {sendEmail};
