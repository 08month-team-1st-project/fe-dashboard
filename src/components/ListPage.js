import React, {useEffect, useState} from 'react';
import {blue, CustomButton} from './CustomButton';
import {useNavigate} from 'react-router-dom';
import {red} from '@mui/material/colors';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button
} from '@mui/material';

const ListPage = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수

    useEffect(() => {
        async function fetchData() {
            await fetch(`http://localhost:8080/api/posts?page=${page}&size=10&sort=createdAt,desc`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(res => {
                    setPosts([...res.content]);
                    setTotalPages(res.totalPages); // 서버에서 총 페이지 수 받아오기
                })
                .catch((err) => console.error(err));
        }

        fetchData();
    }, [page]); // 페이지가 변경될 때마다 fetch 호출

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage); // 페이지 변경
        }
    };

    const logoutHandler = async () => {
        const email = localStorage.getItem('email');
        if (!email) {
            navigate('/login');
            return;
        }
        await fetch(`http://localhost:8080/api/logout`, {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        }).then(res => res.json()).then(() => {
            navigate('/login');
        }).catch((error) => console.error(error));
    };

    const searchHandler = async (email) => {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return;
        const {posts} = await fetch(`http://localhost:8080/api/posts/search?author_email=${email}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(res => {
                setPosts([...res.content]);
                setTotalPages(res.totalPages); // 서버에서 총 페이지 수 받아오기
            })
            .catch((err) => console.error(err));

        if (!posts) return;  //TODO

        setPosts([...posts]);
    };

    return (
        <div style={{ padding: '40px' }}>
            <h1>게시판 리스트</h1>
            <div>
                <TextField
                    id="standard-required"
                    label="작성자 이메일 검색"
                    variant="standard"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                />
                <CustomButton
                    style={{ backgroundColor: blue[500] }}
                    onClick={() => searchHandler(keyword)}>검색
                </CustomButton>
            </div>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>제목</TableCell>
                        <TableCell>게시물내용</TableCell>
                        <TableCell>작성자</TableCell>
                        <TableCell>작성일시</TableCell>
                        <TableCell>좋아요</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {posts.map(post => (
                        <TableRow
                            key={post.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            onClick={() => {
                                localStorage.setItem('post', JSON.stringify({ ...post }))
                                navigate(`/post/${post.id}`)
                            }}
                        >
                            <TableCell component="th" scope="row">{post.id}</TableCell>
                            <TableCell component="th" scope="row">{post.title}</TableCell>
                            <TableCell>{post.content}</TableCell>
                            <TableCell>{post.author}</TableCell>
                            <TableCell>{post.created_at}</TableCell>
                            <TableCell>{post.like_count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* 페이지네이션 버튼 */}
            <div style={{ marginTop: '20px' }}>
                <Button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}>이전
                </Button>
                <span>페이지 {page + 1} / {totalPages}</span>
                <Button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}>다음
                </Button>
            </div>

            <CustomButton
                style={{ backgroundColor: blue[500] }}
                onClick={() => navigate('/post/create')}>게시글 작성
            </CustomButton>
            <CustomButton
                style={{ backgroundColor: red[500] }}
                onClick={logoutHandler}>로그아웃
            </CustomButton>
        </div>
    );
};

export default ListPage;
