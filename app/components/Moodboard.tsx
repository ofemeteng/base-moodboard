"use client";

import React, { useState } from 'react';
import { Heart, Palette, Sparkles, CheckCircle, Share2, Calendar } from 'lucide-react';
import { useComposeCast, useOpenUrl } from '@coinbase/onchainkit/minikit';
import { useWriteContract } from 'wagmi';
import { abi } from "../../contracts/./abi";

// Mood colors and emojis
const MOOD_COLORS = [
    { name: 'Happy', color: '#FFD700', bg: 'bg-yellow-400' },
    { name: 'Calm', color: '#87CEEB', bg: 'bg-blue-300' },
    { name: 'Energetic', color: '#FF6347', bg: 'bg-red-400' },
    { name: 'Creative', color: '#DA70D6', bg: 'bg-purple-400' },
    { name: 'Peaceful', color: '#98FB98', bg: 'bg-green-300' },
    { name: 'Dreamy', color: '#DDA0DD', bg: 'bg-pink-300' }
];

const MOOD_EMOJIS = ['😊', '😌', '🔥', '🎨', '🌱', '✨', '💫', '🌈', '🦋', '🌸', '🍃', '💎'];

const BASE_MOODBOARD_CONTRACT_ADDRESS = '0x04B57F3A91a360423B7D7D4dF77063FE5D787489'

const Moodboard = ({ address }) => {
    const { composeCast } = useComposeCast();
    const openUrl = useOpenUrl();
    const [step, setStep] = useState('form'); // 'form', 'connected', 'minted'
    const [selectedEmoji, setSelectedEmoji] = useState('😊');
    const [selectedColor, setSelectedColor] = useState(MOOD_COLORS[0]);
    const [moodText, setMoodText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mintedNFT, setMintedNFT] = useState(null);
    const { data: hash, writeContract } = useWriteContract();

    const uploadToPinata = async (metadata: any) => {
        const res = await fetch('/api/uploadMetadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Pinata upload failed', data);
            return null;
        }

        return `https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`;
    };


    const handleSetMood = async () => {
        if (!moodText.trim() || moodText.length > 20) return;

        if (!address) {
            // setIsLoading(true);
            // try {
            //     const result = await authenticate();
            //     if (result.success) {
            //         setStep('connected');
            //     }
            // } catch (error) {
            //     console.error('Auth failed:', error);
            // } finally {
            //     setIsLoading(false);
            // }
            // return (
            //     <div className="auth-required">
            //         <h3>Authentication Required</h3>
            //         <p>Please sign in to access this feature</p>
            //         <button onClick={authenticate}>
            //             Sign In with Farcaster
            //         </button>
            //     </div>
            // );
            alert('Please connect your wallet to set your mood.');
            return;
        } else {
            // Already authenticated, proceed to mint
            handleMint();
        }
    };

    const handleMint = async () => {
        setIsLoading(true);
        try {

            const metadata = {
                name: `Base Moodboard - ${new Date().toDateString()}`,
                description: `${selectedEmoji} ${moodText}`,
                attributes: [
                    { trait_type: "emoji", value: selectedEmoji },
                    { trait_type: "color", value: selectedColor.color },
                    { trait_type: "text", value: moodText }
                ]
            };

            const ipfsURI = await uploadToPinata(metadata);
            console.log('IPFS URI:', ipfsURI);

            console.log("Minting Address: ", BASE_MOODBOARD_CONTRACT_ADDRESS)
            console.log("My Address: ", address)
            console.log("My Address: ", address as `0x${string}`)
            
            writeContract({
                address: BASE_MOODBOARD_CONTRACT_ADDRESS as `0x${string}`,
                abi,
                functionName: 'safeMint',
                args: [address, ipfsURI],
                chainId: 8453,
            });

            const nft = {
                emoji: selectedEmoji,
                color: selectedColor.color,
                text: moodText,
                timestamp: new Date(),
            };

            setMintedNFT(nft);

        } catch (error) {
            setStep('error');
            console.error('Minting failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = () => {
        // Create a rich share message with the mood NFT details
        const shareText =
            `Just minted my daily mood NFT! ${selectedEmoji} "${moodText}" 
    
        🎨 Mood: ${selectedColor.name}
        🗓️ ${new Date().toDateString()}
        ⛓️ Minted on @base.base.eth 
        
        #MoodNFT #Base #DailyMood #NFT`;

        // Use MiniKit's composeCast to share to timeline
        composeCast({
            text: shareText,
            // Optional: You can add embeds like your mini app URL or NFT image
            embeds: ['https://my-minikit-app-liart.vercel.app']
        });
    };

    if (step === 'form') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <Heart className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                        <h1 className="text-3xl font-bold text-gray-800">Base Moodboard</h1>
                        <p className="text-gray-600 mt-2">Express your mood as an NFT collectible</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Choose your mood emoji
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {MOOD_EMOJIS.map((emoji, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedEmoji(emoji)}
                                        className={`p-3 text-2xl rounded-xl transition-all ${selectedEmoji === emoji
                                            ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Pick your mood color
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {MOOD_COLORS.map((mood, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedColor(mood)}
                                        className={`p-3 rounded-xl transition-all ${mood.bg} ${selectedColor.name === mood.name
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-105'
                                            : 'hover:scale-105'
                                            }`}
                                    >
                                        <span className="text-white font-medium text-sm">{mood.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Describe your mood (max 20 chars)
                            </label>
                            <input
                                type="text"
                                value={moodText}
                                onChange={(e) => setMoodText(e.target.value)}
                                maxLength={20}
                                placeholder="feeling amazing!"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="text-right mt-1">
                                <span className={`text-sm ${moodText.length > 20 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {moodText.length}/20
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                            <h3 className="font-medium text-gray-800 mb-2">Preview</h3>
                            <div
                                className="flex flex-col items-center justify-center space-y-3 p-6 rounded-xl text-white shadow-lg"
                                style={{ backgroundColor: selectedColor.color }}
                            >
                                <span className="text-4xl">{selectedEmoji}</span>
                                <span className="font-bold text-lg text-center">{moodText}</span>
                            </div>

                            {moodText.trim() && moodText.length <= 20 && (
                                <button
                                    onClick={handleSetMood}
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {address ? 'Minting...' : 'Connecting...'}
                                        </div>
                                    ) : (
                                        address ? 'Mint Mood NFT' : 'Set My Mood'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 p-4">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
                    <p className="text-gray-600 mb-6">
                        We encountered an issue while processing your mood NFT. Please try again.
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2 text-red-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Transaction failed or was rejected</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setStep('form');
                            setIsLoading(false);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Try Again</span>
                        </div>
                    </button>

                    <p className="text-xs text-gray-500 mt-3">
                        You can modify your mood and try minting again
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'minted') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Mood NFT Minted! 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        Your daily mood is now immortalized on the blockchain
                    </p>

                    <div className="mb-6">
                        <div
                            className="flex flex-col items-center justify-center space-y-3 p-6 rounded-xl text-white shadow-lg mx-4"
                            style={{ backgroundColor: selectedColor.color }}
                        >
                            <span className="text-5xl">{selectedEmoji}</span>
                            <span className="font-bold text-xl">"{moodText}"</span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                        {hash && <button onClick={() => openUrl(`https://basescan.org/tx/${hash}`)}>View Transaction</button>}
                        <p><strong>Minted:</strong> {new Date().toLocaleString()}</p>
                        <p><strong>Network:</strong> Base</p>
                        <p><strong>Owner:</strong> {address}</p>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Share2 className="w-5 h-5" />
                            <span>Share My Mood</span>
                        </div>
                    </button>

                    <p className="text-xs text-gray-500 mt-2">
                        This will open the cast composer with your mood details
                    </p>
                </div>
            </div>
        );
    }
}

export default Moodboard;