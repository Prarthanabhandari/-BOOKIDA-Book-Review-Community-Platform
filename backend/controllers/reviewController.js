const pool = require("../config/db");

const getReviews = async (req, res) => {
  try {
    const page=parseInt(req.query.page||"1"), limit=parseInt(req.query.limit||"5"), category=req.query.category||"";
    const offset=(page-1)*limit;
    let query="SELECT * FROM reviews", countQuery="SELECT COUNT(*) FROM reviews";
    const params=[];
    if(category){ query+=" WHERE category=$1"; countQuery+=" WHERE category=$1"; params.push(category); }
    query+=` ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit,offset);
    const [reviews,total]=await Promise.all([pool.query(query,params),pool.query(countQuery,category?[category]:[])]);
    res.json({ data:reviews.rows, total:parseInt(total.rows[0].count), page, totalPages:Math.ceil(parseInt(total.rows[0].count)/limit) });
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getRecentReviews = async (req,res) => {
  try {
    const r=await pool.query("SELECT id,title,author,reviewer_name FROM reviews ORDER BY created_at DESC LIMIT 10");
    res.json(r.rows);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getTopReviewers = async (req,res) => {
  try {
    const r=await pool.query("SELECT id,name,avatar,review_count FROM users WHERE review_count>0 ORDER BY review_count DESC LIMIT 5");
    res.json(r.rows);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getFeaturedReviews = async (req,res) => {
  try {
    const r=await pool.query("SELECT * FROM reviews WHERE featured=true ORDER BY created_at DESC LIMIT 6");
    res.json(r.rows);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getMyReviews = async (req,res) => {
  try {
    const r=await pool.query("SELECT * FROM reviews WHERE reviewer_id=$1 ORDER BY created_at DESC",[req.user.id]);
    res.json({data:r.rows,total:r.rows.length});
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getStats = async (req,res) => {
  try {
    const [reviews,members,authors]=await Promise.all([
      pool.query("SELECT COUNT(*) FROM reviews"),
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(DISTINCT author) FROM reviews"),
    ]);
    res.json({ reviews:parseInt(reviews.rows[0].count), members:parseInt(members.rows[0].count), authors:parseInt(authors.rows[0].count), countries:40 });
  } catch(err){ res.status(500).json({error:err.message}); }
};

const searchReviews = async (req,res) => {
  try {
    const q=`%${req.query.q||""}%`;
    const r=await pool.query("SELECT * FROM reviews WHERE title ILIKE $1 OR author ILIKE $1 OR content ILIKE $1 OR category ILIKE $1 ORDER BY created_at DESC LIMIT 20",[q]);
    res.json({data:r.rows,total:r.rows.length,query:req.query.q});
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getArchives = async (req,res) => {
  try {
    const r=await pool.query("SELECT TO_CHAR(created_at,'Month YYYY') as label, DATE_TRUNC('month',created_at) as month_date, COUNT(*) as count FROM reviews GROUP BY label,month_date ORDER BY month_date DESC");
    res.json(r.rows.map(x=>({label:x.label.trim(),count:parseInt(x.count)})));
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getReviewById = async (req,res) => {
  try {
    const r=await pool.query("SELECT * FROM reviews WHERE id=$1",[req.params.id]);
    if(r.rows.length===0) return res.status(404).json({error:"Review not found"});
    res.json(r.rows[0]);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const createReview = async (req,res) => {
  try {
    const {title,author,rating,content,category,cover,guestName}=req.body;
    const missing=["title","author","rating","content"].filter(f=>!req.body[f]);
    if(missing.length) return res.status(400).json({error:`Missing: ${missing.join(", ")}`});
    const reviewerId=req.user?.id||null;
    const reviewerName=req.user?.name||guestName||"Anonymous";
    const excerpt=content.substring(0,200)+"...";
    const coverUrl=cover||`https://placehold.co/90x130/8B4513/FFF?text=${encodeURIComponent(title.slice(0,8))}`;
    const r=await pool.query(
      "INSERT INTO reviews (title,author,reviewer_id,reviewer_name,rating,content,excerpt,category,cover) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [title,author,reviewerId,reviewerName,rating,content,excerpt,category,coverUrl]
    );
    if(req.user?.id) await pool.query("UPDATE users SET review_count=review_count+1 WHERE id=$1",[req.user.id]);
    res.status(201).json(r.rows[0]);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const updateReview = async (req,res) => {
  try {
    const review=await pool.query("SELECT * FROM reviews WHERE id=$1",[req.params.id]);
    if(review.rows.length===0) return res.status(404).json({error:"Review not found"});
    const isOwner=review.rows[0].reviewer_id===req.user.id;
    const isAdmin=req.user.role==="admin";
    if(!isOwner&&!isAdmin) return res.status(403).json({error:"Not authorized"});
    const {title,author,rating,content,category,cover}=req.body;
    const excerpt=content?content.substring(0,200)+"...":review.rows[0].excerpt;
    const r=await pool.query(
      "UPDATE reviews SET title=COALESCE($1,title),author=COALESCE($2,author),rating=COALESCE($3,rating),content=COALESCE($4,content),excerpt=COALESCE($5,excerpt),category=COALESCE($6,category),cover=COALESCE($7,cover) WHERE id=$8 RETURNING *",
      [title,author,rating,content,excerpt,category,cover,req.params.id]
    );
    res.json(r.rows[0]);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const deleteReview = async (req,res) => {
  try {
    const review=await pool.query("SELECT * FROM reviews WHERE id=$1",[req.params.id]);
    if(review.rows.length===0) return res.status(404).json({error:"Review not found"});
    const isOwner=review.rows[0].reviewer_id===req.user.id;
    const isAdmin=req.user.role==="admin";
    if(!isOwner&&!isAdmin) return res.status(403).json({error:"Not authorized"});
    await pool.query("DELETE FROM reviews WHERE id=$1",[req.params.id]);
    if(review.rows[0].reviewer_id) await pool.query("UPDATE users SET review_count=review_count-1 WHERE id=$1",[review.rows[0].reviewer_id]);
    res.json({success:true});
  } catch(err){ res.status(500).json({error:err.message}); }
};

const toggleFeatured = async (req,res) => {
  try {
    const review=await pool.query("SELECT featured FROM reviews WHERE id=$1",[req.params.id]);
    if(review.rows.length===0) return res.status(404).json({error:"Review not found"});
    const r=await pool.query("UPDATE reviews SET featured=$1 WHERE id=$2 RETURNING *",[!review.rows[0].featured,req.params.id]);
    res.json(r.rows[0]);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const adminGetAllReviews = async (req,res) => {
  try {
    const q=req.query.q?`%${req.query.q}%`:null;
    let sql="SELECT r.*,u.email as reviewer_email FROM reviews r LEFT JOIN users u ON r.reviewer_id=u.id";
    const params=[];
    if(q){ sql+=" WHERE r.title ILIKE $1 OR r.author ILIKE $1"; params.push(q); }
    sql+=" ORDER BY r.created_at DESC";
    const r=await pool.query(sql,params);
    res.json({data:r.rows,total:r.rows.length});
  } catch(err){ res.status(500).json({error:err.message}); }
};

const adminGetAllUsers = async (req,res) => {
  try {
    const r=await pool.query("SELECT id,name,email,role,review_count,created_at FROM users ORDER BY created_at DESC");
    res.json(r.rows);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const adminDeleteUser = async (req,res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1",[req.params.id]);
    res.json({success:true});
  } catch(err){ res.status(500).json({error:err.message}); }
};

const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "All fields required" });
    const r = await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1,$2,$3) RETURNING *",
      [name, email, message]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const adminGetContacts = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const markContactRead = async (req, res) => {
  try {
    const r = await pool.query("UPDATE contacts SET read=true WHERE id=$1 RETURNING *", [req.params.id]);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
  getReviews, getRecentReviews, getTopReviewers, getFeaturedReviews,
  getMyReviews, getStats, searchReviews, getArchives,
  getReviewById, createReview, updateReview, deleteReview,
  toggleFeatured, adminGetAllReviews, adminGetAllUsers, adminDeleteUser,
  submitContact, adminGetContacts, markContactRead,
};