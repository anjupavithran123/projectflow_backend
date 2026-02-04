import {supabase} from "../lib/supabase.js";

/* CREATE */
export const createTicket = async (req, res) => {
  const { title, priority, projectId, assignee, status } = req.body;

  try {
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          title,
          priority,
          project_id: projectId,
          assignee: assignee || null,
          status: status || "To Do"
        }
      ])
      .select(`
        *,
        assignee_user:users (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* LIST BY PROJECT */
export const getTicketsByProject = async (req, res) => {
  const { projectId } = req.params;
  const { search, status, priority, assignee } = req.query;

  try {
    let query = supabase
      .from("tickets")
      .select(`
        *,
        assignee_user:users (id, name, email)
      `)
      .eq("project_id", projectId);

    // ✅ Fix: Only apply filter if the value is not an empty string or 'undefined'
    if (status && status !== "") {
      query = query.eq("status", status);
    }
    
    if (priority && priority !== "") {
      query = query.eq("priority", priority);
    }

    if (assignee && assignee !== "" && assignee !== "undefined") {
      query = query.eq("assignee", assignee);
    }
    
    // Search (Case-insensitive partial match)
    if (search && search.trim() !== "") {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error("Filter Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* UPDATE */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, assignee, status } = req.body;

    const assigneeValue =
      assignee && typeof assignee === "string" && assignee.length > 0
        ? assignee
        : null;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (priority !== undefined) updateData.priority = priority;
    if (assignee !== undefined) updateData.assignee = assigneeValue;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("SUPABASE UPDATE ERROR:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

/* DELETE */
export const deleteTicket = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Ticket deleted" });
};

/* ASSIGN */
export const assignTicket = async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;

  const { data, error } = await supabase
    .from("tickets")
    .update({ assignee })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};
