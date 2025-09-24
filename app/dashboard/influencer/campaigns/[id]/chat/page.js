"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import BrandLayout from "@/components/InfluencerLayout";

export default function InfluencerCampaignChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const campaignId = id;

  const [chat, setChat] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userType =
    typeof window !== "undefined" ? localStorage.getItem("userType") : null;
  const API_BASE = "http://localhost:4004";

  const fetchChat = async () => {
    try {
      const res = await api.get(`/campaign/chat/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChat(res.data.data || []);
      setCampaign(res.data.campaign || null);
    } catch (err) {
      console.error("❌ Failed to fetch chat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!campaignId) return;
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [campaignId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      await api.post(
        "/campaign/send-message",
        { campaign_id: campaignId, message: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg("");
      fetchChat();
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaign_id", campaignId);
      formData.append("visibility", "both");

      await api.post("/campaign/upload-media", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      fetchChat();
    } catch (err) {
      console.error("❌ File upload error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] bg-gray-900">
        <p className="text-xl font-medium text-white animate-pulse">
          Loading chat...
        </p>
      </div>
    );
  }

  return (
    <BrandLayout>
      <div className="flex flex-col h-[90vh] max-w-5xl mx-auto bg-gray-900 text-white rounded-3xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-b border-white/10 flex flex-col">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white mb-2"
          >
            ← Back
          </button>
          <h2 className="font-semibold text-lg">
            {campaign?.Brand?.company_name} • {campaign?.Influencer?.full_name} • Admin
          </h2>
          <p className="text-xs text-white/60">
            {campaign?.title} —{" "}
            <span className="capitalize font-medium text-blue-300">
              {campaign?.campaign_status || "ongoing"}
            </span>
          </p>
        </div>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-900/95">
          {chat.length === 0 && (
            <p className="text-center text-white/50 italic">
              No messages yet. Start the conversation!
            </p>
          )}

          {chat.map((item) => {
            const isMe =
              item.sender_type === userType || item.uploader_type === userType;

            const senderName =
              item.sender_type === "brand" || item.uploader_type === "brand"
                ? campaign?.Brand?.company_name
                : item.sender_type === "influencer" ||
                  item.uploader_type === "influencer"
                ? campaign?.Influencer?.full_name
                : "Admin";

            const timestamp = new Date(
              item.created_at || item.uploaded_at
            ).toLocaleString();

            return (
              <div
                key={item.id}
                className={`flex flex-col max-w-[70%] ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Sender name + time */}
                <span className="text-xs font-semibold text-white/70 mb-1">
                  {senderName} •{" "}
                  <span className="text-white/50">{timestamp}</span>
                </span>

                {/* Message */}
                {item.type === "message" && (
                  <p
                    className={`px-4 py-2 rounded-2xl text-sm shadow-md ${
                      isMe
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                    }`}
                  >
                    {item.message}
                  </p>
                )}

                {/* Media */}
                {item.type === "media" && (
                  <div>
                    {item.file_type?.startsWith("image/") ? (
                      <img
                        src={`${API_BASE}/${item.file_path}`}
                        alt="upload"
                        className="max-w-[200px] rounded-xl shadow-md"
                      />
                    ) : item.file_type?.startsWith("video/") ? (
                      <video controls className="max-w-[250px] rounded-xl shadow-md">
                        <source
                          src={`${API_BASE}/${item.file_path}`}
                          type={item.file_type}
                        />
                      </video>
                    ) : (
                      <a
                        href={`${API_BASE}/${item.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sm text-blue-300"
                      >
                        📎 {item.file_path.split("/").pop()}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-gray-900/80 flex items-center gap-3">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl"
          >
            Send
          </button>
          <form onSubmit={handleUpload} className="flex items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="chat-file"
            />
            <label
              htmlFor="chat-file"
              className="px-3 py-2 bg-white/5 rounded-xl cursor-pointer"
            >
              📎
            </label>
            {file && (
              <button
                type="submit"
                className="ml-2 px-3 py-2 bg-green-600 text-white rounded-xl"
              >
                Upload
              </button>
            )}
          </form>
        </div>
      </div>
    </BrandLayout>
  );
}
