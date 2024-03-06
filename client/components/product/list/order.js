import { useMemo, useState } from 'react'

import { MdReplyAll } from "react-icons/md";
import { MdFiberNew } from "react-icons/md";
import { FaSortNumericDownAlt } from "react-icons/fa";
import { FaSortNumericUpAlt } from "react-icons/fa";

export default function OrderProduct({product, setProduct}) {
  const items = useMemo(() => {
    if (!product) return [];
    return product.data
  }, [product])

  // 全部商品
  const sortAllProducts = () => {
    const allSortedProducts = [...items].sort((a, b) => a.id - b.id);
    setProduct({...product, data: allSortedProducts});
  };

  // 上架時間
  const sortCreatedDate = () => {
    const newUpload = [...items].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    });
    setProduct({...product, data: newUpload});
  };

  // 金額
  const sortDescending = () => {
    const sortedProducts = [...items].sort((a, b) => b.price - a.price);
    setProduct({ ...product, data: sortedProducts });
  };

  const sortAscending = () => {
    const sortedProducts = [...items].sort((a, b) => a.price - b.price);
    setProduct({ ...product, data: sortedProducts });
  };

  return (
    <>
      <div className="d-flex p-2 justify-content-end align-items-center">
        <div className="toolbar">
          <button className="btn" id="sidebarToggle">
            隱藏篩選條件 <i className="bi bi-toggles"></i>
          </button>
        </div>

        <div className="dropdown">
          <button
            className="btn dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            商品排序
          </button>
          <ul className="dropdown-menu">
          <li>
              <a 
              className="dropdown-item" 
              href="#"
              onClick={sortAllProducts}
              >
                <MdReplyAll /> 所有商品
              </a>
            </li>
            <li>
              <a 
              className="dropdown-item" 
              href="#"
              onClick={sortCreatedDate}
              >
               <MdFiberNew /> 最新上架商品
              </a>
            </li>
            <li>
              <a 
              className="dropdown-item" 
              href="#"
              onClick={sortDescending}
              >
               <FaSortNumericDownAlt /> 價格：由高至低
              </a>
            </li>
            <li>
              <a 
              className="dropdown-item" 
              href="#"
              onClick={sortAscending}
              >
                <FaSortNumericUpAlt /> 價格：由低至高
              </a>
            </li>
          </ul>
        </div>
      </div>
      <style jsx>{`
        
      `}</style>
    </>
  )
}
