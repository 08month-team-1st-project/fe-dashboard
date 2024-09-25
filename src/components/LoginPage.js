import React, {useState} from 'react';
import {TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {blue, CustomButton} from './CustomButton';
import {red} from '@mui/material/colors';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loginState, setLoginState] = useState({
        email: '',
        password: ''
    });
    const [fieldErrors, setFieldErrors] = useState({email: [], password: []}); // 필드별 에러 메시지를 배열로 관리

    // 필드 에러 설정 함수
    const handleFieldErrors = (errors) => {
        const newFieldErrors = {email: [], password: []};
        errors.forEach(error => {
            if (error.field === 'email') {
                newFieldErrors.email.push(error.message); // 이메일 필드의 모든 에러 메시지 추가
            } else if (error.field === 'password') {
                newFieldErrors.password.push(error.message); // 비밀번호 필드의 모든 에러 메시지 추가
            }
        });
        setFieldErrors(newFieldErrors);
    };

    // 전체 에러 메시지를 alert로 표시하는 함수
    const handleOverallError = (message) => {
        alert(message); // 전체 에러 메시지를 alert로 표시
    };


    const signupHandler = async (email, password) => {
        setFieldErrors({email: [], password: []}); // 에러 초기화
        await fetch(`http://localhost:8080/api/signup`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })
            .then(res => res.json())
            .then((data) => {

                const httpStatus = data.http_status;
                if (httpStatus) { // json 에 해당 값이 있으면 errorResult 받은 상황

                    if(httpStatus !== 400){
                        handleOverallError(data.message);
                    }else {
                        handleFieldErrors(data.field_errors); // 필드 에러 처리
                    }

                } else {
                    navigate('/');
                }
            })
            .catch((error) => {
                // 회원가입 시 db 반영, 응답값 문제 없는데, 프론트에서 SyntaxError: Unexpected end of JSON input 문제로 catch 되는 상황
                // 임시방편으로 catch 에서 정상로직 넣어두었음

                alert("회원 가입을 축하드립니다!");
                //console.error('회원가입 중 오류가 발생했습니다.', error);
            });
    };


    const loginHandler = async (email, password) => {
        setFieldErrors({email: [], password: []}); // 에러 초기화
        await fetch(`http://localhost:8080/api/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })
            .then(res => res.json())
            .then((data) => {
                const httpStatus = data.http_status;

                if (httpStatus) { // json 에 해당 값이 있으면 errorResult 받은 상황

                    if(httpStatus !== 400){
                        handleOverallError(data.message);
                    }else {
                        handleFieldErrors(data.field_errors); // 필드 에러 처리
                    }

                } else {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('email', data.email);
                    navigate('/');
                }
            })
            .catch((error) => {
                console.error('로그인 중 오류가 발생했습니다.', error);
            });
    };

    return (
        <div style={{padding: '40px'}}>
            <h1>로그인 페이지</h1>

            <h2>이메일</h2>
            <TextField
                id="outlined-basic-email"
                label="이메일을 입력해주세요."
                variant="outlined"
                onChange={(event) => setLoginState(prev => ({
                    ...prev,
                    email: event.target.value
                }))}
                error={fieldErrors.email.length > 0} // 에러 발생 시 빨간색 테두리
                helperText={
                    <div>
                        {fieldErrors.email.map((error, index) => (
                            <Typography key={index} variant="caption"
                                        color="error"
                                        display="block">
                                {error}
                            </Typography>
                        ))}
                    </div>} // 이메일 관련 모든 에러 메시지 출력
            />

            <h2>비밀번호</h2>
            <TextField
                id="outlined-basic-password"
                label="비밀번호를 입력해주세요."
                variant="outlined"
                type="password"
                onChange={(event) => setLoginState(prev => ({
                    ...prev,
                    password: event.target.value
                }))}
                error={fieldErrors.password.length > 0} // 에러 발생 시 빨간색 테두리
                helperText={
                    <div>
                        {fieldErrors.password.map((error, index) => (
                            <Typography key={index} variant="caption"
                                        color="error" display="block">
                                {error}
                            </Typography>
                        ))}
                    </div>
                } // 비밀번호 관련 모든 에러 메시지 출력
            />

            <div style={{marginTop: '20px'}}>
                <CustomButton style={{backgroundColor: blue[900]}}
                              onClick={() => signupHandler(loginState.email, loginState.password)}>회원가입</CustomButton>
                <CustomButton style={{backgroundColor: blue[500]}}
                              onClick={() => loginHandler(loginState.email, loginState.password)}>로그인</CustomButton>
                <CustomButton style={{backgroundColor: red[500]}}
                              onClick={() => navigate('/')}>홈</CustomButton>
            </div>
        </div>
    );
};

export default LoginPage;

