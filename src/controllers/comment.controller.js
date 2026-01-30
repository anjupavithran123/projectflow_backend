// controllers/comment.controller.js
import {supabase} from "../lib/supabase.js"; // your initialized Supabase client


/**
 * Get all comments for a ticket
 */
export const getComments = async (req, res) => {
  const { ticketId } = req.params;

  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      text,
      created_at,
      user_id,
      users ( id, name, email )
    `)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};



// POST a new comment
export const createComment = async (req, res) => {
  const { ticket_id, user_id, text, parent_id } = req.body;
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([{ ticket_id, user_id, text, parent_id: parent_id || null }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: update comment
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const { data, error } = await supabase
      .from("comments")
      .update({ text })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE comment
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
