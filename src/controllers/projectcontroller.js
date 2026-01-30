// src/controllers/projectController.js
import { supabase } from "../lib/supabase.js";

/* CREATE PROJECT */
export const createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name required" });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name,
      description,
      owner_id: req.user.id // public.users.id
    })
    .select()
    .single();

  if (error) return res.status(400).json(error);

  // Add owner as member
  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: req.user.id,
    role: "owner"
  });

  res.json(project);
};

/* LIST MY PROJECTS */
export const listProjects = async (req, res) => {
  // Fetch projects for current user
  const { data: projectsData, error } = await supabase
    .from("project_members")
    .select(`
      role,
      projects (
        id,
        name,
        description,
        owner_id,
        created_at
      )
    `)
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json(error);

  const projects = await Promise.all(
    projectsData.map(async (p) => {
      // fetch members for each project
      const { data: members } = await supabase
  .from("project_members")
  .select(`
    role,
    users (
      id,
      name,
      email
    )
  `)
  .eq("project_id", p.projects.id);


      return {
        ...p.projects,
        role: p.role,
        members: members || [],
      };
    })
  );

  res.json(projects);
};

/* UPDATE PROJECT */
export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  // Check ownership
  const { data: ownerCheck } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!ownerCheck || ownerCheck.owner_id !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ name, description })
    .eq("id", projectId)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

/* DELETE PROJECT */
export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  // Check ownership
  const { data: ownerCheck } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!ownerCheck || ownerCheck.owner_id !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) return res.status(400).json(error);

  res.json({ message: "Project deleted" });
};

/* ADD MEMBER */
export const addMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id, role = "member" } = req.body;

  if (!user_id) return res.status(400).json({ message: "user_id is required" });

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", user_id)
    .single();

  if (userError || !user) return res.status(404).json({ message: "User not found" });

  // Add to project_members
  const { error: memberError } = await supabase
    .from("project_members")
    .insert([{ project_id: projectId, user_id, role }]);

  if (memberError) return res.status(400).json({ message: memberError.message });

  res.json({ message: "Member added", user });
};

/* REMOVE MEMBER */
// DELETE /api/projects/:projectId/members/:userId
export const removeMember = async (req, res) => {
  const { projectId, userId } = req.params;

  if (!projectId || !userId)
    return res.status(400).json({ message: "projectId and userId required" });

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return res.status(400).json({ message: error.message });

  res.json({ message: "Member removed" });
};


 /* Get all members of a project
 */
 export const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;

  try {
    const { data, error } = await supabase
      .from("project_members")
      .select(`
        user_id,
        users (
          id,
          name
        )
      `)
      .eq("project_id", projectId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
