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
import {Loader2 } from 'lucide-react'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { SHA256 } from 'crypto-js';
import Link from 'next/link';

const solanaWeb3 = require('@solana/web3.js');
const decimal =10000000  //7자리
// Special setup to add a Buffer class, because it's missing
declare global {
  interface Window {
    solana: any; // TODO: provide a more detailed type here if available
  }
}

function MintToken() {

  useEffect(() => {
    window.Buffer = window.Buffer || require("buffer").Buffer;
  }, []); 
  const [keys, setKeys] = useState({ publicKey: '', privateKey: [] });
  const [inputError, setInputError] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState('');
  const [provider, setProvider] = useState(null);

  const [ConnectedWalletNow, setConnectedWalletNow] = useState<PublicKey | null>(null);

const web3 = require("@solana/web3.js");
// const [connection, setConnection] = useState<Connection | null>(null);


const connection = new web3.Connection('https://fragrant-cosmological-ensemble.solana-mainnet.discover.quiknode.pro/4771f857c3d336d109cbd1812a6f7745a198eb15/','confirmed');
// const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const crypto = require('crypto');
  const seedString = "community";
  const seedBuffer = crypto.createHash('sha256').update(seedString).digest();

  const fromWallet = Keypair.fromSeed(seedBuffer.slice(0, 32));
  // const fromWallet = Keypair.generate();

    console.log(`새로운 publicKey, 솔라나 먼저 충전 해주세요: ${fromWallet.publicKey.toBase58()}`);

    // Public Key to your Phantom Wallet
  let [toWallet, setToWallet] = useState<PublicKey | null>(null);
  
  let fromTokenAccount: any;
  let mint: PublicKey;
const [isConnected, setIsConnected] = useState<boolean>(false);




async function connectWallet() {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      console.log("Phantom is installed!");
    }
    if (!provider.isConnected) {
      await provider.connect();
    }
    if (provider.publicKey) {
      toWallet=(new PublicKey(provider.publicKey.toBase58()));
      console.log(`Connected to wallet ${provider.publicKey}`);
    } else {
      console.log("Failed to get wallet public key");
    }
  }
  else {
    console.log("Please install Phantom Wallet.");
  }
}

useEffect(() => {
  connectWallet();
}, []);






  async function createToken() {
      // const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
      // await connection.confirmTransaction(fromAirdropSignature);
   if (!connection) {
        console.error("Connection is not initialized.");
        return;
    }
      // Create new token mint
      mint = await createMint(
          connection, 
          fromWallet, 
          fromWallet.publicKey, 
          null, 
          7 // 9 here means we have a decmial of 9 0's
      );
      console.log(`mint address: ${mint.toBase58()}`);
  
      // Get the token account of the fromWallet address, and if it does not exist, create it
      fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromWallet,
          mint,
          fromWallet.publicKey
      );
      console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);

  }

  async function mintToken() {   
    if (!connection) {
      console.error("Connection is not initialized.");
      return;
  }   
  const amountPerMint = BigInt(10000000000) * BigInt(decimal);  // 100억 * 10의 9승

  for (let i = 0; i < 5; i++) {
      const signature = await mintTo(
          connection,
          fromWallet,
          mint,
          fromTokenAccount.address,
          fromWallet.publicKey,
          amountPerMint
      );
      console.log(`Mint signature for iteration ${i}: ${signature}`);
  }
}

  async function checkBalance() {
    if (!connection) {
      console.error("Connection is not initialized.");
      return;
  }
      // get the supply of tokens we have minted into existance
      const mintInfo = await getMint(connection, mint);
  console.log(mintInfo.supply);
  
  // get the amount of tokens left in the account
      const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
  console.log(tokenAccountInfo.amount);
  }

  async function saveTokenToDb() {
    if (mint && fromWallet && fromTokenAccount.address) {
        const tokenData = {
            mint: mint.toBase58(),
            wallet: fromWallet.publicKey.toBase58(),
            privateKey: Array.from(fromWallet.secretKey),
            fromTokenAccountAddress: fromTokenAccount.address
        };

        try {
            const response = await axios.post('/api/saveKeyData', tokenData);
            console.log(response.data);
        } catch (error) {
            console.error(error); // 서버 측에서 발생한 오류를 콘솔에 출력
        }
    } else {
        console.log('Mint or Wallet or Token Account Address is not initialized yet');
    }
}


async function saveUserOwnKeyData() {
  const keypair = solanaWeb3.Keypair.generate();
  const privateKeyArray = Array.from(keypair.secretKey);

  console.log('Private Key Type:', typeof privateKeyArray); // 출력: "Private Key Type: object"
  console.log('Private Key Value:', privateKeyArray); // 출력: (n) [number1, number2, ...]

  const tokenData = {
    publicKey: keypair.publicKey.toBase58(),
    privateKey:privateKeyArray
  };

  try {
    const response = await axios.post('/api/updateUserOwnKeyData', tokenData);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }


  return tokenData;
  
}
async function getUserOwnKeyData() {
  try {
    const response = await axios.get('/api/getUserOwnKeyData');
    console.log(`Public Key: ${response.data.publicKey}`);
    console.log(`Private Key: ${response.data.privateKey}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    
    console.error(error);
    return null;
  }
  
}


async function checkAndSaveKeys() {
  const data = await getUserOwnKeyData();
  
  if (data === null || !data.publicKey || !data.privateKey) {
    // 만약 데이터가 null이거나, publicKey나 privateKey가 없으면
    // 새로운 키를 생성하고 저장합니다.
    console.log("No key data found. Generating new keys...");
    return saveUserOwnKeyData();
  } else {
    // 만약 데이터가 있고, publicKey와 privateKey 모두 있으면
    // 이미 존재하는 키를 사용하므로 아무 것도 하지 않습니다.
    console.log("Key data found. Using existing keys...");
    return data;
  }
}

// useEffect(() => {
//   const fetchKeys = async () => {
//     const data = await checkAndSaveKeys();
//     setKeys(data);
//   };
//   fetchKeys();
// }, []);











const getTokenBalance = async (): Promise<number> => {
  const connection = new Connection('https://fragrant-cosmological-ensemble.solana-mainnet.discover.quiknode.pro/4771f857c3d336d109cbd1812a6f7745a198eb15/','confirmed');
// 지정된 토큰 어드레스
const tokenAddress = new PublicKey("HQNntSpnCFsEA3Vyac9yQNEsmBovwx6XYuzXsJomW8fE");

// 조회하려는 계정의 주소
const accountAddress = new PublicKey(keys.publicKey);
try {
    const walletTokenAccounts = await connection.getParsedTokenAccountsByOwner(accountAddress, {
      mint: tokenAddress
    });

    // Check if any accounts are returned
    if (walletTokenAccounts && walletTokenAccounts.value.length > 0) {
      const walletTokenAccount = walletTokenAccounts.value[0];
      const amount = walletTokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      console.log(`amount: ${amount}`);
      console.log(`amount: ${JSON.stringify(walletTokenAccount.account.data.parsed.info, null, 2)}`);
    // Get lamports balance
    const balance = await connection.getBalance(accountAddress);
    const lamportsToSol = balance / decimal; // 1 Sol = 1,000,000,000 lamports
    console.log(`Lamports balance: ${balance}`);
    console.log(`Sol balance: ${lamportsToSol}`);

      return amount;
    } else {
      console.log('No accounts found');
      return 0;
    }
  } catch (e) {
    console.error("Error while fetching token balance: ", e);
    return 0;
  }
};







const getTransactions = async (tokenAccountAddress: string, mintAddress: string) => {
  const provider = window.solana;
  const ConnectedWalletNow = new PublicKey(provider.publicKey.toBase58());
  const apiUrl = '/api/saveTransactionsInfo';
  
  await axios.post(apiUrl, {
    tokenAccountAddress,
    mintAddress,
    ConnectedWalletNow: ConnectedWalletNow.toBase58(),
  });

  console.log("Transactions 서버로 전송됨")
};


const [coinNumber, setCoinNumber] = useState<number | null>(null);

async function getCoinNumber() {
  // Assume we get the coin number from an API
  const response = await axios.get('/api/getCoinNumber');
  
  // Get the first object from the response data array
  const firstObject = response.data[0];

  // Log the crypto_currency value
  console.log("COIN: " + firstObject.crypto_currency);
  
  return firstObject.crypto_currency;
}

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

// Define common button style
const buttonStyle = { 
  padding: '15px 30px', 
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#007BFF',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};



useEffect(() => {
  const checkSolana = () => {
    if (typeof window !== 'undefined' && window.solana && window.solana.publicKey) {
      const localProvider = window.solana; // Use a local variable to store the value
      setProvider(localProvider); // Schedule a state update
      setConnectedWalletNow(new PublicKey(localProvider.publicKey.toBase58())); // Use the local variable
      console.log("Wallet Connected: ", localProvider.publicKey.toBase58()); // Use the local variable
    } else {
      // solana 객체가 아직 준비되지 않았다면 다시 확인
      setTimeout(checkSolana, 100); // 100ms 마다 체크
    }
  };
  
  checkSolana();
}, []);








const [manualWalletAddress, setManualWalletAddress] = useState<string | null>(null);

const [transferAmount, setTransferAmount] = useState<number | null>(null);
const [isTokenTransferred, setIsTokenTransferred] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

async function sendToken() {
  setIsLoading(true);       // 로딩 시작
  setIsTokenTransferred(false);  // 토큰 전송 상태를 리셋
  
  if (coinNumber === null || (transferAmount !== null && transferAmount / decimal > coinNumber)) {
    console.error('Transfer amount exceeds available coin number or coin number is not yet loaded');
    setErrorMessage("전송 실패 !");
    return; // 함수를 여기서 종료합니다.
  }
  let provider = window && window.solana ? window.solana : null;
  


  if (provider && provider.publicKey) {
    toWallet = new PublicKey(provider.publicKey);
    console.log(provider.publicKey+"프로바이더퍼블리기키");
} else if (manualWalletAddress) {
    console.log("no wallet");
    console.log(manualWalletAddress+"qqqqqqqqqqq");

    toWallet = new PublicKey(manualWalletAddress);
    console.log(toWallet+"qqqqqqqqqqq");

} else {
  console.error('Wallet not connected or manual address not provided');
  setErrorMessage("전송 실패");
  return;
  
}
setErrorMessage(null);

  
  try {
    if (!toWallet) {
      console.error('Wallet not connected');
      return;
    }
    console.log("Connected to towallet " +toWallet);

    // console.log("Connected to wallet " + provider.publicKey?.toBase58());
    if (!connection) {
      console.error("Connection is not initialized.");
      return;
  }

    // 데이터베이스에서 토큰 정보를 가져옵니다.
    const tokenData = await axios.get('/api/getKeyData');
  
    // tokenData.data가 배열이므로 각각의 토큰 데이터에 대해 반복합니다.
    for (let i = 0; i < tokenData.data.length; i++) {
      const { mint, privateKey, fromTokenAccountAddress } = tokenData.data[i];
      console.log("mintmintmint " + mint);

      // privateKey를 바로 사용하여 fromWallet Keypair 생성
      const fromWallet = Keypair.fromSecretKey(new Uint8Array(privateKey.map(Number)));
  
      // Get the token account of the toWallet address, and if it does not exist, create it
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, new PublicKey(mint),  toWallet);
      console.log(`toTokenAccount ${toTokenAccount.address}`);
      console.log(`fromWallet ${fromWallet.publicKey}`);
      if (!connection) {
        console.error("Connection is not initialized.");
        return;
    }
      if (transferAmount !== null) {

      const signature = await transfer(
        connection,
        fromWallet,
        new PublicKey(fromTokenAccountAddress),
        toTokenAccount.address,
        fromWallet.publicKey,
        transferAmount // 1 billion
      );
      
      console.log(`Finished transfer with ${signature}`);
      setIsTokenTransferred(true);



    }

  }
    // 전송이 성공하면 crypto_currency 값을 업데이트합니다.
    if (transferAmount !== null) {
      await minusCryptoCurrency(transferAmount / decimal); // 9자리 소수점으로 나눈 값을 전달합니다.
    } else {
      console.error('Transfer amount is not set');
    }
      } catch (error) {
    console.error(error);
  }
  setIsLoading(false); // 로딩 종료
  window.location.reload(); // 페이지를 새로고침

}


const minusCryptoCurrency = async (coinNumber: any) => {
  try {
    const response = await axios.post('/api/minusCoin', {
      coinNumber: coinNumber
    });

    if (response.status === 200) {
      console.log('Crypto currency updated successfully');
      return true;
    } else {
      console.error('Failed to update crypto currency');
      return false;
    }
  } catch (error) {
    console.error('An error occurred while updating crypto currency:', error);
    return false;
  }
};

return (
  
<div className="flex flex-col items-center justify-center space-y-4">
<h1 className="text-gray-800 mb-8">
<Link href="/r/communityWallet">
커뮤니티 지갑</Link>
      </h1>   
      {coinNumber !== null ? (
  <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4 flex items-center">
    {coinNumber !== 0 ? (
      <>
        <img src="/favicon.ico" alt="Coin Image" className="w-6 h-6" /> {/* 48x48 pixels */}
        <span className="ml-2">COT : {coinNumber}</span>
      </>
    ) : (
      <div className="flex items-center">
                <img src="/favicon.ico" alt="Coin Image" className="w-6 h-6 ml-2 mr-2" /> {/* 48x48 pixels */}

        <span>  COT : 0</span>
      </div>
    )}
  </div>
) : ( 
  <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4 flex items-center">
    <span>토큰 정보를 가져오는 중...</span>
    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin ml-2' />
  </div>
)}

    <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4">
  {ConnectedWalletNow ? (
    <>
      <span className="text-sm sm:text-base" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>1. 현재 연결된 지갑 주소: </span>
      <span className="text-xs sm:text-sm">{ConnectedWalletNow.toString()}</span>
    </>
  ) : (
    <>
    
<span className="text-xs sm:text-sm" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>
    1. <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: 'blue' }}>
        팬텀 지갑
    </a>을 연결하거나, 아래에 팬텀 지갑 Solana 주소를 입력해주세요:
</span>




      <input 
        type="text" 
        placeholder="지갑 주소 입력" 
        className="border rounded-md p-2 w-full mt-2" 
        value={manualWalletAddress || ''} 
        onChange={(e) => setManualWalletAddress(e.target.value)} 
      />
    </>
  )}
</div>




    <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4">
    <label className="text-gray-600 block mb-2" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>
    2. 전송할 토큰 수량을 입력해 주세요.
</label>

      <input
        type="number"
        className="border rounded-md p-2 w-full"
        value={transferAmount !== null ? transferAmount / decimal : ''}
        onChange={(e) => {
          const inputValue = e.target.value === '' ? null : Number(e.target.value) * decimal;
          const roundedValue = inputValue !== null ? Math.floor(inputValue) : null;
          
          if (roundedValue !== null && roundedValue !== inputValue) {
            setInputError(true);
            setInputErrorMessage('입력한 값이 소수점 9자리를 초과 할 수 없습니다.');
          } else if (coinNumber !== null && inputValue !== null && inputValue / decimal > coinNumber) {
            setInputError(true);
            setInputErrorMessage('입력한 값이 사용 가능한 코인 수량을 초과 할 수 없습니다.');
          } else {
            setTransferAmount(inputValue);
            setInputError(false);
            setInputErrorMessage('');
          }
        }}
      />
    </div>

    {inputError && <div className="text-red-500 shadow-md p-4 bg-white rounded-md w-full max-w-md">{inputErrorMessage}</div>}

    <button className="mr-10 ml-10 text-black rounded-md p-2 hover:bg-opacity-90 active:bg-opacity-80 focus:outline-none shadow-md w-3/4 max-w-md transform transition-transform duration-300 hover:scale-105" style={{ background: 'linear-gradient(45deg, #673AB7, #9C27B0, #E040FB)' }} onClick={sendToken}>
    <span style={{ backgroundColor: 'rgba(255, 255, 0, 0.6)' }}>
        3. 연결된 팬텀 지갑으로 토큰 전송하기
    </span>
</button>


{/* 로딩 중 메시지 */}
{isLoading && !isTokenTransferred && !errorMessage && (
  <div className="shadow-md p-4 bg-white rounded-md w-full max-w-md mr-4 ml-4 flex items-center justify-center">
  <span className="mr-2">토큰을 지급하는 중...</span>
  <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
</div>

)}

{/* 에러 메시지 */}
{errorMessage && (
  <div className="text-red-600 font-medium text-sm bg-red-50 border border-red-400 p-3 rounded-md shadow-md transform transition-transform duration-300 hover:scale-105">
    {errorMessage}
  </div>
)}

{/* 토큰 전송 성공 메시지 */}
{isTokenTransferred && (
  <div className="mt-4 shadow-md p-4 bg-green-100 text-green-800 rounded-md w-full max-w-md">
    토큰이 성공적으로 전송 되었습니다
  </div>
)}

{/* 지갑 연결 안내 메시지 */}
{/* <div className="sm:shadow-md p-4 bg-white rounded-md w-full max-w-md text-center sm:ml-4 , sm:mr-4">
  연결된 지갑 주소로, 토큰이 지급됩니다
</div> */}

    {/* <button style={buttonStyle} onClick={createToken}>Create token</button>
<button style={buttonStyle} onClick={mintToken}>Mint token</button>
<button style={buttonStyle} onClick={saveTokenToDb}>Save database</button>



<button style={buttonStyle} onClick={getCoinNumber}>getCoinNumber</button> */}

  </div>
);





}

export default MintToken;

      //토큰 만들기

