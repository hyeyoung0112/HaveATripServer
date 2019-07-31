# SERVER for React-Native Application




### Used in Server: 

Naver Cloud Platform

Ubuntu 16.0.4, MySQL, Node JS, Express

### Main Server Script: express_server.js
### Middleware Routers

routers/

### Utils
dates.js : 시작 날짜와 끝 날짜를 받아 그 사이 날짜들을 구해 빈 일정 array를 만들어줌.

userCheck.js : MySQL에 해당 이메일의 사용자가 있는지 확인

encrypt.js : 정해진 Key를 가지고 salt, password를 받아 암호화하는 함수와 salt를 생성하고 인증 코드를 랜덤으로 생성하는 함수.

sendmail.js : 메일을 보내는 함수. nodemailer 모듈을 이용했다.

sqlQuery.js : MySQL 데이터베이스에 SQL 쿼리문을 실행하고 그 결과를 반환하는 함수.
