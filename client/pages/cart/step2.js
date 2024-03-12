import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import CartStep from '@/components/cart/cart-step'
import AutoTab from '@/components/cart/test'
import Order from '@/components/cart/order'

import { useRouter } from 'next/router'
import OrderForm from '@/components/cart/order-form'

import { useAuth } from '@/hooks/auth'

export default function Home() {
  const router = useRouter()

  const payment = 2

  const [order, setOrder] = useState({})
  const [cartData, setCartData] = useState(null)

  const [userInputs, setUserInputs] = useState({
    user_name: '',
    user_phone: '',
    user_city: '',
    user_section: '',
    user_road: '',
    cCard_name: '',
    cCard_address: '',
    order_note: '',
    cCard_number1: '',
    cCard_number2: '',
    cCard_number3: '',
    cCard_number4: '',
    cCard_securityCode: '',
    cCard_expirationMonth: '',
    cCard_expirationYear: '',
  })

  const [isDone, setIsDone] = useState(false)

  let totalPrice = 0

  const { auth } = useAuth()

  const { transactionId, orderId } = router.query

  //抓取購物車的內容
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('cart'))
    if (data) {
      setCartData(data)
    }
  }, [])

  //檢查交易是否成功

  useEffect(() => {
    console.log('bbb')
    const fetchData = async () => {
      if (router.isReady) {
        if (!transactionId && orderId) {
          await getOrder(orderId)
        }
        if (!transactionId || !orderId) {
          return
        }
        if (!isDone) {
          await handleConfirmLinePay(transactionId)
        }
      }
    }
    fetchData()
  }, [router.isReady])

  //檢查格式
  const checkFormat = () => {
    const phone = document.querySelector('.user_phone').value
    const user_name = document.querySelector('.user_name').value
    const cCard_name = document.querySelector('.cCard_name')?.value

    let emptyInput

    const phoneRegex = /^09\d{8}$/
    const chineseRegex = /^[\u4e00-\u9fa5]+$/

    const inputs = document.querySelectorAll('input[type=text]')

    inputs.forEach((input) => {
      if (!input.value) {
        emptyInput = '有地方尚未填寫'
      }
    })

    if (emptyInput) {
      notify(emptyInput)
      return false
    }

    function checkCorr(value, regex, errMsg) {
      if (!regex.test(value)) {
        notify(errMsg)
        return false
      }
      return true
    }

    if (!checkCorr(phone, phoneRegex, '收件人電話 格式錯誤')) {
      return false
    }

    if (!checkCorr(user_name, chineseRegex, '收件人名稱 格式錯誤')) {
      return false
    }

    if (cCard_name) {
      if (!checkCorr(cCard_name, chineseRegex, '持卡人姓名 格式錯誤')) {
        return false
      }
    }

    return true
  }

  //處理送出訂單
  const handleSubLinePay = (e) => {
    e.preventDefault()
    if (checkFormat()) {
      //line pay 所需的格式
      const lineProducts = []
      cartData.forEach((data) => {
        const id = data.product_id || data.lesson_id
        const name = data.productName || data.lessonName
        const price =
          data.productDiscount || data.productPrice || data.lessonPrice
        lineProducts.push({
          id,
          name,
          quantity: data.num,
          price,
        })
      })

      //資料庫的格式 order_detail
      const products = []
      cartData.forEach((data) => {
        products.push(data)
      })

      const receiverAddress =
        userInputs.user_city + userInputs.user_section + userInputs.user_road

      const receiver = {
        name: userInputs.user_name,
        phone: userInputs.user_phone,
        address: receiverAddress,
      }

      const order_note = userInputs.order_note

      const data = {
        user_id: auth.id,
        totalPrice,
        lineProducts,
        products,
        receiver,
        order_note,
      }
      const url = 'http://localhost:3005/api/line-pay/create-order'
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          if (data.status === 'success') {
            setOrder(data.data.order)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  const handleSub = (e) => {
    e.preventDefault()
    if (checkFormat()) {
      //資料庫的格式 order_detail
      const products = []
      cartData.forEach((data) => {
        products.push(data)
      })

      const receiverAddress =
        userInputs.user_city + userInputs.user_section + userInputs.user_road

      const receiver = {
        name: userInputs.user_name,
        phone: userInputs.user_phone,
        address: receiverAddress,
      }

      const expirationDate = `${userInputs.cCard_expirationMonth}/${userInputs.cCard_expirationYear}`

      const number = `${userInputs.cCard_number1}-${userInputs.cCard_number2}-${userInputs.cCard_number3}-${userInputs.cCard_number4}`

      const credit_card = {
        number,
        securityCode: userInputs.cCard_securityCode,
        expirationDate,
        name: userInputs.cCard_name,
        address: userInputs.cCard_address,
      }

      const order_note = userInputs.order_note

      let data

      if (userInputs.cCard_number1) {
        data = {
          user_id: auth.id,
          totalPrice,
          products,
          receiver,
          credit_card,
          order_note,
        }
      } else {
        data = {
          user_id: auth.id,
          totalPrice,
          products,
          receiver,
          order_note,
        }
      }

      const url = 'http://localhost:3005/api/order/create-order'
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          if (data.status === 'success') {
            setOrder(data.data.dbOrder)
            console.log(data.data.dbOrder.id)
            window.location.href = `http://localhost:3000/cart/step2?orderId=${data.data.dbOrder.id}`
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  const goLinePay = () => {
    if (window.confirm('確認要導向至LINE Pay進行付款?')) {
      // 先連到node伺服器後，導向至LINE Pay付款頁面
      window.location.href = `http://localhost:3005/api/line-pay/reserve?orderId=${order.orderId}`
    }
  }

  const getOrder = async (orderId) => {
    try {
      const url = `http://localhost:3005/api/order/order?orderId=${orderId}`
      const response = await fetch(url, {
        method: 'GET',
      })

      const result = await response.json()

      console.log(result)

      setIsDone(true)

      // router.push(`./step2?orderId=${orderId}`)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  const handleConfirmLinePay = async (transactionId) => {
    try {
      const url = `http://localhost:3005/api/line-pay/confirm?transactionId=${transactionId}`
      const response = await fetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()

      if (result.status === 'success') {
        toast.success('付款成功')
      } else if (result.status === 'repeat') {
        toast.success('訂單已成立')
      } else {
        toast.error('付款失敗')
      }

      setIsDone(true)
    } catch (error) {
      console.error('An error occurred:', error)
      toast.error('發生錯誤，無法確認付款')
    }
  }

  //格式錯誤通知
  const notify = (msg) => {
    const msgBox = <p style={{ margin: 0 }}>{msg}</p>
    toast.error(msgBox)
  }

  return (
    <>
      {isDone ? (
        <Order orderIdTest={orderId} />
      ) : (
        <div className="container">
          <CartStep step={2} />
          <div className="container">
            <div className="w-100 text-center section-name">
              <h5 className="span">購物車</h5>
            </div>
            <table>
              <thead>
                <tr>
                  <th className="col-4 text-start">商品資料</th>
                  <th className="col-2">商品價格</th>
                  <th className="col-2">數量</th>
                  <th className="col-2">小計</th>
                  <th className="col-2"></th>
                </tr>
              </thead>
              <tbody>
                {cartData ? (
                  cartData.map((item, i) => {
                    const {
                      lessonName,
                      lessonPrice,
                      num,
                      productName,
                      productPrice,
                      productDiscount,
                      product_detail,
                      order_time,
                    } = item
                    let price = productDiscount
                      ? productDiscount * num
                      : (productPrice || lessonPrice) * num
                    totalPrice += price
                    return (
                      <tr key={i}>
                        <td>
                          <div className="row">
                            <img />
                            <div>
                              <h5 className="fw-bold text-start">
                                {productName || lessonName}
                              </h5>
                              <p className="imperceptible text-start">
                                {product_detail || order_time}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {productDiscount ? (
                            <>
                              <h5 className="fw-bold discounted">
                                NT${productDiscount}
                              </h5>
                              <p className="imperceptible text-decoration-line-through">
                                NT${productPrice || lessonPrice}
                              </p>
                            </>
                          ) : (
                            <>
                              <h5 className="fw-bold">
                                NT${productPrice || lessonPrice}
                              </h5>
                            </>
                          )}
                        </td>
                        <td>
                          <span>{num}</span>
                        </td>
                        <td>NT${price}</td>
                      </tr>
                    )
                  })
                ) : (
                  <></>
                )}
              </tbody>
            </table>
            <p className="text-end fw-bold my-3">合計: NT${totalPrice}</p>
          </div>
          <OrderForm
            handleSubLinePay={handleSubLinePay}
            handleSub={handleSub}
            userInputs={userInputs}
            setUserInputs={setUserInputs}
            payment={payment}
          />

          {payment === 2 && (
            <button onClick={goLinePay} disabled={!order.orderId}>
              Line Pay
            </button>
          )}

          <style jsx>{`
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            p {
              margin: 0;
            }

            .span {
              color: #013c64;
              font-weight: bold;
            }

            .discounted {
              color: #dc5151;
            }

            .imperceptible {
              color: #858585;
            }

            .section-name {
              background-color: #f5f5f5;
              padding: 0.5rem;
            }

            table {
              width: 100%;
            }

            tr {
              border-bottom: 1px solid black;
            }

            td,
            th {
              padding: 1rem 0;
              text-align: center;
            }
          `}</style>
          <AutoTab className="autotab-4" maxLength={4} />
          <Toaster position="bottom-center" />
        </div>
      )}
    </>
  )
}
