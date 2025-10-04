"use client";
import { useState } from "react";
import Image from "next/image";
import CryptoPayment from "../../public/images/crypto-wallet.svg";
import CardPayment from "../../public/images/card-payment.svg";


export default function PaymentMethod() {
  const [selected, setSelected] = useState("wallet");

  const handleSelect = (method) => {
    setSelected(method);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="grid gap-4">
        {/* Connect Wallet */}
        <div
          onClick={() => handleSelect("wallet")}
          className={`cursor-pointer border rounded-2xl p-5 flex items-center justify-between transition 
            ${
              selected === "wallet"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }
          `}
        >
          <div>
            <Image
              src={CryptoPayment}
              alt="Crypto wallet"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Connect Wallet</h3>
            <p className="text-xs font-medium text-black shadow-sm">
              Pay with ETH, BTC, or other cryptocurrencies
            </p>
            {/* <hr className="border border-red-500 w-full mx-auto"/> */}
            <div className="flex gap-2 mt-2 text-xs text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                Decentralized
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg">Low fees</span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                Privacy focused
              </span>
            </div>
          </div>

          <span className="text-xs font-bold  rounded-3xl px-4 py-1 bg-[#d8cdd6] text-[#731D69]">
            Web3
          </span>
          <span className="text-xs font-bold rounded-3xl px-4 py-1 bg-[#afd1f6] text-blue-600">
            Instant
          </span>
        </div>

        {/* Paystack */}
        <div
          onClick={() => handleSelect("paystack")}
          className={`cursor-pointer border rounded-2xl p-5 flex items-center justify-between transition 
            ${
              selected === "paystack"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }
          `}
        >
               <div>
            <Image
              src={CardPayment}
              alt="Card payment"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">Paystack</h3>
            <p className="text-sm text-gray-500">
              Secure payment gateway for African markets
            </p>
            <div className="flex gap-2 mt-2 text-xs text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                Bank transfer
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                Mobile money
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg">
                Card payment
              </span>
            </div>
          </div>
          <span className="text-xs font-bold rounded-3xl px-4 py-1 bg-[#d7f5e3] text-[#09D059]">Trusted</span>
          <span className="text-xs font-bold rounded-3xl px-4 py-1 bg-[#ffe8d4] text-[#F5841F]">Popular</span>

        </div>
      </div>
    </div>
  );
}
