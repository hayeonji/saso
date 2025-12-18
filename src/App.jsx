import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- [스타일] ---
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    .font-noto { font-family: 'Noto Sans KR', sans-serif; }
    
    .joker-textarea {
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      width: 80%;
      height: 100px; 
      line-height: 1.5rem; 
      font-size: 1rem;
      color: #333;
      text-align: center;
      overflow: hidden;
    }

    /* 드래그 시 스크롤 컨테이너 */
    .scroll-container {
      display: flex;
      align-items: center; /* 수직 중앙 정렬 핵심 */
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; 
      user-select: none;
      -webkit-user-select: none;
      height: 100%; 
      width: 100%;
    }
    .scroll-container::-webkit-scrollbar { display: none; }

    .grab-cursor { cursor: grab; }
    .grab-cursor:active { cursor: grabbing; }
    
    img { -webkit-user-drag: none; }
  `}</style>
);

// --- [1. 데이터 생성] ---
const generateDeck = () => {
  const deck = [];
  for (let i = 1; i <= 12; i++) {
    deck.push({ id: `m-${i}`, type: 'month', value: i, label: `${i}월`, frontImg: `/images/cards/m_${i}.png`, backImg: `/images/cards/m_${i}_back.png` });
  }
  for (let i = 1; i <= 31; i++) {
    deck.push({ id: `d-${i}`, type: 'day', value: i, label: `${i}일`, frontImg: `/images/cards/d_${i}.png`, backImg: `/images/cards/d_${i}_back.png` });
  }
  const specificEvents = ['HappyBirthDay', 'DoNothingDay', 'FreeEatDay', 'PastDeleteDay', 'SelfLoveDay', 'JustDoItDay', 'LevelUpDay'];
  specificEvents.forEach((evt, idx) => {
    deck.push({ id: `e-${idx}`, type: 'event', value: evt, label: evt, frontImg: `/images/cards/e_${evt}.png`, backImg: `/images/cards/e_back_common.png` });
  });
  ['Joker 1', 'Joker 2'].forEach((jokerName, idx) => {
    deck.push({ id: `e-joker-${idx}`, type: 'event', value: jokerName, label: 'Joker', frontImg: `/images/cards/e_Joker.png`, backImg: `/images/cards/e_back_common.png` });
  });
  
  return deck.map(card => ({
    ...card,
    initialPos: {
        rotate: Math.random() * 60 - 30,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`
    }
  }));
};

const fullDeck = generateDeck();

const shallowCompareStyle = (prevStyle, nextStyle) => {
    if (!prevStyle || !nextStyle) return false;
    const keys = Object.keys(prevStyle);
    if (keys.length !== Object.keys(nextStyle).length) return false;
    return keys.every(key => prevStyle[key] === nextStyle[key]);
};

// --- [2. 카드 컴포넌트] ---
const Card = React.memo(({ data, isFlipped, onClick, style, className, jokerText, onJokerTextChange }) => {
  const isJoker = data.value.toString().includes('Joker');
  const [localText, setLocalText] = useState(jokerText || '');

  useEffect(() => {
    setLocalText(jokerText || '');
  }, [jokerText]);

  const handleChange = (e) => setLocalText(e.target.value);
  const handleBlur = () => {
    if (localText !== jokerText) onJokerTextChange(data.id, localText);
  };

  return (
    <motion.div
      className={`relative perspective-1000 rounded-xl flex-shrink-0 ${className}`}
      onTap={onClick} 
      initial={false} 
      animate={{ rotateY: isFlipped ? 0 : 180 }}
      transition={{ duration: 0.6, type: "tween", ease: "easeInOut" }}
      style={{ ...style, transformStyle: 'preserve-3d' }} 
      whileHover={{ scale: 1.05, zIndex: 100 }} 
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
        <div 
          className="absolute inset-0 w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center font-noto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)', zIndex: 2 }}
        >
          <img src={data.frontImg} alt={data.label} loading="lazy" decoding="async" className="w-full h-full object-cover pointer-events-none" />
          {isJoker && (
            <div className="absolute bottom-[-20px] left-0 w-full flex justify-center items-end" style={{ height: '100px' }}>
              <textarea
                className="joker-textarea font-noto placeholder-gray-400"
                placeholder="기록하고 싶은 내용을&#13;&#10;적어보세요."
                value={localText}
                onPointerDown={(e) => e.stopPropagation()} 
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          )}
          {!isJoker && (
            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10">
              <span className="text-xs text-gray-400 uppercase">{data.type}</span>
              <span className="text-xl font-bold text-gray-800">{data.label}</span>
            </div>
          )}
        </div>
        <div 
          className="absolute inset-0 w-full h-full bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: 1 }}
        >
          <img src={data.backImg} alt="back" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-600 opacity-30">◆</div>
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return shallowCompareStyle(prevProps.style, nextProps.style) &&
    prevProps.isFlipped === nextProps.isFlipped &&
    prevProps.jokerText === nextProps.jokerText && 
    prevProps.className === nextProps.className;
});

// --- [3. 메인 앱] ---
export default function App() {
  const [view, setView] = useState('landing'); 
  const [exploreCategory, setExploreCategory] = useState(''); 
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isResultConfirmed, setIsResultConfirmed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [resultCards, setResultCards] = useState([]); 
  const [scatteredCards, setScatteredCards] = useState(fullDeck);
  const [isOrganized, setIsOrganized] = useState(false);
  const [jokerTexts, setJokerTexts] = useState({});

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleJokerTextChange = useCallback((id, text) => {
    setJokerTexts(prev => ({ ...prev, [id]: text }));
  }, []);

  const handleMouseDown = (e) => {
    if (!isOrganized) return;
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleMouseLeave = () => { isDown.current = false; };
  const handleMouseUp = () => { isDown.current = false; };
  const handleMouseMove = (e) => {
    if (!isDown.current || !isOrganized) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; 
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const goToRecord = useCallback(() => {
    setView('record');
    setExploreCategory('');
    setIsOrganized(false);
    setScatteredCards(fullDeck);
    setIsResultConfirmed(false);
    setIsFlipped(false);
    setResultCards([]);
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedEvent('');
  }, []);

  const handleRecordSubmit = useCallback(() => {
    if (!selectedMonth || !selectedDay || !selectedEvent) return alert("월, 일, 이벤트를 모두 선택해주세요.");
    const mCard = fullDeck.find(c => c.type === 'month' && c.value === parseInt(selectedMonth));
    const dCard = fullDeck.find(c => c.type === 'day' && c.value === parseInt(selectedDay));
    const eCard = fullDeck.find(c => c.type === 'event' && c.value === selectedEvent);
    setScatteredCards(prev => prev.filter(c => ![mCard, dCard, eCard].includes(c)));
    setResultCards([mCard, dCard, eCard]);
    setIsResultConfirmed(true);
    setIsFlipped(false);
    setTimeout(() => setIsFlipped(true), 500);
  }, [selectedMonth, selectedDay, selectedEvent]);

  const startExplore = useCallback((category) => {
    setView('explore');
    setExploreCategory(category);
    setIsOrganized(false);
    setIsResultConfirmed(false);
    setIsFlipped(false);
    setResultCards([]);
    setScatteredCards(fullDeck.filter(c => c.type === category));
  }, []);

  const handleCardClick = useCallback((clickedCard) => {
    if (view !== 'explore') return; 
    setScatteredCards(prev => prev.filter(c => c !== clickedCard));
    setResultCards([clickedCard]);
    setIsResultConfirmed(true);
    setIsFlipped(false);
    setTimeout(() => setIsFlipped(true), 500);
  }, [view]);

  const reset = useCallback(() => {
    setIsResultConfirmed(false);
    setIsFlipped(false);
    setResultCards([]);
    setScatteredCards(view === 'explore' && exploreCategory ? fullDeck.filter(c => c.type === exploreCategory) : fullDeck);
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedEvent('');
  }, [view, exploreCategory]);

  return (
    <div className="relative w-full h-screen font-sans overflow-hidden bg-[#F0F4F8]">
      <GlobalStyle />
      <div className="absolute inset-0 z-0">
        <img src="/images/landing_bg.png" alt="background" loading="lazy" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'}} />
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex gap-8 text-sm font-medium text-gray-500 uppercase">
          <button onClick={goToRecord} className={`hover:text-black transition ${view === 'record' ? 'text-black font-bold' : ''}`}>Today</button>
          <div className="w-[1px] h-4 bg-gray-300 my-auto"></div> 
          <button onClick={() => startExplore('month')} className={`hover:text-black transition ${exploreCategory === 'month' ? 'text-black font-bold' : ''}`}>Month</button>
          <button onClick={() => startExplore('day')} className={`hover:text-black transition ${exploreCategory === 'day' ? 'text-black font-bold' : ''}`}>Day</button>
          <button onClick={() => startExplore('event')} className={`hover:text-black transition ${exploreCategory === 'event' ? 'text-black font-bold' : ''}`}>Event</button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsOrganized(true)} className={`text-xs px-3 py-1 border rounded-full transition ${isOrganized ? 'bg-black text-white border-black' : 'border-gray-400 text-gray-500 hover:border-black hover:text-black'}`}>카드 정리하기</button>
          <button onClick={() => setIsOrganized(false)} className={`text-xs px-3 py-1 border rounded-full transition ${!isOrganized ? 'bg-black text-white border-black' : 'border-gray-400 text-gray-500 hover:border-black hover:text-black'}`}>카드 어지르기</button>
        </div>
      </header>

      <main className="w-full h-full pt-20 relative">
        {view === 'landing' && (
          <div className="absolute inset-0 w-full h-full z-20 flex flex-col items-center justify-center gap-16 pt-24 pb-10">
            <motion.img initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} src="/images/landing_logo.png" alt="사소뭉치" className="w-[400px] object-contain mb-16" />
            <div className="flex items-center w-full max-w-7xl px-4 mb-20">
                <div className="flex-1 flex justify-end pr-16"><motion.img initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} src="/images/landing_left.png" className="w-40 object-contain"/></div>
                <div className="shrink-0 z-10"><motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} src="/images/landing_clock.png" className="w-40 object-contain"/></div>
                <div className="flex-1 flex justify-start pl-16"><motion.img initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} src="/images/landing_right.png" className="w-[200px] object-contain"/></div>
            </div>
            <button onClick={goToRecord} className="px-10 py-4 border border-black rounded-lg text-lg hover:bg-black hover:text-white transition duration-300 bg-white/50">뭉치 열어보기</button>
          </div>
        )}

        {(view === 'record' || view === 'explore') && (
          <>
            {/* [수정] 카드들이 있는 컨테이너: h-full과items-center로 수직 중앙 정렬 보장 */}
            <div 
              ref={scrollRef}
              className={`absolute inset-0 z-0 h-full ${isOrganized ? 'scroll-container grab-cursor' : 'overflow-hidden'}`}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
               {scatteredCards.map((card, index) => {
                 // [중요] 정리하기 시 top을 0으로 하고 y축 이동을 제거하여 scroll-container의 flex-align(center)이 작동하게 함
                 const style = isOrganized 
                    ? { position: 'relative', margin: '0 10px', rotate: 0, top: '0', left: 'auto', x: 0, y: 0 }
                    : { position: 'absolute', left: card.initialPos.left, top: card.initialPos.top, rotate: card.initialPos.rotate, x: "-50%", y: "-50%" };

                 return (
                   <motion.div 
                      key={card.id} 
                      className={isOrganized ? "inline-block" : "absolute"}
                      animate={style}
                      transition={{ duration: 0.8, type: "spring", stiffness: 45 }} 
                   >
                     <Card 
                       data={card} 
                       isFlipped={false} 
                       onClick={() => handleCardClick(card)}
                       style={{ width: '160px', height: '224px' }} 
                       className={`transition-transform shadow-2xl ${view === 'explore' ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`} 
                       jokerText={jokerTexts[card.id]} 
                       onJokerTextChange={handleJokerTextChange}
                     />
                   </motion.div>
                 );
               })}
               {isOrganized && <div className="flex-shrink-0 w-20 h-1" />}
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-12">
              <AnimatePresence>
                {isOrganized && !isResultConfirmed && (
                  // [수정] 안내 문구 위치: 화면 중앙보다 약간 위(top-[38%]) 및 그림자 제거
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  className="absolute top-[24%] left-0 right-0 pointer-events-none z-50"
>
  <div className="flex justify-center w-full">
    <p className="text-sm text-gray-500 font-noto font-medium text-center whitespace-nowrap">
      ← 마우스로 잡고 옆으로 드래그하여 전체 카드를 확인하세요 →
    </p>
  </div>
</motion.div>
                )}
              </AnimatePresence>

              {/* 하단 UI 컨테이너 */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none">
                {!isResultConfirmed && view === 'record' && (
                  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl px-4 pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4 ">
                      <h2 className="text-lg font-semibold text-gray-800 tracking-tight font-noto">오늘의 날짜를 알려주세요</h2>
                      <div className="w-full flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex gap-4 w-full justify-center">
                          <select className="p-3 w-full md:w-32 border rounded-lg bg-white outline-none focus:border-black transition-colors font-noto" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
                            <option value="">월</option>
                            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{i+1}월</option>)}
                          </select>
                          <select className="p-3 w-full md:w-32 border rounded-lg bg-white outline-none focus:border-black transition-colors font-noto" value={selectedDay} onChange={e=>setSelectedDay(e.target.value)}>
                            <option value="">일</option>
                            {[...Array(31)].map((_, i) => <option key={i} value={i+1}>{i+1}일</option>)}
                          </select>
                          <select className="p-3 w-full md:w-48 border rounded-lg bg-white outline-none focus:border-black transition-colors font-noto" value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}>
                            <option value="">이벤트</option>
                            {['HappyBirthDay', 'DoNothingDay', 'FreeEatDay', 'PastDeleteDay', 'SelfLoveDay', 'JustDoItDay', 'LevelUpDay', 'Joker 1', 'Joker 2'].map(evt => <option key={evt} value={evt}>{evt}</option>)}
                          </select>
                        </div>
                        <button onClick={handleRecordSubmit} className="w-full md:w-auto px-8 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all shrink-0 font-noto">오늘의 카드 보기</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isResultConfirmed && view === 'explore' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/70 backdrop-blur-md text-white px-8 py-4 rounded-full pointer-events-auto mb-4">
                    <p className="text-lg font-medium font-noto">
                      {exploreCategory === 'month' && "한 달에 하나씩, 12개의 질문. 이달의 카드를 선택해보세요."}
                      {exploreCategory === 'day' && "하루에 하나씩, 31가지 챌린지. 오늘은 어떤 카드일까요?"}
                      {exploreCategory === 'event' && "평범하지 않은 날을 위한 9가지 카드. 오늘의 카드를 골라보세요."}
                    </p>
                  </motion.div>
                )}

                {isResultConfirmed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                     <div className="flex gap-16 perspective-1000">
                       {resultCards.map((card, idx) => (
                         <motion.div key={card.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }} className="flex flex-col items-center">
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: isFlipped ? 1 : 0, y: 0 }} transition={{ delay: 0.3 }} className="mb-4">
                             <div className="bg-white px-4 py-1.5 rounded-full border border-gray-200">
                               <p className="text-center font-bold text-sm tracking-wider text-gray-800 uppercase font-noto">{card.type === 'event' ? card.label : card.type}</p>
                             </div>
                           </motion.div>
                           <Card data={card} isFlipped={isFlipped} style={{ width: '240px', height: '336px' }} className="shadow-2xl" jokerText={jokerTexts[card.id]} onJokerTextChange={handleJokerTextChange} />
                         </motion.div>
                       ))}
                     </div>
                     <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1 }} onClick={reset} className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:text-black hover:border-black transition mt-24 bg-white font-noto shadow-md">
                       {view === 'explore' ? '다른 카드 뽑기' : '다른 날짜 살펴보기'}
                     </motion.button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}