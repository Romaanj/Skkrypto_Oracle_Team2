import {useState, useEffect} from "react";
import detectEthereumProvider from '@metamask/detect-provider/dist/detect-provider';
import { formatBalance, formatChainAsNum } from './additional';
import {Link } from "react-router-dom";
import '../styles/info.css';
import Bet from "./Bet";


export default function () {
    const [hasProvider,setHasProvider] = useState(null);
    const initialState = { accounts : [] , balance:"", chainId:""};
    const [wallet,setWallet] = useState(initialState);

    const [isConnecting, setIsConnecting] = useState(false)  
    const [error, setError] = useState(false)              
    const [errorMessage, setErrorMessage] = useState("")    

    
    useEffect(() => {
        const refreshAccounts = (accounts) => {
            if(accounts.length > 0) {
                updateWallet(accounts)
            }
            else {
                setWallet(initialState)
            }
        };

        const refreshChain = (chainId) => {
            setWallet((wallet)=>({...wallet,chainId}))
        };

        const getProvider = async () => {
          const provider = await detectEthereumProvider({silent: true });
          setHasProvider(Boolean(provider)); 

          if (provider) {
            const accounts = await window.ethereum.request(
                {method : 'eth_accounts'}
            );
            refreshAccounts(accounts);
            window.ethereum.on("accountsChanged", refreshAccounts);
            window.ethereum.on("chainChanged", refreshChain);
          }
        };
        
      
        getProvider();
        return () => {
            window.ethereum?.removeListener('accountsChanged', refreshAccounts)
            window.ethereum?.removeListener('chainChanged',refreshChain)
        };
    }, []);

      const updateWallet = async (accounts) => {
        const balance = formatBalance(await window.ethereum.request({
            method : "eth_getBalance",
            params: [accounts[0],"latest"],
        }));
        const chainId = await window.ethereum.request({
            method : "eth_chainId",
        });
        setWallet({ accounts, balance, chainId });
      };

      const handleConnect = async () => {    
        setIsConnecting(true);            
        await window.ethereum.request({   
      method: "eth_requestAccounts",              
        })
        .then((accounts) => {
            setError(false);
            updateWallet(accounts);
        })
        .catch((err) => {
            setError(true);
            setErrorMessage(err.message);
        })
        setIsConnecting(false);                           
        };          
      
    const disableConnect = Boolean(wallet) && isConnecting;
  return (
    <>
    <div className="user-info">
      <div className="title">
        User Information 
      </div>
    <div className="user-wallet-info">
    <div className="Metamask">
        {!hasProvider && <h2>injected Provider "DOES NOT" Exist</h2>}
        
      { window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&  /* Updated */
        <button disabled={disableConnect} onClick={handleConnect}>Connect MetaMask</button>
      }

      { wallet.accounts.length > 0 && 
      <>
        <div className="wallet-info">Wallet Account : {wallet.accounts[0]} </div>
        <div className="wallet-info">Wallet Balance : {wallet.balance}</div>
        <div className="wallet-info">Hex ChainId : {wallet.chainId}</div>
        <div className="wallet-info">Numeric ChainId : {formatChainAsNum(wallet.chainId)}</div>
      </>
      }
      { error && (                                        /* New code block */
          <div onClick={() => setError(false)}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )
      }
    </div>
    </div>
    <div className="buttons">
    <Link to="mint"><button>⚒️Mint NFT!!</button></Link>
    <Link to="bet"><button>⚔️Let's go to bet!!</button></Link>
    </div>
    </div>
    <div className="info">
      <h3 className="rule">📚Rule</h3>
      <div className="description">1. 두 명의 베팅 참여자가 각자의 nft를 걸고 베팅을 합니다.</div>
      <div className="description">2. 베팅 주제는, 현재 ETH의 시세가 얼마인지 USD를 기준으로 맞추는 것 입니다.</div>
      <div className="description">3. 최대한 ETH의 시세에 가깝게 베팅을 하고, 각자의 NFT를 베팅 상품으로 등록합니다.</div>
      <div className="description">4. ETH 시세를 더 잘 예측한 사람이 베팅된 모든 NFT를 가져갑니다.</div>
      <div className="description">⭐ 베팅 참여자는 이 곳에서 민팅한 NFT로만 베팅에 참여합니다.</div>
      <div className="description">⭐ 두명의 베팅 참여자가 서로를 opponent로 지정해야만 베팅을 실행시킬 수 있습니다.</div>
    </div>
    </>
  );
}