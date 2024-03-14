// 動態路由的意思 網址後面那一段會轉化為pid這個變數
// 怎麼看到這一頁? 在這個資料夾裡面 不是list頁都算是詳細頁 (酷!)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '@/styles/loader/loader_ripple.module.css'
import postData from '@/data/post/post.json'
import TagButton from '@/components/post/tagButton'
import { Container, Card, Col, Row, Stack } from 'react-bootstrap'
import DOMPurify from 'dompurify'

export default function Detail() {
  const router = useRouter()

  const [post, setPost] = useState({
    // 物件的話 初始值不一樣 如果怕0被渲染 再寫個判斷去擋?
    id: '',
    author: '',
    published: '',
    image: '',
    title: '',
    content: '',
    tags: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const getPost = async (pid) => {
    try {
      // 網址改成pid 用傳入的
      const res = await fetch(`http://localhost:3005/api/post/${pid}`)

      const data = await res.json()

      if (data.title) {
        setPost(data)

        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    // 出現值我們再跟伺服器要資料
    console.log(router.query)

    if (router.isReady) {
      // 如果isReady是true 確保能得到 query的值
      const { pid } = router.query
      // 不這樣的話 會有不是pid的情況 會有要不到資料的情況 會變有多餘的請求
      console.log(pid)

      getPost(pid)
    }
  }, [router.isReady]) //Eddy說just警告

  const loader = (
    <>
      <div className={styles['lds-ripple']}>
        <div></div>
        <div></div>
        <div></div>
      </div>{' '}
    </>
  )
  const getTagsArray = (tagsString) => {
    // 檢查 tagsString 是否存在
    if (tagsString) {
      return tagsString.split(',')
    }
    return []
  }
  const display = (
    <>
      <Container>
        <Row className="justify-content-evenly">
          <Col md={3}>
            <h4>相關文章</h4>
            <Row xs={1} className="gy-4">
              {postData.map((v) => (
                <Col key={v.id}>
                  <Card>
                    <Link
                      href={`/post/${v.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Card.Img variant="top" src={`/images/post/${v.image}`} />
                    </Link>
                    <Card.Body className="bg-light">
                      <Card.Subtitle className="mb-2 text-primary">
                        {v.author}
                      </Card.Subtitle>
                      <h6>{v.title}</h6>
                      <Stack direction="horizontal" gap={1}>
                        <div>
                          {getTagsArray(v.tags).map((tag, index) => (
                            <Link key={index} href="/post/list" target="_blank">
                              <TagButton text={`# ${tag}`} />
                            </Link>
                          ))}
                        </div>
                      </Stack>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col md={8} className="bg-light p-4">
            <p>{post.published}</p>
            <h3>{post.title}</h3>
            <p>作者:{post.user_id}</p>
            <div className="p-2">
              {' '}
              {getTagsArray(post.tags).map((tag, index) => (
                <Link key={index} href="/post" target="_blank">
                  <TagButton text={`# ${tag}`} />
                </Link>
              ))}
            </div>
            <Card.Img variant="top" src={`/images/post/${post.image}`} />
            <p>
              <div
                className="m-4"
                // dangerouslySetInnerHTML={{
                //   __html: post.content,
                // }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
              ></div>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  )
  return (
    <>
      <Container className="p-3">
        <Link href="/post">回列表頁</Link>
      </Container>
      {isLoading ? loader : display}
    </>
  )
}
