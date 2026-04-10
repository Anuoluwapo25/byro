"use client";

import AppLayout from "@/layout/app";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LuCircleUserRound } from "react-icons/lu";
import { MdLogout, MdOutlineNotificationsActive } from "react-icons/md";
import { wallet } from "../assets";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const { wallets } = useWallets();
  const [formData, setFormData] = useState({
    firstName: "Alex",
    lastName: "Young",
    email: "Alex@byronafrica.com",
    phone: "+234 802 7393 0049",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: false,
    smsUpdates: false,
    marketingUpdates: false,
  });

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleNotification = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#fff] p-6">
        <div className="max-width-4xl mx-auto">
          {/* Profile Header */}
          <div className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <LuCircleUserRound color="#007AFF" size={25} />
              <h1 className="text-[28px] font-semibold text-[#1A1A1A]">
                Profile Settings
              </h1>
            </div>

            <div className="bg-[radial-gradient(circle,white,#007AFF26)] rounded-[20px] p-5 flex flex-col md:flex-row md:items-center md:justify-between border border-[#007AFF] gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div
                  className="w-16 h-16 bg-white border border-[#007AFF] shadow-md shadow-[#007AFF] rounded-xl flex items-center justify-center text-3xl"
                  style={{}}
                >
                  🦉
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-[24px] font-semibold text-[#007AFF] mb-1">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 justify-center sm:justify-start">
                    <Image
                      src={wallet}
                      alt="wallet"
                      width={25}
                      height={25}
                      className="p-1"
                    />
                    <span className="text-[14px] text-[#707070]">
                      <strong>
                        {" "}
                        {embeddedWallet?.address.slice(0, 6)} ...{" "}
                        {embeddedWallet?.address.slice(-4)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#007AFF] rounded-[20px] hover:bg-gray-50 transition-colors flex items-center gap-2 w-full sm:w-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-[20px] hover:bg-blue-600 transition-colors w-full sm:w-auto"
                  >
                    Save Changes
                  </button>
                )}
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#007AFF] rounded-[20px] hover:bg-gray-50 transition-colors flex items-center gap-2 w-full sm:w-auto">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Disconnect
                </button>
                <button className="p-2 border border-[#007AFF] bg-white rounded-[20PX] hover:bg-red-50 transition-colors w-full sm:w-auto">
                  <MdLogout size={20} color="#FA0000" />
                </button>
              </div>
            </div>
          </div>
          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white rounded-[10px] p-8 shadow-[0_4px_10px_0_#0000000C,0_-4px_10px_0_#0000000C]">
              <div className="flex items-center gap-3 mb-5">
                <LuCircleUserRound color="#007AFF" size={25} />
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">
                  Personal Details
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#000] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`w-full px-3 py-3 text-[#000000] text-sm border rounded-lg transition-colors ${
                        isEditing
                          ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          : "bg-gray-50 border-gray-200 cursor-default"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`w-full px-3 py-3 text-[#000000] text-sm border rounded-lg transition-colors ${
                        isEditing
                          ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          : "bg-gray-50 border-gray-200 cursor-default"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-3 text-sm text-[#000000] border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        : "bg-gray-50 border-gray-200 cursor-default"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-3 text-sm text-[#000000] border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        : "bg-gray-50 border-gray-200 cursor-default"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[10px] p-8 shadow-[0_4px_10px_0_#0000000C,0_-4px_10px_0_#0000000C]">
              <div className="flex items-center gap-3 mb-5">
                <MdOutlineNotificationsActive color={"#007AFF"} size={25} />
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">
                  Notification
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-0.5">
                      Email Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      Receive event updates via email
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("emailUpdates")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailUpdates ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.emailUpdates
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-0.5">
                      SMS Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      Receive important updates via SMS
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("smsUpdates")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.smsUpdates ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.smsUpdates
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-0.5">
                      Marketing Communications
                    </p>
                    <p className="text-xs text-gray-500">
                      Get updates about new features and events
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("marketingUpdates")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.marketingUpdates
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.marketingUpdates
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
