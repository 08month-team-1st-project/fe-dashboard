import React, {useState} from 'react';
import {TextField, Typography} from '@mui/material';
import {blue, CustomButton} from './CustomButton';
import {red} from '@mui/material/colors';
import {StyledTextarea} from './StyledTextArea';
import {useNavigate} from 'react-router-dom';

/**
 * - 게시글 작성 (db저장까지) O
 * - 인증 실패 시의 로직 O
 *
 * - 입력한 값이 검증에 실패했을 때 받는 데이터를  json 처리를 아예 못하는 상황
 *   (TypeError: Cannot read properties of undefined (reading 'json'))
 *   
 *   작업 끝낸 로직들도 실행 후에 catch 문 로직 돌아감
 */
const CreatePostPage = () => {
        const navigate = useNavigate();
        const [post, setPost] = useState({
            title: '',
            author: '',
            content: ''
        });

        const [fieldErrors, setFieldErrors] = useState({title: [], content: []}); // 필드별 에러 메시지를 배열로 관리

        // 필드 에러 설정 함수
        const handleFieldErrors = (errors) => {
            const newFieldErrors = {title: [], content: []};
            errors.forEach(error => {
                if (error.field === 'email') {
                    newFieldErrors.title.push(error.message); // 이메일 필드의 모든 에러 메시지 추가
                } else if (error.field === 'password') {
                    newFieldErrors.content.push(error.message); // 비밀번호 필드의 모든 에러 메시지 추가
                }
            });
            setFieldErrors(newFieldErrors);
        };

        const submitPost = async () => {
            await fetch(`http://localhost:8080/api/posts`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("access_token")
                },
                body: JSON.stringify({
                    title: post?.title || '',
                    content: post?.content || ''
                })
            }).then(
                res => {
                    if (res.status === 401) {
                        alert("로그인이 필요합니다.");
                        navigate('/login');
                    } else if (res.status === 200) {
                        alert("게시물이 성공적으로 작성되었습니다.");
                        navigate('/');
                    }
                }
            )
                .then(res => res.json())  // Error 이 부분에서 TypeError: Cannot read properties of undefined (reading 'json')
                .then((data) => {
                        if (data.field_errors) {
                            handleFieldErrors(data);
                        }
                    }
                )
                .catch((err) => {
                    console.error(err);
                })
        }
        return (
            <div style={{
                padding: '40px'
            }}>
                <h1>게시글 작성하기</h1>
                <h2>글 제목</h2>
                <TextField id="outlined-basic" label="Outlined" variant="outlined"
                           value={post.title}
                           onChange={(event) => setPost(prev => ({
                               ...prev,
                               title: event.target.value
                           }))}
                           error={fieldErrors.title.length > 0} // 에러 발생 시 빨간색 테두리
                           helperText={
                               <div>
                                   {fieldErrors.title.map((error, index) => (
                                       <Typography key={index} variant="caption"
                                                   color="error"
                                                   display="block">
                                           {error}
                                       </Typography>
                                   ))}
                               </div>} // 이메일 관련 모든 에러 메시지 출력
                />
                
                {/* 작성자 칸 지움*/}

                <h2>본문</h2>
                <StyledTextarea
                    aria-label="minimum height"
                    minRows={3}
                    placeholder="Minimum 3 rows"
                    value={post.content}
                    onChange={(event) => setPost(prev => ({
                        ...prev,
                        content: event.target.value
                    }))}
                    error={fieldErrors.content.length > 0} // 에러 발생 시 빨간색 테두리
                    helperText={
                        <div>
                            {fieldErrors.content.map((error, index) => (
                                <Typography key={index} variant="caption"
                                            color="error"
                                            display="block">
                                    {error}
                                </Typography>
                            ))}
                        </div>}
                />
                <div style={{
                    marginTop: '20px'
                }}>
                    <CustomButton style={{backgroundColor: blue[500]}}
                                  onClick={submitPost}>작성</CustomButton>
                    <CustomButton style={{backgroundColor: red[500]}}
                                  onClick={() => navigate('/')}>취소</CustomButton>
                </div>
            </div>
        );
    }
;

export default CreatePostPage;
