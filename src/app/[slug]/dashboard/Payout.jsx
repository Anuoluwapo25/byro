import React, { useState } from "react";
import { toast } from "sonner";

const Payout = () => {
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Bank details
    accountName: "",
    accountNumber: "",
    bankName: "",

    
    walletAddress: "",
    walletType: "ethereum",

    // Common
    email: "",
    amount: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

   
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    // Bank-specific validations
    if (payoutMethod === "bank") {
      if (!formData.accountName) {
        newErrors.accountName = "Account name is required";
      }
      if (!formData.accountNumber) {
        newErrors.accountNumber = "Account number is required";
      }
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
    }

    // Wallet-specific validations
    if (payoutMethod === "wallet") {
      if (!formData.walletAddress) {
        newErrors.walletAddress = "Wallet address is required";
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
        newErrors.walletAddress = "Please enter a valid EVM wallet address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission
  

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          emails: [
            {
              type:"payout",
              to: formData.email,
              data: {
             name: formData.accountName || "User", // Use account name or fallback
                  amount: formData.amount,
                  method: payoutMethod,
                   // Add more payout details as needed
                  ...(payoutMethod === "bank" && {
                    accountNumber: formData.accountNumber,
                    bankName: formData.bankName,
                  }),
                  ...(payoutMethod === "wallet" && {
                    walletAddress: formData.walletAddress,
                    walletType: formData.walletType,
                  }),
              }
            }
          ]
        })
      })
      if (emailResponse.ok) {
     toast.success("Payout request submitted successfully! You'll receive a confirmation email.");
    } else {
      toast.error("Failed to submit payout request.");
    }
  };
}

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg  p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Payout Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Payout Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payout Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="payoutMethod"
                value="bank"
                checked={payoutMethod === "bank"}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm text-gray-700 font-semibold">Bank Transfer</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="payoutMethod"
                value="wallet"
                checked={payoutMethod === "wallet"}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm text-gray-700 font-semibold">Crypto Wallet</span>
            </label>
          </div>
        </div>

        {/* Bank Details */}
        {payoutMethod === "bank" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500 ${
                  errors.accountNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter account number"
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bankName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.accountName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter account holder name"
              />
              {errors.accountName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Wallet Details */}
        {payoutMethod === "wallet" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Type
              </label>
              <select
                name="walletType"
                value={formData.walletType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="polygon">Polygon (MATIC)</option>
                <option value="bsc">Binance Smart Chain (BSC)</option>
                <option value="arbitrum">Arbitrum (ARB)</option>
                <option value="optimism">Optimism (OP)</option>
                <option value="avalanche">Avalanche (AVAX)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address *
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.walletAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0x..."
              />
              {errors.walletAddress && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.walletAddress}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Common Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="jondoe@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

       
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
          isSubmitting 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
         {isSubmitting ? "Submitting..." : "Request Payout"}
        </button>
      </form>

      <div>
        <p className="text-black text-xs italic mt-10 text-center">NB: Payout will be received in 24 hours</p>
      </div>
    </div>
  );
};

export default Payout
