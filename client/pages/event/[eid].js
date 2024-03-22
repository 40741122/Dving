import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import styles from './eid.module.scss'

export default function EventArticle() {
  const router = useRouter()

  const [event, setEvent] = useState({
    id: '',
    title: '',
    sort: '',
    banner: '',
    content: '',
    created_at: new Date(''),
  })

  // 連接資料
  const getEvent = async (eid) => {
    const url = `http://localhost:3005/api/event/${eid}`
    await fetch(url, {
      method: 'get',
    })
      .then((response) => {
        console.log(response)
        return response.json()
      })
      .then((result) => {
        const eventData = result.map((v) => {
          // 將字串轉為Date
          const createAtDate = new Date(v.created_at)
          // 設定時間的格式
          const option = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }
          return {
            ...v,
            created_at: createAtDate.toLocaleString('en-US', option),
          }
        })

        setEvent(eventData)
        console.log(eventData)
      })
      .catch((error) => {
        console.log('連線錯誤')
      })
  }

  // 初次渲染"之後(After)"+router.isReady改變時，執行其中程式碼
  useEffect(() => {
    // 如果isReady是true，確保能得到query的值
    if (router.isReady) {
      const { eid } = router.query
      console.log(eid)
      getEvent(eid)
    }
  }, [router.isReady])

  return (
    <>
      <div className={`container my-5 ${styles.eventPage}`}>
        <div className={`my-5 text-center`}>
          <h2>{event.title}</h2>
          <div className={`d-flex`}>
            <i className="bi bi-calendar"></i>
            <p>{event.created_at}</p>
          </div>
        </div>
        <div className={`${styles.banner}`}>
          <Image
            src={event.banner}
            alt="banner"
            fill
            style={{ objectFit: 'cover' }}
            priority
          ></Image>
        </div>

        <article className={`container my-5`}>
          <div>
            <p>{event.content}</p>
          </div>
        </article>
      </div>
    </>
  )
}
