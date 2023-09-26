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

import { useState, useEffect } from 'react';
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
  useEffect(() => {
    window.Buffer = window.Buffer || require("buffer").Buffer;
  }, []); 
  const [keys, setKeys] = useState({ publicKey: '', privateKey: [] });
  const [inputError, setInputError] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState('');

  
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate();
  console.log(`새로운 publicKey, 솔라나 먼저 충전 해주세요: ${fromWallet.publicKey.toBase58()}`);
  // console.log(`fromWallet privateKey: ${Array.from(fromWallet.secretKey)}`);
  // Public Key to your Phantom Wallet
  let [toWallet, setToWallet] = useState<PublicKey | null>(null);
  ;
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
   
      // Create new token mint
      mint = await createMint(
          connection, 
          fromWallet, 
          fromWallet.publicKey, 
          null, 
          9 // 9 here means we have a decmial of 9 0's
      );
      console.log(`Create token: ${mint.toBase58()}`);
  
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
      // Mint 1 new token to the "fromTokenAccount" account we just created
      const signature = await mintTo(
          connection,
          fromWallet,
          mint,
          fromTokenAccount.address,
          fromWallet.publicKey,
          1000000000000 // 1000 billion
      );
      console.log(`Mint signature: ${signature}`);
      
  }

  async function checkBalance() {
    
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










const getTokenBalance = async (): Promise<number> => {
  const connection = new Connection("https://api.devnet.solana.com");
// 지정된 토큰 어드레스
const tokenAddress = new PublicKey("Fd6sLceNefVUNSXyBb6Vy7s3To3BxLbhtGP5nz2fFFTx");

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

let provider;
let ConnectedWalletNow;
// useEffect(() => {

if (typeof window !== 'undefined' && window.solana && window.solana.publicKey) {
  provider = window.solana;
  ConnectedWalletNow = new PublicKey(provider.publicKey.toBase58());
}
// }, []);











const [transferAmount, setTransferAmount] = useState<number | null>(null);

async function sendToken() {
  if (coinNumber === null || (transferAmount !== null && transferAmount / decimal > coinNumber)) {
    console.error('Transfer amount exceeds available coin number or coin number is not yet loaded');
    return; // 함수를 여기서 종료합니다.
  }
  
  const provider = window.solana;

  toWallet=(new PublicKey(provider.publicKey));

  try {
    if (!toWallet) {
      console.error('Wallet not connected');
      return;
    }
    toWallet=(new PublicKey(provider.publicKey.toBase58()));
    console.log("Connected to towallet " +toWallet);

    console.log("Connected to wallet " + provider.publicKey?.toBase58());


    // 데이터베이스에서 토큰 정보를 가져옵니다.
    const tokenData = await axios.get('/api/getKeyData');
  
    // tokenData.data가 배열이므로 각각의 토큰 데이터에 대해 반복합니다.
    for (let i = 0; i < tokenData.data.length; i++) {
      const { mint, fromWallet: fromWalletPublicKey, privateKey, fromTokenAccountAddress } = tokenData.data[i];
      console.log("mintmintmint " + mint);

      // privateKey를 바로 사용하여 fromWallet Keypair 생성
      const fromWallet = Keypair.fromSecretKey(new Uint8Array(privateKey.map(Number)));
  
      // Get the token account of the toWallet address, and if it does not exist, create it
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, new PublicKey(mint), toWallet);
      console.log(`toTokenAccount ${toTokenAccount.address}`);
      console.log(`fromWallet ${fromWallet.publicKey}`);

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-gray-700 text-xl font-semibold mb-6">커뮤니티 지갑</h1>
  
      <div className="grid grid-cols-2 gap-4 w-11/12 md:w-1/2 lg:w-1/3 xl:w-1/4">
        <p className="text-sm bg-white p-3 rounded">현재 연결된 지갑 주소: {ConnectedWalletNow ? ConnectedWalletNow.toString(): '지갑을 연결해주세여 '}</p>
  
        <div className="bg-white p-3 rounded">
          <p className="text-sm">환전 주소: Fd6sLceNefVUNSXyBb6Vy7s3To3BxLbhtGP5nz2fFFTx</p>
        </div>
  
        <div className="bg-white p-3 rounded">
          {coinNumber ? `COIN: ${coinNumber}` : 'Loading...'}
        </div>
  
        <div className="bg-white p-3 rounded w-full">
          <button className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 focus:outline-none w-full" onClick={() => getTransactions('Fd6sLceNefVUNSXyBb6Vy7s3To3BxLbhtGP5nz2fFFTx', 'EXPu8uoVi4vRwriATiwTUX5WNqrdvPcPWR2MFunQDAqu')}>
            커뮤니티 지갑으로 토큰 전송하기
          </button>
        </div>
  
        {inputError && <p className="text-red-500 bg-white p-3 rounded">{inputErrorMessage}</p>}
  
        <div className="text-center bg-white p-3 rounded">연결된 지갑주소와 환전 주소로 토큰을 보낸 지갑 주소가 동일 해야, 커뮤니티 토큰이 충전 됩니다</div>
      </div>
    </div>
  );}
  
  export default MintToken;
  
      //토큰 만들기

// <button style={buttonStyle} onClick={createToken}>Create token</button>
// <button style={buttonStyle} onClick={mintToken}>Mint token</button>
// <button style={buttonStyle} onClick={saveTokenToDb}>Save database</button>



// <button style={buttonStyle} onClick={getCoinNumber}>getCoinNumber</button>
