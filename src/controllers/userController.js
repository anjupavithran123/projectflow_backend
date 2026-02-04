// controllers/userController.js
export const listUsers = async (req, res) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .order("name");
  
    if (error) {
      return res.status(400).json({ message: error.message });
    }
  
    res.json(data);
  };