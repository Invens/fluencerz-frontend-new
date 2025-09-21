"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import BrandLayout from "@/components/BrandLayout";

export default function CampaignChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [chat, setChat] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userType =
    typeof window !== "undefined" ? localStorage.getItem("userType") : null;
  const API_BASE = "https://api.fluencerz.com";

  const fetchChat = async () => {
    try {
      const res = await api.get(`/campaign/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChat(res.data.data || []);
      setCampaign(res.data.campaign || null);
    } catch (err) {
      console.error("❌ Chat error:", err);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      await api.post(
        "/campaign/send-message",
        { campaign_id: id, message: newMsg, receiver_id: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg("");
      fetchChat();
    } catch (err) {
      console.error("❌ Send error:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaign_id", id);
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
      console.error("❌ Upload error:", err);
    }
  };

  return (
    <BrandLayout>
      <div className="flex flex-col h-[90vh] max-w-5xl mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/20">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:opacity-80 transition-opacity"
          >
            ← Back
          </button>

          {/* Brand logo */}
          {campaign?.Brand?.profile_picture && (
            <img
              src={`${API_BASE}${campaign.Brand.profile_picture}`}
              alt={campaign.Brand.company_name}
              className="w-10 h-10 rounded-full border shadow-md"
            />
          )}

          {/* Title + subtitle */}
          <div>
            <h2 className="font-semibold text-white">
              {campaign?.Brand?.company_name} 🤝{" "}
              {campaign?.Influencer?.full_name}
            </h2>
            {campaign?.title && (
              <Link
                href={`/dashboard/brand/campaigns/${campaign.id}`}
                className="text-sm text-white/80 hover:underline"
              >
                {campaign.title}
              </Link>
            )}
          </div>
        </div>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 italic">
              No messages yet. Start the conversation!
            </p>
          )}
          {chat.map((item) => {
            const isMe =
              item.sender_type === userType || item.uploader_type === userType;
            const senderName =
              item.sender_type === "brand"
                ? campaign?.Brand?.company_name
                : item.sender_type === "influencer"
                ? campaign?.Influencer?.full_name
                : "Admin";

            return (
              <div
                key={item.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-md ${
                    isMe
                      ? "bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] text-white"
                      : "bg-gradient-to-r from-[#fcb045] to-[#833ab4] text-white"
                  }`}
                >
                  {item.type === "message" && <p>{item.message}</p>}
                  {item.type === "media" && (
                    <div className="mt-1">
                      {item.file_type?.startsWith("image/") ? (
                        <img
                          src={`${API_BASE}/${item.file_path}`}
                          alt="upload"
                          className="max-w-[200px] rounded-xl cursor-pointer shadow"
                        />
                      ) : item.file_type?.startsWith("video/") ? (
                        <video
                          controls
                          className="max-w-[250px] rounded-xl shadow"
                        >
                          <source
                            src={`${API_BASE}/${item.file_path}`}
                            type={item.file_type}
                          />
                        </video>
                      ) : (
                        <a
                          href={`${API_BASE}/${item.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-sm text-white hover:opacity-90"
                        >
                          📎 {item.file_path.split("/").pop()}
                        </a>
                      )}
                    </div>
                  )}
                  <p
                    className={`text-[11px] mt-1 ${
                      isMe ? "text-white/80 text-right" : "text-white/80"
                    }`}
                  >
                    {senderName} •{" "}
                    {new Date(
                      item.created_at || item.uploaded_at
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/20 dark:border-gray-700/20 flex items-center gap-2 bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-full bg-white/30 dark:bg-gray-600/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#833ab4]"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="px-4 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-full hover:opacity-90 transition-opacity"
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
              className="px-4 py-3 bg-white/30 dark:bg-gray-600/30 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/40 dark:hover:bg-gray-500/40 transition-colors"
            >
              📎
            </label>
            {file && (
              <button
                type="submit"
                className="ml-2 px-4 py-3 bg-green-500/90 text-white rounded-full hover:bg-green-600 transition-colors"
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
