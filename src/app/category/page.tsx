import React from 'react';

interface Category {
  id: number;
  name: string;
  icon: string;
  link: string;
}

const sportsCategories: Category[] = [
  { id: 1, name: '야구', icon: 'baseball-ball', link: 'https://www.example.com/baseball' },

  { id: 2, name: '축구', icon: 'soccer-ball', link: 'https://www.example.com/soccer' },

  { id: 3, name: '농구', icon: 'basketball-ball', link: 'https://www.example.com/basketball' },
  




];

const cryptoCategories: Category[] = [
  { id: 1, name: '비트코인', icon: 'bitcoin', link: '/r/비트코인' },
  { id: 2, name: '이더리움', icon: 'ethereum', link: 'https://www.example.com/ethereum' },
  { id: 3, name: '알트코인', icon: 'coins', link: 'https://www.example.com/altcoins' },
  { id: 4, name: '리플', icon: 'chart-line', link: 'https://www.example.com/trading' },
  
];
const dailyCategories: Category[] = [
  { id: 1, name: '유머/정보', icon: 'smile', link: 'https://www.example.com/유머-정보' },
  { id: 2, name: '핫이슈', icon: 'laugh', link: 'https://www.example.com/유머-움짤-이슈' },
  { id: 3, name: '정치/시사', icon: 'globe', link: 'https://www.example.com/정치-시사' },
  { id: 4, name: '미스터리/공포', icon: 'ghost', link: 'https://www.example.com/미스터리-공포' },
  { id: 5, name: '디지털/컴퓨터/스마트폰', icon: 'laptop', link: 'https://www.example.com/디지털-컴퓨터-폰' }
];
const entertainmentCategories: Category[] = [
  { id: 1, name: '영화/TV', icon: 'film', link: 'https://www.example.com/영화-TV' },
  { id: 2, name: '음악', icon: 'music', link: 'https://www.example.com/음악' },
  { id: 3, name: '게임', icon: 'gamepad', link: 'https://www.example.com/게임' },
  { id: 4, name: '책/소설', icon: 'book', link: 'https://www.example.com/책-소설' }
];
const groupCategories: Category[] = [
  { id: 1, name: '갤러리', icon: 'gallery-icon', link: 'https://www.example.com/gallery' },
  { id: 2, name: '연예인잡담', icon: 'celeb-chat-icon', link: 'https://www.example.com/celeb-chat' },
  { id: 3, name: '음식/여행', icon: 'food-travel-icon', link: 'https://www.example.com/food-travel' },
  { id: 4, name: '오덕양성소', icon: 'otaku-icon', link: 'https://www.example.com/otaku' },
  { id: 5, name: '걸그룹', icon: 'girlgroup-icon', link: 'https://www.example.com/girlgroup' },
  { id: 6, name: '여자연예인', icon: 'female-celeb-icon', link: 'https://www.example.com/female-celeb' },
  { id: 7, name: '동물/식물', icon: 'flora-fauna-icon', link: 'https://www.example.com/flora-fauna' },
];
const travelCategories: Category[] = [
  { id: 1, name: '국내여행', icon: 'car', link: 'https://www.example.com/국내여행' },
  { id: 2, name: '해외여행', icon: 'plane', link: 'https://www.example.com/해외여행' },
  { id: 3, name: '캠핑', icon: 'campground', link: 'https://www.example.com/캠핑' },
  { id: 4, name: '호텔/숙박', icon: 'bed', link: 'https://www.example.com/호텔-숙박' }
];


const shoppingInvestmentCategories: Category[] = [
  { id: 22, name: '쇼핑/투자', icon: 'shopping-bag', link: 'https://www.example.com/쇼핑-투자' },
  { id: 23, name: '중고 거래', icon: 'hot-icon', link: 'https://www.example.com/핫딜' },
  { id: 24, name: '주식', icon: 'stock-icon', link: 'https://www.example.com/주식' },
  { id: 25, name: '가상화폐', icon: 'crypto-icon', link: 'https://www.example.com/가상화폐' },
  { id: 26, name: '부동산', icon: 'real-estate-icon', link: 'https://www.example.com/부동산' },
  { id: 27, name: '쇼핑', icon: 'shopping-cart', link: 'https://www.example.com/자유쇼핑' },
];

const generalCategories: Category[] = [
  { id: 2, name: '아프리카TV', icon: 'africa-tv-icon', link: 'https://www.example.com/africa-tv' },
  { id: 3, name: '인터넷방송', icon: 'internet-broadcast-icon', link: 'https://www.example.com/internet-broadcast' },
  { id: 4, name: '스타크래프트', icon: 'starcraft-icon', link: 'https://www.example.com/starcraft' },
  { id: 5, name: '영화/TV', icon: 'movie-tv-icon', link: 'https://www.example.com/movie-tv' },
  { id: 6, name: '힙합', icon: 'hiphop-icon', link: 'https://www.example.com/hiphop' },
  { id: 7, name: '버튜버', icon: 'youtuber-icon', link: 'https://www.example.com/youtuber' },
  { id: 8, name: '운동/건강/아싸', icon: 'fitness-icon', link: 'https://www.example.com/fitness' },
  { id: 9, name: '웹툰/웹소설/만화', icon: 'webtoon-icon', link: 'https://www.example.com/webtoon' },
  { id: 10, name: '프로필/로고', icon: 'profile-logo-icon', link: 'https://www.example.com/profile-logo' },
];

const CategoryComponent: React.FC = () => {
  const allCategories = [
    {title: '쇼핑 및 투자',categories: shoppingInvestmentCategories},
    { title: '스포츠', categories: sportsCategories },
    { title: '유머 정보', categories: dailyCategories },
    { title: '엔터테인먼트', categories: entertainmentCategories },
    { title: '여행', categories: travelCategories },
    { title: '일반 ', categories: generalCategories },
    { title: '연예 & 여가 ', categories: groupCategories },
    {
      title: 'PC/기타',
      categories: [
        { id: 1, name: '리그오브레전드', icon: 'game-icon', link: 'https://www.example.com/lol' },
        { id: 2, name: '로스트아크', icon: 'game-icon', link: 'https://www.example.com/lostark' },
        { id: 3, name: '피파', icon: 'game-icon', link: 'https://www.example.com/lostark' },
        { id: 4, name: '배틀그라운드', icon: 'game-icon', link: 'https://www.example.com/lostark' },
        { id: 5, name: '메이플스토리', icon: 'game-icon', link: 'https://www.example.com/lostark' },
        { id: 6, name: '서든어택', icon: 'game-icon', link: 'https://www.example.com/lostark' },
      ]
    },
    

    {
      title: '모바일',
      categories: [
        { id: 10, name: '원신', icon: 'game-icon', link: 'https://www.example.com/genshin' },
        { id: 11, name: '바람:연', icon: 'game-icon', link: 'https://www.example.com/wind' },
        { id: 12, name: '스타레일', icon: 'game-icon', link: 'https://www.example.com/star-rail' },
        { id: 13, name: '우마무스메', icon: 'game-icon', link: 'https://www.example.com/umamusume' },
        { id: 14, name: '소녀전선', icon: 'game-icon', link: 'https://www.example.com/girl-frontline' },
        { id: 15, name: '던파 모바일', icon: 'game-icon', link: 'https://www.example.com/dnf-mobile' }
      ]
    },
    {
      title: '커뮤니티',
      categories: [
        { id: 16, name: '패션', icon: 'fashion-icon', link: 'https://www.example.com/fashion' },
        { id: 17, name: '연애상담', icon: 'love-advice-icon', link: 'https://www.example.com/love-advice' },
        { id: 18, name: '자동차', icon: 'car-icon', link: 'https://www.example.com/car' },
        { id: 19, name: '자유', icon: 'freedom-icon', link: 'https://www.example.com/freedom' },
        { id: 20, name: '직장/알바/사업', icon: 'work-icon', link: 'https://www.example.com/work' },
        { id: 21, name: '공부', icon: 'study-icon', link: 'https://www.example.com/study' }
      ]
    },

    
  ];
  return (
<div className="flex justify-center items-center h-screen bg-gray-100">
    <div className="w-11/12 sm:w-4/5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto max-h-screen p-4"> 
      {allCategories.map((group, idx) => (
        <div key={idx} className="border bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-white bg-purple-500 p-1 sm:p-2 rounded">{group.title}</h2>
          {group.categories.map((category) => (
            <a key={category.id} href={category.link} className="flex items-center mb-1 sm:mb-2 text-purple-700 hover:text-purple-900 transition duration-300">
              <i className={`fas fa-${category.icon} mr-2 sm:mr-3 text-lg sm:text-xl`} />
              <span className="text-sm sm:text-base">{category.name}</span>
            </a>
          ))}
        </div>
      ))}
    </div>
</div>

);

};


export default CategoryComponent;
