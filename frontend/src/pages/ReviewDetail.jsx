import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Trash2, Edit, Loader } from "lucide-react";
import { reviewsAPI } from "../api";
import { useAuth } from "../context/AuthContext";

const FALLBACK = "https://placehold.co/140x200/4C2E1A/FFF?text=No+Cover";

export default function ReviewDetail() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [review,  setReview]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting,setDeleting]= useState(false);

  useEffect(() => {
    reviewsAPI.getById(id)
      .then(setReview)
      .catch(() => navigate("/explore"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this review permanently?")) return;
    setDeleting(true);
    try {
      await reviewsAPI.delete(id);
      navigate("/explore");
    } catch { setDeleting(false); }
  };

  const canEdit   = user && review && (user.id === review.reviewer_id || user.role === "admin");
  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" });

  if (loading) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FAF8F5" }}>
      <Loader size={36} color="#D49A00" style={{ animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!review) return null;

  return (
    <div style={{ background:"#FAF8F5", minHeight:"calc(100vh - 64px)", padding:"40px 24px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        <Link to="/explore" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#c8860a", textDecoration:"none", fontSize:13, fontWeight:600, marginBottom:28 }}>
          <ArrowLeft size={14} /> Back to Explore
        </Link>

        {/* Book Header */}
        <div style={{ background:"linear-gradient(135deg,#1a1208,#3a2710)", borderRadius:16, padding:"36px", marginBottom:28, display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>
          <img
            src={review.cover || FALLBACK}
            alt={review.title}
            style={{ width:140, height:200, objectFit:"cover", borderRadius:10, boxShadow:"4px 4px 20px rgba(0,0,0,0.4)", flexShrink:0 }}
            onError={e => e.target.src = FALLBACK}
          />
          <div style={{ flex:1, minWidth:200 }}>
            <span style={{ fontSize:11, letterSpacing:3, color:"#D49A00", textTransform:"uppercase", fontWeight:700 }}>Full Review</span>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,4vw,36px)", fontWeight:900, color:"#e8e0d0", lineHeight:1.2, margin:"10px 0 8px" }}>
              {review.title}
            </h1>
            <p style={{ color:"#a89070", fontSize:15, marginBottom:14 }}>by <strong style={{ color:"#D49A00" }}>{review.author}</strong></p>

            {/* Stars */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={20} fill={i<=review.rating?"#D49A00":"none"} color={i<=review.rating?"#D49A00":"#555"} />
              ))}
              <span style={{ color:"#D49A00", fontFamily:"'Roboto Slab',serif", fontWeight:700, fontSize:16 }}>{review.rating}/5</span>
            </div>

            <span style={{ fontSize:12, background:"rgba(212,154,0,0.2)", padding:"4px 12px", borderRadius:12, color:"#D49A00", fontWeight:600 }}>
              {review.category}
            </span>

            {/* Meta */}
            <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#D49A00,#B07D00)", color:"#fff", fontFamily:"'Roboto Slab',serif", fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {review.reviewer_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <Link to={`/profile/${encodeURIComponent(review.reviewer_name)}`} style={{ color:"#e8dcc8", fontWeight:700, textDecoration:"none", fontSize:14 }}>
                  {review.reviewer_name}
                </Link>
                <div style={{ fontSize:11, color:"#7a6040" }}>{formatDate(review.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Content */}
        <div style={{ background:"#fff", borderRadius:12, padding:"36px", border:"1px solid #e8dcc8", marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#1a1208", marginBottom:20, paddingBottom:14, borderBottom:"1px solid #f0e8d8" }}>
            Review
          </h2>
          <div style={{ fontSize:16, color:"#3a2c18", lineHeight:2, fontFamily:"'Open Sans',sans-serif", whiteSpace:"pre-wrap" }}>
            {review.content}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
            <Link to={`/edit/${review.id}`} style={{
              display:"flex", alignItems:"center", gap:6, padding:"10px 20px",
              background:"linear-gradient(180deg,#D49A00,#B07D00)", color:"#fff",
              borderRadius:6, textDecoration:"none", fontFamily:"'Roboto Slab',serif",
              fontWeight:700, fontSize:13, letterSpacing:0.5,
            }}>
              <Edit size={14} /> Edit Review
            </Link>
            <button onClick={handleDelete} disabled={deleting} style={{
              display:"flex", alignItems:"center", gap:6, padding:"10px 20px",
              background:"transparent", border:"1px solid #e74c3c",
              color:"#e74c3c", borderRadius:6, cursor:"pointer",
              fontFamily:"'Roboto Slab',serif", fontWeight:700, fontSize:13,
            }}>
              {deleting ? <Loader size={14} style={{ animation:"spin 1s linear infinite" }} /> : <Trash2 size={14} />}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}