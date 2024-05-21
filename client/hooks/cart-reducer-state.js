// isEmpty, totalItems, cartTotal為最後計算得出
// 初始化狀態 平坦化狀態
export const initItems = []

export const initState = {
  items: initItems,
  isEmpty: true,
  totalItems: 0,
  deliveryFee: 50,
}

// 置於上述items陣列中的每個項目的物件模型
// id, quantity, price為必要屬性
// const item = {
//   id: '',
//   quantity: 0,
//   price: 0,
// }
//
// 可自行定義擴充屬性例如: color, size, name, picture, description...
// const item = {
//   id: '',
//   quantity: 0,
//   name: '',
//   price: 0,
//   color: '',
//   size: '',
// }
/**
 * `findOneById(items, id)` 依照某id找出項目。如果沒有找到，則返回空物件。
 */
// export const findOneById = (items, id, isProduct) => {
//   return (
//     items.find((item) => String(item.product_id) === String(id) && isProduct) ||
//     {}
//   )
// }
export const findOneById = (items, id, detail, isProduct) => {
  return (
    items.find((item) => {
      if (isProduct) {
        return (
          String(item.product_id) === String(id) &&
          item.product_detail === detail
        )
      } else {
        return (
          String(item.lesson_id) === String(id) &&
          item.order_time + ' ' + item.timedetail === detail
        )
      }
    }) || {}
  )
}
/**
 * `updateOne(items, updateItem)` 更新項目 (quantity, color, name, price...)。updateItem會覆蓋原有的item。
 */
export const updateOne = (items, updateItem) => {
  return items.map((item) => {
    // if(item.product_id){

    // }
    // console.log(updateItem)
    if (
      item.product_id &&
      String(item.product_id) === String(updateItem.product_id) &&
      String(item.product_detail) === String(updateItem.product_detail)
    )
      return updateItem
    else if (
      item.lesson_id &&
      String(item.lesson_id) === String(updateItem.lesson_id) &&
      String(item.order_time) === String(updateItem.order_time)
    ) {
      return updateItem
    } else return item
  })
}
/**
 * `incrementOne(items, id)` 依照某id更新項目的數量+1
 */
export const incrementOne = (items, id, detail, isProduct) => {
  return items.map((item) => {
    if (
      isProduct &&
      String(item.product_id) === String(id) &&
      item.product_detail === detail
    ) {
      return { ...item, num: item.num + 1 }
    } else if (
      !isProduct &&
      String(item.lesson_id) === String(id) &&
      item.order_time + ' ' + item.timedetail === detail
    ) {
      return { ...item, num: item.num + 1 }
    } else return item
  })
}
/**
 * `decrementOne(items, id)` 依照某id更新項目的數量-1。最小為1。
 */
export const decrementOne = (items, id, detail, isProduct) => {
  return items.map((item) => {
    if (
      isProduct &&
      String(item.product_id) === String(id) &&
      item.product_detail === detail
    ) {
      return {
        ...item,
        num: item.num - 1 > 0 ? item.num - 1 : 1,
      }
    } else if (
      !isProduct &&
      String(item.lesson_id) === String(id) &&
      item.order_time + ' ' + item.timedetail === detail
    ) {
      return {
        ...item,
        num: item.num - 1 > 0 ? item.num - 1 : 1,
      }
    } else return item
  })
}
/**
 * `addOne(items, newItem)` 加入項目於items中。同id項目只會增加數量，不會重複加入。
 */
// export const addOne = (items, newItem) => {
//   // 尋找是否有已存在的索引值
//   const foundIndex = items.findIndex(
//     (item) => String(item.id) === String(newItem.id)
//   )

//   // 如果有存在，加入項目(以給定的quantity相加，或沒給定時quantity+1)
//   if (foundIndex > -1) {
//     const item = items[foundIndex]

//     // 新的數量為舊的數量加上新的數量
//     const newQuantity = item.quantity + newItem.quantity

//     // 使用更新項目
//     return updateOne(items, { ...item, quantity: newQuantity })
//   }

//   // 如果沒有存在，加入新項目
//   return [...items, newItem]
// }

export const addOne = (items, newItem) => {
  // 尋找是否有已存在的索引值
  const foundIndex = items.findIndex((item) => {
    if (item.product_id !== undefined) {
      return (
        String(item.product_id) === String(newItem.product_id) &&
        item.product_detail === newItem.product_detail
      )
    } else if (item.lesson_id !== undefined) {
      return (
        String(item.lesson_id) === String(newItem.lesson_id) &&
        item.order_time === newItem.order_time
      )
    } else {
      return false // 若兩者皆不存在，返回 false
    }
  })

  // 如果有存在，加入項目(以給定的quantity相加，或沒給定時quantity+1)
  if (foundIndex > -1) {
    const item = items[foundIndex]

    // 新的數量為舊的數量加上新的數量
    const newNum = item.num + newItem.num

    // 使用更新項目
    return updateOne(items, { ...item, num: newNum })
  }

  // 如果沒有存在，加入新項目
  return [...items, newItem]
}
/**
 * `removeOne(items, id)` 移除項目於items中。同id項目只會移除一個。
 */
// export const removeOne = (items, id, isProduct) => {
//   return items.filter(
//     (item) => (String(item.product_id) || String(item.lesson_id)) !== String(id)
//   )
// }
export const removeOne = (items, id, detail, isProduct) => {
  return items.filter((item) => {
    if (isProduct) {
      if (String(item.product_id) === String(id)) {
        return item.product_detail !== detail
      } else {
        return String(item.product_id) !== String(id)
      }
    } else {
      if (String(item.lesson_id) === String(id)) {
        return item.order_time !== detail
      } else {
        return String(item.lesson_id) !== String(id)
      }
    }
  })
}

// 以下為最後計算三者itemTotal(每項目種小計), totalItems(整體項目), cartTotal(整體總計)
/**
 * `subtotalPrice(items)` 每項目種價錢小計。
 */
export const subtotalPrice = (items) =>
  items.map((item) => ({
    ...item,
    subtotal: (item.discount_price || item.price) * item.num,
  }))
/**
 * `totalPrice(items)` 整體項目價錢總計。
 */
export const totalPrice = (items) =>
  items.reduce(
    (total, item) => total + item.num * (item.discount_price || item.price),
    0
  )
/**
 * `totalItems(items)` 整體項目數量。
 */
export const totalItems = (items) =>
  items.reduce((sum, item) => sum + item.num, 0)

// 最後將更新後的state，與initialState整理成新的state
export const generateCartState = (state, items) => {
  // isEmpty為布林值
  const isEmpty = items.length === 0

  return {
    ...initState,
    ...state,
    items: subtotalPrice(items),
    totalItems: totalItems(items),
    totalPrice: totalPrice(items),
    isEmpty,
  }
}

// 初始化用
export const init = (items) => {
  return generateCartState({}, items)
}
