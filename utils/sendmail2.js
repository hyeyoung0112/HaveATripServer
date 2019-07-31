"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const SendVerifMail = async function sendmail(account, code, type){
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: "YOUR_GMAIL_ADDRESS",
			pass: "YOUR_GMAIL_PASSWORD"
		}
	});
	var subject, html;
	if (type == 'verif') {
		subject = "HAT 회원가입을 위해 이메일 인증을 완료해 주세요";
		html = "<b>인증 번호: " + code + "<br>"
			+ "가입해주셔서 감사합니다. 좋은 여행 되세요^^";
	}
	else if (type == 'findpwd'){
		subject = "HAT 임시 비밀번호입니다";
		html = "<b>임시 비밀번호: " + code + "<br>"
			+ "임시 비밀번호로 로그인한 뒤 비밀번호를 변경해 주세요.";
	}
	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"MondayBlues👻" <hyeyoung0112@gmail.com>', // sender address
		to: account , // list of receivers
		subject: subject, // Subject line
		text: code, // plain text body
		html: html // html body
	});

	console.log("Message sent: %s", info.messageId);
}

module.exports = SendVerifMail
