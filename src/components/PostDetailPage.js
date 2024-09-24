import React, {useEffect, useState} from 'react';
import {Card, CardContent, TextField, Typography} from '@mui/material';
import {red} from '@mui/material/colors';
import {blue, CustomButton} from './CustomButton';
import {StyledTextarea} from './StyledTextArea';
import {useNavigate} from 'react-router-dom';

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

  async function fetchData() {
    await fetch('http://localhost:8080/api/comments')
    .then(res => res.json()).then(res => {
      //console.log(res);
      if(!res) return;
      //console.log(res.comments);
      setComments([...res.comments.filter(c => c?.post_id === post.id)])
    })
    .catch((err) => console.error(err));
  }

  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem('post'));
    setPost({ ...postData });
  }, []);

  useEffect(() => {
    if (post?.id) {
      fetchData();
    }
  }, [post]);

  const handlePostChange = async () => {
    await fetch(`http://localhost:8080/api/posts/${post.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: post?.title || '',
        content: post?.content || ''
      })
    }).catch((err) => console.error(err));
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

  return (
    <div style={{
      padding: '40px'
    }}>
      <h1>게시판 상세</h1>
      <h2>글 제목</h2>
      <TextField id="outlined-basic" label="Outlined" variant="outlined" value={post?.title || ''}
                 onChange={(event) => setPost(prev => ({
                   ...prev,
                   title: event.target.value
                 }))}/>
      <h2>작성자</h2>
      <TextField id="outlined-basic" label="Outlined" variant="outlined" value={post?.author || ''}
                 onChange={(event) => setPost(prev => ({
                   ...prev,
                   author: event.target.value
                 }))}/>
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
      />
      <div style={{
        marginTop: '20px'
      }}>
        <CustomButton style={{ backgroundColor: blue[500] }} onClick={handlePostChange}>수정</CustomButton>
        <CustomButton style={{ backgroundColor: red[500] }} onClick={() => navigate('/')}>취소</CustomButton>
      </div>
      <div style={{marginTop: 20}}>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent style={{display: 'flex', flexDirection: 'column'}}>
            <h3>댓글 작성자</h3>
            <TextField variant="outlined" value={newComment.author || ''}
                       onChange={(event) => setNewCommnent(prev => ({...prev, author: event.target.value}))}/>
            <h3>댓글 내용</h3>
            <TextField variant="outlined" value={newComment.content || ''}
                       onChange={(event) => setNewCommnent(prev => ({...prev, content: event.target.value}))}/>
            <CustomButton style={{ backgroundColor: blue[500], marginTop: 10 }} onClick={submitComment}>생성</CustomButton>
          </CardContent>
        </Card>
        {comments.length > 0 && (
          comments.map((c, index) => (
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <TextField variant="outlined" value={c?.content || ''}
                           onChange={(event) => changeComment(c.id, event.target.value)}/>
                <Typography variant="h5" component="div">
                  {c?.author || ''}
                </Typography>
                <Typography color="text.secondary">
                  {c?.created_at || ''}
                </Typography>
                <CustomButton style={{ backgroundColor: blue[500] }} onClick={() => handleCommentChange(c.id, c.content)}>수정</CustomButton>
                <CustomButton style={{ backgroundColor: red[500], marginLeft: 10 }} onClick={() => handleCommentDelete(c.id)}>삭제</CustomButton> {/* 삭제 버튼 추가 */}
                <CustomButton
                    style={{ backgroundColor: blue[500], marginLeft: 10 }}
                    onClick={() => toggleReplyForm(c.id)}
                >답글
                </CustomButton>
                {/* 답글 입력 폼 (토글 상태에 따라 표시) */}
                {replyFormVisible[c.id] && (
                    <div style={{ marginTop: '10px', paddingLeft: '20px' }}>
                      <TextField
                          variant="outlined"
                          label="답글 작성자"
                          value={newReply[c.id]?.author || ''}
                          onChange={(e) => handleReplyChange(c.id, 'author', e.target.value)}
                      />
                      <TextField
                          variant="outlined"
                          label="답글 내용"
                          value={newReply[c.id]?.content || ''}
                          onChange={(e) => handleReplyChange(c.id, 'content', e.target.value)}
                      />
                      <CustomButton
                          style={{ backgroundColor: blue[500], marginTop: '10px' }}
                          onClick={() => submitReply(c.id)}
                      >
                        답글 생성
                      </CustomButton>
                    </div>
                )}
              </CardContent>
            </Card>
          )))
        }
      </div>
    </div>
  );
};

export default PostDetailPage;
