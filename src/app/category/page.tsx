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
  { id: 4, name: '풋볼', icon: 'football-ball', link: 'https://www.example.com/football' },
  { id: 5, name: '수영', icon: 'swimmer', link: 'https://www.example.com/swimming' },
];

const cryptoCategories: Category[] = [
  { id: 1, name: '비트코인', icon: 'bitcoin', link: '/r/비트코인' },
  { id: 2, name: '이더리움', icon: 'ethereum', link: 'https://www.example.com/ethereum' },
  { id: 3, name: '알트코인', icon: 'coins', link: 'https://www.example.com/altcoins' },
  { id: 4, name: '트레이딩', icon: 'chart-line', link: 'https://www.example.com/trading' },
];

const CategoryComponent: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-4/5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="border-2 border-purple-500 p-4">
              <h2 className="text-lg font-bold mb-4 text-purple-700 bg-purple-200">스포츠</h2>
              {sportsCategories.map((category) => (
                <a key={category.id} href={category.link} className="flex items-center text-purple-700 hover:text-purple-900">
                  <i className={`fas fa-${category.icon} mr-2`} />
                  <span>{category.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="border-2 border-purple-500 p-4">
              <h2 className="text-lg font-bold mb-4 text-purple-700 bg-purple-200">가상화폐</h2>
              {cryptoCategories.map((category) => (
                <a key={category.id} href={category.link} className="flex items-center text-purple-700 hover:text-purple-900">
                  <i className={`fas fa-${category.icon} mr-2`} />
                  <span>{category.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryComponent;
