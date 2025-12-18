import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // 스타일(Tailwind) 불러오기

// index.html에 있는 id="root"를 찾아서 그 안에 App을 집어넣어라! 라는 뜻입니다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)