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

import { useState, useEffect, SetStateAction } from 'react';
import axios from 'axios';

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
  
  const [userInputWallet, setUserInputWallet] = useState('');

  
  const getTransactions = async (tokenAccountAddress: string, mintAddress: string) => {
    const apiUrl = '/api/saveTransactionsInfo';
    
    await axios.post(apiUrl, {
      tokenAccountAddress,
      mintAddress,
    });
  
    console.log("Transactions 서버로 전송됨");
};

  
  
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
        console.log(publicKeyInput);
        const response = await axios.post('/api/update_public_key_for_crypto_transactions', {
            newPublicKey: publicKeyInput
        });

        if (response.status === 200) {
            console.log('public_key_for_crypto_transactions 업데이트 성공');
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


return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-gray-700 text-2xl font-semibold mb-6">커뮤니티 지갑</h1>

      {/* Public Key Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        <h2 className="font-medium text-gray-600">등록된 지갑 공개 주소</h2>
        <p className="text-blue-500">{publicKey}</p>
        <input
          className="border rounded p-2 w-full mt-2"
          value={publicKeyInput}
          onChange={(e) => setPublicKeyInput(e.target.value)}
          placeholder="Public Key for Crypto Transactions"
        />
        <button className="mt-2 bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600 transition duration-300" onClick={updatePublicKeyForCrypto}>
          Update Public Key
        </button>
      </div>

      {/* 환전 주소 Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        <p className="text-sm">환전 주소 : BkWSdkrLJQ8rWd41itsitq5JRmEbmELHr7Zbx9qhhrLu</p>
      </div>

      {/* Coin Number Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        {coinNumber ? `COIN: ${coinNumber}` : 'Loading...'}
      </div>

      {/* Token 전송하기 Button Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        <button className="bg-green-500 text-white rounded p-2 w-full hover:bg-green-600 transition duration-300" onClick={() => getTransactions('BkWSdkrLJQ8rWd41itsitq5JRmEbmELHr7Zbx9qhhrLu', '8urzVvMEJyNqWpXjvA8vLvUbwLUhNzFpfckKyExBZpKR')}>
          커뮤니티 지갑으로 토큰 전송하기
        </button>
      </div>

      {/* 설명 Section */}
      <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4">
        연결된 지갑주소와 환전 주소로 토큰을 보낸 지갑 주소가 동일 해야, 커뮤니티 토큰이 충전 됩니다
      </div>

      {inputError && <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4"><p className="text-red-500">{inputErrorMessage}</p></div>}
      {errorMsg && <div className="bg-white p-5 rounded shadow-md w-full max-w-xl mb-4"><p className="text-red-500">{errorMsg}</p></div>}
    </div>
);


}
  
  export default MintToken;
  













      //토큰 만들기


    //   async function createToken() {
        // const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
        // await connection.confirmTransaction(fromAirdropSignature);
     
        // Create new token mint
//         mint = await createMint(
//             connection, 
//             fromWallet, 
//             fromWallet.publicKey, 
//             null, 
//             9 // 9 here means we have a decmial of 9 0's
//         );
//         console.log(`Create token: ${mint.toBase58()}`);
    
//         // Get the token account of the fromWallet address, and if it does not exist, create it
//         fromTokenAccount = await getOrCreateAssociatedTokenAccount(
//             connection,
//             fromWallet,
//             mint,
//             fromWallet.publicKey
//         );
//         console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
  
//     }
  
//     async function mintToken() {      
//         // Mint 1 new token to the "fromTokenAccount" account we just created
//         const signature = await mintTo(
//             connection,
//             fromWallet,
//             mint,
//             fromTokenAccount.address,
//             fromWallet.publicKey,
//             1000000000000 // 1000 billion
//         );
//         console.log(`Mint signature: ${signature}`);
        
//     }
  
//     async function checkBalance() {
      
//         // get the supply of tokens we have minted into existance
//         const mintInfo = await getMint(connection, mint);
//     console.log(mintInfo.supply);
    
//     // get the amount of tokens left in the account
//         const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
//     console.log(tokenAccountInfo.amount);
//     }
  
//     async function saveTokenToDb() {
//       if (mint && fromWallet && fromTokenAccount.address) {
//           const tokenData = {
//               mint: mint.toBase58(),
//               wallet: fromWallet.publicKey.toBase58(),
//               privateKey: Array.from(fromWallet.secretKey),
//               fromTokenAccountAddress: fromTokenAccount.address
//           };
  
//           try {
//               const response = await axios.post('/api/saveKeyData', tokenData);
//               console.log(response.data);
//           } catch (error) {
//               console.error(error); // 서버 측에서 발생한 오류를 콘솔에 출력
//           }
//       } else {
//           console.log('Mint or Wallet or Token Account Address is not initialized yet');
//       }
//   }
  
// <button style={buttonStyle} onClick={createToken}>Create token</button>
// <button style={buttonStyle} onClick={mintToken}>Mint token</button>
// <button style={buttonStyle} onClick={saveTokenToDb}>Save database</button>



// <button style={buttonStyle} onClick={getCoinNumber}>getCoinNumber</button>
