import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";
import {Link } from "react-router-dom";
import "../styles/mintNFT.css";

export default function MintNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const {ethers} = require("ethers");
    const [message, updateMessage] = useState('');

    async function disableButton() {
        const listButton = document.getElementById("mint-button")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("mint-button")
        listButton.disabled = false
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //check for file extension
        try {
            //upload the file to IPFS
            disableButton();
            updateMessage("Uploading image.. please dont click anything!")
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                updateMessage("")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
            }
        }
        catch(e) {
            console.log("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1)
                return;
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            
            const contractAddress = "0xED4fB6af96907ff52CEB9027B756468ae969AC9C";
            const contractABI = require("../NFT.json");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer =  await provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")

            //Pull the deployed contract instance
            const contract = new ethers.Contract(contractAddress,contractABI.abi,signer);

            //massage the params to be sent to the create NFT request
            const price = ethers.parseUnits(formParams.price, 'ether')

            //actually create the NFT
            let transaction = await contract.mintNFT(metadataURL)
            await transaction.wait()

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    console.log("Working", process.env);
    return (
        <>  
        <Link to="/"><div className='back'>👤</div></Link>
        <Link to="/bet"><div className='back'>⚔️</div></Link>      
        <div className="container">
        <div className="nft-form" id="nftForm">
            <form>
            <h3 className="title">Upload your NFT to the marketplace</h3>
                <div className="box">
                    <label className="key" htmlFor="name">NFT Name</label>
                    <input className="value" id="name" type="text" placeholder="Write your NFT name!" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="box">
                    <label className="key" htmlFor="description">NFT Description</label>
                    <textarea className="value" id="description" type="text" placeholder="Write the Description" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="box">
                    <label className="key" htmlFor="price">Price (in ETH)</label>
                    <input className="value" type="number" placeholder="How much??" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                </div>
                <div className="box">
                    <label className="key" htmlFor="image">Upload Image</label>
                    <input type={"file"} onChange={OnChangeFile}></input>
                </div>
                <br></br>
                <div className="">{message}</div>
                <button onClick={listNFT} className="button" id="mint-button">List NFT</button>
            </form>
        </div>
        </div>
        </>

    )
}