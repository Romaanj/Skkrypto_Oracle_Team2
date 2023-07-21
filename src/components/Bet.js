import { useState} from 'react';
import {Link } from "react-router-dom";
import { ethers } from 'ethers';
import '../styles/bet.css';

export default function Bet() {

    const [price,setPrice]=useState(null);
    const [betInfo,setBetInfo]=useState({betAmount:'', betToken:'', opponent:''});
    const [message, updateMessage] = useState("");

    const [better,setBetter] = useState([]);
    const [betPrice,setBetPrice] = useState([]); // [0] = better1, [1] = better2
    const [betOpponent,setBetOpponent] = useState([]); // [0] = better1, [1] = better2

    const [winner,setWinner] = useState(""); 

    async function onClick2(e) {
        e.preventDefault();

        const contractAddress = "0xED4fB6af96907ff52CEB9027B756468ae969AC9C";
        const contractABI = require("../NFT.json");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        updateMessage("Uploading your bet... please dont click anything!");
        const contract = new ethers.Contract(contractAddress,contractABI.abi,signer);
        const transaction = await contract.placeBet(betInfo.betToken, betInfo.opponent, betInfo.betAmount);
        await transaction.wait();

        alert("Successfully Uploaded!");
        setBetInfo({betAmount:'', betToken:'', opponent:''});
        updateMessage("");
        
        await contract.bets(signer.address).then((data) => setBetPrice([...betPrice, data[1]]));
        await contract.bets(signer.address).then((data) => setBetOpponent([...betOpponent, data[0]]));
        setBetter([...better, signer.address]);
    }

    async function onClick (e) {
        e.preventDefault();

        const contractAddress = "0xED4fB6af96907ff52CEB9027B756468ae969AC9C";
        const contractABI = require("../NFT.json");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        updateMessage("Betting is Start!!!!!! please dont click anything!");
        const contract_view = new ethers.Contract(contractAddress,contractABI.abi,provider);
        const contract_trans = new ethers.Contract(contractAddress,contractABI.abi,signer);

        const eth_price = await contract_view.getEthUsd();
        setPrice(Number(eth_price));
        const result = await contract_trans.settleBet();
        await result.wait()

        alert("Betting is End!!");
        await contract_view.winner().then((data) => setWinner(data));
        updateMessage("");
        
    }

    return (
        <>        
        <Link to="/"><div className='back'>👤</div></Link>
        <Link to="/mint"><div className='back'>⚒️</div></Link>
        <div className="container">
        <div className="bet-form">
            <form id="upload-form">
            <h3 className="title">Upload your betting information!</h3>
                <div className="box">
                    <label className="key" htmlFor="amount">Bet Amount(USD)</label>
                    <input className="value" id="name" type="number" placeholder="Ethereum cost" onChange={e => setBetInfo({...betInfo, betAmount: e.target.value})} value={betInfo.betAmount}></input>
                </div>
                <div className="box">
                    <label className="key" htmlFor="opponent">Opponent address</label>
                    <textarea className="value" id="description" type="text" placeholder="Who is your opponent!?" value={betInfo.opponent} onChange={e => setBetInfo({...betInfo, opponent: e.target.value})}></textarea>
                </div>
                <div className="box">
                    <label className="key" htmlFor="id">NFT ID</label>
                    <input className="value" type="number" placeholder="ID that you will bet" value={betInfo.betToken} onChange={e => setBetInfo({...betInfo, betToken: e.target.value})}></input>
                </div>
                <br></br>
                <button onClick={onClick2} className="" id="upload-button">Upload!</button>
            </form>
        </div>
        </div>
        {better.length >= 1 ? <div>
            <div className = "attack">{better[0]}  🗡️ ➡️ 🗡️  {betOpponent[0]}</div>
            <div className = "attack">{better[1]}  🗡️ ➡️ 🗡️  {betOpponent[1]}</div>
            </div> : null}
        {better[0] != null && better[1] != null && better[0]==betOpponent[1] && better[1]==betOpponent[0] ?
        <>
        <div className ="bet-form">
        <div>Players : {better[0]} vs {better[1]}</div>
        <div>Betting Price : {Number(betPrice[0])} vs {Number(betPrice[1])}</div>
        </div>
        <div className="con">
            <button onClick={onClick} >Result!!</button>
            <div>ETH/USD price is : {Number(price)} !!!</div>
            <div>Winner is : {winner} !!! (Take all NFTs!)</div>
        </div> </> : <h2 className='word'>Betting in progress...</h2>}
        <div className="message">{message}</div>
        </>
    )
}
