'use client'

import { 

  clusterApiUrl, 
  Connection, 
  PublicKey, 
  Keypair, 
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,      
  transfer, 
  getMint, 
  getAccount,
  
} from '@solana/spl-token';
import { useToast } from '@/hooks/use-toast';
import { Home as HomeIcon, Loader2 } from 'lucide-react'

import { useState, useEffect, SetStateAction } from 'react';
import axios from 'axios';
import Link from 'next/link';

const solanaWeb3 = require('@solana/web3.js');
const decimal =1000000000  //9자리
// Special setup to add a Buffer class, because it's missing
declare global {
  interface Window {
    solana: any; // TODO: provide a more detailed type here if available
  }
}




function MintToken() {

 

    const [isUpdated, setIsUpdated] = useState(false); // 업데이트 성공 여부를 표시하기 위한 상태
    const [publicKey, setPublicKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const [publicKeyInput, setPublicKeyInput] = useState<string>('');

 
async function connectWallet() {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
      }
      if (!provider.isConnected) {
        await provider.connect();
      }
      if (provider.publicKey) {
        toWallet=(new PublicKey(provider.publicKey.toBase58()));
      } else {
      }
    }
    else {
    }
  }
  
  useEffect(() => {
    connectWallet();
  }, []);
  


  
  
  const [coinNumber, setCoinNumber] = useState<number | null>(null);
  
  
  
  useEffect(() => {
    async function fetchCoinNumber() {
      const response = await axios.get('/api/getCoinNumber');
      const firstObject = response.data[0];
      const truncatedValue = firstObject && firstObject.crypto_currency 
      ? Math.floor(firstObject.crypto_currency * Math.pow(10, 9)) / Math.pow(10, 9)
      : 0; // 또는 다른 기본값
        setCoinNumber(truncatedValue);
    }
  
    fetchCoinNumber();
  }, []);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast()
  async function updatePublicKeyForCrypto() {
    try {
        const response = await axios.post('/api/update_public_key_for_crypto_transactions', {
            newPublicKey: publicKeyInput
        });

        if (response.status === 200) {
            setIsUpdated(true);
            toast({
                title: '성공',
                description: '퍼블릭 키가 성공적으로 등록 되었습니다!',
            });  // 성공 메시지
        } else if (response.status === 400) {
            // HTTP 상태 코드가 400인 경우 토스트 알림으로 오류 메시지를 표시합니다.
            toast({
                title: '이미 등록된 공개 키 입니다.',
                description: '다른 공개 키를 등록해 주세요.',
                variant: 'destructive'
            });
        } else {
            throw new Error('서버에서 응답하지 않습니다.');
        }
    } catch (error) {
        console.error('public_key_for_crypto_transactions 업데이트 중 오류 발생:', error);
        setIsUpdated(false);
        toast({
            title: '공개 키 중복.',
            description: '다른 유저가 이미 입력하신 공개 키를 사용하고 있습니다.',
            variant: 'destructive'
        });  // 예외 오류 메시지
    }
    window.location.reload(); // 페이지를 새로고침

}




 useEffect(() => {
    window.Buffer = window.Buffer || require("buffer").Buffer;

    // Generate a new wallet keypair on page load and set to the 'keys' state
    const newWallet = Keypair.generate();
    setKeys({
      publicKey: newWallet.publicKey.toBase58(),
      privateKey: Array.from(newWallet.secretKey)
    });
    
    console.log(`새로운 publicKey, 솔라나 먼저 충전 해주세요: ${newWallet.publicKey.toBase58()}`);




 


  }, []); // Empty dependency array ensures this useEffect runs only once on component mount

  useEffect(() => {
    // Define the function to fetch the public key
    async function fetchPublicKey() {
      try {
        const response = await axios.post('/api/get_public_key_for_crypto_transactions'); // Adjust the endpoint path as needed
        if (response.status === 200) {
          setPublicKey(response.data.publicKeyForCrypto);
        } 
      } catch (err) {
        console.error('Error fetching public key:', err);
      } finally {
        setLoading(false);
      }
    }

    // Call the function
    fetchPublicKey();
  }, []);  // The empty dependency array means this useEffect runs once, similar to componentDidMount




  
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: number[]; }>({
    publicKey: '',
    privateKey: []
  });
const [inputError, setInputError] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState('');


  let [toWallet, setToWallet] = useState<PublicKey | null>(null);

  let fromTokenAccount: any;
  let mint: PublicKey;
  const [isConnected, setIsConnected] = useState<boolean>(false);




let provider;
let ConnectedWalletNow;
// useEffect(() => {

if (typeof window !== 'undefined' && window.solana && window.solana.publicKey) {
  provider = window.solana;
  ConnectedWalletNow = new PublicKey(provider.publicKey.toBase58());
}
// }, []);
const getPhantomLink = () => {
  if (typeof window === 'undefined') {
    return "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=ko"; // 기본 링크
  }

  const userAgent = window.navigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return "https://play.google.com/store/apps/details?id=app.phantom&hl=ko&gl=US&pli=1";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "https://apps.apple.com/kr/app/phantom-crypto-wallet/id1598432977";
  } else {
    return "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=ko";
  }
};

const [link, setLink] = useState("https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=ko"); // 기본값 설정

useEffect(() => {
  setLink(getPhantomLink());
}, []);
  

const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
const [isButtonDisabled, setIsButtonDisabled] = useState(false);
const [remainingTime, setRemainingTime] = useState(0);
useEffect(() => {
  // 컴포넌트 마운트 시점에 마지막 호출 시간을 확인하고 남은 시간 계산
  const lastCalledTimeString = localStorage.getItem('lastCalledTime');
  const lastCalledTime = lastCalledTimeString ? parseInt(lastCalledTimeString) : null;
  const currentTime = new Date().getTime();
  const delay = lastCalledTime ? Math.max(0, 10000 - (currentTime - lastCalledTime)) : 0;
  setRemainingTime(delay);

  // 남은 시간이 있으면 매 초마다 남은 시간 갱신
  let timer: string | number | NodeJS.Timeout | undefined;
  if (delay > 0) {
    timer = setInterval(() => {
      setRemainingTime((prevRemainingTime) => Math.max(prevRemainingTime - 1000, 0));
    }, 1000);
  }

  return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
}, []);


const [isButtonClicked, setIsButtonClicked] = useState(false);

const [isRequestPending, setIsRequestPending] = useState<number | null>(null);
const getTransactions = async (tokenAccountAddress: string, mintAddress: string) => {
  if (isButtonDisabled || isRequestPending !== null) return;

  const lastCalledTimeString = localStorage.getItem('lastCalledTime');
  const lastCalledTime = lastCalledTimeString ? parseInt(lastCalledTimeString) : null;
  const currentTime = new Date().getTime();
  const delay = lastCalledTime ? Math.max(0, 10000 - (currentTime - lastCalledTime)) : 0;

  if (delay > 0) {
    // 제한 시간이 남아있는 경우, 메시지를 표시하거나 다른 처리를 수행할 수 있습니다.
    console.log(`잠시 후 다시 시도하세요. 남은 시간: ${delay / 1000}초`);
    return; // 여기서 함수를 종료
  }

  setIsButtonDisabled(true);
  setIsTransactionsLoading(false);

  const apiUrl = '/api/saveTransactionsInfo';
  await axios.post(apiUrl, {
    tokenAccountAddress,
    mintAddress,
  });

  setIsTransactionsLoading(true);
  console.log("Transactions 서버로 전송됨");
  localStorage.setItem('lastCalledTime', new Date().getTime().toString());
  window.location.reload();

  setIsButtonDisabled(false);
  setIsRequestPending(null);
};





return (
  
<div className="flex flex-col items-center justify-center space-y-2">
<div className="flex space-x-4">
    <h1 className="text-gray-800 mb-8 p-2 border border-gray-300 rounded-full shadow-md">
        <Link href="/r/wallet">
            출금
        </Link>
    </h1>

    <h1 className="text-gray-800 mb-8 p-2 border border-gray-300 rounded-full shadow-md" style={{ backgroundColor: 'rgba(255, 255, 0, 0.6)' }}>
        <Link href="/r/communityWallet">
            입금
        </Link>
    </h1>
</div>

      <div className="">
      {coinNumber !== null ? (
  <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md  flex items-center">
    <img src="/favicon.ico" alt="Coin Image" className="w-6 h-6" /> {/* 이미지 추가 */}
    <span className="ml-2">COT : {coinNumber}</span>
  </div>
) : ( 
<div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4 flex items-center">
  <img src="/favicon.ico" alt="Coin Image" className="w-6 h-6 mr-2" /> {/* 이미지 추가 */}
  <span className="flex items-center">
    Loading... <Loader2 className='w-6 h-6 text-zinc-500 animate-spin ml-2' />
  </span>
</div>

)
}
      </div>
      {/* Public Key Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
      <h2 className="font-medium text-gray-600 flex items-center text-xs md:text-sm lg:text-base" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>
  1. 환전 주소로 COT 토큰을 보낼, 회원님의 팬텀 지갑 Solana 주소를 등록해 주세요
</h2>



    <p className="text-purple-500 break-all overflow-hidden">등록된 주소 : {publicKey}</p>
    <input
      className="border rounded p-2 w-full mt-2"
      value={publicKeyInput}
      onChange={(e) => setPublicKeyInput(e.target.value)}
      placeholder="Public Key for Crypto Transactions"
    />
    <button className="mt-2 bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600 transition duration-300"style={{ background: 'linear-gradient(45deg, #673AB7, #9C27B0, #E040FB)' }} onClick={updatePublicKeyForCrypto}>
      Update Public Key
    </button>
</div>

      {/* 환전 주소 Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
      <p className="text-sm break-all overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>
  2. 환전 주소로 COT 토큰을 전송해 주세요.<br /> <span className="text-red-600">(전송할 팬텀 지갑의 Solana 지갑주소를 꼭 먼저 등록하셔야 합니다)</span>
</p>



    <p className="text-purple-500  text-sm break-all overflow-hidden ">
        환전 주소 : HQNntSpnCFsEA3Vyac9yQNEsmBovwx6XYuzXsJomW8fE
    </p>
</div>


      {/* Coin Number Section */}


      {/* Token 전송하기 Button Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        <div className="text-sm break-all overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>
  3. 솔라나 스캔에서 전송 확인 후 버튼을 눌러주세요.
  </div>
  <a href="https://solscan.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
    Solana Scan에서 확인하기
  </a>
  <button className="bg-green-500 text-white rounded p-2 w-full hover:bg-green-600 transition duration-300 mt-2" style={{ background: 'linear-gradient(45deg, #673AB7, #9C27B0, #E040FB)' }}onClick={() => getTransactions('HQNntSpnCFsEA3Vyac9yQNEsmBovwx6XYuzXsJomW8fE', 'AhrB82aokkXPXvqgdR5X4hVfo4iq7FQqigqTFpB236YB')}>
    커뮤니티 지갑으로 토큰 전송하기
  </button>
  {remainingTime > 0 && <p style={{ color: 'purple' }}>{Math.ceil(remainingTime / 1000)}초 후에 다시 시도해 주세요</p>}

  <div>
    {!isTransactionsLoading ? (
      <div className="flex items-center">
  <div className="text-purple-500">회원님이 전송한 토큰을 확인하는 중...</div>
  <Loader2 className='w-6 h-6 text-zinc-500 animate-spin ml-2' />
</div>
    ) : (
      <div>
      </div>
    )}
  </div>
</div>




      {inputError && <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4"><p className="text-red-500">{inputErrorMessage}</p></div>}
      {errorMsg && <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4"><p className="text-red-500">{errorMsg}</p></div>}
    </div>
);


}
  
  export default MintToken;
  











