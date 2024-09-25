import React, {useEffect, useState} from 'react';
import {Card, CardContent, TextField, Typography} from '@mui/material';
import {grey, red} from '@mui/material/colors';
import {blue, CustomButton} from './CustomButton';
import {StyledTextarea} from './StyledTextArea';
import {useNavigate, useLocation, redirect} from 'react-router-dom';

const PostDetailPage = () => {
    const navigate = useNavigate();
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([{
        id: 1,
        content: '댓글 내용',
        author: '작성자1',
        post_id: 1,
        created_at: '작성일시'
    },
        {
            id: 2,
            content: '댓글 내용',
            author: '작성자2',
            post_id: 1,
            created_at: '작성일시'
        }]);
    const [newComment, setNewCommnent] = useState({
        content: '',
        author: ''
    })
  const [newReply, setNewReply] = useState({}); // 새로운 대댓글 상태
  const [replyFormVisible, setReplyFormVisible] = useState({});

  const [fieldErrors, setFieldErrors] = useState({title: [], content: []}); // 필드별 에러 메시지를 배열로 관리
  const location = useLocation();



  // const logoutHandler = () => {
  //     const email = localStorage.getItem('email');
  //     localStorage.removeItem("access_token");
  //     localStorage.removeItem("email");
  //     navigate('/');
  // };


  // 필드 에러 설정 함수
  const handleFieldErrors = (errors) => {
    const newFieldErrors = {title: [], content: []};
    errors.forEach(error => {
      if (error.field === 'title') {
        newFieldErrors.title.push(error.message);
      } else if (error.field === 'content') {
        newFieldErrors.content.push(error.message);
      }
    });
    setFieldErrors(newFieldErrors);
  };


  async function fetchData() {
    await fetch('http://localhost:8080/api/comments')
    .then(res => res.json()).then(res => {
      if(!res) return;
      setComments([...res.comments.filter(c => c?.post_id === post.id)])
    })
    .catch((err) => console.error(err));
  }

    useEffect(() => {
        const postData = JSON.parse(localStorage.getItem('post'));
        setPost({...postData});
        try {
            fetchData();
        } catch (e) {
            console.error(e)
        }
    }, []);

    const handlePostChange = async () => {
        await fetch(`http://localhost:8080/api/posts/${post.id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("access_token")
            },
            body: JSON.stringify({
                title: post?.title || '',
                content: post?.content || ''
            })
        }).then(res => {
            const status = res.status;

            if (status === 200) {
                alert("게시글이 수정되었습니다!");
                return res.json();
            } else if (status === 401) {
                alert("로그인이 필요합니다.");
                navigate('/login');
            }
            return res.json();
        }).then(data => {
            if (data.field_errors) {
                handleFieldErrors(data.field_errors);
            } else {
                // 이제 이건 떳다!!!!
                alert(data.message);
            }
        })
            .catch(err => console.error(err));
    };

  const handleCommentChange = async (id, content) => {
    await fetch(`http://localhost:8080/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json' // 헤더 추가
      },
      body: JSON.stringify({
        content: content
      })
    }).catch((err) => console.error(err));
  };

  const changeComment = (commentId, comment) => {
    const indexToUpdate = comments.findIndex((item) => item.id === commentId);
    const newComments = comments;
    if (indexToUpdate !== -1) {
      newComments[indexToUpdate] = {
        ...newComments[indexToUpdate],
        content: comment
      };
      setComments([...newComments])
    }
  }

  const submitComment = async () => {
    await fetch(`http://localhost:8080/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // 헤더 추가
      },
      body: JSON.stringify({
        author: newComment.author,
        content: newComment.content,
        post_id: post.id
      })
    }).catch((err) => console.error(err));
  }


  const handleCommentDelete = async (id) => {
    await fetch(`http://localhost:8080/api/comments/${id}`, {
      method: 'DELETE'
    }).then(() => {
      setComments(comments.filter(c => c.id !== id)); // 로컬 상태에서 댓글 삭제
    }).catch((err) => console.error(err));
  }

  const submitReply = async (commentId) => {
    await fetch(`http://localhost:8080/api/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: newReply[commentId]?.author,
        content: newReply[commentId]?.content,
        comment_id: commentId
      })
    }).catch((err) => console.error(err));
  };
  const handleReplyChange = (commentId, field, value) => {
    setNewReply((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [field]: value
      }
    }));
  };

  const toggleReplyForm = (commentId) => {
    setReplyFormVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId] // 토글 기능
    }));
  };


    const handleRedirect = async () => {
        navigate(`/post/${post.id}`)
    };

    return (
        <div style={{
            padding: '40px'
        }}>
            {(localStorage.getItem("email")) &&
                <CustomButton style={{backgroundColor: grey[400]}}
                > {localStorage.getItem("email")} 님 </CustomButton>}

            {/*작동안함*/}
            {/*{(localStorage.getItem("email")) &&*/}
            {/*    <CustomButton style={{backgroundColor: grey[400]}}*/}
            {/*                  onclick={logoutHandler}*/}
            {/*    >  로그아웃 </CustomButton>}*/}

            <h1>게시판 상세</h1>

            <CustomButton
                style={{backgroundColor: grey[400]}}>작성자: {post.author} </CustomButton>

            <CustomButton style={{backgroundColor: grey[400]}}>작성자:
                생성일자: {post.created_at}</CustomButton>


            {/*게시글 데이터 자체를 api 요청이 아닌 로컬스토리지에서 꺼내오는 방식으로 돼있어서,
            게시글 수정해도, 화면에 db에 반영된 수정일자가 반영되진 않는다.
            보려면 홈(게시글목록) 으로 갔다가 목록에 나온 게시글을 다시 클릭해서 접근해야 반영됨
            */}
            {(localStorage.getItem("email") === post.author) &&
                <CustomButton style={{backgroundColor: grey[400]}}
                >수정일자 {post.modified_at}</CustomButton>}

            <h2>글 제목</h2>
            <TextField id="outlined-basic" label="Outlined"
                       variant="outlined" value={post?.title || ''}
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
                           </div>}/>

            <h2>본문</h2>
            <StyledTextarea
                aria-label="minimum height"
                minRows={3}
                placeholder="Minimum 3 rows"
                value={post?.content || ''}
                onChange={(event) => setPost(prev => ({
                    ...prev,
                    content: event.target.value
                }))}

                // 이 부분 적용이 안되고있음
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

                {(localStorage.getItem("email") === post.author) &&
                    <CustomButton style={{backgroundColor: blue[500]}}
                                  onClick={handlePostChange}>수정</CustomButton>
                }

                {/*취소버튼을 누르면 새로고침, 글 수정 중에 새로고침하면 원래 내용으로 돌아간다*/}
                {/*게시글 상세페이지의 post 데이터 자체가 로컬 스토리지에 저장해놨던 걸 가져오게끔 해놔서,
                게시글 수정 후 db에 반영된 데이터를 화면에 반영시켜주진 못함*/}
                {(localStorage.getItem("email") === post.author) &&
                    <CustomButton style={{backgroundColor: red[500]}}
                                  onClick={()=> window.location.reload()}>취소
                    </CustomButton>
                }
            </div>


            <div style={{marginTop: 20}}>
                <Card sx={{marginBottom: 2}}>
                    <CardContent
                        style={{display: 'flex', flexDirection: 'column'}}>
                        <h3>댓글 작성자</h3>
                        <TextField variant="outlined"
                                   value={newComment.author || ''}
                                   onChange={(event) => setNewCommnent(prev => ({
                                       ...prev,
                                       author: event.target.value
                                   }))}/>
                        <h3>댓글 내용</h3>
                        <TextField variant="outlined"
                                   value={newComment.content || ''}
                                   onChange={(event) => setNewCommnent(prev => ({
                                       ...prev,
                                       content: event.target.value
                                   }))}/>
                        <CustomButton style={{
                            backgroundColor: blue[500],
                            marginTop: 10
                        }} onClick={submitComment}>생성</CustomButton>
                    </CardContent>
                </Card>
                {comments.length > 0 && (
                    comments.map((c, index) => (
                        <Card sx={{marginBottom: 2}}>
                            <CardContent>
                                <TextField variant="outlined"
                                           value={c?.content || ''}
                                           onChange={(event) => changeComment(c.id, event.target.value)}/>
                                <Typography variant="h5" component="div">
                                    {c?.author || ''}
                                </Typography>
                                <Typography color="text.secondary">
                                    {c?.created_at || ''}
                                </Typography>
                                <CustomButton
                                    style={{backgroundColor: blue[500]}}
                                    onClick={() => handleCommentChange(c.id, c.content)}>수정</CustomButton>
                            </CardContent>
                        </Card>
                    )))
                }
            </div>
        </div>
    )
        ;
};

export default PostDetailPage;
