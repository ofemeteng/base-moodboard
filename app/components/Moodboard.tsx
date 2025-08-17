"use client";

import React, { useState } from 'react';
import { Heart, Palette, Sparkles, CheckCircle, Share2, Calendar } from 'lucide-react';
import { useComposeCast } from '@coinbase/onchainkit/minikit';

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

const Moodboard = ({ address }) => {
    const { composeCast } = useComposeCast();
    const [step, setStep] = useState('form'); // 'form', 'connected', 'minted'
    const [selectedEmoji, setSelectedEmoji] = useState('😊');
    const [selectedColor, setSelectedColor] = useState(MOOD_COLORS[0]);
    const [moodText, setMoodText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mintedNFT, setMintedNFT] = useState(null);



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
            // Mock NFT minting - replace with actual contract interaction
            await new Promise(resolve => setTimeout(resolve, 3000));

            const nft = {
                id: Math.random().toString(36).substr(2, 9),
                emoji: selectedEmoji,
                color: selectedColor.color,
                text: moodText,
                timestamp: new Date(),
                tokenId: Math.floor(Math.random() * 10000)
            };

            setMintedNFT(nft);
            // localStorage.setItem('lastMoodPost', new Date().toISOString());
            // setHasPostedToday(true);
            setStep('minted');
        } catch (error) {
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
        💎 Token #${mintedNFT?.tokenId}
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
                        <p><strong>Token ID:</strong> #{mintedNFT?.tokenId}</p>
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