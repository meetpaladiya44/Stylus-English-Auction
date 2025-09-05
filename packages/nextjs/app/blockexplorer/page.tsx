"use client";

import type { NextPage } from "next";
import { useMemo } from "react";
import Link from "next/link";
import { useGlobalState } from "~~/services/store/store";

const BlockExplorer: NextPage = () => {
  const txHistory = useGlobalState(s => s.txHistory);

  const items = useMemo(() => txHistory, [txHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "pending":
        return (
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-900/95 shadow-2xl rounded-3xl w-full max-w-6xl p-8 border border-slate-200 dark:border-blue-500/30">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="px-6 py-3 rounded-full">
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-400">
              Transaction History
            </h1>
          </div>
        </div>

        {/* Stats Overview */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-6 py-4 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md">
              <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-blue-100">{items.length}</div>
            </div>
            <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-6 py-4 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md">
              <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-1">Successful</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {items.filter(tx => tx.status === "success").length}
              </div>
            </div>
            <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-6 py-4 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md">
              <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-1">Pending</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {items.filter(tx => tx.status === "pending").length}
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          /* No Transactions State */
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">No Transactions Yet</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Start your journey with the English Auction! Initialize an auction, place bids, and watch your transaction history grow.
              </p>
            </div>

            {/* Getting Started Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">🚀 Getting Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Step 1: Initialize Auction</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Enter NFT contract address</li>
                    <li>• Set token ID and starting bid</li>
                    <li>• Click "Initialize Auction"</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Step 2: Start Bidding</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Check NFT ownership</li>
                    <li>• Approve auction contract</li>
                    <li>• Start the auction</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <Link
                href="/debug"
                className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg px-8 py-3 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300"
              >
                🎯 Start Your First Auction
              </Link>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                All your transactions will appear here once you start using the auction system
              </div>
            </div>
          </div>
        ) : (
          /* Transactions Table */
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200">Transaction History</h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {items.length} transaction{items.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-blue-500/20">
                    <th className="text-left py-4 px-2 font-semibold text-slate-600 dark:text-blue-300">Operation</th>
                    <th className="text-left py-4 px-2 font-semibold text-slate-600 dark:text-blue-300">Status</th>
                    <th className="text-left py-4 px-2 font-semibold text-slate-600 dark:text-blue-300">Transaction Hash</th>
                    <th className="text-left py-4 px-2 font-semibold text-slate-600 dark:text-blue-300">Time</th>
                    <th className="text-left py-4 px-2 font-semibold text-slate-600 dark:text-blue-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((tx, index) => (
                    <tr key={tx.hash} className="hover:bg-slate-100/50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {tx.operation === "initialize" && "🚀"}
                            {tx.operation === "start" && "▶️"}
                            {tx.operation === "bid" && "💰"}
                            {tx.operation === "withdraw" && "💸"}
                            {tx.operation === "end" && "🏁"}
                          </span>
                          <span className="font-medium capitalize text-slate-700 dark:text-blue-100">
                            {tx.operation}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(tx.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-mono text-sm text-slate-600 dark:text-blue-300 break-all max-w-xs truncate" title={tx.hash}>
                          {tx.hash}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(tx.hash)}
                            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg px-3 py-1"
                            title="Copy transaction hash"
                          >
                            📋
                          </button>
                          <a
                            href={`https://sepolia.arbiscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white border-0 rounded-lg px-3 py-1"
                            title="View on Arbiscan"
                          >
                            🔍
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockExplorer;
